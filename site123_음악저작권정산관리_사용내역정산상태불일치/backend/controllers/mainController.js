import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getCreators = (req, res) => res.json(readDB().creators);
export const getTracks = (req, res) => res.json(readDB().tracks);
export const getRoyaltySplits = (req, res) => res.json(readDB().royaltySplits);
export const getSettlements = (req, res) => res.json(readDB().settlements);
export const getUsageLogs = (req, res) => res.json(readDB().usageLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchTracks = (req, res) => {
  const { genre, status, search } = req.query;
  const db = readDB();
  let list = db.tracks;
  if (genre && genre !== 'ALL') list = list.filter(t => t.genre === genre);
  if (status && status !== 'ALL') list = list.filter(t => t.status === status);
  if (search) list = list.filter(t => t.title.includes(search) || t.primaryCreatorName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 장르 필터('K-POP' 3초 지연 ➔ '발라드' 0.2초 완료)와 정산 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(K-POP)이 최신 음원 목록을 덮어쓰고, 음원 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (genre === 'K-POP') delay = 3000;
  else if (genre === '발라드') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateTrackSplit = (req, res) => {
  const { id } = req.params;
  const { royaltyRate } = req.body;
  setTimeout(() => {
    const db = readDB();
    const trk = db.tracks.find(t => t.id === id);
    if (trk) {
      trk.royaltyRate = Number(royaltyRate);
      writeDB(db);
      console.log(`[DB SPLIT UPDATE] Track ${id} royaltyRate set to ${royaltyRate}% (0.1s done)`);
    }
    res.json({ success: true, trk });
  }, 100);
};

export const updateTrackStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 정산 상태를 정산확정(CONFIRMED - 3초 지연 완료)으로 변경한 직후 권리 배분율을 변경(0.1초 완료)하면,
  // 배분율 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 정산 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 배분율)을 덮어써 저장하여 새로고침 시
  // 음원 목록의 배분율과 상세 패널의 배분율이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const trk = dbSnapshot.tracks.find(t => t.id === id);
    if (trk) {
      trk.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back royaltyRate update!
      console.log(`[DB STATUS UPDATE] Track ${id} status set to ${status} (3s done, rolled back royaltyRate update)`);
    }
    res.json({ success: true, trk });
  }, 3000);
};

export const cancelSettlement = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const trk = db.tracks.find(t => t.id === id);
    if (trk) {
      trk.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SETTLEMENT] Track ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, trk });
  }, 500);
};

export const addUsageLog = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 정산 취소 API(0.5초 완료)를 호출한 직후 사용 내역 반영 API를 호출(4초 지연 완료)하면,
  // 정산 취소는 성공하지만 늦게 완료된 사용 내역 반영 요청(4초 지연)이 취소된 정산을 다시 'SETTLING'(정산대기) 상태로 바꿔버립니다.
  // 음원/정산 목록에서는 취소됨(CANCELLED), 정산 화면에서는 정산대기(SETTLING)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const trk = db.tracks.find(t => t.id === id);
    if (trk) {
      trk.status = 'SETTLING'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to SETTLING!
      trk.streamCount += 100000;
      trk.totalRevenueWon += 1250000;
      console.log(`[DB RESTORE STATUS] Re-activated track ${id} back to SETTLING status via usage log addition!`);
    }
    writeDB(db);
    res.json({ success: true, trk });
  }, 4000);
};

export const confirmSettlementUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 정산 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '정산 확정 성공 (ROYALTY CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] ROYALTY CONFIRMED SUCCESSFULLY for track ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Copyright manager role required to confirm settlement" });
  }
  const db = readDB();
  const trk = db.tracks.find(t => t.id === id);
  if (trk) { trk.status = 'CONFIRMED'; writeDB(db); }
  res.json({ success: true, trk });
};

export const updateTrackPartial = (req, res) => {
  const { id } = req.params;
  const { title, genre, primaryCreatorName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 음원 정보 수정 모달에서 제목, 장르, 대표권리자를 동시에 수정하면,
  // backend data.json에는 제목(title)과 대표권리자(primaryCreatorName)만 저장하고 장르(genre)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const trk = db.tracks.find(t => t.id === id);
  if (trk) {
    if (title) trk.title = title;
    if (primaryCreatorName) trk.primaryCreatorName = primaryCreatorName;
    // genre is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and primaryCreatorName for track ${id}. genre was NOT updated.`);
  }
  res.json({ success: true, trk });
};

export const deleteUsageLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.usageLogs = db.usageLogs.filter(u => u.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 사용 내역을 삭제(`DELETE /api/usage-logs/:id`) 처리하여 사용 내역 목록에서 소거하더라도,
  // royaltyStats(음원별 수익, 창작자별 정산액, 월별 사용량 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed usage log ${id}. royaltyStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-8001", name: "김저작 (저작권 분배 총괄이사)", role: "MANAGER", dept: "저작권 정산 본부", handledTracks: 160 }],
    creators: [{ id: "CRT-1001", name: "김멜로디 작곡가", type: "작곡가", totalRoyaltyWon: 85000000, status: "ACTIVE" }],
    tracks: [{ id: "TRK-2001", title: "별빛 아래 첫사랑 멜로디", primaryCreatorName: "김멜로디 작곡가", genre: "K-POP", royaltyRate: 12.5, streamCount: 4800000, totalRevenueWon: 60000000, status: "CONFIRMED" }],
    royaltySplits: [{ id: "SPL-5001", trackId: "TRK-2001", creatorName: "김멜로디 작곡가", role: "작곡", splitPercent: 50.0, payoutWon: 30000000 }],
    settlements: [{ id: "STL-6001", trackId: "TRK-2001", trackTitle: "별빛 아래 첫사랑 멜로디", creatorName: "김멜로디 작곡가", salesPeriod: "2026년 2분기", streamCount: 2400000, grossRevenueWon: 30000000, royaltyPayoutWon: 3750000, status: "CONFIRMED" }],
    usageLogs: [{ id: "ULOG-4001", trackId: "TRK-2001", trackTitle: "별빛 아래 첫사랑 멜로디", platform: "멜론 스트리밍", plays: 1200000, revenueWon: 15000000, timestamp: "2026-08-04 12:00:00" }],
    activityLogs: [{ id: "ACT-9501", trackId: "TRK-2001", operator: "김저작 (총괄이사)", action: "별빛 아래 첫사랑 멜로디 2분기 저작권 인세 37,500,000원 정산확정 승인 완료", timestamp: "2026-08-04 16:00:00", status: "SUCCESS" }],
    royaltyStats: { totalTracks: 50, totalCreators: 35, confirmedCount: 24, settlingCount: 12, totalStreamCount: 128000000, totalRoyaltyPaidWon: 1450000000, topGenre: "K-POP" }
  };
  writeDB(initial);
  res.json({ success: true });
};
