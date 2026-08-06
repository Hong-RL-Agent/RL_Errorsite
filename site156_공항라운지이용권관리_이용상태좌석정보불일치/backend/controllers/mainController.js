import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getLounges = (req, res) => res.json(readDB().lounges);
export const getSeats = (req, res) => res.json(readDB().seats);
export const getPassengers = (req, res) => res.json(readDB().passengers);
export const getPasses = (req, res) => res.json(readDB().passes);
export const getCheckinLogs = (req, res) => res.json(readDB().checkinLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchPasses = (req, res) => {
  const { terminal, status, search } = req.query;
  const db = readDB();
  let list = db.passes;
  if (terminal && terminal !== 'ALL') list = list.filter(p => p.terminal === terminal);
  if (status && status !== 'ALL') list = list.filter(p => p.status === status);
  if (search) list = list.filter(p => p.passengerName.includes(search) || p.flightNo.includes(search) || p.passCode.includes(search) || p.seatNo.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 터미널 필터('제1여객터미널 동편 4층 라운지' 3초 지연 ➔ '제2여객터미널 250번 게이트 퍼스트' 0.2초 완료)와 이용 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(제1여객터미널)이 최신 이용권 목록을 덮어쓰고, 이용권 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (terminal === '제1여객터미널 동편 4층 라운지') delay = 3000;
  else if (terminal === '제2여객터미널 250번 게이트 퍼스트') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updatePassSeatNo = (req, res) => {
  const { id } = req.params;
  const { seatNo } = req.body;
  setTimeout(() => {
    const db = readDB();
    const pss = db.passes.find(p => p.id === id);
    if (pss) {
      pss.seatNo = seatNo;
      writeDB(db);
      console.log(`[DB SEAT NO UPDATE] Pass ${id} seatNo set to ${seatNo} (0.1s done)`);
    }
    res.json({ success: true, pss });
  }, 100);
};

export const updatePassStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 이용 상태를 이용중(IN_USE - 3초 지연 완료)으로 변경한 직후 좌석(seatNo)을 변경(0.1초 완료)하면,
  // 좌석 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 이용 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 좌석 정보)을 덮어써 저장하여 새로고침 시
  // 이용 상태와 상세 패널의 좌석 정보가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const pss = dbSnapshot.passes.find(p => p.id === id);
    if (pss) {
      pss.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back seatNo update!
      console.log(`[DB STATUS UPDATE] Pass ${id} status set to ${status} (3s done, rolled back seatNo update)`);
    }
    res.json({ success: true, pss });
  }, 3000);
};

export const cancelCheckin = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const pss = db.passes.find(p => p.id === id);
    if (pss) {
      pss.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL CHECKIN] Pass ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, pss });
  }, 500);
};

export const completeLoungeUse = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 체크인 취소 API(0.5초 완료)를 호출한 직후 이용 완료 API를 호출(4초 지연 완료)하면,
  // 체크인 취소는 성공하지만 늦게 완료된 이용 완료 요청(4초 지연)이 취소된 체크인을 다시 'COMPLETED'(이용완료) 상태로 복원시켜버립니다.
  // 목록에서는 이용취소(CANCELLED), 라운지 관제에서는 이용완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const pss = db.passes.find(p => p.id === id);
    if (pss) {
      pss.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated pass ${id} back to COMPLETED status via complete use!`);
    }
    writeDB(db);
    res.json({ success: true, pss });
  }, 4000);
};

export const approveLoungeEntryUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 라운지 입장승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '공항 라운지 입장승인 성공 (LOUNGE PASS ENTRY APPROVED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] LOUNGE PASS ENTRY APPROVED SUCCESSFULLY for pass ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief airport lounge manager role required for entry approval" });
  }
  const db = readDB();
  const pss = db.passes.find(p => p.id === id);
  if (pss) { pss.status = 'IN_USE'; writeDB(db); }
  res.json({ success: true, pss });
};

export const updatePassengerPartial = (req, res) => {
  const { id } = req.params;
  const { passengerName, phone, flightNo, seatNo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 승객 정보 수정 모달에서 이름, 항공편, 좌석번호를 동시에 수정하면,
  // backend data.json에는 이름(passengerName)과 좌석번호(seatNo)만 저장하고 항공편(flightNo)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const psg = db.passengers.find(p => p.id === id);
  if (psg) {
    if (passengerName) psg.passengerName = passengerName;
    if (seatNo) psg.seatNo = seatNo;
    // flightNo is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated passengerName and seatNo for passenger ${id}. flightNo was NOT updated.`);
  }
  res.json({ success: true, psg });
};

export const deleteCheckinLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.checkinLogs = db.checkinLogs.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 체크인 로그를 삭제(`DELETE /api/checkin-logs/:id`) 처리하여 체크인 로그 목록에서 소거하더라도,
  // loungeStats(라운지별 혼잡도, 좌석 이용률, 등급별 이용 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed checkin log ${id}. loungeStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-8001", name: "김라운지 (제1여객터미널 동편 마스터 매니저)", role: "MANAGER", terminal: "제1여객터미널 동편 4층 라운지", handledPasses: 520 }],
    lounges: [{ id: "LNG-01", loungeName: "제1여객터미널 동편 마스터 라운지", terminal: "제1여객터미널 동편 4층 라운지", gateNo: "게이트 28번 부근", totalSeats: 35, occupiedSeats: 28, congestion: "BUSY (혼잡 80%)" }],
    seats: [{ id: "SET-01", seatNo: "A-12 (싱글 프라이빗 리클라이너)", loungeName: "제1여객터미널 동편 마스터 라운지", zone: "RELAX_ZONE", status: "OCCUPIED" }],
    passengers: [{ id: "PSG-2001", passengerName: "최공항", phone: "010-7777-9999", flightNo: "KE-081 (인천 -> 뉴욕 JFK)", seatNo: "A-12 (싱글 프라이빗 리클라이너)", tier: "FIRST_CLASS", visitCount: 12 }],
    passes: [{ id: "PSS-7001", passCode: "LP-20260805-01", terminal: "제1여객터미널 동편 4층 라운지", passengerName: "최공항", flightNo: "KE-081 (인천 -> 뉴욕 JFK)", tier: "FIRST_CLASS", seatNo: "A-12 (싱글 프라이빗 리클라이너)", expireTime: "2026-08-05 23:59", feeWon: 150000, status: "IN_USE" }],
    checkinLogs: [{ id: "CLOG-6001", passId: "PSS-7001", passengerName: "최공항", loungeName: "제1여객터미널 동편 마스터 라운지", seatNo: "A-12", checkinTime: "2026-08-05 14:10", status: "CHECKED_IN" }],
    activityLogs: [{ id: "ACT-9991", passId: "PSS-7001", operator: "김라운지 (매니저)", action: "이용권 PSS-7001 최공항 승객님 퍼스트 라운지 체크인 및 좌석 A-12 배정 완료", timestamp: "2026-08-05 14:11:00", status: "SUCCESS" }],
    loungeStats: { totalPasses: 60, totalPassengers: 50, totalLounges: 10, totalSeats: 100, totalCheckinLogs: 90, expiringSoonCount: 8, inUseCount: 26, avgStayMinutes: 85 }
  };
  writeDB(initial);
  res.json({ success: true });
};
