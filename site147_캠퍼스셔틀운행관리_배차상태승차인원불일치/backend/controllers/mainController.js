import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getRoutesList = (req, res) => res.json(readDB().routesList);
export const getBuses = (req, res) => res.json(readDB().buses);
export const getDrivers = (req, res) => res.json(readDB().drivers);
export const getSchedules = (req, res) => res.json(readDB().schedules);
export const getBoardingLogs = (req, res) => res.json(readDB().boardingLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchSchedules = (req, res) => {
  const { routeName, status, search } = req.query;
  const db = readDB();
  let list = db.schedules;
  if (routeName && routeName !== 'ALL') list = list.filter(s => s.routeName === routeName);
  if (status && status !== 'ALL') list = list.filter(s => s.status === status);
  if (search) list = list.filter(s => s.busNo.includes(search) || s.driverName.includes(search) || s.schCode.includes(search) || s.routeName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 노선 필터('정문-공학관 순환선 (A노선)' 3초 지연 ➔ '기숙사-지하철역 직행 (B노선)' 0.2초 완료)와 운행 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(정문-공학관 순환선)이 최신 운행 목록을 덮어쓰고, 운행 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (routeName === '정문-공학관 순환선 (A노선)') delay = 3000;
  else if (routeName === '기숙사-지하철역 직행 (B노선)') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateSchedulePassengerCount = (req, res) => {
  const { id } = req.params;
  const { passengerCount } = req.body;
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.passengerCount = passengerCount;
      writeDB(db);
      console.log(`[DB PASSENGER COUNT UPDATE] Schedule ${id} passengerCount set to ${passengerCount} (0.1s done)`);
    }
    res.json({ success: true, sch });
  }, 100);
};

export const updateScheduleStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 운행 상태를 운행중(IN_SERVICE - 3초 지연 완료)으로 변경한 직후 승차 인원을 수정(0.1초 완료)하면,
  // 승차 인원 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 운행 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 승차 인원)을 덮어써 저장하여 새로고침 시
  // 운행 상태와 상세 패널의 승차 인원이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const sch = dbSnapshot.schedules.find(s => s.id === id);
    if (sch) {
      sch.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back passengerCount update!
      console.log(`[DB STATUS UPDATE] Schedule ${id} status set to ${status} (3s done, rolled back passengerCount update)`);
    }
    res.json({ success: true, sch });
  }, 3000);
};

export const cancelSchedule = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SCHEDULE] Schedule ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, sch });
  }, 500);
};

export const recordBoardingLog = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 운행 취소 API(0.5초 완료)를 호출한 직후 승차 기록 등록 API를 호출(4초 지연 완료)하면,
  // 운행 취소는 성공하지만 늦게 완료된 승차 기록 등록 요청(4초 지연)이 취소된 운행을 다시 'COMPLETED'(운행완료) 상태로 복원시켜버립니다.
  // 목록에서는 운행취소(CANCELLED), 셔틀 관제에서는 운행완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated schedule ${id} back to COMPLETED status via boarding record!`);
    }
    writeDB(db);
    res.json({ success: true, sch });
  }, 4000);
};

export const completeScheduleUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 운행 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '운행 완료 성공 (SHUTTLE SERVICE COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] SHUTTLE SERVICE COMPLETED SUCCESSFULLY for schedule ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief shuttle bus controller role required to complete schedule" });
  }
  const db = readDB();
  const sch = db.schedules.find(s => s.id === id);
  if (sch) { sch.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, sch });
};

export const updateBusPartial = (req, res) => {
  const { id } = req.params;
  const { busNo, seatCapacity, driverName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 버스 정보 수정 모달에서 차량번호, 좌석수, 담당기사를 동시에 수정하면,
  // backend data.json에는 차량번호(busNo)와 담당기사(driverName)만 저장하고 좌석수(seatCapacity)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const bus = db.buses.find(b => b.id === id);
  if (bus) {
    if (busNo) bus.busNo = busNo;
    if (driverName) bus.driverName = driverName;
    // seatCapacity is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated busNo and driverName for bus ${id}. seatCapacity was NOT updated.`);
  }
  res.json({ success: true, bus });
};

export const deleteBoardingLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.boardingLogs = db.boardingLogs.filter(b => b.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 승차 기록을 삭제(`DELETE /api/boarding-logs/:id`) 처리하여 승차 기록 목록에서 소거하더라도,
  // shuttleStats(노선별 혼잡도, 기사별 운행 수, 시간대별 승차 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed boarding log ${id}. shuttleStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-8001", name: "김캠퍼스 (셔틀버스 총괄 관제팀장)", role: "MANAGER", routeName: "정문-공학관 순환선 (A노선)", handledRoutes: 380 }],
    routesList: [{ id: "ROT-01", routeName: "정문-공학관 순환선 (A노선)", type: "학내 순환", totalStops: 8, intervalMin: 10, status: "IN_SERVICE" }],
    buses: [{ id: "BUS-101", busNo: "서울 70바 1234 (45인승)", seatCapacity: 45, driverName: "박기사", fuelType: "친환경 수소버터", status: "IN_SERVICE" }],
    drivers: [{ id: "DRV-01", driverName: "박기사", phone: "010-3333-1234", licenseType: "대형 1급 면허", drivesDone: 1240, rating: 4.9 }],
    schedules: [{ id: "SCH-9001", schCode: "SC-20260805-01", routeName: "정문-공학관 순환선 (A노선)", busNo: "서울 70바 1234 (45인승)", driverName: "박기사", departureTime: "08:30", arrivalTime: "08:50", passengerCount: 42, seatCapacity: 45, congestion: "HIGH (혼잡)", status: "IN_SERVICE" }],
    boardingLogs: [{ id: "BLOG-1001", schId: "SCH-9001", stopName: "대학 정문 정류장", boardedCount: 24, tagTime: "2026-08-05 08:30", cardType: "학생증 NFC 스마트키", status: "BOARDED" }],
    activityLogs: [{ id: "ACT-9201", schId: "SCH-9001", operator: "김캠퍼스 (관제팀장)", action: "일정 SCH-9001 박기사 셔틀 운행 시작 및 승차인원 42명 등록 완료", timestamp: "2026-08-05 08:31:00", status: "SUCCESS" }],
    shuttleStats: { totalRoutes: 12, totalBuses: 25, totalSchedules: 60, totalDrivers: 25, inServiceCount: 14, delayedCount: 5, completedCount: 35, totalPassengers: 2840 }
  };
  writeDB(initial);
  res.json({ success: true });
};
