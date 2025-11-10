-- IdeaCapture Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ideas Table
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    idea_type TEXT NOT NULL CHECK (idea_type IN ('tech', 'business', 'product', 'content', 'other')),
    audio_transcript TEXT,

    -- Refinement fields
    refinement_questions JSONB,
    refinement_answers JSONB,
    refinement_complete BOOLEAN DEFAULT FALSE,

    -- Validation fields
    validation_result JSONB,
    validation_enabled BOOLEAN DEFAULT FALSE,
    demand_score INTEGER CHECK (demand_score >= 0 AND demand_score <= 100),
    competition_score INTEGER CHECK (competition_score >= 0 AND competition_score <= 100),
    feasibility_score INTEGER CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    is_worth_pursuing BOOLEAN,

    -- Status and metadata
    status TEXT DEFAULT 'captured' CHECK (status IN ('captured', 'refining', 'validated', 'pursuing', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    validation_enabled BOOLEAN DEFAULT FALSE,
    default_view TEXT DEFAULT 'list' CHECK (default_view IN ('list', 'grid', 'mindmap')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_idea_type ON ideas(idea_type);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_is_worth_pursuing ON ideas(is_worth_pursuing);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on ideas table
CREATE TRIGGER update_ideas_updated_at
    BEFORE UPDATE ON ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Note: For this foundation version, we're allowing all operations
-- In production, you'll want to add proper authentication and user-specific policies

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (update these for production with proper auth)
CREATE POLICY "Allow all operations on ideas" ON ideas
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_settings" ON user_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Insert default user settings
INSERT INTO user_settings (validation_enabled, default_view)
VALUES (false, 'list')
ON CONFLICT (id) DO NOTHING;

-- Sample data (optional - remove in production)
-- INSERT INTO ideas (title, description, idea_type, status)
-- VALUES
--     ('AI-powered meeting notes', 'Automatically transcribe and summarize meetings with action items', 'tech', 'captured'),
--     ('Local coffee subscription', 'Monthly subscription box featuring different local roasters', 'business', 'captured'),
--     ('Smart water bottle', 'Water bottle that tracks hydration and syncs with fitness apps', 'product', 'captured');
