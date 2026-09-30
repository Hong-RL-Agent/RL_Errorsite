import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9936;

app.use(cors());
app.use(express.json());

// Global Sequence & Transaction Counters
let requestSequenceCounter = 0;
let txCounters = {
  login: 0,
  register: 0,
  address: 0,
  coupon: 0,
  sort: 0,
  page: 0,
  filename: 0,
  chat: 0,
  notice: 0,
  review: 0,
  generic: 0
};

function generateTxId(type) {
  txCounters[type] = (txCounters[type] || 0) + 1;
  const num = String(txCounters[type]).padStart(3, '0');
  switch (type) {
    case 'login': return `LOGIN-TX-${num}`;
    case 'register': return `REGISTER-TX-${num}`;
    case 'address': return `ADDRESS-TX-${num}`;
    case 'coupon': return `COUPON-TX-${num}`;
    case 'sort': return `SORT-TX-${num}`;
    case 'page': return `PAGE-TX-${num}`;
    case 'filename': return `FILENAME-TX-${num}`;
    case 'chat': return `CHAT-TX-${num}`;
    case 'notice': return `NOTICE-TX-${num}`;
    case 'review': return `REVIEW-TX-${num}`;
    default: return `TX-${num}`;
  }
}

// In-Memory Database
let users = [
  {
    id: 'user-001',
    name: '김민지',
    email: 'minji@example.com',
    role: 'VIP Member',
    address: '서울특별시 마포구 월드컵북로 10',
    detailAddress: '101동 1204호',
    phone: '010-3342-8812',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    membershipPoints: 12500,
    joinedAt: '2025-02-10'
  },
  {
    id: 'user-002',
    name: '이도현',
    email: 'dohyun@example.com',
    role: 'Regular Member',
    address: '서울특별시 서초구 반포대로 58',
    detailAddress: '3층',
    phone: '010-9921-4431',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    membershipPoints: 4800,
    joinedAt: '2025-03-15'
  },
  {
    id: 'user-003',
    name: '박서준',
    email: 'seojun@example.com',
    role: 'Stage Artist',
    address: '서울특별시 종로구 대학로 120',
    detailAddress: '예술관 2호',
    phone: '010-5512-9901',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    membershipPoints: 32000,
    joinedAt: '2025-01-05'
  },
  {
    id: 'user-004',
    name: '정유나',
    email: 'yuna@example.com',
    role: 'Regular Member',
    address: '경기도 성남시 분당구 판교역로 166',
    detailAddress: '502호',
    phone: '010-7781-3321',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    membershipPoints: 8900,
    joinedAt: '2025-04-01'
  },
  {
    id: 'user-005',
    name: '최승우',
    email: 'seungwoo@example.com',
    role: 'Venue Admin',
    address: '서울특별시 중구 세종대로 110',
    detailAddress: '운영실 4층',
    phone: '010-1234-5678',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    membershipPoints: 99999,
    joinedAt: '2024-11-20'
  }
];

let currentUser = { ...users[0] };

