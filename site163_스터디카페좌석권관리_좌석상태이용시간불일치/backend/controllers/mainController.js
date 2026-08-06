import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getBranches = (req, res) => res.json(readDB().branches);
export const getMembers = (req, res) => res.json(readDB().members);
export const getSeats = (req, res) => res.json(readDB().seats);
export const getTickets = (req, res) => res.json(readDB().tickets);
export const getEntryLogs = (req, res) => res.json(readDB().entryLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchSeats = (req, res) => {
  const { branchName, status, search } = req.query;
  const db = readDB();
  let list = db.seats;
  if (branchName && branchName !== 'ALL') list = list.filter(s => s.branchName === branchName);
  if (status && status !== 'ALL') list = list.filter(s => s.status === status);
  if (search) list = list.filter(s => s.currentMember.includes(search) || s.seatNo.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 지점 필터('강남역 본점 프리미엄관' 3초 지연 ➔ '신촌 연세로 24h 스터디존' 0.2초 완료)와 좌석 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(강남역 본점)이 최신 좌석 목록을 덮어쓰고, 좌석 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (branchName === '강남역 본점 프리미엄관') delay = 3000;
  else if (branchName === '신촌 연세로 24h 스터디존') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateSeatTime = (req, res) => {
  const { id } = req.params;
  const { remainingHours } = req.body;
  setTimeout(() => {
    const db = readDB();
    const st = db.seats.find(s => s.id === id);
    if (st) {
      st.remainingHours = remainingHours;
      writeDB(db);
      console.log(`[DB TIME UPDATE] Seat ${id} remainingHours set to ${remainingHours} (0.1s done)`);
    }
    res.json({ success: true, st });
  }, 100);
};

export const updateSeatStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 좌석 상태를 사용중(IN_USE - 3초 지연 완료)으로 변경한 직후 이용시간(remainingHours)을 연장(0.1초 완료)하면,
  // 시간 연장 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 좌석 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 이용시간)을 덮어써 저장하여 새로고침 시
  // 좌석 상태와 상세 패널의 이용시간이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const st = dbSnapshot.seats.find(s => s.id === id);
    if (st) {
      st.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back remainingHours update!
      console.log(`[DB STATUS UPDATE] Seat ${id} status set to ${status} (3s done, rolled back remainingHours update)`);
    }
    res.json({ success: true, st });
  }, 3000);
};

export const cancelTicket = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const st = db.seats.find(s => s.id === id);
    if (st) {
      st.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL TICKET] Seat ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, st });
  }, 500);
};

export const processCheckIn = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 좌석권 취소 API(0.5초 완료)를 호출한 직후 입실 처리 API를 호출(4초 지연 완료)하면,
  // 좌석권 취소는 성공하지만 늦게 완료된 입실 처리 요청(4초 지연)이 취소된 이용권을 다시 'IN_USE'(사용중) 상태로 복원시켜버립니다.
  // 목록에서는 이용권취소(CANCELLED), 스터디카페 관제에서는 사용중(IN_USE)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const st = db.seats.find(s => s.id === id);
    if (st) {
      st.status = 'IN_USE'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to IN_USE!
      console.log(`[DB RESTORE STATUS] Re-activated seat ${id} back to IN_USE status via process check-in!`);
    }
    writeDB(db);
    res.json({ success: true, st });
  }, 4000);
};

export const forceCheckOutUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 강제퇴실 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '스터디카페 좌석 강제퇴실 처리 성공 (STUDY SEAT FORCE CHECKOUT COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] STUDY SEAT FORCE CHECKOUT COMPLETED SUCCESSFULLY for seat ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief study cafe branch manager role required for force checkout" });
  }
  const db = readDB();
  const st = db.seats.find(s => s.id === id);
  if (st) { st.status = 'CHECKED_OUT'; writeDB(db); }
  res.json({ success: true, st });
};

export const updateMemberPartial = (req, res) => {
  const { id } = req.params;
  const { memberName, phone, ticketType } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 회원 정보 수정 모달에서 이름, 연락처, 이용권종류를 동시에 수정하면,
  // backend data.json에는 이름(memberName)과 이용권종류(ticketType)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const mbr = db.members.find(m => m.id === id);
  if (mbr) {
    if (memberName) mbr.memberName = memberName;
    if (ticketType) mbr.ticketType = ticketType;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated memberName and ticketType for member ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, mbr });
};

export const deleteEntryLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.entryLogs = db.entryLogs.filter(e => e.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 입퇴실 로그를 삭제(`DELETE /api/entry-logs/:id`) 처리하여 입퇴실 로그 목록에서 소거하더라도,
  // studyStats(지점별 이용률, 좌석별 회전율, 회원별 누적 이용시간 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed entry log ${id}. studyStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-5501", name: "김좌석 (강남역 본점 매니저)", role: "MANAGER", branchName: "강남역 본점 프리미엄관", handledTickets: 710 }],
    branches: [{ id: "BRN-01", branchName: "강남역 본점 프리미엄관", address: "서울 서초구 강남대로 390", totalSeats: 120, occupiedSeats: 98, status: "OPTIMAL" }],
    members: [{ id: "MBR-4001", memberCode: "SS-20260805-01", memberName: "최공부", phone: "010-9999-3333", ticketType: "100시간 충전권 (잔여 42시간)", remainingHours: 42.5, registeredBranch: "강남역 본점 프리미엄관", joinDate: "2026-08-01" }],
    seats: [{ id: "SEAT-1001", seatNo: "A-15 (독서실형 1인 몰입석)", branchName: "강남역 본점 프리미엄관", currentMember: "최공부", remainingHours: 42.5, startTime: "2026-08-05 13:00", endTime: "2026-08-05 18:00", status: "IN_USE" }],
    tickets: [{ id: "TCK-8001", ticketCode: "TK-20260805-01", memberName: "최공부", ticketType: "100시간 충전권", branchName: "강남역 본점 프리미엄관", priceWon: 140000, status: "IN_USE" }],
    entryLogs: [{ id: "ELOG-6001", seatId: "SEAT-1001", memberName: "최공부", seatNo: "A-15", branchName: "강남역 본점", actionType: "IN (입실)", logTime: "2026-08-05 13:02", status: "SUCCESS" }],
    activityLogs: [{ id: "ACT-9950", seatId: "SEAT-1001", operator: "김좌석 (매니저)", action: "좌석 SEAT-1001 최공부 회원 입실 처리 및 키오스크 연동 완료", timestamp: "2026-08-05 13:05:00", status: "SUCCESS" }],
    studyStats: { totalSeats: 100, totalMembers: 70, totalTickets: 70, totalEntryLogs: 100, totalBranches: 10, overtimeSeatCount: 8, inUseCount: 46, avgSeatUtilization: 92.8 }
  };
  writeDB(initial);
  res.json({ success: true });
};
