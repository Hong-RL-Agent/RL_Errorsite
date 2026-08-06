import { readDB, writeDB } from '../services/dataService.js';

export const getAdmins = (req, res) => {
  const db = readDB();
  res.json(db.admins);
};

export const getCourses = (req, res) => {
  const db = readDB();
  res.json(db.courses);
};

export const getStudents = (req, res) => {
  const db = readDB();
  res.json(db.students);
};

export const getRegistrations = (req, res) => {
  const db = readDB();
  res.json(db.registrations);
};

export const getWaitlists = (req, res) => {
  const db = readDB();
  res.json(db.waitlists);
};

export const getCart = (req, res) => {
  const db = readDB();
  res.json(db.cartItems);
};

export const searchCourses = (req, res) => {
  const { dept, type } = req.query;
  const db = readDB();
  let list = db.courses;

  if (dept && dept !== 'ALL') {
    list = list.filter(c => c.dept === dept);
  }
  if (type && type !== 'ALL') {
    list = list.filter(c => c.type === type);
  }

  let delay = 100;
  if (dept === '컴퓨터공학과') {
    delay = 3000; // 3.0s delay for CS
  } else if (dept === 'AI융합학부') {
    delay = 200; // 0.2s delay for AI
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 전공 필터('컴퓨터공학과' 3초 지연 ➔ 'AI융합학부' 0.2초 완료)를 빠르게 변경 시 
  // 오래된 이전 응답(컴퓨터공학과)이 최신 강의 목록을 덮어쓰고, 중앙 강의 목록은 오래된 필터 결과, 오른쪽 시간표 미리보기는 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const addToCart = (req, res) => {
  const { studentId, courseId, courseName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 학생이 강의를 장바구니에 담은(3초 지연 완료) 직후 바로 수강신청을 누르면(0.1초 완료), 
  // 수강신청 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 장바구니 저장 API가 수강신청 전의 구 DB 스냅샷을 덮어써 저장되어 
  // 새로고침 시 수강 완료된 강의가 장바구니에 다시 남아있게 되는 레이스 컨디션 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot before registration completes
  setTimeout(() => {
    dbSnapshot.cartItems.push({ studentId, courseId, courseName });
    writeDB(dbSnapshot); // Overwrites data.json, restoring the course to cartItems despite being registered!
    console.log(`[DB CART SAVE] Added course ${courseId} to cart for student ${studentId} (3s done, snapshot overwrite)`);
    res.json({ success: true, cartItems: dbSnapshot.cartItems });
  }, 3000);
};

export const registerCourse = (req, res) => {
  const { studentId, studentName, courseId, courseName, credits } = req.body;

  setTimeout(() => {
    const db = readDB();
    const newReg = {
      id: `REG-${Date.now().toString().slice(-4)}`,
      studentId,
      studentName,
      courseId,
      courseName,
      credits: credits || 3,
      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'REGISTERED'
    };
    db.registrations.push(newReg);
    
    // Clear from cart on current state
    db.cartItems = db.cartItems.filter(item => !(item.studentId === studentId && item.courseId === courseId));

    // Update course enrolled count
    const crs = db.courses.find(c => c.id === courseId);
    if (crs) {
      crs.enrolledCount += 1;
    }

    writeDB(db);
    console.log(`[DB COURSE REGISTERED] Student ${studentId} registered ${courseName} (0.1s done)`);
    res.json({ success: true, registration: newReg });
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

export const autoPromoteWaitlist = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 수강신청 취소 API(0.5초 완료)를 호출한 직후 대기자 자동 등록 API를 호출(4초 지연 완료)하면, 
  // 취소 요청은 성공하여 CANCELLED로 바뀌지만 늦게 완료된 자동 등록 요청(4초 지연)이 취소한 학생의 신청 상태를 다시 'REGISTERED'(수강중)으로 바꿔버립니다. 
  // 내 수강 목록에서는 취소됨, 강의 상세 수강생 목록에서는 수강중으로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const reg = db.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'REGISTERED'; // Re-activates registration back to REGISTERED!
      console.log(`[DB AUTO PROMOTE CONFLICT] Re-activated cancelled registration ${id} back to REGISTERED status!`);
    }
    writeDB(db);
    res.json({ success: true, registration: reg });
  }, 4000);
};

export const updateCourseCapacity = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 조교(role !== 'ADMIN')가 강의 정원 변경 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '강의 정원 변경 성공 (COURSE CAPACITY UPDATED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 보안감사 불일치 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] COURSE CAPACITY UPDATED SUCCESSFULLY for course ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const { capacity } = req.body;
  const db = readDB();
  const crs = db.courses.find(c => c.id === id);
  if (crs && capacity) {
    crs.capacity = capacity;
    writeDB(db);
  }
  res.json({ success: true, course: crs });
};

