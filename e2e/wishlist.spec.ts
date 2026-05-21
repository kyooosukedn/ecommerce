import { test, expect } from '@playwright/test';
import { waitForProducts } from './helpers/test-helper';
import { mockProducts } from './helpers/api-mock.helper';

test.describe('Wishlist', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page and wait for initial load
    await page.goto('http://localhost:4200/home');
    await waitForProducts(page);
  });

  test('should add product to wishlist', async ({ page }) => {
    // Add to wishlist
    await page.click('[data-testid="wishlist-button"]');

    // Verify wishlist indicator
    const wishlistBadge = page.locator('[data-testid="wishlist-badge"]');
    await expect(wishlistBadge).toHaveText('1');

    // Navigate to wishlist
    await page.click('[data-testid="wishlist-link"]');
    await page.waitForSelector('[data-testid="wishlist-items"]');

    // Verify product details
    const wishlistItem = page.locator('[data-testid="wishlist-items"] > div').first();
    await expect(wishlistItem.locator('h3')).toHaveText(mockProducts[0].title);
  });

  test('should remove product from wishlist', async ({ page }) => {
    // Add to wishlist first
    await page.click('[data-testid="wishlist-button"]');
    
    // Navigate to wishlist
    await page.click('[data-testid="wishlist-link"]');
    await page.waitForSelector('[data-testid="wishlist-items"]');

    // Remove from wishlist
    await page.click('[data-testid="remove-from-wishlist"]');

    // Verify wishlist is empty
    await expect(page.locator('[data-testid="wishlist-empty"]')).toBeVisible();
  });

  test('should persist wishlist after page reload', async ({ page }) => {
    // Add to wishlist
    await page.click('[data-testid="wishlist-button"]');

    // Reload page
    await page.reload();
    await waitForProducts(page);

    // Navigate to wishlist and verify
    await page.click('[data-testid="wishlist-link"]');
    await page.waitForSelector('[data-testid="wishlist-items"]');
    
    const wishlistItem = page.locator('[data-testid="wishlist-items"] > div').first();
    await expect(wishlistItem.locator('h3')).toHaveText(mockProducts[0].title);
  });

  test('should move product from wishlist to cart', async ({ page }) => {
    // Add to wishlist
    await page.click('[data-testid="wishlist-button"]');

    // Navigate to wishlist
    await page.click('[data-testid="wishlist-link"]');
    await page.waitForSelector('[data-testid="wishlist-items"]');

    // Move to cart
    await page.click('[data-testid="move-to-cart"]');

    // Verify moved to cart
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');

    // Verify removed from wishlist
    await expect(page.locator('[data-testid="wishlist-empty"]')).toBeVisible();
  });
});
