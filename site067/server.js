const express = require('express');
const path = require('path');
const app = express();
const PORT = 9396;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let meals = [
  { id: 'm1', userId: 'user_A', date: '2024-05-01', type: 'Breakfast', name: '아보카도 토스트', calories: 350, isDeleted: false },
  { id: 'm2', userId: 'user_A', date: '2024-05-01', type: 'Lunch', name: '닭가슴살 샐러드', calories: 450, isDeleted: false },
  { id: 'm3', userId: 'user_A', date: '2024-05-01', type: 'Dinner', name: '연어 스테이크', calories: 600, isDeleted: true }, // 삭제된 데이터
  { id: 'm99', userId: 'user_B', date: '2024-05-01', type: 'Dinner', name: '비밀 야식(피자)', calories: 1200, isDeleted: false } // 타인의 데이터
];

let shoppingList = [
  { id: 's1', item: '아보카도', checked: true },
  { id: 's2', item: '닭가슴살', checked: false }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MealPrep API is running' });
});

// API: Get Meals (with security and race condition bugs)
app.get('/api/meals', (req, res) => {
  const { date, userId } = req.query;

  // INTENTIONAL BUG: site067-bug02
  // CSV Error: 네트워크 응답 순서 문제
  // Type: network-race-condition
  // 버그: 날짜 조작 시 레이스 컨디션을 유도하기 위해 랜덤한 딜레이를 부여함
  const delay = Math.random() * 2000;

  setTimeout(() => {
    // INTENTIONAL BUG: site067-bug03
    // CSV Error: 사용자 식단 접근 제어 실패
    // Type: security-multi-tenant
    // 보안 취약점: 요청한 userId로 필터링하지 않고 모든 사용자의 meal 데이터를 반환함
    const filtered = meals.filter(m => m.date === date && !m.isDeleted);
    res.json(filtered);
  }, delay);
});

// API: Get Calories Summary (with calculation bug)
app.get('/api/calories/summary', (req, res) => {
  const { date } = req.query;
  
  // INTENTIONAL BUG: site067-bug01
  // CSV Error: DB 칼로리 합계 오류
  // Type: database-calculation
  // 버그: isDeleted: true인 항목을 제외하지 않고 합산함
  const dailyMeals = meals.filter(m => m.date === date);
  const totalCalories = dailyMeals.reduce((acc, m) => acc + m.calories, 0);

  res.json({
    total: totalCalories,
    count: dailyMeals.length
  });
});

app.get('/api/shopping', (req, res) => {
  res.json(shoppingList);
});

app.post('/api/meals', (req, res) => {
  const { userId, date, type, name, calories } = req.body;
  const newMeal = {
    id: `m-${Date.now()}`,
    userId,
    date,
    type,
    name,
    calories: parseInt(calories),
    isDeleted: false
  };
  meals.push(newMeal);
  res.status(201).json(newMeal);
});

app.get('/api/recipes', (req, res) => {
  res.json([
    { id: 'r1', name: '지중해식 샐러드', time: '15분', kcal: 280 },
    { id: 'r2', name: '퀴노아 보울', time: '20분', kcal: 420 }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
