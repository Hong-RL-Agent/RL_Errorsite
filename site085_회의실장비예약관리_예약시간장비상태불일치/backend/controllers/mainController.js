import { readDB, writeDB } from '../services/dataService.js';

export const getRooms = (req, res) => {
  const db = readDB();
  res.json(db.rooms);
};

export const getEquipments = (req, res) => {
  const db = readDB();
  res.json(db.equipments);
};

export const getReservations = (req, res) => {
  const db = readDB();
  res.json(db.reservations);
};

export const getEmployees = (req, res) => {
  const db = readDB();
  res.json(db.employees);
};

export const searchRooms = (req, res) => {
  const { floor, type } = req.query;
  const db = readDB();
  let list = db.rooms;

  if (floor && floor !== 'ALL') {
    list = list.filter(r => r.floor === parseInt(floor));
  }

  let delay = 100;
  if (floor === '3') {
    delay = 3000; // 3.0s delay
  } else if (floor === '2') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 층 필터('3층' 3초 지연 ➔ '2층' 0.2초 완료)와 장비 유형 필터를 빠르게 변경 시 
  // 오래된 이전 응답(3층)이 최신 목록을 덮어쓰고, 중앙 회의실 목록은 오래된 필터 결과, 오른쪽 예약 요약은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateReservationEquipment = (req, res) => {
  const { id } = req.params;
  const { equipments } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.equipments = equipments;
      writeDB(db);
      console.log(`[DB EQUIPMENT UPDATE] Updated equipments for ${id} (0.1s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 100);
};

export const updateReservationTime = (req, res) => {
  const { id } = req.params;
  const { date, timeSlot, equipments } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 회의실 예약 시간을 변경(3초 지연 완료)한 직후 장비를 추가(0.1초 완료)하면, 
  // 장비 추가 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 시간 변경 API 내부에 이전 구형 장비 목록(equipments)이 동봉 저장되어 
  // 새로고침 시 새 시간과 이전 장비 목록 조합이 저장되는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.date = date;
      resv.timeSlot = timeSlot;
      if (equipments) {
        resv.equipments = equipments; // Overwrites updated equipments with stale value!
      }
      writeDB(db);
      console.log(`[DB TIME UPDATE] Updated time for ${id} to ${date} ${timeSlot} (3s done). Overwrote equipments`);
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

export const returnEquipmentStatus = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소(0.5초 완료) 직후 장비 반납 처리 API를 호출(4초 지연 완료)하면, 
  // 예약 취소는 먼저 0.5초 만에 성공하지만 늦게 완료된 반납 처리 요청(4초 지연)이 취소된 예약을 'COMPLETED'(사용완료) 상태로 재활성화시킵니다. 
  // 내 예약 목록에서는 취소됨, 관리자 통계에서는 사용완료로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'COMPLETED'; // Re-activates cancelled reservation back to COMPLETED!
      writeDB(db);
      console.log(`[DB RE-ACTIVATE RESERVATION] Returned equipment for ${id} (4s done). Re-activated status to COMPLETED!`);
    }
    res.json({ success: true, reservation: resv });
  }, 4000);
};

export const reserveEquipment = (req, res) => {
  const { eqpId, empId, empName } = req.body;
  const db = readDB();

  const eqp = db.equipments.find(e => e.id === eqpId);
  if (eqp) {
    eqp.useCount += 1;
    eqp.status = 'IN_USE';
    writeDB(db);
  }

  res.json({ success: true, equipment: eqp });
};

export const deleteReservation = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.reservations = db.reservations.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 데이터 불일치
  // DESCRIPTION: 장비 예약을 삭제(`DELETE /api/reservations/:id`) 처리하여 대장에서 소거하더라도, 
  // 장비별 사용 횟수와 월별 사용 통계(`usageStats.totalReservationsCount`) 수치에는 차감되지 않고 잔존 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE RESERVATION] Removed reservation ${id}. usageStats remain unchanged.`);
  res.json({ success: true });
};

export const updateEquipmentStatusUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 장비 상태 변경 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '장비 상태 변경 성공 (EQUIPMENT STATUS UPDATE SUCCESS - 200 OK)'으로 잘못 기록되어 보안감사 불일치가 발생하는 결함입니다.
  if (roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] EQUIPMENT STATUS UPDATE SUCCESS for ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  const eqp = db.equipments.find(e => e.id === id);
  if (eqp) {
    eqp.status = req.body.status || 'AVAILABLE';
    writeDB(db);
  }
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "rooms": [
      { "id": "ROOM-101", "name": "1층 에메랄드 대회의실", "floor": 1, "capacity": 20, "equipmentOptions": ["4K 빔프로젝터"], "status": "AVAILABLE" }
    ],
    "equipments": [
      { "id": "EQP-001", "name": "EPSON 4K 고해상도 빔프로젝터", "type": "PROJECTOR", "available": true, "status": "AVAILABLE", "useCount": 42 }
    ],
    "reservations": [
      { "id": "RES-001", "roomId": "ROOM-101", "roomName": "1층 에메랄드 대회의실", "empId": "EMP-01", "empName": "김철수 팀장", "date": "2026-08-10", "timeSlot": "10:00-12:00", "equipments": ["EPSON 4K 고해상도 빔프로젝터"], "purpose": "사업 실적 전략 회의", "status": "CONFIRMED" }
    ],
    "employees": [
      { "id": "EMP-01", "name": "김철수 팀장", "dept": "개발본부", "role": "ADMIN", "reservationCount": 5, "lastUsedEquipment": "EPSON 4K 빔프로젝터", "nextRoomSummary": "1층 에메랄드 대회의실 (08.10 10:00)" }
    ],
    "usageStats": {
      "totalReservationsCount": 30,
      "totalEquipmentCount": 25
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
