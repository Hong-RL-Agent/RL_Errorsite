import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9189;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data & Cache System ---
let news = [
  { id: 1, title: "글로벌 테크 컨퍼런스 2026 개최", content: "차세대 AI 기술의 향연이 서울에서 시작됩니다.", category: "Tech", timestamp: new Date().toISOString() },
  { id: 2, title: "중앙은행, 금리 동결 발표", content: "경제 불확실성 해소를 위해 현행 금리를 유지하기로 결정했습니다.", category: "Economy", timestamp: new Date().toISOString() },
  { id: 3, title: "프로야구 개막전 열기 후끈", content: "만원 관중 속에서 화려한 개막전이 치러졌습니다.", category: "Sports", timestamp: new Date().toISOString() },
];

let cacheStats = {
  hit: 42,
  miss: 12,
  lastUpdated: new Date().toISOString()
};

let serverLogs = [];
const addLog = (method, url, status, bugId = null) => {
  serverLogs.push({
    id: Date.now(),
    time: new Date().toISOString(),
    method,
    url,
    status,
    bugId
  });
  if (serverLogs.length > 20) serverLogs.shift();
};

// --- API Endpoints ---

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site080", status: "healthy" });
});

// 2. GET /api/news
// Bugs: bug01 (ETag mismatch), bug03 (Conditional Request Ignore)
app.get('/api/news', (req, res) => {
  const triggerBug01 = req.query.trigger === 'bug01';
  const triggerBug02 = req.query.trigger === 'bug02';
  
  let etag = crypto.createHash('md5').update(JSON.stringify(news)).digest('hex');
  let bugId = null;

  // Bug 01: etag-mismatch (Always change etag if triggered)
  if (triggerBug01) {
    etag = crypto.randomBytes(16).toString('hex');
    bugId = 'site080-bug01';
  }

  // Bug 02: conditional-request-ignore
  const ifNoneMatch = req.headers['if-none-match'];
  if (ifNoneMatch === etag && !triggerBug02) {
    addLog('GET', '/api/news', 304);
    return res.status(304).send();
  }

  if (triggerBug02 && ifNoneMatch) {
    bugId = 'site080-bug02';
  }

  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'no-cache');
  addLog('GET', '/api/news', 200, bugId);
  res.json({ data: news, etag, bugId });
});

// 3. POST /api/news
app.post('/api/news', (req, res) => {
  const { title, content, category } = req.body;
  const newArticle = {
    id: news.length + 1,
    title,
    content,
    category: category || "General",
    timestamp: new Date().toISOString()
  };
  news.push(newArticle);
  
  // Normally we should update cacheStats, but for bug02 we might "forget" it
  // But let's trigger bug02 in the GET /api/cache/status endpoint
  
  addLog('POST', '/api/news', 201);
  res.status(201).json({ ok: true, data: newArticle });
});

// 4. GET /api/news/:id
// Bug 04: stale-data-return
app.get('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const triggerBug04 = req.query.trigger === 'bug04';
  
  let article = news.find(n => n.id === parseInt(id));
  if (!article) return res.status(404).json({ error: "Not Found" });

  let bugId = null;
  if (triggerBug04) {
    // Return a "stale" version of the article (simulated)
    article = { ...article, title: "[STALE] " + article.title, content: "이 데이터는 이미 만료되었으나 캐시에서 삭제되지 않았습니다." };
    bugId = 'site080-bug04';
  }

  addLog('GET', `/api/news/${id}`, 200, bugId);
  res.json({ ...article, bugId });
});

// 5. GET /api/cache/status
// Bug 03: cache-invalidation-failure
app.get('/api/cache/status', (req, res) => {
  const triggerBug03 = req.query.trigger === 'bug03';
  let bugId = null;
  
  let responseData = { ...cacheStats };

  if (triggerBug03) {
    // Return "old" stats regardless of recent updates
    responseData.hit = 0;
    responseData.miss = 0;
    responseData.lastUpdated = "1970-01-01T00:00:00Z";
    bugId = 'site080-bug03';
  } else {
    // Dynamic update simulation
    cacheStats.hit += Math.floor(Math.random() * 5);
    cacheStats.miss += Math.floor(Math.random() * 2);
    cacheStats.lastUpdated = new Date().toISOString();
    responseData = { ...cacheStats };
  }

  addLog('GET', '/api/cache/status', 200, bugId);
  res.json({ ...responseData, bugId });
});

// 6. GET /api/logs
app.get('/api/logs', (req, res) => {
  res.json({ data: serverLogs.slice().reverse() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
