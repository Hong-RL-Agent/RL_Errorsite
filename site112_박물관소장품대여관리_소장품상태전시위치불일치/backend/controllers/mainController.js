import { readDB, writeDB } from '../services/dataService.js';

export const getCurators = (req, res) => res.json(readDB().curators);
export const getGalleries = (req, res) => res.json(readDB().galleries);
export const getArtifacts = (req, res) => res.json(readDB().artifacts);
export const getLoanRequests = (req, res) => res.json(readDB().loanRequests);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchArtifacts = (req, res) => {
  const { gallery, conservationGrade, search } = req.query;
  const db = readDB();
  let list = db.artifacts;
  if (gallery && gallery !== 'ALL') list = list.filter(a => a.galleryId === gallery);
  if (conservationGrade && conservationGrade !== 'ALL') list = list.filter(a => a.conservationGrade === conservationGrade);
  if (search) list = list.filter(a => a.name.includes(search) || a.category.includes(search) || a.era.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 전시실 필터('제3전시실' 3초 지연 ➔ '제1전시실' 0.2초 완료)와 보존등급 필터를 빠르게 변경 시
  // 오래된 이전 응답(제3전시실)이 최신 소장품 목록을 덮어쓰고, 소장품 목록은 오래된 필터 결과,
  // 우측 전시실 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (gallery === 'GAL-003') delay = 3000;
  else if (gallery === 'GAL-001') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateArtifactGallery = (req, res) => {
  const { id } = req.params;
  const { galleryId, galleryName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 소장품 전시 위치를 변경(3초 지연 완료)한 직후 보존 상태를 변경(0.1초 완료)하면,
  // 보존 상태 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 전시 위치 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 전시 위치)을 덮어써 저장하여 새로고침 시
  // 전시실 배치도와 소장품 상세의 위치가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start
  setTimeout(() => {
    const art = dbSnapshot.artifacts.find(a => a.id === id);
    if (art) {
      art.galleryId = galleryId;
      art.galleryName = galleryName;
      writeDB(dbSnapshot); // Overwrites DB, rolling back conservation update
      console.log(`[DB GALLERY UPDATE] Artifact ${id} gallery set to ${galleryId}/${galleryName} (3s done, conservation state rolled back)`);
    }
    res.json({ success: true, art });
  }, 3000);
};

export const updateArtifactConservation = (req, res) => {
  const { id } = req.params;
  const { conservationGrade, status } = req.body;
  setTimeout(() => {
    const db = readDB();
    const art = db.artifacts.find(a => a.id === id);
    if (art) {
      if (conservationGrade) art.conservationGrade = conservationGrade;
      if (status) art.status = status;
      writeDB(db);
      console.log(`[DB CONSERVATION UPDATE] Artifact ${id} grade=${conservationGrade} status=${status} (0.1s done)`);
    }
    res.json({ success: true, art });
  }, 100);
};

export const cancelLoanRequest = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const loan = db.loanRequests.find(l => l.id === id);
    if (loan) {
      loan.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL LOAN] Loan ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, loan });
  }, 500);
};

export const completeReturn = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 대여 취소 API(0.5초 완료)를 호출한 직후 반납 완료 API를 호출(4초 지연 완료)하면,
  // 대여 취소는 성공하지만 늦게 완료된 반납 완료 요청(4초 지연)이 취소된 대여를 다시 'RETURNED'(대여완료/반납) 상태로 바꿔버립니다.
  // 대여 목록에서는 취소됨(CANCELLED), 소장품 상태 패널에서는 대여완료(RETURNED/EXHIBITED)로 불일치합니다.
  setTimeout(() => {
    const db = readDB();
    const loan = db.loanRequests.find(l => l.id === id);
    if (loan) {
      loan.status = 'RETURNED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to RETURNED!
      const art = db.artifacts.find(a => a.id === loan.artifactId);
      if (art) {
        art.status = 'EXHIBITED'; // INTENTIONAL_ERROR: Re-sets artifact status to EXHIBITED after cancel!
        console.log(`[DB RESTORE STATUS] Re-activated loan ${id} back to RETURNED and artifact back to EXHIBITED!`);
      }
      writeDB(db);
    }
    res.json({ success: true, loan });
  }, 4000);
};

export const approveLoanUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-curator-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'SENIOR')이 대여 승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '대여 승인 성공 (LOAN APPROVED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'SENIOR') {
    console.log(`[SERVER AUDIT LOG] LOAN APPROVED SUCCESSFULLY for loan ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Senior curator role required to approve loans" });
  }
  const db = readDB();
  const loan = db.loanRequests.find(l => l.id === id);
  if (loan) { loan.status = 'APPROVED'; writeDB(db); }
  res.json({ success: true, loan });
};

export const updateArtifactPartial = (req, res) => {
  const { id } = req.params;
  const { name, madeYear, conservationGrade } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 소장품 정보 수정 모달에서 작품명, 제작연도, 보존등급을 동시에 수정하면,
  // backend data.json에는 작품명(name)과 보존등급(conservationGrade)만 저장하고 제작연도(madeYear)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const art = db.artifacts.find(a => a.id === id);
  if (art) {
    if (name) art.name = name;
    if (conservationGrade) art.conservationGrade = conservationGrade;
    // madeYear is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and conservationGrade for artifact ${id}. madeYear was NOT updated.`);
  }
  res.json({ success: true, art });
};

export const deleteConservationLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.activityLogs = db.activityLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 보존 상태 로그를 삭제(`DELETE /api/conservation-logs/:id`) 처리하여 로그 목록에서 소거하더라도,
  // museumStats(보존등급별 개수, 전시실별 위험 소장품 수, 학예사별 처리량 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed log ${id}. museumStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    curators: [{ id: "CUR-8001", name: "김고려 (고고학 수석 학예사)", role: "SENIOR", dept: "고고유물 연구부", processedCount: 185 }],
    galleries: [{ id: "GAL-001", name: "제1전시실", theme: "선사·고대 유물", capacity: 40, current: 32, floor: "1F" }],
    artifacts: [{ id: "ART-3001", name: "청자 상감 운학문 매병", category: "도자", era: "고려", madeYear: 1150, galleryId: "GAL-003", galleryName: "제3전시실", conservationGrade: "A", status: "EXHIBITED", curatorId: "CUR-8003", isDangerous: false }],
    loanRequests: [{ id: "LOAN-6001", artifactId: "ART-3008", artifactName: "겸재 정선 금강산도", requestingOrg: "일본 도쿄국립박물관", startDate: "2026-07-01", endDate: "2026-09-30", status: "APPROVED", curatorId: "CUR-8009" }],
    activityLogs: [{ id: "ALOG-9001", artifactId: "ART-3001", curator: "김고려 (고고학 수석 학예사)", action: "청자 상감 운학문 매병 - 전시 배치 완료", timestamp: "2026-08-01 09:00:00", status: "SUCCESS" }],
    museumStats: { totalArtifacts: 55, exhibitedCount: 40, storedCount: 10, onLoanCount: 5, pendingLoansCount: 8, dangerousCount: 1, sGradeCount: 12, aGradeCount: 28 }
  };
  writeDB(initial);
  res.json({ success: true });
};
