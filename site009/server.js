const express = require('express');
const path = require('path');
const app = express();
const PORT = 9338;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let items = [
  { id: 'i1', name: '유기농 대나무 칫솔 세트', brand: 'EcoLife', price: 12000, image: 'https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'i2', name: '천연 수제 비누 (라벤더)', brand: 'NatureSoap', price: 8500, image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'i3', name: '재사용 가능한 밀랍 랩', brand: 'EcoWrap', price: 15000, image: 'https://images.unsplash.com/photo-1610419993549-74d1567bc179?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'i4', name: '대용량 친환경 샴푸바', brand: 'NatureSoap', price: 25000, image: 'https://images.unsplash.com/photo-1608248593875-e87f877c44e9?auto=format&fit=crop&q=80&w=300&h=300' }
];

let coupons = [
  { code: 'WELCOME10', discount: 2000, expiredAt: '2099-12-31' },
  { code: 'ECO2025', discount: 5000, expiredAt: '2020-01-01' } // Expired coupon
];

let orders = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GreenShop API is running' });
});

// API: Get Items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// API: Apply Coupon
app.post('/api/coupons/apply', (req, res) => {
  const { code } = req.body;
  const coupon = coupons.find(c => c.code === code);
  
  if (!coupon) {
    return res.status(404).json({ error: '존재하지 않는 쿠폰입니다.' });
  }

  // INTENTIONAL BUG: site009-bug01
  // CSV Error: DB 쿠폰 검증 오류
  // Type: database-validation
  // Description: 만료된 쿠폰도 DB mock 검증에서 유효한 쿠폰으로 처리됨.
  // Missing check: if (new Date(coupon.expiredAt) < new Date()) return error;

  res.json({ success: true, discount: coupon.discount });
});

// API: Create Order
app.post('/api/orders', (req, res) => {
  const { items: orderItems, price, address } = req.body;
  // Calculate real total from items to check condition for bug02
  let realTotal = 0;
  if (orderItems && Array.isArray(orderItems)) {
    orderItems.forEach(cartItem => {
      const dbItem = items.find(i => i.id === cartItem.id);
      if (dbItem) realTotal += dbItem.price * cartItem.quantity;
    });
  }

  // INTENTIONAL BUG: site009-bug02
  // CSV Error: 네트워크 오류 메시지 누락
  // Type: network-error-handling
  // Description: 주문 API 실패 시 서버가 빈 응답을 반환하여 클라이언트가 원인을 표시하지 못함.
  if (realTotal >= 50000) {
    // Fails with 500 but no body
    return res.status(500).end();
  }

  // INTENTIONAL BUG: site009-bug03
  // CSV Error: 가격 조작 취약점
  // Type: security-parameter-tampering
  // Description: 장바구니 API가 클라이언트에서 보낸 price 값을 그대로 주문 금액에 반영함.
  // Instead of using 'realTotal' (minus discount), we blindly trust 'price'
  const finalPrice = price;

  const newOrder = {
    id: 'ord_' + Date.now(),
    items: orderItems,
    totalPrice: finalPrice,
    address: address || '기본 배송지',
    date: new Date().toISOString()
  };

  orders.push(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

// API: Get Orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
