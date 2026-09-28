export type Role = "customer" | "staff"
export type BookingStatus = "requested" | "confirmed" | "declined"
export type TimeWindow = "morning" | "afternoon" | "evening"

export type SessionUser = {
  clerkUserId: string
  role: Role
  email: string | null
  name: string | null
}

export type ServiceRecord = {
  id: string
  slug: string
  name: string
  description: string
  startingPriceCents: number
  active: boolean
  sortOrder: number
}

export type BookingRecord = {
  id: string
  customerId: string
  serviceSlug: string
  serviceName: string
  priceShownCents: number
  status: BookingStatus
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  serviceDate: string
  timeWindow: TimeWindow
  notes: string | null
  staffNote: string | null
  decidedAt: string | null
  createdAt: string
  customerName: string | null
  customerEmail: string | null
}

export type InsertBooking = {
  customerId: string
  serviceId: string
  priceShownCents: number
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  serviceDate: string
  timeWindow: TimeWindow
  notes: string | null
}

export type Decision = {
  id: string
  status: "confirmed" | "declined"
  staffNote: string | null
  decidedBy: string
  decidedAt: Date
}

export interface BookingStore {
  upsertUser(user: SessionUser): Promise<{ id: string }>
  listActiveServices(): Promise<ServiceRecord[]>
  findActiveServiceBySlug(slug: string): Promise<ServiceRecord | null>
  insertBooking(input: InsertBooking): Promise<BookingRecord>
  listBookingsForCustomer(customerId: string): Promise<BookingRecord[]>
  listRequestedBookings(): Promise<BookingRecord[]>
  findBookingById(id: string): Promise<BookingRecord | null>
  decideBooking(input: Decision): Promise<BookingRecord | null>
}
