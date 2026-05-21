import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const cartAddTime = new Trend('cart_add_time');
const searchTime = new Trend('search_time');

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 20 },  // Ramp up to 20
    { duration: '3m', target: 20 },  // Stay at 20
    { duration: '1m', target: 30 },  // Ramp up to 30
    { duration: '3m', target: 30 },  // Stay at 30
    { duration: '1m', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
    errors: ['rate<0.1'],             // Error rate should be below 10%
    cart_add_time: ['p(95)<1000'],    // 95% of cart additions should be under 1s
    search_time: ['p(95)<800'],       // 95% of searches should be under 800ms
  },
};

const BASE_URL = 'http://localhost:4200';

export function setup() {
  // Login to get auth token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: 'test@example.com',
    password: 'Test@123',
  });
  
  check(loginRes, {
    'logged in successfully': (r) => r.status === 200 && r.json('token'),
  });
  
  return { authToken: loginRes.json('token') };
}

export default function (data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.authToken}`,
      'Content-Type': 'application/json',
    },
  };

  // Group 1: Browse products
  const browseStart = Date.now();
  const productsRes = http.get(`${BASE_URL}/api/products`, params);
  check(productsRes, {
    'products loaded': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);

  // Group 2: Search products
  const searchStart = Date.now();
  const searchRes = http.get(`${BASE_URL}/api/products/search?q=phone`, params);
  check(searchRes, {
    'search successful': (r) => r.status === 200,
  }) || errorRate.add(1);
  searchTime.add(Date.now() - searchStart);
  sleep(1);

  // Group 3: Product detail
  const productRes = http.get(`${BASE_URL}/api/products/1`, params);
  check(productRes, {
    'product detail loaded': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);

  // Group 4: Cart operations
  const cartStart = Date.now();
  const cartAddRes = http.post(`${BASE_URL}/api/cart`, {
    productId: 1,
    quantity: 1,
  }, params);
  check(cartAddRes, {
    'added to cart': (r) => r.status === 200,
  }) || errorRate.add(1);
  cartAddTime.add(Date.now() - cartStart);

  // Get cart
  const cartRes = http.get(`${BASE_URL}/api/cart`, params);
  check(cartRes, {
    'cart retrieved': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(2);

  // Group 5: Wishlist operations
  const wishlistRes = http.post(`${BASE_URL}/api/wishlist`, {
    productId: 2,
  }, params);
  check(wishlistRes, {
    'added to wishlist': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);
}

export function teardown(data) {
  // Cleanup: logout and clear test data
  const params = {
    headers: {
      'Authorization': `Bearer ${data.authToken}`,
    },
  };
  http.post(`${BASE_URL}/api/auth/logout`, null, params);
}
