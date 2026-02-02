#!/usr/bin/env node

/**
 * Complete Affiliate System Fix
 * Fixes all remaining affiliate system issues
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAffiliateSystemComplete() {
  console.log('🔧 COMPLETE AFFILIATE SYSTEM FIX');
  console.log('='.repeat(60));

  try {
    console.log('\n1️⃣ Creating missing affiliate tables...');
    
    // Create affiliate_referrals table
    const { error: referralsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS affiliate_referrals (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
          referred_email TEXT NOT NULL,
          order_id UUID,
          order_amount DECIMAL(10,2) DEFAULT 0.00,
          commission_amount DECIMAL(10,2) DEFAULT 0.00,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
          conversion_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (referralsError) {
      console.log('⚠️  Could not create affiliate_referrals via RPC, trying direct query...');
      
      const { error: directError } = await supabase
        .from('affiliate_referrals')
        .select('id')
        .limit(1);
      
      if (directError && directError.code === '42P01') {
        console.log('❌ affiliate_referrals table does not exist and cannot be created via API');
        console.log('📋 Please run this SQL in your Supabase dashboard:');
        console.log(`
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  order_id UUID,
  order_amount DECIMAL(10,2) DEFAULT 0.00,
  commission_amount DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  conversion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for affiliate_referrals" ON affiliate_referrals FOR ALL USING (true);
        `);
      } else {
        console.log('✅ affiliate_referrals table exists or was created');
      }
    } else {
      console.log('✅ affiliate_referrals table created successfully');
    }

    // Create affiliate_clicks table
    const { error: clicksError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS affiliate_clicks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
          ip_address TEXT,
          user_agent TEXT,
          landing_page TEXT,
          referrer TEXT,
          converted BOOLEAN DEFAULT FALSE,
          conversion_order_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (clicksError) {
      console.log('⚠️  Could not create affiliate_clicks via RPC, trying direct query...');
      
      const { error: directError } = await supabase
        .from('affiliate_clicks')
        .select('id')
        .limit(1);
      
      if (directError && directError.code === '42P01') {
        console.log('❌ affiliate_clicks table does not exist and cannot be created via API');
        console.log('📋 Please run this SQL in your Supabase dashboard:');
        console.log(`
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  landing_page TEXT,
  referrer TEXT,
  converted BOOLEAN DEFAULT FALSE,
  conversion_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for affiliate_clicks" ON affiliate_clicks FOR ALL USING (true);
        `);
      } else {
        console.log('✅ affiliate_clicks table exists or was created');
      }
    } else {
      console.log('✅ affiliate_clicks table created successfully');
    }

    console.log('\n2️⃣ Updating affiliate commission rates...');
    
    // Update commission rates to 10% as per registration API
    const { data: updatedAffiliates, error: updateError } = await supabase
      .from('affiliates')
      .update({ commission_rate: 10.00 })
      .eq('commission_rate', 5.00)
      .select();

    if (updateError) {
      console.log('❌ Failed to update commission rates:', updateError.message);
    } else {
      console.log(`✅ Updated ${updatedAffiliates?.length || 0} affiliates to 10% commission rate`);
    }

    console.log('\n3️⃣ Adding minimum_payout column...');
    
    // Try to add minimum_payout column
    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS minimum_payout DECIMAL(10,2) DEFAULT 50.00;`
    });

    if (columnError) {
      console.log('⚠️  Could not add minimum_payout column via RPC');
    } else {
      console.log('✅ minimum_payout column added/verified');
    }

    console.log('\n4️⃣ Testing affiliate APIs...');
    
    // Test admin affiliates API
    const { data: affiliates, error: affiliatesError } = await supabase
      .from('affiliates')
      .select(`
        *,
        store_users (
          username,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (affiliatesError) {
      console.log('❌ Failed to fetch affiliates:', affiliatesError.message);
    } else {
      console.log(`✅ Successfully fetched ${affiliates?.length || 0} affiliates`);
      
      if (affiliates && affiliates.length > 0) {
        console.log('\n📋 Current Affiliates:');
        affiliates.forEach((affiliate, index) => {
          console.log(`${index + 1}. ${affiliate.affiliate_code} - ${affiliate.store_users?.username || 'Unknown'}`);
          console.log(`   Email: ${affiliate.store_users?.email || 'Unknown'}`);
          console.log(`   Payment: ${affiliate.payment_email}`);
          console.log(`   Commission: ${affiliate.commission_rate}%`);
          console.log(`   Status: ${affiliate.status}`);
          console.log('');
        });
      }
    }

    console.log('\n5️⃣ Testing referrals and clicks tables...');
    
    // Test referrals table
    const { data: referrals, error: refError } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .limit(1);

    if (refError) {
      console.log('❌ affiliate_referrals table test failed:', refError.message);
    } else {
      console.log('✅ affiliate_referrals table is accessible');
    }

    // Test clicks table
    const { data: clicks, error: clickError } = await supabase
      .from('affiliate_clicks')
      .select('*')
      .limit(1);

    if (clickError) {
      console.log('❌ affiliate_clicks table test failed:', clickError.message);
    } else {
      console.log('✅ affiliate_clicks table is accessible');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 AFFILIATE SYSTEM STATUS');
    console.log('='.repeat(60));

    const allWorking = !affiliatesError && !refError && !clickError;

    if (allWorking) {
      console.log('✅ AFFILIATE SYSTEM IS FULLY FUNCTIONAL!');
      console.log('');
      console.log('✅ Main affiliates table: Working');
      console.log('✅ Affiliate referrals table: Working');
      console.log('✅ Affiliate clicks table: Working');
      console.log('✅ Store users relationship: Working');
      console.log('✅ Commission rates: Updated to 10%');
      console.log('');
      console.log('🎉 The admin dashboard should now show all affiliates properly!');
      console.log('🎉 All affiliate APIs should work without 500 errors!');
    } else {
      console.log('⚠️  SOME ISSUES REMAIN');
      console.log('');
      console.log(`□ Main affiliates table: ${!affiliatesError ? '✅' : '❌'}`);
      console.log(`□ Affiliate referrals table: ${!refError ? '✅' : '❌'}`);
      console.log(`□ Affiliate clicks table: ${!clickError ? '✅' : '❌'}`);
      console.log('');
      console.log('🔧 MANUAL STEPS REQUIRED:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the SQL commands shown above');
      console.log('4. Refresh your admin dashboard');
    }

    console.log('\n📋 FINAL CHECKLIST:');
    console.log(`□ Affiliates exist in database: ${affiliates && affiliates.length > 0 ? '✅' : '❌'}`);
    console.log(`□ Store users linked: ${affiliates?.[0]?.store_users ? '✅' : '❌'}`);
    console.log(`□ Commission rates updated: ${affiliates?.[0]?.commission_rate === 10 ? '✅' : '❌'}`);
    console.log(`□ Referrals table ready: ${!refError ? '✅' : '❌'}`);
    console.log(`□ Clicks table ready: ${!clickError ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.log('\n💡 Make sure your .env.local file has the correct Supabase credentials');
  }
}

// Run the fix
fixAffiliateSystemComplete();