let performances = [
  {
    id: 'performance-101',
    title: 'Moonlight Piano Concert',
    category: 'Classic',
    venue: '메인 그랜드 홀 (1,200석)',
    artist: '조성진 & 서울 필하모닉',
    date: '2026-05-15 ~ 2026-05-17',
    runningTime: '120분',
    rating: 4.9,
    reviewCount: 48,
    price: 88000,
    poster: 'https://images.unsplash.com/photo-1520523839898-50712743e9a7?w=600&auto=format&fit=crop&q=80',
    description: '달빛 아래 펼쳐지는 쇼팽과 드뷔시의 서정적인 피아노 선율, 봄밤의 깊은 감동을 선사합니다.',
    popularity: 98,
    status: 'booking'
  },
  {
    id: 'performance-102',
    title: 'Seoul Chamber Night',
    category: 'Orchestra',
    venue: '챔버 앙상블 홀 (450석)',
    artist: '서울 챔버 콰르텟',
    date: '2026-05-22 ~ 2026-05-24',
    runningTime: '100분',
    rating: 4.8,
    reviewCount: 32,
    price: 65000,
    poster: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    description: '정교한 하모니와 완벽한 호흡으로 완성되는 실내악의 진수, 하이든과 베토벤 현악 4중주 전곡 연주.',
    popularity: 85,
    status: 'booking'
  },
  {
    id: 'performance-103',
    title: 'Modern Dance Project',
    category: 'Dance',
    venue: '아방가르드 블랙박스 (300석)',
    artist: '국립현대무용단 프로젝트팀',
    date: '2026-06-05 ~ 2026-06-08',
    runningTime: '90분',
    rating: 4.7,
    reviewCount: 21,
    price: 55000,
    poster: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    description: '빛과 신체의 역동적인 교감을 통해 도시인의 고독과 희망을 그려낸 컨템포러리 무용 대작.',
    popularity: 79,
    status: 'booking'
  },
  {
    id: 'performance-104',
    title: 'Acoustic Summer',
    category: 'Live Acoustic',
    venue: '야외 원형 극장 (800석)',
    artist: '선우정아, 10CM, 폴킴',
    date: '2026-06-20 ~ 2026-06-21',
    runningTime: '150분',
    rating: 4.9,
    reviewCount: 65,
    price: 77000,
    poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    description: '선선한 초여름 밤바람과 함께 감미로운 어쿠스틱 사운드로 가득 채우는 야외 라이브 페스티벌.',
    popularity: 95,
    status: 'booking'
  },
  {
    id: 'performance-105',
    title: 'Theater Archive: 햄릿',
    category: 'Play',
    venue: '셰익스피어 전용관 (500석)',
    artist: '극단 산울림 & 명배우 앙상블',
    date: '2026-07-01 ~ 2026-07-15',
    runningTime: '140분',
    rating: 4.6,
    reviewCount: 19,
    price: 60000,
    poster: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=600&auto=format&fit=crop&q=80',
    description: '고전 비극의 현대적 재해석, 파격적인 무대 미장센과 압도적인 독백으로 되살아난 영혼의 서사시.',
    popularity: 72,
    status: 'upcoming'
  }
];

let exhibitions = [
  {
    id: 'exhibition-201',
    title: 'Light & Space: 몰입형 미디어아트',
    gallery: '제1 기획전시실',
    period: '2026-04-01 ~ 2026-07-31',
    artist: 'TeamLab & Collective Lux',
    price: 20000,
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    description: '초대형 3D 인터랙티브 프로젝션 맵핑으로 시각과 청각을 매료시키는 환상적인 빛의 정원.'
  },
  {
    id: 'exhibition-202',
    title: 'Urban Memory: 서울 100년의 풍경',
    gallery: '제2 역사사진 갤러리',
    period: '2026-03-15 ~ 2026-06-30',
    artist: '도시기록사진가 협회',
    price: 12000,
    poster: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=600&auto=format&fit=crop&q=80',
    description: '과거와 현재가 공존하는 서울의 건축과 골목길, 시민들의 생생한 삶의 궤적을 담은 아카이브 전시.'
  },
  {
    id: 'exhibition-203',
    title: 'Future Canvas: 생성형 AI와 현대 회화',
    gallery: '아카데미 현대아트홀',
    period: '2026-05-01 ~ 2026-08-15',
    artist: '글로벌 뉴미디어 아티스트 12인',
    price: 18000,
    poster: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&auto=format&fit=crop&q=80',
    description: '알고리즘과 인간 예술가의 협업으로 탄생한 미래형 유화, 조각, 그리고 가상공간 전시 프로젝트.'
  }
];

