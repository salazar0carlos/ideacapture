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
- RLS policies (currently open - update for production)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

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
│   ├── mindmap/             # Mind map page (placeholder)
│   ├── ideas/               # Ideas list page (placeholder)
│   ├── settings/            # Settings page (placeholder)
│   ├── layout.tsx           # Root layout with BottomNav
│   └── globals.css          # Global styles & design system
├── components/
│   ├── ui/                  # Design system components
│   │   ├── Button.tsx       # Gradient button with animations
│   │   ├── Card.tsx         # Glass morphism card
│   │   └── Badge.tsx        # Colored badge variants
│   └── BottomNav.tsx        # Bottom navigation bar
├── lib/
│   ├── types.ts             # TypeScript type definitions
│   ├── supabase.ts          # Supabase client
│   ├── database.types.ts    # Database types
│   └── utils.ts             # Utility functions (cn)
├── supabase/
│   └── schema.sql           # Database schema
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icons/               # App icons (192x192, 512x512)
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
- `title` - Idea title
- `description` - Detailed description
- `idea_type` - Category (tech, business, product, content, other)
- `audio_transcript` - Voice recording transcription
- `refinement_questions` - AI-generated questions
- `refinement_answers` - User responses
- `validation_result` - AI validation analysis
- `status` - Current status (captured, refining, validated, pursuing, archived)

### User Settings Table

Stores user preferences and settings.

**Key Fields:**
- `validation_enabled` - Auto-validate new ideas
- `default_view` - Preferred view mode (list, grid, mindmap)

---

## 🚨 Important Notes

### Security

⚠️ **Row Level Security (RLS)** is currently set to allow all operations. Before deploying to production:

1. Implement proper authentication (Supabase Auth)
2. Update RLS policies to be user-specific
3. Add proper access controls

### PWA Service Worker

The service worker is disabled in development mode and only activates in production builds.

### Google Fonts

The Inter font is loaded via CSS import. If you experience issues in restricted environments, the app falls back to system fonts.

---

## 📝 Next Steps

1. **Run the schema**: Execute `supabase/schema.sql` in your Supabase SQL Editor
2. **Test on mobile**: Install the PWA on your phone
3. **Verify navigation**: Check all bottom nav tabs work
4. **Check build**: Ensure `npm run build` passes with no errors

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

## 🎉 Foundation Complete!

This build establishes:
- ✅ Solid Next.js + TypeScript base
- ✅ PWA configuration and manifest
- ✅ Complete design system
- ✅ Database schema ready
- ✅ Mobile-first responsive layout
- ✅ Bottom navigation
- ✅ All placeholder pages

**Ready for feature development in next sessions!** 🚀
