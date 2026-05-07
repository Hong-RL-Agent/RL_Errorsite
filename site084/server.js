import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9193;

app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Bug-Id']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
let workouts = [
  { id: 1, type: "Running", duration: 30, calories: 300, date: "2026-05-01" },
  { id: 2, type: "Cycling", duration: 45, calories: 400, date: "2026-05-02" },
  { id: 3, type: "Swimming", duration: 20, calories: 250, date: "2026-05-03" },
  { id: 4, type: "Running", duration: 40, calories: 420, date: "2026-05-04" },
  { id: 5, type: "Weightlifting", duration: 60, calories: 350, date: "2026-05-05" },
  { id: 6, type: "Yoga", duration: 50, calories: 150, date: "2026-05-06" }
];

let logs = [
  { id: 101, time: new Date(Date.now() - 3600000).toISOString(), type: "SYSTEM", msg: "Healthcare analytics engine started" },
  { id: 102, time: new Date(Date.now() - 1800000).toISOString(), type: "SYNC", msg: "Daily workout data synchronized" }
];

const addLog = (type, msg) => {
  logs.unshift({
    id: Date.now(),
    time: new Date().toISOString(),
    type,
    msg
  });
  if (logs.length > 20) logs.pop();
};

// --- API Endpoints ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site084", status: "healthy" });
});

app.post('/api/workouts', (req, res) => {
  const { type, duration, calories } = req.body;
  const newWorkout = {
    id: workouts.length + 1,
    type,
    duration: parseInt(duration),
    calories: parseInt(calories),
    date: new Date().toISOString().split('T')[0]
  };
  workouts.push(newWorkout);
  addLog("CREATE", `New workout recorded: ${type}`);
  res.json(newWorkout);
});

app.get('/api/workouts', (req, res) => {
  res.json({ data: workouts });
});

// Bug 01: average-calculation-error
app.get('/api/stats/average', (req, res) => {
  const { trigger } = req.query;
  let bugId = null;
  
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  let averageCalories = totalCalories / workouts.length;

  if (trigger === 'bug01') {
    bugId = 'site084-bug01';
    // Logic error: dividing by a fixed number (e.g. always 10) instead of actual length
    averageCalories = totalCalories / 10; 
    addLog("STATS", "Average calories calculated with sample bias");
  }

  res.setHeader('X-Bug-Id', bugId || '');
  res.json({ averageCalories, bugId });
});

// Bug 02: cumulative-sum-inconsistency
app.get('/api/stats/total', (req, res) => {
  const { trigger } = req.query;
  let bugId = null;
  
  let totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);

  if (trigger === 'bug02') {
    bugId = 'site084-bug02';
    // Logic error: off-by-one or missing last record in cumulative sum
    totalCalories = workouts.slice(0, -1).reduce((sum, w) => sum + w.calories, 0);
    addLog("STATS", "Total calories sum inconsistency detected");
  }

  res.setHeader('X-Bug-Id', bugId || '');
  res.json({ totalCalories, bugId });
});

// Bug 03: filter-omission-error
app.get('/api/stats', (req, res) => {
  const { startDate, endDate, trigger } = req.query;
  let bugId = null;
  
  let filtered = workouts.filter(w => {
    if (!startDate || !endDate) return true;
    return w.date >= startDate && w.date <= endDate;
  });

  if (trigger === 'bug03') {
    bugId = 'site084-bug03';
    // Logic error: ignoring the date filter and returning all records
    filtered = [...workouts];
    addLog("STATS", "Filter parameters ignored in data aggregation");
  }

  res.setHeader('X-Bug-Id', bugId || '');
  res.json({ data: filtered, bugId });
});

// Bug 04: grouping-key-misalignment
app.get('/api/stats/group', (req, res) => {
  const { trigger } = req.query;
  let bugId = null;
  
  const groups = workouts.reduce((acc, w) => {
    const key = w.type;
    if (!acc[key]) acc[key] = 0;
    acc[key] += w.calories;
    return acc;
  }, {});

  let result = Object.entries(groups).map(([type, total]) => ({ type, total }));

  if (trigger === 'bug04') {
    bugId = 'site084-bug04';
    // Logic error: grouping everything under a single "Other" key incorrectly
    result = [{ type: "Other", total: workouts.reduce((sum, w) => sum + w.calories, 0) }];
    addLog("STATS", "Workout categorization grouping misalignment");
  }

  res.setHeader('X-Bug-Id', bugId || '');
  res.json({ groups: result, bugId });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalWorkouts: workouts.length,
    totalCalories: workouts.reduce((sum, w) => sum + w.calories, 0),
    avgDuration: workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs });
});

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site084 Healthcare Analytics running on http://localhost:${PORT}`);
});
