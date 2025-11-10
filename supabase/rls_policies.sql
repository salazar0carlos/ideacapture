-- Row-Level Security (RLS) Policies
-- Run this SQL in your Supabase SQL Editor
-- IMPORTANT: Run this AFTER the add_user_id_migration.sql

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on ideas table
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- IDEAS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can insert their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can delete their own ideas" ON ideas;

-- SELECT: Users can only view their own ideas
CREATE POLICY "Users can view their own ideas"
ON ideas FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only insert ideas with their own user_id
CREATE POLICY "Users can insert their own ideas"
ON ideas FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own ideas
CREATE POLICY "Users can update their own ideas"
ON ideas FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own ideas
CREATE POLICY "Users can delete their own ideas"
ON ideas FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- USER_SETTINGS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

-- SELECT: Users can only view their own settings
CREATE POLICY "Users can view their own settings"
ON user_settings FOR SELECT
USING (auth.uid() = id);

-- INSERT: Users can only insert settings with their own user_id
CREATE POLICY "Users can insert their own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = id);

-- UPDATE: Users can only update their own settings
CREATE POLICY "Users can update their own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- VERIFY RLS IS ENABLED
-- ============================================

-- Check that RLS is enabled on all tables
DO $$
DECLARE
  ideas_rls_enabled BOOLEAN;
  settings_rls_enabled BOOLEAN;
BEGIN
  SELECT relrowsecurity INTO ideas_rls_enabled
  FROM pg_class
  WHERE relname = 'ideas';

  SELECT relrowsecurity INTO settings_rls_enabled
  FROM pg_class
  WHERE relname = 'user_settings';

  IF ideas_rls_enabled AND settings_rls_enabled THEN
    RAISE NOTICE 'SUCCESS! RLS is enabled on all tables.';
    RAISE NOTICE 'Ideas table policies: 4 created (SELECT, INSERT, UPDATE, DELETE)';
    RAISE NOTICE 'User settings policies: 3 created (SELECT, INSERT, UPDATE)';
  ELSE
    RAISE EXCEPTION 'RLS is not enabled on all tables!';
  END IF;
END $$;
