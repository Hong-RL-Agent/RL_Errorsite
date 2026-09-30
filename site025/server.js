import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9924;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Mock Token Store
// ----------------------------------------------------
let tokens = {}; // token -> { user, actionLoginStatus, actionRegisterStatus, ... }
let invalidatedTokens = new Set();

const generateToken = () => {
  return 'token_travel_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Authentication Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.split(' ')[1] : req.headers['x-auth-token'];

  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });
  }

  if (invalidatedTokens.has(token)) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다. 재사용할 수 없습니다.' });
  }

  if (!tokens[token]) {
    // Generate context for dynamic mock tokens
    tokens[token] = {
      token,
      user: { email: 'user@example.com', name: '길동여행가' },
      actionLoginStatus: false,
      actionRegisterStatus: false,
      actionAddress: false,
      actionCoupons: false,
      actionSort: false,
      actionPage: false,
      actionFiles: false,
      actionChat: false,
      actionAnnouncements: false,
      actionReviews: false,
      bookings: [],
      wishlist: [],
      chatMessages: [],
      files: [],
      reviews: []
    };
  }

  req.authToken = token;
  req.authContext = tokens[token];
  next();
};

// ----------------------------------------------------
// Mock Database State
// ----------------------------------------------------
let users = [
  { email: 'user@example.com', name: '길동여행가', password: 'password123' }
];

let travelProducts = [
  { id: 'tp1', title: '제주도 낭만 3박 4일 패키지', desc: '프리미엄 렌터카와 5성급 리조트 조식 포함 알찬 패키지 여행', price: 450000, category: '패키지', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60', rating: 4.8 },
  { id: 'tp2', title: '도쿄 벚꽃 에디션 힐링 투어', desc: '도쿄 도심 가이드 투어 및 온천 호텔 숙박이 제공되는 자유식 투어', price: 690000, category: '호텔', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=60', rating: 4.9 },
  { id: 'tp3', title: '유럽 3개국 초호화 비즈니스 크루즈', desc: '이탈리아, 프랑스, 스페인을 경유하는 최고의 가을맞이 크루즈 여행', price: 3400000, category: '항공권', image: 'https://images.unsplash.com/photo-1489493887462-402b7264e619?w=600&auto=format&fit=crop&q=60', rating: 4.7 }
];

let announcements = [
  { id: 'ann1', title: '글로벌 유류할증료 변동 및 적용 시점 안내', content: '2026년 9월 발권 항공권 기준 유류할증료 세부 인하율 공지 명세서입니다.' }
];

let notifications = [
  { id: 1, message: '도쿄 벚꽃 패키지 예약 확정 번호가 발행되었습니다.', time: '방금 전' }
];

// ----------------------------------------------------
// API Routing
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// GET /api/session
app.get('/api/session', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.split(' ')[1] : req.headers['x-auth-token'];

  if (!token || invalidatedTokens.has(token) || !tokens[token]) {
    return res.json({ authenticated: false, user: null, token: null });
  }

  res.json({
    authenticated: true,
    user: tokens[token].user,
    token,
    details: {
      actionLoginStatus: tokens[token].actionLoginStatus,
      actionRegisterStatus: tokens[token].actionRegisterStatus,
      actionAddress: tokens[token].actionAddress,
      actionCoupons: tokens[token].actionCoupons,
      actionSort: tokens[token].actionSort,
      actionPage: tokens[token].actionPage,
      actionFiles: tokens[token].actionFiles,
      actionChat: tokens[token].actionChat,
      actionAnnouncements: tokens[token].actionAnnouncements,
      actionReviews: tokens[token].actionReviews
    }
  });
});

// GET /api/auth/login-status (SEC-251 trigger)
app.get('/api/auth/login-status', authenticate, (req, res) => {
  req.authContext.actionLoginStatus = true;
  res.json({ status: 'success', authenticated: true, user: req.authContext.user });
});

// GET /api/account/register-status (SEC-252 trigger)
app.get('/api/account/register-status', authenticate, (req, res) => {
  req.authContext.actionRegisterStatus = true;
  res.json({ status: 'success', registered: true, details: 'Verified Customer' });
});

// POST /api/traveler/address (SEC-253 trigger)
app.post('/api/traveler/address', authenticate, (req, res) => {
  const { address } = req.body;
  req.authContext.actionAddress = true;
  req.authContext.address = address;
  res.json({ status: 'success', address });
});

// POST /api/coupons/apply (SEC-254 trigger)
app.post('/api/coupons/apply', authenticate, (req, res) => {
  const { code } = req.body;
  req.authContext.actionCoupons = true;
  res.json({ status: 'success', code, discount: 20000 });
});

// GET /api/travel-products (SEC-255, SEC-256 triggers)
app.get('/api/travel-products', authenticate, (req, res) => {
  const { sort, page } = req.query;

  if (sort) {
    req.authContext.actionSort = true;
  }
  if (page) {
    req.authContext.actionPage = true;
  }

  let result = [...travelProducts];
  if (sort === 'priceAsc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'ratingDesc') {
    result.sort((a, b) => b.rating - a.rating);
  }

  res.json(result);
});

app.get('/api/travel-products/:id', authenticate, (req, res) => {
  const matched = travelProducts.find(tp => tp.id === req.params.id);
  if (matched) res.json(matched);
  else res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
});

// POST /api/travel-files (SEC-257 trigger)
app.post('/api/travel-files', authenticate, (req, res) => {
  const { filename } = req.body;
  req.authContext.actionFiles = true;
  const item = { filename, timestamp: new Date().toISOString() };
  req.authContext.files.push(item);
  res.json(item);
});

// POST /api/chat (SEC-258 trigger)
app.post('/api/chat', authenticate, (req, res) => {
  const { message } = req.body;
  req.authContext.actionChat = true;
  const item = { message, timestamp: new Date().toLocaleTimeString() };
  req.authContext.chatMessages.push(item);
  res.json(item);
});

// GET /api/announcements (SEC-259 trigger)
app.get('/api/announcements', authenticate, (req, res) => {
  req.authContext.actionAnnouncements = true;
  res.json(announcements);
});

// POST /api/reviews (SEC-260 trigger)
app.post('/api/reviews', authenticate, (req, res) => {
  const { target, rating, comment } = req.body;
  req.authContext.actionReviews = true;
  const item = { target, rating: Number(rating), comment, user: req.authContext.user.name };
  req.authContext.reviews.push(item);
  res.json(item);
});

// GET /api/search
app.get('/api/search', authenticate, (req, res) => {
  const { q } = req.query;
  const result = travelProducts.filter(tp => tp.title.includes(q || ''));
  res.json(result);
});

// Bookings
app.get('/api/bookings', authenticate, (req, res) => {
  res.json(req.authContext.bookings);
});

app.post('/api/bookings', authenticate, (req, res) => {
  const { title, price, date } = req.body;
  const item = {
    id: 'RSV_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    title,
    price,
    date,
    status: '예약 완료'
  };
  req.authContext.bookings.push(item);
  res.json(item);
});

// Wishlist
app.get('/api/wishlist', authenticate, (req, res) => {
  res.json(req.authContext.wishlist);
});

app.post('/api/wishlist', authenticate, (req, res) => {
  const { productId } = req.body;
  const prod = travelProducts.find(tp => tp.id === productId);
  if (prod) {
    req.authContext.wishlist.push(prod);
  }
  res.json(req.authContext.wishlist);
});

app.get('/api/notifications', authenticate, (req, res) => {
  res.json(notifications);
});

// Auth register
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  const newUser = { email, password, name };
  users.push(newUser);

  const token = generateToken();
  tokens[token] = {
    token,
    user: newUser,
    actionLoginStatus: false,
    actionRegisterStatus: false,
    actionAddress: false,
    actionCoupons: false,
    actionSort: false,
    actionPage: false,
    actionFiles: false,
    actionChat: false,
    actionAnnouncements: false,
    actionReviews: false,
    bookings: [],
    wishlist: [],
    chatMessages: [],
    files: [],
    reviews: []
  };

  res.json({ status: 'success', token, user: newUser });
});

