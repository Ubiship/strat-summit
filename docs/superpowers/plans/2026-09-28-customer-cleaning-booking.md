# Customer Cleaning Booking API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a TypeScript API that lets a signed-in customer request a one-off house clean and lets staff confirm or decline that request.

**Architecture:** A Hono service in `services/booking-api` verifies Clerk sessions, writes bookings with Drizzle to Postgres, and uses Redis for the service catalog cache and the create-request counter. Route tests inject an in-memory store and cache, so CI does not need Clerk, Postgres, or Redis.

**Tech Stack:** Node 20, Hono 4, Drizzle ORM, postgres.js, ioredis, Clerk backend SDK, Vitest, pnpm workspace.

**Worktree warning:** This repo already has unrelated uncommitted files. Every commit in this plan adds only the paths listed in that step. Do not run `git add .` or `git add -A`.

**Spec:** `docs/superpowers/specs/2026-09-28-customer-cleaning-booking-design.md`

---

## File structure

| File | Responsibility |
|---|---|
| `pnpm-workspace.yaml` | Include `services/*` |
| `.gitignore` | Ignore this service's `.env` and `dist/` |
| `services/booking-api/package.json` | Package scripts and dependencies |
| `services/booking-api/tsconfig.json` | NodeNext compile settings |
| `services/booking-api/vitest.config.ts` | Vitest include pattern |
| `services/booking-api/.env.example` | Required environment variable names |
| `services/booking-api/Dockerfile` | Railway image |
| `services/booking-api/railway.toml` | Health check and start command |
| `services/booking-api/drizzle/0001_init.sql` | Tables, indexes, and the three seed services |
| `services/booking-api/src/index.ts` | Read env, wire Postgres, Redis, and Clerk, listen |
| `services/booking-api/src/migrate.ts` | Apply SQL files once |
| `services/booking-api/src/errors.ts` | `AppError` and the JSON error body |
| `services/booking-api/src/booking-rules.ts` | Postal code, province, date, create body, decision body, status change |
| `services/booking-api/src/rate-limit.ts` | Five creates per rolling Redis window |
| `services/booking-api/src/catalog.ts` | Active services with a 600-second Redis cache |
| `services/booking-api/src/store.ts` | `BookingStore` interface and record types |
| `services/booking-api/src/auth.ts` | `AuthVerifier`, `InvalidSession`, `MissingRole` |
| `services/booking-api/src/app.ts` | Hono routes |
| `services/booking-api/src/db/schema.ts` | Drizzle tables |
| `services/booking-api/src/postgres-store.ts` | `BookingStore` on Postgres |
| `services/booking-api/src/redis-cache.ts` | Redis `get` / `set` / `incrementWindow` |
| `services/booking-api/src/clerk-auth.ts` | Clerk `verifyToken` plus `users.getUser` |
| `services/booking-api/src/memory-store.ts` | In-memory `BookingStore` for tests |
| `services/booking-api/src/memory-cache.ts` | In-memory cache for tests |
| `services/booking-api/src/fake-auth.ts` | Token map for tests |
| `services/booking-api/src/errors.test.ts` | Error envelope |
| `services/booking-api/src/booking-rules.test.ts` | Pure booking rules |
| `services/booking-api/src/rate-limit.test.ts` | Create counter |
| `services/booking-api/src/catalog.test.ts` | Catalog cache |
| `services/booking-api/src/app.test.ts` | HTTP routes |

The Go backend is not modified.

---

### Task 1: Scaffold the package and health check

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `.gitignore`
- Create: `services/booking-api/package.json`
- Create: `services/booking-api/tsconfig.json`
- Create: `services/booking-api/vitest.config.ts`
- Create: `services/booking-api/src/app.test.ts`
- Create: `services/booking-api/src/app.ts`

- [ ] **Step 1: Add the workspace and gitignore entries**

Replace `pnpm-workspace.yaml` with:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "services/*"
```

Append these lines to `.gitignore`:

```
services/booking-api/dist/
services/booking-api/.env
```

- [ ] **Step 2: Write the package files**

`services/booking-api/package.json`

```json
{
  "name": "@repo/booking-api",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "lint": "tsc --noEmit",
    "db:migrate": "tsx src/migrate.ts"
  },
  "dependencies": {
    "@clerk/backend": "^3.20.1",
    "@hono/node-server": "^2.1.1",
    "drizzle-orm": "^0.45.3",
    "hono": "^4.13.10",
    "ioredis": "^6.0.0",
    "postgres": "^3.4.9"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.23.15",
    "typescript": "^5.8.3",
    "vitest": "^5.0.2"
  }
}
```

`services/booking-api/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "moduleDetection": "force",
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts"]
}
```

`services/booking-api/vitest.config.ts`

```ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
```

- [ ] **Step 3: Install dependencies**

Run from the repo root:

```bash
pnpm install
```

Expected: the lockfile updates and `@repo/booking-api` is linked. `src/index.ts` and `src/migrate.ts` do not exist yet. `pnpm --filter @repo/booking-api build` will fail until Task 7. That is expected.

- [ ] **Step 4: Write the failing health test**

`services/booking-api/src/app.test.ts`

```ts
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
```

- [ ] **Step 5: Run the test to verify it fails**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/app.test.ts
```

Expected: FAIL. Vitest cannot resolve `./app.js`.

- [ ] **Step 6: Write the health app**

`services/booking-api/src/app.ts`

```ts
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
```

- [ ] **Step 7: Run the test to verify it passes**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/app.test.ts
```

Expected: PASS, 2 tests.

- [ ] **Step 8: Commit**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml .gitignore services/booking-api/package.json services/booking-api/tsconfig.json services/booking-api/vitest.config.ts services/booking-api/src/app.ts services/booking-api/src/app.test.ts
git commit -m "$(cat <<'EOF'
feat: scaffold the booking api health check

EOF
)"
```

---

### Task 2: Error envelope

**Files:**
- Create: `services/booking-api/src/errors.ts`
- Create: `services/booking-api/src/errors.test.ts`

- [ ] **Step 1: Write the failing test**

`services/booking-api/src/errors.test.ts`

```ts
import { describe, expect, it } from "vitest"
import { AppError, errorResponse } from "./errors.js"

describe("errorResponse", () => {
  it("includes fields only when a field failed", () => {
    const err = new AppError(400, "validation_error", "Service date must be today or later.", {
      service_date: "must be today or later",
    })

    expect(errorResponse(err)).toEqual({
      status: 400,
      headers: {},
      body: {
        error: {
          code: "validation_error",
          message: "Service date must be today or later.",
          fields: { service_date: "must be today or later" },
        },
      },
    })
  })

  it("omits fields when the body is not JSON", () => {
    const err = new AppError(400, "validation_error", "Request body must be JSON.")

    expect(errorResponse(err).body).toEqual({
      error: {
        code: "validation_error",
        message: "Request body must be JSON.",
      },
    })
  })

  it("carries Retry-After for rate limits", () => {
    const err = new AppError(429, "rate_limited", "Too many booking requests. Try again later.", undefined, {
      "Retry-After": "120",
    })

    expect(errorResponse(err)).toEqual({
      status: 429,
      headers: { "Retry-After": "120" },
      body: {
        error: {
          code: "rate_limited",
          message: "Too many booking requests. Try again later.",
        },
      },
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/errors.test.ts
```

