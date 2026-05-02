const express = require('express');
const path = require('path');
const app = express();
const PORT = 9392;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let tasks = [
  { id: 't1', planId: 'plan-101', title: '웨딩홀 계약 완료', category: 'Venue', completed: true },
  { id: 't2', planId: 'plan-101', title: '스튜디오 예약', category: 'Photo', completed: false },
  { id: 't99', planId: 'plan-999', title: '비밀 웨딩 파티 준비', category: 'Secret', completed: false } // 타인의 일정
];

let budgetItems = [
  { id: 'b1', item: '예식장 대관료', cost: 5000000, isCancelled: false },
  { id: 'b2', item: '웨딩 드레스 대여', cost: 2500000, isCancelled: false },
  { id: 'b3', item: '취소된 이벤트 업체', cost: 1200000, isCancelled: true } // 취소된 항목
];

let guests = [
  { id: 'g1', name: '김철수', relation: 'Friend', invited: true }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'WeddingPlan API is running' });
});

// API: Get Tasks (with authorization bug)
app.get('/api/tasks/:planId', (req, res) => {
  const { planId } = req.params;
  
  // INTENTIONAL BUG: site063-bug03
  // CSV Error: 공유 일정 권한 검증 누락
  // Type: security-authorization
  // 보안 취약점: 요청자가 해당 플랜의 소유자인지 확인하지 않고 planId만 일치하면 모든 일정을 반환함
  const myTasks = tasks.filter(t => t.planId === planId);
  res.json(myTasks);
});

// API: Get Budget Summary (with calculation bug)
app.get('/api/budget/summary', (req, res) => {
  // INTENTIONAL BUG: site063-bug01
  // CSV Error: DB 예산 합계 오류
  // Type: database-calculation
  // 버그: isCancelled: true인 항목은 제외해야 하는데, 필터링 없이 모든 cost를 합산함
  const total = budgetItems.reduce((acc, item) => acc + item.cost, 0);
  
  res.json({
    total,
    count: budgetItems.length,
    items: budgetItems
  });
});

// API: Add Guest (with request validation bug)
app.post('/api/guests', (req, res) => {
  const { name, relation } = req.body;

  // INTENTIONAL BUG: site063-bug02
  // CSV Error: 네트워크 요청 본문 검증 실패
  // Type: network-request-validation
  // 버그: name이 비어 있어도 검증 에러를 내지 않고 성공 응답을 반환함
  const newGuest = {
    id: `g-${Date.now()}`,
    name: name || '', // 유효성 검사 누락
    relation: relation || 'Guest',
    invited: true
  };

  guests.push(newGuest);
  res.status(201).json({
    status: 'success',
    message: '하객이 성공적으로 명단에 추가되었습니다.',
    guest: newGuest
  });
});

app.get('/api/guests', (req, res) => {
  res.json(guests);
});

app.get('/api/vendors', (req, res) => {
  res.json([
    { id: 'v1', name: '그랜드 로즈 웨딩홀', category: 'Venue', rating: 4.8 },
    { id: 'v2', name: '화이트 실크 드레스', category: 'Dress', rating: 4.5 }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
