-- ============================================
-- Check if your user is an admin
-- ============================================

-- 1. First, find your user ID from profiles
-- Replace 'your-email@example.com' with your actual email
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- 2. Check if there's a studio_members entry for your user
-- Replace 'YOUR-USER-ID' with the ID from step 1
SELECT * FROM studio_members WHERE profile_id = 'YOUR-USER-ID';

-- 3. If no entry exists, create one with admin role
-- Replace values accordingly:
-- - STUDIO_ID: Get from studios table (SELECT id FROM studios LIMIT 1;)
-- - YOUR-USER-ID: Your user ID from step 1

-- First, get studio ID:
SELECT id FROM studios LIMIT 1;

-- Then insert admin membership:
-- INSERT INTO studio_members (studio_id, profile_id, role)
-- VALUES ('STUDIO-ID-HERE', 'YOUR-USER-ID-HERE', 'admin');

-- Or update existing entry to admin:
-- UPDATE studio_members SET role = 'admin' WHERE profile_id = 'YOUR-USER-ID-HERE';

-- ============================================
-- Quick fix: Make current user admin
-- ============================================
-- This will make the first user in the system an admin of the first studio

DO $$
DECLARE
  v_user_id uuid;
  v_studio_id uuid;
BEGIN
  -- Get first user
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  -- Get first studio
  SELECT id INTO v_studio_id FROM studios LIMIT 1;
  
  IF v_user_id IS NOT NULL AND v_studio_id IS NOT NULL THEN
    -- Insert or update studio_members
    INSERT INTO studio_members (studio_id, profile_id, role)
    VALUES (v_studio_id, v_user_id, 'admin')
    ON CONFLICT (studio_id, profile_id) 
    DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'Made user % admin of studio %', v_user_id, v_studio_id;
  ELSE
    RAISE NOTICE 'No user or studio found!';
  END IF;
END $$;
