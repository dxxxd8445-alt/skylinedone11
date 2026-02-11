-- ============================================
-- MANUALLY COMPLETE STUCK PENDING ORDERS
-- ============================================
-- Run this in Supabase SQL Editor to complete orders that are stuck on "pending"

-- STEP 1: Find all pending orders
SELECT 
  id,
  order_number,
  customer_email,
  product_name,
  duration,
  amount_cents / 100 as amount_usd,
  status,
  created_at,
  stripe_session_id
FROM orders 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- STEP 2: For each pending order, check if payment was successful in Stripe
-- Go to https://dashboard.stripe.com/payments and search by customer email
-- If payment is successful, note the Payment Intent ID (pi_xxxxx)

-- STEP 3: Complete the order (REPLACE VALUES BELOW)
-- Replace 'ORDER_ID_HERE' with the actual order ID from Step 1
-- Replace 'customer@email.com' with actual customer email
-- Replace 'PRODUCT_NAME' with actual product name

DO $$
DECLARE
  v_order_id UUID := 'ORDER_ID_HERE'; -- REPLACE THIS
  v_order RECORD;
  v_license_key TEXT;
  v_expires_at TIMESTAMP;
  v_stock_license_id UUID;
BEGIN
  -- Get order details
  SELECT * INTO v_order FROM orders WHERE id = v_order_id;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Order not found!';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Processing order: %', v_order.order_number;
  
  -- Try to get a license key from stock
  SELECT id, license_key INTO v_stock_license_id, v_license_key
  FROM licenses
  WHERE product_id = v_order.product_id
    AND order_id IS NULL
    AND customer_email IS NULL
  LIMIT 1;
  
  -- If no stock license, generate temporary one
  IF v_license_key IS NULL THEN
    v_license_key := 'TEMP-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 10));
    RAISE NOTICE 'Generated temporary license: %', v_license_key;
  ELSE
    RAISE NOTICE 'Using stock license: %', v_license_key;
  END IF;
  
  -- Calculate expiration date
  IF v_order.duration ILIKE '%day%' THEN
    v_expires_at := NOW() + INTERVAL '1 day' * COALESCE(NULLIF(REGEXP_REPLACE(v_order.duration, '[^0-9]', '', 'g'), '')::INT, 1);
  ELSIF v_order.duration ILIKE '%week%' THEN
    v_expires_at := NOW() + INTERVAL '1 week' * COALESCE(NULLIF(REGEXP_REPLACE(v_order.duration, '[^0-9]', '', 'g'), '')::INT, 1);
  ELSIF v_order.duration ILIKE '%month%' THEN
    v_expires_at := NOW() + INTERVAL '1 month' * COALESCE(NULLIF(REGEXP_REPLACE(v_order.duration, '[^0-9]', '', 'g'), '')::INT, 1);
  ELSIF v_order.duration ILIKE '%year%' THEN
    v_expires_at := NOW() + INTERVAL '1 year' * COALESCE(NULLIF(REGEXP_REPLACE(v_order.duration, '[^0-9]', '', 'g'), '')::INT, 1);
  ELSIF v_order.duration ILIKE '%lifetime%' THEN
    v_expires_at := '2099-12-31'::TIMESTAMP;
  ELSE
    v_expires_at := NOW() + INTERVAL '30 days'; -- Default 30 days
  END IF;
  
  -- Update or create license
  IF v_stock_license_id IS NOT NULL THEN
    UPDATE licenses
    SET 
      order_id = v_order_id,
      customer_email = v_order.customer_email,
      status = 'active',
      expires_at = v_expires_at,
      assigned_at = NOW()
    WHERE id = v_stock_license_id;
    RAISE NOTICE 'Updated stock license';
  ELSE
    INSERT INTO licenses (
      license_key,
      customer_email,
      product_id,
      product_name,
      order_id,
      status,
      expires_at,
      assigned_at
    ) VALUES (
      v_license_key,
      v_order.customer_email,
      v_order.product_id,
      v_order.product_name,
      v_order_id,
      'active',
      v_expires_at,
      NOW()
    );
    RAISE NOTICE 'Created new license';
  END IF;
  
  -- Update order to completed
  UPDATE orders
  SET 
    status = 'completed',
    license_key = v_license_key,
    updated_at = NOW()
  WHERE id = v_order_id;
  
  RAISE NOTICE 'Order completed successfully!';
  RAISE NOTICE 'License Key: %', v_license_key;
  RAISE NOTICE 'Expires: %', v_expires_at;
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: Send this email to customer manually:';
  RAISE NOTICE 'Email: %', v_order.customer_email;
  RAISE NOTICE 'Order: %', v_order.order_number;
  RAISE NOTICE 'Product: %', v_order.product_name;
  RAISE NOTICE 'License: %', v_license_key;
  RAISE NOTICE 'Expires: %', v_expires_at;
