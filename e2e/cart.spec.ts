import { test, expect } from '@playwright/test';
import { waitForProducts, addToCart, navigateToCart } from './helpers/test-helper';
import { mockProducts } from './helpers/api-mock.helper';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page and wait for initial load
    await page.goto('http://localhost:4200/home');
    await waitForProducts(page);
  });

  test('should add product to cart', async ({ page }) => {
    // Add first item to cart
    await addToCart(page, 0);

    // Verify cart badge shows 1 item
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');

    // Navigate to cart and verify product details
    await navigateToCart(page);
    const cartItem = page.locator('[data-testid="cart-items"] > div').first();
    await expect(cartItem.locator('h3')).toHaveText(mockProducts[0].title);
    await expect(cartItem.locator('.price')).toContainText(mockProducts[0].price.toString());
  });

  test('should handle multiple products in cart', async ({ page }) => {
    // Add two products to cart
    await addToCart(page, 0);
    await addToCart(page, 0); // Add same product twice to test quantity

    // Navigate to cart
    await navigateToCart(page);

    // Verify cart items
    const cartItems = page.locator('[data-testid="cart-items"] > div');
    await expect(cartItems).toHaveCount(1); // Should combine same products
    const quantity = page.locator('[data-testid="cart-item-quantity"]');
    await expect(quantity).toHaveText('2');
  });

  test('should update cart total', async ({ page }) => {
    // Add product to cart
    await addToCart(page, 0);

    // Navigate to cart
    await navigateToCart(page);

    // Verify total matches product price
    const total = page.locator('[data-testid="cart-total"]');
    const expectedPrice = mockProducts[0].price;
    await expect(total).toContainText(expectedPrice.toString());
  });

  test('should remove product from cart', async ({ page }) => {
    // Add product then navigate to cart
    await addToCart(page, 0);
    await navigateToCart(page);

    // Remove item
    await page.click('[data-testid="remove-from-cart"]');

    // Verify cart is empty
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
  });

  test('should persist cart after page reload', async ({ page }) => {
    // Add product to cart
    await addToCart(page, 0);

    // Reload page and wait for products
    await page.reload();
    await waitForProducts(page);

    // Navigate to cart and verify item still exists
    await navigateToCart(page);
    const cartItem = page.locator('[data-testid="cart-items"] > div').first();
    await expect(cartItem.locator('h3')).toHaveText(mockProducts[0].title);
  });
});
