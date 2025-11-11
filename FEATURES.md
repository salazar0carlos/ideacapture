# IdeaCapture Features

Complete guide to all features in IdeaCapture. Learn how to capture, refine, and validate your ideas with AI-powered insights.

---

## Table of Contents

1. [Voice Recording](#voice-recording)
2. [AI-Powered Refinement](#ai-powered-refinement)
3. [AI Validation](#ai-validation)
4. [Idea Management](#idea-management)
5. [Mind Map Visualization](#mind-map-visualization)
6. [Authentication & Security](#authentication--security)
7. [Progressive Web App](#progressive-web-app)
8. [Design System](#design-system)
9. [User Settings](#user-settings)
10. [Toast Notifications](#toast-notifications)

---

## Voice Recording

Capture your ideas naturally through voice, just like speaking to a colleague or recording a voice memo.

### How It Works

1. **Start Recording**: Tap the large "Start Recording" button on the home screen
2. **Grant Permission**: Browser will ask for microphone access (first time only)
3. **Speak Your Idea**: Talk naturally about your idea
4. **See Visualization**: Watch the real-time waveform animation
5. **Pause/Resume**: Pause to think, resume when ready
6. **Stop & Preview**: Stop recording and listen to your audio
7. **Save or Discard**: Keep it or start over

### Features

#### Real-Time Waveform Visualization
- 8-bar frequency analyzer shows audio levels
- Smooth animations synchronized with your voice
- Visual feedback that recording is working
- Beautiful gradient colors (primary to accent)

#### Pause and Resume
- Pause recording to gather your thoughts
- Timer pauses automatically
- Resume seamlessly without losing previous audio
- Waveform freezes when paused

#### Audio Playback
- Listen to your recording before saving
- Ensure audio quality is good
- Verify you captured everything you wanted
- Simple play/pause controls

#### Recording Controls
- **Maximum Duration**: 5 minutes (300 seconds)
- **Automatic Stop**: Recording stops at max duration
- **Timer Display**: Shows elapsed time (MM:SS format)
- **Cancel Anytime**: Discard recording and start over

### Technical Details

#### Audio Format
- **Codec**: WebM with Opus (Chrome, Edge, Firefox)
- **Fallback**: MP4 with AAC (Safari)
- **Bitrate**: Adaptive based on browser
- **Sample Rate**: 48kHz (CD quality)
- **Channels**: Mono (optimized for voice)

#### Browser Support
- **Chrome/Edge**: Full support, best experience
- **Firefox**: Full support
- **Safari**: Full support with AAC fallback
- **Mobile**: Works on all modern mobile browsers

#### Microphone Permissions
The app needs microphone access to record. The permission:
- Is requested only when needed (first recording)
- Can be granted or denied
- Can be changed in browser settings
- Is remembered for future sessions

### Use Cases

- **Quick Ideas**: Capture fleeting thoughts instantly
- **Detailed Descriptions**: Explain complex ideas verbally
- **On-the-Go**: Record while walking, commuting, or anywhere
- **Natural Expression**: Speak instead of type
- **Accessibility**: Easier than typing for some users

### Privacy

- Audio is stored locally until you save
- Saved audio stored as base64 in your private database
- No third-party audio processing
- Audio never sent to external services (future: optional transcription)
- Only you can access your recordings

---

## AI-Powered Refinement

Turn rough ideas into well-developed concepts with Claude AI-generated questions.

### How It Works

1. **Create an Idea**: Save a new idea (via voice or text)
2. **Open Idea Details**: View the idea you want to refine
3. **Click "Refine with AI"**: Request refinement questions
4. **Wait 5-10 Seconds**: Claude analyzes your idea
5. **Answer 5 Questions**: Thoughtful questions appear
6. **Submit Answers**: Send your responses
7. **Idea Refined**: Now ready for validation

### The 5 Questions

Claude generates 5 custom questions tailored to your specific idea. Each question targets a different aspect:

#### 1. Problem/Need (Category: "problem")
- What problem does this solve?
- Who experiences this problem?
- How painful is the problem?
- Why existing solutions don't work?

**Example**: "Who specifically experiences the pain point your idea addresses, and how do they currently deal with it?"

#### 2. Solution (Category: "solution")
- How will this work?
- What makes it unique?
- Why is this better than alternatives?
- What's the core innovation?

**Example**: "What specific features or approaches make your solution different from existing alternatives in the market?"

#### 3. Market (Category: "market")
- Who is the target audience?
- How big is the market?
- What's the market opportunity?
- How will you reach users?

**Example**: "What does your target audience look like, and how would you realistically reach your first 100 users?"

#### 4. Feasibility (Category: "feasibility")
- What resources are needed?
- What are the challenges?
- How long will it take?
- What expertise is required?

**Example**: "What are the key resources (time, money, skills) required to build an MVP, and what's a realistic timeline?"

#### 5. Implementation (Category: "other")
- How will you start?
- What's the MVP?
- How will you test the idea?
- What are the first steps?

**Example**: "What would a minimal viable product look like, and how would you validate it with real users?"

### Question Adaptation

Questions automatically adapt based on:
- **Idea Type**: Tech, Business, Product, Content
- **Description**: What you've already written
- **Audio Transcript**: What you've recorded
- **Context**: Industry, target audience, etc.

### Benefits of Refinement

#### Deeper Thinking
- Forces you to think critically
- Uncovers aspects you hadn't considered
- Helps identify weaknesses early
- Builds confidence in your idea

#### Better Validation
- Refinement answers feed into validation
- More context = better AI analysis
- Higher quality recommendations
- More accurate feasibility scores

#### Documentation
- Answers become part of your idea record
- Easy to share with others
- Helps when revisiting old ideas
- Creates a thought trail

### Technical Details

#### AI Model
- **Model**: Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
- **Provider**: Anthropic
- **Response Time**: 5-10 seconds
- **Cost**: ~$0.01 per refinement

#### Question Format
Each question is a JSON object:
```json
{
  "id": "q1",
  "question": "Who specifically experiences the pain point?",
  "category": "problem",
  "required": true
}
```

#### Storage
- Questions stored in `refinement_questions` (JSONB)
- Answers stored in `refinement_answers` (JSONB)
- Both fields in the `ideas` table
- Enables efficient querying and updates

---

## AI Validation

Comprehensive market validation powered by Claude AI. Get objective analysis of your idea's potential.

### How It Works

1. **Open Refined Idea**: Must refine idea first (for best results)
2. **Click "Validate Idea"**: Request validation
3. **Wait 10-20 Seconds**: Claude performs deep analysis
4. **Review Results**: See scores and recommendations
5. **Read Next Steps**: Get actionable guidance
6. **Decide**: Pursue, revise, or archive

### Validation Scores

The AI provides three key scores (0-100 scale):

#### Demand Score
**Evaluates**: Market need and potential customer interest

Analyzes:
- Market size and growth
- Target audience size
- Pain point severity
- Search trends and interest
- Existing demand signals
- Problem urgency

**Example Output**:
```
Score: 75/100 (Good)

The productivity tools market is large and growing. Your target
audience of remote workers is significant (~25M in US). Evidence
of demand includes high search volume for "meeting note automation"
and numerous complaints about existing tools.

Signals:
• Growing remote work trend (20% CAGR)
• High search volume (50K+ monthly)
• Active Reddit/Twitter discussions
```

#### Competition Score
**Evaluates**: Competitive landscape and difficulty

Analyzes:
- Number of direct competitors
- Market saturation level
- Competitor strengths/weaknesses
- Barriers to entry
- Differentiation opportunities
- Competitive advantages

**Example Output**:
```
Score: 60/100 (Medium)

Moderate competition with several established players like Otter.ai
and Fireflies. However, most focus on transcription rather than
actionable summaries, leaving room for differentiation.

Competitors:
• Otter.ai - Strong transcription, weak on actions
• Fireflies - Feature-rich but complex
• Sembly.ai - Limited integrations
```

#### Feasibility Score
**Evaluates**: Technical difficulty and resource requirements

Analyzes:
- Technical complexity
- Required skills and expertise
- Time to MVP
- Budget requirements
- Risk factors
- Realistic timeline

**Example Output**:
```
Score: 70/100 (Good)

Moderately feasible for a technical founder. Requires expertise
in speech-to-text APIs, NLP, and web development. MVP achievable
in 3-4 months with $5-10K budget for API costs.

Challenges:
• Speech-to-text accuracy varies
• NLP for action items is complex
• Real-time processing costs
```

### Overall Recommendation

After analyzing all three scores, Claude provides:

#### Should Pursue Decision
- **Yes**: Strong opportunity, recommended to proceed
- **No**: Significant concerns, not recommended
- **Maybe**: Has potential but needs work

#### Reasoning
Clear, honest explanation of the recommendation based on:
- Score patterns (all high, mixed, all low)
- Risk/reward balance
- Resource requirements vs. potential
- Market timing

#### Next Steps
5 specific, actionable steps to move forward:
1. Immediate action to take today
2. Research or validation to conduct
3. MVP features to build
4. Market testing approach
5. Resources to gather

**Example**:
```
Next Steps:
1. Interview 20 remote workers about their meeting note pain points
2. Build a simple prototype with Whisper API for transcription
3. Test action item extraction with GPT-4 API
4. Create landing page to gauge interest
5. Join remote work communities to find early users
```

### Validation Context

The AI considers:
- Your idea type (tech, business, product, content)
- Original description
- Audio transcript (if available)
- Refinement Q&A (if completed)
- Current market conditions
- Industry trends

### Re-Validation

You can re-validate after:
- Making changes to your idea
- Gathering new information
- Market conditions change
- Competitor landscape shifts

**How**: Click "Validate Again" with `force_revalidation: true`

### Technical Details

#### AI Model
- **Model**: Claude 3.5 Sonnet
- **Response Time**: 10-20 seconds
- **Max Tokens**: 4096 (comprehensive analysis)
- **Temperature**: 0.7 (balanced creativity/accuracy)
- **Cost**: ~$0.03 per validation

#### Validation Result Format
```json
{
  "overall_score": 75,
  "demand": {
    "score": 80,
    "analysis": "Detailed analysis...",
    "signals": ["Signal 1", "Signal 2", "Signal 3"]
  },
  "competition": {
    "score": 60,
    "analysis": "Detailed analysis...",
    "competitors": ["Competitor 1", "Competitor 2"]
  },
  "feasibility": {
    "score": 70,
    "analysis": "Detailed analysis...",
    "challenges": ["Challenge 1", "Challenge 2"]
  },
  "recommendation": {
    "should_pursue": true,
    "reasoning": "Clear reasoning...",
    "next_steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
  },
  "generated_at": "2024-11-11T10:30:00Z"
}
```

#### Storage
- Validation result stored in `validation_result` (JSONB)
- Individual scores in numeric fields
- `is_worth_pursuing` boolean for quick filtering
- Timestamps for tracking

---

## Idea Management

Organize and track all your ideas in one place.

### Idea Types

Choose from five categories:

- **Tech**: Software, apps, technical innovations
- **Business**: Business models, services, startups
- **Product**: Physical products, gadgets, inventions
- **Content**: Blogs, videos, courses, books
- **Other**: Everything else

### Idea Status

Ideas progress through five stages:

1. **Captured**: Just saved, raw idea
2. **Refining**: Working through AI questions
3. **Validated**: AI analysis completed
4. **Pursuing**: Actively working on it
5. **Archived**: Decided not to pursue

### Features

#### Ideas List
- View all your ideas in one place
- Sort by date, type, or status
- Filter by category or status
- Search by title or description
- Quick view cards with badges

#### Idea Details
- Full description and transcript
- All refinement Q&A
- Complete validation results
- Edit any field
- Delete if needed

#### Quick Stats
- Total ideas count
- Ideas by status
- Ideas by type
- Worth pursuing count
- Average validation scores

### Organizing Tips

1. **Use Types Consistently**: Helps with filtering
2. **Update Status**: Keep status current
3. **Archive Old Ideas**: Clean up the list
4. **Tag with Keywords**: Use description for search
5. **Review Regularly**: Weekly idea review session

---

## Mind Map Visualization

Visual representation of your idea network using React Flow.

### Features

#### Interactive Nodes
- Each idea is a node
- Color-coded by type
- Size based on validation score
- Click to view details
- Drag to rearrange

#### Connection Lines
- Shows related ideas
- Connection strength indicated
- Smart auto-layout
- Zoom and pan
- Minimap overview

#### Controls
- Zoom in/out
- Pan around the map
- Fit view to all nodes
- Toggle minimap
- Full-screen mode

### Use Cases

- **Visual Thinkers**: See relationships
- **Pattern Recognition**: Spot themes
- **Presentations**: Show your idea portfolio
- **Planning**: See what to work on
- **Inspiration**: Connect disparate ideas

---

## Authentication & Security

Secure, user-specific data with Supabase authentication.

### Features

#### Email/Password Authentication
- Sign up with email and password
- Email confirmation (optional)
- Password reset via email
- Secure password hashing
- JWT token-based sessions

#### Row Level Security (RLS)
- Database-level security
- Users can only access their data
- Automatic user_id filtering
- No way to access others' ideas
- Enforced at database level

#### Secure Sessions
- HTTP-only cookies
- Secure token storage
- Automatic token refresh
- Session expiration
- Logout clears all data

### Privacy

- Your ideas are private
- Audio recordings are private
- AI conversations are private
- No data sharing with third parties
- No analytics without consent

---

## Progressive Web App

Install IdeaCapture like a native app on any device.

### Features

#### Installable
- Add to home screen (iOS, Android)
- Install on desktop (Windows, Mac, Linux)
- App icon and splash screen
- Standalone window mode
- No browser UI

#### Offline Capability
- Service worker caching
- Works without internet (basic features)
- Syncs when back online
- Cached assets and pages
- Resilient to network issues

#### Native Feel
- Full-screen experience
- Fast load times
- Smooth animations
- Touch-friendly UI
- Native gestures

### Installation

See [README.md Mobile App Installation](./README.md#mobile-app-installation) for detailed instructions.

---

## Design System

Beautiful, consistent UI components throughout the app.

### Components

#### Button
Three variants with animations:
- **Primary**: Gradient (indigo to purple)
- **Secondary**: Outline with hover fill
- **Outline**: Border only, transparent
- **Loading State**: Spinner animation
- **Disabled State**: Muted colors

#### Card
Glass morphism effect:
- Semi-transparent background
- Backdrop blur
- Subtle border
- Hover elevation
- Smooth transitions

#### Badge
Five color variants:
- **Default**: Indigo (tech ideas)
- **Success**: Green (business ideas)
- **Warning**: Amber (product ideas)
- **Accent**: Cyan (content ideas)
- **Danger**: Red (errors, urgent)

### Design Tokens

#### Colors
- Background: `#0A0A0F`
- Primary: `#6366F1` → `#8B5CF6`
- Accent: `#06B6D4`
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`

#### Typography
- Font: Inter (Google Fonts)
- Sizes: 12px to 48px
- Line heights: 1.2 to 1.8
- Font weights: 400, 500, 600, 700

#### Spacing
- Base: 4px (0.25rem)
- Scale: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem, 4rem

#### Animations
- Duration: 150ms, 300ms, 500ms
- Easing: ease-in-out, ease-out
- Transitions: all, opacity, transform

---

## User Settings

Customize your IdeaCapture experience.

### Available Settings

#### Validation Settings
- **Auto-Validate**: Automatically validate new ideas
- **Validation Threshold**: Minimum score to pursue

#### Display Settings
- **Default View**: List, Grid, or Mind Map
- **Ideas Per Page**: 10, 25, 50, 100
- **Sort Order**: Newest, Oldest, Highest Score

#### Account Settings
- **Email**: View and update
- **Password**: Change password
- **Delete Account**: Permanent deletion

---

## Toast Notifications

Non-intrusive feedback for user actions.

### Notification Types

- **Success**: Green, checkmark icon
- **Error**: Red, X icon
- **Info**: Blue, info icon
- **Warning**: Amber, warning icon

### Features
- Auto-dismiss after 5 seconds
- Manual dismiss (click X)
- Smooth slide-in animation
- Stack multiple toasts
- Accessible (screen reader friendly)

---

## Keyboard Shortcuts

Speed up your workflow with shortcuts (coming soon):

- `N` - New idea
- `R` - Start recording
- `Cmd/Ctrl + K` - Search ideas
- `Cmd/Ctrl + S` - Save current idea
- `Esc` - Cancel/close

---

## Accessibility

IdeaCapture is designed to be accessible:

- **Touch Targets**: Minimum 44px for easy tapping
- **Color Contrast**: WCAG AA compliant
- **Keyboard Navigation**: All features accessible
- **Screen Readers**: Semantic HTML and ARIA labels
- **Focus Indicators**: Clear visual focus states

---

## Future Features

Planned for upcoming releases:

- Audio transcription with Whisper API
- Export ideas to PDF/Markdown
- Share ideas with unique links
- Team collaboration
- Idea templates
- Custom AI prompts
- Analytics dashboard
- Integration with project management tools

---

Ready to capture your next brilliant idea? Start using IdeaCapture today!
