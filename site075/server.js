import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9184;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
let episodes = [
  { id: 1, title: 'AI의 미래와 PPO 알고리즘', host: '테크 브리핑', duration: 180, likes: 1240, createdAt: '2024-05-01' },
  { id: 2, title: '현대 웹 아키텍처 탐구', host: '데브 인사이트', duration: 240, likes: 850, createdAt: '2024-05-02' },
  { id: 3, title: '디지털 노마드의 삶', host: '라이프 스타일', duration: 150, likes: 2100, createdAt: '2024-05-03' },
  { id: 4, title: '백엔드 장애 조치 사례', host: '시스템 운영팀', duration: 300, likes: 1500, createdAt: '2024-05-04' }
];

app.use((req, res, next) => {
  res.setHeader('Access-Control-Expose-Headers', 'X-Bug-Id');
  next();
});

let logs = [
  { id: 1, time: new Date().toISOString(), msg: '미디어 스트리밍 서버 가동 완료' },
  { id: 2, time: new Date().toISOString(), msg: 'CDN 엣지 노드 동기화 성공' }
];

// --- API Endpoints ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: 'site075', status: 'healthy' });
});

app.get('/api/episodes', (req, res) => {
  const { sort } = req.query;
  let data = [...episodes];
  if (sort === 'popular') data.sort((a, b) => b.likes - a.likes);
  res.json({ data });
});

app.get('/api/episodes/:id', (req, res) => {
  const ep = episodes.find(e => e.id === parseInt(req.params.id));
  if (!ep) return res.status(404).json({ msg: 'Not found' });
  res.json(ep);
});

app.get('/api/stream/:id', (req, res) => {
  const { triggerBug, chunked } = req.query;
  const range = req.headers.range;
  const dummyDataSize = 10000;
  const dummyBuffer = Buffer.alloc(dummyDataSize, 'AUDIO_DATA_SIMULATION');

  // BUG-03: Incorrect MIME Type
  if (triggerBug === 'site075-bug03') {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('X-Bug-Id', 'site075-bug03');
    logs.push({ id: logs.length + 1, time: new Date().toISOString(), msg: `CRITICAL: Mismatched MIME type detected for stream session.` });
    return res.send(`[site075-bug03] This is text instead of audio stream.`);
  }

  // BUG-02: Content-Length Mismatch
  if (triggerBug === 'site075-bug02') {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', 50000); // Intentionally larger than actual
    res.setHeader('X-Bug-Id', 'site075-bug02');
    // Send only small portion
    return res.end(dummyBuffer.slice(0, 1000));
  }

  // BUG-01: HTTP Range Header Misinterpretation
  if (triggerBug === 'site075-bug01' && range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    // Intentionally shift range by 500 bytes
    const fakeStart = start + 500;
    const fakeEnd = fakeStart + 1000;
    res.status(206).header({
      'Content-Range': `bytes ${fakeStart}-${fakeEnd}/${dummyDataSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': 1001,
      'Content-Type': 'audio/mpeg',
      'X-Bug-Id': 'site075-bug01'
    }).send(dummyBuffer.slice(fakeStart, fakeEnd + 1));
    return;
  }

  // BUG-04: Chunk Ordering Corruption
  if (triggerBug === 'site075-bug04' && chunked) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Bug-Id', 'site075-bug04');
    
    // Send chunks in wrong order
    logs.push({ id: logs.length + 1, time: new Date().toISOString(), msg: `WARNING: Parallel chunk delivery mode active. Packet sequencing issues may occur.` });
    res.write(dummyBuffer.slice(2000, 3000));
    res.write(dummyBuffer.slice(0, 1000));
    res.write(dummyBuffer.slice(1000, 2000));
    return res.end();
  }

  // Normal Streaming (Partial or Full)
  res.setHeader('Content-Type', 'audio/mpeg');
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : dummyDataSize - 1;
    const chunksize = (end - start) + 1;
    res.status(206).header({
      'Content-Range': `bytes ${start}-${end}/${dummyDataSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
    }).send(dummyBuffer.slice(start, end + 1));
  } else {
    res.setHeader('Content-Length', dummyDataSize);
    res.send(dummyBuffer);
  }
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalEpisodes: episodes.length * 25,
    topEpisode: 'AI의 미래와 PPO 알고리즘',
    totalPlays: 15800,
    activeListeners: 420
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
  console.log(`Podcast Streaming Platform running on http://localhost:${PORT}`);
});
