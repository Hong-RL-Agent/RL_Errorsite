import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9910;

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
// Mock Database State
// ----------------------------------------------------
let brands = [
  { id: 'blank-noir', name: 'Blank Noir', concept: '미니멀 클래식 & 다크웨어' },
  { id: 'maison-beige', name: 'Maison de Beige', concept: '프렌치 캐주얼 & 자연주의' },
  { id: 'ader-studio', name: 'Ader Studio', concept: '해체주의 스트릿 웨어' },
  { id: 'object-seoul', name: 'Object Seoul', concept: '아방가르드 & 유니크 실루엣' }
];

let products = [
  {
    id: 1,
    name: '캐시미어 오버사이즈 싱글 코트',
    brandId: 'blank-noir',
    brandName: 'Blank Noir',
    category: 'Outer',
    price: 289000,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    description: '최고급 터키산 캐시미어 혼방 원사로 제작된 미니멀한 맥시 실루엣 코트입니다.',
    rating: 4.8,
    reviewsCount: 35,
    likes: 124
  },
  {
    id: 2,
    name: '워시드 피그먼트 루즈핏 맨투맨',
    brandId: 'ader-studio',
    brandName: 'Ader Studio',
    category: 'Top',
    price: 119000,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
    description: '자연스러운 피그먼트 다잉 워싱과 시그니처 로고 패치가 돋보이는 맨투맨.',
    rating: 4.9,
    reviewsCount: 82,
    likes: 245
  },
  {
    id: 3,
    name: '와이드 핏 셀비지 생지 데님',
    brandId: 'object-seoul',
    brandName: 'Object Seoul',
    category: 'Bottom',
    price: 89000,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
    description: '탄탄한 14oz 콘밀 데님 원단으로 제작되어 체형을 잡아주는 와이드 셀비지 청바지.',
    rating: 4.6,
    reviewsCount: 41,
    likes: 98
  },
  {
    id: 4,
    name: '프렌치 린넨 스트라이프 셔츠',
    brandId: 'maison-beige',
    brandName: 'Maison de Beige',
    category: 'Top',
    price: 78000,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    description: '시원하고 통기성이 우수한 내추럴 린넨 셔츠. 데일리 캐주얼 룩으로 적합합니다.',
    rating: 4.7,
    reviewsCount: 19,
    likes: 67
  },
  {
    id: 5,
    name: '스플릿 래글런 트렌치 코트',
    brandId: 'maison-beige',
    brandName: 'Maison de Beige',
    category: 'Outer',
    price: 245000,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    description: '클래식한 더블 브레스트 사양에 트렌디한 벌룬 핏 실루엣을 접목한 코트.',
    rating: 4.5,
    reviewsCount: 12,
    likes: 83
  },
  {
    id: 6,
    name: '크로커다일 엠보 레더 더비 슈즈',
    brandId: 'blank-noir',
    brandName: 'Blank Noir',
    category: 'Shoes',
    price: 168000,
    image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=600&q=80',
    description: '은은한 광택과 입체적인 크로커다일 패턴이 가미된 소가죽 로우컷 수제 더비.',
    rating: 4.9,
    reviewsCount: 22,
    likes: 112
  }
];

let reviews = [
  {
    id: 1,
    productId: 1,
    author: '패션킹',
    rating: 5,
    content: '코트 핏감이 정말 예술입니다! 키 180인데 무릎 밑까지 시크하게 딱 내려와요. 원단 퀄리티도 백화점 고급 브랜드 못지않네요.',
    date: '2026-07-30'
  },
  {
    id: 2,
    productId: 2,
    author: '트렌드세터',
    rating: 4,
    content: '색감이 정말 예쁘게 잘 빠졌습니다. 피그먼트 색감이라 어떤 바지에 매치해도 내추럴하고 예쁘네요. 다만 기장이 살짝 숏해요.',
    date: '2026-08-01'
  }
];

let notices = [
  { id: 1, title: '2026 F/W 시즌 런웨이 컬렉션 런칭 및 할인 쿠폰 발급 안내', date: '2026-08-01', views: 342, body: '안녕하세요. FashionMall입니다. 올 가을/겨울 트렌드를 이끌 F/W 컬렉션이 정식 오픈되었습니다. 오픈 기념 10% 웰컴팩 쿠폰번호 [FWWELCOME]를 입력하고 할인 혜택을 받아보세요.' },
  { id: 2, title: '[공지] 추석 연휴 기간 배송 일정 및 고객센터 운영시간 안내', date: '2026-07-28', views: 890, body: '택배사 사정으로 인해 9월 10일부터 순차 배송이 일시 마감되며 연휴 기간 배송 물량 폭주로 지연될 수 있는 점 양해 부탁드립니다.' },
  { id: 3, title: '[이벤트] 인스타그램 오오티디(OOTD) 스타일링 포토 리뷰 당첨자 발표', date: '2026-07-25', views: 154, body: '7월 베스트 포토 리뷰어로 선정되신 5분의 당첨을 축하드립니다. 개별 문자를 통해 3만 원 상당의 적립금이 지급되었습니다.' }
];

