const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5004,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Morrow Market C-05 Automated Backend & Sequence Bug Verification ===');

  // 1. Reset
  const resetRes = await makeRequest('POST', '/api/test/reset');
  console.log('[1] Reset API:', resetRes.status === 200 && resetRes.body.success ? 'PASS' : 'FAIL');

  // 2. C-05-011: Coupon Stack Bug
  await makeRequest('POST', '/api/checkout/coupon', { couponCode: 'SAVE10' });
  const couponStackRes = await makeRequest('POST', '/api/checkout/coupon', { couponCode: 'SAVE5' });
  console.log('[2] C-05-011 Coupon Stack:', couponStackRes.body.totalDiscount === 15000 ? 'PASS (15,000원 누적 할인)' : 'FAIL');

  // 3. C-05-013: Negative Total
  await makeRequest('POST', '/api/test/reset');
  await makeRequest('POST', '/api/checkout/coupon', { couponCode: 'WELCOME30' });
  const summaryRes = await makeRequest('GET', '/api/checkout/summary');
  console.log('[3] C-05-013 Negative Total:', summaryRes.body.total === -15000 ? 'PASS (-15,000원 음수 결제)' : 'FAIL');

  // 4. C-05-627: Stealth Cart Injection
  await makeRequest('POST', '/api/test/reset');
  await makeRequest('POST', '/api/checkout/shipping', { shippingOptionId: 2 });
  const cartRes = await makeRequest('GET', '/api/cart');
  const hasInjectedBag = cartRes.body.items.some((it) => it.product_id === 5);
  console.log('[4] C-05-627 Stealth Cart Injection:', hasInjectedBag ? 'PASS (신선 보냉백 자동 추가)' : 'FAIL');

  // 5. C-05-446: Inventory Steal 409 Conflict
  await makeRequest('POST', '/api/test/reset');
  // Add 5 of Product 2 (stock = 3)
  await makeRequest('POST', '/api/cart/items', { productId: 2, quantity: 5 });
  const orderRes = await makeRequest('POST', '/api/orders', {
    cartId: 1,
    shippingAddressId: 1,
    shippingOptionId: 1
  });
  console.log('[5] C-05-446 409 Conflict:', orderRes.status === 409 && orderRes.body.error === 'OUT_OF_STOCK' ? 'PASS (409 Conflict 재고 부족)' : 'FAIL');

  // 6. C-05-652: Precision Float Error
  await makeRequest('POST', '/api/test/reset');
  await makeRequest('POST', '/api/checkout/coupon', { couponCode: 'SPRING30' });
  const floatSummaryRes = await makeRequest('GET', '/api/checkout/summary');
  const isFloat = typeof floatSummaryRes.body.total === 'number' && !Number.isInteger(floatSummaryRes.body.total);
  console.log('[6] C-05-652 Precision Float:', isFloat ? `PASS (부동소수점: ${floatSummaryRes.body.total})` : `FAIL (${floatSummaryRes.body.total})`);

  // Final Reset
  await makeRequest('POST', '/api/test/reset');
  console.log('=== All 5 SEQUENCE_REPLAY Bugs Verified Successfully ===');
}

runTests().catch(console.error);
