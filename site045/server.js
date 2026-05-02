const express = require('express');
const path = require('path');
const app = express();
const PORT = 9374;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let plants = [
  { id: 'p1', name: '몬스테라 델리시오사', difficulty: 'Easy', price: 25000, stock: 5 },
  { id: 'p2', name: '올리브 나무', difficulty: 'Medium', price: 58000, stock: 2 },
  { id: 'p3', name: '칼라데아 오르비폴리아', difficulty: 'Hard', price: 32000, stock: 10 }
];

let cart = [];
let orders = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PlantShop API is running' });
});

app.get('/api/plants', (req, res) => {
  res.json(plants);
});

// API: Create Order (with stock, content-type, and tampering bugs)
app.post('/api/orders', (req, res) => {
  const { items, discountedTotal, userId } = req.body;

  // INTENTIONAL BUG: site045-bug01
  // CSV Error: DB 재고 음수 허용
  // Type: database-stock
  // 버그: 재고 부족 여부를 체크하지 않고 무조건 차감하여 음수 재고 발생
  items.forEach(item => {
    const plant = plants.find(p => p.id === item.id);
    if (plant) {
      plant.stock -= item.quantity; // 재고 체크 로직 누락
    }
  });

  // INTENTIONAL BUG: site045-bug03
  // CSV Error: 주문 금액 변조
  // Type: security-parameter-tampering
  // 보안 취약점: 클라이언트가 보낸 discountedTotal을 서버에서 다시 계산하지 않고 그대로 신뢰함
  const finalPrice = discountedTotal;

  const newOrder = {
    id: 'ord-' + Date.now(),
    userId,
    items,
    totalPrice: finalPrice,
    status: 'Paid',
    date: new Date().toISOString()
  };
  orders.push(newOrder);

  // INTENTIONAL BUG: site045-bug02
  // CSV Error: 네트워크 Content-Type 오류
  // Type: network-content-type
  // 버그: JSON 응답임에도 Content-Type을 text/plain으로 설정함
  res.setHeader('Content-Type', 'text/plain');
  res.status(201).send(JSON.stringify({ success: true, order: newOrder }));
});

app.get('/api/orders/:userId', (req, res) => {
  res.json(orders.filter(o => o.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
