import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9909;

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
// Mock Databases
// ----------------------------------------------------
let restaurants = [
  {
    id: 1,
    name: '오렌지 가든 (Orange Garden)',
    category: '양식/이탈리안',
    rating: 4.8,
    reviewsCount: 124,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    description: '신선한 토마토와 감미로운 오렌지 소스를 곁들인 수제 파스타 전문점',
    location: '서울시 마포구 연남동 45-12',
    priceRange: '20,000원 - 40,000원',
    status: '예약 가능'
  },
  {
    id: 2,
    name: '화로 브라운 (Hwaro Brown)',
    category: '한식/K-BBQ',
    rating: 4.9,
    reviewsCount: 382,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    description: '참숯 향이 깊게 베인 숙성 흑돼지와 한우 갈비 전문점',
    location: '서울시 강남구 역삼동 82-4',
    priceRange: '30,000원 - 80,000원',
    status: '마감 임박'
  },
  {
    id: 3,
    name: '우드앤파이어 (Wood & Fire)',
    category: '다이닝 바',
    rating: 4.7,
    reviewsCount: 95,
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    description: '참나무 장작으로 구워낸 최고급 스테이크와 내추럴 와인',
    location: '서울시 용산구 이태원동 11-3',
    priceRange: '50,000원 - 120,000원',
    status: '예약 가능'
  },
  {
    id: 4,
    name: '스시 코우지 (Sushi Koji)',
    category: '일식',
    rating: 4.6,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    description: '정통 오마카세와 장인의 손길로 빚어내는 최고급 스시',
    location: '서울시 송파구 잠실동 22-8',
    priceRange: '80,000원 - 200,000원',
    status: '예약 마감'
  },
  {
    id: 5,
    name: '카카오 브레드 (Cacao Bread)',
    category: '카페/디저트',
    rating: 4.5,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: '매일 아침 유기농 밀가루로 구워내는 크루아상과 스페셜티 커피',
    location: '서울시 성동구 성수동 102-1',
    priceRange: '5,000원 - 15,000원',
    status: '예약 가능'
  },
  {
    id: 6,
    name: '아시안 테이블 (Asian Table)',
    category: '아시안',
    rating: 4.7,
    reviewsCount: 204,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    description: '베트남 쌀국수와 태국 팟타이를 모던하게 재해석한 아시안 비스트로',
    location: '서울시 서초구 서초동 94-2',
    priceRange: '12,000원 - 30,000원',
    status: '예약 가능'
  }
];

let reviews = [
  {
    id: 1,
    restaurantId: 2,
    userName: '김철수',
    rating: 5,
    text: '화로 브라운 고기 진짜 맛있어요! 육즙이 살아있습니다. 부모님 모시고 가기 딱 좋아요.',
    date: '2026-07-28',
    comments: [
      { id: 1, userName: '점주', text: '방문해주셔서 감사합니다! 늘 최고의 품질로 보답하겠습니다.' }
    ]
  },
  {
    id: 2,
    restaurantId: 1,
    userName: '이영희',
    rating: 4,
    text: '오렌지 가든 파스타 소스가 독특하네요. 화이트 오렌지 인테리어도 너무 아늑하고 좋았습니다.',
    date: '2026-07-29',
    comments: []
  }
];

let reservations = [
  {
    id: 101,
    restaurantId: 1,
    restaurantName: '오렌지 가든 (Orange Garden)',
    userName: 'customer',
    date: '2026-08-10',
    time: '18:30',
    guests: 2,
    memo: '창가 자리로 부탁드립니다.',
    status: '확정'
  }
];

let cart = [
  {
    id: 1,
    restaurantId: 1,
    name: '수제 랍스터 파스타',
    price: 32000,
    quantity: 1,
    message: '치즈 많이 넣어주세요.'
  }
];

let profile = {
  username: 'customer',
  role: 'customer', // customer, owner, admin
  nickname: '미식가 홍길동',
  bio: '맛있는 음식을 찾아다니는 행복한 미식가입니다. 소통 환영해요!'
};

let contactRequests = [];
let photoCaptions = [];
let paymentMemos = [];

// ----------------------------------------------------
// Standard / Utility APIs
// ----------------------------------------------------

// GET /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'FoodSpot API' });
});

// GET /api/restaurants
app.get('/api/restaurants', (req, res) => {
  res.json(restaurants);
});

// GET /api/profile
app.get('/api/profile', (req, res) => {
  res.json(profile);
});

