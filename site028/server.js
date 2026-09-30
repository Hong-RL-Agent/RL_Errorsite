import express from 'express';
import cors from 'cors';
import pathModule from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9927;

app.use(cors({
  exposedHeaders: ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options']
}));
app.use(express.json());

// Global response header exposure
app.use((req, res, next) => {
  res.setHeader('Access-Control-Expose-Headers', 'Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options');
  next();
});

// Helper for normal responses with complete security headers
const applyNormalSecurityHeaders = (res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
};

// ====================================================
// Mock Travel Booking Database
// ====================================================

let userProfile = {
  id: 'usr_8829',
  email: 'traveler@auravoyage.io',
  name: '이지우',
  phone: '010-8921-4472',
  passportName: 'LEE JIWU',
  address: '서울특별시 서초구 반포대로 201',
  detailAddress: '102동 1504호',
  postcode: '06542',
  mileage: 18450,
  membershipTier: 'Voyage Diamond'
};

let coupons = [
  { code: 'AURA2026', discount: 20000, name: '2026 시즌 오픈 특별 2만원 할인', minPrice: 100000, validUntil: '2026-12-31' },
  { code: 'FLYSKY10', discount: 35000, name: '항공권 전용 얼리버드 35,000원 할인', minPrice: 200000, validUntil: '2026-11-30' },
  { code: 'STAYLUX', discount: 50000, name: '프리미엄 럭셔리 스테이 5만원 할인', minPrice: 300000, validUntil: '2026-10-31' }
];

let destinations = [
  {
    id: 'dest_1',
    name: '다낭 & 호이안',
    country: '베트남',
    tag: '동남아 휴양',
    badge: '인기 급상승',
    avgTemp: '28°C',
    flightTime: '4시간 30분',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=700&auto=format&fit=crop&q=80',
    desc: '푸른 바다와 유네스코 전통 거리가 공존하는 낭만의 힐링 명소'
  },
  {
    id: 'dest_2',
    name: '스위스 인터라켄',
    country: '스위스',
    tag: '알프스 대자연',
    badge: '최고 평점',
    avgTemp: '16°C',
    flightTime: '11시간 40분',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=700&auto=format&fit=crop&q=80',
    desc: '융프라우의 만년설과 맑은 에메랄드 호수가 빚어내는 환상적인 절경'
  },
  {
    id: 'dest_3',
    name: '오사카 & 교토',
    country: '일본',
    tag: '미식 & 힐링',
    badge: '단거리 추천',
    avgTemp: '21°C',
    flightTime: '1시간 45분',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=700&auto=format&fit=crop&q=80',
    desc: '화려한 도톤보리 미식 투어와 고즈넉한 대나무 숲길의 조화'
  },
  {
    id: 'dest_4',
    name: '하와이 오아후',
    country: '미국',
    tag: '프리미엄 휴양',
    badge: '럭셔리 리조트',
    avgTemp: '26°C',
    flightTime: '8시간 15분',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80',
    desc: '와이키키 해변의 석양과 서핑, 쇼핑을 모두 즐기는 파라다이스'
  },
  {
    id: 'dest_5',
    name: '아이슬란드 레이캬비크',
    country: '아이슬란드',
    tag: '오로라 탐험',
    badge: '이색 버킷리스트',
    avgTemp: '8°C',
    flightTime: '14시간 20분',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=700&auto=format&fit=crop&q=80',
    desc: '밤하늘을 수놓는 환상적인 오로라와 블루라군 온천의 신비'
  },
  {
    id: 'dest_6',
    name: '발리 스미냑',
    country: '인도네시아',
    tag: '풀빌라 스테이',
    badge: '감성 비치클럽',
    avgTemp: '29°C',
    flightTime: '7시간 00분',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&auto=format&fit=crop&q=80',
    desc: '황홀한 노을 뷰 비치클럽과 최고급 프라이빗 풀빌라의 휴식'
  }
];

