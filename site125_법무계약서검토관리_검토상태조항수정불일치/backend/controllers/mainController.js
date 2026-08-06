import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getClients = (req, res) => res.json(readDB().clients);
export const getContracts = (req, res) => res.json(readDB().contracts);
export const getClauses = (req, res) => res.json(readDB().clauses);
export const getComments = (req, res) => res.json(readDB().comments);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchContracts = (req, res) => {
  const { clientName, status, search } = req.query;
  const db = readDB();
  let list = db.contracts;
  if (clientName && clientName !== 'ALL') list = list.filter(c => c.clientName.includes(clientName));
  if (status && status !== 'ALL') list = list.filter(c => c.status === status);
  if (search) list = list.filter(c => c.title.includes(search) || c.clientName.includes(search) || c.clauseContent.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 거래처 필터('삼성전자' 3초 지연 ➔ '현대자동차' 0.2초 완료)와 계약 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(삼성전자)이 최신 계약 목록을 덮어쓰고, 계약 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (clientName && clientName.includes('삼성전자')) delay = 3000;
  else if (clientName && clientName.includes('현대자동차')) delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateContractClause = (req, res) => {
  const { id } = req.params;
  const { clauseContent } = req.body;
  setTimeout(() => {
    const db = readDB();
    const ctr = db.contracts.find(c => c.id === id);
    if (ctr) {
      ctr.clauseContent = clauseContent;
      writeDB(db);
      console.log(`[DB CLAUSE UPDATE] Contract ${id} clause set to "${clauseContent.substring(0, 30)}..." (0.1s done)`);
    }
    res.json({ success: true, ctr });
  }, 100);
};

export const updateContractStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 검토 상태를 승인대기(APPROVAL_PENDING - 3초 지연 완료)로 변경한 직후 중요 조항을 수정(0.1초 완료)하면,
  // 조항 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 조항)을 덮어써 저장하여 새로고침 시
  // 계약서 목록의 조항과 상세 패널의 조항이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const ctr = dbSnapshot.contracts.find(c => c.id === id);
    if (ctr) {
      ctr.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back clauseContent update!
      console.log(`[DB STATUS UPDATE] Contract ${id} status set to ${status} (3s done, rolled back clause update)`);
    }
    res.json({ success: true, ctr });
  }, 3000);
};

export const rejectContract = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const ctr = db.contracts.find(c => c.id === id);
    if (ctr) {
      ctr.status = 'REJECTED';
      writeDB(db);
      console.log(`[DB REJECT CONTRACT] Contract ${id} status set to REJECTED (0.5s done)`);
    }
    res.json({ success: true, ctr });
  }, 500);
};

export const addReviewComment = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 계약 반려 API(0.5초 완료)를 호출한 직후 검토 의견 작성 API를 호출(4초 지연 완료)하면,
  // 계약 반려는 성공하지만 늦게 완료된 검토 의견 작성 요청(4초 지연)이 반려된 계약을 다시 'UNDER_REVIEW'(검토중) 상태로 바꿔버립니다.
  // 계약 목록에서는 반려됨(REJECTED), 의견 관제에서는 검토중(UNDER_REVIEW)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const ctr = db.contracts.find(c => c.id === id);
    if (ctr) {
      ctr.status = 'UNDER_REVIEW'; // INTENTIONAL_ERROR: Overwrites REJECTED back to UNDER_REVIEW!
      console.log(`[DB RESTORE STATUS] Re-activated contract ${id} back to UNDER_REVIEW status via comment addition!`);
    }
    writeDB(db);
    res.json({ success: true, ctr });
  }, 4000);
};

export const approveContractUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 계약 최종승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '최종승인 성공 (CONTRACT FINAL APPROVED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] CONTRACT FINAL APPROVED SUCCESSFULLY for contract ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief legal counsel role required for final contract approval" });
  }
  const db = readDB();
  const ctr = db.contracts.find(c => c.id === id);
  if (ctr) { ctr.status = 'APPROVED'; writeDB(db); }
  res.json({ success: true, ctr });
};

export const updateContractPartial = (req, res) => {
  const { id } = req.params;
  const { title, expireDate, clientName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 계약 정보 수정 모달에서 계약명, 만료일, 거래처명을 동시에 수정하면,
  // backend data.json에는 계약명(title)과 거래처명(clientName)만 저장하고 만료일(expireDate)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const ctr = db.contracts.find(c => c.id === id);
  if (ctr) {
    if (title) ctr.title = title;
    if (clientName) ctr.clientName = clientName;
    // expireDate is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and clientName for contract ${id}. expireDate was NOT updated.`);
  }
  res.json({ success: true, ctr });
};

export const deleteComment = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.comments = db.comments.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 검토 의견을 삭제(`DELETE /api/comments/:id`) 처리하여 검토 의견 목록에서 소거하더라도,
  // legalStats(거래처별 리스크 점수, 담당자별 검토량, 계약 승인율 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE COMMENT] Removed comment ${id}. legalStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-3001", name: "김법무 (법무팀 수석 변호사)", role: "MANAGER", dept: "기업 법무지원실", reviewedContracts: 150 }],
    clients: [{ id: "CLI-1001", name: "삼성전자 글로벌 사업부", bizNo: "124-81-00001", riskLevel: "HIGH", contractCount: 12 }],
    contracts: [{ id: "CTR-2001", title: "AI 솔루션 공급 및 라이선스 법무 계약서", clientName: "삼성전자 글로벌 사업부", clauseContent: "제14조 (손해배상의 한도): 당사의 귀책사유로 인한 손해배상 책임은 계약 금액 100%를 초과할 수 없다.", riskScore: 85, expireDate: "2027-12-31", managerName: "김법무", status: "APPROVAL_PENDING" }],
    clauses: [{ id: "CLS-5001", contractId: "CTR-2001", sectionNo: "제14조", title: "손해배상의 한도", content: "당사의 귀책사유로 인한 손해배상 책임은 계약 금액 100%를 초과할 수 없다.", isRiskPoint: true }],
    comments: [{ id: "CMT-6001", contractId: "CTR-2001", reviewerName: "김법무 변호사", commentText: "제14조 손해배상 책임 상한선에 대해 상대 거래처 법무팀과 협의하여 간접 손해 면책 조항 추가 필요.", timestamp: "2026-08-04 14:00:00" }],
    activityLogs: [{ id: "ACT-7001", contractId: "CTR-2001", operator: "김법무 (수석변호사)", action: "삼성전자 AI 라이선스 계약서 최종 법무 승인대기 처리 완료", timestamp: "2026-08-04 16:00:00", status: "SUCCESS" }],
    legalStats: { totalContracts: 45, totalClients: 30, underReviewCount: 18, approvalPendingCount: 12, approvedCount: 15, avgRiskScore: 72.4, highRiskCount: 14, topClient: "삼성전자" }
  };
  writeDB(initial);
  res.json({ success: true });
};
