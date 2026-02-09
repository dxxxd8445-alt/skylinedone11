/**
 * Test Reviews System
 * Run this to verify reviews are working
 * 
 * Usage: node test-reviews-system.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testReviewsSystem() {
  console.log('🔍 Testing Reviews System...\n');

  // Test 1: Check if reviews table exists
  console.log('1️⃣ Checking if reviews table exists...');
  const { data: tables, error: tablesError } = await supabase
    .from('reviews')
    .select('*')
    .limit(1);

  if (tablesError) {
    console.error('❌ Reviews table error:', tablesError.message);
    console.log('   Run the SQL scripts first!');
    return;
  }
  console.log('✅ Reviews table exists\n');

  // Test 2: Check current reviews count
  console.log('2️⃣ Checking existing reviews...');
  const { data: allReviews, error: countError } = await supabase
    .from('reviews')
    .select('*');

  if (countError) {
    console.error('❌ Error fetching reviews:', countError.message);
    return;
  }

  console.log(`✅ Found ${allReviews.length} reviews in database`);
  if (allReviews.length > 0) {
    console.log('\n📋 Existing reviews:');
    allReviews.forEach((review, i) => {
      console.log(`   ${i + 1}. ${review.username} - ${review.rating}⭐ - ${review.is_approved ? '✅ Approved' : '⏳ Pending'}`);
    });
  }
  console.log('');

  // Test 3: Try to insert a test review
  console.log('3️⃣ Testing review insertion...');
  const testReview = {
    username: 'TestUser_' + Date.now(),
    rating: 5,
    text: 'This is a test review to verify the system works!',
    avatar: 'T',
    verified: true,
    is_approved: false,
    created_at: new Date().toISOString()
  };

  const { data: newReview, error: insertError } = await supabase
    .from('reviews')
    .insert(testReview)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Failed to insert test review:', insertError.message);
    console.log('   Check RLS policies!');
    return;
  }

  console.log('✅ Test review inserted successfully!');
  console.log(`   ID: ${newReview.id}`);
  console.log(`   Username: ${newReview.username}`);
  console.log(`   Status: ${newReview.is_approved ? 'Approved' : 'Pending'}\n`);

  // Test 4: Try to approve the review
  console.log('4️⃣ Testing review approval...');
  const { data: approvedReview, error: approveError } = await supabase
    .from('reviews')
    .update({ is_approved: true })
    .eq('id', newReview.id)
    .select()
    .single();

  if (approveError) {
    console.error('❌ Failed to approve review:', approveError.message);
    return;
  }

  console.log('✅ Review approved successfully!\n');

  // Test 5: Check RLS policies
  console.log('5️⃣ Checking RLS policies...');
  const { data: policies, error: policiesError } = await supabase
    .rpc('pg_policies')
    .select('*')
    .eq('tablename', 'reviews');

  if (!policiesError && policies) {
    console.log(`✅ Found ${policies.length} RLS policies on reviews table\n`);
  }

  // Test 6: Clean up test review
  console.log('6️⃣ Cleaning up test review...');
  const { error: deleteError } = await supabase
    .from('reviews')
    .delete()
    .eq('id', newReview.id);

  if (deleteError) {
    console.error('❌ Failed to delete test review:', deleteError.message);
  } else {
    console.log('✅ Test review deleted\n');
  }

  // Final summary
  console.log('═══════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Total reviews in database: ${allReviews.length}`);
  console.log(`Pending reviews: ${allReviews.filter(r => !r.is_approved).length}`);
  console.log(`Approved reviews: ${allReviews.filter(r => r.is_approved).length}`);
  console.log('');
  console.log('✅ Reviews system is working!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Go to your site and submit a review');
  console.log('2. Check admin panel to approve it');
  console.log('3. Verify it shows on public page after approval');
}

testReviewsSystem().catch(console.error);
