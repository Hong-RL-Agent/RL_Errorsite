import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getCounselors = (req, res) => res.json(readDB().counselors);
export const getClients = (req, res) => res.json(readDB().clients);
export const getCounsels = (req, res) => res.json(readDB().counsels);
export const getFollowups = (req, res) => res.json(readDB().followups);
export const getCounselLogs = (req, res) => res.json(readDB().counselLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchCounsels = (req, res) => {
  const { counselorName, status, search } = req.query;
  const db = readDB();
  let list = db.counsels;
  if (counselorName && counselorName !== 'ALL') list = list.filter(c => c.counselorName === counselorName);
  if (status && status !== 'ALL') list = list.filter(c => c.status === status);
  if (search) list = list.filter(c => c.clientName.includes(search) || c.topic.includes(search) || c.counselCode.includes(search) || c.counselorName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 상담사 필터('김심리 수석상담사' 3초 지연 ➔ '이마음 멘탈케어관' 0.2초 완료)와 상담 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(김심리 수석상담사)이 최신 예약 목록을 덮어쓰고, 예약 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (counselorName === '김심리 수석상담사') delay = 3000;
  else if (counselorName === '이마음 멘탈케어관') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateCounselNoteText = (req, res) => {
  const { id } = req.params;
  const { noteText } = req.body;
  setTimeout(() => {
    const db = readDB();
    const cnsl = db.counsels.find(c => c.id === id);
    if (cnsl) {
      cnsl.noteText = noteText;
      writeDB(db);
      console.log(`[DB NOTE TEXT UPDATE] Counsel ${id} noteText updated (0.1s done)`);
    }
    res.json({ success: true, cnsl });
  }, 100);
};

export const updateCounselStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 상담 상태를 상담완료(COMPLETED - 3초 지연 완료)로 변경한 직후 상담 기록(noteText)을 수정(0.1초 완료)하면,
  // 상담 기록 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상담 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 상담 기록)을 덮어써 저장하여 새로고침 시
  // 상담 상태와 상세 패널의 상담 기록이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const cnsl = dbSnapshot.counsels.find(c => c.id === id);
    if (cnsl) {
      cnsl.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back noteText update!
      console.log(`[DB STATUS UPDATE] Counsel ${id} status set to ${status} (3s done, rolled back noteText update)`);
    }
    res.json({ success: true, cnsl });
  }, 3000);
};

export const cancelCounsel = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const cnsl = db.counsels.find(c => c.id === id);
    if (cnsl) {
      cnsl.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL COUNSEL] Counsel ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, cnsl });
  }, 500);
};

export const registerFollowup = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 상담 예약 취소 API(0.5초 완료)를 호출한 직후 후속 일정 등록 API를 호출(4초 지연 완료)하면,
  // 상담 예약 취소는 성공하지만 늦게 완료된 후속 일정 등록 요청(4초 지연)이 취소된 상담을 다시 'FOLLOWUP'(후속예정) 상태로 복원시켜버립니다.
  // 목록에서는 예약취소(CANCELLED), 센터 관제에서는 후속예정(FOLLOWUP)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const cnsl = db.counsels.find(c => c.id === id);
    if (cnsl) {
      cnsl.status = 'FOLLOWUP'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to FOLLOWUP!
      console.log(`[DB RESTORE STATUS] Re-activated counsel ${id} back to FOLLOWUP status via followup registration!`);
    }
    writeDB(db);
    res.json({ success: true, cnsl });
  }, 4000);
};

export const viewCounselLogUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 상담 기록 열람 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '상담 기록 열람 성공 (COUNSEL RECORD READ ACCESSED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] COUNSEL RECORD READ ACCESSED SUCCESSFULLY for counsel ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief counselor role required to view confidential counsel record" });
  }
  const db = readDB();
  const cnsl = db.counsels.find(c => c.id === id);
  res.json({ success: true, cnsl });
};

export const updateClientPartial = (req, res) => {
  const { id } = req.params;
  const { clientName, phone, topic } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 내담자 정보 수정 모달에서 이름, 연락처, 상담주제를 동시에 수정하면,
  // backend data.json에는 이름(clientName)과 상담주제(topic)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const clt = db.clients.find(c => c.id === id);
  if (clt) {
    if (clientName) clt.clientName = clientName;
    if (topic) clt.topic = topic;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated clientName and topic for client ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, clt });
};

export const deleteCounselLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.counselLogs = db.counselLogs.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 상담 기록을 삭제(`DELETE /api/counsel-logs/:id`) 처리하여 상담 기록 목록에서 소거하더라도,
  // counselStats(상담사별 처리량, 주제별 상담 수, 후속 일정 비율 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed counsel log ${id}. counselStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-7001", name: "김심리 (수석 심리상담 센터장)", role: "MANAGER", specialty: "성인 자아 탐색 & 스트레스 케어", handledCounsels: 490 }],
    counselors: [{ id: "CNS-01", counselorName: "김심리 수석상담사", phone: "010-9999-6666", license: "전문상담사 1급", assignedClients: 18, rating: 4.9 }],
    clients: [{ id: "CLT-1001", clientName: "최내담", phone: "010-5555-8888", topic: "직장 스트레스 및 자아 존중감 향상", totalSessions: 10, counselorName: "김심리 수석상담사", priority: "HIGH (중요)" }],
    counsels: [{ id: "CNSL-9001", counselCode: "CN-20260805-01", topic: "직장 스트레스 및 자아 존중감 향상", clientName: "최내담", counselorName: "김심리 수석상담사", counselDate: "2026-08-05 14:00", noteText: "자아존중감 척도 측정 완료, 긍정적 자기대화 연습 부여", priority: "HIGH (중요)", feeWon: 100000, status: "IN_COUNSEL" }],
    followups: [{ id: "FLW-8001", cnslId: "CNSL-9001", clientName: "최내담", counselorName: "김심리 수석상담사", nextDate: "2026-08-12 14:00", goal: "스트레스 자기관리 일지 작성 검토", status: "SCHEDULED" }],
    counselLogs: [{ id: "CLOG-5001", cnslId: "CNSL-9001", clientName: "최내담", counselorName: "김심리 수석상담사", sessionSummary: "상담 회차 3회차 진행. 스트레스 지수 감소 경향성 확인.", logTime: "2026-08-05 14:55", status: "RECORDED" }],
    activityLogs: [{ id: "ACT-9981", cnslId: "CNSL-9001", operator: "김심리 (센터장)", action: "상담 CNSL-9001 최내담 님 심리상담 진행중 상태 및 관제 로그 기록 완료", timestamp: "2026-08-05 14:56:00", status: "SUCCESS" }],
    counselStats: { totalCounsels: 60, totalClients: 50, totalCounselors: 20, totalCounselLogs: 80, totalFollowups: 40, todayCounselCount: 11, completedCount: 26, avgClientSatisfaction: 94.6 }
  };
  writeDB(initial);
  res.json({ success: true });
};
