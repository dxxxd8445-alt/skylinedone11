-- ============================================
-- SUPABASE STORAGE SETUP
-- Run this to set up file storage buckets
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-galleries', 'product-galleries', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('review-images', 'review-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies

-- Product images - public read, service role write
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Service role can manage product images" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role' AND bucket_id = 'product-images');

-- Product galleries - public read, service role write
CREATE POLICY "Public can view product galleries" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-galleries');

CREATE POLICY "Service role can manage product galleries" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role' AND bucket_id = 'product-galleries');

-- Review images - public read, authenticated write
CREATE POLICY "Public can view review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'review-images');

CREATE POLICY "Service role can manage review images" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role' AND bucket_id = 'review-images');

-- Avatars - public read, authenticated write own
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (auth.role() = 'authenticated' AND bucket_id = 'avatars');

CREATE POLICY "Service role can manage avatars" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role' AND bucket_id = 'avatars');

-- Success message
SELECT '📁 Storage buckets created successfully!' as message,
       COUNT(*) as total_buckets
FROM storage.buckets 
WHERE id IN ('product-images', 'product-galleries', 'review-images', 'avatars');