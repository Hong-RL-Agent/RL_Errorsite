import { readDB, writeDB } from '../services/dataService.js';

export const getAdmins = (req, res) => {
  const db = readDB();
  res.json(db.admins);
};

export const getRooms = (req, res) => {
  const db = readDB();
  res.json(db.rooms);
};

export const getReservations = (req, res) => {
  const db = readDB();
  res.json(db.reservations);
};

export const getStaff = (req, res) => {
  const db = readDB();
  res.json(db.housekeepingStaff);
};

export const getCleaningLogs = (req, res) => {
  const db = readDB();
  res.json(db.cleaningLogs);
};

export const getRequests = (req, res) => {
  const db = readDB();
  res.json(db.guestRequests);
};

export const searchRooms = (req, res) => {
  const { floor, status } = req.query;
  const db = readDB();
  let list = db.rooms;

  if (floor && floor !== 'ALL') {
    list = list.filter(r => r.floor === parseInt(floor));
  }
  if (status && status !== 'ALL') {
    list = list.filter(r => r.status === status);
  }

  let delay = 100;
  if (floor === '1') {
    delay = 3000; // 3.0s delay for 1F
  } else if (floor === '2') {
    delay = 200; // 0.2s delay for 2F
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 층 필터('1층' 3초 지연 ➔ '2층' 0.2초 완료)와 객실 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(1층)이 최신 객실 목록을 덮어쓰고, 객실 배치도는 오래된 필터 결과, 오른쪽 객실 요약은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateRoomStaff = (req, res) => {
  const { id } = req.params;
  const { cleanerId, cleanerName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const room = db.rooms.find(r => r.id === id);
    if (room) {
      room.cleanerId = cleanerId;
      room.cleanerName = cleanerName;
      writeDB(db);
      console.log(`[DB STAFF UPDATE] Updated staff for room ${id} to ${cleanerName} (0.1s done)`);
    }
    res.json({ success: true, room });
  }, 100);
};

export const updateRoomStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 객실 상태를 'CLEANING'(청소중)으로 변경(3초 지연 완료)한 직후 하우스키핑 직원을 변경(0.1초 완료)하면, 
  // 직원 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 객실 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 직원)을 덮어써 저장되어 
  // 새로고침 시 객실 카드의 담당 직원과 청소 작업 상세의 담당 직원이 불일치하는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request (with OLD staff)
  setTimeout(() => {
    const room = dbSnapshot.rooms.find(r => r.id === id);
    if (room) {
      room.status = status;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back staff changes made during the 3s delay
      console.log(`[DB ROOM STATUS UPDATE] Updated status for room ${id} to ${status} (3s done, rolled back staff update)`);
    }
    res.json({ success: true, room });
  }, 3000);
};

export const checkoutRoom = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const room = db.rooms.find(r => r.id === id);
    if (room) {
      room.status = 'CHECKED_OUT';
      writeDB(db);
      console.log(`[DB CHECKOUT ROOM] Room ${id} checked out (0.5s done)`);
    }
    res.json({ success: true, room });
  }, 500);
};

export const completeCleaning = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 체크아웃 처리 API(0.5초 완료)를 호출한 직후 청소 완료 API를 호출(4초 지연 완료)하면, 
  // 체크아웃 처리는 성공하지만 늦게 완료된 청소 완료 요청(4초 지연)이 객실을 'CHECKED_IN'(체크인) 상태로 다시 바꿔버립니다. 
  // 객실 배치도에서는 체크아웃으로 보이고, 하우스키핑 보드에서는 체크인 객실로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const room = db.rooms.find(r => r.id === id);
    if (room) {
      room.status = 'CHECKED_IN'; // Re-activates room status back to CHECKED_IN instead of CLEANED!
      console.log(`[DB RE-ACTIVATE ROOM STATUS] Re-activated room ${id} back to CHECKED_IN status!`);
    }
    writeDB(db);
    res.json({ success: true, room });
  }, 4000);
};

export const inspectRoom = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 객실 점검 완료 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '객실 점검 완료 성공 (ROOM INSPECTION COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 감사 불일치 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] ROOM INSPECTION COMPLETED SUCCESSFULLY for room ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  const room = db.rooms.find(r => r.id === id);
  if (room) {
    room.status = 'CLEANED';
    writeDB(db);
  }
  res.json({ success: true, room });
};

export const updateRoomPartial = (req, res) => {
  const { id } = req.params;
  const { roomType, price, cleaningNote } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 객실 정보 수정 모달에서 객실 타입, 숙박 가격, 청소 메모를 동시에 수정하면, 
  // backend data.json에는 객실 타입(type)과 청소 메모(cleaningNote)만 저장하고 숙박 가격(price)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것처럼 표시하는 partial save 결함입니다.
  const db = readDB();
  const room = db.rooms.find(r => r.id === id);
  if (room) {
    if (roomType) room.type = roomType;
    if (cleaningNote) room.cleaningNote = cleaningNote;
    // price is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated roomType and cleaningNote for room ${id}. price was NOT updated.`);
  }
  res.json({ success: true, room });
};

export const deleteCleaningLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.cleaningLogs = db.cleaningLogs.filter(l => l.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 청소 완료 로그를 삭제(`DELETE /api/cleaning-logs/:id`) 처리하여 이력 대장에서 소거하더라도, 
  // 직원별 완료 건수, 객실 청소율(`hotelStats.cleaningCompletionRate`), 대시보드 통계 수치에는 차감되지 않고 계속 잔존 포함되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE CLEANING LOG] Removed log ${id}. hotelStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "ADM-001", "name": "김지배인 (총지배인)", "role": "ADMIN", "dept": "호텔 총괄 운영팀" },
      { "id": "ADM-002", "name": "이하우스 (하우스키핑 매니저)", "role": "ADMIN", "dept": "객실 관리팀" },
      { "id": "ADM-003", "name": "박스태프 (일반 사원)", "role": "STAFF", "dept": "프론트 데스크" }
    ],
    "housekeepingStaff": [
      { "id": "STF-01", "name": "김청소 (1층 담당)", "shift": "DAY", "completedCount": 8, "status": "ACTIVE" },
      { "id": "STF-02", "name": "이깔끔 (1층 담당)", "shift": "DAY", "completedCount": 7, "status": "ACTIVE" }
    ],
    "rooms": [
      { "id": "101", "floor": 1, "type": "디럭스 킹", "price": 150000, "status": "CHECKED_IN", "cleanerId": "STF-01", "cleanerName": "김청소 (1층 담당)", "cleaningNote": "입실 완료 / 마실물 추가 요청", "guestName": "홍길동" }
    ],
    "reservations": [
      { "id": "RES-1001", "roomId": "101", "guestName": "홍길동", "phone": "010-1111-2222", "checkIn": "2026-08-03", "checkOut": "2026-08-05", "status": "CHECKED_IN" }
    ],
    "cleaningLogs": [
      { "id": "LOG-5001", "roomId": "105", "staffId": "STF-01", "staffName": "김청소 (1층 담당)", "type": "일반 청소", "completedAt": "2026-08-03 09:30:00", "status": "COMPLETED" }
    ],
    "guestRequests": [
      { "id": "REQ-2001", "roomId": "101", "guestName": "홍길동", "request": "생수 2병 추가 투입 요청", "status": "COMPLETED", "createdAt": "2026-08-03 14:00" }
    ],
    "hotelStats": {
      "totalRooms": 45,
      "occupiedRooms": 18,
      "occupancyRate": 40.0,
      "cleaningCompletionRate": 78.5
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
