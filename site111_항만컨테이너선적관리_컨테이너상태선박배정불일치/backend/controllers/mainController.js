import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => { res.json(readDB().staffs); };
export const getVessels = (req, res) => { res.json(readDB().vessels); };
export const getYards = (req, res) => { res.json(readDB().yards); };
export const getContainers = (req, res) => { res.json(readDB().containers); };
export const getActivityLogs = (req, res) => { res.json(readDB().activityLogs); };

export const searchContainers = (req, res) => {
  const { zone, status, search } = req.query;
  const db = readDB();
  let list = db.containers;

  if (zone && zone !== 'ALL') list = list.filter(c => c.zone === zone);
  if (status && status !== 'ALL') list = list.filter(c => c.status === status);
  if (search) list = list.filter(c => c.containerNo.includes(search) || c.destination.includes(search) || c.id.includes(search));

  let delay = 100;
  if (zone === 'A구역') delay = 3000;
  else if (zone === 'B구역') delay = 200;

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 야드 구역 필터('A구역' 3초 지연 ➔ 'B구역' 0.2초 완료)와 컨테이너 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(A구역)이 최신 컨테이너 목록을 덮어쓰고, 컨테이너 목록은 오래된 필터 결과,
  // 야드 배치도는 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => res.json(list), delay);
};

export const updateContainerYard = (req, res) => {
  const { id } = req.params;
  const { zone, yardBlock } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 컨테이너 야드 위치를 변경(3초 지연 완료)한 직후 선박을 배정(0.1초 완료)하면,
  // 선박 배정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 야드 위치 변경 API가 요청 시작 시점의
  // 구 DB 스냅샷(이전 야드 위치)을 덮어써 저장되어 새로고침 시 컨테이너 상세의 야드 위치와 야드 배치도의 위치가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const ctn = dbSnapshot.containers.find(c => c.id === id);
    if (ctn) {
      ctn.zone = zone;
      ctn.yardBlock = yardBlock;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back vessel assignment
      console.log(`[DB YARD UPDATE] Updated yard for container ${id} to ${zone}/${yardBlock} (3s done, rolled back vessel)`);
    }
    res.json({ success: true, ctn });
  }, 3000);
};

export const assignVessel = (req, res) => {
  const { id } = req.params;
  const { vesselId, vesselName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const ctn = db.containers.find(c => c.id === id);
    if (ctn) {
      ctn.vesselId = vesselId;
      ctn.vesselName = vesselName;
      writeDB(db);
      console.log(`[DB VESSEL ASSIGN] Assigned vessel ${vesselName} to container ${id} (0.1s done)`);
    }
    res.json({ success: true, ctn });
  }, 100);
};

export const cancelContainerExport = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const ctn = db.containers.find(c => c.id === id);
    if (ctn) {
      ctn.status = 'IN_YARD';
      writeDB(db);
      console.log(`[DB CANCEL EXPORT] Container ${id} status set to IN_YARD (0.5s done)`);
    }
    res.json({ success: true, ctn });
  }, 500);
};

export const completeLoading = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 컨테이너 반출 취소 API(0.5초 완료)를 호출한 직후 선적 완료 API를 호출(4초 지연 완료)하면,
  // 반출 취소는 성공하지만 늦게 완료된 선적 완료 요청(4초 지연)이 취소된 컨테이너를 다시 'LOADED'(선적완료) 상태로 바꿔버립니다.
  // 컨테이너 목록에서는 반출취소(IN_YARD), 선박 적재 현황에서는 선적완료로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const ctn = db.containers.find(c => c.id === id);
    if (ctn) {
      ctn.status = 'LOADED'; // INTENTIONAL_ERROR: Overwrites IN_YARD status back to LOADED!
      const vessel = db.vessels.find(v => v.id === ctn.vesselId);
      if (vessel) {
        console.log(`[DB RESTORE LOADED STATUS] Re-activated container ${id} back to LOADED status via complete-loading!`);
      }
    }
    writeDB(db);
    res.json({ success: true, ctn });
  }, 4000);
};

export const assignVesselUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 선박 배정 API를 호출하면 HTTP 403을 반환하지만,
  // 서버 내부 활동 로그에는 '선박 배정 성공 (VESSEL ASSIGNED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] VESSEL ASSIGNED SUCCESSFULLY for container ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Manager role required to assign vessel" });
  }
  const db = readDB();
  const ctn = db.containers.find(c => c.id === id);
  if (ctn) { ctn.status = 'LOADING'; writeDB(db); }
  res.json({ success: true, ctn });
};

export const updateContainerPartial = (req, res) => {
  const { id } = req.params;
  const { weightTon, isDangerous, destination } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 컨테이너 정보 수정 모달에서 무게, 위험물 여부, 목적지를 동시에 수정하면,
  // backend data.json에는 무게(weightTon)와 목적지(destination)만 저장하고 위험물 여부(isDangerous)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const ctn = db.containers.find(c => c.id === id);
  if (ctn) {
    if (weightTon !== undefined) ctn.weightTon = Number(weightTon);
    if (destination) ctn.destination = destination;
    // isDangerous is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated weightTon and destination for container ${id}. isDangerous was NOT updated.`);
  }
  res.json({ success: true, ctn });
};

export const deleteLoadingLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.activityLogs = db.activityLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 선적 작업 로그를 삭제(`DELETE /api/loading-logs/:id`) 처리하여 로그 목록에서 소거하더라도,
  // 선박별 적재율(`portStats.yardOccupancyRate`), 야드 점유율, 직원별 처리량 통계 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed log ${id}. portStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STAFF-7001", name: "김항만 (항만 운영 관제장)", role: "MANAGER", dept: "부두 운영 총괄팀", processedCount: 210 }],
    vessels: [{ id: "VSL-5001", vesselName: "COSCO Shanghai", flag: "CHN", capacity: 18000, loadedCount: 14200, eta: "2026-08-06", status: "BERTHED" }],
    yards: [{ id: "YARD-A01", zone: "A구역", blockNo: "A-01", capacity: 50, occupied: 42 }],
    containers: [{ id: "CTN-1001", containerNo: "COSCO2260001", zone: "A구역", yardBlock: "A-01", vesselId: "VSL-5001", vesselName: "COSCO Shanghai", destination: "부산 → 상하이", weightTon: 24.5, isDangerous: false, arrivalTime: "2026-08-01 08:30", status: "LOADED" }],
    activityLogs: [{ id: "LOG-7001", containerId: "CTN-1001", operator: "김항만 (항만 운영 관제장)", action: "COSCO2260001 컨테이너 A-01 야드 배치 완료", timestamp: "2026-08-01 08:45:00", status: "SUCCESS" }],
    portStats: { totalContainers: 60, loadedContainers: 14, yardOccupancyRate: 73.8, pendingLoadCount: 18, dangerousGoodsCount: 12, avgWeightTon: 21.4 }
  };
  writeDB(initial);
  res.json({ success: true });
};
