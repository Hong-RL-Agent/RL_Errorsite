import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => {
  const db = readDB();
  res.json(db.staffs);
};

export const getFlights = (req, res) => {
  const db = readDB();
  res.json(db.flights);
};

export const getPassengers = (req, res) => {
  const db = readDB();
  res.json(db.passengers);
};

export const getBaggage = (req, res) => {
  const db = readDB();
  res.json(db.baggage);
};

export const getLostClaims = (req, res) => {
  const db = readDB();
  res.json(db.lostClaims);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchBaggage = (req, res) => {
  const { flightNo, status, search } = req.query;
  const db = readDB();
  let list = db.baggage;

  if (flightNo && flightNo !== 'ALL') {
    list = list.filter(b => b.flightNo === flightNo);
  }
  if (status && status !== 'ALL') {
    list = list.filter(b => b.status === status);
  }
  if (search) {
    list = list.filter(b => b.passengerName.includes(search) || b.tagNo.includes(search) || b.id.includes(search));
  }

  let delay = 100;
  if (flightNo === 'KE081') {
    delay = 3000; // 3.0s delay for KE081
  } else if (flightNo === 'OZ202') {
    delay = 200; // 0.2s delay for OZ202
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 항공편 필터('KE081' 3초 지연 ➔ 'OZ202' 0.2초 완료)와 수하물 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(KE081)이 최신 수하물 목록을 덮어쓰고, 중앙 목록은 오래된 필터 결과, 오른쪽 처리 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateBaggageStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 수하물 상태를 '지연'(DELAYED)으로 변경(3초 지연 완료)한 직후 담당 직원을 변경(0.1초 완료)하면, 
  // 담당자 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 담당자)을 덮어써 저장되어 
  // 새로고침 시 수하물 목록의 담당자와 상세 패널의 담당자가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const bag = dbSnapshot.baggage.find(b => b.id === id);
    if (bag) {
      bag.status = status;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back handler assignment changes made during the 3s delay
      console.log(`[DB BAGGAGE STATUS UPDATE] Updated status for baggage ${id} to ${status} (3s done, rolled back handler update)`);
    }
    res.json({ success: true, bag });
  }, 3000);
};

export const updateBaggageHandler = (req, res) => {
  const { id } = req.params;
  const { handlerName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const bag = db.baggage.find(b => b.id === id);
    if (bag) {
      bag.handlerName = handlerName;
      writeDB(db);
      console.log(`[DB HANDLER ASSIGN UPDATE] Updated baggage ${id} handlerName to ${handlerName} (0.1s done)`);
    }
    res.json({ success: true, bag });
  }, 100);
};

