const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = 9131;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
const hospitals = [
  { id: 'H001', name: '서울 중앙 메디컬 센터', location: '서울 강남구', rating: 4.8 },
  { id: 'H002', name: '연세 늘푸른 병원', location: '서울 서대문구', rating: 4.5 },
  { id: 'H003', name: '고려 성심 병원', location: '서울 영등포구', rating: 4.2 }
];

const doctors = [
  { id: 'D001', name: '김민준 원장', specialty: '내과', hospital: 'H001' },
  { id: 'D002', name: '이서윤 교수', specialty: '소아과', hospital: 'H002' },
  { id: 'D003', name: '박하준 박사', specialty: '정형외과', hospital: 'H001' }
];

let appointments = [
  { id: 1001, patient: '홍길동', doctor: '김민준 원장', date: '2026-05-10', time: '10:00', status: 'confirmed', createdAt: '2026-05-01T10:00:00Z' },
  { id: 1002, patient: '이순신', doctor: '이서윤 교수', date: '2026-05-11', time: '14:30', status: 'confirmed', createdAt: '2026-05-01T11:20:00Z' }
];

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: 'site022', status: 'healthy' });
});

// 2. GET /api/hospitals
app.get('/api/hospitals', (req, res) => res.json(hospitals));

// 3. GET /api/doctors
app.get('/api/doctors', (req, res) => res.json(doctors));

// 4. GET /api/appointments (bug01, bug02)
app.get('/api/appointments', (req, res) => {
  const { page, limit = 10, cursor } = req.query;

  // INTENTIONAL BACKEND BUG: site022-bug01
  // Type: pagination-format-change
  // Description: page 기반 요청 시 cursor 기반 응답으로 강제 변경하여 page 정보 누락
  if (page === '1') {
    return res.json({
      success: true,
      data: appointments.slice(0, 5),
      nextCursor: 'abc123_page2',
      bugId: 'site022-bug01'
    });
  }

  // INTENTIONAL BACKEND BUG: site022-bug02
  // Type: cursor-incompatibility
  // Description: 동일 cursor 재사용 시 비호환 오류 발생
  if (cursor === 'abc123_page2') {
    return res.status(400).json({
      success: false,
      message: 'invalid_cursor: This cursor has already been expired or is incompatible.',
      bugId: 'site022-bug02'
    });
  }

  res.json({
    success: true,
    data: appointments,
    page: parseInt(page) || 1,
    limit: parseInt(limit)
  });
});

// 5. GET /api/appointments/:id (bug03)
app.get('/api/appointments/:id', (req, res) => {
  const apt = appointments.find(a => a.id == req.params.id);
  if (!apt) return res.status(404).json({ message: 'Not found' });

  // INTENTIONAL BACKEND BUG: site022-bug03
  // Type: timestamp-format-change
  // Description: ISO 형식을 UNIX Timestamp로 갑자기 변경하여 클라이언트 파싱 오류 유발
  const buggyApt = {
    ...apt,
    createdAt: Math.floor(Date.now() / 1000), // UNIX timestamp instead of ISO
    bugId: 'site022-bug03'
  };

  res.json(buggyApt);
});

// 6. POST /api/appointments (bug04)
app.post('/api/appointments', (req, res) => {
  const { patient, doctor, date, time, forceOverflow } = req.body;
  
  let newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1001;

  // INTENTIONAL BACKEND BUG: site022-bug04
  // Type: numeric-overflow-handling-change
  // Description: 특정 조건(forceOverflow)에서 예약 ID가 오버플로우되어 비정상적인 값 반환
  if (forceOverflow) {
    newId = -2147483648; // Artificial overflow value
    const newApt = { id: newId, patient, doctor, date, time, status: 'confirmed', createdAt: new Date().toISOString() };
    return res.json({
      success: true,
      data: newApt,
      bugId: 'site022-bug04'
    });
  }

  const newApt = { id: newId, patient, doctor, date, time, status: 'confirmed', createdAt: new Date().toISOString() };
  appointments.push(newApt);
  res.json({ success: true, data: newApt });
});

// 7. DELETE /api/appointments/:id
app.delete('/api/appointments/:id', (req, res) => {
  appointments = appointments.filter(a => a.id != req.params.id);
  res.json({ success: true });
});

// 8. GET /api/schedule
app.get('/api/schedule', (req, res) => {
  res.json([
    { time: '09:00', available: true },
    { time: '10:00', available: false },
    { time: '11:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: false }
  ]);
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hospital Server running on http://localhost:${PORT}`);
});
