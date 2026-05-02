const express = require('express');
const path = require('path');
const app = express();
const PORT = 9383;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let gifts = [
  { id: 'g1', name: '프리미엄 립밤 세트', price: 25000, category: 'Beauty', target: 'Friend' },
  { id: 'g2', name: '빈티지 아날로그 카메라', price: 120000, category: 'Tech', target: 'Self' },
  { id: 'g3', name: '실크 수면 안대', price: 15000, category: 'Living', target: 'Parents' },
  { id: 'g4', name: '핸드드립 커피 키트', price: 45000, category: 'Food', target: 'Lover' },
  { id: 'g5', name: '스마트 워치 스트랩', price: 35000, category: 'Tech', target: 'Friend' }
];

let wishlists = [
  { id: 'wish-A', userId: 'user_A', items: ['g1', 'g3'], isPrivate: true },
  { id: 'wish-B', userId: 'user_B', items: ['g2'], isPrivate: true } // 타인의 비밀 위시리스트
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GiftBox API is running' });
});

// API: Get Gifts (with budget filter bug)
app.get('/api/gifts', (req, res) => {
  const { maxPrice, target } = req.query;
  let filtered = [...gifts];

  if (target && target !== 'All') {
    filtered = filtered.filter(g => g.target === target);
  }

  if (maxPrice) {
    const limit = parseInt(maxPrice);
    // INTENTIONAL BUG: site054-bug01
    // CSV Error: DB 예산 필터 오류
    // Type: database-filter
    // 버그: maxPrice 이하가 아닌 이상(>=)으로 잘못 필터링함
    filtered = filtered.filter(g => g.price >= limit);
  }

  res.json(filtered);
});

// API: Get Wishlist (with response format and authorization bugs)
app.get('/api/wishlist/:id', (req, res) => {
  const { id } = req.params;
  const wish = wishlists.find(w => w.id === id);

  if (wish) {
    // INTENTIONAL BUG: site054-bug03
    // CSV Error: 위시리스트 소유권 검증 누락
    // Type: security-authorization
    // 보안 취약점: 요청자가 소유자인지 확인하지 않고 비공개 리스트를 반환함

    const resultItems = wish.items.map(itemId => gifts.find(g => g.id === itemId)).filter(Boolean);

    // INTENTIONAL BUG: site054-bug02
    // CSV Error: API 응답 포맷 불일치
    // Type: network-response-format
    // 버그: 배열 대신 문자열화된 JSON을 반환하여 클라이언트 파싱 에러 유도
    res.json(JSON.stringify(resultItems));
  } else {
    res.status(404).json({ error: 'Wishlist not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
