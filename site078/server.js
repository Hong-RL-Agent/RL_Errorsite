'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9407;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ──────────────────────────────────────────
// Mock DB
// ──────────────────────────────────────────

const mockTrucks = [
  {
    id: 1,
    name: '타코버스',
    category: '멕시칸',
    region: '강남',
    address: '강남구 테헤란로 152',
    // INTENTIONAL BUG: site078-bug02
    // CSV Error: 네트워크 위치 응답 누락
    // Type: network-missing-field
    // Description: 일부 푸드트럭 API 응답에서 lat 또는 lng 필드가 누락됨.
    // lat 및 lng 필드를 의도적으로 제거하여 위치 좌표가 응답에서 누락됨
    // data-bug-id="site078-bug02"
    openTime: '11:00',
    closeTime: '20:00',
    rating: 4.5,
    reviewCount: 128,
    image: 'truck1',
    description: '정통 멕시코 스타일의 타코와 부리또를 제공합니다.',
    phone: '010-1234-5678',
    tags: ['타코', '부리또', '매운맛']
  },
  {
    id: 2,
    name: '버거킹덤',
    category: '아메리칸',
    region: '홍대',
    address: '마포구 양화로 160',
    lat: 37.5563,
    lng: 126.9236,
    openTime: '10:00',
    closeTime: '22:00',
    rating: 4.2,
    reviewCount: 95,
    image: 'truck2',
    description: '수제 패티로 만든 프리미엄 버거 전문 푸드트럭.',
    phone: '010-2345-6789',
    tags: ['버거', '감자튀김', '쉐이크']
  },
  {
    id: 3,
    name: '스시롤링',
    category: '일식',
    region: '이태원',
    address: '용산구 이태원로 177',
    lat: 37.5340,
    lng: 126.9947,
    openTime: '12:00',
    closeTime: '21:00',
    rating: 4.7,
    reviewCount: 210,
    image: 'truck3',
    description: '신선한 재료로 만드는 스시 롤과 라멘.',
    phone: '010-3456-7890',
    tags: ['스시', '라멘', '일식']
  },
  {
    id: 4,
    name: '피자파이어',
    category: '이탈리안',
    region: '강남',
    address: '서초구 강남대로 373',
    // INTENTIONAL BUG: site078-bug02 (second occurrence - lng 누락)
    // lat은 있지만 lng가 의도적으로 빠져 있음
    // data-bug-id="site078-bug02"
    lat: 37.4979,
    openTime: '11:30',
    closeTime: '21:30',
    rating: 4.3,
    reviewCount: 76,
    image: 'truck4',
    description: '화덕에서 구운 나폴리 스타일 피자.',
    phone: '010-4567-8901',
    tags: ['피자', '파스타', '이탈리안']
  },
  {
    id: 5,
    name: '커리하우스',
    category: '인도',
    region: '신촌',
    address: '서대문구 신촌로 83',
    lat: 37.5596,
    lng: 126.9370,
    openTime: '11:00',
    closeTime: '20:30',
    rating: 4.6,
    reviewCount: 154,
    image: 'truck5',
    description: '정통 인도 향신료로 만든 커리와 난.',
    phone: '010-5678-9012',
    tags: ['커리', '난', '인도음식']
  },
  {
    id: 6,
    name: '크레페마을',
    category: '프렌치',
    region: '홍대',
    address: '마포구 홍익로 6',
    lat: 37.5571,
    lng: 126.9257,
    openTime: '09:00',
    closeTime: '18:00',
    rating: 4.4,
    reviewCount: 88,
    image: 'truck6',
    description: '달콤하고 고소한 프랑스식 크레페.',
    phone: '010-6789-0123',
    tags: ['크레페', '디저트', '카페']
  }
];

