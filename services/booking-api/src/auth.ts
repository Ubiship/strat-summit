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
