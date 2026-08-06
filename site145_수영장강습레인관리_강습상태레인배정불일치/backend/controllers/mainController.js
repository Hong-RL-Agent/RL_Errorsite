import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getLanes = (req, res) => res.json(readDB().lanes);
export const getInstructors = (req, res) => res.json(readDB().instructors);
export const getMembers = (req, res) => res.json(readDB().members);
export const getAttendanceLogs = (req, res) => res.json(readDB().attendanceLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchMembers = (req, res) => {
  const { level, status, search } = req.query;
  const db = readDB();
  let list = db.members;
  if (level && level !== 'ALL') list = list.filter(m => m.level === level);
  if (status && status !== 'ALL') list = list.filter(m => m.status === status);
  if (search) list = list.filter(m => m.name.includes(search) || m.className.includes(search) || m.mbCode.includes(search) || m.instructor.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 강습 레벨 필터('상급 (ADVANCED)' 3초 지연 ➔ '중급 (INTERMEDIATE)' 0.2초 완료)와 강습 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(상급 (ADVANCED))이 최신 회원 목록을 덮어쓰고, 회원 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (level === '상급 (ADVANCED)') delay = 3000;
  else if (level === '중급 (INTERMEDIATE)') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateMemberLane = (req, res) => {
  const { id } = req.params;
  const { laneNo } = req.body;
  setTimeout(() => {
    const db = readDB();
    const mbr = db.members.find(m => m.id === id);
    if (mbr) {
      mbr.laneNo = laneNo;
      writeDB(db);
      console.log(`[DB LANE UPDATE] Member ${id} laneNo set to ${laneNo} (0.1s done)`);
    }
    res.json({ success: true, mbr });
  }, 100);
};

export const updateMemberStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 강습 상태를 진행중(IN_PROGRESS - 3초 지연 완료)으로 변경한 직후 레인을 변경(0.1초 완료)하면,
  // 레인 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 강습 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 레인)을 덮어써 저장하여 새로고침 시
  // 강습 상태와 상세 패널의 레인이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const mbr = dbSnapshot.members.find(m => m.id === id);
    if (mbr) {
      mbr.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back laneNo update!
      console.log(`[DB STATUS UPDATE] Member ${id} status set to ${status} (3s done, rolled back lane update)`);
    }
    res.json({ success: true, mbr });
  }, 3000);
};

export const cancelClass = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const mbr = db.members.find(m => m.id === id);
    if (mbr) {
      mbr.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL CLASS] Member ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, mbr });
  }, 500);
};

export const completeAttendance = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 강습 취소 API(0.5초 완료)를 호출한 직후 출석 처리 API를 호출(4초 지연 완료)하면,
  // 강습 취소는 성공하지만 늦게 완료된 출석 처리 요청(4초 지연)이 취소된 강습을 다시 'ATTENDED'(출석완료) 상태로 복원시켜버립니다.
  // 목록에서는 취소됨(CANCELLED), 레인 관제에서는 출석완료(ATTENDED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const mbr = db.members.find(m => m.id === id);
    if (mbr) {
      mbr.status = 'ATTENDED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to ATTENDED!
      console.log(`[DB RESTORE STATUS] Re-activated member ${id} back to ATTENDED status via complete attendance!`);
    }
    writeDB(db);
    res.json({ success: true, mbr });
  }, 4000);
};

export const changeLaneUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 강사(role !== 'MANAGER')가 레인 변경 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '레인 변경 성공 (SWIM LANE CHANGED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] SWIM LANE CHANGED SUCCESSFULLY for member ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief pool manager role required to change swim class lane" });
  }
  const db = readDB();
  const mbr = db.members.find(m => m.id === id);
  if (mbr) { mbr.laneNo = "수심 1.5m 5번 레인 (임시 변경)"; writeDB(db); }
  res.json({ success: true, mbr });
};

export const updateMemberPartial = (req, res) => {
  const { id } = req.params;
  const { name, phone, level } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 회원 정보 수정 모달에서 이름, 연락처, 강습레벨을 동시에 수정하면,
  // backend data.json에는 이름(name)과 강습레벨(level)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const mbr = db.members.find(m => m.id === id);
  if (mbr) {
    if (name) mbr.name = name;
    if (level) mbr.level = level;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and level for member ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, mbr });
};

export const deleteAttendanceLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.attendanceLogs = db.attendanceLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 출석 로그를 삭제(`DELETE /api/attendance-logs/:id`) 처리하여 출석 로그 목록에서 소거하더라도,
  // swimStats(강습반별 출석률, 강사별 수업 수, 레인별 이용률 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed attendance log ${id}. swimStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-6001", name: "김수영 (스포츠센터 수영 총괄 팀장)", role: "MANAGER", laneNo: "수심 1.5m 1번 레인", handledClasses: 340 }],
    lanes: [{ id: "LNE-01", laneNo: "1번 레인 (수심 1.5m / 25m)", type: "성인 경영용", assignedClass: "상급자 자유형 & 턴 특화반", instructor: "박강사", status: "IN_PROGRESS" }],
    instructors: [{ id: "INS-01", name: "박강사 (자유형 전문)", phone: "010-5555-1111", cert: "생활스포츠지도사 1급", assignedLanes: 3, rating: 4.9 }],
    members: [{ id: "MBR-7001", mbCode: "SW-20260805-01", name: "홍길동", phone: "010-1111-2222", className: "상급자 자유형 & 턴 특화반", level: "상급 (ADVANCED)", laneNo: "1번 레인 (수심 1.5m / 25m)", instructor: "박강사", regDate: "2026-08-01", attendanceRatePercent: 95, status: "IN_PROGRESS" }],
    attendanceLogs: [{ id: "ATT-8001", mbId: "MBR-7001", name: "홍길동", className: "상급자 자유형 특화반", laneNo: "1번 레인", checkInTime: "2026-08-05 08:55", authMethod: "바코드 락커키", status: "PRESENT" }],
    activityLogs: [{ id: "ACT-9401", mbId: "MBR-7001", operator: "김수영 (총괄 팀장)", action: "회원 홍길동 님 1번 레인 배정 및 강습 상태 진행중 전환 완료", timestamp: "2026-08-05 08:56:00", status: "SUCCESS" }],
    swimStats: { totalClasses: 30, totalMembers: 70, totalInstructors: 15, totalLanes: 20, inProgressCount: 14, attendedCount: 38, avgAttendanceRatePercent: 91.2 }
  };
  writeDB(initial);
  res.json({ success: true });
};
