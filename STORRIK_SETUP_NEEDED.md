# Storrik Setup Required ⚠️

## Current Issue

The checkout is showing "Internal server error" because we need the correct Storrik integration details.

## What We Need from Storrik Dashboard

### 1. Correct API Endpoint
We need to know the actual Storrik API endpoint for creating checkout sessions. Current guess:
```
POST https://api.storrik.com/v1/checkout/sessions
```

### 2. API Request Format
We need to know what fields Storrik expects:
```json
{
  "product_id": "prod_xxx",
  "customer_email": "email@example.com",
  "success_url": "https://yoursite.com/success",
  "cancel_url": "https://yoursite.com/cancel"
}
```

### 3. API Response Format
We need to know what Storrik returns:
```json
{
  "checkout_url": "https://checkout.storrik.com/xxx",
  "session_id": "session_xxx"
}
```

### 4. Direct Product URL (Alternative)
If API isn't available, we need the direct product checkout URL format:
```
https://storrik.com/checkout/PRODUCT_ID?email=xxx
```

## How to Find This Information

### Option 1: Check Storrik Documentation
1. Log into Storrik dashboard
2. Go to Documentation or API section
3. Look for "Checkout API" or "Create Session"
4. Copy the endpoint URL and request/response format

### Option 2: Check Storrik Product Page
1. Go to your Storrik dashboard
2. Find the Valorant product
3. Look for "Checkout Link" or "Buy Button"
4. Copy the URL format

### Option 3: Contact Storrik Support
Ask them:
- "What's the API endpoint to create a checkout session?"
- "What's the direct checkout URL for a product?"
- "How do I integrate checkout on my website?"

## Temporary Solution

I've updated the code to generate a checkout URL in this format:
```
https://storrik.com/checkout/PRODUCT_ID?email=EMAIL
```

**This might not work** until we have the correct URL format from Storrik.

## What to Do Next

1. **Find the correct Storrik checkout URL format**
   - Check your Storrik dashboard
   - Look for product links or API docs
   - Contact Storrik support if needed

2. **Update the API route**
   - Once you have the correct URL format
   - Update `app/api/storrik/create-checkout/route.ts`
   - Replace the `checkoutUrl` line with the correct format

3. **Test the checkout**
   - Try the checkout flow again
   - Should redirect to Storrik payment page

## Example: If Storrik Uses Direct Links

If Storrik gives you a direct product link like:
```
https://buy.storrik.com/product/prod_a2e53754827a304bb8cf2d53f9f096f1
```

Then update the code to:
```typescript
const checkoutUrl = `https://buy.storrik.com/product/${product.storrik_product_id}`;
```

## Example: If Storrik Has an API

If Storrik has an API endpoint, we need:
- API endpoint URL
- Authentication method (Bearer token, API key, etc.)
- Request body format
- Response format

Then we can properly implement the API call.

## Current Status

🔴 **Blocked** - Need Storrik integration details
⏳ **Waiting** - For correct checkout URL format
📋 **Action** - Check Storrik dashboard or contact support

## Files Ready

All code is in place, we just need the correct Storrik URL:
- ✅ Backend API route created
- ✅ Frontend checkout flow ready
- ✅ Success page created
- ✅ Webhook handler ready
- ⏳ Need correct Storrik checkout URL

Once you provide the correct Storrik checkout URL format, I can update the code and it will work immediately.
