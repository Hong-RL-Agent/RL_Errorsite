import express from 'express';
import cors from 'cors';
import pathModule from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9926;

app.use(cors({
  exposedHeaders: ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options']
}));
app.use(express.json());

// Expose headers middleware
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

// ----------------------------------------------------
// Mock Travel Database
// ----------------------------------------------------
let travelProducts = [
  {
    id: 'p1',
    title: '제주 신라호텔 Ocean View & 조식 2인 패키지',
    category: '5성급 호텔',
    location: '제주 서귀포시',
    price: 340000,
    rating: 4.9,
    reviewsCount: 128,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=60',
    desc: '중문 해수욕장 전경을 한눈에 담는 클래식 럭셔리 스테이. 야외 온수 풀과 프라이빗 라운지 이용권 포함',
    amenities: ['무료 Wi-Fi', '야외 온실 수영장', '조식 뷔페', '발렛 파킹', '피트니스 센터']
  },
  {
    id: 'p2',
    title: '도쿄 롯폰기 힐즈 감성 독채 펜션 스테이',
    category: '감성 펜션',
    location: '일본 도쿄',
    price: 210000,
    rating: 4.8,
    reviewsCount: 94,
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=60',
    desc: '도쿄 타워 야경이 내려다보이는 모던 감성 하우스. 지하철역 도보 3분 및 번화가 접근성 최상',
    amenities: ['개별 테라스', '주방 시설', '네스프레소 머신', '무료 Wi-Fi']
  },
  {
    id: 'p3',
    title: '발리 우붓 리조트 앤 아유르베다 스파 풀빌라',
    category: '풀빌라',
    location: '인도네시아 발리',
    price: 450000,
    rating: 5.0,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60',
    desc: '정글 뷰 인피니티 풀과 프라이빗 스파 케어가 결합된 천국의 휴양지 리조트 패키지',
    amenities: ['개별 인피니티 풀', '플로팅 조식', '무료 스파 1회', '공항 픽업']
  },
  {
    id: 'p4',
    title: '파리 세느강 프라이빗 요트 투어 & 와인 도슨트',
    category: '액티비티 투어',
    location: '프랑스 파리',
    price: 180000,
    rating: 4.9,
    reviewsCount: 76,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=60',
    desc: '에펠탑 야경과 함께 즐기는 2시간 프라이빗 요트 크루즈 및 프랑스 최고급 샤토 와인 테이스팅',
    amenities: ['전문 도슨트 가이드', '프랑스 와인 3종', '치즈 플래터', '기념 사진 촬영']
  },
  {
    id: 'p5',
    title: '강릉 경포대 오션뷰 럭셔리 독채 글램핑',
    category: '감성 펜션',
    location: '강원 강릉시',
    price: 165000,
    rating: 4.7,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&auto=format&fit=crop&q=60',
    desc: '파도 소리와 함께 즐기는 하이엔드 오션뷰 캠핑. 야외 불멍 불꽃 세트와 바베큐 다이닝 팩 포함',
    amenities: ['BBQ 불멍 세트', '개별 욕실', '빔프로젝터', '냉난방 완비']
  },
  {
    id: 'p6',
    title: '하와이 와이키키 비치프론트 리조트 4박 패키지',
    category: '5성급 호텔',
    location: '미국 하와이',
    price: 780000,
    rating: 4.9,
    reviewsCount: 150,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60',
    desc: '와이키키 해변에 바로 연결되는 럭셔리 오션프론트 룸과 하와이안 패밀리 바베큐 디너권',
    amenities: ['비치 카바나 무료', '오션뷰 발코니', '서핑 강습 1회', '조식 포함']
  }
];

let cartItems = [
  {
    id: 'cart_101',
    productId: 'p1',
    title: '제주 신라호텔 Ocean View & 조식 2인 패키지',
    price: 340000,
    guests: '성인 2명',
    dates: '2026-09-10 ~ 2026-09-12'
  }
];

