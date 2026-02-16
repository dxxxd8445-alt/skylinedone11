/**
 * TEST TEAM INVITATION EMAIL
 * This script tests if team invitation emails are being sent correctly
 * 
 * Run with: node test-team-invitation-email.js
 */

const RESEND_API_KEY = 're_5BWCUqaS_F9ME2HR5MXF3tm4DfFoRpSUJ';
const FROM_EMAIL = 'Ring-0 <noreply@ring-0cheats.org>';
const TEST_EMAIL = 'your-email@example.com'; // CHANGE THIS TO YOUR EMAIL

// Test invitation email HTML
function createTestInviteEmail() {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;width:60px;height:60px;background:linear-gradient(135deg,#6b7280 0%,#9ca3af 100%);border-radius:16px;margin-bottom:20px;line-height:60px;color:white;font-size:32px;">🔥</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">Welcome to Ring-0</h1>
    </div>
    <div style="background:#111;border:1px solid #262626;border-radius:16px;padding:40px;">
      <h2 style="color:#fff;margin:0 0 20px;font-size:20px;">Hi Test User,</h2>
      <p style="color:#a3a3a3;line-height:1.6;margin:0 0 20px;">This is a test email to verify that team invitations are working correctly.</p>
      <p style="color:#a3a3a3;line-height:1.6;margin:0 0 8px;"><strong style="color:#fff;">Username:</strong> test_user</p>
      <p style="color:#a3a3a3;line-height:1.6;margin:0 0 24px;"><strong style="color:#fff;">Permissions:</strong> Dashboard, Manage Products</p>
      <p style="color:#a3a3a3;line-height:1.6;margin:0 0 30px;">If you received this email, team invitations are working!</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://ring-0cheats.org/staff/accept-invite?token=test123" style="display:inline-block;background:linear-gradient(135deg,#6b7280 0%,#9ca3af 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:10px;font-weight:600;font-size:16px;">Test Invitation Link</a>
      </div>
      <p style="color:#737373;font-size:14px;margin:20px 0 0;">This is a test email. The invitation link is not real.</p>
    </div>
    <p style="text-align:center;color:#525252;font-size:12px;margin:20px 0 0;">© ${new Date().getFullYear()} Ring-0. All rights reserved.</p>
  </div>
</body>
</html>`.trim();
}

async function testEmail() {
  console.log('🧪 Testing Team Invitation Email...\n');
  console.log('📧 From:', FROM_EMAIL);
  console.log('📧 To:', TEST_EMAIL);
  console.log('🔑 API Key:', RESEND_API_KEY.substring(0, 10) + '...\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TEST_EMAIL],
        subject: 'TEST: Team Invitation Email',
        html: createTestInviteEmail(),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ EMAIL SENT SUCCESSFULLY!');
      console.log('📬 Email ID:', data.id);
      console.log('\n✅ Team invitation emails are working!');
      console.log('📧 Check your inbox:', TEST_EMAIL);
      console.log('\n💡 If you don\'t see it, check your spam folder.');
    } else {
      console.log('❌ EMAIL FAILED TO SEND');
      console.log('Error:', JSON.stringify(data, null, 2));
      
      if (data.message && data.message.includes('domain')) {
        console.log('\n⚠️  DOMAIN VERIFICATION REQUIRED');
        console.log('Your domain "ring-0cheats.org" needs to be verified in Resend.');
        console.log('\n📋 Steps to fix:');
        console.log('1. Go to: https://resend.com/domains');
        console.log('2. Add domain: ring-0cheats.org');
        console.log('3. Add DNS records to your domain provider');
        console.log('4. Wait for verification (usually 5-10 minutes)');
        console.log('\n💡 OR use a verified email address for testing:');
        console.log('   Change FROM_EMAIL to your verified email in Resend');
      }
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

// Run the test
testEmail();
