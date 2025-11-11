# IdeaCapture

> Never lose a brilliant idea again. A mobile-first Progressive Web App for capturing, refining, and validating your ideas with AI-powered insights.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

## Overview

**IdeaCapture** is a complete idea management platform that helps you capture ideas through voice recording, refine them with AI-generated questions, and validate their market potential using advanced AI analysis. Whether you're an entrepreneur, product manager, content creator, or innovator, IdeaCapture turns fleeting thoughts into actionable opportunities.

### What Makes IdeaCapture Special?

- **Voice-First Design**: Capture ideas naturally through voice recording with real-time waveform visualization
- **AI-Powered Refinement**: Get 5 targeted questions from Claude AI to develop your idea deeply
- **Market Validation**: Comprehensive analysis of demand, competition, and feasibility with actionable recommendations
- **Mobile-Optimized**: Install as a PWA for native app experience on any device
- **Secure & Private**: Row-level security ensures your ideas stay yours
- **Beautiful UI**: Modern glass morphism design with smooth animations

---

## Features

### Voice Recording
- High-quality audio capture with pause/resume functionality
- Real-time waveform visualization (8-bar frequency analyzer)
- Playback preview before saving
- Maximum 5-minute recordings
- Browser microphone permissions management

### AI-Powered Refinement
- Claude AI generates 5 custom questions based on your idea
- Questions cover problem, solution, market, feasibility, and implementation
- Answer questions to develop your idea comprehensively
- Questions automatically adapt to your idea type (tech, business, product, content)

### Market Validation
- Comprehensive AI analysis using Claude 3.5 Sonnet
- Three validation scores (0-100):
  - **Demand Score**: Market size, target audience, and demand signals
  - **Competition Score**: Competitive landscape and barriers to entry
  - **Feasibility Score**: Technical complexity and resource requirements
- Clear recommendation: Should you pursue this idea?
- Actionable next steps for implementation

### Idea Management
- Create, view, edit, and archive ideas
- Five idea categories: Tech, Business, Product, Content, Other
- Status tracking: Captured → Refining → Validated → Pursuing → Archived
- Sort and filter by category, status, and validation scores
- Time-based organization (recent ideas, time-ago timestamps)

### Mind Map Visualization
- Visual representation of your idea connections
- Interactive node-based interface using React Flow
- Zoom, pan, and explore your idea network
- Color-coded by idea type

### Authentication & Security
- Secure Supabase authentication
- Email/password signup and login
- Row Level Security (RLS) policies
- User-specific data isolation
- Secure API routes with JWT validation

### Progressive Web App
- Installable on iOS, Android, and Desktop
- Offline-capable with service worker
- App icons and splash screens
- Full-screen experience
- Works like a native app

### Design System
- Modern glass morphism aesthetic
- Gradient backgrounds (indigo to purple)
- Smooth Framer Motion animations
- Responsive layouts (mobile-first)
- Dark theme optimized for OLED screens
- Accessibility-focused (44px+ touch targets)

---

## Screenshots

### Recommended Screenshots to Capture

1. **Home Screen** - Voice recording interface with gradient background
2. **Recent Ideas** - Grid of idea cards with badges
3. **Voice Recording** - Active recording with waveform animation
4. **Refinement Questions** - AI-generated questions interface
5. **Validation Results** - Comprehensive market analysis dashboard
6. **Ideas List** - Full library with filters and search
7. **Mind Map** - Visual idea network
8. **Mobile Install** - PWA installation flow
9. **Settings** - User preferences and account management

---

## Installation

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works perfectly)
- An Anthropic API key (Claude AI)
- Git for version control

### Step 1: Clone the Repository

```bash
git clone https://github.com/salazar0carlos/ideacapture.git
cd ideacapture
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

See [SETUP.md](./SETUP.md) for detailed instructions on obtaining these keys.

### Step 4: Set Up the Database

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Paste and execute the SQL script

This creates:
- `ideas` table with all fields and indexes
- `user_settings` table for preferences
- Row Level Security policies
- Automatic timestamp triggers

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Build for Production

```bash
npm run build
npm start
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL (found in project settings) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous/public key (safe for client-side) |
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key for Claude (server-side only) |

### Supabase Configuration