Expected: FAIL. Vitest cannot resolve `./errors.js`.

- [ ] **Step 3: Write the error type**

`services/booking-api/src/errors.ts`

```ts
export type ErrorCode =
  | "unauthorized"
  | "forbidden"
  | "validation_error"
  | "rate_limited"
  | "not_found"
  | "conflict"
  | "internal_error"

export class AppError extends Error {
  readonly status: number
  readonly code: ErrorCode
  readonly fields?: Record<string, string>
  readonly headers?: Record<string, string>

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    fields?: Record<string, string>,
    headers?: Record<string, string>,
  ) {
    super(message)
    this.name = "AppError"
    this.status = status
    this.code = code
    this.fields = fields
    this.headers = headers
  }
}

export type ErrorBody = {
  error: {
    code: ErrorCode
    message: string
    fields?: Record<string, string>
  }
}

export function errorResponse(err: AppError): {
  status: number
  body: ErrorBody
  headers: Record<string, string>
} {
  const error: ErrorBody["error"] = {
    code: err.code,
    message: err.message,
  }
  if (err.fields) {
    error.fields = err.fields
  }
  return {
    status: err.status,
    body: { error },
    headers: err.headers ?? {},
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/errors.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add services/booking-api/src/errors.ts services/booking-api/src/errors.test.ts
git commit -m "$(cat <<'EOF'
feat: add the booking api error envelope

EOF
)"
```

---

### Task 3: Booking rules

**Files:**
- Create: `services/booking-api/src/booking-rules.ts`
- Create: `services/booking-api/src/booking-rules.test.ts`

- [ ] **Step 1: Write the failing tests**

`services/booking-api/src/booking-rules.test.ts`

```ts
import { describe, expect, it } from "vitest"
import { AppError } from "./errors.js"
import {
  nextStatus,
  normalizePostalCode,
  todayInVancouver,
  validateCreate,
  validateDecision,
} from "./booking-rules.js"

const now = new Date("2026-09-28T18:00:00.000Z")

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    service_slug: "standard",
    address_line1: "123 Main St",
    address_line2: null,
    city: "Campbell River",
    province: "bc",
    postal_code: "v9w1a1",
    service_date: "2026-09-28",
    time_window: "morning",
    notes: " Dog on site ",
    ...overrides,
  }
}

function fieldError(run: () => void) {
  try {
    run()
  } catch (error) {
    expect(error).toBeInstanceOf(AppError)
    return error as AppError
  }
  throw new Error("expected AppError")
}

describe("todayInVancouver", () => {
  it("uses the previous calendar date before midnight Pacific", () => {
    expect(todayInVancouver(new Date("2026-09-29T06:30:00.000Z"))).toBe("2026-09-28")
  })

  it("rolls the date at midnight Pacific", () => {
    expect(todayInVancouver(new Date("2026-09-29T07:00:00.000Z"))).toBe("2026-09-29")
  })
})

describe("normalizePostalCode", () => {
  it("formats a compact code", () => {
    expect(normalizePostalCode("v9w1a1")).toBe("V9W 1A1")
  })

  it("keeps an already formatted code", () => {
    expect(normalizePostalCode("V9W 1A1")).toBe("V9W 1A1")
  })

  it("rejects a code whose first letter is invalid", () => {
    expect(normalizePostalCode("W9W 1A1")).toBeNull()
  })
})

describe("validateCreate", () => {
  it("normalizes a valid body", () => {
    expect(validateCreate(validBody(), now)).toEqual({
      serviceSlug: "standard",
      addressLine1: "123 Main St",
      addressLine2: null,
      city: "Campbell River",
      province: "BC",
      postalCode: "V9W 1A1",
      serviceDate: "2026-09-28",
      timeWindow: "morning",
      notes: "Dog on site",
    })
  })

  it("stops at the first failing field", () => {
    const error = fieldError(() =>
      validateCreate(validBody({ service_slug: " ", service_date: "2020-01-01" }), now),
    )
    expect(error.fields).toEqual({ service_slug: "required" })
    expect(error.message).toBe("Service is required.")
  })

  it("rejects a date before today in Vancouver", () => {
    const error = fieldError(() => validateCreate(validBody({ service_date: "2026-09-27" }), now))
    expect(error.status).toBe(400)
    expect(error.code).toBe("validation_error")
    expect(error.message).toBe("Service date must be today or later.")
    expect(error.fields).toEqual({ service_date: "must be today or later" })
  })

  it("rejects an impossible date", () => {
    const error = fieldError(() => validateCreate(validBody({ service_date: "2026-02-31" }), now))
    expect(error.message).toBe("Service date must be a real date.")
    expect(error.fields).toEqual({ service_date: "must be a real date." })
  })

  it("rejects notes over 1000 characters", () => {
    const error = fieldError(() => validateCreate(validBody({ notes: "a".repeat(1001) }), now))
    expect(error.fields).toEqual({ notes: "must be 1000 characters or fewer" })
  })

  it("rejects a non-object body without fields", () => {
    const error = fieldError(() => validateCreate([], now))
    expect(error.message).toBe("Request body must be a JSON object.")
    expect(error.fields).toBeUndefined()
  })
})

describe("validateDecision", () => {
  it("allows a blank confirm note", () => {
    expect(validateDecision("confirm", {})).toBeNull()
    expect(validateDecision("confirm", { staff_note: "  " })).toBeNull()
  })

  it("trims a confirm note", () => {
    expect(validateDecision("confirm", { staff_note: " Tuesday morning " })).toBe("Tuesday morning")
  })

  it("requires a decline note", () => {
    const error = fieldError(() => validateDecision("decline", { staff_note: " " }))
    expect(error.message).toBe("A decline note is required.")
    expect(error.fields).toEqual({ staff_note: "required" })
  })

  it("rejects a staff note over 500 characters", () => {
    const error = fieldError(() => validateDecision("decline", { staff_note: "a".repeat(501) }))
    expect(error.message).toBe("Staff note must be 500 characters or fewer.")
    expect(error.fields).toEqual({ staff_note: "must be 500 characters or fewer" })
  })
})

describe("nextStatus", () => {
  it("confirms a requested booking", () => {
    expect(nextStatus("requested", "confirm")).toBe("confirmed")
  })

  it("declines a requested booking", () => {
    expect(nextStatus("requested", "decline")).toBe("declined")
  })

  it("rejects a second decision", () => {
    const error = fieldError(() => nextStatus("confirmed", "decline"))
    expect(error.status).toBe(409)
    expect(error.code).toBe("conflict")
    expect(error.message).toBe("Booking has already been decided.")
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/booking-rules.test.ts
```

Expected: FAIL. Vitest cannot resolve `./booking-rules.js`.

- [ ] **Step 3: Write the rules**

`services/booking-api/src/booking-rules.ts`

```ts
import { AppError } from "./errors.js"

const PROVINCES = new Set([
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
])

const TIME_WINDOWS = ["morning", "afternoon", "evening"] as const

export type TimeWindow = (typeof TIME_WINDOWS)[number]

export type CreateBookingInput = {
  serviceSlug: string
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  serviceDate: string
  timeWindow: TimeWindow
  notes: string | null
}

export function todayInVancouver(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export function normalizePostalCode(input: string): string | null {
  const compact = input.replace(/\s+/g, "").toUpperCase()
  if (!/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/.test(compact)) {
    return null
  }
  return `${compact.slice(0, 3)} ${compact.slice(3)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function fail(field: string, message: string, detail: string): never {
  throw new AppError(400, "validation_error", message, { [field]: detail })
}

function trimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  return value.trim()
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function validateCreate(body: unknown, now: Date): CreateBookingInput {
  if (!isRecord(body)) {
    throw new AppError(400, "validation_error", "Request body must be a JSON object.")
  }

  const serviceSlug = trimmedString(body.service_slug)
  if (!serviceSlug) fail("service_slug", "Service is required.", "required")

  const addressLine1 = trimmedString(body.address_line1)
  if (!addressLine1) fail("address_line1", "Address line 1 is required.", "required")
  if (addressLine1.length > 120) {
    fail("address_line1", "Address line 1 must be 120 characters or fewer.", "must be 120 characters or fewer")
  }

  let addressLine2: string | null = null
  if (body.address_line2 !== undefined && body.address_line2 !== null) {
    if (typeof body.address_line2 !== "string") {
      fail("address_line2", "Address line 2 must be text.", "must be text")
    }
    const trimmed = body.address_line2.trim()
    if (trimmed.length > 120) {
      fail("address_line2", "Address line 2 must be 120 characters or fewer.", "must be 120 characters or fewer")
    }
    addressLine2 = trimmed.length > 0 ? trimmed : null
  }

  const city = trimmedString(body.city)
  if (!city) fail("city", "City is required.", "required")
  if (city.length > 80) fail("city", "City must be 80 characters or fewer.", "must be 80 characters or fewer")

  const provinceInput = trimmedString(body.province)
  if (!provinceInput) fail("province", "Province is required.", "required")
  const province = provinceInput.toUpperCase()
  if (!PROVINCES.has(province)) {
    fail("province", "Province must be a Canadian province code.", "must be a Canadian province code.")
  }

  const postalInput = trimmedString(body.postal_code)
  if (!postalInput) fail("postal_code", "Postal code is required.", "required")
  const postalCode = normalizePostalCode(postalInput)
  if (!postalCode) {
    fail("postal_code", "Postal code must be a Canadian postal code.", "must be a Canadian postal code.")
  }

  const serviceDate = trimmedString(body.service_date)
  if (!serviceDate) fail("service_date", "Service date is required.", "required")
  if (!isRealDate(serviceDate)) {
    fail("service_date", "Service date must be a real date.", "must be a real date.")
  }
  if (serviceDate < todayInVancouver(now)) {
    fail("service_date", "Service date must be today or later.", "must be today or later")
  }

  const timeWindow = trimmedString(body.time_window)
  if (!timeWindow) fail("time_window", "Time window is required.", "required")
  if (!TIME_WINDOWS.includes(timeWindow as TimeWindow)) {
    fail("time_window", "Time window must be morning, afternoon, or evening.", "must be morning, afternoon, or evening.")
  }

  let notes: string | null = null
  if (body.notes !== undefined && body.notes !== null) {
    if (typeof body.notes !== "string") fail("notes", "Notes must be text.", "must be text")
    const trimmed = body.notes.trim()
    if (trimmed.length > 1000) {
      fail("notes", "Notes must be 1000 characters or fewer.", "must be 1000 characters or fewer")
    }
    notes = trimmed.length > 0 ? trimmed : null
  }

  return {
    serviceSlug,
    addressLine1,
    addressLine2,
    city,
    province,
    postalCode,
    serviceDate,
    timeWindow: timeWindow as TimeWindow,
    notes,
  }
}

export function validateDecision(action: "confirm" | "decline", body: unknown): string | null {
  if (!isRecord(body)) {
    throw new AppError(400, "validation_error", "Request body must be a JSON object.")
  }

  if (body.staff_note === undefined || body.staff_note === null) {
    if (action === "decline") fail("staff_note", "A decline note is required.", "required")
    return null
  }
  if (typeof body.staff_note !== "string") {
    fail("staff_note", "Staff note must be text.", "must be text")
  }
  const staffNote = body.staff_note.trim()
  if (staffNote.length > 500) {
    fail("staff_note", "Staff note must be 500 characters or fewer.", "must be 500 characters or fewer")
  }
  if (staffNote.length === 0) {
    if (action === "decline") fail("staff_note", "A decline note is required.", "required")
    return null
  }
  return staffNote
}

export function nextStatus(
  current: "requested" | "confirmed" | "declined",
  action: "confirm" | "decline",
): "confirmed" | "declined" {
  if (current !== "requested") {
    throw new AppError(409, "conflict", "Booking has already been decided.")
  }
  return action === "confirm" ? "confirmed" : "declined"
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/booking-rules.test.ts
```

Expected: PASS, 18 tests.

- [ ] **Step 5: Commit**

```bash
git add services/booking-api/src/booking-rules.ts services/booking-api/src/booking-rules.test.ts
git commit -m "$(cat <<'EOF'
feat: validate cleaning booking requests

EOF
)"
```

---

### Task 4: Catalog cache and create counter

**Files:**
- Create: `services/booking-api/src/catalog.ts`
- Create: `services/booking-api/src/catalog.test.ts`
- Create: `services/booking-api/src/rate-limit.ts`
- Create: `services/booking-api/src/rate-limit.test.ts`

- [ ] **Step 1: Write the failing catalog tests**

`services/booking-api/src/catalog.test.ts`

```ts
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
```

- [ ] **Step 2: Run the catalog test to verify it fails**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/catalog.test.ts
```

Expected: FAIL. Vitest cannot resolve `./catalog.js`.

- [ ] **Step 3: Write the catalog module**

`services/booking-api/src/catalog.ts`

```ts
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
```

- [ ] **Step 4: Run the catalog test to verify it passes**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/catalog.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing rate-limit tests**

`services/booking-api/src/rate-limit.test.ts`

```ts
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
```

- [ ] **Step 6: Run the rate-limit test to verify it fails**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/rate-limit.test.ts
```

Expected: FAIL. Vitest cannot resolve `./rate-limit.js`.

- [ ] **Step 7: Write the rate limiter**

`services/booking-api/src/rate-limit.ts`

```ts
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
```

- [ ] **Step 8: Run the rate-limit test to verify it passes**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/rate-limit.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 9: Commit**

```bash
git add services/booking-api/src/catalog.ts services/booking-api/src/catalog.test.ts services/booking-api/src/rate-limit.ts services/booking-api/src/rate-limit.test.ts
git commit -m "$(cat <<'EOF'
feat: cache the cleaning catalog and limit booking creates

EOF
)"
```

---

### Task 5: HTTP routes

**Files:**
- Create: `services/booking-api/src/store.ts`
- Create: `services/booking-api/src/auth.ts`
- Create: `services/booking-api/src/memory-store.ts`
- Create: `services/booking-api/src/memory-cache.ts`
- Create: `services/booking-api/src/fake-auth.ts`
- Modify: `services/booking-api/src/app.ts`
- Modify: `services/booking-api/src/app.test.ts`

- [ ] **Step 1: Replace the route tests**

Replace `services/booking-api/src/app.test.ts` with:

```ts
import { describe, expect, it } from "vitest"
import { createApp } from "./app.js"
import { createFakeAuth } from "./fake-auth.js"
import { createMemoryCache } from "./memory-cache.js"
import { createMemoryStore } from "./memory-store.js"
import type { ServiceRecord } from "./store.js"

