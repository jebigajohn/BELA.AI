-- ============================================
-- FIX 1: Enable RLS on studios table
-- ============================================
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

-- Allow public read access to studios
DROP POLICY IF EXISTS "Public can view studios" ON public.studios;
CREATE POLICY "Public can view studios"
ON public.studios FOR SELECT
TO public
USING (true);

-- Only admins can modify studios
DROP POLICY IF EXISTS "Admin can manage studios" ON public.studios;
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
