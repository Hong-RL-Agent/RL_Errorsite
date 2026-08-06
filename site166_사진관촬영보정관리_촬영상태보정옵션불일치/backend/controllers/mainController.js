import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getCustomers = (req, res) => res.json(readDB().customers);
export const getProducts = (req, res) => res.json(readDB().products);
export const getReservations = (req, res) => res.json(readDB().reservations);
export const getRetouchTasks = (req, res) => res.json(readDB().retouchTasks);
export const getDispatchLogs = (req, res) => res.json(readDB().dispatchLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchReservations = (req, res) => {
  const { productCategory, status, search } = req.query;
  const db = readDB();
  let list = db.reservations;
  if (productCategory && productCategory !== 'ALL') list = list.filter(r => r.productCategory === productCategory);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  if (search) list = list.filter(r => r.customerName.includes(search) || r.productName.includes(search) || r.rsvCode.includes(search) || r.phone.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 상품 필터('프로필/증명사진 패키지' 3초 지연 ➔ '웨딩/웨딩스냅 패키지' 0.2초 완료)와 촬영 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(프로필/증명사진)이 최신 예약 목록을 덮어쓰고, 예약 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (productCategory === '프로필/증명사진 패키지') delay = 3000;
  else if (productCategory === '웨딩/웨딩스냅 패키지') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateRetouchOption = (req, res) => {
  const { id } = req.params;
  const { retouchOption } = req.body;
  setTimeout(() => {
    const db = readDB();
    const rsv = db.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.retouchOption = retouchOption;
      writeDB(db);
      console.log(`[DB RETOUCH OPTION UPDATE] Reservation ${id} retouchOption set to ${retouchOption} (0.1s done)`);
    }
    res.json({ success: true, rsv });
  }, 100);
};

export const updateReservationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 촬영 상태를 촬영완료(SHOT_COMPLETED - 3초 지연 완료)로 변경한 직후 보정 옵션(retouchOption)을 수정(0.1초 완료)하면,
  // 옵션 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 촬영 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 보정 옵션)을 덮어써 저장하여 새로고침 시
  // 촬영 상태와 상세 패널의 보정 옵션이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const rsv = dbSnapshot.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back retouchOption update!
      console.log(`[DB STATUS UPDATE] Reservation ${id} status set to ${status} (3s done, rolled back retouchOption update)`);
    }
    res.json({ success: true, rsv });
  }, 3000);
};

export const cancelReservation = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const rsv = db.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL RESERVATION] Reservation ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, rsv });
  }, 500);
};

export const completeDispatch = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 앨범 출고 API를 호출(4초 지연 완료)하면,
  // 예약 취소는 성공하지만 늦게 완료된 앨범 출고 요청(4초 지연)이 취소된 예약을 다시 'DELIVERED'(출고완료) 상태로 복원시켜버립니다.
  // 목록에서는 예약취소(CANCELLED), 스튜디오 관제에서는 출고완료(DELIVERED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const rsv = db.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.status = 'DELIVERED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to DELIVERED!
      console.log(`[DB RESTORE STATUS] Re-activated reservation ${id} back to DELIVERED status via album dispatch!`);
    }
    writeDB(db);
    res.json({ success: true, rsv });
  }, 4000);
};

export const completeDispatchUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 앨범 출고 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '사진관 앨범 및 액자 출고 완료 성공 (PHOTO STUDIO ALBUM DISPATCH COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] PHOTO STUDIO ALBUM DISPATCH COMPLETED SUCCESSFULLY for reservation ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Senior photo studio manager role required to dispatch album" });
  }
  const db = readDB();
  const rsv = db.reservations.find(r => r.id === id);
  if (rsv) { rsv.status = 'DELIVERED'; writeDB(db); }
  res.json({ success: true, rsv });
};

export const updateCustomerPartial = (req, res) => {
  const { id } = req.params;
  const { customerName, phone, shootConcept } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 고객 정보 수정 모달에서 이름, 연락처, 촬영컨셉을 동시에 수정하면,
  // backend data.json에는 이름(customerName)과 촬영컨셉(shootConcept)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const cst = db.customers.find(c => c.id === id);
  if (cst) {
    if (customerName) cst.customerName = customerName;
    if (shootConcept) cst.shootConcept = shootConcept;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated customerName and shootConcept for customer ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, cst });
};

export const deleteDispatchLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.dispatchLogs = db.dispatchLogs.filter(d => d.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 출고 로그를 삭제(`DELETE /api/dispatch-logs/:id`) 처리하여 로그 목록에서 소거하더라도,
  // studioStats(작업자별 처리량, 상품별 선택률, 월별 출고율 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed dispatch log ${id}. studioStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-2201", name: "김스튜디오 (본점 수석 실장)", role: "MANAGER", productCategory: "프로필/증명사진 패키지", handledShoots: 750 }],
    customers: [{ id: "CST-1001", customerCode: "PSO-20260805-01", customerName: "최스냅", phone: "010-2222-8888", shootConcept: "프리미엄 쿨톤 메이크업 프로필", totalReservations: 3, registeredDate: "2026-08-01" }],
    products: [{ id: "PRD-5001", productCode: "PSO-PRD-01", productName: "퍼스널 컬러 프리미엄 프로필 컷", productCategory: "프로필/증명사진 패키지", priceWon: 150000, status: "AVAILABLE" }],
    reservations: [{ id: "RSV-4001", rsvCode: "PSO-RSV-20260805-01", customerName: "최스냅", phone: "010-2222-8888", productName: "퍼스널 컬러 프리미엄 프로필 컷", productCategory: "프로필/증명사진 패키지", shootDate: "2026-08-05 14:00", retouchOption: "피부 톤업 & 윤곽 정밀 성형보정 (1:1 밀착)", priceWon: 150000, status: "RETOUCHING" }],
    retouchTasks: [{ id: "TASK-6001", rsvId: "RSV-4001", customerName: "최스냅", retouchOption: "피부 톤업 & 윤곽 정밀 성형보정", retoucher: "이보정", progressPercent: 85, status: "IN_PROGRESS" }],
    dispatchLogs: [{ id: "DLOG-3001", rsvId: "RSV-4001", customerName: "최스냅", itemType: "고화질 JPG 파일 이메일 전송 & 5x7 인화지 2장", dispatchTime: "2026-08-05 16:30", status: "SHIPPED" }],
    activityLogs: [{ id: "ACT-9920", rsvId: "RSV-4001", operator: "김스튜디오 (실장)", action: "예약 RSV-4001 최스냅 고객 1:1 피부 톤업 및 윤곽 정밀 보정 작업 디자이너 이보정 배정", timestamp: "2026-08-05 14:35:00", status: "SUCCESS" }],
    studioStats: { totalReservations: 60, totalCustomers: 50, totalProducts: 25, totalRetouchTasks: 70, totalDispatchLogs: 60, pendingRetouchCount: 9, shootingInProgressCount: 14, avgDispatchFulfillmentRate: 95.8 }
  };
  writeDB(initial);
  res.json({ success: true });
};
