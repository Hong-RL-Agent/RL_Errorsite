'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9411;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════
// Mock DB
// ══════════════════════════════════════════

// INTENTIONAL BUG: site082-bug01
// CSV Error: DB 날짜 정렬 오류
// Type: database-sort
// Description: 날짜 문자열 정렬로 마켓 순서가 잘못 표시됨.
// sort=date 요청 시 Date 객체 비교가 아닌 문자열 비교(localeCompare)를 사용.
// 예: "2026-9-5" < "2026-10-1" 이 문자열로는 역전됨 (9 > 1).
// 실제 데이터에서는 MM-DD 두 자리 패딩이 없는 경우 오류가 발생함.
// data-bug-id="site082-bug01"
const mockMarkets = [
  {
    id: 1, name: '망원 한강 플리마켓',
    region: '마포', district: '망원동',
    date: '2026-05-10',   // YYYY-MM-DD (패딩 있음 → 문자열 비교도 우연히 맞음)
    time: '10:00~17:00',
    // INTENTIONAL BUG: site082-bug02
    // CSV Error: 네트워크 위치 데이터 손상
    // Type: network-partial-response
    // Description: 일부 마켓 응답에서 좌표 정보가 null로 반환됨.
    // id:1, id:4 의 lat/lng를 의도적으로 null로 설정.
    // data-bug-id="site082-bug02"
    lat: null, lng: null,
    address: '서울 마포구 망원동 한강공원 내',
    fee: 5000, capacity: 60, registered: 45,
    organizer: 'market_org1', emoji: '🛍️',
    tags: ['빈티지', '소품', '먹거리'],
    description: '한강변의 낭만적인 플리마켓. 빈티지 소품과 수제 먹거리 위주.',
    status: 'open', rating: 4.6, reviewCount: 34
  },
  {
    id: 2, name: '홍대 인디마켓',
    region: '마포', district: '홍대',
    date: '2026-5-3',   // 패딩 없는 날짜 → 문자열 정렬 오류 유발 (bug01)
    time: '12:00~19:00',
    lat: 37.5563, lng: 126.9236,
    address: '서울 마포구 홍익로 연트럴파크',
    fee: 3000, capacity: 40, registered: 40,
    organizer: 'market_org2', emoji: '🎨',
    tags: ['예술', '핸드메이드', '음악'],
    description: '인디 아티스트들의 핸드메이드 작품과 공연이 함께하는 마켓.',
    status: 'closed', rating: 4.8, reviewCount: 61
  },
  {
    id: 3, name: '이태원 글로벌 빈티지',
    region: '용산', district: '이태원',
    date: '2026-05-17',
    time: '11:00~18:00',
    lat: 37.5340, lng: 126.9947,
    address: '서울 용산구 이태원로 175',
    fee: 0, capacity: 80, registered: 32,
    organizer: 'market_org3', emoji: '🌍',
    tags: ['빈티지', '의류', '글로벌'],
    description: '다국적 셀러들의 빈티지 의류와 소품 마켓. 입장 무료.',
    status: 'open', rating: 4.4, reviewCount: 28
  },
  {
    id: 4, name: '성수 감성 수공예',
    region: '성동', district: '성수동',
    date: '2026-9-20',  // 패딩 없음 → 문자열 정렬 오류 (bug01)
    time: '10:00~16:00',
    lat: null, lng: null,  // bug02: 좌표 null
    address: '서울 성동구 성수동2가 공장길',
    fee: 2000, capacity: 50, registered: 18,
    organizer: 'market_org4', emoji: '🪡',
    tags: ['수공예', '도자기', '가죽'],
    description: '성수의 공방 작가들이 모이는 수공예 특화 마켓.',
    status: 'open', rating: 4.7, reviewCount: 22
  },
  {
    id: 5, name: '강남 리사이클 그린마켓',
    region: '강남', district: '강남구',
    date: '2026-05-24',
    time: '09:00~15:00',
    lat: 37.4979, lng: 127.0276,
    address: '서울 강남구 테헤란로 삼성공원',
    fee: 1000, capacity: 100, registered: 67,
    organizer: 'market_org5', emoji: '♻️',
    tags: ['친환경', '리사이클', '식물'],
    description: '친환경 제품과 리사이클 아이템 전문 그린마켓.',
    status: 'open', rating: 4.3, reviewCount: 45
  },
  {
    id: 6, name: '건대 야시장 플리',
    region: '광진', district: '건대입구',
    date: '2026-10-5',  // 패딩 없음 → 문자열 정렬 오류 (bug01)
    time: '17:00~22:00',
    lat: 37.5403, lng: 127.0695,
    address: '서울 광진구 화양동 건대입구역 광장',
    fee: 0, capacity: 120, registered: 89,
    organizer: 'market_org6', emoji: '🌙',
    tags: ['야시장', '먹거리', '야간'],
    description: '저녁에 열리는 건대 야시장. 먹거리와 소품 가득.',
    status: 'open', rating: 4.5, reviewCount: 52
  }
];

