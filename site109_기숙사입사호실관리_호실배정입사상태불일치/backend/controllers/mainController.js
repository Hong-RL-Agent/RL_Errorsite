import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => {
  const db = readDB();
  res.json(db.staffs);
};

export const getStudents = (req, res) => {
  const db = readDB();
  res.json(db.students);
};

export const getRooms = (req, res) => {
  const db = readDB();
  res.json(db.rooms);
};

export const getApplications = (req, res) => {
  const db = readDB();
  res.json(db.applications);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchStudents = (req, res) => {
  const { dormBuilding, status, search } = req.query;
  const db = readDB();
  let list = db.students;

  if (dormBuilding && dormBuilding !== 'ALL') {
    list = list.filter(s => s.dormBuilding === dormBuilding);
  }
  if (status && status !== 'ALL') {
    list = list.filter(s => s.status === status);
  }
  if (search) {
    list = list.filter(s => s.name.includes(search) || s.major.includes(search) || s.id.includes(search));
  }

  let delay = 100;
  if (dormBuilding === '명덕관') {
    delay = 3000; // 3.0s delay for 명덕관
  } else if (dormBuilding === '진리관') {
    delay = 200; // 0.2s delay for 진리관
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 기숙사동 필터('명덕관' 3초 지연 ➔ '진리관' 0.2초 완료)와 입사 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(명덕관)이 최신 학생 목록을 덮어쓰고, 학생 목록은 오래된 필터 결과, 오른쪽 호실 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateStudentRoom = (req, res) => {
  const { id } = req.params;
  const { roomNo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 학생의 호실을 변경(3초 지연 완료)한 직후 입사 상태를 'CHECKED_IN'(입사완료)으로 변경(0.1초 완료)하면, 
  // 입사 상태 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 호실 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 호실)을 덮어써 저장되어 
  // 새로고침 시 학생 상세의 호실과 호실 배치도의 학생 위치가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const stu = dbSnapshot.students.find(s => s.id === id);
    if (stu) {
      stu.roomNo = roomNo;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back status changes made during the 3s delay
      console.log(`[DB ROOM UPDATE] Updated room for student ${id} to ${roomNo} (3s done, rolled back status update)`);
    }
    res.json({ success: true, stu });
  }, 3000);
};

export const updateStudentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  setTimeout(() => {
    const db = readDB();
    const stu = db.students.find(s => s.id === id);
    if (stu) {
      stu.status = status;
      writeDB(db);
      console.log(`[DB STATUS UPDATE] Updated student ${id} status to ${status} (0.1s done)`);
    }
    res.json({ success: true, stu });
  }, 100);
};

export const checkoutStudent = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const stu = db.students.find(s => s.id === id);
    if (stu) {
      stu.status = 'CHECKED_OUT';
      writeDB(db);
      console.log(`[DB CHECKOUT STUDENT] Student ${id} status set to CHECKED_OUT (0.5s done)`);
    }
    res.json({ success: true, stu });
  }, 500);
};

export const updateRoomOccupancy = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 퇴사 처리 API(0.5초 완료)를 호출한 직후 호실 점유 상태 갱신 API를 호출(4초 지연 완료)하면, 
  // 퇴사 처리는 성공하지만 늦게 완료된 점유 상태 갱신 요청(4초 지연)이 퇴사 학생을 다시 'CHECKED_IN'(입사중) 상태로 바꿔버립니다. 
  // 학생 목록에서는 퇴사, 호실 배치도에서는 입사중 학생으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const room = db.rooms.find(r => r.id === id);
    if (room) {
      const targetStu = db.students.find(s => s.roomNo === room.roomNo);
      if (targetStu) {
        targetStu.status = 'CHECKED_IN'; // INTENTIONAL_ERROR: Overwrites CHECKED_OUT status back to CHECKED_IN!
        console.log(`[DB RESTORE CHECKED_OUT STUDENT] Re-activated student ${targetStu.id} back to CHECKED_IN status via room occupancy update!`);
      }
    }
    writeDB(db);
    res.json({ success: true, room });
  }, 4000);
};

export const forceChangeRoomUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 호실 강제 변경 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '호실 강제 변경 성공 (ROOM FORCED CHANGE COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] ROOM FORCED CHANGE COMPLETED SUCCESSFULLY for room ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Manager role required to force change room" });
  }

  const db = readDB();
  const room = db.rooms.find(r => r.id === id);
  if (room) {
    room.occupied = Math.max(0, room.occupied - 1);
    writeDB(db);
  }
  res.json({ success: true, room });
};

export const updateStudentPartial = (req, res) => {
  const { id } = req.params;
  const { phone, parentPhone, preferredRoommate } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 학생 정보 수정 모달에서 연락처, 보호자 연락처, 희망 룸메이트를 동시에 수정하면, 
  // backend data.json에는 연락처(phone)와 희망 룸메이트(preferredRoommate)만 저장하고 보호자 연락처(parentPhone)는 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const stu = db.students.find(s => s.id === id);
  if (stu) {
    if (phone) stu.phone = phone;
    if (preferredRoommate) stu.preferredRoommate = preferredRoommate;
    // parentPhone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated phone and preferredRoommate for student ${id}. parentPhone was NOT updated.`);
  }
  res.json({ success: true, stu });
};

export const approveApplication = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const app = db.applications.find(a => a.id === id);
  if (app) {
    app.status = 'APPROVED';
    const stu = db.students.find(s => s.id === app.studentId);
    if (stu) stu.status = 'APPROVED';
    writeDB(db);
  }
  res.json({ success: true, app });
};

export const deleteAllocationLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.activityLogs = db.activityLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 호실 배정 로그를 삭제(`DELETE /api/allocation-logs/:id`) 처리하여 로그 목록에서 소거하더라도, 
  // 층별 점유율(`dormStats.occupancyRate`), 성별 배정 통계, 대기자 수 통계 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE ALLOCATION LOG] Removed log ${id}. dormStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "staffs": [
      { "id": "STAFF-4001", "name": "김행정 (생활관 관장)", "role": "MANAGER", "dept": "기숙사 행정실", "processedCount": 160 }
    ],
    "students": [
      { "id": "STU-1001", "name": "김동남", "gender": "M", "major": "컴퓨터공학과", "gpa": 4.12, "phone": "010-1111-2222", "parentPhone": "010-9999-1111", "dormBuilding": "명덕관", "roomNo": "301호", "preferredRoommate": "이휴가", "status": "CHECKED_IN" }
    ],
    "rooms": [
      { "id": "ROOM-101", "building": "명덕관", "roomNo": "301호", "capacity": 2, "occupied": 2, "gender": "M", "floor": 3 }
    ],
    "applications": [
      { "id": "APP-2001", "studentId": "STU-1001", "studentName": "김동남", "dormBuilding": "명덕관", "gpa": 4.12, "appDate": "2026-08-01", "status": "APPROVED", "assignedRoom": "301호" }
    ],
    "activityLogs": [
      { "id": "LOG-5001", "appId": "APP-2001", "operator": "김행정 (생활관 관장)", "action": "김동남 학생 2026학년도 2학기 명덕관 301호 승인 완료", "timestamp": "2026-08-03 10:00:00", "status": "SUCCESS" }
    ],
    "dormStats": {
      "totalCapacity": 120,
      "currentOccupants": 98,
      "occupancyRate": 81.6,
      "waitingApplicants": 22,
      "approvedCount": 38,
      "avgGpa": 3.95
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
