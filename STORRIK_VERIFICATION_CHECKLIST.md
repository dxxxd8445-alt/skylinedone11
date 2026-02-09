# Storrik Payment - Verification Checklist

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run `ADD_STORRIK_PAYMENT.sql` in Supabase SQL Editor
- [ ] Verify `settings` table has `storrik_api_key` row
- [ ] Verify `orders` table has `payment_method` column

### 2. Admin Dashboard Configuration
- [ ] Go to `/mgmt-x9k2m7/settings`
- [ ] See "Payment Settings" section
- [ ] See "Storrik Public API Key (PK_xxx)" input field
- [ ] Input field is editable (not disabled)
- [ ] Can enter API key
- [ ] Can click "Save Changes"
- [ ] Success message appears after saving

### 3. API Key Verification
- [ ] Get Storrik API key from https://storrik.com/dashboard
- [ ] Key starts with `PK_` (public key)
- [ ] Paste key into admin settings
- [ ] Save successfully
- [ ] Refresh page - key should still be there

### 4. Integration Test Page
- [ ] Go to `/test-storrik`
- [ ] See three status checks:
  - [ ] ✅ Storrik API Key: "Configured: PK_..."
  - [ ] ✅ Storrik Script: "Loaded successfully"
  - [ ] ✅ Integration Status: "Ready to accept payments"
- [ ] All three should show green checkmarks

### 5. Test Checkout Flow
- [ ] On `/test-storrik` page
- [ ] Enter your Storrik Product ID (PROD_xxx)
- [ ] Enter your Storrik Variant ID (VAR_xxx)
- [ ] Click "Open Test Checkout"
- [ ] Storrik modal should open
- [ ] Modal shows your product
- [ ] Can enter card details
- [ ] Can complete test payment

### 6. Webhook Configuration
- [ ] Go to Storrik Dashboard → Webhooks
- [ ] Add webhook URL: `https://your-domain.com/api/webhooks/storrik`
- [ ] Select events:
  - [ ] `checkout.completed`
  - [ ] `payment.succeeded`
- [ ] Save webhook
- [ ] Test webhook (Storrik should have a "Test" button)
- [ ] Check your server logs for webhook received

### 7. End-to-End Test
- [ ] Add product to cart on your site
- [ ] Go to checkout
- [ ] Click "Pay with Card" button
- [ ] Storrik modal opens
- [ ] Complete payment with test card
- [ ] Check database:
  - [ ] Order created with status "completed"
  - [ ] License key generated
- [ ] Check email:
  - [ ] Customer received email with license key
- [ ] Check Discord:
  - [ ] Notification sent (if configured)

### 8. Production Readiness
- [ ] Using production Storrik API key (not test key)
- [ ] Webhook URL is HTTPS
- [ ] Email sending works (Resend configured)
- [ ] Discord webhook works (if using)
- [ ] All environment variables set:
  - [ ] `RESEND_API_KEY`
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `DISCORD_WEBHOOK_URL` (optional)

## 🔍 Troubleshooting Guide

### API Key Not Saving
**Problem**: API key doesn't save or disappears after refresh
**Solution**:
1. Check browser console for errors
2. Verify you have admin permissions
3. Check Supabase logs for database errors
4. Ensure `settings` table exists and has correct structure

### Storrik Script Not Loading
**Problem**: "Storrik Script: Not loaded" on test page
**Solution**:
1. Check browser console for script loading errors
2. Verify `https://cdn.storrik.com/embed.js` is accessible
3. Check if ad blocker is blocking the script
4. Try in incognito mode

### Storrik Not Configured
**Problem**: "Integration Status: Not ready" on test page
**Solution**:
1. Verify API key is saved in admin settings
2. Check browser console for configuration errors
3. Refresh the page
4. Clear browser cache
5. Check `/api/settings/storrik-key` returns your key

### Checkout Modal Not Opening
**Problem**: Clicking "Pay with Card" does nothing
**Solution**:
1. Open browser console and check for errors
2. Verify `window.storrik` exists (type in console)
3. Verify `window.storrik.pay` is a function
4. Check if Product ID and Variant ID are correct
5. Ensure API key is configured

### Webhook Not Firing
**Problem**: Payment completes but no order created
**Solution**:
1. Check Storrik dashboard webhook logs
2. Verify webhook URL is correct and accessible
3. Check your server logs for webhook errors
4. Test webhook manually from Storrik dashboard
5. Ensure webhook endpoint returns 200 status

### Orders Not Creating
**Problem**: Webhook fires but order not in database
**Solution**:
1. Check server logs for database errors
2. Verify `orders` table structure
3. Check Supabase RLS policies
4. Ensure admin client has permissions
5. Check webhook payload format

### Emails Not Sending
**Problem**: Order created but customer doesn't receive email
**Solution**:
1. Verify `RESEND_API_KEY` environment variable
2. Check Resend dashboard for delivery status
3. Verify sender email is verified in Resend
4. Check spam folder
5. Check server logs for email errors

## 📊 Success Criteria

Your Storrik integration is working correctly when:

✅ Admin can configure API key in settings
✅ Test page shows all green checkmarks
✅ Checkout modal opens when clicking "Pay with Card"
✅ Test payment completes successfully
✅ Order appears in database with status "completed"
✅ License key is generated
✅ Customer receives email with license key
✅ Discord notification sent (if configured)
✅ Webhook logs show successful processing

## 🎯 Next Steps After Verification

Once all checks pass:

1. ✅ Remove test page from production (optional)
2. ✅ Switch to production Storrik API key
3. ✅ Test with real card (small amount)
4. ✅ Monitor first few real transactions
5. ✅ Set up monitoring/alerts for webhook failures
6. ✅ Document your product ID mappings
7. ✅ Train support team on new payment flow

## 📞 Support Resources

- **Test Page**: `/test-storrik`
- **Admin Settings**: `/mgmt-x9k2m7/settings`
- **Storrik Docs**: https://docs.storrik.com
- **Storrik Dashboard**: https://storrik.com/dashboard
- **Webhook Logs**: Check Storrik dashboard
- **Server Logs**: Check Vercel/hosting logs

---

**Last Updated**: February 9, 2026
**Integration Status**: Ready for Testing