const description = "A regular whole-home clean: kitchens, bathrooms, floors, and surfaces."

const standard: ServiceRecord = {
  id: "svc-standard",
  slug: "standard",
  name: "Standard clean",
  description,
  startingPriceCents: 14900,
  active: true,
  sortOrder: 1,
}

const deep: ServiceRecord = {
  id: "svc-deep",
  slug: "deep",
  name: "Deep clean",
  description: "A detailed clean that includes inside appliances, baseboards, and built-up grime.",
  startingPriceCents: 24900,
  active: true,
  sortOrder: 2,
}

const retired: ServiceRecord = {
  id: "svc-retired",
  slug: "retired",
  name: "Retired clean",
  description: "No longer offered.",
  startingPriceCents: 1000,
  active: false,
  sortOrder: 9,
}

const fixedNow = new Date("2026-09-28T18:00:00.000Z")

function harness() {
  let tick = 0
  const store = createMemoryStore({
    services: [standard, deep, retired],
    clock: () => new Date(fixedNow.getTime() + tick++ * 1000),
  })
  const cache = createMemoryCache()
  const auth = createFakeAuth({
    ada: {
      clerkUserId: "user_ada",
      role: "customer",
      email: "ada@example.com",
      name: "Ada Lovelace",
    },
    bea: {
      clerkUserId: "user_bea",
      role: "customer",
      email: "bea@example.com",
      name: "Bea Customer",
    },
    sam: {
      clerkUserId: "user_sam",
      role: "staff",
      email: "sam@example.com",
      name: "Sam Staff",
    },
    blank: "missing-role",
    bad: "invalid",
  })
  const app = createApp({
    auth,
    store,
    cache,
    clock: { now: () => fixedNow },
  })
  return { app, store, cache }
}

function jsonRequest(path: string, token: string | undefined, body?: unknown, method = "POST") {
  const headers: Record<string, string> = { "content-type": "application/json" }
  if (token) headers.authorization = `Bearer ${token}`
  return {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  }
}

const bookingBody = {
  service_slug: "standard",
  address_line1: "123 Main St",
  city: "Campbell River",
  province: "bc",
  postal_code: "v9w1a1",
  service_date: "2026-10-01",
  time_window: "morning",
  notes: "Dog on site",
}

describe("GET /health", () => {
  it("returns ok without a session", async () => {
    const { app } = harness()
    const response = await app.request("/health")
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: "ok" })
    expect(response.headers.get("x-request-id")).toBeTruthy()
  })
})

describe("auth", () => {
  it("returns 401 when the session is missing", async () => {
    const { app } = harness()
    const response = await app.request("/bookings")
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      error: { code: "unauthorized", message: "Sign in required." },
    })
  })

  it("returns 401 when the token is invalid", async () => {
    const { app } = harness()
    const response = await app.request("/bookings", { headers: { authorization: "Bearer bad" } })
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      error: { code: "unauthorized", message: "Sign in required." },
    })
  })

  it("returns 403 when the session has no role", async () => {
    const { app } = harness()
    const response = await app.request("/services", { headers: { authorization: "Bearer blank" } })
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      error: { code: "forbidden", message: "You do not have access to this action." },
    })
  })

  it("returns 403 when a customer calls a staff route", async () => {
    const { app } = harness()
    const response = await app.request("/admin/bookings", { headers: { authorization: "Bearer ada" } })
    expect(response.status).toBe(403)
  })

  it("returns 403 when staff call POST /bookings", async () => {
    const { app } = harness()
    const response = await app.request("/bookings", jsonRequest("/bookings", "sam", bookingBody))
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      error: { code: "forbidden", message: "You do not have access to this action." },
    })
  })
})

describe("services and bookings", () => {
  it("returns the active catalog in sort order", async () => {
    const { app } = harness()
    const response = await app.request("/services", { headers: { authorization: "Bearer sam" } })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      services: [
        {
          slug: "standard",
          name: "Standard clean",
          description,
          starting_price_cents: 14900,
        },
        {
          slug: "deep",
          name: "Deep clean",
          description: deep.description,
          starting_price_cents: 24900,
        },
      ],
    })
  })

  it("creates a requested booking with the price copied from the service", async () => {
    const { app } = harness()
    const response = await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toMatchObject({
      service_slug: "standard",
      service_name: "Standard clean",
      price_shown_cents: 14900,
      status: "requested",
      province: "BC",
      postal_code: "V9W 1A1",
      service_date: "2026-10-01",
      time_window: "morning",
      notes: "Dog on site",
      staff_note: null,
      decided_at: null,
    })
    expect(body).not.toHaveProperty("customer_name")
  })

  it("returns 400 for an inactive service", async () => {
    const { app } = harness()
    const response = await app.request(
      "/bookings",
      jsonRequest("/bookings", "ada", { ...bookingBody, service_slug: "retired" }),
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: {
        code: "validation_error",
        message: "Service is not available.",
        fields: { service_slug: "is not available" },
      },
    })
  })

  it("returns 400 for a past date", async () => {
    const { app } = harness()
    const response = await app.request(
      "/bookings",
      jsonRequest("/bookings", "ada", { ...bookingBody, service_date: "2026-09-27" }),
    )
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error.code).toBe("validation_error")
    expect(body.error.fields.service_date).toBe("must be today or later")
  })

  it("returns 400 when the body is not JSON", async () => {
    const { app } = harness()
    const response = await app.request("/bookings", {
      method: "POST",
      headers: { authorization: "Bearer ada", "content-type": "application/json" },
      body: "{",
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: { code: "validation_error", message: "Request body must be JSON." },
    })
  })

  it("returns 429 on the sixth create and does not insert it", async () => {
    const { app } = harness()
    for (let index = 0; index < 5; index += 1) {
      const created = await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
      expect(created.status).toBe(201)
    }
    const blocked = await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get("retry-after")).toBe("3600")
    expect(await blocked.json()).toEqual({
      error: { code: "rate_limited", message: "Too many booking requests. Try again later." },
    })
    const list = await app.request("/bookings", { headers: { authorization: "Bearer ada" } })
    const body = await list.json()
    expect(body.bookings).toHaveLength(5)
  })

  it("still creates a booking when the counter throws", async () => {
    const { app, cache } = harness()
    cache.failIncrements = true
    const response = await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
    expect(response.status).toBe(201)
  })

  it("lists only that customer's bookings, newest first", async () => {
    const { app } = harness()
    await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
    await app.request("/bookings", jsonRequest("/bookings", "bea", { ...bookingBody, notes: "Bea" }))
    await app.request("/bookings", jsonRequest("/bookings", "ada", { ...bookingBody, notes: "Second" }))

    const response = await app.request("/bookings", { headers: { authorization: "Bearer ada" } })
    const body = await response.json()
    expect(body.bookings.map((booking: { notes: string }) => booking.notes)).toEqual(["Second", "Dog on site"])
  })
})

