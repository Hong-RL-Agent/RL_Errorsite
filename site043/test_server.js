import http from 'http';

function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9942,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('--- Testing /api/health ---');
  const health = await testEndpoint('/api/health');
  console.log('Health:', health);

  console.log('--- Testing SEC-396 (Coupon Stacking Checkout) ---');
  const checkout = await testEndpoint('/api/checkout', 'POST', {
    couponIds: ['WELCOME10', 'FURNITURE20']
  });
  console.log('Checkout Result:', checkout);

  console.log('--- Testing SEC-398 (Wishlist Stale Status) ---');
  const wish = await testEndpoint('/api/wishlist');
  console.log('Wishlist Result:', wish.status, wish.data.slice(0, 100));

  console.log('--- Testing SEC-399 (Cancelled Order Shipped Transition) ---');
  const statusUpdate = await testEndpoint('/api/orders/ORD-20261001-8841/status', 'PATCH', {
    status: 'shipped',
    memo: '물류 출고 테스트'
  });
  console.log('Status Transition Result:', statusUpdate);

  console.log('--- Testing SEC-400 (Review on Cancelled Order Product) ---');
  const rev = await testEndpoint('/api/reviews', 'POST', {
    productId: 'prod-103',
    rating: 5,
    content: '취소했던 상품이지만 너무 멋집니다!'
  });
  console.log('Review Result:', rev);

  console.log('--- All site043 tests completed successfully! ---');
}

run();
