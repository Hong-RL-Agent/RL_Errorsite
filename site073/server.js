import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9182;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
let courses = [
  { id: 1, title: 'React Masterclass', progress: 85, instructor: 'John Doe', category: 'Development' },
  { id: 2, title: 'Node.js Backend Essentials', progress: 40, instructor: 'Jane Smith', category: 'Backend' },
  { id: 3, title: 'Advanced UI/UX Design', progress: 15, instructor: 'Alice Brown', category: 'Design' },
  { id: 4, title: 'Database Optimization', progress: 60, instructor: 'Bob Wilson', category: 'Database' },
  { id: 5, title: 'PPO Reinforcement Learning', progress: 10, instructor: 'Deepmind AI', category: 'AI' }
];

let rankings = [
  { id: 1, name: 'User_Alpha', score: 1200 },
  { id: 2, name: 'User_Beta', score: 1200 },
  { id: 3, name: 'User_Gamma', score: 950 },
  { id: 4, name: 'User_Delta', score: 1200 },
  { id: 5, name: 'User_Epsilon', score: 800 }
];

let logs = [
  { id: 1, time: new Date().toISOString(), msg: 'React Masterclass 강의 5강 수강 완료' },
  { id: 2, time: new Date().toISOString(), msg: 'Node.js 강의 학습 시간 30분 추가' }
];

let bugCounters = {
  bug04_counter: 1250 // Total learning count
};

// --- API Endpoints ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: 'site073', status: 'healthy' });
});

app.get('/api/courses', (req, res) => {
  const { status, search } = req.query;
  let filtered = [...courses];
  if (search) {
    filtered = filtered.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  }
  res.json({ data: filtered });
});

app.get('/api/progress', (req, res) => {
  const isBug = req.query.triggerBug === 'site073-bug01';
  let totalProgress = courses.reduce((acc, curr) => acc + curr.progress, 0);
  
  if (isBug) {
    // Bug 01: Wrong denominator (using 2 instead of 5)
    const bugValue = Math.round(totalProgress / 2);
    res.json({ progress: bugValue, bugId: 'site073-bug01' });
  } else {
    const normalValue = Math.round(totalProgress / courses.length);
    res.json({ progress: normalValue });
  }
});

app.get('/api/stats/time', (req, res) => {
  const isBug = req.query.triggerBug === 'site073-bug02';
  const baseTime = 12450; // minutes
  
  if (isBug) {
    // Bug 02: Cumulative overcount (adding baseTime 3 times)
    const bugTime = baseTime * 3;
    res.json({ totalTime: bugTime, bugId: 'site073-bug02' });
  } else {
    res.json({ totalTime: baseTime });
  }
});

app.get('/api/rankings', (req, res) => {
  const isBug = req.query.triggerBug === 'site073-bug03';
  let sortedRankings = [...rankings];
  
  if (isBug) {
    // Bug 03: Unstable sort (randomly shuffle users with same score)
    sortedRankings.sort((a, b) => {
      if (a.score === b.score) return Math.random() - 0.5;
      return b.score - a.score;
    });
    res.json({ data: sortedRankings, bugId: 'site073-bug03' });
  } else {
    sortedRankings.sort((a, b) => b.score - a.score);
    res.json({ data: sortedRankings });
  }
});

app.get('/api/dashboard/summary', (req, res) => {
  const isBug = req.query.triggerBug === 'site073-bug04';
  
  if (isBug) {
    // Bug 04: Reset counter
    bugCounters.bug04_counter = 0;
    res.json({ 
      totalCourses: courses.length, 
      totalLearningCount: bugCounters.bug04_counter, 
      bugId: 'site073-bug04' 
    });
  } else {
    res.json({ 
      totalCourses: courses.length, 
      totalLearningCount: bugCounters.bug04_counter 
    });
  }
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs });
});

app.get('/api/daily-goal', (req, res) => {
  res.json({
    goal: '오늘은 React 고급 훅 3강 수강하기',
    achieved: false,
    points: 50
  });
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Course Tracker Dashboard running on http://localhost:${PORT}`);
});
