const express = require('express');
const path = require('path');
const app = express();
const PORT = 9368;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let stylists = [
  { id: 's1', name: '엘리 실장', rank: 'Senior', specialty: '커트, 펌', bio: '영국 비달사순 연수. 감각적인 디자인 커트 전문.' },
  { id: 's2', name: '제이슨 부원장', rank: 'Master', specialty: '컬러, 발레아쥬', bio: '퍼스널 컬러 진단 기반의 최적화된 염색 제안.' },
  { id: 's3', name: '소피아 디자이너', rank: 'Stylist', specialty: '클리닉, 드라이', bio: '모발 건강을 최우선으로 하는 힐링 케어.' }
];

let services = [
  { id: 'v1', name: '디자인 커트', price: 35000 },
  { id: 'v2', name: '디지털 펌', price: 150000 },
  { id: 'v3', name: '퍼스널 컬러 염색', price: 120000 }
];

let bookings = [
  { id: 'bk-1', userId: 'user_A', stylistId: 's1', serviceId: 'v1', time: '14:00', date: '2024-05-20', status: 'Confirmed' },
  { id: 'bk-99', userId: 'user_B', stylistId: 's2', serviceId: 'v2', time: '15:00', date: '2024-05-20', status: 'Confirmed', note: 'VIP 고객, 조용히 응대 요망' } // 타인 예약
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SalonBook API is running' });
});

app.get('/api/stylists', (req, res) => {
  res.json(stylists);
});

app.get('/api/services', (req, res) => {
  res.json(services);
});

// API: Get Available Times (with DB query bug)
app.get('/api/stylists/:id/times', (req, res) => {
  const { date } = req.query;
  const allTimes = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // INTENTIONAL BUG: site039-bug01
  // CSV Error: DB 예약 가능 시간 오류
  // Type: database-query
  // 버그: 이미 예약된 시간(bookings에 있는 시간)을 필터링하지 않고 모두 반환함
  res.json(allTimes);
});

// API: Get Booking Detail (with IDOR bug)
// INTENTIONAL BUG: site039-bug03
// CSV Error: 예약 상세 권한 검증 누락
// Type: security-idor
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (booking) {
    // 보안 취약점: 요청자의 userId가 booking.userId와 일치하는지 검증하는 로직 누락
    res.json(booking);
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

// API: Create Booking (with duplicate submission bug)
app.post('/api/bookings', (req, res) => {
  const { stylistId, serviceId, time, date, userId } = req.body;

  // INTENTIONAL BUG: site039-bug02
  // CSV Error: API 요청 중복 처리 실패
  // Type: network-duplicate-submit
  // 버그: 짧은 시간 내의 중복 요청에 대한 멱등성 검사나 동시성 제어가 없어 연타 시 중복 생성됨
  
  const newBooking = {
    id: 'bk-' + Date.now() + Math.floor(Math.random() * 1000),
    userId,
    stylistId,
    serviceId,
    time,
    date,
    status: 'Confirmed'
  };

  bookings.push(newBooking);
  res.status(201).json({ success: true, booking: newBooking });
});

app.get('/api/my-bookings/:userId', (req, res) => {
  res.json(bookings.filter(b => b.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
