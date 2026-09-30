import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9938;

app.use(cors());
app.use(express.json());

// Async Request Tracker
let requestSequenceCounter = 0;
const pendingRequests = new Map();

function trackAsyncRequest(endpoint, userId = 'user-001', payload = {}) {
  requestSequenceCounter++;
  const requestId = `req-${String(requestSequenceCounter).padStart(3, '0')}`;
  const record = {
    request_id: requestId,
    endpoint,
    status: 'pending',
    started_at: Date.now(),
    user_id: userId,
    payload
  };
  pendingRequests.set(requestId, record);
  return record;
}

// ----------------------------------------------------
// Mock In-Memory Database
// ----------------------------------------------------
let users = [
  {
    id: 'user-001',
    name: '김서연',
    email: 'customer@example.com',
    role: 'VIP Member',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: '자연스러운 무드와 미니멀 라이프스타일을 사랑하는 홈 스타일러입니다.',
    points: 12500,
    coupons: 3,
    joinedAt: '2025-01-15'
  },
  {
    id: 'user-002',
    name: '이지훈',
    email: 'member@example.com',
    role: 'Standard Member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: '기능적이면서도 감각적인 일상 소품을 수집합니다.',
    points: 3200,
    coupons: 1,
    joinedAt: '2025-02-10'
  },
  {
    id: 'user-003',
    name: '박수아',
    email: 'shopper@example.com',
    role: 'Gold Member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: '식물과 함께하는 홈 인테리어 & 린넨 패브릭 매니아',
    points: 8900,
    coupons: 2,
    joinedAt: '2025-03-01'
  }
];

let currentUser = { ...users[0] };

let categories = [
  { id: 'fashion', name: '패션 & 웨어', icon: 'Shirt', count: 24 },
  { id: 'home', name: '홈 & 리빙', icon: 'Home', count: 38 },
  { id: 'beauty', name: '뷰티 & 바디케어', icon: 'Sparkles', count: 19 },
  { id: 'lifestyle', name: '라이프스타일', icon: 'Coffee', count: 32 },
  { id: 'travel', name: '여행 & 아웃도어', icon: 'Compass', count: 15 },
  { id: 'stationery', name: '문구 & 데스크', icon: 'BookOpen', count: 21 }
];

