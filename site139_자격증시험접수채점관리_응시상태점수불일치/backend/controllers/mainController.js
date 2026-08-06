import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getSubjects = (req, res) => res.json(readDB().subjects);
export const getExamCenters = (req, res) => res.json(readDB().examCenters);
export const getExaminees = (req, res) => res.json(readDB().examinees);
export const getScores = (req, res) => res.json(readDB().scores);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchExaminees = (req, res) => {
  const { subjectName, status, search } = req.query;
  const db = readDB();
  let list = db.examinees;
  if (subjectName && subjectName !== 'ALL') list = list.filter(e => e.subjectName === subjectName);
  if (status && status !== 'ALL') list = list.filter(e => e.status === status);
  if (search) list = list.filter(e => e.name.includes(search) || e.regCode.includes(search) || e.examCenter.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 시험 과목 필터('정보처리기사 (실기)' 3초 지연 ➔ '빅데이터분석기사' 0.2초 완료)와 응시 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(정보처리기사)이 최신 응시자 목록을 덮어쓰고, 응시자 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (subjectName === '정보처리기사 (실기)') delay = 3000;
  else if (subjectName === '빅데이터분석기사') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateExamineeScore = (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  setTimeout(() => {
    const db = readDB();
    const exm = db.examinees.find(e => e.id === id);
    if (exm) {
      exm.score = Number(score);
      writeDB(db);
      console.log(`[DB SCORE UPDATE] Examinee ${id} score set to ${score} (0.1s done)`);
    }
    res.json({ success: true, exm });
  }, 100);
};

export const updateExamineeStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 응시 상태를 응시완료(COMPLETED - 3초 지연 완료)로 변경한 직후 점수를 수정(0.1초 완료)하면,
  // 점수 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 응시 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 점수)을 덮어써 저장하여 새로고침 시
  // 응시 상태와 상세 패널의 점수가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const exm = dbSnapshot.examinees.find(e => e.id === id);
    if (exm) {
      exm.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back score update!
      console.log(`[DB STATUS UPDATE] Examinee ${id} status set to ${status} (3s done, rolled back score update)`);
    }
    res.json({ success: true, exm });
  }, 3000);
};

export const cancelRegistration = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const exm = db.examinees.find(e => e.id === id);
    if (exm) {
      exm.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL REGISTRATION] Examinee ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, exm });
  }, 500);
};

export const completeScoring = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 접수 취소 API(0.5초 완료)를 호출한 직후 채점 결과 등록 API를 호출(4초 지연 완료)하면,
  // 접수 취소는 성공하지만 늦게 완료된 채점 결과 등록 요청(4초 지연)이 취소된 접수를 다시 'SCORED'(채점완료) 상태로 복원시켜버립니다.
  // 목록에서는 접수취소(CANCELLED), 채점 관제에서는 채점완료(SCORED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const exm = db.examinees.find(e => e.id === id);
    if (exm) {
      exm.status = 'SCORED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to SCORED!
      console.log(`[DB RESTORE STATUS] Re-activated examinee ${id} back to SCORED status via complete scoring!`);
    }
    writeDB(db);
    res.json({ success: true, exm });
  }, 4000);
};

export const passExamineeUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 합격 처리 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '합격 처리 성공 (EXAM PASS CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] EXAM PASS CONFIRMED SUCCESSFULLY for examinee ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief exam director role required to confirm exam pass" });
  }
  const db = readDB();
  const exm = db.examinees.find(e => e.id === id);
  if (exm) { exm.status = 'PASSED'; writeDB(db); }
  res.json({ success: true, exm });
};

export const updateExamineePartial = (req, res) => {
  const { id } = req.params;
  const { name, phone, examCenter } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 응시자 정보 수정 모달에서 이름, 연락처, 시험장을 동시에 수정하면,
  // backend data.json에는 이름(name)과 시험장(examCenter)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const exm = db.examinees.find(e => e.id === id);
  if (exm) {
    if (name) exm.name = name;
    if (examCenter) exm.examCenter = examCenter;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and examCenter for examinee ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, exm });
};

export const deleteScore = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.scores = db.scores.filter(s => s.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 채점 로그를 삭제(`DELETE /api/scores/:id`) 처리하여 채점 로그 목록에서 소거하더라도,
  // examStats(과목별 평균 점수, 시험장별 응시율, 합격률 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed score ${id}. examStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-9001", name: "김감독 (수석 자격검정 수험위원장)", role: "MANAGER", examCenter: "서울 중앙 시험장", gradedCount: 310 }],
    subjects: [{ id: "SUB-101", subjectName: "정보처리기사 (실기)", category: "IT / 국가기술자격", passScore: 60, totalRegistered: 420 }],
    examCenters: [{ id: "CTR-01", centerName: "서울 중앙 CBT 시험장 (301호)", location: "서울 용산구 청파로 100", capacity: 60, assignedCount: 58 }],
    examinees: [{ id: "EXM-3001", regCode: "CT-20260805-01", name: "홍길동", phone: "010-3333-5555", subjectName: "정보처리기사 (실기)", examCenter: "서울 중앙 CBT 시험장 (301호)", regDate: "2026-08-01", score: 85, status: "COMPLETED" }],
    scores: [{ id: "SCR-5001", exmId: "EXM-3001", name: "홍길동", subjectName: "정보처리기사 (실기)", score: 85, passResult: "합격 (PASSED)", gradedBy: "김감독 (위원장)", timestamp: "2026-08-05 16:00:00" }],
    activityLogs: [{ id: "ACT-9501", exmId: "EXM-3001", operator: "김감독 (수험위원장)", action: "응시자 홍길동 님 서울 중앙 CBT 고사장 출석 확인 및 85점 최종 채점 입력 완료", timestamp: "2026-08-05 16:05:00", status: "SUCCESS" }],
    examStats: { totalExaminees: 70, totalSubjects: 15, totalCenters: 12, completedCount: 24, passedCount: 38, failedCount: 12, avgPassRatePercent: 76.0 }
  };
  writeDB(initial);
  res.json({ success: true });
};