let programs = [
  {
    id: 'program-301',
    title: 'Beginner Piano Masterclass',
    instructor: '이지원 피아니스트',
    schedule: '매주 화, 목 19:00 - 20:30',
    capacity: 8,
    tuition: 150000,
    description: '성인 초심자를 위한 기초 클래식 피아노 테크닉 및 명곡 1곡 완성 단기 완성반.'
  },
  {
    id: 'program-302',
    title: 'Weekend Drawing Workshop',
    instructor: '정현우 일러스트레이터',
    schedule: '매주 토요일 14:00 - 17:00',
    capacity: 12,
    tuition: 120000,
    description: '공연장 무대 스케치 및 어반 드로잉 기법을 배우는 주말 예술 힐링 워크숍.'
  },
  {
    id: 'program-303',
    title: 'Stage Acting & Voice Training',
    instructor: '강민수 연극 연출가',
    schedule: '매주 수요일 19:30 - 21:30',
    capacity: 10,
    tuition: 180000,
    description: '발성과 발음, 무대 위 감정 표현과 자신감 넘치는 보이스 트레이닝 아카데미.'
  }
];

let reservations = [
  {
    id: 'reservation-401',
    userId: 'user-001',
    performanceId: 'performance-101',
    performanceTitle: 'Moonlight Piano Concert',
    venue: '메인 그랜드 홀',
    date: '2026-05-15',
    seat: 'R석 1층 B열 14번, 15번',
    ticketCount: 2,
    totalPrice: 176000,
    discountAmount: 17600,
    appliedCoupon: 'STAGE10',
    finalPrice: 158400,
    status: 'confirmed',
    createdAt: '2026-04-02 14:20:00'
  },
  {
    id: 'reservation-402',
    userId: 'user-001',
    performanceId: 'performance-104',
    performanceTitle: 'Acoustic Summer',
    venue: '야외 원형 극장',
    date: '2026-06-20',
    seat: '스탠딩 A구역 45번',
    ticketCount: 1,
    totalPrice: 77000,
    discountAmount: 0,
    appliedCoupon: null,
    finalPrice: 77000,
    status: 'confirmed',
    createdAt: '2026-04-05 10:15:00'
  }
];

let coupons = [
  { id: 'coupon-501', code: 'STAGE10', discountRate: 10, name: 'StageOn 그랜드 오픈 10% 할인쿠폰', minAmount: 30000, expiresAt: '2026-12-31' },
  { id: 'coupon-502', code: 'CULTURE20', discountRate: 20, name: '문화가 있는 날 특별 20% 할인권', minAmount: 50000, expiresAt: '2026-06-30' },
  { id: 'coupon-503', code: 'WELCOME5', discountRate: 5, name: '신규 가입 환영 5% 할인쿠폰', minAmount: 10000, expiresAt: '2026-12-31' }
];

let files = [
  { id: 'file-601', name: 'performance-guide.pdf', size: '3.2 MB', category: '관람안내', downloads: 142, updatedAt: '2026-03-20 11:30' },
  { id: 'file-602', name: 'stage-layout-grandhall.png', size: '5.8 MB', category: '무대배치도', downloads: 89, updatedAt: '2026-03-22 15:40' },
  { id: 'file-603', name: 'season-brochure-2026.pdf', size: '12.4 MB', category: '시즌북', downloads: 310, updatedAt: '2026-03-28 09:15' }
];

let chatRooms = [
  { id: 'room-701', name: 'Moonlight Piano 콘서트 관객 소통방', performanceId: 'performance-101', activeUsers: 48 },
  { id: 'room-702', name: 'Seoul Chamber Night 클래식 팬 라운지', performanceId: 'performance-102', activeUsers: 24 },
  { id: 'room-703', name: 'StageOn 자유 문화·공연 담소방', performanceId: 'general', activeUsers: 112 }
];