const mockItems = {
  1: ['빈티지 도자기', '린넨 파우치', '수제 캔들', '드라이플라워', '빈티지 엽서'],
  2: ['핸드페인팅 에코백', '수채화 엽서', '독립출판 책', '직접 제작 액세서리', '인디밴드 CD'],
  3: ['해외 빈티지 재킷', '빈티지 청바지', '캐나다구스 빈티지', '오버사이즈 니트', '빈티지 가방'],
  4: ['핸드빌드 도자기', '가죽 카드지갑', '마크라메 벽걸이', '천연염색 스카프', '나무 수저 세트'],
  5: ['재생 소재 토트백', '화분 + 다육이', '천연 비누', '업사이클링 소품', '유리컵 테라리움'],
  6: ['떡볶이', '타코', '크레페', '수제 버거', '빈티지 소품', '야광 스티커']
};

let mockApplications = [
  { id: 1, marketId: 3, userId: 'user_A', items: '빈티지 의류 20벌', status: 'approved', createdAt: '2026-05-01' },
  { id: 2, marketId: 5, userId: 'user_B', items: '다육이 화분 30개', status: 'pending', createdAt: '2026-05-02' }
];
let appIdCounter = 3;

let mockReviews = [
  { id: 1, marketId: 1, author: 'flea_lover', rating: 5, content: '한강뷰 보면서 쇼핑하니까 너무 좋았어요!', date: '2026-04-28' },
  { id: 2, marketId: 2, author: 'indie_fan', rating: 5, content: '아티스트 직접 만나서 작품 살 수 있어 최고!', date: '2026-04-20' },
  { id: 3, marketId: 5, author: 'eco_life', rating: 4, content: '친환경 제품 종류가 정말 다양해요.', date: '2026-05-01' }
];
let reviewIdCounter = 4;

let favorites = [1, 3];

// ══════════════════════════════════════════
// API Routes
// ══════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site082', name: 'GarageSale Map', port: PORT, timestamp: new Date().toISOString() });
});

// GET /api/markets
app.get('/api/markets', (req, res) => {
  const { region, status, sort, q } = req.query;
  let markets = [...mockMarkets];

  if (region && region !== 'all') markets = markets.filter(m => m.region === region);
  if (status && status !== 'all') markets = markets.filter(m => m.status === status);
  if (q) {
    const query = q.toLowerCase();
    markets = markets.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.district.toLowerCase().includes(query) ||
      m.tags.some(t => t.toLowerCase().includes(query))
    );
  }

  if (sort === 'date') {
    // data-bug-id="site082-bug01"
    // 문자열 localeCompare 정렬 — "2026-9-20" vs "2026-10-5" 순서 역전
    // 정상: (a, b) => new Date(a.date) - new Date(b.date)
    markets.sort((a, b) => a.date.localeCompare(b.date));
  } else if (sort === 'rating') {
    markets.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'popular') {
    markets.sort((a, b) => b.registered - a.registered);
  }

  // bug02: lat/lng가 null인 마켓을 그대로 반환 (별도 처리 없음)
  res.json({ success: true, data: markets, total: markets.length });
});