let flights = [
  {
    id: 'fl_01',
    airline: 'Aura Air',
    airlineCode: 'AA702',
    from: 'ICN 서울/인천',
    to: 'DAD 베트남/다낭',
    deptTime: '08:30',
    arrvTime: '11:45',
    duration: '4h 15m',
    isDirect: true,
    price: 382000,
    seatsLeft: 5,
    classType: '스탠다드 이코노미',
    baggage: '위탁 수하물 23kg 무료',
    date: '2026-10-12'
  },
  {
    id: 'fl_02',
    airline: 'Sky Horizon',
    airlineCode: 'SH104',
    from: 'ICN 서울/인천',
    to: 'KIX 일본/오사카',
    deptTime: '09:15',
    arrvTime: '11:05',
    duration: '1h 50m',
    isDirect: true,
    price: 198000,
    seatsLeft: 12,
    classType: '스마트 세이버',
    baggage: '기내 10kg + 위탁 15kg',
    date: '2026-10-15'
  },
  {
    id: 'fl_03',
    airline: 'Pacific Ocean Air',
    airlineCode: 'PA991',
    from: 'ICN 서울/인천',
    to: 'HNL 미국/하와이',
    deptTime: '20:40',
    arrvTime: '10:10',
    duration: '8h 30m',
    isDirect: true,
    price: 940000,
    seatsLeft: 3,
    classType: '프리미엄 플러스',
    baggage: '위탁 수하물 2개 (각 23kg)',
    date: '2026-11-04'
  },
  {
    id: 'fl_04',
    airline: 'Swiss Alpine Star',
    airlineCode: 'SA504',
    from: 'ICN 서울/인천',
    to: 'ZRH 스위스/취리히',
    deptTime: '12:20',
    arrvTime: '19:40',
    duration: '12h 20m',
    isDirect: true,
    price: 1280000,
    seatsLeft: 7,
    classType: '비즈니스 스위트',
    baggage: '위탁 수하물 32kg x 2',
    date: '2026-11-18'
  },
  {
    id: 'fl_05',
    airline: 'Aura Air',
    airlineCode: 'AA818',
    from: 'ICN 서울/인천',
    to: 'DPS 인도네시아/발리',
    deptTime: '16:50',
    arrvTime: '23:00',
    duration: '7h 10m',
    isDirect: true,
    price: 520000,
    seatsLeft: 9,
    classType: '이코노미 컴포트',
    baggage: '위탁 수하물 23kg',
    date: '2026-10-22'
  },
  {
    id: 'fl_06',
    airline: 'Nordic Wing',
    airlineCode: 'NW302',
    from: 'ICN 서울/인천',
    to: 'KEF 아이슬란드/레이캬비크',
    deptTime: '01:10',
    arrvTime: '14:30',
    duration: '15h 20m',
    isDirect: false,
    price: 1150000,
    seatsLeft: 4,
    classType: '이코노미 플렉스',
    baggage: '위탁 수하물 23kg',
    date: '2026-12-01'
  }
];

let accommodations = [
  {
    id: 'acc_01',
    name: '오라 럭스 리조트 & 오션 빌라 다낭',
    location: '다낭',
    country: '베트남',
    type: '리조트 & 풀빌라',
    rating: 4.95,
    reviews: 320,
    pricePerNight: 245000,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80',
    perks: ['프라이빗 비치', '인피니티 풀', '2인 조식 무료', '웰컴 드링크'],
    scoreText: '완벽함',
    tag: '오션뷰 특가'
  },
  {
    id: 'acc_02',
    name: '그랜드 헤리티지 호텔 교토 가모가와',
    location: '교토',
    country: '일본',
    type: '5성급 부티크 호텔',
    rating: 4.88,
    reviews: 198,
    pricePerNight: 210000,
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=700&auto=format&fit=crop&q=80',
    perks: ['전통 다도 체험', '온천 스파', '가모가와 강 뷰', '지하철 도보 2분'],
    scoreText: '매우 훌륭함',
    tag: '미식 & 힐링'
  },
  {
    id: 'acc_03',
    name: '알프스 샬레 & 파노라마 스위트 인터라켄',
    location: '스위스',
    country: '스위스',
    type: '럭셔리 샬레',
    rating: 4.98,
    reviews: 142,
    pricePerNight: 390000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80',
    perks: ['융프라우 뷰 테라스', '사우나 & 자쿠지', '벽난로 라운지', '산악열차 패스'],
    scoreText: '인생 숙소',
    tag: '마운틴 뷰'
  },
  {
    id: 'acc_04',
    name: '와이키키 선셋 베이 비치프론트 리조트',
    location: '하와이',
    country: '미국',
    type: '비치 리조트',
    rating: 4.91,
    reviews: 412,
    pricePerNight: 480000,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700&auto=format&fit=crop&q=80',
    perks: ['비치 카바나 이용', '패들보드 무료 대여', '루프탑 바', '발렛 파킹'],
    scoreText: '최고 인기',
    tag: '비치프론트'
  },
  {
    id: 'acc_05',
    name: '우붓 헤븐리 정글 풀빌라 & 스파',
    location: '발리',
    country: '인도네시아',
    type: '독채 풀빌라',
    rating: 4.97,
    reviews: 285,
    pricePerNight: 310000,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&auto=format&fit=crop&q=80',
    perks: ['개인 온수 인피니티풀', '플로팅 브런치', '무료 요가 세션', '버틀러 서비스'],
    scoreText: '감성 최고',
    tag: '허니문 추천'
  }
];

