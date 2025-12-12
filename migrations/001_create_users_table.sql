-- Migration: Create users table
-- Description: Core users table with email/password and OAuth support
-- Author: DatabaseArchitect
-- Date: 2025-12-11

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (idempotent)
CREATE TABLE IF NOT EXISTS users (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email authentication
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash TEXT,  -- NULL for OAuth-only users

  -- OAuth providers
  github_id TEXT UNIQUE,
  google_id TEXT UNIQUE,

  -- User profile metadata
  name TEXT,
  avatar_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Partial indexes for OAuth IDs (only index non-null values)
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

-- Add updated_at trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- Add constraints for data integrity
DO $$
BEGIN
  -- Ensure at least one authentication method exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_auth_method_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_auth_method_check
      CHECK (
        password_hash IS NOT NULL OR
        github_id IS NOT NULL OR
        google_id IS NOT NULL
      );
  END IF;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE users IS 'Core users table with support for email/password and OAuth authentication';
COMMENT ON COLUMN users.id IS 'Primary key - UUID generated automatically';
COMMENT ON COLUMN users.email IS 'User email address - unique and required';
COMMENT ON COLUMN users.email_verified IS 'Whether the email has been verified';
COMMENT ON COLUMN users.password_hash IS 'Argon2id hashed password - NULL for OAuth-only users';
COMMENT ON COLUMN users.github_id IS 'GitHub OAuth user ID - unique when set';
COMMENT ON COLUMN users.google_id IS 'Google OAuth user ID - unique when set';
COMMENT ON COLUMN users.name IS 'User display name';
COMMENT ON COLUMN users.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN users.created_at IS 'Timestamp when user was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when user was last updated - auto-updated via trigger';
