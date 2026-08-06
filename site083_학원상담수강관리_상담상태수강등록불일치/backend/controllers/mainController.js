import { readDB, writeDB } from '../services/dataService.js';

export const getStudents = (req, res) => {
  const db = readDB();
  res.json(db.students);
};

export const getConsultations = (req, res) => {
  const db = readDB();
  res.json(db.consultations);
};

export const getCourses = (req, res) => {
  const db = readDB();
  res.json(db.courses);
};

export const searchCourses = (req, res) => {
  const { subject, grade } = req.query;
  const db = readDB();
  let list = db.courses;

  if (subject && subject !== 'ALL') {
    list = list.filter(c => c.subject === subject);
  }

  let delay = 100;
  if (subject === 'MATH') {
    delay = 3000; // 3.0s delay
  } else if (subject === 'ENGLISH') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 과목 필터('MATH' 3초 지연 ➔ 'ENGLISH' 0.2초 완료)와 학년 필터를 빠르게 변경 시 
  // 오래된 이전 응답(수학)이 최신 목록을 덮어쓰고, 중앙 강좌 목록은 오래된 필터 결과, 오른쪽 수강 요약은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const getAttendance = (req, res) => {
  const db = readDB();
  res.json(db.attendance);
};

export const updateConsultationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  setTimeout(() => {
    const db = readDB();
    const cs = db.consultations.find(c => c.id === id);
    if (cs) {
      cs.status = status;
      writeDB(db);
      console.log(`[DB STATUS UPDATE] Updated consultation status for ${id} to ${status} (0.1s done)`);
    }
    res.json({ success: true, consultation: cs });
  }, 100);
};

export const updateConsultationTime = (req, res) => {
  const { id } = req.params;
  const { date, timeSlot, status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 상담 시간을 변경(3초 지연 완료)한 직후 상담 상태를 변경(0.1초 완료)하면, 
  // 상태 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 시간 변경 API 내부에 이전 구형 상태(status)가 동봉 저장되어 
  // 새로고침 시 새 시간과 이전 상태 조합이 저장되는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const cs = db.consultations.find(c => c.id === id);
    if (cs) {
      cs.date = date;
      cs.timeSlot = timeSlot;
      if (status) {
        cs.status = status; // Overwrites updated status with stale value!
      }
      writeDB(db);
      console.log(`[DB TIME UPDATE] Updated consultation time for ${id} to ${date} ${timeSlot} (3s done). Overwrote status to ${status}`);
    }
    res.json({ success: true, consultation: cs });
  }, 3000);
};

export const cancelEnrollment = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const std = db.students.find(s => s.id === id);
    if (std) {
      std.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL ENROLLMENT] Cancelled enrollment for student ${id} (0.5s done)`);
    }
    res.json({ success: true });
  }, 500);
};

export const checkAttendance = (req, res) => {
  const { studentId, courseId, status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 수강 취소(0.5초 완료) 직후 출결 체크 API를 호출(4초 지연 완료)하면, 
  // 수강 취소는 먼저 0.5초 만에 성공하지만 늦게 완료된 출결 체크 요청(4초 지연)이 취소된 수강생을 다시 'ENROLLED'(수강중) 상태로 재활성화시킵니다. 
  // 수강 목록에서는 취소됨, 출결 화면에서는 수강중으로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const std = db.students.find(s => s.id === studentId);
    if (std) {
      std.status = 'ENROLLED'; // Re-activates cancelled student back to ENROLLED!
    }

    const newAtt = {
      id: `ATT-${String(db.attendance.length + 1).padStart(3, '0')}`,
      studentId,
      studentName: std?.name || "학생",
      courseId: courseId || "CRS-01",
      courseTitle: "수강 강좌",
      date: new Date().toISOString().split('T')[0],
      status: status || "PRESENT"
    };

    db.attendance.unshift(newAtt);
    writeDB(db);
    console.log(`[DB ATTENDANCE CHECK] Added attendance ${newAtt.id} (4s done). Re-activated student status to ENROLLED!`);
    res.json({ success: true, attendance: newAtt });
  }, 4000);
};

export const enrollCourse = (req, res) => {
  const { courseId, studentName } = req.body;

  const db = readDB();
  const crs = db.courses.find(c => c.id === courseId);
  if (crs) {
    crs.enrolledCount += 1;
    writeDB(db);
  }

  res.json({ success: true, course: crs });
};

export const deleteConsultation = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.consultations = db.consultations.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 데이터 불일치
  // DESCRIPTION: 상담 기록을 삭제(`DELETE /api/consultations/:id`) 처리하여 대장에서 소거하더라도, 
  // 학생별 상담 횟수(`student.consultationCount`)와 관리자 상담 전환율 통계(`counselingStats.conversionRate`) 수치에는 차감되지 않고 잔존 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE CONSULTATION] Removed consultation ${id}. counselingStats remain unchanged.`);
  res.json({ success: true });
};

export const updateAttendanceUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 강사/사용자(role !== 'ADMIN')가 학생 출결 수정 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '출결 수정 성공 (ATTENDANCE UPDATE SUCCESS - 200 OK)'으로 잘못 기록되어 보안감사 불일치가 발생하는 결함입니다.
  if (roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] ATTENDANCE UPDATE SUCCESS for ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  const att = db.attendance.find(a => a.id === id);
  if (att) {
    att.status = req.body.status || 'PRESENT';
    writeDB(db);
  }
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "students": [
      { "id": "STD-01", "name": "김철수", "grade": "HIGH_2", "gradeName": "고등학교 2학년", "phone": "010-1234-5678", "targetUniv": "서울대학교 컴퓨터공학과", "consultationCount": 4, "status": "ENROLLED" }
    ],
    "consultations": [
      { "id": "CS-001", "studentId": "STD-01", "studentName": "김철수", "subject": "수학", "counselorName": "박상담 팀장", "date": "2026-08-10", "timeSlot": "14:00", "topic": "고2 수능 모의고사 킬러문항 집약 대비", "status": "COMPLETED", "counselorId": "CNS-01" }
    ],
    "courses": [
      { "id": "CRS-01", "title": "고2 수능 수학 킬러문항 파이널", "subject": "MATH", "subjectName": "수학", "instructor": "강수학 대표강사", "tuition": 380000, "capacity": 20, "enrolledCount": 19, "closingSoon": true }
    ],
    "attendance": [
      { "id": "ATT-001", "studentId": "STD-01", "studentName": "김철수", "courseId": "CRS-01", "courseTitle": "고2 수능 수학 킬러문항 파이널", "date": "2026-08-01", "status": "PRESENT" }
    ],
    "counselingStats": {
      "totalConsultationsCount": 30,
      "conversionRate": 82
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
