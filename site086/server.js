'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9415;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════
// Mock DB
// ══════════════════════════════════════════

const CURRENT_USER = 'user_festa';

const mockBooths = [
  { id: 1, name: '한강 떡볶이', emoji: '🌶️', category: '분식', zone: 'A구역', rating: 4.7, reviewCount: 142, description: '국물 떡볶이의 정석. 어묵 서비스 포함.', openAt: '10:00', closeAt: '21:00', open: true },
  { id: 2, name: '타코야끼 마스터', emoji: '🐙', category: '일식', zone: 'B구역', rating: 4.5, reviewCount: 89, description: '오사카 정통 타코야끼. 4종 소스 선택.', openAt: '11:00', closeAt: '20:00', open: true },
  { id: 3, name: '수제버거 랩소디', emoji: '🍔', category: '양식', zone: 'A구역', rating: 4.8, reviewCount: 203, description: '100% 한우 패티 사용. 사이드 무한 리필.', openAt: '11:00', closeAt: '21:30', open: true },
  { id: 4, name: '크레페 파리지앵', emoji: '🥞', category: '디저트', zone: 'C구역', rating: 4.6, reviewCount: 77, description: '정통 프랑스식 크레페. 달콤+짭짤 두 종류.', openAt: '10:00', closeAt: '20:00', open: true },
  { id: 5, name: '마라탕 하우스', emoji: '🍜', category: '중식', zone: 'B구역', rating: 4.4, reviewCount: 115, description: '매운맛 레벨 1~5 선택. 토핑 자유롭게.', openAt: '12:00', closeAt: '21:00', open: false },
  { id: 6, name: '아이스크림 갤러리', emoji: '🍦', category: '디저트', zone: 'C구역', rating: 4.9, reviewCount: 310, description: '직접 만드는 이탈리안 젤라또. 15가지 맛.', openAt: '10:00', closeAt: '22:00', open: true }
];

const mockMenus = {
  1: [
    { id: 'M1-1', name: '국물 떡볶이', price: 6000, emoji: '🌶️', popular: true },
    { id: 'M1-2', name: '순대 추가', price: 2000, emoji: '🥩', popular: false },
    { id: 'M1-3', name: '라볶이 세트', price: 8000, emoji: '🍜', popular: true }
  ],
  2: [
    { id: 'M2-1', name: '타코야끼 6개', price: 5000, emoji: '🐙', popular: true },
    { id: 'M2-2', name: '타코야끼 12개', price: 9000, emoji: '🐙', popular: false },
    { id: 'M2-3', name: '오코노미야끼', price: 7000, emoji: '🥞', popular: true }
  ],
  3: [
    { id: 'M3-1', name: '클래식 한우버거', price: 14000, emoji: '🍔', popular: true },
    { id: 'M3-2', name: '치즈더블버거', price: 17000, emoji: '🧀', popular: true },
    { id: 'M3-3', name: '치킨버거', price: 11000, emoji: '🐔', popular: false }
  ],
  4: [
    { id: 'M4-1', name: '누텔라 크레페', price: 6000, emoji: '🍫', popular: true },
    { id: 'M4-2', name: '햄치즈 크레페', price: 7000, emoji: '🧀', popular: false },
    { id: 'M4-3', name: '딸기크림 크레페', price: 7500, emoji: '🍓', popular: true }
  ],
  5: [
    { id: 'M5-1', name: '마라탕 (소)', price: 9000, emoji: '🌶️', popular: false },
    { id: 'M5-2', name: '마라탕 (대)', price: 13000, emoji: '🌶️', popular: true },
    { id: 'M5-3', name: '마라롱샤', price: 15000, emoji: '🦞', popular: true }
  ],
  6: [
    { id: 'M6-1', name: '젤라또 1스쿱', price: 4000, emoji: '🍦', popular: false },
    { id: 'M6-2', name: '젤라또 2스쿱', price: 6500, emoji: '🍦', popular: true },
    { id: 'M6-3', name: '아포가토', price: 7000, emoji: '☕', popular: true }
  ]
};

