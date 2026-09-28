import { describe, expect, it } from "vitest"
import { createApp } from "./app.js"

describe("GET /health", () => {
  it("returns ok and a generated request id", async () => {
    const app = createApp()
    const response = await app.request("/health")

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: "ok" })
    expect(response.headers.get("x-request-id")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })

  it("echoes a caller-supplied request id", async () => {
    const app = createApp()
    const response = await app.request("/health", {
      headers: { "x-request-id": "req-123" },
    })

    expect(response.headers.get("x-request-id")).toBe("req-123")
  })
})
