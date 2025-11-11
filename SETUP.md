# IdeaCapture Setup Guide

This comprehensive guide will walk you through setting up IdeaCapture from scratch. Follow each step carefully to ensure a smooth setup process.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting the Code](#getting-the-code)
3. [Installing Dependencies](#installing-dependencies)
4. [Setting Up Supabase](#setting-up-supabase)
5. [Getting Anthropic API Key](#getting-anthropic-api-key)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Running the Application](#running-the-application)
9. [Testing Checklist](#testing-checklist)
10. [Common Issues](#common-issues)

---

## Prerequisites

Before you begin, make sure you have the following installed and ready:

### Required Software

- **Node.js** (version 18.0.0 or higher)
  - Check version: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)

- **npm** (comes with Node.js, version 9.0.0 or higher)
  - Check version: `npm --version`

- **Git** (for version control)
  - Check version: `git --version`
  - Download: [git-scm.com](https://git-scm.com/)

### Required Accounts

- **GitHub Account** (for repository hosting)
  - Sign up at [github.com](https://github.com)

- **Supabase Account** (for database and authentication)
  - Sign up at [supabase.com](https://supabase.com)
  - Free tier is sufficient for development and small-scale production

- **Anthropic Account** (for Claude AI API)
  - Sign up at [console.anthropic.com](https://console.anthropic.com)
  - Requires credit card for API access
  - Pay-as-you-go pricing (very affordable)

---

## Getting the Code

### Option 1: Clone the Repository

If you have access to the repository:

```bash
git clone https://github.com/salazar0carlos/ideacapture.git
cd ideacapture
```

### Option 2: Download as ZIP

1. Go to the repository on GitHub
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open terminal and navigate to the extracted folder

```bash
cd path/to/ideacapture
```

---

## Installing Dependencies

Install all required Node.js packages:

```bash
npm install
```

This will install:
- **Next.js** - Framework
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Supabase** - Database client
- **Anthropic SDK** - AI API client
- **React Flow** - Mind map visualization
- And more...

**Expected time**: 1-3 minutes depending on internet speed

---

## Setting Up Supabase

Supabase provides your database and authentication system.

### Step 1: Create a New Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email
4. Click "New project"

### Step 2: Configure Your Project

Fill in the project details:

- **Organization**: Create new or select existing
- **Project Name**: `ideacapture` (or any name you prefer)
- **Database Password**: Create a strong password (save this securely!)
- **Region**: Choose closest to your users
- **Pricing Plan**: Free (sufficient for development)

Click "Create new project" and wait 1-2 minutes for setup to complete.

### Step 3: Get Your API Keys

Once the project is created:

1. Click on the "Settings" icon (gear) in the sidebar
2. Go to "API" section
3. You'll need two values:
   - **Project URL** (labeled as "URL")
   - **anon public** key (under "Project API keys")

**Keep this tab open** - you'll need these values in the next step.

### Step 4: Configure Authentication

1. In Supabase dashboard, go to "Authentication" → "Providers"
2. Ensure **Email** provider is enabled (it should be by default)
3. Configure email templates (optional):
   - Go to "Authentication" → "Email Templates"
   - Customize confirmation and reset password emails

---

## Getting Anthropic API Key

Anthropic provides the Claude AI that powers idea refinement and validation.

### Step 1: Create an Anthropic Account

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click "Sign up" or "Sign in"
3. Complete the registration process
4. Add a payment method (required for API access)

### Step 2: Create an API Key

1. After logging in, go to "API Keys" section
2. Click "Create Key"
3. Give it a name: `IdeaCapture Development`
4. Click "Create Key"
5. **Copy the API key immediately** - it won't be shown again!

### Step 3: Understanding Costs

Claude API pricing (as of 2024):
- **Claude 3.5 Sonnet**: ~$3 per million input tokens, ~$15 per million output tokens
- **Typical costs for IdeaCapture**:
  - Refinement (5 questions): ~$0.01 per request
  - Validation (comprehensive analysis): ~$0.03 per request
  - Average usage: ~$1-5 per month for personal use

**Tip**: Set up budget alerts in the Anthropic console to monitor spending.

---

## Environment Variables

Environment variables store sensitive configuration data.

### Step 1: Create `.env.local` File

In your project root directory, create a new file named `.env.local`:

```bash
touch .env.local
```

Or create it manually using your text editor.

### Step 2: Add Your Variables

Open `.env.local` and add the following (replace with your actual values):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
```

### Step 3: Variable Explanations

| Variable | Purpose | Where to Find |
|----------|---------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase key (safe for client-side) | Supabase Dashboard → Settings → API → anon public |
| `ANTHROPIC_API_KEY` | Claude AI API key (server-side only) | Anthropic Console → API Keys |

### Important Notes

- **Never commit `.env.local`** to version control (it's already in `.gitignore`)
- **NEXT_PUBLIC_** prefix means the variable is exposed to the browser (safe for non-sensitive data)
- Variables without prefix are **server-side only** (safe for secrets like API keys)

---

## Database Setup

Now we'll create the database tables and security policies.

### Step 1: Open SQL Editor

1. In your Supabase dashboard, go to "SQL Editor"
2. Click "New query" button

### Step 2: Copy the Schema

Open the file `supabase/schema.sql` in your project and copy its entire contents.

### Step 3: Execute the Schema

1. Paste the schema SQL into the Supabase SQL Editor
2. Click "Run" button (or press Ctrl/Cmd + Enter)
3. Wait for "Success. No rows returned" message

### Step 4: Verify Tables Created

1. Go to "Table Editor" in the sidebar
2. You should see two new tables:
   - **ideas** - Stores all user ideas
   - **user_settings** - Stores user preferences

### Step 5: Check Row Level Security

1. Go to "Authentication" → "Policies"
2. Select the "ideas" table
3. You should see 4 policies:
   - Users can view their own ideas
   - Users can create their own ideas
   - Users can update their own ideas
   - Users can delete their own ideas

### What Was Created?

The schema creates:

**Ideas Table** with fields:
- `id` (UUID, primary key)
- `user_id` (references auth.users)
- `title`, `description`, `idea_type`
- `audio_transcript` (for voice recordings)
- `refinement_questions`, `refinement_answers` (JSON)
- `validation_result` (JSON with AI analysis)
- `demand_score`, `competition_score`, `feasibility_score`
- `is_worth_pursuing` (boolean recommendation)
- `status` (captured, refining, validated, pursuing, archived)
- Timestamps

**User Settings Table** with fields:
- `id` (UUID, primary key)
- `user_id` (references auth.users)
- `validation_enabled` (auto-validate new ideas)
- `default_view` (list, grid, mindmap)

**Security Policies**:
- Row Level Security (RLS) enabled
- Users can only access their own data
- Automatic user_id filtering

**Performance Indexes**:
- Indexes on user_id, created_at, idea_type, status

---

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

You should see:

```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

**Open your browser** to [http://localhost:3000](http://localhost:3000)

### Production Build

To build and run a production version:

```bash
# Build the application
npm run build

# Start production server
npm start
```

The build process:
1. Compiles TypeScript
2. Optimizes React components
3. Generates static pages
4. Minifies JavaScript and CSS
5. Creates service worker for PWA

**Expected build time**: 30-60 seconds

---

## Testing Checklist

Use this checklist to verify everything is working correctly.

### Basic Setup

- [ ] Application loads at http://localhost:3000
- [ ] No errors in browser console (F12)
- [ ] Gradient background displays correctly
- [ ] Bottom navigation is visible

### Authentication

- [ ] Click "Sign up" in navigation
- [ ] Create an account with email and password
- [ ] Receive confirmation (check email if enabled)
- [ ] Log in successfully
- [ ] See authenticated user interface

### Voice Recording

- [ ] Click "Start Recording" button
- [ ] Grant microphone permission when prompted
- [ ] See waveform animation while recording
- [ ] Pause and resume recording works
- [ ] Stop recording and preview playback
- [ ] Save recording successfully

### Idea Management

- [ ] Create an idea with title and type
- [ ] See idea appear in recent ideas list
- [ ] Click on idea to view details
- [ ] Edit idea information
- [ ] Delete idea (if needed)

### AI Refinement

- [ ] Open an idea
- [ ] Click "Refine with AI" button
- [ ] Wait for Claude to generate 5 questions (5-10 seconds)
- [ ] Answer the questions
- [ ] Submit answers successfully
- [ ] See idea status change to "Refining"

### AI Validation

- [ ] Click "Validate Idea" button
- [ ] Wait for validation analysis (10-20 seconds)
- [ ] See three scores displayed (Demand, Competition, Feasibility)
- [ ] Read AI recommendation and next steps
- [ ] See idea status change to "Validated"

### Mind Map

- [ ] Navigate to "Mind Map" tab
- [ ] See visual representation of ideas
- [ ] Zoom and pan the map
- [ ] Click nodes to view idea details

### PWA Features

- [ ] Look for "Install" button in browser (Chrome/Edge)
- [ ] Install the PWA to home screen/desktop
- [ ] Launch installed app
- [ ] Verify full-screen experience

### Error Handling

- [ ] Try creating idea without logging in (should prompt login)
- [ ] Try submitting empty form (should show validation)
- [ ] Check network error handling (disable internet briefly)

---

## Common Issues

### Issue: "Module not found" errors

**Cause**: Dependencies not installed or installation interrupted

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Cause**: Environment variables not loaded

**Solutions**:
1. Verify `.env.local` exists in project root
2. Restart development server (`npm run dev`)
3. Check variable names exactly match (including NEXT_PUBLIC_ prefix)
4. Ensure no spaces around `=` sign

### Issue: "Failed to fetch ideas" or database errors

**Cause**: Database schema not executed or RLS policies blocking access

**Solutions**:
1. Go to Supabase → SQL Editor
2. Re-run the schema.sql script
3. Check "Table Editor" to verify tables exist
4. Verify you're logged in to the app

### Issue: "Failed to access microphone"

**Cause**: Browser permissions or HTTPS required

**Solutions**:
1. Click the lock icon in address bar
2. Grant microphone permission
3. Use Chrome (best support)
4. On iOS, must use Safari
5. Ensure using https:// in production

### Issue: "Anthropic API error" or AI features not working

**Cause**: API key incorrect or out of credits

**Solutions**:
1. Verify API key in `.env.local`
2. Check Anthropic console for:
   - API key is active
   - Account has credits
   - No rate limiting
3. Restart development server
4. Check browser console for specific error

### Issue: Port 3000 already in use

**Cause**: Another process using the port

**Solution**:
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### Issue: Build fails with TypeScript errors

**Cause**: Type checking failures

**Solution**:
```bash
# Check for TypeScript errors
npx tsc --noEmit

# If persistent, temporarily bypass (not recommended for production)
npm run build -- --no-lint
```

### Issue: PWA not installing on iOS

**Cause**: iOS requires Safari and HTTPS

**Solutions**:
1. Must use Safari browser (not Chrome)
2. Must be HTTPS in production (localhost ok for dev)
3. Clear Safari cache
4. Check manifest.json loads correctly

---

## Next Steps

After completing setup:

1. **Read [FEATURES.md](./FEATURES.md)** to understand all features
2. **Check [DEPLOYMENT.md](./DEPLOYMENT.md)** when ready to deploy
3. **Customize** the application:
   - Update colors in `app/globals.css`
   - Modify app name in `public/manifest.json`
   - Change author info in `package.json`
4. **Add your own ideas** and test the AI features
5. **Deploy** to Vercel or Netlify

---

## Getting Help

If you're stuck:

1. **Check browser console** (F12) for error messages
2. **Check server logs** in your terminal
3. **Review Supabase logs** in dashboard → Logs
4. **Verify environment variables** are set correctly
5. **Consult [README.md](./README.md)** troubleshooting section
6. **Open an issue** on GitHub with:
   - What you expected to happen
   - What actually happened
   - Error messages (if any)
   - Steps to reproduce

---

## Security Checklist

Before going to production:

- [ ] All environment variables set in production platform
- [ ] `.env.local` not committed to git (check `.gitignore`)
- [ ] Supabase RLS policies are enabled
- [ ] Strong database password used
- [ ] HTTPS enabled (automatic on Vercel/Netlify)
- [ ] Email confirmation enabled in Supabase auth
- [ ] Rate limiting considered for API routes
- [ ] Anthropic API key secured (server-side only)

---

## Congratulations!

You've successfully set up IdeaCapture. Start capturing your brilliant ideas!

**Next**: Read [FEATURES.md](./FEATURES.md) to learn about all the features you can use.
