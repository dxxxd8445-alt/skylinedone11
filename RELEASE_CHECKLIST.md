# 🚀 Skyline Release Checklist

## Pre-Release Steps

### 1. Push to GitHub ✅
Run one of these commands in the `magma src` folder:

**PowerShell (Windows):**
```powershell
.\push-to-github.ps1
```

**Bash (Mac/Linux):**
```bash
chmod +x push-to-github.sh
./push-to-github.sh
```

**Manual (if scripts don't work):**
```bash
git add .
git commit -m "feat: Complete crypto payment system with Litecoin & Bitcoin"
git push
```

---

### 2. Run Database Migration ✅
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `ADD_CRYPTO_PAYMENT_COLUMNS.sql`
4. Paste and click "Run"
5. Verify success message appears

---

### 3. Test Crypto Payments ✅
Follow the guide in `TEST_CRYPTO_PAYMENTS.md`:
- [ ] Test checkout webhook
- [ ] Test Litecoin payment
- [ ] Test Bitcoin payment
- [ ] Verify orders show in admin
- [ ] Test manual order completion
- [ ] Verify license generation

---

### 4. Verify Discord Webhooks ✅
- [ ] Checkout started webhook fires
- [ ] Order completed webhook fires
- [ ] All webhook embeds look correct
- [ ] Webhook URL is correct in database

---

### 5. Final Checks ✅
- [ ] All products have correct prices
- [ ] All products have features listed
- [ ] Product images are loading
- [ ] Coupon system works
- [ ] Email system works (test password reset)
- [ ] Admin dashboard accessible
- [ ] Live visitors tracking works

---

## Deployment

### Option 1: Vercel (Recommended)
```bash
# If not already connected
vercel login
vercel link

# Deploy to production
vercel --prod
```

### Option 2: Manual Deploy
1. Push to GitHub (done above)
2. Your hosting platform should auto-deploy
3. Wait for build to complete
4. Verify deployment URL

---

## Post-Deployment Verification

### 1. Test Production Site
- [ ] Visit your production URL
- [ ] Add product to cart
- [ ] Test checkout flow
- [ ] Verify crypto payment modal works
- [ ] Check Discord for webhooks

### 2. Test Admin Dashboard
- [ ] Login to `/mgmt-x9k2m7`
- [ ] Password: `Sk7yL!n3_Adm1n_2026_X9k2M7pQ`
- [ ] Verify all pages load
- [ ] Check orders page
- [ ] Test creating a product

### 3. Monitor for Issues
- [ ] Check browser console for errors
- [ ] Check Vercel/hosting logs
- [ ] Check Supabase logs
- [ ] Monitor Discord for webhook errors

---

## Important URLs

**Production Site:** https://skylinecheats.org
**Admin Dashboard:** https://skylinecheats.org/mgmt-x9k2m7
**Discord Server:** https://discord.gg/skylinecheats

**Crypto Addresses:**
- Litecoin: `LSCp4ChhkBSKH3LesC6NGBbriSdXwrfHuW`
- Bitcoin: `bc1qc4xvjkmdyxn4g42p7ylm57kdplnxnt9m5lqjgm`

---

## Environment Variables (Verify These)

Make sure these are set in your hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://skylinecheats.org
RESEND_API_KEY=re_5BWCUqaS_F9ME2HR5MXF3tm4DfFoRpSUJ
RESEND_FROM_EMAIL=Skyline <noreply@skylinecheats.org>
NEXT_PUBLIC_CLICKY_SITE_ID=101500977
```

---

## Rollback Plan (If Needed)

If something goes wrong:

1. **Revert Git Commit:**
```bash
git revert HEAD
git push
```

2. **Revert Database Changes:**
```sql
-- Remove crypto columns
ALTER TABLE orders DROP COLUMN IF EXISTS crypto_amount;
ALTER TABLE orders DROP COLUMN IF EXISTS crypto_address;

-- Restore old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('moneymotion', 'stripe', 'card'));
```

3. **Redeploy Previous Version:**
```bash
vercel rollback
```

---

## Support Contacts

**Developer:** You
**Hosting:** Vercel/Your Platform
**Database:** Supabase
**Email:** Resend
**Analytics:** Clicky

---

## Success Criteria

✅ Site is live and accessible
✅ All pages load without errors
✅ Crypto payments work end-to-end
✅ Discord webhooks are firing
✅ Admin dashboard is functional
✅ Orders are being created correctly
✅ No console errors
✅ No 404 errors

---

## Post-Launch Monitoring

**First 24 Hours:**
- Monitor Discord for webhook activity
- Check Supabase for new orders
- Watch for any error reports
- Test crypto payments yourself

**First Week:**
- Review order completion rate
- Check for any stuck pending orders
- Monitor customer support tickets
- Verify license delivery is working

---

## 🎉 You're Ready to Launch!

Everything is set up and ready to go. Follow this checklist step by step and you'll have a smooth launch.

Good luck! 🚀
