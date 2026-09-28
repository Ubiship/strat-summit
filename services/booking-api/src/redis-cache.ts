import { Redis } from "ioredis"
import type { CatalogCache } from "./catalog.js"
import type { WindowCounter } from "./rate-limit.js"

const INCREMENT_WINDOW = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("TTL", KEYS[1])
return {count, ttl}
`

export type RedisCache = CatalogCache & WindowCounter & { quit(): Promise<void> }

function asPair(value: unknown): { count: number; ttlSeconds: number } {
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error("Unexpected Redis increment result")
  }
  return { count: Number(value[0]), ttlSeconds: Number(value[1]) }
}

export function createRedisCache(url: string): RedisCache {
  const redis = new Redis(url)
  return {
    async get(key) {
      return redis.get(key)
    },
    async set(key, value, ttlSeconds) {
      await redis.set(key, value, "EX", ttlSeconds)
    },
    async incrementWindow(key, windowSeconds) {
      const result = await redis.eval(INCREMENT_WINDOW, 1, key, String(windowSeconds))
      return asPair(result)
    },
    async quit() {
      await redis.quit()
    },
  }
}
