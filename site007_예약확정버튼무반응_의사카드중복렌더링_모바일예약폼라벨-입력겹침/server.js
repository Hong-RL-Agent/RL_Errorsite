const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9226;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const departments = ['전체', '내과', '정형외과', '피부과', '안과', '이비인후과'];

const doctors = [
  { id: 1, name: '김의사', dept: '내과', specialty: '소화기내과 전문의', image: '👨‍⚕️' },
  { id: 2, name: '이의사', dept: '정형외과', specialty: '척추 관절 전문의', image: '👩‍⚕️' },
  { id: 3, name: '박의사', dept: '피부과', specialty: '레이저 클리닉', image: '👨‍⚕️' },
  { id: 4, name: '최의사', dept: '안과', specialty: '백내장/시력교정', image: '👩‍⚕️' },
  { id: 5, name: '정의사', dept: '내과', specialty: '호흡기 질환 전문', image: '👨‍⚕️' }
];

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

// --- API Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site007', port: PORT, timestamp: new Date().toISOString() });
});

app.get('/api/departments', (req, res) => {
  res.json({ success: true, data: departments });
});

app.get('/api/doctors', (req, res) => {
  const { dept } = req.query;
  let filtered = doctors;
  if (dept && dept !== '전체') {
    filtered = filtered.filter(d => d.dept === dept);
  }
  res.json({ success: true, data: filtered });
});

app.get('/api/slots', (req, res) => {
  res.json({ success: true, data: timeSlots });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Hospital server running -> http://localhost:${PORT}`);
});
