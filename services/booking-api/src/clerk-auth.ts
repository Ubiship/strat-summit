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
