import { describe, expect, it, vi } from "vitest"
import { CATALOG_KEY, CATALOG_TTL_SECONDS, getCatalog, type CatalogCache, type CatalogSource } from "./catalog.js"

const rows = [
  {
    id: "svc-standard",
    slug: "standard",
    name: "Standard clean",
    description: "A regular whole-home clean: kitchens, bathrooms, floors, and surfaces.",
    startingPriceCents: 14900,
    active: true,
    sortOrder: 1,
  },
]

function source(list = vi.fn(async () => rows)): CatalogSource {
  return { listActiveServices: list }
}

describe("getCatalog", () => {
  it("does not query the store on a cache hit", async () => {
    const list = vi.fn(async () => rows)
    const cache: CatalogCache = {
      async get(key) {
        expect(key).toBe(CATALOG_KEY)
        return JSON.stringify([
          {
            slug: "standard",
            name: "Standard clean",
            description: rows[0].description,
            startingPriceCents: 14900,
          },
        ])
      },
      async set() {
        throw new Error("set should not run")
      },
    }

    const services = await getCatalog(source(list), cache, "req-1")

    expect(list).not.toHaveBeenCalled()
    expect(services[0].slug).toBe("standard")
  })

  it("stores a miss for 600 seconds", async () => {
    const set = vi.fn(async () => undefined)
    const cache: CatalogCache = {
      async get() {
        return null
      },
      set,
    }

    const services = await getCatalog(source(), cache, "req-1")

    expect(services).toEqual([
      {
        slug: "standard",
        name: "Standard clean",
        description: rows[0].description,
        startingPriceCents: 14900,
      },
    ])
    expect(set).toHaveBeenCalledWith(CATALOG_KEY, JSON.stringify(services), CATALOG_TTL_SECONDS)
  })

  it("returns Postgres rows when Redis get fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const cache: CatalogCache = {
      async get() {
        throw new Error("redis down")
      },
      async set() {
        throw new Error("set should not run")
      },
    }

    const services = await getCatalog(source(), cache, "req-9")

    expect(services[0].startingPriceCents).toBe(14900)
    expect(error).toHaveBeenCalled()
    expect(String(error.mock.calls[0][0])).toContain("req-9")
    expect(String(error.mock.calls[0][0])).toContain("redis_catalog_read_failed")
    error.mockRestore()
  })
})
