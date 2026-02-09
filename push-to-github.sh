#!/bin/bash
# Push Skyline Updates to GitHub
# Run this script to commit and push all changes

echo "🚀 Pushing Skyline Updates to GitHub..."
echo ""

# Stage all changes
echo "📦 Staging all changes..."
git add .

# Create commit with detailed message
echo "💾 Creating commit..."
git commit -m "feat: Complete crypto payment system with Litecoin & Bitcoin support

✨ New Features:
- Added Litecoin and Bitcoin payment options
- Crypto orders created with pending status for manual verification
- Checkout webhook triggers when user proceeds to payment
- Improved slide-to-confirm UX (85% threshold, smoother animations)
- Order pending screen with Discord ticket instructions

🔧 Fixes:
- Fixed orders admin page default filter (now shows 'All' instead of 'Completed')
- Fixed pending orders not showing in admin dashboard
- Fixed checkout webhook not firing from cart page
- Fixed crypto payment modal variable scope issues
- Removed 'Continue as Guest' section from login page

📝 Database Changes:
- Added crypto_amount column to orders table
- Added crypto_address column to orders table
- Updated payment_method constraint to include litecoin and bitcoin
- Added indexes for better performance

📄 New Files:
- app/api/crypto-order/route.ts - Creates pending crypto orders
- app/api/trigger-checkout-webhook/route.ts - Triggers checkout webhook
- ADD_CRYPTO_PAYMENT_COLUMNS.sql - Database migration script
- RUN_THIS_FOR_CRYPTO_PAYMENTS.md - Setup instructions
- TEST_CRYPTO_PAYMENTS.md - Testing guide
- CRYPTO_PAYMENTS_COMPLETE.md - Complete documentation

🎨 UI Improvements:
- Smoother crypto payment slider (100ms transitions)
- Better visual feedback with white slider button
- Order pending screen with yellow theme
- Reordered status filter options for better UX

🔐 Security:
- All crypto orders require manual admin verification
- Prevents fraud by requiring proof of payment
- Admin must verify blockchain transaction before completing order

Crypto Addresses:
- Litecoin: LSCp4ChhkBSKH3LesC6NGBbriSdXwrfHuW
- Bitcoin: bc1qc4xvjkmdyxn4g42p7ylm57kdplnxnt9m5lqjgm"

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Run ADD_CRYPTO_PAYMENT_COLUMNS.sql in Supabase"
echo "2. Test crypto payments with TEST_CRYPTO_PAYMENTS.md"
echo "3. Verify Discord webhooks are working"
echo "4. Deploy to production"
echo ""
echo "🎉 Ready for release!"
