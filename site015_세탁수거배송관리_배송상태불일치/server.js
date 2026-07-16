import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5014;

app.use(cors());
app.use(express.json());

// Laundry Items Database
let laundryItems = [
  { id: "item-01", name: "셔츠/블라우스", price: 3000, icon: "👕" },
  { id: "item-02", name: "상의/스웨터", price: 5000, icon: "🧥" },
  { id: "item-03", name: "바지/스커트", price: 4000, icon: "👖" },
  { id: "item-04", name: "이불/침구류", price: 15000, icon: "🛏️" },
  { id: "item-05", name: "운동화/스니커즈", price: 7000, icon: "👟" },
  { id: "item-06", name: "롱패딩/코트", price: 12000, icon: "🧥" }
];

// Occupied pickup time slots database
let occupiedSlots = ["2026-06-25 10:00 - 12:00"];

// Orders Database
let orders = [
  {
    id: "order-101",
    items: [
      { id: "item-01", name: "셔츠/블라우스", qty: 2, price: 3000 }
    ],
    totalPrice: 6000,
    pickupTime: "2026-06-25 10:00 - 12:00",
    address: "서울시 강남구 테헤란로 123",
    status: "washing" // collection -> washing -> delivery
  }
];

// API: Get laundry items
app.get('/api/items', (req, res) => {
  res.json(laundryItems);
});

// API: Get orders list
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Get occupied slot times
app.get('/api/occupied-slots', (req, res) => {
  res.json(occupiedSlots);
});

// API: Create new laundry order (Error 2)
app.post('/api/orders', (req, res) => {
  const { items, totalPrice, pickupTime, address } = req.body;

  if (!items || items.length === 0 || !pickupTime || !address) {
    return res.status(400).json({ error: "필수 주문 정보가 누락되었습니다." });
  }

  // Check if slot is occupied
  if (occupiedSlots.includes(pickupTime)) {
    return res.status(400).json({ error: "선택하신 수거 시간대는 이미 다른 예약으로 마감되었습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 전달받은 주소지(address) 데이터에 '지하'라는 키워드가 포함될 시, 
  // 일반적인 수거 불가 구역 고지(HTTP 400 Bad Request) 대신 시스템 예외를 발생시킨 상황을 연출하기 위해 
  // HTTP 500 Internal Server Error 상태 코드를 즉각 반환하여 클라이언트에 강제 경고를 출력합니다.
  if (address.includes('지하')) {
    return res.status(500).json({
      error: "Internal Server Error: LaundryAddressGeocodingException - Basement address is unmappable for automated route planning."
    });
  }

  const newOrder = {
    id: `order-${Date.now()}`,
    items,
    totalPrice: Number(totalPrice),
    pickupTime,
    address,
    status: "collection"
  };

  orders.push(newOrder);
  occupiedSlots.push(pickupTime); // Mark slot as occupied

  res.status(201).json(newOrder);
});

// API: Cancel laundry order (Error 3)
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: "취소할 주문 정보를 조회하지 못했습니다." });
  }

  order.status = "cancelled";

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 예약을 취소 처리하여 주문 내역 상태는 'cancelled'로 안전하게 업데이트하지만, 
  // 해당 주문이 점유하고 약정되어 있던 시간 슬롯(pickupTime) 정보를 데이터베이스 점유 리스트(occupiedSlots)에서 
  // 제거하지 않고 계속 누출/잠금 상태로 방치함으로써 다른 고객이 해당 슬롯에 예약 신청하는 것을 방해하는 결함을 연출합니다.
  // 아래 해제 코드를 생략합니다:
  // occupiedSlots = occupiedSlots.filter(s => s !== order.pickupTime);

  res.json({ success: true, order });
});

// API: Estimate normal (v1)
app.post('/api/orders/estimate', (req, res) => {
  res.json({ estimatedDays: 3, description: "수거 후 세탁 완료까지 대략 3일 소요됩니다." });
});

app.listen(PORT, () => {
  console.log(`[WashDay Backend] Express server running on http://localhost:${PORT}`);
});
