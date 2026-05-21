import { Page } from '@playwright/test';
import { setupApiMocks } from './api-mock.helper';

export async function waitForProducts(page: Page) {
    // Setup API mocks first
    await setupApiMocks(page);
    
    // Wait for Angular to be stable
    await page.waitForFunction(() => {
        const testabilities: { isStable: () => boolean }[] = (window as any)['getAllAngularTestabilities']?.() || [];
        return testabilities.every(t => t.isStable());
    });

    // Wait for product cards to be visible
    await page.waitForSelector('[data-testid="product-card"]', {
        state: 'visible',
        timeout: 30000 // Increase timeout to 30 seconds
    });
}

export async function addToCart(page: Page, productIndex = 0) {
    await waitForProducts(page);
    const addToCartButtons = page.locator('[data-testid="product-card"] button:not([data-testid="wishlist-button"])');
    await addToCartButtons.nth(productIndex).click();
}

export async function navigateToCart(page: Page) {
    await page.click('[data-testid="cart-link"]');
    await page.waitForSelector('[data-testid="cart-items"]', { state: 'visible' });
}
