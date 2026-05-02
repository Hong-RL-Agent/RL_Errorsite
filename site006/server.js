const express = require('express');
const path = require('path');
const app = express();
const PORT = 9335;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let menus = [
  { id: 'm1', name: '그릴드 닭가슴살 샐러드', price: 8500, cal: 350, stock: 20, type: '다이어트' },
  { id: 'm2', name: '한돈 제육볶음 정식', price: 9500, cal: 800, stock: 2, type: '한식' },
  { id: 'm3', name: '연어 포케 보울', price: 12000, cal: 450, stock: 15, type: '다이어트' },
  { id: 'm4', name: '수제 떡갈비 도시락', price: 10500, cal: 750, stock: 10, type: '한식' }
];

let orders = [];
let reviews = [
  { id: 'r1', menuId: 'm2', user: 'foodie', rating: 5, comment: '제육이 정말 맛있어요!' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MealBox Order API is running' });
});

// API: Get Menus
app.get('/api/menus', (req, res) => {
  res.json(menus);
});

// API: Create Order
app.post('/api/orders', (req, res) => {
  const { items, totalPrice, address } = req.body;
  // items: [{ id: 'm1', quantity: 2 }]
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: '장바구니가 비어 있습니다.' });
  }

  // INTENTIONAL BUG: site006-bug02
  // CSV Error: 네트워크 재시도 중복 요청
  // Type: network-retry-duplicate
  // Description: 주문 요청 재시도 시 같은 주문이 중복 생성될 수 있음.
  // Missing idempotency check. Doesn't verify if an identical order was just placed.
  
  // Actually calculate the real price
  let realPrice = 0;
  
  items.forEach(item => {
    const menu = menus.find(m => m.id === item.id);
    if (menu) {
      // INTENTIONAL BUG: site006-bug01
      // CSV Error: DB 재고 차감 오류
      // Type: database-transaction
      // Description: 주문 생성 시 재고가 부족해도 재고 차감 및 주문 저장이 진행됨.
      // Missing: if (menu.stock < item.quantity) return error;
      
      menu.stock -= item.quantity; // Can go below 0
      realPrice += menu.price * item.quantity;
    }
  });

  // INTENTIONAL BUG: site006-bug03
  // CSV Error: 결제 금액 조작 취약점
  // Type: security-parameter-tampering
  // Description: 클라이언트에서 보낸 totalPrice를 서버가 재계산하지 않고 그대로 신뢰함.
  // Instead of using 'realPrice', we blindly trust 'totalPrice' from the client.
  const finalPrice = totalPrice; 

  const newOrder = {
    id: 'ord_' + Date.now() + Math.floor(Math.random()*1000), // Random ID ensures no collision on duplicates
    items,
    totalPrice: finalPrice, // Tampered price is saved
    address,
    status: '결제완료',
    date: new Date().toISOString()
  };

  orders.push(newOrder);

  // Send a success response. Simulate network delay so users might retry (triggering bug 02)
  setTimeout(() => {
    res.status(201).json({ success: true, order: newOrder });
  }, 800);
});

// API: Get Orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Get Reviews
app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

// API: Post Review
app.post('/api/reviews', (req, res) => {
  const { menuId, user, rating, comment } = req.body;
  const newReview = { id: 'r' + Date.now(), menuId, user, rating, comment };
  reviews.push(newReview);
  res.status(201).json({ success: true, review: newReview });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
