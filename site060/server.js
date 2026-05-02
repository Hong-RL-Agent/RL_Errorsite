const express = require('express');
const path = require('path');
const app = express();
const PORT = 9389;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let boxes = [
  { id: 'b1', name: '데일리 에너지 박스', price: 19800, ingredients: ['견과류', '말린과일'], category: 'Energy' },
  { id: 'b2', name: '비건 프로틴 팩', price: 24500, ingredients: ['대두', '오트'], category: 'Protein' },
  { id: 'b3', name: '저당 치즈 스낵함', price: 21000, ingredients: ['유제품', '크래커'], category: 'Low Sugar' },
  { id: 'b4', name: '슈퍼푸드 너츠 믹스', price: 18000, ingredients: ['견과류', '씨앗류'], category: 'Organic' }
];

let subscriptions = [
  { 
    id: 'sub-1', 
    userId: 'user_A', 
    boxId: 'b1', 
    address: '서울시 강남구 테헤란로 123-45 (역삼동, 행복아파트 101동 202호)',
    internalNote: '※ 특이사항: 문 앞 벨 누르지 말고 문자 남길 것. 까다로운 고객임.',
    status: 'Active' 
  }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HealthySnack API is running' });
});

// API: Get Boxes (with allergy filter bug)
app.get('/api/boxes', (req, res) => {
  const { exclude } = req.query; // 예: 견과류
  let filtered = [...boxes];

  if (exclude && exclude !== 'None') {
    // INTENTIONAL BUG: site060-bug01
    // CSV Error: DB 알레르기 필터 오류
    // Type: database-filter
    // 버그: exclude 성분을 포함하지 않는 박스를 찾아야 하는데, 필터링 로직이 잘못되어 무시하거나 반대로 동작함
    // 원래 로직: filtered = filtered.filter(b => !b.ingredients.includes(exclude));
    filtered = filtered.filter(b => b.ingredients.includes(exclude)); // 오히려 포함된 것만 보여주거나 로직 오류 발생 유도
  }

  res.json(filtered);
});

// API: Create Subscription (with rate limit bug)
app.post('/api/subscriptions', (req, res) => {
  const { userId, boxId, address } = req.body;

  // INTENTIONAL BUG: site060-bug02
  // CSV Error: 네트워크 요청 제한 누락
  // Type: network-rate-limit
  // 버그: 짧은 시간 내에 수백 개의 요청이 들어와도 무제한으로 수용함
  
  const newSub = {
    id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    boxId,
    address,
    internalNote: '신규 고객 자동 등록됨',
    status: 'Active'
  };

  subscriptions.push(newSub);
  res.status(201).json(newSub);
});

// API: Get Subscription Detail (with data exposure bug)
app.get('/api/subscriptions/:id', (req, res) => {
  const sub = subscriptions.find(s => s.id === req.params.id);
  if (sub) {
    // INTENTIONAL BUG: site060-bug03
    // CSV Error: 개인정보 응답 노출
    // Type: security-data-exposure
    // 보안 취약점: 사용자에게 노출하지 말아야 할 전체 주소(상세동호수)와 관리자 전용 internalNote를 그대로 반환함
    res.json(sub);
  } else {
    res.status(404).json({ error: 'Subscription not found' });
  }
});

app.get('/api/my-subs/:userId', (req, res) => {
  const my = subscriptions.filter(s => s.userId === req.params.userId).map(s => ({
    ...s,
    box: boxes.find(b => b.id === s.boxId)
  }));
  res.json(my);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