describe("staff decisions", () => {
  it("confirms a requested booking", async () => {
    const { app } = harness()
    const created = await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))
    const booking = await created.json()
    const response = await app.request(
      `/admin/bookings/${booking.id}/confirm`,
      jsonRequest(`/admin/bookings/${booking.id}/confirm`, "sam", { staff_note: " Tuesday morning " }),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({
      status: "confirmed",
      staff_note: "Tuesday morning",
      customer_name: "Ada Lovelace",
      customer_email: "ada@example.com",
    })
    expect(body.decided_at).toEqual(expect.any(String))
  })

  it("lists only requested bookings for staff", async () => {
    const { app } = harness()
    const first = await (await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))).json()
    await app.request("/bookings", jsonRequest("/bookings", "bea", bookingBody))
    await app.request(
      `/admin/bookings/${first.id}/confirm`,
      jsonRequest(`/admin/bookings/${first.id}/confirm`, "sam", {}),
    )
    const response = await app.request("/admin/bookings", { headers: { authorization: "Bearer sam" } })
    const body = await response.json()
    expect(body.bookings).toHaveLength(1)
    expect(body.bookings[0].customer_name).toBe("Bea Customer")
    expect(body.bookings[0].status).toBe("requested")
  })

  it("returns 400 when a decline has no note", async () => {
    const { app } = harness()
    const booking = await (await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))).json()
    const response = await app.request(
      `/admin/bookings/${booking.id}/decline`,
      jsonRequest(`/admin/bookings/${booking.id}/decline`, "sam", {}),
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: {
        code: "validation_error",
        message: "A decline note is required.",
        fields: { staff_note: "required" },
      },
    })
  })

  it("returns 409 on a second decision and leaves the row confirmed", async () => {
    const { app } = harness()
    const booking = await (await app.request("/bookings", jsonRequest("/bookings", "ada", bookingBody))).json()
    await app.request(
      `/admin/bookings/${booking.id}/confirm`,
      jsonRequest(`/admin/bookings/${booking.id}/confirm`, "sam", {}),
    )
    const again = await app.request(
      `/admin/bookings/${booking.id}/decline`,
      jsonRequest(`/admin/bookings/${booking.id}/decline`, "sam", { staff_note: "Changed my mind" }),
    )
    expect(again.status).toBe(409)
    expect(await again.json()).toEqual({
      error: { code: "conflict", message: "Booking has already been decided." },
    })
    const mine = await app.request("/bookings", { headers: { authorization: "Bearer ada" } })
    const body = await mine.json()
    expect(body.bookings[0].status).toBe("confirmed")
  })

  it("returns 404 for an unknown booking id", async () => {
    const { app } = harness()
    const response = await app.request(
      "/admin/bookings/missing/confirm",
      jsonRequest("/admin/bookings/missing/confirm", "sam", {}),
    )
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: { code: "not_found", message: "Booking not found." },
    })
  })
})
```

- [ ] **Step 2: Run the route tests to verify they fail**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/app.test.ts
```

Expected: FAIL. Vitest cannot resolve `./fake-auth.js`.

- [ ] **Step 3: Write the store, auth, and test doubles**

`services/booking-api/src/store.ts`

```ts
export type Role = "customer" | "staff"
export type BookingStatus = "requested" | "confirmed" | "declined"
export type TimeWindow = "morning" | "afternoon" | "evening"

export type SessionUser = {
  clerkUserId: string
  role: Role
  email: string | null
  name: string | null
}

export type ServiceRecord = {
  id: string
  slug: string
  name: string
  description: string
  startingPriceCents: number
  active: boolean
  sortOrder: number
}

export type BookingRecord = {
  id: string
  customerId: string
  serviceSlug: string
  serviceName: string
  priceShownCents: number
  status: BookingStatus
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  serviceDate: string
  timeWindow: TimeWindow
  notes: string | null
  staffNote: string | null
  decidedAt: string | null
  createdAt: string
  customerName: string | null
  customerEmail: string | null
}

export type InsertBooking = {
  customerId: string
  serviceId: string
  priceShownCents: number
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  serviceDate: string
  timeWindow: TimeWindow
  notes: string | null
}

export type Decision = {
  id: string
  status: "confirmed" | "declined"
  staffNote: string | null
  decidedBy: string
  decidedAt: Date
}

export interface BookingStore {
  upsertUser(user: SessionUser): Promise<{ id: string }>
  listActiveServices(): Promise<ServiceRecord[]>
  findActiveServiceBySlug(slug: string): Promise<ServiceRecord | null>
  insertBooking(input: InsertBooking): Promise<BookingRecord>
  listBookingsForCustomer(customerId: string): Promise<BookingRecord[]>
  listRequestedBookings(): Promise<BookingRecord[]>
  findBookingById(id: string): Promise<BookingRecord | null>
  decideBooking(input: Decision): Promise<BookingRecord | null>
}
```

`services/booking-api/src/auth.ts`

```ts
import type { SessionUser } from "./store.js"

export class InvalidSession extends Error {
  constructor() {
    super("Invalid session")
    this.name = "InvalidSession"
  }
}

export class MissingRole extends Error {
  constructor() {
    super("Missing role")
    this.name = "MissingRole"
  }
}

export interface AuthVerifier {
  verify(token: string): Promise<SessionUser>
}
```

`services/booking-api/src/fake-auth.ts`

```ts
import { InvalidSession, MissingRole, type AuthVerifier } from "./auth.js"
import type { SessionUser } from "./store.js"

export function createFakeAuth(
  tokens: Record<string, SessionUser | "missing-role" | "invalid">,
): AuthVerifier {
  return {
    async verify(token: string) {
      const entry = tokens[token]
      if (!entry || entry === "invalid") throw new InvalidSession()
      if (entry === "missing-role") throw new MissingRole()
      return entry
    },
  }
}
```

`services/booking-api/src/memory-cache.ts`

```ts
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
```

`services/booking-api/src/memory-store.ts`