let wishlist = [
  { id: 'acc_01', type: 'accommodation', title: '오라 럭스 리조트 & 오션 빌라 다낭', price: 245000, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80' },
  { id: 'dest_2', type: 'destination', title: '스위스 인터라켄 알프스 투어', price: 1280000, image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=700&auto=format&fit=crop&q=80' }
];

let bookings = [
  {
    bookingId: 'BK-2026-9812',
    type: 'flight',
    title: 'Aura Air AA702 (ICN → DAD)',
    dates: '2026-10-12 ~ 2026-10-17',
    passengers: '성인 2명',
    totalPrice: 764000,
    discountApplied: 20000,
    finalPaid: 744000,
    status: '예약 확정',
    createdAt: '2026-09-20',
    details: '인천국제공항 T2 탑승수속 카운터 A21, 출발 2시간 전 체크인 권장'
  },
  {
    bookingId: 'BK-2026-4409',
    type: 'accommodation',
    title: '오라 럭스 리조트 & 오션 빌라 다낭 (3박)',
    dates: '2026-10-12 ~ 2026-10-15',
    passengers: '성인 2명',
    totalPrice: 735000,
    discountApplied: 50000,
    finalPaid: 685000,
    status: '이용 예정',
    createdAt: '2026-09-22',
    details: '오션뷰 프리미어 킹베드 룸, 무료 조식 2인 포함 바우처 발행 완료'
  }
];

let itineraries = [
  {
    id: 'itin_01',
    title: '다낭 3박 4일 완벽 힐링 투어',
    destination: '베트남 다낭',
    places: ['미케비치 산책', '바나힐 골든브릿지', '호이안 야시장 올드타운 투어'],
    notes: '전 일정 프라이빗 밴 픽업 서비스 예약 완료',
    createdAt: '2026-09-21'
  }
];

let recentSearches = [
  { query: '다낭', type: 'accommodation', date: '2026-10-12 ~ 2026-10-17', guests: 2 },
  { query: '오사카', type: 'flight', date: '2026-10-15 ~ 2026-10-18', guests: 1 },
  { query: '스위스 인터라켄', type: 'accommodation', date: '2026-11-18 ~ 2026-11-23', guests: 2 }
];

// ====================================================
// INTENTIONAL BACKEND VULNERABILITIES (SEC-281 ~ SEC-290)
// ====================================================

// INTENTIONAL BACKEND BUG
// SEC-281: Security headers intentionally missing (Login Form)
app.post('/api/login', (req, res) => {
  // Vulnerable: Omit Content-Security-Policy
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
  }

  res.json({
    status: 'success',
    token: 'aura_jwt_' + Date.now() + '_authenticated',
    user: {
      name: userProfile.name,
      email: email,
      membershipTier: userProfile.membershipTier
    },
    message: '로그인이 성공적으로 완료되었습니다.'
  });
});

// INTENTIONAL BACKEND BUG
// SEC-282: Security headers intentionally missing (Register Form)
app.post('/api/register', (req, res) => {
  // Vulnerable: Omit Strict-Transport-Security
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { name, email, password, phone } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: '가입 정보를 빠짐없이 입력해주세요.' });
  }

  userProfile.name = name;
  userProfile.email = email;
  if (phone) userProfile.phone = phone;

  res.json({
    status: 'success',
    user: { name, email, membershipTier: 'Voyage Silver' },
    message: 'AuraVoyage 신규 회원가입을 환영합니다!'
  });
});

// INTENTIONAL BACKEND BUG
// SEC-283: Security headers intentionally missing (Address Field)
app.post('/api/profile/address', (req, res) => {
  // Vulnerable: Omit X-Content-Type-Options
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  const { address, detailAddress, postcode } = req.body || {};
  if (address) userProfile.address = address;
  if (detailAddress) userProfile.detailAddress = detailAddress;
  if (postcode) userProfile.postcode = postcode;

  res.json({
    status: 'success',
    profile: userProfile,
    message: '여행자 기본 배송지 및 주소가 저장되었습니다.'
  });
});

