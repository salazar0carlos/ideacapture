# IdeaCapture Testing Guide

## Overview

This document describes the testing strategy for IdeaCapture, including automated E2E tests and manual testing procedures before deployment.

---

## Automated End-to-End Tests

IdeaCapture uses [Playwright](https://playwright.dev/) for automated E2E testing across multiple browsers and devices.

### Running E2E Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run tests with UI (interactive)
npm run test:e2e:ui

# Run tests with browser visible
npm run test:e2e:headed

# View last test report
npm run test:e2e:report
```

### Test Coverage

The E2E test suite (`e2e/auth-flow.spec.ts`) covers:

#### Authentication Flow
- ✅ Redirects unauthenticated users to /login
- ✅ Displays Google OAuth button on login page
- ✅ Signup page redirects to login (OAuth handles both)
- ✅ Mobile-responsive login page
- ✅ Proper button styling and touch targets (48px+)

#### Protected Routes
- ✅ Home page requires authentication
- ✅ Ideas page requires authentication
- ✅ Mind map page requires authentication
- ✅ Settings page requires authentication

#### UI/UX
- ✅ Proper branding (IdeaCapture logo, tagline)
- ✅ Loading states work correctly
- ✅ Accessible contrast and visibility

### Test Environments

Tests run on:
- **Desktop Chrome** (Chromium)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

---

## Manual Testing Before Deployment

### Prerequisites

Before testing, ensure:
- [ ] Supabase project is set up
- [ ] Google OAuth is configured in Supabase
- [ ] Environment variables are set in `.env.local`
- [ ] Database migrations have been run
- [ ] RLS policies are enabled

### Pre-Deployment Checklist

Run through this checklist before every deployment:

#### 1. Build Verification

```bash
npm run build
```

**Expected Result:** Build completes with 0 errors

- [ ] No TypeScript errors
- [ ] No build warnings (excluding deprecation warnings)
- [ ] All pages compile successfully

#### 2. Automated Tests

```bash
npm run test:e2e
```

**Expected Result:** All tests pass

- [ ] Authentication flow tests pass
- [ ] Protected routes tests pass
- [ ] UI/UX tests pass
- [ ] Tests pass on all browsers (Chrome, Mobile Chrome, Mobile Safari)

#### 3. Manual Auth Flow Testing

**Test 1: Unauthenticated Access**
1. Open app in incognito/private browsing
2. Navigate to `http://localhost:3000`
3. ✅ **Expected:** Redirected to `/login`

**Test 2: Login Page UI**
1. On login page, verify:
   - [ ] IdeaCapture logo and tagline visible
   - [ ] "Welcome Back" heading
   - [ ] "Continue with Google" button with Google logo
   - [ ] Button is white with black text
   - [ ] Button has proper hover state
   - [ ] Terms and privacy policy text

**Test 3: Google OAuth (Requires Real Supabase Setup)**
1. Click "Continue with Google"
2. ✅ **Expected:** Redirect to Google sign-in
3. Sign in with test Google account
4. ✅ **Expected:** Redirect back to home page (`/`)
5. ✅ **Expected:** Bottom navigation visible

**Test 4: Protected Routes After Login**
1. After logging in, navigate to:
   - `/` - Home page
   - `/ideas` - Ideas page
   - `/mindmap` - Mind map page
   - `/settings` - Settings page
2. ✅ **Expected:** All pages accessible (no redirect to login)
3. ✅ **Expected:** Bottom navigation visible on all pages

**Test 5: User Profile in Settings**
1. Navigate to `/settings`
2. Verify:
   - [ ] User email displayed correctly
   - [ ] Logout button visible
   - [ ] User icon/avatar visible

**Test 6: Logout Flow**
1. On settings page, click "Logout"
2. ✅ **Expected:** Confirmation dialog appears
3. Click "Logout" (confirm)
4. ✅ **Expected:** Redirected to `/login`
5. Try to access `/settings`
6. ✅ **Expected:** Redirected back to `/login`

**Test 7: Session Persistence**
1. Log in successfully
2. Close browser tab
3. Reopen app
4. ✅ **Expected:** Still logged in (no redirect to login)

#### 4. Mobile Testing

Test on real devices or browser DevTools:

**iPhone (Safari)**
1. Open app on iPhone Safari
2. Run through auth flow (Tests 1-7 above)
3. Verify touch targets are easily tappable (44px+)
4. ✅ **Expected:** No layout issues
5. Install as PWA (Add to Home Screen)
6. Open from home screen
7. ✅ **Expected:** Auth state persists

**Android (Chrome)**
1. Open app on Android Chrome
2. Run through auth flow (Tests 1-7 above)
3. Verify touch targets are easily tappable (44px+)
4. ✅ **Expected:** No layout issues
5. Install as PWA (Install App prompt)
6. Open from home screen
7. ✅ **Expected:** Auth state persists

#### 5. RLS Verification (Multi-User Testing)

**Test Data Isolation**
1. Log in with User A (Google account #1)
2. Check Settings - note email
3. Log out
4. Log in with User B (Google account #2 in incognito)
5. Check Settings - note different email
6. ✅ **Expected:** Each user sees only their own data
7. ✅ **Expected:** No cross-user data leakage

#### 6. Performance & Console Checks

1. Open Browser DevTools Console
2. Navigate through all pages
3. ✅ **Expected:** No errors in console
4. ✅ **Expected:** No 404s in Network tab
5. Check Lighthouse score (optional)
   - Performance: 90+
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 90+

---

## Testing with Real Supabase

### Setup Requirements

To test with real authentication, you need:

1. **Supabase Project**
   - Create project at https://supabase.com
   - Get project URL and anon key

2. **Google OAuth Configuration**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Create Google OAuth App at https://console.cloud.google.com
   - Add OAuth credentials to Supabase
   - Configure redirect URLs

3. **Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_real_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_real_anon_key
   ```

4. **Database Migrations**
   - Run `supabase/schema.sql`
   - Run `supabase/add_user_id_migration.sql`
   - Run `supabase/rls_policies.sql`

### Test With Real OAuth

Once configured:

```bash
npm run dev
```

1. Open http://localhost:3000
2. Click "Continue with Google"
3. Sign in with your Google account
4. Verify full auth flow works
5. Test logout
6. Test session persistence

---

## Continuous Integration (CI)

For CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Run build
  run: npm run build

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

---

## Troubleshooting

### Tests Fail Locally

1. Ensure dev server is running
2. Check no other process is using port 3000
3. Clear browser cache: `npx playwright clean`
4. Reinstall Playwright browsers: `npx playwright install`

### OAuth Not Working

1. Check Supabase Auth provider is enabled
2. Verify OAuth credentials are correct
3. Ensure redirect URLs include your domain
4. Check browser console for errors
5. Verify `.env.local` has real Supabase credentials

### RLS Issues

1. Verify RLS policies are enabled in Supabase Dashboard
2. Check policies are correctly filtering by `auth.uid()`
3. Test with different users to confirm isolation
4. Check Supabase logs for policy violations

---

## Pre-Production Deployment Checklist

Before deploying to production (Vercel, etc.):

- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Build succeeds with 0 errors (`npm run build`)
- [ ] Manual testing completed on desktop
- [ ] Manual testing completed on mobile (iOS + Android)
- [ ] Google OAuth working in development
- [ ] RLS policies verified with multi-user testing
- [ ] No console errors
- [ ] Lighthouse scores acceptable
- [ ] Environment variables configured on hosting platform
- [ ] Redirect URLs include production domain in Supabase

---

## Post-Deployment Testing

After deploying to production:

1. Test full auth flow on production URL
2. Verify Google OAuth works on production
3. Test on mobile devices (not just DevTools)
4. Install PWA from production
5. Verify RLS with multiple users
6. Monitor Supabase logs for auth errors

---

## Support

For questions or issues:
- Check Supabase logs: Dashboard → Logs
- Check browser console for errors
- Review Playwright test reports: `npm run test:e2e:report`
- Contact: [@salazar0carlos](https://github.com/salazar0carlos)

---

## Summary

✅ **Automated Tests:** `npm run test:e2e`
✅ **Build Verification:** `npm run build`
✅ **Manual Testing:** Follow checklist above
✅ **Multi-Browser:** Chrome, Mobile Chrome, Mobile Safari
✅ **Multi-User RLS:** Test with 2+ Google accounts
✅ **Mobile PWA:** Test installation and persistence

**Ready to deploy when all checks pass!** 🚀
