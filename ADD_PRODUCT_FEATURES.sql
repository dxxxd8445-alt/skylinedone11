-- Add comprehensive features for all products
-- This script adds simple, clean features for each category

-- Clear existing features first
DELETE FROM product_features;

-- ============================================================================
-- STANDARD SHOOTER GAMES (Apex, Fortnite, COD, Rust, Tarkov, etc.)
-- ============================================================================

-- Aimbot Features for all shooter games
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', 'Aimbot' FROM products
WHERE slug IN ('apex-legends', 'fortnite', 'cod-bo6', 'cod-bo7', 'rust', 'escape-from-tarkov', 
               'marvel-rivals', 'delta-force', 'rainbow-six-siege', 'battlefield-6', 
               'arc-raiders', 'pubg', 'dayz', 'dune-awakening');

-- ESP Features for all shooter games
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', 'ESP' FROM products
WHERE slug IN ('apex-legends', 'fortnite', 'cod-bo6', 'cod-bo7', 'rust', 'escape-from-tarkov', 
               'marvel-rivals', 'delta-force', 'rainbow-six-siege', 'battlefield-6', 
               'arc-raiders', 'pubg', 'dayz', 'dune-awakening', 'dead-by-daylight');

-- MISC Features for all games
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products,
  (VALUES ('No Recoil'), ('Triggerbot')) AS features(feature)
WHERE slug IN ('apex-legends', 'fortnite', 'cod-bo6', 'cod-bo7', 'rust', 'escape-from-tarkov', 
               'marvel-rivals', 'delta-force', 'rainbow-six-siege', 'battlefield-6', 
               'arc-raiders', 'pubg', 'dayz', 'dune-awakening', 'dead-by-daylight');

-- ============================================================================
-- HWID SPOOFER (Universal) - Different features
-- ============================================================================

INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products,
  (VALUES 
    ('Disk Spoof'),
    ('MAC Address Spoof'),
    ('Motherboard Spoof'),
    ('GPU Spoof'),
    ('RAM Spoof'),
    ('Registry Cleaner'),
    ('BIOS Spoof'),
    ('Network Adapter Spoof')
  ) AS features(feature)
WHERE slug = 'hwid-spoofer';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count features per product
SELECT 
  p.name,
  p.slug,
  COUNT(CASE WHEN pf.category = 'aimbot' THEN 1 END) as aimbot_count,
  COUNT(CASE WHEN pf.category = 'esp' THEN 1 END) as esp_count,
  COUNT(CASE WHEN pf.category = 'misc' THEN 1 END) as misc_count,
  COUNT(*) as total_features
FROM products p
LEFT JOIN product_features pf ON p.id = pf.product_id
GROUP BY p.id, p.name, p.slug
ORDER BY p.name;

-- ============================================================================
-- APEX LEGENDS FEATURES
-- ============================================================================

-- Apex Legends - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aim On/Off'),
    ('Customizable Aimbot Key'),
    ('FOV'),
    ('Aim Bone Selector'),
    ('Multiple Aim Bones'),
    ('Aimbot Speed'),
    ('Silent Aimbot (Magic Bullet)'),
    ('Visibility Check'),
    ('No Recoil'),
    ('No Sway')
  ) AS features(feature)
WHERE slug = 'apex-legends';

-- Apex Legends - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Enemy Box ESP'),
    ('Enemy Line'),
    ('Enemy Distance ESP'),
    ('Enemy Health ESP'),
    ('Enemy Name'),
    ('Team ESP'),
    ('Skeleton ESP'),
    ('Charms'),
    ('Item ESP'),
    ('Item Filters'),
    ('Loot ESP'),
    ('Knocked Out Text')
  ) AS features(feature)
WHERE slug = 'apex-legends';

-- Apex Legends - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('Fast Reload'),
    ('Bunny Hop'),
    ('Rapid Fire'),
    ('Super Jump'),
    ('Speed Hack')
  ) AS features(feature)
WHERE slug = 'apex-legends';

-- ============================================================================
-- FORTNITE FEATURES
-- ============================================================================

-- Fortnite - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Toggle'),
    ('Aim Key Bind'),
    ('FOV Circle'),
    ('Target Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Target Lock'),
    ('Auto Fire')
  ) AS features(feature)
WHERE slug = 'fortnite';

-- Fortnite - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health Bars'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Loot ESP'),
    ('Vehicle ESP'),
    ('Supply Drop ESP'),
    ('Chest ESP'),
    ('Trap ESP')
  ) AS features(feature)
