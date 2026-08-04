import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9911;

// Middleware
app.use(cors());
app.use(express.json());

// HTML Escaping Helper
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (match) => {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}

// ----------------------------------------------------
// Mock Database State
// ----------------------------------------------------
let restaurants = [
  {
    id: 'mint-chicken',
    name: '민트 치킨하우스',
    category: '치킨',
    rating: 4.8,
    deliveryTime: '25-35분',
    deliveryFee: 2000,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    description: '바삭바삭한 크리스피 치킨과 민트치킨의 환상적인 하모니!',
    menu: [
      { id: 101, name: '바삭 크리스피 후라이드', price: 17000 },
      { id: 102, name: '달콤 양념 치킨', price: 18000 },
      { id: 103, name: '시그니처 민트 크림 치킨', price: 19000 }
    ]
  },
  {
    id: 'daebak-bunsik',
    name: '대박 분식',
    category: '분식',
    rating: 4.7,
    deliveryTime: '20-30분',
    deliveryFee: 1500,
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80',
    description: '매콤달콤한 떡볶이와 갓 튀겨낸 모듬튀김 전문점.',
    menu: [
      { id: 201, name: '매콤 국물 떡볶이', price: 4000 },
      { id: 202, name: '바삭 찰순대', price: 4500 },
      { id: 203, name: '모듬 수제 튀김 (5개)', price: 5000 }
    ]
  },
  {
    id: 'pizza-paradise',
    name: '피자 파라다이스',
    category: '피자/양식',
    rating: 4.9,
    deliveryTime: '30-40분',
    deliveryFee: 2500,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    description: '자연산 치즈가 쭉 늘어나는 정통 화덕 피자 전문점.',
    menu: [
      { id: 301, name: '치즈 폭탄 페퍼로니 피자', price: 21900 },
      { id: 302, name: '쉬림프 포테이토 피자', price: 23900 },
      { id: 303, name: '오븐 베이컨 토마토 파스타', price: 8500 }
    ]
  }
];

let orders = [
  {
    orderId: 'QD-2026-0802-12',
    date: '2026-08-01',
    restaurantName: '민트 치킨하우스',
    menuSummary: '시그니처 민트 크림 치킨 1개',
    amount: 21000,
    status: '배달완료',
    note: '단무지 많이 주세요.'
  }
];

let cart = [];

let profile = {
  username: 'customer',
  nickname: '배달의달인_지우',
  email: 'jiu@quickdelivery.co.kr',
  address: '서울특별시 서초구 반포동 120-4 신반포아파트 104동 302호',
  isSafeFilterEnabled: false
};

let notifications = [
  { id: 1, title: '🔔 8월 첫 주문 웰컴 3,000원 쿠폰 지급 완료!', date: '2026-08-02' },
  { id: 2, title: '⛈️ 폭우로 인한 일시적 배달 지연 양해 부탁드립니다.', date: '2026-07-28' }
];

let calendarEvents = [
  { id: 1, date: '2026-08-10', time: '12:00', title: '회사 점심 단체 피자 예약 주문', qty: 3 }
];

let reports = [
  { date: '2026-08-01', ordersCount: 24, salesAmount: 489000, popularMenu: '민트 크림 치킨' },
  { date: '2026-08-02', ordersCount: 18, salesAmount: 362000, popularMenu: '페퍼로니 피자' }
];

let searchSuggestions = [
  { term: '치킨' },
  { term: '민트 초코' },
  { term: '매운 떡볶이' },
  { term: '치즈 페퍼로니 피자' }
];

// ----------------------------------------------------
// Standard / Utility APIs
// ----------------------------------------------------

// GET /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'QuickDelivery API' });
});

// GET /api/restaurants
app.get('/api/restaurants', (req, res) => {
  res.json(restaurants);
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
  res.json(cart);
});

