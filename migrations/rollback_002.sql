-- Rollback: Drop sessions table and related objects
-- Description: Reverses migration 002_create_sessions_table.sql
-- Author: DatabaseArchitect
-- Date: 2025-12-11

-- Drop indexes (CASCADE will handle these, but explicit for clarity)
DROP INDEX IF EXISTS idx_sessions_user_id;
DROP INDEX IF EXISTS idx_sessions_expires_at;
DROP INDEX IF EXISTS idx_sessions_user_expires;

-- Drop the sessions table
DROP TABLE IF EXISTS sessions CASCADE;
