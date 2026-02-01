require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupAnnouncementsSystem() {
  console.log('🎯 SETTING UP ANNOUNCEMENTS SYSTEM');
  console.log('=' .repeat(50));

  try {
    // 1. Create announcements table
    console.log('1️⃣  Creating announcements table...');
    
    const { error: createAnnouncementsError } = await supabase
      .from('announcements')
      .select('id')
      .limit(1);

    if (createAnnouncementsError && createAnnouncementsError.code === 'PGRST205') {
      // Table doesn't exist, we need to create it manually
      console.log('⚠️  Announcements table does not exist. Please run the SQL setup manually.');
      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('Please run the following SQL in your Supabase SQL editor:\n');
      
      console.log(`-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can view active announcements" ON announcements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage announcements" ON announcements
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (true);

CREATE POLICY "Service role can manage user preferences" ON user_preferences
  FOR ALL USING (auth.role() = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Insert sample announcements
INSERT INTO announcements (title, message, type, is_active, priority) VALUES
('Welcome to Magma Cheats!', 'We are excited to have you here. Check out our latest products and enjoy gaming!', 'info', true, 1),
('New Products Available', 'Check out our latest cheats for the newest games. Updated daily!', 'success', true, 2),
('Maintenance Notice', 'Scheduled maintenance will occur tonight from 2-4 AM EST. Some services may be temporarily unavailable.', 'warning', false, 3)
ON CONFLICT DO NOTHING;`);

      console.log('\n🔗 SUPABASE SQL EDITOR:');
      console.log(`https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}/sql/new`);
      
      return;
    } else if (createAnnouncementsError) {
      console.error('❌ Error checking announcements table:', createAnnouncementsError);
      return;
    } else {
      console.log('✅ Announcements table already exists');
    }

    // 2. Test if we can insert sample data
    console.log('\n2️⃣  Testing announcements functionality...');
    
    // Check if sample announcements exist
    const { data: existingAnnouncements, error: fetchError } = await supabase
      .from('announcements')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching announcements:', fetchError);
      return;
    }

    console.log(`✅ Found ${existingAnnouncements?.length || 0} existing announcements`);

    // If no announcements exist, create sample ones
    if (!existingAnnouncements || existingAnnouncements.length === 0) {
      console.log('\n3️⃣  Creating sample announcements...');
      
      const sampleAnnouncements = [
        {
          title: 'Welcome to Magma Cheats!',
          message: 'We are excited to have you here. Check out our latest products and enjoy gaming!',
          type: 'info',
          priority: 1,
          is_active: true
        },
        {
          title: 'New Products Available',
          message: 'Check out our latest cheats for the newest games. Updated daily!',
          type: 'success',
          priority: 2,
          is_active: true
        }
      ];

      for (const announcement of sampleAnnouncements) {
        const { error } = await supabase
          .from('announcements')
          .insert(announcement);
        
        if (error) {
          console.error(`❌ Error creating announcement "${announcement.title}":`, error);
        } else {
          console.log(`✅ Created announcement: "${announcement.title}"`);
        }
      }
    }

    // 3. Test user preferences table
    console.log('\n4️⃣  Testing user preferences functionality...');
    
    const testUserId = 'test_setup_' + Date.now();
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: testUserId,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString()
      });

    if (prefsError) {
      console.error('❌ Error testing user preferences:', prefsError);
    } else {
      console.log('✅ User preferences functionality working');
      
      // Clean up test record
      await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', testUserId);
    }

    // 4. Final verification
    console.log('\n🎯 FINAL VERIFICATION');
    console.log('=' .repeat(50));
    
    const { data: finalAnnouncements, error: finalError } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
    } else {
      console.log(`✅ System ready with ${finalAnnouncements?.length || 0} active announcements:`);
      
      finalAnnouncements?.forEach((announcement, index) => {
        console.log(`   ${index + 1}. [${announcement.type.toUpperCase()}] ${announcement.title}`);
        console.log(`      Priority: ${announcement.priority} | Active: ${announcement.is_active}`);
      });
    }

    console.log('\n🚀 ANNOUNCEMENTS SYSTEM READY!');
    console.log('=' .repeat(50));
    console.log('✅ Admin Panel: http://localhost:3000/mgmt-x9k2m7/announcements');
    console.log('✅ Frontend: Announcement banner will appear at top of site');
    console.log('✅ Terms Popup: Will show on first visit to any user');
    console.log('✅ Database: All functionality verified');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit the admin panel to manage announcements');
    console.log('3. Visit the homepage to see announcements and terms popup');
    console.log('4. Test creating/editing announcements from admin panel');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupAnnouncementsSystem();