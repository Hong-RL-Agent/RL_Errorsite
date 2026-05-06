const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9227;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const movies = [
  { id: 101, title: '다크 나이트 리턴즈', genre: '액션/스릴러', rating: '9.8', image: '🦇', times: ['10:00', '13:30', '16:45', '20:00'] },
  { id: 102, title: '인터스텔라 리마스터링', genre: 'SF/드라마', rating: '9.5', image: '🚀', times: ['09:30', '14:00', '19:15'] },
  { id: 103, title: '듄: 파트 3', genre: 'SF/액션', rating: '9.2', image: '🏜️', times: ['11:00', '15:20', '21:00'] },
  { id: 104, title: '어벤져스: 뉴 에이지', genre: '히어로/액션', rating: '8.9', image: '🛡️', times: ['08:00', '12:15', '17:30', '22:15'] }
];

// --- API Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site008', port: PORT, timestamp: new Date().toISOString() });
});

app.get('/api/movies', (req, res) => {
  res.json({ success: true, data: movies });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Cinema server running -> http://localhost:${PORT}`);
});
