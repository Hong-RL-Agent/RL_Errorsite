import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5061;

app.use(cors());
app.use(express.json());

// Patients Database (Minimum 18 items)
let patients = [
  { id: "pat-01", name: "김민우", age: 45, gender: "남", ward: "5병동", room: "501호", bedId: "bed-01", status: "STABLE", reason: "골절 수술 후 회복", admitDate: "2026-07-01" },
  { id: "pat-02", name: "박영희", age: 34, gender: "여", ward: "5병동", room: "501호", bedId: "bed-02", status: "CRITICAL", reason: "급성 폐렴 케어", admitDate: "2026-07-05" },
  { id: "pat-03", name: "이철수", age: 60, gender: "남", ward: "5병동", room: "502호", bedId: "bed-03", status: "STABLE", reason: "만성 신부전 관찰", admitDate: "2026-06-28" },
  { id: "pat-04", name: "최민준", age: 29, gender: "남", ward: "5병동", room: "502호", bedId: "bed-04", status: "OBSERVING", reason: "충수염 수술 경과", admitDate: "2026-07-10" },
  { id: "pat-05", name: "정영수", age: 72, gender: "남", ward: "6병동", room: "601호", bedId: "bed-05", status: "CRITICAL", reason: "뇌졸중 집중 관제", admitDate: "2026-07-02" },
  { id: "pat-06", name: "한지은", age: 50, gender: "여", ward: "6병동", room: "601호", bedId: "bed-06", status: "STABLE", reason: "위절제술 후 요양", admitDate: "2026-07-08" },
  { id: "pat-07", name: "임성훈", age: 67, gender: "남", ward: "6병동", room: "602호", bedId: "bed-07", status: "OBSERVING", reason: "부정맥 모니터링", admitDate: "2026-07-12" },
  { id: "pat-08", name: "강지혜", age: 41, gender: "여", ward: "6병동", room: "602호", bedId: "bed-08", status: "STABLE", reason: "당뇨 조절 정밀 검사", admitDate: "2026-07-11" },
  { id: "pat-09", name: "배정우", age: 55, gender: "남", ward: "5병동", room: "503호", bedId: "bed-09", status: "OBSERVING", reason: "허리디스크 통증 조절", admitDate: "2026-07-09" },
  { id: "pat-10", name: "윤서진", age: 23, gender: "여", ward: "5병동", room: "503호", bedId: "bed-10", status: "STABLE", reason: "급성 장염 수액 치료", admitDate: "2026-07-13" },
  { id: "pat-11", name: "신현우", age: 48, gender: "남", ward: "6병동", room: "603호", bedId: "bed-11", status: "STABLE", reason: "골관절염 통증 조절", admitDate: "2026-07-06" },
  { id: "pat-12", name: "오지수", age: 37, gender: "여", ward: "6병동", room: "603호", bedId: "bed-12", status: "STABLE", reason: "기흉 보존 치료", admitDate: "2026-07-07" },
  { id: "pat-13", name: "서지원", age: 59, gender: "여", ward: "5병동", room: "504호", bedId: "bed-13", status: "STABLE", reason: "갑상선 전절제 경과", admitDate: "2026-07-03" },
  { id: "pat-14", name: "황보라", age: 31, gender: "여", ward: "5병동", room: "504호", bedId: "bed-14", status: "STABLE", reason: "신장결석 쇄석 후 관리", admitDate: "2026-07-04" },
  { id: "pat-15", name: "유진우", age: 65, gender: "남", ward: "6병동", room: "604호", bedId: "bed-15", status: "CRITICAL", reason: "심근경색 수술 후 집중", admitDate: "2026-07-05" },
  { id: "pat-16", name: "송민경", age: 43, gender: "여", ward: "6병동", room: "604호", bedId: "bed-16", status: "STABLE", reason: "천식 조절 치료", admitDate: "2026-07-08" },
  { id: "pat-17", name: "안성기", age: 70, gender: "남", ward: "5병동", room: "505호", bedId: "bed-17", status: "STABLE", reason: "폐암 항암 화학요법", admitDate: "2026-06-30" },
  { id: "pat-18", name: "양현석", age: 52, gender: "남", ward: "6병동", room: "605호", bedId: "bed-18", status: "STABLE", reason: "간경변 식이 조절", admitDate: "2026-07-01" }
];

// Beds (Minimum 24 beds layout config)
const beds = Array.from({ length: 24 }, (_, i) => ({
  id: `bed-${String(i + 1).padStart(2, '0')}`,
  label: `${String(i + 1).padStart(2, '0')}번 베드`,
  room: i < 4 ? "501호" : i < 8 ? "502호" : i < 12 ? "503호" : i < 16 ? "601호" : i < 20 ? "602호" : "603호"
}));

