import { readDB, writeDB } from '../services/dataService.js';

export const getTrainers = (req, res) => {
  const db = readDB();
  res.json(db.trainers);
};

export const getMembers = (req, res) => {
  const db = readDB();
  res.json(db.members);
};

export const getMembershipPasses = (req, res) => {
  const db = readDB();
  res.json(db.membershipPasses);
};

export const getReservations = (req, res) => {
  const db = readDB();
  res.json(db.reservations);
};

export const getAttendanceLogs = (req, res) => {
  const db = readDB();
  res.json(db.attendanceLogs);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchReservations = (req, res) => {
  const { trainerName, status, search } = req.query;
  const db = readDB();
  let list = db.reservations;

  if (trainerName && trainerName !== 'ALL') {
    list = list.filter(r => r.trainerName.includes(trainerName));
  }
  if (status && status !== 'ALL') {
    list = list.filter(r => r.status === status);
  }
  if (search) {
    list = list.filter(r => r.memberName.includes(search) || r.id.includes(search) || r.lessonType.includes(search));
  }

  let delay = 100;
  if (trainerName && trainerName.includes('김피트')) {
    delay = 3000; // 3.0s delay for 김피트
  } else if (trainerName && trainerName.includes('이웨이트')) {
    delay = 200; // 0.2s delay for 이웨이트
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 트레이너 필터('김피트 수석' 3초 지연 ➔ '이웨이트 선임' 0.2초 완료)와 예약 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(김피트)이 최신 예약 목록을 덮어쓰고, 예약 목록은 오래된 필터 결과, 오른쪽 회원권 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateReservationTime = (req, res) => {
  const { id } = req.params;
  const { resTime } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: PT 예약 시간을 변경(3초 지연 완료)한 직후 트레이너를 변경(0.1초 완료)하면, 
  // 트레이너 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 시간 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 트레이너)을 덮어써 저장되어 
  // 새로고침 시 예약 캘린더의 트레이너와 회원 상세의 트레이너가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const resv = dbSnapshot.reservations.find(r => r.id === id);
    if (resv) {
      resv.resTime = resTime;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back trainer assignment changes made during the 3s delay
      console.log(`[DB RESERVATION TIME UPDATE] Updated time for reservation ${id} to ${resTime} (3s done, rolled back trainer update)`);
    }
    res.json({ success: true, resv });
  }, 3000);
};

export const updateReservationTrainer = (req, res) => {
  const { id } = req.params;
  const { trainerName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.trainerName = trainerName;
      writeDB(db);
      console.log(`[DB TRAINER ASSIGN UPDATE] Updated reservation ${id} trainerName to ${trainerName} (0.1s done)`);
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

export const checkInAttendance = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 출석 체크 API를 호출(4초 지연 완료)하면, 
  // 예약 취소는 성공하지만 늦게 완료된 출석 체크 요청(4초 지연)이 취소된 예약을 다시 'ATTENDED'(출석) 상태로 바꾸고 회원권을 차감해버립니다. 
  // 예약 목록에서는 취소됨, 회원권 내역에서는 출석으로 차감된 것처럼 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'ATTENDED'; // INTENTIONAL_ERROR: Overwrites CANCELLED status back to ATTENDED!
      console.log(`[DB RESTORE CANCELLED RESERVATION] Re-activated reservation ${id} back to ATTENDED status via check-in!`);
      const member = db.members.find(m => m.id === resv.memberId);
      if (member && member.remainingCount > 0) {
        member.remainingCount -= 1;
      }
    }
    writeDB(db);
    res.json({ success: true, resv });
  }, 4000);
};

export const deductPassUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 트레이너(role !== 'MANAGER')가 회원권 차감 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '회원권 차감 성공 (MEMBERSHIP PASS DEDUCTED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] MEMBERSHIP PASS DEDUCTED SUCCESSFULLY for pass ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Manager role required to manually deduct membership pass" });
  }

  const db = readDB();
  const pass = db.membershipPasses.find(p => p.id === id);
  if (pass && pass.remainingCount > 0) {
    pass.remainingCount -= 1;
    writeDB(db);
  }
  res.json({ success: true, pass });
};

export const updateMemberPartial = (req, res) => {
  const { id } = req.params;
  const { phone, expiryDate, assignedTrainer } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 회원 정보 수정 모달에서 연락처, 회원권 만료일, 담당 트레이너를 동시에 수정하면, 
  // backend data.json에는 연락처(phone)와 담당 트레이너(assignedTrainer)만 저장하고 만료일(expiryDate)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const member = db.members.find(m => m.id === id);
  if (member) {
    if (phone) member.phone = phone;
    if (assignedTrainer) member.assignedTrainer = assignedTrainer;
    // expiryDate is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated phone and assignedTrainer for member ${id}. expiryDate was NOT updated.`);
  }
  res.json({ success: true, member });
};

export const deleteAttendanceLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.attendanceLogs = db.attendanceLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 출석 로그를 삭제(`DELETE /api/attendance-logs/:id`) 처리하여 출석 목록에서 소거하더라도, 
  // 회원별 출석률(`fitnessStats.avgAttendanceRate`), 트레이너별 수업 수, 월별 매출 통계 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE ATTENDANCE LOG] Removed attendance log ${id}. fitnessStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "trainers": [
      { "id": "TRN-3001", "name": "김피트 (수석 트레이너)", "role": "MANAGER", "specialty": "보디빌딩 & 다이어트", "lessonCount": 145 }
    ],
    "members": [
      { "id": "MEM-1001", "name": "김동남", "phone": "010-1111-2222", "assignedTrainer": "김피트 (수석 트레이너)", "passType": "PT 30회권", "remainingCount": 18, "expiryDate": "2026-12-31", "recentVisit": "2026-08-03" }
    ],
    "membershipPasses": [
      { "id": "PASS-4001", "memberId": "MEM-1001", "memberName": "김동남", "passType": "개인 1:1 PT 30회", "totalCount": 30, "remainingCount": 18, "price": 1800000, "status": "ACTIVE" }
    ],
    "reservations": [
      { "id": "RES-2001", "memberId": "MEM-1001", "memberName": "김동남", "trainerName": "김피트 (수석 트레이너)", "resDate": "2026-08-05", "resTime": "14:00", "status": "RESERVED", "lessonType": "하체 근력 강화 세션" }
    ],
    "attendanceLogs": [
      { "id": "ATT-5001", "memberId": "MEM-1001", "memberName": "김동남", "checkInTime": "2026-08-03 14:02:00", "trainerName": "김피트 (수석 트레이너)", "deductPass": "PT 1회 차감 완료" }
    ],
    "activityLogs": [
      { "id": "LOG-6001", "resId": "RES-2001", "operator": "김동남 (회원)", "action": "모바일 앱 PT 수업 예약 완료", "timestamp": "2026-08-03 09:00:00", "status": "SUCCESS" }
    ],
    "fitnessStats": {
      "totalMembers": 40,
      "todayReservations": 18,
      "attendedCount": 24,
      "noShowCount": 2,
      "avgAttendanceRate": 92.4,
      "totalRevenue": 15800000
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
