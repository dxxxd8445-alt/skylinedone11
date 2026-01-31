const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllCoupons() {
  console.log('🧹 Clearing all coupons from database...\n');

  try {
    // First, show existing coupons
    const { data: existingCoupons, error: loadError } = await supabase
      .from('coupons')
      .select('*');

    if (loadError) {
      console.error('❌ Failed to load coupons:', loadError.message);
      return;
    }

    console.log(`Found ${existingCoupons.length} existing coupons:`);
    existingCoupons.forEach(coupon => {
      console.log(`   - ${coupon.code}: ${coupon.discount_value}% off`);
    });

    if (existingCoupons.length === 0) {
      console.log('✅ No coupons to clear');
      return;
    }

    // Delete all coupons
    const { error: deleteError } = await supabase
      .from('coupons')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using a condition that matches all)

    if (deleteError) {
      console.error('❌ Failed to delete coupons:', deleteError.message);
      return;
    }

    console.log('\n✅ All coupons cleared successfully!');

    // Verify deletion
    const { data: remainingCoupons, error: verifyError } = await supabase
      .from('coupons')
      .select('*');

    if (verifyError) {
      console.error('❌ Failed to verify deletion:', verifyError.message);
      return;
    }

    console.log(`\n📊 Remaining coupons: ${remainingCoupons.length}`);
    console.log('🎯 Database is now clean and ready for testing!');

  } catch (error) {
    console.error('❌ Clear operation failed:', error.message);
  }
}

clearAllCoupons();