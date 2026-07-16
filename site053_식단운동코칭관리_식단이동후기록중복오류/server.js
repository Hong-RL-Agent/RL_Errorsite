import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5053;

app.use(cors());
app.use(express.json());

// Food Database (Minimum 20 items)
let foods = [
  { id: "f-01", name: "닭가슴살구이", calories: 165, carbs: 0, protein: 31, fat: 3.6 },
  { id: "f-02", name: "현미밥", calories: 150, carbs: 32, protein: 3.5, fat: 1.1 },
  { id: "f-03", name: "아보카도 샐러드", calories: 220, carbs: 12, protein: 4, fat: 18 },
  { id: "f-04", name: "사과", calories: 95, carbs: 25, protein: 0.5, fat: 0.3 },
  { id: "f-05", name: "바나나", calories: 105, carbs: 27, protein: 1.3, fat: 0.3 },
  { id: "f-06", name: "아몬드 (10알)", calories: 70, carbs: 2.5, protein: 2.5, fat: 6 },
  { id: "f-07", name: "그릭요거트", calories: 130, carbs: 6, protein: 15, fat: 4 },
  { id: "f-08", name: "소고기 안심", calories: 190, carbs: 0, protein: 26, fat: 9 },
  { id: "f-09", name: "고구마 (100g)", calories: 120, carbs: 28, protein: 1.5, fat: 0.2 },
  { id: "f-10", name: "달걀프라이", calories: 90, carbs: 0.6, protein: 6.3, fat: 6.8 },
  { id: "f-11", name: "삶은 달걀", calories: 77, carbs: 0.6, protein: 6.3, fat: 5.3 },
  { id: "f-12", name: "토마토", calories: 22, carbs: 5, protein: 1, fat: 0.2 },
  { id: "f-13", name: "브로콜리 (100g)", calories: 34, carbs: 7, protein: 2.8, fat: 0.4 },
  { id: "f-14", name: "닭가슴살 샐러드", calories: 180, carbs: 8, protein: 24, fat: 5 },
  { id: "f-15", name: "두부구이 (100g)", calories: 85, carbs: 3, protein: 8.5, fat: 4.8 },
  { id: "f-16", name: "흰쌀밥", calories: 200, carbs: 45, protein: 4, fat: 0.4 },
  { id: "f-17", name: "연어구이 (150g)", calories: 280, carbs: 0, protein: 34, fat: 15 },
  { id: "f-18", name: "오렌지", calories: 60, carbs: 15, protein: 1.2, fat: 0.2 },
  { id: "f-19", name: "훈제오리 (100g)", calories: 290, carbs: 2, protein: 18, fat: 23 },
  { id: "f-20", name: "단호박 (100g)", calories: 70, carbs: 17, protein: 1.5, fat: 0.3 }
];

// Workout Database (Minimum 15 items)
let workouts = [
  { id: "w-01", name: "달리기", met: 8.0 },
  { id: "w-02", name: "실내 자전거", met: 6.0 },
  { id: "w-03", name: "요가", met: 2.5 },
  { id: "w-04", name: "수영", met: 7.0 },
  { id: "w-05", name: "필라테스", met: 3.0 },
  { id: "w-06", name: "스쿼트", met: 5.0 },
  { id: "w-07", name: "등산", met: 6.5 },
  { id: "w-08", name: "플랭크", met: 2.0 },
  { id: "w-09", name: "계단 오르기", met: 7.5 },
  { id: "w-10", name: "줄넘기", met: 9.0 },
  { id: "w-11", name: "배드민턴", met: 4.5 },
  { id: "w-12", name: "벤치 프레스", met: 3.5 },
  { id: "w-13", name: "데드리프트", met: 4.0 },
  { id: "w-14", name: "자전거 라이딩", met: 5.5 },
  { id: "w-15", name: "줌바 댄스", met: 6.0 }
];

// User datasets
let dietLogs = [
  { id: "diet-01", user: "사용자 A", name: "닭가슴살구이", calories: 165, type: "아침" },
  { id: "diet-02", user: "사용자 A", name: "현미밥", calories: 150, type: "아침" },
  { id: "diet-03", user: "사용자 B", name: "흰쌀밥", calories: 200, type: "점심" }
];

let workoutLogs = [
  { id: "work-01", user: "사용자 A", name: "달리기", duration: 30, calories: 240 },
  { id: "work-02", user: "사용자 B", name: "요가", duration: 40, calories: 100 }
];

let weightLogs = [
  { id: "weight-01", user: "사용자 A", weight: 68.5, date: "2026-07-12" },
  { id: "weight-02", user: "사용자 A", weight: 67.8, date: "2026-07-13" },
  { id: "weight-03", user: "사용자 B", weight: 74.2, date: "2026-07-13" }
];

