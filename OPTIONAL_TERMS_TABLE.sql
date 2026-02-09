-- ============================================
-- OPTIONAL: TERMS ACCEPTANCES TABLE
-- ============================================
-- This table tracks when users accept terms and conditions
-- This is OPTIONAL - the site works fine without it
-- ============================================

-- Create terms_acceptances table
CREATE TABLE IF NOT EXISTS terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_user_id ON terms_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_accepted_at ON terms_acceptances(accepted_at DESC);

-- Enable RLS
ALTER TABLE terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for service role" ON terms_acceptances;

-- Create policy that allows service role to do everything
CREATE POLICY "Allow all operations for service role" ON terms_acceptances FOR ALL USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Terms acceptances table created!';
  RAISE NOTICE 'ℹ️  This table is optional - tracks when users accept terms';
END $$;
