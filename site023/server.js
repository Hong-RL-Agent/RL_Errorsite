import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9922;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Mock Session Store
// ----------------------------------------------------
let sessions = {}; // sessionId -> sessionData

const generateSessionId = () => {
  return 'sess_showpass_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

app.use((req, res, next) => {
  let sessionId = req.headers['x-session-id'];
  if (!sessionId || !sessions[sessionId]) {
    sessionId = generateSessionId();
    sessions[sessionId] = {
      id: sessionId,
      user: null,
      authenticated: false,
      bookings: [],
      tags: [],
      invitations: [],
      bookingMemos: [],
      refunds: [],
      suggestions: [],
      notifications: [],
      calendar: [],
      reports: [],
      csvFiles: [],
      apiQueries: [],
      support: [],
      reviews: [],
      actionTags: false,
      actionInvitations: false,
      actionBookingMemo: false,
      actionRefunds: false,
      actionSuggestions: false,
      actionNotifications: false,
      actionCalendar: false,
      actionReports: false,
      actionCsv: false,
      actionQuery: false
    };
  }
  req.session = sessions[sessionId];
  res.setHeader('X-Session-ID', sessionId);
  next();
});

// ----------------------------------------------------
// Mock Database State
// ----------------------------------------------------
let users = [
  { email: 'user@example.com', name: '홍길동', password: 'password123' }
];

let movies = [
  { id: 'm1', title: '인셉션: 드림스케이프', desc: '타인의 꿈속에 침투해 생각을 훔치는 요원들의 마지막 미션', genre: 'SF / 액션', duration: 148, rating: 4.9, image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=60', casts: '레오나르도 디카프리오, 엘렌 페이지' },
  { id: 'm2', title: '라라랜드: 별들의 노래', desc: '꿈꾸는 사람들을 위한 눈부시도록 황홀한 로맨스 뮤지컬 영화', genre: '로맨스 / 뮤지컬', duration: 128, rating: 4.8, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=60', casts: '라이언 고슬링, 엠마 스톤' }
];

let performances = [
  { id: 'p1', title: '드림 브로드웨이 서울 콘서트', desc: '뉴욕 브로드웨이 오리지널 캐스트가 선사하는 최고의 뮤지컬 갈라 콘서트', location: '세종문화회관 대극장', date: '2026-10-12', price: 150000, image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=60' },
  { id: 'p2', title: '쇼팽 피아노 리사이틀', desc: '차세대 피아니스트 거장이 해석하는 밤의 낭만 쇼팽 피아노 명곡선', location: '예술의전당 콘서트홀', date: '2026-10-20', price: 90000, image: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=600&auto=format&fit=crop&q=60' }
];

let noticeFeed = [
  { id: 'n1', title: '추석 연휴 기간 상영관 운영 안내', content: '추석 황금 연휴 동안 특별 연장 상영관 운영 및 예매 관람권 패키지 지급 공지' }
];

// ----------------------------------------------------
// API Routing
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/session', (req, res) => {
  res.json({
    sessionId: req.session.id,
    user: req.session.user,
    authenticated: req.session.authenticated,
    details: {
      actionTags: req.session.actionTags,
      actionInvitations: req.session.actionInvitations,
      actionBookingMemo: req.session.actionBookingMemo,
      actionRefunds: req.session.actionRefunds,
      actionSuggestions: req.session.actionSuggestions,
      actionNotifications: req.session.actionNotifications,
      actionCalendar: req.session.actionCalendar,
      actionReports: req.session.actionReports,
      actionCsv: req.session.actionCsv,
      actionQuery: req.session.actionQuery
    }
  });
});

app.get('/api/movies', (req, res) => {
  res.json(movies);
});

app.get('/api/movies/:id', (req, res) => {
  const matched = movies.find(m => m.id === req.params.id);
  if (matched) res.json(matched);
  else res.status(404).json({ error: '영화를 찾을 수 없습니다.' });
});

app.get('/api/performances', (req, res) => {
  res.json(performances);
});

app.get('/api/performances/:id', (req, res) => {
  const matched = performances.find(p => p.id === req.params.id);
  if (matched) res.json(matched);
  else res.status(404).json({ error: '공연을 찾을 수 없습니다.' });
});

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const filteredMovies = movies.filter(m => m.title.includes(q || ''));
  const filteredPerf = performances.filter(p => p.title.includes(q || ''));
  res.json({ movies: filteredMovies, performances: filteredPerf });
});

// Suggestions (SEC-235 trigger)
app.get('/api/search/suggestions', (req, res) => {
  req.session.actionSuggestions = true;
  const { q } = req.query;
  const list = ['인셉션', '라라랜드', '드림 콘서트', '쇼팽 피아노'].filter(s => s.includes(q || ''));
  res.json(list);
});

// Tags (SEC-231 trigger)
app.post('/api/tags', (req, res) => {
  const { tag } = req.body;
  req.session.actionTags = true;
  req.session.tags.push(tag);
  res.json({ status: 'success', tags: req.session.tags });
});

// Invitations (SEC-232 trigger)
app.post('/api/invitations', (req, res) => {
  const { message } = req.body;
  req.session.actionInvitations = true;
  req.session.invitations.push(message);
  res.json({ status: 'success', invitations: req.session.invitations });
});

// Booking memo (SEC-233 trigger)
app.post('/api/booking/memo', (req, res) => {
  const { memo } = req.body;
  req.session.actionBookingMemo = true;
  req.session.bookingMemos.push(memo);
  res.json({ status: 'success', bookingMemos: req.session.bookingMemos });
});

// Refunds (SEC-234 trigger)
app.post('/api/refunds', (req, res) => {
  const { reason } = req.body;
  req.session.actionRefunds = true;
  req.session.refunds.push(reason);
  res.json({ status: 'success', refunds: req.session.refunds });
});

// Notifications (SEC-236 trigger)
app.post('/api/notifications', (req, res) => {
  const { title } = req.body;
  req.session.actionNotifications = true;
  const item = { id: Date.now(), title, timestamp: new Date().toLocaleTimeString() };
  req.session.notifications.push(item);
  res.json(item);
});

// Calendar (SEC-237 trigger)
app.post('/api/calendar', (req, res) => {
  const { title, date } = req.body;
  req.session.actionCalendar = true;
  const item = { id: Date.now(), title, date };
  req.session.calendar.push(item);
  res.json(item);
});

app.get('/api/calendar', (req, res) => {
  res.json(req.session.calendar);
});

// Reports (SEC-238 trigger)
app.get('/api/reports', (req, res) => {
  req.session.actionReports = true;
  res.json({
    totalBookings: req.session.bookings.length,
    totalSpent: req.session.bookings.reduce((sum, b) => sum + b.price, 0),
    data: req.session.bookings
  });
});

// CSV Upload (SEC-239 trigger)
app.post('/api/reports/csv', (req, res) => {
  const { csvText } = req.body;
  req.session.actionCsv = true;
  req.session.csvFiles.push({ csvText, timestamp: new Date().toISOString() });
  res.json({ status: 'success', count: csvText.split('\n').length });
});

// API Query (SEC-240 trigger)
app.get('/api/query', (req, res) => {
  req.session.actionQuery = true;
  res.json(req.session.bookings);
});

// Support
app.post('/api/support', (req, res) => {
  const { title, message } = req.body;
  const item = { title, message, date: new Date().toLocaleDateString() };
  req.session.support.push(item);
  res.json(item);
});

// Reviews
app.post('/api/reviews', (req, res) => {
  const { target, rating, comment } = req.body;
  const item = { target, rating: Number(rating), comment, user: req.session.user ? req.session.user.name : '비회원' };
  req.session.reviews.push(item);
  res.json(item);
});

app.get('/api/bookings', (req, res) => {
  res.json(req.session.bookings);
});

app.post('/api/bookings', (req, res) => {
  const { type, title, price, date } = req.body;
  const item = {
    id: 'B_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    type,
    title,
    price,
    date,
    status: '결제 대기'
  };
  req.session.bookings.push(item);
  res.json(item);
});

app.get('/api/seats', (req, res) => {
  // Mock seats
  res.json([
    { id: 'A1', reserved: false }, { id: 'A2', reserved: true }, { id: 'A3', reserved: false },
    { id: 'B1', reserved: false }, { id: 'B2', reserved: false }, { id: 'B3', reserved: true }
  ]);
});

app.post('/api/payment', (req, res) => {
  const { bookingId } = req.body;
  const matched = req.session.bookings.find(b => b.id === bookingId);
  if (matched) {
    matched.status = '결제 완료';
    res.json(matched);
  } else {
    res.status(404).json({ error: '예약 내역을 찾을 수 없습니다.' });
  }
});

// Auth Register
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  const newUser = { email, password, name };
  users.push(newUser);

  const currentSessionId = req.session.id;
  const sessionData = sessions[currentSessionId];

  // INTENTIONAL BACKEND BUG
  // SEC-222: Auto login rotation omitted during registration (Wait, in site023, SEC-222 is replaced by SEC-231 ~ SEC-240 logic context).
  // But wait, the registration also has session fixation by default, so we map it appropriately.
  sessionData.user = newUser;
  sessionData.authenticated = true;
  res.json({
    status: 'success',
    sessionId: currentSessionId,
    user: newUser
  });
});

