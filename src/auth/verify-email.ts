/**
 * Email Verification
 *
 * Handles email verification flow:
 * - Token validation and expiration checking
 * - Marking user's email as verified
 * - Token cleanup after use
 * - Resending verification emails
 */

import type { Kysely } from 'kysely'
import type { Database, NewEmailVerificationToken } from '../database/schema.js'
import { generateSecureToken, createAuthError, normalizeEmail } from './utils.js'
import { isValidEmailVerificationToken } from '../database/schema.js'

/**
 * Email verification token expiration (24 hours)
 */
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

/**
 * Verify user's email address using a verification token
 *
 * Validates the token, checks expiration, and marks the user's email as verified.
 * The token is deleted after successful verification.
 *
 * @param db - Kysely database instance
 * @param token - Email verification token
 * @returns Verification result with user ID if successful
 * @throws {AuthError} If token is invalid or expired
 *
 * @example
 * ```ts
 * const result = await verifyEmail(db, 'abc123...')
 * if (result.success) {
 *   console.log('Email verified for user:', result.userId)
 * }
 * ```
 */
export async function verifyEmail(
  db: Kysely<Database>,
  token: string
): Promise<{ success: boolean; userId?: string }> {
  if (!token || token.trim() === '') {
    throw createAuthError('Verification token is required', 'INVALID_TOKEN', 400)
  }

  // Look up token in database
  const tokenRecord = await db
    .selectFrom('email_verification_tokens')
    .selectAll()
    .where('token', '=', token)
    .executeTakeFirst()

  if (!tokenRecord) {
    throw createAuthError('Invalid verification token', 'INVALID_TOKEN', 400)
  }

  // Check if token is expired
  if (!isValidEmailVerificationToken(tokenRecord)) {
    // Delete expired token
    await db.deleteFrom('email_verification_tokens').where('token', '=', token).execute()
    throw createAuthError('Verification token has expired', 'TOKEN_EXPIRED', 400)
  }

  // Mark user's email as verified
  await db
    .updateTable('users')
    .set({ email_verified: true })
    .where('id', '=', tokenRecord.user_id)
    .execute()

  // Delete used verification token
  await db.deleteFrom('email_verification_tokens').where('token', '=', token).execute()

  return {
    success: true,
    userId: tokenRecord.user_id,
  }
}

/**
 * Resend verification email
 *
 * Generates a new verification token for the user with the given email.
 * Deletes any existing tokens for that user before creating a new one.
 *
 * @param db - Kysely database instance
 * @param email - User's email address
 * @returns New verification token
 * @throws {AuthError} If user not found or email already verified
 *
 * @example
 * ```ts
 * const { token } = await resendVerificationEmail(db, 'user@example.com')
 * // Send token to user via email
 * ```
 */
export async function resendVerificationEmail(
  db: Kysely<Database>,
  email: string
): Promise<{ token: string }> {
  const normalizedEmail = normalizeEmail(email)

  // Look up user by email
  const user = await db
    .selectFrom('users')
    .select(['id', 'email', 'email_verified'])
    .where('email', '=', normalizedEmail)
    .executeTakeFirst()

  if (!user) {
    // Don't reveal whether email exists (security)
    throw createAuthError('If this email exists, a verification link will be sent', 'EMAIL_SENT', 200)
  }

  if (user.email_verified) {
    throw createAuthError('Email is already verified', 'ALREADY_VERIFIED', 400)
  }

  // Delete any existing verification tokens for this user
  await db.deleteFrom('email_verification_tokens').where('user_id', '=', user.id).execute()

  // Generate new verification token
  const verificationToken = generateSecureToken(32) // 256 bits of entropy
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY)

  const newToken: NewEmailVerificationToken = {
    token: verificationToken,
    user_id: user.id,
    email: normalizedEmail,
    expires_at: expiresAt,
  }

  await db.insertInto('email_verification_tokens').values(newToken).execute()

  return {
    token: verificationToken,
  }
}

/**
 * Clean up expired verification tokens
 *
 * Removes all expired email verification tokens from the database.
 * This should be run periodically as a background job.
 *
 * @param db - Kysely database instance
 * @returns Number of tokens deleted
 *
 * @example
 * ```ts
 * const deleted = await cleanupExpiredVerificationTokens(db)
 * console.log(`Cleaned up ${deleted} expired verification tokens`)
 * ```
 */
export async function cleanupExpiredVerificationTokens(db: Kysely<Database>): Promise<number> {
  const result = await db
    .deleteFrom('email_verification_tokens')
    .where('expires_at', '<=', new Date())
    .executeTakeFirst()

  return Number(result.numDeletedRows ?? 0)
}
