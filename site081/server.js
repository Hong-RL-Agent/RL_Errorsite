'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9410;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════
// Mock DB
// ══════════════════════════════════════════

const TODAY = new Date('2026-05-02');

function daysFromToday(dateStr) {
  const d = new Date(dateStr);
  return Math.floor((d - TODAY) / (1000 * 60 * 60 * 24));
}

// INTENTIONAL BUG: site081-bug02
// CSV Error: API 필드 누락
// Type: network-missing-field
// Description: 제품 API가 일부 productId를 누락함.
// id: 3, id: 6 의 제품 객체에서 'productId' 필드를 의도적으로 제거함.
// 클라이언트가 productId를 기준으로 동작할 때 undefined 참조 오류 발생 가능.
// data-bug-id="site081-bug02"
const mockProducts = [
  {
    id: 1, productId: 'PRD-001',
    name: '수분 크림 하이드라부스트', brand: 'Neutrogena',
    category: '스킨케어', subcategory: '크림',
    openedDate: '2025-11-01', expiryDate: '2026-06-01',
    price: 18000, rating: 4.5, reviewCount: 24,
    image: '🧴', color: '#A8D8EA',
    description: '24시간 수분 공급 크림. 히알루론산 함유.',
    usage: '아침/저녁 세안 후 적당량 도포'
  },
  {
    id: 2, productId: 'PRD-002',
    name: '글로우 파운데이션 SPF30', brand: 'L\'Oreal',
    category: '베이스메이크업', subcategory: '파운데이션',
    openedDate: '2025-09-15', expiryDate: '2026-05-15',
    price: 32000, rating: 4.2, reviewCount: 41,
    image: '💄', color: '#F7CAC9',
    description: 'SPF30 자외선 차단 + 글로우 피니시.',
    usage: '소량을 얼굴 전체에 고르게 펴 바름'
  },
  {
    id: 3,
    // INTENTIONAL BUG: site081-bug02 (productId 필드 누락)
    // data-bug-id="site081-bug02"
    // productId 키 자체가 없음 → 클라이언트에서 product.productId === undefined
    name: '볼륨업 마스카라 블랙', brand: 'Maybelline',
    category: '아이메이크업', subcategory: '마스카라',
    openedDate: '2025-12-01', expiryDate: '2026-06-01',
    price: 14000, rating: 3.8, reviewCount: 16,
    image: '👁️', color: '#2C3E50',
    description: '3배 볼륨업 마스카라. 번짐 방지 포뮬러.',
    usage: '위 아래 속눈썹에 지그재그로 바름'
  },
  {
    id: 4, productId: 'PRD-004',
    name: '립글로스 코랄레드', brand: 'MAC',
    category: '립메이크업', subcategory: '립글로스',
    openedDate: '2026-01-10', expiryDate: '2027-01-10',
    price: 28000, rating: 4.7, reviewCount: 58,
    image: '💋', color: '#FF6B6B',
    description: 'MAC 시그니처 코랄레드 립글로스.',
    usage: '입술에 직접 또는 브러시로 도포'
  },
  {
    id: 5, productId: 'PRD-005',
    name: '비타민C 세럼 20%', brand: 'COSRX',
    category: '스킨케어', subcategory: '세럼',
    openedDate: '2025-10-01', expiryDate: '2026-04-01',  // 이미 만료!
    price: 22000, rating: 4.4, reviewCount: 33,
    image: '🌟', color: '#FFD700',
    description: '고농도 비타민C 20% 세럼. 브라이트닝 효과.',
    usage: '토너 후 2~3방울 도포'
  },
  {
    id: 6,
    // INTENTIONAL BUG: site081-bug02 (productId 필드 누락 - 두 번째)
    // data-bug-id="site081-bug02"
    name: '선크림 에센스 SPF50+', brand: 'Anessa',
    category: '스킨케어', subcategory: '선케어',
    openedDate: '2026-02-01', expiryDate: '2027-02-01',
    price: 35000, rating: 4.6, reviewCount: 72,
    image: '☀️', color: '#FFA500',
    description: 'SPF50+/PA++++ 고기능 선케어 에센스.',
    usage: '외출 15분 전 도포. 2~3시간마다 덧바름'
  },
  {
    id: 7, productId: 'PRD-007',
    name: '아이섀도 팔레트 로즈골드', brand: 'Urban Decay',
    category: '아이메이크업', subcategory: '아이섀도',
    openedDate: '2025-08-01', expiryDate: '2026-08-01',
    price: 65000, rating: 4.9, reviewCount: 89,
    image: '🎨', color: '#C9A0DC',
    description: '12컬러 로즈골드 팔레트. 매트+글리터.',
    usage: '브러시로 원하는 컬러를 눈두덩에 블렌딩'
  },
  {
    id: 8, productId: 'PRD-008',
    name: '토너 시카 진정 앰플', brand: 'COSRX',
    category: '스킨케어', subcategory: '토너',
    openedDate: '2026-03-01', expiryDate: '2026-05-10',  // 8일 후 만료 (임박)
    price: 19000, rating: 4.3, reviewCount: 27,
    image: '💧', color: '#B2DFDB',
    description: '시카 성분의 진정 토너 앰플.',
    usage: '세안 후 화장솜 또는 손으로 도포'
  }
];

let mockReviews = [
  { id: 1, productId: 1, author: 'beauty_lover', rating: 5, content: '촉촉함이 오래 유지돼서 너무 좋아요!', date: '2026-04-20', helpful: 12 },
  { id: 2, productId: 2, author: 'glowup_girl', rating: 4, content: '커버력은 살짝 아쉽지만 지속력은 최고예요.', date: '2026-04-22', helpful: 8 },
  { id: 3, productId: 4, author: 'lipstick_addict', rating: 5, content: 'MAC 립은 항상 믿고 사요. 발색 최고!', date: '2026-04-25', helpful: 21 }
];
let reviewIdCounter = 4;