let products = [
  {
    id: 'product-101',
    name: '미니멀 세라믹 머그 350ml (웜베이지)',
    originalName: 'Minimal Ceramic Mug',
    brand: 'Daily Ceramic Lab',
    category: 'home',
    price: 24000,
    discountRate: 15,
    finalPrice: 20400,
    rating: 4.9,
    reviewCount: 128,
    stock: 45,
    isBest: true,
    isNew: false,
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80'
    ],
    description: '부드러운 무광 유약 처리와 은은한 베이지 톤으로 일상의 티타임을 더욱 아늑하게 만들어주는 핸드크래프트 머그입니다.',
    options: ['샌드 베이지', '포그 그레이', '올리브 그린']
  },
  {
    id: 'product-102',
    name: '헤비 캔버스 데일리 토트백',
    originalName: 'Daily Canvas Bag',
    brand: 'Raw Stitch Studio',
    category: 'fashion',
    price: 49000,
    discountRate: 10,
    finalPrice: 44100,
    rating: 4.8,
    reviewCount: 94,
    stock: 28,
    isBest: true,
    isNew: true,
    thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ],
    description: '16수 탄탄한 오가닉 코튼 캔버스로 제작되어 16인치 노트북과 텀블러를 넉넉하게 수납할 수 있는 데일리 백입니다.',
    options: ['내추럴 에크루', '차콜 블랙', '카키 브라운']
  },
  {
    id: 'product-103',
    name: '워시드 소프트 린넨 셔츠',
    originalName: 'Soft Linen Shirt',
    brand: 'Mellow Atelier',
    category: 'fashion',
    price: 68000,
    discountRate: 20,
    finalPrice: 54400,
    rating: 4.7,
    reviewCount: 65,
    stock: 19,
    isBest: false,
    isNew: true,
    thumbnail: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80'
    ],
    description: '프렌치 린넨 100% 소재로 통기성이 우수하며 자연스러운 구김이 멋스러운 루즈핏 린넨 셔츠입니다.',
    options: ['화이트', '스카이 블루', '소프트 올리브']
  },
  {
    id: 'product-104',
    name: '원목 데스크 오거나이저 & 트레이',
    originalName: 'Desk Organizer',
    brand: 'WoodCraft Seoul',
    category: 'stationery',
    price: 38000,
    discountRate: 0,
    finalPrice: 38000,
    rating: 4.9,
    reviewCount: 42,
    stock: 15,
    isBest: false,
    isNew: false,
    thumbnail: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&auto=format&fit=crop&q=80'
    ],
    description: '북미산 월넛 원목을 깎아 만든 데스크 오거나이저로 펜, 명함, 스마트폰을 깔끔하게 정리해 줍니다.',
    options: ['월넛', '오크']
  },
  {
    id: 'product-105',
    name: '포터블 무드 램프 (충전식 LED)',
    originalName: 'Portable Lamp',
    brand: 'Lumi Glow',
    category: 'home',
    price: 79000,
    discountRate: 25,
    finalPrice: 59250,
    rating: 4.8,
    reviewCount: 112,
    stock: 30,
    isBest: true,
    isNew: false,
    thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    description: '3단계 밝기 조절과 은은한 웜 라이트를 지원하는 휴대용 무선 램프로 캠핑 및 침실 무드등에 제격입니다.',
    options: ['매트 화이트', '테라코타 오렌지', '세이지 그린']
  },
  {
    id: 'product-106',
    name: '포레스트 우디 룸 스프레이 100ml',
    originalName: 'Home Scent Set',
    brand: 'Silence & Aroma',
    category: 'beauty',
    price: 32000,
    discountRate: 10,
    finalPrice: 28800,
    rating: 4.9,
    reviewCount: 78,
    stock: 50,
    isBest: false,
    isNew: true,
    thumbnail: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80'
    ],
    description: '새벽 편백나무 숲의 청량한 공기와 흙내음을 그대로 담은 천연 에센셜 오일 블렌딩 룸 스프레이입니다.',
    options: ['시더우드 포레스트', '무화과 리프', '라벤더 캄']
  },
  {
    id: 'product-107',
    name: '방수 패브릭 트래블 오거나이저 파우치',
    originalName: 'Travel Pouch',
    brand: 'Voyage Daily',
    category: 'travel',
    price: 26000,
    discountRate: 15,
    finalPrice: 22100,
    rating: 4.6,
    reviewCount: 53,
    stock: 40,
    isBest: false,
    isNew: false,
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
    ],
    description: '가벼운 나일론 방수 소재와 섹션별 분리 수납공간으로 여행 짐을 깔끔하게 정리해 줍니다.',
    options: ['샌드 베이지', '올리브', '다크 차콜']
  },
  {
    id: 'product-108',
    name: '위켄드 컴포트 캔버스 스니커즈',
    originalName: 'Weekend Sneakers',
    brand: 'Step On Sunday',
    category: 'fashion',
    price: 89000,
    discountRate: 18,
    finalPrice: 72980,
    rating: 4.8,
    reviewCount: 88,
    stock: 22,
    isBest: true,
    isNew: false,
    thumbnail: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80'
    ],
    description: '쿠셔닝 인솔과 유연한 고무 아웃솔로 하루 종일 신어도 발이 편안한 미니멀 디자인 스니커즈입니다.',
    options: ['크림 화이트', '빈티지 블랙', '웜 그레이']
  }
];

let cartItems = [
  {
    id: 'cart-item-1',
    productId: 'product-101',
    name: '미니멀 세라믹 머그 350ml (웜베이지)',
    option: '샌드 베이지',
    price: 20400,
    quantity: 2,
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cart-item-2',
    productId: 'product-102',
    name: '헤비 캔버스 데일리 토트백',
    option: '내추럴 에크루',
    price: 44100,
    quantity: 1,
    thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80'
  }
];

