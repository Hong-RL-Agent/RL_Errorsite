import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getStudios = (req, res) => res.json(readDB().studios);
export const getGears = (req, res) => res.json(readDB().gears);
export const getReservations = (req, res) => res.json(readDB().reservations);
export const getRentalLogs = (req, res) => res.json(readDB().rentalLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchGears = (req, res) => {
  const { category, status, search } = req.query;
  const db = readDB();
  let list = db.gears;
  if (category && category !== 'ALL') list = list.filter(g => g.category === category);
  if (status && status !== 'ALL') list = list.filter(g => g.status === status);
  if (search) list = list.filter(g => g.gearName.includes(search) || g.location.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 장비 유형 필터('4K 시네마 카메라' 3초 지연 ➔ '지미집/크레인' 0.2초 완료)와 스튜디오 필터를 빠르게 변경 시
  // 오래된 이전 응답(4K 시네마 카메라)이 최신 장비 목록을 덮어쓰고, 장비 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (category === '4K 시네마 카메라') delay = 3000;
  else if (category === '지미집/크레인') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateGearTime = (req, res) => {
  const { id } = req.params;
  const { startTime, endTime } = req.body;
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.gearId === id);
    if (resv) {
      resv.startTime = startTime;
      resv.endTime = endTime;
      writeDB(db);
      console.log(`[DB TIME UPDATE] Gear ${id} reservation time set to ${startTime}~${endTime} (0.1s done)`);
    }
    res.json({ success: true, resv });
  }, 100);
};

export const updateGearStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 장비 대여 상태를 대여중(RENTED - 3초 지연 완료)으로 변경한 직후 스튜디오 예약 시간을 변경(0.1초 완료)하면,
  // 예약 시간 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 대여 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 예약 시간)을 덮어써 저장하여 새로고침 시
  // 장비/스튜디오 예약시간과 상세 패널의 예약시간이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const ger = dbSnapshot.gears.find(g => g.id === id);
    if (ger) {
      ger.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back reservation time update!
      console.log(`[DB STATUS UPDATE] Gear ${id} status set to ${status} (3s done, rolled back reservation time update)`);
    }
    res.json({ success: true, ger });
  }, 3000);
};

export const cancelReservation = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const ger = db.gears.find(g => g.id === id);
    if (ger) {
      ger.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL RESERVATION] Gear ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, ger });
  }, 500);
};

export const completeReturn = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 장비 반납 완료 API를 호출(4초 지연 완료)하면,
  // 예약 취소는 성공하지만 늦게 완료된 장비 반납 완료 요청(4초 지연)이 취소된 예약을 다시 'COMPLETED'(사용완료) 상태로 바꿔버립니다.
  // 장비/예약 목록에서는 취소됨(CANCELLED), 반납 관제에서는 사용완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const ger = db.gears.find(g => g.id === id);
    if (ger) {
      ger.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated gear ${id} back to COMPLETED status via return completion!`);
    }
    writeDB(db);
    res.json({ success: true, ger });
  }, 4000);
};

export const disposeGearUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 사용자(role !== 'MANAGER')가 장비 폐기 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '장비 폐기 성공 (BROADCAST GEAR DISPOSED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] BROADCAST GEAR DISPOSED SUCCESSFULLY for gear ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief technical manager role required to dispose broadcast gear" });
  }
  const db = readDB();
  const ger = db.gears.find(g => g.id === id);
  if (ger) { ger.status = 'CANCELLED'; writeDB(db); }
  res.json({ success: true, ger });
};

export const updateGearPartial = (req, res) => {
  const { id } = req.params;
  const { gearName, location, inspectionDate } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 장비 정보 수정 모달에서 장비명, 보관위치, 점검일을 동시에 수정하면,
  // backend data.json에는 장비명(gearName)과 점검일(inspectionDate)만 저장하고 보관위치(location)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const ger = db.gears.find(g => g.id === id);
  if (ger) {
    if (gearName) ger.gearName = gearName;
    if (inspectionDate) ger.inspectionDate = inspectionDate;
    // location is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated gearName and inspectionDate for gear ${id}. location was NOT updated.`);
  }
  res.json({ success: true, ger });
};

export const deleteRentalLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.rentalLogs = db.rentalLogs.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 대여 로그를 삭제(`DELETE /api/rental-logs/:id`) 처리하여 대여 로그 목록에서 소거하더라도,
  // gearStats(장비별 사용률, 스튜디오별 예약률, 사용자별 대여 횟수 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed rental log ${id}. gearStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-6001", name: "김스튜디오 (방송기술 총괄감독)", role: "MANAGER", dept: "방송 제작기술본부", handledRentals: 185 }],
    studios: [{ id: "STD-01", name: "A스튜디오 (메인 뉴스/대형제작)", floor: "3층", maxCapacity: 50, hourlyRateWon: 150000 }],
    gears: [{ id: "GER-1001", gearName: "RED V-RAPTOR 8K 시네마 카메라", category: "4K 시네마 카메라", location: "장비실 A-1", dailyFeeWon: 250000, utilizationRate: 88.5, inspectionDate: "2026-07-28", status: "RENTED" }],
    reservations: [{ id: "RES-3001", gearId: "GER-1001", gearName: "RED V-RAPTOR 8K 시네마 카메라", userName: "김PD (드라마제작국)", studioName: "A스튜디오 (메인 뉴스/대형)", reserveDate: "2026-08-05", startTime: "09:00", endTime: "18:00", status: "RENTED" }],
    rentalLogs: [{ id: "RLOG-5001", reservationId: "RES-3001", gearName: "RED V-RAPTOR 8K 시네마 카메라", userName: "김PD", checkoutTime: "2026-08-04 08:50:00", returnTime: "2026-08-04 18:10:00", checkNotes: "렌즈 줌링 정상 동작 확인" }],
    activityLogs: [{ id: "ACT-8801", reservationId: "RES-3001", operator: "김스튜디오 (총괄감독)", action: "RED 8K 시네마 카메라 A스튜디오 대여 출고 승인 완료", timestamp: "2026-08-04 08:55:00", status: "SUCCESS" }],
    gearStats: { totalGears: 50, totalStudios: 12, rentedCount: 18, reservedCount: 20, inspectingCount: 8, avgUtilizationRate: 79.4, topCategory: "4K 시네마 카메라" }
  };
  writeDB(initial);
  res.json({ success: true });
};