The application uses Supabase for:
- **Authentication**: Email/password auth with secure sessions
- **Database**: PostgreSQL with full-text search capabilities
- **Row Level Security**: User-specific data access control
- **Real-time**: Optional real-time updates (currently disabled)

### Claude AI Configuration

The application uses Claude 3.5 Sonnet for:
- **Refinement**: Generating targeted questions (1-2 seconds)
- **Validation**: Comprehensive market analysis (3-5 seconds)

Current model: `claude-3-5-sonnet-20241022`

---

## API Documentation

IdeaCapture includes a complete REST API for all operations.

### Authentication

All API routes require authentication via Bearer token:

```
Authorization: Bearer {user_access_token}
```

### Endpoints

#### Ideas

**GET /api/ideas** - List all ideas
- Query params: `limit` (default: 50), `status`, `type`
- Returns: Array of idea objects

**POST /api/ideas** - Create new idea
- Body: `{ title, idea_type, description, audio_transcript }`
- Returns: Created idea object

**GET /api/ideas/[id]** - Get single idea
- Returns: Full idea object with refinement and validation data

**PATCH /api/ideas/[id]** - Update idea
- Body: Partial idea object
- Returns: Updated idea object

**DELETE /api/ideas/[id]** - Delete idea
- Returns: Success confirmation

#### Refinement

**POST /api/ideas/[id]/refine** - Generate refinement questions
- Returns: Array of 5 questions generated by Claude AI

**PUT /api/ideas/[id]/answers** - Submit refinement answers
- Body: `{ answers: { q1: "answer1", q2: "answer2", ... } }`
- Returns: Updated idea with answers

#### Validation

**POST /api/ideas/[id]/validate** - Validate idea with AI
- Body: `{ force_revalidation: true }` (optional)
- Returns: Validation result with scores and recommendations

**POST /api/ideas/[id]/transcribe** - Transcribe audio (future)
- Body: Audio blob
- Returns: Transcript text

---

## Deployment

IdeaCapture can be deployed to any platform that supports Next.js.

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables
6. Click "Deploy"

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guides including Netlify, AWS, and custom servers.

### Environment Variables for Production

Make sure to set all three environment variables in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

### Custom Domain Setup

1. In Vercel/Netlify, go to Domain Settings
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

---

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety
- **Tailwind CSS v4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **React Flow** - Mind map visualization

### Backend
- **Next.js API Routes** - Serverless functions
- **Anthropic Claude API** - AI refinement and validation
- **Supabase** - PostgreSQL database and auth

### Infrastructure
- **Supabase** - Backend as a service
- **Vercel/Netlify** - Hosting and CDN
- **next-pwa** - Progressive Web App features

---

## Performance

### Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)

### Optimizations

- Server-side rendering for initial load
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Service worker caching for offline support
- Optimized bundle size (< 200KB initial JS)

---

## Browser Compatibility

### Desktop
- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile
- iOS Safari 14+ (iPhone 8 and newer)
- Chrome Mobile 90+
- Samsung Internet 14+

### PWA Features
- **Full Support**: Chrome, Edge, Samsung Internet
- **Partial Support**: Safari (no push notifications, limited offline)
- **Not Supported**: Firefox (manual bookmark required)

---

## Mobile App Installation

### iOS (iPhone/iPad)

1. Open IdeaCapture in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right
5. Find the IdeaCapture icon on your home screen

**Note**: Must use Safari browser. Chrome and other browsers on iOS don't support PWA installation.

### Android

1. Open IdeaCapture in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen" or "Install App"
4. Confirm by tapping "Install"
5. Find the IdeaCapture icon in your app drawer

**Alternative**: Chrome will show an install banner automatically.

### Desktop (Chrome, Edge)

1. Look for the install icon in the address bar
2. Click "Install IdeaCapture"
3. The app will open in its own window
4. Access from your applications folder

---

## Troubleshooting

### Microphone Not Working

**Problem**: "Failed to access microphone" error

**Solutions**:
1. Check browser permissions (click lock icon in address bar)
2. Make sure no other app is using the microphone
3. Try a different browser (Chrome recommended)
4. On iOS, ensure Safari has microphone access in Settings
5. Use HTTPS (required for microphone access)

### Ideas Not Saving

**Problem**: Ideas don't appear after submission

