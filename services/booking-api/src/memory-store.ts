import type {
  BookingRecord,
  BookingStore,
  Decision,
  InsertBooking,
  ServiceRecord,
  SessionUser,
} from "./store.js"

function byNewest(left: BookingRecord, right: BookingRecord): number {
  return right.createdAt.localeCompare(left.createdAt)
}

export function createMemoryStore(options?: {
  services?: ServiceRecord[]
  clock?: () => Date
}): BookingStore {
  const services = [...(options?.services ?? [])]
  const clock = options?.clock ?? (() => new Date())
  const users = new Map<string, SessionUser & { id: string }>()
  const bookings: BookingRecord[] = []

  function customer(id: string) {
    for (const user of users.values()) {
      if (user.id === id) return user
    }
    return undefined
  }

  function toRecord(booking: BookingRecord): BookingRecord {
    const user = customer(booking.customerId)
    return {
      ...booking,
      customerName: user?.name ?? null,
      customerEmail: user?.email ?? null,
    }
  }

  return {
    async upsertUser(user) {
      const existing = users.get(user.clerkUserId)
      if (existing) {
        existing.role = user.role
        existing.email = user.email
        existing.name = user.name
        return { id: existing.id }
      }
      const created = { ...user, id: crypto.randomUUID() }
      users.set(user.clerkUserId, created)
      return { id: created.id }
    },
    async listActiveServices() {
      return services.filter((service) => service.active).sort((left, right) => left.sortOrder - right.sortOrder)
    },
    async findActiveServiceBySlug(slug) {
      return services.find((service) => service.slug === slug && service.active) ?? null
    },
    async insertBooking(input: InsertBooking) {
      const service = services.find((item) => item.id === input.serviceId)
      if (!service) throw new Error("service missing")
      const booking: BookingRecord = {
        id: crypto.randomUUID(),
        customerId: input.customerId,
        serviceSlug: service.slug,
        serviceName: service.name,
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
        staffNote: null,
        decidedAt: null,
        createdAt: clock().toISOString(),
        customerName: null,
        customerEmail: null,
      }
      bookings.push(booking)
      return toRecord(booking)
    },
    async listBookingsForCustomer(customerId) {
      return bookings.filter((booking) => booking.customerId === customerId).sort(byNewest).map(toRecord)
    },
    async listRequestedBookings() {
      return bookings.filter((booking) => booking.status === "requested").sort(byNewest).map(toRecord)
    },
    async findBookingById(id) {
      const booking = bookings.find((item) => item.id === id)
      return booking ? toRecord(booking) : null
    },
    async decideBooking(input: Decision) {
      const booking = bookings.find((item) => item.id === input.id && item.status === "requested")
      if (!booking) return null
      booking.status = input.status
      booking.staffNote = input.staffNote
      booking.decidedAt = input.decidedAt.toISOString()
      return toRecord(booking)
    },
  }
}
