# License System - Quick Start Guide

## 🚀 How to Stock License Keys

### Step-by-Step Instructions

#### 1. Go to Admin Dashboard
- Navigate to: Admin Dashboard → License Keys

#### 2. Click "Stock Keys" Button
- Located in the top right corner
- Opens the stock modal

#### 3. Step 1: Select Game
- Choose which game to stock keys for
- Examples: Valorant, CS:GO, Fortnite, etc.
- All 19 games available

#### 4. Step 2: Select Duration (Optional)
- Choose the specific duration/variant
- Examples: 1 Week, 1 Month, 3 Months, etc.
- If you want general stock, skip this step

#### 5. Step 3: Enter License Keys
- Paste your license keys
- One key per line
- Any format accepted
- System shows count of keys ready to add

#### 6. Click "Add to Stock"
- Keys are added to inventory
- Success message appears
- Stock counts update automatically

---

## 📊 Stock Types Explained

### General Stock
- Works for any product/game
- Used when no specific game is selected
- Fallback option if product-specific stock unavailable

### Product-Specific Stock
- Works for one specific game only
- Selected in Step 1
- Skipped Step 2 (no variant selected)

### Variant-Specific Stock
- Works for specific game + duration
- Selected in Step 1 and Step 2
- Most specific type of stock

---

## 👥 Customer Experience

### How Customers Get Keys

1. **Customer makes purchase**
   - Adds product to cart
   - Completes checkout

2. **Payment processed**
   - Stripe processes payment
   - Webhook fires automatically

3. **Key assigned**
   - System finds available key from stock
   - Key assigned to customer email
   - Email sent with key

4. **Customer receives key**
   - Email arrives with license key
   - Key appears in Account → Delivered tab
   - Customer can copy key to clipboard

### Customer Dashboard

**Delivered Tab Shows:**
- Product name
- License key (with copy button)
- Status (active, expired, etc.)
- Expiration date
- Download link to support

---

## 📈 Admin Analytics

### Stock Summary Shows

**Overall Stats:**
- Total keys in stock
- General stock count
- Product-specific count
- Variant-specific count

**By Product:**
- Each game's total stock
- Breakdown by variant/duration
- Stock count per variant

### How to View Summary
1. Go to License Keys page
2. Look at quick stats at top
3. Or click "Stock Summary" button for detailed view

---

## 🔍 Managing Stock

### View All Keys
- License Keys page shows all stocked keys
- Search by key name
- See product, type, and date added

### Delete Keys
- Click trash icon next to key
- Key removed from stock
- Use when key is used/sold

### Copy Key
- Hover over key in table
- Click copy icon
- Key copied to clipboard

---

## ⚠️ Important Notes

### Key Assignment Priority
When customer purchases, system looks for keys in this order:
1. Exact variant match (product + duration)
2. Product-only match (any duration)
3. General stock (any product)

### Email Delivery
- Email sent automatically on purchase
- Contains all license keys
- If email fails, order still completes
- Customer can view key in dashboard

### Stock Levels
- Monitor stock regularly
- Add more keys when running low
- Use stock summary for overview
- Set reminders for reordering

### Bulk Import
- Paste multiple keys at once
- One key per line
- System handles duplicates
- Invalid formats skipped

---

## 🎯 Best Practices

### Stocking Strategy
1. Stock general keys for flexibility
2. Stock product-specific for popular games
3. Stock variant-specific for premium durations
4. Keep 20-30% buffer stock

### Monitoring
- Check stock daily
- Monitor by-product breakdown
- Alert when stock < 10 keys
- Reorder before running out

### Customer Support
- Keys appear in dashboard immediately
- Email sent within seconds
- Copy button for easy access
- Discord link for support

---

## 🆘 Troubleshooting

### Keys Not Appearing
- Check customer email for delivery
- Verify key was stocked correctly
- Check order status (should be "completed")
- Contact support if issue persists

### Stock Count Wrong
- Refresh page to update
- Check if keys were deleted
- Verify product/variant selection
- Check database directly if needed

### Customer Can't Copy Key
- Try different browser
- Check if JavaScript enabled
- Verify key format is correct
- Contact support if issue persists

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review stock summary
3. Check customer email
4. Contact admin support

---

## ✅ Checklist

Before going live:
- ✅ Stock at least 50 keys
- ✅ Test purchase flow
- ✅ Verify email delivery
- ✅ Check customer dashboard
- ✅ Test copy button
- ✅ Monitor stock levels
- ✅ Set up reorder alerts

---

**Status**: ✅ System Ready for Production