// GET /api/reservations
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// GET /api/comments
app.get('/api/comments', (req, res) => {
  res.json(reviews);
});

// GET /api/contact
app.get('/api/contact', (req, res) => {
  res.json(contactRequests);
});

// GET /api/photos
app.get('/api/photos', (req, res) => {
  res.json(photoCaptions);
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
  res.json(cart);
});

// GET /api/payment
app.get('/api/payment', (req, res) => {
  res.json(paymentMemos);
});


// ----------------------------------------------------
// VULNERABLE ENDPOINTS (Reflected XSS)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG: site010-bug01
// CSV: SEC-091
// Type: Reflected XSS
// Description: 검색어를 HTML Escape 없이 executable DOM Sink에 그대로 출력한다.
app.get('/api/search', (req, res) => {
  const query = req.query.q || '';
  // Vulnerable logic: returning raw query
  const filtered = restaurants.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase()) || 
    r.category.toLowerCase().includes(query.toLowerCase())
  );
  res.json({
    query: query,
    results: filtered
  });
});

// INTENTIONAL BACKEND BUG: site010-bug02
// CSV: SEC-092
// Type: Reflected XSS
// Description: 프로필 소개 입력 내용을 미리보기 화면에 그대로 출력한다.
app.post('/api/profile/preview', (req, res) => {
  const bio = req.body.bio || '';
  // Update mock profile in-memory
  profile.bio = bio;
  res.json({
    username: profile.username,
    nickname: profile.nickname,
    bio: bio // Vulnerable: raw bio returned
  });
});

// INTENTIONAL BACKEND BUG: site010-bug03
// CSV: SEC-093
// Type: Reflected XSS
// Description: 문의 내용을 전송 전 미리보기 화면에 그대로 출력한다.
app.post('/api/contact/preview', (req, res) => {
  const { name, email, content } = req.body;
  const newRequest = { name, email, content };
  contactRequests.push(newRequest);
  res.json({
    name: name,
    email: email,
    content: content // Vulnerable: raw content returned
  });
});

// INTENTIONAL BACKEND BUG: site010-bug04
// CSV: SEC-094
// Type: Reflected XSS
// Description: 새 맛집 이름 입력값을 미리보기 카드에 그대로 출력한다.
app.get('/api/restaurants/preview', (req, res) => {
  const name = req.query.name || '';
  res.json({
    name: name, // Vulnerable: raw name returned
    category: '임시 카테고리',
    rating: 5.0,
    reviewsCount: 0,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    description: '점주 등록 대기 중인 신규 레스토랑 미리보기 정보입니다.',
    location: '지정된 위치 없음',
    priceRange: '20,000원 - 50,000원',
    status: '가오픈 예정'
  });
});

// INTENTIONAL BACKEND BUG: site010-bug05
// CSV: SEC-095
// Type: Reflected XSS
// Description: 사진 설명 입력값을 미리보기 화면에 그대로 출력한다.
app.post('/api/photos/preview', (req, res) => {
  const description = req.body.description || '';
  photoCaptions.push({ description });
  res.json({
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    description: description // Vulnerable: raw description returned
  });
});

// INTENTIONAL BACKEND BUG: site010-bug06
// CSV: SEC-096
// Type: Reflected XSS
// Description: 리뷰 댓글 입력값을 미리보기 영역에 그대로 출력한다.
app.post('/api/comments/preview', (req, res) => {
  const text = req.body.text || '';
  res.json({
    text: text, // Vulnerable: raw comment text returned
    userName: '고객 지원단',
    date: '방금 전'
  });
});

// INTENTIONAL BACKEND BUG: site010-bug07
// CSV: SEC-097
// Type: Reflected XSS
// Description: 예약 메모 입력값을 예약 확인 화면에 그대로 출력한다.
app.post('/api/reservations/preview', (req, res) => {
  const memo = req.body.memo || '';
  res.json({
    restaurantId: 1,
    restaurantName: '오렌지 가든 (Orange Garden)',
    userName: 'customer',
    date: '2026-08-15',
    time: '19:00',
    guests: 4,
    memo: memo, // Vulnerable: raw memo returned
    status: '예약 진행 중'
  });
});

// INTENTIONAL BACKEND BUG: site010-bug08
// CSV: SEC-098
// Type: Reflected XSS
// Description: 장바구니 요청 메시지를 화면에 그대로 출력한다.
app.post('/api/cart/preview', (req, res) => {
  const message = req.body.message || '';
  res.json({
    restaurantId: 1,
    name: '스페셜 디너 코스',
    price: 150000,
    quantity: 2,
    message: message // Vulnerable: raw message returned
  });
});

