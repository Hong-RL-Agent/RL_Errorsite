const express = require('express');
const path = require('path');
const app = express();
const port = 9261;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Mock Data
let tasks = [
  { id: 1, title: '디자인 시스템 명세서 작성', priority: 'High', completed: false, estTime: '45m' },
  { id: 2, title: 'API 엔드포인트 설계', priority: 'Medium', completed: true, estTime: '30m' },
  { id: 3, title: '프론트엔드 컴포넌트 개발', priority: 'High', completed: false, estTime: '120m' },
  { id: 4, title: '주간 업무 보고서 정리', priority: 'Low', completed: false, estTime: '20m' }
];

let sessions = [
  { id: 101, taskName: 'API 엔드포인트 설계', startTime: '2026-05-04T09:00:00Z', duration: '30m', status: 'Completed' },
  { id: 102, taskName: '디자인 시스템 명세서 작성', startTime: '2026-05-04T10:15:00Z', duration: '25m', status: 'Completed' },
  { id: 103, taskName: '코드 리뷰', startTime: '2026-05-04T11:00:00Z', duration: '15m', status: 'Completed' },
  { id: 104, taskName: '팀 미팅', startTime: '2026-05-04T13:00:00Z', duration: '40m', status: 'Completed' },
  { id: 105, taskName: '프론트엔드 컴포넌트 개발', startTime: '2026-05-04T14:30:00Z', duration: '50m', status: 'Completed' }
];

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title || 'Untitled Task',
    priority: req.body.priority || 'Medium',
    completed: false,
    estTime: req.body.estTime || '30m'
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
