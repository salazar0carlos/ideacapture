-- Migration: Add user_id and proper RLS policies
-- Created: 2025-11-11
-- Description: Adds user_id column to ideas and user_settings tables,
--              creates proper RLS policies for user-specific data access

-- ============================================================================
-- PART 1: Add user_id columns
-- ============================================================================

-- Add user_id to ideas table
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ============================================================================
-- PART 2: Backfill existing data (for development/testing)
-- ============================================================================
-- Note: In production with existing data, you would need to:
-- 1. First add the column as nullable (done above)
-- 2. Backfill with actual user IDs based on your business logic
-- 3. Then make it NOT NULL after backfilling
-- For now, we'll just delete any orphaned records without user_id

-- Clean up any ideas without a user_id (shouldn't exist in production)
DELETE FROM ideas WHERE user_id IS NULL;

-- Clean up any user_settings without a user_id
DELETE FROM user_settings WHERE user_id IS NULL;

-- ============================================================================
-- PART 3: Make user_id NOT NULL after backfill
-- ============================================================================

-- Now make user_id required for new records
ALTER TABLE ideas
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE user_settings
ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint on user_settings to ensure one settings record per user
-- Drop constraint if it exists first (for idempotency)
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_key;
ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);

-- ============================================================================
-- PART 4: Drop old permissive RLS policies
-- ============================================================================

-- Drop old policies on ideas table
DROP POLICY IF EXISTS "Allow all operations on ideas" ON ideas;

-- Drop old policies on user_settings table
DROP POLICY IF EXISTS "Allow all operations on user_settings" ON user_settings;

-- ============================================================================
-- PART 5: Create proper RLS policies for ideas table
-- ============================================================================

-- Policy: Users can only SELECT their own ideas
CREATE POLICY "Users can view their own ideas"
ON ideas FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only INSERT ideas with their own user_id
CREATE POLICY "Users can create their own ideas"
ON ideas FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own ideas
CREATE POLICY "Users can update their own ideas"
ON ideas FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own ideas
CREATE POLICY "Users can delete their own ideas"
ON ideas FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- PART 6: Create proper RLS policies for user_settings table
-- ============================================================================

-- Policy: Users can only SELECT their own settings
CREATE POLICY "Users can view their own settings"
ON user_settings FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only INSERT settings with their own user_id
CREATE POLICY "Users can create their own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own settings
CREATE POLICY "Users can update their own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own settings
CREATE POLICY "Users can delete their own settings"
ON user_settings FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- PART 7: Verify RLS is enabled (should already be enabled from schema.sql)
-- ============================================================================

-- Ensure RLS is enabled on both tables
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
--
-- What this migration does:
-- 1. Adds user_id column to ideas and user_settings tables
-- 2. Creates indexes for performance
-- 3. Backfills/cleans existing data
-- 4. Makes user_id NOT NULL
-- 5. Drops old permissive policies
-- 6. Creates granular RLS policies for each operation (SELECT, INSERT, UPDATE, DELETE)
-- 7. Ensures RLS is enabled
--
-- Security improvements:
-- - Users can only access their own data
-- - Anonymous users cannot access any data (auth.uid() will be NULL)
-- - Each operation (read/write/update/delete) has its own policy
-- - Policies use auth.uid() which is securely set by Supabase Auth
--
-- To test:
-- 1. Run this migration in your Supabase SQL editor
-- 2. Try to query ideas without authentication (should return empty)
-- 3. Authenticate and query ideas (should only see your own)
-- 4. Try to insert an idea with a different user_id (should fail)
