import express from 'express';
import cors from 'cors';
import pathModule from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9928;

app.use(cors());
app.use(express.json());

// ====================================================
// Mock Concert & Performance Database
// ====================================================

let userProfile = {
  id: 'usr_starlight_77',
  name: '강민혁',
  email: 'minhyuk@starlight.live',
  phone: '010-3342-9918',
  bio: 'K-POP 콘서트 & 페스티벌 매니아! 올스탠딩 공연을 선호합니다.',
  ticketPoints: 12500,
  membership: 'VIP Starlight Club'
};

let performances = [
  {
    id: 'perf_01',
    title: '2026 ECLIPSE WORLD TOUR [SUPERNOVA] IN SEOUL',
    artist: 'ECLIPSE (이클립스)',
    category: '콘서트',
    genre: 'K-POP / 라이브 밴드',
    date: '2026-11-14 ~ 2026-11-16',
    venue: 'KSPO DOME (올림픽체조경기장)',
    poster: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    ranking: 1,
    status: '예매중',
    ageLimit: '만 7세 이상',
    runningTime: '150분',
    prices: {
      VIP: 187000,
      R: 154000,
      S: 132000,
      A: 110000
    },
    seatsInfo: {
      VIP: { name: 'VIP석 (사운드체크 포함)', price: 187000, left: 14, color: '#f59e0b' },
      R: { name: 'R석 (지정석 플로어)', price: 154000, left: 38, color: '#8b5cf6' },
      S: { name: 'S석 (1층 스탠드석)', price: 132000, left: 62, color: '#06b6d4' },
      A: { name: 'A석 (2층 시야제한석)', price: 110000, left: 45, color: '#64748b' }
    }
  },
  {
    id: 'perf_02',
    title: '뮤지컬 〈오페라의 유령 - 앙코르 라이브〉',
    artist: '오리지널 브로드웨이 내한 캐스트',
    category: '뮤지컬',
    genre: '클래식 라이브 오케스트라',
    date: '2026-10-20 ~ 2026-12-31',
    venue: '블루스퀘어 신한카드홀',
    poster: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80',
    ranking: 2,
    status: '예매중',
    ageLimit: '만 8세 이상',
    runningTime: '160분 (인터미션 20분)',
    prices: {
      VIP: 190000,
      R: 160000,
      S: 130000,
      A: 90000
    },
    seatsInfo: {
      VIP: { name: 'VIP석 (1층 중앙 프리미엄)', price: 190000, left: 8, color: '#f59e0b' },
      R: { name: 'R석 (1층 날개 및 2층 중앙)', price: 160000, left: 24, color: '#8b5cf6' },
      S: { name: 'S석 (2층 일반석)', price: 130000, left: 51, color: '#06b6d4' },
      A: { name: 'A석 (3층 하이뷰)', price: 90000, left: 32, color: '#64748b' }
    }
  },
  {
    id: 'perf_03',
    title: '2026 SEOUL SYNTHWAVE & EDM FESTIVAL [NEON ODYSSEY]',
    artist: '글로벌 탑 DJ & EDM 라이브 헤드라이너 16팀',
    category: '페스티벌',
    genre: 'EDM / 페스티벌',
    date: '2026-10-03 ~ 2026-10-05',
    venue: '서울랜드 피크닉 파크 특설무대',
    poster: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    ranking: 3,
    status: '얼리버드',
    ageLimit: '만 19세 이상',
    runningTime: '540분 (올나잇)',
    prices: {
      VIP: 220000,
      R: 165000,
      S: 120000,
      A: 99000
    },
    seatsInfo: {
      VIP: { name: 'VIP 라운지 & 프리드링크 패스', price: 220000, left: 20, color: '#f59e0b' },
      R: { name: '스탠딩 얼리엔트리 프리패스', price: 165000, left: 85, color: '#8b5cf6' },
      S: { name: '일반 1일 자유 스탠딩', price: 120000, left: 140, color: '#06b6d4' },
      A: { name: '얼리버드 할인권', price: 99000, left: 12, color: '#64748b' }
    }
  },
  {
    id: 'perf_04',
    title: '연극 〈라스트 세션 (The Last Session)〉 10주년 특별공연',
    artist: '신구, 오영수, 이상윤 외',
    category: '연극',
    genre: '정통 드라마 / 심리극',
    date: '2026-10-15 ~ 2026-11-30',
    venue: '대학로 TOM 1관',
    poster: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&auto=format&fit=crop&q=80',
    ranking: 4,
    status: '예매중',
    ageLimit: '만 12세 이상',
    runningTime: '90분',
    prices: {
      VIP: 88000,
      R: 66000,
      S: 55000,
      A: 44000
    },
    seatsInfo: {
      VIP: { name: 'R석 (1층 1~5열 메인존)', price: 88000, left: 16, color: '#f59e0b' },
      R: { name: 'S석 (1층 일반석)', price: 66000, left: 30, color: '#8b5cf6' },
      S: { name: 'A석 (2층 중앙)', price: 55000, left: 22, color: '#06b6d4' },
      A: { name: '시야제한석 (2층 측면)', price: 44000, left: 18, color: '#64748b' }
    }
  }
];

