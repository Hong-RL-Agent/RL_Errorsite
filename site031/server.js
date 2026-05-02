const express = require('express');
const path = require('path');
const app = express();
const PORT = 9360;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let games = [
  { id: 'g1', home: 'Lions', away: 'Tigers', date: '2024-06-15', time: '18:00', venue: 'Seoul Stadium', price: 20000 },
  { id: 'g2', home: 'Bears', away: 'Dragons', date: '2024-06-16', time: '14:00', venue: 'Incheon Park', price: 25000 },
  { id: 'g3', home: 'Wizards', away: 'Eagles', date: '2024-06-17', time: '19:00', venue: 'Suwon Dome', price: 15000 }
];

let bookings = [];
let reservedSeats = {}; // gameId -> [seatIds]

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TicketLine Sports API is running' });
});

app.get('/api/games', (req, res) => {
  res.json(games);
});

app.get('/api/seats/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const reserved = reservedSeats[gameId] || [];
  res.json({ reserved });
});

// API: Booking Ticket
// INTENTIONAL BUG: site031-bug01 (DB Concurrency)
// INTENTIONAL BUG: site031-bug02 (Multiple bookings per seat) - connected to logic
app.post('/api/bookings', (req, res) => {
  const { gameId, seatId, userId } = req.body;

  // INTENTIONAL BUG: site031-bug01
  // CSV Error: DB 좌석 중복 예약
  // Type: database-concurrency
  // Description: 원자적 체크를 누락하여 같은 좌석을 여러 사용자가 동시에 예매 가능
  // 원래는: if(reservedSeats[gameId]?.includes(seatId)) return res.status(400).json({error: '이미 선점된 좌석입니다.'});
  
  // 고의 지연 (0.5초) - 레이스 컨디션 유도
  setTimeout(() => {
    const newBooking = {
      id: 'bk-' + Math.random().toString(36).substr(2, 9),
      gameId,
      seatId,
      userId,
      timestamp: new Date()
    };

    bookings.push(newBooking);
    
    if (!reservedSeats[gameId]) reservedSeats[gameId] = [];
    reservedSeats[gameId].push(seatId);

    res.status(201).json({ success: true, booking: newBooking });
  }, 500);
});

// API: Apply Discount
// INTENTIONAL BUG: site031-bug03
// CSV Error: 할인 권한 검증 누락
// Type: security-authorization
app.post('/api/discounts/apply', (req, res) => {
  const { code, userId } = req.body;
  
  const discountCodes = {
    'WELCOME10': 10,
    'SPORTS20': 20,
    'ADMIN_90': 90 // 관리자 전용 고액 할인
  };

  if (discountCodes[code]) {
    // 보안 취약점: ADMIN_90 코드 사용 시 userId가 관리자인지 검증하지 않음
    res.json({ success: true, discountPercent: discountCodes[code] });
  } else {
    res.status(400).json({ success: false, error: 'Invalid discount code' });
  }
});

app.get('/api/bookings/:userId', (req, res) => {
  const userBookings = bookings.filter(b => b.userId === req.params.userId);
  res.json(userBookings);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
