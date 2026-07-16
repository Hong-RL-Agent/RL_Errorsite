import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5043;

app.use(cors());
app.use(express.json());

// Patients Database
let patients = [
  { id: "patient-A", name: "김환자", role: "본인", age: 34, disease: "급성 편도염 및 피로 누적" },
  { id: "patient-B", name: "김아들 (보호대상)", role: "보호자 위임 계정", age: 7, disease: "유아성 아토피 및 알레르기" }
];

// Doctor appointments
let appointments = [
  { id: "app-01", patientId: "patient-A", doctor: "내과 이원장", time: "2026-07-15 10:00", status: "CONFIRMED" },
  { id: "app-02", patientId: "patient-B", doctor: "소아과 박과장", time: "2026-07-16 14:00", status: "CONFIRMED" }
];

// Lab Test results (Minimum 15 items)
let labTests = [
  { id: "lab-01", patientId: "patient-A", title: "일반 혈액 검사 (Hb)", date: "2026-07-10", value: 14.5, referenceMin: 13.0, referenceMax: 17.0, unit: "g/dL", status: "NORMAL" },
  { id: "lab-02", patientId: "patient-A", title: "간기능 검사 (AST)", date: "2026-07-10", value: 28, referenceMin: 0, referenceMax: 40, unit: "U/L", status: "NORMAL" },
  { id: "lab-03", patientId: "patient-A", title: "간기능 검사 (ALT)", date: "2026-07-10", value: 45, referenceMin: 0, referenceMax: 41, unit: "U/L", status: "HIGH" },
  { id: "lab-04", patientId: "patient-A", title: "신장기능 검사 (Creatinine)", date: "2026-07-10", value: 0.85, referenceMin: 0.5, referenceMax: 1.2, unit: "mg/dL", status: "NORMAL" },
  { id: "lab-05", patientId: "patient-A", title: "공복 혈당 검사 (Glucose)", date: "2026-07-10", value: 95, referenceMin: 70, referenceMax: 100, unit: "mg/dL", status: "NORMAL" },
  
  { id: "lab-06", patientId: "patient-B", title: "일반 혈액 검사 (Hb)", date: "2026-07-11", value: 11.8, referenceMin: 11.5, referenceMax: 15.5, unit: "g/dL", status: "NORMAL" },
  { id: "lab-07", patientId: "patient-B", title: "총 콜레스테롤", date: "2026-07-11", value: 165, referenceMin: 120, referenceMax: 200, unit: "mg/dL", status: "NORMAL" },
  { id: "lab-08", patientId: "patient-B", title: "아토피 IgE 면역글로불린", date: "2026-07-11", value: 180, referenceMin: 0, referenceMax: 100, unit: "IU/mL", status: "HIGH" },
  { id: "lab-09", patientId: "patient-B", title: "비타민 D 활성 측정", date: "2026-07-11", value: 18.2, referenceMin: 30.0, referenceMax: 100.0, unit: "ng/mL", status: "LOW" },
  { id: "lab-10", patientId: "patient-B", title: "소아 소화성 위액 산도", date: "2026-07-11", value: 2.1, referenceMin: 1.5, referenceMax: 3.5, unit: "pH", status: "NORMAL" },
  
  { id: "lab-11", patientId: "patient-A", title: "갑상선 자극 호르몬 (TSH)", date: "2026-07-05", value: 2.45, referenceMin: 0.4, referenceMax: 4.5, unit: "uIU/mL", status: "NORMAL" },
  { id: "lab-12", patientId: "patient-A", title: "중성지방 (Triglyceride)", date: "2026-07-05", value: 185, referenceMin: 0, referenceMax: 150, unit: "mg/dL", status: "HIGH" },
  { id: "lab-13", patientId: "patient-B", title: "소아 칼슘 혈청농도", date: "2026-07-01", value: 9.4, referenceMin: 8.8, referenceMax: 10.8, unit: "mg/dL", status: "NORMAL" },
  { id: "lab-14", patientId: "patient-A", title: "염증성 반응 수치 (CRP)", date: "2026-07-10", value: 0.45, referenceMin: 0, referenceMax: 0.5, unit: "mg/dL", status: "NORMAL" },
  { id: "lab-15", patientId: "patient-B", title: "유전자 변형 특수 검사서 (정밀)", date: "2026-07-12", value: 88.4, referenceMin: 0.0, referenceMax: 50.0, unit: "%", status: "CRITICAL" }
];