let goals = {
  "사용자 A": { targetCalories: 2000, targetCarbs: 250, targetProtein: 120, targetFat: 60 },
  "사용자 B": { targetCalories: 2500, targetCarbs: 320, targetProtein: 150, targetFat: 75 }
};

let coachFeedback = {
  "사용자 A": { text: "식단 단백질 비율을 높이시고 유산소 운동(달리기 등)을 10분 더 진행해 주세요.", coach: "코치 김" },
  "사용자 B": { text: "탄수화물 섭취량이 목표를 초과했습니다. 저녁 식사를 조금 더 가볍게 유지하세요.", coach: "코치 박" }
};

// API: Search Foods (Error 1 search race condition)
app.get('/api/foods/search', (req, res) => {
  const { q } = req.query;
  const filtered = foods.filter(f => f.name.includes(q));

  let delay = 100;
  if (q === '사과') {
    delay = 3000; // 3s delay
  } else if (q === '바나나') {
    delay = 500; // 0.5s delay
  } else if (q === '샐러드') {
    delay = 100; // 0.1s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 음식 검색어 매칭 응답 시 인위적 지연을 다르게 부여합니다. 
  // '사과' 검색어 요청은 3초 지연되어 가장 늦게 도착하므로 최종 결과 화면을 덮어쓰고, 
  // 사용자가 클릭 시 최신 검색어인 '샐러드'의 ID 대신 엉뚱한 이전 ID가 타겟팅되게 만드는 결함입니다.
  setTimeout(() => {
    res.json({ results: filtered });
  }, delay);
});

// API: Get Diet
app.get('/api/diet', (req, res) => {
  const { user } = req.query;
  const filtered = dietLogs.filter(d => d.user === user);
  res.json(filtered);
});

// API: Add Diet
app.post('/api/diet', (req, res) => {
  const { user, name, calories, type } = req.body;
  const newDiet = {
    id: `diet-${Date.now()}`,
    user,
    name,
    calories: Number(calories),
    type
  };
  dietLogs.push(newDiet);
  res.json(newDiet);
});

// API: Edit Diet
app.put('/api/diet/:id', (req, res) => {
  const { id } = req.params;
  const { name, calories } = req.body;
  const diet = dietLogs.find(d => d.id === id);
  if (diet) {
    diet.name = name;
    diet.calories = Number(calories);
  }
  res.json({ success: true, diet });
});

// API: Move Diet to lunch (Error 2 target)
app.post('/api/diet/:id/move', (req, res) => {
  const { id } = req.params;
  const { newType } = req.body;
  const meal = dietLogs.find(d => d.id === id);

  if (meal) {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Database
    // DESCRIPTION: 아침 식단 수정 직후 점심으로 이동 시 기존 아침 인스턴스를 제거하지 않고 
    // 점심 복사본을 추가 생성하여 양쪽에 레코드가 모두 잔존하게 만드는 중복 적재 결함입니다.
    const copiedMeal = {
      id: `diet-moved-${Date.now()}`,
      user: meal.user,
      name: meal.name,
      calories: meal.calories,
      type: newType
    };
    dietLogs.push(copiedMeal);
    console.log(`[DB DIET MOVE] Copied ${meal.name} to ${newType}. BUT did not delete original ${id}!`);
  }

  res.json({ success: true });
});

// API: Delete Diet
app.delete('/api/diet/:id', (req, res) => {
  const { id } = req.params;
  dietLogs = dietLogs.filter(d => d.id !== id);
  res.json({ success: true });
});

// API: Get workouts list
app.get('/api/workouts/catalog', (req, res) => {
  res.json(workouts);
});

// API: Get workout logs
app.get('/api/workouts', (req, res) => {
  const { user } = req.query;
  const filtered = workoutLogs.filter(w => w.user === user);
  res.json(filtered);
});

// API: Add workout log
app.post('/api/workouts', (req, res) => {
  const { user, name, duration, calories } = req.body;
  const newLog = {
    id: `work-${Date.now()}`,
    user,
    name,
    duration: Number(duration),
    calories: Number(calories)
  };
  workoutLogs.push(newLog);
  res.json(newLog);
});

// API: Get Weight
app.get('/api/weight', (req, res) => {
  const { user } = req.query;
  const filtered = weightLogs.filter(w => w.user === user);
  res.json(filtered);
});

// API: Add Weight
app.post('/api/weight', (req, res) => {
  const { user, weight, date } = req.body;
  const newWeight = {
    id: `weight-${Date.now()}`,
    user,
    weight: Number(weight),
    date
  };
  weightLogs.push(newWeight);
  res.json(newWeight);
});

// API: Patch Weight (Error 3 weight patch - 3s delay)
app.patch('/api/weight/:id', (req, res) => {
  const { id } = req.params;
  const { weight } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 체중 기록 수정 API를 3000ms(3초) 강제 지연시킵니다. 
  // 수정 클릭 직후 삭제(0.1초 완료)가 선차 레이싱 실행되어 데이터가 소거된 경우에도, 
  // 3초 후 완료되는 수정 스레드가 체중 레코드를 DB 메모리에 강제로 재생성 기입하여 부활시킵니다.
  setTimeout(() => {
    let record = weightLogs.find(w => w.id === id);
    if (!record) {
      record = { id, user: "사용자 A", weight: Number(weight), date: new Date().toLocaleDateString() };
      weightLogs.push(record);
      console.log(`[DB WEIGHT RESURRECT] Resurrected deleted weight log ${id} with weight ${weight}`);
    } else {
      record.weight = Number(weight);
    }
    res.json({ success: true, record });
  }, 3000);
});

// API: Delete Weight (Error 3 weight delete - 0.1s delay)
app.delete('/api/weight/:id', (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    weightLogs = weightLogs.filter(w => w.id !== id);
    console.log(`[DB WEIGHT DELETE] Deleted weight log ${id}`);
    res.json({ success: true });
  }, 100);
});