let chatMessages = {
  'room-701': [
    { id: 'msg-1', sender: '김민지', senderAvatar: users[0].avatar, text: '조성진 피아니스트 앙코르 곡 뭐 할지 너무 기대돼요!', time: '14:20' },
    { id: 'msg-2', sender: '이도현', senderAvatar: users[1].avatar, text: 'R석 1층 시야 어떤가요? 음향 밸런스 좋았으면 좋겠네요.', time: '14:25' }
  ],
  'room-702': [
    { id: 'msg-3', sender: '박서준', senderAvatar: users[2].avatar, text: '현악 4중주 베토벤 14번 악장별 해설 프로그램북 추천합니다.', time: '11:10' }
  ],
  'room-703': [
    { id: 'msg-4', sender: '정유나', senderAvatar: users[3].avatar, text: '야외 원형 극장 저녁에 모기 기피제 챙겨가면 좋아요!', time: '09:40' }
  ]
};

let notices = [
  {
    id: 'notice-801',
    title: '4월 공연장 지하 주차장 보수 공사 및 셔틀버스 운행 안내',
    category: '시설안내',
    author: '공연장 운영본부',
    content: '보다 쾌적한 주차 환경 조성을 위해 4월 한 달간 지하 2층 주차면 보수 공사를 진행합니다. 지하철 6호선 월드컵경기장역에서 10분 간격으로 무료 셔틀버스를 운행하오니 대중교통 이용을 권장합니다.',
    createdAt: '2026-04-01 09:00',
    views: 428
  },
  {
    id: 'notice-802',
    title: '2026년도 StageOn VIP 멤버십 혜택 개편 및 선예매 오픈 공지',
    category: '멤버십',
    author: '고객경험팀',
    content: 'VIP 회원을 위한 기획공연 24시간 선예매 서비스와 VIP 전용 라운지 무료 음료 쿠폰 혜택이 5월 1일부터 적용됩니다.',
    createdAt: '2026-03-25 14:30',
    views: 890
  },
  {
    id: 'notice-803',
    title: '봄 시즌 기획 전시 [Light & Space] 오디오 도슨트 앱 무료 배포',
    category: '전시안내',
    author: '전시기획팀',
    content: '배우 김민지 님의 감미로운 목소리로 녹음된 공식 오디오 도슨트 가이드 앱을 무료로 다운로드받아 감상하실 수 있습니다.',
    createdAt: '2026-03-20 10:15',
    views: 615
  }
];

let reviews = [
  {
    id: 'review-901',
    performanceId: 'performance-101',
    performanceTitle: 'Moonlight Piano Concert',
    author: '김민지',
    authorAvatar: users[0].avatar,
    rating: 5,
    content: '무대 연출과 조명이 피아노 선율과 완벽하게 어우러졌습니다. 인터미션 후 2부 쇼팽 발라드는 눈물이 날 정도로 아름다웠어요.',
    createdAt: '2026-04-02 22:30',
    likes: 24
  },
  {
    id: 'review-902',
    performanceId: 'performance-101',
    performanceTitle: 'Moonlight Piano Concert',
    author: '이도현',
    authorAvatar: users[1].avatar,
    rating: 5,
    content: '그랜드 홀의 어쿠스틱 음향이 최고였습니다. 다음 시즌 티켓도 무조건 예매할 생각입니다.',
    createdAt: '2026-04-03 11:15',
    likes: 18
  },
  {
    id: 'review-903',
    performanceId: 'performance-102',
    performanceTitle: 'Seoul Chamber Night',
    author: '정유나',
    authorAvatar: users[3].avatar,
    rating: 4,
    content: '실내악 특유의 친밀감과 앙상블의 호흡이 관객석까지 전해졌습니다. 프로그램 구성이 알찼어요.',
    createdAt: '2026-04-04 16:40',
    likes: 9
  }
];

