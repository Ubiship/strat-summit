import { Hono, type Context, type Next } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { InvalidSession, MissingRole, type AuthVerifier } from "./auth.js"
import { getCatalog, type CatalogCache } from "./catalog.js"
import { nextStatus, validateCreate, validateDecision } from "./booking-rules.js"
import { AppError, errorResponse } from "./errors.js"
import { consumeCreateSlot, type WindowCounter } from "./rate-limit.js"
import type { BookingRecord, BookingStore, SessionUser } from "./store.js"

type Variables = {
  requestId: string
  session: SessionUser
  userId: string
}

export type AppDeps = {
  auth: AuthVerifier
  store: BookingStore
  cache: CatalogCache & WindowCounter
  clock: { now(): Date }
}

function bookingJson(booking: BookingRecord, audience: "customer" | "staff") {
  const body = {
    id: booking.id,
    service_slug: booking.serviceSlug,
    service_name: booking.serviceName,
    price_shown_cents: booking.priceShownCents,
    status: booking.status,
    address_line1: booking.addressLine1,
    address_line2: booking.addressLine2,
    city: booking.city,
    province: booking.province,
    postal_code: booking.postalCode,
    service_date: booking.serviceDate,
    time_window: booking.timeWindow,
    notes: booking.notes,
    staff_note: booking.staffNote,
    decided_at: booking.decidedAt,
    created_at: booking.createdAt,
  }
  if (audience === "staff") {
    return {
      ...body,
      customer_name: booking.customerName,
      customer_email: booking.customerEmail,
    }
  }
  return body
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new AppError(400, "validation_error", "Request body must be JSON.")
  }
}

export function createApp(deps?: AppDeps) {
  const app = new Hono<{ Variables: Variables }>()

  app.use("*", async (c, next) => {
    const incoming = c.req.header("x-request-id")
    const requestId = incoming && incoming.length > 0 ? incoming : crypto.randomUUID()
    c.set("requestId", requestId)
    c.header("x-request-id", requestId)
    await next()
  })

  app.onError((err, c) => {
    if (err instanceof AppError) {
      const response = errorResponse(err)
      for (const [key, value] of Object.entries(response.headers)) {
        c.header(key, value)
      }
      return c.json(response.body, response.status as ContentfulStatusCode)
    }
    console.error(
      JSON.stringify({
        requestId: c.get("requestId"),
        event: "internal_error",
        error: err instanceof Error ? (err.stack ?? err.message) : String(err),
      }),
    )
    return c.json({ error: { code: "internal_error", message: "Something went wrong." } }, 500)
  })

  app.get("/health", (c) => c.json({ status: "ok" }))

  if (!deps) return app
  const authed = deps

  const requireUser = async (c: Context<{ Variables: Variables }>, next: Next) => {
    const header = c.req.header("authorization") ?? ""
    const match = /^Bearer (.+)$/.exec(header)
    if (!match) throw new AppError(401, "unauthorized", "Sign in required.")
    try {
      const session = await authed.auth.verify(match[1])
      const user = await authed.store.upsertUser(session)
      c.set("session", session)
      c.set("userId", user.id)
    } catch (error) {
      if (error instanceof MissingRole) {
        throw new AppError(403, "forbidden", "You do not have access to this action.")
      }
      if (error instanceof InvalidSession) {
        throw new AppError(401, "unauthorized", "Sign in required.")
      }
      throw error
    }
    await next()
  }

  const requireRole = (role: "customer" | "staff") => {
    return async (c: Context<{ Variables: Variables }>, next: Next) => {
      if (c.get("session").role !== role) {
        throw new AppError(403, "forbidden", "You do not have access to this action.")
      }
      await next()
    }
  }

  app.get("/services", requireUser, async (c) => {
    const services = await getCatalog(authed.store, authed.cache, c.get("requestId"))
    return c.json({
      services: services.map((service) => ({
        slug: service.slug,
        name: service.name,
        description: service.description,
        starting_price_cents: service.startingPriceCents,
      })),
    })
  })

  app.get("/bookings", requireUser, requireRole("customer"), async (c) => {
    const bookings = await authed.store.listBookingsForCustomer(c.get("userId"))
    return c.json({ bookings: bookings.map((booking) => bookingJson(booking, "customer")) })
  })

  app.post("/bookings", requireUser, requireRole("customer"), async (c) => {
    const input = validateCreate(await readJson(c.req.raw), authed.clock.now())
    const service = await authed.store.findActiveServiceBySlug(input.serviceSlug)
    if (!service) {
      throw new AppError(400, "validation_error", "Service is not available.", {
        service_slug: "is not available",
      })
    }
    await consumeCreateSlot(authed.cache, c.get("session").clerkUserId, c.get("requestId"))
    const booking = await authed.store.insertBooking({
      customerId: c.get("userId"),
      serviceId: service.id,
      priceShownCents: service.startingPriceCents,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode,
      serviceDate: input.serviceDate,
      timeWindow: input.timeWindow,
      notes: input.notes,
    })
    return c.json(bookingJson(booking, "customer"), 201)
  })

  app.get("/admin/bookings", requireUser, requireRole("staff"), async (c) => {
    const bookings = await authed.store.listRequestedBookings()
    return c.json({ bookings: bookings.map((booking) => bookingJson(booking, "staff")) })
  })

  async function decide(c: Context<{ Variables: Variables }>, action: "confirm" | "decline"): Promise<Response> {
    const staffNote = validateDecision(action, await readJson(c.req.raw))
    const existing = await authed.store.findBookingById(c.req.param("id") ?? "")
    if (!existing) throw new AppError(404, "not_found", "Booking not found.")
    const status = nextStatus(existing.status, action)
    const updated = await authed.store.decideBooking({
      id: existing.id,
      status,
      staffNote,
      decidedBy: c.get("userId"),
      decidedAt: new Date(),
    })
    if (!updated) throw new AppError(409, "conflict", "Booking has already been decided.")
    return c.json(bookingJson(updated, "staff"))
  }

  app.post("/admin/bookings/:id/confirm", requireUser, requireRole("staff"), (c) => decide(c, "confirm"))
  app.post("/admin/bookings/:id/decline", requireUser, requireRole("staff"), (c) => decide(c, "decline"))

  return app
}
