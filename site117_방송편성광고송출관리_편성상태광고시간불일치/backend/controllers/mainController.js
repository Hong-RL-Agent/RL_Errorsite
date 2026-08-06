import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getChannels = (req, res) => res.json(readDB().channels);
export const getAdSlots = (req, res) => res.json(readDB().adSlots);
export const getPrograms = (req, res) => res.json(readDB().programs);
export const getSchedules = (req, res) => res.json(readDB().schedules);
export const getBroadcastLogs = (req, res) => res.json(readDB().broadcastLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchSchedules = (req, res) => {
  const { channelId, status, search } = req.query;
  const db = readDB();
  let list = db.schedules;
  if (channelId && channelId !== 'ALL') list = list.filter(s => s.channelId === channelId);
  if (status && status !== 'ALL') list = list.filter(s => s.status === status);
  if (search) list = list.filter(s => s.programTitle.includes(search) || s.adAdvertiser.includes(search) || s.channelName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 채널 필터('CH-01' 3초 지연 ➔ 'CH-02' 0.2초 완료)와 편성 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(CH-01)이 최신 편성표를 덮어쓰고, 편성표는 오래된 필터 결과,
  // 오른쪽 송출 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (channelId === 'CH-01') delay = 3000;
  else if (channelId === 'CH-02') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateScheduleAdSlot = (req, res) => {
  const { id } = req.params;
  const { adSlotId, adAdvertiser } = req.body;
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.adSlotId = adSlotId;
      sch.adAdvertiser = adAdvertiser;
      writeDB(db);
      console.log(`[DB ADSLOT UPDATE] Schedule ${id} adSlot set to ${adAdvertiser} (0.1s done)`);
    }
    res.json({ success: true, sch });
  }, 100);
};

export const updateScheduleTime = (req, res) => {
  const { id } = req.params;
  const { startTime, endTime } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 편성 시간을 변경(3초 지연 완료)한 직후 광고 슬롯을 변경(0.1초 완료)하면,
  // 광고 슬롯 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 편성 시간 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 광고 슬롯)을 덮어써 저장하여 새로고침 시
  // 편성표의 광고 슬롯과 상세 패널의 광고 슬롯이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const sch = dbSnapshot.schedules.find(s => s.id === id);
    if (sch) {
      sch.startTime = startTime;
      sch.endTime = endTime;
      writeDB(dbSnapshot); // Overwrites DB, rolling back adSlot update!
      console.log(`[DB SCH TIME UPDATE] Schedule ${id} time set to ${startTime}~${endTime} (3s done, rolled back adSlot update)`);
    }
    res.json({ success: true, sch });
  }, 3000);
};

export const cancelSchedule = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SCH] Schedule ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, sch });
  }, 500);
};

export const completeBroadcast = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 편성 취소 API(0.5초 완료)를 호출한 직후 송출 완료 API를 호출(4초 지연 완료)하면,
  // 편성 취소는 성공하지만 늦게 완료된 송출 완료 요청(4초 지연)이 취소된 편성을 다시 'COMPLETED'(송출완료) 상태로 바꿔버립니다.
  // 편성표에서는 취소(CANCELLED), 송출 로그에서는 송출완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated schedule ${id} back to COMPLETED status via broadcast completion!`);
    }
    writeDB(db);
    res.json({ success: true, sch });
  }, 4000);
};

export const confirmScheduleUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 송출확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '송출확정 성공 (SCHEDULE CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] SCHEDULE CONFIRMED SUCCESSFULLY for schedule ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Programming manager role required to confirm schedule" });
  }
  const db = readDB();
  const sch = db.schedules.find(s => s.id === id);
  if (sch) { sch.status = 'CONFIRMED'; writeDB(db); }
  res.json({ success: true, sch });
};

export const updateProgramPartial = (req, res) => {
  const { id } = req.params;
  const { title, airTimeMin, rating } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 프로그램 정보 수정 모달에서 제목, 방송시간, 등급을 동시에 수정하면,
  // backend data.json에는 제목(title)과 등급(rating)만 저장하고 방송시간(airTimeMin)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const prg = db.programs.find(p => p.id === id);
  if (prg) {
    if (title) prg.title = title;
    if (rating) prg.rating = rating;
    // airTimeMin is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and rating for program ${id}. airTimeMin was NOT updated.`);
  }
  res.json({ success: true, prg });
};

export const deleteBroadcastLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.broadcastLogs = db.broadcastLogs.filter(b => b.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 송출 로그를 삭제(`DELETE /api/broadcast-logs/:id`) 처리하여 로그 목록에서 소거하더라도,
  // broadcastStats(광고 송출률, 채널별 편성 수, 시간대별 시청률 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed broadcast log ${id}. broadcastStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-1001", name: "김편성 (메인 채널 편성국장)", role: "MANAGER", dept: "편성 기획 총괄국", processedCount: 165 }],
    channels: [{ id: "CH-01", name: "KBC 메인 종합채널", genre: "종합편성", status: "ON_AIR" }],
    adSlots: [{ id: "AD-5001", advertiser: "삼성전자 갤럭시 S26", slotType: "프라임 타임 (전CM)", priceWon: 15000000, durationSec: 30 }],
    programs: [{ id: "PRG-2001", title: "KBC 9시 종합 뉴스", genre: "뉴스/보도", rating: "15세이상시청가", viewRating: 12.8, airTimeMin: 60, producer: "박보도" }],
    schedules: [{ id: "SCH-3001", channelId: "CH-01", channelName: "KBC 메인 종합채널", programId: "PRG-2001", programTitle: "KBC 9시 종합 뉴스", adSlotId: "AD-5001", adAdvertiser: "삼성전자 갤럭시 S26", airDate: "2026-08-05", startTime: "21:00", endTime: "22:00", status: "CONFIRMED" }],
    broadcastLogs: [{ id: "BLOG-7001", scheduleId: "SCH-3001", channelName: "KBC 메인 종합채널", programTitle: "KBC 9시 종합 뉴스", adAdvertiser: "삼성전자 갤럭시 S26", realAirTime: "21:00:02 ~ 22:00:00", viewRating: 12.8, timestamp: "2026-08-04 22:00:05" }],
    activityLogs: [{ id: "ACT-6001", scheduleId: "SCH-3001", operator: "김편성 (편성국장)", action: "CH-01 KBC 9시 종합 뉴스 편성 확정 및 삼성전자 프리미엄 광고 배정 완료", timestamp: "2026-08-05 09:10:00", status: "SUCCESS" }],
    broadcastStats: { totalSchedules: 60, onAirCount: 4, readyCount: 18, confirmedCount: 25, adSlotOccupancyRate: 94.2, avgPrimeRating: 15.6, totalAdRevenueMillion: 850 }
  };
  writeDB(initial);
  res.json({ success: true });
};
