import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9920;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Memory Session Store
// ----------------------------------------------------
let sessions = {}; // sessionId -> { id, user, actionSearch, actionProfile, etc. }

const generateSessionId = () => {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Middleware to resolve or initialize session context
app.use((req, res, next) => {
  let sessionId = req.headers['x-session-id'];
  if (!sessionId || !sessions[sessionId]) {
    sessionId = generateSessionId();
    sessions[sessionId] = {
      id: sessionId,
      user: null,
      cart: [],
      orders: [],
      supportDraft: null,
      reviewsWritten: [],
      filesUploaded: [],
      reservationNote: '',
      profileIntroduction: '',
      actionSearch: false,
      actionProfile: false,
      actionSupport: false,
      actionProducts: false,
      actionFiles: false,
      actionReviews: false,
      actionReservation: false,
      actionCart: false,
      actionPayment: false,
      actionFilter: false
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
  { username: 'buyer', name: '이지훈', address: '서울 마포구 공덕동' },
  { username: 'organic', name: '김신선', address: '경기도 성남시 분당구' }
];

let products = [
  { id: 'p1', name: '유기농 고당도 샤인머스캣', category: 'Fruits', price: 18900, desc: 'GAP 인증 친환경 농법으로 길러낸 아삭하고 달콤한 특급 머스캣 500g', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&auto=format&fit=crop&q=60' },
  { id: 'p2', name: '해발 800m 무농약 브로콜리', category: 'Vegetables', price: 2900, desc: '청정 고지대에서 자란 비타민 C가 가득한 신선 브로콜리 1송이', image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&auto=format&fit=crop&q=60' },
  { id: 'p3', name: 'GAP 당일수확 아삭 상추', category: 'Vegetables', price: 1980, desc: '수경 재배로 이물질 없이 아삭하고 깨끗하게 씻어 나온 쌈채소 150g', image: 'https://images.unsplash.com/photo-1556781366-336f8353cd53?w=400&auto=format&fit=crop&q=60' },
  { id: 'p4', name: '방목 사육 1등급 유정란', category: 'Dairy', price: 7900, desc: '스트레스 없는 자연 방목 환경에서 낳은 고소하고 영양 가득한 유정란 10구', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&auto=format&fit=crop&q=60' },
  { id: 'p5', name: '목장 직송 신선 유기농 우유', category: 'Dairy', price: 3400, desc: '저온 살균으로 본연의 고소한 맛과 영양을 살린 유기농 우유 900ml', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=60' }
];

// ----------------------------------------------------
// Core REST APIs
// ----------------------------------------------------

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', theme: 'FreshCart API', timestamp: new Date().toISOString() });
});

// GET /api/session
app.get('/api/session', (req, res) => {
  res.json({
    sessionId: req.session.id,
    user: req.session.user,
    details: {
      actionSearch: req.session.actionSearch,
      actionProfile: req.session.actionProfile,
      actionSupport: req.session.actionSupport,
      actionProducts: req.session.actionProducts,
      actionFiles: req.session.actionFiles,
      actionReviews: req.session.actionReviews,
      actionReservation: req.session.actionReservation,
      actionCart: req.session.actionCart,
      actionPayment: req.session.actionPayment,
      actionFilter: req.session.actionFilter
    }
  });
});

// POST /api/register
app.post('/api/register', (req, res) => {
  const { username, name } = req.body;
  if (!username || !name) {
    return res.status(400).json({ error: '가입 필드가 올바르지 않습니다.' });
  }
  const newUser = { username, name, address: '서울 중구 을지로' };
  users.push(newUser);
  res.json({ status: 'success', user: newUser });
});

// GET /api/products
app.get('/api/products', (req, res) => {
  const { filter } = req.query;
  
  if (filter) {
    // Flag for site021-bug10: 필터 파라미터
    req.session.actionFilter = true;
    const filtered = products.filter(p => p.category === filter);
    return res.json(filtered);
  }

  // Flag for site021-bug04: 상품명 필드
  req.session.actionProducts = true;
  res.json(products);
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  }
});

// GET /api/search
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  // Flag for site021-bug01: 로그인 후 Session ID 미회전 (검색창)
  req.session.actionSearch = true;

  if (!q) {
    return res.json(products);
  }
  const results = products.filter(p => p.name.includes(q) || p.desc.includes(q));
  res.json(results);
});

// POST /api/profile
app.post('/api/profile', (req, res) => {
  const { introduction } = req.body;
  // Flag for site021-bug02: 프로필 소개
  req.session.actionProfile = true;
  req.session.profileIntroduction = introduction || '';
  res.json({ status: 'success', introduction: req.session.profileIntroduction });
});

// POST /api/support
app.post('/api/support', (req, res) => {
  const { title, message } = req.body;
  // Flag for site021-bug03: 문의 폼
  req.session.actionSupport = true;
  req.session.supportDraft = { title, message };
  res.json({ status: 'success', supportDraft: req.session.supportDraft });
});

// POST /api/files
app.post('/api/files', (req, res) => {
  const { filename, description } = req.body;
  // Flag for site021-bug05: 파일 설명
  req.session.actionFiles = true;
  const newFile = { filename, description, timestamp: new Date().toISOString() };
  req.session.filesUploaded.push(newFile);
  res.json({ status: 'success', file: newFile });
});

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
  const { productId, rating, comment } = req.body;
  // Flag for site021-bug06: 댓글 입력
  req.session.actionReviews = true;
  const newReview = { productId, rating, comment, timestamp: new Date().toISOString() };
  req.session.reviewsWritten.push(newReview);
  res.json({ status: 'success', review: newReview });
});

// POST /api/orders/reservation
app.post('/api/orders/reservation', (req, res) => {
  const { note } = req.body;
  // Flag for site021-bug07: 예약 메모
  req.session.actionReservation = true;
  req.session.reservationNote = note || '';
  res.json({ status: 'success', reservationNote: req.session.reservationNote });
});

// POST /api/cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  // Flag for site021-bug08: 장바구니
  req.session.actionCart = true;
  const prod = products.find(p => p.id === productId);
  if (prod) {
    const existing = req.session.cart.find(item => item.product.id === productId);
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      req.session.cart.push({ product: prod, quantity: Number(quantity) });
    }
  }
  res.json({ status: 'success', cart: req.session.cart });
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
  res.json(req.session.cart || []);
});

