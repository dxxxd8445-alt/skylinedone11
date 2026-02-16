-- ============================================================================
-- RESTORE ALL PRODUCTS - Ring-0 Store
-- ============================================================================
-- This script will restore all 16 products with their pricing tiers
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Insert all products (will skip if they already exist)
INSERT INTO products (name, slug, game, description, image, provider, status) VALUES
('HWID Spoofer', 'hwid-spoofer', 'Universal', 'Advanced HWID Spoofer to bypass hardware bans across all games. Spoofs disk, MAC, motherboard, and GPU identifiers.', '/images/hwid-spoofer.jpg', 'Ring-0', 'active'),
('Fortnite Cheat', 'fortnite', 'Fortnite', 'Premium Fortnite cheat with aimbot, ESP, and build assist features.', '/images/fortnite.jpg', 'Ring-0', 'active'),
('Marvel Rivals Cheat', 'marvel-rivals', 'Marvel Rivals', 'Unleash your powers in Marvel Rivals with our advanced cheat suite.', '/images/marvel-rivals.jpg', 'Ring-0', 'active'),
('Delta Force Cheat', 'delta-force', 'Delta Force', 'Tactical advantage in Delta Force with precision aimbot and ESP.', '/images/delta-force.jpg', 'Ring-0', 'active'),
('PUBG Cheat', 'pubg', 'PUBG', 'Win every chicken dinner with our premium PUBG cheat.', '/images/pubg.jpg', 'Ring-0', 'active'),
('DayZ Cheat', 'dayz', 'DayZ', 'Survive the apocalypse with our comprehensive DayZ cheat.', '/images/dayz.jpg', 'Ring-0', 'active'),
('Dune Awakening Cheat', 'dune-awakening', 'Dune Awakening', 'Conquer Arrakis with enhanced awareness and combat features.', '/images/dune-awakening.jpg', 'Ring-0', 'maintenance'),
('Dead by Daylight Cheat', 'dead-by-daylight', 'Dead by Daylight', 'Escape or hunt with supernatural advantages in DBD.', '/images/dead-by-daylight.jpg', 'Ring-0', 'active'),
('ARC Raiders Cheat', 'arc-raiders', 'ARC Raiders', 'Extract with confidence using our ARC Raiders feature set.', '/images/arc-raiders.png', 'Ring-0', 'maintenance'),
('Rainbow Six Siege Cheat', 'rainbow-six-siege', 'Rainbow Six Siege', 'Tactical ESP and precision aim for Siege operators.', '/images/rainbow-six.jpg', 'Ring-0', 'active'),
('Battlefield 6 Cheat', 'battlefield-6', 'Battlefield 6', 'Dominate large-scale warfare with our BF6 features.', '/images/battlefield-6.jpg', 'Ring-0', 'maintenance'),
('COD Black Ops 7 Cheat', 'cod-bo7', 'Call of Duty', 'Next-gen COD domination with BO7 enhancements.', '/images/cod-bo7.jpg', 'Ring-0', 'active'),
('COD Black Ops 6 Cheat', 'cod-bo6', 'Call of Duty', 'Premium Black Ops 6 cheat with full feature set.', '/images/cod-bo6.jpg', 'Ring-0', 'active'),
('Rust Cheat', 'rust', 'Rust', 'Survive and raid with our comprehensive Rust cheat.', '/images/rust.jpg', 'Ring-0', 'active'),
('Apex Legends Cheat', 'apex-legends', 'Apex Legends', 'Become the Apex Predator with our premium cheat suite.', '/images/apex-product.png', 'Ring-0', 'active'),
('Escape from Tarkov Cheat', 'escape-from-tarkov', 'Escape from Tarkov', 'Extract with confidence using our Tarkov ESP and aimbot.', '/images/tarkov.jpg', 'Ring-0', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Insert pricing for all products (1 Day, 7 Days, 30 Days)
INSERT INTO product_pricing (product_id, duration, price, stock) 
SELECT id, '1 Day', 
  CASE 
    WHEN slug = 'hwid-spoofer' THEN 4.90
    WHEN slug = 'escape-from-tarkov' THEN 12.90
    WHEN slug = 'cod-bo7' THEN 11.90
    WHEN slug IN ('rust', 'cod-bo6', 'rainbow-six-siege', 'marvel-rivals') THEN 9.90
    WHEN slug IN ('fortnite', 'dune-awakening', 'battlefield-6', 'apex-legends') THEN 8.90
    WHEN slug IN ('dayz', 'dead-by-daylight') THEN 7.90
    WHEN slug IN ('delta-force', 'arc-raiders') THEN 7.90
    WHEN slug = 'pubg' THEN 6.90
  END,
  999
FROM products
WHERE slug IN ('hwid-spoofer', 'fortnite', 'marvel-rivals', 'delta-force', 'pubg', 'dayz', 'dune-awakening', 
               'dead-by-daylight', 'arc-raiders', 'rainbow-six-siege', 'battlefield-6', 'cod-bo7', 
               'cod-bo6', 'rust', 'apex-legends', 'escape-from-tarkov')
ON CONFLICT (product_id, duration) DO NOTHING;

INSERT INTO product_pricing (product_id, duration, price, stock) 
SELECT id, '7 Days', 
  CASE 
    WHEN slug = 'hwid-spoofer' THEN 19.90
    WHEN slug = 'escape-from-tarkov' THEN 59.90
    WHEN slug = 'cod-bo7' THEN 54.90
    WHEN slug IN ('rust', 'cod-bo6', 'rainbow-six-siege', 'marvel-rivals') THEN 49.90
    WHEN slug IN ('fortnite', 'dune-awakening', 'battlefield-6', 'apex-legends') THEN 44.90
    WHEN slug IN ('dayz', 'dead-by-daylight') THEN 39.90
    WHEN slug IN ('delta-force', 'arc-raiders') THEN 39.90
    WHEN slug = 'pubg' THEN 34.90
  END,
  999
FROM products
WHERE slug IN ('hwid-spoofer', 'fortnite', 'marvel-rivals', 'delta-force', 'pubg', 'dayz', 'dune-awakening', 
               'dead-by-daylight', 'arc-raiders', 'rainbow-six-siege', 'battlefield-6', 'cod-bo7', 
               'cod-bo6', 'rust', 'apex-legends', 'escape-from-tarkov')
ON CONFLICT (product_id, duration) DO NOTHING;

INSERT INTO product_pricing (product_id, duration, price, stock) 
SELECT id, '30 Days', 
  CASE 
    WHEN slug = 'hwid-spoofer' THEN 39.90
    WHEN slug = 'escape-from-tarkov' THEN 109.90
    WHEN slug = 'cod-bo7' THEN 99.90
    WHEN slug IN ('rust', 'cod-bo6', 'rainbow-six-siege', 'marvel-rivals') THEN 89.90
    WHEN slug IN ('fortnite', 'dune-awakening', 'battlefield-6', 'apex-legends') THEN 79.90
    WHEN slug IN ('dayz', 'dead-by-daylight') THEN 69.90
    WHEN slug IN ('delta-force', 'arc-raiders') THEN 69.90
    WHEN slug = 'pubg' THEN 59.90
  END,
  999
FROM products
WHERE slug IN ('hwid-spoofer', 'fortnite', 'marvel-rivals', 'delta-force', 'pubg', 'dayz', 'dune-awakening', 
               'dead-by-daylight', 'arc-raiders', 'rainbow-six-siege', 'battlefield-6', 'cod-bo7', 
               'cod-bo6', 'rust', 'apex-legends', 'escape-from-tarkov')
ON CONFLICT (product_id, duration) DO NOTHING;

-- Verify products were added
SELECT 
  p.name,
  p.slug,
  p.game,
  p.status,
  COUNT(pp.id) as pricing_tiers
FROM products p
LEFT JOIN product_pricing pp ON p.id = pp.product_id
GROUP BY p.id, p.name, p.slug, p.game, p.status
ORDER BY p.name;
