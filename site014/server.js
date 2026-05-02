const express = require('express');
const path = require('path');
const app = express();
const PORT = 9343;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock DB
let mock_produce_database = [
  { id: 'p1', name: '청송 사과 5kg', price: 25000, region: '경북 청송', stock: 50, rating: 4.8, image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'p2', name: '꿀 고구마 3kg', price: 15000, region: '전남 해남', stock: 100, rating: 4.5, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'p3', name: '친환경 방울토마토', price: 8000, region: '충남 부여', stock: 30, rating: 4.9, image: 'https://images.unsplash.com/photo-1590691566700-11b3ad336821?auto=format&fit=crop&q=80&w=200&h=200' }
];

let groupOrders = [
  { id: 'go1', produceId: 'p1', title: '청송 사과 공동구매', targetQty: 20, currentQty: 18, remainingStock: 2 }
];

let orders = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LocalFarm Direct API is running' });
});

app.get('/api/produce', (req, res) => {
  res.json(mock_produce_database);
});

// INTENTIONAL BUG: site014-bug03
// CSV Error: 민감한 내부 경로 노출
// Type: security-information-disclosure
// Description: 오류 응답에 서버 내부 파일 경로와 mock DB 변수명이 포함됨.
app.get('/api/produce/error-test', (req, res) => {
  try {
    throw new Error('Database connection failed');
  } catch (err) {
    res.status(500).json({
      error: err.message,
      internalPath: 'C:\\Users\\parkj\\Documents\\ppo-sites\\site014\\server.js',
      dataSource: 'mock_produce_database',
      stackTrace: 'Error at Row 45: access to mock_produce_database denied'
    });
  }
});

app.get('/api/farms', (req, res) => {
  res.json([
    { name: '행복농장', location: '경북 청송', specialty: '사과', bio: '3대째 이어온 장인 정신' },
    { name: '햇살상회', location: '전남 해남', specialty: '고구마', bio: '자연 그대로의 달콤함' }
  ]);
});

app.get('/api/group-orders', (req, res) => {
  res.json(groupOrders);
});

// INTENTIONAL BUG: site014-bug01
// CSV Error: DB 재고 검증 누락
// Type: database-stock
// Description: 공동구매 수량이 남은 재고를 초과해도 참여가 허용됨.
app.post('/api/group-orders/join', (req, res) => {
  const { groupOrderId, qty } = req.body;
  const go = groupOrders.find(o => o.id === groupOrderId);
  
  if (!go) return res.status(404).json({ error: 'Group order not found' });

  // INTENTIONAL BUG: 원래는 if (qty > go.remainingStock) return error; 가 있어야 함
  go.currentQty += parseInt(qty);
  go.remainingStock -= parseInt(qty); // 음수가 될 수 있음

  res.json({ success: true, updatedQty: go.currentQty, remaining: go.remainingStock });
});

// INTENTIONAL BUG: site014-bug02
// CSV Error: 서버 응답 포맷 오류
// Type: network-response-format
// Description: 주문 API가 성공 시 JSON이 아니라 HTML 문자열을 반환함.
app.post('/api/orders', (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'Empty cart' });

  const orderId = 'ORD' + Date.now();
  orders.push({ id: orderId, items });

  // 원래 응답: res.json({ success: true, orderId });
  // 버그 응답: HTML 스트링 반환
  res.send(`<h1>Order Success</h1><p>Your order ${orderId} has been placed successfully.</p>`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
