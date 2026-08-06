import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getRooms = (req, res) => res.json(readDB().rooms);
export const getUsers = (req, res) => res.json(readDB().users);
export const getBookings = (req, res) => res.json(readDB().bookings);
export const getAccessLogs = (req, res) => res.json(readDB().accessLogs);
export const getEquipmentLogs = (req, res) => res.json(readDB().equipmentLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchBookings = (req, res) => {
  const { roomName, status, search } = req.query;
  const db = readDB();
  let list = db.bookings;
  if (roomName && roomName !== 'ALL') list = list.filter(b => b.roomName === roomName);
  if (status && status !== 'ALL') list = list.filter(b => b.status === status);
  if (search) list = list.filter(b => b.userName.includes(search) || b.teamName.includes(search) || b.bookingCode.includes(search) || b.roomName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 연습실 필터('메인 댄스홀 A (특대형)' 3초 지연 ➔ '밴드 합주실 B (음향특화)' 0.2초 완료)와 대관 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(메인 댄스홀 A)이 최신 예약 목록을 덮어쓰고, 예약 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (roomName === '메인 댄스홀 A (특대형)') delay = 3000;
  else if (roomName === '밴드 합주실 B (음향특화)') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateBookingEntryTime = (req, res) => {
  const { id } = req.params;
  const { entryTime } = req.body;
  setTimeout(() => {
    const db = readDB();
    const bkg = db.bookings.find(b => b.id === id);
    if (bkg) {
      bkg.entryTime = entryTime;
      writeDB(db);
      console.log(`[DB ENTRY TIME UPDATE] Booking ${id} entryTime set to ${entryTime} (0.1s done)`);
    }
    res.json({ success: true, bkg });
  }, 100);
};

export const updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 대관 상태를 사용중(IN_USE - 3초 지연 완료)으로 변경한 직후 출입 시간을 수정(0.1초 완료)하면,
  // 출입 시간 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 대관 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 출입 시간)을 덮어써 저장하여 새로고침 시
  // 대관 상태와 상세 패널의 출입 시간이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const bkg = dbSnapshot.bookings.find(b => b.id === id);
    if (bkg) {
      bkg.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back entryTime update!
      console.log(`[DB STATUS UPDATE] Booking ${id} status set to ${status} (3s done, rolled back entryTime update)`);
    }
    res.json({ success: true, bkg });
  }, 3000);
};

export const cancelBooking = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const bkg = db.bookings.find(b => b.id === id);
    if (bkg) {
      bkg.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL BOOKING] Booking ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, bkg });
  }, 500);
};

export const checkInBooking = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 출입 확인 API를 호출(4초 지연 완료)하면,
  // 예약 취소는 성공하지만 늦게 완료된 출입 확인 요청(4초 지연)이 취소된 예약을 다시 'IN_USE'(사용중) 상태로 복원시켜버립니다.
  // 목록에서는 취소됨(CANCELLED), 연습실 관제에서는 사용중(IN_USE)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const bkg = db.bookings.find(b => b.id === id);
    if (bkg) {
      bkg.status = 'IN_USE'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to IN_USE!
      console.log(`[DB RESTORE STATUS] Re-activated booking ${id} back to IN_USE status via checkin!`);
    }
    writeDB(db);
    res.json({ success: true, bkg });
  }, 4000);
};

export const forceCancelBookingUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 예약 강제취소 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '예약 강제취소 성공 (BOOKING FORCE CANCELLED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] BOOKING FORCE CANCELLED SUCCESSFULLY for booking ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief practice room manager role required to force cancel booking" });
  }
  const db = readDB();
  const bkg = db.bookings.find(b => b.id === id);
  if (bkg) { bkg.status = 'CANCELLED'; writeDB(db); }
  res.json({ success: true, bkg });
};

export const updateUserPartial = (req, res) => {
  const { id } = req.params;
  const { userName, phone, teamName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 이용자 정보 수정 모달에서 이름, 연락처, 소속팀을 동시에 수정하면,
  // backend data.json에는 이름(userName)과 소속팀(teamName)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const usr = db.users.find(u => u.id === id);
  if (usr) {
    if (userName) usr.userName = userName;
    if (teamName) usr.teamName = teamName;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated userName and teamName for user ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, usr });
};

export const deleteAccessLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.accessLogs = db.accessLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 출입 기록을 삭제(`DELETE /api/access-logs/:id`) 처리하여 출입 기록 목록에서 소거하더라도,
  // roomStats(연습실별 이용률, 이용자별 사용시간, 장비 사용 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed access log ${id}. roomStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-5001", name: "김대관 (공연장 대관 총괄 팀장)", role: "MANAGER", roomName: "메인 댄스홀 A (특대형)", handledBookings: 360 }],
    rooms: [{ id: "RM-101", roomName: "메인 댄스홀 A (특대형)", floor: "지하 1층", capacity: 30, hourlyRateWon: 35000, status: "IN_USE" }],
    users: [{ id: "USR-01", userName: "최아티스트", teamName: "블랙라이트 댄스 크루", phone: "010-1234-5678", totalBookings: 24, rating: 4.9 }],
    bookings: [{ id: "BKG-6001", bookingCode: "PR-20260805-01", roomName: "메인 댄스홀 A (특대형)", userName: "최아티스트", teamName: "블랙라이트 댄스 크루", bookingDate: "2026-08-05", startTime: "14:00", endTime: "18:00", totalFeeWon: 140000, entryTime: "2026-08-05 13:55", status: "IN_USE" }],
    accessLogs: [{ id: "ACC-7001", bkgId: "BKG-6001", roomName: "메인 댄스홀 A", userName: "최아티스트", entryTime: "2026-08-05 13:55", exitTime: "운행 중", authType: "스마트 QR 도어락", status: "ENTERED" }],
    equipmentLogs: [{ id: "EQP-8001", bkgId: "BKG-6001", roomName: "메인 댄스홀 A", equipmentName: "무선 마이크 4세트", feeWon: 20000, status: "IN_USE" }],
    activityLogs: [{ id: "ACT-9501", bkgId: "BKG-6001", operator: "김대관 (팀장)", action: "예약 BKG-6001 메인 댄스홀 A 출립 인증 확인 및 사용중 변경 완료", timestamp: "2026-08-05 13:56:00", status: "SUCCESS" }],
    roomStats: { totalRooms: 25, totalBookings: 55, totalUsers: 45, inUseCount: 14, completedCount: 28, totalRevenueWon: 18500000, avgUtilizationPercent: 78.4 }
  };
  writeDB(initial);
  res.json({ success: true });
};