**Solutions**:
1. Check browser console for errors
2. Verify Supabase environment variables are set
3. Ensure you're logged in (check auth token)
4. Check Supabase dashboard for RLS policy issues
5. Verify database schema was executed correctly

### AI Features Not Working

**Problem**: Refinement or validation fails

**Solutions**:
1. Verify `ANTHROPIC_API_KEY` is set correctly
2. Check Anthropic API key is active and has credits
3. Look for API errors in server logs
4. Try again in a few seconds (rate limiting)
5. Check browser console for network errors

### PWA Not Installing

**Problem**: "Add to Home Screen" not appearing

**Solutions**:
1. Make sure you're using HTTPS (required for PWA)
2. On iOS, must use Safari browser
3. Clear browser cache and try again
4. Verify `manifest.json` is loading (check Network tab)
5. Check service worker registration in DevTools

### Slow Performance

**Problem**: App feels sluggish or slow

**Solutions**:
1. Clear browser cache and reload
2. Check internet connection speed
3. Disable browser extensions
4. Update to latest browser version
5. Check if using large audio files (5min max recommended)

---

## Development

### Project Structure

```
ideacapture/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home/voice capture page
│   ├── ideas/                   # Ideas management
│   │   ├── page.tsx            # Ideas list
│   │   └── [id]/               # Individual idea routes
│   │       ├── page.tsx        # Idea detail
│   │       └── refine/         # Refinement interface
│   ├── mindmap/                 # Mind map visualization
│   ├── settings/                # User settings
│   ├── login/                   # Authentication pages
│   ├── signup/
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── api/                    # API routes
│       └── ideas/              # Ideas API endpoints
├── components/
│   ├── ui/                      # Design system
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── VoiceRecorder.tsx        # Voice recording UI
│   ├── IdeaCaptureForm.tsx      # Idea form
│   ├── ValidationResults.tsx    # Validation display
│   ├── MindMapNode.tsx          # Mind map nodes
│   ├── BottomNav.tsx            # Bottom navigation
│   └── Toast.tsx                # Toast notifications
├── lib/
│   ├── types.ts                 # TypeScript types
│   ├── supabase.ts              # Supabase client
│   ├── auth-context.tsx         # Auth context
│   ├── toast-context.tsx        # Toast context
│   ├── api-helpers.ts           # API utilities
│   ├── audio-utils.ts           # Audio processing
│   └── utils.ts                 # General utilities
├── supabase/
│   └── schema.sql               # Database schema
├── public/
│   ├── manifest.json            # PWA manifest
│   ├── icons/                   # App icons
│   └── favicon.ico
├── next.config.ts               # Next.js config
├── tailwind.config.ts           # Tailwind config
└── package.json
```

### Available Scripts

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Build production bundle
npm start         # Start production server
npm run lint      # Run ESLint for code quality
```

### Key Technologies

- **App Router**: All routes use Next.js 13+ App Router
- **Server Components**: Default for better performance
- **Client Components**: Used for interactivity ("use client")
- **API Routes**: Server-side functions in `/app/api`
- **Middleware**: Authentication checks (middleware.ts)

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Support

- **Documentation**: See [SETUP.md](./SETUP.md), [FEATURES.md](./FEATURES.md), and [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/salazar0carlos/ideacapture/issues)
- **Email**: carlos@example.com (replace with your email)

---

## Roadmap

### Version 1.1 (Coming Soon)
- [ ] Audio transcription with Whisper API
- [ ] Export ideas to PDF/Markdown
- [ ] Idea sharing with unique links
- [ ] Team collaboration features
- [ ] Mobile app notifications

### Version 2.0 (Future)
- [ ] Native iOS/Android apps
- [ ] AI-powered idea connections
- [ ] Advanced analytics dashboard
- [ ] Integration with project management tools
- [ ] Custom AI model fine-tuning

---

## Author

**Carlos Salazar**

- GitHub: [@salazar0carlos](https://github.com/salazar0carlos)
- Repository: [ideacapture](https://github.com/salazar0carlos/ideacapture)

---

## Acknowledgments

- **Anthropic** for Claude AI API
- **Supabase** for backend infrastructure
- **Vercel** for Next.js framework and hosting
- **The React community** for amazing libraries

---

Built with love and AI. Never lose an idea again!