// INTENTIONAL BACKEND BUG
// SEC-284: Security headers intentionally missing (Coupon Field)
app.post('/api/coupon', (req, res) => {
  // Vulnerable: Omit Content-Security-Policy & Strict-Transport-Security
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { code } = req.body || {};
  const found = coupons.find(c => c.code.toUpperCase() === (code || '').trim().toUpperCase());

  if (found) {
    res.json({
      status: 'success',
      valid: true,
      coupon: found,
      message: `[${found.name}] 쿠폰이 정상 적용되었습니다.`
    });
  } else {
    res.status(404).json({
      status: 'error',
      valid: false,
      message: '유효하지 않거나 기간이 만료된 쿠폰 번호입니다.'
    });
  }
});

// INTENTIONAL BACKEND BUG
// SEC-285: Security headers intentionally missing (Sort Parameter)
// SEC-286: Security headers intentionally missing (Pagination Parameter)
app.get('/api/flights', (req, res) => {
  const { sort, page, limit } = req.query;

  let result = [...flights];

  // If sort parameter is provided (SEC-285 trigger)
  if (sort) {
    // Vulnerable: Omit Strict-Transport-Security & X-Content-Type-Options
    res.setHeader('Content-Security-Policy', "default-src 'self'");

    if (sort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'duration') {
      result.sort((a, b) => a.duration.localeCompare(b.duration));
    }
    return res.json({ flights: result, total: result.length, sortApplied: sort });
  }

  // If page parameter is provided (SEC-286 trigger)
  if (page) {
    // Vulnerable: Omit Content-Security-Policy & X-Content-Type-Options
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 3;
    const startIdx = (pageNum - 1) * pageSize;
    const paged = result.slice(startIdx, startIdx + pageSize);

    return res.json({
      flights: paged,
      total: result.length,
      page: pageNum,
      totalPages: Math.ceil(result.length / pageSize)
    });
  }

  // Normal request without sort/page: complete security headers
  applyNormalSecurityHeaders(res);
  res.json({ flights: result, total: result.length });
});

// INTENTIONAL BACKEND BUG
// SEC-287: Security headers intentionally missing (Accommodation Search Filter)
app.get('/api/accommodations', (req, res) => {
  const { location, type } = req.query;

  let results = [...accommodations];

  // If location filter parameter is provided (SEC-287 trigger)
  if (location !== undefined) {
    // Vulnerable: Omit Content-Security-Policy & Strict-Transport-Security
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (location && location !== '전체') {
      results = results.filter(a => 
        a.location.includes(location) || 
        a.country.includes(location) || 
        a.name.includes(location) || 
        a.type.includes(location)
      );
    }
    return res.json({ accommodations: results, locationFilter: location, total: results.length });
  }

  // If type filter is provided without location
  if (type && type !== '전체') {
    applyNormalSecurityHeaders(res);
    results = results.filter(a => a.type.includes(type) || a.tag.includes(type));
    return res.json({ accommodations: results, total: results.length });
  }

  // Normal request: complete security headers
  applyNormalSecurityHeaders(res);
  res.json({ accommodations: results, total: results.length });
});

// INTENTIONAL BACKEND BUG
// SEC-288: Security headers intentionally missing (Booking Info Detail View)
app.get('/api/bookings/:bookingId', (req, res) => {
  // Vulnerable: Omit Content-Security-Policy & X-Content-Type-Options
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  const { bookingId } = req.params;
  const booking = bookings.find(b => b.bookingId === bookingId);

  if (booking) {
    res.json({ status: 'success', booking });
  } else {
    res.status(404).json({ error: '해당 예약 번호를 찾을 수 없습니다.' });
  }
});

// INTENTIONAL BACKEND BUG
// SEC-289: Security headers intentionally missing (Wishlist Save)
app.post('/api/wishlist', (req, res) => {
  // Vulnerable: Omit X-Content-Type-Options
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  const { id, type, title, price, image } = req.body || {};
  const existingIdx = wishlist.findIndex(w => w.id === id);

  if (existingIdx >= 0) {
    wishlist.splice(existingIdx, 1);
    return res.json({
      status: 'removed',
      wishlist,
      message: '찜 목록에서 제외되었습니다.'
    });
  } else {
    const item = {
      id: id || 'item_' + Date.now(),
      type: type || 'accommodation',
      title: title || '선택한 여행 상품',
      price: price || 200000,
      image: image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80'
    };
    wishlist.unshift(item);
    return res.json({
      status: 'added',
      wishlist,
      item,
      message: '관심 여행 상품이 찜 목록에 추가되었습니다.'
    });
  }
});

