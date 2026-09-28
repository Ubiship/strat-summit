import { describe, expect, it } from "vitest"
import { createApp } from "./app.js"
import { createFakeAuth } from "./fake-auth.js"
import { createMemoryCache } from "./memory-cache.js"
import { createMemoryStore } from "./memory-store.js"
import type { ServiceRecord } from "./store.js"

const description = "A regular whole-home clean: kitchens, bathrooms, floors, and surfaces."

const standard: ServiceRecord = {
  id: "svc-standard",
  slug: "standard",
  name: "Standard clean",
  description,
  startingPriceCents: 14900,
  active: true,
  sortOrder: 1,
}

const deep: ServiceRecord = {
  id: "svc-deep",
  slug: "deep",
  name: "Deep clean",
  description: "A detailed clean that includes inside appliances, baseboards, and built-up grime.",
  startingPriceCents: 24900,
  active: true,
  sortOrder: 2,
}

const retired: ServiceRecord = {
  id: "svc-retired",
  slug: "retired",
  name: "Retired clean",
  description: "No longer offered.",
  startingPriceCents: 1000,
  active: false,
  sortOrder: 9,
}

const fixedNow = new Date("2026-09-28T18:00:00.000Z")

function harness() {
  let tick = 0
  const store = createMemoryStore({
    services: [standard, deep, retired],
    clock: () => new Date(fixedNow.getTime() + tick++ * 1000),
  })
  const cache = createMemoryCache()
  const auth = createFakeAuth({
    ada: {
      clerkUserId: "user_ada",
      role: "customer",
      email: "ada@example.com",
      name: "Ada Lovelace",
    },
    bea: {
      clerkUserId: "user_bea",
      role: "customer",
      email: "bea@example.com",
      name: "Bea Customer",
    },
    sam: {
      clerkUserId: "user_sam",
      role: "staff",
      email: "sam@example.com",
      name: "Sam Staff",
    },
    blank: "missing-role",
    bad: "invalid",
  })
  const app = createApp({
    auth,
    store,
    cache,
    clock: { now: () => fixedNow },
  })
  return { app, store, cache }
}

function jsonRequest(path: string, token: string | undefined, body?: unknown, method = "POST") {
  const headers: Record<string, string> = { "content-type": "application/json" }
  if (token) headers.authorization = `Bearer ${token}`
  return {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  }
}

const bookingBody = {
  service_slug: "standard",
  address_line1: "123 Main St",
  city: "Campbell River",
  province: "bc",
  postal_code: "v9w1a1",
  service_date: "2026-10-01",
  time_window: "morning",
  notes: "Dog on site",
}

describe("GET /health", () => {
  it("returns ok without a session", async () => {
    const { app } = harness()
    const response = await app.request("/health")
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: "ok" })
    expect(response.headers.get("x-request-id")).toBeTruthy()
  })
})

describe("auth", () => {
  it("returns 401 when the session is missing", async () => {
    const { app } = harness()
    const response = await app.request("/bookings")
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      error: { code: "unauthorized", message: "Sign in required." },
    })
  })

  it("returns 401 when the token is invalid", async () => {
    const { app } = harness()
    const response = await app.request("/bookings", { headers: { authorization: "Bearer bad" } })
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      error: { code: "unauthorized", message: "Sign in required." },
    })
  })

  it("returns 403 when the session has no role", async () => {
    const { app } = harness()
    const response = await app.request("/services", { headers: { authorization: "Bearer blank" } })
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      error: { code: "forbidden", message: "You do not have access to this action." },
    })
  })

  it("returns 403 when a customer calls a staff route", async () => {
    const { app } = harness()
    const response = await app.request("/admin/bookings", { headers: { authorization: "Bearer ada" } })
    expect(response.status).toBe(403)
  })

  it("returns 403 when staff call POST /bookings", async () => {
    const { app } = harness()
    const response = await app.request("/bookings", jsonRequest("/bookings", "sam", bookingBody))
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      error: { code: "forbidden", message: "You do not have access to this action." },
    })
  })
})