// POST /api/cart/add
app.post('/api/cart/add', (req, res) => {
  const { id, name, price, quantity } = req.body;
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += quantity || 1;
  } else {
    cart.push({ id, name, price, quantity: quantity || 1 });
  }
  res.json({ success: true, cart });
});

// POST /api/orders/create
app.post('/api/orders/create', (req, res) => {
  const { restaurantName, menuSummary, amount, note } = req.body;
  const newOrder = {
    orderId: `QD-2026-0802-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().split('T')[0],
    restaurantName,
    menuSummary,
    amount,
    status: '접수대기',
    note: note || ''
  };
  orders.push(newOrder);
  cart = []; // clear cart
  res.json({ success: true, order: newOrder });
});

// GET /api/profile
app.get('/api/profile', (req, res) => {
  res.json(profile);
});

// GET /api/search
app.get('/api/search', (req, res) => {
  const query = req.query.q || '';
  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.category.toLowerCase().includes(query.toLowerCase())
  );
  res.json({
    query: query,
    results: filtered
  });
});


// ----------------------------------------------------
// INTENTIONAL VULNERABLE ENDPOINTS (Reflected XSS)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG: site012-bug01
// CSV: SEC-111
// Type: Reflected XSS
// Description: 태그 입력을 HTML Escape 없이 Preview 화면에 그대로 출력한다.
app.post('/api/tags/preview', (req, res) => {
  const tag = req.body.tag || '';
  res.json({
    tag: tag
  });
});

// INTENTIONAL BACKEND BUG: site012-bug02
// CSV: SEC-112
// Type: Reflected XSS
// Description: 친구 초대 메시지를 초대 미리보기 화면에 그대로 출력한다.
app.post('/api/invitations/preview', (req, res) => {
  const message = req.body.message || '';
  res.json({
    message: message
  });
});

// INTENTIONAL BACKEND BUG: site012-bug03
// CSV: SEC-113
// Type: Reflected XSS
// Description: 배송 메모 입력값을 주문 확인 화면에 그대로 출력한다.
app.post('/api/orders/delivery-note/preview', (req, res) => {
  const note = req.body.note || '';
  res.json({
    note: note
  });
});

// INTENTIONAL BACKEND BUG: site012-bug04
// CSV: SEC-114
// Type: Reflected XSS
// Description: 환불 사유 입력값을 환불 신청 확인 화면에 그대로 출력한다.
app.post('/api/refunds/preview', (req, res) => {
  const reason = req.body.reason || '';
  res.json({
    reason: reason
  });
});

// INTENTIONAL BACKEND BUG: site012-bug05
// CSV: SEC-115
// Type: Reflected XSS
// Description: 검색 제안 키워드를 검색 제안 영역에 그대로 출력한다.
app.get('/api/search/suggestions', (req, res) => {
  const q = req.query.q || '';
  res.json({
    q: q,
    suggestions: searchSuggestions.filter(s => s.term.includes(q))
  });
});

// INTENTIONAL BACKEND BUG: site012-bug06
// CSV: SEC-116
// Type: Reflected XSS
// Description: 알림 제목 입력값을 알림 미리보기 화면에 그대로 출력한다.
app.post('/api/notifications/preview', (req, res) => {
  const title = req.body.title || '';
  res.json({
    title: title
  });
});

// INTENTIONAL BACKEND BUG: site012-bug07
// CSV: SEC-117
// Type: Reflected XSS
// Description: 예약 주문 일정 제목을 일정 미리보기 화면에 그대로 출력한다.
app.post('/api/calendar/preview', (req, res) => {
  const title = req.body.title || '';
  res.json({
    title: title
  });
});

// INTENTIONAL BACKEND BUG: site012-bug08
// CSV: SEC-118
// Type: Reflected XSS
// Description: 리포트 필터 값을 리포트 상단에 그대로 출력한다.
app.get('/api/reports', (req, res) => {
  const filter = req.query.filter || '';
  res.json({
    filter: filter,
    reports: reports
  });
});

// INTENTIONAL BACKEND BUG: site012-bug09
// CSV: SEC-119
// Type: Reflected XSS
// Description: CSV 업로드 파일명을 업로드 결과 화면에 그대로 출력한다.
app.post('/api/menu/csv/preview', (req, res) => {
  const filename = req.body.filename || '';
  res.json({
    filename: filename,
    status: 'parsed',
    lines: 12
  });
});

// INTENTIONAL BACKEND BUG: site012-bug10
// CSV: SEC-120
// Type: Reflected XSS
// Description: API Query 입력값을 테스트 콘솔 결과 화면에 그대로 출력한다.
app.get('/api/tools/query', (req, res) => {
  const q = req.query.q || '';
  res.json({
    q: q,
    status: 'success',
    executedAt: new Date().toLocaleTimeString()
  });
});


// ----------------------------------------------------
// SAFE ENDPOINTS (HTML Escaped)
// ----------------------------------------------------

app.get('/api/safe/search', (req, res) => {
  const q = req.query.q || '';
  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(q.toLowerCase()) ||
    r.category.toLowerCase().includes(q.toLowerCase())
  );
  res.json({
    query: escapeHTML(q),
    results: filtered
  });
});

app.post('/api/safe/tag', (req, res) => {
  const tag = req.body.tag || '';
  res.json({
    tag: escapeHTML(tag)
  });
});

app.post('/api/safe/refund', (req, res) => {
  const reason = req.body.reason || '';
  res.json({
    reason: escapeHTML(reason)
  });
});

app.post('/api/safe/calendar', (req, res) => {
  const title = req.body.title || '';
  res.json({
    title: escapeHTML(title)
  });
});

app.post('/api/safe/upload', (req, res) => {
  const filename = req.body.filename || '';
  res.json({
    filename: escapeHTML(filename),
    status: 'parsed',
    lines: 12
  });
});

// Extra safe endpoints mapping to fully support safe mode queries in App.jsx
app.post('/api/safe/invitation', (req, res) => {
  const message = req.body.message || '';
  res.json({
    message: escapeHTML(message)
  });
});

app.post('/api/safe/delivery-note', (req, res) => {
  const note = req.body.note || '';
  res.json({
    note: escapeHTML(note)
  });
});

app.get('/api/safe/search/suggestions', (req, res) => {
  const q = req.query.q || '';
  res.json({
    q: escapeHTML(q),
    suggestions: searchSuggestions.filter(s => s.term.includes(q))
  });
});

app.post('/api/safe/notification', (req, res) => {
  const title = req.body.title || '';
  res.json({
    title: escapeHTML(title)
  });
});

app.get('/api/safe/reports', (req, res) => {
  const filter = req.query.filter || '';
  res.json({
    filter: escapeHTML(filter),
    reports: reports
  });
});

app.get('/api/safe/tools/query', (req, res) => {
  const q = req.query.q || '';
  res.json({
    q: escapeHTML(q),
    status: 'success',
    executedAt: new Date().toLocaleTimeString()
  });
});


// ----------------------------------------------------
// Serves React Client Statically (Production Fallback)
// ----------------------------------------------------
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to React dev server proxy OR static file
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Try fetching from Vite dev server first
  const httpModule = req.url.startsWith('https') ? import('https') : import('http');
  httpModule.then((http) => {
    const devServerUrl = `http://localhost:5173${req.url}`;
    const devReq = http.request(devServerUrl, (devRes) => {
      // Set content type and security headers but pass response
      res.writeHead(devRes.statusCode, devRes.headers);
      devRes.pipe(res);
    });
    devReq.on('error', () => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
        if (err) res.status(404).send('Frontend build not found. Please ensure Vite dev server is running on port 5173.');
      });
    });
    devReq.end();
  }).catch(() => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[QuickDelivery Server] Running at http://localhost:${PORT}`);
});
