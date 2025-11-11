-- Phase 2 Migration: Projects, Tasks, and Improvements
-- Created: 2025-11-11
-- Description: Adds full idea-to-execution lifecycle tracking

-- ============================================================================
-- PART 1: Projects Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,

  -- Project info
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'abandoned')),

  -- Timeline
  start_date TIMESTAMPTZ,
  target_completion_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,

  -- Progress
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Resources
  estimated_hours INTEGER,
  actual_hours INTEGER,
  budget_usd DECIMAL(10,2),
  spent_usd DECIMAL(10,2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_idea_id ON projects(idea_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- ============================================================================
-- PART 2: Tasks Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- Task info
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('research', 'design', 'development', 'testing', 'marketing', 'other')),

  -- Status
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),

  -- Timeline
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),

  -- Dependencies
  blockers TEXT[],

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_idea_id ON tasks(idea_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- ============================================================================
-- PART 3: Improvements Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS improvements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Improvement info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  improvement_type TEXT CHECK (improvement_type IN ('feature', 'optimization', 'bug_fix', 'pivot', 'insight', 'other')),

  -- Source
  source TEXT CHECK (source IN ('user', 'ai_suggestion', 'user_feedback', 'market_research', 'competitor_analysis')),
  source_details TEXT,

  -- Impact
  impact_level TEXT CHECK (impact_level IN ('minor', 'moderate', 'major', 'critical')),
  effort_estimate TEXT CHECK (effort_estimate IN ('trivial', 'small', 'medium', 'large', 'huge')),

  -- Status
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'implementing', 'completed', 'rejected')),

  -- Results
  outcome TEXT,
  metrics_before JSONB,
  metrics_after JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  implemented_at TIMESTAMPTZ
);

-- Indexes for improvements
CREATE INDEX IF NOT EXISTS idx_improvements_user_id ON improvements(user_id);
CREATE INDEX IF NOT EXISTS idx_improvements_idea_id ON improvements(idea_id);
CREATE INDEX IF NOT EXISTS idx_improvements_project_id ON improvements(project_id);
CREATE INDEX IF NOT EXISTS idx_improvements_status ON improvements(status);

-- ============================================================================
-- PART 4: Triggers for auto-updating timestamps
-- ============================================================================

-- Projects updated_at trigger
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tasks updated_at trigger
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Improvements updated_at trigger
CREATE TRIGGER update_improvements_updated_at
    BEFORE UPDATE ON improvements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 5: Row Level Security Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvements ENABLE ROW LEVEL SECURITY;

-- Projects RLS Policies
CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);

-- Tasks RLS Policies
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- Improvements RLS Policies
CREATE POLICY "Users can view their own improvements"
ON improvements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own improvements"
ON improvements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own improvements"
ON improvements FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own improvements"
ON improvements FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
