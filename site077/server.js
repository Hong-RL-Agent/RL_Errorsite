const express = require('express');
const path = require('path');
const app = express();
const PORT = 9406;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let habits = [
  { id: 'h1', userId: 'user_A', name: '아침 물 마시기', plantType: '초록화초', streak: 5 },
  { id: 'h2', userId: 'user_A', name: '30분 독서', plantType: '선인장', streak: 12 },
  { id: 'h99', userId: 'user_B', name: '비밀 습관', plantType: '희귀꽃', streak: 100 } // 타인의 데이터
];

let checkins = [
  { habitId: 'h1', date: '2024-05-01' },
  { habitId: 'h2', date: '2024-05-01' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HabitGarden API is running' });
});

// API: Get Habits (with security IDOR bug)
app.get('/api/habits/:id', (req, res) => {
  const { id } = req.params;
  const habit = habits.find(h => h.id === id);

  if (habit) {
    // INTENTIONAL BUG: site077-bug03
    // CSV Error: 습관 기록 소유자 검증 누락
    // Type: security-idor
    // 보안 취약점: habitId만 알면 소유자 확인 없이 상세 기록을 조회 가능
    const history = checkins.filter(c => c.habitId === id);
    res.json({ ...habit, history });
  } else {
    res.status(404).json({ error: 'Habit not found' });
  }
});

app.get('/api/habits', (req, res) => {
  const { userId } = req.query;
  res.json(habits.filter(h => h.userId === userId));
});

// API: Checkin Habit (with duplicate submission bug)
app.post('/api/checkins', (req, res) => {
  const { habitId, date } = req.body;

  // INTENTIONAL BUG: site077-bug02
  // CSV Error: 네트워크 중복 체크인
  // Type: network-duplicate-submit
  // 버그: 동일한 날짜에 중복 체크인이 있는지 검증하지 않고 저장함

  const newCheckin = { habitId, date: date || new Date().toISOString().split('T')[0] };
  checkins.push(newCheckin);

  // 스트릭 증가 (간순화)
  const habit = habits.find(h => h.id === habitId);
  if (habit) habit.streak += 1;

  res.status(201).json({ success: true, checkin: newCheckin });
});

// API: Get Stats (with streak calculation bug)
app.get('/api/stats', (req, res) => {
  const { userId } = req.query;
  const userHabits = habits.filter(h => h.userId === userId);

  const stats = userHabits.map(h => {
    // INTENTIONAL BUG: site077-bug01
    // CSV Error: DB 연속 달성 계산 오류
    // Type: database-calculation
    // 버그: 어제 기록이 없어도 마지막 기록일과의 상관관계 없이 스트릭을 유지/증가시킴
    return {
      habitId: h.id,
      name: h.name,
      currentStreak: h.streak, // 원래는 어제 기록 체크 로직이 필요함
      totalCheckins: checkins.filter(c => c.habitId === h.id).length
    };
  });

  res.json(stats);
});

app.get('/api/badges', (req, res) => {
  res.json([
    { id: 'b1', name: '꿈꾸는 씨앗', description: '첫 습관 등록 완료' },
    { id: 'b2', name: '푸른 잎사귀', description: '7일 연속 달성' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
