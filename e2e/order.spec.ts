import { test, expect } from '@playwright/test';
import { waitForProducts, addToCart, navigateToCart } from './helpers/test-helper';
import { mockProducts } from './helpers/api-mock.helper';

test.describe('Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page and wait for initial load
    await page.goto('http://localhost:4200/home');
    await waitForProducts(page);
  });

  test('should complete order flow', async ({ page }) => {
    // Add products to cart
    await addToCart(page, 0);
    await addToCart(page, 1);
    
    // Navigate to cart
    await navigateToCart(page);
    
    // Fill shipping details
    await page.fill('[data-testid="shipping-street"]', '123 Test St');
    await page.fill('[data-testid="shipping-city"]', 'Test City');
    await page.fill('[data-testid="shipping-state"]', 'TS');
    await page.fill('[data-testid="shipping-zip"]', '12345');
    
    // Place order
    await page.click('[data-testid="place-order-button"]');
    
    // Verify order confirmation
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    //await expect(page.locator('[data-testid="order-number"]')).toMatch(/ORD-[A-Z0-9]{9}/);
  });

  test('should show order in my orders', async ({ page }) => {
    // Complete an order first
    await addToCart(page, 0);
    await navigateToCart(page);
    await page.fill('[data-testid="shipping-street"]', '123 Test St');
    await page.fill('[data-testid="shipping-city"]', 'Test City');
    await page.fill('[data-testid="shipping-state"]', 'TS');
    await page.fill('[data-testid="shipping-zip"]', '12345');
    await page.click('[data-testid="place-order-button"]');
    
    // Navigate to my orders
    await page.click('[data-testid="my-orders-link"]');
    
    // Verify order appears in list
    const orderItem = page.locator('[data-testid="order-items"] > div').first();
    await expect(orderItem.locator('[data-testid="order-status"]')).toHaveText('pending');
    await expect(orderItem.locator('[data-testid="order-total"]')).toContainText(mockProducts[0].price.toString());
  });

  test('should cancel order', async ({ page }) => {
    // Complete an order first
    await addToCart(page, 0);
    await navigateToCart(page);
    await page.fill('[data-testid="shipping-street"]', '123 Test St');
    await page.fill('[data-testid="shipping-city"]', 'Test City');
    await page.fill('[data-testid="shipping-state"]', 'TS');
    await page.fill('[data-testid="shipping-zip"]', '12345');
    await page.click('[data-testid="place-order-button"]');
    
    // Navigate to my orders
    await page.click('[data-testid="my-orders-link"]');
    
    // Cancel the order
    await page.click('[data-testid="cancel-order-button"]');
    
    // Verify order status changed
    const orderStatus = page.locator('[data-testid="order-status"]').first();
    await expect(orderStatus).toHaveText('cancelled');
  });
});