// POST /api/payment
app.post('/api/payment', (req, res) => {
  const { receiverName, receiverPhone, receiverAddress } = req.body;
  // Flag for site021-bug09: 결제 폼
  req.session.actionPayment = true;
  
  const orderDetails = {
    id: 'ord_' + Math.random().toString(36).substring(2, 9),
    items: req.session.cart,
    receiver: { receiverName, receiverPhone, receiverAddress },
    status: 'Delivery Prepared',
    timestamp: new Date().toISOString()
  };
  req.session.orders.push(orderDetails);
  req.session.cart = []; // clear cart
  res.json({ status: 'success', order: orderDetails });
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  res.json(req.session.orders || []);
});

// POST /api/login (With 10 intentional Session Fixation vulnerabilities)
app.post('/api/login', (req, res) => {
  const { username } = req.body;
  const matchedUser = users.find(u => u.username === username);
  if (!matchedUser) {
    return res.status(401).json({ error: '가입되지 않은 회원입니다.' });
  }

  const currentSessionId = req.session.id;
  const sessionData = sessions[currentSessionId];

  // INTENTIONAL BACKEND BUG
  // site021-bug01: 로그인 후 Session ID 미회전 (검색창)
  const isBug01 = sessionData.actionSearch === true;

  // INTENTIONAL BACKEND BUG
  // site021-bug02: 로그인 후 Session ID 미회전 (프로필 소개)
  const isBug02 = sessionData.actionProfile === true;

  // INTENTIONAL BACKEND BUG
  // site021-bug03: 로그인 후 Session ID 미회전 (문의 폼)
  const isBug03 = sessionData.actionSupport === true;

  // INTENTIONAL BACKEND BUG
  // site021-bug04: 로그인 후 Session ID 미회전 (상품명 필드)
  const isBug04 = sessionData.actionProducts === true;

  // INTENTIONAL BACKEND BUG
  // site021-bug05: 로그인 후 Session ID 미회전 (파일 설명)
  const isBug05 = sessionData.actionFiles === true;

  // INTENTIONAL BACKEND BUG
  // site021-bug06: 로그인 후 Session ID 미회전 (댓글 입력)
  const isBug06 = sessionData.actionReviews === true;

  // INTENTIONAL BACKEND BUG
  // site021-bug07: 로그인 후 Session ID 미회전 (예약 메모)
  const isBug07 = sessionData.actionReservation === true;

  // INTENTIONAL BACKEND BUG
  // site021-bug08: 로그인 후 Session ID 미회전 (장바구니)
  const isBug08 = sessionData.actionCart === true;

  // INTENTIONAL BACKEND BUG
  // site021-bug09: 로그인 후 Session ID 미회전 (결제 폼)
  const isBug09 = sessionData.actionPayment === true;

  // INTENTIONAL BACKEND BUG
  // site021-bug10: 로그인 후 Session ID 미회전 (필터 파라미터)
  const isBug10 = sessionData.actionFilter === true;

  // If any vulnerability trigger flag is active, we preserve the Session ID (Session Fixation).
  const isVulnerable = isBug01 || isBug02 || isBug03 || isBug04 || isBug05 || isBug06 || isBug07 || isBug08 || isBug09 || isBug10;

  if (isVulnerable) {
    // Vulnerable behavior: Session ID remains unchanged
    sessionData.user = matchedUser;
    res.json({
      status: 'success',
      vulnerable: true,
      sessionId: currentSessionId,
      user: matchedUser
    });
  } else {
    // Normal behavior: Session ID is regenerated/rotated
    const newSessionId = generateSessionId();
    sessions[newSessionId] = {
      ...sessionData,
      id: newSessionId,
      user: matchedUser
    };
    
    // Delete old session reference
    delete sessions[currentSessionId];

    res.setHeader('X-Session-ID', newSessionId);
    res.json({
      status: 'success',
      vulnerable: false,
      sessionId: newSessionId,
      user: matchedUser
    });
  }
});

// ----------------------------------------------------
// Production Fallback
// ----------------------------------------------------
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
  console.log(`[FreshCart Server] Running at http://localhost:${PORT}`);
});
