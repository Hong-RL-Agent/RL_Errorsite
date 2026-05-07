import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9183;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
let hashtags = [
  { id: 101, tag: '#food', count: 1250, trend: 'up' },
  { id: 102, tag: '#travel', count: 840, trend: 'down' },
  { id: 103, tag: '#coding', count: 2100, trend: 'up' },
  { id: 104, tag: '#daily', count: 5600, trend: 'stable' },
  { id: 105, tag: '#맛집', count: 3200, trend: 'up' }
];

let trends = [
  { hour: '09:00', score: 45 },
  { hour: '10:00', score: 52 },
  { hour: '11:00', score: 68 },
  { hour: '12:00', score: 95 },
  { hour: '13:00', score: 88 },
  { hour: '14:00', score: 72 },
  { hour: '15:00', score: 60 }
];

let logs = [
  { id: 1, time: new Date().toISOString(), msg: '트렌드 데이터 엔진 가동 시작' },
  { id: 2, time: new Date().toISOString(), msg: '전역 해시태그 크롤링 완료' }
];

// --- API Endpoints ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: 'site074', status: 'healthy' });
});

app.get('/api/hashtags', (req, res) => {
  const { search, triggerBug } = req.query;
  let filtered = [...hashtags];

  // BUG-01: Character Encoding Corruption
  if (triggerBug === 'site074-bug01' && search) {
    // Intentionally corrupt Korean encoding for search results
    const corrupted = filtered.map(h => {
      if (h.tag === '#맛집') return { ...h, tag: '#맛\ufffd' };
      return h;
    }).filter(h => h.tag.includes('맛'));
    return res.json({ data: corrupted, bugId: 'site074-bug01' });
  }

  if (search) {
    filtered = filtered.filter(h => h.tag.toLowerCase().includes(search.toLowerCase()));
  }

  res.json({ data: filtered });
});

app.post('/api/hashtags', (req, res) => {
  const { tag, triggerBug } = req.body;
  
  // BUG-03: Non-Unique ID Generation
  let newId = Math.floor(Date.now() / 100000); // Intentionally low precision to cause collision
  if (triggerBug === 'site074-bug03') {
    newId = 101; // Force collision with existing ID
    const newTag = { id: newId, tag, count: 0, trend: 'stable' };
    hashtags.push(newTag);
    logs.push({ id: logs.length + 1, time: new Date().toISOString(), msg: `CRITICAL: Data Integrity Violated. Duplicate UID [${newId}] detected in parallel buffer!` });
    logs.push({ id: logs.length + 2, time: new Date().toISOString(), msg: `WARNING: System cannot distinguish records with conflicting identifiers.` });
    return res.status(201).json({ data: newTag, bugId: 'site074-bug03' });
  }

  const newTag = { id: Date.now(), tag, count: 0, trend: 'stable' };
  hashtags.push(newTag);
  res.status(201).json({ data: newTag });
});

app.get('/api/trends', (req, res) => {
  const { triggerBug } = req.query;

  // BUG-02: Gzip Decompression Mismatch (Data Loss)
  if (triggerBug === 'site074-bug02') {
    // Intentionally return only half of the data
    const lostData = trends.slice(0, Math.ceil(trends.length / 2));
    return res.json({ data: lostData, bugId: 'site074-bug02' });
  }

  res.json({ data: trends });
});

app.get('/api/stats/sample', (req, res) => {
  const { triggerBug } = req.query;

  // BUG-04: Biased Sampling Distortion
  if (triggerBug === 'site074-bug04') {
    // Intentionally bias towards peak hours only
    const peakSum = trends.filter(t => parseInt(t.hour) >= 11 && parseInt(t.hour) <= 13)
                          .reduce((sum, t) => sum + t.score, 0);
    const distortedScore = (peakSum / 3) * 10; // Highly inflated
    return res.json({ trendScore: distortedScore, bugId: 'site074-bug04' });
  }

  const avg = trends.reduce((sum, t) => sum + t.score, 0) / trends.length;
  res.json({ trendScore: Math.round(avg * 10) / 10 });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalTags: hashtags.length * 125,
    topTag: '#food',
    activeUsers: 4820
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs });
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hashtag Analysis Dashboard running on http://localhost:${PORT}`);
});