// API: Get Goals
app.get('/api/goals', (req, res) => {
  const { user } = req.query;
  res.json(goals[user] || { targetCalories: 2000, targetCarbs: 250, targetProtein: 120, targetFat: 60 });
});

// API: Update Goals (Error 6 goal 0 validation bypass)
app.patch('/api/goals', (req, res) => {
  const { user, targetCalories, targetCarbs, targetProtein, targetFat } = req.body;
  const userGoal = goals[user];

  if (userGoal) {
    if (Number(targetCalories) === 0) {
      // INTENTIONAL_ERROR
      // CATEGORY: Backend
      // DESCRIPTION: 목표 칼로리를 0으로 기입 변경 요청 시 HTTP 400 Bad Request 에러를 반환해 
      // 입력을 거부한 척하지만, 실제 백엔드 데이터베이스 세팅에는 0 값을 그대로 덮어쓰기하여 
      // 재로그인 시 달성률 연산에서 Infinity 혹은 NaN을 유도하는 설계 에러입니다.
      userGoal.targetCalories = 0;
      return res.status(400).json({ error: "목표 칼로리는 0보다 큰 수치여야 합니다." });
    }
    userGoal.targetCalories = Number(targetCalories);
    userGoal.targetCarbs = Number(targetCarbs);
    userGoal.targetProtein = Number(targetProtein);
    userGoal.targetFat = Number(targetFat);
  }
  res.json(userGoal);
});

// API: Get coach feedbacks
app.get('/api/feedback', (req, res) => {
  const { user } = req.query;
  res.json(coachFeedback[user] || { text: "피드백이 없습니다." });
});

// API: Reset DB
app.post('/api/reset', (req, res) => {
  dietLogs = [
    { id: "diet-01", user: "사용자 A", name: "닭가슴살구이", calories: 165, type: "아침" },
    { id: "diet-02", user: "사용자 A", name: "현미밥", calories: 150, type: "아침" },
    { id: "diet-03", user: "사용자 B", name: "흰쌀밥", calories: 200, type: "점심" }
  ];
  workoutLogs = [
    { id: "work-01", user: "사용자 A", name: "달리기", duration: 30, calories: 240 },
    { id: "work-02", user: "사용자 B", name: "요가", duration: 40, calories: 100 }
  ];
  weightLogs = [
    { id: "weight-01", user: "사용자 A", weight: 68.5, date: "2026-07-12" },
    { id: "weight-02", user: "사용자 A", weight: 67.8, date: "2026-07-13" },
    { id: "weight-03", user: "사용자 B", weight: 74.2, date: "2026-07-13" }
  ];
  goals = {
    "사용자 A": { targetCalories: 2000, targetCarbs: 250, targetProtein: 120, targetFat: 60 },
    "사용자 B": { targetCalories: 2500, targetCarbs: 320, targetProtein: 150, targetFat: 75 }
  };
  coachFeedback = {
    "사용자 A": { text: "식단 단백질 비율을 높이시고 유산소 운동(달리기 등)을 10분 더 진행해 주세요.", coach: "코치 김" },
    "사용자 B": { text: "탄수화물 섭취량이 목표를 초과했습니다. 저녁 식사를 조금 더 가볍게 유지하세요.", coach: "코치 박" }
  };
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[BalanceCoach Backend] Express server running on http://localhost:${PORT}`);
});