let packages = [
  {
    id: 'pkg_01',
    title: 'ECLIPSE KSPO DOME VIP 패키지 (티켓 2매 + 한정 MD 풀세트)',
    performanceId: 'perf_01',
    itemsCount: 2,
    basePrice: 380000,
    discountRate: '15%',
    finalPackagePrice: 323000,
    tag: '한정수량 VIP MD 패키지',
    includes: ['VIP 티켓 2매', '사운드체크 리허설 입장권', '공식 응원봉 Ver.3', '포토카드 6종 세트']
  },
  {
    id: 'pkg_02',
    title: '오페라의 유령 다이닝 패키지 (R석 2매 + 호텔 디너 2인 코스)',
    performanceId: 'perf_02',
    itemsCount: 2,
    basePrice: 420000,
    discountRate: '12%',
    finalPackagePrice: 369600,
    tag: '럭셔리 다이닝 결합',
    includes: ['R석 티켓 2매', '블루스퀘어 VIP 라운지 음료 2잔', '그랜드하얏트 5코스 디너 바우처']
  },
  {
    id: 'pkg_03',
    title: 'EDM FESTIVAL 3일권 올패스 + 캠핑존 티켓 세트',
    performanceId: 'perf_03',
    itemsCount: 3,
    basePrice: 360000,
    discountRate: '20%',
    finalPackagePrice: 288000,
    tag: '3일 연속 올패스',
    includes: ['페스티벌 3일 전일 입장권', '글램핑 텐트존 이용권', '웰컴 드링크 쿠폰 6장']
  }
];

let coupons = [
  { code: 'STAR2026', discountAmount: 20000, name: '스타라이트 2026 오픈 2만원 즉시할인', minPrice: 100000 },
  { code: 'CONCERT15', discountAmount: 30000, name: '콘서트 & 페스티벌 전용 3만원 할인', minPrice: 150000 },
  { code: 'VIPMEMBER', discountAmount: 50000, name: 'VIP 멤버십 특별 5만원 바우처', minPrice: 200000 }
];

let cart = [
  {
    cartId: 'cart_item_1',
    performanceId: 'perf_01',
    title: '2026 ECLIPSE WORLD TOUR [SUPERNOVA] IN SEOUL',
    seatGrade: 'VIP',
    seatName: 'VIP석 (사운드체크 포함)',
    unitPrice: 187000,
    quantity: 2,
    subtotal: 374000,
    bookingFee: 4000,
    total: 378000
  }
];

let bookings = [
  {
    orderId: 'TKT-2026-8819',
    performanceId: 'perf_01',
    title: '2026 ECLIPSE WORLD TOUR [SUPERNOVA] IN SEOUL',
    venue: 'KSPO DOME (올림픽체조경기장)',
    performanceDate: '2026-11-14 19:00',
    seatGrade: 'VIP',
    seats: ['VIP석 A구역 12열 4번', 'VIP석 A구역 12열 5번'],
    quantity: 2,
    unitPrice: 187000,
    serverSubtotal: 374000,
    discountApplied: 20000,
    paidAmount: 354000,
    status: '예매 완료 (모바일 티켓 발권)',
    flowOrigin: '직접 예매',
    createdAt: '2026-09-20'
  }
];

