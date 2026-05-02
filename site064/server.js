const express = require('express');
const path = require('path');
const app = express();
const PORT = 9393;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let items = [
  { id: 'item-1', title: '중앙도서관 3층 에어팟', category: 'Electronics', location: 'Library', status: 'found', date: '2024-05-01', userId: 'user_B' },
  { id: 'item-2', title: '학생회관 앞 파란색 지갑', category: 'Wallet', location: 'Student Union', status: 'lost', date: '2024-04-28', userId: 'user_A' },
  { id: 'item-3', title: '체육관 검정색 백팩', category: 'Bag', location: 'Gym', status: 'found', date: '2024-05-02', userId: 'user_C' }
];

let staleCache = null;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus LostFound API is running' });
});

// API: Get Items (with status filter bug and stale cache bug)
app.get('/api/items', (req, res) => {
  const { status, location } = req.query;

  // INTENTIONAL BUG: site064-bug02
  // CSV Error: 네트워크 오래된 캐시
  // Type: network-cache-stale
  // 버그: 새로운 아이템 등록 후에도 1회에 한해 이전(stale) 데이터를 반환함
  if (staleCache) {
    const temp = staleCache;
    staleCache = null; // 다음 요청부턴 정상 데이터
    return res.json(temp);
  }

  let filtered = [...items];

  if (status && status !== 'all') {
    // INTENTIONAL BUG: site064-bug01
    // CSV Error: DB 상태 필터 오류
    // Type: database-filter
    // 버그: 'found' 필터 요청 시 'lost' 항목도 결과에 포함시킴
    if (status === 'found') {
      filtered = filtered.filter(i => i.status === 'found' || i.status === 'lost');
    } else {
      filtered = filtered.filter(i => i.status === status);
    }
  }

  if (location && location !== 'All') {
    filtered = filtered.filter(i => i.location === location);
  }

  res.json(filtered);
});

// API: Create Item
app.post('/api/items', (req, res) => {
  const { title, category, location, status, userId } = req.body;
  
  // 현재 데이터를 캐시에 저장하여 다음 조회 시 stale하게 만듦 (Bug 02)
  staleCache = [...items];

  const newItem = {
    id: `item-${Date.now()}`,
    title,
    category,
    location,
    status,
    date: new Date().toISOString().split('T')[0],
    userId: userId || 'user_A'
  };

  items.unshift(newItem);
  res.status(201).json(newItem);
});

// API: Update Item Status (with authorization bug)
app.patch('/api/items/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const item = items.find(i => i.id === id);

  if (item) {
    // INTENTIONAL BUG: site064-bug03
    // CSV Error: 게시글 소유자 검증 누락
    // Type: security-authorization
    // 보안 취약점: 요청자가 해당 게시글의 작성자인지 확인하지 않고 무조건 상태 변경을 허용함
    item.status = status;
    res.json({ success: true, item });
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.get('/api/locations', (req, res) => {
  res.json(['Library', 'Student Union', 'Gym', 'Cafeteria', 'Classroom']);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
