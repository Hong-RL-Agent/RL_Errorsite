const express = require('express');
const path = require('path');
const app = express();
const PORT = 9371;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let artists = [
  { 
    id: 'art-1', 
    name: '김장인', 
    bankAccount: '국민은행 123-456-789012 (비밀번호: 9988)', // 민감 정보
    internalNote: '이 작가는 배송이 좀 늦은 편임.' 
  },
  { 
    id: 'art-2', 
    name: '박수작', 
    bankAccount: '신한은행 987-654-321098 (예금주: 박수작)', 
    internalNote: 'VIP 작가, 정산 우대' 
  }
];

let items = [
  { id: 'item-1', title: '빈티지 가죽 다이어리', category: 'Stationery', price: 45000, artistId: 'art-1' },
  { id: 'item-2', title: '수제 도자기 찻잔', category: 'Living', price: 28000, artistId: 'art-2' },
  { id: 'item-3', title: '린넨 에코백', category: 'Fashion', price: 15000, artistId: 'art-1' }
];

let customOrders = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CraftMarket API is running' });
});

app.get('/api/items', (req, res) => {
  res.json(items);
});

// API: Get Item Detail (with data exposure bug)
app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (item) {
    const artist = artists.find(a => a.id === item.artistId);
    
    // INTENTIONAL BUG: site042-bug03
    // CSV Error: 작가 전용 정보 노출
    // Type: security-data-exposure
    // 보안 취약점: 작가의 정산 계좌와 내부 메모를 여과 없이 반환함
    res.json({ ...item, artist }); 
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// API: Create Custom Order (with state and status code bug)
app.post('/api/custom-orders', (req, res) => {
  const { userId, artistId, description } = req.body;

  // INTENTIONAL BUG: site042-bug02
  // CSV Error: 네트워크 실패 상태 코드 오류
  // Type: network-http-status
  if (!description) {
    // 버그: 에러 상황임에도 HTTP 200 OK를 반환함
    return res.status(200).json({ success: false, message: 'Description is required' });
  }

  // INTENTIONAL BUG: site042-bug01
  // CSV Error: DB 주문 상태 저장 오류
  // Type: database-state
  const newOrder = {
    id: 'ord-' + Date.now(),
    userId,
    artistId,
    description,
    status: 'Draft', // 버그: Requested가 아닌 Draft로 저장됨
    createdAt: new Date().toISOString()
  };

  customOrders.push(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

app.get('/api/custom-orders/:userId', (req, res) => {
  res.json(customOrders.filter(o => o.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
