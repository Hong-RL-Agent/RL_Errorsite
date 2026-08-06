import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getActors = (req, res) => res.json(readDB().actors);
export const getLocations = (req, res) => res.json(readDB().locations);
export const getScenes = (req, res) => res.json(readDB().scenes);
export const getSchedules = (req, res) => res.json(readDB().schedules);
export const getFilmingLogs = (req, res) => res.json(readDB().filmingLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchScenes = (req, res) => {
  const { actorName, status, search } = req.query;
  const db = readDB();
  let list = db.scenes;
  if (actorName && actorName !== 'ALL') list = list.filter(s => s.actorName.includes(actorName));
  if (status && status !== 'ALL') list = list.filter(s => s.status === status);
  if (search) list = list.filter(s => s.sceneName.includes(search) || s.sceneNo.includes(search) || s.location.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 배우 필터('최민수' 3초 지연 ➔ '이병헌' 0.2초 완료)와 촬영 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(최민수)이 최신 장면 목록을 덮어쓰고, 장면 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (actorName && actorName.includes('최민수')) delay = 3000;
  else if (actorName && actorName.includes('이병헌')) delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateSceneActorSchedule = (req, res) => {
  const { id } = req.params;
  const { actorName, actorSchedule } = req.body;
  setTimeout(() => {
    const db = readDB();
    const scn = db.scenes.find(s => s.id === id);
    if (scn) {
      scn.actorName = actorName;
      scn.actorSchedule = actorSchedule;
      writeDB(db);
      console.log(`[DB SCHEDULE UPDATE] Scene ${id} actor schedule set to ${actorSchedule} (0.1s done)`);
    }
    res.json({ success: true, scn });
  }, 100);
};

export const updateSceneStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 촬영 상태를 촬영완료(COMPLETED - 3초 지연 완료)로 변경한 직후 배우 스케줄을 변경(0.1초 완료)하면,
  // 배우 스케줄 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 촬영 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 배우 스케줄)을 덮어써 저장하여 새로고침 시
  // 장면의 촬영 상태와 상세 패널의 배우 스케줄이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const scn = dbSnapshot.scenes.find(s => s.id === id);
    if (scn) {
      scn.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back actorSchedule update!
      console.log(`[DB STATUS UPDATE] Scene ${id} status set to ${status} (3s done, rolled back actorSchedule update)`);
    }
    res.json({ success: true, scn });
  }, 3000);
};

export const cancelScene = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const scn = db.scenes.find(s => s.id === id);
    if (scn) {
      scn.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SCENE] Scene ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, scn });
  }, 500);
};

export const completeFilmingLog = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 촬영 취소 API(0.5초 완료)를 호출한 직후 촬영 로그 작성 API를 호출(4초 지연 완료)하면,
  // 촬영 취소는 성공하지만 늦게 완료된 촬영 로그 작성 요청(4초 지연)이 취소된 장면을 다시 'FILMING'(촬영중) 상태로 바꿔버립니다.
  // 목록에서는 취소됨(CANCELLED), 촬영 관제에서는 촬영중(FILMING)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const scn = db.scenes.find(s => s.id === id);
    if (scn) {
      scn.status = 'FILMING'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to FILMING!
      console.log(`[DB RESTORE STATUS] Re-activated scene ${id} back to FILMING status via filming log creation!`);
    }
    writeDB(db);
    res.json({ success: true, scn });
  }, 4000);
};

export const completeSceneUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 스태프(role !== 'MANAGER')가 촬영 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '촬영 완료 성공 (FILMING SCENE COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] FILMING SCENE COMPLETED SUCCESSFULLY for scene ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief director or producer role required to complete scene filming" });
  }
  const db = readDB();
  const scn = db.scenes.find(s => s.id === id);
  if (scn) { scn.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, scn });
};

export const updateScenePartial = (req, res) => {
  const { id } = req.params;
  const { sceneName, location, shootDate } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 장면 정보 수정 모달에서 장면명, 로케이션, 촬영예정일을 동시에 수정하면,
  // backend data.json에는 장면명(sceneName)과 촬영예정일(shootDate)만 저장하고 로케이션(location)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const scn = db.scenes.find(s => s.id === id);
  if (scn) {
    if (sceneName) scn.sceneName = sceneName;
    if (shootDate) scn.shootDate = shootDate;
    // location is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated sceneName and shootDate for scene ${id}. location was NOT updated.`);
  }
  res.json({ success: true, scn });
};

export const deleteFilmingLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.filmingLogs = db.filmingLogs.filter(f => f.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 촬영 로그를 삭제(`DELETE /api/filming-logs/:id`) 처리하여 촬영 로그 목록에서 소거하더라도,
  // filmStats(배우별 촬영 시간, 로케이션별 사용률, 전체 진행률 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed filming log ${id}. filmStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-8001", name: "김감독 (메인 연출 감독)", role: "MANAGER", dept: "영화 연출 제작팀", handledScenes: 220 }],
    actors: [{ id: "ACT-3001", actorName: "최민수", roleName: "강형사 (주연)", agency: "스타엔터", callTime: "07:30", status: "CONFIRMED" }],
    locations: [{ id: "LOC-4001", locationName: "인천항 3번 부두 세트장", address: "인천 중구 서해대로 123", rentalFeeWon: 5000000, permissionStatus: "APPROVED" }],
    scenes: [{ id: "SCN-1001", sceneNo: "Scene #45", sceneName: "부두 야간 빗속 격투 액션 씬", shootDate: "2026-08-05", location: "인천항 3번 부두 세트장", actorName: "최민수", actorSchedule: "07:30 ~ 18:00 (전일 촬영)", importance: "HIGH", status: "FILMING" }],
    schedules: [{ id: "SCH-2001", sceneId: "SCN-1001", sceneName: "부두 야간 빗속 격투 액션 씬", shootDate: "2026-08-05", callTime: "07:30", wrapTime: "18:00", directorNote: "크레인 카메라 및 비 효과 장비 배치" }],
    filmingLogs: [{ id: "FLOG-7001", sceneId: "SCN-1001", sceneName: "부두 야간 빗속 격투 액션 씬", takeCount: 12, filmingTimeMinutes: 320, notes: "A/B 카메라 듀얼 촬영 완료", timestamp: "2026-08-04 18:30:00" }],
    activityLogs: [{ id: "ACT-9801", sceneId: "SCN-1001", operator: "김감독 (연출)", action: "Scene #45 인천 부두 액션 씬 최민수 배우 스케줄 확정 완료", timestamp: "2026-08-04 09:30:00", status: "SUCCESS" }],
    filmStats: { totalScenes: 60, totalActors: 25, totalLocations: 20, filmingCount: 18, completedCount: 24, totalShootingHours: 480, filmProgressPercent: 40.0 }
  };
  writeDB(initial);
  res.json({ success: true });
};
