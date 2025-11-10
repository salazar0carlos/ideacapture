# 💡 IdeaCapture

> Never lose an idea again. A mobile-first Progressive Web App for capturing, refining, and validating your ideas.

## 🎯 What is IdeaCapture?

IdeaCapture is a universal idea capture tool designed to help you quickly capture ideas through voice recording, refine them with AI-powered questions, and validate their potential. Whether you're thinking about tech innovations, business opportunities, product improvements, or content ideas - IdeaCapture helps you organize and evaluate them all.

### Foundation Complete ✓

This is the **foundation build** - a solid base with PWA capabilities, design system, and database schema. Future sessions will add:

- 🎙️ Voice recording and transcription
- 🤖 AI-powered idea refinement
- ✅ Automated idea validation
- 🗺️ Interactive mind map visualization
- 📊 Analytics and insights
- 🔍 Smart search and filtering

---

## 🚀 Features (Foundation)

### ✨ Current Features

- **🔐 User Authentication**: Secure email/password authentication with Supabase
- **🛡️ Row-Level Security**: Data isolation - users only see their own ideas
- **📱 Mobile-Optimized Auth**: Large touch targets, glass morphism design
- **🔒 Protected Routes**: Middleware guards all authenticated pages
- **👤 User Profile**: Email display and logout in settings
- **💾 PWA Auth Persistence**: Auth state persists in installed PWA
- **PWA Ready**: Installable on mobile devices like a native app
- **Dark Theme**: Beautiful gradient background with glass morphism effects
- **Design System**: Complete UI component library (Button, Card, Badge)
- **Mobile-First**: Touch-friendly with 44px+ touch targets
- **Safe Area Support**: Proper padding for notched phones
- **Bottom Navigation**: Easy thumb-reach navigation
- **Database Schema**: Ready for Supabase integration
- **TypeScript**: Full type safety throughout

### 🔮 Coming in Future Sessions

1. **Voice Capture** - Record ideas with a tap
2. **AI Refinement** - Claude-powered idea development
3. **Validation Engine** - Market demand analysis
4. **Mind Map** - Visual idea connections
5. **Ideas Library** - Browse and manage ideas
6. **Settings** - Customize your experience

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **PWA**: next-pwa

---

## 📦 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### 1. Clone the Repository

```bash
git clone https://github.com/salazar0carlos/ideacapture.git
cd ideacapture
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 4. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL script

This will create:
- `ideas` table - stores all captured ideas
- `user_settings` table - stores user preferences
- Indexes for performance

### 5. Configure Authentication

**CRITICAL: Authentication is now required for all users**

#### Step 1: Enable Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Auth Providers**, ensure **Email** is enabled
4. Configure **Site URL** and **Redirect URLs**:
   - Add your development URL: `http://localhost:3000`
   - Add your production domain (e.g., `https://yourdomain.vercel.app`)
   - For deployed apps, add the Vercel domain to redirect URLs

#### Step 2: Run Database Migrations

**Important: Run these SQL scripts in order**

1. First, run the user_id migration:
   - Open Supabase SQL Editor
   - Copy contents from `supabase/add_user_id_migration.sql`
   - Execute the script
   - This adds `user_id` columns and foreign key constraints

2. Then, enable Row-Level Security:
   - Open Supabase SQL Editor
   - Copy contents from `supabase/rls_policies.sql`
   - Execute the script
   - This enables RLS and creates security policies

#### Step 3: Verify RLS Policies

After running the scripts, verify that:
- ✅ RLS is enabled on `ideas` and `user_settings` tables
- ✅ 4 policies exist on `ideas` table (SELECT, INSERT, UPDATE, DELETE)
- ✅ 3 policies exist on `user_settings` table (SELECT, INSERT, UPDATE)

You can check this in Supabase Dashboard → **Database** → **Tables** → Click table → **RLS Policies** tab

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Build for Production

```bash
npm run build
npm start
```

---

## 📱 PWA Installation

### On iOS (Safari)

1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right
5. The app icon will appear on your home screen

### On Android (Chrome)

1. Open the app in Chrome
2. Tap the three dots menu
3. Tap "Add to Home Screen" or "Install App"
4. Confirm by tapping "Install"
5. The app icon will appear on your home screen

### Features When Installed

- ✅ Full-screen experience (no browser UI)
- ✅ App icon on home screen
- ✅ Splash screen
- ✅ Offline capability (basic)
- ✅ Native app feel

---

## 🏗️ Project Structure

```
ideacapture/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page (voice capture placeholder)
│   ├── login/               # Login page (mobile-optimized)
│   ├── signup/              # Signup page (mobile-optimized)
│   ├── mindmap/             # Mind map page (placeholder)
│   ├── ideas/               # Ideas list page (placeholder)
│   ├── settings/            # Settings page with logout
│   ├── layout.tsx           # Root layout with auth wrapper
│   └── globals.css          # Global styles & design system
├── components/
│   ├── ui/                  # Design system components
│   │   ├── Button.tsx       # Gradient button with animations
│   │   ├── Card.tsx         # Glass morphism card
│   │   └── Badge.tsx        # Colored badge variants
│   ├── BottomNav.tsx        # Bottom navigation bar
│   └── LayoutWrapper.tsx    # Auth state handler + conditional nav
├── lib/
│   ├── types.ts             # TypeScript type definitions
│   ├── supabase.ts          # Supabase client + auth helpers
│   ├── database.types.ts    # Database types
│   └── utils.ts             # Utility functions (cn)
├── supabase/
│   ├── schema.sql           # Database schema
│   ├── add_user_id_migration.sql  # Add user_id columns
│   └── rls_policies.sql     # Row-Level Security policies
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icons/               # App icons (192x192, 512x512)
├── middleware.ts            # Auth middleware (route protection)
├── next.config.ts           # Next.js + PWA config
└── .env.local               # Environment variables (not in git)
```