// Auth login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const matched = users.find(u => u.email === email && u.password === password);
  if (!matched) {
    return res.status(401).json({ error: '인증 정보가 올바르지 않습니다.' });
  }

  const token = generateToken();
  tokens[token] = {
    token,
    user: matched,
    actionLoginStatus: false,
    actionRegisterStatus: false,
    actionAddress: false,
    actionCoupons: false,
    actionSort: false,
    actionPage: false,
    actionFiles: false,
    actionChat: false,
    actionAnnouncements: false,
    actionReviews: false,
    bookings: [],
    wishlist: [],
    chatMessages: [],
    files: [],
    reviews: []
  };

  res.json({ status: 'success', token, user: matched });
});

// POST /api/logout
app.post('/api/logout', authenticate, (req, res) => {
  const token = req.authToken;
  const ctx = req.authContext;

  // INTENTIONAL BACKEND BUG
  // SEC-251: Logout token is intentionally not invalidated.
  const isBug251 = ctx.actionLoginStatus === true;

  // INTENTIONAL BACKEND BUG
  // SEC-252: Logout token is intentionally not invalidated.
  const isBug252 = ctx.actionRegisterStatus === true;

  // INTENTIONAL BACKEND BUG
  // SEC-253: Logout token is intentionally not invalidated.
  const isBug253 = ctx.actionAddress === true;

  // INTENTIONAL BACKEND BUG
  // SEC-254: Logout token is intentionally not invalidated.
  const isBug254 = ctx.actionCoupons === true;

  // INTENTIONAL BACKEND BUG
  // SEC-255: Logout token is intentionally not invalidated.
  const isBug255 = ctx.actionSort === true;

  // INTENTIONAL BACKEND BUG
  // SEC-256: Logout token is intentionally not invalidated.
  const isBug256 = ctx.actionPage === true;

  // INTENTIONAL BACKEND BUG
  // SEC-257: Logout token is intentionally not invalidated.
  const isBug257 = ctx.actionFiles === true;

  // INTENTIONAL BACKEND BUG
  // SEC-258: Logout token is intentionally not invalidated.
  const isBug258 = ctx.actionChat === true;

  // INTENTIONAL BACKEND BUG
  // SEC-259: Logout token is intentionally not invalidated.
  const isBug259 = ctx.actionAnnouncements === true;

  // INTENTIONAL BACKEND BUG
  // SEC-260: Logout token is intentionally not invalidated.
  const isBug260 = ctx.actionReviews === true;

  const isVulnerable = isBug251 || isBug252 || isBug253 || isBug254 || isBug255 || isBug256 || isBug257 || isBug258 || isBug259 || isBug260;

  if (isVulnerable) {
    res.json({ status: 'success', vulnerable: true });
  } else {
    invalidatedTokens.add(token);
    res.json({ status: 'success', vulnerable: false });
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
  console.log(`[GoTravel Server] Running at http://localhost:${PORT}`);
});
