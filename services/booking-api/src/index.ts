import { serve } from "@hono/node-server"
import { createApp } from "./app.js"
import { createClerkAuth } from "./clerk-auth.js"
import { createPostgresStore } from "./postgres-store.js"
import { createRedisCache } from "./redis-cache.js"

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

const port = Number(process.env.PORT ?? "3002")
const app = createApp({
  auth: createClerkAuth(required("CLERK_SECRET_KEY")),
  store: createPostgresStore(required("DATABASE_URL")),
  cache: createRedisCache(required("REDIS_URL")),
  clock: { now: () => new Date() },
})

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`booking-api listening on ${info.port}`)
})