let orders = [
  {
    id: 'order-301',
    orderNumber: 'DP-20260920-1092',
    items: [
      { name: '포터블 무드 램프 (충전식 LED)', quantity: 1, price: 59250 }
    ],
    totalAmount: 59250,
    status: '배송 완료',
    orderedAt: '2026-09-20',
    trackingNumber: 'CJ대한통운 6482-9012-3411',
    address: '서울특별시 마포구 독막로 12길 8'
  },
  {
    id: 'order-302',
    orderNumber: 'DP-20260912-0842',
    items: [
      { name: '포레스트 우디 룸 스프레이 100ml', quantity: 2, price: 57600 }
    ],
    totalAmount: 57600,
    status: '배송 완료',
    orderedAt: '2026-09-12',
    trackingNumber: '우체국택배 7029-1120-9941',
    address: '서울특별시 마포구 독막로 12길 8'
  },
  {
    id: 'order-303',
    orderNumber: 'DP-20260828-0519',
    items: [
      { name: '원목 데스크 오거나이저 & 트레이', quantity: 1, price: 38000 }
    ],
    totalAmount: 38000,
    status: '배송 완료',
    orderedAt: '2026-08-28',
    trackingNumber: '한진택배 4192-3301-8820',
    address: '서울특별시 마포구 독막로 12길 8'
  }
];

let reservations = [
  {
    id: 'reservation-401',
    serviceTitle: '홈 스타일링 & 가구 배치 1:1 컨설팅',
    category: 'Home Styling',
    date: '2026-10-08',
    time: '14:00',
    people: 2,
    status: '예약 확정',
    memo: '거실과 서재 공간의 패브릭 톤 매칭 상담 희망합니다.',
    reservedAt: '2026-09-24'
  },
  {
    id: 'reservation-402',
    serviceTitle: '주말 세라믹 핸드빌딩 도예 워크숍',
    category: 'Craft Workshop',
    date: '2026-10-15',
    time: '11:00',
    people: 1,
    status: '예약 확정',
    memo: '머그컵과 오벌 플레이트 제작 희망',
    reservedAt: '2026-09-22'
  },
  {
    id: 'reservation-403',
    serviceTitle: '가을 신규 컬렉션 프라이빗 쇼룸 프리뷰',
    category: 'VIP Preview',
    date: '2026-10-22',
    time: '16:30',
    people: 2,
    status: '대기중',
    memo: '성수 쇼룸 방문 예정',
    reservedAt: '2026-09-25'
  }
];

let files = [
  {
    id: 'file-501',
    name: 'interior_moodboard_2026.pdf',
    size: '4.2 MB',
    uploadedAt: '2026-09-24 15:30',
    description: '거실 홈스타일링 레퍼런스 무드보드 및 색상 가이드 문서',
    url: 'https://example.com/files/interior_moodboard.pdf'
  },
  {
    id: 'file-502',
    name: 'ceramic_plate_drawing.png',
    size: '1.8 MB',
    uploadedAt: '2026-09-22 11:15',
    description: '도예 워크숍용 세라믹 플레이트 커스텀 스케치 이미지',
    url: 'https://example.com/files/ceramic_plate.png'
  },
  {
    id: 'file-503',
    name: 'receipt_DP_20260920.pdf',
    size: '450 KB',
    uploadedAt: '2026-09-20 18:40',
    description: '주문번호 DP-20260920-1092 전자영수증',
    url: 'https://example.com/files/receipt.pdf'
  }
];

