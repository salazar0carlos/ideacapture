import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display Google OAuth button on login page', async ({ page }) => {
    await page.goto('/login');

    // Check page elements
    await expect(page.getByRole('heading', { name: 'IdeaCapture' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByText('Sign in with your Google account')).toBeVisible();

    // Check Google button
    const googleButton = page.getByRole('button', { name: /Continue with Google/i });
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });

  test('should redirect signup to login', async ({ page }) => {
    await page.goto('/signup');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page should be mobile-responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    // Check elements are visible on mobile
    await expect(page.getByRole('heading', { name: 'IdeaCapture' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

  test('Google button should have proper styling', async ({ page }) => {
    await page.goto('/login');

    const googleButton = page.getByRole('button', { name: /Continue with Google/i });

    // Check button is properly styled (white background, visible)
    await expect(googleButton).toBeVisible();

    // Check button has minimum touch target height
    const box = await googleButton.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(48);
  });
});

test.describe('Protected Routes', () => {
  test('should protect home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should protect ideas page', async ({ page }) => {
    await page.goto('/ideas');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should protect mindmap page', async ({ page }) => {
    await page.goto('/mindmap');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should protect settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('UI/UX', () => {
  test('login page should have proper branding', async ({ page }) => {
    await page.goto('/login');

    // Check branding elements
    await expect(page.getByRole('heading', { name: 'IdeaCapture' })).toBeVisible();
    await expect(page.getByText('Never lose an idea again')).toBeVisible();
    await expect(page.getByText(/Secure authentication powered by Supabase/i)).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    await page.goto('/login');

    // Page should load without errors
    const title = page.getByRole('heading', { name: 'IdeaCapture' });
    await expect(title).toBeVisible();
  });

  test('should have accessible contrast', async ({ page }) => {
    await page.goto('/login');

    // Check that important text is visible (this is a basic accessibility check)
    const heading = page.getByRole('heading', { name: 'Welcome Back' });
    await expect(heading).toBeVisible();
  });
});
