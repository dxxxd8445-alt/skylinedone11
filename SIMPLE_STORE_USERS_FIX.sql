-- Simple Store Users Table Creation
-- Copy and paste this entire script into your Supabase SQL Editor

CREATE TABLE store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  password_reset_token TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_store_users_email ON store_users(email);
CREATE INDEX idx_store_users_username ON store_users(username);
CREATE INDEX idx_store_users_created_at ON store_users(created_at DESC);

ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access" ON store_users FOR ALL USING (auth.role() = 'service_role');