let comments = [
  {
    id: 'comment-601',
    productId: 'product-101',
    userName: '김서연',
    rating: 5,
    content: '무광 텍스처가 정말 고급스럽고 커피 온도가 오래 유지돼요! 다른 색상도 추가 구매할 예정입니다.',
    createdAt: '2026-09-21'
  },
  {
    id: 'comment-602',
    productId: 'product-101',
    userName: '이지훈',
    rating: 5,
    content: '손잡이 그립감이 너무 편안해요. 데스크에 올려두기만 해도 감성 넘칩니다.',
    createdAt: '2026-09-18'
  },
  {
    id: 'comment-603',
    productId: 'product-102',
    userName: '박수아',
    rating: 5,
    content: '원단이 정말 탄탄하고 어깨 스트랩이 굵어서 무거운 노트북 넣고 다녀도 어깨가 안 아파요.',
    createdAt: '2026-09-15'
  }
];

let inquiries = [
  {
    id: 'inquiry-701',
    title: '세라믹 머그 식기세척기 및 전자레인지 사용 가능 여부',
    content: '미니멀 세라믹 머그 제품을 전자레인지나 식기세척기에 넣고 돌려도 유약 손상이 없는지 문의드립니다.',
    category: '상품 문의',
    status: '답변 완료',
    answer: '안녕하세요 고객님, 데일리픽입니다. 본 제품은 1250도 고온 소성된 세라믹으로 전자레인지와 식기세척기 모두 안전하게 사용 가능합니다.',
    createdAt: '2026-09-23'
  },
  {
    id: 'inquiry-702',
    title: '쇼룸 방문 예약 일정 변경 문의',
    content: '10월 8일 예약된 홈스타일링 컨설팅 시간을 14시에서 16시로 변경할 수 있을까요?',
    category: '예약 문의',
    status: '검토중',
    answer: null,
    createdAt: '2026-09-25'
  }
];

let notifications = [
  {
    id: 'notification-801',
    title: '가을 신상품 라이프스타일 컬렉션 20% 할인 쿠폰 도착',
    message: '새로운 시즌을 맞아 홈 & 리빙 카테고리 전용 할인 쿠폰이 발급되었습니다.',
    read: false,
    createdAt: '10분 전'
  },
  {
    id: 'notification-802',
    title: '주문하신 상품이 안전하게 배송 완료되었습니다.',
    message: '포터블 무드 램프 상품이 문 앞에 배송되었습니다. 따뜻한 공간을 연출해보세요.',
    read: true,
    createdAt: '2일 전'
  }
];

let searchHistory = [
  { id: 'search-901', query: '세라믹 머그', searchedAt: '2026-09-26 11:20' },
  { id: 'search-902', query: '린넨 셔츠', searchedAt: '2026-09-25 19:40' },
  { id: 'search-903', query: '무드등', searchedAt: '2026-09-24 14:15' }
];

// ----------------------------------------------------
// Health Check Endpoint (Required)
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    siteId: 'site039'
  });
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    user: currentUser,
    categories,
    featuredProducts: products.filter(p => p.isBest),
    newProducts: products.filter(p => p.isNew),
    cartCount: cartItems.length,
    recentOrders: orders.slice(0, 2),
    reservations: reservations.slice(0, 2)
  });
});

// ----------------------------------------------------
// Authentication APIs
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, user: currentUser, token: 'mock-jwt-token-site039' });
});

app.post('/api/auth/register', (req, res) => {
  res.status(201).json({ success: true, user: currentUser });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ----------------------------------------------------
// 1. Product Search API (SEC-361 / site039-bug01)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site039-bug01 / SEC-361
// Async search request remains pending without meaningful UI feedback
// or a cancellation path.
app.get('/api/search', (req, res) => {
  const { q = '', delay = 0 } = req.query;
  const track = trackAsyncRequest('/api/search', currentUser.id, { q });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(String(q).toLowerCase()) ||
    p.description.toLowerCase().includes(String(q).toLowerCase()) ||
    p.brand.toLowerCase().includes(String(q).toLowerCase()) ||
    p.category.toLowerCase().includes(String(q).toLowerCase())
  );

  res.json({
    success: true,
    bugId: 'site039-bug01',
    secId: 'SEC-361',
    request_id: track.request_id,
    query: q,
    results: filtered,
    total: filtered.length
  });
});

app.post('/api/search', (req, res) => {
  const { q = '' } = req.body;
  const track = trackAsyncRequest('/api/search', currentUser.id, { q });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(String(q).toLowerCase()) ||
    p.brand.toLowerCase().includes(String(q).toLowerCase())
  );

  res.json({
    success: true,
    bugId: 'site039-bug01',
    secId: 'SEC-361',
    request_id: track.request_id,
    query: q,
    results: filtered,
    total: filtered.length
  });
});

