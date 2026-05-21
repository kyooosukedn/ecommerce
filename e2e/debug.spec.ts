import { test, expect } from '@playwright/test';
import { waitForProducts } from './helpers/test-helper';
import { mockProducts } from './helpers/api-mock.helper';

test.describe('Debug Tests', () => {
  test('should verify product rendering', async ({ page }) => {
    // Navigate and wait for products
    await page.goto('http://localhost:4200/home');
    await waitForProducts(page);

    // Get all product cards
    const productCards = await page.locator('[data-testid="product-card"]').all();
    console.log('Found product cards:', productCards.length);

    // Verify each product card
    for (let i = 0; i < productCards.length; i++) {
      const card = productCards[i];
      console.log(`Checking product card ${i + 1}:`);

      // Get product details
      const title = await card.locator('h3').textContent();
      const price = await card.locator('.text-indigo-600').textContent();
      const addToCartButton = card.locator('button:not([data-testid="wishlist-button"])');
      const isEnabled = await addToCartButton.isEnabled();

      console.log({
        title,
        price,
        buttonEnabled: isEnabled,
        buttonText: await addToCartButton.textContent()
      });

      // Basic assertions
      expect(title).toBeTruthy();
      expect(price).toContain('$');
    }
  });

  test('should verify cart functionality', async ({ page }) => {
    // Navigate and wait for products
    await page.goto('http://localhost:4200/home');
    await waitForProducts(page);

    // Add product to cart
    await page.click('[data-testid="product-card"] button:not([data-testid="wishlist-button"])');
    
    // Check cart badge
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');

    console.log('Cart state after adding product:');
    console.log('- Badge count:', await cartBadge.textContent());
    console.log('- Product added:', mockProducts[0].title);
  });

  test('should verify wishlist functionality', async ({ page }) => {
    // Navigate and wait for products
    await page.goto('http://localhost:4200/home');
    await waitForProducts(page);

    // Add to wishlist
    await page.click('[data-testid="wishlist-button"]');
    
    // Check wishlist badge
    const wishlistBadge = page.locator('[data-testid="wishlist-badge"]');
    await expect(wishlistBadge).toHaveText('1');

    console.log('Wishlist state after adding product:');
    console.log('- Badge count:', await wishlistBadge.textContent());
    console.log('- Product added:', mockProducts[0].title);
  });
});
