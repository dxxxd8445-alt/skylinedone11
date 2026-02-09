# 🔐 Crypto Payment Setup Instructions

## What This Does
Adds support for Litecoin and Bitcoin payments to your store. Crypto orders will be created with **"pending"** status and require manual verification by admin.

## Step 1: Run the SQL Script

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Open the file: `ADD_CRYPTO_PAYMENT_COLUMNS.sql`
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **Run** button

## What Gets Added

### New Columns in `orders` table:
- `crypto_amount` - Amount of cryptocurrency sent (LTC or BTC)
- `crypto_address` - Crypto address where payment was sent

### Updated Payment Methods:
- `litecoin` - Litecoin payments
- `bitcoin` - Bitcoin payments

## How It Works

### Customer Flow:
1. Customer adds items to cart
2. Clicks "Proceed to Purchase"
3. Enters email and clicks "Apply"
4. Clicks "Complete Secure Payment"
5. Selects Litecoin or Bitcoin
6. Sees crypto amount and address
7. Slides to confirm payment sent
8. Gets order ID with "pending" status
9. Instructed to create Discord ticket with proof

### Admin Flow:
1. Go to `/mgmt-x9k2m7/orders`
2. See crypto orders with **"pending"** status
3. Customer creates Discord ticket with:
   - Order ID
   - Proof of purchase (transaction screenshot)
4. Admin verifies payment on blockchain
5. Admin manually changes status to **"completed"**
6. System generates license key
7. Admin sends license key to customer

## Crypto Addresses

**Litecoin:** `LSCp4ChhkBSKH3LesC6NGBbriSdXwrfHuW`
**Bitcoin:** `bc1qc4xvjkmdyxn4g42p7ylm57kdplnxnt9m5lqjgm`

## Testing

1. Add a product to cart
2. Go through checkout
3. Select Litecoin or Bitcoin
4. Complete the slide confirmation
5. Check admin orders page - should show as "pending"
6. Manually mark as completed to test license generation

## Important Notes

⚠️ **Crypto orders NEVER auto-complete** - they always require manual verification
✅ **This prevents fraud** - you verify payment before delivering goods
📝 **Keep transaction records** - save proof of payment from customers
🔍 **Verify on blockchain** - always check the actual transaction before completing order

## Support

If you have issues:
1. Check browser console for errors
2. Check Supabase logs
3. Verify SQL script ran successfully
4. Make sure all columns were added
