import { readDB, writeDB } from '../services/dataService.js';

export const getAdjusters = (req, res) => {
  const db = readDB();
  res.json(db.adjusters);
};

export const getProducts = (req, res) => {
  const db = readDB();
  res.json(db.products);
};

export const getPolicyholders = (req, res) => {
  const db = readDB();
  res.json(db.policyholders);
};

export const getClaims = (req, res) => {
  const db = readDB();
  res.json(db.claims);
};

export const getMemos = (req, res) => {
  const db = readDB();
  res.json(db.memos);
};

export const getPayouts = (req, res) => {
  const db = readDB();
  res.json(db.payouts);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchClaims = (req, res) => {
  const { productName, status, search } = req.query;
  const db = readDB();
  let list = db.claims;

  if (productName && productName !== 'ALL') {
    list = list.filter(c => c.productName === productName);
  }
  if (status && status !== 'ALL') {
    list = list.filter(c => c.status === status);
  }
  if (search) {
    list = list.filter(c => c.policyholderName.includes(search) || c.id.includes(search) || c.diseaseName.includes(search));
  }

  let delay = 100;
  if (productName === '무배당 실손의료비보장보험') {
    delay = 3000; // 3.0s delay for 실손의료비보장보험
  } else if (productName === '프리미엄 암진단비 종합보험') {
    delay = 200; // 0.2s delay for 암진단비 종합보험
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 보험 상품 필터('무배당 실손의료비보장보험' 3초 지연 ➔ '프리미엄 암진단비 종합보험' 0.2초 완료)와 청구 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(실손의료비)이 최신 청구 목록을 덮어쓰고, 청구 목록은 오래된 필터 결과, 오른쪽 지급 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateClaimStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 청구 상태를 '지급승인'(PAYMENT_APPROVED)으로 변경(3초 지연 완료)한 직후 지급 금액을 수정(0.1초 완료)하면, 
  // 지급 금액 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 상태)을 덮어써 저장되어 
  // 새로고침 시 청구 목록의 상태와 지급 상세의 상태가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const claim = dbSnapshot.claims.find(c => c.id === id);
    if (claim) {
      claim.status = status;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back payout amount changes made during the 3s delay
      console.log(`[DB CLAIM STATUS UPDATE] Updated status for claim ${id} to ${status} (3s done, rolled back payout amount update)`);
    }
    res.json({ success: true, claim });
  }, 3000);
};

export const updatePayoutAmount = (req, res) => {
  const { id } = req.params;
  const { payoutAmount } = req.body;

  setTimeout(() => {
    const db = readDB();
    const claim = db.claims.find(c => c.id === id);
    if (claim) {
      claim.payoutAmount = payoutAmount;
      writeDB(db);
      console.log(`[DB PAYOUT AMOUNT UPDATE] Updated claim ${id} payoutAmount to ${payoutAmount} (0.1s done)`);
    }
    res.json({ success: true, claim });
  }, 100);
};

export const rejectClaim = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const claim = db.claims.find(c => c.id === id);
    if (claim) {
      claim.status = 'REJECTED';
      writeDB(db);
      console.log(`[DB REJECT CLAIM] Claim ${id} status set to REJECTED (0.5s done)`);
    }
    res.json({ success: true, claim });
  }, 500);
};

export const completeSupplement = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 청구 반려 API(0.5초 완료)를 호출한 직후 서류 보완 완료 API를 호출(4초 지연 완료)하면, 
  // 반려 요청은 성공하지만 늦게 완료된 보완 완료 요청(4초 지연)이 반려된 청구를 다시 'UNDER_REVIEW'(심사중) 상태로 바꿔버립니다. 
  // 청구 목록에서는 반려, 서류 검토 탭에서는 심사중으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const claim = db.claims.find(c => c.id === id);
    if (claim) {
      claim.status = 'UNDER_REVIEW'; // INTENTIONAL_ERROR: Overwrites REJECTED status back to UNDER_REVIEW!
      console.log(`[DB RESTORE REJECTED CLAIM] Re-activated claim ${id} back to UNDER_REVIEW status via document supplement!`);
    }
    writeDB(db);
    res.json({ success: true, claim });
  }, 4000);
};