let transactions = [
  {
    request_sequence: 1,
    idempotency_key: 'INIT-STAGEON-KEY-001',
    transaction_id: 'TX-INIT-001',
    type: 'system',
    actionName: '공연장 플랫폼 초기화 및 마스터 데이터 로드',
    user_id: 'user-001',
    status: 'completed',
    request_payload: { action: 'init' },
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

function recordTransaction({ type, actionName, idempotency_key, transaction_id, payload, userId = currentUser.id }) {
  requestSequenceCounter++;
  const record = {
    request_sequence: requestSequenceCounter,
    idempotency_key: idempotency_key || `AUTO-KEY-${Date.now()}`,
    transaction_id: transaction_id,
    type: type,
    actionName: actionName || type,
    user_id: userId,
    status: 'completed',
    request_payload: payload || {},
    created_at: new Date().toISOString()
  };
  transactions.unshift(record);
  return record;
}

// ----------------------------------------------------
// General & Health Check
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    siteId: 'site037'
  });
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    stats: {
      totalPerformances: performances.length,
      totalExhibitions: exhibitions.length,
      totalPrograms: programs.length,
      activeReservations: reservations.length,
      userPoints: currentUser.membershipPoints
    },
    featuredPerformances: performances.slice(0, 3),
    recentExhibitions: exhibitions.slice(0, 2),
    recentNotices: notices.slice(0, 3),
    recentReviews: reviews.slice(0, 3)
  });
});

// ----------------------------------------------------
// 1. Authentication Login (SEC-341 / site037-bug01)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site037-bug01 / SEC-341
// Idempotency key is not enforced for login requests.
// Repeating login with the same idempotency_key creates distinct LOGIN-TX-xxx transactions.
app.post('/api/auth/login', (req, res) => {
  const { email, password, idempotency_key } = req.body;
  const found = users.find(u => u.email === email) || users[0];
  currentUser = { ...found };

  const transaction_id = generateTxId('login');
  const tx = recordTransaction({
    type: 'login',
    actionName: `사용자 로그인: [${found.name} (${found.email})]`,
    idempotency_key,
    transaction_id,
    payload: { email }
  });

  res.json({
    success: true,
    bugId: 'site037-bug01',
    secId: 'SEC-341',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    user: currentUser,
    token: `mock-token-${Date.now()}`
  });
});

// ----------------------------------------------------
// 2. Authentication Register (SEC-342 / site037-bug02)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site037-bug02 / SEC-342
// Idempotency key is not checked on user registration.
// Duplicate requests with the same idempotency_key create new REGISTER-TX-xxx transactions.
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, idempotency_key } = req.body;

  const newUser = {
    id: `user-${String(users.length + 1).padStart(3, '0')}`,
    name: name || '신규 회원',
    email: email || `user${Date.now()}@example.com`,
    role: 'Regular Member',
    address: '서울특별시 마포구 양화로 100',
    detailAddress: '101호',
    phone: '010-0000-0000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    membershipPoints: 3000,
    joinedAt: new Date().toISOString().substring(0, 10)
  };
  users.push(newUser);
  currentUser = { ...newUser };

  const transaction_id = generateTxId('register');
  const tx = recordTransaction({
    type: 'register',
    actionName: `신규 회원가입: [${newUser.name} (${newUser.email})]`,
    idempotency_key,
    transaction_id,
    payload: { name, email }
  });

  res.status(201).json({
    success: true,
    bugId: 'site037-bug02',
    secId: 'SEC-342',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    user: newUser
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ----------------------------------------------------
// 3. Profile Address (SEC-343 / site037-bug03)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site037-bug03 / SEC-343
// Idempotency key is not enforced when saving user address.
// Duplicate submissions with the same key create multiple distinct ADDRESS-TX-xxx transactions.
app.get('/api/profile', (req, res) => {
  res.json(currentUser);
});

app.put('/api/profile', (req, res) => {
  const { name, phone } = req.body;
  if (name) currentUser.name = name;
  if (phone) currentUser.phone = phone;
  res.json(currentUser);
});

app.post('/api/profile/address', (req, res) => {
  const { address, detailAddress, idempotency_key } = req.body;
  if (address !== undefined) currentUser.address = address;
  if (detailAddress !== undefined) currentUser.detailAddress = detailAddress;

  const foundUser = users.find(u => u.id === currentUser.id);
  if (foundUser) {
    foundUser.address = currentUser.address;
    foundUser.detailAddress = currentUser.detailAddress;
  }

  const transaction_id = generateTxId('address');
  const tx = recordTransaction({
    type: 'address',
    actionName: `배송지/회원 주소 변경: [${address} ${detailAddress || ''}]`,
    idempotency_key,
    transaction_id,
    payload: { address, detailAddress }
  });

  res.json({
    success: true,
    bugId: 'site037-bug03',
    secId: 'SEC-343',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    profile: currentUser
  });
});

// ----------------------------------------------------
// 4. Coupons Apply (SEC-344 / site037-bug04)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site037-bug04 / SEC-344
// Idempotency key is not enforced for coupon application requests.
// Repeating coupon apply with the same key produces duplicate COUPON-TX-xxx transactions.
app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});

