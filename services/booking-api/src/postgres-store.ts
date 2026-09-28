import { and, asc, desc, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { bookings, services, users } from "./db/schema.js"
import type {
  BookingRecord,
  BookingStatus,
  BookingStore,
  Decision,
  InsertBooking,
  ServiceRecord,
  SessionUser,
  TimeWindow,
} from "./store.js"

function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, { max: 10 })
  return drizzle(client)
}

type Database = ReturnType<typeof createDb>

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

function mapService(row: typeof services.$inferSelect): ServiceRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    startingPriceCents: row.startingPriceCents,
    active: row.active,
    sortOrder: row.sortOrder,
  }
}

export function createPostgresStore(databaseUrl: string): BookingStore {
  const db = createDb(databaseUrl)
  return new PostgresStore(db)
}

class PostgresStore implements BookingStore {
  constructor(private readonly db: Database) {}

  async upsertUser(user: SessionUser) {
    const rows = await this.db
      .insert(users)
      .values({
        clerkUserId: user.clerkUserId,
        role: user.role,
        email: user.email,
        name: user.name,
      })
      .onConflictDoUpdate({
        target: users.clerkUserId,
        set: {
          role: user.role,
          email: user.email,
          name: user.name,
          updatedAt: new Date(),
        },
      })
      .returning({ id: users.id })
    return { id: rows[0].id }
  }

  async listActiveServices() {
    const rows = await this.db
      .select()
      .from(services)
      .where(eq(services.active, true))
      .orderBy(asc(services.sortOrder))
    return rows.map(mapService)
  }

  async findActiveServiceBySlug(slug: string) {
    const rows = await this.db
      .select()
      .from(services)
      .where(and(eq(services.slug, slug), eq(services.active, true)))
      .limit(1)
    return rows[0] ? mapService(rows[0]) : null
  }

  async insertBooking(input: InsertBooking) {
    const inserted = await this.db
      .insert(bookings)
      .values({
        customerId: input.customerId,
        serviceId: input.serviceId,
        priceShownCents: input.priceShownCents,
        status: "requested",
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        serviceDate: input.serviceDate,
        timeWindow: input.timeWindow,
        notes: input.notes,
      })
      .returning({ id: bookings.id })
    const booking = await this.findBookingById(inserted[0].id)
    if (!booking) throw new Error("inserted booking was not found")
    return booking
  }

  async listBookingsForCustomer(customerId: string) {
    const rows = await this.bookingQuery().where(eq(bookings.customerId, customerId)).orderBy(desc(bookings.createdAt))
    return rows.map(mapBooking)
  }

  async listRequestedBookings() {
    const rows = await this.bookingQuery()
      .where(eq(bookings.status, "requested"))
      .orderBy(desc(bookings.createdAt))
    return rows.map(mapBooking)
  }

  async findBookingById(id: string) {
    if (!isUuid(id)) return null
    const rows = await this.bookingQuery().where(eq(bookings.id, id)).limit(1)
    return rows[0] ? mapBooking(rows[0]) : null
  }

  async decideBooking(input: Decision) {
    if (!isUuid(input.id)) return null
    const updated = await this.db
      .update(bookings)
      .set({
        status: input.status,
        staffNote: input.staffNote,
        decidedBy: input.decidedBy,
        decidedAt: input.decidedAt,
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.id, input.id), eq(bookings.status, "requested")))
      .returning({ id: bookings.id })
    if (updated.length === 0) return null
    return this.findBookingById(input.id)
  }

  private bookingQuery() {
    return this.db
      .select({
        id: bookings.id,
        customerId: bookings.customerId,
        serviceSlug: services.slug,
        serviceName: services.name,
        priceShownCents: bookings.priceShownCents,
        status: bookings.status,
        addressLine1: bookings.addressLine1,
        addressLine2: bookings.addressLine2,
        city: bookings.city,
        province: bookings.province,
        postalCode: bookings.postalCode,
        serviceDate: bookings.serviceDate,
        timeWindow: bookings.timeWindow,
        notes: bookings.notes,
        staffNote: bookings.staffNote,
        decidedAt: bookings.decidedAt,
        createdAt: bookings.createdAt,
        customerName: users.name,
        customerEmail: users.email,
      })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .innerJoin(users, eq(users.id, bookings.customerId))
  }
}

function mapBooking(row: {
  id: string
  customerId: string
  serviceSlug: string
  serviceName: string
  priceShownCents: number
  status: string
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  serviceDate: string
  timeWindow: string
  notes: string | null
  staffNote: string | null
  decidedAt: Date | null
  createdAt: Date
  customerName: string | null
  customerEmail: string | null
}): BookingRecord {
  return {
    id: row.id,
    customerId: row.customerId,
    serviceSlug: row.serviceSlug,
    serviceName: row.serviceName,
    priceShownCents: row.priceShownCents,
    status: row.status as BookingStatus,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    province: row.province,
    postalCode: row.postalCode,
    serviceDate: row.serviceDate,
    timeWindow: row.timeWindow as TimeWindow,
    notes: row.notes,
    staffNote: row.staffNote,
    decidedAt: row.decidedAt ? row.decidedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    customerName: row.customerName,
    customerEmail: row.customerEmail,
  }
}
