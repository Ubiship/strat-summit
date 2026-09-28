import { describe, expect, it, vi } from "vitest"
import { AppError } from "./errors.js"
import { consumeCreateSlot, type WindowCounter } from "./rate-limit.js"

function counter(counts: number[]): WindowCounter {
  return {
    async incrementWindow(key) {
      expect(key).toBe("ratelimit:booking:user_customer")
      const count = counts.shift() ?? 1
      return { count, ttlSeconds: 90 }
    },
  }
}

describe("consumeCreateSlot", () => {
  it("allows the fifth create", async () => {
    await expect(consumeCreateSlot(counter([5]), "user_customer", "req-1")).resolves.toBeUndefined()
  })

  it("rejects the sixth create", async () => {
    await expect(consumeCreateSlot(counter([6]), "user_customer", "req-1")).rejects.toMatchObject({
      status: 429,
      code: "rate_limited",
      message: "Too many booking requests. Try again later.",
      headers: { "Retry-After": "90" },
    })
  })

  it("allows the create when Redis throws", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const failing: WindowCounter = {
      async incrementWindow() {
        throw new Error("redis down")
      },
    }

    await expect(consumeCreateSlot(failing, "user_customer", "req-4")).resolves.toBeUndefined()
    expect(String(error.mock.calls[0][0])).toContain("redis_rate_limit_failed")
    expect(String(error.mock.calls[0][0])).toContain("req-4")
    error.mockRestore()
  })

  it("still throws AppError when the counter returns over the limit", async () => {
    try {
      await consumeCreateSlot(counter([6]), "user_customer", "req-1")
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      return
    }
    throw new Error("expected AppError")
  })
})
