import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9170; // Site 061 Unified Port

app.use(cors());
app.use(express.json());

// --- Mock Data ---
let webtoons = [
  { id: 1, title: '나 혼자 레벨업', author: '추공', day: 'mon', likes: 1200, updatedAt: 1714656000000, thumbnail: 'https://placehold.co/150x200?text=LevelUp' },
  { id: 2, title: '신의 탑', author: 'SIU', day: 'mon', likes: 850, updatedAt: 1714656100000, thumbnail: 'https://placehold.co/150x200?text=Tower' },
  { id: 3, title: '화산귀환', author: '비가', day: 'tue', likes: 2000, updatedAt: 1714742400000, thumbnail: 'https://placehold.co/150x200?text=Mount' },
  { id: 4, title: '전지적 독자 시점', author: '싱숑', day: 'tue', likes: 1500, updatedAt: 1714742500000, thumbnail: 'https://placehold.co/150x200?text=Omniscient' },
  { id: 5, title: '연애혁명', author: '232', day: 'wed', likes: 900, updatedAt: 1714828800000, thumbnail: 'https://placehold.co/150x200?text=Love' },
  { id: 6, title: '외모지상주의', author: '박태준', day: 'fri', likes: 1800, updatedAt: 1715001600000, thumbnail: 'https://placehold.co/150x200?text=Lookism' },
  { id: 7, title: '유미의 세포들', author: '이동건', day: 'sat', likes: 700, updatedAt: 1715088000000, thumbnail: 'https://placehold.co/150x200?text=Yumi' },
  { id: 8, title: '호랑이형님', author: '이상규', day: 'sun', likes: 1100, updatedAt: 1715174400000, thumbnail: 'https://placehold.co/150x200?text=Tiger' },
];

let updateLogs = [];

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site061", status: "healthy" });
});

// BUG 01: weekday-mapping-mismatch
app.get('/api/webtoons', (req, res) => {
  const { day, sort } = req.query;
  let data = [...webtoons];
  let bugId = null;

  if (day) {
    if (day === 'mon') {
      data = data.filter(w => w.day === 'tue');
      bugId = 'site061-bug01';
    } else if (day === 'tue') {
      data = data.filter(w => w.day === 'mon');
      bugId = 'site061-bug01';
    } else {
      data = data.filter(w => w.day === day);
    }
  }

  if (sort === 'latest') {
    data.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  res.json({ data, bugId });
});

// BUG 04: unstable-sort-order
app.get('/api/webtoons/latest', (req, res) => {
  let data = [...webtoons];
  const now = Date.now();
  data = data.map(w => ({ ...w, updatedAt: now }));
  data = data.sort(() => Math.random() - 0.5);
  res.json({ data: data.slice(0, 5), bugId: 'site061-bug04' });
});

app.get('/api/webtoons/:id', (req, res) => {
  const item = webtoons.find(w => w.id === parseInt(req.params.id));
  res.json(item || { error: 'Not found' });
});

// BUG 03: non-atomic-like-increment
app.post('/api/webtoons/like', (req, res) => {
  const { id } = req.body;
  const index = webtoons.findIndex(w => w.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  const inc = Math.random() > 0.5 ? 1 : 0;
  webtoons[index].likes += inc;
  updateLogs.push({ action: 'LIKE', id, result: webtoons[index].likes, time: Date.now() });
  
  res.json({ 
    liked: true, 
    id, 
    likes: webtoons[index].likes, 
    bugId: inc === 0 ? 'site061-bug03' : null 
  });
});

// BUG 02: stale-update-list
app.post('/api/webtoons/update', (req, res) => {
  const { id } = req.body;
  const index = webtoons.findIndex(w => w.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  webtoons[index].updatedAt = Date.now();
  webtoons[index].title += ' [UPDATED]';
  updateLogs.push({ action: 'UPDATE', id, time: Date.now() });
  
  res.json({ updated: true, bugId: 'site061-bug02' });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalWebtoons: webtoons.length,
    todayCount: 2
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: updateLogs.slice(-10).reverse() });
});

// Catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Site061 on http://localhost:${PORT}`));
