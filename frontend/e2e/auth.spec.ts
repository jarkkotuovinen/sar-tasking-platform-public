import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays login form on homepage', async ({ page }) => {
    // Should show login page
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('allows navigation to register page', async ({ page }) => {
    // Click on "Create account" link
    await page.getByRole('link', { name: /create account/i }).click();

    // Should navigate to register page
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('shows validation errors on empty login submission', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show HTML5 validation errors (browser native)
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('required');
  });

  test('registers a new user successfully', async ({ page }) => {
    // Navigate to register page
    await page.getByRole('link', { name: /create account/i }).click();

    // Fill in the registration form with unique email
    const timestamp = Date.now();
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(`test${timestamp}@example.com`);
    await page.getByLabel(/password/i).fill('SecurePassword123!');

    // Submit the form
    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect to dashboard after successful registration
    // Note: This assumes registration auto-logs in the user
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('logs in existing user successfully', async ({ page }) => {
    // First, register a user
    await page.getByRole('link', { name: /create account/i }).click();
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill('SecurePassword123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard/);

    // Logout
    await page.getByRole('button', { name: /logout|sign out/i }).click();

    // Should be back at login page
    await expect(page).toHaveURL('/');

    // Now login with the same credentials
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill('SecurePassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('shows error on invalid login credentials', async ({ page }) => {
    // Try to login with non-existent credentials
    await page.getByLabel(/email/i).fill('nonexistent@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message (adjust based on your error display)
    await expect(page.getByText(/invalid credentials|login failed/i)).toBeVisible();
  });

  test('prevents registration with existing email', async ({ page }) => {
    // Register first user
    await page.getByRole('link', { name: /create account/i }).click();
    const email = `duplicate${Date.now()}@example.com`;

    await page.getByLabel(/name/i).fill('Test User 1');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for registration
    await expect(page).toHaveURL(/.*dashboard/);

    // Logout
    await page.getByRole('button', { name: /logout|sign out/i }).click();

    // Try to register again with same email
    await page.getByRole('link', { name: /create account/i }).click();
    await page.getByLabel(/name/i).fill('Test User 2');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Should show error about email already existing
    await expect(page.getByText(/email already exists|user already exists/i)).toBeVisible();
  });
});
