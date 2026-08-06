import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getZones = (req, res) => res.json(readDB().zones);
export const getVehicles = (req, res) => res.json(readDB().vehicles);
export const getWorkers = (req, res) => res.json(readDB().workers);
export const getTasks = (req, res) => res.json(readDB().tasks);
export const getSnowLogs = (req, res) => res.json(readDB().snowLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchTasks = (req, res) => {
  const { zoneName, status, search } = req.query;
  const db = readDB();
  let list = db.tasks;
  if (zoneName && zoneName !== 'ALL') list = list.filter(t => t.zoneName === zoneName);
  if (status && status !== 'ALL') list = list.filter(t => t.status === status);
  if (search) list = list.filter(t => t.vehicleNo.includes(search) || t.workerName.includes(search) || t.taskCode.includes(search) || t.currentLocation.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 구역 필터('강남권역 제설1구역 (테헤란로/강남대로)' 3초 지연 ➔ '강북권역 제설2구역 (남산소파로/소월로)' 0.2초 완료)와 작업 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(강남권역 제설1구역)이 최신 작업 목록을 덮어쓰고, 작업 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (zoneName === '강남권역 제설1구역 (테헤란로/강남대로)') delay = 3000;
  else if (zoneName === '강북권역 제설2구역 (남산소파로/소월로)') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateTaskLocation = (req, res) => {
  const { id } = req.params;
  const { currentLocation } = req.body;
  setTimeout(() => {
    const db = readDB();
    const tsk = db.tasks.find(t => t.id === id);
    if (tsk) {
      tsk.currentLocation = currentLocation;
      writeDB(db);
      console.log(`[DB LOCATION UPDATE] Task ${id} currentLocation set to ${currentLocation} (0.1s done)`);
    }
    res.json({ success: true, tsk });
  }, 100);
};

export const updateTaskStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 작업 상태를 진행중(IN_PROGRESS - 3초 지연 완료)으로 변경한 직후 차량 위치(currentLocation)를 수정(0.1초 완료)하면,
  // 위치 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 차량 위치)을 덮어써 저장하여 새로고침 시
  // 작업 상태와 상세 패널의 차량 위치가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const tsk = dbSnapshot.tasks.find(t => t.id === id);
    if (tsk) {
      tsk.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back currentLocation update!
      console.log(`[DB STATUS UPDATE] Task ${id} status set to ${status} (3s done, rolled back currentLocation update)`);
    }
    res.json({ success: true, tsk });
  }, 3000);
};

export const cancelTask = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const tsk = db.tasks.find(t => t.id === id);
    if (tsk) {
      tsk.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL TASK] Task ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, tsk });
  }, 500);
};

export const registerSaltUsage = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 작업 취소 API(0.5초 완료)를 호출한 직후 염화칼슘 사용량 등록 API를 호출(4초 지연 완료)하면,
  // 작업 취소는 성공하지만 늦게 완료된 사용량 등록 요청(4초 지연)이 취소된 작업을 다시 'COMPLETED'(작업완료) 상태로 복원시켜버립니다.
  // 목록에서는 작업취소(CANCELLED), 관제 센터에서는 작업완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const tsk = db.tasks.find(t => t.id === id);
    if (tsk) {
      tsk.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated task ${id} back to COMPLETED status via salt usage registration!`);
    }
    writeDB(db);
    res.json({ success: true, tsk });
  }, 4000);
};

export const completeTaskUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 작업 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '도시 제설 작업 완료 성공 (CITY SNOW REMOVAL TASK COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] CITY SNOW REMOVAL TASK COMPLETED SUCCESSFULLY for task ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief snow disaster control officer role required to complete task" });
  }
  const db = readDB();
  const tsk = db.tasks.find(t => t.id === id);
  if (tsk) { tsk.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, tsk });
};

export const updateVehiclePartial = (req, res) => {
  const { id } = req.params;
  const { vehicleNo, assignedZone, equipmentStatus } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 차량 정보 수정 모달에서 차량번호, 담당구역, 제설장비상태를 동시에 수정하면,
  // backend data.json에는 차량번호(vehicleNo)와 제설장비상태(equipmentStatus)만 저장하고 담당구역(assignedZone)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const vhc = db.vehicles.find(v => v.id === id);
  if (vhc) {
    if (vehicleNo) vhc.vehicleNo = vehicleNo;
    if (equipmentStatus) vhc.equipmentStatus = equipmentStatus;
    // assignedZone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated vehicleNo and equipmentStatus for vehicle ${id}. assignedZone was NOT updated.`);
  }
  res.json({ success: true, vhc });
};

export const deleteSnowLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.snowLogs = db.snowLogs.filter(s => s.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 제설 로그를 삭제(`DELETE /api/snow-logs/:id`) 처리하여 제설 로그 목록에서 소거하더라도,
  // snowStats(구역별 작업률, 차량별 운행거리, 염화칼슘 사용량 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed snow log ${id}. snowStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-9001", name: "김제설 (도시 제설 재난안전 총괄관)", role: "MANAGER", zoneName: "강남권역 제설1구역 (테헤란로/강남대로)", handledTasks: 540 }],
    zones: [{ id: "ZON-01", zoneName: "강남권역 제설1구역 (테헤란로/강남대로)", region: "강남권역", priority: "EMERGENCY (최우선)", roadLengthKm: 24.5, snowDepthCm: 8.5, status: "SALTING_NEEDED" }],
    vehicles: [{ id: "VHC-1001", vehicleNo: "서울01-제설-8801 (15톤 염화칼슘 살포차)", assignedZone: "강남권역 제설1구역 (테헤란로/강남대로)", currentLocation: "테헤란로 역삼역 사거리 (101km/h 구역)", equipmentStatus: "NORMAL (정상작동)", saltCapacityKg: 5000 }],
    workers: [{ id: "WRK-3001", workerName: "김제설 운전원", phone: "010-8888-1111", vehicleNo: "서울01-제설-8801", assignedZone: "강남권역 제설1구역", shift: "DAY (주간 08:00~20:00)" }],
    tasks: [{ id: "TSK-5001", taskCode: "SF-20260805-01", zoneName: "강남권역 제설1구역 (테헤란로/강남대로)", vehicleNo: "서울01-제설-8801 (15톤 염화칼슘 살포차)", workerName: "김제설 운전원", currentLocation: "테헤란로 역삼역 사거리 (101km/h 구역)", startTime: "2026-08-05 06:00", saltAmountKg: 1200, priority: "EMERGENCY (최우선)", status: "IN_PROGRESS" }],
    snowLogs: [{ id: "SLOG-4001", taskId: "TSK-5001", zoneName: "강남권역 제설1구역", vehicleNo: "서울01-제설-8801", workDetail: "1차 염화칼슘 1.2톤 자동 살포 및 배토판 도로 제설 작업 진행 중", logTime: "2026-08-05 06:45", status: "IN_PROGRESS" }],
    activityLogs: [{ id: "ACT-9995", taskId: "TSK-5001", operator: "김제설 (총괄관)", action: "작업 TSK-5001 강남1구역 서울01 차량 투입 및 실시간 관제 시작", timestamp: "2026-08-05 06:05:00", status: "SUCCESS" }],
    snowStats: { totalZones: 30, totalVehicles: 35, totalTasks: 60, totalSnowLogs: 90, totalWorkers: 40, delayedTaskCount: 7, inProgressCount: 22, avgClearanceRate: 91.8 }
  };
  writeDB(initial);
  res.json({ success: true });
};
