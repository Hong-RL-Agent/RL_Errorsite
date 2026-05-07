import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9198;

app.use(cors({ origin: '*', exposedHeaders: ['X-Bug-Id'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- [Source of Truth] ---
let newsDatabase = [
  { id: 601, title: "지속 가능한 성장을 위한 '그린 테크' 혁신 전략 발표", category: "IT", views: 4200, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 602, title: "한국 배구 대표팀, 국제 대회서 전승 행진으로 결승행", category: "스포츠", views: 8500, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 603, title: "양자 컴퓨터 암호 해독 방지 기술 실증 성공", category: "IT", views: 5800, createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: 604, title: "중소기업 상생을 위한 디지털 전환 지원 예산 편성", category: "정치", views: 2900, createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 605, title: "국내 연구진, 꿈의 신소재 '맥신' 대량 생산 공정 개발", category: "IT", views: 7100, createdAt: new Date(Date.now() - 18000000).toISOString() },
  { id: 606, title: "프로야구 주말 3연전 만원 관중... 스포츠 열기 후끈", category: "스포츠", views: 4800, createdAt: new Date(Date.now() - 21600000).toISOString() }
];

// --- [Cache Layer] ---
let cacheStore = {
  generalFeed: [...newsDatabase], // Used for Bug 01
  categoryMap: {}                 // Used for Bug 02 & 03
};

let auditLogs = [
  { id: 1, time: new Date().toISOString(), msg: "NewsCore 캐시 제어 노드 가동 시작", type: "SYSTEM" }
];

const pushLog = (msg, type = "INFO") => {
  auditLogs.unshift({ id: Date.now(), time: new Date().toISOString(), msg, type });
  if (auditLogs.length > 50) auditLogs.pop();
};

// --- [API Endpoints] ---

// 1 & 2. GET News (General / Categorized)
app.get('/api/news', (req, res) => {
  const { category } = req.query;

  // [Bug 02] Cache Key Collision
  if (category && category !== '전체') {
    const bugId = 'site089-bug02';
    const sharedKey = 'CATEGORY_V1_GLOBAL'; // 모든 카테고리가 동일한 키를 공유
    
    if (!cacheStore.categoryMap[sharedKey]) {
      cacheStore.categoryMap[sharedKey] = newsDatabase.filter(n => n.category === category);
      pushLog(`카테고리 캐시 신규 생성: ${category}`, "SYSTEM");
    }
    
    res.setHeader('X-Bug-Id', bugId);
    return res.json({ data: cacheStore.categoryMap[sharedKey], bugId });
  }

  // [Bug 01] Cache Invalidation Missed
  // newsDatabase가 업데이트되어도 generalFeed는 초기 로드 상태를 고수함
  const bugId = 'site089-bug01';
  res.setHeader('X-Bug-Id', bugId);
  res.json({ data: cacheStore.generalFeed, bugId });
});

// 3. POST Update News (Triggers Bug 01 & 03)
app.post('/api/news/update', (req, res) => {
  const { title, category } = req.body;
  const bugId = 'site089-bug03';

  const newPost = {
    id: Date.now(),
    title: title || "속보: 새로운 헤드라인",
    category: category || "IT",
    views: 0,
    createdAt: new Date().toISOString()
  };

  // 데이터베이스 업데이트
  newsDatabase.unshift(newPost);
  pushLog(`뉴스 소스 업데이트 성공: ${newPost.title}`);

  // [Bug 03] Partial Update Missing
  // 캐시를 업데이트할 때, 기존 전체 리스트를 보존하지 않고 새로운 아이템 1개만 남기고 다 날려버림
  cacheStore.categoryMap['CATEGORY_V1_GLOBAL'] = [newPost]; 
  
  // [Bug 01 연계] 일반 피드 캐시는 아예 업데이트하지 않음 (Invalidation 누락)
  
  res.setHeader('X-Bug-Id', bugId);
  res.json({ status: "updated", bugId, newItem: newPost });
});

// 4. GET Source Data (Shows Bug 04 Inconsistency)
app.get('/api/news/source', (req, res) => {
  const bugId = 'site089-bug04';
  
  // 소스 데이터를 반환하되, 캐시와 제목이 다르도록 변조 (Inconsistency)
  const driftData = newsDatabase.map(n => {
    if (n.id === 601) return { ...n, title: "[STALE_DATA_SYNC_ERROR] " + n.title };
    return n;
  });

  res.setHeader('X-Bug-Id', bugId);
  res.json({ data: driftData, bugId });
});

// --- Normal Utility Endpoints ---
app.get('/api/news/trending', (req, res) => {
  const trending = [...newsDatabase].sort((a, b) => b.views - a.views).slice(0, 5);
  res.json({ data: trending });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalSource: newsDatabase.length,
    totalCache: cacheStore.generalFeed.length,
    activeKeys: Object.keys(cacheStore.categoryMap).length + 1,
    memory: (JSON.stringify(cacheStore).length / 1024).toFixed(2),
    hitRate: 94.5
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: auditLogs });
});

// Admin: Reset Cache (Normal Feature)
app.post('/api/admin/reset-cache', (req, res) => {
  cacheStore.generalFeed = [...newsDatabase];
  cacheStore.categoryMap = {};
  pushLog("관리자 명령: 모든 캐시 강제 무효화 수행", "WARN");
  res.json({ status: "success", msg: "Cache cleared" });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site089 News Backend is active on http://localhost:${PORT}`);
});
