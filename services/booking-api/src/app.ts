import { Hono } from "hono"

type Variables = {
  requestId: string
}

export function createApp() {
  const app = new Hono<{ Variables: Variables }>()

  app.use("*", async (c, next) => {
    const incoming = c.req.header("x-request-id")
    const requestId = incoming && incoming.length > 0 ? incoming : crypto.randomUUID()
    c.set("requestId", requestId)
    c.header("x-request-id", requestId)
    await next()
  })

  app.get("/health", (c) => c.json({ status: "ok" }))

  return app
}
