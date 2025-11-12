# IdeaCapture - End-to-End Testing Guide

## 🔧 Issues Fixed

### Authentication/Login Issue (RESOLVED ✅)
**Problem:** User couldn't log in - authentication middleware wasn't being applied.

**Root Cause:**
- Next.js 16 changed middleware to use `proxy.ts` pattern
- The `proxy.ts` file existed but wasn't protecting new Phase 2 routes
- The protected routes list didn't include `/projects` and `/tasks`
- Public routes list didn't include `/forgot-password`, `/reset-password`, `/terms`, `/privacy`
- API routes weren't excluded from the matcher

**Fix Applied:**
1. Updated `proxy.ts` to include all Phase 2 routes in protected routes
2. Added all public routes to the public routes list
3. Updated matcher to exclude API routes (they handle their own auth)
4. Fixed redirect logic to properly handle authenticated users on login/signup pages

**Status:** ✅ Fixed. Authentication should now work correctly.

---

## 🚀 How to Test Locally

### Prerequisites
1. Ensure you're on the correct branch:
   ```bash
   git status  # Should show: claude/ideacapture-pwa-foundation-011CUyCTCzVT9jXKUJtNP3qn
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to: http://localhost:3000

---

## 📋 Test Plan: Complete End-to-End Flow

### Phase 1: Authentication Testing

#### Test 1.1: Signup Flow
1. Navigate to http://localhost:3000
2. Should redirect to `/login` (you're not authenticated)
3. Click "Sign up" link
4. Fill in signup form:
   - Email: `test@example.com` (or your email)
   - Password: `TestPassword123!`
5. Click "Sign Up"
6. **Expected:** Should redirect to home `/`
7. **Verify:** You should see the home page with bottom navigation

#### Test 1.2: Logout Flow
1. Navigate to `/settings`
2. Click "Sign Out" button
3. **Expected:** Should redirect to `/login`
4. **Verify:** You're logged out and can't access protected routes

#### Test 1.3: Login Flow
1. On `/login` page
2. Enter your credentials:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
3. Click "Sign In"
4. **Expected:** Should redirect to home `/`
5. **Verify:** Bottom navigation is visible, showing you're authenticated

#### Test 1.4: Protected Route Access (Unauthenticated)
1. Log out if logged in
2. Try to navigate directly to:
   - http://localhost:3000/ideas
   - http://localhost:3000/projects
   - http://localhost:3000/tasks
   - http://localhost:3000/settings
3. **Expected:** All should redirect to `/login`

#### Test 1.5: Public Route Access (Authenticated)
1. Log in
2. Try to navigate to:
   - http://localhost:3000/login
   - http://localhost:3000/signup
3. **Expected:** Both should redirect to home `/`

---

### Phase 2: Ideas Testing

#### Test 2.1: Create Idea
1. Navigate to `/ideas`
2. Click the "+" FAB button (bottom right)
3. Enter idea title: "Mobile App for Pet Owners"
4. Enter description: "An app to track pet health, vet appointments, and vaccinations"
5. Click "Save Idea"
6. **Expected:** Idea appears in the list
7. **Verify:** Idea card shows title and "captured" status badge

#### Test 2.2: Voice Recording (Optional - requires microphone)
1. Click "+" FAB button
2. Click microphone icon
3. Grant microphone permission if asked
4. Speak your idea
5. Click "Save Idea"
6. **Expected:** Transcribed text appears in description
7. **Verify:** Idea is saved with transcription

#### Test 2.3: Refine Idea
1. Click on an idea card
2. On the idea detail page, click "Refine Idea"
3. Answer 2-3 questions from Claude:
   - Type thoughtful answers
   - Click "Next Question" after each
4. Click "Finish Refinement"
5. **Expected:** Idea status changes to "refining" or "refined"
6. **Verify:** Your answers are visible on the idea detail page

#### Test 2.4: Validate Idea
1. On an idea detail page (must be refined first)
2. Click "Validate Idea"
3. **Expected:** Claude provides validation analysis
4. **Verify:**
   - Validation results appear
   - Status changes to "validated"
   - Pros/cons or validation summary is shown

---

### Phase 3: Projects Testing (NEW - Phase 2)

#### Test 3.1: Convert Idea to Project
1. Create and validate an idea (see Phase 2 above)
2. On the validated idea detail page
3. **Look for:** "Convert to Project" button with folder icon
4. Click "Convert to Project"
5. **Expected:**
   - Redirected to `/projects/[id]`
   - Idea status changes to "pursuing"
   - Project is created with same name/description

#### Test 3.2: View Projects List
1. Navigate to `/projects` (via bottom nav "Projects" tab)
2. **Verify:**
   - All your projects are listed
   - Each project shows:
     - Name
     - Description
     - Status badge (planning, active, paused, completed, abandoned)
     - Progress bar (0-100%)
     - Link to originating idea (if any)

#### Test 3.3: Generate Tasks for Project (AI)
1. Open a project detail page
2. Click "Generate Tasks" button (if implemented)
3. **Expected:**
   - Claude analyzes the project
   - Creates 20-30 tasks across 4 phases:
     - Research & Planning
     - Design
     - Development
     - Launch & Marketing
4. **Verify:**
   - Tasks appear in the tasks list
   - Each task has: title, description, type, priority, estimated hours
   - Tasks link back to the project

**Note:** If "Generate Tasks" button isn't visible on the project detail page UI, you can test the API directly:

```bash
# Get your project ID from the URL: /projects/[project-id]
# Replace [project-id] and [your-auth-token] below