const mockMenus = {
  1: [
    { id: 101, name: '클래식 타코', price: 5500, description: '소고기 타코 2개', popular: true },
    { id: 102, name: '치킨 부리또', price: 8000, description: '치킨과 살사 가득', popular: false },
    { id: 103, name: '과카몰리 나초', price: 6000, description: '홈메이드 과카몰리', popular: true }
  ],
  2: [
    { id: 201, name: '스모키 버거', price: 9500, description: '훈제 패티 버거', popular: true },
    { id: 202, name: '치즈버거 세트', price: 12000, description: '버거+감튀+음료', popular: false },
    { id: 203, name: '크리스피 치킨 버거', price: 8500, description: '바삭한 치킨 버거', popular: true }
  ],
  3: [
    { id: 301, name: '연어 롤', price: 11000, description: '신선한 연어 8pc', popular: true },
    { id: 302, name: '쇼유 라멘', price: 9000, description: '진한 간장 베이스', popular: false },
    { id: 303, name: '참치 스시 세트', price: 15000, description: '참치 8종 스시', popular: true }
  ],
  4: [
    { id: 401, name: '마르게리따', price: 13000, description: '토마토 모짜렐라', popular: true },
    { id: 402, name: '페퍼로니 피자', price: 14000, description: '매콤한 페퍼로니', popular: false },
    { id: 403, name: '까르보나라 파스타', price: 10000, description: '크리미 파스타', popular: true }
  ],
  5: [
    { id: 501, name: '버터 치킨 커리', price: 9500, description: '부드러운 토마토 커리', popular: true },
    { id: 502, name: '갈릭 난', price: 3000, description: '마늘 버터 난', popular: false },
    { id: 503, name: '사그 파니르', price: 8500, description: '시금치 치즈 커리', popular: true }
  ],
  6: [
    { id: 601, name: '누텔라 크레페', price: 5000, description: '달달한 누텔라 크레페', popular: true },
    { id: 602, name: '딸기 크림 크레페', price: 5500, description: '생딸기와 생크림', popular: true },
    { id: 603, name: '햄치즈 크레페', price: 6000, description: '고소한 햄치즈', popular: false }
  ]
};

let mockFavorites = [2, 5];

let mockReviews = [
  { id: 1, truckId: 1, author: '맛집헌터', rating: 5, content: '타코 너무 맛있어요! 또 방문할게요.', date: '2026-04-28', avatar: 'A' },
  { id: 2, truckId: 2, author: '버거러버', rating: 4, content: '패티가 정말 두툼하고 맛있습니다.', date: '2026-04-29', avatar: 'B' },
  { id: 3, truckId: 3, author: '스시마니아', rating: 5, content: '연어가 신선해서 최고예요.', date: '2026-04-30', avatar: 'C' }
];

let reviewIdCounter = 4;

// ──────────────────────────────────────────
// Helper: 현재 영업 여부 판단 (정상 로직 기준)
// ──────────────────────────────────────────
function isOpenNow_correct(truck) {
  const now = new Date();
  const [openH, openM] = truck.openTime.split(':').map(Number);
  const [closeH, closeM] = truck.closeTime.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

// INTENTIONAL BUG: site078-bug01
// CSV Error: DB 영업시간 비교 오류
// Type: database-date-query
// Description: 영업 종료된 푸드트럭도 영업중으로 반환됨.
// closeTime 비교 시 '<' 대신 '<='를 사용해야 하지만,
// 실제로는 현재 시각을 문자열 기반으로 비교하여 시간 순서가 잘못 판단됨.
// 예: "21:00" > "09:30" 이 문자열 비교로는 올바르나,
// "09:00" close인 트럭을 "9:00" 비교 시 두 자리 패딩이 없어 오류 발생.
function isOpenNow_buggy(truck) {
  // data-bug-id="site078-bug01"
  // 문자열 기반 시간 비교: HH:MM 포맷이 아닌 경우 잘못된 결과 반환
  const nowStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  // 문자열 비교이므로 "09:00" vs "9:00" 등의 포맷 불일치 시 오류,
  // 또한 closeTime을 '<=' 대신 '<' 로 비교해야 하나 현재는 그냥 openTime <= now로만 체크
  return truck.openTime <= nowStr; // closeTime 비교 누락 → 영업 종료 후에도 영업중으로 반환
}

// ──────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site078', name: 'FoodTruck Map', port: PORT, timestamp: new Date().toISOString() });
});

