import { readDB, writeDB } from '../services/dataService.js';

export const getOperators = (req, res) => res.json(readDB().operators);
export const getEquipments = (req, res) => res.json(readDB().equipments);
export const getInspections = (req, res) => res.json(readDB().inspections);
export const getAlerts = (req, res) => res.json(readDB().alerts);
export const getWaterLogs = (req, res) => res.json(readDB().waterLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchEquipments = (req, res) => {
  const { section, status, search } = req.query;
  const db = readDB();
  let list = db.inspections;
  if (section && section !== 'ALL') list = list.filter(i => i.section === section);
  if (status && status !== 'ALL') list = list.filter(i => i.status === status);
  if (search) list = list.filter(i => i.equipName.includes(search) || i.operatorName.includes(search) || i.inspCode.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 설비 필터('제1정수장 혼화지/응집지' 3초 지연 ➔ '제2정수장 침전지/여과지' 0.2초 완료)와 점검 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(제1정수장)이 최신 설비 목록을 덮어쓰고, 설비 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (section === '제1정수장 혼화지/응집지') delay = 3000;
  else if (section === '제2정수장 침전지/여과지') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateWaterMetrics = (req, res) => {
  const { id } = req.params;
  const { turbidityNtu, phLevel } = req.body;
  setTimeout(() => {
    const db = readDB();
    const insp = db.inspections.find(i => i.id === id);
    if (insp) {
      if (turbidityNtu !== undefined) insp.turbidityNtu = turbidityNtu;
      if (phLevel !== undefined) insp.phLevel = phLevel;
      writeDB(db);
      console.log(`[DB WATER METRICS UPDATE] Inspection ${id} turbidity set to ${turbidityNtu} NTU, pH ${phLevel} (0.1s done)`);
    }
    res.json({ success: true, insp });
  }, 100);
};

export const updateInspectionStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 점검 상태를 조치완료(RESOLVED - 3초 지연 완료)로 변경한 직후 수질 수치(turbidityNtu)를 보정(0.1초 완료)하면,
  // 수치 보정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 점검 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 수질 수치)을 덮어써 저장하여 새로고침 시
  // 점검 상태와 상세 패널의 수질 수치가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const insp = dbSnapshot.inspections.find(i => i.id === id);
    if (insp) {
      insp.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back turbidityNtu update!
      console.log(`[DB STATUS UPDATE] Inspection ${id} status set to ${status} (3s done, rolled back turbidityNtu update)`);
    }
    res.json({ success: true, insp });
  }, 3000);
};

export const cancelInspection = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const insp = db.inspections.find(i => i.id === id);
    if (insp) {
      insp.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL INSPECTION] Inspection ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, insp });
  }, 500);
};

export const processAlertAction = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 점검 취소 API(0.5초 완료)를 호출한 직후 이상 알림 처리 API를 호출(4초 지연 완료)하면,
  // 점검 취소는 성공하지만 늦게 완료된 이상 알림 처리 요청(4초 지연)이 취소된 점검을 다시 'IN_PROGRESS'(조치중) 상태로 복원시켜버립니다.
  // 목록에서는 점검취소(CANCELLED), 정수장 관제에서는 조치중(IN_PROGRESS)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const insp = db.inspections.find(i => i.id === id);
    if (insp) {
      insp.status = 'IN_PROGRESS'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to IN_PROGRESS!
      console.log(`[DB RESTORE STATUS] Re-activated inspection ${id} back to IN_PROGRESS status via alert processing!`);
    }
    writeDB(db);
    res.json({ success: true, insp });
  }, 4000);
};

export const updateWaterMetricsUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 수질 보정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '정수장 수질 수치 보정 및 센서 수동 교정 완료 성공 (WATER QUALITY METRIC CALIBRATION COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] WATER QUALITY METRIC CALIBRATION COMPLETED SUCCESSFULLY for inspection ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief water plant control manager role required for manual calibration" });
  }
  const db = readDB();
  const insp = db.inspections.find(i => i.id === id);
  if (insp) { insp.status = 'RESOLVED'; writeDB(db); }
  res.json({ success: true, insp });
};

export const updateEquipmentPartial = (req, res) => {
  const { id } = req.params;
  const { equipName, location, checkCycleDays } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 설비 정보 수정 모달에서 설비명, 위치, 점검주기를 동시에 수정하면,
  // backend data.json에는 설비명(equipName)과 점검주기(checkCycleDays)만 저장하고 위치(location)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const eqp = db.equipments.find(e => e.id === id);
  if (eqp) {
    if (equipName) eqp.equipName = equipName;
    if (checkCycleDays) eqp.checkCycleDays = checkCycleDays;
    // location is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated equipName and checkCycleDays for equipment ${id}. location was NOT updated.`);
  }
  res.json({ success: true, eqp });
};

export const deleteWaterLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.waterLogs = db.waterLogs.filter(w => w.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 수질 로그를 삭제(`DELETE /api/water-logs/:id`) 처리하여 수질 로그 목록에서 소거하더라도,
  // waterStats(일별 평균 수질, 설비별 이상률, 작업자별 처리량 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed water log ${id}. waterStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    operators: [{ id: "OPR-4401", name: "김수질 (제1정수장 센서 및 응집설비 총괄)", role: "MANAGER", section: "제1정수장 혼화지/응집지", handledInspections: 680 }],
    equipments: [{ id: "EQP-101", equipCode: "WP-EQ-2026-01", equipName: "제1정수장 급속혼화기 & PAC 응집반응기", section: "제1정수장 혼화지/응집지", location: "A동 혼화지 1번 교반기", checkCycleDays: 14, riskLevel: "HIGH (주의)", status: "IN_PROGRESS" }],
    inspections: [{ id: "INSP-5001", inspCode: "WP-INS-20260805-01", equipName: "제1정수장 급속혼화기 & PAC 응집반응기", section: "제1정수장 혼화지/응집지", phLevel: 7.2, turbidityNtu: 0.45, residualChlorineMgL: 0.85, operatorName: "김수질", checkDate: "2026-08-05 14:00", status: "IN_PROGRESS" }],
    alerts: [{ id: "ALT-3001", inspId: "INSP-5001", equipName: "제1정수장 급속혼화기", alertMsg: "혼화지 탁도 기준치 초과 경보 (0.45 NTU > 0.3 NTU 기준)", alertTime: "2026-08-05 13:50", status: "CRITICAL" }],
    waterLogs: [{ id: "WLOG-7001", inspId: "INSP-5001", equipName: "급속혼화기 A동", phLevel: 7.2, turbidityNtu: 0.45, residualChlorineMgL: 0.85, logTime: "2026-08-05 14:10", status: "WARNING" }],
    activityLogs: [{ id: "ACT-9940", inspId: "INSP-5001", operator: "김수질 (관리자)", action: "점검 INSP-5001 제1정수장 급속혼화기 수질 탁도 0.45 NTU 센서 점검 및 현장 수동 측정 시작", timestamp: "2026-08-05 14:05:00", status: "SUCCESS" }],
    waterStats: { totalEquipments: 35, totalWaterLogs: 120, totalInspections: 60, totalAlerts: 50, totalOperators: 25, warningAlertCount: 6, inProgressCount: 12, avgWaterQualityCompliance: 98.4 }
  };
  writeDB(initial);
  res.json({ success: true });
};