let wishlist = ['perf_01', 'perf_03'];

// ====================================================
// INTENTIONAL BACKEND VULNERABILITIES (SEC-301 ~ SEC-310)
// ====================================================

// INTENTIONAL BACKEND BUG
// SEC-301: Price Tampering via Search Flow
app.get('/api/search', (req, res) => {
  const { keyword, category } = req.query;
  let results = [...performances];

  if (keyword) {
    results = results.filter(p => p.title.includes(keyword) || p.artist.includes(keyword) || p.venue.includes(keyword));
  }
  if (category && category !== '전체') {
    results = results.filter(p => p.category === category);
  }

  res.json({
    status: 'success',
    flow: 'search',
    keyword: keyword || '',
    category: category || '전체',
    totalResults: results.length,
    performances: results,
    suggestedTicketPrice: results.length > 0 ? results[0].prices.VIP : 187000
  });
});

// INTENTIONAL BACKEND BUG
// SEC-302: Price Tampering via Profile Flow
app.post('/api/profile', (req, res) => {
  const { name, bio, phone } = req.body || {};
  if (name) userProfile.name = name;
  if (bio) userProfile.bio = bio;
  if (phone) userProfile.phone = phone;

  res.json({
    status: 'success',
    flow: 'profile',
    user: userProfile,
    memberDiscountRate: '10%',
    message: '회원 프로필 소개가 성공적으로 변경되었습니다.'
  });
});

// INTENTIONAL BACKEND BUG
// SEC-303: Price Tampering via Support Inquiry Flow
app.post('/api/support', (req, res) => {
  const { category, title, message } = req.body || {};
  res.json({
    status: 'success',
    flow: 'support',
    ticketId: 'SUP-TKT-' + Date.now(),
    inquiry: { category: category || '티켓 예매 문의', title: title || '좌석 및 결제 문의', message: message || '' },
    specialDiscountOffered: 10000,
    message: '1:1 고객센터 문의가 정상 접수되었습니다.'
  });
});

// INTENTIONAL BACKEND BUG
// SEC-304: Price Tampering via Seat Selection Flow
app.post('/api/seats/select', (req, res) => {
  const { performanceId, seatGrade, quantity, selectedSeats } = req.body || {};
  const perf = performances.find(p => p.id === performanceId) || performances[0];
  const gradeInfo = perf.seatsInfo[seatGrade] || perf.seatsInfo.VIP;
  
  const qty = Number(quantity) || 1;
  const actualSubtotal = gradeInfo.price * qty;
  const bookingFee = 2000 * qty;
  const expectedTotal = actualSubtotal + bookingFee;

  res.json({
    status: 'success',
    flow: 'seats_select',
    performanceId: perf.id,
    performanceTitle: perf.title,
    seatGrade,
    seatName: gradeInfo.name,
    unitPrice: gradeInfo.price,
    quantity: qty,
    selectedSeats: selectedSeats || [`${seatGrade}석 01열 1번`],
    actualSubtotal,
    bookingFee,
    expectedTotal,
    message: '좌석이 성공적으로 선점되었습니다.'
  });
});

// INTENTIONAL BACKEND BUG
// SEC-305: Price Tampering via Cart Quantity Modification
app.post('/api/cart', (req, res) => {
  const { performanceId, seatGrade, quantity } = req.body || {};
  const perf = performances.find(p => p.id === performanceId) || performances[0];
  const gradeInfo = perf.seatsInfo[seatGrade] || perf.seatsInfo.R;
  const qty = Number(quantity) || 1;

  const actualSubtotal = gradeInfo.price * qty;
  const bookingFee = 2000 * qty;
  const expectedTotal = actualSubtotal + bookingFee;

  const cartItem = {
    cartId: 'cart_' + Date.now(),
    performanceId: perf.id,
    title: perf.title,
    venue: perf.venue,
    seatGrade: seatGrade || 'R',
    seatName: gradeInfo.name,
    unitPrice: gradeInfo.price,
    quantity: qty,
    actualSubtotal,
    bookingFee,
    expectedTotal
  };

  cart = [cartItem];

  res.json({
    status: 'success',
    flow: 'cart',
    cart,
    cartItem,
    actualSubtotal,
    bookingFee,
    expectedTotal,
    message: `티켓 장바구니에 ${qty}매가 담겼습니다.`
  });
});

