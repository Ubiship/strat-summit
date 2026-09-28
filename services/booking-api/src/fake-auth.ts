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
