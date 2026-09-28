import { AppError } from "./errors.js"

export type WindowCounter = {
  incrementWindow(key: string, windowSeconds: number): Promise<{ count: number; ttlSeconds: number }>
}

export async function consumeCreateSlot(
  counter: WindowCounter,
  clerkUserId: string,
  requestId: string,
): Promise<void> {
  try {
    const result = await counter.incrementWindow(`ratelimit:booking:${clerkUserId}`, 3600)
    if (result.count > 5) {
      throw new AppError(429, "rate_limited", "Too many booking requests. Try again later.", undefined, {
        "Retry-After": String(result.ttlSeconds),
      })
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    console.error(
      JSON.stringify({
        requestId,
        event: "redis_rate_limit_failed",
        error: error instanceof Error ? error.message : String(error),
      }),
    )
  }
}