```ts
import type {
  BookingRecord,
  BookingStore,
  Decision,
  InsertBooking,
  ServiceRecord,
  SessionUser,
} from "./store.js"

function byNewest(left: BookingRecord, right: BookingRecord): number {
  return right.createdAt.localeCompare(left.createdAt)
}

export function createMemoryStore(options?: {
  services?: ServiceRecord[]
  clock?: () => Date
}): BookingStore {
  const services = [...(options?.services ?? [])]
  const clock = options?.clock ?? (() => new Date())
  const users = new Map<string, SessionUser & { id: string }>()
  const bookings: BookingRecord[] = []

  function customer(id: string) {
    for (const user of users.values()) {
      if (user.id === id) return user
    }
    return undefined
  }

  function toRecord(booking: BookingRecord): BookingRecord {
    const user = customer(booking.customerId)
    return {
      ...booking,
      customerName: user?.name ?? null,
      customerEmail: user?.email ?? null,
    }
  }

  return {
    async upsertUser(user) {
      const existing = users.get(user.clerkUserId)
      if (existing) {
        existing.role = user.role
        existing.email = user.email
        existing.name = user.name
        return { id: existing.id }
      }
      const created = { ...user, id: crypto.randomUUID() }
      users.set(user.clerkUserId, created)
      return { id: created.id }
    },
    async listActiveServices() {
      return services.filter((service) => service.active).sort((left, right) => left.sortOrder - right.sortOrder)
    },
    async findActiveServiceBySlug(slug) {
      return services.find((service) => service.slug === slug && service.active) ?? null
    },
    async insertBooking(input: InsertBooking) {
      const service = services.find((item) => item.id === input.serviceId)
      if (!service) throw new Error("service missing")
      const booking: BookingRecord = {
        id: crypto.randomUUID(),
        customerId: input.customerId,
        serviceSlug: service.slug,
        serviceName: service.name,
        priceShownCents: input.priceShownCents,
        status: "requested",
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        serviceDate: input.serviceDate,
        timeWindow: input.timeWindow,
        notes: input.notes,
        staffNote: null,
        decidedAt: null,
        createdAt: clock().toISOString(),
        customerName: null,
        customerEmail: null,
      }
      bookings.push(booking)
      return toRecord(booking)
    },
    async listBookingsForCustomer(customerId) {
      return bookings.filter((booking) => booking.customerId === customerId).sort(byNewest).map(toRecord)
    },
    async listRequestedBookings() {
      return bookings.filter((booking) => booking.status === "requested").sort(byNewest).map(toRecord)
    },
    async findBookingById(id) {
      const booking = bookings.find((item) => item.id === id)
      return booking ? toRecord(booking) : null
    },
    async decideBooking(input: Decision) {
      const booking = bookings.find((item) => item.id === input.id && item.status === "requested")
      if (!booking) return null
      booking.status = input.status
      booking.staffNote = input.staffNote
      booking.decidedAt = input.decidedAt.toISOString()
      return toRecord(booking)
    },
  }
}
```

- [ ] **Step 4: Replace the Hono app**

Replace `services/booking-api/src/app.ts` with:

```ts
import { Hono, type Context, type Next } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { InvalidSession, MissingRole, type AuthVerifier } from "./auth.js"
import { getCatalog, type CatalogCache } from "./catalog.js"
import { nextStatus, validateCreate, validateDecision } from "./booking-rules.js"
import { AppError, errorResponse } from "./errors.js"
import { consumeCreateSlot, type WindowCounter } from "./rate-limit.js"
import type { BookingRecord, BookingStore, SessionUser } from "./store.js"

type Variables = {
  requestId: string
  session: SessionUser
  userId: string
}

export type AppDeps = {
  auth: AuthVerifier
  store: BookingStore
  cache: CatalogCache & WindowCounter
  clock: { now(): Date }
}

function bookingJson(booking: BookingRecord, audience: "customer" | "staff") {
  const body = {
    id: booking.id,
    service_slug: booking.serviceSlug,
    service_name: booking.serviceName,
    price_shown_cents: booking.priceShownCents,
    status: booking.status,
    address_line1: booking.addressLine1,
    address_line2: booking.addressLine2,
    city: booking.city,
    province: booking.province,
    postal_code: booking.postalCode,
    service_date: booking.serviceDate,
    time_window: booking.timeWindow,
    notes: booking.notes,
    staff_note: booking.staffNote,
    decided_at: booking.decidedAt,
    created_at: booking.createdAt,
  }
  if (audience === "staff") {
    return {
      ...body,
      customer_name: booking.customerName,
      customer_email: booking.customerEmail,
    }
  }
  return body
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new AppError(400, "validation_error", "Request body must be JSON.")
  }
}

export function createApp(deps?: AppDeps) {
  const app = new Hono<{ Variables: Variables }>()

  app.use("*", async (c, next) => {
    const incoming = c.req.header("x-request-id")
    const requestId = incoming && incoming.length > 0 ? incoming : crypto.randomUUID()
    c.set("requestId", requestId)
    c.header("x-request-id", requestId)
    await next()
  })

  app.onError((err, c) => {
    if (err instanceof AppError) {
      const response = errorResponse(err)
      for (const [key, value] of Object.entries(response.headers)) {
        c.header(key, value)
      }
      return c.json(response.body, response.status as ContentfulStatusCode)
    }
    console.error(
      JSON.stringify({
        requestId: c.get("requestId"),
        event: "internal_error",
        error: err instanceof Error ? (err.stack ?? err.message) : String(err),
      }),
    )
    return c.json({ error: { code: "internal_error", message: "Something went wrong." } }, 500)
  })

  app.get("/health", (c) => c.json({ status: "ok" }))

  if (!deps) return app
  const authed = deps

  const requireUser = async (c: Context<{ Variables: Variables }>, next: Next) => {
    const header = c.req.header("authorization") ?? ""
    const match = /^Bearer (.+)$/.exec(header)
    if (!match) throw new AppError(401, "unauthorized", "Sign in required.")
    try {
      const session = await authed.auth.verify(match[1])
      const user = await authed.store.upsertUser(session)
      c.set("session", session)
      c.set("userId", user.id)
    } catch (error) {
      if (error instanceof MissingRole) {
        throw new AppError(403, "forbidden", "You do not have access to this action.")
      }
      if (error instanceof InvalidSession) {
        throw new AppError(401, "unauthorized", "Sign in required.")
      }
      throw error
    }
    await next()
  }

  const requireRole = (role: "customer" | "staff") => {
    return async (c: Context<{ Variables: Variables }>, next: Next) => {
      if (c.get("session").role !== role) {
        throw new AppError(403, "forbidden", "You do not have access to this action.")
      }
      await next()
    }
  }

  app.get("/services", requireUser, async (c) => {
    const services = await getCatalog(authed.store, authed.cache, c.get("requestId"))
    return c.json({
      services: services.map((service) => ({
        slug: service.slug,
        name: service.name,
        description: service.description,
        starting_price_cents: service.startingPriceCents,
      })),
    })
  })

  app.get("/bookings", requireUser, requireRole("customer"), async (c) => {
    const bookings = await authed.store.listBookingsForCustomer(c.get("userId"))
    return c.json({ bookings: bookings.map((booking) => bookingJson(booking, "customer")) })
  })

  app.post("/bookings", requireUser, requireRole("customer"), async (c) => {
    const input = validateCreate(await readJson(c.req.raw), authed.clock.now())
    const service = await authed.store.findActiveServiceBySlug(input.serviceSlug)
    if (!service) {
      throw new AppError(400, "validation_error", "Service is not available.", {
        service_slug: "is not available",
      })
    }
    await consumeCreateSlot(authed.cache, c.get("session").clerkUserId, c.get("requestId"))
    const booking = await authed.store.insertBooking({
      customerId: c.get("userId"),
      serviceId: service.id,
      priceShownCents: service.startingPriceCents,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode,
      serviceDate: input.serviceDate,
      timeWindow: input.timeWindow,
      notes: input.notes,
    })
    return c.json(bookingJson(booking, "customer"), 201)
  })

  app.get("/admin/bookings", requireUser, requireRole("staff"), async (c) => {
    const bookings = await authed.store.listRequestedBookings()
    return c.json({ bookings: bookings.map((booking) => bookingJson(booking, "staff")) })
  })

  async function decide(c: Context<{ Variables: Variables }>, action: "confirm" | "decline"): Promise<Response> {
    const staffNote = validateDecision(action, await readJson(c.req.raw))
    const existing = await authed.store.findBookingById(c.req.param("id"))
    if (!existing) throw new AppError(404, "not_found", "Booking not found.")
    const status = nextStatus(existing.status, action)
    const updated = await authed.store.decideBooking({
      id: existing.id,
      status,
      staffNote,
      decidedBy: c.get("userId"),
      decidedAt: new Date(),
    })
    if (!updated) throw new AppError(409, "conflict", "Booking has already been decided.")
    return c.json(bookingJson(updated, "staff"))
  }

  app.post("/admin/bookings/:id/confirm", requireUser, requireRole("staff"), (c) => decide(c, "confirm"))
  app.post("/admin/bookings/:id/decline", requireUser, requireRole("staff"), (c) => decide(c, "decline"))

  return app
}
```

