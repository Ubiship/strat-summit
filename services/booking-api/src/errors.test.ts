import { describe, expect, it } from "vitest"
import { AppError, errorResponse } from "./errors.js"

describe("errorResponse", () => {
  it("includes fields only when a field failed", () => {
    const err = new AppError(400, "validation_error", "Service date must be today or later.", {
      service_date: "must be today or later",
    })

    expect(errorResponse(err)).toEqual({
      status: 400,
      headers: {},
      body: {
        error: {
          code: "validation_error",
          message: "Service date must be today or later.",
          fields: { service_date: "must be today or later" },
        },
      },
    })
  })

  it("omits fields when the body is not JSON", () => {
    const err = new AppError(400, "validation_error", "Request body must be JSON.")

    expect(errorResponse(err).body).toEqual({
      error: {
        code: "validation_error",
        message: "Request body must be JSON.",
      },
    })
  })

  it("carries Retry-After for rate limits", () => {
    const err = new AppError(429, "rate_limited", "Too many booking requests. Try again later.", undefined, {
      "Retry-After": "120",
    })

    expect(errorResponse(err)).toEqual({
      status: 429,
      headers: { "Retry-After": "120" },
      body: {
        error: {
          code: "rate_limited",
          message: "Too many booking requests. Try again later.",
        },
      },
    })
  })
})
