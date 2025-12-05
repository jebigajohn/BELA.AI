-- Create Storage Buckets for Images
-- Only admins can access and manage photos

-- Insert buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-photos', 'profile-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('hero-photos', 'hero-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('nail-inspo', 'nail-inspo', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('staff-photos', 'staff-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('customer-photos', 'customer-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION storage.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.studio_members
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILE PHOTOS BUCKET (Private - Admin only)
-- ============================================

-- Only admins can upload to profile-photos
CREATE POLICY "Admin can upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND storage.is_admin()
);

-- Only admins can view profile photos
CREATE POLICY "Admin can view profile photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND storage.is_admin()
);

-- Only admins can update profile photos
CREATE POLICY "Admin can update profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND storage.is_admin()
);

-- Only admins can delete profile photos
CREATE POLICY "Admin can delete profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND storage.is_admin()
);

-- ============================================
-- HERO PHOTOS BUCKET (Public view, Admin manage)
-- ============================================

-- Anyone can view hero photos (public bucket)
CREATE POLICY "Public can view hero photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hero-photos');

-- Only admins can upload hero photos
CREATE POLICY "Admin can upload hero photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hero-photos' 
  AND storage.is_admin()
);

-- Only admins can update hero photos
CREATE POLICY "Admin can update hero photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hero-photos' 
  AND storage.is_admin()
);

-- Only admins can delete hero photos
CREATE POLICY "Admin can delete hero photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'hero-photos' 
  AND storage.is_admin()
);

-- ============================================
-- NAIL INSPO BUCKET (Public view, Admin manage)
-- ============================================

-- Anyone can view nail inspo photos
CREATE POLICY "Public can view nail inspo"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'nail-inspo');

-- Only admins can upload nail inspo
CREATE POLICY "Admin can upload nail inspo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'nail-inspo' 
  AND storage.is_admin()
);

-- Only admins can update nail inspo
CREATE POLICY "Admin can update nail inspo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'nail-inspo' 
  AND storage.is_admin()
);

-- Only admins can delete nail inspo
CREATE POLICY "Admin can delete nail inspo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'nail-inspo' 
  AND storage.is_admin()
);

-- ============================================
-- STAFF PHOTOS BUCKET (Public view, Admin manage)
-- ============================================

-- Anyone can view staff photos
CREATE POLICY "Public can view staff photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'staff-photos');

-- Only admins can upload staff photos
CREATE POLICY "Admin can upload staff photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'staff-photos' 
  AND storage.is_admin()
);

-- Only admins can update staff photos
CREATE POLICY "Admin can update staff photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'staff-photos' 
  AND storage.is_admin()
);

-- Only admins can delete staff photos
CREATE POLICY "Admin can delete staff photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'staff-photos' 
  AND storage.is_admin()
);

-- ============================================
-- CUSTOMER PHOTOS BUCKET (Private - Admin only)
-- ============================================

-- Only admins can upload customer photos
CREATE POLICY "Admin can upload customer photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-photos' 
  AND storage.is_admin()
);

-- Only admins can view customer photos
CREATE POLICY "Admin can view customer photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-photos' 
  AND storage.is_admin()
);

-- Only admins can update customer photos
CREATE POLICY "Admin can update customer photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'customer-photos' 
  AND storage.is_admin()
);

-- Only admins can delete customer photos
CREATE POLICY "Admin can delete customer photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'customer-photos' 
  AND storage.is_admin()
);
