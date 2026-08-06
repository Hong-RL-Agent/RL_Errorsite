import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getHabitats = (req, res) => res.json(readDB().habitats);
export const getZookeepers = (req, res) => res.json(readDB().zookeepers);
export const getAnimals = (req, res) => res.json(readDB().animals);
export const getMedicalRecords = (req, res) => res.json(readDB().medicalRecords);
export const getFeedingLogs = (req, res) => res.json(readDB().feedingLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchAnimals = (req, res) => {
  const { habitatZone, status, search } = req.query;
  const db = readDB();
  let list = db.animals;
  if (habitatZone && habitatZone !== 'ALL') list = list.filter(a => a.habitatZone === habitatZone);
  if (status && status !== 'ALL') list = list.filter(a => a.status === status);
  if (search) list = list.filter(a => a.animalName.includes(search) || a.species.includes(search) || a.animalCode.includes(search) || a.zookeeperName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 사육 구역 필터('아프리카 사바나 야생사육장' 3초 지연 ➔ '열대우림 유인원 특별관' 0.2초 완료)와 진료 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(아프리카 사바나)이 최신 동물 목록을 덮어쓰고, 동물 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (habitatZone === '아프리카 사바나 야생사육장') delay = 3000;
  else if (habitatZone === '열대우림 유인원 특별관') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateAnimalHabitatZone = (req, res) => {
  const { id } = req.params;
  const { habitatZone } = req.body;
  setTimeout(() => {
    const db = readDB();
    const anm = db.animals.find(a => a.id === id);
    if (anm) {
      anm.habitatZone = habitatZone;
      writeDB(db);
      console.log(`[DB HABITAT ZONE UPDATE] Animal ${id} habitatZone set to ${habitatZone} (0.1s done)`);
    }
    res.json({ success: true, anm });
  }, 100);
};

export const updateAnimalStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 진료 상태를 치료완료(COMPLETED - 3초 지연 완료)로 변경한 직후 사육 구역(habitatZone)을 변경(0.1초 완료)하면,
  // 구역 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 진료 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 사육 구역)을 덮어써 저장하여 새로고침 시
  // 진료 상태와 상세 패널의 사육 구역이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const anm = dbSnapshot.animals.find(a => a.id === id);
    if (anm) {
      anm.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back habitatZone update!
      console.log(`[DB STATUS UPDATE] Animal ${id} status set to ${status} (3s done, rolled back habitatZone update)`);
    }
    res.json({ success: true, anm });
  }, 3000);
};

export const cancelTreatment = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const anm = db.animals.find(a => a.id === id);
    if (anm) {
      anm.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL TREATMENT] Animal ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, anm });
  }, 500);
};

export const registerFeedingLog = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 진료 취소 API(0.5초 완료)를 호출한 직후 급여 기록 등록 API를 호출(4초 지연 완료)하면,
  // 진료 취소는 성공하지만 늦게 완료된 급여 기록 등록 요청(4초 지연)이 취소된 진료를 다시 'OBSERVING'(관찰필요/관리중) 상태로 복원시켜버립니다.
  // 목록에서는 취소/퇴원(CANCELLED), 동물원 관제에서는 관찰필요(OBSERVING)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const anm = db.animals.find(a => a.id === id);
    if (anm) {
      anm.status = 'OBSERVING'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to OBSERVING!
      console.log(`[DB RESTORE STATUS] Re-activated animal ${id} back to OBSERVING status via feeding registration!`);
    }
    writeDB(db);
    res.json({ success: true, anm });
  }, 4000);
};

export const completeTreatmentUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 치료 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '동물 수의 치료 완료 성공 (ZOOCARE ANIMAL TREATMENT COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] ZOOCARE ANIMAL TREATMENT COMPLETED SUCCESSFULLY for animal ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief veterinarian role required to complete animal treatment" });
  }
  const db = readDB();
  const anm = db.animals.find(a => a.id === id);
  if (anm) { anm.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, anm });
};

export const updateAnimalPartial = (req, res) => {
  const { id } = req.params;
  const { animalName, ageYears, healthGrade } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 동물 정보 수정 모달에서 이름, 나이, 건강등급을 동시에 수정하면,
  // backend data.json에는 이름(animalName)과 건강등급(healthGrade)만 저장하고 나이(ageYears)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const anm = db.animals.find(a => a.id === id);
  if (anm) {
    if (animalName) anm.animalName = animalName;
    if (healthGrade) anm.healthGrade = healthGrade;
    // ageYears is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated animalName and healthGrade for animal ${id}. ageYears was NOT updated.`);
  }
  res.json({ success: true, anm });
};

export const deleteFeedingLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.feedingLogs = db.feedingLogs.filter(f => f.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 급여 로그를 삭제(`DELETE /api/feeding-logs/:id`) 처리하여 급여 로그 목록에서 소거하더라도,
  // zooStats(종별 급여량, 구역별 건강위험도, 사육사별 처리량 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed feeding log ${id}. zooStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-9501", name: "김사육 (야생동물 총괄 수의과 수석)", role: "MANAGER", habitatZone: "아프리카 사바나 야생사육장", handledAnimals: 580 }],
    habitats: [{ id: "HBT-01", habitatZone: "아프리카 사바나 야생사육장", capacity: 25, currentAnimals: 22, temperatureC: 26.5, status: "OPTIMAL" }],
    zookeepers: [{ id: "ZKP-4001", zookeeperName: "김사육 사육사", phone: "010-9999-7777", specialty: "맹수 및 사바나 대형포유류", assignedAnimals: 16, rating: 4.9 }],
    animals: [{ id: "ANM-3001", animalCode: "ZC-20260805-01", species: "아프리카 사자", animalName: "심바 (Simba)", ageYears: 7, habitatZone: "아프리카 사바나 야생사육장", healthGrade: "A (우수)", riskLevel: "NORMAL (안정)", zookeeperName: "김사육 사육사", admitDate: "2026-08-05", status: "IN_TREATMENT" }],
    medicalRecords: [{ id: "MED-6001", anmId: "ANM-3001", animalName: "심바 (사자)", zookeeperName: "김사육 사육사", diagnosis: "우측 후지 가벼운 염좌 및 소화기 영양제 처방", treatDate: "2026-08-05 15:00", status: "IN_TREATMENT" }],
    feedingLogs: [{ id: "FLOG-8001", anmId: "ANM-3001", animalName: "심바 (사자)", habitatZone: "아프리카 사바나 사육장", foodItem: "신선 생고기 8kg + 비타민 영양제 50g", feedTime: "2026-08-05 17:00", status: "FED" }],
    activityLogs: [{ id: "ACT-9998", anmId: "ANM-3001", operator: "김사육 (수석)", action: "동물 ANM-3001 심바 수의 진료 진행중 및 집중 사육실 관제 시작", timestamp: "2026-08-05 15:05:00", status: "SUCCESS" }],
    zooStats: { totalAnimals: 70, totalHabitats: 20, totalMedicalRecords: 65, totalFeedingLogs: 90, totalZookeepers: 25, inTreatmentCount: 8, observingCount: 18, avgHealthScore: 93.5 }
  };
  writeDB(initial);
  res.json({ success: true });
};