WHERE slug = 'fortnite';

-- Fortnite - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Reload'),
    ('Speed Hack')
  ) AS features(feature)
WHERE slug = 'fortnite';

-- ============================================================================
-- CALL OF DUTY (BO6, BO7) FEATURES
-- ============================================================================

-- COD - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Enable'),
    ('Aim Key'),
    ('FOV Slider'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Aim'),
    ('Target Switch Delay')
  ) AS features(feature)
WHERE slug IN ('cod-bo6', 'cod-bo7');

-- COD - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Snaplines'),
    ('Radar Hack'),
    ('2D Radar'),
    ('Loot ESP'),
    ('Vehicle ESP')
  ) AS features(feature)
WHERE slug IN ('cod-bo6', 'cod-bo7');

-- COD - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Reload'),
    ('Triggerbot'),
    ('Stream Proof')
  ) AS features(feature)
WHERE slug IN ('cod-bo6', 'cod-bo7');

-- ============================================================================
-- RUST FEATURES
-- ============================================================================

-- Rust - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Enable'),
    ('Aim Key Bind'),
    ('FOV Slider'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Shoot'),
    ('Target Priority')
  ) AS features(feature)
WHERE slug = 'rust';

-- Rust - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Sleeper ESP'),
    ('Animal ESP'),
    ('Resource ESP'),
    ('Loot ESP'),
    ('Stash ESP'),
    ('TC ESP'),
    ('Raid ESP')
  ) AS features(feature)
WHERE slug = 'rust';

-- Rust - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Loot'),
    ('Speed Hack'),
    ('Fly Hack')
  ) AS features(feature)
WHERE slug = 'rust';

-- ============================================================================
-- ESCAPE FROM TARKOV FEATURES
-- ============================================================================

-- Tarkov - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Toggle'),
    ('Aim Key'),
    ('FOV Circle'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Fire'),
    ('Target Lock')
  ) AS features(feature)
WHERE slug = 'escape-from-tarkov';

-- Tarkov - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Scav ESP'),
    ('Boss ESP'),
    ('Loot ESP'),
    ('Item Filter'),
    ('Container ESP'),
    ('Exit ESP')
  ) AS features(feature)
WHERE slug = 'escape-from-tarkov';

-- Tarkov - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Loot'),
    ('Thermal Vision'),
    ('Night Vision')
  ) AS features(feature)
WHERE slug = 'escape-from-tarkov';

-- ============================================================================
-- MARVEL RIVALS FEATURES
-- ============================================================================

-- Marvel Rivals - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Enable'),
    ('Aim Key Bind'),
    ('FOV Slider'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Aim'),
    ('Target Priority')
  ) AS features(feature)
WHERE slug = 'marvel-rivals';

-- Marvel Rivals - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health Bars'),
    ('Distance ESP'),
    ('Hero Name'),
    ('Ability ESP'),
    ('Ultimate ESP'),
    ('Team ESP'),
    ('Radar Hack')
  ) AS features(feature)
WHERE slug = 'marvel-rivals';

-- Marvel Rivals - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('Rapid Fire'),
    ('Ability Cooldown'),
    ('Speed Hack'),
    ('Stream Proof')
  ) AS features(feature)
WHERE slug = 'marvel-rivals';

-- ============================================================================
-- DELTA FORCE FEATURES
-- ============================================================================

-- Delta Force - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Toggle'),
    ('Aim Key'),
    ('FOV Circle'),
    ('Bone Selector'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Fire'),
    ('Target Lock')
  ) AS features(feature)
WHERE slug = 'delta-force';

-- Delta Force - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Vehicle ESP'),
    ('Loot ESP'),
    ('Radar Hack')
  ) AS features(feature)
WHERE slug = 'delta-force';

-- Delta Force - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Reload'),
    ('Triggerbot'),
    ('Stream Proof')
  ) AS features(feature)
WHERE slug = 'delta-force';

-- ============================================================================
-- RAINBOW SIX SIEGE FEATURES
-- ============================================================================

-- Rainbow Six Siege - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Toggle'),
    ('Aim Key'),
    ('FOV Circle'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Recoil Control'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Fire'),
    ('Target Lock')
  ) AS features(feature)
WHERE slug = 'rainbow-six-siege';

-- Rainbow Six Siege - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health Bars'),
    ('Distance ESP'),
    ('Operator Name'),
    ('Weapon ESP'),
    ('Gadget ESP'),
    ('Trap ESP'),
    ('Breach ESP'),
    ('Radar Hack')
  ) AS features(feature)
