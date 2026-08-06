import { readDB, writeDB } from '../services/dataService.js';

export const getVocCategories = (req, res) => {
  const db = readDB();
  res.json(db.vocCategories);
};

export const getAgents = (req, res) => {
  const db = readDB();
  res.json(db.agents);
};

export const getCustomers = (req, res) => {
  const db = readDB();
  res.json(db.customers);
};

export const getConsultations = (req, res) => {
  const db = readDB();
  res.json(db.consultations);
};

export const getMemos = (req, res) => {
  const db = readDB();
  res.json(db.memos);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchConsultations = (req, res) => {
  const { category, status, search } = req.query;
  const db = readDB();
  let list = db.consultations;

  if (category && category !== 'ALL') {
    list = list.filter(c => c.category === category);
  }
  if (status && status !== 'ALL') {
    list = list.filter(c => c.status === status);
  }
  if (search) {
    list = list.filter(c => c.customerName.includes(search) || c.id.includes(search) || c.inquiryText.includes(search));
  }

  let delay = 100;
  if (category === '배송지연') {
    delay = 3000; // 3.0s delay for 배송지연
  } else if (category === '결제오류') {
    delay = 200; // 0.2s delay for 결제오류
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: VOC 카테고리 필터('배송지연' 3초 지연 ➔ '결제오류' 0.2초 완료)와 상담 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(배송지연)이 최신 상담 목록을 덮어쓰고, 상담 목록은 오래된 필터 결과, 오른쪽 VOC 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateCallStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 상담 상태를 '처리중'(IN_PROGRESS)으로 변경(3초 지연 완료)한 직후 담당 상담원을 변경(0.1초 완료)하면, 
  // 담당자 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상담 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 담당자)을 덮어써 저장되어 
  // 새로고침 시 상담 목록의 담당자와 상담 상세의 담당자가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const call = dbSnapshot.consultations.find(c => c.id === id);
    if (call) {
      call.status = status;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back assigned agent changes made during the 3s delay
      console.log(`[DB CALL STATUS UPDATE] Updated status for call ${id} to ${status} (3s done, rolled back assigned agent update)`);
    }
    res.json({ success: true, call });
  }, 3000);
};

export const updateCallAgent = (req, res) => {
  const { id } = req.params;
  const { agentName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const call = db.consultations.find(c => c.id === id);
    if (call) {
      call.agentName = agentName;
      writeDB(db);
      console.log(`[DB CALL AGENT UPDATE] Updated call ${id} agentName to ${agentName} (0.1s done)`);
    }
    res.json({ success: true, call });
  }, 100);
};

export const completeCall = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const call = db.consultations.find(c => c.id === id);
    if (call) {
      call.status = 'COMPLETED';
      writeDB(db);
      console.log(`[DB COMPLETE CALL] Call ${id} status set to COMPLETED (0.5s done)`);
    }
    res.json({ success: true, call });
  }, 500);
};

export const reopenCall = (req, res) => {
  const { id } = req.params;
  const { inquiryText } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 상담 완료 API(0.5초 완료)를 호출한 직후 고객이 재문의 등록 API를 호출(4초 지연 완료)하면, 
  // 완료 요청은 성공하지만 늦게 완료된 재문의 요청(4초 지연)이 완료된 상담을 다시 'IN_PROGRESS'(처리중 재문의) 상태로 바꿔버립니다. 
  // 상담 목록에서는 완료, 고객 이력에서는 처리중 재문의로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const call = db.consultations.find(c => c.id === id);
    if (call) {
      call.status = 'IN_PROGRESS'; // INTENTIONAL_ERROR: Overwrites COMPLETED status back to IN_PROGRESS!
      if (inquiryText) call.inquiryText = inquiryText;
      console.log(`[DB RESTORE COMPLETED CALL] Re-activated call ${id} back to IN_PROGRESS status via customer re-query!`);
    }
    writeDB(db);
    res.json({ success: true, call });
  }, 4000);
};

export const updateStatusUnauthorized = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 상담원(role !== 'ADMIN')이 다른 팀 상담 상태 변경 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '상담 상태 변경 성공 (CALL STATUS CHANGED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] CALL STATUS CHANGED SUCCESSFULLY for call ${id} to ${status} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: You don't have permission to change status for this team's call" });
  }

  const db = readDB();
  const call = db.consultations.find(c => c.id === id);
  if (call) {
    call.status = status;
    writeDB(db);
  }
  res.json({ success: true, call });
};

export const updateCustomerPartial = (req, res) => {
  const { id } = req.params;
  const { phone, tier, recentInquiry } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 고객 정보 수정 모달에서 연락처, 등급, 최근 문의 요약을 동시에 수정하면, 
  // backend data.json에는 연락처(phone)와 최근 문의 요약(recentInquiry)만 저장하고 등급(tier)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const customer = db.customers.find(c => c.id === id);
  if (customer) {
    if (phone) customer.phone = phone;
    if (recentInquiry) customer.recentInquiry = recentInquiry;
    // tier is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated phone and recentInquiry for customer ${id}. tier was NOT updated.`);
  }
  res.json({ success: true, customer });
};

export const deleteMemo = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.memos = db.memos.filter(m => m.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 상담 메모를 삭제(`DELETE /api/memos/:id`) 처리하여 상담 상세에서는 메모가 소거되더라도, 
  // 상담원별 처리량, VOC 카테고리별 건수, 대시보드 완료율(`callStats.completionRate`) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE MEMO] Removed memo ${id}. callStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "vocCategories": [
      { "id": "CAT-01", "name": "배송지연", "dept": "물류지원팀", "priority": "HIGH" }
    ],
    "agents": [
      { "id": "AGT-3001", "name": "김상담 (수석 상담원)", "team": "VOC CS 1팀", "role": "ADMIN", "processedCount": 142 }
    ],
    "customers": [
      { "id": "CUST-2001", "name": "김동남", "phone": "010-1111-2222", "tier": "VIP", "recentInquiry": "택배 배송지연으로 3일째 오지 않음" }
    ],
    "consultations": [
      { "id": "CALL-1001", "customerId": "CUST-2001", "customerName": "김동남", "category": "배송지연", "status": "IN_PROGRESS", "priority": "HIGH", "waitTimeMin": 15, "agentName": "김상담 (수석 상담원)", "inquiryText": "주문한 물품 3일째 미배송. 택배사 흐름 중단됨." }
    ],
    "memos": [
      { "id": "MEMO-4001", "callId": "CALL-1001", "authorName": "김상담 (수석 상담원)", "note": "고객 3일째 대기로 매우 격앙됨. 물류 센터 담당자에게 퀵서비스 긴급 배송 요청함.", "timestamp": "2026-08-03 09:30:00" }
    ],
    "activityLogs": [
      { "id": "LOG-5001", "callId": "CALL-1001", "operator": "김상담 (수석 상담원)", "action": "상담 접수 및 담당자 김상담 배정", "timestamp": "2026-08-03 09:00:00", "status": "SUCCESS" }
    ],
    "callStats": {
      "totalReceipts": 45,
      "unprocessedCount": 18,
      "completedCount": 24,
      "reopenedCount": 3,
      "avgWaitTimeMin": 12.4,
      "completionRate": 85.2
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
