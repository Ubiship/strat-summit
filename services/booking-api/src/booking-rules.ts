import { AppError } from "./errors.js"

const PROVINCES = new Set([
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
])

const TIME_WINDOWS = ["morning", "afternoon", "evening"] as const

export type TimeWindow = (typeof TIME_WINDOWS)[number]

export type CreateBookingInput = {
  serviceSlug: string
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  serviceDate: string
  timeWindow: TimeWindow
  notes: string | null
}

export function todayInVancouver(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export function normalizePostalCode(input: string): string | null {
  const compact = input.replace(/\s+/g, "").toUpperCase()
  if (!/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/.test(compact)) {
    return null
  }
  return `${compact.slice(0, 3)} ${compact.slice(3)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function fail(field: string, message: string, detail: string): never {
  throw new AppError(400, "validation_error", message, { [field]: detail })
}

function trimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  return value.trim()
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function validateCreate(body: unknown, now: Date): CreateBookingInput {
  if (!isRecord(body)) {
    throw new AppError(400, "validation_error", "Request body must be a JSON object.")
  }

  const serviceSlug = trimmedString(body.service_slug)
  if (!serviceSlug) fail("service_slug", "Service is required.", "required")

  const addressLine1 = trimmedString(body.address_line1)
  if (!addressLine1) fail("address_line1", "Address line 1 is required.", "required")
  if (addressLine1.length > 120) {
    fail("address_line1", "Address line 1 must be 120 characters or fewer.", "must be 120 characters or fewer")
  }

  let addressLine2: string | null = null
  if (body.address_line2 !== undefined && body.address_line2 !== null) {
    if (typeof body.address_line2 !== "string") {
      fail("address_line2", "Address line 2 must be text.", "must be text")
    }
    const trimmed = body.address_line2.trim()
    if (trimmed.length > 120) {
      fail("address_line2", "Address line 2 must be 120 characters or fewer.", "must be 120 characters or fewer")
    }
    addressLine2 = trimmed.length > 0 ? trimmed : null
  }

  const city = trimmedString(body.city)
  if (!city) fail("city", "City is required.", "required")
  if (city.length > 80) fail("city", "City must be 80 characters or fewer.", "must be 80 characters or fewer")

  const provinceInput = trimmedString(body.province)
  if (!provinceInput) fail("province", "Province is required.", "required")
  const province = provinceInput.toUpperCase()
  if (!PROVINCES.has(province)) {
    fail("province", "Province must be a Canadian province code.", "must be a Canadian province code.")
  }

  const postalInput = trimmedString(body.postal_code)
  if (!postalInput) fail("postal_code", "Postal code is required.", "required")
  const postalCode = normalizePostalCode(postalInput)
  if (!postalCode) {
    fail("postal_code", "Postal code must be a Canadian postal code.", "must be a Canadian postal code.")
  }

  const serviceDate = trimmedString(body.service_date)
  if (!serviceDate) fail("service_date", "Service date is required.", "required")
  if (!isRealDate(serviceDate)) {
    fail("service_date", "Service date must be a real date.", "must be a real date.")
  }
  if (serviceDate < todayInVancouver(now)) {
    fail("service_date", "Service date must be today or later.", "must be today or later")
  }

  const timeWindow = trimmedString(body.time_window)
  if (!timeWindow) fail("time_window", "Time window is required.", "required")
  if (!TIME_WINDOWS.includes(timeWindow as TimeWindow)) {
    fail("time_window", "Time window must be morning, afternoon, or evening.", "must be morning, afternoon, or evening.")
  }

  let notes: string | null = null
  if (body.notes !== undefined && body.notes !== null) {
    if (typeof body.notes !== "string") fail("notes", "Notes must be text.", "must be text")
    const trimmed = body.notes.trim()
    if (trimmed.length > 1000) {
      fail("notes", "Notes must be 1000 characters or fewer.", "must be 1000 characters or fewer")
    }
    notes = trimmed.length > 0 ? trimmed : null
  }

  return {
    serviceSlug,
    addressLine1,
    addressLine2,
    city,
    province,
    postalCode,
    serviceDate,
    timeWindow: timeWindow as TimeWindow,
    notes,
  }
}

export function validateDecision(action: "confirm" | "decline", body: unknown): string | null {
  if (!isRecord(body)) {
    throw new AppError(400, "validation_error", "Request body must be a JSON object.")
  }

  if (body.staff_note === undefined || body.staff_note === null) {
    if (action === "decline") fail("staff_note", "A decline note is required.", "required")
    return null
  }
  if (typeof body.staff_note !== "string") {
    fail("staff_note", "Staff note must be text.", "must be text")
  }
  const staffNote = body.staff_note.trim()
  if (staffNote.length > 500) {
    fail("staff_note", "Staff note must be 500 characters or fewer.", "must be 500 characters or fewer")
  }
  if (staffNote.length === 0) {
    if (action === "decline") fail("staff_note", "A decline note is required.", "required")
    return null
  }
  return staffNote
}

export function nextStatus(
  current: "requested" | "confirmed" | "declined",
  action: "confirm" | "decline",
): "confirmed" | "declined" {
  if (current !== "requested") {
    throw new AppError(409, "conflict", "Booking has already been decided.")
  }
  return action === "confirm" ? "confirmed" : "declined"
}