- [ ] **Step 5: Run the route tests to verify they pass**

Run:

```bash
pnpm --filter @repo/booking-api exec vitest run src/app.test.ts src/booking-rules.test.ts src/catalog.test.ts src/rate-limit.test.ts src/errors.test.ts
```

Expected: PASS. `GET /health` is covered by calling `createApp()` with no arguments.

- [ ] **Step 6: Commit**

```bash
git add services/booking-api/src/store.ts services/booking-api/src/auth.ts services/booking-api/src/memory-store.ts services/booking-api/src/memory-cache.ts services/booking-api/src/fake-auth.ts services/booking-api/src/app.ts services/booking-api/src/app.test.ts
git commit -m "$(cat <<'EOF'
feat: add customer and staff booking routes

EOF
)"
```

---

### Task 6: Postgres schema and store

**Files:**
- Create: `services/booking-api/drizzle/0001_init.sql`
- Create: `services/booking-api/src/db/schema.ts`
- Create: `services/booking-api/src/postgres-store.ts`
- Create: `services/booking-api/src/migrate.ts`

- [ ] **Step 1: Write the migration**

`services/booking-api/drizzle/0001_init.sql`

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('customer', 'staff')),
  email text,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  starting_price_cents integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES users (id),
  service_id uuid NOT NULL REFERENCES services (id),
  price_shown_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'declined')),
  address_line1 text NOT NULL CHECK (char_length(address_line1) BETWEEN 1 AND 120),
  address_line2 text CHECK (address_line2 IS NULL OR char_length(address_line2) <= 120),
  city text NOT NULL CHECK (char_length(city) BETWEEN 1 AND 80),
  province text NOT NULL,
  postal_code text NOT NULL,
  service_date date NOT NULL,
  time_window text NOT NULL CHECK (time_window IN ('morning', 'afternoon', 'evening')),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  staff_note text CHECK (staff_note IS NULL OR char_length(staff_note) <= 500),
  decided_by uuid REFERENCES users (id),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bookings_customer_created_idx ON bookings (customer_id, created_at DESC);
CREATE INDEX bookings_status_created_idx ON bookings (status, created_at DESC);

INSERT INTO services (id, slug, name, description, starting_price_cents, active, sort_order)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'standard',
    'Standard clean',
    'A regular whole-home clean: kitchens, bathrooms, floors, and surfaces.',
    14900,
    true,
    1
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'deep',
    'Deep clean',
    'A detailed clean that includes inside appliances, baseboards, and built-up grime.',
    24900,
    true,
    2
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'move-out',
    'Move-out clean',
    'An empty-home clean for a move-out or handover.',
    32900,
    true,
    3
  );
```

- [ ] **Step 2: Write the Drizzle schema**

`services/booking-api/src/db/schema.ts`

```ts
import { boolean, date, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  role: text("role").notNull(),
  email: text("email"),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  startingPriceCents: integer("starting_price_cents").notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => users.id),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id),
  priceShownCents: integer("price_shown_cents").notNull(),
  status: text("status").notNull().default("requested"),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  serviceDate: date("service_date", { mode: "string" }).notNull(),
  timeWindow: text("time_window").notNull(),
  notes: text("notes"),
  staffNote: text("staff_note"),
  decidedBy: uuid("decided_by").references(() => users.id),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})
```

- [ ] **Step 3: Write the migrator**

`services/booking-api/src/migrate.ts`

```ts
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
```

- [ ] **Step 4: Write the Postgres store**

`services/booking-api/src/postgres-store.ts`

```ts
import { and, asc, desc, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { bookings, services, users } from "./db/schema.js"
import type {
  BookingRecord,
  BookingStatus,
  BookingStore,
  Decision,
  InsertBooking,
  ServiceRecord,
  SessionUser,
  TimeWindow,
} from "./store.js"

function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, { max: 10 })
  return drizzle(client)
}

type Database = ReturnType<typeof createDb>

function mapService(row: typeof services.$inferSelect): ServiceRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    startingPriceCents: row.startingPriceCents,
    active: row.active,
    sortOrder: row.sortOrder,
  }
}

export function createPostgresStore(databaseUrl: string): BookingStore {
  const db = createDb(databaseUrl)
  return new PostgresStore(db)
}

class PostgresStore implements BookingStore {
  constructor(private readonly db: Database) {}

  async upsertUser(user: SessionUser) {
    const rows = await this.db
      .insert(users)
      .values({
        clerkUserId: user.clerkUserId,
        role: user.role,
        email: user.email,
        name: user.name,
      })
      .onConflictDoUpdate({
        target: users.clerkUserId,
        set: {
          role: user.role,
          email: user.email,
          name: user.name,
          updatedAt: new Date(),
        },
      })
      .returning({ id: users.id })
    return { id: rows[0].id }
  }

  async listActiveServices() {
    const rows = await this.db
      .select()
      .from(services)
      .where(eq(services.active, true))
      .orderBy(asc(services.sortOrder))
    return rows.map(mapService)
  }

  async findActiveServiceBySlug(slug: string) {
    const rows = await this.db
      .select()
      .from(services)
      .where(and(eq(services.slug, slug), eq(services.active, true)))
      .limit(1)
    return rows[0] ? mapService(rows[0]) : null
  }

  async insertBooking(input: InsertBooking) {
    const inserted = await this.db
      .insert(bookings)
      .values({
        customerId: input.customerId,
        serviceId: input.serviceId,
        priceShownCents: input.priceShownCents,
        status: "requested",
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        serviceDate: input.serviceDate,
        timeWindow: input.timeWindow,
        notes: input.notes,
      })
      .returning({ id: bookings.id })
    const booking = await this.findBookingById(inserted[0].id)
    if (!booking) throw new Error("inserted booking was not found")
    return booking
  }

  async listBookingsForCustomer(customerId: string) {
    const rows = await this.bookingQuery().where(eq(bookings.customerId, customerId)).orderBy(desc(bookings.createdAt))
    return rows.map(mapBooking)
  }

  async listRequestedBookings() {
    const rows = await this.bookingQuery()
      .where(eq(bookings.status, "requested"))
      .orderBy(desc(bookings.createdAt))
    return rows.map(mapBooking)
  }

  async findBookingById(id: string) {
    const rows = await this.bookingQuery().where(eq(bookings.id, id)).limit(1)
    return rows[0] ? mapBooking(rows[0]) : null
  }