app.get('/api/search/history', (req, res) => {
  res.json(searchHistory);
});

// ----------------------------------------------------
// 2. Profile Bio API (SEC-362 / site039-bug02)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site039-bug02 / SEC-362
// Async profile bio save request remains pending without meaningful UI feedback
// or a cancellation path.
app.get('/api/profile', (req, res) => {
  res.json(currentUser);
});

app.put('/api/profile', (req, res) => {
  currentUser = { ...currentUser, ...req.body };
  res.json({ success: true, user: currentUser });
});

app.post('/api/profile/bio', (req, res) => {
  const { bio } = req.body;
  const track = trackAsyncRequest('/api/profile/bio', currentUser.id, { bio });

  if (bio !== undefined) {
    currentUser.bio = bio;
  }

  res.json({
    success: true,
    bugId: 'site039-bug02',
    secId: 'SEC-362',
    request_id: track.request_id,
    user: currentUser
  });
});

app.put('/api/profile/bio', (req, res) => {
  const { bio } = req.body;
  const track = trackAsyncRequest('/api/profile/bio', currentUser.id, { bio });

  if (bio !== undefined) {
    currentUser.bio = bio;
  }

  res.json({
    success: true,
    bugId: 'site039-bug02',
    secId: 'SEC-362',
    request_id: track.request_id,
    user: currentUser
  });
});

// ----------------------------------------------------
// 3. Inquiries API (SEC-363 / site039-bug03)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site039-bug03 / SEC-363
// Async customer inquiry submission request remains pending without UI feedback
// or a cancellation path.
app.get('/api/inquiries', (req, res) => {
  res.json(inquiries);
});

app.post('/api/inquiries', (req, res) => {
  const { title, content, category = '일반 문의' } = req.body;
  const track = trackAsyncRequest('/api/inquiries', currentUser.id, { title, content, category });

  const newInq = {
    id: `inquiry-${String(inquiries.length + 701)}`,
    title: title || '새로운 고객 문의',
    content: content || '문의 내용',
    category,
    status: '접수 완료',
    answer: null,
    createdAt: new Date().toISOString().substring(0, 10)
  };

  inquiries.unshift(newInq);

  res.status(201).json({
    success: true,
    bugId: 'site039-bug03',
    secId: 'SEC-363',
    request_id: track.request_id,
    inquiry: newInq
  });
});

// ----------------------------------------------------
// 4. Product Name Validation (SEC-364 / site039-bug04)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site039-bug04 / SEC-364
// Async product name validation request remains pending without feedback
// or a cancellation path.
app.post('/api/products/name/validate', (req, res) => {
  const { name = '' } = req.body;
  const track = trackAsyncRequest('/api/products/name/validate', currentUser.id, { name });

  const exists = products.some(p => p.name.toLowerCase() === name.toLowerCase());

  res.json({
    success: true,
    bugId: 'site039-bug04',
    secId: 'SEC-364',
    request_id: track.request_id,
    name,
    valid: !exists && name.trim().length >= 2,
    message: exists ? '이미 등록된 상품명입니다.' : '사용 가능한 상품명입니다.'
  });
});

// ----------------------------------------------------
// 5. File Description API (SEC-365 / site039-bug05)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site039-bug05 / SEC-365
// Async file description save request remains pending without UI feedback
// or a cancellation path.
app.get('/api/files', (req, res) => {
  res.json(files);
});

app.post('/api/files', (req, res) => {
  const { name = 'uploaded_file.png', size = '1.2 MB', description = '' } = req.body;
  const newFile = {
    id: `file-${String(files.length + 501)}`,
    name,
    size,
    uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    description,
    url: 'https://example.com/files/' + encodeURIComponent(name)
  };
  files.unshift(newFile);
  res.status(201).json({ success: true, file: newFile });
});

