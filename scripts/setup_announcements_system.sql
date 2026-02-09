-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create user preferences table for tracking terms acceptance
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(session_id)
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
CREATE POLICY "Anyone can view active announcements" ON announcements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner')
      AND status = 'active'
    )
  );

-- RLS Policies for user preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_session_id ON user_preferences(session_id);

-- Insert sample announcement
INSERT INTO announcements (title, message, type, is_active, priority) VALUES
('Welcome to Skyline Cheats!', 'We are excited to have you here. Check out our latest products and enjoy premium gaming cheats.', 'info', true, 1)
ON CONFLICT DO NOTHING;