-- ============================================
-- SUPABASE AUTHENTICATION SETUP
-- Run this AFTER the main database setup
-- ============================================

-- Configure Auth settings
UPDATE auth.config SET
  site_url = 'http://localhost:3000',
  jwt_expiry = 3600,
  refresh_token_rotation_enabled = true,
  security_update_password_require_reauthentication = true;

-- Allow signups (you can disable this later if needed)
UPDATE auth.config SET enable_signup = true;

-- Configure email templates (optional)
-- You can customize these in the Supabase dashboard under Authentication > Email Templates

-- Set up custom claims function (for future use)
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Get user role from team_members table
  SELECT role INTO user_role
  FROM public.team_members
  WHERE email = (event->>'email')::text
  AND status = 'active';

  claims := event->'claims';
  
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;

-- Success message
SELECT '✅ Authentication setup complete!' as message;