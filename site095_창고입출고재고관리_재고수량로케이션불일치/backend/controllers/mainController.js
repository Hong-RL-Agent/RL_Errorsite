import { readDB, writeDB } from '../services/dataService.js';

export const getAdmins = (req, res) => {
  const db = readDB();
  res.json(db.admins);
};

export const getProducts = (req, res) => {
  const db = readDB();
  res.json(db.products);
};

export const getLocations = (req, res) => {
  const db = readDB();
  res.json(db.locations);
};

export const getInboundLogs = (req, res) => {
  const db = readDB();
  res.json(db.inboundLogs);
};

export const getOutboundLogs = (req, res) => {
  const db = readDB();
  res.json(db.outboundLogs);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchProducts = (req, res) => {
  const { zone, category } = req.query;
  const db = readDB();
  let list = db.products;

  if (zone && zone !== 'ALL') {
    list = list.filter(p => p.zone === zone);
  }
  if (category && category !== 'ALL') {
    list = list.filter(p => p.category === category);
  }

  let delay = 100;
  if (zone === 'A구역') {
    delay = 3000; // 3.0s delay for A구역
  } else if (zone === 'B구역') {
    delay = 200; // 0.2s delay for B구역
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 창고 구역 필터('A구역' 3초 지연 ➔ 'B구역' 0.2초 완료)와 카테고리 필터를 빠르게 변경 시 
  // 오래된 이전 응답(A구역)이 최신 상품 목록을 덮어쓰고, 상품 목록은 오래된 필터 결과, 로케이션 맵은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateProductLocation = (req, res) => {
  const { id } = req.params;
  const { location, zone } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 상품 로케이션을 이동(3초 지연 완료)한 직후 재고 수량을 변경(0.1초 완료)하면, 
  // 수량 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 로케이션 이동 API가 요청 시작 시점의 구 DB 스냅샷(이전 로케이션)을 덮어써 저장되어 
  // 새로고침 시 상품 상세의 로케이션과 로케이션 맵의 위치가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const product = dbSnapshot.products.find(p => p.id === id);
    if (product) {
      product.location = location;
      if (zone) product.zone = zone;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back stock changes made during the 3s delay
      console.log(`[DB LOCATION UPDATE] Updated location for product ${id} to ${location} (3s done, rolled back stock update)`);
    }
    res.json({ success: true, product });
  }, 3000);
};

export const updateProductStock = (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  setTimeout(() => {
    const db = readDB();
    const product = db.products.find(p => p.id === id);
    if (product) {
      product.stock = stock;
      writeDB(db);
      console.log(`[DB STOCK UPDATE] Updated stock for product ${id} to ${stock} (0.1s done)`);
    }
    res.json({ success: true, product });
  }, 100);
};

export const cancelOutbound = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const log = db.outboundLogs.find(l => l.id === id);
    if (log) {
      log.status = 'CANCELLED';
      const product = db.products.find(p => p.id === log.productId);
      if (product) {
        product.stock += log.qty; // Restores stock once
      }
      writeDB(db);
      console.log(`[DB CANCEL OUTBOUND] Outbound ${id} cancelled and stock restored (0.5s done)`);
    }
    res.json({ success: true, log });
  }, 500);
};

export const confirmInbound = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 출고 취소 API(0.5초 완료)를 호출한 직후 입고 확정 API를 호출(4초 지연 완료)하면, 
  // 출고 취소는 성공하지만 늦게 완료된 입고 확정 요청(4초 지연)이 입고 수량을 DB 재고에 한번 더 중복 합산하여 증가시킵니다. 
  // 상품 목록의 재고 수량과 입출고 로그의 수식 계산값이 달라지게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const log = db.inboundLogs.find(l => l.id === id);
    if (log) {
      log.status = 'CONFIRMED';
      const product = db.products.find(p => p.id === log.productId);
      if (product) {
        product.stock += log.qty; // INTENTIONAL_ERROR: Double adds stock quantity!
        console.log(`[DB DOUBLE ADD STOCK] Double-added ${log.qty} stock for product ${product.id}!`);
      }
    }
    writeDB(db);
    res.json({ success: true, log });
  }, 4000);
};