// INTENTIONAL BACKEND BUG: site010-bug09
// CSV: SEC-099
// Type: Reflected XSS
// Description: 결제 요청 메모를 결제 확인 화면에 그대로 출력한다.
app.post('/api/payment/preview', (req, res) => {
  const memo = req.body.memo || '';
  paymentMemos.push({ memo });
  res.json({
    orderId: 'ORD-2026-0802-9909',
    amount: 150000,
    method: '신용카드',
    memo: memo // Vulnerable: raw payment memo returned
  });
});

// INTENTIONAL BACKEND BUG: site010-bug10
// CSV: SEC-100
// Type: Reflected XSS
// Description: 필터 키워드를 결과 상단에 그대로 출력한다.
app.get('/api/filter', (req, res) => {
  const keyword = req.query.keyword || '';
  // Filter logic
  const filtered = restaurants.filter(r => 
    r.category.includes(keyword) || 
    r.name.includes(keyword)
  );
  res.json({
    keyword: keyword, // Vulnerable: raw keyword returned
    resultsCount: filtered.length,
    results: filtered
  });
});


// ----------------------------------------------------
// SAFE ENDPOINTS (HTML Escaped)
// ----------------------------------------------------

app.get('/api/safe/search', (req, res) => {
  const query = req.query.q || '';
  const filtered = restaurants.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase()) || 
    r.category.toLowerCase().includes(query.toLowerCase())
  );
  res.json({
    query: escapeHTML(query),
    results: filtered
  });
});

app.post('/api/safe/profile', (req, res) => {
  const bio = req.body.bio || '';
  profile.bio = bio;
  res.json({
    username: profile.username,
    nickname: profile.nickname,
    bio: escapeHTML(bio)
  });
});

app.post('/api/safe/contact', (req, res) => {
  const { name, email, content } = req.body;
  res.json({
    name: name,
    email: email,
    content: escapeHTML(content)
  });
});

app.post('/api/safe/comments', (req, res) => {
  const text = req.body.text || '';
  res.json({
    text: escapeHTML(text),
    userName: '고객 지원단 (안전)',
    date: '방금 전'
  });
});

app.post('/api/safe/payment', (req, res) => {
  const memo = req.body.memo || '';
  res.json({
    orderId: 'ORD-2026-0802-9909',
    amount: 150000,
    method: '신용카드',
    memo: escapeHTML(memo)
  });
});

// Extra Safe Routes for validation completeness
app.get('/api/safe/restaurants/preview', (req, res) => {
  const name = req.query.name || '';
  res.json({
    name: escapeHTML(name),
    category: '임시 카테고리 (안전)',
    rating: 5.0,
    reviewsCount: 0,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    description: '점주 등록 대기 중인 신규 레스토랑 안전 미리보기 정보입니다.',
    location: '지정된 위치 없음',
    priceRange: '20,000원 - 50,000원',
    status: '가오픈 예정'
  });
});

app.post('/api/safe/photos/preview', (req, res) => {
  const description = req.body.description || '';
  res.json({
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    description: escapeHTML(description)
  });
});

app.post('/api/safe/reservations/preview', (req, res) => {
  const memo = req.body.memo || '';
  res.json({
    restaurantId: 1,
    restaurantName: '오렌지 가든 (Orange Garden)',
    userName: 'customer',
    date: '2026-08-15',
    time: '19:00',
    guests: 4,
    memo: escapeHTML(memo),
    status: '예약 진행 중'
  });
});

app.post('/api/safe/cart/preview', (req, res) => {
  const message = req.body.message || '';
  res.json({
    restaurantId: 1,
    name: '스페셜 디너 코스',
    price: 150000,
    quantity: 2,
    message: escapeHTML(message)
  });
});

app.get('/api/safe/filter', (req, res) => {
  const keyword = req.query.keyword || '';
  const filtered = restaurants.filter(r => 
    r.category.includes(keyword) || 
    r.name.includes(keyword)
  );
  res.json({
    keyword: escapeHTML(keyword),
    resultsCount: filtered.length,
    results: filtered
  });
});


// ----------------------------------------------------
// Serves React Client Statically (Production Fallback)
// ----------------------------------------------------
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to React index.html for SPA router
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // API call fallback (404)
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`[FoodSpot server.js] Serving FoodSpot at http://localhost:${PORT}`);
});
