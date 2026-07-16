import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5038;

app.use(cors());
app.use(express.json());

// Producers Database (6 farmers)
let producers = [
  { id: "producer-01", name: "김성실 농부", bio: "강원도 청정 고원지대에서 3대째 대를 이어 전통 유기농법으로 감자와 배추를 재배하고 있습니다.", region: "강원도 평창", image: "producer-01.png" },
  { id: "producer-02", name: "이지혜 농부", bio: "첨단 친환경 온실 시스템을 활용하여 농약 없이도 싱그럽고 달콤한 토마토와 쌈채소를 생산합니다.", region: "충청남도 논산", image: "producer-02.png" },
  { id: "producer-03", name: "박수확 농부", bio: "금강 하구의 비옥한 만경평야에서 미네랄이 풍부한 일급 햇살 쌀과 고구마를 수확하고 있습니다.", region: "전라북도 김제", image: "producer-03.png" },
  
  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: producer-04의 프로필 이미지 파일명을 대문자인 'PRODUCER-04.png'로 
  // 기입해 두어, 라우터에서 소문자 요청으로 수신 시 대소문자를 엄격히 구분하도록 조작하여 
  // 브라우저 렌더링 시 깨짐을 유발합니다.
  { id: "producer-04", name: "최명인 농부", bio: "전통 방식 그대로의 황토 옹기에서 숙성한 된장, 고추장과 고랭지 김치를 빚어내는 농식품 명인입니다.", region: "경상북도 안동", image: "PRODUCER-04.png" },
  
  { id: "producer-05", name: "정자연 농부", bio: "자연 그대로의 솔밭 아래서 무농약 천연 벌꿀을 채밀하고 신선한 유기농 표고버섯을 기르고 있습니다.", region: "전라남도 장흥", image: "producer-05.png" },
  { id: "producer-06", name: "황보람 농부", bio: "스마트 제어 수경재배 시설을 통해 사계절 내내 당도가 높은 왕딸기와 신선한 허브류를 수확합니다.", region: "경기도 남양주", image: "producer-06.png" }
];

// Products Database (14 products)
let products = [
  { id: "product-01", name: "강원도 고랭지 흙감자 3kg", producerId: "producer-01", price: 12000, category: "구황작물", region: "강원도", stock: 50, image: "product-01.png" },
  { id: "product-02", name: "논산 달콤 방울토마토 1kg", producerId: "producer-02", price: 8900, category: "과일/채소", region: "충청도", stock: 40, image: "product-02.png" },
  { id: "product-03", name: "유기농 김제 햇살 쌀 10kg", producerId: "producer-03", price: 35000, category: "쌀/곡물", region: "전라도", stock: 25, image: "product-03.png" },
  { id: "product-04", name: "안동 전통 옹기 숙성 된장 1kg", producerId: "producer-04", price: 18000, category: "장류/양념", region: "경상도", stock: 30, image: "product-04.png" },
  { id: "product-05", name: "장흥 생표고버섯 실속형 500g", producerId: "producer-05", price: 15000, category: "버섯/약초", region: "전라도", stock: 20, image: "product-05.png" },
  { id: "product-06", name: "남양주 친환경 생바질 100g", producerId: "producer-06", price: 4500, category: "과일/채소", region: "경기도", stock: 100, image: "product-06.png" },
  { id: "product-07", name: "평창 고랭지 꿀부사 사과 3kg", producerId: "producer-01", price: 22000, category: "과일/채소", region: "강원도", stock: 15, image: "product-07.png" },
  { id: "product-08", name: "무농약 유기농 모듬 쌈채소 500g", producerId: "producer-02", price: 6000, category: "과일/채소", region: "충청도", stock: 60, image: "product-08.png" },
  { id: "product-09", name: "안동 명가 고랭지 배추김치 2kg", producerId: "producer-04", price: 24000, category: "장류/양념", region: "경상도", stock: 35, image: "product-09.png" },
  { id: "product-10", name: "장흥 야생화 천연 벌꿀 1kg", producerId: "producer-05", price: 28000, category: "버섯/약초", region: "전라도", stock: 18, image: "product-10.png" },
  { id: "product-11", name: "스마트팜 설향 왕딸기 500g", producerId: "producer-06", price: 13000, category: "과일/채소", region: "경기도", stock: 45, image: "product-11.png" },
  { id: "product-12", name: "김제 갓 빻은 찰보리쌀 2kg", producerId: "producer-03", price: 8500, category: "쌀/곡물", region: "전라도", stock: 55, image: "product-12.png" },
  { id: "product-13", name: "평창 눈꽃 건나물 비빔세트", producerId: "producer-01", price: 11000, category: "버섯/약초", region: "강원도", stock: 22, image: "product-13.png" },
  { id: "product-14", name: "논산 아삭 백오이 실속 5개", producerId: "producer-02", price: 4900, category: "과일/채소", region: "충청도", stock: 70, image: "product-14.png" }
];

