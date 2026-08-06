import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getClients = (req, res) => res.json(readDB().clients);
export const getTranslators = (req, res) => res.json(readDB().translators);
export const getRequests = (req, res) => res.json(readDB().requests);
export const getReviewComments = (req, res) => res.json(readDB().reviewComments);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchRequests = (req, res) => {
  const { langPair, status, search } = req.query;
  const db = readDB();
  let list = db.requests;
  if (langPair && langPair !== 'ALL') list = list.filter(r => r.langPair === langPair);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  if (search) list = list.filter(r => r.title.includes(search) || r.clientName.includes(search) || r.reqCode.includes(search) || r.company.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 언어쌍 필터('한국어 ➔ 영어' 3초 지연 ➔ '한국어 ➔ 일본어' 0.2초 완료)와 검수 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(한국어 ➔ 영어)이 최신 의뢰 목록을 덮어쓰고, 의뢰 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (langPair === '한국어 ➔ 영어') delay = 3000;
  else if (langPair === '한국어 ➔ 일본어') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateRequestFee = (req, res) => {
  const { id } = req.params;
  const { actualFeeWon } = req.body;
  setTimeout(() => {
    const db = readDB();
    const reqObj = db.requests.find(r => r.id === id);
    if (reqObj) {
      reqObj.actualFeeWon = Number(actualFeeWon);
      writeDB(db);
      console.log(`[DB FEE UPDATE] Request ${id} actualFeeWon set to ${actualFeeWon} (0.1s done)`);
    }
    res.json({ success: true, reqObj });
  }, 100);
};

export const updateRequestStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 검수 상태를 검수완료(IN_REVIEW - 3초 지연 완료)로 변경한 직후 견적 금액을 수정(0.1초 완료)하면,
  // 견적 금액 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 검수 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 견적 금액)을 덮어써 저장하여 새로고침 시
  // 검수 상태와 상세 패널의 견적 금액이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const reqObj = dbSnapshot.requests.find(r => r.id === id);
    if (reqObj) {
      reqObj.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back actualFeeWon update!
      console.log(`[DB STATUS UPDATE] Request ${id} status set to ${status} (3s done, rolled back actualFeeWon update)`);
    }
    res.json({ success: true, reqObj });
  }, 3000);
};

export const cancelRequest = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const reqObj = db.requests.find(r => r.id === id);
    if (reqObj) {
      reqObj.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL REQUEST] Request ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, reqObj });
  }, 500);
};

export const completeDelivery = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 의뢰 취소 API(0.5초 완료)를 호출한 직후 납품 완료 API를 호출(4초 지연 완료)하면,
  // 의뢰 취소는 성공하지만 늦게 완료된 납품 완료 요청(4초 지연)이 취소된 의뢰를 다시 'DELIVERED'(납품완료) 상태로 복원시켜버립니다.
  // 목록에서는 의뢰취소(CANCELLED), 정산 관제에서는 납품완료(DELIVERED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const reqObj = db.requests.find(r => r.id === id);
    if (reqObj) {
      reqObj.status = 'DELIVERED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to DELIVERED!
      console.log(`[DB RESTORE STATUS] Re-activated request ${id} back to DELIVERED status via delivery completion!`);
    }
    writeDB(db);
    res.json({ success: true, reqObj });
  }, 4000);
};

export const confirmQuoteUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 견적 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '견적 확정 성공 (QUOTE CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] QUOTE CONFIRMED SUCCESSFULLY for request ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief PM role required to confirm final translation quote" });
  }
  const db = readDB();
  const reqObj = db.requests.find(r => r.id === id);
  if (reqObj) { reqObj.status = 'QUOTED'; writeDB(db); }
  res.json({ success: true, reqObj });
};

export const updateClientPartial = (req, res) => {
  const { id } = req.params;
  const { clientName, phone, company } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 고객 정보 수정 모달에서 이름, 연락처, 회사명을 동시에 수정하면,
  // backend data.json에는 이름(clientName)과 회사명(company)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const clt = db.clients.find(c => c.id === id);
  if (clt) {
    if (clientName) clt.clientName = clientName;
    if (company) clt.company = company;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated clientName and company for client ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, clt });
};

export const deleteReviewComment = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.reviewComments = db.reviewComments.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 검수 의견을 삭제(`DELETE /api/review-comments/:id`) 처리하여 검수 의견 목록에서 소거하더라도,
  // transStats(번역가별 품질점수, 언어쌍별 평균 견적, 납품 완료율 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed review comment ${id}. transStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-3001", name: "김번역 (글로벌 PM 팀장)", role: "MANAGER", langPair: "한국어 ➔ 영어", handledProjects: 310 }],
    clients: [{ id: "CLT-01", clientName: "이지은 이사", company: "(주)글로벌 테크놀로지", phone: "010-9999-1111", email: "lee@globaltech.com", totalOrders: 18 }],
    translators: [{ id: "TRN-101", translatorName: "Sarah Jenkins", langPair: "한국어 ➔ 영어", specialty: "IT / 특허", rating: 4.9, completedWords: 450000 }],
    requests: [{ id: "REQ-4001", reqCode: "TD-20260805-01", title: "글로벌 SaaS 플랫폼 보안 서비스 약관 번역", clientName: "이지은 이사", company: "(주)글로벌 테크놀로지", langPair: "한국어 ➔ 영어", wordCount: 12500, estimatedFeeWon: 1850000, actualFeeWon: 1850000, assignedTranslator: "Sarah Jenkins", dueDate: "2026-08-10", status: "IN_REVIEW" }],
    reviewComments: [{ id: "CMT-6001", reqId: "REQ-4001", reviewer: "김번역 PM", comment: "제4조 보안 규정 단어 톤앤매너 검수 완료", qualityScore: 98, timestamp: "2026-08-05 14:20:00" }],
    activityLogs: [{ id: "ACT-9701", reqId: "REQ-4001", operator: "김번역 (PM 팀장)", action: "의뢰 REQ-4001 검수 단계 진입 및 초안 검토 완료", timestamp: "2026-08-05 14:25:00", status: "SUCCESS" }],
    transStats: { totalRequests: 50, totalClients: 35, totalTranslators: 25, inReviewCount: 16, deliveredCount: 28, totalVolumeWords: 845000, totalRevenueWon: 128500000, avgTurnaroundDays: 3.4 }
  };
  writeDB(initial);
  res.json({ success: true });
};