curl -X POST http://localhost:3000/api/projects/[project-id]/generate-tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]"
```

---

### Phase 4: Tasks Testing (NEW - Phase 2)

#### Test 4.1: View Tasks List
1. Navigate to `/tasks` (via bottom nav)
2. **Verify:**
   - All tasks are listed
   - Filter buttons at top: All, Todo, In Progress, Done
   - Each task shows:
     - Circle checkbox (click to toggle)
     - Title
     - Project name (if linked)
     - Status badge
     - Priority badge
     - Estimated hours

#### Test 4.2: Filter Tasks by Status
1. On `/tasks` page
2. Click "Todo" filter
3. **Expected:** Only todo tasks visible
4. Click "In Progress" filter
5. **Expected:** Only in-progress tasks visible
6. Click "Done" filter
7. **Expected:** Only completed tasks visible
8. Click "All" filter
9. **Expected:** All tasks visible again

#### Test 4.3: Toggle Task Completion
1. Find a "todo" task
2. Click the circle checkbox
3. **Expected:**
   - Circle fills with checkmark
   - Status updates to "done"
   - If filtering by "Todo", task disappears (moves to "Done")
4. Click the checkbox again
5. **Expected:**
   - Checkmark disappears
   - Status returns to "todo"

#### Test 4.4: Create Manual Task
1. On `/tasks` page, look for "+" or "New Task" button
2. Fill in task details:
   - Title: "Research competitor pricing"
   - Description: "Compare pricing models of top 3 competitors"
   - Type: "research"
   - Priority: "high"
   - Estimated hours: 4
3. Click "Create Task"
4. **Expected:** Task appears in the list

**Note:** If manual task creation UI isn't implemented yet, you can test via API:

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "title": "Research competitor pricing",
    "description": "Compare pricing models of top 3 competitors",
    "task_type": "research",
    "priority": "high",
    "estimated_hours": 4,
    "status": "todo"
  }'
```

---

### Phase 5: Settings & Subscription Testing

#### Test 5.1: View Settings
1. Navigate to `/settings`
2. **Verify:**
   - User email is displayed
   - Subscription status shown
   - Export/Delete buttons visible
   - Sign Out button works

#### Test 5.2: Export Ideas
1. On `/settings` page
2. Click "Export Ideas as JSON"
3. **Expected:** Download starts with JSON file
4. Open the JSON file
5. **Verify:** Contains all your ideas with full details

#### Test 5.3: Subscription (Stripe Live Mode)
1. Navigate to `/subscribe`
2. **Verify:**
   - Monthly and yearly plans displayed
   - Stripe publishable key is LIVE (starts with `pk_live_`)
   - Prices match your Stripe dashboard
3. Click "Subscribe Monthly"
4. **Expected:** Redirected to Stripe checkout
5. **DO NOT COMPLETE** unless you want to actually subscribe
6. Cancel checkout and return

---

### Phase 6: Navigation Testing

#### Test 6.1: Bottom Navigation
1. Check bottom navigation bar on mobile/narrow viewport
2. **Verify all 4 tabs are present:**
   - Home (house icon)
   - Projects (folder icon) - NEW in Phase 2
   - Ideas (lightbulb icon)
   - Settings (gear icon)
3. Click each tab
4. **Expected:** Navigates to correct page

#### Test 6.2: Mind Map (Legacy)
1. Navigate to `/mindmap`
2. **Expected:** Mind map page loads (may show empty or stub)
3. **Note:** Mind Map is being phased out in favor of Projects

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found: '@supabase/ssr'"
**Solution:** Already fixed in package.json. Run `npm install` to ensure dependencies are installed.

### Issue: Can't log in - keeps redirecting to login
**Solution:** Already fixed in proxy.ts. Make sure you're running the latest code from the branch.

### Issue: proxy.ts not found error during build
**Solution:** The proxy.ts file should be in the root directory. It's been updated with correct routes.

