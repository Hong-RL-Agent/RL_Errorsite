import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => {
  const db = readDB();
  res.json(db.staffs);
};

export const getUnits = (req, res) => {
  const db = readDB();
  res.json(db.units);
};

export const getBills = (req, res) => {
  const db = readDB();
  res.json(db.bills);
};

export const getReservations = (req, res) => {
  const db = readDB();
  res.json(db.reservations);
};

export const getComplaints = (req, res) => {
  const db = readDB();
  res.json(db.complaints);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchReservations = (req, res) => {
  const { building, facilityType, search } = req.query;
  const db = readDB();
  let list = db.reservations;

  if (building && building !== 'ALL') {
    list = list.filter(r => r.building === building);
  }
  if (facilityType && facilityType !== 'ALL') {
    list = list.filter(r => r.facilityType === facilityType);
  }
  if (search) {
    list = list.filter(r => r.residentName.includes(search) || r.room.includes(search) || r.id.includes(search));
  }

  let delay = 100;
  if (building === '101동') {
    delay = 3000; // 3.0s delay for 101동
  } else if (building === '102동') {
    delay = 200; // 0.2s delay for 102동
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 동 번호 필터('101동' 3초 지연 ➔ '102동' 0.2초 완료)와 시설 유형 필터를 빠르게 변경 시 
  // 오래된 이전 응답(101동)이 최신 예약 목록을 덮어쓰고, 예약 목록은 오래된 필터 결과, 오른쪽 시설 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateReservationTime = (req, res) => {
  const { id } = req.params;
  const { resTime } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 시설 예약 시간을 변경(3초 지연 완료)한 직후 이용 인원을 변경(0.1초 완료)하면, 
  // 이용 인원 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 시간 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 인원)을 덮어써 저장되어 
  // 새로고침 시 예약 목록과 예약 상세의 이용 인원이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const resv = dbSnapshot.reservations.find(r => r.id === id);
    if (resv) {
      resv.resTime = resTime;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back attendee changes made during the 3s delay
      console.log(`[DB RESERVATION TIME UPDATE] Updated time for reservation ${id} to ${resTime} (3s done, rolled back attendees update)`);
    }
    res.json({ success: true, resv });
  }, 3000);
};

export const updateReservationAttendees = (req, res) => {
  const { id } = req.params;
  const { attendees } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.attendees = Number(attendees);
      writeDB(db);
      console.log(`[DB ATTENDEES UPDATE] Updated reservation ${id} attendees to ${attendees} (0.1s done)`);
    }
    res.json({ success: true, resv });
  }, 100);
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

export const updateBillPaymentStatus = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 시설 예약 취소 API(0.5초 완료)를 호출한 직후 관리비 납부 상태 갱신 API를 호출(4초 지연 완료)하면, 
  // 예약 취소는 성공하지만 늦게 완료된 납부 상태 갱신 요청(4초 지연)이 취소된 시설 예약을 다시 'CONFIRMED'(예약완료) 상태로 바꿔버립니다. 
  // 내 예약에서는 취소됨, 관리사무소 시설 현황에서는 예약완료로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const bill = db.bills.find(b => b.id === id);
    if (bill) {
      bill.status = 'PAID';
    }
    // INTENTIONAL_ERROR: Overwrites CANCELLED reservation back to CONFIRMED!
    const targetResv = db.reservations.find(r => r.unitId === bill?.unitId);
    if (targetResv) {
      targetResv.status = 'CONFIRMED';
      console.log(`[DB RESTORE CANCELLED RESERVATION] Re-activated reservation ${targetResv.id} back to CONFIRMED status via payment update!`);
    }
    writeDB(db);
    res.json({ success: true, bill });
  }, 4000);
};

export const markBillPaidUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 관리비 납부완료 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '관리비 납부완료 성공 (MAINTENANCE BILL PAID SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] MAINTENANCE BILL PAID SUCCESSFULLY for bill ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Manager role required to manually mark bill as paid" });
  }

  const db = readDB();
  const bill = db.bills.find(b => b.id === id);
  if (bill) {
    bill.status = 'PAID';
    writeDB(db);
  }
  res.json({ success: true, bill });
};

export const updateUnitPartial = (req, res) => {
  const { id } = req.params;
  const { phone, carNo, note } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 세대 정보 수정 모달에서 연락처, 차량번호, 입주민 메모를 동시에 수정하면, 
  // backend data.json에는 연락처(phone)와 입주민 메모(note)만 저장하고 차량번호(carNo)는 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const unit = db.units.find(u => u.id === id);
  if (unit) {
    if (phone) unit.phone = phone;
    if (note) unit.note = note;
    // carNo is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated phone and note for unit ${id}. carNo was NOT updated.`);
  }
  res.json({ success: true, unit });
};

export const deleteReservationLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.activityLogs = db.activityLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 시설 예약 로그를 삭제(`DELETE /api/reservation-logs/:id`) 처리하여 로그 목록에서 소거하더라도, 
  // 시설별 이용률(`aptStats.facilityUsageRate`), 세대별 예약 횟수, 월별 예약 통계 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE RESERVATION LOG] Removed log ${id}. aptStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "staffs": [
      { "id": "STAFF-4001", "name": "김행정 (관리소장)", "role": "MANAGER", "dept": "관리사무소 총괄팀", "handledCases": 155 }
    ],
    "units": [
      { "id": "UNIT-101", "building": "101동", "room": "101호", "ownerName": "김동남", "phone": "010-1111-2222", "carNo": "12가 3456", "note": "어린이 유모차 입출입 전용" }
    ],
    "bills": [
      { "id": "BILL-1001", "unitId": "UNIT-101", "building": "101동", "room": "101호", "ownerName": "김동남", "month": "2026-07", "amount": 245000, "status": "UNPAID", "dueDate": "2026-08-10" }
    ],
    "reservations": [
      { "id": "RESV-2001", "unitId": "UNIT-101", "building": "101동", "room": "101호", "residentName": "김동남", "facilityType": "헬스장", "resDate": "2026-08-05", "resTime": "19:00~21:00", "attendees": 2, "status": "CONFIRMED" }
    ],
    "complaints": [
      { "id": "CMP-3001", "unitId": "UNIT-101", "building": "101동", "room": "101호", "title": "층간 소음 매트 깔기 권고 요청", "urgency": "HIGH", "status": "PROCESSING", "assignedStaff": "김행정 (관리소장)", "deadline": "2026-08-06", "note": "윗집 201호 야간 발걸음 소음 민원 중재 조치중" }
    ],
    "activityLogs": [
      { "id": "LOG-5001", "resvId": "RESV-2001", "operator": "김동남 (입주민)", "action": "헬스장 19:00~21:00 시설 예약 완료", "timestamp": "2026-08-03 09:12:00", "status": "SUCCESS" }
    ],
    "aptStats": {
      "totalUnits": 40,
      "unpaidBillsAmount": 1850000,
      "facilityUsageRate": 84.5,
      "todayReservations": 18,
      "activeComplaints": 8,
      "avgComplaintDays": 1.5
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