// INTENTIONAL BACKEND BUG
// SEC-306: Price Tampering via Coupon Discount Flow
app.post('/api/coupons/apply', (req, res) => {
  const { code, targetSubtotal } = req.body || {};
  const found = coupons.find(c => c.code.toUpperCase() === (code || '').trim().toUpperCase());

  if (found) {
    const subtotal = Number(targetSubtotal) || 374000;
    const discountedTotal = Math.max(0, subtotal - found.discountAmount);

    res.json({
      status: 'success',
      flow: 'coupon_apply',
      valid: true,
      coupon: found,
      discountAmount: found.discountAmount,
      originalSubtotal: subtotal,
      calculatedFinalTotal: discountedTotal,
      message: `[${found.name}] 쿠폰이 정상 적용되었습니다.`
    });
  } else {
    res.status(400).json({
      status: 'error',
      flow: 'coupon_apply',
      valid: false,
      message: '유효하지 않은 쿠폰 코드입니다.'
    });
  }
});

// INTENTIONAL BACKEND BUG
// SEC-307: Price Tampering via Seat Grade Rate Flow
app.get('/api/performances/:performanceId/seats', (req, res) => {
  const { performanceId } = req.params;
  const perf = performances.find(p => p.id === performanceId) || performances[0];

  res.json({
    status: 'success',
    flow: 'seat_tiers',
    performanceId: perf.id,
    title: perf.title,
    venue: perf.venue,
    seatsInfo: perf.seatsInfo,
    pricingTiers: perf.prices,
    message: '공연 좌석 등급별 가격 정보가 조회되었습니다.'
  });
});

// INTENTIONAL BACKEND BUG
// SEC-308: Price Tampering via Package Tickets Flow
app.get('/api/packages', (req, res) => {
  res.json({
    status: 'success',
    flow: 'packages',
    totalPackages: packages.length,
    packages: packages
  });
});

// INTENTIONAL BACKEND BUG
// SEC-309: Price Tampering via Order Summary Calculation Flow
app.get('/api/orders/summary', (req, res) => {
  const { performanceId, seatGrade, quantity, couponCode } = req.query;
  const perf = performances.find(p => p.id === performanceId) || performances[0];
  const grade = seatGrade || 'VIP';
  const gradeInfo = perf.seatsInfo[grade] || perf.seatsInfo.VIP;
  const qty = Number(quantity) || 1;

  const actualSubtotal = gradeInfo.price * qty;
  const bookingFee = 2000 * qty;

  let discountAmount = 0;
  if (couponCode) {
    const cp = coupons.find(c => c.code === couponCode);
    if (cp) discountAmount = cp.discountAmount;
  }

  const serverCalculatedTotal = Math.max(0, actualSubtotal + bookingFee - discountAmount);

  res.json({
    status: 'success',
    flow: 'order_summary',
    orderSummary: {
      performanceId: perf.id,
      title: perf.title,
      venue: perf.venue,
      seatGrade: grade,
      seatName: gradeInfo.name,
      unitPrice: gradeInfo.price,
      quantity: qty,
      actualSubtotal,
      bookingFee,
      discountAmount,
      serverCalculatedTotal
    }
  });
});

// INTENTIONAL BACKEND BUG
// SEC-310: Price Tampering via Payment Confirmation
app.post('/api/payment/confirm', (req, res) => {
  const { orderId, performanceId, seatGrade, quantity, paymentAmount, actualSubtotal } = req.body || {};

  // Vulnerable Logic: Server directly trusts client-supplied paymentAmount without recalculation
  const approvedPayment = Number(paymentAmount);

  res.json({
    status: 'success',
    flow: 'payment_confirm',
    confirmed: true,
    orderId: orderId || 'ORD-CONF-' + Date.now(),
    serverSubtotal: Number(actualSubtotal) || 374000,
    acceptedPaymentAmount: approvedPayment,
    message: '결제 승인 준비가 확인되었습니다.'
  });
});