app.post('/api/coupons/apply', (req, res) => {
  const { reservationId, couponCode, idempotency_key } = req.body;
  const coupon = coupons.find(c => c.code === couponCode) || coupons[0];

  const reservation = reservations.find(r => r.id === reservationId);
  let discountAmount = 0;
  if (reservation && coupon) {
    discountAmount = Math.floor(reservation.totalPrice * (coupon.discountRate / 100));
    reservation.appliedCoupon = coupon.code;
    reservation.discountAmount = discountAmount;
    reservation.finalPrice = reservation.totalPrice - discountAmount;
  }

  const transaction_id = generateTxId('coupon');
  const tx = recordTransaction({
    type: 'coupon',
    actionName: `할인 쿠폰 적용: [코드: ${couponCode}, 할인율: ${coupon.discountRate}%]`,
    idempotency_key,
    transaction_id,
    payload: { reservationId, couponCode }
  });

  res.json({
    success: true,
    bugId: 'site037-bug04',
    secId: 'SEC-344',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    coupon,
    discountAmount,
    reservation
  });
});

// ----------------------------------------------------
// 5. Performances Sort (SEC-345 / site037-bug05)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site037-bug05 / SEC-345
// Idempotency key is not enforced for performance sorting queries.
// Repeated sort requests with the same key generate distinct SORT-TX-xxx transactions.
app.get('/api/performances', (req, res) => {
  res.json(performances);
});

app.get('/api/performances/:performanceId', (req, res) => {
  const p = performances.find(item => item.id === req.params.performanceId);
  if (!p) return res.status(404).json({ error: 'Performance not found' });
  res.json(p);
});

