import { readDB, writeDB } from '../services/dataService.js';

export const getAdmins = (req, res) => {
  const db = readDB();
  res.json(db.admins);
};

export const getPlans = (req, res) => {
  const db = readDB();
  res.json(db.plans);
};

export const getOrganizations = (req, res) => {
  const db = readDB();
  res.json(db.organizations);
};

export const getTeamMembers = (req, res) => {
  const db = readDB();
  res.json(db.teamMembers);
};

export const getUsageLogs = (req, res) => {
  const db = readDB();
  res.json(db.usageLogs);
};

export const getBillingHistories = (req, res) => {
  const db = readDB();
  res.json(db.billingHistories);
};

export const searchOrganizations = (req, res) => {
  const { planId, status, search } = req.query;
  const db = readDB();
  let list = db.organizations;

  if (planId && planId !== 'ALL') {
    list = list.filter(o => o.planId === planId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(o => o.status === status);
  }
  if (search) {
    list = list.filter(o => o.name.includes(search) || o.id.includes(search));
  }

  let delay = 100;
  if (planId === 'PLN-ENTERPRISE') {
    delay = 3000; // 3.0s delay for Enterprise
  } else if (planId === 'PLN-BASIC') {
    delay = 200; // 0.2s delay for Basic
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 요금제 필터('Enterprise' 3초 지연 ➔ 'Basic' 0.2초 완료)와 검색어를 빠르게 변경 시 
  // 오래된 이전 응답(Enterprise)이 최신 조직 목록을 덮어쓰고, 조직 목록은 오래된 필터 결과, 오른쪽 사용량 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updatePlan = (req, res) => {
  const { id } = req.params;
  const { planId, planName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 요금제를 Pro/Business로 변경(3초 지연 완료)한 직후 팀원 라이선스 수를 변경(0.1초 완료)하면, 
  // 라이선스 수 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 요금제 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 라이선스 수)을 덮어써 저장되어 
  // 새로고침 시 요금제 카드와 청구 예정 금액의 라이선스 수가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const org = dbSnapshot.organizations.find(o => o.id === id);
    if (org) {
      org.planId = planId;
      org.planName = planName;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back license seat changes made during the 3s delay
      console.log(`[DB PLAN UPDATE] Updated plan for org ${id} to ${planName} (3s done, rolled back license seat update)`);
    }
    res.json({ success: true, org });
  }, 3000);
};

export const updateLicenseSeats = (req, res) => {
  const { id } = req.params;
  const { seatsAllowed } = req.body;

  setTimeout(() => {
    const db = readDB();
    const org = db.organizations.find(o => o.id === id);
    if (org) {
      org.seatsAllowed = seatsAllowed;
      writeDB(db);
      console.log(`[DB LICENSE SEATS UPDATE] Updated org ${id} seatsAllowed to ${seatsAllowed} (0.1s done)`);
    }
    res.json({ success: true, org });
  }, 100);
};

export const cancelSubscription = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const org = db.organizations.find(o => o.id === id);
    if (org) {
      org.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SUBSCRIPTION] Org ${id} subscription status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, org });
  }, 500);
};

export const refreshUsage = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 구독 취소 API(0.5초 완료)를 호출한 직후 사용량 갱신 API를 호출(4초 지연 완료)하면, 
  // 구독 취소는 성공하지만 늦게 완료된 사용량 갱신 요청(4초 지연)이 취소된 구독을 다시 'ACTIVE'(활성 구독) 상태로 바꿔버립니다. 
  // 구독 설정에서는 취소됨, 사용량 대시보드에서는 활성 구독으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const org = db.organizations.find(o => o.id === id);
    if (org) {
      org.status = 'ACTIVE'; // INTENTIONAL_ERROR: Overwrites CANCELLED status back to ACTIVE!
      console.log(`[DB RESTORE CANCELLED SUBSCRIPTION] Re-activated org ${id} subscription back to ACTIVE!`);
    }
    writeDB(db);
    res.json({ success: true, org });
  }, 4000);
};

export const updatePlanUnauthorized = (req, res) => {
  const { id } = req.params;
  const { planId, planName } = req.body;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 멤버(role !== 'ADMIN')가 요금제 변경 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '요금제 변경 성공 (SUBSCRIPTION PLAN CHANGED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] SUBSCRIPTION PLAN CHANGED SUCCESSFULLY for org ${id} to ${planName} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required to change plan" });
  }

  const db = readDB();
  const org = db.organizations.find(o => o.id === id);
  if (org) {
    org.planId = planId;
    org.planName = planName;
    writeDB(db);
  }
  res.json({ success: true, org });
};

export const updateOrgPartial = (req, res) => {
  const { id } = req.params;
  const { name, billingEmail, bizRegNo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 조직 정보 수정 모달에서 조직명, 청구 이메일, 사업자번호를 동시에 수정하면, 
  // backend data.json에는 조직명(name)과 사업자번호(bizRegNo)만 저장하고 청구 이메일(billingEmail)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것처럼 표시하는 partial save 결함입니다.
  const db = readDB();
  const org = db.organizations.find(o => o.id === id);
  if (org) {
    if (name) org.name = name;
    if (bizRegNo) org.bizRegNo = bizRegNo;
    // billingEmail is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and bizRegNo for org ${id}. billingEmail was NOT updated.`);
  }
  res.json({ success: true, org });
};

export const deleteUsageLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.usageLogs = db.usageLogs.filter(l => l.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 사용량 로그를 삭제(`DELETE /api/usage-logs/:id`) 처리하여 로그 목록에서 소거하더라도, 
  // 월별 API 사용량(`saasStats.totalMonthlyApiCalls`), 초과 사용량, 청구 예정 금액 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE USAGE LOG] Removed usage log ${id}. saasStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "ADM-101", "name": "김클라우드 (최고 테크 CTO)", "role": "ADMIN", "orgId": "ORG-1001", "orgName": "테크노바 소프트웨어" }
    ],
    "plans": [
      { "id": "PLN-PRO", "name": "Professional Pro", "monthlyFee": 99000, "apiLimit": 500000, "storageLimitGb": 250, "maxSeats": 30 }
    ],
    "organizations": [
      { "id": "ORG-1001", "name": "테크노바 소프트웨어", "planId": "PLN-PRO", "planName": "Professional Pro", "billingEmail": "billing@technova.com", "bizRegNo": "123-45-67890", "seatsUsed": 25, "seatsAllowed": 30, "status": "ACTIVE" }
    ],
    "teamMembers": [
      { "id": "MEM-2001", "orgId": "ORG-1001", "name": "김동남", "email": "dongnam@technova.com", "role": "OWNER", "monthlyCalls": 45000, "licenseStatus": "ASSIGNED" }
    ],
    "usageLogs": [
      { "id": "LOG-3001", "orgId": "ORG-1001", "metricType": "API_CALLS", "amount": 15400, "unit": "회", "timestamp": "2026-08-03 09:00:00", "overageFee": 0 }
    ],
    "billingHistories": [
      { "id": "BIL-4001", "orgId": "ORG-1001", "planName": "Professional Pro", "baseAmount": 99000, "overageAmount": 0, "totalBilling": 99000, "billingDate": "2026-08-01", "status": "PAID" }
    ],
    "saasStats": {
      "totalOrgs": 10,
      "totalMembers": 40,
      "totalMonthlyApiCalls": 1850000,
      "expectedBillingAmount": 1545000,
      "totalStorageUsedGb": 1250
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
