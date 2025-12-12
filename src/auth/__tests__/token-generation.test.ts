/**
 * Token Generation Security Tests
 *
 * Tests for secure token generation using Web Crypto API and Oslo.
 */

import { describe, it, expect } from 'vitest'
import { generateSecureToken } from '../utils.js'

describe('Token Generation Security', () => {
  describe('generateSecureToken()', () => {
    it('should generate a token with correct length', () => {
      const token = generateSecureToken(32) // 32 bytes = 256 bits

      // Base64url encoding: 32 bytes = ~43 characters
      expect(token.length).toBeGreaterThanOrEqual(42)
      expect(token.length).toBeLessThanOrEqual(44)
    })

    it('should generate different tokens each time (randomness)', () => {
      const token1 = generateSecureToken(32)
      const token2 = generateSecureToken(32)
      const token3 = generateSecureToken(32)

      expect(token1).not.toBe(token2)
      expect(token2).not.toBe(token3)
      expect(token1).not.toBe(token3)
    })

    it('should generate URL-safe tokens (base64url)', () => {
      const token = generateSecureToken(32)

      // Base64url should only contain: A-Z, a-z, 0-9, -, _
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/)

      // Should not contain: +, /, =
      expect(token).not.toContain('+')
      expect(token).not.toContain('/')
      expect(token).not.toContain('=')
    })

    it('should handle different entropy sizes', () => {
      const token16 = generateSecureToken(16) // 128 bits
      const token32 = generateSecureToken(32) // 256 bits
      const token64 = generateSecureToken(64) // 512 bits

      expect(token16.length).toBeLessThan(token32.length)
      expect(token32.length).toBeLessThan(token64.length)
    })

    it('should generate tokens with sufficient entropy', () => {
      const tokens = new Set()
      const count = 1000

      // Generate 1000 tokens
      for (let i = 0; i < count; i++) {
        tokens.add(generateSecureToken(32))
      }

      // All tokens should be unique (no collisions)
      expect(tokens.size).toBe(count)
    })

    it('should handle minimum entropy (1 byte)', () => {
      const token = generateSecureToken(1)

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should handle large entropy (128 bytes)', () => {
      const token = generateSecureToken(128)

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(100)
    })
  })

  describe('Token Uniqueness (Collision Resistance)', () => {
    it('should have no collisions in 10,000 tokens', () => {
      const tokens = new Set()
      const count = 10000

      for (let i = 0; i < count; i++) {
        tokens.add(generateSecureToken(32))
      }

      expect(tokens.size).toBe(count)
    })

    it('should maintain uniqueness across different entropy sizes', () => {
      const allTokens = new Set()

      // Generate tokens with different sizes
      for (let i = 0; i < 100; i++) {
        allTokens.add(generateSecureToken(16))
        allTokens.add(generateSecureToken(32))
        allTokens.add(generateSecureToken(64))
      }

      // 300 unique tokens
      expect(allTokens.size).toBe(300)
    })
  })

  describe('Cryptographic Randomness', () => {
    it('should not produce predictable patterns', () => {
      const tokens = Array.from({ length: 100 }, () => generateSecureToken(32))

      // Check that no two tokens share the same prefix (first 10 chars)
      const prefixes = tokens.map(t => t.substring(0, 10))
      const uniquePrefixes = new Set(prefixes)

      // Should have high diversity (at least 95% unique prefixes)
      expect(uniquePrefixes.size).toBeGreaterThanOrEqual(95)
    })

    it('should have balanced character distribution', () => {
      const token = generateSecureToken(1000) // Large token for statistical analysis

      // Count occurrences of each character type
      const uppercase = (token.match(/[A-Z]/g) || []).length
      const lowercase = (token.match(/[a-z]/g) || []).length
      const digits = (token.match(/[0-9]/g) || []).length
      const special = (token.match(/[-_]/g) || []).length

      const total = token.length

      // Each type should appear (rough statistical check)
      expect(uppercase).toBeGreaterThan(0)
      expect(lowercase).toBeGreaterThan(0)
      expect(digits).toBeGreaterThan(0)

      // No single type should dominate (> 80%)
      expect(uppercase / total).toBeLessThan(0.8)
      expect(lowercase / total).toBeLessThan(0.8)
      expect(digits / total).toBeLessThan(0.8)
    })
  })

  describe('Performance', () => {
    it('should generate tokens quickly (< 10ms each)', () => {
      const iterations = 100
      const start = Date.now()

      for (let i = 0; i < iterations; i++) {
        generateSecureToken(32)
      }

      const elapsed = Date.now() - start
      const avgTime = elapsed / iterations

      expect(avgTime).toBeLessThan(10) // Average < 10ms per token
    })

    it('should handle bulk generation efficiently', () => {
      const start = Date.now()

      // Generate 1000 tokens
      const tokens = Array.from({ length: 1000 }, () => generateSecureToken(32))

      const elapsed = Date.now() - start

      expect(tokens.length).toBe(1000)
      expect(elapsed).toBeLessThan(5000) // < 5 seconds for 1000 tokens
    })
  })
})
