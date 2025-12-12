import { describe, it, expect } from "vitest"
import {
  MechAuthError,
  MechSqlError,
  MechConfigError,
  MechNetworkError,
  MechTimeoutError,
  MechRateLimitError
} from "../errors.js"

describe("errors", () => {
  describe("MechAuthError", () => {
    it("should create error with code and details", () => {
      const err = new MechAuthError("Test error", "TEST_CODE", { foo: "bar" })
      expect(err.message).toBe("Test error")
      expect(err.code).toBe("TEST_CODE")
      expect(err.details).toEqual({ foo: "bar" })
      expect(err.name).toBe("MechAuthError")
    })
  })

  describe("MechSqlError", () => {
    it("should create SQL error", () => {
      const err = new MechSqlError("SQL failed", { query: "SELECT *" })
      expect(err.message).toBe("SQL failed")
      expect(err.code).toBe("MECH_SQL_ERROR")
      expect(err.name).toBe("MechSqlError")
    })
  })

  describe("MechConfigError", () => {
    it("should create config error", () => {
      const err = new MechConfigError("Missing env var", { env: "MECH_APP_ID" })
      expect(err.message).toBe("Missing env var")
      expect(err.code).toBe("MECH_CONFIG_ERROR")
      expect(err.name).toBe("MechConfigError")
    })
  })

  describe("MechNetworkError", () => {
    it("should create network error with status code", () => {
      const err = new MechNetworkError("Connection failed", 500, { url: "https://example.com" })
      expect(err.message).toBe("Connection failed")
      expect(err.statusCode).toBe(500)
      expect(err.code).toBe("MECH_NETWORK_ERROR")
      expect(err.name).toBe("MechNetworkError")
    })
  })

  describe("MechTimeoutError", () => {
    it("should create timeout error", () => {
      const err = new MechTimeoutError("Timeout", { timeout: 30000 })
      expect(err.message).toBe("Timeout")
      expect(err.code).toBe("MECH_TIMEOUT_ERROR")
      expect(err.name).toBe("MechTimeoutError")
    })
  })

  describe("MechRateLimitError", () => {
    it("should create rate limit error with retry after", () => {
      const err = new MechRateLimitError(60000, { endpoint: "/query" })
      expect(err.message).toContain("Rate limit exceeded")
      expect(err.retryAfter).toBe(60000)
      expect(err.code).toBe("MECH_RATE_LIMIT_ERROR")
      expect(err.name).toBe("MechRateLimitError")
    })
  })
})
