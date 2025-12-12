/**
 * Input Validation Tests
 *
 * Tests for email and password validation functions.
 */

import { describe, it, expect } from 'vitest'
import { isValidEmail, validatePassword, normalizeEmail } from '../utils.js'

describe('Email Validation', () => {
  describe('isValidEmail()', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@company.co.uk',
        'test+tag@domain.org',
        'user_name@sub.domain.com',
        '123@numbers.com',
        'a@b.c',
      ]

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true)
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'not-an-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example',
        'user name@example.com',
        'user@exam ple.com',
      ]

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false)
      })
    })

    it('should handle edge cases', () => {
      expect(isValidEmail('a@b.co')).toBe(true) // Shortest valid email
      expect(isValidEmail('very.long.email.address@very.long.domain.name.com')).toBe(true)
    })
  })

  describe('normalizeEmail()', () => {
    it('should convert email to lowercase', () => {
      expect(normalizeEmail('User@Example.COM')).toBe('user@example.com')
      expect(normalizeEmail('ADMIN@SITE.ORG')).toBe('admin@site.org')
    })

    it('should trim whitespace', () => {
      expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com')
      expect(normalizeEmail('\tuser@example.com\n')).toBe('user@example.com')
    })

    it('should handle already normalized emails', () => {
      expect(normalizeEmail('user@example.com')).toBe('user@example.com')
    })
  })
})

describe('Password Validation', () => {
  describe('validatePassword()', () => {
    it('should accept valid passwords (8+ characters)', () => {
      const validPasswords = [
        'Password123',
        'MySecurePass!',
        'abcdefgh',
        '12345678',
        '!@#$%^&*',
      ]

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBeNull()
      })
    })

    it('should reject passwords shorter than 8 characters', () => {
      const shortPasswords = [
        '',
        'a',
        'ab',
        'abc',
        'abcd',
        'abcde',
        'abcdef',
        'abcdefg', // 7 characters
      ]

      shortPasswords.forEach(password => {
        const error = validatePassword(password)
        expect(error).not.toBeNull()
        expect(error).toContain('8 characters')
      })
    })

    it('should accept custom minimum length', () => {
      expect(validatePassword('short', 12)).not.toBeNull() // Fails 12-char minimum
      expect(validatePassword('verylongpass', 12)).toBeNull() // Passes 12-char minimum
    })

    it('should handle edge cases', () => {
      expect(validatePassword('12345678')).toBeNull() // Exactly 8 characters
      expect(validatePassword('a'.repeat(100))).toBeNull() // Very long password
    })

    it('should accept passwords with special characters', () => {
      expect(validatePassword('Pass@123!')).toBeNull()
      expect(validatePassword('Test#$%^&*()')).toBeNull()
    })

    it('should accept passwords with unicode', () => {
      expect(validatePassword('密码123456')).toBeNull()
      expect(validatePassword('パスワード123')).toBeNull()
    })
  })
})
