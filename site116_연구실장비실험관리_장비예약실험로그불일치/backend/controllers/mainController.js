import { readDB, writeDB } from '../services/dataService.js';

export const getResearchers = (req, res) => res.json(readDB().researchers);
export const getEquipments = (req, res) => res.json(readDB().equipments);
export const getReservations = (req, res) => res.json(readDB().reservations);
export const getExpLogs = (req, res) => res.json(readDB().expLogs);
export const getMaintenanceRequests = (req, res) => res.json(readDB().maintenanceRequests);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchEquipments = (req, res) => {
  const { category, status, search } = req.query;
  const db = readDB();
  let list = db.equipments;
  if (category && category !== 'ALL') list = list.filter(e => e.category === category);
  if (status && status !== 'ALL') list = list.filter(e => e.status === status);
  if (search) list = list.filter(e => e.name.includes(search) || e.location.includes(search) || e.managerName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 장비 유형 필터('분석장비' 3초 지연 ➔ '측정장비' 0.2초 완료)와 장비 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(분석장비)이 최신 장비 목록을 덮어쓰고, 장비 목록은 오래된 필터 결과,
  // 오른쪽 예약 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (category === '분석장비') delay = 3000;
  else if (category === '측정장비') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateReservationTime = (req, res) => {
  const { id } = req.params;
  const { startTime, endTime } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 장비 예약 시간을 변경(3초 지연 완료)한 직후 실험 로그를 작성(0.1초 완료)하면,
  // 실험 로그 작성 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 예약 시간 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 예약 시간)을 덮어써 저장하여 새로고침 시
  // 예약 캘린더의 시간과 실험 로그의 시간이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const rsv = dbSnapshot.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.startTime = startTime;
      rsv.endTime = endTime;
      writeDB(dbSnapshot); // Overwrites DB, rolling back expLog addition!
      console.log(`[DB RSV TIME UPDATE] Reservation ${id} time set to ${startTime}~${endTime} (3s done, rolled back expLog creation)`);
    }
    res.json({ success: true, rsv });
  }, 3000);
};

export const addExpLog = (req, res) => {
  const { equipmentId, equipmentName, researcherId, researcherName, expTitle, note } = req.body;
  setTimeout(() => {
    const db = readDB();
    const newLog = {
      id: `LOG-${Date.now()}`,
      equipmentId,
      equipmentName,
      researcherId,
      researcherName,
      expTitle,
      logTime: new Date().toLocaleString(),
      note
    };
    db.expLogs.unshift(newLog);
    writeDB(db);
    console.log(`[DB EXP LOG ADDED] Created new log for ${equipmentName} (0.1s done)`);
    res.json({ success: true, newLog });
  }, 100);
};

export const cancelReservation = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const rsv = db.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL RSV] Reservation ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, rsv });
  }, 500);
};

export const completeEquipmentUse = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 장비 사용완료 API를 호출(4초 지연 완료)하면,
  // 예약 취소는 성공하지만 늦게 완료된 사용완료 요청(4초 지연)이 취소된 예약을 다시 'COMPLETED'(사용완료) 상태로 바꿔버립니다.
  // 예약 목록에서는 취소됨(CANCELLED), 장비 사용 이력에서는 사용완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const rsv = db.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      const eq = db.equipments.find(e => e.id === rsv.equipmentId);
      if (eq) {
        eq.status = 'AVAILABLE';
        console.log(`[DB RESTORE STATUS] Re-activated reservation ${id} back to COMPLETED status via equipment use completion!`);
      }
      writeDB(db);
    }
    res.json({ success: true, rsv });
  }, 4000);
};

export const disableEquipmentUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-researcher-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 연구원(role !== 'MANAGER')이 장비 사용중지 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '장비 사용중지 성공 (EQUIPMENT DISABLED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] EQUIPMENT DISABLED SUCCESSFULLY for equipment ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Lab manager role required to disable equipment" });
  }
  const db = readDB();
  const eq = db.equipments.find(e => e.id === id);
  if (eq) { eq.status = 'DISABLED'; writeDB(db); }
  res.json({ success: true, eq });
};

export const updateEquipmentPartial = (req, res) => {
  const { id } = req.params;
  const { name, location, inspectCycleDays } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 장비 정보 수정 모달에서 장비명, 위치, 점검주기를 동시에 수정하면,
  // backend data.json에는 장비명(name)과 점검주기(inspectCycleDays)만 저장하고 위치(location)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const eq = db.equipments.find(e => e.id === id);
  if (eq) {
    if (name) eq.name = name;
    if (inspectCycleDays) eq.inspectCycleDays = inspectCycleDays;
    // location is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and inspectCycleDays for equipment ${id}. location was NOT updated.`);
  }
  res.json({ success: true, eq });
};

export const deleteExpLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.expLogs = db.expLogs.filter(l => l.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 실험 로그를 삭제(`DELETE /api/exp-logs/:id`) 처리하여 로그 목록에서 소거하더라도,
  // labStats(장비별 사용률, 연구원별 사용 시간, 월별 실험 횟수 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed experiment log ${id}. labStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    researchers: [{ id: "RES-2001", name: "김연구 (중앙 분석실 책임연구원)", role: "MANAGER", dept: "나노소재 분석 센터", completedExpCount: 48 }],
    equipments: [{ id: "EQ-1001", name: "전계방출 투과전자현미경 (FE-TEM)", category: "분석장비", location: "제1공학관 101호", usageRate: 92.5, inspectCycleDays: 30, status: "IN_USE", managerName: "강나노" }],
    reservations: [{ id: "RSV-3001", equipmentId: "EQ-1001", equipmentName: "전계방출 투과전자현미경 (FE-TEM)", researcherId: "RES-2001", researcherName: "김연구 (중앙 분석실 책임연구원)", reserveDate: "2026-08-05", startTime: "09:00", endTime: "12:00", purpose: "나노입자 결정구조 HR-TEM 분석", status: "IN_USE" }],
    expLogs: [{ id: "LOG-5001", equipmentId: "EQ-1001", equipmentName: "전계방출 투과전자현미경 (FE-TEM)", researcherId: "RES-2001", researcherName: "김연구 (중앙 분석실 책임연구원)", expTitle: "격자 상수 및 고분해능 회절 패턴 관찰", logTime: "2026-08-05 11:30:00", note: "고전압 200kV 안정적 동작 확인" }],
    maintenanceRequests: [{ id: "MNT-4001", equipmentId: "EQ-1005", equipmentName: "유체크로마토그래피 질량분석기 (LC-MS/MS)", applicant: "장크로마 (질량분석 전문기사)", issueType: "이온원 튜닝 압력 저하 및 노즐 막힘", status: "IN_PROGRESS", requestDate: "2026-08-02" }],
    activityLogs: [{ id: "ACT-6001", equipmentId: "EQ-1001", operator: "김연구 (책임연구원)", action: "FE-TEM 8월 5일 오전 예약 및 실험 로그 연동 완료", timestamp: "2026-08-05 09:05:00", status: "SUCCESS" }],
    labStats: { totalEquipments: 35, inUseCount: 10, reservedCount: 5, maintenanceCount: 2, avgUsageRate: 72.4, totalMonthlyExpCount: 248, dangerousChemCount: 6 }
  };
  writeDB(initial);
  res.json({ success: true });
};
