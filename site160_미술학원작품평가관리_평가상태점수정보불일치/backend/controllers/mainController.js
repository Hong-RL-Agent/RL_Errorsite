import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getClasses = (req, res) => res.json(readDB().classes);
export const getStudents = (req, res) => res.json(readDB().students);
export const getArtworks = (req, res) => res.json(readDB().artworks);
export const getEvaluations = (req, res) => res.json(readDB().evaluations);
export const getFeedbacks = (req, res) => res.json(readDB().feedbacks);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchArtworks = (req, res) => {
  const { className, status, search } = req.query;
  const db = readDB();
  let list = db.artworks;
  if (className && className !== 'ALL') list = list.filter(a => a.className === className);
  if (status && status !== 'ALL') list = list.filter(a => a.status === status);
  if (search) list = list.filter(a => a.studentName.includes(search) || a.artTitle.includes(search) || a.artCode.includes(search) || a.instructorName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 반 필터('입시미술 수시집중 A반' 3초 지연 ➔ '예고입시 소묘실기 B반' 0.2초 완료)와 평가 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(입시미술 A반)이 최신 작품 목록을 덮어쓰고, 작품 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (className === '입시미술 수시집중 A반') delay = 3000;
  else if (className === '예고입시 소묘실기 B반') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateArtworkScore = (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  setTimeout(() => {
    const db = readDB();
    const art = db.artworks.find(a => a.id === id);
    if (art) {
      art.score = score;
      writeDB(db);
      console.log(`[DB SCORE UPDATE] Artwork ${id} score set to ${score} (0.1s done)`);
    }
    res.json({ success: true, art });
  }, 100);
};

export const updateArtworkStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 평가 상태를 평가완료(COMPLETED - 3초 지연 완료)로 변경한 직후 점수(score)를 수정(0.1초 완료)하면,
  // 점수 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 평가 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 점수)을 덮어써 저장하여 새로고침 시
  // 평가 상태와 상세 패널의 점수가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const art = dbSnapshot.artworks.find(a => a.id === id);
    if (art) {
      art.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back score update!
      console.log(`[DB STATUS UPDATE] Artwork ${id} status set to ${status} (3s done, rolled back score update)`);
    }
    res.json({ success: true, art });
  }, 3000);
};

export const cancelSubmission = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const art = db.artworks.find(a => a.id === id);
    if (art) {
      art.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SUBMISSION] Artwork ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, art });
  }, 500);
};

export const addFeedback = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 작품 제출 취소 API(0.5초 완료)를 호출한 직후 피드백 작성 API를 호출(4초 지연 완료)하면,
  // 작품 제출 취소는 성공하지만 늦게 완료된 피드백 작성 요청(4초 지연)이 취소된 작품을 다시 'EVALUATING'(평가중) 상태로 복원시켜버립니다.
  // 목록에서는 제출취소(CANCELLED), 학원 관제에서는 평가중(EVALUATING)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const art = db.artworks.find(a => a.id === id);
    if (art) {
      art.status = 'EVALUATING'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to EVALUATING!
      console.log(`[DB RESTORE STATUS] Re-activated artwork ${id} back to EVALUATING status via feedback addition!`);
    }
    writeDB(db);
    res.json({ success: true, art });
  }, 4000);
};

export const confirmScoreUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 강사(role !== 'MANAGER')가 점수 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '작품 실기 점수 확정 성공 (ARTWORK EVALUATION SCORE CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] ARTWORK EVALUATION SCORE CONFIRMED SUCCESSFULLY for artwork ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Senior head instructor role required to confirm artwork evaluation score" });
  }
  const db = readDB();
  const art = db.artworks.find(a => a.id === id);
  if (art) { art.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, art });
};

export const updateStudentPartial = (req, res) => {
  const { id } = req.params;
  const { studentName, className, parentContact } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 학생 정보 수정 모달에서 이름, 반, 보호자 연락처를 동시에 수정하면,
  // backend data.json에는 이름(studentName)과 보호자 연락처(parentContact)만 저장하고 반(className)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const std = db.students.find(s => s.id === id);
  if (std) {
    if (studentName) std.studentName = studentName;
    if (parentContact) std.parentContact = parentContact;
    // className is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated studentName and parentContact for student ${id}. className was NOT updated.`);
  }
  res.json({ success: true, std });
};

export const deleteFeedback = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.feedbacks = db.feedbacks.filter(f => f.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 피드백 댓글을 삭제(`DELETE /api/feedbacks/:id`) 처리하여 피드백 댓글 목록에서 소거하더라도,
  // artStats(학생별 평균점수, 강사별 평가량, 반별 제출률 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed feedback ${id}. artStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-8801", name: "김화실 (입시미술 수시집중반 총괄 전임강사)", role: "MANAGER", className: "입시미술 수시집중 A반", handledArtworks: 620 }],
    classes: [{ id: "CLS-01", className: "입시미술 수시집중 A반", instructorName: "김화실 전임강사", studentCount: 22, submittedCount: 20, avgScore: 92.4, status: "ACTIVE" }],
    students: [{ id: "STD-3001", studentCode: "AR-20260805-01", studentName: "최그림", className: "입시미술 수시집중 A반", parentContact: "010-9999-8888", targetUniv: "서울대학교 미술대학 디자인과", avgScore: 95.0, status: "ENROLLED" }],
    artworks: [{ id: "ART-7001", artCode: "AT-20260805-01", artTitle: "빛과 음영의 정밀 정물 소묘 (투명 유리병과 사과)", studentName: "최그림", className: "입시미술 수시집중 A반", instructorName: "김화실 전임강사", submitDate: "2026-08-05", score: 96, gradeCategory: "S급 (최우수)", status: "EVALUATING" }],
    evaluations: [{ id: "EVL-5001", artId: "ART-7001", artTitle: "빛과 음영의 정밀 정물 소묘", instructorName: "김화실 전임강사", evalComment: "유리 질감 표현과 빛 반사 라인이 정교함. 명암 대비 톤 조절 보완 필요", score: 96, evalDate: "2026-08-05 16:30", status: "EVALUATING" }],
    feedbacks: [{ id: "FBK-4001", artId: "ART-7001", studentName: "최그림", instructorName: "김화실 강사", comment: "선생님, 병 어두운 부분 톤 채도를 조금 더 높여서 보완하면 실기 평가 점수가 올라갈까요?", createdAt: "2026-08-05 17:00", status: "OPEN" }],
    activityLogs: [{ id: "ACT-9980", artId: "ART-7001", operator: "김화실 (전임)", action: "작품 ART-7001 최그림 학생 정물 소묘 채점 및 실시간 강사 피드백 세션 시작", timestamp: "2026-08-05 16:35:00", status: "SUCCESS" }],
    artStats: { totalStudents: 60, totalArtworks: 80, totalInstructors: 15, totalEvaluations: 70, totalFeedbacks: 100, pendingEvalCount: 9, evaluatingCount: 26, avgScoreOverall: 91.2 }
  };
  writeDB(initial);
  res.json({ success: true });
};
