import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getEditors = (req, res) => res.json(readDB().editors);
export const getReporters = (req, res) => res.json(readDB().reporters);
export const getArticles = (req, res) => res.json(readDB().articles);
export const getReviewComments = (req, res) => res.json(readDB().reviewComments);
export const getPublishLogs = (req, res) => res.json(readDB().publishLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchArticles = (req, res) => {
  const { category, status, search } = req.query;
  const db = readDB();
  let list = db.articles;
  if (category && category !== 'ALL') list = list.filter(a => a.category === category);
  if (status && status !== 'ALL') list = list.filter(a => a.status === status);
  if (search) list = list.filter(a => a.title.includes(search) || a.reporterName.includes(search) || a.articleCode.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 카테고리 필터('정치/사회' 3초 지연 ➔ 'IT/과학' 0.2초 완료)와 기사 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(정치/사회)이 최신 기사 목록을 덮어쓰고, 기사 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (category === '정치/사회') delay = 3000;
  else if (category === 'IT/과학') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateArticleEditor = (req, res) => {
  const { id } = req.params;
  const { editorName } = req.body;
  setTimeout(() => {
    const db = readDB();
    const art = db.articles.find(a => a.id === id);
    if (art) {
      art.editorName = editorName;
      writeDB(db);
      console.log(`[DB EDITOR UPDATE] Article ${id} editor set to ${editorName} (0.1s done)`);
    }
    res.json({ success: true, art });
  }, 100);
};

export const updateArticleStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 기사 상태를 발행예약(SCHEDULED - 3초 지연 완료)으로 변경한 직후 편집자를 변경(0.1초 완료)하면,
  // 편집자 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 기사 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 담당 편집자)을 덮어써 저장하여 새로고침 시
  // 기사의 발행상태와 상세 패널의 담당 편집자가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const art = dbSnapshot.articles.find(a => a.id === id);
    if (art) {
      art.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back editor update!
      console.log(`[DB STATUS UPDATE] Article ${id} status set to ${status} (3s done, rolled back editor update)`);
    }
    res.json({ success: true, art });
  }, 3000);
};

export const deleteArticle = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    db.articles = db.articles.filter(a => a.id !== id);
    writeDB(db);
    console.log(`[DB DELETE ARTICLE] Article ${id} deleted (0.5s done)`);
    res.json({ success: true });
  }, 500);
};

export const addReviewComment = (req, res) => {
  const { id } = req.params;
  const { editorName, comment } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 기사 삭제 API(0.5초 완료)를 호출한 직후 검수 의견 작성 API를 호출(4초 지연 완료)하면,
  // 기사 삭제는 성공하지만 늦게 완료된 검수 의견 작성 요청(4초 지연)이 삭제된 기사를 다시 'REVIEWING'(검수중) 상태로 복원시켜버립니다.
  // 목록에서는 삭제됨, 검수 관제에서는 검수중(REVIEWING)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    let art = db.articles.find(a => a.id === id);
    if (!art) {
      // INTENTIONAL_ERROR: Re-creates deleted article back into DB as REVIEWING!
      art = {
        id, articleCode: `ND-${Date.now().toString().slice(-6)}`,
        title: "[복원됨] 데스크 검수 의견 작성 연계 복원 기사",
        category: "정치/사회", reporterName: "최속보", editorName: editorName || "김편집",
        views: 1200, scheduledTime: "2026-08-05 18:00", status: "REVIEWING"
      };
      db.articles.push(art);
      console.log(`[DB RESTORE ARTICLE] Re-created deleted article ${id} back as REVIEWING!`);
    } else {
      art.status = 'REVIEWING';
    }
    db.reviewComments.push({
      id: `CMT-${Date.now()}`, articleId: id, editorName: editorName || "김편집", comment, timestamp: new Date().toISOString()
    });
    writeDB(db);
    res.json({ success: true, art });
  }, 4000);
};

export const publishArticleUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 기자(role !== 'MANAGER')가 최종 발행 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '최종 발행 성공 (ARTICLE PUBLISHED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] ARTICLE PUBLISHED SUCCESSFULLY for article ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief desk editor role required to publish article live" });
  }
  const db = readDB();
  const art = db.articles.find(a => a.id === id);
  if (art) { art.status = 'PUBLISHED'; writeDB(db); }
  res.json({ success: true, art });
};

export const updateArticlePartial = (req, res) => {
  const { id } = req.params;
  const { title, category, scheduledTime } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 기사 정보 수정 모달에서 제목, 카테고리, 발행예정시각을 동시에 수정하면,
  // backend data.json에는 제목(title)과 발행예정시각(scheduledTime)만 저장하고 카테고리(category)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const art = db.articles.find(a => a.id === id);
  if (art) {
    if (title) art.title = title;
    if (scheduledTime) art.scheduledTime = scheduledTime;
    // category is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and scheduledTime for article ${id}. category was NOT updated.`);
  }
  res.json({ success: true, art });
};

export const deletePublishLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.publishLogs = db.publishLogs.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 발행 로그를 삭제(`DELETE /api/publish-logs/:id`) 처리하여 발행 로그 목록에서 소거하더라도,
  // newsStats(카테고리별 발행 수, 기자별 기사 수, 조회수 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed publish log ${id}. newsStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-3001", name: "김편집 (정치사회부 수석 편집자)", role: "MANAGER", dept: "뉴스데스크 편집국", handledArticles: 240 }],
    editors: [{ id: "EDT-1001", editorName: "김편집", dept: "정치사회부", assignedCount: 18, status: "ACTIVE" }],
    reporters: [{ id: "REP-2001", reporterName: "정테크", dept: "IT과학팀", email: "jung@newsdesk.co.kr", totalArticles: 50 }],
    articles: [{ id: "ART-4001", articleCode: "ND-20260805-01", title: "[단독] 차세대 AI 반도체 수주 계약 체결 및 글로벌 시장 점유율 확대", category: "IT/과학", reporterName: "정테크", editorName: "이데스크", views: 15400, scheduledTime: "2026-08-05 14:00", status: "SCHEDULED" }],
    reviewComments: [{ id: "CMT-6001", articleId: "ART-4001", editorName: "이데스크", comment: "수주 금액 단위 단위 오기 수정 및 이미지 그래픽 첨부 완료", timestamp: "2026-08-04 11:30:00" }],
    publishLogs: [{ id: "PLOG-8001", articleId: "ART-4001", title: "[단독] 차세대 AI 반도체 수주 계약 체결", category: "IT/과학", publishedTime: "2026-08-04 09:15:00", views: 15400 }],
    activityLogs: [{ id: "ACT-9501", articleId: "ART-4001", operator: "이데스크 (에디터)", action: "기사 ART-4001 발행예약 등록 완료 (발행예정시각: 14:00)", timestamp: "2026-08-04 10:30:00", status: "SUCCESS" }],
    newsStats: { totalArticles: 55, totalReporters: 25, totalEditors: 12, reviewingCount: 15, publishedCount: 28, totalViews: 458000, topCategory: "IT/과학" }
  };
  writeDB(initial);
  res.json({ success: true });
};
