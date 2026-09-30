import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9921;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Mock Session Store
// ----------------------------------------------------
let sessions = {}; // sessionId -> { id, user, authenticated, actionX... }

const generateSessionId = () => {
  return 'sess_travel_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Middleware to resolve or initialize session context
app.use((req, res, next) => {
  let sessionId = req.headers['x-session-id'];
  if (!sessionId || !sessions[sessionId]) {
    sessionId = generateSessionId();
    sessions[sessionId] = {
      id: sessionId,
      user: null,
      authenticated: false,
      wishlist: [],
      reservations: [],
      itineraries: [],
      appliedCoupon: null,
      reviews: [],
      chatMessages: [],
      files: [],
      address: '',
      actionAddressTriggered: false,
      actionCouponTriggered: false,
      actionSortTriggered: false,
      actionPageTriggered: false,
      actionFileTriggered: false,
      actionChatTriggered: false,
      actionNoticeTriggered: false,
      actionReviewTriggered: false
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
  { email: 'user@example.com', name: '김철수', phone: '010-1234-5678', password: 'password123', address: '서울 강남구 역삼동' }
];

let destinations = [
  { id: 'd1', name: '제주도', desc: '푸른 바다와 유채꽃이 어우러진 대한민국 최고의 평화로운 힐링 아일랜드', image: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=600&auto=format&fit=crop&q=60' },
  { id: 'd2', name: '도쿄', desc: '현대적인 빌딩 숲과 아기자기한 전통 골목이 매력적인 일본의 수도', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=60' },
  { id: 'd3', name: '파리', desc: '에펠탑 아래에서 낭만을 느끼는 예술과 문화의 상징적인 도시', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=60' }
];

let flights = [
  { id: 'f1', from: 'Gimpo (GMP)', to: 'Jeju (CJU)', date: '2026-09-10', price: 65000, airline: 'Jeju Air' },
  { id: 'f2', from: 'Incheon (ICN)', to: 'Tokyo (NRT)', date: '2026-09-15', price: 280000, airline: 'Asiana Airlines' },
  { id: 'f3', from: 'Incheon (ICN)', to: 'Paris (CDG)', date: '2026-09-20', price: 980000, airline: 'Korean Air' }
];

let hotels = [
  { id: 'h1', name: '제주 신라 호텔', location: '제주 서귀포시', rating: 4.9, price: 320000, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=60' },
  { id: 'h2', name: '도쿄 힐튼 럭셔리 스테이', location: '도쿄 신주쿠', rating: 4.7, price: 240000, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=60' },
  { id: 'h3', name: '파리 풀만 에펠 리조트', location: '파리 15구', rating: 4.8, price: 450000, image: 'https://images.unsplash.com/photo-1549294413-26f195afcbce?w=600&auto=format&fit=crop&q=60' }
];

let tours = [
  { id: 't1', name: '제주도 동부 감성 버스 투어', destination: '제주도', price: 35000, rating: 4.8 },
  { id: 't2', name: '도쿄 오다이바 크루즈 & 시티투어', destination: '도쿄', price: 58000, rating: 4.6 },
  { id: 't3', name: '파리 루브르 미술관 가이드 투어', destination: '파리', price: 85000, rating: 4.9 }
];

let notices = [
  { id: 'n1', title: '추석 연휴 항공권/숙소 조기 예약 특전 안내', date: '2026-08-10', content: '추석 황금 연휴 기간 여행지를 조기 예약하시는 회원분들을 위한 최대 20% 마일리지 적립 혜택 공지' },
  { id: 'n2', title: '개인정보처리방침 일부 변경 개정 안내', date: '2026-08-01', content: '회원 연동 시스템 보안 강화를 위한 개인정보 수집 조항 수정 고시' }
];

let coupons = [
  { code: 'WELCOME5', discount: 5000, desc: '신규 회원 5,000원 즉시 할인 쿠폰' },
  { code: 'TRAVEL20', discount: 20000, desc: '여름 시즌 맞이 20,000원 스페셜 할인 쿠폰' }
];

// ----------------------------------------------------
// API Routing
// ----------------------------------------------------

app.get('/api/destinations', (req, res) => {
  res.json(destinations);
});

app.get('/api/flights', (req, res) => {
  res.json(flights);
});

app.get('/api/hotels', (req, res) => {
  const { sort, page } = req.query;
  
  if (sort) {
    req.session.actionSortTriggered = true;
  }
  
  if (page) {
    req.session.actionPageTriggered = true;
  }

  let result = [...hotels];
  if (sort === 'priceAsc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'ratingDesc') {
    result.sort((a, b) => b.rating - a.rating);
  }
  
  res.json(result);
});

app.get('/api/tours', (req, res) => {
  res.json(tours);
});

// GET /api/reservations
app.get('/api/reservations', (req, res) => {
  res.json(req.session.reservations);
});

// POST /api/reservations
app.post('/api/reservations', (req, res) => {
  const { type, name, price, date } = req.body;
  const newReservation = {
    id: 'RSV_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    type,
    name,
    price,
    date,
    status: '예약 완료',
    createdAt: new Date().toISOString().split('T')[0]
  };
  req.session.reservations.push(newReservation);
  res.json(newReservation);
});

// GET /api/itineraries
app.get('/api/itineraries', (req, res) => {
  res.json(req.session.itineraries);
});

// POST /api/itineraries
app.post('/api/itineraries', (req, res) => {
  const { day, content } = req.body;
  const newItem = { id: 'it_' + Date.now(), day, content };
  req.session.itineraries.push(newItem);
  res.json(newItem);
});

// GET /api/wishlist
app.get('/api/wishlist', (req, res) => {
  res.json(req.session.wishlist);
});

// POST /api/wishlist
app.post('/api/wishlist', (req, res) => {
  const { itemId, name, type } = req.body;
  const newItem = { id: 'WSH_' + Date.now(), itemId, name, type };
  req.session.wishlist.push(newItem);
  res.json(newItem);
});

// DELETE /api/wishlist/:id
app.delete('/api/wishlist/:id', (req, res) => {
  req.session.wishlist = req.session.wishlist.filter(w => w.id !== req.params.id);
  res.json({ status: 'success' });
});

// GET /api/coupons
app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});

// POST /api/coupons/apply
app.post('/api/coupons/apply', (req, res) => {
  const { code } = req.body;
  req.session.actionCouponTriggered = true;

  const coupon = coupons.find(c => c.code === code);
  if (coupon) {
    req.session.appliedCoupon = coupon;
    res.json({ status: 'success', coupon });
  } else {
    res.status(400).json({ error: '유효하지 않은 쿠폰입니다.' });
  }
});

// GET /api/reviews
app.get('/api/reviews', (req, res) => {
  res.json([
    { name: '홍길동', target: '제주 신라 호텔', rating: 5, comment: '서비스가 역시 일품이었어요!' },
    ...req.session.reviews
  ]);
});

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
  const { target, rating, comment } = req.body;
  req.session.actionReviewTriggered = true;

  const newReview = { name: req.session.user ? req.session.user.name : '비회원', target, rating: Number(rating), comment };
  req.session.reviews.push(newReview);
  res.json(newReview);
});

// GET /api/support
app.get('/api/support', (req, res) => {
  res.json(req.session.chatMessages);
});

// POST /api/support/chat
app.post('/api/support/chat', (req, res) => {
  const { message } = req.body;
  req.session.actionChatTriggered = true;

  const userMsg = { sender: 'user', message, timestamp: new Date().toLocaleTimeString() };
  req.session.chatMessages.push(userMsg);
  
  setTimeout(() => {
    req.session.chatMessages.push({
      sender: 'agent',
      message: '안녕하세요! TravelNow 고객 지원실입니다. 문의하신 명세 확인 후 빠른 상담 도와드리겠습니다.',
      timestamp: new Date().toLocaleTimeString()
    });
  }, 1000);

  res.json(userMsg);
});

// GET /api/notices
app.get('/api/notices', (req, res) => {
  req.session.actionNoticeTriggered = true;
  res.json(notices);
});

// GET /api/notifications
app.get('/api/notifications', (req, res) => {
  res.json([
    { id: 1, text: '신규 예약이 정상 확정되었습니다.', time: '1시간 전' },
    { id: 2, text: '여름 바캉스 할인 시즌 한정 쿠폰 발급 알림', time: '1일 전' }
  ]);
});

// POST /api/auth/profile/address
app.post('/api/auth/profile/address', (req, res) => {
  const { address } = req.body;
  req.session.actionAddressTriggered = true;
  req.session.address = address || '';
  if (req.session.user) {
    req.session.user.address = req.session.address;
  }
  res.json({ status: 'success', address: req.session.address });
});

// POST /api/auth/profile/files
app.post('/api/auth/profile/files', (req, res) => {
  const { filename } = req.body;
  req.session.actionFileTriggered = true;
  const newFile = { filename, timestamp: new Date().toISOString() };
  req.session.files.push(newFile);
  res.json({ status: 'success', file: newFile });
});

// GET /api/auth/session
app.get('/api/auth/session', (req, res) => {
  res.json({
    sessionId: req.session.id,
    user: req.session.user,
    authenticated: req.session.authenticated,
    details: {
      actionAddressTriggered: req.session.actionAddressTriggered,
      actionCouponTriggered: req.session.actionCouponTriggered,
      actionSortTriggered: req.session.actionSortTriggered,
      actionPageTriggered: req.session.actionPageTriggered,
      actionFileTriggered: req.session.actionFileTriggered,
      actionChatTriggered: req.session.actionChatTriggered,
      actionNoticeTriggered: req.session.actionNoticeTriggered,
      actionReviewTriggered: req.session.actionReviewTriggered
    }
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  const currentSessionId = req.session.id;
  delete sessions[currentSessionId];
  res.json({ status: 'success' });
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: '회원가입 양식을 완성해주십시오.' });
  }

  const newUser = { email, password, name, phone: phone || '', address: '' };
  users.push(newUser);

  const currentSessionId = req.session.id;
  const sessionData = sessions[currentSessionId];
  const isBug222 = true; 

  if (isBug222) {
    sessionData.user = newUser;
    sessionData.authenticated = true;
    res.json({
      status: 'success',
      sessionId: currentSessionId,
      user: newUser
    });
  } else {
    const newSessionId = generateSessionId();
    sessions[newSessionId] = {
      ...sessionData,
      id: newSessionId,
      user: newUser,
      authenticated: true
    };
    delete sessions[currentSessionId];
    res.setHeader('X-Session-ID', newSessionId);
    res.json({
      status: 'success',
      sessionId: newSessionId,
      user: newUser
    });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const matched = users.find(u => u.email === email && u.password === password);
  if (!matched) {
    return res.status(401).json({ error: '인증 정보가 일치하지 않습니다.' });
  }

  const currentSessionId = req.session.id;
  const sessionData = sessions[currentSessionId];

  const isBug221 = true;
  const isBug223 = sessionData.actionAddressTriggered === true;
  const isBug224 = sessionData.actionCouponTriggered === true;
  const isBug225 = sessionData.actionSortTriggered === true;
  const isBug226 = sessionData.actionPageTriggered === true;
  const isBug227 = sessionData.actionFileTriggered === true;
  const isBug228 = sessionData.actionChatTriggered === true;
  const isBug229 = sessionData.actionNoticeTriggered === true;
  const isBug230 = sessionData.actionReviewTriggered === true;

  const isVulnerable = isBug221 || isBug223 || isBug224 || isBug225 || isBug226 || isBug227 || isBug228 || isBug229 || isBug230;

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
  console.log(`[Travel Reservation Server] Running at http://localhost:${PORT}`);
});
