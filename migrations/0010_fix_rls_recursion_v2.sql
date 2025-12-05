-- ============================================
-- FIX: RLS Infinite Recursion in studio_members
-- ============================================
-- Problem: is_member() und is_admin() Funktionen referenzieren studio_members,
-- was bei SELECT auf studio_members zu infinite recursion führt.

-- Lösung: Separate Funktionen die KEINE RLS-Check auf studio_members machen,
-- und studio_members.select Policy die direkt auth.uid() prüft ohne Helper.

-- 1. Erstelle sichere Helper-Funktionen die RLS umgehen
CREATE OR REPLACE FUNCTION public.is_member_safe(p_studio_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.studio_members m
    WHERE m.studio_id = p_studio_id
      AND m.profile_id = auth.uid()
      AND m.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_safe(p_studio_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.studio_members m
    WHERE m.studio_id = p_studio_id
      AND m.profile_id = auth.uid()
      AND m.is_active = true
      AND m.role = 'admin'
  );
$$;

-- 2. Funktion um zu prüfen ob User überhaupt ein Member von IRGENDEINEM Studio ist
CREATE OR REPLACE FUNCTION public.is_any_studio_member()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.studio_members m
    WHERE m.profile_id = auth.uid()
      AND m.is_active = true
  );
$$;

-- Erlaube allen authentifizierten Usern die Funktionen auszuführen
GRANT EXECUTE ON FUNCTION public.is_member_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_any_studio_member() TO authenticated;

-- 3. Fixe studio_members Policy - User kann nur seine eigene Mitgliedschaft sehen
DROP POLICY IF EXISTS studio_members_select ON public.studio_members;
DROP POLICY IF EXISTS studio_members_insert_admin ON public.studio_members;
DROP POLICY IF EXISTS studio_members_update_admin ON public.studio_members;
DROP POLICY IF EXISTS studio_members_delete_admin ON public.studio_members;

-- SELECT: User kann seine eigene Zeile sehen ODER wenn er Admin eines Studios ist
CREATE POLICY studio_members_select ON public.studio_members
FOR SELECT USING (
  profile_id = (SELECT auth.uid())
  OR public.is_admin_safe(studio_id)
);

-- INSERT: Nur Admins können neue Members hinzufügen
CREATE POLICY studio_members_insert_admin ON public.studio_members
FOR INSERT WITH CHECK (
  public.is_admin_safe(studio_id)
);

-- UPDATE: Nur Admins können Members updaten
CREATE POLICY studio_members_update_admin ON public.studio_members
FOR UPDATE USING (public.is_admin_safe(studio_id))
WITH CHECK (public.is_admin_safe(studio_id));

-- DELETE: Nur Admins können Members löschen
CREATE POLICY studio_members_delete_admin ON public.studio_members
FOR DELETE USING (public.is_admin_safe(studio_id));

-- 4. Update Services Policy für public SELECT (Demo-Seite braucht das)
DROP POLICY IF EXISTS services_select ON public.services;

-- Services können von allen gesehen werden (für Buchungsseite)
-- Aber nur Members können sie bearbeiten
CREATE POLICY services_select_public ON public.services
FOR SELECT USING (true);

-- 5. Stelle sicher dass Studios öffentlich sichtbar sind
DROP POLICY IF EXISTS studios_select ON public.studios;
CREATE POLICY studios_select_public ON public.studios
FOR SELECT USING (true);

-- ============================================
-- Debug: Check current user's memberships
-- ============================================
-- SELECT * FROM studio_members WHERE profile_id = auth.uid();
