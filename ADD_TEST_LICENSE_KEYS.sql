-- ============================================
-- ADD TEST LICENSE KEYS
-- RUN THIS TO ADD LICENSE KEYS FOR TESTING
-- ============================================

-- Add 10 test license keys for each product variant
INSERT INTO licenses (product_id, variant_id, product_name, license_key, status, customer_email)
SELECT 
  p.id,
  pv.id,
  p.name || ' - ' || pv.duration,
  'RING-0-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  'unused',
  ''
FROM products p
JOIN product_variants pv ON pv.product_id = p.id
CROSS JOIN generate_series(1, 10)
ON CONFLICT (license_key) DO NOTHING;

-- Show license key counts
SELECT 
  '✅ License Keys Added!' as status,
  p.name as product,
  pv.duration,
  COUNT(*) as available_keys
FROM licenses l
JOIN products p ON l.product_id = p.id
JOIN product_variants pv ON l.variant_id = pv.id
WHERE l.status = 'unused'
GROUP BY p.name, pv.duration
ORDER BY p.name, pv.duration;
