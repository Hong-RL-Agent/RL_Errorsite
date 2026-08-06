import { readDB, writeDB } from '../services/dataService.js';

export const getMenus = (req, res) => {
  const db = readDB();
  res.json(db.menus);
};

export const getTickets = (req, res) => {
  const db = readDB();
  res.json(db.tickets);
};

export const getReservations = (req, res) => {
  const db = readDB();
  res.json(db.reservations);
};

export const getEmployees = (req, res) => {
  const db = readDB();
  res.json(db.employees);
};

export const searchMenus = (req, res) => {
  const { cafeteria, type } = req.query;
  const db = readDB();
  let list = db.menus;

  if (cafeteria && cafeteria !== 'ALL') {
    list = list.filter(m => m.cafeteria === cafeteria);
  }

  let delay = 100;
  if (cafeteria === 'CAFETERIA_1') {
    delay = 3000; // 3.0s delay
  } else if (cafeteria === 'CAFETERIA_2') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 식당 필터('CAFETERIA_1' 3초 지연 ➔ 'CAFETERIA_2' 0.2초 완료)와 메뉴 유형 필터를 빠르게 변경 시 
  // 오래된 이전 응답(CAFETERIA_1)이 최신 목록을 덮어쓰고, 중앙 메뉴 목록은 오래된 필터 결과, 오른쪽 식권 요약은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateReservationMenu = (req, res) => {
  const { id } = req.params;
  const { menuId, menuName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.menuId = menuId;
      resv.menuName = menuName;
      writeDB(db);
      console.log(`[DB MENU UPDATE] Updated menu for ${id} to ${menuName} (0.1s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 100);
};

export const updateReservationQuantity = (req, res) => {
  const { id } = req.params;
  const { quantity, menuId, menuName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 메뉴 예약 수량을 변경(3초 지연 완료)한 직후 예약 메뉴를 변경(0.1초 완료)하면, 
  // 메뉴 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 수량 변경 API 내부에 이전 구형 메뉴 ID(menuId, menuName)가 동봉 저장되어 
  // 새로고침 시 새 수량과 이전 메뉴 조합이 저장되는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.quantity = quantity;
      if (menuId && menuName) {
        resv.menuId = menuId; // Overwrites updated menu with stale value!
        resv.menuName = menuName;
      }
      writeDB(db);
      console.log(`[DB QUANTITY UPDATE] Updated quantity for ${id} to ${quantity} (3s done). Overwrote menu to ${menuName}`);
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

export const useTicketForReservation = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 메뉴 예약 취소(0.5초 완료) 직후 식권 사용 API를 호출(4초 지연 완료)하면, 
  // 예약 취소는 먼저 0.5초 만에 성공하지만 늦게 완료된 식권 사용 요청(4초 지연)이 취소된 예약을 'USED'(사용완료) 상태로 재활성화시킵니다. 
  // 내 예약 목록에서는 취소됨, 식권 사용 내역에서는 사용완료로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'USED'; // Re-activates cancelled reservation back to USED!
      writeDB(db);
      console.log(`[DB RE-ACTIVATE TICKET] Used ticket for ${id} (4s done). Re-activated status to USED!`);
    }
    res.json({ success: true, reservation: resv });
  }, 4000);
};

export const createReservation = (req, res) => {
  const { empId, empName, menuId, menuName, quantity } = req.body;
  const db = readDB();

  const newResv = {
    id: `RES-${String(db.reservations.length + 1).padStart(3, '0')}`,
    empId: empId || "EMP-01",
    empName: empName || "김철수 팀장",
    menuId: menuId || "MNU-101",
    menuName: menuName || "한식: 돈육 김치찌개",
    quantity: quantity || 1,
    date: new Date().toISOString().split('T')[0],
    mealTime: "LUNCH",
    status: "CONFIRMED"
  };

  db.reservations.unshift(newResv);
  writeDB(db);
  res.json({ success: true, reservation: newResv });
};

export const deleteReservation = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.reservations = db.reservations.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 데이터 불일치
  // DESCRIPTION: 메뉴 예약을 삭제(`DELETE /api/reservations/:id`) 처리하여 대장에서 소거하더라도, 
  // 메뉴별 예약 수량과 식당별 정산 통계(`cafeteriaStats.totalReservationsCount`) 수치에는 차감되지 않고 잔존 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE RESERVATION] Removed reservation ${id}. cafeteriaStats remain unchanged.`);
  res.json({ success: true });
};

export const deleteMenuUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 관리자 메뉴 삭제 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '메뉴 삭제 성공 (MENU DELETE SUCCESS - 200 OK)'으로 잘못 기록되어 보안감사 불일치가 발생하는 결함입니다.
  if (roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] MENU DELETE SUCCESS for ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  db.menus = db.menus.filter(m => m.id !== id);
  writeDB(db);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "menus": [
      { "id": "MNU-101", "name": "한식: 돈육 김치찌개 & 계란말이", "cafeteria": "CAFETERIA_1", "type": "KOREAN", "price": 7000, "popularity": 98, "calories": 650 }
    ],
    "tickets": [
      { "id": "TCK-001", "empId": "EMP-01", "empName": "김철수 팀장", "count": 12, "ticketType": "STANDARD", "boughtAt": "2026-08-01" }
    ],
    "reservations": [
      { "id": "RES-001", "empId": "EMP-01", "empName": "김철수 팀장", "menuId": "MNU-101", "menuName": "한식: 돈육 김치찌개", "quantity": 1, "date": "2026-08-10", "mealTime": "LUNCH", "status": "CONFIRMED" }
    ],
    "employees": [
      { "id": "EMP-01", "name": "김철수 팀장", "dept": "개발본부", "role": "ADMIN", "remainingTickets": 22, "lastUsedMenu": "한식: 제육 볶음", "nextReservationSummary": "김치찌개 1개 (08.10 점심)" }
    ],
    "cafeteriaStats": {
      "totalReservationsCount": 30,
      "totalTicketsSold": 340
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
