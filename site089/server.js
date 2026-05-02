const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9418;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let userGoal = 2000; // ml
let currentUserId = 'me_user';

let intakes = [
  { id: 1, userId: 'me_user', amount: 250, time: '08:30', deleted: false },
  { id: 2, userId: 'me_user', amount: 500, time: '10:15', deleted: false },
  { id: 3, userId: 'other_user', amount: 300, time: '09:00', deleted: false }, // Other user's data
  { id: 4, userId: 'me_user', amount: 200, time: '11:00', deleted: true } // Deleted record
];

const badges = [
  { id: 1, name: 'Early Bird', icon: '🌅', description: 'First drink before 9 AM' },
  { id: 2, name: 'Consistent', icon: '⚖️', description: 'Log for 3 days straight' },
  { id: 3, name: 'Goal Achiever', icon: '🏆', description: 'Reach daily goal' }
];

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', site: 'site089' }));

// INTENTIONAL BUG: site089-bug03
// CSV Error: 사용자 기록 접근 제어 실패 / Type: security-multi-tenant
// Description: intakes API가 모든 사용자의 섭취 기록을 함께 반환함.
// data-bug-id="site089-bug03"
app.get('/api/intakes', (req, res) => {
  // INTENTIONAL BUG: site089-bug03
  // data-bug-id="site089-bug03"
  // Logic error: Should be intakes.filter(i => i.userId === currentUserId && !i.deleted)
  // but it returns everything including other users and deleted ones for visualization
  res.json(intakes);
});

// INTENTIONAL BUG: site089-bug02
// CSV Error: 네트워크 중복 기록 / Type: network-duplicate-submit
// Description: 추가 버튼 연속 클릭 시 같은 물 섭취 기록이 중복 생성됨.
// data-bug-id="site089-bug02"
app.post('/api/intakes', (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  // INTENTIONAL BUG: site089-bug02
  // data-bug-id="site089-bug02"
  // No idempotency check. Consecutive requests will just create more records.
  const newIntake = {
    id: intakes.length + 1,
    userId: currentUserId,
    amount: parseInt(amount),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    deleted: false
  };

  intakes.push(newIntake);
  res.status(201).json(newIntake);
});

app.delete('/api/intakes/:id', (req, res) => {
  const intake = intakes.find(i => i.id === parseInt(req.params.id));
  if (!intake) return res.status(404).json({ error: 'Not found' });
  
  intake.deleted = true;
  res.json({ success: true });
});

app.get('/api/goals', (req, res) => res.json({ goal: userGoal }));

app.post('/api/goals', (req, res) => {
  const { goal } = req.body;
  if (goal) userGoal = goal;
  res.json({ goal: userGoal });
});

// INTENTIONAL BUG: site089-bug01
// CSV Error: DB 섭취량 합계 오류 / Type: database-calculation
// Description: 삭제된 섭취 기록도 오늘 총량에 포함됨.
// data-bug-id="site089-bug01"
app.get('/api/stats', (req, res) => {
  // INTENTIONAL BUG: site089-bug01
  // data-bug-id="site089-bug01"
  // Logic error: includes items where deleted is true
  const myIntakes = intakes.filter(i => i.userId === currentUserId);
  const total = myIntakes.reduce((sum, i) => sum + i.amount, 0); // Should exclude i.deleted
  
  // Real total for UI to show the bug
  const realTotal = myIntakes.filter(i => !i.deleted).reduce((sum, i) => sum + i.amount, 0);

  res.json({
    total,
    realTotal,
    goal: userGoal,
    progress: (total / userGoal) * 100,
    count: myIntakes.length
  });
});

app.get('/api/badges', (req, res) => res.json(badges));

app.listen(PORT, () => {
  console.log(`WaterTracker running at http://localhost:${PORT}`);
});
