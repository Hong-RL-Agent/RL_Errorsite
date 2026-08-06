import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getBarns = (req, res) => res.json(readDB().barns);
export const getFeeds = (req, res) => res.json(readDB().feeds);
export const getLivestocks = (req, res) => res.json(readDB().livestocks);
export const getShipments = (req, res) => res.json(readDB().shipments);
export const getFeedLogs = (req, res) => res.json(readDB().feedLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchLivestocks = (req, res) => {
  const { barnId, healthStatus, search } = req.query;
  const db = readDB();
  let list = db.livestocks;
  if (barnId && barnId !== 'ALL') list = list.filter(l => l.barnId === barnId);
  if (healthStatus && healthStatus !== 'ALL') list = list.filter(l => l.healthStatus === healthStatus);
  if (search) list = list.filter(l => l.earTagNo.includes(search) || l.breed.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 축사 필터('BARN-01' 3초 지연 ➔ 'BARN-02' 0.2초 완료)와 건강 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(BARN-01)이 최신 개체 목록을 덮어쓰고, 개체 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (barnId === 'BARN-01') delay = 3000;
  else if (barnId === 'BARN-02') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateLivestockFeed = (req, res) => {
  const { id } = req.params;
  const { feedStockKg } = req.body;
  setTimeout(() => {
    const db = readDB();
    const liv = db.livestocks.find(l => l.id === id);
    if (liv) {
      liv.feedStockKg = Number(feedStockKg);
      writeDB(db);
      console.log(`[DB FEED UPDATE] Livestock ${id} feedStockKg set to ${feedStockKg}kg (0.1s done)`);
    }
    res.json({ success: true, liv });
  }, 100);
};

export const updateLivestockStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 출하 상태를 출하확정(SHIPMENT_CONFIRMED - 3초 지연 완료)으로 변경한 직후 사료 재고를 차감(0.1초 완료)하면,
  // 사료 재고 차감 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 출하 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 사료 재고)을 덮어써 저장하여 새로고침 시
  // 개체 목록의 사료 재고와 상세 패널의 사료 재고가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const liv = dbSnapshot.livestocks.find(l => l.id === id);
    if (liv) {
      liv.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back feedStockKg update!
      console.log(`[DB STATUS UPDATE] Livestock ${id} status set to ${status} (3s done, rolled back feedStockKg update)`);
    }
    res.json({ success: true, liv });
  }, 3000);
};

export const cancelShipment = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const liv = db.livestocks.find(l => l.id === id);
    if (liv) {
      liv.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SHIPMENT] Livestock ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, liv });
  }, 500);
};

export const addHealthRecord = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 출하 취소 API(0.5초 완료)를 호출한 직후 건강 기록 등록 API를 호출(4초 지연 완료)하면,
  // 출하 취소는 성공하지만 늦게 완료된 건강 기록 등록 요청(4초 지연)이 취소된 출하를 다시 'SHIPMENT_PENDING'(출하대기) 상태로 바꿔버립니다.
  // 개체/출하 목록에서는 취소됨(CANCELLED), 건강 관제에서는 출하대기(SHIPMENT_PENDING)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const liv = db.livestocks.find(l => l.id === id);
    if (liv) {
      liv.status = 'SHIPMENT_PENDING'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to SHIPMENT_PENDING!
      liv.healthStatus = 'HEALTHY';
      console.log(`[DB RESTORE STATUS] Re-activated livestock ${id} back to SHIPMENT_PENDING status via health record!`);
    }
    writeDB(db);
    res.json({ success: true, liv });
  }, 4000);
};

export const confirmShipmentUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 출하 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '출하 확정 성공 (SHIPMENT CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] SHIPMENT CONFIRMED SUCCESSFULLY for livestock ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Livestock manager role required to confirm shipment" });
  }
  const db = readDB();
  const liv = db.livestocks.find(l => l.id === id);
  if (liv) { liv.status = 'SHIPMENT_CONFIRMED'; writeDB(db); }
  res.json({ success: true, liv });
};

export const updateLivestockPartial = (req, res) => {
  const { id } = req.params;
  const { weightKg, healthStatus, barnId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 개체 정보 수정 모달에서 체중, 건강상태, 축사위치를 동시에 수정하면,
  // backend data.json에는 체중(weightKg)과 축사위치(barnId)만 저장하고 건강상태(healthStatus)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const liv = db.livestocks.find(l => l.id === id);
  if (liv) {
    if (weightKg) liv.weightKg = Number(weightKg);
    if (barnId) liv.barnId = barnId;
    // healthStatus is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated weightKg and barnId for livestock ${id}. healthStatus was NOT updated.`);
  }
  res.json({ success: true, liv });
};

export const deleteFeedLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.feedLogs = db.feedLogs.filter(f => f.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 급여 로그를 삭제(`DELETE /api/feed-logs/:id`) 처리하여 급여 로그 목록에서 소거하더라도,
  // farmStats(사료 사용량, 개체별 성장률, 축사별 평균 체중 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed feed log ${id}. farmStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-9001", name: "김축산 (스마트축산 총괄소장)", role: "MANAGER", dept: "스마트 농장 관리본부", handledHerds: 180 }],
    barns: [{ id: "BARN-01", name: "제1한우 비육 축사 A동", capacity: 30, currentHead: 25, type: "한우비육", managerName: "김축산" }],
    feeds: [{ id: "FED-3001", name: "프리미엄 한우 비육 후기 TMR 사료", feedType: "TMR혼합사료", stockKg: 4500, dailyUsageKg: 300, supplier: "농협사료" }],
    livestocks: [{ id: "LIV-1001", earTagNo: "410-002-123456", breed: "한우(암)", barnId: "BARN-01", barnName: "제1축사 A동", ageMonths: 28, weightKg: 720.5, healthStatus: "HEALTHY", feedStockKg: 4500, status: "SHIPMENT_PENDING" }],
    shipments: [{ id: "SHP-5001", livestockId: "LIV-1001", earTagNo: "410-002-123456", barnName: "제1축사 A동", targetPriceWon: 9500000, scheduledDate: "2026-08-10", slaughterhouse: "음성축산물공판장", status: "SHIPMENT_PENDING" }],
    feedLogs: [{ id: "FLOG-4001", livestockId: "LIV-1001", feedId: "FED-3001", feedName: "한우 비육 후기 TMR", fedAmountKg: 15.0, timestamp: "2026-08-04 07:00:00" }],
    activityLogs: [{ id: "ACT-9801", livestockId: "LIV-1001", operator: "김축산 (총괄소장)", action: "개체 410-002-123456 음성공판장 출하승인 완료 (목표가 950만원)", timestamp: "2026-08-04 16:00:00", status: "SUCCESS" }],
    farmStats: { totalLivestocks: 80, totalBarns: 12, raisingCount: 45, shipmentPendingCount: 20, shippedCount: 15, totalFeedStockKg: 13500, avgWeightKg: 680.5, topBarn: "제1한우 A동" }
  };
  writeDB(initial);
  res.json({ success: true });
};
