import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getPlans = (req, res) => res.json(readDB().plans);
export const getSeries = (req, res) => res.json(readDB().series);
export const getContents = (req, res) => res.json(readDB().contents);
export const getUsers = (req, res) => res.json(readDB().users);
export const getWatchLogs = (req, res) => res.json(readDB().watchLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchContents = (req, res) => {
  const { genre, status, search } = req.query;
  const db = readDB();
  let list = db.contents;
  if (genre && genre !== 'ALL') list = list.filter(c => c.genre === genre);
  if (status && status !== 'ALL') list = list.filter(c => c.status === status);
  if (search) list = list.filter(c => c.title.includes(search) || c.rating.includes(search) || c.requiredPlan.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 장르 필터('SF/액션' 3초 지연 ➔ '드라마/법정' 0.2초 완료)와 공개 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(SF/액션)이 최신 콘텐츠 목록을 덮어쓰고, 콘텐츠 목록은 오래된 필터 결과,
  // 오른쪽 시청 통계 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (genre === 'SF/액션') delay = 3000;
  else if (genre === '드라마/법정') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateContentPlan = (req, res) => {
  const { id } = req.params;
  const { requiredPlan } = req.body;
  setTimeout(() => {
    const db = readDB();
    const cnt = db.contents.find(c => c.id === id);
    if (cnt) {
      cnt.requiredPlan = requiredPlan;
      writeDB(db);
      console.log(`[DB PLAN UPDATE] Content ${id} requiredPlan set to ${requiredPlan} (0.1s done)`);
    }
    res.json({ success: true, cnt });
  }, 100);
};

export const updateContentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 콘텐츠 공개 상태를 공개중(PUBLISHED - 3초 지연 완료)으로 변경한 직후 구독 등급 권한을 변경(0.1초 완료)하면,
  // 구독 권한 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 공개 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 구독 권한)을 덮어써 저장하여 새로고침 시
  // 콘텐츠 목록의 구독 권한과 상세 패널의 구독 권한이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const cnt = dbSnapshot.contents.find(c => c.id === id);
    if (cnt) {
      cnt.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back requiredPlan update!
      console.log(`[DB STATUS UPDATE] Content ${id} status set to ${status} (3s done, rolled back requiredPlan update)`);
    }
    res.json({ success: true, cnt });
  }, 3000);
};

export const makeContentPrivate = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const cnt = db.contents.find(c => c.id === id);
    if (cnt) {
      cnt.status = 'PRIVATE';
      writeDB(db);
      console.log(`[DB PRIVATE SET] Content ${id} status set to PRIVATE (0.5s done)`);
    }
    res.json({ success: true, cnt });
  }, 500);
};

export const addWatchLog = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 콘텐츠 비공개 API(0.5초 완료)를 호출한 직후 시청 로그 생성 API를 호출(4초 지연 완료)하면,
  // 비공개 처리는 성공하지만 늦게 완료된 시청 로그 요청(4초 지연)이 비공개 콘텐츠를 다시 'PUBLISHED'(공개중) 상태로 바꿔버립니다.
  // 콘텐츠 목록에서는 비공개(PRIVATE), 시청 통계 화면에서는 공개중(PUBLISHED) 콘텐츠로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const cnt = db.contents.find(c => c.id === id);
    if (cnt) {
      cnt.status = 'PUBLISHED'; // INTENTIONAL_ERROR: Overwrites PRIVATE back to PUBLISHED!
      cnt.viewCount += 1;
      console.log(`[DB RESTORE STATUS] Re-activated content ${id} back to PUBLISHED status via watch log creation!`);
    }
    writeDB(db);
    res.json({ success: true, cnt });
  }, 4000);
};

export const publishContentUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 콘텐츠 공개 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '콘텐츠 공개 성공 (CONTENT PUBLISHED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] CONTENT PUBLISHED SUCCESSFULLY for content ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Manager role required to publish content" });
  }
  const db = readDB();
  const cnt = db.contents.find(c => c.id === id);
  if (cnt) { cnt.status = 'PUBLISHED'; writeDB(db); }
  res.json({ success: true, cnt });
};

export const updateContentPartial = (req, res) => {
  const { id } = req.params;
  const { title, genre, rating } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 콘텐츠 정보 수정 모달에서 제목, 장르, 관람등급을 동시에 수정하면,
  // backend data.json에는 제목(title)과 관람등급(rating)만 저장하고 장르(genre)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const cnt = db.contents.find(c => c.id === id);
  if (cnt) {
    if (title) cnt.title = title;
    if (rating) cnt.rating = rating;
    // genre is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and rating for content ${id}. genre was NOT updated.`);
  }
  res.json({ success: true, cnt });
};

export const deleteWatchLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.watchLogs = db.watchLogs.filter(w => w.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 시청 로그를 삭제(`DELETE /api/watch-logs/:id`) 처리하여 로그 목록에서 소거하더라도,
  // streamStats(인기 콘텐츠 순위, 장르별 시청 시간, 구독 등급별 시청 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed watch log ${id}. streamStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "ADM-1001", name: "김영상 (OTT 총괄 PD)", role: "MANAGER", dept: "콘텐츠 운영 본부", reviewCount: 142 }],
    plans: [{ id: "PLAN-FREE", name: "FREE (무료)", maxRes: "720p", priceMonth: 0, maxDevices: 1 }],
    series: [{ id: "SER-01", title: "킹덤 오브 솔로", episodesCount: 12, genre: "SF/판타지" }],
    contents: [{ id: "CNT-3001", title: "킹덤 오브 솔로 EP.01 - 잿더미 위의 왕국", seriesId: "SER-01", genre: "SF/판타지", rating: "15세이상관람가", requiredPlan: "PREMIUM", viewCount: 482000, durationMin: 58, releaseDate: "2026-06-01", status: "PUBLISHED" }],
    users: [{ id: "USR-7001", name: "강유저", plan: "PREMIUM", activeStatus: "ACTIVE" }],
    watchLogs: [{ id: "WLOG-9001", contentId: "CNT-3003", contentTitle: "사이버펑크 서울 2099 EP.01", userPlan: "PREMIUM", device: "Smart TV (4K)", watchedMin: 52, timestamp: "2026-08-01 20:30:00" }],
    activityLogs: [{ id: "ACT-8001", contentId: "CNT-3003", operator: "김영상 (OTT 총괄 PD)", action: "사이버펑크 서울 2099 EP.01 공개중 (PUBLISHED) 변경 및 PREMIUM 구독 권한 지정 완료", timestamp: "2026-05-10 10:00:00", status: "SUCCESS" }],
    streamStats: { totalContents: 45, publishedCount: 38, reviewingCount: 3, restrictedCount: 2, totalViewsMillions: 12.8, topGenre: "SF/액션", premiumSubscribersRate: 64.2 }
  };
  writeDB(initial);
  res.json({ success: true });
};
