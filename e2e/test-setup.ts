import { test as base } from '@playwright/test';
import { mockProducts } from './mocks/products.mock';

// Extend base test with mocking capabilities
export const test = base.extend({
  page: async ({ page }, use) => {
    // Mock products API
    await page.route('**/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      });
    });

    // Mock cart API
    await page.route('**/cart', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Mock wishlist API
    await page.route('**/wishlist', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await use(page);
  },
});
