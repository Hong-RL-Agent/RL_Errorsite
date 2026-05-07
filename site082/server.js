import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9191;

app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Bug-Id']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const products = [
  { id: 101, name: "시그니처 러닝 슈즈", price: 89000, category: "Shoes", img: "👟" },
  { id: 102, name: "베이직 오버핏 후드", price: 45000, category: "Apparel", img: "🧥" },
  { id: 103, name: "스트릿 카고 팬츠", price: 55000, category: "Apparel", img: "👖" },
  { id: 104, name: "미니멀리스트 백팩", price: 72000, category: "Bag", img: "🎒" },
  { id: 105, name: "스테인리스 워터보틀", price: 24000, category: "Accessory", img: "🍶" },
  { id: 106, name: "프리미엄 요가 매트", price: 38000, category: "Sports", img: "🧘" }
];

let experimentConfig = {
  name: "discount-banner-v2",
  rollout: 30,
  active: true,
  updatedAt: new Date().toISOString()
};

let cachedConfig = { ...experimentConfig }; // Bug 03: Used for inconsistency

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
  res.json({ ok: true, site: "site082", status: "healthy" });
});

// 2. GET /api/products
app.get('/api/products', (req, res) => {
  res.json({ data: products });
});

// 3. GET /api/recommendations (Bugs 01, 03, 04)
app.get('/api/recommendations', (req, res) => {
  const { userId, userType, trigger } = req.query;
  let bugId = null;
  let items = [...products].slice(0, 3);

  // Bug 01: unstable-assignment
  if (trigger === 'bug01') {
    items = [...products].sort(() => Math.random() - 0.5).slice(0, 3);
    bugId = 'site082-bug01';
  }
  
  // Bug 03: flag-cache-inconsistency
  // If we update experiments but use cachedConfig here
  if (trigger === 'bug03') {
    // Return recommendations based on OLD config (e.g. if config was disabled but we still show it)
    bugId = 'site082-bug03';
  }

  // Bug 04: segment-matching-error
  // Normally, if userType=new, we only show specific items. 
  // Bug: Returns all items or wrong items regardless of segment when bug04 is triggered
  if (trigger === 'bug04') {
    items = [...products]; // Over-exposed to all items (ignores segment)
    bugId = 'site082-bug04';
  }

  res.setHeader('X-Bug-Id', bugId || '');
  addLog('GET', '/api/recommendations', 200, bugId);
  res.json({
    userId: userId || 'anonymous',
    userType: userType || 'regular',
    items,
    configUsed: trigger === 'bug03' ? cachedConfig : experimentConfig,
    bugId
  });
});

// 4. POST /api/experiments (Bug 03 Trigger point)
app.post('/api/experiments', (req, res) => {
  const { rollout, active } = req.body;
  
  // Update the real config
  experimentConfig = {
    ...experimentConfig,
    rollout: rollout !== undefined ? rollout : experimentConfig.rollout,
    active: active !== undefined ? active : experimentConfig.active,
    updatedAt: new Date().toISOString()
  };

  // Bug 03: We DON'T update cachedConfig here
  addLog('POST', '/api/experiments', 200);
  res.json({ success: true, currentConfig: experimentConfig });
});

// 5. GET /api/experiments/stats (Bug 02)
app.get('/api/experiments/stats', (req, res) => {
  const { trigger } = req.query;
  let bugId = null;
  let actual = experimentConfig.rollout;

  // Bug 02: rollout-percentage-miscalculation
  if (trigger === 'bug02') {
    actual = 75; // Hardcoded mismatch
    bugId = 'site082-bug02';
  }

  res.setHeader('X-Bug-Id', bugId || '');
  addLog('GET', '/api/experiments/stats', 200, bugId);
  res.json({
    name: experimentConfig.name,
    expected: experimentConfig.rollout,
    actual: actual,
    bugId
  });
});

// 6. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalProducts: products.length,
    activeExperiments: 3,
    serverStatus: "UP",
    cacheSync: "STALE" // Hint for bug03
  });
});

// 7. GET /api/logs
app.get('/api/logs', (req, res) => {
  res.json({ data: serverLogs.slice().reverse() });
});

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site082 E-commerce platform running on http://localhost:${PORT}`);
});