// GET /api/trucks - 푸드트럭 목록 (bug01, bug02 포함)
app.get('/api/trucks', (req, res) => {
  const { region, open, sort, q } = req.query;

  let trucks = mockTrucks.map(truck => {
    // bug01: 잘못된 영업 여부 판단 사용
    const isOpen = isOpenNow_buggy(truck);

    // bug02: lat/lng 누락된 truck 객체를 그대로 반환 (mock DB에서 필드 자체가 없음)
    return {
      ...truck,
      isOpen
    };
  });

  // 지역 필터
  if (region && region !== 'all') {
    trucks = trucks.filter(t => t.region === region);
  }

  // 영업중 필터
  if (open === 'true') {
    trucks = trucks.filter(t => t.isOpen);
  }

  // 검색
  if (q) {
    const query = q.toLowerCase();
    trucks = trucks.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.region.toLowerCase().includes(query) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }

  // 정렬
  if (sort === 'rating') {
    trucks.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'reviews') {
    trucks.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sort === 'name') {
    trucks.sort((a, b) => a.name.localeCompare(b.name));
  }

  res.json({ success: true, data: trucks, total: trucks.length });
});

// GET /api/menus/:truckId
app.get('/api/menus/:truckId', (req, res) => {
  const truckId = parseInt(req.params.truckId);
  const menus = mockMenus[truckId];
  if (!menus) {
    return res.status(404).json({ success: false, message: '메뉴 정보를 찾을 수 없습니다.' });
  }
  res.json({ success: true, data: menus, truckId });
});

// GET /api/favorites
app.get('/api/favorites', (req, res) => {
  const favTrucks = mockTrucks.filter(t => mockFavorites.includes(t.id));
  res.json({ success: true, data: favTrucks, ids: mockFavorites });
});

// POST /api/favorites/toggle
app.post('/api/favorites/toggle', (req, res) => {
  const { truckId } = req.body;
  if (!truckId) return res.status(400).json({ success: false, message: 'truckId 필요' });
  const idx = mockFavorites.indexOf(truckId);
  if (idx === -1) {
    mockFavorites.push(truckId);
    res.json({ success: true, action: 'added', favorites: mockFavorites });
  } else {
    mockFavorites.splice(idx, 1);
    res.json({ success: true, action: 'removed', favorites: mockFavorites });
  }
});

// GET /api/reviews/:truckId
app.get('/api/reviews/:truckId', (req, res) => {
  const truckId = parseInt(req.params.truckId);
  const reviews = mockReviews.filter(r => r.truckId === truckId);
  res.json({ success: true, data: reviews, total: reviews.length });
});

// POST /api/reviews - INTENTIONAL BUG: site078-bug03
// CSV Error: 리뷰 작성 인증 누락
// Type: security-authentication
// Description: 인증 없이 리뷰 작성 API 호출 가능.
// Authorization 헤더 또는 세션 검증 없이 누구나 리뷰를 작성할 수 있음.
app.post('/api/reviews', (req, res) => {
  // data-bug-id="site078-bug03"
  // 인증 미들웨어 또는 토큰 검증 로직이 완전히 누락됨.
  // 정상적으로는 req.headers.authorization 확인 후 유효한 사용자만 허용해야 함.
  const { truckId, author, rating, content } = req.body;

  if (!truckId || !author || !rating || !content) {
    return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: '평점은 1~5 사이여야 합니다.' });
  }

  const newReview = {
    id: reviewIdCounter++,
    truckId: parseInt(truckId),
    author,
    rating: parseInt(rating),
    content,
    date: new Date().toISOString().split('T')[0],
    avatar: author.charAt(0).toUpperCase()
  };
  mockReviews.push(newReview);
  res.status(201).json({ success: true, data: newReview });
});

// GET /api/regions
app.get('/api/regions', (req, res) => {
  const regions = [...new Set(mockTrucks.map(t => t.region))];
  res.json({ success: true, data: regions });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚚 FoodTruck Map server running at http://localhost:${PORT}`);
  console.log(`   Site ID: site078`);
  console.log(`   Intentional bugs: bug01 (DB date-query), bug02 (network-missing-field), bug03 (security-authentication)`);
});
