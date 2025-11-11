# IdeaCapture - App Store Submission Guide

This guide will walk you through building and submitting IdeaCapture to the Apple App Store and Google Play Store.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Building for iOS](#building-for-ios)
3. [Building for Android](#building-for-android)
4. [App Store Submission](#app-store-submission)
5. [Google Play Submission](#google-play-submission)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- **Apple Developer Account** ($99/year) - https://developer.apple.com
- **Google Play Developer Account** ($25 one-time) - https://play.google.com/console
- **Stripe Account** (for in-app subscriptions)
- **Deployed App** (Vercel, Netlify, or custom server)

### Required Software
- **macOS** (required for iOS builds)
  - Xcode 15+ (download from Mac App Store)
  - CocoaPods (`sudo gem install cocoapods`)
- **Android Studio** (for Android builds, works on Mac/Windows/Linux)
- **Node.js 18+**
- **Capacitor CLI** (already installed via `npm install`)

### Development Setup
```bash
# Install dependencies
npm install

# Build the Next.js app
npm run build

# Sync Capacitor (copies web assets to native projects)
npm run cap:sync
```

---

## Building for iOS

### Step 1: Deploy Your App

IdeaCapture uses server-side features (API routes, authentication), so you need to deploy it first:

1. **Deploy to Vercel** (recommended):
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

2. **Copy your deployment URL** (e.g., `https://ideacapture.vercel.app`)

### Step 2: Configure Capacitor

Update `capacitor.config.ts` with your production URL:

```typescript
server: {
  url: 'https://your-app.vercel.app', // Replace with your URL
  cleartext: false, // Use HTTPS in production
},
```

### Step 3: Sync iOS Project

```bash
npm run cap:sync
npm run cap:open:ios
```

This will open Xcode with the iOS project.

### Step 4: Configure Xcode Project

1. **Select your development team**:
   - Click on the project name in the left sidebar
   - Under "Signing & Capabilities", select your Apple Developer team

2. **Update Bundle Identifier**:
   - Change from `app.ideacapture` to your unique identifier
   - Format: `com.yourcompany.ideacapture`

3. **Set App Display Name**:
   - In General tab, set "Display Name" to "IdeaCapture"

4. **Configure App Icons**:
   - Create app icons using [App Icon Generator](https://appicon.co/)
   - Drag icons into `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Required sizes: 1024x1024, 180x180, 120x120, 87x87, 80x80, 76x76, 60x60, 58x58, 40x40, 29x29, 20x20

5. **Set Launch Screen**:
   - Edit `ios/App/App/Base.lproj/LaunchScreen.storyboard`
   - Or use a solid color matching your brand (#0A0A0F)

### Step 5: Configure Permissions

Add required permissions to `ios/App/App/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>IdeaCapture needs microphone access to record your voice ideas.</string>

<key>NSCameraUsageDescription</key>
<string>IdeaCapture needs camera access for future features.</string>
```

### Step 6: Build and Test

1. **Select a simulator** (iPhone 15 Pro) or your physical device
2. **Click Run** (▶️ button)
3. **Test the app** thoroughly:
   - Login/signup works
   - Voice recording works
   - AI features work
   - All pages load correctly

### Step 7: Create Archive for App Store

1. **Select "Any iOS Device (arm64)"** from the device dropdown
2. **Product > Archive**
3. Wait for the archive to complete
4. **Window > Organizer** will open
5. **Click "Distribute App"**
6. **Select "App Store Connect"**
7. **Follow the wizard** to upload to App Store Connect

---

## Building for Android

### Step 1: Open Android Studio

```bash
npm run cap:sync
npm run cap:open:android
```

### Step 2: Configure Project

1. **Update package name**:
   - Open `android/app/build.gradle`
   - Change `applicationId "app.ideacapture"` to your unique identifier
   - Format: `com.yourcompany.ideacapture`

2. **Update app name**:
   - Open `android/app/src/main/res/values/strings.xml`
   - Change `<string name="app_name">` to "IdeaCapture"

3. **Set app icons**:
   - Create adaptive icons using [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
   - Replace files in `android/app/src/main/res/mipmap-*/`
   - Required: ic_launcher.png, ic_launcher_round.png, ic_launcher_foreground.png, ic_launcher_background.png

### Step 3: Configure Permissions

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.microphone" android:required="true" />
```

### Step 4: Generate Signing Key

```bash
# Navigate to android directory
cd android

# Generate keystore
keytool -genkey -v -keystore ideacapture.keystore -alias ideacapture -keyalg RSA -keysize 2048 -validity 10000

# Answer the prompts
# IMPORTANT: Save your keystore password securely!
```

### Step 5: Configure Signing

Create `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=ideacapture
storeFile=ideacapture.keystore
```

Update `android/app/build.gradle`:

```gradle
// Add before android { }
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 6: Build APK/AAB

**For Testing (APK)**:
```bash
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

**For Play Store (AAB - Android App Bundle)**:
```bash
cd android
./gradlew bundleRelease

# AAB location: android/app/build/outputs/bundle/release/app-release.aab
```

### Step 7: Test the Release Build

Install APK on device:
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Test thoroughly before uploading to Play Store.

---

## App Store Submission (iOS)

### Step 1: Prepare Assets

**Screenshots** (use iPhone 15 Pro Max simulator):
- 6.7" Display: 1290 x 2796 pixels
- Capture 6-10 screenshots showing key features:
  1. Home screen with voice recording
  2. Recording in progress with waveform
  3. Ideas list with filters
  4. AI refinement questions
  5. Validation results
  6. Mind map visualization
  7. Settings page

**App Preview Video** (optional but recommended):
- 15-30 seconds
- Show voice capture → refinement → validation flow
- No audio required (captions only)

**App Icon**:
- 1024x1024 PNG (no alpha channel, no transparency)

### Step 2: Create App Store Listing

1. **Go to App Store Connect**: https://appstoreconnect.apple.com
2. **Click "My Apps" > "+" > "New App"**
3. **Fill in details**:
   - **Name**: IdeaCapture
   - **Primary Language**: English
   - **Bundle ID**: Select your configured bundle ID
   - **SKU**: ideacapture-ios (any unique identifier)

4. **App Information**:
   - **Subtitle**: Never lose a brilliant idea again
   - **Category**: Productivity
   - **Secondary Category**: Business

5. **Pricing**:
   - **Free** (with in-app purchases for Pro subscription)
   - Select all countries

6. **App Privacy**:
   - Configure data collection practices (see Privacy Policy)
   - Data types collected: Email, Voice Recordings, Ideas
   - Linked to user identity: Yes
   - Used for tracking: No

7. **Age Rating**:
   - Complete questionnaire
   - Should be rated 4+ (no objectionable content)

### Step 3: Upload Build

1. **In Xcode > Organizer**, upload your archive (see Building for iOS, Step 7)
2. **Wait for processing** (5-30 minutes)
3. **In App Store Connect**, go to your app > Build
4. **Select the uploaded build**

### Step 4: Complete Listing

**Description**:
```
Never lose a brilliant idea again!

IdeaCapture helps you capture fleeting thoughts instantly with voice recording, develop them with AI-powered refinement, and validate their market potential—all in one beautiful app.

FEATURES:
• Voice-First Capture: Tap and speak to record your ideas in seconds
• AI Refinement: Get 5 targeted questions to develop your concept
• Market Validation: Analyze demand, competition, and feasibility
• Mind Map: Visualize connections between your ideas
• Beautiful Design: Glass morphism UI with smooth animations
• Secure & Private: Your ideas stay yours with bank-level security

PERFECT FOR:
→ Entrepreneurs validating startup ideas
→ Product Managers tracking feature requests
→ Content Creators organizing video/article concepts
→ Anyone with brilliant ideas worth pursuing

FREE PLAN:
- 10 ideas
- Basic voice recording
- Idea organization

PRO PLAN ($4.99/month):
- Unlimited ideas
- AI refinement questions
- Market validation analysis
- Mind map visualization
- Priority support

Download now and never forget a brilliant idea again!
```

**Keywords** (100 characters max):
```
idea,voice,recording,ai,validation,startup,entrepreneur,notes,productivity,brainstorm,innovation
```

**Support URL**: https://ideacapture.app/support
**Marketing URL**: https://ideacapture.app
**Privacy Policy URL**: https://ideacapture.app/privacy

**Screenshots**: Upload 6-10 screenshots
**App Preview**: Upload video (optional)

### Step 5: Submit for Review

1. **Add your "App Review Information"**:
   - Contact info
   - Demo account (create test account):
     - Username: appReview@ideacapture.app
     - Password: TestUser2024!
   - Notes: "This app uses voice recording to capture ideas. Please test on a real device."

2. **Click "Submit for Review"**
3. **Wait 1-3 days** for review
4. **Respond to any review feedback** quickly

### Step 6: App Store Optimization (After Approval)

- Monitor reviews and ratings
- Respond to user feedback
- Update screenshots seasonally
- A/B test app icon and screenshots
- Promote on Product Hunt, Twitter, etc.

---

## Google Play Submission (Android)

### Step 1: Create Google Play Developer Account

1. **Go to**: https://play.google.com/console
2. **Pay $25 one-time fee**
3. **Complete developer profile**

### Step 2: Create App

1. **Click "Create app"**
2. **App details**:
   - **App name**: IdeaCapture
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free

3. **Complete declarations**:
   - Privacy policy
   - Restricted content
   - Target audience
   - etc.

### Step 3: Upload AAB

1. **Go to "Production" > "Create new release"**
2. **Upload AAB** (built in Android section, Step 6)
3. **Add release notes**:
   ```
   Initial release of IdeaCapture

   Features:
   - Voice recording for idea capture
   - AI-powered refinement questions
   - Market validation analysis
   - Mind map visualization
   - Beautiful glass morphism design
   ```

### Step 4: Complete Store Listing

**Short description** (80 characters):
```
Voice-first idea management with AI refinement and market validation
```

**Full description** (4000 characters max):
```
Never lose a brilliant idea again!

IdeaCapture transforms the way you manage ideas. Capture thoughts instantly with voice recording, develop them with AI-powered refinement, and validate their market potential—all in one beautiful app.

✨ FEATURES

VOICE-FIRST CAPTURE
Tap and speak to record your ideas in seconds. No more fumbling with keyboards when inspiration strikes. Real-time waveform visualization shows you're being heard.

AI REFINEMENT
Get 5 targeted questions powered by Claude AI to develop your concept. Cover problem, solution, market, feasibility, and implementation in minutes.

MARKET VALIDATION
Comprehensive AI analysis provides three scores: Demand, Competition, Feasibility. Clear recommendation: should you pursue this? What are the next steps?

MIND MAP VISUALIZATION
See all your ideas in an interactive mind map. Discover patterns and connections you'd never notice in a list.

BEAUTIFUL DESIGN
Glass morphism aesthetic, smooth animations, and dark theme optimized for OLED screens. Built mobile-first for the best experience.

SECURE & PRIVATE
Your ideas are valuable. Bank-level security with Row Level Security (RLS) ensures only you can access your data. We never sell your data or use it for advertising.

🎯 PERFECT FOR

→ Entrepreneurs validating startup ideas before investing time/money
→ Product Managers organizing feature requests and user feedback
→ Content Creators tracking video and article ideas
→ Innovators developing technical solutions
→ Anyone with brilliant ideas worth pursuing

📦 PLANS

FREE PLAN
• 10 ideas
• Basic voice recording (2 minutes)
• Idea organization and categories
• Search and filtering

PRO PLAN ($4.99/month or $49.99/year)
• Unlimited ideas
• Extended voice recording (5 minutes)
• AI refinement with 5 questions
• Market validation analysis
• Mind map visualization
• Export to JSON/PDF
• Priority support

💡 WHY IDEACAPTURE?

Unlike note-taking apps (Notion, Evernote), IdeaCapture is specifically designed for ideas. Not tasks, not documents—ideas that need to be captured fast and developed thoughtfully.

Unlike voice memos, IdeaCapture adds structure, AI analysis, and validation. Your recordings become actionable insights.

Unlike mind mapping tools, IdeaCapture starts with voice and adds AI intelligence to help you think deeper.

🔒 PRIVACY

Your ideas stay yours. We comply with GDPR, CCPA, and other privacy regulations. Full privacy policy available at ideacapture.app/privacy.

🚀 GET STARTED

1. Download IdeaCapture
2. Create your free account
3. Tap the mic and speak your idea
4. Let AI help you develop and validate it
5. Pursue the ideas worth pursuing

Download now and never forget a brilliant idea again!

---

Built with Next.js, Claude AI, and Supabase.
```

**Graphics**:
- **App icon**: 512x512 PNG
- **Feature graphic**: 1024x500 PNG (create with your brand colors/app screenshot)
- **Screenshots**:
  - Phone: 1080 x 1920 pixels (minimum 2, maximum 8)
  - 7-inch tablet: 1200 x 1920 pixels (optional)
  - 10-inch tablet: 1800 x 2560 pixels (optional)

**Categorization**:
- **App category**: Productivity
- **Tags**: ideas, voice recording, AI, validation, productivity, notes

**Contact details**:
- **Email**: support@ideacapture.app
- **Phone**: (optional)
- **Website**: https://ideacapture.app

**Privacy policy**: https://ideacapture.app/privacy

### Step 5: Complete Content Rating

1. **Go to "App content" > "Content rating"**
2. **Fill out questionnaire**:
   - No violence, sexual content, drugs, etc.
   - Should get PEGI 3 / ESRB Everyone rating

### Step 6: Set Up Pricing & Distribution

1. **Countries**: Select all countries
2. **Pricing**: Free
3. **In-app products**: Will set up later for Pro subscription
4. **Distributed on**: Google Play for Android devices

### Step 7: Submit for Review

1. **Review all sections** (must have checkmarks)
2. **Click "Send for review"**
3. **Wait 2-7 days** for review
4. **Respond to any feedback**

---

## Testing

### Beta Testing (iOS - TestFlight)

1. **In App Store Connect**, go to TestFlight
2. **Add internal testers** (up to 100, no review required)
3. **Share public link** for external testing (requires review)
4. **Collect feedback** before public release

### Beta Testing (Android - Internal Testing)

1. **In Play Console**, go to "Testing" > "Internal testing"
2. **Create release** with AAB
3. **Add testers by email**
4. **Share opt-in URL**
5. **Collect feedback**

### What to Test

- [ ] Login/signup flow
- [ ] Password reset
- [ ] Voice recording (permissions, recording, playback)
- [ ] Idea creation and editing
- [ ] AI refinement (all questions)
- [ ] AI validation (scores display correctly)
- [ ] Mind map visualization
- [ ] Settings page
- [ ] Subscription upgrade (use Stripe test cards)
- [ ] Data export
- [ ] Account deletion
- [ ] Deep linking (if implemented)
- [ ] Offline behavior
- [ ] Push notifications (if implemented)
- [ ] Different screen sizes
- [ ] Dark mode / light mode (if implemented)

---

## Troubleshooting

### iOS Issues

**"No provisioning profiles found"**
- Go to Xcode > Preferences > Accounts
- Select your Apple ID > Download Manual Profiles
- Or use "Automatically manage signing"

**"Could not launch app"**
- Check Bundle ID matches your App ID
- Verify device is registered in developer portal
- Clean build folder (Product > Clean Build Folder)

**"Invalid Binary"**
- Ensure you're building for iOS (not simulator)
- Check minimum iOS version (iOS 13.0+)
- Verify all required icons are present

### Android Issues

**"keystore not found"**
- Ensure `key.properties` path is correct
- Move keystore to `android/` directory
- Use absolute path if needed

**"Execution failed for task ':app:signReleaseBundle'"**
- Verify keystore password is correct
- Check keystore file isn't corrupted
- Regenerate if necessary

**"App not installed"**
- Uninstall previous version first
- Check Android version compatibility
- Verify signing configuration

### Capacitor Issues

**"webDir not found"**
- Run `npm run build` first
- Ensure `out` directory exists
- Check `capacitor.config.ts` webDir path

**"Failed to load URL"**
- Verify server URL is correct and accessible
- Check HTTPS certificate is valid
- Test server URL in browser first

---

## Next Steps After Approval

1. **Monitor analytics** (App Store Connect / Play Console)
2. **Respond to reviews** within 24-48 hours
3. **Plan updates** (release monthly/quarterly)
4. **Set up app indexing** for SEO
5. **Create press kit** for media
6. **Submit to app directories** (Product Hunt, AlternativeTo, etc.)
7. **Run ads** (Apple Search Ads, Google App Campaigns)
8. **Build referral program**
9. **Collect testimonials**
10. **Iterate based on user feedback**

---

## Support

**Need help?**
- Email: support@ideacapture.app
- Documentation: https://ideacapture.app/docs
- GitHub Issues: https://github.com/salazar0carlos/ideacapture/issues

---

**Good luck with your App Store launch!** 🚀
