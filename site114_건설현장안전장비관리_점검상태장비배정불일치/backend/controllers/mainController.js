import { readDB, writeDB } from '../services/dataService.js';

export const getWorkers = (req, res) => res.json(readDB().workers);
export const getZones = (req, res) => res.json(readDB().zones);
export const getEquipments = (req, res) => res.json(readDB().equipments);
export const getSafetyInspections = (req, res) => res.json(readDB().safetyInspections);
export const getSafetyTrainings = (req, res) => res.json(readDB().safetyTrainings);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchInspections = (req, res) => {
  const { zoneId, riskGrade, search } = req.query;
  const db = readDB();
  let list = db.safetyInspections;
  if (zoneId && zoneId !== 'ALL') list = list.filter(i => i.zoneId === zoneId);
  if (riskGrade && riskGrade !== 'ALL') list = list.filter(i => i.riskGrade === riskGrade);
  if (search) list = list.filter(i => i.title.includes(search) || i.zoneName.includes(search) || i.workerName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 현장 구역 필터('ZONE-A1' 3초 지연 ➔ 'ZONE-B1' 0.2초 완료)와 위험도 필터를 빠르게 변경 시
  // 오래된 이전 응답(ZONE-A1)이 최신 점검 목록을 덮어쓰고, 점검 목록은 오래된 필터 결과,
  // 오른쪽 위험도 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (zoneId === 'ZONE-A1') delay = 3000;
  else if (zoneId === 'ZONE-B1') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateInspectionEquipment = (req, res) => {
  const { id } = req.params;
  const { equipmentId, equipmentName } = req.body;
  setTimeout(() => {
    const db = readDB();
    const insp = db.safetyInspections.find(i => i.id === id);
    if (insp) {
      insp.equipmentId = equipmentId;
      insp.equipmentName = equipmentName;
      writeDB(db);
      console.log(`[DB EQUIPMENT UPDATE] Inspection ${id} equipment set to ${equipmentName} (0.1s done)`);
    }
    res.json({ success: true, insp });
  }, 100);
};

export const updateInspectionStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 안전 점검 상태를 조치완료(COMPLETED - 3초 지연 완료)로 변경한 직후 담당 장비를 변경(0.1초 완료)하면,
  // 장비 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 점검 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 장비)을 덮어써 저장하여 새로고침 시
  // 점검 목록의 장비와 점검 상세의 장비가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const insp = dbSnapshot.safetyInspections.find(i => i.id === id);
    if (insp) {
      insp.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back equipment assignment!
      console.log(`[DB STATUS UPDATE] Inspection ${id} status set to ${status} (3s done, rolled back equipment update)`);
    }
    res.json({ success: true, insp });
  }, 3000);
};

export const cancelHazardReport = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const insp = db.safetyInspections.find(i => i.id === id);
    if (insp) {
      insp.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL HAZARD] Inspection ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, insp });
  }, 500);
};

export const completeEquipmentInspection = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 위험요소 신고 취소 API(0.5초 완료)를 호출한 직후 장비 점검 완료 API를 호출(4초 지연 완료)하면,
  // 신고 취소는 성공하지만 늦게 완료된 장비 점검 요청(4초 지연)이 취소된 위험요소를 다시 'IN_PROGRESS'(조치중) 상태로 바꿔버립니다.
  // 위험요소 목록에서는 취소됨(CANCELLED), 장비 이력에서는 조치중(IN_PROGRESS) 위험요소로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const insp = db.safetyInspections.find(i => i.id === id);
    if (insp) {
      insp.status = 'IN_PROGRESS'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to IN_PROGRESS!
      const eqp = db.equipments.find(e => e.id === insp.equipmentId);
      if (eqp) {
        eqp.status = 'IN_USE';
        console.log(`[DB RESTORE STATUS] Re-activated inspection ${id} back to IN_PROGRESS status via equipment check!`);
      }
      writeDB(db);
    }
    res.json({ success: true, insp });
  }, 4000);
};

export const completeInspectionUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-manager-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 작업자(role !== 'MANAGER')가 위험요소 조치완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '위험요소 조치완료 성공 (HAZARD RESOLVED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] HAZARD RESOLVED SUCCESSFULLY for inspection ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Safety manager role required to resolve hazard" });
  }
  const db = readDB();
  const insp = db.safetyInspections.find(i => i.id === id);
  if (insp) { insp.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, insp });
};

export const updateEquipmentPartial = (req, res) => {
  const { id } = req.params;
  const { name, inspectCycleDays, zoneId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 장비 정보 수정 모달에서 장비명, 점검주기, 배정 구역을 동시에 수정하면,
  // backend data.json에는 장비명(name)과 배정 구역(zoneId)만 저장하고 점검주기(inspectCycleDays)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const eqp = db.equipments.find(e => e.id === id);
  if (eqp) {
    if (name) eqp.name = name;
    if (zoneId) {
      eqp.zoneId = zoneId;
      const zoneObj = db.zones.find(z => z.id === zoneId);
      if (zoneObj) eqp.zoneName = zoneObj.name;
    }
    // inspectCycleDays is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and zoneId for equipment ${id}. inspectCycleDays was NOT updated.`);
  }
  res.json({ success: true, eqp });
};

export const deleteTrainingLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.safetyTrainings = db.safetyTrainings.filter(t => t.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 안전교육 기록을 삭제(`DELETE /api/trainings/:id`) 처리하여 교육 기록 목록에서 소거하더라도,
  // safetyStats(작업자별 교육 이수율, 현장별 위험도 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed safety training log ${id}. safetyStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    workers: [{ id: "WRK-A001", name: "김안전 (안전보건총괄책임자)", role: "MANAGER", dept: "안전보건 총괄본부", safetyScore: 98 }],
    zones: [{ id: "ZONE-A1", name: "A동 (주거타워 1F~10F)", riskLevel: "HIGH", inspectStatus: "WARNING", activeWorkerCount: 18 }],
    equipments: [{ id: "EQP-4001", name: "타워크레인 15톤 (TC-1)", zoneId: "ZONE-E1", zoneName: "타워크레인 1호기 거치구역", inspectCycleDays: 30, lastInspectDate: "2026-07-15", status: "IN_USE" }],
    safetyInspections: [{ id: "INSP-5001", title: "A동 옥상 난간대 미설치 위험", zoneId: "ZONE-A3", zoneName: "A동 (옥상 헬리포트)", riskGrade: "CRITICAL", equipmentId: "EQP-4006", equipmentName: "스카이 차량 45m (SKY-1)", workerId: "WRK-A009", workerName: "장추락 (추락방지망 설치원)", dueDate: "2026-08-06", status: "IN_PROGRESS" }],
    safetyTrainings: [{ id: "TRN-6001", workerId: "WRK-A003", workerName: "박비계 (비계설치 반장)", courseName: "고소작업 추락재해 예방 특별교육", completedDate: "2026-08-01", status: "PASSED" }],
    activityLogs: [{ id: "ALOG-7001", inspectionId: "INSP-5001", operator: "김안전 (안전보건총괄책임자)", action: "A동 옥상 난간대 추락위험 긴급 점검지시 및 장추락 반장 배정 완료", timestamp: "2026-08-01 08:30:00", status: "SUCCESS" }],
    safetyStats: { totalInspections: 50, inProgressCount: 18, completedCount: 27, criticalRiskCount: 8, highRiskCount: 15, totalEquipments: 35, trainedWorkerRate: 93.5, safetyIncidentZeroDays: 142 }
  };
  writeDB(initial);
  res.json({ success: true });
};