export const updateCoursePartial = (req, res) => {
  const { id } = req.params;
  const { classroom, capacity, professorName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 강의 정보 수정 모달에서 강의실, 정원, 담당교수를 동시에 수정하면, 
  // backend data.json에는 강의실(classroom)과 정원(capacity)만 저장하고 담당교수(professorName)는 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것처럼 표시하는 partial save 결함입니다.
  const db = readDB();
  const crs = db.courses.find(c => c.id === id);
  if (crs) {
    if (classroom) crs.classroom = classroom;
    if (capacity) crs.capacity = capacity;
    // professorName is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated classroom and capacity for course ${id}. professorName was NOT updated.`);
  }
  res.json({ success: true, course: crs });
};

export const deleteRegistration = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.registrations = db.registrations.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 수강신청 데이터를 삭제(`DELETE /api/registrations/:id`) 처리하여 신청 목록에서 소거하더라도, 
  // 강의별 신청 인원(`course.enrolledCount`), 대기 순번, 대시보드 정원 통계 수치에는 차감되지 않고 계속 잔존 포함되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE REGISTRATION] Removed registration ${id}. course.enrolledCount remains unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "ADM-001", "name": "김학사 (학사처장)", "role": "ADMIN", "dept": "교무처 학사관리팀" },
      { "id": "ADM-002", "name": "이전산 (전산원장)", "role": "ADMIN", "dept": "정보전산원" },
      { "id": "ADM-003", "name": "박조교 (학과 조교)", "role": "TA", "dept": "컴퓨터공학과 사무실" }
    ],
    "professors": [
      { "id": "PRF-01", "name": "김자바 교수", "dept": "컴퓨터공학과" }
    ],
    "students": [
      { "id": "STD-202601", "name": "김코딩 (컴공 3학년)", "major": "컴퓨터공학과", "grade": 3, "registeredCredits": 15 }
    ],
    "courses": [
      { "id": "CRS-101", "code": "CS101", "name": "자바 프로그래밍 응용", "dept": "컴퓨터공학과", "type": "전공필수", "credits": 3, "professorName": "김자바 교수", "classroom": "공학관 301호", "scheduleTime": "월1,2/수2", "capacity": 40, "enrolledCount": 38, "waitlistCount": 3, "popularity": 98 }
    ],
    "registrations": [
      { "id": "REG-8001", "studentId": "STD-202601", "studentName": "김코딩", "courseId": "CRS-101", "courseName": "자바 프로그래밍 응용", "credits": 3, "registeredAt": "2026-08-03 09:00:01", "status": "REGISTERED" }
    ],
    "waitlists": [
      { "id": "WAIT-7001", "studentId": "STD-202601", "studentName": "김코딩", "courseId": "CRS-102", "courseName": "파이썬 데이터 분석", "position": 1, "status": "WAITING" }
    ],
    "cartItems": [
      { "studentId": "STD-202601", "courseId": "CRS-102", "courseName": "파이썬 데이터 분석" }
    ],
    "courseStats": {
      "totalCourses": 35,
      "totalStudents": 25,
      "totalRegistrations": 45,
      "totalWaitlists": 30
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