// Auth Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const matched = users.find(u => u.email === email && u.password === password);
  if (!matched) {
    return res.status(401).json({ error: '인증 정보가 틀립니다.' });
  }

  const currentSessionId = req.session.id;
  const sessionData = sessions[currentSessionId];

  // INTENTIONAL BACKEND BUG
  // SEC-231: Session ID is intentionally not rotated after authentication.
  const isBug231 = sessionData.actionTags === true;

  // INTENTIONAL BACKEND BUG
  // SEC-232: Session ID is intentionally not rotated after authentication.
  const isBug232 = sessionData.actionInvitations === true;

  // INTENTIONAL BACKEND BUG
  // SEC-233: Session ID is intentionally not rotated after authentication.
  const isBug233 = sessionData.actionBookingMemo === true;

  // INTENTIONAL BACKEND BUG
  // SEC-234: Session ID is intentionally not rotated after authentication.
  const isBug234 = sessionData.actionRefunds === true;

  // INTENTIONAL BACKEND BUG
  // SEC-235: Session ID is intentionally not rotated after authentication.
  const isBug235 = sessionData.actionSuggestions === true;

  // INTENTIONAL BACKEND BUG
  // SEC-236: Session ID is intentionally not rotated after authentication.
  const isBug236 = sessionData.actionNotifications === true;

  // INTENTIONAL BACKEND BUG
  // SEC-237: Session ID is intentionally not rotated after authentication.
  const isBug237 = sessionData.actionCalendar === true;

  // INTENTIONAL BACKEND BUG
  // SEC-238: Session ID is intentionally not rotated after authentication.
  const isBug238 = sessionData.actionReports === true;

  // INTENTIONAL BACKEND BUG
  // SEC-239: Session ID is intentionally not rotated after authentication.
  const isBug239 = sessionData.actionCsv === true;

  // INTENTIONAL BACKEND BUG
  // SEC-240: Session ID is intentionally not rotated after authentication.
  const isBug240 = sessionData.actionQuery === true;

  const isVulnerable = isBug231 || isBug232 || isBug233 || isBug234 || isBug235 || isBug236 || isBug237 || isBug238 || isBug239 || isBug240;

  if (isVulnerable) {
    sessionData.user = matched;
    sessionData.authenticated = true;
    res.json({
      status: 'success',
      vulnerable: true,
      sessionId: currentSessionId,
      user: matched
    });
  } else {
    // Normal Session Rotation (for non-flagged standard logins)
    const newSessionId = generateSessionId();
    sessions[newSessionId] = {
      ...sessionData,
      id: newSessionId,
      user: matched,
      authenticated: true
    };
    delete sessions[currentSessionId];
    res.setHeader('X-Session-ID', newSessionId);
    res.json({
      status: 'success',
      vulnerable: false,
      sessionId: newSessionId,
      user: matched
    });
  }
});

// Serve frontend build static files in production fallback
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Dev server proxy fallback
  const httpModule = req.url.startsWith('https') ? import('https') : import('http');
  httpModule.then((http) => {
    const devServerUrl = `http://localhost:5173${req.url}`;
    const devReq = http.request(devServerUrl, (devRes) => {
      res.writeHead(devRes.statusCode, devRes.headers);
      devRes.pipe(res);
    });
    devReq.on('error', () => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
        if (err) res.status(404).send('Frontend bundle not found.');
      });
    });
    devReq.end();
  }).catch(() => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
});

app.listen(PORT, () => {
  console.log(`[ShowPass Server] Running at http://localhost:${PORT}`);
});
