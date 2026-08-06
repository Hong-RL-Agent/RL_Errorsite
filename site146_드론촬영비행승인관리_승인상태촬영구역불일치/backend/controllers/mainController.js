import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getZones = (req, res) => res.json(readDB().zones);
export const getDrones = (req, res) => res.json(readDB().drones);
export const getPilots = (req, res) => res.json(readDB().pilots);
export const getRequests = (req, res) => res.json(readDB().requests);
export const getFlightLogs = (req, res) => res.json(readDB().flightLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchRequests = (req, res) => {
  const { region, status, search } = req.query;
  const db = readDB();
  let list = db.requests;
  if (region && region !== 'ALL') list = list.filter(r => r.region === region);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  if (search) list = list.filter(r => r.title.includes(search) || r.zoneName.includes(search) || r.reqCode.includes(search) || r.requester.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 지역 필터('서울 강남 관제권' 3초 지연 ➔ '인천 송도 비행금지구역' 0.2초 완료)와 승인 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(서울 강남 관제권)이 최신 의뢰 목록을 덮어쓰고, 의뢰 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (region === '서울 강남 관제권') delay = 3000;
  else if (region === '인천 송도 비행금지구역') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateRequestZone = (req, res) => {
  const { id } = req.params;
  const { zoneName } = req.body;
  setTimeout(() => {
    const db = readDB();
    const reqObj = db.requests.find(r => r.id === id);
    if (reqObj) {
      reqObj.zoneName = zoneName;
      writeDB(db);
      console.log(`[DB ZONE UPDATE] Request ${id} zoneName set to ${zoneName} (0.1s done)`);
    }
    res.json({ success: true, reqObj });
  }, 100);
};

export const updateRequestStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 승인 상태를 승인완료(APPROVED - 3초 지연 완료)로 변경한 직후 촬영 구역을 변경(0.1초 완료)하면,
  // 구역 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 승인 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 촬영 구역)을 덮어써 저장하여 새로고침 시
  // 승인 상태와 상세 패널의 촬영 구역이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const reqObj = dbSnapshot.requests.find(r => r.id === id);
    if (reqObj) {
      reqObj.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back zoneName update!
      console.log(`[DB STATUS UPDATE] Request ${id} status set to ${status} (3s done, rolled back zone update)`);
    }
    res.json({ success: true, reqObj });
  }, 3000);
};

export const cancelRequest = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const reqObj = db.requests.find(r => r.id === id);
    if (reqObj) {
      reqObj.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL REQUEST] Request ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, reqObj });
  }, 500);
};

export const completeShooting = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 승인 취소 API(0.5초 완료)를 호출한 직후 촬영 완료 API를 호출(4초 지연 완료)하면,
  // 승인 취소는 성공하지만 늦게 완료된 촬영 완료 요청(4초 지연)이 취소된 의뢰를 다시 'COMPLETED'(촬영완료) 상태로 복원시켜버립니다.
  // 목록에서는 승인취소(CANCELLED), 비행 관제에서는 촬영완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const reqObj = db.requests.find(r => r.id === id);
    if (reqObj) {
      reqObj.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated request ${id} back to COMPLETED status via shooting completion!`);
    }
    writeDB(db);
    res.json({ success: true, reqObj });
  }, 4000);
};

export const approveFlightUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 비행 승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '비행 승인 성공 (FLIGHT PERMIT APPROVED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] FLIGHT PERMIT APPROVED SUCCESSFULLY for request ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief aviation controller role required to approve drone flight permit" });
  }
  const db = readDB();
  const reqObj = db.requests.find(r => r.id === id);
  if (reqObj) { reqObj.status = 'APPROVED'; writeDB(db); }
  res.json({ success: true, reqObj });
};

export const updateDronePartial = (req, res) => {
  const { id } = req.params;
  const { droneName, batteryStatus, pilotName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 드론 정보 수정 모달에서 드론명, 배터리상태, 담당조종자를 동시에 수정하면,
  // backend data.json에는 드론명(droneName)과 담당조종자(pilotName)만 저장하고 배터리상태(batteryStatus)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const drn = db.drones.find(d => d.id === id);
  if (drn) {
    if (droneName) drn.droneName = droneName;
    if (pilotName) drn.pilotName = pilotName;
    // batteryStatus is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated droneName and pilotName for drone ${id}. batteryStatus was NOT updated.`);
  }
  res.json({ success: true, drn });
};

export const deleteFlightLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.flightLogs = db.flightLogs.filter(f => f.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 비행 로그를 삭제(`DELETE /api/flight-logs/:id`) 처리하여 비행 로그 목록에서 소거하더라도,
  // flightStats(조종자별 비행시간, 지역별 승인률, 드론별 사용률 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed flight log ${id}. flightStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-7001", name: "김항공 (비행관제 총괄 승인관)", role: "MANAGER", region: "서울 강남 관제권", handledPermits: 350 }],
    zones: [{ id: "ZON-01", zoneName: "서울 강남 영동대로 건설 현장 (섹터 A)", region: "서울 강남 관제권", maxAltitudeMeter: 150, riskLevel: "RESTRICTED (제한구역)", droneLimitCount: 3 }],
    drones: [{ id: "DRN-101", droneName: "DJI Matrice 350 RTK (산업용)", serialNo: "DRN-2026-M350", pilotName: "이조종 팀장", batteryStatus: "98% (정상)", cameraType: "LiDAR + 열화상", status: "IN_FLIGHT" }],
    pilots: [{ id: "PLT-01", pilotName: "이조종 팀장", phone: "010-9876-5432", licenseNo: "DR-1급-2024-0012", flightHours: 1450, rating: 4.9 }],
    requests: [{ id: "REQ-8001", reqCode: "DP-20260805-01", title: "강남 영동대로 복합환승센터 초고층 초안 3D 측량 촬영", region: "서울 강남 관제권", zoneName: "서울 강남 영동대로 건설 현장 (섹터 A)", requester: "(주)현대건설 스마트시티팀", pilotName: "이조종 팀장", droneName: "DJI Matrice 350 RTK (산업용)", flightDate: "2026-08-05", maxAltM: 150, status: "APPROVED" }],
    flightLogs: [{ id: "FLOG-9001", reqId: "REQ-8001", droneName: "DJI Matrice 350 RTK", pilotName: "이조종 팀장", takeoffTime: "2026-08-05 14:00", landingTime: "2026-08-05 14:45", flightDurationMin: 45, maxAltM: 142, status: "COMPLETED" }],
    activityLogs: [{ id: "ACT-9301", reqId: "REQ-8001", operator: "김항공 (승인관)", action: "신청 REQ-8001 영동대로 고도 150m 비행 승인 승낙 및 이조종 팀장 드론 배정 완료", timestamp: "2026-08-05 13:50:00", status: "SUCCESS" }],
    flightStats: { totalRequests: 50, totalZones: 35, totalDrones: 25, totalPilots: 20, approvedCount: 22, inFlightCount: 12, completedCount: 26, totalFlightHours: 328.5 }
  };
  writeDB(initial);
  res.json({ success: true });
};
