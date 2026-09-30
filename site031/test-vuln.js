const BASE_URL = 'http://localhost:9930';

async function testVulnerabilities() {
  console.log('==================================================');
  console.log('   site031 Price Tampering 10개 취약점 검증 시작');
  console.log('==================================================\n');

  let passedCount = 0;

  // 1. SEC-321: 농자재 태그 입력 흐름 금액 변조
  try {
    const res = await fetch(`${BASE_URL}/api/inventory/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'prod_01',
        tags: 'NFC 전자태그 1,000매',
        customTagAmount: 1000 // Normal: 50,000 -> 1,000 KRW
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.order && data.order.paymentAmount === 1000) {
      console.log('[Bug 01 | SEC-321] 농자재 태그 입력 금액 변조');
      console.log(`  - 정상 정가: 50,000원 | 변조 결제액: 1,000원`);
      console.log(`  - 검증 결과: ✅ 취약점 확인됨 (서버가 변조 금액 1,000원으로 승인)\n`);
      passedCount++;
    }
  } catch (e) { console.error('SEC-321 Fail:', e); }

  // 2. SEC-322: 농장 작업자 초대 메시지 흐름 금액 변조
  try {
    const res = await fetch(`${BASE_URL}/api/farm-members/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerName: '이동현 수석 재배사',
        role: '수석 재배사',
        workerServiceAmount: 1500 // Normal: 120,000 -> 1,500 KRW
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.order && data.order.paymentAmount === 1500) {
      console.log('[Bug 02 | SEC-322] 농장 작업자 초대 금액 변조');
      console.log(`  - 정상 정가: 120,000원 | 변조 결제액: 1,500원`);
      console.log(`  - 검증 결과: ✅ 취약점 확인됨 (서버가 변조 금액 1,500원으로 승인)\n`);
      passedCount++;
    }
  } catch (e) { console.error('SEC-322 Fail:', e); }

  // 3. SEC-323: 농기구 대여 서비스 흐름 금액 변조
  try {
    const res = await fetch(`${BASE_URL}/api/equipment-rentals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipmentId: 'eq_01',
        days: 2,
        rentalPrice: 2000 // Normal: 70,000 -> 2,000 KRW
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.order && data.order.paymentAmount === 2000) {
      console.log('[Bug 03 | SEC-323] 농기구 대여료 금액 변조');
      console.log(`  - 정상 정가: 70,000원 | 변조 결제액: 2,000원`);
      console.log(`  - 검증 결과: ✅ 취약점 확인됨 (서버가 변조 금액 2,000원으로 승인)\n`);
      passedCount++;
    }
  } catch (e) { console.error('SEC-323 Fail:', e); }

  // 4. SEC-324: 비료 및 영양제 주문 흐름 금액 변조
  try {
    const res = await fetch(`${BASE_URL}/api/nutrition-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'prod_04',
        quantity: 2,
        nutritionSubtotal: 2500 // Normal: 156,000 -> 2,500 KRW
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.order && data.order.paymentAmount === 2500) {
      console.log('[Bug 04 | SEC-324] 비료/영양제 주문 금액 변조');
      console.log(`  - 정상 정가: 156,000원 | 변조 결제액: 2,500원`);
      console.log(`  - 검증 결과: ✅ 취약점 확인됨 (서버가 변조 금액 2,500원으로 승인)\n`);
      passedCount++;
    }
  } catch (e) { console.error('SEC-324 Fail:', e); }

  // 5. SEC-325: 씨앗 및 모종 주문 흐름 금액 변조
  try {
    const res = await fetch(`${BASE_URL}/api/seed-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'prod_01',
        quantity: 2,
        seedOrderAmount: 800 // Normal: 90,000 -> 800 KRW
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.order && data.order.paymentAmount === 800) {
      console.log('[Bug 05 | SEC-325] 씨앗/모종 주문 금액 변조');
      console.log(`  - 정상 정가: 90,000원 | 변조 결제액: 800원`);
      console.log(`  - 검증 결과: ✅ 취약점 확인됨 (서버가 변조 금액 800원으로 승인)\n`);
      passedCount++;
    }
  } catch (e) { console.error('SEC-325 Fail:', e); }

  // 6. SEC-326: 장바구니 수량 변경 흐름 금액 변조
  try {
    const res = await fetch(`${BASE_URL}/api/cart/items/prod_04`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantity: 3,
        tamperedCartTotal: 500 // Normal: ~279,000 -> 500 KRW
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.order && data.order.paymentAmount === 500) {
      console.log('[Bug 06 | SEC-326] 장바구니 결제 금액 변조');
      console.log(`  - 정상 정가: 279,000원 | 변조 결제액: 500원`);
      console.log(`  - 검증 결과: ✅ 취약점 확인됨 (서버가 변조 금액 500원으로 승인)\n`);
      passedCount++;
    }
  } catch (e) { console.error('SEC-326 Fail:', e); }

  // 7. SEC-327: 농자재 배송비 계산 흐름 금액 변조
  try {
    const res = await fetch(`${BASE_URL}/api/shipping/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subtotal: 95000,
        clientShippingFee: 0 // Normal: 6,000 -> 0 KRW
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.shippingFee === 0 && data.totalAmount === 95000) {
      console.log('[Bug 07 | SEC-327] 농자재 배송비 계산 금액 변조');
      console.log(`  - 정상 배송비: 6,000원 | 변조 배송비: 0원 (총액: 95,000원)`);
      console.log(`  - 검증 결과: ✅ 취약점 확인됨 (서버가 배송비 0원 적용)\n`);
      passedCount++;
    }
  } catch (e) { console.error('SEC-327 Fail:', e); }

  // 8. SEC-328: 온실 장비 및 스마트 농업 장비 주문 흐름 금액 변조
  try {
    const res = await fetch(`${BASE_URL}/api/greenhouse-equipment/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipmentId: 'prod_09',
        quantity: 1,
        equipmentOrderAmount: 3000 // Normal: 240,000 -> 3,000 KRW
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.order && data.order.paymentAmount === 3000) {
      console.log('[Bug 08 | SEC-328] 온실 장비 주문 금액 변조');
      console.log(`  - 정상 정가: 240,000원 | 변조 결제액: 3,000원`);
      console.log(`  - 검증 결과: ✅ 취약점 확인됨 (서버가 변조 금액 3,000원으로 승인)\n`);
      passedCount++;
    }
  } catch (e) { console.error('SEC-328 Fail:', e); }

  // 9. SEC-329: 농자재 주문 할인 및 쿠폰 적용 흐름 금액 변조
  try {
    const res = await fetch(`${BASE_URL}/api/orders/discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        couponCode: 'FARM-SPECIAL-2026',
        subtotal: 165000,
        discountAmount: 160000 // Normal limit: 5,000 -> 160,000 KRW
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.discountAmount === 160000 && data.finalAmount === 5000) {
      console.log('[Bug 09 | SEC-329] 쿠폰 할인 금액 변조');
      console.log(`  - 정상 할인 한도: 5,000원 | 변조 할인액: 160,000원 (최종액: 5,000원)`);
      console.log(`  - 검증 결과: ✅ 취약점 확인됨 (서버가 과도한 할인액 차감 적용)\n`);
      passedCount++;
    }
  } catch (e) { console.error('SEC-329 Fail:', e); }

  // 10. SEC-330: 주문 결제 확인 단계 금액 변조
  try {
    const res = await fetch(`${BASE_URL}/api/payment/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: 'AGRI-CONFIRM-9930',
        authorizedAmount: 100 // Normal: 185,000 -> 100 KRW
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.order && data.order.paymentAmount === 100) {
      console.log('[Bug 10 | SEC-330] 주문 결제 확인 단계 금액 변조');
      console.log(`  - 정상 승인가: 185,000원 | 변조 승인액: 100원`);
      console.log(`  - 검증 결과: ✅ 취약점 확인됨 (서버가 변조 금액 100원으로 최종 승인)\n`);
      passedCount++;
    }
  } catch (e) { console.error('SEC-330 Fail:', e); }

  console.log('==================================================');
  console.log(`   총 10개 중 ${passedCount}개 취약점 검증 성공 (${passedCount * 10}% 통과)`);
  console.log('==================================================');
}

testVulnerabilities();