// GET /api/markets/:id
app.get('/api/markets/:id', (req, res) => {
  const market = mockMarkets.find(m => m.id === parseInt(req.params.id));
  if (!market) return res.status(404).json({ success: false, message: '마켓을 찾을 수 없습니다.' });
  res.json({ success: true, data: market });
});

// GET /api/items/:marketId
app.get('/api/items/:marketId', (req, res) => {
  const marketId = parseInt(req.params.marketId);
  const items = mockItems[marketId] || [];
  res.json({ success: true, data: items, marketId });
});

// POST /api/applications
// INTENTIONAL BUG: site082-bug03
// CSV Error: 참가 신청 인증 우회
// Type: security-authentication
// Description: x-user-id 헤더만 임의로 보내면 참가 신청 가능.
// 서버가 x-user-id 헤더를 그대로 신뢰하여 인증된 사용자로 처리함.
// JWT/세션 검증 없이 헤더 값만으로 신원 확인.
app.post('/api/applications', (req, res) => {
  // data-bug-id="site082-bug03"
  // x-user-id 헤더를 그대로 신뢰 — 위조 가능
  // 정상 코드: const userId = verifyJWT(req.headers.authorization);
  const userId = req.headers['x-user-id'] || 'anonymous';
  const { marketId, items } = req.body;

  if (!marketId || !items) return res.status(400).json({ success: false, message: '필수 필드 누락' });

  const newApp = {
    id: appIdCounter++,
    marketId: parseInt(marketId),
    userId,  // 위조된 userId가 그대로 저장됨
    items,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0]
  };
  mockApplications.push(newApp);
  res.status(201).json({ success: true, data: newApp });
});

// GET /api/applications
app.get('/api/applications', (req, res) => {
  res.json({ success: true, data: mockApplications });
});

// GET /api/reviews/:marketId
app.get('/api/reviews/:marketId', (req, res) => {
  const marketId = parseInt(req.params.marketId);
  const reviews = mockReviews.filter(r => r.marketId === marketId);
  res.json({ success: true, data: reviews, total: reviews.length });
});

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
  const { marketId, author, rating, content } = req.body;
  if (!marketId || !author || !rating || !content) {
    return res.status(400).json({ success: false, message: '필수 필드 누락' });
  }
  const newReview = {
    id: reviewIdCounter++,
    marketId: parseInt(marketId),
    author, rating: parseInt(rating), content,
    date: new Date().toISOString().split('T')[0]
  };
  mockReviews.push(newReview);
  res.status(201).json({ success: true, data: newReview });
});

// POST /api/favorites/toggle
app.post('/api/favorites/toggle', (req, res) => {
  const { marketId } = req.body;
  if (!marketId) return res.status(400).json({ success: false, message: 'marketId 필요' });
  const idx = favorites.indexOf(marketId);
  if (idx === -1) { favorites.push(marketId); res.json({ success: true, action: 'added', favorites }); }
  else { favorites.splice(idx, 1); res.json({ success: true, action: 'removed', favorites }); }
});

// GET /api/favorites
app.get('/api/favorites', (req, res) => {
  const fav = mockMarkets.filter(m => favorites.includes(m.id));
  res.json({ success: true, data: fav, ids: favorites });
});

// GET /api/regions
app.get('/api/regions', (req, res) => {
  const regions = [...new Set(mockMarkets.map(m => m.region))];
  res.json({ success: true, data: regions });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🛍️  GarageSale Map server running at http://localhost:${PORT}`);
  console.log(`   Site ID: site082`);
  console.log(`   Bugs: bug01(db-sort), bug02(network-partial), bug03(security-auth)`);
});
