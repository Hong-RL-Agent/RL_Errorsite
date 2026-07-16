import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5020;

app.use(cors());
app.use(express.json());

// Products database (12 items)
let products = [
  { id: "item-01", name: "친환경 세척당근 500g", category: "채소", basePrice: 2500, isDiscount: true, discountRate: 20, image: "/images/item-01.svg", nutrition: "베타카로틴이 풍부하여 눈 건강에 우수한 국산 당근." },
  { id: "item-02", name: "고산지 스위트 바나나 1송이", category: "과일", basePrice: 4000, isDiscount: false, discountRate: 0, image: "/images/item-02.svg", nutrition: "식이섬유와 칼륨이 많아 에너지를 채워주는 아침 식사용 바나나." },
  { id: "item-03", name: "동물복지 유정란 10구", category: "정육/계란", basePrice: 5500, isDiscount: true, discountRate: 10, image: "/images/item-03.svg", nutrition: "무항생제 1등급 영양란, 고소하고 신선함 가득." },
  { id: "item-04", name: "유기농 저지방 우유 900ml", category: "우유/유제품", basePrice: 3200, isDiscount: false, discountRate: 0, image: "/images/item-04.svg", nutrition: "지방 함량은 낮추고 영양은 보존한 프리미엄 우유." },
  { id: "item-05", name: "프랑스 버터 크루아상 4입", category: "베이커리", basePrice: 6000, isDiscount: true, discountRate: 15, image: "/images/item-05.svg", nutrition: "고소한 천연 버터를 듬뿍 레이어드하여 오븐에서 구워낸 빵." },
  { id: "item-06", name: "무농약 완숙 토마토 1kg", category: "과일", basePrice: 7500, isDiscount: false, discountRate: 0, image: "/images/item-06.svg", nutrition: "빨갛게 잘 자란 리코펜 성분이 풍부한 비타민 토마토." },
  { id: "item-07", name: "신선 삼겹살 구이용 500g", category: "정육/계란", basePrice: 18500, isDiscount: true, discountRate: 25, image: "/images/item-07.svg", nutrition: "육즙이 풍부하고 식감이 부드러운 1등급 한돈." },
  { id: "item-08", name: "국산 골드 참다래 키위 6입", category: "과일", basePrice: 6800, isDiscount: false, discountRate: 0, image: "/images/item-08.svg", nutrition: "새콤달콤한 비타민 C 덩어리, 면역에 좋은 키위." },
  { 
    id: "item-09", 
    name: "무농약 양배추 1통", 
    category: "채소", 
    basePrice: 3000, 
    isDiscount: false, 
    discountRate: 0, 
    image: "/images/item-09.svg", 
    nutrition: "위 점막 보호 성분이 다량 함유된 고소하고 속이 꽉 찬 양배추." 
  },
  { id: "item-10", name: "그릭 요거트 플레인 450g", category: "우유/유제품", basePrice: 8500, isDiscount: true, discountRate: 10, image: "/images/item-10.svg", nutrition: "유청을 원통 압착 방식으로 완전히 분리해낸 꾸덕한 저당 그릭 요거트." },
  { 
    // INTENTIONAL_ERROR
    // CATEGORY: Server
    // DESCRIPTION: 대표 이미지 정적 파일 경로명을 의도적으로 잘못된 가짜 파일 주소인 
    // '/images/item-11-missing-file.jpg'로 기재하여 렌더링 시 404와 엑스박스 이미지를 띄웁니다.
    id: "item-11", 
    name: "신선 친환경 꽃상추 150g", 
    category: "채소", 
    basePrice: 1800, 
    isDiscount: false, 
    discountRate: 0, 
    image: "/images/item-11-missing-file.jpg", 
    nutrition: "신선하고 아삭아삭하여 쌈 및 무침용으로 알맞은 수분 가득 꽃상추." 
  },
  { id: "item-12", name: "천연 호밀 건강식빵 400g", category: "베이커리", basePrice: 3500, isDiscount: false, discountRate: 0, image: "/images/item-12.svg", nutrition: "가공 호밀가루로 영양을 채워 속이 편안하고 든든한 건강 빵." }
];

// Coupons database
let coupons = {
  "FRESH20": { code: "FRESH20", value: 5000, desc: "새벽배송 첫구매 5,000원 할인 쿠폰", used: false },
  "GREEN10": { code: "GREEN10", value: 3000, desc: "친환경 채소 특별 3,000원 쿠폰", used: false }
};

// Orders database
let orders = [];

// API: Get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// API: Get coupons
app.get('/api/coupons', (req, res) => {
  res.json(Object.values(coupons));
});

// API: Get orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Create Order (Error 3)
app.post('/api/orders', (req, res) => {
  const { items, deliveryTime, couponCode, totalCost } = req.body;

  if (!items || items.length === 0 || !deliveryTime) {
    return res.status(400).json({ error: "주문할 제품과 배송 방법 선택은 필수 입력 사항입니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 특정 채소 품목인 '무농약 양배추'(item-09)와 '냉장 안심 배송'(cold-slot) 시간대를 
  // 동시에 예약 장바구니에 담아 접수했을 때, 에러 유효성 알림(400) 대신에 물류 센터 저온실 락 충돌 상황을 모사한 
  // HTTP 500 Internal Server Error 상태 코드를 강제 반환하여 테스트 오류를 일으킵니다.
  const hasItem09 = items.some(i => i.id === 'item-09');
  if (hasItem09 && deliveryTime === 'cold-slot') {
    return res.status(500).json({
      error: "Internal Server Error: ColdChainLogisticsException - Temperature zone allocation error for organic cabbage with cold delivery slot."
    });
  }

  // Apply Coupon use state
  if (couponCode && coupons[couponCode]) {
    coupons[couponCode].used = true;
  }

  const newOrder = {
    id: `ord-${Date.now()}`,
    items,
    deliveryTime,
    couponCode: couponCode || null,
    totalCost: Number(totalCost),
    status: "ready"
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// API: Cancel Order (Error 4)
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;

  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "주문 이력을 찾을 수 없습니다." });
  }

  const cancelledOrder = orders[orderIndex];
  orders[orderIndex].status = "cancelled";

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 쿠폰이 할인가로 포함되었던 예약을 사용자가 도중에 취소 처리하더라도, 
  // 해당 쿠폰 식별 키의 사용 유무 플래그(used)를 다시 거짓(false)으로 원상 복원해주지 않고 
  // 계속해서 사용 불가능한 상태(true)로 잠가놓는 결함을 유발합니다.
  // 원래 복원해야 하는 아래 코드를 제외(스킵)합니다:
  // if (cancelledOrder.couponCode && coupons[cancelledOrder.couponCode]) {
  //   coupons[cancelledOrder.couponCode].used = false;
  // }

  res.json({ success: true, orders });
});

// Serve dynamic SVGs for products
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;

  if (filename.endsWith('.svg')) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    `);
  }

  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`[FreshBasket Backend] Express server running on http://localhost:${PORT}`);
});