app.post('/api/performances/sort', (req, res) => {
  const { sortBy = 'popularity', order = 'desc', idempotency_key } = req.body;

  let sorted = [...performances];
  if (sortBy === 'popularity') {
    sorted.sort((a, b) => order === 'asc' ? a.popularity - b.popularity : b.popularity - a.popularity);
  } else if (sortBy === 'price') {
    sorted.sort((a, b) => order === 'asc' ? a.price - b.price : b.price - a.price);
  } else if (sortBy === 'rating') {
    sorted.sort((a, b) => order === 'asc' ? a.rating - b.rating : b.rating - a.rating);
  } else if (sortBy === 'title') {
    sorted.sort((a, b) => order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
  }

  const transaction_id = generateTxId('sort');
  const tx = recordTransaction({
    type: 'sort',
    actionName: `공연 목록 정렬: [기준: ${sortBy}, 방향: ${order}]`,
    idempotency_key,
    transaction_id,
    payload: { sortBy, order }
  });

  res.json({
    success: true,
    bugId: 'site037-bug05',
    secId: 'SEC-345',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    sortBy,
    order,
    results: sorted
  });
});

// ----------------------------------------------------
// 6. Performances Pagination (SEC-346 / site037-bug06)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site037-bug06 / SEC-346
// Idempotency key is not enforced for pagination queries.
// Repeated page requests with the same key create duplicate PAGE-TX-xxx transactions.
app.post('/api/performances/page', (req, res) => {
  const { page = 1, pageSize = 3, idempotency_key } = req.body;

  const startIndex = (Number(page) - 1) * Number(pageSize);
  const paginatedItems = performances.slice(startIndex, startIndex + Number(pageSize));

  const transaction_id = generateTxId('page');
  const tx = recordTransaction({
    type: 'page',
    actionName: `공연 목록 페이지 이동: [페이지: ${page}, 크기: ${pageSize}]`,
    idempotency_key,
    transaction_id,
    payload: { page, pageSize }
  });

  res.json({
    success: true,
    bugId: 'site037-bug06',
    secId: 'SEC-346',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    page: Number(page),
    pageSize: Number(pageSize),
    totalCount: performances.length,
    totalPages: Math.ceil(performances.length / Number(pageSize)),
    items: paginatedItems
  });
});

// ----------------------------------------------------
// 7. Files Name Edit (SEC-347 / site037-bug07)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site037-bug07 / SEC-347
// Idempotency key is not enforced when renaming performance files.
// Duplicate file rename requests with the same key create multiple FILENAME-TX-xxx transactions.
app.get('/api/files', (req, res) => {
  res.json(files);
});

app.post('/api/files/name', (req, res) => {
  const { fileId, name, idempotency_key } = req.body;
  const file = files.find(f => f.id === fileId);
  if (file && name) {
    file.name = name;
    file.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  }

  const transaction_id = generateTxId('filename');
  const tx = recordTransaction({
    type: 'filename',
    actionName: `공연 파일명 변경: [${name || fileId}]`,
    idempotency_key,
    transaction_id,
    payload: { fileId, name }
  });

  res.json({
    success: true,
    bugId: 'site037-bug07',
    secId: 'SEC-347',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    file
  });
});

// ----------------------------------------------------
// 8. Chat Messages (SEC-348 / site037-bug08)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site037-bug08 / SEC-348
// Idempotency key is not checked on chat message post.
// Repeated requests with the same idempotency_key post duplicate messages & CHAT-TX-xxx transactions.
app.get('/api/chats', (req, res) => {
  res.json(chatRooms);
});

app.get('/api/chats/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  res.json(chatMessages[roomId] || []);
});

app.post('/api/chats/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const { message, idempotency_key } = req.body;

  if (!chatMessages[roomId]) {
    chatMessages[roomId] = [];
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    sender: currentUser.name,
    senderAvatar: currentUser.avatar,
    text: message || '',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  chatMessages[roomId].push(newMsg);

  const room = chatRooms.find(r => r.id === roomId);
  const transaction_id = generateTxId('chat');
  const tx = recordTransaction({
    type: 'chat',
    actionName: `관객 채팅 메시지 전송: [${room ? room.name : roomId}]`,
    idempotency_key,
    transaction_id,
    payload: { roomId, message }
  });

  res.status(201).json({
    success: true,
    bugId: 'site037-bug08',
    secId: 'SEC-348',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    message: newMsg
  });
});

// ----------------------------------------------------
// 9. Notices Creation (SEC-349 / site037-bug09)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site037-bug09 / SEC-349
// Idempotency key is not enforced for notice publishing.
// Repeating notice publish with the same key creates duplicate notices & NOTICE-TX-xxx transactions.
app.get('/api/notices', (req, res) => {
  res.json(notices);
});

app.get('/api/notices/:noticeId', (req, res) => {
  const n = notices.find(item => item.id === req.params.noticeId);
  if (!n) return res.status(404).json({ error: 'Notice not found' });
  res.json(n);
});

