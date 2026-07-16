import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5006;

app.use(cors());
app.use(express.json());

// Inlined Food SVGs served as mock files
const burgerSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23f59e0b"/><rect x="20" y="45" width="60" height="10" rx="3" fill="%23dc2626"/><rect x="15" y="38" width="70" height="8" rx="2" fill="%2316a34a"/><path d="M15,46 Q50,15 85,46 Z" fill="%23d97706"/></svg>`;
const pizzaSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50,10 L90,80 L10,80 Z" fill="%23fcd34d"/><circle cx="50" cy="45" r="5" fill="%23dc2626"/><circle cx="35" cy="65" r="6" fill="%23dc2626"/><circle cx="65" cy="65" r="4" fill="%23dc2626"/><path d="M10,80 L90,80" stroke="%23b45309" stroke-width="6"/></svg>`;
const noodleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M15,40 L85,40 L75,80 L25,80 Z" fill="%2394a3b8"/><path d="M10,40 Q50,20 90,40" stroke="%23f59e0b" stroke-width="4" fill="none"/><path d="M20,38 Q50,5 80,38" stroke="%23f59e0b" stroke-width="3" fill="none"/></svg>`;
const sushiSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="40" width="60" height="30" rx="8" fill="%23f8fafc"/><rect x="18" y="25" width="64" height="18" rx="4" fill="%23ea580c"/><rect x="35" y="20" width="10" height="8" fill="%2316a34a"/></svg>`;
const chickenSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,60 Q10,40 30,30 Q50,20 70,40 Q90,50 80,70 Q60,90 40,80 Z" fill="%23b45309"/><circle cx="65" cy="40" r="3" fill="white"/><path d="M70,80 L90,90" stroke="%23fcd34d" stroke-width="6"/></svg>`;

// Case-Sensitive static image file store
const imageFiles = {
  "burger.png": burgerSvg,
  "pizza.png": pizzaSvg,
  "noodle.png": noodleSvg,
  "sushi.png": sushiSvg,
  // 소문자 파일명만 등록됨
  "chicken-plate.png": chickenSvg
};

// Restaurants local database
let restaurants = [
  {
    id: "rest-01",
    name: "맥스버거 딜리버리",
    category: "버거",
    rating: 4.8,
    deliveryTime: "20-30분",
    deliveryFee: 2000,
    menus: [
      { id: "menu-101", name: "시그니처 더블 비프버거", price: 8900, image: "burger.png" },
      { id: "menu-102", name: "치즈 갈릭 포테이토 세트", price: 6500, image: "burger.png" }
    ]
  },
  {
    id: "rest-02",
    name: "피자파크 오리지널",
    category: "피자",
    rating: 4.7,
    deliveryTime: "25-35분",
    deliveryFee: 2500,
    menus: [
      { id: "menu-201", name: "리치 골드 포테이토 피자", price: 21900, image: "pizza.png" },
      { id: "menu-202", name: "페퍼로니 오븐 스파게티", price: 7900, image: "pizza.png" }
    ]
  },
  {
    id: "rest-03",
    name: "향원 정통 중식",
    category: "중식",
    rating: 4.6,
    deliveryTime: "15-25분",
    deliveryFee: 1500,
    menus: [
      { id: "menu-301", name: "수제 짜장면 & 군만두 세트", price: 9000, image: "noodle.png" },
      { id: "menu-302", name: "찹쌀 꿔바로우 탕수육", price: 18000, image: "noodle.png" }
    ]
  },
  {
    id: "rest-04",
    name: "동경 수제 초밥",
    category: "일식",
    rating: 4.9,
    deliveryTime: "30-40분",
    deliveryFee: 3000,
    menus: [
      { id: "menu-401", name: "특선 모듬초밥 (12pcs)", price: 17500, image: "sushi.png" },
      { id: "menu-402", name: "생연어 덮밥 (사케동)", price: 14000, image: "sushi.png" }
    ]
  },
  {
    id: "rest-05",
    name: "핫스파이스 바삭 치킨",
    category: "치킨",
    rating: 4.7,
    deliveryTime: "30-40분",
    deliveryFee: 2000,
    menus: [
      // INTENTIONAL_ERROR
      // CATEGORY: Server
      // DESCRIPTION: restaurant-05의 첫 번째 메뉴 이미지 경로명을 대소문자가 섞인 'chicken-PLATE.png'로 기재해 내려보냅니다.
      // 서버의 static 파일 맵 상에는 전부 소문자인 'chicken-plate.png'로 매칭되어 있으므로 대소문자를 구분하는 
      // 이미지 조회 미들웨어에서 404가 발생하여 일부 환경(또는 라우터 매핑)에서 엑스박스가 발생합니다.
      { id: "menu-501", name: "핫스파이스 크리스피 치킨", price: 19000, image: "chicken-PLATE.png" },
      { id: "menu-502", name: "맛초킹 소이치킨", price: 20000, image: "chicken-plate.png" }
    ]
  }
];