describe("services and bookings", () => {
  it("returns the active catalog in sort order", async () => {
    const { app } = harness()
    const response = await app.request("/services", { headers: { authorization: "Bearer sam" } })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      services: [
        {
          slug: "standard",
          name: "Standard clean",
          description,
          starting_price_cents: 14900,
        },
        {
          slug: "deep",
          name: "Deep clean",
          description: deep.description,
          starting_price_cents: 24900,
        },
      ],
    })
  })

  it("creates a requested booking with the price copied from the service", async () => {
    const { app } = harness()
    const response = await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toMatchObject({
      service_slug: "standard",
      service_name: "Standard clean",
      price_shown_cents: 14900,
      status: "requested",
      province: "BC",
      postal_code: "V9W 1A1",
      service_date: "2026-10-01",
      time_window: "morning",
      notes: "Dog on site",
      staff_note: null,
      decided_at: null,
    })
    expect(body).not.toHaveProperty("customer_name")
  })

  it("returns 400 for an inactive service", async () => {
    const { app } = harness()
    const response = await app.request(
      "/bookings",
      jsonRequest("/bookings", "ada", { ...bookingBody, service_slug: "retired" }),
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: {
        code: "validation_error",
        message: "Service is not available.",
        fields: { service_slug: "is not available" },
      },
    })
  })

  it("returns 400 for a past date", async () => {
    const { app } = harness()
    const response = await app.request(
      "/bookings",
      jsonRequest("/bookings", "ada", { ...bookingBody, service_date: "2026-09-27" }),
    )
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error.code).toBe("validation_error")
    expect(body.error.fields.service_date).toBe("must be today or later")
  })

  it("returns 400 when the body is not JSON", async () => {
    const { app } = harness()
    const response = await app.request("/bookings", {
      method: "POST",
      headers: { authorization: "Bearer ada", "content-type": "application/json" },
      body: "{",
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: { code: "validation_error", message: "Request body must be JSON." },
    })
  })

  it("returns 429 on the sixth create and does not insert it", async () => {
    const { app } = harness()
    for (let index = 0; index < 5; index += 1) {
      const created = await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
      expect(created.status).toBe(201)
    }
    const blocked = await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get("retry-after")).toBe("3600")
    expect(await blocked.json()).toEqual({
      error: { code: "rate_limited", message: "Too many booking requests. Try again later." },
    })
    const list = await app.request("/bookings", { headers: { authorization: "Bearer ada" } })
    const body = await list.json()
    expect(body.bookings).toHaveLength(5)
  })

  it("still creates a booking when the counter throws", async () => {
    const { app, cache } = harness()
    cache.failIncrements = true
    const response = await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
    expect(response.status).toBe(201)
  })

  it("lists only that customer's bookings, newest first", async () => {
    const { app } = harness()
    await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
    await app.request("/bookings", jsonRequest("/bookings", "bea", { ...bookingBody, notes: "Bea" }))
    await app.request("/bookings", jsonRequest("/bookings", "ada", { ...bookingBody, notes: "Second" }))

    const response = await app.request("/bookings", { headers: { authorization: "Bearer ada" } })
    const body = await response.json()
    expect(body.bookings.map((booking: { notes: string }) => booking.notes)).toEqual(["Second", "Dog on site"])
  })
})

describe("staff decisions", () => {
  it("confirms a requested booking", async () => {
    const { app } = harness()
    const created = await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
    const booking = await created.json()
    const response = await app.request(
      `/admin/bookings/${booking.id}/confirm`,
      jsonRequest(`/admin/bookings/${booking.id}/confirm`, "sam", { staff_note: " Tuesday morning " }),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({
      status: "confirmed",
      staff_note: "Tuesday morning",
      customer_name: "Ada Lovelace",
      customer_email: "ada@example.com",
    })
    expect(body.decided_at).toEqual(expect.any(String))
  })

  it("lists only requested bookings for staff", async () => {
    const { app } = harness()
    const first = await (await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))).json()
    await app.request("/bookings", jsonRequest("/bookings", "bea", bookingBody))
    await app.request(
      `/admin/bookings/${first.id}/confirm`,
      jsonRequest(`/admin/bookings/${first.id}/confirm`, "sam", {}),
    )
    const response = await app.request("/admin/bookings", { headers: { authorization: "Bearer sam" } })
    const body = await response.json()
    expect(body.bookings).toHaveLength(1)
    expect(body.bookings[0].customer_name).toBe("Bea Customer")
    expect(body.bookings[0].status).toBe("requested")
  })

  it("returns 400 when a decline has no note", async () => {
    const { app } = harness()
    const booking = await (await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))).json()
    const response = await app.request(
      `/admin/bookings/${booking.id}/decline`,
      jsonRequest(`/admin/bookings/${booking.id}/decline`, "sam", {}),
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: {
        code: "validation_error",
        message: "A decline note is required.",
        fields: { staff_note: "required" },
      },
    })
  })

  it("returns 409 on a second decision and leaves the row confirmed", async () => {
    const { app } = harness()
    const booking = await (await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))).json()
    await app.request(
      `/admin/bookings/${booking.id}/confirm`,
      jsonRequest(`/admin/bookings/${booking.id}/confirm`, "sam", {}),
    )
    const again = await app.request(
      `/admin/bookings/${booking.id}/decline`,
      jsonRequest(`/admin/bookings/${booking.id}/decline`, "sam", { staff_note: "Changed my mind" }),
    )
    expect(again.status).toBe(409)
    expect(await again.json()).toEqual({
      error: { code: "conflict", message: "Booking has already been decided." },
    })
    const mine = await app.request("/bookings", { headers: { authorization: "Bearer ada" } })
    const body = await mine.json()
    expect(body.bookings[0].status).toBe("confirmed")
  })

  it("returns 404 for an unknown booking id", async () => {
    const { app } = harness()
    const response = await app.request(
      "/admin/bookings/missing/confirm",
      jsonRequest("/admin/bookings/missing/confirm", "sam", {}),
    )
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: { code: "not_found", message: "Booking not found." },
    })
  })
})