// Medications log database
let medications = [
  { id: "med-01", patientId: "pat-01", roomId: "501호", drugName: "아세트아미노펜 (진통제)", dosage: "650mg", time: "오전 09:00" },
  { id: "med-02", patientId: "pat-02", roomId: "501호", drugName: "아목시실린 (항생제)", dosage: "500mg", time: "오전 10:30" }
];

// Medication Alerts (Active tasks)
let medicationAlerts = [
  { id: "al-01", patientId: "pat-01", drugName: "아세트아미노펜 서방정", scheduledTime: "오후 18:00" },
  { id: "al-02", patientId: "pat-03", drugName: "후로세미드 이뇨제", scheduledTime: "오후 19:30" },
  { id: "al-03", patientId: "pat-05", drugName: "항혈소판제 (아스피린)", scheduledTime: "오후 20:00" }
];

// Exams database
let exams = [
  { id: "ex-01", patientId: "pat-01", examType: "흉부 X-Ray 촬영", scheduledTime: "오후 14:00", status: "PENDING" },
  { id: "ex-02", patientId: "pat-02", examType: "동맥혈가스분석 (ABGA)", scheduledTime: "오후 15:30", status: "PENDING" },
  { id: "ex-03", patientId: "pat-05", examType: "뇌 CT 정밀 스캔", scheduledTime: "오후 16:00", status: "PENDING" }
];

// Nursing Logs database
let nursingLogs = [
  { id: "nl-01", patientId: "pat-01", note: "수술 부위 통증 완만하게 조절 중. 배액관 분비물 양 양호.", time: "오전 09:15" },
  { id: "nl-02", patientId: "pat-02", note: "산소 포화도 94~95% 수준 유지. 기침 가래 증상 지속 관찰.", time: "오전 10:45" }
];

// API: Get patients list
app.get('/api/patients', (req, res) => {
  res.json(patients);
});

// API: Filter patients (Error 5 Target - filter race)
app.get('/api/patients/filter', (req, res) => {
  const { ward, status } = req.query;
  let filtered = patients;

  if (ward && ward !== 'ALL') {
    filtered = filtered.filter(p => p.ward === ward);
  }
  if (status && status !== 'ALL') {
    filtered = filtered.filter(p => p.status === status);
  }

  let delay = 100;
  if (ward === '5병동') {
    delay = 3000; // 3s delay
  } else if (ward === '6병동') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 병동 필터 고속 변경 시 5병동(3초 지연) 요청 응답이 
  // 6병동(0.2초) 요청 응답보다 늦게 도착하여 최신 목록을 덮어씀으로써 
  // 필터 선택값과 실제 노출되는 환자 명단 불일치를 유발하는 결함입니다.
  setTimeout(() => {
    res.json(filtered);
  }, delay);
});

// API: Add Patient (Admission registration)
app.post('/api/patients', (req, res) => {
  const { name, age, gender, ward, room, bedId, reason } = req.body;
  const newPatient = {
    id: `pat-${Date.now()}`,
    name,
    age: Number(age),
    gender,
    ward,
    room,
    bedId,
    status: "STABLE",
    reason,
    admitDate: new Date().toISOString().split('T')[0]
  };
  patients.push(newPatient);
  res.json(newPatient);
});

// API: Room Transfer (Error 1 and 3 Target - 4s delay, status ADMITTED)
app.patch('/api/patients/:id/room', (req, res) => {
  const { id } = req.params;
  const { room, bedId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend + Database
  // DESCRIPTION: 병실 이동(PATCH) 요청을 4초 지연시킵니다. 
  // 직후 요청되는 투약 기록 저장(1초) 시점에 데이터베이스 상 환자의 병실 정보는 여전히 
  // 구형 병실 A로 매핑되어 투약 대장에 이전 병실 정보가 누적 기록되는 결함입니다.
  // 또한 퇴원 후 이 요청이 늦게 완료되면 퇴원 상태를 덮어쓰고 강제 입원('ADMITTED')으로 부활시킵니다.
  setTimeout(() => {
    const pat = patients.find(p => p.id === id);
    if (pat) {
      pat.room = room;
      pat.bedId = bedId;
      pat.status = 'STABLE'; // Resurrects state if discharged!
      console.log(`[DB TRANSFER] Patient ${id} transferred to ${room} (${bedId})`);
    }
    res.json({ success: true, patient: pat });
  }, 4000);
});

// API: Discharge patient (Error 3 Target - 0.1s delay)
app.post('/api/patients/:id/discharge', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const pat = patients.find(p => p.id === id);
    if (pat) {
      pat.status = "DISCHARGED";
      pat.room = "퇴원 완료";
      pat.bedId = null;
      console.log(`[DB DISCHARGE] Patient ${id} discharged.`);
    }
    res.json({ success: true, patient: pat });
  }, 100);
});