// Prescriptions List
let prescriptions = [
  { id: "pres-01", patientId: "patient-A", medicine: "아스피린 100mg", dose: "1일 1회 1정 (식후 30분)", fee: 12000 },
  { id: "pres-02", patientId: "patient-A", medicine: "항생제 아목시실린", dose: "1일 3회 1정 (식후 30분)", fee: 8500 },
  { id: "pres-03", patientId: "patient-B", medicine: "아토피 연고 에스파손", dose: "1일 2회 환부 도포", fee: 15000 }
];

// Billing slip items (Connected to prescriptions)
let billingItems = [
  { id: "bill-visit-01", type: "visit", title: "기본 외래 진찰료 (초진)", cost: 16500 },
  { id: "bill-pres-01", type: "medicine", title: "아스피린 100mg 약제 처방비", cost: 12000 },
  { id: "bill-pres-02", type: "medicine", title: "항생제 아목시실린 약제 처방비", cost: 8500 },
  { id: "bill-pres-03", type: "medicine", title: "아토피 연고 에스파손 약제 처방비", cost: 15000 }
];

// 문진표 State
let questionnaireResult = {
  fever: "no",
  cough: "no",
  symptoms: ""
};

// API: Get Patients
app.get('/api/patients', (req, res) => {
  res.json(patients);
});

// API: Get Appointments
app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

// API: Reschedule Appointment (Error 2 Reschedule Race 3s delay)
app.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { time, doctor, patientId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 진료 예약 시간 변경 요청 시 디비 업데이트 처리를 3000ms(3초) 강제 딜레이 시킵니다.
  // 사용자가 시간 변경 직후 취소를 눌렀을 때, 취소(삭제)가 먼저 완료되고 3초 뒤에 이 작업이 실행되면서
  // 디비에 없는 예약을 신규 시간 정보로 다시 생성(Recreate)하여 예약을 유령 부활시키는 논리 오류를 제공합니다.
  setTimeout(() => {
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      appt.time = time;
      console.log(`[DB APPT] Appointment ${id} time updated to ${time}`);
    } else {
      // Recreate deleted appointment
      appointments.push({
        id,
        patientId: patientId || "patient-A",
        doctor: doctor || "종합진료의",
        time: time || "10:00",
        status: "CONFIRMED"
      });
      console.log(`[DB APPT RACE] Cancelled Appointment ${id} resurrected at ${time}!`);
    }
  }, 3000);

  res.json({ success: true });
});

// API: Cancel Appointment (Error 2 Fast 0.1s execution)
app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  
  setTimeout(() => {
    appointments = appointments.filter(a => a.id !== id);
    console.log(`[DB APPT] Appointment ${id} deleted (0.1s)`);
  }, 100);

  res.json({ success: true, message: "예약이 취소되었습니다." });
});

// API: Get Lab Tests
app.get('/api/labs', (req, res) => {
  res.json(labTests);
});

// API: Get Lab Test details & Guardian permission check (Error 5 Information Leak)
app.get('/api/labs/:id', (req, res) => {
  const { id } = req.params;
  const { userRole } = req.query;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 보호자 계정이 접근 권한이 없는 민감 정밀 검사서(lab-15)를 요청했을 때, 
  // HTTP 403 Forbidden 상태 코드를 반환하면서도 응답 body 페이로드에 
  // 검사 제목(title)과 비공개 환자 수치 데이터(leakValue)를 노출해 버리는 중대 보안 취약점을 탑재합니다.
  if (id === 'lab-15' && userRole === 'guardian') {
    return res.status(403).json({
      error: "보호자(Guardian) 연동 제한으로 인해 접근할 수 없는 진료서입니다.",
      title: "유전자 변형 특수 검사서 (정밀 보안)",
      leakValue: "핵산 이상 분석 수치: 88.4% (위험범위 초과)"
    });
  }

  const test = labTests.find(l => l.id === id);
  if (test) {
    res.json(test);
  } else {
    res.status(404).json({ error: "검사 기록을 찾을 수 없습니다." });
  }
});

