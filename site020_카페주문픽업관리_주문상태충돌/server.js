import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5019;

app.use(cors());
app.use(express.json());

// Drink Menu Database
let drinks = [
  { id: "drink-01", name: "시그니처 아메리카노", category: "커피", basePrice: 3500, description: "에티오피아 예가체프 블렌딩 원두의 산뜻하고 깔끔한 맛." },
  { id: "drink-02", name: "카페 라떼", category: "커피", basePrice: 4000, description: "고소한 우유와 진한 에스프레소 더블 샷이 어우러진 라떼." },
  { id: "drink-03", name: "제주 유기농 말차 라떼", category: "라떼", basePrice: 4800, description: "제주 다원에서 엄선한 고급 말차 가루의 깊은 풍미." },
  { id: "drink-04", name: "리얼 피치 에이드", category: "에이드", basePrice: 4500, description: "아삭한 복숭아 과육과 톡 쏘는 청량한 탄산수 블렌드." },
  { id: "drink-05", name: "자몽 얼그레이 티", category: "티", basePrice: 4300, description: "스리랑카 실론 홍차에 새콤달콤 자몽 청을 블렌딩한 차." },
  { id: "drink-06", name: "리치 카라멜 마키아토", category: "커피", basePrice: 4500, description: "바닐라 향과 진한 카라멜 드립이 감싸주는 기분 좋은 한 잔." },
  { id: "drink-07", name: "클래식 돌체 라떼", category: "커피", basePrice: 4800, description: "부드러운 연유 베이스와 농후한 에스프레소 더블샷의 조합." }
];

// Pickup capacity slots
let slots = {
  "08:00 - 08:30": { occupancy: 3, maxLimit: 10 },
  "08:30 - 09:00": { occupancy: 8, maxLimit: 10 },
  "12:00 - 12:30": { occupancy: 9, maxLimit: 10 },
  "12:30 - 13:00": { occupancy: 4, maxLimit: 10 },
  "15:00 - 15:30": { occupancy: 1, maxLimit: 10 }
};

// Orders database
let orders = [
  { id: "order-102", items: [{ id: "drink-01", name: "시그니처 아메리카노", size: "Small", quantity: 2, price: 3500, options: { extraShot: false } }], pickupTime: "08:30 - 09:00", totalCost: 7000, status: "ready" }
];

// API: Get drinks menu
app.get('/api/drinks', (req, res) => {
  res.json(drinks);
});

// API: Get slots status
app.get('/api/slots', (req, res) => {
  res.json(slots);
});

// API: Get orders list
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Create cafe order (Error 3)
app.post('/api/orders', (req, res) => {
  const { items, pickupTime, totalCost } = req.body;

  if (!items || items.length === 0 || !pickupTime) {
    return res.status(400).json({ error: "주문할 품목들과 픽업 예약 시간대는 필수 사항입니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 음료 ID 'drink-07'(돌체 라떼) 품목에 '샷 추가'(options.extraShot) 옵션이 
  // 함께 기입되어 주문이 전달된 경우, 에러 검증 핸들러(400) 대신 고압 샷 추출 모듈의 
  // 고장을 가장해 HTTP 500 Internal Server Error 상태 코드를 즉각 리턴합니다.
  const hasDolceWithShot = items.some(item => 
    item.id === 'drink-07' && 
    item.options && 
    item.options.extraShot === true
  );

  if (hasDolceWithShot) {
    return res.status(500).json({
      error: "Internal Server Error: CoffeeMachineControllerException - Dolce Latte high pressure extraction fail with extra shot."
    });
  }

  // Check capacity limits
  if (slots[pickupTime]) {
    if (slots[pickupTime].occupancy >= slots[pickupTime].maxLimit) {
      return res.status(400).json({ error: "해당 픽업 시간대의 주문 가능 인원이 초과되었습니다." });
    }
    slots[pickupTime].occupancy += 1;
  }

  const newOrder = {
    id: `order-${Date.now()}`,
    items,
    pickupTime,
    totalCost: Number(totalCost),
    status: "ready"
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// API: Cancel order (Error 2)
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;

  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "주문 이력을 발견하지 못했습니다." });
  }

  const oldOrder = orders[orderIndex];
  orders[orderIndex].status = "cancelled";

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 예약을 취소했을 때 주문 상태는 'cancelled'로 변경해주지만, 
  // 해당 주문이 접수되었던 픽업 시간 슬롯의 점유자 인원 수(slots[pickupTime].occupancy)를 차감하는 연산을 
  // 누각시켜 취소된 자리가 복원되지 않도록 가두어 놓습니다.
  // 원래 진행되어야 하는 인원 환수 코드 생략:
  // if (slots[oldOrder.pickupTime]) {
  //   slots[oldOrder.pickupTime].occupancy -= 1;
  // }

  res.json({ success: true, orders });
});

app.listen(PORT, () => {
  console.log(`[CupQueue Backend] Express server running on http://localhost:${PORT}`);
});
