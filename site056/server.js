const express = require('express');
const path = require('path');
const app = express();
const PORT = 9385;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let plans = [
  { id: 'p1', name: '미니 데스크탑 세트', level: 'Easy', price: 15000, desc: '작고 귀여운 다육이 3종 세트' },
  { id: 'p2', name: '공기정화 몬스테라', level: 'Medium', price: 28000, desc: '넓은 잎으로 오피스 공기를 쾌적하게' },
  { id: 'p3', name: '프리미엄 대형 고무나무', level: 'Hard', price: 55000, desc: '품격 있는 인테리어를 위한 선택' }
];

let subscriptions = [
  { id: 'sub-1', userId: 'user_A', planId: 'p2', monthlyPrice: 28000, status: 'Active' }
];

let deliveries = [
  { id: 'del-1', subId: 'sub-1', date: '2024-05-25', status: 'Pending' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DeskPlant API is running' });
});

app.get('/api/plans', (req, res) => {
  res.json(plans);
});

// API: Create Subscription (with duplicate and parameter tampering bugs)
app.post('/api/subscriptions', (req, res) => {
  const { userId, planId, monthlyPrice } = req.body;

  // INTENTIONAL BUG: site056-bug01
  // CSV Error: DB 구독 중복 생성
  // Type: database-duplicate
  // 버그: 동일 사용자가 동일 플랜을 이미 구독 중인지 확인하지 않고 생성함
  /*
  const existing = subscriptions.find(s => s.userId === userId && s.planId === planId);
  if (existing) return res.status(400).json({ error: 'Already subscribed' });
  */

  const newSub = {
    id: `sub-${Date.now()}`,
    userId,
    planId,
    // INTENTIONAL BUG: site056-bug03
    // CSV Error: 결제 금액 검증 누락
    // Type: security-parameter-tampering
    // 보안 취약점: 클라이언트가 보낸 금액을 원본 가격과 비교하지 않고 그대로 저장함
    monthlyPrice: parseInt(monthlyPrice),
    status: 'Active'
  };

  subscriptions.push(newSub);
  res.status(201).json(newSub);
});

// API: Update Delivery Date (with error handling bug)
app.patch('/api/deliveries/:id', (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  const delivery = deliveries.find(d => d.id === id);

  if (delivery) {
    // 날짜 유효성 검사 시뮬레이션 (예: 과거 날짜는 불가)
    const today = new Date('2024-05-01');
    const newDate = new Date(date);

    if (newDate < today) {
      // INTENTIONAL BUG: site056-bug02
      // CSV Error: 네트워크 실패 메시지 누락
      // Type: network-error-handling
      // 버그: 실패 사유를 명시하지 않고 빈 응답을 반환함
      return res.status(400).send(); 
    }

    delivery.date = date;
    res.json(delivery);
  } else {
    res.status(404).json({ error: 'Delivery not found' });
  }
});

app.get('/api/subscriptions/:userId', (req, res) => {
  res.json(subscriptions.filter(s => s.userId === req.params.userId).map(s => ({
    ...s,
    plan: plans.find(p => p.id === s.planId)
  })));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
