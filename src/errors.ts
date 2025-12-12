/**
 * Error types for LightAuth
 */

export class MechAuthError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: Record<string, any>) {
    super(message)
    this.name = "MechAuthError"
  }
}

export class MechSqlError extends MechAuthError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "MECH_SQL_ERROR", details)
    this.name = "MechSqlError"
  }
}

export class MechConfigError extends MechAuthError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "MECH_CONFIG_ERROR", details)
    this.name = "MechConfigError"
  }
}

export class MechNetworkError extends MechAuthError {
  constructor(message: string, public readonly statusCode?: number, details?: Record<string, any>) {
    super(message, "MECH_NETWORK_ERROR", details)
    this.name = "MechNetworkError"
  }
}

export class MechTimeoutError extends MechAuthError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "MECH_TIMEOUT_ERROR", details)
    this.name = "MechTimeoutError"
  }
}

export class MechRateLimitError extends MechAuthError {
  constructor(public readonly retryAfter: number, details?: Record<string, any>) {
    super(`Rate limit exceeded. Retry after ${retryAfter}ms`, "MECH_RATE_LIMIT_ERROR", details)
    this.name = "MechRateLimitError"
  }
}
