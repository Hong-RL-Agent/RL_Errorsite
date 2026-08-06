import { readDB, writeDB } from '../services/dataService.js';

export const getAdmins = (req, res) => {
  const db = readDB();
  res.json(db.admins);
};

export const getDepartments = (req, res) => {
  const db = readDB();
  res.json(db.departments);
};

export const getPatients = (req, res) => {
  const db = readDB();
  res.json(db.patients);
};

export const getRegistrations = (req, res) => {
  const db = readDB();
  res.json(db.registrations);
};

export const getPayments = (req, res) => {
  const db = readDB();
  res.json(db.payments);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchRegistrations = (req, res) => {
  const { dept, status } = req.query;
  const db = readDB();
  let list = db.registrations;

  if (dept && dept !== 'ALL') {
    list = list.filter(r => r.dept === dept);
  }
  if (status && status !== 'ALL') {
    list = list.filter(r => r.status === status);
  }

  let delay = 100;
  if (dept === '내과') {
    delay = 3000; // 3.0s delay for 내과
  } else if (dept === '정형외과') {
    delay = 200; // 0.2s delay for 정형외과
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 진료과 필터('내과' 3초 지연 ➔ '정형외과' 0.2초 완료)와 접수 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(내과)이 최신 접수 목록을 덮어쓰고, 중앙 대기열은 오래된 필터 결과, 오른쪽 수납 요약은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateRegistrationDept = (req, res) => {
  const { id } = req.params;
  const { dept } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 접수 진료과를 변경(3초 지연 완료)한 직후 수납 금액을 수정(0.1초 완료)하면, 
  // 수납 금액 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 진료과 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 진료과)을 덮어써 저장되어 
  // 새로고침 시 접수 목록과 수납 상세의 진료과가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const reg = dbSnapshot.registrations.find(r => r.id === id);
    if (reg) {
      reg.dept = dept;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back amount changes made during the 3s delay
      console.log(`[DB DEPT UPDATE] Updated dept for reg ${id} to ${dept} (3s done, rolled back amount update)`);
    }
    res.json({ success: true, registration: reg });
  }, 3000);
};

export const updateRegistrationAmount = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  setTimeout(() => {
    const db = readDB();
    const reg = db.registrations.find(r => r.id === id);
    if (reg) {
      reg.amount = amount;
      writeDB(db);
      console.log(`[DB AMOUNT UPDATE] Updated amount for reg ${id} to ${amount} (0.1s done)`);
    }
    res.json({ success: true, registration: reg });
  }, 100);
};

export const cancelRegistration = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const reg = db.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL REGISTRATION] Registration ${id} cancelled (0.5s done)`);
    }
    res.json({ success: true, registration: reg });
  }, 500);
};

export const completePayment = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 접수 취소 API(0.5초 완료)를 호출한 직후 수납 완료 API를 호출(4초 지연 완료)하면, 
  // 접수 취소는 성공하여 CANCELLED로 바뀌지만 늦게 완료된 수납 완료 요청(4초 지연)이 취소된 접수를 'COMPLETED'(수납완료) 상태로 다시 바꿔버립니다. 
  // 접수 대기열에서는 취소됨, 수납 내역에서는 완료로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const reg = db.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'COMPLETED'; // Re-activates registration back to COMPLETED!
      console.log(`[DB RE-ACTIVATE REGISTRATION STATUS] Re-activated registration ${id} back to COMPLETED status!`);
    }
    writeDB(db);
    res.json({ success: true, registration: reg });
  }, 4000);
};

export const cancelPayment = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 수납 취소 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '수납 취소 성공 (PAYMENT CANCELLED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 보안감사 불일치 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] PAYMENT CANCELLED SUCCESSFULLY for payment ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  const pay = db.payments.find(p => p.id === id);
  if (pay) {
    pay.status = 'CANCELLED';
    writeDB(db);
  }
  res.json({ success: true, payment: pay });
};

export const updatePatientPartial = (req, res) => {
  const { id } = req.params;
  const { phone, address, guardianName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 환자 정보 수정 모달에서 연락처, 주소, 보호자 이름을 동시에 수정하면, 
  // backend data.json에는 연락처(phone)와 주소(address)만 저장하고 보호자 이름(guardianName)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것처럼 표시하는 partial save 결함입니다.
  const db = readDB();
  const pat = db.patients.find(p => p.id === id);
  if (pat) {
    if (phone) pat.phone = phone;
    if (address) pat.address = address;
    // guardianName is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated phone and address for patient ${id}. guardianName was NOT updated.`);
  }
  res.json({ success: true, patient: pat });
};

export const deletePayment = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.payments = db.payments.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 수납 내역을 삭제(`DELETE /api/payments/:id`) 처리하여 수납 목록에서 소거하더라도, 
  // 일일 매출 합계(`clinicStats.totalRevenue`), 진료과별 수납 통계, 직원별 처리량 수치에는 차감되지 않고 계속 잔존 포함되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE PAYMENT] Removed payment ${id}. clinicStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "STF-101", "name": "김원무 (수석계장)", "role": "ADMIN", "dept": "원무팀 총괄" },
      { "id": "STF-102", "name": "이수납 (수납과장)", "role": "ADMIN", "dept": "원무수납 1팀" },
      { "id": "STF-103", "name": "박접수 (접수주임)", "role": "STAFF", "dept": "원무접수 2팀" },
      { "id": "STF-104", "name": "최원무 (원무사원)", "role": "STAFF", "dept": "원무수납 2팀" },
      { "id": "STF-105", "name": "정인턴 (실습인턴)", "role": "STAFF", "dept": "원무지원팀" }
    ],
    "departments": [
      { "id": "DEP-01", "name": "내과", "doctor": "김내과 과장", "waitCount": 8 }
    ],
    "patients": [
      { "id": "PAT-1001", "name": "홍길동", "rrn": "850101-1******", "phone": "010-1111-2222", "address": "서울시 강남구 테헤란로 123", "guardianName": "홍아버님" }
    ],
    "registrations": [
      { "id": "REG-9001", "ticketNo": "A-101", "patientId": "PAT-1001", "patientName": "홍길동", "dept": "내과", "status": "PAYMENT_WAITING", "waitTime": 25, "amount": 35000, "createdAt": "2026-08-03 09:10:00" }
    ],
    "payments": [
      { "id": "PAY-3001", "registrationId": "REG-9002", "patientName": "이몽룡", "dept": "내과", "amount": 18500, "method": "카드", "paidAt": "2026-08-03 09:30:00", "status": "PAID" }
    ],
    "activityLogs": [
      { "id": "LOG-7001", "operator": "김원무 수석계장", "action": "신규 접수 등록 완료 (홍길동 환자 - 내과)", "timestamp": "2026-08-03 09:10:00", "status": "SUCCESS" }
    ],
    "clinicStats": {
      "totalPatients": 30,
      "totalRegistrations": 40,
      "completedPayments": 35,
      "totalRevenue": 2155000
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
