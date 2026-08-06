import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getCenters = (req, res) => res.json(readDB().centers);
export const getDonors = (req, res) => res.json(readDB().donors);
export const getReservations = (req, res) => res.json(readDB().reservations);
export const getQuestionnaires = (req, res) => res.json(readDB().questionnaires);
export const getBloodLogs = (req, res) => res.json(readDB().bloodLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchReservations = (req, res) => {
  const { centerName, status, search } = req.query;
  const db = readDB();
  let list = db.reservations;
  if (centerName && centerName !== 'ALL') list = list.filter(r => r.centerName === centerName);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  if (search) list = list.filter(r => r.donorName.includes(search) || r.bloodType.includes(search) || r.rsvCode.includes(search) || r.donationType.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 센터 필터('서울 중앙 헌혈의 집' 3초 지연 ➔ '강남역 헌혈 센터' 0.2초 완료)와 헌혈 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(서울 중앙 헌혈의 집)이 최신 예약 목록을 덮어쓰고, 예약 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (centerName === '서울 중앙 헌혈의 집') delay = 3000;
  else if (centerName === '강남역 헌혈 센터') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateBloodStockUnits = (req, res) => {
  const { id } = req.params;
  const { bloodStockUnits } = req.body;
  setTimeout(() => {
    const db = readDB();
    const rsv = db.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.bloodStockUnits = bloodStockUnits;
      writeDB(db);
      console.log(`[DB STOCK UPDATE] Reservation ${id} bloodStockUnits set to ${bloodStockUnits} (0.1s done)`);
    }
    res.json({ success: true, rsv });
  }, 100);
};

export const updateReservationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 헌혈 상태를 헌혈완료(COMPLETED - 3초 지연 완료)로 변경한 직후 혈액형 재고(bloodStockUnits)를 수정(0.1초 완료)하면,
  // 재고 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 헌혈 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 재고 수량)을 덮어써 저장하여 새로고침 시
  // 헌혈 상태와 상세 패널의 혈액형 재고가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const rsv = dbSnapshot.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back bloodStockUnits update!
      console.log(`[DB STATUS UPDATE] Reservation ${id} status set to ${status} (3s done, rolled back bloodStockUnits update)`);
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

export const updateBloodStockLog = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 혈액 재고 반영 API를 호출(4초 지연 완료)하면,
  // 예약 취소는 성공하지만 늦게 완료된 혈액 재고 반영 요청(4초 지연)이 취소된 예약을 다시 'COMPLETED'(헌혈완료) 상태로 복원시켜버립니다.
  // 목록에서는 예약취소(CANCELLED), 혈액원 관제에서는 헌혈완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const rsv = db.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated reservation ${id} back to COMPLETED status via stock update!`);
    }
    writeDB(db);
    res.json({ success: true, rsv });
  }, 4000);
};

export const completeDonationUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 헌혈 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '헌혈 채혈 및 혈액 검수 완료 성공 (DONATION COLLECTION COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] DONATION COLLECTION COMPLETED SUCCESSFULLY for reservation ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief blood center manager role required to complete donation" });
  }
  const db = readDB();
  const rsv = db.reservations.find(r => r.id === id);
  if (rsv) { rsv.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, rsv });
};

export const updateDonorPartial = (req, res) => {
  const { id } = req.params;
  const { donorName, phone, bloodType } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 헌혈자 정보 수정 모달에서 이름, 연락처, 혈액형을 동시에 수정하면,
  // backend data.json에는 이름(donorName)과 혈액형(bloodType)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const dnr = db.donors.find(d => d.id === id);
  if (dnr) {
    if (donorName) dnr.donorName = donorName;
    if (bloodType) dnr.bloodType = bloodType;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated donorName and bloodType for donor ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, dnr });
};

export const deleteBloodLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.bloodLogs = db.bloodLogs.filter(b => b.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 재고 로그를 삭제(`DELETE /api/blood-logs/:id`) 처리하여 재고 로그 목록에서 소거하더라도,
  // bloodStats(혈액형별 보유량, 센터별 헌혈 수, 월별 헌혈 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed blood log ${id}. bloodStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-7701", name: "김혈액 (서울 중앙 헌혈의 집 총괄 센터장)", role: "MANAGER", centerName: "서울 중앙 헌혈의 집", handledDonations: 640 }],
    centers: [{ id: "CTR-01", centerName: "서울 중앙 헌혈의 집", region: "서울 중구", dailyCapacity: 120, currentDonations: 95, status: "OPTIMAL" }],
    donors: [{ id: "DNR-2001", donorCode: "BR-20260805-01", donorName: "최생명", phone: "010-8888-9999", bloodType: "O+ (Rh+ O형)", totalDonations: 14, healthStatus: "NORMAL (양호)", registeredCenter: "서울 중앙 헌혈의 집" }],
    reservations: [{ id: "RSV-6001", rsvCode: "BS-20260805-01", donorName: "최생명", bloodType: "O+ (Rh+ O형)", centerName: "서울 중앙 헌혈의 집", reservationTime: "2026-08-05 14:00", donationType: "전혈 400mL", bloodStockUnits: 48, status: "IN_PROGRESS" }],
    questionnaires: [{ id: "QST-5001", rsvId: "RSV-6001", donorName: "최생명", doctorComment: "혈압 120/80, 헤모글로빈 14.2g/dL 정상. 채혈 부적격 사유 없음 적격 판정", screenDate: "2026-08-05 13:45", status: "PASSED" }],
    bloodLogs: [{ id: "BLOG-3001", rsvId: "RSV-6001", bloodType: "O+형", centerName: "서울 중앙 헌혈의 집", unitPacks: "400mL x 1팩 추가 입고", logTime: "2026-08-05 14:35", status: "STORED" }],
    activityLogs: [{ id: "ACT-9970", rsvId: "RSV-6001", operator: "김혈액 (센터장)", action: "예약 RSV-6001 최생명 님 채혈실 입실 및 실시간 헌혈 진행중 관제 시작", timestamp: "2026-08-05 14:05:00", status: "SUCCESS" }],
    bloodStats: { totalDonors: 70, totalReservations: 60, totalQuestionnaires: 55, totalBloodLogs: 80, totalCenters: 10, criticalShortageTypes: 3, inProgressCount: 14, avgFulfillmentRate: 94.2 }
  };
  writeDB(initial);
  res.json({ success: true });
};