app.post('/api/files/description', (req, res) => {
  const { fileId, description } = req.body;
  const track = trackAsyncRequest('/api/files/description', currentUser.id, { fileId, description });

  const f = files.find(item => item.id === fileId);
  if (f && description !== undefined) {
    f.description = description;
  }

  res.json({
    success: true,
    bugId: 'site039-bug05',
    secId: 'SEC-365',
    request_id: track.request_id,
    file: f
  });
});

// ----------------------------------------------------
// 6. Product Comments API (SEC-366 / site039-bug06)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site039-bug06 / SEC-366
// Async product comment submission request remains pending without feedback
// or a cancellation path.
app.get('/api/products/:productId/comments', (req, res) => {
  const filtered = comments.filter(c => c.productId === req.params.productId);
  res.json(filtered);
});

app.post('/api/products/:productId/comments', (req, res) => {
  const { productId } = req.params;
  const { content, rating = 5 } = req.body;
  const track = trackAsyncRequest(`/api/products/${productId}/comments`, currentUser.id, { productId, content, rating });

  const newComment = {
    id: `comment-${String(comments.length + 601)}`,
    productId,
    userName: currentUser.name,
    rating: Number(rating),
    content: content || '만족스러운 상품입니다.',
    createdAt: new Date().toISOString().substring(0, 10)
  };

  comments.unshift(newComment);

  res.status(201).json({
    success: true,
    bugId: 'site039-bug06',
    secId: 'SEC-366',
    request_id: track.request_id,
    comment: newComment
  });
});

// ----------------------------------------------------
// 7. Reservation Memo API (SEC-367 / site039-bug07)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site039-bug07 / SEC-367
// Async reservation memo update request remains pending without UI feedback
// or a cancellation path.
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

app.get('/api/reservations/:reservationId', (req, res) => {
  const r = reservations.find(item => item.id === req.params.reservationId);
  if (!r) return res.status(404).json({ error: 'Reservation not found' });
  res.json(r);
});

app.post('/api/reservations/:reservationId/memo', (req, res) => {
  const { reservationId } = req.params;
  const { memo } = req.body;
  const track = trackAsyncRequest(`/api/reservations/${reservationId}/memo`, currentUser.id, { reservationId, memo });

  const resv = reservations.find(r => r.id === reservationId);
  if (resv && memo !== undefined) {
    resv.memo = memo;
  }

  res.json({
    success: true,
    bugId: 'site039-bug07',
    secId: 'SEC-367',
    request_id: track.request_id,
    reservation: resv
  });
});

// ----------------------------------------------------
// 8. Cart Items API (SEC-368 / site039-bug08)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site039-bug08 / SEC-368
// Async cart add request remains pending without meaningful UI feedback
// or a cancellation path.
app.get('/api/cart', (req, res) => {
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({
    items: cartItems,
    count: cartItems.length,
    subtotal: totalAmount,
    shippingFee: totalAmount >= 50000 ? 0 : 3000,
    total: totalAmount + (totalAmount >= 50000 ? 0 : 3000)
  });
});

app.post('/api/cart/items', (req, res) => {
  const { productId, option, quantity = 1 } = req.body;
  const track = trackAsyncRequest('/api/cart/items', currentUser.id, { productId, option, quantity });

  const prod = products.find(p => p.id === productId);
  const existing = cartItems.find(item => item.productId === productId && item.option === option);

  if (existing) {
    existing.quantity += Number(quantity);
  } else if (prod) {
    cartItems.push({
      id: `cart-item-${Date.now()}`,
      productId,
      name: prod.name,
      option: option || (prod.options ? prod.options[0] : '기본 옵션'),
      price: prod.finalPrice || prod.price,
      quantity: Number(quantity),
      thumbnail: prod.thumbnail
    });
  }

  res.status(201).json({
    success: true,
    bugId: 'site039-bug08',
    secId: 'SEC-368',
    request_id: track.request_id,
    cart: cartItems
  });
});