// Coupons database
let coupons = [
  { id: "WELCOME1000", name: "첫 수강 1,000원 할인 쿠폰", discount: 1000, used: false },
  { id: "MEALBAEDAL3000", name: "주말 전용 배달 3,000원 쿠폰", discount: 3000, used: false }
];

// Orders database
let orders = [];

// API: Get restaurants list
app.get('/api/restaurants', (req, res) => {
  res.json(restaurants);
});

// API: Get coupons list
app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});

// API: Create new order (Error 2)
app.post('/api/orders', (req, res) => {
  const { items, couponId, totalPrice, address } = req.body;

  if (!items || items.length === 0 || !address) {
    return res.status(400).json({ error: "주문할 품목이나 주소지가 입력되지 않았습니다." });
  }

  const restaurantIds = [...new Set(items.map(i => i.restaurantId))];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 서로 다른 두 개 이상의 음식점 메뉴가 장바구니에 혼합되어 있을 경우,
  // 본래 가맹점 결제 모듈 중복 바인딩을 차단하기 위해 HTTP 409 Conflict 등의 상태코드를 반환해야 하지만,
  // 이를 묵살하고 가짜 처리 예외를 유도해 HTTP 500 Internal Server Error 상태코드를 전송합니다.
  if (restaurantIds.length > 1) {
    return res.status(500).json({
      error: "Internal Server Error: TransactionSystemException - Multiple merchant bindings found in order request body."
    });
  }

  // Create order
  const newOrder = {
    id: `ord-${Date.now()}`,
    items,
    couponId,
    totalPrice: Number(totalPrice),
    address,
    status: "주문 완료", // 단계형 타임라인 진행 상태
    createdAt: new Date().toISOString()
  };

  // Set coupon to used
  if (couponId) {
    const cp = coupons.find(c => c.id === couponId);
    if (cp) {
      cp.used = true;
    }
  }

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// API: Get Orders list
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Cancel Order (Error 3)
app.post('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  }

  order.status = "주문 취소됨";

  // INTENTIONAL_ERROR
  // CATEGORY: Database (Coupon state tracking)
  // DESCRIPTION: 주문을 성공적으로 취소시켰으나, 주문 체결 과정에서 사용 상태로 강제 변경되었던 
  // 할인 쿠폰의 사용 상태(used = true)를 원복시켜 다시 사용가능하게 바꾸는 구문(cp.used = false)을 누락시킵니다.
  /*
  if (order.couponId) {
    const cp = coupons.find(c => c.id === order.couponId);
    if (cp) cp.used = false; // <-- 의도적으로 누락하여 데이터 불일치 상태 유지
  }
  */

  res.json({ success: true, order });
});

// API: Address Search (Error 5)
app.get('/api/address/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "검색 질의가 비어 있습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 주소 검색어로 '테스트동'이라는 특정 단어가 입력되면,
  // 서버에서 7초(7000ms) 동안 아무런 처리를 하지 않고 응답 송신을 지연시킵니다.
  if (query === '테스트동') {
    await new Promise(resolve => setTimeout(resolve, 7000));
  }

  const mockAddresses = [
    { name: "서울시 마포구 테스트동 12번지", code: "12345" },
    { name: "서울시 강남구 테스트동 88-99 대성타워", code: "06123" },
    { name: "경기도 성남시 분당구 테스트동 삼평빌라", code: "13524" }
  ];

  const filtered = mockAddresses.filter(addr => addr.name.includes(query));
  res.json(filtered);
});

// API: Case-sensitive Image serve endpoint (Error 4)
app.get('/images/:filename', (req, res) => {
  const { filename } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Server (MIME / File path case-sensitive)
  // DESCRIPTION: 정적 이미지 서빙 요청 시 대소문자를 엄격히 구분하도록 대조합니다.
  // chicken-PLATE.png가 들어왔을 때 소문자 키로 저장된 chicken-plate.png를 반환하지 못하고 
  // 404 Not Found를 출력하도록 하여, 윈도우에서는 통과될 수 있는 코드가 리눅스 환경 등에서 깨지도록 설계합니다.
  if (imageFiles[filename]) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(imageFiles[filename]);
  }

  res.status(404).send(`Image Not Found (Case Sensitive Match Failed for: ${filename})`);
});

app.listen(PORT, () => {
  console.log(`[MealDash Backend] Express server running on http://localhost:${PORT}`);
});
