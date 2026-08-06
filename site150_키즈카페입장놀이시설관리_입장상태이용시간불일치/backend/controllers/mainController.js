import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getFacilities = (req, res) => res.json(readDB().facilities);
export const getGuardians = (req, res) => res.json(readDB().guardians);
export const getChildren = (req, res) => res.json(readDB().children);
export const getTickets = (req, res) => res.json(readDB().tickets);
export const getUsageLogs = (req, res) => res.json(readDB().usageLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchTickets = (req, res) => {
  const { storeName, status, search } = req.query;
  const db = readDB();
  let list = db.tickets;
  if (storeName && storeName !== 'ALL') list = list.filter(t => t.storeName === storeName);
  if (status && status !== 'ALL') list = list.filter(t => t.status === status);
  if (search) list = list.filter(t => t.childName.includes(search) || t.guardianName.includes(search) || t.ticketCode.includes(search) || t.storeName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 매장 필터('강남 본점 플래그십' 3초 지연 ➔ '잠실 롯데월드몰점' 0.2초 완료)와 입장 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(강남 본점 플래그십)이 최신 입장권 목록을 덮어쓰고, 입장권 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (storeName === '강남 본점 플래그십') delay = 3000;
  else if (storeName === '잠실 롯데월드몰점') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateTicketAllowedHours = (req, res) => {
  const { id } = req.params;
  const { allowedHours } = req.body;
  setTimeout(() => {
    const db = readDB();
    const tck = db.tickets.find(t => t.id === id);
    if (tck) {
      tck.allowedHours = allowedHours;
      tck.remainingMin += 60; // 1 hr extension
      writeDB(db);
      console.log(`[DB ALLOWED HOURS EXTENSION] Ticket ${id} allowedHours set to ${allowedHours} (0.1s done)`);
    }
    res.json({ success: true, tck });
  }, 100);
};

export const updateTicketStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 입장 상태를 이용중(IN_USE - 3초 지연 완료)으로 변경한 직후 이용시간을 연장(0.1초 완료)하면,
  // 이용시간 연장 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 입장 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 이용시간)을 덮어써 저장하여 새로고침 시
  // 입장 상태와 상세 패널의 이용시간이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const tck = dbSnapshot.tickets.find(t => t.id === id);
    if (tck) {
      tck.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back allowedHours extension!
      console.log(`[DB STATUS UPDATE] Ticket ${id} status set to ${status} (3s done, rolled back allowedHours extension)`);
    }
    res.json({ success: true, tck });
  }, 3000);
};

export const cancelTicket = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const tck = db.tickets.find(t => t.id === id);
    if (tck) {
      tck.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL TICKET] Ticket ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, tck });
  }, 500);
};

export const recordUsageLog = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 입장 취소 API(0.5초 완료)를 호출한 직후 놀이시설 이용 등록 API를 호출(4초 지연 완료)하면,
  // 입장 취소는 성공하지만 늦게 완료된 놀이시설 이용 등록 요청(4초 지연)이 취소된 입장권을 다시 'IN_USE'(이용중) 상태로 복원시켜버립니다.
  // 목록에서는 입장취소(CANCELLED), 매장 관제에서는 이용중(IN_USE)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const tck = db.tickets.find(t => t.id === id);
    if (tck) {
      tck.status = 'IN_USE'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to IN_USE!
      console.log(`[DB RESTORE STATUS] Re-activated ticket ${id} back to IN_USE status via facility usage!`);
    }
    writeDB(db);
    res.json({ success: true, tck });
  }, 4000);
};

export const forceCheckoutUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 강제퇴장 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '강제퇴장 처리 성공 (TICKET FORCE CHECKOUT COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] TICKET FORCE CHECKOUT COMPLETED SUCCESSFULLY for ticket ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief kids play manager role required for force checkout" });
  }
  const db = readDB();
  const tck = db.tickets.find(t => t.id === id);
  if (tck) { tck.status = 'CHECKED_OUT'; writeDB(db); }
  res.json({ success: true, tck });
};

export const updateGuardianPartial = (req, res) => {
  const { id } = req.params;
  const { guardianName, phone, relationship } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 보호자 정보 수정 모달에서 이름, 연락처, 아동관계를 동시에 수정하면,
  // backend data.json에는 이름(guardianName)과 아동관계(relationship)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const gdr = db.guardians.find(g => g.id === id);
  if (gdr) {
    if (guardianName) gdr.guardianName = guardianName;
    if (relationship) gdr.relationship = relationship;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated guardianName and relationship for guardian ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, gdr });
};

export const deleteUsageLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.usageLogs = db.usageLogs.filter(u => u.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 이용 로그를 삭제(`DELETE /api/usage-logs/:id`) 처리하여 이용 로그 목록에서 소거하더라도,
  // playStats(시설별 이용률, 시간대별 혼잡도, 매장별 입장 수 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed usage log ${id}. playStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-2001", name: "김키즈 (프리미엄 키즈카페 총괄 매니저)", role: "MANAGER", storeName: "강남 본점 플래그십", handledTickets: 450 }],
    facilities: [{ id: "FAC-01", facilityName: "자이언트 볼풀 & 트램펄린 파크", storeName: "강남 본점 플래그십", maxCapacity: 40, currentCount: 32, status: "IN_USE" }],
    guardians: [{ id: "GDR-01", guardianName: "박보호자", phone: "010-9999-8888", relationship: "부모 (모)", childName: "김어린이 (5세)", totalVisits: 12, rating: 4.9 }],
    children: [{ id: "CHD-01", childName: "김어린이", age: 5, guardianName: "박보호자", preferredFacility: "자이언트 볼풀 & 트램펄린" }],
    tickets: [{ id: "TCK-4001", ticketCode: "KP-20260805-01", storeName: "강남 본점 플래그십", childName: "김어린이 (5세)", guardianName: "박보호자", enterTime: "2026-08-05 14:00", allowedHours: 2, remainingMin: 45, extraFeeWon: 0, status: "IN_USE" }],
    usageLogs: [{ id: "ULOG-3001", tckId: "TCK-4001", childName: "김어린이", facilityName: "자이언트 볼풀", startTime: "2026-08-05 14:10", endTime: "2026-08-05 15:00", playMin: 50, status: "PLAYING" }],
    activityLogs: [{ id: "ACT-8901", tckId: "TCK-4001", operator: "김키즈 (매니저)", action: "입장권 TCK-4001 김어린이 2시간 기본입장 확인 및 이용중 상태 전환 완료", timestamp: "2026-08-05 14:01:00", status: "SUCCESS" }],
    playStats: { totalTickets: 60, totalChildren: 70, totalGuardians: 50, totalFacilities: 20, inUseCount: 24, overtimeCount: 8, checkedOutCount: 28, avgPlayMin: 135.5 }
  };
  writeDB(initial);
  res.json({ success: true });
};
