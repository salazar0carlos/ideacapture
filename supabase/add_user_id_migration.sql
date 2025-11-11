-- Migration: Add user_id columns and foreign keys
-- Run this SQL in your Supabase SQL Editor
-- IMPORTANT: Run this before enabling RLS policies

-- Add user_id column to ideas table
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS ideas_user_id_idx ON ideas(user_id);

-- Update user_settings table to use id as user_id (it should already be UUID)
-- The user_settings.id column already exists and should reference auth.users
-- We just need to ensure the foreign key constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_settings_id_fkey'
  ) THEN
    ALTER TABLE user_settings
    ADD CONSTRAINT user_settings_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index on user_settings.id for better query performance
CREATE INDEX IF NOT EXISTS user_settings_id_idx ON user_settings(id);

-- Optional: Add created_at and updated_at triggers for ideas table if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
CREATE TRIGGER update_ideas_updated_at
    BEFORE UPDATE ON ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! user_id columns and indexes added.';
END $$;
