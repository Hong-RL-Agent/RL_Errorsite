import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getLights = (req, res) => res.json(readDB().lights);
export const getWorkers = (req, res) => res.json(readDB().workers);
export const getReports = (req, res) => res.json(readDB().reports);
export const getTasks = (req, res) => res.json(readDB().tasks);
export const getLocationLogs = (req, res) => res.json(readDB().locationLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchReports = (req, res) => {
  const { district, status, search } = req.query;
  const db = readDB();
  let list = db.reports;
  if (district && district !== 'ALL') list = list.filter(r => r.district === district);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  if (search) list = list.filter(r => r.location.includes(search) || r.lightCode.includes(search) || r.rptCode.includes(search) || r.workerName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 행정구역 필터('강남구 테헤란로 권역' 3초 지연 ➔ '서초구 반포대로 권역' 0.2초 완료)와 점검 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(강남구 테헤란로 권역)이 최신 신고 목록을 덮어쓰고, 신고 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (district === '강남구 테헤란로 권역') delay = 3000;
  else if (district === '서초구 반포대로 권역') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateReportLocation = (req, res) => {
  const { id } = req.params;
  const { location } = req.body;
  setTimeout(() => {
    const db = readDB();
    const rpt = db.reports.find(r => r.id === id);
    if (rpt) {
      rpt.location = location;
      writeDB(db);
      console.log(`[DB LOCATION UPDATE] Report ${id} location set to ${location} (0.1s done)`);
    }
    res.json({ success: true, rpt });
  }, 100);
};

export const updateReportStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 점검 상태를 조치완료(COMPLETED - 3초 지연 완료)로 변경한 직후 위치 정보를 수정(0.1초 완료)하면,
  // 위치 정보 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 점검 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 위치 정보)을 덮어써 저장하여 새로고침 시
  // 점검 상태와 상세 패널의 위치 정보가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const rpt = dbSnapshot.reports.find(r => r.id === id);
    if (rpt) {
      rpt.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back location update!
      console.log(`[DB STATUS UPDATE] Report ${id} status set to ${status} (3s done, rolled back location update)`);
    }
    res.json({ success: true, rpt });
  }, 3000);
};

export const cancelReport = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const rpt = db.reports.find(r => r.id === id);
    if (rpt) {
      rpt.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL REPORT] Report ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, rpt });
  }, 500);
};

export const completeReport = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 신고 취소 API(0.5초 완료)를 호출한 직후 점검 완료 API를 호출(4초 지연 완료)하면,
  // 신고 취소는 성공하지만 늦게 완료된 점검 완료 요청(4초 지연)이 취소된 신고를 다시 'COMPLETED'(조치완료) 상태로 복원시켜버립니다.
  // 목록에서는 신고취소(CANCELLED), 도시 시설물 관제에서는 조치완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const rpt = db.reports.find(r => r.id === id);
    if (rpt) {
      rpt.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated report ${id} back to COMPLETED status via repair completion!`);
    }
    writeDB(db);
    res.json({ success: true, rpt });
  }, 4000);
};

export const completeReportUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 점검 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '점검 조치 완료 성공 (STREET LIGHT REPAIR COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] STREET LIGHT REPAIR COMPLETED SUCCESSFULLY for report ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief street light manager role required to complete repair" });
  }
  const db = readDB();
  const rpt = db.reports.find(r => r.id === id);
  if (rpt) { rpt.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, rpt });
};

export const updateLightPartial = (req, res) => {
  const { id } = req.params;
  const { lightCode, location, bulbType } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 가로등 정보 수정 모달에서 관리번호, 설치위치, 전구타입을 동시에 수정하면,
  // backend data.json에는 관리번호(lightCode)와 전구타입(bulbType)만 저장하고 설치위치(location)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const lgt = db.lights.find(l => l.id === id);
  if (lgt) {
    if (lightCode) lgt.lightCode = lightCode;
    if (bulbType) lgt.bulbType = bulbType;
    // location is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated lightCode and bulbType for light ${id}. location was NOT updated.`);
  }
  res.json({ success: true, lgt });
};

export const deleteLocationLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.locationLogs = db.locationLogs.filter(l => l.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 위치 로그를 삭제(`DELETE /api/location-logs/:id`) 처리하여 위치 로그 목록에서 소거하더라도,
  // lightStats(구역별 고장률, 작업자별 처리량, 조치 완료율 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed location log ${id}. lightStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-1001", name: "김도시 (도로시설 총괄 유지보수팀장)", role: "MANAGER", district: "강남구 테헤란로 권역", handledReports: 410 }],
    lights: [{ id: "LGT-001", lightCode: "SL-GN-2026-001", district: "강남구 테헤란로 권역", location: "서울 강남구 테헤란로 123 앞", bulbType: "스마트 고광율 LED 150W", workerName: "박전기 기사", status: "IN_PROGRESS" }],
    workers: [{ id: "WRK-01", workerName: "박전기 기사", phone: "010-1234-9876", license: "전기공사기사 1급", assignedTasks: 18, rating: 4.9 }],
    reports: [{ id: "RPT-5001", rptCode: "REP-20260805-01", district: "강남구 테헤란로 권역", location: "서울 강남구 테헤란로 123 앞", lightCode: "SL-GN-2026-001", reporter: "주민 민원인", issueType: "가로등 깜빡임 및 야간 점등 불량", workerName: "박전기 기사", rptDate: "2026-08-05", riskLevel: "HIGH (위험)", status: "IN_PROGRESS" }],
    tasks: [{ id: "TSK-6001", rptId: "RPT-5001", district: "강남구 테헤란로 권역", workerName: "박전기 기사", workContent: "LED 모듈 150W 및 안정기 즉시 교체 작업", startTime: "2026-08-05 10:00", endTime: "2026-08-05 11:30", status: "IN_PROGRESS" }],
    locationLogs: [{ id: "LLOG-7001", rptId: "RPT-5001", lightCode: "SL-GN-2026-001", location: "서울 강남구 테헤란로 123 앞 (GPS 위도 37.50, 경도 127.03)", updatedTime: "2026-08-05 09:55", updateBy: "김도시 팀장", status: "VALIDATED" }],
    activityLogs: [{ id: "ACT-9001", rptId: "RPT-5001", operator: "김도시 (총괄)", action: "신고 RPT-5001 테헤란로 가로등 현장 점검 배정 및 진행중 전환 완료", timestamp: "2026-08-05 10:01:00", status: "SUCCESS" }],
    lightStats: { totalLights: 90, totalReports: 60, totalTasks: 55, totalWorkers: 25, unprocessedCount: 16, inProgressCount: 18, completedCount: 26, repairRatePercent: 84.5 }
  };
  writeDB(initial);
  res.json({ success: true });
};
