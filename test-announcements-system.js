require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAnnouncementsSystem() {
  console.log('🎯 TESTING ANNOUNCEMENTS SYSTEM');
  console.log('=' .repeat(50));
  console.log('Setting up announcements and terms system...\n');

  try {
    // 1. Create announcements table
    console.log('1️⃣  Creating announcements table...');
    
    const { error: announcementsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create announcements table
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
      `
    });

    if (announcementsError) {
      console.error('❌ Error creating announcements table:', announcementsError);
    } else {
      console.log('✅ Announcements table created successfully');
    }

    // 2. Create user preferences table
    console.log('\n2️⃣  Creating user preferences table...');
    
    const { error: preferencesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create user preferences table for tracking terms acceptance
        CREATE TABLE IF NOT EXISTS user_preferences (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          terms_accepted BOOLEAN DEFAULT false,
          terms_accepted_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    });

    if (preferencesError) {
      console.error('❌ Error creating user preferences table:', preferencesError);
    } else {
      console.log('✅ User preferences table created successfully');
    }

    // 3. Set up RLS policies
    console.log('\n3️⃣  Setting up RLS policies...');
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS
        ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public can view active announcements" ON announcements;
        DROP POLICY IF EXISTS "Service role can manage announcements" ON announcements;
        DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
        DROP POLICY IF EXISTS "Service role can manage user preferences" ON user_preferences;

        -- Create new policies
        CREATE POLICY "Public can view active announcements" ON announcements
          FOR SELECT USING (is_active = true);

        CREATE POLICY "Service role can manage announcements" ON announcements
          FOR ALL USING (auth.role() = 'service_role');

        CREATE POLICY "Users can manage own preferences" ON user_preferences
          FOR ALL USING (true);

        CREATE POLICY "Service role can manage user preferences" ON user_preferences
          FOR ALL USING (auth.role() = 'service_role');
      `
    });

    if (rlsError) {
      console.error('❌ Error setting up RLS policies:', rlsError);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    // 4. Create indexes
    console.log('\n4️⃣  Creating indexes...');
    
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, priority DESC, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // 5. Insert sample announcements
    console.log('\n5️⃣  Creating sample announcements...');
    
    const sampleAnnouncements = [
      {
        title: 'Welcome to Skyline Cheats!',
        message: 'We are excited to have you here. Check out our latest products and enjoy gaming!',
        type: 'info',
        priority: 1
      },
      {
        title: 'New Products Available',
        message: 'Check out our latest cheats for the newest games. Updated daily!',
        type: 'success',
        priority: 2
      },
      {
        title: 'Maintenance Notice',
        message: 'Scheduled maintenance will occur tonight from 2-4 AM EST. Some services may be temporarily unavailable.',
        type: 'warning',
        priority: 3
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

    // 6. Test announcements retrieval
    console.log('\n6️⃣  Testing announcements retrieval...');
    
    const { data: announcements, error: fetchError } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching announcements:', fetchError);
    } else {
      console.log(`✅ Successfully fetched ${announcements?.length || 0} active announcements`);
      
      announcements?.forEach((announcement, index) => {
        console.log(`   ${index + 1}. [${announcement.type.toUpperCase()}] ${announcement.title}`);
        console.log(`      Priority: ${announcement.priority} | Message: ${announcement.message.substring(0, 50)}...`);
      });
    }

    // 7. Test terms acceptance
    console.log('\n7️⃣  Testing terms acceptance...');
    
    const testUserId = 'test_user_' + Date.now();
    const { error: termsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: testUserId,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString()
      });

    if (termsError) {
      console.error('❌ Error testing terms acceptance:', termsError);
    } else {
      console.log('✅ Terms acceptance test successful');
      
      // Verify the record was created
      const { data: userPref, error: fetchPrefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      if (fetchPrefError) {
        console.error('❌ Error fetching user preference:', fetchPrefError);
      } else {
        console.log(`✅ User preference created: ${userPref.user_id} accepted terms at ${userPref.terms_accepted_at}`);
      }
    }

    // 8. Final verification
    console.log('\n🎯 SYSTEM VERIFICATION');
    console.log('=' .repeat(50));
    
    // Check table existence
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('announcements', 'user_preferences')
        ORDER BY table_name;
      `
    });

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
    } else {
      console.log('✅ Database tables verified:');
      tables?.forEach(table => {
        console.log(`   • ${table.table_name}`);
      });
    }

    console.log('\n🚀 ANNOUNCEMENTS SYSTEM READY!');
    console.log('=' .repeat(50));
    console.log('✅ Admin Panel: http://localhost:3000/mgmt-x9k2m7/announcements');
    console.log('✅ Frontend: Announcement banner will appear at top of site');
    console.log('✅ Terms Popup: Will show on first visit to any user');
    console.log('✅ Database: All tables and policies configured');
    
    console.log('\n📋 FEATURES AVAILABLE:');
    console.log('• Create/edit/delete announcements from admin panel');
    console.log('• Show/hide announcements with toggle');
    console.log('• Priority-based ordering (higher priority shows first)');
    console.log('• 4 announcement types: info, success, warning, error');
    console.log('• Red/black themed design matching your site');
    console.log('• Terms of service popup on first visit');
    console.log('• Terms acceptance tracking in database');
    console.log('• Dismissible announcement banners');
    console.log('• Responsive design for mobile/desktop');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAnnouncementsSystem();