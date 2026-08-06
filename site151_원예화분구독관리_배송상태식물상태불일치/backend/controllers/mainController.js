import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getPlants = (req, res) => res.json(readDB().plants);
export const getSubscribers = (req, res) => res.json(readDB().subscribers);
export const getDeliveries = (req, res) => res.json(readDB().deliveries);
export const getHealthLogs = (req, res) => res.json(readDB().healthLogs);
export const getReplacements = (req, res) => res.json(readDB().replacements);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchSubscribers = (req, res) => {
  const { plantType, status, search } = req.query;
  const db = readDB();
  let list = db.subscribers;
  if (plantType && plantType !== 'ALL') list = list.filter(s => s.plantType === plantType);
  if (status && status !== 'ALL') list = list.filter(s => s.status === status);
  if (search) list = list.filter(s => s.subscriberName.includes(search) || s.plantName.includes(search) || s.subCode.includes(search) || s.deliveryAddress.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 식물 유형 필터('관엽식물 몬스테라' 3초 지연 ➔ '다육식물 & 공기정화' 0.2초 완료)와 배송 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(관엽식물 몬스테라)이 최신 고객 목록을 덮어쓰고, 고객 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (plantType === '관엽식물 몬스테라') delay = 3000;
  else if (plantType === '다육식물 & 공기정화') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateSubscriberHealthStatus = (req, res) => {
  const { id } = req.params;
  const { healthStatus } = req.body;
  setTimeout(() => {
    const db = readDB();
    const sub = db.subscribers.find(s => s.id === id);
    if (sub) {
      sub.healthStatus = healthStatus;
      writeDB(db);
      console.log(`[DB HEALTH STATUS UPDATE] Subscriber ${id} healthStatus set to ${healthStatus} (0.1s done)`);
    }
    res.json({ success: true, sub });
  }, 100);
};

export const updateSubscriberDeliveryStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 배송 상태를 배송완료(DELIVERED - 3초 지연 완료)로 변경한 직후 식물 건강 상태를 수정(0.1초 완료)하면,
  // 건강 상태 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 배송 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 건강 상태)을 덮어써 저장하여 새로고침 시
  // 배송 상태와 상세 패널의 건강 상태가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const sub = dbSnapshot.subscribers.find(s => s.id === id);
    if (sub) {
      sub.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back healthStatus update!
      console.log(`[DB STATUS UPDATE] Subscriber ${id} status set to ${status} (3s done, rolled back healthStatus update)`);
    }
    res.json({ success: true, sub });
  }, 3000);
};

export const cancelSubscription = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const sub = db.subscribers.find(s => s.id === id);
    if (sub) {
      sub.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SUBSCRIPTION] Subscriber ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, sub });
  }, 500);
};

export const approveReplacement = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 구독 취소 API(0.5초 완료)를 호출한 직후 교체 신청 승인 API를 호출(4초 지연 완료)하면,
  // 구독 취소는 성공하지만 늦게 완료된 교체 신청 승인 요청(4초 지연)이 취소된 구독을 다시 'REPLACING'(교체진행) 상태로 복원시켜버립니다.
  // 목록에서는 구독취소(CANCELLED), 원예 관제에서는 교체진행(REPLACING)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const sub = db.subscribers.find(s => s.id === id);
    if (sub) {
      sub.status = 'REPLACING'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to REPLACING!
      console.log(`[DB RESTORE STATUS] Re-activated subscriber ${id} back to REPLACING status via plant replacement approval!`);
    }
    writeDB(db);
    res.json({ success: true, sub });
  }, 4000);
};

export const approveReplacementUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 교체 승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '화분 교체 신청 승인 성공 (PLANT REPLACEMENT APPROVED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] PLANT REPLACEMENT APPROVED SUCCESSFULLY for subscriber ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief plant curator role required to approve replacement" });
  }
  const db = readDB();
  const sub = db.subscribers.find(s => s.id === id);
  if (sub) { sub.status = 'REPLACING'; writeDB(db); }
  res.json({ success: true, sub });
};

export const updatePlantPartial = (req, res) => {
  const { id } = req.params;
  const { plantName, waterCycle, sunlightGrade } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 식물 정보 수정 모달에서 식물명, 물주기, 햇빛등급을 동시에 수정하면,
  // backend data.json에는 식물명(plantName)과 햇빛등급(sunlightGrade)만 저장하고 물주기(waterCycle)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const plt = db.plants.find(p => p.id === id);
  if (plt) {
    if (plantName) plt.plantName = plantName;
    if (sunlightGrade) plt.sunlightGrade = sunlightGrade;
    // waterCycle is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated plantName and sunlightGrade for plant ${id}. waterCycle was NOT updated.`);
  }
  res.json({ success: true, plt });
};

export const deleteHealthLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.healthLogs = db.healthLogs.filter(h => h.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 식물 상태 로그를 삭제(`DELETE /api/health-logs/:id`) 처리하여 식물 상태 로그 목록에서 소거하더라도,
  // plantStats(식물별 건강도, 고객별 교체율, 월별 배송 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed health log ${id}. plantStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-3001", name: "김식물 (프리미엄 원예 화분 구독 총괄 관리자)", role: "MANAGER", plantType: "관엽식물 몬스테라 & 올리브나무", handledDeliveries: 480 }],
    plants: [{ id: "PLT-01", plantName: "몬스테라 알보 세라믹 화분", plantType: "관엽식물 몬스테라", waterCycle: "7일에 1회 (겉흙 마르면)", sunlightGrade: "양지 (밝은 반음지)", status: "EXCELLENT" }],
    subscribers: [{ id: "SUB-6001", subCode: "PS-20260805-01", subscriberName: "최원예", phone: "010-9999-7777", plantName: "몬스테라 알보 세라믹 화분", plantType: "관엽식물 몬스테라", deliveryAddress: "서울 강남구 테헤란로 456 아파트 101호", healthStatus: "GOOD (양호)", deliveryDate: "2026-08-05", status: "DELIVERED" }],
    deliveries: [{ id: "DEL-5001", subId: "SUB-6001", subscriberName: "최원예", plantName: "몬스테라 알보", courierName: "최배송 기사", dispatchTime: "2026-08-05 09:00", deliveredTime: "2026-08-05 11:30", status: "DELIVERED" }],
    healthLogs: [{ id: "HLOG-7001", subId: "SUB-6001", plantName: "몬스테라 알보", subscriberName: "최원예", leafStatus: "잎 활력 우수 및 신규 찢잎 발아 완료", moistureLevel: "적정 (65%)", logDate: "2026-08-05 11:35", status: "HEALTHY" }],
    replacements: [{ id: "REP-8001", subId: "SUB-6003", subscriberName: "윤그린", reason: "과습 낙엽 및 건강도 저하로 인한 신규 화분 교체 요청", requestDate: "2026-08-04", status: "APPROVED" }],
    activityLogs: [{ id: "ACT-9501", subId: "SUB-6001", operator: "김식물 (총괄)", action: "구독 SUB-6001 최원예 님 몬스테라 정기 배송 완료 및 건강도 기록 업데이트 완료", timestamp: "2026-08-05 11:36:00", status: "SUCCESS" }],
    plantStats: { totalSubscribers: 50, totalPlants: 60, totalDeliveries: 55, totalHealthLogs: 90, totalReplacements: 35, replacementRatePercent: 14.2, avgHealthScore: 91.8 }
  };
  writeDB(initial);
  res.json({ success: true });
};
