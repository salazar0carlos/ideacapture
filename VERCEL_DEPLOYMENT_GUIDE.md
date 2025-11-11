# Vercel Deployment - Complete Fix Guide

## 🔧 Issues Fixed

### Issue 1: next-pwa Incompatibility with Next.js 16 (CRITICAL ✅)

**Problem:** `next-pwa@5.6.0` is NOT compatible with Next.js 16, which uses Turbopack by default.

**Symptoms:**
- Vercel builds fail with PWA-related errors
- Middleware manifest errors
- Service worker generation failures

**Fix Applied:**
- Temporarily disabled PWA in `next.config.ts`
- Removed `withPWA()` wrapper
- Added note for future upgrade to `@ducanh2912/next-pwa` (Next.js 16 compatible)

**Commit:** Latest

---

### Issue 2: Authentication Middleware Not Protecting Phase 2 Routes

**Problem:** `proxy.ts` wasn't protecting `/projects` and `/tasks` routes.

**Fix Applied:**
- Updated protected routes list in `proxy.ts`
- Added all Phase 2 routes
- Excluded API routes from matcher

**Status:** ✅ Fixed in commit 4e893b0

---

### Issue 3: Missing @supabase/ssr Dependency

**Problem:** Duplicate dependencies sections in `package.json` caused `@supabase/ssr` to be missing.

**Fix Applied:**
- Merged duplicate dependency sections
- Ensured `@supabase/ssr@^0.7.0` is listed

**Status:** ✅ Fixed in commit 8a6fede

---

## 🚀 Vercel Deployment Checklist

### Step 1: Verify Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables

**Required Variables:**

```
NEXT_PUBLIC_SUPABASE_URL=https://kmpznatvzavlvjezjfrx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<YOUR_REAL_SERVICE_ROLE_KEY_NOT_DUMMY>
ANTHROPIC_API_KEY=sk-ant-api03-...
STRIPE_SECRET_KEY=sk_live_51SSCImCsra8gHw6S...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SSCImCsra8gHw6S...
STRIPE_WEBHOOK_SECRET=<YOUR_REAL_WEBHOOK_SECRET_NOT_DUMMY>
STRIPE_PRICE_ID_MONTHLY=price_1SSMhJCsra8gHw6Seseq61cD
STRIPE_PRICE_ID_YEARLY=price_1SSMiRCsra8gHw6SK957UZBf
```

**CRITICAL:**
- `SUPABASE_SERVICE_ROLE_KEY` - Must be the REAL key (not `dummy_service_role_key_for_build`)
- `STRIPE_WEBHOOK_SECRET` - Must be the REAL webhook secret (not `whsec_dummy_secret_for_build`)

### Step 2: Set Node.js Version

In Vercel dashboard → Settings → General → Node.js Version

**Recommended:** 20.x or 18.x

### Step 3: Clear Build Cache

Before deploying:
1. Go to Vercel project → Deployments
2. Click on the latest failed deployment
3. Click "Redeploy" → Check "Clear cache" → Deploy

### Step 4: Push and Deploy

```bash
git add next.config.ts
git commit -m "fix: Disable next-pwa for Next.js 16 compatibility"
git push
```

Vercel should automatically trigger a new deployment.

---

## 📊 Troubleshooting Common Vercel Errors

### Error: "Module not found: Can't resolve 'next-pwa'"

**Cause:** Build system trying to import `next-pwa` but it's incompatible.

**Solution:** ✅ Already fixed - `next.config.ts` updated to not use PWA.

### Error: "Module not found: Can't resolve '@supabase/ssr'"

**Cause:** Missing dependency in `package.json`.

**Solution:** ✅ Already fixed - `package.json` has `@supabase/ssr` listed.

### Error: "proxy.ts not found" or "middleware configuration error"

**Cause:** Next.js 16 uses `proxy.ts` pattern, not `middleware.ts`.

**Solution:** ✅ Already fixed - `proxy.ts` exists and is properly configured.

### Error: "Build failed with exit code 1" (generic)

**Possible Causes:**
1. Environment variables not set in Vercel
2. TypeScript errors
3. PWA configuration issues
4. Dependency installation failures

**Solutions:**
1. Check all environment variables are set in Vercel dashboard
2. Run `npm run build` locally to check for TypeScript errors
3. ✅ PWA disabled
4. Check Vercel logs for specific npm install errors

### Error: "Service worker registration failed" (Runtime)

**Cause:** PWA is disabled but old service workers are cached.

**Solution:**
1. Clear browser cache
2. Unregister service workers in DevTools → Application → Service Workers
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Error: "Authentication not working" (Runtime)