let cart = [
  { id: 1, productId: 3, name: '와이드 핏 셀비지 생지 데님', price: 89000, quantity: 1, size: 'L' }
];

let profile = {
  username: 'customer',
  nickname: '스타일리스트_주이',
  email: 'customer@fashionmall.co.kr',
  address: '서울특별시 강남구 신사동 542-12 패션빌딩 3층',
  coupons: [
    { code: 'FWWELCOME', discount: 10000, used: false },
    { code: 'MOCKSPECIAL', discount: 20000, used: false }
  ]
};

let orders = [
  {
    orderId: 'FM-2026-0802-7711',
    date: '2026-07-29',
    productName: '워시드 피그먼트 루즈핏 맨투맨 외 1건',
    amount: 208000,
    address: '서울특별시 강남구 신사동 542-12 패션빌딩 3층',
    status: '배송중'
  }
];

let chatMessages = [
  { id: 1, sender: 'CS_BOT', text: '안녕하세요! FashionMall 1:1 실시간 상담봇입니다. 사이즈 추천, 반품 접수 등 문의사항을 남겨주시면 상담원이 빠르게 안내해 드립니다.', time: '오후 1:00' }
];

let uploadedFiles = [];

// ----------------------------------------------------
// Basic APIs
// ----------------------------------------------------

// GET /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'FashionMall API' });
});

// GET /api/brands
app.get('/api/brands', (req, res) => {
  res.json(brands);
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
  res.json(cart);
});

// POST /api/cart/add
app.post('/api/cart/add', (req, res) => {
  const { productId, size } = req.body;
  const prod = products.find(p => p.id === productId);
  if (!prod) return res.status(404).json({ error: 'Product not found' });

  const existing = cart.find(item => item.productId === productId && item.size === size);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: Date.now(),
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: 1,
      size: size || 'FREE'
    });
  }
  res.json({ success: true, cart });
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// GET /api/profile
app.get('/api/profile', (req, res) => {
  res.json(profile);
});


// ----------------------------------------------------
// INTENTIONAL BACKEND VULNERABLE ENDPOINTS (Reflected XSS)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG: site011-bug01
// CSV: SEC-101
// Type: Reflected XSS
// Description: 로그인 입력값을 HTML Escape 없이 Preview 화면에 그대로 출력한다.
app.post('/api/login/preview', (req, res) => {
  const username = req.body.username || '';
  res.json({
    username: username
  });
});

// INTENTIONAL BACKEND BUG: site011-bug02
// CSV: SEC-102
// Type: Reflected XSS
// Description: 회원가입 입력값을 가입 미리보기 화면에 그대로 출력한다.
app.post('/api/signup/preview', (req, res) => {
  const nickname = req.body.nickname || '';
  res.json({
    nickname: nickname
  });
});

// INTENTIONAL BACKEND BUG: site011-bug03
// CSV: SEC-103
// Type: Reflected XSS
// Description: 배송지 주소 입력값을 배송 확인 미리보기 화면에 그대로 출력한다.
app.post('/api/address/preview', (req, res) => {
  const address = req.body.address || '';
  res.json({
    address: address
  });
});

// INTENTIONAL BACKEND BUG: site011-bug04
// CSV: SEC-104
// Type: Reflected XSS
// Description: 쿠폰 코드를 적용 결과 미리보기 화면에 그대로 출력한다.
app.post('/api/coupon/preview', (req, res) => {
  const couponCode = req.body.couponCode || '';
  res.json({
    couponCode: couponCode,
    valid: true,
    discount: 10000
  });
});

// INTENTIONAL BACKEND BUG: site011-bug05
// CSV: SEC-105
// Type: Reflected XSS
// Description: 정렬 옵션 파라미터를 이스케이프 없이 상품 목록 결과 헤더에 노출한다.
app.get('/api/products/sort', (req, res) => {
  const sort = req.query.sort || '';
  res.json({
    sort: sort,
    products: products // Simply echo products
  });
});