WHERE slug = 'rainbow-six-siege';

-- Rainbow Six Siege - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Triggerbot'),
    ('Stream Proof'),
    ('Panic Key')
  ) AS features(feature)
WHERE slug = 'rainbow-six-siege';

-- ============================================================================
-- BATTLEFIELD 6 FEATURES
-- ============================================================================

-- Battlefield 6 - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Enable'),
    ('Aim Key'),
    ('FOV Slider'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Aim'),
    ('Target Priority')
  ) AS features(feature)
WHERE slug = 'battlefield-6';

-- Battlefield 6 - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Vehicle ESP'),
    ('Explosive ESP'),
    ('Radar Hack'),
    ('2D Radar')
  ) AS features(feature)
WHERE slug = 'battlefield-6';

-- Battlefield 6 - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Reload'),
    ('Triggerbot'),
    ('Stream Proof')
  ) AS features(feature)
WHERE slug = 'battlefield-6';

-- ============================================================================
-- ARC RAIDERS FEATURES
-- ============================================================================

-- ARC Raiders - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Toggle'),
    ('Aim Key'),
    ('FOV Circle'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Fire'),
    ('Target Lock')
  ) AS features(feature)
WHERE slug = 'arc-raiders';

-- ARC Raiders - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Loot ESP'),
    ('Enemy AI ESP'),
    ('Extraction ESP'),
    ('Radar Hack')
  ) AS features(feature)
WHERE slug = 'arc-raiders';

-- ARC Raiders - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Loot'),
    ('Speed Hack'),
    ('Stream Proof')
  ) AS features(feature)
WHERE slug = 'arc-raiders';

-- ============================================================================
-- PUBG FEATURES
-- ============================================================================

-- PUBG - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Enable'),
    ('Aim Key'),
    ('FOV Slider'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Fire'),
    ('Target Priority')
  ) AS features(feature)
WHERE slug = 'pubg';

-- PUBG - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Loot ESP'),
    ('Vehicle ESP'),
    ('Airdrop ESP'),
    ('Radar Hack')
  ) AS features(feature)
WHERE slug = 'pubg';

-- PUBG - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Speed Hack'),
    ('Stream Proof')
  ) AS features(feature)
WHERE slug = 'pubg';

-- ============================================================================
-- DAYZ FEATURES
-- ============================================================================

-- DayZ - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Toggle'),
    ('Aim Key'),
    ('FOV Circle'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Fire'),
    ('Target Lock')
  ) AS features(feature)
WHERE slug = 'dayz';

-- DayZ - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Zombie ESP'),
    ('Animal ESP'),
    ('Loot ESP'),
    ('Vehicle ESP'),
    ('Base ESP')
  ) AS features(feature)
WHERE slug = 'dayz';

-- DayZ - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Loot'),
    ('Speed Hack'),
    ('Teleport')
  ) AS features(feature)
WHERE slug = 'dayz';

-- ============================================================================
-- DUNE AWAKENING FEATURES
-- ============================================================================

-- Dune Awakening - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Enable'),
    ('Aim Key'),
    ('FOV Slider'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Aim'),
    ('Target Priority')
  ) AS features(feature)
WHERE slug = 'dune-awakening';

-- Dune Awakening - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Resource ESP'),
    ('Spice ESP'),
    ('Vehicle ESP'),
    ('Radar Hack')
  ) AS features(feature)
WHERE slug = 'dune-awakening';

-- Dune Awakening - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Speed Hack'),
    ('Stream Proof')
  ) AS features(feature)
WHERE slug = 'dune-awakening';

-- ============================================================================
-- DEAD BY DAYLIGHT FEATURES
-- ============================================================================

-- Dead by Daylight - ESP Features (No aimbot for DBD)
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Survivor ESP'),
    ('Killer ESP'),
    ('Box ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Generator ESP'),
    ('Totem ESP'),
    ('Hook ESP'),
    ('Hatch ESP'),
    ('Exit Gate ESP'),
    ('Item ESP')
  ) AS features(feature)
WHERE slug = 'dead-by-daylight';

-- Dead by Daylight - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('Speed Hack'),
    ('Instant Heal'),
    ('Instant Repair'),
    ('No Skill Checks'),
    ('Aura Reveal'),
    ('Teleport')
  ) AS features(feature)
WHERE slug = 'dead-by-daylight';

-- ============================================================================
-- HWID SPOOFER FEATURES (Universal)
-- ============================================================================

