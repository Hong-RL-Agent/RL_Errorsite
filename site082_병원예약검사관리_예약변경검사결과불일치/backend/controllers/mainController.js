import path from 'path';
import { readDB, writeDB } from '../services/dataService.js';

export const getAppointments = (req, res) => {
  const db = readDB();
  res.json(db.appointments);
};

export const searchAppointments = (req, res) => {
  const { deptId, status } = req.query;
  const db = readDB();
  let list = db.appointments;

  if (deptId && deptId !== 'ALL') {
    list = list.filter(a => a.deptId === deptId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(a => a.status === status);
  }

  let delay = 100;
  if (deptId === 'INTERNAL') {
    delay = 3000; // 3.0s delay
  } else if (deptId === 'ORTHO') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 진료과 필터('INTERNAL' 3초 지연 ➔ 'ORTHO' 0.2초 완료)와 예약 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(소화기내과)이 최신 목록을 덮어쓰고, 중앙 진료 예약 목록은 오래된 필터 결과, 오른쪽 환자 요약은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const getTestResults = (req, res) => {
  const db = readDB();
  res.json(db.testResults);
};

export const getTestResultDetail = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const test = db.testResults.find(t => t.id === id);

  if (!test) {
    return res.status(404).json({ error: "Test result not found" });
  }

  const detailTest = { ...test };

  // INTENTIONAL_ERROR
  // CATEGORY: Server 파일 경로 오류
  // DESCRIPTION: 검사 결과 리포트 파일 이름에 한글과 공백이 포함된 경우('혈액 검사 결과 (최종).pdf'), 
  // 목록에서는 정상 표시되나 상세 검사 결과 탭 API 응답 시 이중 URL 인코딩을 적용해 반환하여 상세 탭에서만 파일 링크가 404로 깨지는 결함입니다.
  if (detailTest.reportUrl && detailTest.reportUrl.includes(' ') && (detailTest.reportUrl.includes('(') || detailTest.reportUrl.includes(')'))) {
    const filename = path.basename(detailTest.reportUrl);
    const doubleEncoded = encodeURIComponent(encodeURIComponent(filename));
    detailTest.reportUrl = `/reports/${doubleEncoded}`;
  }

  res.json(detailTest);
};

export const getDoctors = (req, res) => {
  const db = readDB();
  res.json(db.doctors);
};

export const getPatients = (req, res) => {
  const db = readDB();
  res.json(db.patients);
};

export const updateDoctor = (req, res) => {
  const { id } = req.params;
  const { doctorId, doctorName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const apt = db.appointments.find(a => a.id === id);
    if (apt) {
      apt.doctorId = doctorId;
      apt.doctorName = doctorName;
      writeDB(db);
      console.log(`[DB DOCTOR UPDATE] Updated doctor for ${id} to ${doctorName} (0.1s done)`);
    }
    res.json({ success: true, appointment: apt });
  }, 100);
};

export const updateTimeSlot = (req, res) => {
  const { id } = req.params;
  const { date, timeSlot, doctorId, doctorName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 진료 예약 시간을 변경(3초 지연 완료)한 직후 담당 의사를 변경(0.1초 완료)하면, 
  // 의사 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 시간 변경 API 내부에 이전 구형 의사 정보(doctorId, doctorName)가 동봉 저장되어 
  // 새로고침 시 새 시간과 이전 의사 조합이 저장되는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const apt = db.appointments.find(a => a.id === id);
    if (apt) {
      apt.date = date;
      apt.timeSlot = timeSlot;
      if (doctorId) {
        apt.doctorId = doctorId; // Overwrites updated doctor with stale doctorId!
        apt.doctorName = doctorName;
      }
      writeDB(db);
      console.log(`[DB TIME UPDATE] Updated timeSlot for ${id} to ${date} ${timeSlot} (3s done). Overwrote doctor to ${doctorName}`);
    }
    res.json({ success: true, appointment: apt });
  }, 3000);
};

