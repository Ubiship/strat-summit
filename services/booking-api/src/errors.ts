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