let reservationOrders = [
  {
    orderId: 'ORD_20260814_01',
    productId: 'p3',
    title: '발리 우붓 리조트 앤 아유르베다 스파 풀빌라',
    price: 450000,
    status: '예약 완료',
    buyerName: '김여행',
    buyerPhone: '010-1234-5678',
    memo: '전망 좋은 고층 객실 배정 요청드립니다.',
    createdAt: '2026-08-14'
  }
];

let reviewsList = [
  {
    id: 1,
    productId: 'p1',
    author: '이수진',
    rating: 5,
    comment: '오션뷰 객실 상태가 정말 깨끗하고 조식 뷔페 퀄리티가 환상적이었습니다!',
    date: '2026-08-01'
  },
  {
    id: 2,
    productId: 'p3',
    author: '박민우',
    rating: 5,
    comment: '풀빌라 프라이빗 인피니티 풀에서 보는 정글 석양이 잊혀지지 않네요.',
    date: '2026-08-05'
  }
];

let uploadedFiles = [];
let userProfile = {
  name: '김여행',
  email: 'traveler@tripscape.com',
  phone: '010-1234-5678',
  passportName: 'KIM TRAVELER',
  bio: '세계 모든 도시의 감성 숙소와 프라이빗 투어를 탐험하는 자유 여행가입니다.'
};

// ----------------------------------------------------
// APIs Implementation
// ----------------------------------------------------

// GET /api/health (Normal response)
app.get('/api/health', (req, res) => {
  applyNormalSecurityHeaders(res);
  res.json({ status: 'OK' });
});

// INTENTIONAL BACKEND BUG
// SEC-271: Security headers intentionally missing
app.get('/api/search', (req, res) => {
  // Vulnerable: Omit Content-Security-Policy & Strict-Transport-Security
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  const { destination, category } = req.query;
  let results = travelProducts;

  if (destination) {
    results = results.filter(p => p.location.includes(destination) || p.title.includes(destination) || p.desc.includes(destination));
  }
  if (category && category !== '전체') {
    results = results.filter(p => p.category === category);
  }

  res.json(results);
});

// INTENTIONAL BACKEND BUG
// SEC-274: Security headers intentionally missing
// INTENTIONAL BACKEND BUG
// SEC-280: Security headers intentionally missing
app.get('/api/products', (req, res) => {
  const { filter } = req.query;

  if (filter) {
    // SEC-280 trigger: Omit Content-Security-Policy & Strict-Transport-Security
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const filtered = travelProducts.filter(p => p.category === filter || p.location.includes(filter));
    return res.json(filtered);
  }

  // SEC-274 trigger: Omit Content-Security-Policy & X-Content-Type-Options
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.json(travelProducts);
});

// GET /api/products/:id (Normal response)
app.get('/api/products/:id', (req, res) => {
  applyNormalSecurityHeaders(res);
  const matched = travelProducts.find(p => p.id === req.params.id);
  if (matched) res.json(matched);
  else res.status(404).json({ error: '여행 상품을 찾을 수 없습니다.' });
});

// INTENTIONAL BACKEND BUG
// SEC-272: Security headers intentionally missing
app.post('/api/profile', (req, res) => {
  // Vulnerable: Omit X-Content-Type-Options & Content-Security-Policy
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  const { name, bio, phone, passportName } = req.body || {};
  if (name) userProfile.name = name;
  if (bio) userProfile.bio = bio;
  if (phone) userProfile.phone = phone;
  if (passportName) userProfile.passportName = passportName;

  res.json({ status: 'success', profile: userProfile });
});

// INTENTIONAL BACKEND BUG
// SEC-273: Security headers intentionally missing
app.post('/api/support', (req, res) => {
  // Vulnerable: Omit Strict-Transport-Security & X-Content-Type-Options
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  const { inquiryType, message, contact } = req.body || {};
  res.json({
    status: 'success',
    ticketId: 'SUP_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    message: '여행 1:1 고객 문의가 성공적으로 등록되었습니다.'
  });
});

