-- ============================================
-- Mache den aktuellen User zum Admin
-- ============================================

-- Zuerst: Zeige alle User und Studios
SELECT 'Users:' as info;
SELECT id, email FROM auth.users;

SELECT 'Studios:' as info;
SELECT id, name FROM studios;

SELECT 'Current studio_members:' as info;
SELECT * FROM studio_members;

-- ============================================
-- INSERT: Füge den User als Admin hinzu
-- ============================================
-- Ersetze die UUIDs mit deinen echten Werten!

-- Für User: 2f0a240d-1835-44a0-ba53-e2fe8a85805e
-- Wir brauchen noch die Studio-ID

DO $$
DECLARE
  v_studio_id uuid;
  v_user_id uuid := '2f0a240d-1835-44a0-ba53-e2fe8a85805e';
BEGIN
  -- Hole das erste Studio
  SELECT id INTO v_studio_id FROM studios LIMIT 1;
  
  IF v_studio_id IS NULL THEN
    RAISE EXCEPTION 'Kein Studio gefunden! Erstelle zuerst ein Studio.';
  END IF;
  
  -- Lösche eventuelle alte Einträge
  DELETE FROM studio_members WHERE profile_id = v_user_id;
  
  -- Füge als Admin hinzu
  INSERT INTO studio_members (studio_id, profile_id, role, is_active)
  VALUES (v_studio_id, v_user_id, 'admin', true);
  
  RAISE NOTICE 'User % wurde als Admin zu Studio % hinzugefügt!', v_user_id, v_studio_id;
END $$;

-- Verifiziere
SELECT 'Nach dem Insert:' as info;
SELECT sm.*, s.name as studio_name, u.email 
FROM studio_members sm
JOIN studios s ON s.id = sm.studio_id
JOIN auth.users u ON u.id = sm.profile_id;
