import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getClassesList = (req, res) => res.json(readDB().classesList);
export const getSeats = (req, res) => res.json(readDB().seats);
export const getCustomers = (req, res) => res.json(readDB().customers);
export const getBookings = (req, res) => res.json(readDB().bookings);
export const getKitLogs = (req, res) => res.json(readDB().kitLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchBookings = (req, res) => {
  const { className, status, search } = req.query;
  const db = readDB();
  let list = db.bookings;
  if (className && className !== 'ALL') list = list.filter(b => b.className === className);
  if (status && status !== 'ALL') list = list.filter(b => b.status === status);
  if (search) list = list.filter(b => b.customerName.includes(search) || b.seatNo.includes(search) || b.bookingCode.includes(search) || b.className.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 클래스 필터('프랑스 보르도 그랑크뤼 마스터 클래스' 3초 지연 ➔ '이탈리아 토스카나 바롤로 시음반' 0.2초 완료)와 예약 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(프랑스 보르도 반)이 최신 예약 목록을 덮어쓰고, 예약 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (className === '프랑스 보르도 그랑크뤼 마스터 클래스') delay = 3000;
  else if (className === '이탈리아 토스카나 바롤로 시음반') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateBookingSeat = (req, res) => {
  const { id } = req.params;
  const { seatNo } = req.body;
  setTimeout(() => {
    const db = readDB();
    const bkg = db.bookings.find(b => b.id === id);
    if (bkg) {
      bkg.seatNo = seatNo;
      writeDB(db);
      console.log(`[DB SEAT UPDATE] Booking ${id} seatNo set to ${seatNo} (0.1s done)`);
    }
    res.json({ success: true, bkg });
  }, 100);
};

export const updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 예약 상태를 예약확정(CONFIRMED - 3초 지연 완료)으로 변경한 직후 좌석을 변경(0.1초 완료)하면,
  // 좌석 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 예약 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 좌석)을 덮어써 저장하여 새로고침 시
  // 예약 상태와 상세 패널의 좌석이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const bkg = dbSnapshot.bookings.find(b => b.id === id);
    if (bkg) {
      bkg.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back seatNo update!
      console.log(`[DB STATUS UPDATE] Booking ${id} status set to ${status} (3s done, rolled back seat update)`);
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

export const markKitReady = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 키트 준비완료 API를 호출(4초 지연 완료)하면,
  // 예약 취소는 성공하지만 늦게 완료된 키트 준비완료 요청(4초 지연)이 취소된 예약을 다시 'KIT_READY'(준비완료) 상태로 복원시켜버립니다.
  // 목록에서는 예약취소(CANCELLED), 클래스 관제에서는 준비완료(KIT_READY)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const bkg = db.bookings.find(b => b.id === id);
    if (bkg) {
      bkg.status = 'KIT_READY'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to KIT_READY!
      console.log(`[DB RESTORE STATUS] Re-activated booking ${id} back to KIT_READY status via kit preparation!`);
    }
    writeDB(db);
    res.json({ success: true, bkg });
  }, 4000);
};

export const confirmBookingUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 예약 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '예약 확정 성공 (WINE CLASS BOOKING CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] WINE CLASS BOOKING CONFIRMED SUCCESSFULLY for booking ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief sommelier role required to confirm wine class booking" });
  }
  const db = readDB();
  const bkg = db.bookings.find(b => b.id === id);
  if (bkg) { bkg.status = 'CONFIRMED'; writeDB(db); }
  res.json({ success: true, bkg });
};

export const updateCustomerPartial = (req, res) => {
  const { id } = req.params;
  const { customerName, phone, preferredWine } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 고객 정보 수정 모달에서 이름, 연락처, 선호 와인 타입을 동시에 수정하면,
  // backend data.json에는 이름(customerName)과 선호 와인 타입(preferredWine)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const cst = db.customers.find(c => c.id === id);
  if (cst) {
    if (customerName) cst.customerName = customerName;
    if (preferredWine) cst.preferredWine = preferredWine;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated customerName and preferredWine for customer ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, cst });
};

export const deleteKitLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.kitLogs = db.kitLogs.filter(k => k.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 키트 준비 로그를 삭제(`DELETE /api/kit-logs/:id`) 처리하여 키트 준비 로그 목록에서 소거하더라도,
  // wineStats(클래스별 준비율, 고객별 참석률, 월별 예약 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed kit log ${id}. wineStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-9001", name: "김소믈리에 (프리미엄 와인 클래스 총괄)", role: "MANAGER", className: "프랑스 보르도 그랑크뤼 마스터 클래스", handledBookings: 310 }],
    classesList: [{ id: "CLS-01", className: "프랑스 보르도 그랑크뤼 마스터 클래스", sommelier: "김소믈리에", priceWon: 120000, occupancyPercent: 92, status: "CONFIRMED" }],
    seats: [{ id: "SEAT-A1", seatNo: "VIP 테이블 A-1 (메인 오크관)", tableGroup: "VIP 구역", status: "OCCUPIED" }],
    customers: [{ id: "CST-01", customerName: "최와인", phone: "010-9999-1111", preferredWine: "풀바디 레드 와인 (Cabernet)", totalVisits: 14, rating: 4.9 }],
    bookings: [{ id: "BKG-3001", bookingCode: "WC-20260805-01", className: "프랑스 보르도 그랑크뤼 마스터 클래스", customerName: "최와인", seatNo: "VIP 테이블 A-1 (메인 오크관)", classDate: "2026-08-05", priceWon: 120000, kitStatus: "준비완료", status: "CONFIRMED" }],
    kitLogs: [{ id: "KLOG-4001", bkgId: "BKG-3001", className: "프랑스 보르도 마스터반", customerName: "최와인", kitItems: "보르도 잔 3종 & 크래커 치즈 핑거푸드", preparedTime: "2026-08-05 13:45", status: "READY" }],
    activityLogs: [{ id: "ACT-9101", bkgId: "BKG-3001", operator: "김소믈리에 (총괄)", action: "예약 BKG-3001 최와인 님 VIP A-1 좌석 배정 및 예약확정 처리 완료", timestamp: "2026-08-05 13:46:00", status: "SUCCESS" }],
    wineStats: { totalClasses: 30, totalBookings: 55, totalCustomers: 45, totalSeats: 80, pendingKitCount: 11, attendedCount: 32, avgOccupancyPercent: 88.6 }
  };
  writeDB(initial);
  res.json({ success: true });
};
