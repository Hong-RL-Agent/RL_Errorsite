import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => {
  const db = readDB();
  res.json(db.staffs);
};

export const getAdvertisers = (req, res) => {
  const db = readDB();
  res.json(db.advertisers);
};

export const getCampaigns = (req, res) => {
  const db = readDB();
  res.json(db.campaigns);
};

export const getCreatives = (req, res) => {
  const db = readDB();
  res.json(db.creatives);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchCampaigns = (req, res) => {
  const { advertiserName, status, search } = req.query;
  const db = readDB();
  let list = db.campaigns;

  if (advertiserName && advertiserName !== 'ALL') {
    list = list.filter(c => c.advertiserName === advertiserName);
  }
  if (status && status !== 'ALL') {
    list = list.filter(c => c.status === status);
  }
  if (search) {
    list = list.filter(c => c.title.includes(search) || c.id.includes(search));
  }

  let delay = 100;
  if (advertiserName === '삼성전자') {
    delay = 3000; // 3.0s delay for 삼성전자
  } else if (advertiserName === '현대자동차') {
    delay = 200; // 0.2s delay for 현대자동차
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 광고주 필터('삼성전자' 3초 지연 ➔ '현대자동차' 0.2초 완료)와 캠페인 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(삼성전자)이 최신 캠페인 목록을 덮어쓰고, 캠페인 목록은 오래된 필터 결과, 오른쪽 성과 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const approveCreative = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 광고 소재를 승인(3초 지연 완료)한 직후 캠페인 예산을 변경(0.1초 완료)하면, 
  // 예산 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 소재 승인 API가 요청 시작 시점의 구 DB 스냅샷(이전 예산)을 덮어써 저장되어 
  // 새로고침 시 캠페인 상세 예산과 대시보드 예산 요약이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const cr = dbSnapshot.creatives.find(c => c.id === id);
    if (cr) {
      cr.status = 'APPROVED';
      writeDB(dbSnapshot); // Overwrites data.json, rolling back dailyBudget changes made during the 3s delay
      console.log(`[DB CREATIVE APPROVE] Approved creative ${id} (3s done, rolled back budget update)`);
    }
    res.json({ success: true, cr });
  }, 3000);
};

export const updateCampaignBudget = (req, res) => {
  const { id } = req.params;
  const { dailyBudget } = req.body;

  setTimeout(() => {
    const db = readDB();
    const cmp = db.campaigns.find(c => c.id === id);
    if (cmp) {
      cmp.dailyBudget = Number(dailyBudget);
      writeDB(db);
      console.log(`[DB BUDGET UPDATE] Updated campaign ${id} dailyBudget to ${dailyBudget} (0.1s done)`);
    }
    res.json({ success: true, cmp });
  }, 100);
};

export const pauseCampaign = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const cmp = db.campaigns.find(c => c.id === id);
    if (cmp) {
      cmp.status = 'PAUSED';
      writeDB(db);
      console.log(`[DB PAUSE CAMPAIGN] Campaign ${id} status set to PAUSED (0.5s done)`);
    }
    res.json({ success: true, cmp });
  }, 500);
};

export const completeCreativeAudit = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 캠페인 일시중지 API(0.5초 완료)를 호출한 직후 소재 심사완료 API를 호출(4초 지연 완료)하면, 
  // 일시중지는 성공하지만 늦게 완료된 심사완료 요청(4초 지연)이 일시중지된 캠페인을 다시 'RUNNING'(집행중) 상태로 바꿔버립니다. 
  // 캠페인 목록에서는 일시중지, 소재 심사 화면에서는 집행중 캠페인으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const cr = db.creatives.find(c => c.id === id);
    if (cr) {
      cr.status = 'APPROVED';
      const cmp = db.campaigns.find(c => c.id === cr.campaignId);
      if (cmp) {
        cmp.status = 'RUNNING'; // INTENTIONAL_ERROR: Overwrites PAUSED status back to RUNNING!
        console.log(`[DB RESTORE PAUSED CAMPAIGN] Re-activated campaign ${cmp.id} back to RUNNING status via audit completion!`);
      }
    }
    writeDB(db);
    res.json({ success: true, cr });
  }, 4000);
};

export const approveCreativeUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 광고 소재 승인 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '소재 승인 성공 (CREATIVE APPROVED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] CREATIVE APPROVED SUCCESSFULLY for creative ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Manager role required to approve ad creative" });
  }

  const db = readDB();
  const cr = db.creatives.find(c => c.id === id);
  if (cr) {
    cr.status = 'APPROVED';
    writeDB(db);
  }
  res.json({ success: true, cr });
};

export const updateCampaignPartial = (req, res) => {
  const { id } = req.params;
  const { title, dailyBudget, targetRegion } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 캠페인 정보 수정 모달에서 캠페인명, 일일예산, 타겟 지역을 동시에 수정하면, 
  // backend data.json에는 캠페인명(title)과 타겟 지역(targetRegion)만 저장하고 일일예산(dailyBudget)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const cmp = db.campaigns.find(c => c.id === id);
  if (cmp) {
    if (title) cmp.title = title;
    if (targetRegion) cmp.targetRegion = targetRegion;
    // dailyBudget is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and targetRegion for campaign ${id}. dailyBudget was NOT updated.`);
  }
  res.json({ success: true, cmp });
};

export const deleteBudgetLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.activityLogs = db.activityLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 예산 변경 로그를 삭제(`DELETE /api/budget-logs/:id`) 처리하여 로그 목록에서 소거하더라도, 
  // 캠페인별 소진 금액(`adStats.totalSpentAmount`), 광고주별 집행액, 월별 성과 통계 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE BUDGET LOG] Removed log ${id}. adStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "staffs": [
      { "id": "STAFF-6001", "name": "김광고 (마케팅 총괄)", "role": "MANAGER", "dept": "애드 마케팅 1팀", "reviewedAds": 185 }
    ],
    "advertisers": [
      { "id": "ADV-3001", "companyName": "삼성전자", "contactName": "김동남", "phone": "010-1111-2222", "industry": "IT/가전", "totalBudget": 50000000 }
    ],
    "campaigns": [
      { "id": "CMP-1001", "title": "삼성 갤럭시 S26 얼리버드 프로모션", "advertiserName": "삼성전자", "dailyBudget": 5000000, "spentAmount": 3800000, "exhaustionRate": 76.0, "ctr": 3.42, "targetRegion": "전국 서울/수도권", "status": "RUNNING" }
    ],
    "creatives": [
      { "id": "CR-2001", "campaignId": "CMP-1001", "title": "[배너] 갤럭시 S26 울트라 카메라 2억 화소 비주얼", "type": "IMAGE_BANNER", "status": "APPROVED", "auditMemo": "문구 상표권 사전 검증 완료 (가이드 통과)" }
    ],
    "activityLogs": [
      { "id": "LOG-6001", "campaignId": "CMP-1001", "operator": "김광고 (마케팅 총괄)", "action": "삼성 갤럭시 S26 캠페인 일일 예산 5,000,000원으로 증액", "timestamp": "2026-08-03 09:10:00", "status": "SUCCESS" }
    ],
    "adStats": {
      "totalCampaigns": 35,
      "totalSpentAmount": 98500000,
      "avgCtr": 3.82,
      "pendingAuditsCount": 14,
      "runningCount": 26,
      "approvedRate": 91.2
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
