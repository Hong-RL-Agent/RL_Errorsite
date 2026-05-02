const express = require('express');
const path = require('path');
const app = express();
const PORT = 9376;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let games = [
  { id: 'g1', title: '스플렌더', players: '2-4명', difficulty: 'Easy', category: 'Strategy' },
  { id: 'g2', title: '테라포밍 마스', players: '1-5명', difficulty: 'Hard', category: 'Strategy' },
  { id: 'g3', title: '할리갈리', players: '2-6명', difficulty: 'Easy', category: 'Party' }
];

let tables = [
  { id: 't1', name: 'Oak Table (4인)', status: 'Available' },
  { id: 't2', name: 'Walnut Table (6인)', status: 'Available' },
  { id: 't3', name: 'Cherry Table (4인)', status: 'Available' }
];

let reservations = [
  { id: 'res-1', userId: 'user_A', tableId: 't1', time: '14:00', contact: '010-1111-2222' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BoardGame Cafe API is running' });
});

app.get('/api/games', (req, res) => {
  res.json(games);
});

// API: Get Tables (with stale data bug)
app.get('/api/tables', (req, res) => {
  // INTENTIONAL BUG: site047-bug02
  // CSV Error: 네트워크 오래된 데이터
  // Type: network-stale-data
  // 버그: 예약이 되었음에도 불구하고 특정 조건에서 모든 테이블을 Available로 반환하는 로직 (Stale 상태 강제)
  const staleTables = tables.map(t => ({ ...t, status: 'Available' }));
  res.json(staleTables); 
});

// API: Create Reservation (with concurrency bug)
app.post('/api/reservations', (req, res) => {
  const { userId, tableId, time, contact } = req.body;

  // INTENTIONAL BUG: site047-bug01
  // CSV Error: DB 테이블 중복 예약
  // Type: database-concurrency
  // 버그: 동일 시간대에 해당 테이블이 이미 예약되어 있는지 체크하는 로직이 누락됨
  /*
  const exists = reservations.find(r => r.tableId === tableId && r.time === time);
  if (exists) return res.status(400).json({ error: 'Table already booked for this time' });
  */

  const newRes = { id: 'res-' + Date.now(), userId, tableId, time, contact };
  reservations.push(newRes);
  
  // 상태 업데이트 (하지만 API 응답 버그로 인해 클라이언트는 반영 안 된 상태를 보게 됨)
  const table = tables.find(t => t.id === tableId);
  if (table) table.status = 'Booked';

  res.status(201).json({ success: true, reservation: newRes });
});

// API: Get Recent Reservations (with data exposure bug)
app.get('/api/reservations/recent', (req, res) => {
  // INTENTIONAL BUG: site047-bug03
  // CSV Error: 관리자 예약 목록 노출
  // Type: security-data-exposure
  // 보안 취약점: 일반 사용자용 API 응답에 모든 예약자의 전화번호 등 민감한 정보가 포함됨
  res.json(reservations); 
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
