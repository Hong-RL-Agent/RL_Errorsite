import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getArtisans = (req, res) => res.json(readDB().artisans);
export const getCustomers = (req, res) => res.json(readDB().customers);
export const getOptions = (req, res) => res.json(readDB().options);
export const getOrders = (req, res) => res.json(readDB().orders);
export const getCraftLogs = (req, res) => res.json(readDB().craftLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchOrders = (req, res) => {
  const { optionType, status, search } = req.query;
  const db = readDB();
  let list = db.orders;
  if (optionType && optionType !== 'ALL') list = list.filter(o => o.optionType === optionType);
  if (status && status !== 'ALL') list = list.filter(o => o.status === status);
  if (search) list = list.filter(o => o.customerName.includes(search) || o.productName.includes(search) || o.orderCode.includes(search) || o.optionColor.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 옵션 유형 필터('천연 가극 각인 커스텀 지갑' 3초 지연 ➔ '원목 커스텀 테이블 세트' 0.2초 완료)와 제작 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(천연 가극 각인)이 최신 주문 목록을 덮어쓰고, 주문 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (optionType === '천연 가극 각인 커스텀 지갑') delay = 3000;
  else if (optionType === '원목 커스텀 테이블 세트') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateOrderOptionColor = (req, res) => {
  const { id } = req.params;
  const { optionColor } = req.body;
  setTimeout(() => {
    const db = readDB();
    const ord = db.orders.find(o => o.id === id);
    if (ord) {
      ord.optionColor = optionColor;
      writeDB(db);
      console.log(`[DB OPTION COLOR UPDATE] Order ${id} optionColor set to ${optionColor} (0.1s done)`);
    }
    res.json({ success: true, ord });
  }, 100);
};

export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 제작 상태를 제작중(IN_PRODUCTION - 3초 지연 완료)으로 변경한 직후 옵션 정보(옵션색상)를 수정(0.1초 완료)하면,
  // 옵션 정보 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 제작 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 옵션 색상)을 덮어써 저장하여 새로고침 시
  // 제작 상태와 상세 패널의 옵션 정보가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const ord = dbSnapshot.orders.find(o => o.id === id);
    if (ord) {
      ord.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back optionColor update!
      console.log(`[DB STATUS UPDATE] Order ${id} status set to ${status} (3s done, rolled back optionColor update)`);
    }
    res.json({ success: true, ord });
  }, 3000);
};

export const cancelOrder = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const ord = db.orders.find(o => o.id === id);
    if (ord) {
      ord.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL ORDER] Order ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, ord });
  }, 500);
};

export const shipOrder = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 주문 취소 API(0.5초 완료)를 호출한 직후 발송 완료 API를 호출(4초 지연 완료)하면,
  // 주문 취소는 성공하지만 늦게 완료된 발송 완료 요청(4초 지연)이 취소된 주문을 다시 'SHIPPED'(발송완료) 상태로 복원시켜버립니다.
  // 목록에서는 주문취소(CANCELLED), 공방 관제에서는 발송완료(SHIPPED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const ord = db.orders.find(o => o.id === id);
    if (ord) {
      ord.status = 'SHIPPED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to SHIPPED!
      console.log(`[DB RESTORE STATUS] Re-activated order ${id} back to SHIPPED status via order shipping!`);
    }
    writeDB(db);
    res.json({ success: true, ord });
  }, 4000);
};

export const shipOrderUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 발송 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '공방 주문 상품 발송 완료 성공 (CRAFT ORDER SHIPPED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] CRAFT ORDER SHIPPED SUCCESSFULLY for order ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief artisan manager role required to ship craft order" });
  }
  const db = readDB();
  const ord = db.orders.find(o => o.id === id);
  if (ord) { ord.status = 'SHIPPED'; writeDB(db); }
  res.json({ success: true, ord });
};

export const updateCustomerPartial = (req, res) => {
  const { id } = req.params;
  const { customerName, phone, deliveryNote, optionColor } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 주문 정보 수정 모달에서 고객명, 옵션색상, 배송메모를 동시에 수정하면,
  // backend data.json에는 고객명(customerName)과 배송메모(deliveryNote)만 저장하고 옵션색상(optionColor)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const cst = db.customers.find(c => c.id === id);
  if (cst) {
    if (customerName) cst.customerName = customerName;
    if (deliveryNote) cst.deliveryNote = deliveryNote;
    // optionColor is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated customerName and deliveryNote for customer ${id}. optionColor was NOT updated.`);
  }
  res.json({ success: true, cst });
};

export const deleteCraftLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.craftLogs = db.craftLogs.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 제작 로그를 삭제(`DELETE /api/craft-logs/:id`) 처리하여 제작 로그 목록에서 소거하더라도,
  // craftStats(제작자별 처리량, 옵션별 주문 수, 월별 발송 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed craft log ${id}. craftStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-6001", name: "김공방 (수제 핸드메이드 총괄 아티잔)", role: "MANAGER", optionType: "천연 가극 각인 커스텀 지갑", handledOrders: 420 }],
    artisans: [{ id: "ART-01", artisanName: "김공방 아티잔", phone: "010-9999-4444", specialty: "천연 가죽 각인 & 염색 공예", assignedOrders: 14, rating: 4.9 }],
    options: [{ id: "OPT-01", optionName: "이탈리아 풀그레인 천연 가죽 지갑", optionType: "천연 가극 각인 커스텀 지갑", optionColor: "딥 탄 브라운 (Deep Tan)", extraCostWon: 25000, status: "AVAILABLE" }],
    customers: [{ id: "CST-9001", customerName: "최공방", phone: "010-6666-1111", optionColor: "딥 탄 브라운 (Deep Tan)", deliveryNote: "부재시 문 앞 택배함 보관 부탁드립니다.", totalOrders: 7, rating: 4.9 }],
    orders: [{ id: "ORD-8001", orderCode: "CO-20260805-01", optionType: "천연 가극 각인 커스텀 지갑", productName: "이탈리아 풀그레인 천연 가죽 지갑", customerName: "최공방", optionColor: "딥 탄 브라운 (Deep Tan)", artisanName: "김공방 아티잔", dueDate: "2026-08-10", orderPriceWon: 125000, deliveryNote: "부재시 문 앞 택배함 보관 부탁드립니다.", status: "IN_PRODUCTION" }],
    craftLogs: [{ id: "CLOG-7001", ordId: "ORD-8001", productName: "천연 가죽 지갑", artisanName: "김공방 아티잔", craftStep: "가죽 재단 완료 및 이니셜 불박 각인 1차 완료", craftTime: "2026-08-05 13:00", status: "IN_PROGRESS" }],
    activityLogs: [{ id: "ACT-9951", ordId: "ORD-8001", operator: "김공방 (총괄)", action: "주문 ORD-8001 최공방 님 천연 가죽 지갑 제작중 상태 전환 및 아티잔 배정 완료", timestamp: "2026-08-05 13:05:00", status: "SUCCESS" }],
    craftStats: { totalOrders: 60, totalCustomers: 45, totalOptions: 40, totalArtisans: 15, delayedProductionCount: 9, inProductionCount: 24, shippedCount: 21, avgCraftDays: 4.5 }
  };
  writeDB(initial);
  res.json({ success: true });
};
