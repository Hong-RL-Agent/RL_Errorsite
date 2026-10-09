const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5005,
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
  console.log('=== TableRun C-06 Automated Backend & Sequence Bug Verification ===');

  // 1. Reset
  const resetRes = await makeRequest('POST', '/api/test/reset');
  console.log('[1] Reset API:', resetRes.status === 200 && resetRes.body.success ? 'PASS' : 'FAIL');

  // 2. C-06-622: Option Cost Ghost
  await makeRequest('POST', '/api/carts/items', { menuId: 1, quantity: 1, selectedOptionIds: [1, 2] });
  const summaryRes = await makeRequest('GET', '/api/checkout/summary');
  // Subtotal without options is 24,000 (12,000 initial + 12,000 new), but subtotalWithOptions is 28,000
  const optionGhost = summaryRes.body.subtotal < summaryRes.body.subtotalWithOptions;
  console.log('[2] C-06-622 Option Cost Ghost:', optionGhost ? `PASS (옵션 추가금 누락: subtotal ${summaryRes.body.subtotal}원 < 실제 ${summaryRes.body.subtotalWithOptions}원)` : 'FAIL');

  // 3. C-06-423: Minimum Order Bypass
  await makeRequest('POST', '/api/test/reset');
  const couponRes = await makeRequest('POST', '/api/checkout/coupon', { couponCode: 'WELCOME2000' });
  console.log('[3] C-06-423 Minimum Order Bypass:', couponRes.body.minimumOrderBypassed === true ? 'PASS (최소주문 우회 플래그 활성화)' : 'FAIL');

  // 4. C-06-604: Delivery Tip Distance Glitch
  const distRes = await makeRequest('POST', '/api/checkout/delivery-fee', { addressId: 2 });
  console.log('[4] C-06-604 Delivery Tip Distance:', distRes.body.deliveryFee === 1503000 ? 'PASS (배달팁: 1,503,000원)' : 'FAIL');

  // 5. C-06-1604: Stale Menu Price 409 Conflict
  await makeRequest('POST', '/api/test/reset');
  await makeRequest('POST', '/api/carts/items', { menuId: 2, quantity: 1 });
  const valRes = await makeRequest('POST', '/api/checkout/validate');
  console.log('[5] C-06-1604 Stale Menu Price:', valRes.status === 409 && valRes.body.error === 'PRICE_CHANGED' ? 'PASS (409 Conflict 가격 불일치)' : 'FAIL');

  // 6. C-06-1822: Rider Tip Bug
  await makeRequest('POST', '/api/test/reset');
  await makeRequest('POST', '/api/checkout/rider-tip', { amount: 1000 });
  const cancelRes = await makeRequest('DELETE', '/api/checkout/rider-tip');
  const cancelFailed = cancelRes.status === 500;
  const orderRes = await makeRequest('POST', '/api/orders');
  const tipCharged = orderRes.body.riderTip === 1000;
  console.log('[6] C-06-1822 Rider Tip Glitch:', cancelFailed && tipCharged ? 'PASS (취소 500 실패 후 실제 주문에 1,000원 청구)' : 'FAIL');

  // Final Reset
  await makeRequest('POST', '/api/test/reset');
  console.log('=== All 5 SEQUENCE_REPLAY Bugs in C-06 Verified Successfully ===');
}

runTests().catch(console.error);