// INTENTIONAL BACKEND BUG: site011-bug06
// CSV: SEC-106
// Type: Reflected XSS
// Description: 페이지 번호 파라미터를 이스케이프 없이 화면 페이지 지시 정보에 출력한다.
app.get('/api/products/page', (req, res) => {
  const page = req.query.page || '1';
  res.json({
    page: page,
    products: products
  });
});

// INTENTIONAL BACKEND BUG: site011-bug07
// CSV: SEC-107
// Type: Reflected XSS
// Description: 업로드 파일명을 업로드 완료 미리보기 정보 창에 그대로 출력한다.
app.post('/api/upload/preview', (req, res) => {
  const filename = req.body.filename || '';
  res.json({
    filename: filename,
    status: 'uploaded',
    size: '1.2MB'
  });
});

// INTENTIONAL BACKEND BUG: site011-bug08
// CSV: SEC-108
// Type: Reflected XSS
// Description: 실시간 채팅 입력 상담 메시지를 대화방에 그대로 출력한다.
app.post('/api/chat/preview', (req, res) => {
  const message = req.body.message || '';
  res.json({
    message: message
  });
});

// INTENTIONAL BACKEND BUG: site011-bug09
// CSV: SEC-109
// Type: Reflected XSS
// Description: 공지사항 검색 키워드를 검색 결과 영역 상단에 그대로 노출한다.
app.get('/api/notices/search', (req, res) => {
  const keyword = req.query.keyword || '';
  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(keyword.toLowerCase()) ||
    n.body.toLowerCase().includes(keyword.toLowerCase())
  );
  res.json({
    keyword: keyword,
    notices: filteredNotices
  });
});

// INTENTIONAL BACKEND BUG: site011-bug10
// CSV: SEC-110
// Type: Reflected XSS
// Description: 상품 리뷰 내용 입력값 미리보기 생성 시 HTML Escape 처리를 생략한다.
app.post('/api/reviews/preview', (req, res) => {
  const content = req.body.content || '';
  res.json({
    content: content
  });
});


// ----------------------------------------------------
// SAFE ENDPOINTS (HTML Escaped)
// ----------------------------------------------------

app.get('/api/safe/login', (req, res) => {
  const username = req.query.username || '';
  res.json({
    username: escapeHTML(username)
  });
});

app.get('/api/safe/products', (req, res) => {
  const sort = req.query.sort || '';
  const page = req.query.page || '1';
  res.json({
    sort: escapeHTML(sort),
    page: escapeHTML(page),
    products: products
  });
});

app.post('/api/safe/reviews', (req, res) => {
  const content = req.body.content || '';
  res.json({
    content: escapeHTML(content)
  });
});

app.post('/api/safe/chat', (req, res) => {
  const message = req.body.message || '';
  res.json({
    message: escapeHTML(message)
  });
});

// Additional safe endpoints to fully support frontend safe-mode paths
app.post('/api/safe/signup', (req, res) => {
  const nickname = req.body.nickname || '';
  res.json({
    nickname: escapeHTML(nickname)
  });
});

app.post('/api/safe/address', (req, res) => {
  const address = req.body.address || '';
  res.json({
    address: escapeHTML(address)
  });
});

app.post('/api/safe/coupon', (req, res) => {
  const couponCode = req.body.couponCode || '';
  res.json({
    couponCode: escapeHTML(couponCode),
    valid: true,
    discount: 10000
  });
});

app.post('/api/safe/upload', (req, res) => {
  const filename = req.body.filename || '';
  res.json({
    filename: escapeHTML(filename),
    status: 'uploaded',
    size: '1.2MB'
  });
});

app.get('/api/safe/notices/search', (req, res) => {
  const keyword = req.query.keyword || '';
  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(keyword.toLowerCase()) ||
    n.body.toLowerCase().includes(keyword.toLowerCase())
  );
  res.json({
    keyword: escapeHTML(keyword),
    notices: filteredNotices
  });
});

// GET /api/products (General products list helper, handles sort and page optionally for regular requests)
app.get('/api/products', (req, res) => {
  const sort = req.query.sort || '';
  const page = req.query.page || '';
  // Return regular response
  res.json({
    sort: sort,
    page: page,
    products: products
  });
});


// ----------------------------------------------------
// Static Client Serving & React Build Fallback
// ----------------------------------------------------
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Listen on designated port
app.listen(PORT, () => {
  console.log(`[FashionMall Server] Running at http://localhost:${PORT}`);
});