### Issue: API returns 401 Unauthorized
**Possible Causes:**
1. Not logged in - login first
2. Session expired - logout and login again
3. CORS issue - check API response headers

**Solution:** Clear browser cookies, logout, login again.

### Issue: Tasks don't appear after generation
**Check:**
1. Open browser dev tools → Network tab
2. Look for POST request to `/api/projects/[id]/generate-tasks`
3. Check response - should return 200 with task array
4. If 500 error, check:
   - `ANTHROPIC_API_KEY` is set correctly in `.env.local`
   - Supabase migration has been run (tasks table exists)

### Issue: Progress bars don't show
**This is normal:** Progress percentage is 0% by default. You can update it via:
- Project edit UI (if implemented)
- API PATCH request to `/api/projects/[id]` with `progress_percentage` field

---

## 🧪 API Testing with cURL

If you want to test APIs directly:

### Get Auth Token
1. Login via browser
2. Open Dev Tools → Application → Cookies
3. Copy the `sb-[project]-auth-token` cookie value
4. Use in API requests as Cookie header

### Test Ideas API
```bash
# List all ideas
curl -H "Cookie: [your-cookie]" http://localhost:3000/api/ideas

# Create idea
curl -X POST http://localhost:3000/api/ideas \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-cookie]" \
  -d '{"title":"Test Idea","description":"Test description"}'

# Get specific idea
curl -H "Cookie: [your-cookie]" http://localhost:3000/api/ideas/[idea-id]
```

### Test Projects API
```bash
# List all projects
curl -H "Cookie: [your-cookie]" http://localhost:3000/api/projects

# Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-cookie]" \
  -d '{"name":"Test Project","description":"Test desc","status":"planning"}'

# Generate tasks for project
curl -X POST http://localhost:3000/api/projects/[project-id]/generate-tasks \
  -H "Cookie: [your-cookie]"
```

### Test Tasks API
```bash
# List all tasks
curl -H "Cookie: [your-cookie]" http://localhost:3000/api/tasks

# Filter tasks by status
curl -H "Cookie: [your-cookie]" "http://localhost:3000/api/tasks?status=todo"

# Update task status
curl -X PATCH http://localhost:3000/api/tasks/[task-id] \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-cookie]" \
  -d '{"status":"done"}'
```

---

## ✅ Test Completion Checklist

Use this checklist to verify all functionality:

**Authentication:**
- [ ] Can sign up with new account
- [ ] Can log in with existing account
- [ ] Can log out
- [ ] Protected routes redirect to login when not authenticated
- [ ] Login/signup redirect to home when authenticated

**Ideas:**
- [ ] Can create new idea
- [ ] Can view ideas list
- [ ] Can open idea detail page
- [ ] Can refine idea (answer questions)
- [ ] Can validate idea
- [ ] Status badges update correctly

**Projects (Phase 2):**
- [ ] Can convert validated idea to project
- [ ] Can view projects list
- [ ] Projects show correct info (name, description, status, progress)
- [ ] Projects link back to originating idea
- [ ] Can navigate to project detail page

**Tasks (Phase 2):**
- [ ] Can view tasks list
- [ ] Can filter tasks by status (All, Todo, In Progress, Done)
- [ ] Can toggle task completion (click circle)
- [ ] Tasks show correct info (title, project, priority, hours)
- [ ] Task status updates in real-time

**AI Features:**
- [ ] Idea refinement asks relevant questions
- [ ] Idea validation provides meaningful analysis
- [ ] Task generation creates 20-30 tasks across 4 phases

**Navigation:**
- [ ] Bottom nav shows all 4 tabs (Home, Projects, Ideas, Settings)
- [ ] Can navigate between all pages
- [ ] URLs update correctly

**Build & Deploy:**
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors
- [ ] No console errors in browser

---

## 🚀 Next Steps After Testing

Once you've verified everything works locally:

1. **Run Supabase Migration** (if not done yet)
   - See DEPLOYMENT_INSTRUCTIONS.md Step 1

2. **Deploy to Vercel**
   - Push should trigger automatic deployment
   - Or manually deploy from Vercel dashboard

3. **Test on Production**
   - Run through this same test plan on your live URL
   - Verify Stripe webhooks are working
   - Check that AI features work with production Anthropic API key

4. **Monitor for Issues**
   - Check Vercel logs for errors
   - Monitor Supabase logs for database issues
   - Check Stripe dashboard for successful subscriptions

---

## 📞 Need Help?

If you encounter issues during testing:

1. **Check Browser Console** - Look for JavaScript errors
2. **Check Network Tab** - See what API requests are failing
3. **Check Vercel Logs** - If deployed, check deployment logs
4. **Check Supabase Logs** - SQL Editor → Logs for database errors
5. **Check Environment Variables** - Ensure all keys are set correctly

Happy testing! 🎉
