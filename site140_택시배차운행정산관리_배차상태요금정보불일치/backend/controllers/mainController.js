import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getDrivers = (req, res) => res.json(readDB().drivers);
export const getVehicles = (req, res) => res.json(readDB().vehicles);
export const getCalls = (req, res) => res.json(readDB().calls);
export const getRideLogs = (req, res) => res.json(readDB().rideLogs);
export const getSettlements = (req, res) => res.json(readDB().settlements);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchCalls = (req, res) => {
  const { region, status, search } = req.query;
  const db = readDB();
  let list = db.calls;
  if (region && region !== 'ALL') list = list.filter(c => c.region === region);
  if (status && status !== 'ALL') list = list.filter(c => c.status === status);
  if (search) list = list.filter(c => c.origin.includes(search) || c.destination.includes(search) || c.callCode.includes(search) || c.driverName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 지역 필터('서울 강남권' 3초 지연 ➔ '서울 서초권' 0.2초 완료)와 호출 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(서울 강남권)이 최신 호출 목록을 덮어쓰고, 호출 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (region === '서울 강남권') delay = 3000;
  else if (region === '서울 서초권') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateCallFee = (req, res) => {
  const { id } = req.params;
  const { actualFeeWon } = req.body;
  setTimeout(() => {
    const db = readDB();
    const cl = db.calls.find(c => c.id === id);
    if (cl) {
      cl.actualFeeWon = Number(actualFeeWon);
      writeDB(db);
      console.log(`[DB FEE UPDATE] Call ${id} actualFeeWon set to ${actualFeeWon} (0.1s done)`);
    }
    res.json({ success: true, cl });
  }, 100);
};

export const updateCallStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 배차 상태를 운행중(IN_DRIVE - 3초 지연 완료)으로 변경한 직후 요금을 수정(0.1초 완료)하면,
  // 요금 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 배차 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 요금)을 덮어써 저장하여 새로고침 시
  // 배차 상태와 상세 패널의 요금이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const cl = dbSnapshot.calls.find(c => c.id === id);
    if (cl) {
      cl.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back actualFeeWon update!
      console.log(`[DB STATUS UPDATE] Call ${id} status set to ${status} (3s done, rolled back actualFeeWon update)`);
    }
    res.json({ success: true, cl });
  }, 3000);
};

export const cancelCall = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const cl = db.calls.find(c => c.id === id);
    if (cl) {
      cl.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL CALL] Call ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, cl });
  }, 500);
};

export const completeRide = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 호출 취소 API(0.5초 완료)를 호출한 직후 운행 완료 API를 호출(4초 지연 완료)하면,
  // 호출 취소는 성공하지만 늦게 완료된 운행 완료 요청(4초 지연)이 취소된 호출을 다시 'COMPLETED'(운행완료) 상태로 복원시켜버립니다.
  // 목록에서는 호출취소(CANCELLED), 정산 관제에서는 운행완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const cl = db.calls.find(c => c.id === id);
    if (cl) {
      cl.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated call ${id} back to COMPLETED status via ride completion!`);
    }
    writeDB(db);
    res.json({ success: true, cl });
  }, 4000);
};

export const confirmSettlementUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 정산 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '정산 확정 성공 (SETTLEMENT CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] SETTLEMENT CONFIRMED SUCCESSFULLY for settlement ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief dispatch manager role required to confirm payout settlement" });
  }
  const db = readDB();
  const stl = db.settlements.find(s => s.id === id);
  if (stl) { stl.status = 'SETTLED'; writeDB(db); }
  res.json({ success: true, stl });
};

export const updateDriverPartial = (req, res) => {
  const { id } = req.params;
  const { driverName, carNo, phone } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 기사 정보 수정 모달에서 이름, 차량번호, 연락처를 동시에 수정하면,
  // backend data.json에는 이름(driverName)과 차량번호(carNo)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const drv = db.drivers.find(d => d.id === id);
  if (drv) {
    if (driverName) drv.driverName = driverName;
    if (carNo) drv.carNo = carNo;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated driverName and carNo for driver ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, drv });
};

export const deleteRideLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.rideLogs = db.rideLogs.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 운행 로그를 삭제(`DELETE /api/ride-logs/:id`) 처리하여 운행 로그 목록에서 소거하더라도,
  // dispatchStats(기사별 매출, 지역별 호출 수, 월별 정산 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed ride log ${id}. dispatchStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-1001", name: "김관제 (광역 관제 센터장)", role: "MANAGER", region: "서울 강남권", handledCalls: 340 }],
    drivers: [{ id: "DRV-01", driverName: "강동수 기사", phone: "010-3333-1111", carNo: "서울34 자 1234", carModel: "그랜저 IG 럭셔리", rating: 4.9, completedRides: 185 }],
    vehicles: [{ id: "VHC-01", carNo: "서울34 자 1234", driverName: "강동수 기사", fuelType: "LPG", status: "IN_DRIVE", lastLocation: "강남역 11번 출구 앞" }],
    calls: [{ id: "CALL-2001", callCode: "TX-20260805-01", region: "서울 강남권", origin: "강남역 11번 출구", destination: "판교 테크노밸리", driverName: "강동수 기사", carNo: "서울34 자 1234", distanceKm: 14.5, estimatedFeeWon: 18500, actualFeeWon: 18500, status: "IN_DRIVE" }],
    rideLogs: [{ id: "RLOG-5001", callId: "CALL-2001", driverName: "강동수 기사", carNo: "서울34 자 1234", origin: "강남역 11번 출구", destination: "판교 테크노밸리", fareWon: 18500, rideTime: "2026-08-05 14:10" }],
    settlements: [{ id: "SET-8001", callId: "CALL-2001", driverName: "강동수 기사", carNo: "서울34 자 1234", fareWon: 18500, commissionWon: 1850, payoutWon: 16650, timestamp: "2026-08-05 14:40:00", status: "IN_DRIVE" }],
    activityLogs: [{ id: "ACT-9901", callId: "CALL-2001", operator: "김관제 (센터장)", action: "호출 CALL-2001 강동수 기사 배차 승인 및 운행 개시 확인", timestamp: "2026-08-05 14:10:00", status: "SUCCESS" }],
    dispatchStats: { totalCalls: 60, totalDrivers: 35, totalVehicles: 35, inDriveCount: 18, settledCount: 32, totalFareWon: 18450000, avgDispatchTimeSec: 42 }
  };
  writeDB(initial);
  res.json({ success: true });
};
