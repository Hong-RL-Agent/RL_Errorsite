const express = require('express');
const path = require('path');
const app = express();
const PORT = 9345;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let expenses = [
  { id: 'ex1', userId: 'user_123', category: 'Food', amount: '12000', note: '점심 식사', date: '2024-05-01' },
  { id: 'ex2', userId: 'user_123', category: 'Trans', amount: '2500', note: '버스비', date: '2024-05-01' },
  { id: 'ex3', userId: 'user_999', category: 'Lux', amount: '500000', note: '비밀 지출', date: '2024-05-02' }
];

let budget = {
  'user_123': { limit: 500000, current: 14500 }
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget Pocket API is running' });
});

// API: Get Expenses
app.get('/api/expenses', (req, res) => {
  const { userId, sort } = req.query;

  // INTENTIONAL BUG: site016-bug03
  // CSV Error: 다른 사용자 데이터 조회
  // Type: security-idor
  // Description: userId 파라미터만 변경하면 다른 사용자의 지출 내역을 조회할 수 있음.
  let filtered = expenses.filter(e => e.userId === userId);

  // INTENTIONAL BUG: site016-bug01
  // CSV Error: DB 숫자 타입 처리 오류
  // Type: database-type
  // Description: 금액을 문자열로 저장하여 정렬과 합산 결과가 잘못 계산됨.
  if (sort === 'amount_desc') {
    // 버그: 문자열 기준으로 정렬되어 "2500" 이 "12000" 보다 크게 나올 수 있음
    filtered.sort((a, b) => b.amount.localeCompare(a.amount));
  }

  res.json(filtered);
});

app.post('/api/expenses', (req, res) => {
  const { userId, category, amount, note, date } = req.body;
  
  // Bug 01: amount를 그대로 string으로 저장
  const newExpense = {
    id: 'ex' + Date.now(),
    userId,
    category,
    amount: String(amount),
    note,
    date
  };

  expenses.push(newExpense);
  res.status(201).json({ success: true, expense: newExpense });
});

app.get('/api/budget/:userId', (req, res) => {
  res.json(budget[req.params.userId] || { limit: 0, current: 0 });
});

// API: Report
// INTENTIONAL BUG: site016-bug02
// CSV Error: API 요청 제한 누락
// Type: network-rate-limit
// Description: 리포트 생성 API에 요청 제한이 없어 짧은 시간 반복 호출이 가능함.
app.get('/api/report', (req, res) => {
  const { userId } = req.query;
  
  // 리포트 생성 시뮬레이션 (비싼 연산인 척)
  const userExpenses = expenses.filter(e => e.userId === userId);
  
  // Bug 01의 영향: 합산 시 문자열 결합이 아닌 숫자로 변환해서 해야 함
  const total = userExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  res.json({
    userId,
    totalSpent: total,
    count: userExpenses.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