**Possible Causes:**
1. `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set
2. Protected routes not configured properly
3. Cookies not being set correctly

**Solutions:**
1. Verify environment variables in Vercel dashboard
2. ✅ Protected routes fixed in `proxy.ts`
3. Check browser DevTools → Application → Cookies

### Error: "API routes return 500" (Runtime)

**Possible Causes:**
1. `SUPABASE_SERVICE_ROLE_KEY` is dummy value
2. `ANTHROPIC_API_KEY` is missing or invalid
3. Database tables don't exist (migration not run)

**Solutions:**
1. Set REAL service role key in Vercel (not the dummy value)
2. Verify Anthropic API key is valid
3. Run Supabase migration (see DEPLOYMENT_INSTRUCTIONS.md)

---

## 🧪 Testing Deployment

### After Successful Deployment:

1. **Visit your Vercel URL** (e.g., https://ideacapture.vercel.app)

2. **Test Authentication:**
   - Should redirect to `/login`
   - Sign up with new account
   - Should redirect to home
   - Verify bottom navigation shows

3. **Test Phase 2 Features:**
   - Navigate to `/projects` - should work
   - Navigate to `/tasks` - should work
   - Create an idea, validate it, convert to project

4. **Check Browser Console:**
   - No errors related to service workers
   - No 401 authentication errors
   - No 500 API errors

5. **Test API Routes:**
   - Try creating an idea
   - Try refining an idea
   - Try converting to project
   - Try generating tasks

---

## 🔄 Re-enabling PWA (Future)

Once you want to re-enable PWA functionality:

### Option 1: Upgrade to Next.js 16 Compatible PWA

```bash
npm uninstall next-pwa
npm install @ducanh2912/next-pwa
```

Update `next.config.ts`:
```typescript
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default withPWA(nextConfig);
```

### Option 2: Downgrade to Next.js 14 (Not Recommended)

```bash
npm install next@14.2.0 react@18.3.0 react-dom@18.3.0
```

Then re-enable the old PWA configuration.

**Recommendation:** Use Option 1 (upgrade PWA package).

---

## 📝 Build Output Reference

**Successful Build Output Should Show:**

```
✓ Compiled successfully in X.Xs
  Running TypeScript ...
  Collecting page data ...
  Generating static pages (0/26) ...
✓ Generating static pages (26/26) in X.Xs
  Finalizing page optimization ...

Route (app)
├ ○ /                    (Static)
├ ƒ /api/ideas           (Dynamic)
├ ƒ /api/projects        (Dynamic)
├ ƒ /api/tasks           (Dynamic)
├ ○ /ideas               (Static)
├ ○ /projects            (Static)
├ ○ /tasks               (Static)
...
```

**No errors should appear.**

---

## 🆘 Still Failing?

If Vercel is still failing after all these fixes:

### 1. Get the Exact Error

- Go to Vercel dashboard → Deployments → Click on failed deployment
- Scroll to the bottom of the build logs
- Copy the entire error message and stack trace

### 2. Common Issues to Check

**Build Logs:**
- "Module not found" - Missing dependency
- "Type error" - TypeScript compilation issue
- "Command failed with exit code 1" - Generic error, need more context

**Runtime Logs (after successful deploy):**
- Check Function logs in Vercel dashboard
- Look for 500 errors in API routes
- Check for authentication failures

### 3. Debug Locally with Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start

# Open http://localhost:3000
# Test the entire flow
```

If it works locally but fails on Vercel, it's an environment or configuration issue.

### 4. Verify Package Integrity

```bash
# Delete node_modules and lockfile
rm -rf node_modules package-lock.json

# Clean install
npm install

# Try build again
npm run build
```

If this fixes it, commit the new `package-lock.json`.

---

## 📄 Summary of All Fixes

| Issue | Status | Commit | Description |
|-------|--------|--------|-------------|
| next-pwa incompatibility | ✅ Fixed | Latest | Disabled PWA in next.config.ts |
| Missing @supabase/ssr | ✅ Fixed | 8a6fede | Added to package.json |
| Auth middleware incomplete | ✅ Fixed | 4e893b0 | Updated proxy.ts routes |
| Duplicate dependencies | ✅ Fixed | 8a6fede | Merged package.json sections |
| Protected routes missing | ✅ Fixed | 4e893b0 | Added /projects and /tasks |
| API routes in middleware | ✅ Fixed | 4e893b0 | Excluded from proxy matcher |

All major Vercel deployment blockers have been addressed.

---

## 🎯 Expected Result

After pushing this commit, Vercel deployment should:
1. ✅ Build successfully without PWA errors
2. ✅ All TypeScript types compile correctly
3. ✅ All routes deploy properly
4. ✅ Authentication works correctly
5. ✅ API routes function as expected

The only functionality temporarily lost is PWA/offline support, which can be re-added later with a compatible package.
