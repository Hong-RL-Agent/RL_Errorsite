import { readDB, writeDB } from '../services/dataService.js';

export const getSellers = (req, res) => {
  const db = readDB();
  res.json(db.sellers);
};

export const getProducts = (req, res) => {
  const db = readDB();
  res.json(db.products);
};

export const getBuyers = (req, res) => {
  const db = readDB();
  res.json(db.buyers);
};

export const getOrders = (req, res) => {
  const db = readDB();
  res.json(db.orders);
};

export const getSettlements = (req, res) => {
  const db = readDB();
  res.json(db.settlements);
};

export const getDeliveryLogs = (req, res) => {
  const db = readDB();
  res.json(db.deliveryLogs);
};

export const searchOrders = (req, res) => {
  const { status, sellerId, search } = req.query;
  const db = readDB();
  let list = db.orders;

  if (status && status !== 'ALL') {
    list = list.filter(o => o.status === status);
  }
  if (sellerId && sellerId !== 'ALL') {
    list = list.filter(o => o.sellerId === sellerId);
  }
  if (search) {
    list = list.filter(o => o.productName.includes(search) || o.buyerName.includes(search) || o.id.includes(search));
  }

  let delay = 100;
  if (status === 'PAID') {
    delay = 3000; // 3.0s delay for PAID status
  } else if (status === 'PREPARING') {
    delay = 200; // 0.2s delay for PREPARING status
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 주문 상태 필터('결제완료' 3초 지연 ➔ '상품준비' 0.2초 완료)와 카테고리 필터를 빠르게 변경 시 
  // 오래된 이전 응답(결제완료)이 최신 주문 목록을 덮어쓰고, 주문 목록은 오래된 필터 결과, 오른쪽 정산 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 주문 배송 상태를 '배송중'(SHIPPING)으로 변경(3초 지연 완료)한 직후 정산 금액을 수정(0.1초 완료)하면, 
  // 정산 금액 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 배송 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 배송 상태)을 덮어써 저장되어 
  // 새로고침 시 주문 상세 상태와 정산 상세 상태가 서로 불일치하게 보이는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const order = dbSnapshot.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back settlement amount changes made during the 3s delay
      console.log(`[DB ORDER STATUS UPDATE] Updated status for order ${id} to ${status} (3s done, rolled back settlement amount update)`);
    }
    res.json({ success: true, order });
  }, 3000);
};

export const updateSettlementAmount = (req, res) => {
  const { id } = req.params;
  const { settlementAmount } = req.body;

  setTimeout(() => {
    const db = readDB();
    const settlement = db.settlements.find(s => s.id === id || s.orderId === id);
    if (settlement) {
      settlement.settlementAmount = settlementAmount;
      writeDB(db);
      console.log(`[DB SETTLEMENT AMOUNT UPDATE] Updated settlement ${settlement.id} amount to ${settlementAmount} (0.1s done)`);
    }
    res.json({ success: true, settlement });
  }, 100);
};

export const cancelOrder = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL ORDER] Order ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, order });
  }, 500);
};

export const registerTracking = (req, res) => {
  const { id } = req.params;
  const { trackingNo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 주문 취소 API(0.5초 완료)를 호출한 직후 송장 등록 API를 호출(4초 지연 완료)하면, 
  // 주문 취소는 성공하지만 늦게 완료된 송장 등록 요청(4초 지연)이 취소된 주문을 다시 'SHIPPING'(배송중) 상태로 바꿔버립니다. 
  // 주문 목록에서는 취소됨, 배송 로그에서는 배송중으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.trackingNo = trackingNo || `CJ-${Date.now().toString().slice(-8)}`;
      order.status = 'SHIPPING'; // INTENTIONAL_ERROR: Overwrites CANCELLED status back to SHIPPING!
      console.log(`[DB RESTORE CANCELLED ORDER] Re-activated order ${id} back to SHIPPING status with tracking ${order.trackingNo}!`);
    }
    writeDB(db);
    res.json({ success: true, order });
  }, 4000);
};