export const approvePayoutUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 지급 승인 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '지급 승인 성공 (PAYOUT APPROVAL COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] PAYOUT APPROVAL COMPLETED SUCCESSFULLY for claim ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Manager privilege required for final payout sign-off" });
  }

  const db = readDB();
  const claim = db.claims.find(c => c.id === id);
  if (claim) {
    claim.status = 'PAYMENT_APPROVED';
    writeDB(db);
  }
  res.json({ success: true, claim });
};

export const updatePolicyholderPartial = (req, res) => {
  const { id } = req.params;
  const { address, phone, bankAccount } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 가입자 정보 수정 모달에서 주소, 연락처, 계좌번호를 동시에 수정하면, 
  // backend data.json에는 주소(address)와 계좌번호(bankAccount)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const policyholder = db.policyholders.find(p => p.id === id);
  if (policyholder) {
    if (address) policyholder.address = address;
    if (bankAccount) policyholder.bankAccount = bankAccount;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated address and bankAccount for policyholder ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, policyholder });
};

export const deletePayout = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.payouts = db.payouts.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 지급 내역을 삭제(`DELETE /api/payouts/:id`) 처리하여 지급 내역 목록에서 소거하더라도, 
  // 월별 지급 총액(`claimStats.totalPayoutAmount`), 상품별 청구율, 심사자별 처리량 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE PAYOUT] Removed payout ${id}. claimStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "adjusters": [
      { "id": "AUD-101", "name": "김심사 (수석 손해사정사)", "role": "MANAGER", "dept": "장기보상 1팀" }
    ],
    "products": [
      { "id": "PRD-01", "name": "무배당 실손의료비보장보험", "category": "상해/실손", "payoutRate": 90 }
    ],
    "policyholders": [
      { "id": "INS-2001", "name": "김동남", "phone": "010-1111-2222", "address": "서울특별시 강남구 테헤란로 123", "bankAccount": "신한 110-123-456789" }
    ],
    "claims": [
      { "id": "CLM-1001", "policyholderId": "INS-2001", "policyholderName": "김동남", "productName": "무배당 실손의료비보장보험", "claimAmount": 1250000, "payoutAmount": 1125000, "status": "UNDER_REVIEW", "receivedDate": "2026-08-01", "diseaseName": "위궤양 급성 통원 수술", "adjusterName": "김심사 (수석 손해사정사)" }
    ],
    "memos": [
      { "id": "MEMO-3001", "claimId": "CLM-1001", "authorName": "김심사 (수석 손해사정사)", "note": "위내시경 조직검사지 제출 확인. 실손 산정비율 90% 적용하여 1,125,000원 심사 승인함.", "timestamp": "2026-08-03 09:30:00" }
    ],
    "payouts": [
      { "id": "PAY-4001", "claimId": "CLM-1002", "policyholderName": "이휴가", "productName": "프리미엄 암진단비 종합보험", "payoutAmount": 20000000, "paidDate": "2026-08-02", "bankAccount": "국민 920102-01-234567", "status": "COMPLETED" }
    ],
    "activityLogs": [
      { "id": "LOG-5001", "claimId": "CLM-1001", "operator": "김동남 (가입자)", "action": "모바일 앱 보험금 청구 접수 완료", "timestamp": "2026-08-01 09:00:00", "status": "SUCCESS" }
    ],
    "claimStats": {
      "totalClaims": 45,
      "pendingAuditCount": 19,
      "approvedCount": 21,
      "rejectedCount": 5,
      "totalPayoutAmount": 142500000,
      "avgProcessingDays": 2.1,
      "approvalRate": 80.8
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
