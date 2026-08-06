import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getMenus = (req, res) => res.json(readDB().menus);
export const getStudents = (req, res) => res.json(readDB().students);
export const getAllergies = (req, res) => res.json(readDB().allergies);
export const getSubMealRequests = (req, res) => res.json(readDB().subMealRequests);
export const getServingLogs = (req, res) => res.json(readDB().servingLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchStudents = (req, res) => {
  const { gradeClass, riskLevel, search } = req.query;
  const db = readDB();
  let list = db.students;
  if (gradeClass && gradeClass !== 'ALL') list = list.filter(s => s.gradeClass.includes(gradeClass));
  if (riskLevel && riskLevel !== 'ALL') list = list.filter(s => s.riskLevel === riskLevel);
  if (search) list = list.filter(s => s.studentName.includes(search) || s.allergies.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 학년 필터('1학년' 3초 지연 ➔ '2학년' 0.2초 완료)와 알레르기 필터를 빠르게 변경 시
  // 오래된 이전 응답(1학년)이 최신 학생 목록을 덮어쓰고, 학생 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (gradeClass && gradeClass.includes('1학년')) delay = 3000;
  else if (gradeClass && gradeClass.includes('2학년')) delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateSubMealMenu = (req, res) => {
  const { id } = req.params;
  const { menuId, menuName, requestedSubMenu } = req.body;
  setTimeout(() => {
    const db = readDB();
    const sub = db.subMealRequests.find(s => s.id === id);
    if (sub) {
      sub.menuId = menuId;
      sub.menuName = menuName;
      sub.requestedSubMenu = requestedSubMenu;
      writeDB(db);
      console.log(`[DB MENU UPDATE] SubMeal ${id} menu set to ${menuName} (0.1s done)`);
    }
    res.json({ success: true, sub });
  }, 100);
};

export const updateSubMealStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 대체식 신청 상태를 승인완료(APPROVED - 3초 지연 완료)로 변경한 직후 식단을 변경(0.1초 완료)하면,
  // 식단 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 식단)을 덮어써 저장하여 새로고침 시
  // 대체식 신청의 식단과 상세 패널의 식단이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const sub = dbSnapshot.subMealRequests.find(s => s.id === id);
    if (sub) {
      sub.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back menu update!
      console.log(`[DB STATUS UPDATE] SubMeal ${id} status set to ${status} (3s done, rolled back menu update)`);
    }
    res.json({ success: true, sub });
  }, 3000);
};

export const cancelSubMeal = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const sub = db.subMealRequests.find(s => s.id === id);
    if (sub) {
      sub.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SUBMEAL] SubMeal ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, sub });
  }, 500);
};

export const completeServing = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 대체식 신청 취소 API(0.5초 완료)를 호출한 직후 배식 완료 API를 호출(4초 지연 완료)하면,
  // 신청 취소는 성공하지만 늦게 완료된 배식 완료 요청(4초 지연)이 취소된 신청을 다시 'SERVED'(배식완료) 상태로 바꿔버립니다.
  // 목록에서는 취소됨(CANCELLED), 배식 관제에서는 배식완료(SERVED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const sub = db.subMealRequests.find(s => s.id === id);
    if (sub) {
      sub.status = 'SERVED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to SERVED!
      console.log(`[DB RESTORE STATUS] Re-activated subMeal ${id} back to SERVED status via complete serving!`);
    }
    writeDB(db);
    res.json({ success: true, sub });
  }, 4000);
};

export const approveSubMealUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 대체식 승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '대체식 승인 성공 (SUBSTITUTE MEAL APPROVED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] SUBSTITUTE MEAL APPROVED SUCCESSFULLY for request ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief nutritionist role required to approve substitute meal" });
  }
  const db = readDB();
  const sub = db.subMealRequests.find(s => s.id === id);
  if (sub) { sub.status = 'APPROVED'; writeDB(db); }
  res.json({ success: true, sub });
};

export const updateStudentPartial = (req, res) => {
  const { id } = req.params;
  const { studentName, gradeClass, allergies } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 학생 정보 수정 모달에서 이름, 학년반, 알레르기 항목을 동시에 수정하면,
  // backend data.json에는 이름(studentName)과 알레르기 항목(allergies)만 저장하고 학년반(gradeClass)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const std = db.students.find(s => s.id === id);
  if (std) {
    if (studentName) std.studentName = studentName;
    if (allergies) std.allergies = allergies;
    // gradeClass is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated studentName and allergies for student ${id}. gradeClass was NOT updated.`);
  }
  res.json({ success: true, std });
};

export const deleteServingLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.servingLogs = db.servingLogs.filter(s => s.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 배식 로그를 삭제(`DELETE /api/serving-logs/:id`) 처리하여 배식 로그 목록에서 소거하더라도,
  // mealStats(메뉴별 배식 수량, 알레르기 학생 수, 대체식 승인율 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed serving log ${id}. mealStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-7001", name: "김영양 (대표 수석 영양사)", role: "MANAGER", dept: "학교 급식 영양관리실", handledMeals: 240 }],
    menus: [{ id: "MNU-1001", menuName: "수제 등심 돈가스 & 브로콜리 샐러드", mealDate: "2026-08-05", mealType: "중식", allergiesInfo: "돼지고기, 밀, 대두, 유제품", substituteOption: "두부 스테이크 & 버섯 샐러드", riskLevel: "HIGH" }],
    students: [{ id: "STD-4001", studentName: "홍길동", gradeClass: "1학년 2반", allergies: "돼지고기, 밀, 유제품", riskLevel: "HIGH", parentPhone: "010-9876-5432" }],
    allergies: [{ id: "ALG-5001", allergyName: "난류 (계란)", category: "축산물", riskSeverity: "HIGH", studentCount: 18 }],
    subMealRequests: [{ id: "SUB-2001", studentId: "STD-4001", studentName: "홍길동", gradeClass: "1학년 2반", menuId: "MNU-1001", menuName: "수제 등심 돈가스", requestedSubMenu: "두부 스테이크 & 버섯 샐러드", requestDate: "2026-08-04", status: "APPROVED" }],
    servingLogs: [{ id: "SLOG-9001", subMealId: "SUB-2001", studentName: "홍길동", menuName: "두부 스테이크 대체식", servedQuantity: 1, timestamp: "2026-08-04 12:15:00" }],
    activityLogs: [{ id: "ACT-9501", subMealId: "SUB-2001", operator: "김영양 (영양사)", action: "홍길동 학생 돼지고기 알레르기 대체식 두부스테이크 승인 완료", timestamp: "2026-08-04 10:00:00", status: "SUCCESS" }],
    mealStats: { totalStudents: 60, totalMenus: 35, totalAllergies: 45, subRequestsCount: 40, approvedCount: 28, servedCount: 22, topAllergy: "갑각류 (새우/게)", approvalRatePercent: 87.5 }
  };
  writeDB(initial);
  res.json({ success: true });
};