export const cancelOrderUnauthorized = (req, res) => {
  const { id } = req.params;
  const sellerHeader = req.headers['x-seller-id'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 판매자(sellerId 미일치)가 다른 판매자의 주문 취소 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 활동 로그에는 '주문 취소 성공 (ORDER CANCELLED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  const db = readDB();
  const order = db.orders.find(o => o.id === id);
  
  if (order && sellerHeader !== order.sellerId) {
    console.log(`[SERVER AUDIT LOG] ORDER CANCELLED SUCCESSFULLY for order ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: You are not the owner seller of this order" });
  }

  if (order) {
    order.status = 'CANCELLED';
    writeDB(db);
  }
  res.json({ success: true, order });
};

export const updateProductPartial = (req, res) => {
  const { id } = req.params;
  const { name, price, shippingFee } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 상품 정보 수정 모달에서 상품명, 판매가, 배송비를 동시에 수정하면, 
  // backend data.json에는 상품명(name)과 배송비(shippingFee)만 저장하고 판매가(price)는 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것처럼 표시하는 partial save 결함입니다.
  const db = readDB();
  const product = db.products.find(p => p.id === id);
  if (product) {
    if (name) product.name = name;
    if (shippingFee !== undefined) product.shippingFee = shippingFee;
    // price is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and shippingFee for product ${id}. price was NOT updated.`);
  }
  res.json({ success: true, product });
};

export const deleteSettlement = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.settlements = db.settlements.filter(s => s.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 정산 데이터를 삭제(`DELETE /api/settlements/:id`) 처리하여 정산 목록에서 소거하더라도, 
  // 월별 정산 예정 금액(`sellerStats.expectedSettlement`), 상품별 매출, 판매자 대시보드 통계 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE SETTLEMENT] Removed settlement ${id}. sellerStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "sellers": [
      { "id": "SLR-101", "name": "스마트디지털 스토어 (판매자 A)", "role": "ADMIN", "storeName": "디지털테크몰", "grade": "파워스토어" },
      { "id": "SLR-102", "name": "홈리빙 갤러리 (판매자 B)", "role": "ADMIN", "storeName": "리빙라이프몰", "grade": "빅파워스토어" },
      { "id": "SLR-103", "name": "트렌디 패션 (판매자 C)", "role": "STAFF", "storeName": "스타일룩스몰", "grade": "일반스토어" },
      { "id": "SLR-104", "name": "프리미엄 뷰티 (판매자 D)", "role": "STAFF", "storeName": "뷰티플러스몰", "grade": "파워스토어" },
      { "id": "SLR-105", "name": "글로벌 푸드마트 (판매자 E)", "role": "STAFF", "storeName": "푸드프레시몰", "grade": "일반스토어" }
    ],
    "products": [
      { "id": "PRD-2001", "name": "울트라 슬림 4K 모니터 27인치", "category": "디지털/가전", "price": 320000, "shippingFee": 3000, "sellerId": "SLR-101" }
    ],
    "buyers": [
      { "id": "BUY-3001", "name": "김동남", "phone": "010-1111-2222", "address": "서울특별시 강남구 테헤란로 123" }
    ],
    "orders": [
      { "id": "ORD-1001", "sellerId": "SLR-101", "productId": "PRD-2001", "productName": "4K 모니터 27인치", "buyerName": "김동남", "totalAmount": 323000, "status": "SHIPPING", "orderedAt": "2026-08-03 09:00:00", "trackingNo": "CJ-65489201" }
    ],
    "settlements": [
      { "id": "SET-4001", "orderId": "ORD-1001", "sellerId": "SLR-101", "orderAmount": 323000, "feeRate": 5, "settlementAmount": 306850, "status": "EXPECTED", "scheduledDate": "2026-08-15" }
    ],
    "deliveryLogs": [
      { "id": "DLV-5001", "orderId": "ORD-1001", "operator": "스마트디지털 스토어", "action": "송장 등록 및 집화 처리 [CJ-65489201]", "timestamp": "2026-08-03 09:00:00", "status": "SUCCESS" }
    ],
    "sellerStats": {
      "totalOrders": 45,
      "totalProducts": 35,
      "totalSales": 2450000,
      "expectedSettlement": 2327500,
      "completedSettlement": 1850000
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
