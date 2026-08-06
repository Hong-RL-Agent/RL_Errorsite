import { readDB, writeDB } from '../services/dataService.js';

export const getOrders = (req, res) => {
  const db = readDB();
  res.json(db.orders);
};

export const getReturns = (req, res) => {
  const db = readDB();
  res.json(db.returns);
};

export const searchReturns = (req, res) => {
  const { status, reason } = req.query;
  const db = readDB();
  let list = db.returns;

  if (status && status !== 'ALL') {
    list = list.filter(r => r.status === status);
  }

  let delay = 100;
  if (status === 'REQUESTED') {
    delay = 3000; // 3.0s delay
  } else if (status === 'APPROVED') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 처리 상태 필터('REQUESTED' 3초 지연 ➔ 'APPROVED' 0.2초 완료)와 반품 사유 필터를 빠르게 변경 시 
  // 오래된 이전 응답(REQUESTED)이 최신 목록을 덮어쓰고, 중앙 반품 목록은 오래된 필터 결과, 오른쪽 환불 요약은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const getExchanges = (req, res) => {
  const db = readDB();
  res.json(db.exchanges);
};

export const getInquiries = (req, res) => {
  const db = readDB();
  res.json(db.inquiries);
};

export const updatePickupDate = (req, res) => {
  const { id } = req.params;
  const { pickupDate } = req.body;

  setTimeout(() => {
    const db = readDB();
    const ret = db.returns.find(r => r.id === id);
    if (ret) {
      ret.pickupDate = pickupDate;
      writeDB(db);
      console.log(`[DB PICKUP DATE UPDATE] Updated pickupDate for ${id} to ${pickupDate} (0.1s done)`);
    }
    res.json({ success: true, returnItem: ret });
  }, 100);
};

export const updateReason = (req, res) => {
  const { id } = req.params;
  const { reason, pickupDate } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 반품 사유를 변경(3초 지연 완료)한 직후 수거 일정을 변경(0.1초 완료)하면, 
  // 수거 일정 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 사유 변경 API 내부에 이전 구형 수거 일정(pickupDate)이 동봉 저장되어 
  // 새로고침 시 새 사유와 이전 수거 일정 조합이 저장되는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const ret = db.returns.find(r => r.id === id);
    if (ret) {
      ret.reason = reason;
      if (pickupDate) {
        ret.pickupDate = pickupDate; // Overwrites updated pickupDate with stale value!
      }
      writeDB(db);
      console.log(`[DB REASON UPDATE] Updated reason for ${id} to ${reason} (3s done). Overwrote pickupDate to ${pickupDate}`);
    }
    res.json({ success: true, returnItem: ret });
  }, 3000);
};

export const cancelReturn = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const ret = db.returns.find(r => r.id === id);
    if (ret) {
      ret.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL RETURN] Cancelled return ${id} (0.5s done)`);
    }
    res.json({ success: true, returnItem: ret });
  }, 500);
};

export const approveRefund = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 환불 승인 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '환불 승인 성공 (REFUND APPROVAL SUCCESS - 200 OK)'으로 잘못 기록되어 보안감사 불일치가 발생하는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] REFUND APPROVAL SUCCESS for ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 반품 취소(0.5초 완료) 직후 관리자 환불 승인 API를 호출(4초 지연 완료)하면, 
  // 반품 취소는 먼저 0.5초 만에 성공하지만 늦게 완료된 환불 승인 요청(4초 지연)이 취소된 반품을 다시 'APPROVED'(환불 승인) 상태로 재활성화시킵니다. 
  // 주문 상세에서는 반품 취소, 관리자 처리 화면에서는 환불 승인으로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const ret = db.returns.find(r => r.id === id);
    if (ret) {
      ret.status = 'APPROVED'; // Re-activates cancelled return back to APPROVED!
      writeDB(db);
      console.log(`[DB RE-ACTIVATE RETURN] Approved refund for ${id} (4s done). Re-activated status to APPROVED!`);
    }
    res.json({ success: true, returnItem: ret });
  }, 4000);
};

export const deleteReturn = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.returns = db.returns.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 데이터 불일치
  // DESCRIPTION: 반품 요청을 삭제(`DELETE /api/returns/:id`) 처리하여 대장에서 소거하더라도, 
  // 상품별 반품률과 월별 환불 금액 통계(`refundStats.totalRefundAmount`) 수치에는 차감되지 않고 잔존 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE RETURN] Removed return ${id}. refundStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "orders": [
      { "id": "ORD-001", "productName": "프리미엄 롱 패딩 점퍼 L", "price": 189000, "customerName": "김철수", "orderDate": "2026-07-20", "status": "DELIVERED" }
    ],
    "returns": [
      { "id": "RET-001", "orderId": "ORD-001", "productName": "프리미엄 롱 패딩 점퍼 L", "customerName": "김철수", "reason": "사이즈 불일치 (생각보다 큼)", "refundAmount": 189000, "pickupDate": "2026-08-06", "status": "REQUESTED", "adminId": "ADM-01" }
    ],
    "exchanges": [
      { "id": "EXC-001", "orderId": "ORD-001", "productName": "프리미엄 롱 패딩 점퍼", "targetSize": "M (한사이즈 다운)", "status": "IN_PROGRESS" }
    ],
    "inquiries": [
      { "id": "INQ-001", "orderId": "ORD-001", "customerName": "김철수", "title": "반품 수거 기사님 방문 시각 변경 가능한가요?", "status": "ANSWERED", "content": "8월 6일 오후 2시 이후 방문 부탁드립니다." }
    ],
    "refundStats": {
      "totalRefundAmount": 2890000,
      "totalReturnsCount": 25
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
