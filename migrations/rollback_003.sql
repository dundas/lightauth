-- Rollback: Drop email_verification_tokens table and related objects
-- Description: Reverses migration 003_create_verification_tokens.sql
-- Author: DatabaseArchitect
-- Date: 2025-12-11

-- Drop indexes (CASCADE will handle these, but explicit for clarity)
DROP INDEX IF EXISTS idx_email_verification_user_id;
DROP INDEX IF EXISTS idx_email_verification_expires_at;

-- Drop the email_verification_tokens table
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
