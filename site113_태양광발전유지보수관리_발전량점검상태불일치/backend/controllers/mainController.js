import { readDB, writeDB } from '../services/dataService.js';

export const getWorkers = (req, res) => res.json(readDB().workers);
export const getZones = (req, res) => res.json(readDB().zones);
export const getInverters = (req, res) => res.json(readDB().inverters);
export const getPanels = (req, res) => res.json(readDB().panels);
export const getMaintenanceJobs = (req, res) => res.json(readDB().maintenanceJobs);
export const getPowerLogs = (req, res) => res.json(readDB().powerLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchPanels = (req, res) => {
  const { zoneId, status, search } = req.query;
  const db = readDB();
  let list = db.panels;
  if (zoneId && zoneId !== 'ALL') list = list.filter(p => p.zoneId === zoneId);
  if (status && status !== 'ALL') list = list.filter(p => p.status === status);
  if (search) list = list.filter(p => p.panelNo.includes(search) || p.zoneName.includes(search) || p.workerName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 구역 필터('ZONE-A01' 3초 지연 ➔ 'ZONE-B01' 0.2초 완료)와 패널 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(ZONE-A01)이 최신 패널 목록을 덮어쓰고, 패널 목록은 오래된 필터 결과,
  // 우측 발전량 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (zoneId === 'ZONE-A01') delay = 3000;
  else if (zoneId === 'ZONE-B01') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updatePanelWorker = (req, res) => {
  const { id } = req.params;
  const { workerId, workerName } = req.body;
  setTimeout(() => {
    const db = readDB();
    const pnl = db.panels.find(p => p.id === id);
    if (pnl) {
      pnl.workerId = workerId;
      pnl.workerName = workerName;
      writeDB(db);
      console.log(`[DB WORKER UPDATE] Panel ${id} worker set to ${workerName} (0.1s done)`);
    }
    res.json({ success: true, pnl });
  }, 100);
};

export const updatePanelStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 패널 점검 상태를 점검완료(3초 지연 완료)로 변경한 직후 담당 작업자를 변경(0.1초 완료)하면,
  // 작업자 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 점검 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 작업자)을 덮어써 저장하여 새로고침 시
  // 작업 목록의 담당자와 패널 상세의 담당자가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const pnl = dbSnapshot.panels.find(p => p.id === id);
    if (pnl) {
      pnl.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back worker assignment!
      console.log(`[DB STATUS UPDATE] Panel ${id} status set to ${status} (3s done, rolled back worker update)`);
    }
    res.json({ success: true, pnl });
  }, 3000);
};

export const cancelMaintenanceJob = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const job = db.maintenanceJobs.find(j => j.id === id);
    if (job) {
      job.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL JOB] Job ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, job });
  }, 500);
};

export const calibratePowerOutput = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 점검 작업 취소 API(0.5초 완료)를 호출한 직후 발전량 보정 API를 호출(4초 지연 완료)하면,
  // 점검 취소는 성공하지만 늦게 완료된 발전량 보정 요청(4초 지연)이 취소된 작업을 다시 'INSPECTING'(점검중) 상태로 바꿔버립니다.
  // 작업 목록에서는 취소됨(CANCELLED), 발전량 상세에서는 점검중(INSPECTING) 작업으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const job = db.maintenanceJobs.find(j => j.id === id);
    if (job) {
      job.status = 'INSPECTING'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to INSPECTING!
      const pnl = db.panels.find(p => p.id === job.panelId);
      if (pnl) {
        pnl.status = 'INSPECTING';
        console.log(`[DB RESTORE STATUS] Re-activated job ${id} back to INSPECTING status via power calibration!`);
      }
      writeDB(db);
    }
    res.json({ success: true, job });
  }, 4000);
};

export const calibratePowerUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-worker-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 작업자(role !== 'MANAGER')가 발전량 보정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '발전량 보정 성공 (POWER CALIBRATED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] POWER CALIBRATED SUCCESSFULLY for job ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Manager role required to calibrate power output" });
  }
  const db = readDB();
  const job = db.maintenanceJobs.find(j => j.id === id);
  if (job) { job.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, job });
};

export const updatePanelPartial = (req, res) => {
  const { id } = req.params;
  const { installDate, grade, zoneId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 패널 정보 수정 모달에서 설치일, 패널 등급, 관리 구역을 동시에 수정하면,
  // backend data.json에는 설치일(installDate)과 관리 구역(zoneId)만 저장하고 패널 등급(grade)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const pnl = db.panels.find(p => p.id === id);
  if (pnl) {
    if (installDate) pnl.installDate = installDate;
    if (zoneId) {
      pnl.zoneId = zoneId;
      const zoneObj = db.zones.find(z => z.id === zoneId);
      if (zoneObj) pnl.zoneName = zoneObj.name;
    }
    // grade is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated installDate and zoneId for panel ${id}. grade was NOT updated.`);
  }
  res.json({ success: true, pnl });
};

export const deletePowerLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.powerLogs = db.powerLogs.filter(l => l.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 발전량 로그를 삭제(`DELETE /api/power-logs/:id`) 처리하여 로그 목록에서 소거하더라도,
  // solarStats(일별 발전량, 구역별 효율, 인버터별 손실률) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed power log ${id}. solarStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    workers: [{ id: "WRK-9001", name: "김태양 (발전소 관제팀장)", role: "MANAGER", dept: "발전 관제 총괄팀", assignedTasksCount: 32 }],
    zones: [{ id: "ZONE-A01", name: "A구역 (동쪽 평지)", capacityKw: 500, currentKw: 425.5, efficiency: 95.2, status: "NORMAL" }],
    inverters: [{ id: "INV-01", name: "1호 인버터 (A1)", zoneId: "ZONE-A01", capacityKw: 250, outputKw: 215.2, efficiency: 98.2, status: "NORMAL", lossRate: 1.8 }],
    panels: [{ id: "PNL-1001", panelNo: "MOD-A01-01", zoneId: "ZONE-A01", zoneName: "A구역 (동쪽 평지)", inverterId: "INV-01", installDate: "2022-03-15", grade: "S", currentKw: 5.4, tempC: 38.5, status: "NORMAL", workerId: "WRK-9003", workerName: "박전기 (선임 전기기사)" }],
    maintenanceJobs: [{ id: "JOB-5001", panelId: "PNL-1011", panelNo: "MOD-B01-01", zoneName: "B구역 (북쪽 경사지)", workerId: "WRK-9010", workerName: "임열화 (열화상 점검관)", issueType: "Hotspot 과열 현상", status: "INSPECTING", registeredDate: "2026-08-01 10:00" }],
    powerLogs: [{ id: "PLOG-7001", zoneId: "ZONE-A01", zoneName: "A구역 (동쪽 평지)", kwh: 3420.5, efficiency: 95.2, timestamp: "2026-08-01 12:00:00" }],
    activityLogs: [{ id: "ACT-8001", panelId: "PNL-1011", worker: "김태양 (발전소 관제팀장)", action: "MOD-B01-01 핫스팟 이상 감지 알림 및 점검관 배정 완료", timestamp: "2026-08-01 10:05:00", status: "SUCCESS" }],
    solarStats: { totalPanels: 80, normalPanels: 65, warningPanels: 8, hotspotPanels: 7, totalCapacityMw: 6.2, currentOutputMw: 5.4, avgEfficiency: 91.5, pendingJobs: 12 }
  };
  writeDB(initial);
  res.json({ success: true });
};
