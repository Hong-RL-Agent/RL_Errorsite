import { readDB, writeDB } from '../services/dataService.js';

export const getCenters = (req, res) => {
  const db = readDB();
  res.json(db.centers);
};

export const searchCenters = (req, res) => {
  const { region, serviceType } = req.query;
  const db = readDB();
  let list = db.centers;

  if (region && region !== 'ALL') {
    list = list.filter(c => c.region === region);
  }
  if (serviceType && serviceType !== 'ALL') {
    list = list.filter(c => c.serviceType === serviceType);
  }

  let delay = 100;
  if (region === '강남구') {
    delay = 3000; // 3.0s delay
  } else if (region === '마포구') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 지역 필터('강남구' 3초 지연 ➔ '마포구' 0.2초 완료)와 정비 항목 필터를 빠르게 변경 시 
  // 오래된 이전 응답(강남구)이 최신 목록을 덮어쓰고, 오른쪽 견적 패널에는 다른 정비소 기준 가격이 표시되는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const getVehicles = (req, res) => {
  const db = readDB();
  res.json(db.vehicles);
};

export const getReservations = (req, res) => {
  const db = readDB();
  res.json(db.reservations);
};

export const updateDate = (req, res) => {
  const { id } = req.params;
  const { date } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.date = date;
      writeDB(db);
      console.log(`[DB DATE] Updated reservation ${id} date to: ${date} (0.1s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 100);
};

export const updateServiceType = (req, res) => {
  const { id } = req.params;
  const { serviceType, date } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 정비 항목을 변경(3초 지연 완료)한 직후 예약 날짜도 변경(0.1초 완료)하면, 
  // 날짜 변경 요청은 먼저 완료되나 3초 뒤 완료되는 정비 항목 변경 요청 내부에 이전 구형 날짜(date)가 함께 저장되어 
  // 새로고침 시 새 정비 항목과 이전 날짜 조합이 들어가는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.serviceType = serviceType;
      if (date) {
        resv.date = date; // Overwrites updated date with stale value!
      }
      writeDB(db);
      console.log(`[DB SERVICE TYPE] Updated serviceType for ${id} to ${serviceType} (3s done). Overwrote date to: ${date}`);
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
      console.log(`[DB CANCEL] Cancelled reservation ${id} (0.5s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 500);
};

export const updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 예약 취소(0.5초 완료) 직후 작업 상태를 변경(4초 지연 완료)하면, 
  // 취소 요청은 성공하지만 늦게 완료된 상태 변경 요청이 취소 완료된 예약을 다시 'QUEUED'(작업 대기) 상태로 강제 복구 부활시키는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = status || 'QUEUED';
      writeDB(db);
      console.log(`[DB STATUS CHANGE] Re-activated reservation ${id} status to ${resv.status} (4s done). Overwrote cancelled status.`);
    }
    res.json({ success: true, reservation: resv });
  }, 4000);
};

export const deleteReservation = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.reservations = db.reservations.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 정비 이력을 삭제(DELETE) 처리하여 대장에서 소거하더라도, 
  // 차량별 총 정비 금액(`vehicle.totalMaintenanceCost`) 및 관리자 매출 통계 수치에는 해당 정비 금액이 차감되지 않고 계속 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE RESV HISTORY] Removed history ${id}. Vehicle totalMaintenanceCost remains unchanged.`);
  res.json({ success: true });
};

export const unauthorizedStatusChange = (req, res) => {
  const { id } = req.params;
  const { status, mechanicName } = req.body;
  const db = readDB();

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 권한 없는 일반 정비사가 작업 상태 변경 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 
  // 활동 서버 로그(`activityLogs`)에는 해당 정비사의 상태 변경 시도가 성공한 것처럼 기록되는 보안/감사 결함입니다.
  db.activityLogs.push({
    timestamp: new Date().toISOString(),
    reservationId: id,
    mechanicName: mechanicName || "무단 정비사",
    targetStatus: status,
    result: "SUCCESSFULLY_UPDATED_LOG"
  });
  writeDB(db);
  console.log(`[LOG SECURITY LEAK] Unauthorized mechanic status change attempt for ${id} recorded as success in logs!`);

  res.status(403).json({ error: "권한이 없습니다. 해당 작업 상태를 변경할 관리자 정비사 권한이 필요합니다." });
};

export const resetData = (req, res) => {
  const initial = {
    "centers": [
      { "id": "CTR-01", "name": "강남 모터스 공식 정비 센터", "region": "강남구", "rating": 4.9, "serviceType": "ENGINE_OIL", "estPrice": 120000, "imageUrl": "/uploads/gangnam_motors.jpg" },
      { "id": "CTR-02", "name": "마포 블루핸즈 오토 서비스", "region": "마포구", "rating": 4.8, "serviceType": "BRAKE_PAD", "estPrice": 180000, "imageUrl": "/uploads/mapo_blue.jpg" }
    ],
    "vehicles": [
      { "id": "VEC-001", "carNumber": "12가 3456", "model": "현대 그랜저 IG", "year": 2021, "totalMaintenanceCost": 1250000, "lastServiceItem": "엔진오일 및 필터 교환", "userId": "USER_A" }
    ],
    "reservations": [
      { "id": "RES-001", "centerId": "CTR-01", "centerName": "강남 모터스 공식 정비 센터", "carNumber": "12가 3456", "serviceType": "ENGINE_OIL", "date": "2026-08-10", "estPrice": 120000, "status": "QUEUED", "userId": "USER_A" }
    ],
    "activityLogs": []
  };
  writeDB(initial);
  res.json({ success: true });
};
