const express = require('express');
const path = require('path');
const app = express();
const PORT = 9359;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let pantryItems = [
  { id: 'it-1', userId: 'user_A', name: '우유', category: 'Dairy', quantity: 1, expiryDate: '2024-05-20' },
  { id: 'it-2', userId: 'user_A', name: '계란', category: 'Protein', quantity: 10, expiryDate: '2024-05-15' },
  { id: 'it-3', userId: 'user_A', name: '두부', category: 'Protein', quantity: 2, expiryDate: '2024-05-10' }, // 이미 만료됨
  { id: 'it-4', userId: 'user_B', name: '스테이크 고기', category: 'Meat', quantity: 3, expiryDate: '2024-05-25' }, // 타인 데이터
  { id: 'it-5', userId: 'user_B', name: '치즈', category: 'Dairy', quantity: 5, expiryDate: '2024-05-12' } // 타인 데이터
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Pantry API is running' });
});

// API: Get Refrigerator Items
// INTENTIONAL BUG: site030-bug03
// CSV Error: 사용자별 데이터 분리 실패
// Type: security-multi-tenant
app.get('/api/items', (req, res) => {
  // 보안 취약점: userId 필터링 로직이 누락되어 모든 사용자의 재료를 반환함
  // 원래는: const userItems = pantryItems.filter(i => i.userId === req.query.userId);
  res.json(pantryItems); 
});

// API: Add Item
app.post('/api/items', (req, res) => {
  const { name, category, quantity, expiryDate, userId } = req.body;

  // INTENTIONAL BUG: site030-bug02
  // CSV Error: 요청 본문 타입 불일치
  // Type: network-request-format
  // Description: 재료 추가 API가 JSON이 아닌 문자열 수량도 정상 저장함.
  // 숫자형 변환 없이 그대로 저장
  const newItem = {
    id: 'it-' + Date.now(),
    userId,
    name,
    category,
    quantity, // 버그: "10" 같은 문자열이 들어와도 Number() 변환 없이 저장
    expiryDate
  };

  pantryItems.push(newItem);
  res.status(201).json({ success: true, item: newItem });
});

// API: Get Expiring Items
// INTENTIONAL BUG: site030-bug01
// CSV Error: DB 유통기한 비교 오류
// Type: database-date-query
app.get('/api/expiring', (req, res) => {
  const today = new Date('2024-05-14'); // 시스템 시각 고정 시뮬레이션
  const warningDate = new Date(today);
  warningDate.setDate(today.getDate() + 3); // 3일 이내 임박

  // 버그: 만료된 재료(expiry < today)를 제외하지 못함
  const expiringItems = pantryItems.filter(item => {
    const expiry = new Date(item.expiryDate);
    // 원래는: return expiry >= today && expiry <= warningDate;
    return expiry <= warningDate; // 버그: 오늘 이전(이미 만료된 것)도 모두 포함됨
  });

  res.json(expiringItems);
});

app.get('/api/recipes', (req, res) => {
  res.json([
    { name: '스크램블 에그', mainIngredient: '계란', time: '10분' },
    { name: '두부 조림', mainIngredient: '두부', time: '20분' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
