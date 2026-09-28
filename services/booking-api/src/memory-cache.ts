import type { CatalogCache } from "./catalog.js"
import type { WindowCounter } from "./rate-limit.js"

export type MemoryCache = CatalogCache &
  WindowCounter & {
    failIncrements: boolean
  }

export function createMemoryCache(): MemoryCache {
  const values = new Map<string, string>()
  const counts = new Map<string, number>()
  return {
    failIncrements: false,
    async get(key) {
      return values.get(key) ?? null
    },
    async set(key, value) {
      values.set(key, value)
    },
    async incrementWindow(key) {
      if (this.failIncrements) throw new Error("redis down")
      const count = (counts.get(key) ?? 0) + 1
      counts.set(key, count)
      return { count, ttlSeconds: 3600 }
    },
  }
}