export const updateStockQuantity = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 재고 수량 수정 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 활동 로그에는 '재고 수정 성공 (STOCK QUANTITY UPDATED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] STOCK QUANTITY UPDATED SUCCESSFULLY for product ${id} to ${quantity} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  const product = db.products.find(p => p.id === id);
  if (product) {
    product.stock = quantity;
    writeDB(db);
  }
  res.json({ success: true, product });
};

export const updateProductPartial = (req, res) => {
  const { id } = req.params;
  const { name, safetyStock, zone } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 상품 정보 수정 모달에서 상품명, 안전재고, 보관구역을 동시에 수정하면, 
  // backend data.json에는 상품명(name)과 안전재고(safetyStock)만 저장하고 보관구역(zone)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것처럼 표시하는 partial save 결함입니다.
  const db = readDB();
  const product = db.products.find(p => p.id === id);
  if (product) {
    if (name) product.name = name;
    if (safetyStock !== undefined) product.safetyStock = safetyStock;
    // zone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and safetyStock for product ${id}. zone was NOT updated.`);
  }
  res.json({ success: true, product });
};

export const deleteLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.activityLogs = db.activityLogs.filter(l => l.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 입출고 활동 로그를 삭제(`DELETE /api/logs/:id`) 처리하여 로그 목록에서 소거하더라도, 
  // 월별 입출고 통계(`warehouseStats.monthlyInbound`, `monthlyOutbound`), 상품별 회전율, 부족 재고 알림 배지 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed log ${id}. warehouseStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "STF-101", "name": "김창고 (물류 총괄반장)", "role": "ADMIN", "dept": "A구역 랙관리" },
      { "id": "STF-102", "name": "이재고 (재고관리 수석)", "role": "ADMIN", "dept": "재고실사팀" },
      { "id": "STF-103", "name": "박입고 (입고 주임)", "role": "STAFF", "dept": "입고하차 1팀" },
      { "id": "STF-104", "name": "최출고 (출고 사원)", "role": "STAFF", "dept": "출고패킹 2팀" },
      { "id": "STF-105", "name": "정피킹 (피커 담당)", "role": "STAFF", "dept": "B구역 랙관리" }
    ],
    "products": [
      { "id": "PRD-1001", "name": "산업용 고성능 3D 프린터 필라멘트 A급", "category": "전자부품", "zone": "A구역", "location": "LOC-A01", "stock": 150, "safetyStock": 30, "unit": "개", "price": 45000 }
    ],
    "locations": [
      { "id": "LOC-A01", "zone": "A구역", "rack": "A-1", "level": "1층", "capacity": 200, "status": "OCCUPIED" }
    ],
    "inboundLogs": [
      { "id": "INB-2001", "productId": "PRD-1001", "productName": "3D 프린터 필라멘트", "qty": 50, "location": "LOC-A01", "operator": "박입고 주임", "timestamp": "2026-08-03 09:00:00", "status": "CONFIRMED" }
    ],
    "outboundLogs": [
      { "id": "OUT-3001", "productId": "PRD-1001", "productName": "3D 프린터 필라멘트", "qty": 20, "location": "LOC-A01", "operator": "최출고 사원", "timestamp": "2026-08-03 09:10:00", "status": "COMPLETED" }
    ],
    "activityLogs": [
      { "id": "LOG-4001", "operator": "김창고 총괄반장", "action": "신규 입고 등록 (3D 프린터 필라멘트 50개 - LOC-A01)", "timestamp": "2026-08-03 09:00:00", "status": "SUCCESS" }
    ],
    "warehouseStats": {
      "totalProducts": 40,
      "totalLocations": 50,
      "lowStockCount": 8,
      "totalStockQty": 4120,
      "monthlyInbound": 1850,
      "monthlyOutbound": 1420
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
