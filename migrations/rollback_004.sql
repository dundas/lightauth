-- Rollback: Drop password_reset_tokens table and related objects
-- Description: Reverses migration 004_create_reset_tokens.sql
-- Author: DatabaseArchitect
-- Date: 2025-12-11

-- Drop indexes (CASCADE will handle these, but explicit for clarity)
DROP INDEX IF EXISTS idx_password_reset_user_id;
DROP INDEX IF EXISTS idx_password_reset_expires_at;

-- Drop the password_reset_tokens table
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
