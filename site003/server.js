const express = require('express');
const path = require('path');
const app = express();
const PORT = 9332;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let workouts = [
  { id: 'w1', userId: 'user-001', name: '스쿼트 5세트', type: '하체', completed: false, date: '2026-05-01' },
  { id: 'w2', userId: 'user-001', name: '벤치프레스 5세트', type: '가슴', completed: true, date: '2026-05-01' },
  { id: 'w3', userId: 'user-001', name: '데드리프트 3세트', type: '전신', completed: false, date: '2026-05-01' },
  { id: 'w4', userId: 'user-002', name: '비밀 유산소 운동', type: '유산소', completed: true, date: '2026-05-01' }
];

let goals = {
  'user-001': { weight: 70, targetWeight: 65, weeklyDays: 4 },
  'user-002': { weight: 80, targetWeight: 75, weeklyDays: 5 }
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FitTrack Studio API is running' });
});

// API: Get Workouts
app.get('/api/workouts', (req, res) => {
  // INTENTIONAL BUG: site003-bug03
  // CSV Error: 권한 검증 누락
  // Type: security-authorization
  // Description: 다른 사용자의 userId를 쿼리로 넘기면 해당 사용자의 운동 기록을 조회할 수 있음.
  // The 'auth' middleware is skipped, and it just blindly trusts the query parameter.
  const targetUserId = req.query.userId || 'user-001'; 
  
  const userWorkouts = workouts.filter(w => w.userId === targetUserId);
  res.json(userWorkouts);
});

// API: Complete Workout
app.put('/api/workouts/:id/complete', (req, res) => {
  const targetId = req.params.id;
  
  // INTENTIONAL BUG: site003-bug01
  // CSV Error: DB 업데이트 대상 오류
  // Type: database-update
  // Description: 운동 완료 처리 시 요청한 workoutId가 아니라 첫 번째 운동 데이터가 업데이트됨.
  if (workouts.length > 0) {
    workouts[0].completed = true; // Always updating the first element instead of the targetId
  }
  
  res.json({ success: true, message: '운동 완료 처리되었습니다.' });
});

// API: Get Stats
app.get('/api/stats', (req, res) => {
  // INTENTIONAL BUG: site003-bug02
  // CSV Error: 불안정한 네트워크 응답
  // Type: network-random-failure
  // Description: 통계 API가 특정 조건에서 간헐적으로 503을 반환하여 통계 카드가 갱신되지 않음.
  if (Math.random() < 0.5) {
    return res.status(503).json({ error: 'Service Unavailable (DB Connection Timeout)' });
  }

  res.json({
    totalWorkouts: 15,
    totalMinutes: 650,
    caloriesBurned: 4500,
    streak: 4
  });
});

// API: Get Goals
app.get('/api/goals', (req, res) => {
  res.json(goals['user-001']);
});

// API: Add Workout
app.post('/api/workouts', (req, res) => {
  const { name, type } = req.body;
  const newWorkout = {
    id: 'w' + Date.now(),
    userId: 'user-001',
    name: name,
    type: type,
    completed: false,
    date: '2026-05-01'
  };
  workouts.push(newWorkout);
  res.json({ success: true, workout: newWorkout });
});

// API: Get Profile
app.get('/api/profile', (req, res) => {
  res.json({
    id: 'user-001',
    name: '운동인',
    level: '초급자',
    statusMsg: '오늘도 득근!'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
