import { test, expect } from '@playwright/test';

test('API mocking test', async ({ page }) => {
  // Enable debug logging
  page.on('console', msg => console.log('Browser log:', msg.text()));

  // Track all requests
  const requests: string[] = [];
  page.on('request', request => {
    requests.push(request.url());
    console.log('Request:', request.url(), request.method());
  });

  // Track all responses
  page.on('response', async response => {
    console.log('Response:', response.url(), response.status());
    if (response.url().includes('fakestoreapi.com/products')) {
      try {
        const body = await response.json();
        console.log('API Response body:', body);
      } catch (e) {
        console.log('Failed to parse API response:', e);
      }
    }
  });

  // Setup API mock before navigation
  let apiCallCount = 0;
  await page.route('**/products', async route => {
    apiCallCount++;
    console.log('Mocking API call:', route.request().url(), 'Call count:', apiCallCount);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{
        id: 2, // Using even ID to ensure inStock is true
        title: "Test Product",
        price: 100,
        description: "Test description",
        category: "test",
        image: "https://test.com/image.jpg",
        rating: { rate: 4.5, count: 100 },
        inStock: true
      }])
    });
  });

  // Mock image request to avoid 404
  await page.route('**/image.jpg', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'image/jpeg',
      body: Buffer.from([]) // Empty image
    });
  });

  // Navigate to home page (which shows products)
  console.log('Navigating to home page...');
  await page.goto('http://localhost:4200/home', {
    waitUntil: 'networkidle'
  });

  // Wait for Angular to be stable
  await page.waitForFunction(() => {
    const testabilities: { isStable: () => boolean }[] = (window as any)['getAllAngularTestabilities']?.() || [];
    return testabilities.every(t => t.isStable());
  });

  // Wait for product card to be visible
  await page.waitForSelector('[data-testid="product-card"]', { state: 'visible' });

  // Check for API requests
  const apiRequests = requests.filter(url => url.includes('fakestoreapi.com'));
  console.log('API requests:', apiRequests);

  // Evaluate page state
  const pageState = await page.evaluate(() => ({
    isLoading: document.querySelector('.skeleton-loader') !== null,
    hasProducts: document.querySelector('[data-testid="product-card"]') !== null,
    html: document.body.innerHTML
  }));

  console.log('Page state:', pageState);
  console.log('API calls intercepted:', apiCallCount);

  // Add assertions
  expect(apiCallCount).toBe(1);
  expect(pageState.hasProducts).toBe(true);
  expect(pageState.isLoading).toBe(false);

  // Check product details
  const productTitle = await page.textContent('[data-testid="product-card"] h3');
  const productPrice = await page.textContent('[data-testid="product-card"] .text-indigo-600');
  const addToCartButton = await page.locator('[data-testid="product-card"] button:not([data-testid="wishlist-button"])');

  expect(productTitle).toBe('Test Product');
  expect(productPrice?.trim()).toBe('$100.00');

  // Take a screenshot
  await page.screenshot({ path: 'debug-api-mock.png', fullPage: true });
});
