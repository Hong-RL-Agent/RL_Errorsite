const express = require('express');
const path = require('path');
const app = express();
const PORT = 9362;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let products = [
  { id: 'p1', name: '프리미엄 A4 복사용지', category: 'Paper', price: 5500, stock: 100 },
  { id: 'p2', name: '젤펜 0.5mm (12입)', category: 'Writing', price: 12000, stock: 50 },
  { id: 'p3', name: '사무용 메쉬 의자', category: 'Furniture', price: 89000, stock: 10 },
  { id: 'p4', name: '스테이플러 세트', category: 'Desk', price: 4500, stock: 30 },
  { id: 'p5', name: '무선 마우스', category: 'Tech', price: 25000, stock: 20 }
];

let orders = [];
let quotes = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OfficeSupply Mall API is running' });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

// API: Create Order
app.post('/api/orders', (req, res) => {
  const { items, userId } = req.body;

  // 에러 시뮬레이션: 수량이 99개 이상이면 시스템 에러 발생 (재고 부족 등)
  if (items.some(it => it.quantity >= 99)) {
    // INTENTIONAL BUG: site033-bug02
    // CSV Error: 네트워크 실패 응답 누락
    // Type: network-error-handling
    // Description: 주문 실패 시 message 없는 500 응답만 반환됨.
    return res.status(500).end(); // 바디 없이 전송
  }

  // INTENTIONAL BUG: site033-bug01
  // CSV Error: DB 주문 합계 계산 오류
  // Type: database-calculation
  // Description: 수량을 반영하지 않고 단가만 합산함.
  let totalAmount = 0;
  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      // 버그: totalAmount += product.price * item.quantity; 이어야 함
      totalAmount += product.price; // 수량 곱하기를 누락함
    }
  });

  const newOrder = {
    id: 'ORD-' + Date.now(),
    userId,
    items,
    totalAmount,
    status: 'Processing',
    createdAt: new Date()
  };

  orders.push(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

// API: Create Quote (견적서)
// INTENTIONAL BUG: site033-bug03
// CSV Error: 견적 금액 조작 취약점
// Type: security-parameter-tampering
app.post('/api/quotes', (req, res) => {
  const { items, quoteTotal, userId } = req.body;

  // 보안 취약점: 클라이언트가 보낸 quoteTotal을 서버에서 재검증하지 않고 그대로 저장
  const newQuote = {
    id: 'QTE-' + Date.now(),
    userId,
    items,
    totalAmount: quoteTotal, // 클라이언트 값 신뢰
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };

  quotes.push(newQuote);
  res.status(201).json({ success: true, quote: newQuote });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