-- HWID Spoofer - MISC Features (no aimbot/esp for spoofer)
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('Disk Spoof'),
    ('MAC Address Spoof'),
    ('Motherboard Spoof'),
    ('GPU Spoof'),
    ('RAM Spoof'),
    ('Registry Cleaner'),
    ('BIOS Spoof'),
    ('Network Adapter Spoof'),
    ('USB Spoof'),
    ('Monitor Spoof')
  ) AS features(feature)
WHERE slug = 'hwid-spoofer';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count features per product
SELECT 
  p.name,
  p.slug,
  COUNT(CASE WHEN pf.category = 'aimbot' THEN 1 END) as aimbot_count,
  COUNT(CASE WHEN pf.category = 'esp' THEN 1 END) as esp_count,
  COUNT(CASE WHEN pf.category = 'misc' THEN 1 END) as misc_count,
  COUNT(*) as total_features
FROM products p
LEFT JOIN product_features pf ON p.id = pf.product_id
GROUP BY p.id, p.name, p.slug
ORDER BY p.name;

-- Apex Legends - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Enemy Box ESP'),
    ('Enemy Line'),
    ('Enemy Distance ESP'),
    ('Enemy Health ESP'),
    ('Enemy Name'),
    ('Team ESP'),
    ('Skeleton ESP'),
    ('Charms'),
    ('Item ESP'),
    ('Item Filters'),
    ('Loot ESP'),
    ('Knocked Out Text')
  ) AS features(feature)
WHERE game = 'Apex Legends';

-- Apex Legends - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('Fast Reload'),
    ('Bunny Hop'),
    ('Rapid Fire'),
    ('Super Jump'),
    ('Speed Hack')
  ) AS features(feature)
WHERE game = 'Apex Legends';

-- ============================================================================
-- FORTNITE FEATURES
-- ============================================================================

-- Fortnite - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Toggle'),
    ('Aim Key Bind'),
    ('FOV Circle'),
    ('Target Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Target Lock'),
    ('Auto Fire')
  ) AS features(feature)
WHERE game = 'Fortnite';

-- Fortnite - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health Bars'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Loot ESP'),
    ('Vehicle ESP'),
    ('Supply Drop ESP'),
    ('Chest ESP'),
    ('Trap ESP')
  ) AS features(feature)
WHERE game = 'Fortnite';

-- Fortnite - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Reload'),
    ('Speed Hack')
  ) AS features(feature)
WHERE game = 'Fortnite';

-- ============================================================================
-- CALL OF DUTY (BO6, MW3, Warzone) FEATURES
-- ============================================================================

-- COD - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Enable'),
    ('Aim Key'),
    ('FOV Slider'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Aim'),
    ('Target Switch Delay')
  ) AS features(feature)
WHERE game IN ('Call of Duty: Black Ops 6', 'Call of Duty: MW3', 'Call of Duty: Warzone');

-- COD - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Snaplines'),
    ('Radar Hack'),
    ('2D Radar'),
    ('Loot ESP'),
    ('Vehicle ESP')
  ) AS features(feature)
WHERE game IN ('Call of Duty: Black Ops 6', 'Call of Duty: MW3', 'Call of Duty: Warzone');

-- COD - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Reload'),
    ('Triggerbot'),
    ('Stream Proof')
  ) AS features(feature)
WHERE game IN ('Call of Duty: Black Ops 6', 'Call of Duty: MW3', 'Call of Duty: Warzone');

-- ============================================================================
-- VALORANT FEATURES
-- ============================================================================

-- Valorant - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Toggle'),
    ('Aim Key'),
    ('FOV Circle'),
    ('Bone Selector'),
    ('Smooth Aim'),
    ('RCS (Recoil Control)'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Target Lock'),
    ('Auto Fire')
  ) AS features(feature)
WHERE game = 'Valorant';

-- Valorant - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health Bars'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Spike ESP'),
    ('Agent ESP'),
    ('Ability ESP'),
    ('Radar Hack')
  ) AS features(feature)
WHERE game = 'Valorant';

-- Valorant - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Triggerbot'),
    ('Bunny Hop'),
    ('Stream Proof'),
    ('Panic Key')
  ) AS features(feature)
WHERE game = 'Valorant';

-- ============================================================================
-- RUST FEATURES
-- ============================================================================

-- Rust - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Enable'),
    ('Aim Key Bind'),
    ('FOV Slider'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Shoot'),
    ('Target Priority')
  ) AS features(feature)
