import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9923;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Mock Token Store
// ----------------------------------------------------
let tokens = {}; // token -> { user, actionSearch, actionProfile, ... }
let invalidatedTokens = new Set();

const generateToken = () => {
  return 'token_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
      user: { email: 'user@example.com', name: '오렌지러버' },
      actionSearch: false,
      actionProfile: false,
      actionSupport: false,
      actionProducts: false,
      actionFiles: false,
      actionComments: false,
      actionReservation: false,
      actionCart: false,
      actionPayment: false,
      actionFilter: false,
      cart: [],
      orders: [],
      wishlist: [],
      files: [],
      comments: [],
      reservations: [],
      support: []
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
  { email: 'user@example.com', name: '오렌지러버', password: 'password123' }
];

let products = [
  { id: 'p1', title: '갤럭시 S23 울트라 256GB급 처분', desc: '액정 기스 전혀 없고 풀박스 구성입니다. 쿨거래 원합니다.', price: 780000, category: '디지털기기', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60', seller: '서초동직거래', location: '서울 서초구' },
  { id: 'p2', title: '브라운 가죽 소파 3인용', desc: '이사가게 되어 싸게 내놓습니다. 직접 가져가셔야 합니다.', price: 120000, category: '가구/인테리어', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop&q=60', seller: '도봉산산토끼', location: '서울 도봉구' }
];

let locations = ['서울 서초구', '서울 도봉구', '서울 마포구', '경기 수원시'];
let notifications = [
  { id: 1, message: '오렌지러버 님의 예약 거래 시간이 1시간 남았습니다.', time: '방금 전' }
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
      actionSearch: tokens[token].actionSearch,
      actionProfile: tokens[token].actionProfile,
      actionSupport: tokens[token].actionSupport,
      actionProducts: tokens[token].actionProducts,
      actionFiles: tokens[token].actionFiles,
      actionComments: tokens[token].actionComments,
      actionReservation: tokens[token].actionReservation,
      actionCart: tokens[token].actionCart,
      actionPayment: tokens[token].actionPayment,
      actionFilter: tokens[token].actionFilter
    }
  });
});

app.get('/api/locations', (req, res) => {
  res.json(locations);
});

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

// GET /api/products (SEC-244, SEC-250 triggers)
app.get('/api/products', authenticate, (req, res) => {
  const { filter } = req.query;
  
  // Flag for SEC-244: 로그아웃 토큰 재사용 (상품명 필드)
  req.authContext.actionProducts = true;

  if (filter) {
    // Flag for SEC-250: 로그아웃 토큰 재사용 (필터 파라미터)
    req.authContext.actionFilter = true;
  }

  let result = [...products];
  if (filter) {
    result = result.filter(p => p.category === filter);
  }
  res.json(result);
});

app.get('/api/products/:id', authenticate, (req, res) => {
  const matched = products.find(p => p.id === req.params.id);
  if (matched) res.json(matched);
  else res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
});

// GET /api/search (SEC-241 trigger)
app.get('/api/search', authenticate, (req, res) => {
  const { q } = req.query;
  // Flag for SEC-241: 로그아웃 토큰 재사용 (검색창)
  req.authContext.actionSearch = true;

  const result = products.filter(p => p.title.includes(q || ''));
  res.json(result);
});

app.get('/api/suggestions', (req, res) => {
  const { q } = req.query;
  const list = ['갤럭시', '소파', '아이폰', '자전거'].filter(s => s.includes(q || ''));
  res.json(list);
});

// POST /api/profile (SEC-242 trigger)
app.post('/api/profile', authenticate, (req, res) => {
  const { intro } = req.body;
  // Flag for SEC-242: 로그아웃 토큰 재사용 (프로필 소개)
  req.authContext.actionProfile = true;
  req.authContext.intro = intro;
  res.json({ status: 'success', intro });
});

// POST /api/support (SEC-243 trigger)
app.post('/api/support', authenticate, (req, res) => {
  const { title, message } = req.body;
  // Flag for SEC-243: 로그아웃 토큰 재사용 (문의 폼)
  req.authContext.actionSupport = true;
  const item = { title, message, date: new Date().toLocaleDateString() };
  req.authContext.support.push(item);
  res.json(item);
});

// POST /api/files (SEC-245 trigger)
app.post('/api/files', authenticate, (req, res) => {
  const { filename } = req.body;
  // Flag for SEC-245: 로그아웃 토큰 재사용 (파일 설명)
  req.authContext.actionFiles = true;
  const item = { filename, timestamp: new Date().toISOString() };
  req.authContext.files.push(item);
  res.json(item);
});

// POST /api/comments (SEC-246 trigger)
app.post('/api/comments', authenticate, (req, res) => {
  const { productId, text } = req.body;
  // Flag for SEC-246: 로그아웃 토큰 재사용 (댓글 입력)
  req.authContext.actionComments = true;
  const item = { productId, text, user: req.authContext.user.name };
  req.authContext.comments.push(item);
  res.json(item);
});