app.post('/api/notices', (req, res) => {
  const { title, content, category = '공지', idempotency_key } = req.body;

  const newNotice = {
    id: `notice-${String(notices.length + 801)}`,
    title: title || '신규 공연장 안내',
    category,
    author: currentUser.name || '공연장 운영팀',
    content: content || '',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    views: 1
  };

  notices.unshift(newNotice);

  const transaction_id = generateTxId('notice');
  const tx = recordTransaction({
    type: 'notice',
    actionName: `공연장 공지사항 등록: [${title}]`,
    idempotency_key,
    transaction_id,
    payload: { title, content, category }
  });

  res.status(201).json({
    success: true,
    bugId: 'site037-bug09',
    secId: 'SEC-349',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    notice: newNotice
  });
});

// ----------------------------------------------------
// 10. Performance Reviews (SEC-350 / site037-bug10)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site037-bug10 / SEC-350
// Idempotency key is not enforced for submitting performance reviews.
// Repeated review submissions with the same key post duplicate reviews & REVIEW-TX-xxx transactions.
app.get('/api/performances/:performanceId/reviews', (req, res) => {
  const { performanceId } = req.params;
  const filtered = reviews.filter(r => r.performanceId === performanceId);
  res.json(filtered);
});

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

app.post('/api/performances/:performanceId/reviews', (req, res) => {
  const { performanceId } = req.params;
  const { rating = 5, content = '', idempotency_key } = req.body;
  const p = performances.find(item => item.id === performanceId);

  const newReview = {
    id: `review-${String(reviews.length + 901)}`,
    performanceId,
    performanceTitle: p ? p.title : '공연',
    author: currentUser.name,
    authorAvatar: currentUser.avatar,
    rating: Number(rating) || 5,
    content: content || '',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    likes: 0
  };

  reviews.unshift(newReview);
  if (p) {
    p.reviewCount = (p.reviewCount || 0) + 1;
  }

  const transaction_id = generateTxId('review');
  const tx = recordTransaction({
    type: 'review',
    actionName: `공연 관람후기 리뷰 작성: [${p ? p.title : performanceId}] (★${rating})`,
    idempotency_key,
    transaction_id,
    payload: { performanceId, rating, content }
  });

  res.status(201).json({
    success: true,
    bugId: 'site037-bug10',
    secId: 'SEC-350',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    review: newReview
  });
});

// ----------------------------------------------------
// Exhibitions, Programs, Reservations APIs
// ----------------------------------------------------
app.get('/api/exhibitions', (req, res) => {
  res.json(exhibitions);
});

app.get('/api/exhibitions/:exhibitionId', (req, res) => {
  const exh = exhibitions.find(e => e.id === req.params.exhibitionId);
  if (!exh) return res.status(404).json({ error: 'Exhibition not found' });
  res.json(exh);
});

app.get('/api/programs', (req, res) => {
  res.json(programs);
});

app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

app.post('/api/reservations', (req, res) => {
  const { performanceId, date, seat, ticketCount = 1 } = req.body;
  const p = performances.find(item => item.id === performanceId) || performances[0];

  const newRes = {
    id: `reservation-${String(reservations.length + 401)}`,
    userId: currentUser.id,
    performanceId: p.id,
    performanceTitle: p.title,
    venue: p.venue,
    date: date || '2026-05-15',
    seat: seat || 'R석 1층 A열 10번',
    ticketCount: Number(ticketCount),
    totalPrice: p.price * Number(ticketCount),
    discountAmount: 0,
    appliedCoupon: null,
    finalPrice: p.price * Number(ticketCount),
    status: 'confirmed',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  reservations.unshift(newRes);
  res.status(201).json(newRes);
});

// ----------------------------------------------------
// Transactions & Activity APIs
// ----------------------------------------------------
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.get('/api/transactions/:transactionId', (req, res) => {
  const found = transactions.find(t => t.transaction_id === req.params.transactionId);
  if (!found) return res.status(404).json({ error: 'Transaction not found' });
  res.json(found);
});

// Serve frontend build if available
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('StageOn backend running. Use Vite dev server for frontend development.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[StageOn Server] Running on http://localhost:${PORT}`);
  console.log(`[Health Check] http://localhost:${PORT}/api/health`);
});
