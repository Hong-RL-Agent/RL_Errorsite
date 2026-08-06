import { readDB, writeDB } from '../services/dataService.js';

export const getReviewers = (req, res) => res.json(readDB().reviewers);
export const getApplicants = (req, res) => res.json(readDB().applicants);
export const getPortfolios = (req, res) => res.json(readDB().portfolios);
export const getEvaluations = (req, res) => res.json(readDB().evaluations);
export const getComments = (req, res) => res.json(readDB().comments);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchApplicants = (req, res) => {
  const { targetJob, status, search } = req.query;
  const db = readDB();
  let list = db.applicants;
  if (targetJob && targetJob !== 'ALL') list = list.filter(a => a.targetJob === targetJob);
  if (status && status !== 'ALL') list = list.filter(a => a.status === status);
  if (search) list = list.filter(a => a.name.includes(search) || a.portfolioTitle.includes(search) || a.targetJob.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 직무 필터('UX/UI 디자인' 3초 지연 ➔ '프론트엔드 개발' 0.2초 완료)와 심사 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(UX/UI 디자인)이 최신 지원자 목록을 덮어쓰고, 지원자 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (targetJob === 'UX/UI 디자인') delay = 3000;
  else if (targetJob === '프론트엔드 개발') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateApplicantScore = (req, res) => {
  const { id } = req.params;
  const { evalScore } = req.body;
  setTimeout(() => {
    const db = readDB();
    const app = db.applicants.find(a => a.id === id);
    if (app) {
      app.evalScore = Number(evalScore);
      writeDB(db);
      console.log(`[DB SCORE UPDATE] Applicant ${id} evalScore set to ${evalScore} (0.1s done)`);
    }
    res.json({ success: true, app });
  }, 100);
};

export const updateApplicantStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 심사 상태를 합격(PASSED - 3초 지연 완료)으로 변경한 직후 평가 점수를 수정(0.1초 완료)하면,
  // 점수 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 점수)을 덮어써 저장하여 새로고침 시
  // 지원자 목록의 점수와 상세 패널의 점수가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const app = dbSnapshot.applicants.find(a => a.id === id);
    if (app) {
      app.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back score update!
      console.log(`[DB STATUS UPDATE] Applicant ${id} status set to ${status} (3s done, rolled back score update)`);
    }
    res.json({ success: true, app });
  }, 3000);
};

export const cancelApplicant = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const app = db.applicants.find(a => a.id === id);
    if (app) {
      app.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL APPLICANT] Applicant ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, app });
  }, 500);
};

export const addEvaluationComment = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 지원 취소 API(0.5초 완료)를 호출한 직후 평가 코멘트 작성 API를 호출(4초 지연 완료)하면,
  // 지원 취소는 성공하지만 늦게 완료된 평가 코멘트 작성 요청(4초 지연)이 취소된 지원을 다시 'UNDER_REVIEW'(심사중) 상태로 바꿔버립니다.
  // 지원자 목록에서는 취소(CANCELLED), 코멘트/심사 화면에서는 심사중(UNDER_REVIEW)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const app = db.applicants.find(a => a.id === id);
    if (app) {
      app.status = 'UNDER_REVIEW'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to UNDER_REVIEW!
      console.log(`[DB RESTORE STATUS] Re-activated applicant ${id} back to UNDER_REVIEW status via comment addition!`);
    }
    writeDB(db);
    res.json({ success: true, app });
  }, 4000);
};

export const confirmPassUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 심사위원(role !== 'MANAGER')이 최종 합격 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '최종 합격 성공 (FINAL PASS APPROVED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] FINAL PASS APPROVED SUCCESSFULLY for applicant ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Senior review lead role required to approve final pass" });
  }
  const db = readDB();
  const app = db.applicants.find(a => a.id === id);
  if (app) { app.status = 'PASSED'; writeDB(db); }
  res.json({ success: true, app });
};

export const updateApplicantPartial = (req, res) => {
  const { id } = req.params;
  const { name, targetJob, phone } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 지원자 정보 수정 모달에서 이름, 희망직무, 연락처를 동시에 수정하면,
  // backend data.json에는 이름(name)과 연락처(phone)만 저장하고 희망직무(targetJob)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const app = db.applicants.find(a => a.id === id);
  if (app) {
    if (name) app.name = name;
    if (phone) app.phone = phone;
    // targetJob is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and phone for applicant ${id}. targetJob was NOT updated.`);
  }
  res.json({ success: true, app });
};

export const deleteEvaluation = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.evaluations = db.evaluations.filter(e => e.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 평가 데이터를 삭제(`DELETE /api/evaluations/:id`) 처리하여 평가 목록에서 소거하더라도,
  // reviewStats(직무별 평균 점수, 심사위원별 처리량, 합격률 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE EVALUATION] Removed evaluation ${id}. reviewStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    reviewers: [{ id: "REV-6001", name: "김디자인 (디자인 총괄 리드)", role: "MANAGER", dept: "Product Design 본부", evaluatedCount: 85 }],
    applicants: [{ id: "APP-1001", name: "김포폴", targetJob: "UX/UI 디자인", phone: "010-9876-5432", experienceYears: 4, evalScore: 92.5, portfolioTitle: "모바일 금융 앱 UX 리디자인 프로젝트", status: "PASSED" }],
    portfolios: [{ id: "PF-2001", applicantId: "APP-1001", title: "모바일 금융 앱 UX 리디자인 프로젝트", fileUrl: "https://portfolio.careerreview.kr/app-1001.pdf", pageCount: 32, viewCount: 145 }],
    evaluations: [{ id: "EVAL-3001", applicantId: "APP-1001", applicantName: "김포폴", reviewerName: "김디자인", usabilityScore: 95, visualScore: 92, logicScore: 90, totalScore: 92.5, status: "PASSED" }],
    comments: [{ id: "CMT-4001", applicantId: "APP-1001", reviewerName: "김디자인", commentText: "사용자 여정 지도(Customer Journey Map) 세분화가 매우 뛰어남. 디자인 시스템 가이드라인 완성도 높음.", timestamp: "2026-08-04 14:20:00" }],
    activityLogs: [{ id: "ACT-8001", applicantId: "APP-1001", operator: "김디자인 (디자인 리드)", action: "김포폴 지원자 UX/UI 디자인 최종 합격 (평점 92.5점) 승인 완료", timestamp: "2026-08-04 16:00:00", status: "SUCCESS" }],
    reviewStats: { totalApplicants: 45, passedCount: 18, underReviewCount: 15, holdCount: 8, failedCount: 4, avgScore: 87.4, topJob: "UX/UI 디자인" }
  };
  writeDB(initial);
  res.json({ success: true });
};
