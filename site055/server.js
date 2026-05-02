const express = require('express');
const path = require('path');
const app = express();
const PORT = 9384;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let screenings = [
  { id: 'sc-1', title: '인터스텔라 (재상영)', time: '19:30', date: '2024-05-20', room: 'A홀' },
  { id: 'sc-2', title: '그대들은 어떻게 살 것인가', time: '15:00', date: '2024-05-20', room: 'B홀' },
  { id: 'sc-3', title: '라라랜드', time: '21:00', date: '2024-05-21', room: 'A홀' }
];

let seats = [
  { id: 'seat-A1', status: 'available' },
  { id: 'seat-A2', status: 'available' },
  { id: 'seat-A3', status: 'available' },
  { id: 'seat-B1', status: 'occupied' },
  { id: 'seat-B2', status: 'available' }
];

let reservations = [
  { id: 'res-1', userId: 'user_A', screeningId: 'sc-1', seatId: 'seat-B1', status: 'confirmed' },
  { id: 'res-99', userId: 'user_B', screeningId: 'sc-1', seatId: 'seat-C4', status: 'confirmed' } // 타인의 비밀 예매
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MovieClub API is running' });
});

app.get('/api/screenings', (req, res) => {
  res.json(screenings);
});

app.get('/api/seats', (req, res) => {
  res.json(seats);
});

// API: Create Reservation (with state and duplicate submit bugs)
app.post('/api/reservations', (req, res) => {
  const { userId, screeningId, seatId } = req.body;

  // INTENTIONAL BUG: site055-bug02
  // CSV Error: 네트워크 중복 요청 처리 실패
  // Type: network-duplicate-submit
  // 버그: 동일 사용자가 동일 좌석을 이미 예약했는지 확인하지 않고 무조건 생성함
  /*
  const existing = reservations.find(r => r.userId === userId && r.seatId === seatId && r.screeningId === screeningId);
  if (existing) return res.status(400).json({ error: 'Already reserved' });
  */

  const newRes = {
    id: `res-${Date.now()}`,
    userId,
    screeningId,
    seatId,
    status: 'confirmed'
  };

  reservations.push(newRes);

  // INTENTIONAL BUG: site055-bug01
  // CSV Error: DB 좌석 상태 오류
  // Type: database-state
  // 버그: 예약이 생성되었으나 seats 데이터의 status를 occupied로 바꾸지 않음
  /*
  const seat = seats.find(s => s.id === seatId);
  if (seat) seat.status = 'occupied';
  */

  res.status(201).json(newRes);
});

// API: Get Reservation Detail (with IDOR bug)
// INTENTIONAL BUG: site055-bug03
// CSV Error: 예약 정보 접근 제어 실패
// Type: security-idor
app.get('/api/reservations/:id', (req, res) => {
  const resv = reservations.find(r => r.id === req.params.id);
  if (resv) {
    // 보안 취약점: 요청한 사용자가 실제 소유자인지 검증하지 않고 예매 상세 정보를 반환함
    const screening = screenings.find(s => s.id === resv.screeningId);
    res.json({ ...resv, screening });
  } else {
    res.status(404).json({ error: 'Reservation not found' });
  }
});

app.get('/api/my-reservations/:userId', (req, res) => {
  const my = reservations.filter(r => r.userId === req.params.userId);
  res.json(my.map(r => ({
    ...r,
    screening: screenings.find(s => s.id === r.screeningId)
  })));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
