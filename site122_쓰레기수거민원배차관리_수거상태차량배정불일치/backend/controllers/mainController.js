import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getZones = (req, res) => res.json(readDB().zones);
export const getVehicles = (req, res) => res.json(readDB().vehicles);
export const getSchedules = (req, res) => res.json(readDB().schedules);
export const getComplaints = (req, res) => res.json(readDB().complaints);
export const getPickupLogs = (req, res) => res.json(readDB().pickupLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchSchedules = (req, res) => {
  const { zoneId, status, search } = req.query;
  const db = readDB();
  let list = db.schedules;
  if (zoneId && zoneId !== 'ALL') list = list.filter(s => s.zoneId === zoneId);
  if (status && status !== 'ALL') list = list.filter(s => s.status === status);
  if (search) list = list.filter(s => s.zoneName.includes(search) || s.vehiclePlate.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 구역 필터('ZONE-01' 3초 지연 ➔ 'ZONE-02' 0.2초 완료)와 수거 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(ZONE-01)이 최신 수거 목록을 덮어쓰고, 수거 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (zoneId === 'ZONE-01') delay = 3000;
  else if (zoneId === 'ZONE-02') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateScheduleVehicle = (req, res) => {
  const { id } = req.params;
  const { vehicleId, vehiclePlate } = req.body;
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.vehicleId = vehicleId;
      sch.vehiclePlate = vehiclePlate;
      writeDB(db);
      console.log(`[DB VEHICLE UPDATE] Schedule ${id} vehicle set to ${vehiclePlate} (0.1s done)`);
    }
    res.json({ success: true, sch });
  }, 100);
};

export const updateScheduleStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 수거 상태를 수거진행중(IN_PROGRESS - 3초 지연 완료)으로 변경한 직후 차량을 변경(0.1초 완료)하면,
  // 차량 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 차량)을 덮어써 저장하여 새로고침 시
  // 수거 일정 목록의 차량과 상세 패널의 차량이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const sch = dbSnapshot.schedules.find(s => s.id === id);
    if (sch) {
      sch.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back vehicle assignment!
      console.log(`[DB STATUS UPDATE] Schedule ${id} status set to ${status} (3s done, rolled back vehicle update)`);
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
      console.log(`[DB CANCEL SCH] Schedule ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, sch });
  }, 500);
};

export const resolveComplaint = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 수거 취소 API(0.5초 완료)를 호출한 직후 민원 처리완료 API를 호출(4초 지연 완료)하면,
  // 수거 취소는 성공하지만 늦게 완료된 민원 처리완료 요청(4초 지연)이 취소된 수거를 다시 'COMPLETED'(수거완료) 상태로 바꿔버립니다.
  // 수거 일정 목록에서는 취소됨(CANCELLED), 민원 처리에서는 수거완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated schedule ${id} back to COMPLETED status via complaint resolution!`);
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
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 수거 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '수거 완료 성공 (COLLECTION COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] COLLECTION COMPLETED SUCCESSFULLY for schedule ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Resource circulation manager role required to complete collection" });
  }
  const db = readDB();
  const sch = db.schedules.find(s => s.id === id);
  if (sch) { sch.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, sch });
};

export const updateVehiclePartial = (req, res) => {
  const { id } = req.params;
  const { plateNumber, zoneId, maintenanceStatus } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 차량 정보 수정 모달에서 차량번호, 담당구역, 정비상태를 동시에 수정하면,
  // backend data.json에는 차량번호(plateNumber)와 정비상태(maintenanceStatus)만 저장하고 담당구역(zoneId)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const vec = db.vehicles.find(v => v.id === id);
  if (vec) {
    if (plateNumber) vec.plateNumber = plateNumber;
    if (maintenanceStatus) vec.maintenanceStatus = maintenanceStatus;
    // zoneId is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated plateNumber and maintenanceStatus for vehicle ${id}. zoneId was NOT updated.`);
  }
  res.json({ success: true, vec });
};

export const deletePickupLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.pickupLogs = db.pickupLogs.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 수거 로그를 삭제(`DELETE /api/pickup-logs/:id`) 처리하여 수거 로그 목록에서 소거하더라도,
  // cleanStats(구역별 수거량, 차량별 작업량, 민원 처리율 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed pickup log ${id}. cleanStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-7001", name: "김청소 (자원순환 과장)", role: "MANAGER", dept: "청소행정과 총괄팀", handledSchedules: 140 }],
    zones: [{ id: "ZONE-01", name: "종로1가 중앙 상업구역", district: "종로구", wasteType: "생활/음식물", dailyTargetTon: 18.5 }],
    vehicles: [{ id: "VEC-1001", plateNumber: "서울 82바 1234", zoneId: "ZONE-01", zoneName: "종로1가 상업구역", capacityTon: 5.0, driverName: "강수거", maintenanceStatus: "NORMAL" }],
    schedules: [{ id: "SCH-3001", zoneId: "ZONE-01", zoneName: "종로1가 상업구역", vehicleId: "VEC-1001", vehiclePlate: "서울 82바 1234", scheduledDate: "2026-08-05", startTime: "04:00", endTime: "07:00", complaintCount: 3, status: "ASSIGNED" }],
    complaints: [{ id: "CMP-4001", scheduleId: "SCH-3001", zoneName: "종로1가 상업구역", address: "종로1가 45-2 골목 입구", content: "종량제 봉투 악취 및 골목 미수거 잔재물 처리 요청", status: "PENDING" }],
    pickupLogs: [{ id: "PLOG-5001", scheduleId: "SCH-3001", zoneName: "종로1가 상업구역", collectedTon: 4.8, timestamp: "2026-08-04 06:45:00" }],
    activityLogs: [{ id: "ACT-9001", scheduleId: "SCH-3001", operator: "김청소 (자원순환과장)", action: "종로1가 새벽 수거 차량 VEC-1001 배차 승인 완료", timestamp: "2026-08-04 17:00:00", status: "SUCCESS" }],
    cleanStats: { totalZones: 20, totalSchedules: 50, inProgressCount: 14, completedCount: 28, totalCollectedTon: 340.5, complaintResolutionRate: 92.4, topZone: "강남구" }
  };
  writeDB(initial);
  res.json({ success: true });
};
