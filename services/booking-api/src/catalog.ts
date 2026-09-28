export const CATALOG_KEY = "catalog:active"
export const CATALOG_TTL_SECONDS = 600

export type CatalogService = {
  slug: string
  name: string
  description: string
  startingPriceCents: number
}

export type CatalogCache = {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlSeconds: number): Promise<void>
}

export type CatalogSource = {
  listActiveServices(): Promise<
    Array<
      CatalogService & {
        id: string
        active: boolean
        sortOrder: number
      }
    >
  >
}

function toPublic(service: CatalogService): CatalogService {
  return {
    slug: service.slug,
    name: service.name,
    description: service.description,
    startingPriceCents: service.startingPriceCents,
  }
}

export async function getCatalog(
  source: CatalogSource,
  cache: CatalogCache,
  requestId: string,
): Promise<CatalogService[]> {
  try {
    const hit = await cache.get(CATALOG_KEY)
    if (hit !== null) {
      return JSON.parse(hit) as CatalogService[]
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        requestId,
        event: "redis_catalog_read_failed",
        error: error instanceof Error ? error.message : String(error),
      }),
    )
    const rows = await source.listActiveServices()
    return rows.map(toPublic)
  }

  const rows = await source.listActiveServices()
  const services = rows.map(toPublic)
  try {
    await cache.set(CATALOG_KEY, JSON.stringify(services), CATALOG_TTL_SECONDS)
  } catch (error) {
    console.error(
      JSON.stringify({
        requestId,
        event: "redis_catalog_write_failed",
        error: error instanceof Error ? error.message : String(error),
      }),
    )
  }
  return services
}
