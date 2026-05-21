import { Page } from '@playwright/test';

export const mockProducts = [{
  id: 2, // Using even ID to ensure inStock is true
  title: "Test Product",
  price: 100,
  description: "Test description",
  category: "test",
  image: "https://test.com/image.jpg",
  rating: { rate: 4.5, count: 100 },
  inStock: true,
  quantity: 1
}];

export async function setupApiMocks(page: Page) {
  // Mock API requests
  await page.route('**/products', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProducts)
    });
  });

  // Mock image requests
  await page.route('**/image.jpg', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'image/jpeg',
      body: Buffer.from([]) // Empty image
    });
  });

  // Enable request logging
  page.on('request', request => {
    console.log('Request:', request.url(), request.method());
  });

  page.on('response', async response => {
    console.log('Response:', response.url(), response.status());
    if (response.url().includes('/products')) {
      try {
        const body = await response.json();
        console.log('API Response body:', body);
      } catch (e) {
        console.log('Failed to parse API response:', e);
      }
    }
  });
}