app.put('/api/cart/items/:itemId', (req, res) => {
  const { quantity } = req.body;
  const item = cartItems.find(i => i.id === req.params.itemId);
  if (item && quantity !== undefined) {
    item.quantity = Number(quantity);
  }
  res.json({ success: true, items: cartItems });
});

app.delete('/api/cart/items/:itemId', (req, res) => {
  cartItems = cartItems.filter(i => i.id !== req.params.itemId);
  res.json({ success: true, items: cartItems });
});

// ----------------------------------------------------
// 9. Checkout & Payment API (SEC-369 / site039-bug09)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site039-bug09 / SEC-369
// Async checkout payment request remains pending without clear feedback
// or a cancellation path.
app.post('/api/checkout/payment', (req, res) => {
  const { address, recipient, phone, paymentMethod = '간편결제', items = cartItems } = req.body;
  const track = trackAsyncRequest('/api/checkout/payment', currentUser.id, { address, recipient, phone, paymentMethod });

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalAmount = subtotal + (subtotal >= 50000 ? 0 : 3000);

  const newOrder = {
    id: `order-${String(orders.length + 301)}`,
    orderNumber: `DP-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`,
    items: [...items],
    totalAmount,
    status: '결제 완료 (배송 준비중)',
    orderedAt: new Date().toISOString().substring(0, 10),
    trackingNumber: '배송 준비중',
    address: address || '서울특별시 마포구 독막로 12길 8',
    recipient: recipient || currentUser.name,
    paymentMethod
  };

  orders.unshift(newOrder);
  // Clear cart after order
  cartItems = [];

  res.status(201).json({
    success: true,
    bugId: 'site039-bug09',
    secId: 'SEC-369',
    request_id: track.request_id,
    order: newOrder
  });
});

// ----------------------------------------------------
// 10. Product Filter API (SEC-370 / site039-bug10)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site039-bug10 / SEC-370
// Async product filter request remains pending without UI feedback
// or a cancellation path.
app.get('/api/products/filter', (req, res) => {
  const { category, minPrice, maxPrice, sort = 'popular', isBest } = req.query;
  const track = trackAsyncRequest('/api/products/filter', currentUser.id, req.query);

  let filtered = [...products];

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (minPrice) {
    filtered = filtered.filter(p => p.finalPrice >= Number(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.finalPrice <= Number(maxPrice));
  }
  if (isBest === 'true') {
    filtered = filtered.filter(p => p.isBest);
  }

  if (sort === 'price-low') {
    filtered.sort((a, b) => a.finalPrice - b.finalPrice);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.finalPrice - a.finalPrice);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  res.json({
    success: true,
    bugId: 'site039-bug10',
    secId: 'SEC-370',
    request_id: track.request_id,
    filters: req.query,
    products: filtered,
    total: filtered.length
  });
});

app.post('/api/products/filter', (req, res) => {
  const { category, minPrice, maxPrice, sort = 'popular' } = req.body;
  const track = trackAsyncRequest('/api/products/filter', currentUser.id, req.body);

  let filtered = [...products];

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (minPrice) {
    filtered = filtered.filter(p => p.finalPrice >= Number(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.finalPrice <= Number(maxPrice));
  }

  res.json({
    success: true,
    bugId: 'site039-bug10',
    secId: 'SEC-370',
    request_id: track.request_id,
    filters: req.body,
    products: filtered,
    total: filtered.length
  });
});

// Standard Product APIs
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:productId', (req, res) => {
  const p = products.find(item => item.id === req.params.productId);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/orders/:orderId', (req, res) => {
  const o = orders.find(item => item.id === req.params.orderId);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  res.json(o);
});

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

// Serve frontend build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('DailyPick backend running. Use Vite dev server for frontend development.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[DailyPick Server] Running on http://localhost:${PORT}`);
  console.log(`[Health Check] http://localhost:${PORT}/api/health`);
});
