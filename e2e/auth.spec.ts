import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login form elements are visible
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should show validation errors with invalid email', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid email
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password').fill('password123');
    
    // Try to submit
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Check for validation message
    await expect(page.getByText('Please enter a valid email')).toBeVisible();
  });

  test('should navigate to dashboard after successful login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in valid credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Check navigation to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verify user is logged in by checking header
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });
});
