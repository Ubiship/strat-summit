import { describe, expect, it } from "vitest"
import { AppError } from "./errors.js"
import {
  nextStatus,
  normalizePostalCode,
  todayInVancouver,
  validateCreate,
  validateDecision,
} from "./booking-rules.js"

const now = new Date("2026-09-28T18:00:00.000Z")

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    service_slug: "standard",
    address_line1: "123 Main St",
    address_line2: null,
    city: "Campbell River",
    province: "bc",
    postal_code: "v9w1a1",
    service_date: "2026-09-28",
    time_window: "morning",
    notes: " Dog on site ",
    ...overrides,
  }
}

function fieldError(run: () => void) {
  try {
    run()
  } catch (error) {
    expect(error).toBeInstanceOf(AppError)
    return error as AppError
  }
  throw new Error("expected AppError")
}

describe("todayInVancouver", () => {
  it("uses the previous calendar date before midnight Pacific", () => {
    expect(todayInVancouver(new Date("2026-09-29T06:30:00.000Z"))).toBe("2026-09-28")
  })

  it("rolls the date at midnight Pacific", () => {
    expect(todayInVancouver(new Date("2026-09-29T07:00:00.000Z"))).toBe("2026-09-29")
  })
})

describe("normalizePostalCode", () => {
  it("formats a compact code", () => {
    expect(normalizePostalCode("v9w1a1")).toBe("V9W 1A1")
  })

  it("keeps an already formatted code", () => {
    expect(normalizePostalCode("V9W 1A1")).toBe("V9W 1A1")
  })

  it("rejects a code whose first letter is invalid", () => {
    expect(normalizePostalCode("W9W 1A1")).toBeNull()
  })
})

describe("validateCreate", () => {
  it("normalizes a valid body", () => {
    expect(validateCreate(validBody(), now)).toEqual({
      serviceSlug: "standard",
      addressLine1: "123 Main St",
      addressLine2: null,
      city: "Campbell River",
      province: "BC",
      postalCode: "V9W 1A1",
      serviceDate: "2026-09-28",
      timeWindow: "morning",
      notes: "Dog on site",
    })
  })

  it("stops at the first failing field", () => {
    const error = fieldError(() =>
      validateCreate(validBody({ service_slug: " ", service_date: "2020-01-01" }), now),
    )
    expect(error.fields).toEqual({ service_slug: "required" })
    expect(error.message).toBe("Service is required.")
  })

  it("rejects a date before today in Vancouver", () => {
    const error = fieldError(() => validateCreate(validBody({ service_date: "2026-09-27" }), now))
    expect(error.status).toBe(400)
    expect(error.code).toBe("validation_error")
    expect(error.message).toBe("Service date must be today or later.")
    expect(error.fields).toEqual({ service_date: "must be today or later" })
  })

  it("rejects an impossible date", () => {
    const error = fieldError(() => validateCreate(validBody({ service_date: "2026-02-31" }), now))
    expect(error.message).toBe("Service date must be a real date.")
    expect(error.fields).toEqual({ service_date: "must be a real date." })
  })

  it("rejects notes over 1000 characters", () => {
    const error = fieldError(() => validateCreate(validBody({ notes: "a".repeat(1001) }), now))
    expect(error.fields).toEqual({ notes: "must be 1000 characters or fewer" })
  })

  it("rejects a non-object body without fields", () => {
    const error = fieldError(() => validateCreate([], now))
    expect(error.message).toBe("Request body must be a JSON object.")
    expect(error.fields).toBeUndefined()
  })
})

describe("validateDecision", () => {
  it("allows a blank confirm note", () => {
    expect(validateDecision("confirm", {})).toBeNull()
    expect(validateDecision("confirm", { staff_note: "  " })).toBeNull()
  })

  it("trims a confirm note", () => {
    expect(validateDecision("confirm", { staff_note: " Tuesday morning " })).toBe("Tuesday morning")
  })

  it("requires a decline note", () => {
    const error = fieldError(() => validateDecision("decline", { staff_note: " " }))
    expect(error.message).toBe("A decline note is required.")
    expect(error.fields).toEqual({ staff_note: "required" })
  })

  it("rejects a staff note over 500 characters", () => {
    const error = fieldError(() => validateDecision("decline", { staff_note: "a".repeat(501) }))
    expect(error.message).toBe("Staff note must be 500 characters or fewer.")
    expect(error.fields).toEqual({ staff_note: "must be 500 characters or fewer" })
  })
})

describe("nextStatus", () => {
  it("confirms a requested booking", () => {
    expect(nextStatus("requested", "confirm")).toBe("confirmed")
  })

  it("declines a requested booking", () => {
    expect(nextStatus("requested", "decline")).toBe("declined")
  })

  it("rejects a second decision", () => {
    const error = fieldError(() => nextStatus("confirmed", "decline"))
    expect(error.status).toBe(409)
    expect(error.code).toBe("conflict")
    expect(error.message).toBe("Booking has already been decided.")
  })
})