// API: Save Questionnaire (Error 3 Concurrent submission merge)
app.post('/api/questionnaire', (req, res) => {
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 문진표 이전 단계 수정 제출 시, 이전 전송 예약분과 신규 전송 요청이 동시에 유입됩니다.
  // 서버는 각 페이로드를 별도 큐로 처리하지 않고 단순 스프레드 연산자(`...req.body`)로 덮어쓰기 병합하여,
  // 일부 속성은 과거 전송분, 일부 속성은 새 전송분으로 서로 꼬여 디비에 기록되는 오작동을 유발합니다.
  questionnaireResult = {
    ...questionnaireResult,
    ...req.body
  };

  console.log('[DB QUESTIONNAIRE] Merged submission:', questionnaireResult);
  res.json({ success: true, result: questionnaireResult });
});

// API: Get Questionnaire
app.get('/api/questionnaire', (req, res) => {
  res.json(questionnaireResult);
});

// API: Get Prescriptions
app.get('/api/prescriptions', (req, res) => {
  res.json(prescriptions);
});

// API: Delete Prescription (Error 4 Prescription Billing Orphan Fee)
app.delete('/api/prescriptions/:id', (req, res) => {
  const { id } = req.params;
  
  // Remove from prescriptions list
  prescriptions = prescriptions.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 처방 목록에서 약제 처방전을 삭제하더라도, 연관되어 수납 청구되는 
  // 약제비(bill-pres-ID) 항목을 진료비 계산 항목(billingItems)에서 지우지 않고 방치시킵니다.
  // 이에 따라 처방 목록에는 안 나타나지만, 진료비 수납금 총합 계산에는 약제비가 계속 합산되어 부과됩니다.

  res.json({ success: true });
});

// API: Get Billing Slipping Items
app.get('/api/billing', (req, res) => {
  res.json(billingItems);
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  appointments = [
    { id: "app-01", patientId: "patient-A", doctor: "내과 이원장", time: "2026-07-15 10:00", status: "CONFIRMED" },
    { id: "app-02", patientId: "patient-B", doctor: "소아과 박과장", time: "2026-07-16 14:00", status: "CONFIRMED" }
  ];
  prescriptions = [
    { id: "pres-01", patientId: "patient-A", medicine: "아스피린 100mg", dose: "1일 1회 1정 (식후 30분)", fee: 12000 },
    { id: "pres-02", patientId: "patient-A", medicine: "항생제 아목시실린", dose: "1일 3회 1정 (식후 30분)", fee: 8500 },
    { id: "pres-03", patientId: "patient-B", medicine: "아토피 연고 에스파손", dose: "1일 2회 환부 도포", fee: 15000 }
  ];
  billingItems = [
    { id: "bill-visit-01", type: "visit", title: "기본 외래 진찰료 (초진)", cost: 16500 },
    { id: "bill-pres-01", type: "medicine", title: "아스피린 100mg 약제 처방비", cost: 12000 },
    { id: "bill-pres-02", type: "medicine", title: "항생제 아목시실린 약제 처방비", cost: 8500 },
    { id: "bill-pres-03", type: "medicine", title: "아토피 연고 에스파손 약제 처방비", cost: 15000 }
  ];
  questionnaireResult = { fever: "no", cough: "no", symptoms: "" };
  res.json({ success: true, appointments, prescriptions, billingItems, questionnaireResult });
});

app.listen(PORT, () => {
  console.log(`[MediPortal Backend] Express server running on http://localhost:${PORT}`);
});
