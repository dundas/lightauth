-- Rollback: Drop users table and related objects
-- Description: Reverses migration 001_create_users_table.sql
-- Author: DatabaseArchitect
-- Date: 2025-12-11

-- Drop trigger first
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop function used by trigger
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes (CASCADE will handle these, but explicit for clarity)
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_github_id;
DROP INDEX IF EXISTS idx_users_google_id;

-- Drop the users table (CASCADE to drop dependent objects)
DROP TABLE IF EXISTS users CASCADE;

-- Note: This will also drop all sessions, verification tokens, and reset tokens
-- due to ON DELETE CASCADE foreign key constraints in those tables