WHERE game = 'Rust';

-- Rust - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Sleeper ESP'),
    ('Animal ESP'),
    ('Resource ESP'),
    ('Loot ESP'),
    ('Stash ESP'),
    ('TC ESP'),
    ('Raid ESP')
  ) AS features(feature)
WHERE game = 'Rust';

-- Rust - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Loot'),
    ('Speed Hack'),
    ('Fly Hack')
  ) AS features(feature)
WHERE game = 'Rust';

-- ============================================================================
-- ESCAPE FROM TARKOV FEATURES
-- ============================================================================

-- Tarkov - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Toggle'),
    ('Aim Key'),
    ('FOV Circle'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Fire'),
    ('Target Lock')
  ) AS features(feature)
WHERE game = 'Escape from Tarkov';

-- Tarkov - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Scav ESP'),
    ('Boss ESP'),
    ('Loot ESP'),
    ('Item Filter'),
    ('Container ESP'),
    ('Exit ESP')
  ) AS features(feature)
WHERE game = 'Escape from Tarkov';

-- Tarkov - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Loot'),
    ('Thermal Vision'),
    ('Night Vision')
  ) AS features(feature)
WHERE game = 'Escape from Tarkov';

-- ============================================================================
-- MARVEL RIVALS FEATURES
-- ============================================================================

-- Marvel Rivals - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Enable'),
    ('Aim Key Bind'),
    ('FOV Slider'),
    ('Bone Selection'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Aim'),
    ('Target Priority')
  ) AS features(feature)
WHERE game = 'Marvel Rivals';

-- Marvel Rivals - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health Bars'),
    ('Distance ESP'),
    ('Hero Name'),
    ('Ability ESP'),
    ('Ultimate ESP'),
    ('Team ESP'),
    ('Radar Hack')
  ) AS features(feature)
WHERE game = 'Marvel Rivals';

-- Marvel Rivals - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('Rapid Fire'),
    ('Ability Cooldown'),
    ('Speed Hack'),
    ('Stream Proof')
  ) AS features(feature)
WHERE game = 'Marvel Rivals';

-- ============================================================================
-- DELTA FORCE FEATURES
-- ============================================================================

-- Delta Force - Aimbot Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES 
    ('Aimbot Toggle'),
    ('Aim Key'),
    ('FOV Circle'),
    ('Bone Selector'),
    ('Smooth Aim'),
    ('Prediction'),
    ('Silent Aim'),
    ('Visibility Check'),
    ('Auto Fire'),
    ('Target Lock')
  ) AS features(feature)
WHERE game = 'Delta Force';

-- Delta Force - ESP Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES 
    ('Player ESP'),
    ('Box ESP'),
    ('Skeleton ESP'),
    ('Health ESP'),
    ('Distance ESP'),
    ('Name ESP'),
    ('Weapon ESP'),
    ('Vehicle ESP'),
    ('Loot ESP'),
    ('Radar Hack')
  ) AS features(feature)
WHERE game = 'Delta Force';

-- Delta Force - MISC Features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('No Recoil'),
    ('No Spread'),
    ('Rapid Fire'),
    ('Instant Reload'),
    ('Triggerbot'),
    ('Stream Proof')
  ) AS features(feature)
WHERE game = 'Delta Force';

-- ============================================================================
-- HWID SPOOFER FEATURES (Universal)
-- ============================================================================

-- HWID Spoofer - MISC Features (no aimbot/esp for spoofer)
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES 
    ('Disk Spoof'),
    ('MAC Address Spoof'),
    ('Motherboard Spoof'),
    ('GPU Spoof'),
    ('RAM Spoof'),
    ('Registry Cleaner'),
    ('BIOS Spoof'),
    ('Network Adapter Spoof'),
    ('USB Spoof'),
    ('Monitor Spoof')
  ) AS features(feature)
WHERE game = 'Universal' OR slug = 'hwid-spoofer';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count features per product
SELECT 
  p.name,
  p.game,
  COUNT(CASE WHEN pf.category = 'aimbot' THEN 1 END) as aimbot_count,
  COUNT(CASE WHEN pf.category = 'esp' THEN 1 END) as esp_count,
  COUNT(CASE WHEN pf.category = 'misc' THEN 1 END) as misc_count,
  COUNT(*) as total_features
FROM products p
LEFT JOIN product_features pf ON p.id = pf.product_id
GROUP BY p.id, p.name, p.game
ORDER BY p.game, p.name;