// 위시리스트 — 유저별 (bug03용으로 다른 유저 목록 포함)
// INTENTIONAL BUG: site081-bug03
// CSV Error: 위시리스트 소유자 검증 누락
// Type: security-authorization
// Description: wishlistId 변경으로 다른 사용자의 위시리스트 조회 가능.
// /api/wishlist/:userId 에서 현재 로그인 사용자와 요청 userId 일치 여부를 검증하지 않음.
// data-bug-id="site081-bug03"
const mockWishlists = {
  'user_alice': [1, 4, 7],
  'user_bob': [2, 6],
  'user_carol': [3, 5, 8]
};

const CURRENT_USER = 'user_alice';

// 통계
function calcStats() {
  const now = TODAY;
  const total = mockProducts.length;
  const expired = mockProducts.filter(p => new Date(p.expiryDate) < now).length;
  const expiringSoon = mockProducts.filter(p => {
    const d = daysFromToday(p.expiryDate);
    return d >= 0 && d <= 30;
  }).length;
  const avgRating = (mockProducts.reduce((s, p) => s + p.rating, 0) / total).toFixed(1);
  return { total, expired, expiringSoon, avgRating };
}

// ══════════════════════════════════════════
// API Routes
// ══════════════════════════════════════════

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site081', name: 'MakeupShelf', port: PORT, timestamp: new Date().toISOString() });
});

// GET /api/products
app.get('/api/products', (req, res) => {
  const { brand, category, sort, q } = req.query;
  let products = [...mockProducts];

  if (brand && brand !== 'all') products = products.filter(p => p.brand === brand);
  if (category && category !== 'all') products = products.filter(p => p.category === category);
  if (q) {
    const query = q.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }

  if (sort === 'expiry_asc') products.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  if (sort === 'expiry_desc') products.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
  if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
  if (sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name));

  // bug02: productId가 없는 제품이 그대로 응답에 포함됨 (id:3, id:6)
  res.json({ success: true, data: products, total: products.length });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: '제품을 찾을 수 없습니다.' });
  res.json({ success: true, data: product });
});

// GET /api/expiring — 임박 제품 (bug01 재현)
app.get('/api/expiring', (req, res) => {
  const { days = 30 } = req.query;

  // INTENTIONAL BUG: site081-bug01
  // CSV Error: DB 만료일 필터 오류
  // Type: database-date-query
  // Description: 이미 만료된 제품도 임박 제품으로 표시됨.
  // 정상 로직: daysFromToday(p.expiryDate) >= 0 && daysFromToday(p.expiryDate) <= days
  // 버그 로직: 하한(>= 0) 체크 없이 daysFromToday <= days 만 확인 → 음수(만료)도 포함됨
  // data-bug-id="site081-bug01"
  const daysNum = parseInt(days);
  const expiring = mockProducts.filter(p => {
    const d = daysFromToday(p.expiryDate);
    return d <= daysNum; // 하한 체크 누락 → 이미 만료된 제품도 포함
  }).map(p => ({
    ...p,
    daysLeft: daysFromToday(p.expiryDate)
  }));

  res.json({ success: true, data: expiring, total: expiring.length });
});

// GET /api/reviews/:productId
app.get('/api/reviews/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const reviews = mockReviews.filter(r => r.productId === productId);
  res.json({ success: true, data: reviews, total: reviews.length });
});

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
  const { productId, author, rating, content } = req.body;
  if (!productId || !author || !rating || !content) {
    return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' });
  }
  const newReview = {
    id: reviewIdCounter++,
    productId: parseInt(productId),
    author, rating: parseInt(rating), content,
    date: new Date().toISOString().split('T')[0],
    helpful: 0
  };
  mockReviews.push(newReview);
  res.status(201).json({ success: true, data: newReview });
});

// GET /api/wishlist/:userId — bug03: 소유자 검증 없음
app.get('/api/wishlist/:userId', (req, res) => {
  const { userId } = req.params;

  // data-bug-id="site081-bug03"
  // 현재 로그인 사용자(CURRENT_USER)와 요청된 userId가 일치하는지 검증하지 않음.
  // 정상 코드:
  // if (userId !== CURRENT_USER) {
  //   return res.status(403).json({ success: false, message: '접근 권한이 없습니다.' });
  // }
  const wishlistIds = mockWishlists[userId] || [];
  const products = mockProducts.filter(p => wishlistIds.includes(p.id));
  res.json({ success: true, data: products, userId, total: products.length });
});

// POST /api/wishlist/toggle
app.post('/api/wishlist/toggle', (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'productId 필요' });
  const list = mockWishlists[CURRENT_USER] || [];
  const idx = list.indexOf(productId);
  if (idx === -1) {
    list.push(productId);
    mockWishlists[CURRENT_USER] = list;
    res.json({ success: true, action: 'added', wishlist: list });
  } else {
    list.splice(idx, 1);
    res.json({ success: true, action: 'removed', wishlist: list });
  }
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  res.json({ success: true, data: calcStats() });
});

// GET /api/brands
app.get('/api/brands', (req, res) => {
  const brands = [...new Set(mockProducts.map(p => p.brand))];
  res.json({ success: true, data: brands });
});

// GET /api/categories
app.get('/api/categories', (req, res) => {
  const cats = [...new Set(mockProducts.map(p => p.category))];
  res.json({ success: true, data: cats });
});

// Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`💄 MakeupShelf server running at http://localhost:${PORT}`);
  console.log(`   Site ID: site081`);
  console.log(`   Bugs: bug01(db-date-query), bug02(network-missing-field), bug03(security-authorization)`);
});
