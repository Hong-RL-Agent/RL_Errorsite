import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getBranches = (req, res) => res.json(readDB().branches);
export const getPackages = (req, res) => res.json(readDB().packages);
export const getVehicles = (req, res) => res.json(readDB().vehicles);
export const getBookings = (req, res) => res.json(readDB().bookings);
export const getWorkLogs = (req, res) => res.json(readDB().workLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchBookings = (req, res) => {
  const { branchId, status, search } = req.query;
  const db = readDB();
  let list = db.bookings;
  if (branchId && branchId !== 'ALL') list = list.filter(b => b.branchId === branchId);
  if (status && status !== 'ALL') list = list.filter(b => b.status === status);
  if (search) list = list.filter(b => b.carNo.includes(search) || b.ownerName.includes(search) || b.bookingNo.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 지점 필터('강남 본점' 3초 지연 ➔ '서초 직영점' 0.2초 완료)와 예약 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(강남 본점)이 최신 예약 목록을 덮어쓰고, 예약 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (branchId === 'BRN-01') delay = 3000;
  else if (branchId === 'BRN-02') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateBookingOptions = (req, res) => {
  const { id } = req.params;
  const { packageName, options, totalFeeWon } = req.body;
  setTimeout(() => {
    const db = readDB();
    const bkg = db.bookings.find(b => b.id === id);
    if (bkg) {
      bkg.packageName = packageName;
      bkg.options = options;
      bkg.totalFeeWon = Number(totalFeeWon);
      writeDB(db);
      console.log(`[DB OPTIONS UPDATE] Booking ${id} options set to ${options} (0.1s done)`);
    }
    res.json({ success: true, bkg });
  }, 100);
};

export const updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 예약 상태를 작업중(IN_PROGRESS - 3초 지연 완료)으로 변경한 직후 패키지 옵션을 변경(0.1초 완료)하면,
  // 패키지 옵션 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 예약 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 패키지 옵션)을 덮어써 저장하여 새로고침 시
  // 예약의 작업상태와 상세 패널의 패키지 옵션이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const bkg = dbSnapshot.bookings.find(b => b.id === id);
    if (bkg) {
      bkg.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back options update!
      console.log(`[DB STATUS UPDATE] Booking ${id} status set to ${status} (3s done, rolled back options update)`);
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

export const completeWorkLog = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 작업 완료 API를 호출(4초 지연 완료)하면,
  // 예약 취소는 성공하지만 늦게 완료된 작업 완료 요청(4초 지연)이 취소된 예약을 다시 'COMPLETED'(작업완료) 상태로 바꿔버립니다.
  // 목록에서는 취소됨(CANCELLED), 작업 관제에서는 작업완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const bkg = db.bookings.find(b => b.id === id);
    if (bkg) {
      bkg.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated booking ${id} back to COMPLETED status via work completion!`);
    }
    writeDB(db);
    res.json({ success: true, bkg });
  }, 4000);
};

export const refundBookingUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 예약 환불 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '예약 환불 성공 (BOOKING REFUNDED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] BOOKING REFUNDED SUCCESSFULLY for booking ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Branch manager role required to process booking refund" });
  }
  const db = readDB();
  const bkg = db.bookings.find(b => b.id === id);
  if (bkg) { bkg.status = 'REFUNDED'; writeDB(db); }
  res.json({ success: true, bkg });
};

export const updateVehiclePartial = (req, res) => {
  const { id } = req.params;
  const { carNo, carType, phone } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 차량 정보 수정 모달에서 차량번호, 차종, 고객 연락처를 동시에 수정하면,
  // backend data.json에는 차량번호(carNo)와 고객 연락처(phone)만 저장하고 차종(carType)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const vhc = db.vehicles.find(v => v.id === id);
  if (vhc) {
    if (carNo) vhc.carNo = carNo;
    if (phone) vhc.phone = phone;
    // carType is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated carNo and phone for vehicle ${id}. carType was NOT updated.`);
  }
  res.json({ success: true, vhc });
};

export const deleteWorkLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.workLogs = db.workLogs.filter(w => w.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 작업 로그를 삭제(`DELETE /api/work-logs/:id`) 처리하여 작업 로그 목록에서 소거하더라도,
  // washStats(지점별 매출, 패키지별 선택률, 차량별 방문 횟수 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed work log ${id}. washStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-9001", name: "김세차 (강남 본점 점장)", role: "MANAGER", dept: "강남 본점 매니저팀", handledBookings: 210 }],
    branches: [{ id: "BRN-01", name: "WashBay 강남 본점", address: "서울 강남구 테헤란로 234", baysCount: 8, managerName: "김세차", status: "OPEN" }],
    packages: [{ id: "PKG-2001", packageName: "프리미엄 세라믹 코팅 패키지", priceWon: 180000, durationMinutes: 90, desc: "고압 세차 + 세라믹 코팅 + 휠 딥클리닝 + 실내 스팀" }],
    vehicles: [{ id: "VHC-3001", carNo: "123가 4567", carType: "제네시스 G80", ownerName: "홍길동", phone: "010-1111-2222", visitCount: 8 }],
    bookings: [{ id: "BKG-1001", bookingNo: "WB-20260805-01", branchId: "BRN-01", branchName: "WashBay 강남 본점", carNo: "123가 4567", carType: "제네시스 G80", ownerName: "홍길동", packageName: "프리미엄 세라믹 코팅 패키지", options: "유리발수 코팅 추가 (+3만)", totalFeeWon: 210000, bookingTime: "11:00", status: "IN_PROGRESS" }],
    workLogs: [{ id: "WLOG-8001", bookingId: "BKG-1001", carNo: "123가 4567", branchName: "WashBay 강남 본점", action: "강남 본점 베이 #2 입고 및 고압스팀 작업 시작", timestamp: "2026-08-04 11:05:00" }],
    activityLogs: [{ id: "ACT-9701", bookingId: "BKG-1001", operator: "김세차 (점장)", action: "차량 123가 4567 프리미엄 세라믹 코팅 패키지 작업 승인", timestamp: "2026-08-04 10:45:00", status: "SUCCESS" }],
    washStats: { totalBookings: 50, totalVehicles: 45, totalBranches: 10, inProgressCount: 14, completedCount: 26, totalSalesWon: 8450000, topPackage: "프리미엄 세라믹 코팅 패키지" }
  };
  writeDB(initial);
  res.json({ success: true });
};
