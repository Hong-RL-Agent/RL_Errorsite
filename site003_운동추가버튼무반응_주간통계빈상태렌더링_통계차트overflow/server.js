const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9222;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const userProfile = {
  name: '김피트',
  level: '중급',
  caloriesBurned: 3200,
  workoutsCompleted: 15
};

const weeklyStats = [
  { day: '월', calories: 450, duration: 45 },
  { day: '화', calories: 600, duration: 60 },
  { day: '수', calories: 300, duration: 30 },
  { day: '목', calories: 550, duration: 50 },
  { day: '금', calories: 400, duration: 40 },
  { day: '토', calories: 800, duration: 90 },
  { day: '일', calories: 0, duration: 0 }
];

const routines = [
  { id: 1, name: '스쿼트 4세트', category: '하체', completed: true },
  { id: 2, name: '벤치 프레스 4세트', category: '가슴', completed: false },
  { id: 3, name: '풀업 3세트', category: '등', completed: false },
  { id: 4, name: '플랭크 3분', category: '코어', completed: false },
  { id: 5, name: '트레드밀 30분', category: '유산소', completed: true }
];

// --- API Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site003', port: PORT, timestamp: new Date().toISOString() });
});

app.get('/api/user', (req, res) => {
  res.json({ success: true, data: userProfile });
});

app.get('/api/stats/weekly', (req, res) => {
  res.json({ success: true, data: weeklyStats });
});

app.get('/api/routines', (req, res) => {
  const { category } = req.query;
  let filtered = routines;
  if (category && category !== '전체') {
    filtered = filtered.filter(r => r.category === category);
  }
  res.json({ success: true, data: filtered });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Fitness Dashboard server running -> http://localhost:${PORT}`);
});