// INTENTIONAL BACKEND BUG
// SEC-275: Security headers intentionally missing
app.post('/api/files', (req, res) => {
  // Vulnerable: Omit Strict-Transport-Security & Content-Security-Policy
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { fileName, fileDesc } = req.body || {};
  const fileEntry = {
    id: 'FILE_' + Date.now(),
    fileName: fileName || '여권사본_첨부.pdf',
    fileDesc: fileDesc || '여행자 확인용 여권 및 증빙 서류',
    uploadedAt: new Date().toISOString().split('T')[0]
  };
  uploadedFiles.push(fileEntry);

  res.json({ status: 'success', file: fileEntry });
});

// INTENTIONAL BACKEND BUG
// SEC-276: Security headers intentionally missing
app.post('/api/reviews', (req, res) => {
  // Vulnerable: Omit X-Content-Type-Options & Strict-Transport-Security
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  const { productId, rating, comment } = req.body || {};
  const rev = {
    id: reviewsList.length + 1,
    productId: productId || 'p1',
    author: userProfile.name,
    rating: Number(rating) || 5,
    comment: comment || '정말 훌륭한 여행이었습니다!',
    date: new Date().toISOString().split('T')[0]
  };
  reviewsList.unshift(rev);

  res.json({ status: 'success', review: rev });
});

// INTENTIONAL BACKEND BUG
// SEC-277: Security headers intentionally missing
app.post('/api/orders/reservation', (req, res) => {
  // Vulnerable: Omit Content-Security-Policy & Strict-Transport-Security
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { productId, buyerName, buyerPhone, memo, dates, guests } = req.body || {};
  const matchedProduct = travelProducts.find(p => p.id === productId) || travelProducts[0];

  const newOrder = {
    orderId: 'ORD_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '_' + Math.floor(Math.random()*100),
    productId: matchedProduct.id,
    title: matchedProduct.title,
    price: matchedProduct.price,
    status: '예약 완료',
    buyerName: buyerName || userProfile.name,
    buyerPhone: buyerPhone || userProfile.phone,
    memo: memo || '요청 사항 없음',
    dates: dates || '2026-09-01 ~ 2026-09-03',
    guests: guests || '성인 2명',
    createdAt: new Date().toISOString().split('T')[0]
  };

  reservationOrders.unshift(newOrder);
  res.json({ status: 'success', order: newOrder });
});

// INTENTIONAL BACKEND BUG
// SEC-278: Security headers intentionally missing
app.post('/api/cart', (req, res) => {
  // Vulnerable: Omit X-Content-Type-Options & Content-Security-Policy
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  const { productId, guests, dates } = req.body || {};
  const matchedProduct = travelProducts.find(p => p.id === productId);

  if (matchedProduct) {
    const cartItem = {
      id: 'cart_' + Date.now(),
      productId: matchedProduct.id,
      title: matchedProduct.title,
      price: matchedProduct.price,
      guests: guests || '성인 2명',
      dates: dates || '2026-09-10 ~ 2026-09-12'
    };
    cartItems.push(cartItem);
    res.json({ status: 'success', cart: cartItems });
  } else {
    res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  }
});

// GET /api/cart (Normal response)
app.get('/api/cart', (req, res) => {
  applyNormalSecurityHeaders(res);
  res.json(cartItems);
});

// INTENTIONAL BACKEND BUG
// SEC-279: Security headers intentionally missing
app.post('/api/payment', (req, res) => {
  // Vulnerable: Omit Strict-Transport-Security & X-Content-Type-Options
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  const { paymentMethod, amount, items } = req.body || {};
  
  // Clear cart after payment
  cartItems = [];

  res.json({
    status: 'success',
    paymentId: 'PAY_' + Date.now(),
    amount: amount || 340000,
    paymentMethod: paymentMethod || '신용/체크카드',
    message: '결제가 성공적으로 승인되었습니다.'
  });
});

// GET /api/orders (Normal response)
app.get('/api/orders', (req, res) => {
  applyNormalSecurityHeaders(res);
  res.json(reservationOrders);
});

// Static files and SPA fallback
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
  console.log(`[TripScape Travel Server] Running at http://localhost:${PORT}`);
});