// INTENTIONAL BUG: site086-bug02
// CSV Error: 네트워크 오래된 대기시간
// Type: network-stale-data
// Description: 대기시간 API가 오래된 mock 값을 반환함.
// 실시간 대기시간이 아닌 서버 시작 시 초기화된 값을 그대로 반환.
// 실제 시간이 지나도 대기시간 업데이트 없음. timestamp도 stale.
// data-bug-id="site086-bug02"
const WAIT_TIMES_SNAPSHOT_AT = '2026-04-30T09:00:00Z'; // 이틀 전 데이터
const waitTimes = {
  1: 25, 2: 10, 3: 45, 4: 5, 5: 0, 6: 35
};

let mockReviews = [
  { id: 1, boothId: 1, author: 'foodie_kim', rating: 5, content: '진짜 맛있어요! 국물이 최고입니다.', date: '2026-05-01' },
  { id: 2, boothId: 3, author: 'burger_fan', rating: 5, content: '패티가 두툼하고 육즙이 살아있어요!', date: '2026-04-30' },
  { id: 3, boothId: 6, author: 'icecream_lover', rating: 5, content: '피스타치오 맛이 너무 맛있어요. 줄 서서 먹을 가치 있음!', date: '2026-05-01' }
];
let reviewIdCounter = 4;

// 쿠폰 — 다른 유저 포함 (bug03용)
// INTENTIONAL BUG: site086-bug03
// CSV Error: 쿠폰 소유자 검증 누락
// Type: security-authorization
// Description: couponId만 알면 다른 사용자의 쿠폰 사용 가능.
// POST /api/coupons/:id/use 에서 현재 사용자 소유 여부를 검증하지 않음.
// data-bug-id="site086-bug03"
let mockCoupons = [
  { id: 1, userId: 'user_festa', code: 'FEST10', discount: 10, type: 'percent', boothId: null, description: '전 부스 10% 할인', used: false, expiresAt: '2026-05-31' },
  { id: 2, userId: 'user_festa', code: 'BURGER2000', discount: 2000, type: 'fixed', boothId: 3, description: '수제버거 랩소디 2,000원 할인', used: false, expiresAt: '2026-05-10' },
  { id: 3, userId: 'user_guest', code: 'GUEST500', discount: 500, type: 'fixed', boothId: null, description: '신규 방문 500원 할인', used: false, expiresAt: '2026-05-15' },
  { id: 4, userId: 'user_vip', code: 'VIP20', discount: 20, type: 'percent', boothId: null, description: 'VIP 전용 20% 할인', used: false, expiresAt: '2026-12-31' }
];

let favorites = [1, 3];

// ══════════════════════════════════════════
// Routes
// ══════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site086', name: 'FestivalFood', port: PORT, timestamp: new Date().toISOString() });
});

// GET /api/booths
app.get('/api/booths', (req, res) => {
  const { category, zone, sort, q } = req.query;
  let booths = [...mockBooths];

  if (category && category !== 'all') booths = booths.filter(b => b.category === category);
  if (zone && zone !== 'all') booths = booths.filter(b => b.zone === zone);
  if (q) { const ql = q.toLowerCase(); booths = booths.filter(b => b.name.toLowerCase().includes(ql) || b.description.toLowerCase().includes(ql)); }

  if (sort === 'rating') booths.sort((a, b) => b.rating - a.rating);
  if (sort === 'wait_asc') booths.sort((a, b) => (waitTimes[a.id] || 0) - (waitTimes[b.id] || 0));
  if (sort === 'wait_desc') booths.sort((a, b) => (waitTimes[b.id] || 0) - (waitTimes[a.id] || 0));

  const result = booths.map(b => ({
    ...b,
    waitMinutes: waitTimes[b.id] || 0
  }));

  res.json({ success: true, data: result, total: result.length });
});

// GET /api/booths/:id
app.get('/api/booths/:id', (req, res) => {
  const booth = mockBooths.find(b => b.id === parseInt(req.params.id));
  if (!booth) return res.status(404).json({ success: false, message: '부스를 찾을 수 없습니다.' });
  res.json({ success: true, data: { ...booth, waitMinutes: waitTimes[booth.id] || 0 } });
});

// GET /api/menus/:boothId
app.get('/api/menus/:boothId', (req, res) => {
  const boothId = parseInt(req.params.boothId);
  const menus = mockMenus[boothId] || [];
  const { popular } = req.query;
  const filtered = popular === 'true' ? menus.filter(m => m.popular) : menus;
  res.json({ success: true, data: filtered, boothId });
});

