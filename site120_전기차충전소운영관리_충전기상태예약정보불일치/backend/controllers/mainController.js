import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getStations = (req, res) => res.json(readDB().stations);
export const getChargers = (req, res) => res.json(readDB().chargers);
export const getReservations = (req, res) => res.json(readDB().reservations);
export const getChargeLogs = (req, res) => res.json(readDB().chargeLogs);
export const getBreakdownReports = (req, res) => res.json(readDB().breakdownReports);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchChargers = (req, res) => {
  const { stationId, status, search } = req.query;
  const db = readDB();
  let list = db.chargers;
  if (stationId && stationId !== 'ALL') list = list.filter(c => c.stationId === stationId);
  if (status && status !== 'ALL') list = list.filter(c => c.status === status);
  if (search) list = list.filter(c => c.stationName.includes(search) || c.chargerType.includes(search) || c.locationFloor.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 충전소 필터('STN-01' 3초 지연 ➔ 'STN-02' 0.2초 완료)와 충전기 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(STN-01)이 최신 충전기 목록을 덮어쓰고, 충전기 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (stationId === 'STN-01') delay = 3000;
  else if (stationId === 'STN-02') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateReservationCharger = (req, res) => {
  const { id } = req.params;
  const { chargerId } = req.body;
  setTimeout(() => {
    const db = readDB();
    const rsv = db.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.chargerId = chargerId;
      writeDB(db);
      console.log(`[DB CHARGER UPDATE] Reservation ${id} chargerId set to ${chargerId} (0.1s done)`);
    }
    res.json({ success: true, rsv });
  }, 100);
};

export const updateReservationTime = (req, res) => {
  const { id } = req.params;
  const { startTime, endTime } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 예약 시간을 변경(3초 지연 완료)한 직후 충전기를 변경(0.1초 완료)하면,
  // 충전기 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 예약 시간 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 충전기)을 덮어써 저장하여 새로고침 시
  // 예약 목록의 충전기와 상세 패널의 충전기가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const rsv = dbSnapshot.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.startTime = startTime;
      rsv.endTime = endTime;
      writeDB(dbSnapshot); // Overwrites DB, rolling back charger update!
      console.log(`[DB TIME UPDATE] Reservation ${id} time set to ${startTime}~${endTime} (3s done, rolled back charger update)`);
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
      console.log(`[DB CANCEL RSV] Reservation ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, rsv });
  }, 500);
};

export const startCharging = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 충전 시작 API를 호출(4초 지연 완료)하면,
  // 예약 취소는 성공하지만 늦게 완료된 충전 시작 요청(4초 지연)이 취소된 예약을 다시 'CHARGING'(충전중) 상태로 바꿔버립니다.
  // 예약 목록에서는 취소(CANCELLED), 충전 로그에서는 충전중(CHARGING)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const rsv = db.reservations.find(r => r.id === id);
    if (rsv) {
      rsv.status = 'CHARGING'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to CHARGING!
      const chg = db.chargers.find(c => c.id === rsv.chargerId);
      if (chg) chg.status = 'CHARGING';
      console.log(`[DB RESTORE STATUS] Re-activated reservation ${id} back to CHARGING status!`);
    }
    writeDB(db);
    res.json({ success: true, rsv });
  }, 4000);
};

export const disableChargerUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 충전기 사용중지 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '충전기 사용중지 성공 (CHARGER DISABLED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] CHARGER DISABLED SUCCESSFULLY for charger ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Infrastructure manager role required to disable charger" });
  }
  const db = readDB();
  const chg = db.chargers.find(c => c.id === id);
  if (chg) { chg.status = 'DISABLED'; writeDB(db); }
  res.json({ success: true, chg });
};

export const updateChargerPartial = (req, res) => {
  const { id } = req.params;
  const { locationFloor, maxKw, inspectMemo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 충전기 정보 수정 모달에서 위치, 충전속도, 점검메모를 동시에 수정하면,
  // backend data.json에는 위치(locationFloor)와 점검메모(inspectMemo)만 저장하고 충전속도(maxKw)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const chg = db.chargers.find(c => c.id === id);
  if (chg) {
    if (locationFloor) chg.locationFloor = locationFloor;
    if (inspectMemo) chg.inspectMemo = inspectMemo;
    // maxKw is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated locationFloor and inspectMemo for charger ${id}. maxKw was NOT updated.`);
  }
  res.json({ success: true, chg });
};

export const deleteChargeLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.chargeLogs = db.chargeLogs.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 충전 로그를 삭제(`DELETE /api/charge-logs/:id`) 처리하여 로그 목록에서 소거하더라도,
  // chargeStats(충전소별 사용량, 충전기별 고장률, 월별 전력량 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed charge log ${id}. chargeStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-5001", name: "김충전 (충전 인프라 운영총괄)", role: "MANAGER", dept: "인프라 자산운영본부", managedCount: 180 }],
    stations: [{ id: "STN-01", name: "강남 테헤란로 하이퍼 초급속 충전소", location: "서울 강남구 테헤란로 152", totalChargers: 8, operatingKw: 350 }],
    chargers: [{ id: "CHG-1001", stationId: "STN-01", stationName: "강남 테헤란로 하이퍼 초급속 충전소", chargerType: "DC콤보 초급속 350kW", maxKw: 350, locationFloor: "지하 2층 A구역 01", totalKwCharged: 14200, inspectMemo: "정기 점검 이상 없음", status: "AVAILABLE" }],
    reservations: [{ id: "RSV-3001", chargerId: "CHG-1001", stationName: "강남 테헤란로 하이퍼 초급속 충전소", carNumber: "123가 4567 (아이오닉 6)", driverName: "김전기", reserveDate: "2026-08-05", startTime: "14:00", endTime: "14:40", targetKwh: 50, status: "CONFIRMED" }],
    chargeLogs: [{ id: "CLOG-4001", chargerId: "CHG-1001", stationName: "강남 테헤란로 하이퍼 초급속 충전소", carNumber: "123가 4567", kwhUsed: 48.5, amountWon: 16975, chargeDurationMin: 32, timestamp: "2026-08-04 13:45:00" }],
    breakdownReports: [{ id: "BRK-6001", chargerId: "CHG-1004", stationName: "판교 테크노밸리 IT 허브 충전소", issueType: "화면 전원 미출력 및 커넥터 잠금장치 오류", reporter: "박스마트", reportTime: "2026-08-04 11:10:00", status: "INSPECTING" }],
    activityLogs: [{ id: "ACT-7001", chargerId: "CHG-1001", operator: "김충전 (운영총괄)", action: "STN-01 CHG-1001 초급속 충전기 출력 전력 350kW 정기 점검 승인 완료", timestamp: "2026-08-04 10:00:00", status: "SUCCESS" }],
    chargeStats: { totalStations: 15, totalChargers: 80, availableCount: 52, chargingCount: 18, brokenCount: 6, totalEnergyMwh: 4820, avgChargerUsageRate: 78.4, totalRevenueMillion: 1680 }
  };
  writeDB(initial);
  res.json({ success: true });
};