// MAIN PAYMENT EXECUTION API (Price Tampering vulnerability endpoint)
app.post('/api/payment', (req, res) => {
  const {
    performanceId,
    title,
    venue,
    seatGrade,
    seats,
    quantity,
    paymentAmount,
    actualSubtotal,
    couponCode,
    paymentMethod,
    flowOrigin
  } = req.body || {};

  // Intentional Price Tampering Bug:
  // Server accepts whatever paymentAmount client submits
  const qty = Number(quantity) || 1;
  const approvedAmount = Number(paymentAmount) !== undefined && !isNaN(Number(paymentAmount))
    ? Number(paymentAmount)
    : (Number(actualSubtotal) || 154000);

  const newBooking = {
    orderId: 'TKT-2026-' + Math.floor(1000 + Math.random() * 9000),
    performanceId: performanceId || 'perf_01',
    title: title || '2026 라이브 콘서트 티켓',
    venue: venue || 'KSPO DOME',
    performanceDate: '2026-11-14 19:00',
    seatGrade: seatGrade || 'VIP',
    seats: seats || ['VIP석 01열 1번', 'VIP석 01열 2번'],
    quantity: qty,
    unitPrice: Math.round((actualSubtotal || approvedAmount) / qty),
    serverSubtotal: Number(actualSubtotal) || approvedAmount,
    discountApplied: couponCode ? 20000 : 0,
    paidAmount: approvedAmount,
    paymentMethod: paymentMethod || '신용카드',
    flowOrigin: flowOrigin || '직접 예매',
    status: '예매 완료 (티켓 발권 완료)',
    createdAt: new Date().toISOString().split('T')[0]
  };

  bookings.unshift(newBooking);

  res.json({
    status: 'success',
    booking: newBooking,
    approvedAmount: approvedAmount,
    serverCalculatedSubtotal: Number(actualSubtotal) || approvedAmount,
    flowOrigin: flowOrigin || '직접 예매',
    message: `[${newBooking.title}] 예매가 성공적으로 완료되었습니다!`
  });
});

// ====================================================
// NORMAL API ENDPOINTS
// ====================================================

// GET /api/performances
app.get('/api/performances', (req, res) => {
  res.json({ status: 'success', performances });
});

// GET /api/performances/:id
app.get('/api/performances/:id', (req, res) => {
  const perf = performances.find(p => p.id === req.params.id);
  if (perf) {
    res.json({ status: 'success', performance: perf });
  } else {
    res.status(404).json({ error: '해당 공연을 찾을 수 없습니다.' });
  }
});

// GET /api/profile
app.get('/api/profile', (req, res) => {
  res.json({ status: 'success', user: userProfile });
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
  res.json({ status: 'success', cart });
});

// GET /api/bookings
app.get('/api/bookings', (req, res) => {
  res.json({ status: 'success', bookings });
});

// GET /api/wishlist
app.get('/api/wishlist', (req, res) => {
  const items = performances.filter(p => wishlist.includes(p.id));
  res.json({ status: 'success', wishlist: items });
});

// POST /api/wishlist/toggle
app.post('/api/wishlist/toggle', (req, res) => {
  const { performanceId } = req.body || {};
  const idx = wishlist.indexOf(performanceId);
  if (idx >= 0) {
    wishlist.splice(idx, 1);
  } else if (performanceId) {
    wishlist.push(performanceId);
  }
  const items = performances.filter(p => wishlist.includes(p.id));
  res.json({ status: 'success', wishlist: items, isWishlisted: idx < 0 });
});

// GET /api/coupons
app.get('/api/coupons', (req, res) => {
  res.json({ status: 'success', coupons });
});

// Static assets and SPA fallback
app.use(express.static(pathModule.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(pathModule.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) res.sendFile(pathModule.join(__dirname, 'index.html'));
  });
});

app.listen(PORT, () => {
  console.log(`[Starlight Ticket Server] Running at http://localhost:${PORT}`);
});
