import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getInstructors = (req, res) => res.json(readDB().instructors);
export const getStudents = (req, res) => res.json(readDB().students);
export const getCourses = (req, res) => res.json(readDB().courses);
export const getEnrollments = (req, res) => res.json(readDB().enrollments);
export const getAttendanceLogs = (req, res) => res.json(readDB().attendanceLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchCourses = (req, res) => {
  const { category, status, search } = req.query;
  const db = readDB();
  let list = db.courses;
  if (category && category !== 'ALL') list = list.filter(c => c.category === category);
  if (status && status !== 'ALL') list = list.filter(c => c.status === status);
  if (search) list = list.filter(c => c.courseName.includes(search) || c.instructorName.includes(search) || c.courseCode.includes(search) || c.roomNo.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 카테고리 필터('인문학 & 서양 미술사' 3초 지연 ➔ '음악 & 바이올린 클래스' 0.2초 완료)와 강좌 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(인문학 & 서양 미술사)이 최신 강좌 목록을 덮어쓰고, 강좌 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (category === '인문학 & 서양 미술사') delay = 3000;
  else if (category === '음악 & 바이올린 클래스') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateCourseEnrolledCount = (req, res) => {
  const { id } = req.params;
  const { enrolledCount } = req.body;
  setTimeout(() => {
    const db = readDB();
    const crs = db.courses.find(c => c.id === id);
    if (crs) {
      crs.enrolledCount = enrolledCount;
      writeDB(db);
      console.log(`[DB ENROLLED COUNT UPDATE] Course ${id} enrolledCount set to ${enrolledCount} (0.1s done)`);
    }
    res.json({ success: true, crs });
  }, 100);
};

export const updateCourseStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 강좌 상태를 모집마감(CLOSED - 3초 지연 완료)으로 변경한 직후 수강 인원을 수정(0.1초 완료)하면,
  // 수강 인원 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 강좌 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 수강 인원)을 덮어써 저장하여 새로고침 시
  // 강좌 상태와 상세 패널의 수강 인원이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const crs = dbSnapshot.courses.find(c => c.id === id);
    if (crs) {
      crs.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back enrolledCount update!
      console.log(`[DB STATUS UPDATE] Course ${id} status set to ${status} (3s done, rolled back enrolledCount update)`);
    }
    res.json({ success: true, crs });
  }, 3000);
};

export const cancelEnrollment = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const enr = db.enrollments.find(e => e.id === id);
    if (enr) {
      enr.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL ENROLLMENT] Enrollment ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, enr });
  }, 500);
};

export const markAttendance = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 수강 취소 API(0.5초 완료)를 호출한 직후 출석 처리 API를 호출(4초 지연 완료)하면,
  // 수강 취소는 성공하지만 늦게 완료된 출석 처리 요청(4초 지연)이 취소된 수강생을 다시 'ATTENDED'(출석완료) 상태로 복원시켜버립니다.
  // 목록에서는 수강취소(CANCELLED), 문화센터 관제에서는 출석완료(ATTENDED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const enr = db.enrollments.find(e => e.id === id);
    if (enr) {
      enr.status = 'ATTENDED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to ATTENDED!
      console.log(`[DB RESTORE STATUS] Re-activated enrollment ${id} back to ATTENDED status via attendance marking!`);
    }
    writeDB(db);
    res.json({ success: true, enr });
  }, 4000);
};

export const cancelCourseUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 강좌 폐강 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '강좌 폐강 처리 성공 (CULTURE COURSE CANCELLED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] CULTURE COURSE CANCELLED SUCCESSFULLY for course ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief culture director role required to cancel course" });
  }
  const db = readDB();
  const crs = db.courses.find(c => c.id === id);
  if (crs) { crs.status = 'CANCELLED'; writeDB(db); }
  res.json({ success: true, crs });
};

export const updateCoursePartial = (req, res) => {
  const { id } = req.params;
  const { courseName, roomNo, instructorName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 강좌 정보 수정 모달에서 강좌명, 강의실, 강사명을 동시에 수정하면,
  // backend data.json에는 강좌명(courseName)과 강사명(instructorName)만 저장하고 강의실(roomNo)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const crs = db.courses.find(c => c.id === id);
  if (crs) {
    if (courseName) crs.courseName = courseName;
    if (instructorName) crs.instructorName = instructorName;
    // roomNo is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated courseName and instructorName for course ${id}. roomNo was NOT updated.`);
  }
  res.json({ success: true, crs });
};

export const deleteAttendanceLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.attendanceLogs = db.attendanceLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 출석 로그를 삭제(`DELETE /api/attendance-logs/:id`) 처리하여 출석 로그 목록에서 소거하더라도,
  // cultureStats(강좌별 출석률, 강사별 수업 수, 카테고리별 신청률 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed attendance log ${id}. cultureStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-5001", name: "김문화 (시민 문화센터 강좌 기획 총괄팀장)", role: "MANAGER", category: "인문학 & 서양 미술사", handledCourses: 390 }],
    instructors: [{ id: "INS-01", instructorName: "김교수 강사", phone: "010-9999-3333", major: "서양 미술사 & 인문학", assignedCourses: 4, rating: 4.9 }],
    students: [{ id: "STD-01", studentName: "최수강생", phone: "010-5555-1111", roomNo: "301호 서양화 실습실", courseName: "명화로 읽는 서양 미술사", totalEnrolled: 6, attendanceRate: 95 }],
    courses: [{ id: "CRS-1001", courseCode: "CC-20260805-01", category: "인문학 & 서양 미술사", courseName: "명화로 읽는 서양 미술사 마스터반", instructorName: "김교수 강사", roomNo: "301호 서양화 실습실", startDate: "2026-08-05", maxCapacity: 30, enrolledCount: 28, tuitionFeeWon: 150000, status: "RECRUITING" }],
    enrollments: [{ id: "ENR-8001", courseId: "CRS-1001", courseName: "명화로 읽는 서양 미술사", studentName: "최수강생", enrollDate: "2026-08-05", tuitionFeeWon: 150000, status: "ENROLLED" }],
    attendanceLogs: [{ id: "ALOG-9001", courseId: "CRS-1001", courseName: "명화 서양 미술사", studentName: "최수강생", attendDate: "2026-08-05 14:00", instructorName: "김교수 강사", status: "PRESENT" }],
    activityLogs: [{ id: "ACT-9801", courseId: "CRS-1001", operator: "김문화 (팀장)", action: "강좌 CRS-1001 최수강생 님 서양 미술사 28명 수강 등록 완료", timestamp: "2026-08-05 14:05:00", status: "SUCCESS" }],
    cultureStats: { totalCourses: 40, totalStudents: 80, totalInstructors: 20, totalEnrollments: 70, totalAttendanceLogs: 100, recruitingCount: 14, closedCount: 18, avgAttendanceRate: 92.4 }
  };
  writeDB(initial);
  res.json({ success: true });
};