// INTENTIONAL BACKEND BUG
// SEC-290: Security headers intentionally missing (Itinerary Save)
app.post('/api/itineraries', (req, res) => {
  // Vulnerable: Omit Strict-Transport-Security
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { title, destination, places, notes } = req.body || {};
  const newItin = {
    id: 'itin_' + Date.now(),
    title: title || '나만의 맞춤 여행 코스',
    destination: destination || '베트남 다낭',
    places: places || ['호텔 체크인', '시내 투어'],
    notes: notes || '여행 메모',
    createdAt: new Date().toISOString().split('T')[0]
  };

  itineraries.unshift(newItin);
  res.json({
    status: 'success',
    itinerary: newItin,
    itineraries,
    message: '새로운 여행 일정이 안전하게 저장되었습니다.'
  });
});

// ====================================================
// NORMAL API ENDPOINTS (Returns full security headers)
// ====================================================

// GET /api/destinations
app.get('/api/destinations', (req, res) => {
  applyNormalSecurityHeaders(res);
  res.json(destinations);
});

// GET /api/profile
app.get('/api/profile', (req, res) => {
  applyNormalSecurityHeaders(res);
  res.json(userProfile);
});

// GET /api/bookings (List view)
app.get('/api/bookings', (req, res) => {
  applyNormalSecurityHeaders(res);
  res.json(bookings);
});

// POST /api/bookings (Create booking)
app.post('/api/bookings', (req, res) => {
  applyNormalSecurityHeaders(res);
  const { type, title, dates, passengers, totalPrice, discountApplied, couponCode } = req.body || {};
  const finalPrice = Math.max(0, (totalPrice || 200000) - (discountApplied || 0));
  const newBooking = {
    bookingId: 'BK-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
    type: type || 'accommodation',
    title: title || 'AuraVoyage 추천 여행 상품',
    dates: dates || '2026-10-20 ~ 2026-10-23',
    passengers: passengers || '성인 2명',
    totalPrice: totalPrice || 200000,
    discountApplied: discountApplied || 0,
    couponCode: couponCode || null,
    finalPaid: finalPrice,
    status: '예약 확정',
    createdAt: new Date().toISOString().split('T')[0],
    details: '프리미엄 예약 바우처 발급 완료 및 이메일 전송'
  };
  bookings.unshift(newBooking);
  res.json({ status: 'success', booking: newBooking, message: '여행 예약이 성공적으로 접수되었습니다.' });
});

// GET /api/wishlist
app.get('/api/wishlist', (req, res) => {
  applyNormalSecurityHeaders(res);
  res.json(wishlist);
});

// GET /api/itineraries (List view)
app.get('/api/itineraries', (req, res) => {
  applyNormalSecurityHeaders(res);
  res.json(itineraries);
});

// POST /api/payment
app.post('/api/payment', (req, res) => {
  applyNormalSecurityHeaders(res);
  const { bookingId, paymentMethod, amount } = req.body || {};
  res.json({
    status: 'success',
    transactionId: 'TX_AURA_' + Date.now(),
    bookingId: bookingId || 'BK-2026-9812',
    paymentMethod: paymentMethod || '신용/체크카드',
    paidAmount: amount || 744000,
    paidAt: new Date().toISOString(),
    message: '결제가 성공적으로 승인 처리되었습니다.'
  });
});

// GET /api/recent-searches
app.get('/api/recent-searches', (req, res) => {
  applyNormalSecurityHeaders(res);
  res.json(recentSearches);
});

// POST /api/recent-searches
app.post('/api/recent-searches', (req, res) => {
  applyNormalSecurityHeaders(res);
  const { query, type, date, guests } = req.body || {};
  if (query) {
    recentSearches.unshift({ query, type: type || 'destination', date: date || '2026-10-15', guests: guests || 2 });
    if (recentSearches.length > 6) recentSearches.pop();
  }
  res.json({ status: 'success', recentSearches });
});

// Static assets and SPA fallback
app.use(express.static(pathModule.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  applyNormalSecurityHeaders(res);
  res.sendFile(pathModule.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) res.sendFile(pathModule.join(__dirname, 'index.html'));
  });
});

app.listen(PORT, () => {
  console.log(`[AuraVoyage Server] Running at http://localhost:${PORT}`);
});