// API: Delete patient (Error 4 Target - leaks exams/alerts)
app.delete('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  patients = patients.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 환자를 시스템에서 삭제(DELETE)하더라도 해당 환자에게 걸린 
  // 예정 검사(`exams`) 및 미완료 투약 알림 데이터를 지우지 않고 방치하여, 
  // 대시보드상의 예정 간호 업무 총계 지표에 유령 건수가 계속 누적 노출되는 결함입니다.
  console.log(`[DB DELETE] Removed patient ${id}. Left exams and medicationAlerts behind!`);
  res.json({ success: true });
});

// API: Post medication (Error 1 Target - 1s delay)
app.post('/api/medications', (req, res) => {
  const { patientId, drugName, dosage } = req.body;

  setTimeout(() => {
    const pat = patients.find(p => p.id === patientId);
    const newMed = {
      id: `med-${Date.now()}`,
      patientId,
      roomId: pat ? pat.room : 'unknown', // Patient room is still OLD room A (since PATCH room is 4s delayed)!
      drugName,
      dosage,
      time: new Date().toLocaleTimeString()
    };
    medications.push(newMed);
    console.log(`[DB MEDICATION] Saved medication: ${drugName} for patient ${patientId} in room ${newMed.roomId}`);
    res.json({ success: true, medication: newMed });
  }, 1000);
});

app.get('/api/medications', (req, res) => {
  res.json(medications);
});

// API: Post nursing log
app.post('/api/nursing', (req, res) => {
  const { patientId, note } = req.body;
  const newLog = {
    id: `nl-${Date.now()}`,
    patientId,
    note,
    time: new Date().toLocaleTimeString()
  };
  nursingLogs.push(newLog);
  console.log(`[DB NURSING] Added log for patient ${patientId}`);
  res.json({ success: true, nursingLog: newLog });
});

app.get('/api/nursing', (req, res) => {
  res.json(nursingLogs);
});

// API: Exams
app.get('/api/exams', (req, res) => {
  res.json(exams);
});

app.post('/api/exams', (req, res) => {
  const { patientId, examType, scheduledTime } = req.body;
  const newExam = {
    id: `ex-${Date.now()}`,
    patientId,
    examType,
    scheduledTime,
    status: "PENDING"
  };
  exams.push(newExam);
  res.json(newExam);
});

// API: Alerts
app.get('/api/alerts', (req, res) => {
  res.json(medicationAlerts);
});

// API: Reset DB
app.post('/api/reset', (req, res) => {
  patients = [
    { id: "pat-01", name: "김민우", age: 45, gender: "남", ward: "5병동", room: "501호", bedId: "bed-01", status: "STABLE", reason: "골절 수술 후 회복", admitDate: "2026-07-01" },
    { id: "pat-02", name: "박영희", age: 34, gender: "여", ward: "5병동", room: "501호", bedId: "bed-02", status: "CRITICAL", reason: "급성 폐렴 케어", admitDate: "2026-07-05" },
    { id: "pat-03", name: "이철수", age: 60, gender: "남", ward: "5병동", room: "502호", bedId: "bed-03", status: "STABLE", reason: "만성 신부전 관찰", admitDate: "2026-06-28" }
  ];
  medications = [
    { id: "med-01", patientId: "pat-01", roomId: "501호", drugName: "아세트아미노펜 (진통제)", dosage: "650mg", time: "오전 09:00" }
  ];
  medicationAlerts = [
    { id: "al-01", patientId: "pat-01", drugName: "아세트아미노펜 서방정", scheduledTime: "오후 18:00" },
    { id: "al-02", patientId: "pat-03", drugName: "후로세미드 이뇨제", scheduledTime: "오후 19:30" }
  ];
  exams = [
    { id: "ex-01", patientId: "pat-01", examType: "흉부 X-Ray 촬영", scheduledTime: "오후 14:00", status: "PENDING" }
  ];
  nursingLogs = [
    { id: "nl-01", patientId: "pat-01", note: "수술 부위 통증 완만하게 조절 중. 배액관 분비물 양 양호.", time: "오전 09:15" }
  ];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[WardFlow Backend] Express server running on http://localhost:${PORT}`);
});
