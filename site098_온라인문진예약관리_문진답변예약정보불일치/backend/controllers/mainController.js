import { readDB, writeDB } from '../services/dataService.js';

export const getAdmins = (req, res) => {
  const db = readDB();
  res.json(db.admins);
};

export const getDepartments = (req, res) => {
  const db = readDB();
  res.json(db.departments);
};

export const getQuestions = (req, res) => {
  const db = readDB();
  res.json(db.questions);
};

export const getPatients = (req, res) => {
  const db = readDB();
  res.json(db.patients);
};

export const getSurveys = (req, res) => {
  const db = readDB();
  res.json(db.surveys);
};

export const getAppointments = (req, res) => {
  const db = readDB();
  res.json(db.appointments);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchSurveys = (req, res) => {
  const { deptName, riskLevel, search } = req.query;
  const db = readDB();
  let list = db.surveys;

  if (deptName && deptName !== 'ALL') {
    list = list.filter(s => s.deptName === deptName);
  }
  if (riskLevel && riskLevel !== 'ALL') {
    list = list.filter(s => s.riskLevel === riskLevel);
  }
  if (search) {
    list = list.filter(s => s.patientName.includes(search) || s.id.includes(search));
  }

  let delay = 100;
  if (deptName === '소화기내과') {
    delay = 3000; // 3.0s delay for 소화기내과
  } else if (deptName === '정형외과') {
    delay = 200; // 0.2s delay for 정형외과
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 진료과 필터('소화기내과' 3초 지연 ➔ '정형외과' 0.2초 완료)와 위험도 필터를 빠르게 변경 시 
  // 오래된 이전 응답(소화기내과)이 최신 문진 목록을 덮어쓰고, 문진 목록은 오래된 필터 결과, 오른쪽 위험도 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateSurveyAnswers = (req, res) => {
  const { id } = req.params;
  const { chiefComplaint, painScore } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 문진 답변을 수정(3초 지연 완료)한 직후 예약 시간을 변경(0.1초 완료)하면, 
  // 예약 시간 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 문진 답변 수정 API가 요청 시작 시점의 구 DB 스냅샷(이전 예약 시간)을 덮어써 저장되어 
  // 새로고침 시 문진 요약과 예약 상세의 시간이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const survey = dbSnapshot.surveys.find(s => s.id === id);
    if (survey) {
      survey.chiefComplaint = chiefComplaint;
      survey.painScore = painScore;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back appointment time changes made during the 3s delay
      console.log(`[DB SURVEY UPDATE] Updated survey ${id} answers (3s done, rolled back appointment time update)`);
    }
    res.json({ success: true, survey });
  }, 3000);
};

export const updateAppointmentTime = (req, res) => {
  const { id } = req.params;
  const { appointmentTime } = req.body;

  setTimeout(() => {
    const db = readDB();
    const appointment = db.appointments.find(a => a.id === id);
    if (appointment) {
      appointment.appointmentTime = appointmentTime;
      writeDB(db);
      console.log(`[DB APPOINTMENT TIME UPDATE] Updated appointment ${id} time to ${appointmentTime} (0.1s done)`);
    }
    res.json({ success: true, appointment });
  }, 100);
};

export const cancelAppointment = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const appointment = db.appointments.find(a => a.id === id);
    if (appointment) {
      appointment.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL APPOINTMENT] Appointment ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, appointment });
  }, 500);
};

export const submitSurvey = (req, res) => {
  const { patientId, patientName, deptName, chiefComplaint, appointmentId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 문진 제출 API를 호출(4초 지연 완료)하면, 
  // 예약 취소는 성공하지만 늦게 완료된 문진 제출 요청(4초 지연)이 취소된 예약을 다시 'CONFIRMED'(문진완료 예약) 상태로 복원해버립니다. 
  // 예약 목록에서는 취소됨, 문진 내역에서는 예약 연결 완료로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const newSurvey = {
      id: `SRV-${Date.now().toString().slice(-4)}`,
      patientId: patientId || "PAT-1001",
      patientName: patientName || "김동남",
      deptName: deptName || "소화기내과",
      chiefComplaint: chiefComplaint || "신규 사전 문진 응답 제출",
      painScore: 5,
      riskLevel: "MEDIUM",
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      reviewStatus: "PENDING",
      appointmentId: appointmentId || "APT-3001"
    };
    if (!db.surveys) db.surveys = [];
    db.surveys.unshift(newSurvey);

    if (appointmentId) {
      const apt = db.appointments.find(a => a.id === appointmentId);
      if (apt) {
        apt.status = 'CONFIRMED'; // INTENTIONAL_ERROR: Restores cancelled appointment back to CONFIRMED!
        console.log(`[DB RESTORE CANCELLED APPOINTMENT] Re-activated appointment ${appointmentId} back to CONFIRMED!`);
      }
    }
    writeDB(db);
    res.json({ success: true, survey: newSurvey });
  }, 4000);
};

