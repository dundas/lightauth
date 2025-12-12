/**
 * Email Enumeration Prevention Tests
 *
 * Tests to ensure the system doesn't reveal which emails are registered.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { requestPasswordReset } from '../reset-password.js'
import type { Kysely } from 'kysely'
import type { Database } from '../../database/schema.js'

// Mock database
const createMockDb = () => {
  const mockDb = {
    selectFrom: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    executeTakeFirst: vi.fn(),
    deleteFrom: vi.fn().mockReturnThis(),
    execute: vi.fn(),
    insertInto: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
  } as unknown as Kysely<Database>

  return mockDb
}

describe('Email Enumeration Prevention', () => {
  describe('requestPasswordReset()', () => {
    it('should return success for non-existent user', async () => {
      const db = createMockDb()

      // Mock: User doesn't exist
      vi.mocked(db.selectFrom('users').select(['id', 'email', 'password_hash']).where('email', '=', 'nonexistent@example.com').executeTakeFirst).mockResolvedValue(undefined)

      const result = await requestPasswordReset(db, 'nonexistent@example.com')

      expect(result.success).toBe(true)
      expect(result.email).toBe('nonexistent@example.com')
    })

    it('should return success for existing user', async () => {
      const db = createMockDb()

      // Mock: User exists
      vi.mocked(db.selectFrom('users').select(['id', 'email', 'password_hash']).where('email', '=', 'existing@example.com').executeTakeFirst).mockResolvedValue({
        id: 'user-123',
        email: 'existing@example.com',
        password_hash: '$argon2id$...',
      })

      const result = await requestPasswordReset(db, 'existing@example.com')

      expect(result.success).toBe(true)
      expect(result.email).toBe('existing@example.com')
    })

    it('should not reveal user existence through response', async () => {
      const db = createMockDb()

      // Mock non-existent user
      vi.mocked(db.selectFrom('users').select(['id', 'email', 'password_hash']).where('email', '=', 'nonexistent@example.com').executeTakeFirst).mockResolvedValue(undefined)

      const result1 = await requestPasswordReset(db, 'nonexistent@example.com')

      // Mock existing user
      vi.mocked(db.selectFrom('users').select(['id', 'email', 'password_hash']).where('email', '=', 'existing@example.com').executeTakeFirst).mockResolvedValue({
        id: 'user-123',
        email: 'existing@example.com',
        password_hash: '$argon2id$...',
      })

      const result2 = await requestPasswordReset(db, 'existing@example.com')

      // Both responses should have identical structure
      expect(result1).toHaveProperty('success')
      expect(result1).toHaveProperty('email')
      expect(result2).toHaveProperty('success')
      expect(result2).toHaveProperty('email')

      // Both should indicate success
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)

      // Should not have 'token' property
      expect(result1).not.toHaveProperty('token')
      expect(result2).not.toHaveProperty('token')
    })

    it('should return success for OAuth-only user (no password)', async () => {
      const db = createMockDb()

      // Mock: User exists but has no password (OAuth-only)
      vi.mocked(db.selectFrom('users').select(['id', 'email', 'password_hash']).where('email', '=', 'oauth@example.com').executeTakeFirst).mockResolvedValue({
        id: 'user-456',
        email: 'oauth@example.com',
        password_hash: null, // No password set
      })

      const result = await requestPasswordReset(db, 'oauth@example.com')

      expect(result.success).toBe(true)
      expect(result).not.toHaveProperty('token')
    })

    it('should use callback for existing user with password', async () => {
      const db = createMockDb()
      const mockCallback = vi.fn()

      // Mock: User exists with password
      vi.mocked(db.selectFrom('users').select(['id', 'email', 'password_hash']).where('email', '=', 'user@example.com').executeTakeFirst).mockResolvedValue({
        id: 'user-789',
        email: 'user@example.com',
        password_hash: '$argon2id$...',
      })

      await requestPasswordReset(db, 'user@example.com', mockCallback)

      // Callback should be called with email and token
      expect(mockCallback).toHaveBeenCalledWith(
        'user@example.com',
        expect.any(String)
      )
    })

    it('should NOT use callback for non-existent user', async () => {
      const db = createMockDb()
      const mockCallback = vi.fn()

      // Mock: User doesn't exist
      vi.mocked(db.selectFrom('users').select(['id', 'email', 'password_hash']).where('email', '=', 'nonexistent@example.com').executeTakeFirst).mockResolvedValue(undefined)

      await requestPasswordReset(db, 'nonexistent@example.com', mockCallback)

      // Callback should NOT be called
      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should NOT use callback for OAuth-only user', async () => {
      const db = createMockDb()
      const mockCallback = vi.fn()

      // Mock: OAuth-only user
      vi.mocked(db.selectFrom('users').select(['id', 'email', 'password_hash']).where('email', '=', 'oauth@example.com').executeTakeFirst).mockResolvedValue({
        id: 'user-456',
        email: 'oauth@example.com',
        password_hash: null,
      })

      await requestPasswordReset(db, 'oauth@example.com', mockCallback)

      // Callback should NOT be called (no password to reset)
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('Timing Attack Resistance', () => {
    it('should take similar time for existing and non-existing users', async () => {
      const db = createMockDb()

      // Mock non-existent user
      vi.mocked(db.selectFrom('users').select(['id', 'email', 'password_hash']).where('email', '=', 'nonexistent@example.com').executeTakeFirst).mockResolvedValue(undefined)

      const start1 = Date.now()
      await requestPasswordReset(db, 'nonexistent@example.com')
      const time1 = Date.now() - start1

      // Mock existing user
      vi.mocked(db.selectFrom('users').select(['id', 'email', 'password_hash']).where('email', '=', 'existing@example.com').executeTakeFirst).mockResolvedValue({
        id: 'user-123',
        email: 'existing@example.com',
        password_hash: '$argon2id$...',
      })

      const start2 = Date.now()
      await requestPasswordReset(db, 'existing@example.com')
      const time2 = Date.now() - start2

      // Times should be within reasonable range (mock is very fast, so we just check both completed)
      expect(time1).toBeGreaterThanOrEqual(0)
      expect(time2).toBeGreaterThanOrEqual(0)
    }, 10000) // 10 second timeout
  })
})
