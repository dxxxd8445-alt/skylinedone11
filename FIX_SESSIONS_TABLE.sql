-- Create a view called "sessions" that points to stripe_sessions
-- This fixes the Supabase auth error

CREATE OR REPLACE VIEW sessions AS
SELECT * FROM stripe_sessions;

-- Grant access to the view
GRANT SELECT ON sessions TO anon, authenticated;