END $$;

-- STEP 4: Verify the order is completed
SELECT 
  id,
  order_number,
  customer_email,
  product_name,
  status,
  license_key,
  created_at
FROM orders 
WHERE id = 'ORDER_ID_HERE' -- REPLACE THIS
LIMIT 1;

-- STEP 5: Verify the license was created
SELECT 
  id,
  license_key,
  customer_email,
  product_name,
  status,
  expires_at,
  assigned_at
FROM licenses 
WHERE order_id = 'ORDER_ID_HERE' -- REPLACE THIS
LIMIT 1;

-- ============================================
-- QUICK FIX: Complete ALL pending orders at once
-- ============================================
-- WARNING: Only use this if you've verified ALL pending orders have successful payments in Stripe!

/*
DO $$
DECLARE
  v_order RECORD;
  v_license_key TEXT;
  v_expires_at TIMESTAMP;
  v_stock_license_id UUID;
  v_count INT := 0;
BEGIN
  FOR v_order IN 
    SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at
  LOOP
    -- Try to get a license key from stock
    SELECT id, license_key INTO v_stock_license_id, v_license_key
    FROM licenses
    WHERE product_id = v_order.product_id
      AND order_id IS NULL
      AND customer_email IS NULL
    LIMIT 1;
    
    -- If no stock license, generate temporary one
    IF v_license_key IS NULL THEN
      v_license_key := 'TEMP-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 10));
    END IF;
    
    -- Calculate expiration
    IF v_order.duration ILIKE '%day%' THEN
      v_expires_at := NOW() + INTERVAL '1 day' * COALESCE(NULLIF(REGEXP_REPLACE(v_order.duration, '[^0-9]', '', 'g'), '')::INT, 1);
    ELSIF v_order.duration ILIKE '%week%' THEN
      v_expires_at := NOW() + INTERVAL '1 week' * COALESCE(NULLIF(REGEXP_REPLACE(v_order.duration, '[^0-9]', '', 'g'), '')::INT, 1);
    ELSIF v_order.duration ILIKE '%month%' THEN
      v_expires_at := NOW() + INTERVAL '1 month' * COALESCE(NULLIF(REGEXP_REPLACE(v_order.duration, '[^0-9]', '', 'g'), '')::INT, 1);
    ELSIF v_order.duration ILIKE '%year%' THEN
      v_expires_at := NOW() + INTERVAL '1 year' * COALESCE(NULLIF(REGEXP_REPLACE(v_order.duration, '[^0-9]', '', 'g'), '')::INT, 1);
    ELSIF v_order.duration ILIKE '%lifetime%' THEN
      v_expires_at := '2099-12-31'::TIMESTAMP;
    ELSE
      v_expires_at := NOW() + INTERVAL '30 days';
    END IF;
    
    -- Update or create license
    IF v_stock_license_id IS NOT NULL THEN
      UPDATE licenses
      SET 
        order_id = v_order.id,
        customer_email = v_order.customer_email,
        status = 'active',
        expires_at = v_expires_at,
        assigned_at = NOW()
      WHERE id = v_stock_license_id;
    ELSE
      INSERT INTO licenses (
        license_key,
        customer_email,
        product_id,
        product_name,
        order_id,
        status,
        expires_at,
        assigned_at
      ) VALUES (
        v_license_key,
        v_order.customer_email,
        v_order.product_id,
        v_order.product_name,
        v_order.id,
        'active',
        v_expires_at,
        NOW()
      );
    END IF;
    
    -- Update order
    UPDATE orders
    SET 
      status = 'completed',
      license_key = v_license_key,
      updated_at = NOW()
    WHERE id = v_order.id;
    
    v_count := v_count + 1;
    RAISE NOTICE 'Completed order % - % - %', v_order.order_number, v_order.customer_email, v_license_key;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Completed % orders', v_count;
END $$;
*/
