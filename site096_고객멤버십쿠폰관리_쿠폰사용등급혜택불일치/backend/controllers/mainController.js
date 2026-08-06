import { readDB, writeDB } from '../services/dataService.js';

export const getAdmins = (req, res) => {
  const db = readDB();
  res.json(db.admins);
};

export const getTiers = (req, res) => {
  const db = readDB();
  res.json(db.tiers);
};

export const getCustomers = (req, res) => {
  const db = readDB();
  res.json(db.customers);
};

export const getCoupons = (req, res) => {
  const db = readDB();
  res.json(db.coupons);
};

export const getPoints = (req, res) => {
  const db = readDB();
  res.json(db.points);
};

export const getPurchases = (req, res) => {
  const db = readDB();
  res.json(db.purchases);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchCustomers = (req, res) => {
  const { tier, search } = req.query;
  const db = readDB();
  let list = db.customers;

  if (tier && tier !== 'ALL') {
    list = list.filter(c => c.tier === tier);
  }
  if (search) {
    list = list.filter(c => c.name.includes(search) || c.id.includes(search));
  }

  let delay = 100;
  if (tier === 'VVIP') {
    delay = 3000; // 3.0s delay for VVIP
  } else if (tier === 'GOLD') {
    delay = 200; // 0.2s delay for GOLD
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 등급 필터('VVIP' 3초 지연 ➔ 'GOLD' 0.2초 완료)와 쿠폰 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(VVIP)이 최신 고객 목록을 덮어쓰고, 고객 목록은 오래된 필터 결과, 오른쪽 혜택 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateCustomerTier = (req, res) => {
  const { id } = req.params;
  const { tier } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 고객 등급을 변경(3초 지연 완료)한 직후 쿠폰을 발급(0.1초 완료)하면, 
  // 쿠폰 발급 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 등급 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 등급)을 덮어써 저장되어 
  // 새로고침 시 쿠폰 혜택률은 이전 등급 기준이고, 고객 카드 등급은 새 등급처럼 불일치하게 보이는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const customer = dbSnapshot.customers.find(c => c.id === id);
    if (customer) {
      customer.tier = tier;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back coupon issuance made during the 3s delay
      console.log(`[DB TIER UPDATE] Updated tier for customer ${id} to ${tier} (3s done, rolled back coupon issuance)`);
    }
    res.json({ success: true, customer });
  }, 3000);
};

export const issueCoupon = (req, res) => {
  const { id } = req.params;
  const { couponName, discountRate, minTier } = req.body;

  setTimeout(() => {
    const db = readDB();
    const customer = db.customers.find(c => c.id === id);
    if (customer) {
      const newCoupon = {
        id: `CPN-${Date.now().toString().slice(-4)}`,
        name: couponName || `${customer.tier} 전용 ${discountRate || 10}% 발급 쿠폰`,
        discountRate: discountRate || 10,
        minTier: minTier || customer.tier,
        customerId: customer.id,
        customerName: customer.name,
        status: 'UNUSED',
        issuedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
      if (!db.coupons) db.coupons = [];
      db.coupons.unshift(newCoupon);
      writeDB(db);
      console.log(`[DB COUPON ISSUE] Issued coupon ${newCoupon.id} to customer ${id} (0.1s done)`);
      return res.json({ success: true, coupon: newCoupon });
    }
    res.status(404).json({ error: "Customer not found" });
  }, 100);
};

export const cancelCouponUsage = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const coupon = db.coupons.find(c => c.id === id);
    if (coupon) {
      coupon.status = 'UNUSED';
      writeDB(db);
      console.log(`[DB CANCEL COUPON USAGE] Coupon ${id} status set to UNUSED (0.5s done)`);
    }
    res.json({ success: true, coupon });
  }, 500);
};

export const earnPoints = (req, res) => {
  const { id } = req.params;
  const { pointsAmount, couponId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 쿠폰 사용 취소 API(0.5초 완료)를 호출한 직후 포인트 적립 API를 호출(4초 지연 완료)하면, 
  // 쿠폰 사용 취소는 성공하지만 늦게 완료된 포인트 적립 요청(4초 지연)이 취소된 쿠폰을 다시 'USED'(사용완료) 상태로 바꿔버립니다. 
  // 고객 쿠폰 목록에서는 사용취소, 포인트 내역에서는 사용완료 쿠폰 혜택 적립으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const customer = db.customers.find(c => c.id === id);
    if (customer) {
      customer.points += (pointsAmount || 5000);
      if (couponId) {
        const coupon = db.coupons.find(c => c.id === couponId);
        if (coupon) {
          coupon.status = 'USED'; // Re-activates coupon status back to USED!
          console.log(`[DB RE-ACTIVATE COUPON STATUS] Re-activated coupon ${couponId} back to USED status!`);
        }
      }
    }
    writeDB(db);
    res.json({ success: true, customer });
  }, 4000);
};

