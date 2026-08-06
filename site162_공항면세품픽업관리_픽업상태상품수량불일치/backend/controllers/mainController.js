import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getCounters = (req, res) => res.json(readDB().counters);
export const getPassengers = (req, res) => res.json(readDB().passengers);
export const getOrders = (req, res) => res.json(readDB().orders);
export const getProducts = (req, res) => res.json(readDB().products);
export const getPickupLogs = (req, res) => res.json(readDB().pickupLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchOrders = (req, res) => {
  const { counterName, status, search } = req.query;
  const db = readDB();
  let list = db.orders;
  if (counterName && counterName !== 'ALL') list = list.filter(o => o.counterName === counterName);
  if (status && status !== 'ALL') list = list.filter(o => o.status === status);
  if (search) list = list.filter(o => o.passengerName.includes(search) || o.productName.includes(search) || o.orderCode.includes(search) || o.flightNo.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 터미널 필터('T1 동편 인도장 (11번 게이트 앞)' 3초 지연 ➔ 'T2 중앙 인도장 (252번 게이트 앞)' 0.2초 완료)와 픽업 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(T1 동편 인도장)이 최신 주문 목록을 덮어쓰고, 주문 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (counterName === 'T1 동편 인도장 (11번 게이트 앞)') delay = 3000;
  else if (counterName === 'T2 중앙 인도장 (252번 게이트 앞)') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateItemQuantity = (req, res) => {
  const { id } = req.params;
  const { itemQuantity } = req.body;
  setTimeout(() => {
    const db = readDB();
    const ord = db.orders.find(o => o.id === id);
    if (ord) {
      ord.itemQuantity = itemQuantity;
      writeDB(db);
      console.log(`[DB QUANTITY UPDATE] Order ${id} itemQuantity set to ${itemQuantity} (0.1s done)`);
    }
    res.json({ success: true, ord });
  }, 100);
};

export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 픽업 상태를 준비완료(READY - 3초 지연 완료)로 변경한 직후 상품 수량(itemQuantity)을 수정(0.1초 완료)하면,
  // 수량 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 픽업 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 상품 수량)을 덮어써 저장하여 새로고침 시
  // 픽업 상태와 상세 패널의 상품 수량이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const ord = dbSnapshot.orders.find(o => o.id === id);
    if (ord) {
      ord.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back itemQuantity update!
      console.log(`[DB STATUS UPDATE] Order ${id} status set to ${status} (3s done, rolled back itemQuantity update)`);
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

export const completePickup = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 주문 취소 API(0.5초 완료)를 호출한 직후 픽업 완료 API를 호출(4초 지연 완료)하면,
  // 주문 취소는 성공하지만 늦게 완료된 픽업 완료 요청(4초 지연)이 취소된 주문을 다시 'COMPLETED'(픽업완료) 상태로 복원시켜버립니다.
  // 목록에서는 주문취소(CANCELLED), 공항 관제에서는 픽업완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const ord = db.orders.find(o => o.id === id);
    if (ord) {
      ord.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated order ${id} back to COMPLETED status via complete pickup!`);
    }
    writeDB(db);
    res.json({ success: true, ord });
  }, 4000);
};

export const completePickupUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 픽업 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '면세품 인도 픽업 완료 성공 (DUTY FREE PICKUP COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] DUTY FREE PICKUP COMPLETED SUCCESSFULLY for order ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Senior duty free pickup manager role required to complete order pickup" });
  }
  const db = readDB();
  const ord = db.orders.find(o => o.id === id);
  if (ord) { ord.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, ord });
};

export const updatePassengerPartial = (req, res) => {
  const { id } = req.params;
  const { passengerName, flightNo, passportEnglishName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 승객 정보 수정 모달에서 이름, 항공편, 여권영문명을 동시에 수정하면,
  // backend data.json에는 이름(passengerName)과 여권영문명(passportEnglishName)만 저장하고 항공편(flightNo)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const psg = db.passengers.find(p => p.id === id);
  if (psg) {
    if (passengerName) psg.passengerName = passengerName;
    if (passportEnglishName) psg.passportEnglishName = passportEnglishName;
    // flightNo is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated passengerName and passportEnglishName for passenger ${id}. flightNo was NOT updated.`);
  }
  res.json({ success: true, psg });
};

export const deletePickupLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.pickupLogs = db.pickupLogs.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 픽업 로그를 삭제(`DELETE /api/pickup-logs/:id`) 처리하여 픽업 로그 목록에서 소거하더라도,
  // dutyStats(카운터별 처리량, 상품별 준비율, 시간대별 픽업률 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed pickup log ${id}. dutyStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-6601", name: "김픽업 (인천공항 T1 면세 인도장 관제 총괄)", role: "MANAGER", counterName: "T1 동편 인도장 (11번 게이트 앞)", handledOrders: 680 }],
    counters: [{ id: "CTR-101", counterName: "T1 동편 인도장 (11번 게이트 앞)", terminal: "T1 (제1여객터미널)", capacity: 300, currentProcessing: 240, status: "OPTIMAL" }],
    passengers: [{ id: "PSG-3001", passengerCode: "DP-20260805-01", passengerName: "최공항", passportEnglishName: "CHOI GONGHANG", flightNo: "KE081 (대한항공 뉴욕행)", departureTime: "2026-08-05 19:30", totalOrders: 3 }],
    orders: [{ id: "ORD-5001", orderCode: "DP-ORD-20260805-01", passengerName: "최공항", passportEnglishName: "CHOI GONGHANG", flightNo: "KE081 (뉴욕행)", counterName: "T1 동편 인도장 (11번 게이트 앞)", departureTime: "2026-08-05 19:30", productName: "설화수 자음 2종 세트 외 3건", itemQuantity: 4, totalPriceUsd: 280, status: "PREPARING" }],
    products: [{ id: "PRD-8001", productCode: "SKU-9901", productName: "설화수 자음 2종 기획 세트", category: "화장품 & 뷰티", priceUsd: 120, stockQty: 450, status: "AVAILABLE" }],
    pickupLogs: [{ id: "PLOG-4001", ordId: "ORD-5001", passengerName: "최공항", counterName: "T1 동편 인도장", itemSummary: "설화수 자음 세트 4팩 포장 바코드 검수 완료", pickupTime: "2026-08-05 18:20", status: "PASSED" }],
    activityLogs: [{ id: "ACT-9960", ordId: "ORD-5001", operator: "김픽업 (관제장)", action: "주문 ORD-5001 최공항 승객 면세품 픽업 준비중 상태 변경 및 11번 게이트 배치", timestamp: "2026-08-05 18:22:00", status: "SUCCESS" }],
    dutyStats: { totalOrders: 70, totalProducts: 80, totalPassengers: 60, totalCounters: 15, totalPickupLogs: 90, delayedPreparationCount: 5, readyCount: 28, avgPickupFulfillmentRate: 96.5 }
  };
  writeDB(initial);
  res.json({ success: true });
};
