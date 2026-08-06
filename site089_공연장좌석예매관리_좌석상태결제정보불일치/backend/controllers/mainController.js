import { readDB, writeDB } from '../services/dataService.js';

export const getUsers = (req, res) => {
  const db = readDB();
  res.json(db.users);
};

export const getShows = (req, res) => {
  const db = readDB();
  res.json(db.shows);
};

export const getSeats = (req, res) => {
  const db = readDB();
  res.json(db.seats);
};

export const getReservations = (req, res) => {
  const db = readDB();
  res.json(db.reservations);
};

export const getTicketLogs = (req, res) => {
  const db = readDB();
  res.json(db.ticketLogs);
};

export const searchSeats = (req, res) => {
  const { date, grade } = req.query;
  const db = readDB();
  let list = db.seats;

  if (grade && grade !== 'ALL') {
    list = list.filter(s => s.grade === grade);
  }

  let delay = 100;
  if (date === '2026-08-15') {
    delay = 3000; // 3.0s delay
  } else if (date === '2026-08-16') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 공연 날짜 필터('2026-08-15' 3초 지연 ➔ '2026-08-16' 0.2초 완료)와 좌석 등급 필터를 빠르게 변경 시 
  // 오래된 이전 응답(08-15)이 최신 좌석 목록을 덮어쓰고, 좌석도는 오래된 좌석 상태, 오른쪽 가격 요약은 최신 필터 기준 가격으로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updatePurchaser = (req, res) => {
  const { id } = req.params;
  const { userName, seatNo } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.userName = userName;
      if (seatNo) {
        resv.seatNo = seatNo; // Overwrites seatNo with stale seatNo!
      }
      writeDB(db);
      console.log(`[DB PURCHASER UPDATE] Updated purchaser for ${id} to ${userName} (0.1s done) with seat ${seatNo}`);
    }
    res.json({ success: true, reservation: resv });
  }, 100);
};

export const updateSeat = (req, res) => {
  const { id } = req.params;
  const { seatNo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 좌석을 변경(3초 지연 완료)한 직후 예매자 정보를 수정(0.1초 완료)하면, 
  // 예매자 정보 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 좌석 변경 API 내부에 이전 구형 예매자 정보(userName)가 동봉 저장되어 
  // 새로고침 시 예매 확인 화면의 예매자명과 티켓 상세의 예매자명이 서로 달라지는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.seatNo = seatNo;
      writeDB(db);
      console.log(`[DB SEAT UPDATE] Updated seat for ${id} to ${seatNo} (3s done)`);
    }
    res.json({ success: true, reservation: resv });
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
      console.log(`[DB CANCEL RESERVATION] Cancelled reservation ${id} (0.5s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 500);
};

export const issueTicket = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 티켓 발권 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '티켓 발권 성공 (TICKET ISSUE SUCCESS - 200 OK)'으로 잘못 기록되어 보안감사 불일치가 발생하는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] TICKET ISSUE SUCCESS for ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin ticket operator privilege required" });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예매 취소 API(0.5초 완료)를 호출한 직후 관리자 티켓 발권 API를 호출(4초 지연 완료)하면, 
  // 취소 요청은 먼저 0.5초 만에 성공하지만 늦게 완료된 발권 요청(4초 지연)이 취소된 예매를 다시 'ISSUED'(발권완료) 상태로 재활성화시킵니다. 
  // 내 티켓에서는 취소됨, 관리자 좌석 현황에서는 발권완료로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'ISSUED';
      writeDB(db);
      console.log(`[DB RE-ACTIVATE TICKET] Issued ticket for ${id} (4s done). Re-activated status to ISSUED!`);
    }
    res.json({ success: true, reservation: resv });
  }, 4000);
};

export const updateShowPartial = (req, res) => {
  const { id } = req.params;
  const { time, venue, price } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 공연 정보 수정 모달에서 공연 시간, 장소, 좌석 가격을 동시에 수정하면, 
  // backend data.json에는 공연 시간(time)과 좌석 가격(price)만 저장하고 장소(venue)는 이전 값을 그대로 유지하는 partial save 결함입니다.
  const db = readDB();
  const shw = db.shows.find(s => s.id === id);
  if (shw) {
    if (time) shw.time = time;
    if (price) shw.vipPrice = price;
    // venue is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated time and price for show ${id}. venue was NOT updated.`);
  }
  res.json({ success: true, show: shw });
};

export const deleteReservation = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.reservations = db.reservations.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 예매 데이터를 삭제(`DELETE /api/reservations/:id`) 처리하여 대장에서 소거하더라도, 
  // 공연별 예매율(`stageStats.seatOccupancyRate`), 점유율, 관리자 매출 통계 수치에는 차감되지 않고 계속 잔존 포함되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE RESERVATION] Removed reservation ${id}. stageStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "ADM-201", "name": "김기획 팀장", "role": "ADMIN", "dept": "공연기획팀" }
    ],
    "users": [
      { "id": "USR-001", "name": "김철수", "phone": "010-1111-2222", "role": "USER", "email": "chulsoo@stage.com" }
    ],
    "shows": [
      { "id": "SHOW-01", "title": "오페라의 유령 (The Phantom of the Opera)", "genre": "뮤지컬", "venue": "샤롯데씨어터", "date": "2026-08-15", "time": "19:30", "vipPrice": 160000, "rPrice": 130000, "sPrice": 100000, "popularity": 98, "status": "OPEN" }
    ],
    "seats": [
      { "id": "ST-A1", "seatNo": "VIP-A1", "grade": "VIP", "price": 160000, "status": "OCCUPIED" }
    ],
    "reservations": [
      { "id": "RES-5001", "showId": "SHOW-01", "showTitle": "오페라의 유령", "showDate": "2026-08-15", "userId": "USR-001", "userName": "김철수", "seatNo": "VIP-A1", "price": 160000, "status": "ISSUED" }
    ],
    "ticketLogs": [
      { "id": "TLOG-001", "reservationId": "RES-5001", "action": "TICKET_ISSUED", "seatNo": "VIP-A1", "timestamp": "2026-08-03 09:00:00", "operator": "김기획 팀장" }
    ],
    "stageStats": {
      "totalReservationsCount": 35,
      "seatOccupancyRate": 29,
      "totalSalesRevenue": 3650000
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