export const downgradeTier = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 등급 강등 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 활동 로그에는 '등급 강등 성공 (CUSTOMER TIER DOWNGRADED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] CUSTOMER TIER DOWNGRADED SUCCESSFULLY for customer ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  const customer = db.customers.find(c => c.id === id);
  if (customer) {
    customer.tier = 'BRONZE';
    writeDB(db);
  }
  res.json({ success: true, customer });
};

export const updateCustomerPartial = (req, res) => {
  const { id } = req.params;
  const { phone, preferredStore, marketingConsent } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 고객 정보 수정 모달에서 연락처, 선호 매장, 마케팅 수신 여부를 동시에 수정하면, 
  // backend data.json에는 연락처(phone)와 마케팅 수신 여부(marketingConsent)만 저장하고 선호 매장(preferredStore)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것처럼 표시하는 partial save 결함입니다.
  const db = readDB();
  const customer = db.customers.find(c => c.id === id);
  if (customer) {
    if (phone) customer.phone = phone;
    if (marketingConsent !== undefined) customer.marketingConsent = marketingConsent;
    // preferredStore is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated phone and marketingConsent for customer ${id}. preferredStore was NOT updated.`);
  }
  res.json({ success: true, customer });
};

export const deleteCouponUsage = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.coupons = db.coupons.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 쿠폰 사용 내역을 삭제(`DELETE /api/coupons/:id/usage`) 처리하여 쿠폰 목록에서 소거하더라도, 
  // 쿠폰별 사용률(`membershipStats.couponUsageRate`), 등급별 혜택 금액, 월별 프로모션 통계 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE COUPON] Removed coupon ${id}. membershipStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "ADM-101", "name": "김멤버십 (CRM 총괄팀장)", "role": "ADMIN", "dept": "고객 로열티 관리팀" },
      { "id": "ADM-102", "name": "이쿠폰 (프로모션 과장)", "role": "ADMIN", "dept": "마케팅 프로모션팀" },
      { "id": "ADM-103", "name": "박CRM (고객지원 사원)", "role": "STAFF", "dept": "고객센터 운영팀" }
    ],
    "tiers": [
      { "id": "TIR-01", "name": "BRONZE", "discountRate": 3, "pointRate": 1, "minSpend": 0 },
      { "id": "TIR-02", "name": "SILVER", "discountRate": 5, "pointRate": 2, "minSpend": 500000 },
      { "id": "TIR-03", "name": "GOLD", "discountRate": 10, "pointRate": 3, "minSpend": 1500000 },
      { "id": "TIR-04", "name": "VIP", "discountRate": 15, "pointRate": 5, "minSpend": 3000000 },
      { "id": "TIR-05", "name": "VVIP", "discountRate": 20, "pointRate": 7, "minSpend": 5000000 }
    ],
    "customers": [
      { "id": "CST-1001", "name": "김동남", "tier": "VVIP", "phone": "010-1111-2222", "email": "kim@memberplus.com", "totalSpend": 7850000, "points": 45000, "preferredStore": "강남 플래그십점", "marketingConsent": true }
    ],
    "coupons": [
      { "id": "CPN-2001", "name": "VVIP 전용 20% 할인 쿠폰", "discountRate": 20, "minTier": "VVIP", "customerId": "CST-1001", "customerName": "김동남", "status": "UNUSED", "issuedAt": "2026-08-03 09:00:00" }
    ],
    "points": [
      { "id": "PNT-3001", "customerId": "CST-1001", "customerName": "김동남", "amount": 12000, "type": "EARN", "reason": "VVIP 결제 7% 적립", "timestamp": "2026-08-03 09:10:00" }
    ],
    "purchases": [
      { "id": "PUR-4001", "customerId": "CST-1001", "customerName": "김동남", "amount": 171428, "store": "강남 플래그십점", "purchasedAt": "2026-08-03 09:10:00" }
    ],
    "activityLogs": [
      { "id": "LOG-5001", "operator": "김멤버십 CRM팀장", "action": "VVIP 등급 쿠폰 자동 발급 (김동남 고객)", "timestamp": "2026-08-03 09:00:00", "status": "SUCCESS" }
    ],
    "membershipStats": {
      "totalCustomers": 35,
      "totalCouponsIssued": 40,
      "totalPointsGranted": 580000,
      "couponUsageRate": 42.5,
      "tierBenefitsGranted": 18500000
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
