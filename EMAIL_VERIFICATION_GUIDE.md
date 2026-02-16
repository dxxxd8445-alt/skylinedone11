# 📧 Email Verification Guide - Team Invitations

## 🔍 Current Configuration

**Resend API Key:** `re_5BWCUqaS_F9ME2HR5MXF3tm4DfFoRpSUJ`  
**From Email:** `Ring-0 <noreply@ring-0cheats.org>`  
**Domain:** `ring-0cheats.org`

---

## ⚠️ IMPORTANT: Domain Verification Required

Resend requires you to **verify your domain** before you can send emails from `noreply@ring-0cheats.org`.

### Why Domain Verification is Needed:
- Prevents spam and email spoofing
- Improves email deliverability
- Required by email providers (Gmail, Outlook, etc.)
- Ensures emails don't go to spam

---

## 🚀 Option 1: Verify Your Domain (RECOMMENDED)

### Step 1: Add Domain to Resend
1. Go to: https://resend.com/domains
2. Log in with your Resend account
3. Click "Add Domain"
4. Enter: `ring-0cheats.org`
5. Click "Add"

### Step 2: Add DNS Records
Resend will provide you with DNS records to add. You'll need to add these to your domain provider (Cloudflare, GoDaddy, Namecheap, etc.):

**Typical DNS Records:**
```
Type: TXT
Name: _resend
Value: [provided by Resend]

Type: CNAME  
Name: resend._domainkey
Value: [provided by Resend]

Type: MX
Name: @
Value: [provided by Resend]
```

### Step 3: Wait for Verification
- DNS propagation takes 5-60 minutes
- Resend will automatically verify once DNS is updated
- You'll receive a confirmation email

### Step 4: Test Email Sending
Once verified, run the test script:
```bash
node test-team-invitation-email.js
```

---

## 🔧 Option 2: Use Resend Test Email (TEMPORARY)

For immediate testing, you can use Resend's test email address:

### Update .env.local:
```env
RESEND_FROM_EMAIL=Ring-0 <onboarding@resend.dev>
```

**Note:** This only works for sending to your own verified email address in Resend.

---

## 🧪 Test Email Sending

### Method 1: Use Test Script
1. Open `test-team-invitation-email.js`
2. Change `TEST_EMAIL` to your email address
3. Run: `node test-team-invitation-email.js`
4. Check your inbox

### Method 2: Send Real Invitation
1. Go to `/mgmt-x9k2m7/team`
2. Click "Invite Team Member"
3. Enter your own email address
4. Click "Send Invitation"
5. Check your inbox

---

## 📊 Check Email Delivery Status

### Resend Dashboard:
1. Go to: https://resend.com/emails
2. View all sent emails
3. Check delivery status
4. View error messages if any

### What to Look For:
- ✅ **Delivered** - Email sent successfully
- ⏳ **Queued** - Email is being sent
- ❌ **Failed** - Check error message
- 🚫 **Bounced** - Invalid email address

---

## 🐛 Troubleshooting

### Error: "Domain not verified"
**Solution:** Complete domain verification (Option 1 above)

### Error: "Invalid API key"
**Solution:** Check `RESEND_API_KEY` in `.env.local` is correct

### Error: "Rate limit exceeded"
**Solution:** Wait a few minutes, Resend has rate limits

### Email not received
**Possible causes:**
1. Check spam/junk folder
2. Domain not verified
3. Email address typo
4. Email provider blocking

### Email goes to spam
**Solutions:**
1. Verify domain (adds SPF, DKIM records)
2. Use professional sender name
3. Avoid spam trigger words
4. Include unsubscribe link

---

## ✅ Verification Checklist

### Before Sending Invitations:
- [ ] Resend API key configured
- [ ] Domain added to Resend
- [ ] DNS records added to domain provider
- [ ] Domain verified in Resend
- [ ] Test email sent successfully
- [ ] Test email received (not in spam)

### After Domain Verification:
- [ ] Update `RESEND_FROM_EMAIL` if using test email
- [ ] Send test invitation to yourself
- [ ] Verify invitation email received
- [ ] Click invitation link works
- [ ] Accept invitation page loads
- [ ] Can create password and activate account

---

## 📧 Email Template Preview

### Subject:
```
You're invited to join Ring-0 Admin Team
```

### Content:
- Ring-0 logo and branding
- Welcome message
- Username and permissions
- "Accept Invitation" button
- 7-day expiration notice
- Professional footer

---

## 🔒 Security Notes

### Email Security:
- Invitation tokens are UUID v4 (cryptographically secure)
- Tokens expire after 7 days
- One-time use (cleared after acceptance)
- Sent over HTTPS

### Domain Security:
- SPF records prevent email spoofing
- DKIM signs emails for authenticity
- DMARC policy for email validation

---

## 📱 Testing on Different Email Providers

### Gmail:
- Usually delivers to inbox if domain verified
- May go to "Promotions" tab
- Check spam if not in inbox

### Outlook/Hotmail:
- Strict spam filters
- Domain verification essential
- May delay delivery

### Yahoo:
- Similar to Gmail
- Check spam folder
- Domain verification helps

### Custom Domain:
- Depends on email provider
- May have additional spam filters
- Contact IT if issues

---

## 🎯 Quick Test Commands

### Test Email Sending:
```bash
node test-team-invitation-email.js
```

### Check Resend Status:
```bash
curl -X GET https://api.resend.com/emails \
  -H "Authorization: Bearer re_5BWCUqaS_F9ME2HR5MXF3tm4DfFoRpSUJ"
```

### Verify Domain Status:
```bash
curl -X GET https://api.resend.com/domains \
  -H "Authorization: Bearer re_5BWCUqaS_F9ME2HR5MXF3tm4DfFoRpSUJ"
```

---

## 📞 Support

### Resend Support:
- Documentation: https://resend.com/docs
- Support: https://resend.com/support
- Status: https://status.resend.com

### Common Issues:
- Domain verification: https://resend.com/docs/dashboard/domains/introduction
- Email deliverability: https://resend.com/docs/knowledge-base/deliverability
- API errors: https://resend.com/docs/api-reference/errors

---

## 🎉 Success Indicators

You'll know emails are working when:
- ✅ Test script shows "EMAIL SENT SUCCESSFULLY"
- ✅ Email appears in inbox (not spam)
- ✅ Invitation link works
- ✅ Accept page loads correctly
- ✅ Team member can activate account
- ✅ Resend dashboard shows "Delivered"

---

**Created:** February 8, 2026  
**Status:** Ready for verification  
**Next Step:** Verify domain or use test email
