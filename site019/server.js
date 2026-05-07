const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = 9128;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let movies = [
  { id: 'm1', title: '우주 여정 (Cosmic Journey)', genre: 'SF', rating: 4.8, poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop' },
  { id: 'm2', title: '네온 나이트 (Neon Nights)', genre: '액션', rating: 4.5, poster: 'https://images.unsplash.com/photo-1614850523296-e8c041df43a4?w=400&h=600&fit=crop' },
  { id: 'm3', title: '고요한 심연 (The Silent Abyss)', genre: '스릴러', rating: 4.2, poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400&h=600&fit=crop' },
  { id: 'm4', title: '디지털 드림 (Digital Dream)', genre: '애니메이션', rating: 4.7, poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop' }
];

let bookings = [];
let payments = [];
let processedWebhooks = new Set();
let sessions = {}; // In-memory session store

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: 'site019',
    status: 'healthy'
  });
});

// 2. GET /api/movies
app.get('/api/movies', (req, res) => {
  res.json(movies);
});

// 3. GET /api/movies/:id
app.get('/api/movies/:id', (req, res) => {
  const movie = movies.find(m => m.id === req.params.id);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).json({ error: '영화를 찾을 수 없습니다.' });
  }
});

// 4. GET /api/movies/schedule (bug03)
app.get('/api/movies/schedule', (req, res) => {
  // INTENTIONAL BACKEND BUG: site019-bug03
  // Type: external-library-breaking-change
  // Description: 날짜 필드 변경 미반영 (라이브러리 업데이트로 인해 날짜 포맷이 'YYYY-MM-DD'에서 { timestamp: ... } 객체로 변경됨)
  const schedule = [
    { movieId: 'm1', time: '14:00', date: '2026-05-10', bugId: 'site019-bug03' }, // 기존 포맷
    { movieId: 'm2', time: '16:30', date: { timestamp: 1778400000000 }, bugId: 'site019-bug03' }, // 변경된 포맷 (브레이킹 체인지)
    { movieId: 'm3', time: '19:00', date: '2026-05-10', bugId: 'site019-bug03' }
  ];
  res.json(schedule);
});

// 9. POST /api/auth/social-login
app.post('/api/auth/social-login', (req, res) => {
  const { provider } = req.body;
  const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
  const user = { id: 'u1', name: 'PPO 에이전트', email: 'agent@ppo.ai', provider };
  
  sessions[sessionId] = user;
  res.json({ success: true, sessionId, user });
});

// 10. POST /api/auth/logout (bug01)
app.post('/api/auth/logout', (req, res) => {
  const { sessionId } = req.body;
  
  // INTENTIONAL BACKEND BUG: site019-bug01
  // Type: social-logout-orphan-session
  // Description: 로그아웃 시 세션 삭제 안됨 (Ghost Session)
  // sessions[sessionId] = null; // 원래는 세션을 삭제해야 함
  
  res.json({ success: true, message: '로그아웃 되었습니다.', bugId: 'site019-bug01' });
});

// 11. GET /api/user/profile (bug01 확인)
app.get('/api/user/profile', (req, res) => {
  const sessionId = req.headers['authorization'];
  if (sessions[sessionId]) {
    res.json({ user: sessions[sessionId], bugId: 'site019-bug01' });
  } else {
    res.status(401).json({ error: '인증되지 않았습니다.' });
  }
});

// 5. POST /api/booking
app.post('/api/booking', (req, res) => {
  const { movieId, seats } = req.body;
  const bookingId = 'bk_' + Math.random().toString(36).substr(2, 9);
  const newBooking = { id: bookingId, movieId, seats, status: 'pending', createdAt: new Date() };
  bookings.push(newBooking);
  res.json(newBooking);
});

// 6. POST /api/payment/process (bug02)
app.post('/api/payment/process', (req, res) => {
  const { bookingId, mode } = req.query;
  
  // INTENTIONAL BACKEND BUG: site019-bug02
  // Type: external-service-maintenance-unhandled
  // Description: 외부 결제 서비스 점검 대응 부재
  if (mode === 'maintenance') {
    return res.status(500).json({ 
      error: 'External Payment Service Error', 
      message: '외부 결제 서비스가 현재 점검 중입니다. (대응 코드 부재)',
      bugId: 'site019-bug02' 
    });
  }

  const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
  const payment = { id: paymentId, bookingId, status: 'processing', amount: 12000 };
  payments.push(payment);
  
  res.json(payment);
});

// 7. POST /api/payment/webhook (bug04)
app.post('/api/payment/webhook', (req, res) => {
  const { paymentId, status } = req.body;

  // INTENTIONAL BACKEND BUG: site019-bug04
  // Type: payment-webhook-idempotency-failure
  // Description: 결제 웹훅 멱등성 실패 (중복 처리됨)
  
  /* 멱등성 체크 누락:
  if (processedWebhooks.has(paymentId)) {
    return res.status(200).json({ message: '이미 처리된 웹훅입니다.' });
  }
  */

  const payment = payments.find(p => p.id === paymentId);
  if (payment) {
    payment.status = status;
    const booking = bookings.find(b => b.id === payment.bookingId);
    if (booking) {
      booking.status = (status === 'completed') ? 'confirmed' : 'failed';
    }
  }

  // 중복 처리를 기록하지만, 위에서 체크하지 않음
  processedWebhooks.add(paymentId);

  res.json({ 
    success: true, 
    message: '결제 웹훅이 처리되었습니다.', 
    bugId: 'site019-bug04',
    processedCount: Array.from(processedWebhooks).filter(id => id === paymentId).length 
  });
});

// 8. GET /api/payment/status
app.get('/api/payment/status', (req, res) => {
  const { bookingId } = req.query;
  const payment = payments.find(p => p.bookingId === bookingId);
  res.json(payment || { status: 'none' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
