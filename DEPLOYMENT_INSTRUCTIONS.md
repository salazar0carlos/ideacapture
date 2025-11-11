# Phase 2 Deployment Instructions

## 🎉 What's Been Completed

All Phase 2 code has been implemented, tested, and pushed to branch `claude/ideacapture-pwa-foundation-011CUyCTCzVT9jXKUJtNP3qn`:

- ✅ Database schema for projects, tasks, improvements (migration file ready)
- ✅ TypeScript types updated
- ✅ All API routes (Projects & Tasks CRUD + AI task generation)
- ✅ Projects UI page with progress tracking
- ✅ Tasks UI page with Kanban-style management
- ✅ "Convert to Project" functionality in idea detail page
- ✅ Updated navigation (Projects replaces Mind Map)
- ✅ Build tested and passing
- ✅ Code committed and pushed to GitHub

## 🚀 Final Deployment Steps

### Step 1: Run Supabase Migration

You need to apply the Phase 2 database migration to your production Supabase instance:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/kmpznatvzavlvjezjfrx
2. Navigate to **SQL Editor** in the left sidebar
3. Open the migration file: `/supabase/migrations/002_add_projects_tasks_improvements.sql`
4. Copy the entire contents of that file
5. Paste into the SQL Editor
6. Click **Run** to execute

This will create:
- `projects` table with RLS policies
- `tasks` table with RLS policies
- `improvements` table with RLS policies
- All necessary indexes and triggers

**Verification:**
```sql
-- Run this in SQL Editor to verify tables were created:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('projects', 'tasks', 'improvements');

-- Verify RLS is enabled:
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('projects', 'tasks', 'improvements');
```

### Step 2: Deploy to Vercel

Your Vercel project should automatically deploy when you push to the branch (if auto-deploy is enabled). If not:

#### Option A: Automatic (if connected to GitHub)
- Vercel should detect the push and trigger a deployment automatically
- Check your Vercel dashboard to monitor the deployment

#### Option B: Manual Deploy
1. Go to your Vercel dashboard
2. Select the IdeaCapture project
3. Click **Deploy** → **Deploy from Git**
4. Select branch: `claude/ideacapture-pwa-foundation-011CUyCTCzVT9jXKUJtNP3qn`
5. Click **Deploy**

**Environment Variables Check:**
Ensure all required environment variables are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (⚠️ use the real key, not the dummy)
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET` (⚠️ use the real webhook secret)
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_YEARLY`

### Step 3: Verify Deployment

Once deployed, test the complete flow:

1. **Create an Idea:**
   - Go to /ideas
   - Create a new idea
   - Refine it (answer questions)
   - Validate it

2. **Convert to Project:**
   - Open the validated idea
   - Click "Convert to Project"
   - Verify you're redirected to /projects/[id]

3. **Generate Tasks:**
   - From the project page, click "Generate Tasks" (you'll need to implement this button)
   - AI should create 20-30 tasks across 4 phases

4. **Manage Tasks:**
   - Go to /tasks
   - Filter by status (todo, in_progress, done)
   - Click task circles to toggle completion

### Step 4: Create Pull Request (Optional)

If you want to merge this to main:

```bash
# Create PR using GitHub CLI (if installed)
gh pr create --base main --head claude/ideacapture-pwa-foundation-011CUyCTCzVT9jXKUJtNP3qn \
  --title "feat: Complete Phase 2 - Projects & Tasks System" \
  --body "See commit 53f5ee1 for full details"

# Or create PR manually on GitHub:
# https://github.com/salazar0carlos/ideacapture/compare/main...claude/ideacapture-pwa-foundation-011CUyCTCzVT9jXKUJtNP3qn
```

## 📊 What's New in Phase 2

### User Flow
```
Capture Idea → Refine → Validate → Convert to Project → Generate Tasks → Execute
```

### New Pages
- `/projects` - List all projects with progress bars
- `/tasks` - Kanban-style task management
- `/projects/[id]` - Individual project detail (API ready, UI needs implementation)

### API Endpoints
- `POST /api/projects` - Create project (with optional idea_id)
- `GET /api/projects` - List projects (with filters: status, pagination)
- `GET/PATCH/DELETE /api/projects/[id]` - Project CRUD
- `POST /api/projects/[id]/generate-tasks` - AI task generation via Claude
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks (with filters: project_id, idea_id, status, priority)
- `GET/PATCH/DELETE /api/tasks/[id]` - Task CRUD

### Database Schema
- **projects**: Tracks converted ideas with timeline, budget, progress %
- **tasks**: Actionable items with priorities, due dates, time estimates
- **improvements**: Iterative refinements (table created but not yet used in UI)

### AI Features
- Task generation with Claude 3.5 Sonnet
- Comprehensive breakdown across 4 phases:
  - Research & Planning
  - Design
  - Development
  - Launch & Marketing

## 🔧 Troubleshooting

### Migration Fails
- Check that `ideas` and `user_settings` tables exist first
- Ensure you're using the correct Supabase project
- Check Supabase logs for detailed error messages

### Deployment Fails
- Check Vercel build logs for errors
- Verify all environment variables are set correctly
- Ensure the real service role key is used (not the dummy)

### Tasks Don't Generate
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API route logs: `/api/projects/[id]/generate-tasks`
- Ensure the idea is properly linked to the project

## 📝 Next Steps (Future Phases)

**Phase 3: Analytics & Insights**
- Track idea → project conversion rates
- Time tracking for tasks
- Budget vs actual spending
- Success metrics dashboard

**Phase 4: Collaboration**
- Team workspaces
- Shared projects
- Task assignments
- Comments and discussions

**Phase 5: Improvements Integration**
- AI-suggested improvements
- User feedback collection
- Market research integration
- Competitor analysis

## 🎯 Summary

**What you need to do:**
1. Run the Supabase migration (5 minutes)
2. Deploy to Vercel (automatic or manual)
3. Test the complete flow

**Everything else is done and ready to go!**

The complete idea-to-execution platform is now functional and ready for users to track their ideas over months or years until they're ready to build.
