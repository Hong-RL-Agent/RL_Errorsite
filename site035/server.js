const express = require('express');
const path = require('path');
const app = express();
const PORT = 9364;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let concerts = [
  { id: 'c1', artist: 'BTS', title: 'Yet To Come in Seoul', date: '2024-07-20', venue: 'Olympic Stadium', genre: 'K-Pop' },
  { id: 'c2', artist: 'IU', title: 'The Golden Hour', date: '2024-08-15', venue: 'Main Stadium', genre: 'K-Pop' },
  { id: 'c3', artist: 'Coldplay', title: 'Music of the Spheres', date: '2024-09-10', venue: 'Gocheok Dome', genre: 'Rock' },
  { id: 'c4', artist: 'Taylor Swift', title: 'The Eras Tour', date: '2024-10-05', venue: 'World Cup Stadium', genre: 'Pop' }
];

let alerts = [
  { id: 'al-1', userId: 'user_A', concertId: 'c1', type: 'Email', status: 'Active' },
  { id: 'al-99', userId: 'user_B', concertId: 'c4', type: 'SMS', status: 'Active' } // 타인 알림
];

// INTENTIONAL BUG: site035-bug02 (Cache Stale)
// 서버 시작 시점의 가상의 좌석 상태 고정
const staticSeatStatus = { available: 124, total: 50000 };

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Concert Radar API is running' });
});

app.get('/api/concerts', (req, res) => {
  res.json(concerts);
});

// API: Get Alert Detail (with IDOR bug)
// INTENTIONAL BUG: site035-bug03
// CSV Error: 알림 설정 소유자 검증 누락
// Type: security-authorization
app.get('/api/alerts/:id', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (alert) {
    // 보안 취약점: 요청한 사용자가 소유자인지 확인하는 로직 누락
    res.json(alert);
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

// API: Create Alert (with duplicate bug)
// INTENTIONAL BUG: site035-bug01
// CSV Error: DB 알림 중복 저장
// Type: database-duplicate
app.post('/api/alerts', (req, res) => {
  const { concertId, userId, type } = req.body;

  // 버그: 중복 검사 로직을 고의로 생략함
  // 원래는: if(alerts.some(a => a.userId === userId && a.concertId === concertId)) ...

  const newAlert = {
    id: 'al-' + Date.now(),
    userId,
    concertId,
    type,
    status: 'Active'
  };

  alerts.push(newAlert);
  res.status(201).json({ success: true, alert: newAlert });
});

// API: Get Seat Status (with cache bug)
// INTENTIONAL BUG: site035-bug02
// CSV Error: 캐시 제어 오류
// Type: network-cache-stale
app.get('/api/concerts/:id/seats', (req, res) => {
  // 버그: 실시간 데이터가 아닌 고정된 캐시 데이터만 반환
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1시간 강제 캐시
  res.json(staticSeatStatus);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
