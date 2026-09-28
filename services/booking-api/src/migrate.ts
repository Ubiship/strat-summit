import { readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import postgres from "postgres"

export async function migrate(databaseUrl: string, directory: string) {
  const sql = postgres(databaseUrl, { max: 1 })
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `
  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".sql"))
    .sort()
  for (const file of files) {
    const applied = await sql`SELECT id FROM schema_migrations WHERE id = ${file}`
    if (applied.length > 0) continue
    const body = readFileSync(join(directory, file), "utf8")
    await sql.begin(async (tx) => {
      await tx.unsafe(body)
      await tx`INSERT INTO schema_migrations (id) VALUES (${file})`
    })
  }
  await sql.end()
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isDirectRun) {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("Missing DATABASE_URL")
  const directory = join(dirname(fileURLToPath(import.meta.url)), "../drizzle")
  await migrate(databaseUrl, directory)
}
