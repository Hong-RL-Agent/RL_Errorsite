import { readDB, writeDB } from '../services/dataService.js';

export const getChefs = (req, res) => {
  const db = readDB();
  res.json(db.chefs);
};

export const getTables = (req, res) => {
  const db = readDB();
  res.json(db.tables);
};

export const getMenus = (req, res) => {
  const db = readDB();
  res.json(db.menus);
};

export const getIngredients = (req, res) => {
  const db = readDB();
  res.json(db.ingredients);
};

export const getOrders = (req, res) => {
  const db = readDB();
  res.json(db.orders);
};

export const getStockLogs = (req, res) => {
  const db = readDB();
  res.json(db.stockLogs);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchOrders = (req, res) => {
  const { tableSection, status, search } = req.query;
  const db = readDB();
  let list = db.orders;

  if (tableSection && tableSection !== 'ALL') {
    list = list.filter(o => o.tableSection === tableSection);
  }
  if (status && status !== 'ALL') {
    list = list.filter(o => o.status === status);
  }
  if (search) {
    list = list.filter(o => o.menuName.includes(search) || o.id.includes(search) || o.tableNo.includes(search));
  }

  let delay = 100;
  if (tableSection === '1층 메인 홀') {
    delay = 3000; // 3.0s delay for 1층 메인 홀
  } else if (tableSection === '3층 루프탑') {
    delay = 200; // 0.2s delay for 3층 루프탑
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 테이블 구역 필터('1층 메인 홀' 3초 지연 ➔ '3층 루프탑' 0.2초 완료)와 주문 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(1층 메인 홀)이 최신 주문 목록을 덮어쓰고, 주문 목록은 오래된 필터 결과, 오른쪽 주방 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 주문 상태를 '조리중'(COOKING)으로 변경(3초 지연 완료)한 직후 조리 담당자를 변경(0.1초 완료)하면, 
  // 담당자 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 담당자)을 덮어써 저장되어 
  // 새로고침 시 주문 칸반보드의 담당자와 주문 상세의 담당자가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const order = dbSnapshot.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back chef assignment changes made during the 3s delay
      console.log(`[DB ORDER STATUS UPDATE] Updated status for order ${id} to ${status} (3s done, rolled back chef assignment update)`);
    }
    res.json({ success: true, order });
  }, 3000);
};

export const updateOrderChef = (req, res) => {
  const { id } = req.params;
  const { chefName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.chefName = chefName;
      writeDB(db);
      console.log(`[DB CHEF ASSIGN UPDATE] Updated order ${id} chefName to ${chefName} (0.1s done)`);
    }
    res.json({ success: true, order });
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

export const deductStock = (req, res) => {
  const { id } = req.params;
  const { ingredientName, deductQty } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 주문 취소 API(0.5초 완료)를 호출한 직후 재고 차감 API를 호출(4초 지연 완료)하면, 
  // 주문 취소는 성공하지만 늦게 완료된 재고 차감 요청(4초 지연)이 취소된 주문을 다시 'COOKED'(조리완료) 상태로 되돌려버립니다. 
  // 주문 목록에서는 취소됨, 재고 로그에서는 조리완료 주문으로 차감된 것처럼 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.status = 'COOKED'; // INTENTIONAL_ERROR: Overwrites CANCELLED status back to COOKED!
      console.log(`[DB RESTORE CANCELLED ORDER] Re-activated order ${id} back to COOKED status via stock deduction!`);
    }
    if (ingredientName) {
      db.stockLogs.push({
        id: `LOG-${Date.now()}`,
        orderId: id,
        ingredientName,
        deductQty: deductQty || 0.5,
        unit: 'kg',
        timestamp: new Date().toTimeString().split(' ')[0],
        operator: '김주방 (헤드 셰프)'
      });
    }
    writeDB(db);
    res.json({ success: true, order });
  }, 4000);
};

export const disposeStockUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'HEAD_CHEF')이 재고 폐기 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '재고 폐기 성공 (STOCK DISPOSAL COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'HEAD_CHEF') {
    console.log(`[SERVER AUDIT LOG] STOCK DISPOSAL COMPLETED SUCCESSFULLY for ingredient ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Head Chef permission required for ingredient disposal" });
  }

  const db = readDB();
  const ingredient = db.ingredients.find(i => i.id === id);
  if (ingredient) {
    ingredient.currentStock = 0;
    writeDB(db);
  }
  res.json({ success: true, ingredient });
};

export const updateMenuPartial = (req, res) => {
  const { id } = req.params;
  const { name, price, mainIngredient } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 메뉴 정보 수정 모달에서 메뉴명, 가격, 대표 재료를 동시에 수정하면, 
  // backend data.json에는 메뉴명(name)과 대표 재료(mainIngredient)만 저장하고 가격(price)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const menu = db.menus.find(m => m.id === id);
  if (menu) {
    if (name) menu.name = name;
    if (mainIngredient) menu.mainIngredient = mainIngredient;
    // price is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and mainIngredient for menu ${id}. price was NOT updated.`);
  }
  res.json({ success: true, menu });
};

export const deleteStockLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.stockLogs = db.stockLogs.filter(l => l.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 재고 차감 로그를 삭제(`DELETE /api/stock-logs/:id`) 처리하여 재고 로그 목록에서 소거하더라도, 
  // 메뉴별 판매량, 식재료 사용량, 일일 매출 통계(`opsStats.totalSalesAmount`) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE STOCK LOG] Removed stock log ${id}. opsStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "chefs": [
      { "id": "CHEF-3001", "name": "김주방 (헤드 셰프)", "role": "HEAD_CHEF", "station": "메인 스테이크 전담", "processedOrders": 138 }
    ],
    "tables": [
      { "id": "TBL-01", "name": "T-01 (창가 VIP)", "section": "1층 메인 홀", "capacity": 4 }
    ],
    "menus": [
      { "id": "MENU-01", "name": "블랙 앵거스 안심 스테이크", "price": 48000, "category": "스테이크", "mainIngredient": "호주산 안심 200g" }
    ],
    "ingredients": [
      { "id": "ING-2001", "name": "안심 소고기 (호주산)", "currentStock": 45, "unit": "kg", "safeStock": 15, "unitPrice": 42000 }
    ],
    "orders": [
      { "id": "ORD-1001", "tableNo": "T-01 (창가 VIP)", "tableSection": "1층 메인 홀", "menuName": "블랙 앵거스 안심 스테이크", "price": 48000, "status": "COOKING", "chefName": "김주방 (헤드 셰프)", "orderTime": "12:15:00", "notes": "미디움 웰던 요청" }
    ],
    "stockLogs": [
      { "id": "LOG-6001", "orderId": "ORD-1001", "ingredientName": "안심 소고기 (호주산)", "deductQty": 0.2, "unit": "kg", "timestamp": "12:15:05", "operator": "김주방 (헤드 셰프)" }
    ],
    "activityLogs": [
      { "id": "LOG-5001", "orderId": "ORD-1001", "operator": "임서빙 (홀 캡틴)", "action": "테이블 T-01 주문 접수 완료", "timestamp": "12:15:00", "status": "SUCCESS" }
    ],
    "opsStats": {
      "totalOrders": 45,
      "unprocessedOrders": 18,
      "cookedOrders": 22,
      "cancelledOrders": 3,
      "totalSalesAmount": 1285000,
      "avgCookingTimeMin": 14.2,
      "fulfillmentRate": 91.5
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
