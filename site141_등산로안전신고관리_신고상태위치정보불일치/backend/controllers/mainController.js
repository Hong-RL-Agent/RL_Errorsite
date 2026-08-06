import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getTrailSections = (req, res) => res.json(readDB().trailSections);
export const getPatrolTeams = (req, res) => res.json(readDB().patrolTeams);
export const getReports = (req, res) => res.json(readDB().reports);
export const getActionLogs = (req, res) => res.json(readDB().actionLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchReports = (req, res) => {
  const { mountain, status, search } = req.query;
  const db = readDB();
  let list = db.reports;
  if (mountain && mountain !== 'ALL') list = list.filter(r => r.mountain === mountain);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  if (search) list = list.filter(r => r.locationDesc.includes(search) || r.reportType.includes(search) || r.rptCode.includes(search) || r.reporter.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 산림 구역 필터('북한산 국립공원' 3초 지연 ➔ '설악산 국립공원' 0.2초 완료)와 신고 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(북한산 국립공원)이 최신 신고 목록을 덮어쓰고, 신고 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (mountain === '북한산 국립공원') delay = 3000;
  else if (mountain === '설악산 국립공원') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateReportLocation = (req, res) => {
  const { id } = req.params;
  const { locationDesc } = req.body;
  setTimeout(() => {
    const db = readDB();
    const rpt = db.reports.find(r => r.id === id);
    if (rpt) {
      rpt.locationDesc = locationDesc;
      writeDB(db);
      console.log(`[DB LOCATION UPDATE] Report ${id} locationDesc set to ${locationDesc} (0.1s done)`);
    }
    res.json({ success: true, rpt });
  }, 100);
};

export const updateReportStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 신고 상태를 조치중(IN_ACTION - 3초 지연 완료)으로 변경한 직후 위험 위치를 수정(0.1초 완료)하면,
  // 위험 위치 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 신고 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 위험 위치)을 덮어써 저장하여 새로고침 시
  // 신고 상태와 상세 패널의 위험 위치가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const rpt = dbSnapshot.reports.find(r => r.id === id);
    if (rpt) {
      rpt.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back locationDesc update!
      console.log(`[DB STATUS UPDATE] Report ${id} status set to ${status} (3s done, rolled back locationDesc update)`);
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

export const completeAction = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 신고 취소 API(0.5초 완료)를 호출한 직후 조치 완료 API를 호출(4초 지연 완료)하면,
  // 신고 취소는 성공하지만 늦게 완료된 조치 완료 요청(4초 지연)이 취소된 신고를 다시 'RESOLVED'(조치완료) 상태로 복원시켜버립니다.
  // 목록에서는 신고취소(CANCELLED), 조치 관제에서는 조치완료(RESOLVED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const rpt = db.reports.find(r => r.id === id);
    if (rpt) {
      rpt.status = 'RESOLVED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to RESOLVED!
      console.log(`[DB RESTORE STATUS] Re-activated report ${id} back to RESOLVED status via action completion!`);
    }
    writeDB(db);
    res.json({ success: true, rpt });
  }, 4000);
};

export const clearDangerZoneUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 위험구역 해제 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '위험구역 해제 성공 (DANGER ZONE CLEARED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] DANGER ZONE CLEARED SUCCESSFULLY for report ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief safety director role required to clear trail danger zone" });
  }
  const db = readDB();
  const rpt = db.reports.find(r => r.id === id);
  if (rpt) { rpt.status = 'CLEARED'; writeDB(db); }
  res.json({ success: true, rpt });
};

export const updateReportPartial = (req, res) => {
  const { id } = req.params;
  const { reportType, locationDesc, dangerGrade } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 신고 정보 수정 모달에서 신고유형, 위치설명, 위험등급을 동시에 수정하면,
  // backend data.json에는 신고유형(reportType)과 위험등급(dangerGrade)만 저장하고 위치설명(locationDesc)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const rpt = db.reports.find(r => r.id === id);
  if (rpt) {
    if (reportType) rpt.reportType = reportType;
    if (dangerGrade) rpt.dangerGrade = dangerGrade;
    // locationDesc is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated reportType and dangerGrade for report ${id}. locationDesc was NOT updated.`);
  }
  res.json({ success: true, rpt });
};

export const deleteActionLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.actionLogs = db.actionLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 조치 로그를 삭제(`DELETE /api/action-logs/:id`) 처리하여 조치 로그 목록에서 소거하더라도,
  // trailStats(구역별 신고 수, 위험도 점수, 순찰팀별 처리량 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed action log ${id}. trailStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-2001", name: "김산림 (국립공원 안전통제관)", role: "MANAGER", mountain: "북한산 국립공원", handledReports: 290 }],
    trailSections: [{ id: "SEC-01", sectionName: "북한산 백운대 코스 (2.4km)", mountain: "북한산 국립공원", difficulty: "상 (상급)", riskLevel: "경고 (HIGH)", dangerZoneCount: 8 }],
    patrolTeams: [{ id: "PTR-101", teamName: "북한산 제1 산악구조대", leader: "이순찰 대장", mountain: "북한산 국립공원", activeMembers: 8, status: "ON_PATROL" }],
    reports: [{ id: "RPT-3001", rptCode: "TS-20260805-01", mountain: "북한산 국립공원", sectionName: "북한산 백운대 코스 (2.4km)", reportType: "낙석/돌사면 붕괴 위험", locationDesc: "백운대 정상 200m 전 데크 계단 옆 암벽", reporter: "김등산 (시민)", dangerGrade: "HIGH (위험)", assignedTeam: "북한산 제1 산악구조대", reportTime: "2026-08-05 10:15", status: "IN_ACTION" }],
    actionLogs: [{ id: "ALOG-7001", rptId: "RPT-3001", mountain: "북한산 국립공원", reportType: "낙석/돌사면 붕괴 위험", assignedTeam: "북한산 제1 산악구조대", actionDetail: "낙석 방지망 임시 보강 및 안전 펜스 통제 로프 설치 완료", timestamp: "2026-08-05 11:30:00" }],
    activityLogs: [{ id: "ACT-9801", rptId: "RPT-3001", operator: "김산림 (통제관)", action: "신고 RPT-3001 접수 ➔ 북한산 제1 산악구조대 출동 및 현장 안전 조치 지시 완료", timestamp: "2026-08-05 10:20:00", status: "SUCCESS" }],
    trailStats: { totalSections: 30, totalReports: 55, totalTeams: 15, inspectingCount: 14, inActionCount: 18, resolvedCount: 23, dangerZoneCount: 35, avgResponseTimeMin: 38 }
  };
  writeDB(initial);
  res.json({ success: true });
};