// POST /api/trades/reservation (SEC-247 trigger)
app.post('/api/trades/reservation', authenticate, (req, res) => {
  const { productId, memo } = req.body;
  // Flag for SEC-247: 로그아웃 토큰 재사용 (예약 메모)
  req.authContext.actionReservation = true;
  const item = { productId, memo, status: '예약 조율중' };
  req.authContext.reservations.push(item);
  res.json(item);
});

// POST/GET /api/cart (SEC-248 trigger)
app.post('/api/cart', authenticate, (req, res) => {
  const { productId } = req.body;
  // Flag for SEC-248: 로그아웃 토큰 재사용 (장바구니)
  req.authContext.actionCart = true;
  const prod = products.find(p => p.id === productId);
  if (prod) {
    req.authContext.cart.push(prod);
  }
  res.json(req.authContext.cart);
});

app.get('/api/cart', authenticate, (req, res) => {
  // Flag for SEC-248: 로그아웃 토큰 재사용 (장바구니)
  req.authContext.actionCart = true;
  res.json(req.authContext.cart);
});

// POST /api/payment (SEC-249 trigger)
app.post('/api/payment', authenticate, (req, res) => {
  const { price } = req.body;
  // Flag for SEC-249: 로그아웃 토큰 재사용 (결제 폼)
  req.authContext.actionPayment = true;
  const newOrder = { id: 'ORD_' + Date.now(), price, status: '결제 완료', date: new Date().toLocaleDateString() };
  req.authContext.orders.push(newOrder);
  req.authContext.cart = []; // clear cart
  res.json(newOrder);
});

app.get('/api/orders', authenticate, (req, res) => {
  res.json(req.authContext.orders);
});

app.get('/api/wishlist', authenticate, (req, res) => {
  res.json(req.authContext.wishlist);
});

app.post('/api/wishlist', authenticate, (req, res) => {
  const { productId } = req.body;
  const prod = products.find(p => p.id === productId);
  if (prod) {
    req.authContext.wishlist.push(prod);
  }
  res.json(req.authContext.wishlist);
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
    actionSearch: false,
    actionProfile: false,
    actionSupport: false,
    actionProducts: false,
    actionFiles: false,
    actionComments: false,
    actionReservation: false,
    actionCart: false,
    actionPayment: false,
    actionFilter: false,
    cart: [],
    orders: [],
    wishlist: [],
    files: [],
    comments: [],
    reservations: [],
    support: []
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
    actionSearch: false,
    actionProfile: false,
    actionSupport: false,
    actionProducts: false,
    actionFiles: false,
    actionComments: false,
    actionReservation: false,
    actionCart: false,
    actionPayment: false,
    actionFilter: false,
    cart: [],
    orders: [],
    wishlist: [],
    files: [],
    comments: [],
    reservations: [],
    support: []
  };

  res.json({ status: 'success', token, user: matched });
});

// POST /api/logout
app.post('/api/logout', authenticate, (req, res) => {
  const token = req.authToken;
  const ctx = req.authContext;

  // INTENTIONAL BACKEND BUG
  // SEC-241: Logout token is intentionally not invalidated.
  const isBug241 = ctx.actionSearch === true;

  // INTENTIONAL BACKEND BUG
  // SEC-242: Logout token is intentionally not invalidated.
  const isBug242 = ctx.actionProfile === true;

  // INTENTIONAL BACKEND BUG
  // SEC-243: Logout token is intentionally not invalidated.
  const isBug243 = ctx.actionSupport === true;

  // INTENTIONAL BACKEND BUG
  // SEC-244: Logout token is intentionally not invalidated.
  const isBug244 = ctx.actionProducts === true;

  // INTENTIONAL BACKEND BUG
  // SEC-245: Logout token is intentionally not invalidated.
  const isBug245 = ctx.actionFiles === true;

  // INTENTIONAL BACKEND BUG
  // SEC-246: Logout token is intentionally not invalidated.
  const isBug246 = ctx.actionComments === true;

  // INTENTIONAL BACKEND BUG
  // SEC-247: Logout token is intentionally not invalidated.
  const isBug247 = ctx.actionReservation === true;

  // INTENTIONAL BACKEND BUG
  // SEC-248: Logout token is intentionally not invalidated.
  const isBug248 = ctx.actionCart === true;

  // INTENTIONAL BACKEND BUG
  // SEC-249: Logout token is intentionally not invalidated.
  const isBug249 = ctx.actionPayment === true;

  // INTENTIONAL BACKEND BUG
  // SEC-250: Logout token is intentionally not invalidated.
  const isBug250 = ctx.actionFilter === true;

  const isVulnerable = isBug241 || isBug242 || isBug243 || isBug244 || isBug245 || isBug246 || isBug247 || isBug248 || isBug249 || isBug250;

  if (isVulnerable) {
    // Intentionally bypass invalidation (keeps token valid)
    res.json({ status: 'success', vulnerable: true });
  } else {
    // Normal logout behavior
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
  console.log(`[OrangeMarket Server] Running at http://localhost:${PORT}`);
});
