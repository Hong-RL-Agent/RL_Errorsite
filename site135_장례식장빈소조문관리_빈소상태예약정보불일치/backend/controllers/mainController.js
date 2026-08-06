import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getAltars = (req, res) => res.json(readDB().altars);
export const getReservations = (req, res) => res.json(readDB().reservations);
export const getSchedules = (req, res) => res.json(readDB().schedules);
export const getVisitorGuides = (req, res) => res.json(readDB().visitorGuides);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchAltars = (req, res) => {
  const { status, search } = req.query;
  const db = readDB();
  let list = db.altars;
  if (status && status !== 'ALL') list = list.filter(a => a.status === status);
  if (search) list = list.filter(a => a.altarNo.includes(search) || a.deceasedName.includes(search) || a.chiefMourner.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 빈소 상태 필터('VACANT' 3초 지연 ➔ 'IN_USE' 0.2초 완료)와 일정 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(VACANT)이 최신 빈소 목록을 덮어쓰고, 빈소 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (status === 'VACANT') delay = 3000;
  else if (status === 'IN_USE') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateReservationScheduleText = (req, res) => {
  const { id } = req.params;
  const { scheduleText } = req.body;
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.scheduleText = scheduleText;
      writeDB(db);
      console.log(`[DB SCHEDULE TEXT UPDATE] Reservation ${id} scheduleText set to ${scheduleText} (0.1s done)`);
    }
    res.json({ success: true, resv });
  }, 100);
};

export const updateAltarStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 빈소 상태를 사용중(IN_USE - 3초 지연 완료)으로 변경한 직후 장례 일정을 변경(0.1초 완료)하면,
  // 장례 일정 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 빈소 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 장례 일정)을 덮어써 저장하여 새로고침 시
  // 빈소의 상태와 상세 패널의 장례 일정이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const alt = dbSnapshot.altars.find(a => a.id === id || a.altarNo === id);
    if (alt) {
      alt.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back scheduleText update!
      console.log(`[DB STATUS UPDATE] Altar ${id} status set to ${status} (3s done, rolled back scheduleText update)`);
    }
    res.json({ success: true, alt });
  }, 3000);
};

export const cancelReservation = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL RESERVATION] Reservation ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, resv });
  }, 500);
};

export const addVisitorGuide = (req, res) => {
  const { id } = req.params;
  const { visitorGroup, visitorCount } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 조문객 안내 등록 API를 호출(4초 지연 완료)하면,
  // 예약 취소는 성공하지만 늦게 완료된 조문객 안내 등록 요청(4초 지연)이 취소된 예약을 다시 'GUIDING'(안내중) 상태로 복원시켜버립니다.
  // 목록에서는 예약취소(CANCELLED), 조문 안내 관제에서는 안내중(GUIDING)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'GUIDING'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to GUIDING!
      console.log(`[DB RESTORE STATUS] Re-activated reservation ${id} back to GUIDING status via visitor guide entry!`);
    }
    db.visitorGuides.push({
      id: `VLOG-${Date.now()}`, resId: id, altarNo: resv ? resv.altarNo : "특실 101호",
      deceasedName: "故 홍길동 님", visitorGroup: visitorGroup || "일반 조문객", visitorCount: Number(visitorCount) || 10,
      timestamp: new Date().toISOString()
    });
    writeDB(db);
    res.json({ success: true, resv });
  }, 4000);
};

export const terminateAltarUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 빈소 강제종료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '빈소 강제종료 성공 (ALTAR FORCE TERMINATED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] ALTAR FORCE TERMINATED SUCCESSFULLY for altar ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Senior funeral director role required to force terminate altar reservation" });
  }
  const db = readDB();
  const alt = db.altars.find(a => a.id === id);
  if (alt) { alt.status = 'TERMINATED'; writeDB(db); }
  res.json({ success: true, alt });
};

export const updateClientPartial = (req, res) => {
  const { id } = req.params;
  const { clientName, phone, requests } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 예약자 정보 수정 모달에서 이름, 연락처, 요청사항을 동시에 수정하면,
  // backend data.json에는 이름(clientName)과 요청사항(requests)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const resv = db.reservations.find(r => r.id === id);
  if (resv) {
    if (clientName) resv.clientName = clientName;
    if (requests) resv.requests = requests;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated clientName and requests for reservation ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, resv });
};

export const deleteVisitorGuide = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.visitorGuides = db.visitorGuides.filter(v => v.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 조문객 안내 로그를 삭제(`DELETE /api/visitor-guides/:id`) 처리하여 안내 로그 목록에서 소거하더라도,
  // memorialStats(빈소별 방문자 수, 장례 일정 수, 직원별 처리량 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed visitor guide ${id}. memorialStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-5001", name: "김장례 (총괄 장례지도사)", role: "MANAGER", dept: "장례 의전1팀", handledReservations: 210 }],
    altars: [{ id: "ALT-1001", altarNo: "특실 101호", size: "특대형 (150평형)", deceasedName: "故 홍길동 님", chiefMourner: "홍성민 (장남)", entryDate: "2026-08-04 09:00", funeralDate: "2026-08-06 07:00", status: "IN_USE" }],
    reservations: [{ id: "RES-2001", resCode: "MD-20260805-01", altarNo: "특실 101호", clientName: "홍성민", phone: "010-1111-2222", requests: "기독교 장례 예배 세팅 및 꽃장식 추가", scheduleText: "2026-08-04 입실 ➔ 08-06 07:00 발인", status: "IN_USE" }],
    schedules: [{ id: "SCH-3001", resId: "RES-2001", altarNo: "특실 101호", eventTitle: "故 홍길동 님 입관식 및 성복제", eventTime: "2026-08-05 14:00", location: "지하 1층 입관실" }],
    visitorGuides: [{ id: "VLOG-6001", resId: "RES-2001", altarNo: "특실 101호", deceasedName: "故 홍길동 님", visitorGroup: "대한상공회의소 임직원 조문단", visitorCount: 45, timestamp: "2026-08-04 18:30:00" }],
    activityLogs: [{ id: "ACT-9301", resId: "RES-2001", operator: "김장례 (장례지도사)", action: "특실 101호 故 홍길동 님 빈소 입실 배정 및 장례 일정 등록 완료", timestamp: "2026-08-04 09:30:00", status: "SUCCESS" }],
    memorialStats: { totalAltars: 25, totalReservations: 40, totalSchedules: 35, inUseCount: 12, guidingCount: 8, totalVisitors: 3840, avgOccupancyRatePercent: 80.0 }
  };
  writeDB(initial);
  res.json({ success: true });
};