  async decideBooking(input: Decision) {
    const updated = await this.db
      .update(bookings)
      .set({
        status: input.status,
        staffNote: input.staffNote,
        decidedBy: input.decidedBy,
        decidedAt: input.decidedAt,
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.id, input.id), eq(bookings.status, "requested")))
      .returning({ id: bookings.id })
    if (updated.length === 0) return null
    return this.findBookingById(input.id)
  }

  private bookingQuery() {
    return this.db
      .select({
        id: bookings.id,
        customerId: bookings.customerId,
        serviceSlug: services.slug,
        serviceName: services.name,
        priceShownCents: bookings.priceShownCents,
        status: bookings.status,
        addressLine1: bookings.addressLine1,
        addressLine2: bookings.addressLine2,
        city: bookings.city,
        province: bookings.province,
        postalCode: bookings.postalCode,
        serviceDate: bookings.serviceDate,
        timeWindow: bookings.timeWindow,
        notes: bookings.notes,
        staffNote: bookings.staffNote,
        decidedAt: bookings.decidedAt,
        createdAt: bookings.createdAt,
        customerName: users.name,
        customerEmail: users.email,
      })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .innerJoin(users, eq(users.id, bookings.customerId))
  }
}

function mapBooking(row: {
  id: string
  customerId: string
  serviceSlug: string
  serviceName: string
  priceShownCents: number
  status: string
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  serviceDate: string
  timeWindow: string
  notes: string | null
  staffNote: string | null
  decidedAt: Date | null
  createdAt: Date
  customerName: string | null
  customerEmail: string | null
}): BookingRecord {
  return {
    id: row.id,
    customerId: row.customerId,
    serviceSlug: row.serviceSlug,
    serviceName: row.serviceName,
    priceShownCents: row.priceShownCents,
    status: row.status as BookingStatus,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    province: row.province,
    postalCode: row.postalCode,
    serviceDate: row.serviceDate,
    timeWindow: row.timeWindow as TimeWindow,
    notes: row.notes,
    staffNote: row.staffNote,
    decidedAt: row.decidedAt ? row.decidedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    customerName: row.customerName,
    customerEmail: row.customerEmail,
  }
}
```

This store is the production adapter of `BookingStore`. CI covers that interface through `createMemoryStore`. Do not add a test that opens a live database.

- [ ] **Step 5: Typecheck the store**

Run:

```bash
pnpm --filter @repo/booking-api exec tsc --noEmit --pretty false
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add services/booking-api/drizzle/0001_init.sql services/booking-api/src/db/schema.ts services/booking-api/src/postgres-store.ts services/booking-api/src/migrate.ts
git commit -m "$(cat <<'EOF'
feat: store cleaning bookings in postgres

EOF
)"
```

---

### Task 7: Redis, Clerk, and the process entrypoint

**Files:**
- Create: `services/booking-api/src/redis-cache.ts`
- Create: `services/booking-api/src/clerk-auth.ts`
- Create: `services/booking-api/src/index.ts`
- Create: `services/booking-api/.env.example`
- Create: `services/booking-api/Dockerfile`
- Create: `services/booking-api/railway.toml`

- [ ] **Step 1: Write the Redis cache**

`services/booking-api/src/redis-cache.ts`

```ts
import Redis from "ioredis"
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
```

The Lua script sets the 3600-second TTL only when the count becomes 1. `consumeCreateSlot` already treats a thrown Redis error as permission to insert, and treats a count above 5 as 429.

- [ ] **Step 2: Write the Clerk verifier**

`services/booking-api/src/clerk-auth.ts`

```ts
import { createClerkClient, verifyToken } from "@clerk/backend"
import { InvalidSession, MissingRole, type AuthVerifier } from "./auth.js"
import type { SessionUser } from "./store.js"

export function createClerkAuth(secretKey: string): AuthVerifier {
  const clerk = createClerkClient({ secretKey })
  return {
    async verify(token: string): Promise<SessionUser> {
      let clerkUserId: string
      try {
        const verified = await verifyToken(token, { secretKey })
        clerkUserId = verified.sub
      } catch {
        throw new InvalidSession()
      }

      const user = await clerk.users.getUser(clerkUserId)
      const role = (user.publicMetadata as { role?: unknown }).role
      if (role !== "customer" && role !== "staff") throw new MissingRole()

      const primary = user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)
      const email = primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null
      const name = [user.firstName, user.lastName].filter((part): part is string => Boolean(part)).join(" ")

      return {
        clerkUserId: user.id,
        role,
        email,
        name: name.length > 0 ? name : null,
      }
    },
  }
}
```

`verifyToken` and `createClerkClient({ secretKey })` match the Clerk backend SDK. `users.getUser` loads `publicMetadata.role` because the session JWT does not include that field unless the Clerk dashboard is customized. A failed `verifyToken` becomes 401. A verified user with no `customer` or `staff` role becomes 403. A failed `getUser` call propagates and the app returns 500.

- [ ] **Step 3: Write the process entrypoint**

`services/booking-api/src/index.ts`

```ts
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
```

- [ ] **Step 4: Write the env example, Docker image, and Railway config**

`services/booking-api/.env.example`

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/booking
REDIS_URL=redis://localhost:6379
CLERK_SECRET_KEY=sk_test_replace_me
PORT=3002
```

`services/booking-api/Dockerfile`

```dockerfile
FROM node:20-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/booking-api/package.json services/booking-api/package.json
RUN pnpm install --frozen-lockfile --filter @repo/booking-api...
COPY services/booking-api services/booking-api
RUN pnpm --filter @repo/booking-api build
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "services/booking-api/dist/index.js"]
```

Build this image with the repo root as the Docker context.

`services/booking-api/railway.toml`

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "services/booking-api/Dockerfile"

[deploy]
startCommand = "node services/booking-api/dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 30
```

In the Railway service, set the root directory to the repo root so `dockerfilePath` resolves, and set `DATABASE_URL`, `REDIS_URL`, `CLERK_SECRET_KEY`, and `PORT`. Create staff users in the Clerk dashboard with `publicMetadata.role` set to `staff`. Customers need `publicMetadata.role` set to `customer` before this API will accept them.

- [ ] **Step 5: Typecheck and run the full test file set**

Run:

```bash
pnpm --filter @repo/booking-api exec tsc --noEmit --pretty false
pnpm --filter @repo/booking-api test
```

Expected: `tsc` exits 0 and Vitest reports every test in `src/**/*.test.ts` passing. `createApp()` with no arguments serves `GET /health`. Route tests pass `AppDeps`.

- [ ] **Step 6: Commit**

```bash
git add services/booking-api/src/redis-cache.ts services/booking-api/src/clerk-auth.ts services/booking-api/src/index.ts services/booking-api/.env.example services/booking-api/Dockerfile services/booking-api/railway.toml
git commit -m "$(cat <<'EOF'
feat: boot the booking api with clerk and redis

EOF
)"
```

---

## Manual check after migrate

This is not a CI test. After Postgres and Redis exist:

```bash
cd services/booking-api
cp .env.example .env
# fill DATABASE_URL, REDIS_URL, and CLERK_SECRET_KEY
pnpm db:migrate
pnpm dev
curl -s localhost:3002/health
```

Expected migrate: the `services` table has three rows, `standard` at 14900 cents, `deep` at 24900, and `move-out` at 32900. Expected curl: `{"status":"ok"}` and an `x-request-id` header.
