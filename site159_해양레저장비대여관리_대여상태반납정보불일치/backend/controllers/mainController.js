import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getEquipments = (req, res) => res.json(readDB().equipments);
export const getCustomers = (req, res) => res.json(readDB().customers);
export const getRentals = (req, res) => res.json(readDB().rentals);
export const getReturnLogs = (req, res) => res.json(readDB().returnLogs);
export const getSafetyLogs = (req, res) => res.json(readDB().safetyLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchRentals = (req, res) => {
  const { branchName, status, search } = req.query;
  const db = readDB();
  let list = db.rentals;
  if (branchName && branchName !== 'ALL') list = list.filter(r => r.branchName === branchName);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  if (search) list = list.filter(r => r.customerName.includes(search) || r.equipmentName.includes(search) || r.rentalCode.includes(search) || r.storageLocation.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 지점 필터('부산 해운대 마리나 센터' 3초 지연 ➔ '제주 서귀포 마리나 센터' 0.2초 완료)와 대여 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(부산 해운대 마리나)이 최신 장비 목록을 덮어쓰고, 장비 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (branchName === '부산 해운대 마리나 센터') delay = 3000;
  else if (branchName === '제주 서귀포 마리나 센터') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateRentalReturnTime = (req, res) => {
  const { id } = req.params;
  const { returnTime } = req.body;
  setTimeout(() => {
    const db = readDB();
    const rnt = db.rentals.find(r => r.id === id);
    if (rnt) {
      rnt.returnTime = returnTime;
      writeDB(db);
      console.log(`[DB RETURN TIME UPDATE] Rental ${id} returnTime set to ${returnTime} (0.1s done)`);
    }
    res.json({ success: true, rnt });
  }, 100);
};

export const updateRentalStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 대여 상태를 대여중(IN_USE - 3초 지연 완료)으로 변경한 직후 반납 예정 시간(returnTime)을 변경(0.1초 완료)하면,
  // 시간 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 대여 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 반납 예정 시간)을 덮어써 저장하여 새로고침 시
  // 대여 상태와 상세 패널의 반납 예정 시간이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const rnt = dbSnapshot.rentals.find(r => r.id === id);
    if (rnt) {
      rnt.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back returnTime update!
      console.log(`[DB STATUS UPDATE] Rental ${id} status set to ${status} (3s done, rolled back returnTime update)`);
    }
    res.json({ success: true, rnt });
  }, 3000);
};

export const cancelRental = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const rnt = db.rentals.find(r => r.id === id);
    if (rnt) {
      rnt.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL RENTAL] Rental ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, rnt });
  }, 500);
};

export const completeReturn = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 대여 취소 API(0.5초 완료)를 호출한 직후 반납 완료 API를 호출(4초 지연 완료)하면,
  // 대여 취소는 성공하지만 늦게 완료된 반납 완료 요청(4초 지연)이 취소된 대여를 다시 'COMPLETED'(반납완료) 상태로 복원시켜버립니다.
  // 목록에서는 대여취소(CANCELLED), 마리나 관제에서는 반납완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const rnt = db.rentals.find(r => r.id === id);
    if (rnt) {
      rnt.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated rental ${id} back to COMPLETED status via complete return!`);
    }
    writeDB(db);
    res.json({ success: true, rnt });
  }, 4000);
};

export const confirmDamageUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 손상 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '해양 레저 장비 손상 확정 성공 (MARINE EQUIPMENT DAMAGE CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] MARINE EQUIPMENT DAMAGE CONFIRMED SUCCESSFULLY for rental ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief marina center manager role required to confirm equipment damage" });
  }
  const db = readDB();
  const rnt = db.rentals.find(r => r.id === id);
  if (rnt) { rnt.status = 'INSPECTING'; writeDB(db); }
  res.json({ success: true, rnt });
};

export const updateEquipmentPartial = (req, res) => {
  const { id } = req.params;
  const { equipmentName, storageLocation, safetyGrade } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 장비 정보 수정 모달에서 장비명, 보관위치, 안전등급을 동시에 수정하면,
  // backend data.json에는 장비명(equipmentName)과 안전등급(safetyGrade)만 저장하고 보관위치(storageLocation)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const eqp = db.equipments.find(e => e.id === id);
  if (eqp) {
    if (equipmentName) eqp.equipmentName = equipmentName;
    if (safetyGrade) eqp.safetyGrade = safetyGrade;
    // storageLocation is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated equipmentName and safetyGrade for equipment ${id}. storageLocation was NOT updated.`);
  }
  res.json({ success: true, eqp });
};

export const deleteReturnLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.returnLogs = db.returnLogs.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 반납 점검 로그를 삭제(`DELETE /api/return-logs/:id`) 처리하여 반납 점검 로그 목록에서 소거하더라도,
  // marineStats(장비별 손상률, 지점별 이용률, 고객별 대여 횟수 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed return log ${id}. marineStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-9901", name: "김해양 (부산 해운대 마리나 총괄 지점장)", role: "MANAGER", branchName: "부산 해운대 마리나 센터", handledRentals: 510 }],
    equipments: [{ id: "EQP-5001", equipmentCode: "MR-20260805-01", equipmentName: "야마하 FX 크루저 3인승 제트스키", category: "제트스키 & 수상오토바이", branchName: "부산 해운대 마리나 센터", storageLocation: "해운대 A선착장 03번 계류장", safetyGrade: "A (최우수)", usageRate: 92.5, status: "IN_USE" }],
    customers: [{ id: "CST-8001", customerName: "최해양", phone: "010-9999-1111", safetyCert: "COMPLETED (안전교육 이수)", totalRentals: 9, preferredBranch: "부산 해운대 마리나 센터" }],
    rentals: [{ id: "RNT-7001", rentalCode: "RN-20260805-01", equipmentName: "야마하 FX 크루저 3인승 제트스키", customerName: "최해양", branchName: "부산 해운대 마리나 센터", storageLocation: "해운대 A선착장 03번 계류장", startTime: "2026-08-05 14:00", returnTime: "2026-08-05 17:00", feeWon: 180000, status: "IN_USE" }],
    returnLogs: [{ id: "RLOG-3001", rntId: "RNT-7001", equipmentName: "야마하 제트스키", customerName: "최해양", inspector: "김해양 지점장", inspectionResult: "외관 무손상, 동력 기관 양호, 구명조끼 반납 완료", returnDate: "2026-08-05 17:05", status: "PASSED" }],
    safetyLogs: [{ id: "SLOG-2001", customerName: "최해양", courseName: "해양 제트스키 안전 운항 및 파도 대처법 교육", certDate: "2026-08-05 13:30", instructor: "박안전 교관", status: "PASSED" }],
    activityLogs: [{ id: "ACT-9990", rntId: "RNT-7001", operator: "김해양 (지점장)", action: "대여 RNT-7001 최해양 님 제트스키 대여 시작 및 구명장비 안전교육 확인 완료", timestamp: "2026-08-05 14:05:00", status: "SUCCESS" }],
    marineStats: { totalEquipments: 60, totalCustomers: 50, totalRentals: 55, totalReturnLogs: 70, totalSafetyLogs: 60, delayedReturnCount: 6, inUseCount: 24, avgUtilizationRate: 88.4 }
  };
  writeDB(initial);
  res.json({ success: true });
};
