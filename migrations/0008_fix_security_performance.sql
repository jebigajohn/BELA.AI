-- ============================================
-- FIX 1: Enable RLS on studios table
-- ============================================
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

-- Allow public read access to studios
CREATE POLICY "Public can view studios"
ON public.studios FOR SELECT
TO public
USING (true);

-- Only admins can modify studios
CREATE POLICY "Admin can manage studios"
ON public.studios FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.studio_members
    WHERE profile_id = (SELECT auth.uid())
    AND role = 'admin'
  )
);

-- ============================================
-- FIX 2: Optimize RLS policies with (SELECT auth.uid())
-- This prevents re-evaluation for each row
-- ============================================

-- Drop and recreate profiles policies with optimization
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;

CREATE POLICY "profiles_self_select"
ON public.profiles FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_self_update"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()));

-- Fix studio_members policies
DROP POLICY IF EXISTS "studio_members_select" ON public.studio_members;
DROP POLICY IF EXISTS "studio_members_admin" ON public.studio_members;

CREATE POLICY "studio_members_select"
ON public.studio_members FOR SELECT
TO authenticated
USING (profile_id = (SELECT auth.uid()));

CREATE POLICY "studio_members_admin"
ON public.studio_members FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.studio_members sm
    WHERE sm.profile_id = (SELECT auth.uid())
    AND sm.role = 'admin'
  )
);

-- Fix services policies
DROP POLICY IF EXISTS "services_public_read" ON public.services;
DROP POLICY IF EXISTS "services_admin_manage" ON public.services;

CREATE POLICY "services_public_read"
ON public.services FOR SELECT
TO public
USING (true);

CREATE POLICY "services_admin_manage"
ON public.services FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.studio_members
    WHERE profile_id = (SELECT auth.uid())
    AND role = 'admin'
  )
);

-- Fix customers policies
DROP POLICY IF EXISTS "customers_admin_access" ON public.customers;

CREATE POLICY "customers_admin_access"
ON public.customers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.studio_members
    WHERE profile_id = (SELECT auth.uid())
    AND role = 'admin'
  )
);

-- Fix appointments policies  
DROP POLICY IF EXISTS "appointments_user_access" ON public.appointments;
DROP POLICY IF EXISTS "appointments_admin_access" ON public.appointments;

CREATE POLICY "appointments_user_access"
ON public.appointments FOR SELECT
TO authenticated
USING (customer_id IN (
  SELECT c.id FROM public.customers c
  JOIN public.profiles p ON p.id = (SELECT auth.uid())
  WHERE c.email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
));

CREATE POLICY "appointments_admin_access"
ON public.appointments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.studio_members
    WHERE profile_id = (SELECT auth.uid())
    AND role = 'admin'
  )
);

-- Fix instagram_messages policies
DROP POLICY IF EXISTS "instagram_messages_admin" ON public.instagram_messages;

CREATE POLICY "instagram_messages_admin"
ON public.instagram_messages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.studio_members
    WHERE profile_id = (SELECT auth.uid())
    AND role = 'admin'
  )
);

-- ============================================
-- FIX 3: Storage bucket policies (optimized)
-- ============================================

-- Helper function with optimization
CREATE OR REPLACE FUNCTION storage.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.studio_members
    WHERE profile_id = (SELECT auth.uid())
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profile photos (private)
DROP POLICY IF EXISTS "Admin can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete profile photos" ON storage.objects;

CREATE POLICY "profile_photos_admin_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND storage.is_admin());

CREATE POLICY "profile_photos_admin_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-photos' AND storage.is_admin());

CREATE POLICY "profile_photos_admin_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-photos' AND storage.is_admin());

CREATE POLICY "profile_photos_admin_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos' AND storage.is_admin());

-- Hero photos (public view, admin manage)
DROP POLICY IF EXISTS "Public can view hero photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload hero photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update hero photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete hero photos" ON storage.objects;

CREATE POLICY "hero_photos_public_select" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'hero-photos');

CREATE POLICY "hero_photos_admin_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'hero-photos' AND storage.is_admin());

CREATE POLICY "hero_photos_admin_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'hero-photos' AND storage.is_admin());

CREATE POLICY "hero_photos_admin_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'hero-photos' AND storage.is_admin());

-- Nail inspo (public view, admin manage)
DROP POLICY IF EXISTS "Public can view nail inspo" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload nail inspo" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update nail inspo" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete nail inspo" ON storage.objects;

CREATE POLICY "nail_inspo_public_select" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'nail-inspo');

CREATE POLICY "nail_inspo_admin_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'nail-inspo' AND storage.is_admin());

CREATE POLICY "nail_inspo_admin_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'nail-inspo' AND storage.is_admin());

CREATE POLICY "nail_inspo_admin_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'nail-inspo' AND storage.is_admin());

-- Staff photos (public view, admin manage)
DROP POLICY IF EXISTS "Public can view staff photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload staff photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update staff photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete staff photos" ON storage.objects;

CREATE POLICY "staff_photos_public_select" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'staff-photos');

CREATE POLICY "staff_photos_admin_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'staff-photos' AND storage.is_admin());

CREATE POLICY "staff_photos_admin_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'staff-photos' AND storage.is_admin());

CREATE POLICY "staff_photos_admin_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'staff-photos' AND storage.is_admin());

-- Customer photos (private)
DROP POLICY IF EXISTS "Admin can upload customer photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view customer photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update customer photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete customer photos" ON storage.objects;

CREATE POLICY "customer_photos_admin_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'customer-photos' AND storage.is_admin());

CREATE POLICY "customer_photos_admin_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'customer-photos' AND storage.is_admin());

CREATE POLICY "customer_photos_admin_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'customer-photos' AND storage.is_admin());

CREATE POLICY "customer_photos_admin_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'customer-photos' AND storage.is_admin());
