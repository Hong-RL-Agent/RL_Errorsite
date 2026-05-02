const express = require('express');
const path = require('path');
const app = express();
const PORT = 9348;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let departments = ['내과', '정형외과', '안과', '피부과'];
let doctors = [
  { id: 'd1', name: '김닥터', dept: '내과', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'd2', name: '이전문', dept: '정형외과', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200' }
];

let appointments = [
  { id: 'ap1', doctorId: 'd1', user: '홍길동', date: '2024-05-15', time: '10:00', patientPrivateCode: '850515-1******' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ClinicDesk API is running' });
});

app.get('/api/departments', (req, res) => {
  res.json(departments);
});

// INTENTIONAL BUG: site019-bug02
// CSV Error: 네트워크 실패 재시도 누락
// Type: network-retry
// Description: 예약 가능 시간 API가 일시 실패할 때 재시도 로직 없이 빈 목록만 표시됨.
app.get('/api/doctors', (req, res) => {
  // 20% 확률로 서버 에러 발생 시뮬레이션
  if (Math.random() < 0.2) {
    return res.status(500).json({ error: 'Database Busy' });
  }
  res.json(doctors);
});

// INTENTIONAL BUG: site019-bug01
// CSV Error: DB 예약 시간 충돌
// Type: database-conflict
// Description: 같은 의사와 같은 시간대 예약 중복을 막지 못함.
app.post('/api/appointments', (req, res) => {
  const { doctorId, user, date, time } = req.body;

  // 원래는: const exists = appointments.find(a => a.doctorId === doctorId && a.date === date && a.time === time);
  // if (exists) return res.status(400).json({ error: '이미 예약된 시간입니다.' });

  const newApp = {
    id: 'ap' + Date.now(),
    doctorId,
    user,
    date,
    time,
    patientPrivateCode: '900101-1******' // Mock private data
  };

  appointments.push(newApp);
  res.status(201).json({ success: true, appointment: newApp });
});

// INTENTIONAL BUG: site019-bug03
// CSV Error: 개인정보 과다 노출
// Type: security-data-exposure
// Description: 내 예약 API 응답에 주민번호 형식의 patientPrivateCode mock 값이 포함됨.
app.get('/api/my-appointments', (req, res) => {
  const { user } = req.query;
  const myApps = appointments.filter(a => a.user === user);
  
  // 보안 취약점: patientPrivateCode 를 필터링하지 않고 그대로 보냄
  res.json(myApps);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