// GET /api/wait-times
app.get('/api/wait-times', (req, res) => {
  // data-bug-id="site086-bug02"
  // 실시간 갱신 없이 서버 시작 시 초기화된 stale 데이터 반환
  // snapshotAt 이 이틀 전 → 클라이언트에서 감지 가능
  res.json({
    success: true,
    data: Object.entries(waitTimes).map(([boothId, wait]) => ({
      boothId: parseInt(boothId),
      waitMinutes: wait,
      snapshotAt: WAIT_TIMES_SNAPSHOT_AT  // 오래된 timestamp
    })),
    snapshotAt: WAIT_TIMES_SNAPSHOT_AT,   // stale 표시
    note: 'Data may be stale'             // 경고 있어도 수정하지 않음
  });
});

// GET /api/reviews/:boothId
app.get('/api/reviews/:boothId', (req, res) => {
  const boothId = parseInt(req.params.boothId);
  const reviews = mockReviews.filter(r => r.boothId === boothId);
  res.json({ success: true, data: reviews, total: reviews.length });
});

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
  const { boothId, author, rating, content } = req.body;
  if (!boothId || !author || !rating || !content) return res.status(400).json({ success: false, message: '필수 필드 누락' });
  const newReview = { id: reviewIdCounter++, boothId: parseInt(boothId), author, rating: parseInt(rating), content, date: new Date().toISOString().split('T')[0] };
  mockReviews.push(newReview);
  res.status(201).json({ success: true, data: newReview });
});

// GET /api/coupons
app.get('/api/coupons', (req, res) => {
  const myCoupons = mockCoupons.filter(c => c.userId === CURRENT_USER);
  res.json({ success: true, data: myCoupons });
});

// POST /api/coupons/:id/use
// INTENTIONAL BUG: site086-bug01 + bug03
app.post('/api/coupons/:id/use', (req, res) => {
  const coupon = mockCoupons.find(c => c.id === parseInt(req.params.id));
  if (!coupon) return res.status(404).json({ success: false, message: '쿠폰을 찾을 수 없습니다.' });
  if (coupon.used) return res.status(400).json({ success: false, message: '이미 사용된 쿠폰입니다.' });

  // INTENTIONAL BUG: site086-bug03
  // CSV Error: 쿠폰 소유자 검증 누락
  // Type: security-authorization
  // Description: couponId만 알면 다른 사용자의 쿠폰 사용 가능.
  // data-bug-id="site086-bug03"
  // 정상: if (coupon.userId !== CURRENT_USER) return res.status(403)...

  // INTENTIONAL BUG: site086-bug01
  // CSV Error: DB 쿠폰 사용 상태 오류
  // Type: database-state
  // Description: 쿠폰 사용 후 used 상태가 true로 변경되지 않음.
  // data-bug-id="site086-bug01"
  // 정상: coupon.used = true;
  // 버그: 상태를 변경하지 않아 같은 쿠폰을 반복 사용 가능

  // coupon.used = true;  ← 이 라인이 의도적으로 주석 처리됨

  res.json({
    success: true,
    data: {
      couponId: coupon.id,
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      used: coupon.used  // 여전히 false 반환 (bug01)
    },
    message: '쿠폰이 적용되었습니다.'
  });
});

// POST /api/favorites/toggle
app.post('/api/favorites/toggle', (req, res) => {
  const { boothId } = req.body;
  if (!boothId) return res.status(400).json({ success: false, message: 'boothId 필요' });
  const idx = favorites.indexOf(parseInt(boothId));
  if (idx === -1) { favorites.push(parseInt(boothId)); res.json({ success: true, action: 'added', favorites }); }
  else { favorites.splice(idx, 1); res.json({ success: true, action: 'removed', favorites }); }
});

// GET /api/favorites
app.get('/api/favorites', (req, res) => {
  const favBooths = mockBooths.filter(b => favorites.includes(b.id));
  res.json({ success: true, data: favBooths, ids: favorites });
});

// GET /api/categories
app.get('/api/categories', (req, res) => {
  const cats = [...new Set(mockBooths.map(b => b.category))];
  res.json({ success: true, data: cats });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎪 FestivalFood server running at http://localhost:${PORT}`);
  console.log(`   Site ID: site086`);
  console.log(`   Bugs: bug01(db-state), bug02(network-stale), bug03(security-authorization)`);
});