export const cancelAppointment = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const apt = db.appointments.find(a => a.id === id);
    if (apt) {
      apt.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL APT] Cancelled appointment ${id} (0.5s done)`);
    }
    res.json({ success: true, appointment: apt });
  }, 500);
};

export const updateSymptoms = (req, res) => {
  const { id } = req.params;
  const { symptoms } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소(0.5초 완료) 직후 환자가 증상 설명을 수정(4초 지연 완료)하면, 
  // 취소 요청은 먼저 0.5초 만에 성공하지만 늦게 도착한 증상 수정 요청(4초 지연)이 취소된 예약을 다시 'CONFIRMED'(예약 확정) 상태로 재활성화시킵니다. 
  // 목록에서는 취소, 상세에서는 확정 상태로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const apt = db.appointments.find(a => a.id === id);
    if (apt) {
      apt.symptoms = symptoms;
      apt.status = 'CONFIRMED'; // Re-activates cancelled appointment back to CONFIRMED!
      writeDB(db);
      console.log(`[DB RE-ACTIVATE APT] Updated symptoms for ${id} (4s done). Re-activated status to CONFIRMED!`);
    }
    res.json({ success: true, appointment: apt });
  }, 4000);
};

export const deleteAppointment = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.appointments = db.appointments.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 데이터 불일치
  // DESCRIPTION: 예약을 삭제(`DELETE /api/appointments/:id`) 처리하여 대장에서 소거하더라도, 
  // 병원 대시보드의 총 예약 수(`hospitalStats.totalAppointmentsCount`)와 진료과별 수용율 수치에는 차감되지 않고 잔존 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE APT] Removed appointment ${id}. hospitalStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "appointments": [
      { "id": "APT-001", "patientId": "PAT-01", "patientName": "김철수", "deptId": "INTERNAL", "deptName": "소화기내과", "doctorId": "DOC-01", "doctorName": "김내과 전문의", "date": "2026-08-10", "timeSlot": "10:00", "symptoms": "속쓰림 및 상복부 소화불량 지속", "status": "CONFIRMED" },
      { "id": "APT-002", "patientId": "PAT-01", "patientName": "김철수", "deptId": "ORTHO", "deptName": "정형외과", "doctorId": "DOC-03", "doctorName": "박정형 전문의", "date": "2026-08-14", "timeSlot": "14:00", "symptoms": "우측 무릎 관절 통증 및 부종", "status": "CONFIRMED" }
    ],
    "testResults": [
      { "id": "TR-001", "patientId": "PAT-01", "patientName": "김철수", "testName": "종합 혈액 검사 (CBC/LFT)", "category": "BLOOD", "resultValue": "간수치 AST 45, ALT 52 (경도 상승)", "status": "COMPLETED", "reportUrl": "/reports/blood_test.pdf", "testedAt": "2026-07-28" },
      { "id": "TR-002", "patientId": "PAT-01", "patientName": "김철수", "testName": "상복부 초음파 정밀 영상", "category": "IMAGING", "resultValue": "경미한 지방간 소경 관찰됨", "status": "COMPLETED", "reportUrl": "/reports/혈액 검사 결과 (최종).pdf", "testedAt": "2026-07-29" }
    ],
    "doctors": [
      { "id": "DOC-01", "name": "김내과 전문의", "deptId": "INTERNAL", "deptName": "소화기내과", "roomNo": "101호 진료실", "patientsCount": 42 }
    ],
    "patients": [
      { "id": "PAT-01", "name": "김철수", "age": 45, "gender": "남성", "phone": "010-1234-5678", "bloodType": "A+", "latestTestResult": "간수치 AST 45, ALT 52 (경도 상승)", "unreadNoticeCount": 2, "prescriptionSummary": "위산분비억제제 30일분, 소화제 14일분" }
    ],
    "hospitalStats": {
      "totalAppointmentsCount": 25,
      "completedTestsCount": 20
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