---

## 🎨 Design System

### Colors

- **Background**: `#0A0A0F` (Dark gradient)
- **Primary**: `#6366F1` → `#8B5CF6` (Indigo to Purple)
- **Accent**: `#06B6D4` (Cyan)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Danger**: `#EF4444` (Red)

### Typography

- **Font**: Inter (via Google Fonts)
- **Touch Targets**: Minimum 44px × 44px

### Components

- **Button**: 3 variants (primary, secondary, outline) with loading state
- **Card**: Glass morphism with hover effects
- **Badge**: 5 color variants for categories
- **BottomNav**: Fixed bottom navigation with active states

### Animations

- **pulse-glow**: Subtle pulsing glow effect
- **fade-in-up**: Smooth entrance animation
- **float**: Gentle floating effect

---

## 🔧 Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key for Claude |

---

## 🗄️ Database Schema

### Ideas Table

Stores all captured ideas with refinement and validation data.

**Key Fields:**
- `id` - UUID primary key
- `user_id` - UUID foreign key to auth.users (REQUIRED)
- `title` - Idea title
- `description` - Detailed description
- `idea_type` - Category (tech, business, product, content, other)
- `audio_transcript` - Voice recording transcription
- `refinement_questions` - AI-generated questions
- `refinement_answers` - User responses
- `validation_result` - AI validation analysis
- `status` - Current status (captured, refining, validated, pursuing, archived)

**RLS Policies:**
- Users can only SELECT, INSERT, UPDATE, DELETE their own ideas
- Enforced via `user_id = auth.uid()` in all policies

### User Settings Table

Stores user preferences and settings.

**Key Fields:**
- `id` - UUID primary key (references auth.users)
- `validation_enabled` - Auto-validate new ideas
- `default_view` - Preferred view mode (list, grid, mindmap)

**RLS Policies:**
- Users can only SELECT, INSERT, UPDATE their own settings
- Enforced via `id = auth.uid()` in all policies

---

## 🚨 Important Notes

### Security

✅ **Row Level Security (RLS)** is fully implemented and enforced:

- All routes are protected by authentication middleware
- Users can only access their own data (enforced by RLS policies)
- Auth state persists in PWA for offline access
- Middleware redirects unauthenticated users to login

**Before deploying to production:**

1. ✅ Update `.env.local` with real Supabase credentials
2. ✅ Run both migration scripts in Supabase SQL Editor
3. ✅ Configure redirect URLs in Supabase Auth settings
4. ✅ Test authentication flow on mobile
5. ⚠️ Never commit `.env.local` to version control

### PWA Service Worker

The service worker is disabled in development mode and only activates in production builds.

### Google Fonts

The Inter font is loaded via CSS import. If you experience issues in restricted environments, the app falls back to system fonts.

---

## 📝 First-Time Setup Checklist

### Database Setup
- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] Run `supabase/add_user_id_migration.sql` to add user_id columns
- [ ] Run `supabase/rls_policies.sql` to enable RLS
- [ ] Verify RLS policies in Supabase Dashboard

### Auth Configuration
- [ ] Enable Email provider in Supabase Auth settings
- [ ] Add localhost redirect URL: `http://localhost:3000`
- [ ] Add production redirect URL (when deploying)
- [ ] Update `.env.local` with real Supabase credentials

### Testing
- [ ] Sign up with a test email
- [ ] Verify redirect to home page after login
- [ ] Check user email displays in Settings
- [ ] Test logout functionality
- [ ] Sign up second user in incognito - verify data isolation
- [ ] Install PWA on mobile and test auth persistence

### Build Verification
- [ ] Run `npm run build` - must pass with 0 errors
- [ ] Test on iPhone Safari (if available)
- [ ] Test on Android Chrome (if available)
- [ ] Verify no console errors

---

## 🤝 Contributing

This is a personal project foundation. Future sessions will add the core features.

---

## 📄 License

MIT License - see LICENSE file

---

## 👤 Author

**Carlos Salazar**
- GitHub: [@salazar0carlos](https://github.com/salazar0carlos)
- Repository: [ideacapture](https://github.com/salazar0carlos/ideacapture)

---

## 🎉 Authentication Complete!

This build establishes:
- ✅ Solid Next.js + TypeScript base
- ✅ PWA configuration and manifest
- ✅ Complete design system
- ✅ Database schema with RLS
- ✅ **Secure user authentication**
- ✅ **Row-Level Security policies**
- ✅ **Protected routes with middleware**
- ✅ **Mobile-optimized login/signup**
- ✅ Mobile-first responsive layout
- ✅ Bottom navigation
- ✅ All placeholder pages

**🔐 Now fully secure and ready for feature development!** 🚀

### What's Next?

Future sessions will add:
1. Voice recording and transcription
2. AI-powered idea refinement
3. Automated validation engine
4. Interactive mind map
5. Ideas library with filtering
6. User preferences and settings
