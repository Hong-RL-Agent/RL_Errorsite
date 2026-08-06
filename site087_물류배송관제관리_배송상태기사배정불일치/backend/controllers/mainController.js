import { readDB, writeDB } from '../services/dataService.js';

export const getUsers = (req, res) => {
  const db = readDB();
  res.json(db.users);
};

export const getCenters = (req, res) => {
  const db = readDB();
  res.json(db.centers);
};

export const getDrivers = (req, res) => {
  const db = readDB();
  res.json(db.drivers);
};

export const getOrders = (req, res) => {
  const db = readDB();
  res.json(db.orders);
};

export const getLogs = (req, res) => {
  const db = readDB();
  res.json(db.logs);
};

export const getInquiries = (req, res) => {
  const db = readDB();
  res.json(db.inquiries);
};

export const searchOrders = (req, res) => {
  const { centerId, status } = req.query;
  const db = readDB();
  let list = db.orders;

  if (centerId && centerId !== 'ALL') {
    list = list.filter(o => o.centerId === centerId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(o => o.status === status);
  }

  let delay = 100;
  if (centerId === 'CTR-01') {
    delay = 3000; // 3.0s delay
  } else if (centerId === 'CTR-02') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 물류센터 필터('CTR-01' 3초 지연 ➔ 'CTR-02' 0.2초 완료)와 배송 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(CTR-01)이 최신 목록을 덮어쓰고, 중앙 배송 목록은 오래된 필터 결과, 오른쪽 요약 패널은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateDriver = (req, res) => {
  const { id } = req.params;
  const { driverId, driverName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const ord = db.orders.find(o => o.id === id);
    if (ord) {
      ord.driverId = driverId;
      ord.driverName = driverName;
      writeDB(db);
      console.log(`[DB DRIVER UPDATE] Updated driver for ${id} to ${driverName} (0.1s done)`);
    }
    res.json({ success: true, order: ord });
  }, 100);
};

export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status, driverId, driverName } = req.body;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 배송 상태 변경 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '상태 변경 성공 (ORDER STATUS UPDATE SUCCESS - 200 OK)'으로 잘못 기록되어 보안감사 불일치가 발생하는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] ORDER STATUS UPDATE SUCCESS for ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend 상태 + Backend 요청 순서 충돌
  // DESCRIPTION: 배송 상태를 변경(3초 지연 완료)한 직후 담당 기사를 변경(0.1초 완료)하면, 
  // 기사 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API 내부에 이전 구형 기사 정보(driverId, driverName)가 동봉 저장되어 
  // 새로고침 시 새 배송 상태와 이전 기사 조합이 저장되는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const ord = db.orders.find(o => o.id === id);
    if (ord) {
      ord.status = status;
      if (driverId && driverName) {
        ord.driverId = driverId; // Overwrites updated driver with stale value!
        ord.driverName = driverName;
      }
      writeDB(db);
      console.log(`[DB STATUS UPDATE] Updated status for ${id} to ${status} (3s done). Overwrote driver to ${driverName}`);
    }
    res.json({ success: true, order: ord });
  }, 3000);
};

export const cancelOrder = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const ord = db.orders.find(o => o.id === id);
    if (ord) {
      ord.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL ORDER] Cancelled order ${id} (0.5s done)`);
    }
    res.json({ success: true, order: ord });
  }, 500);
};

export const reassignDriver = (req, res) => {
  const { id } = req.params;
  const { driverId, driverName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 배송 취소 API(0.5초 완료)를 호출한 직후 기사 재배정 API를 호출(4초 지연 완료)하면, 
  // 취소 요청은 먼저 0.5초 만에 성공하지만 늦게 완료된 재배정 요청(4초 지연)이 취소된 배송을 다시 'IN_DELIVERY'(배송중) 상태로 재활성화시킵니다. 
  // 배송 목록에서는 취소됨, 기사 작업 보드에서는 배송중으로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const ord = db.orders.find(o => o.id === id);
    if (ord) {
      ord.driverId = driverId || "DRV-001";
      ord.driverName = driverName || "김기사";
      ord.status = 'IN_DELIVERY'; // Re-activates cancelled order back to IN_DELIVERY!
      writeDB(db);
      console.log(`[DB RE-ACTIVATE ORDER] Reassigned driver for ${id} (4s done). Re-activated status to IN_DELIVERY!`);
    }
    res.json({ success: true, order: ord });
  }, 4000);
};

export const updateAddressPartial = (req, res) => {
  const { id } = req.params;
  const { zipcode, detailAddress, deliveryMemo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 배송 주소를 수정하는 모달에서 우편번호, 상세주소, 배송메모를 한 번에 수정하면, 
  // backend data.json에는 우편번호(zipcode)와 배송메모(deliveryMemo)만 저장하고 상세주소(detailAddress)는 이전 값을 그대로 유지하는 partial save 결함입니다.
  const db = readDB();
  const ord = db.orders.find(o => o.id === id);
  if (ord) {
    if (zipcode) ord.zipcode = zipcode;
    if (deliveryMemo) ord.deliveryMemo = deliveryMemo;
    // detailAddress is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated zipcode and memo for ${id}. detailAddress was NOT updated.`);
  }
  res.json({ success: true, order: ord });
};

export const deleteLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.logs = db.logs.filter(l => l.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 배송 완료 로그를 삭제(`DELETE /api/logs/:id`) 처리하여 대장에서 소거하더라도, 
  // 관제 대시보드의 완료 배송 수(`controlStats.completedOrdersCount`)와 물류센터별 처리량 그래프 수치에는 차감되지 않고 잔존 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed log ${id}. controlStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "users": [
      { "id": "ADM-01", "name": "김관제 팀장", "role": "ADMIN", "dept": "종합관제센터" }
    ],
    "centers": [
      { "id": "CTR-01", "name": "서울 중앙 물류센터", "location": "서울특별시 성동구", "capacity": 5000, "currentProcessing": 4120 }
    ],
    "drivers": [
      { "id": "DRV-001", "name": "김기사", "phone": "010-1001-2001", "vehicleNo": "서울80바 1234", "centerId": "CTR-01", "assignedCount": 8, "status": "WORKING" }
    ],
    "orders": [
      { "id": "ORD-1001", "waybillNo": "WB-2026-0801", "customerName": "김철수", "customerPhone": "010-1111-2222", "zipcode": "04524", "address": "서울특별시 중구 세종대로 110", "detailAddress": "101동 1502호", "deliveryMemo": "문 앞에 놓아주세요", "centerId": "CTR-01", "centerName": "서울 중앙 물류센터", "driverId": "DRV-001", "driverName": "김기사", "itemTitle": "프리미엄 롱패딩 패키지", "deliveryFee": 3500, "delayMinutes": 120, "status": "IN_DELIVERY", "adminId": "ADM-01" }
    ],
    "logs": [
      { "id": "LOG-001", "orderId": "ORD-1001", "waybillNo": "WB-2026-0801", "action": "STATUS_CHANGED", "status": "IN_DELIVERY", "timestamp": "2026-08-03 09:15:00", "operator": "김관제 팀장" }
    ],
    "inquiries": [
      { "id": "INQ-101", "orderId": "ORD-1001", "customerName": "김철수", "title": "배송 기사님 출발 시각 문의", "status": "ANSWERED", "content": "오늘 14시 경 문 앞 배송 예정입니다." }
    ],
    "controlStats": {
      "totalOrdersCount": 35,
      "delayedOrdersCount": 4,
      "completedOrdersCount": 8
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