export const updateSurveyRisk = (req, res) => {
  const { id } = req.params;
  const { riskLevel } = req.body;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 일반 직원(role !== 'ADMIN')이 문진 위험도 수정 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 활동 로그에는 '위험도 수정 성공 (SURVEY RISK LEVEL UPDATED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] SURVEY RISK LEVEL UPDATED SUCCESSFULLY for survey ${id} to ${riskLevel} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  const survey = db.surveys.find(s => s.id === id);
  if (survey) {
    survey.riskLevel = riskLevel;
    writeDB(db);
  }
  res.json({ success: true, survey });
};

export const updatePatientPartial = (req, res) => {
  const { id } = req.params;
  const { height, weight, medication } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 환자 기본정보 수정 모달에서 키, 몸무게, 복용약을 동시에 수정하면, 
  // backend data.json에는 키(height)와 복용약(medication)만 저장하고 몸무게(weight)는 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것처럼 표시하는 partial save 결함입니다.
  const db = readDB();
  const patient = db.patients.find(p => p.id === id);
  if (patient) {
    if (height) patient.height = height;
    if (medication) patient.medication = medication;
    // weight is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated height and medication for patient ${id}. weight was NOT updated.`);
  }
  res.json({ success: true, patient });
};

export const deleteSurvey = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.surveys = db.surveys.filter(s => s.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 문진 응답을 삭제(`DELETE /api/surveys/:id`) 처리하여 문진 목록에서 소거하더라도, 
  // 위험도 평균(`surveyStats.averagePainScore`), 진료과별 문진 수, 관리자 검토 대기 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE SURVEY] Removed survey ${id}. surveyStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "ADM-101", "name": "김문진 (원무 총괄과장)", "role": "ADMIN", "dept": "원무수납팀" },
      { "id": "ADM-102", "name": "이진료 (사전문진 전문의)", "role": "ADMIN", "dept": "스마트진료 센터" },
      { "id": "ADM-103", "name": "박예약 (간호조무 조교)", "role": "STAFF", "dept": "외래 접수처" }
    ],
    "departments": [
      { "id": "DEP-01", "name": "소화기내과", "doctor": "김내과 과장", "avgRisk": "보통" }
    ],
    "questions": [
      { "id": "QST-01", "category": "기본 증상", "questionText": "현재 가장 불편하신 주요 통증 또는 증상은 무엇인가요?" }
    ],
    "patients": [
      { "id": "PAT-1001", "name": "김동남", "gender": "남", "age": 45, "phone": "010-1111-2222", "height": 175, "weight": 72, "medication": "혈압약 매일 복용" }
    ],
    "surveys": [
      { "id": "SRV-2001", "patientId": "PAT-1001", "patientName": "김동남", "deptName": "소화기내과", "chiefComplaint": "상복부 타는 듯한 둔통 및 심한 속쓰림 2주째 지속", "painScore": 7, "riskLevel": "HIGH", "submittedAt": "2026-08-03 09:00:00", "reviewStatus": "COMPLETED", "appointmentId": "APT-3001" }
    ],
    "appointments": [
      { "id": "APT-3001", "patientId": "PAT-1001", "patientName": "김동남", "deptName": "소화기내과", "doctorName": "김내과 과장", "appointmentTime": "2026-08-05 10:00", "status": "CONFIRMED" }
    ],
    "activityLogs": [
      { "id": "LOG-4001", "operator": "김문진 과장", "action": "사전 문진 작성 완료 (김동남 환자 - 소화기내과)", "timestamp": "2026-08-03 09:00:00", "status": "SUCCESS" }
    ],
    "surveyStats": {
      "totalPatients": 30,
      "totalSurveys": 45,
      "totalAppointments": 35,
      "highRiskCount": 12,
      "pendingReviewCount": 8,
      "averagePainScore": 5.4
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