export const cancelLostClaim = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const claim = db.lostClaims.find(c => c.id === id);
    if (claim) {
      claim.status = 'CANCELLED';
      const bag = db.baggage.find(b => b.id === claim.baggageId);
      if (bag) {
        bag.status = 'CLAIMED';
      }
      writeDB(db);
      console.log(`[DB CANCEL LOST CLAIM] Claim ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, claim });
  }, 500);
};

export const updateBaggageLocation = (req, res) => {
  const { id } = req.params;
  const { location } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 분실 신고 취소 API(0.5초 완료)를 호출한 직후 수하물 위치 갱신 API를 호출(4초 지연 완료)하면, 
  // 신고 취소는 성공하지만 늦게 완료된 위치 갱신 요청(4초 지연)이 취소된 신고를 다시 'LOST_REPORTED'(분실신고) 상태로 활성화해버립니다. 
  // 승객 화면에서는 신고 취소, 직원 처리 화면에서는 분실신고 처리중으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const bag = db.baggage.find(b => b.id === id);
    if (bag) {
      bag.status = 'LOST_REPORTED'; // INTENTIONAL_ERROR: Overwrites CANCELLED status back to LOST_REPORTED!
      if (location) bag.location = location;
      console.log(`[DB RESTORE CANCELLED CLAIM] Re-activated baggage ${id} back to LOST_REPORTED status via location update!`);
      const claim = db.lostClaims.find(c => c.baggageId === id);
      if (claim) {
        claim.status = 'IN_PROGRESS';
      }
    }
    writeDB(db);
    res.json({ success: true, bag });
  }, 4000);
};

export const closeClaimUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 분실 신고 종결 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '분실 신고 종결 성공 (LOST CLAIM CLOSED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] LOST CLAIM CLOSED SUCCESSFULLY for claim ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Manager role required to close lost baggage claim" });
  }

  const db = readDB();
  const claim = db.lostClaims.find(c => c.id === id);
  if (claim) {
    claim.status = 'CLOSED';
    writeDB(db);
  }
  res.json({ success: true, claim });
};

export const updatePassengerPartial = (req, res) => {
  const { id } = req.params;
  const { phone, deliveryAddress, requests } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 승객 정보 수정 모달에서 연락처, 수령 주소, 요청사항을 동시에 수정하면, 
  // backend data.json에는 연락처(phone)와 요청사항(requests)만 저장하고 수령 주소(deliveryAddress)는 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const passenger = db.passengers.find(p => p.id === id);
  if (passenger) {
    if (phone) passenger.phone = phone;
    if (requests) passenger.requests = requests;
    // deliveryAddress is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated phone and requests for passenger ${id}. deliveryAddress was NOT updated.`);
  }
  res.json({ success: true, passenger });
};

export const deleteProcessingLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.activityLogs = db.activityLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 수하물 처리 로그를 삭제(`DELETE /api/processing-logs/:id`) 처리하여 로그 목록에서 소거하더라도, 
  // 항공편별 지연 수하물 수(`baggageStats.delayedCount`), 분실 신고율, 직원별 처리량 통계 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE PROCESSING LOG] Removed log ${id}. baggageStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "staffs": [
      { "id": "STAFF-3001", "name": "김수하 (수석 핸들러)", "role": "MANAGER", "dept": "수하물 관제 1팀", "processedBags": 165 }
    ],
    "flights": [
      { "id": "FLT-01", "flightNo": "KE081", "airline": "대한항공", "origin": "JFK 뉴욕", "destination": "ICN 인천", "gate": "108" }
    ],
    "passengers": [
      { "id": "PSG-2001", "name": "김동남", "phone": "010-1111-2222", "deliveryAddress": "서울특별시 강남구 테헤란로 123 래미안 101동 202호", "requests": "파손 위험 취급주의 스티커 부착" }
    ],
    "baggage": [
      { "id": "BAG-1001", "tagNo": "BAG-88001", "passengerId": "PSG-2001", "passengerName": "김동남", "flightNo": "KE081", "status": "DELAYED", "weightKg": 23.5, "location": "T1 2층 지연 보관소 B-3", "handlerName": "김수하 (수석 핸들러)" }
    ],
    "lostClaims": [
      { "id": "LOST-4001", "baggageId": "BAG-1004", "passengerName": "최트래블", "flightNo": "LJ002", "claimDate": "2026-08-03", "description": "LAX 환승 중 미도착. 캐리어 검은색 샘소나이트 28인치", "status": "IN_PROGRESS", "handlerName": "이분실 (분실 전담)" }
    ],
    "activityLogs": [
      { "id": "LOG-5001", "baggageId": "BAG-1001", "operator": "김수하 (수석 핸들러)", "action": "수하물 상태 DELAYED(지연)으로 등록 및 장소 지정", "timestamp": "2026-08-03 10:15:00", "status": "SUCCESS" }
    ],
    "baggageStats": {
      "totalBaggage": 55,
      "delayedCount": 12,
      "claimedCount": 26,
      "lostReportedCount": 7,
      "inTransitCount": 10,
      "claimResolutionRate": 88.5,
      "avgDeliveryDays": 1.2
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