// Orders Database
let orders = [];

// Reviews Database
let reviews = [
  { id: "rev-1", productId: "product-01", rater: "김현민", rating: 5, comment: "감자가 정말 단단하고 알차서 쪄 먹으니까 맛이 기가 막힙니다!" },
  { id: "rev-2", productId: "product-02", rater: "이지은", rating: 4, comment: "방울토마토가 싱싱해서 아침 샐러드용으로 아주 훌륭합니다." }
];

// API: Get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// API: Get producers
app.get('/api/producers', (req, res) => {
  res.json(producers);
});

// API: Submit Order (Error 2)
app.post('/api/orders', (req, res) => {
  const { name, phone, address, items, deliveryType, interval } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "주문할 품목이 선택되지 않았습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: product-05 상품을 정확히 수량 10개로 주문하는 경우, 
  // 포장 원자재 공급 대기 락 혹은 유통 트랜잭션 오류를 가장하여 백엔드에서 HTTP 500 에러를 반환합니다.
  const targetItem = items.find(i => i.productId === 'product-05' && Number(i.quantity) === 10);
  if (targetItem) {
    return res.status(500).json({
      error: "Internal Server Error: BulkOrderAllocationException - Cannot purchase exactly 10 units of product-05 due to packaging node resource allocation mismatch."
    });
  }

  // Check stocks and deduct
  for (const item of items) {
    const p = products.find(prod => prod.id === item.productId);
    if (!p) return res.status(404).json({ error: `상품을 찾을 수 없습니다: ${item.productId}` });
    if (p.stock < item.quantity) {
      return res.status(400).json({ error: `재고 부족: ${p.name} (잔여: ${p.stock}개)` });
    }
    p.stock -= item.quantity;
  }

  const newOrder = {
    id: `ord-${Date.now()}`,
    name,
    phone,
    address,
    items: items.map(i => {
      const p = products.find(x => x.id === i.productId);
      return { ...i, name: p ? p.name : '알 수 없는 상품', price: p ? p.price : 0 };
    }),
    deliveryType: deliveryType || '일반배송',
    interval: interval || 'N/A', // Holds whatever Vue sent (Error 1 validator)
    status: "주문완료",
    date: new Date().toISOString().substring(0, 10)
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// API: Get Orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Cancel Order (Error 3)
app.post('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: "해당 주문건을 찾을 수 없습니다." });
  }

  order.status = "취소됨";

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 주문을 정상 취소 처리하지만, 기차감되었던 개별 품목들의 재고(stock) 수량을 
  // 복원(product.stock += quantity) 시켜 주는 로직을 생략하여 재고 낭비 불일치 상태로 방치합니다.
  // 원래 진행해야 할 재고 복원 코드 생략:
  /*
  order.items.forEach(item => {
    const p = products.find(prod => prod.id === item.productId);
    if (p) p.stock += item.quantity;
  });
  */

  res.json({ success: true, order, products });
});

// API: Get Reviews
app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

// API: Add Review
app.post('/api/reviews', (req, res) => {
  const { productId, rater, rating, comment } = req.body;
  if (!productId || !comment) return res.status(400).json({ error: "필수 정보가 누락되었습니다." });

  const newRev = {
    id: `rev-${Date.now()}`,
    productId,
    rater: rater || "익명구매자",
    rating: Number(rating) || 5,
    comment
  };
  reviews.push(newRev);
  res.status(201).json(newRev);
});

// Serve agricultural icons / profile SVGs
app.get('/images/:filename', (req, res) => {
  const { filename } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: producer-04의 이미지 요청 시, 파일명 대소문자를 엄격하게 검증하도록 하여 
  // 프론트엔드가 요청하는 대문자 파일명('PRODUCER-04.png')에 대해 매칭 에러(404)를 뱉어내서 
  // 이미지가 깨져 보이게 만듭니다. 다른 소문자 요청들은 통과시켜 줍니다.
  if (filename === 'PRODUCER-04.png') {
    return res.status(404).send('Not Found - Case Sensitivity Mismatch');
  }

  res.setHeader('Content-Type', 'image/svg+xml');

  // Draw farmer or food mock SVG
  const isProducer = filename.startsWith('producer-');
  const indexStr = filename.replace('producer-', '').replace('product-', '').replace('.png', '');
  const color = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6', '#06b6d4', '#f43f5e', '#6366f1'][Number(indexStr) - 1] || '#4b5563';

  if (isProducer) {
    return res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="${color}"/>
        <circle cx="50" cy="40" r="18" fill="#fff" opacity="0.9"/>
        <path d="M25 78c0-12 10-20 25-20s25 8 25 20v2H25v-2z" fill="#fff" opacity="0.9"/>
        <text x="50" y="93" font-family="sans-serif" font-size="8" fill="#fff" text-anchor="middle" font-weight="bold">FARMER ${indexStr}</text>
      </svg>
    `);
  } else {
    // Product SVG
    return res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="8" fill="${color}"/>
        <circle cx="50" cy="50" r="22" fill="#fff" opacity="0.25"/>
        <text x="50" y="55" font-family="sans-serif" font-size="28" fill="#fff" text-anchor="middle">🍃</text>
        <text x="50" y="85" font-family="sans-serif" font-size="7" fill="#fff" text-anchor="middle" font-weight="bold">FRESH PRODUCE</text>
      </svg>
    `);
  }
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  products = [
    { id: "product-01", name: "강원도 고랭지 흙감자 3kg", producerId: "producer-01", price: 12000, category: "구황작물", region: "강원도", stock: 50, image: "product-01.png" },
    { id: "product-02", name: "논산 달콤 방울토마토 1kg", producerId: "producer-02", price: 8900, category: "과일/채소", region: "충청도", stock: 40, image: "product-02.png" },
    { id: "product-03", name: "유기농 김제 햇살 쌀 10kg", producerId: "producer-03", price: 35000, category: "쌀/곡물", region: "전라도", stock: 25, image: "product-03.png" },
    { id: "product-04", name: "안동 전통 옹기 숙성 된장 1kg", producerId: "producer-04", price: 18000, category: "장류/양념", region: "경상도", stock: 30, image: "product-04.png" },
    { id: "product-05", name: "장흥 생표고버섯 실속형 500g", producerId: "producer-05", price: 15000, category: "버섯/약초", region: "전라도", stock: 20, image: "product-05.png" },
    { id: "product-06", name: "남양주 친환경 생바질 100g", producerId: "producer-06", price: 4500, category: "과일/채소", region: "경기도", stock: 100, image: "product-06.png" },
    { id: "product-07", name: "평창 고랭지 꿀부사 사과 3kg", producerId: "producer-01", price: 22000, category: "과일/채소", region: "강원도", stock: 15, image: "product-07.png" },
    { id: "product-08", name: "무농약 유기농 모듬 쌈채소 500g", producerId: "producer-02", price: 6000, category: "과일/채소", region: "충청도", stock: 60, image: "product-08.png" },
    { id: "product-09", name: "안동 명가 고랭지 배추김치 2kg", producerId: "producer-04", price: 24000, category: "장류/양념", region: "경상도", stock: 35, image: "product-09.png" },
    { id: "product-10", name: "장흥 야생화 천연 벌꿀 1kg", producerId: "producer-05", price: 28000, category: "버섯/약초", region: "전라도", stock: 18, image: "product-10.png" },
    { id: "product-11", name: "스마트팜 설향 왕딸기 500g", producerId: "producer-06", price: 13000, category: "과일/채소", region: "경기도", stock: 45, image: "product-11.png" },
    { id: "product-12", name: "김제 갓 빻은 찰보리쌀 2kg", producerId: "producer-03", price: 8500, category: "쌀/곡물", region: "전라도", stock: 55, image: "product-12.png" },
    { id: "product-13", name: "평창 눈꽃 건나물 비빔세트", producerId: "producer-01", price: 11000, category: "버섯/약초", region: "강원도", stock: 22, image: "product-13.png" },
    { id: "product-14", name: "논산 아삭 백오이 실속 5개", producerId: "producer-02", price: 4900, category: "과일/채소", region: "충청도", stock: 70, image: "product-14.png" }
  ];
  orders = [];
  reviews = [
    { id: "rev-1", productId: "product-01", rater: "김현민", rating: 5, comment: "감자가 정말 단단하고 알차서 쪄 먹으니까 맛이 기가 막힙니다!" },
    { id: "rev-2", productId: "product-02", rater: "이지은", rating: 4, comment: "방울토마토가 싱싱해서 아침 샐러드용으로 아주 훌륭합니다." }
  ];
  res.json({ success: true, products, orders, reviews });
});

app.listen(PORT, () => {
  console.log(`[FarmLink Backend] Express server running on http://localhost:${PORT}`);
});
