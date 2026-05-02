const express = require('express');
const path = require('path');
const app = express();
const PORT = 9336;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let rooms = [
  { id: 'r1', name: '포커스 룸 A', capacity: 4, type: '미팅룸', pricePerHour: 10000 },
  { id: 'r2', name: '콰이어트 룸 B', capacity: 2, type: '개인실', pricePerHour: 5000 },
  { id: 'r3', name: '컨퍼런스 룸 C', capacity: 8, type: '세미나실', pricePerHour: 20000 }
];

let bookings = [
  { id: 'b1', roomId: 'r1', date: '2026-05-01', time: '14:00', user: 'user123', status: 'confirmed' }
];

let notices = [
  { id: 'n1', title: '5월 정기 휴관일 안내', date: '2026-04-25' },
  { id: 'n2', title: '스터디룸 내 취식 금지 규정', date: '2026-04-20' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StudyRoom Booking API is running' });
});

// API: Get Rooms
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// API: Get Timeslots for a room on a date
app.get('/api/timeslots', (req, res) => {
  const { roomId, date } = req.query;
  const allTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  // Find booked times
  const booked = bookings.filter(b => b.roomId === roomId && b.date === date && b.status !== 'cancelled')
                         .map(b => b.time);
                         
  const slots = allTimes.map(t => ({
    time: t,
    isAvailable: !booked.includes(t)
  }));
  
  res.json(slots);
});

// API: Create Booking
app.post('/api/bookings', (req, res) => {
  const { roomId, date, time, user } = req.body;

  // INTENTIONAL BUG: site007-bug01
  // CSV Error: DB 동시성 충돌
  // Type: database-concurrency
  // Description: 같은 시간대 예약 중복을 막는 검증이 없어 동일 룸 중복 예약이 가능함.
  // Missing Validation:
  // const isConflict = bookings.some(b => b.roomId === roomId && b.date === date && b.time === time && b.status !== 'cancelled');
  // if (isConflict) return res.status(409).json({ error: '이미 예약된 시간입니다.' });

  const newBooking = {
    id: 'bk_' + Date.now() + Math.floor(Math.random() * 100),
    roomId,
    date,
    time,
    user: user || 'guest',
    status: 'confirmed'
  };

  bookings.push(newBooking);
  res.status(201).json({ success: true, booking: newBooking });
});

// API: Get My Bookings
app.get('/api/bookings/my', (req, res) => {
  const userId = req.query.user || 'user123';
  const myBookings = bookings.filter(b => b.user === userId);
  res.json(myBookings);
});

// API: Cancel Booking
app.post('/api/bookings/:id/cancel', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (booking) {
    booking.status = 'cancelled';
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

// API: Get All Bookings (Admin API)
app.get('/api/bookings/all', (req, res) => {
  // INTENTIONAL BUG: site007-bug03
  // CSV Error: 관리자 권한 검증 누락
  // Type: security-authorization
  // Description: 일반 사용자도 관리자용 예약 목록 API에 접근할 수 있음.
  // Missing: if (req.headers['x-role'] !== 'admin') return res.status(403).json(...);
  
  res.json(bookings);
});

// API: Get Notices
app.get('/api/notices', (req, res) => {
  // INTENTIONAL BUG: site007-bug02
  // CSV Error: CORS 설정 오류
  // Type: network-cors
  // Description: 특정 API에 잘못된 CORS 헤더를 설정하여 브라우저 요청이 차단될 수 있음.
  
  // To trigger CORS error, we force a restrictive and invalid origin,
  // overriding any proxy or default behavior just for this endpoint.
  res.setHeader('Access-Control-Allow-Origin', 'http://invalid-domain.com');
  res.json(notices);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
