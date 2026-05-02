const express = require('express');
const path = require('path');
const app = express();
const PORT = 9333;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let pets = [
  { id: 'pet1', name: '초코', species: '강아지', breed: '푸들', age: 3, weight: 4.5, image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'pet2', name: '나비', species: '고양이', breed: '코리안숏헤어', age: 2, weight: 3.8, image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300&h=300' }
];

let vaccines = [
  { id: 'v1', petId: 'pet1', name: '종합백신 1차', date: '2023-01-15', status: '완료' },
  { id: 'v2', petId: 'pet1', name: '광견병', date: '2023-06-20', status: '완료' },
  { id: 'v3', petId: 'pet1', name: '종합백신 추가접종', date: '2026-10-15', status: '예정' },
  { id: 'v4', petId: 'pet2', name: '종합백신 1차', date: '2024-03-10', status: '완료' },
  { id: 'v5', petId: 'pet2', name: '심장사상충', date: '2026-06-01', status: '예정' }
];

let appointments = [];
let records = [
  { id: 'r1', petId: 'pet1', date: '2026-04-20', symptom: '가벼운 기침', note: '따뜻한 물 급여 요망' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PetCare Hub API is running' });
});

// API: Get Pets
app.get('/api/pets', (req, res) => {
  res.json(pets);
});

// API: Get Vaccines
app.get('/api/vaccines', (req, res) => {
  const { filter } = req.query;
  const today = new Date('2026-05-01'); // Fixed today for testing
  let result = [...vaccines];

  if (filter === 'upcoming') {
    // INTENTIONAL BUG: site004-bug01
    // CSV Error: DB 날짜 비교 오류
    // Type: database-date-query
    // Description: 예방접종 예정일 필터에서 오늘 이후가 아니라 오늘 이전 데이터를 반환함.
    // Intended: new Date(v.date) >= today
    // Buggy: new Date(v.date) < today
    result = result.filter(v => new Date(v.date) < today);
  }

  res.json(result);
});

// API: Get and Create Appointments
app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

app.post('/api/appointments', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  // INTENTIONAL BUG: site004-bug03
  // CSV Error: 세션 검증 누락
  // Type: security-session
  // Description: 세션 토큰이 만료되어도 병원 예약 API 접근이 허용됨.
  // It only checks if header exists, doesn't validate if it's expired or invalid.
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { date, time, hospital, petId } = req.body;

  // INTENTIONAL BUG: site004-bug02
  // CSV Error: 요청 본문 누락 처리 실패
  // Type: network-request-validation
  // Description: 예약 생성 API가 필수 필드 누락에도 201 Created를 반환함.
  // Missing check for: if (!date || !time || !hospital) return res.status(400)...
  
  const newAppt = {
    id: 'apt' + Date.now(),
    date: date,     // Could be undefined
    time: time,     // Could be undefined
    hospital: hospital, // Could be undefined
    petId: petId || 'pet1'
  };
  
  appointments.push(newAppt);
  
  // Always returns 201 even with empty body
  res.status(201).json({ success: true, appointment: newAppt, message: '예약이 확정되었습니다.' });
});

// API: Get and Create Health Records
app.get('/api/records', (req, res) => {
  const { petId } = req.query;
  let result = [...records];
  if (petId) {
    result = result.filter(r => r.petId === petId);
  }
  res.json(result);
});

app.post('/api/records', (req, res) => {
  const { petId, date, symptom, note } = req.body;
  if (!petId || !symptom) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newRecord = {
    id: 'r' + Date.now(),
    petId,
    date: date || new Date().toISOString().split('T')[0],
    symptom,
    note
  };
  records.push(newRecord);
  res.status(201).json({ success: true, record: newRecord });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
