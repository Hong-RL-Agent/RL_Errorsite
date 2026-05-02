const express = require('express');
const path = require('path');
const app = express();
const PORT = 9366;

// Payload size limit configuration
// INTENTIONAL BUG: site037-bug02 (Improper error code for large payload)
app.use(express.json({ limit: '1mb' })); // Limit to 1MB for simulation
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let printOptions = [
  { id: 'opt-1', size: '4x6 inch', price: 500 },
  { id: 'opt-2', size: '5x7 inch', price: 800 },
  { id: 'opt-3', size: '8x10 inch', price: 2500 },
  { id: 'opt-4', size: '11x14 inch', price: 5500 }
];

let orders = [
  { 
    id: 'ORD-1001', 
    userId: 'user-77', 
    items: [{ size: '4x6 inch', qty: 10 }], 
    total: 5000, 
    status: 'Delivered',
    address: '서울시 강남구 테헤란로 123 405호',
    deliveryNote: '부재 시 문 앞에 놓아주세요. (비밀번호: 1234#)' // 민감 정보
  }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PhotoPrint Lab API is running' });
});

app.get('/api/options', (req, res) => {
  res.json(printOptions);
});

// API: Create Order
app.post('/api/orders', (req, res) => {
  const { items, address, userId } = req.body;
  
  // INTENTIONAL BUG: site037-bug01
  // CSV Error: DB 옵션 가격 매핑 오류
  // Type: database-relation
  let total = 0;
  items.forEach(item => {
    // 버그: 인덱스를 잘못 참조하여 엉뚱한 옵션의 가격을 가져옴
    // 원래는 item.optionId로 찾아야 하지만, 고의로 인덱스를 비틀어 매핑함
    const bugIdx = (printOptions.findIndex(o => o.id === item.optionId) + 1) % printOptions.length;
    const wrongPrice = printOptions[bugIdx].price;
    total += wrongPrice * item.qty;
  });

  const newOrder = {
    id: 'ORD-' + Date.now(),
    userId,
    items,
    total,
    address,
    status: 'Pending',
    deliveryNote: '일반 배송'
  };

  orders.push(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

// API: Order History (with data exposure bug)
// INTENTIONAL BUG: site037-bug03
// CSV Error: 배송지 정보 과다 노출
// Type: security-data-exposure
app.get('/api/history', (req, res) => {
  // 보안 취약점: 목록 조회임에도 불구하고 상세 주소와 내부 배송 메모를 여과 없이 반환
  res.json(orders);
});

// Error handling for payload size
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    // INTENTIONAL BUG: site037-bug02
    // 원래는 413을 보내야 하지만, 일반 500을 보내 사용자를 혼란스럽게 함
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
