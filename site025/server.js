import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9134;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
const mbtis = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

const traitDetails = {
  'I': 'Introversion', 'E': 'Extraversion',
  'N': 'Intuition', 'S': 'Sensing',
  'T': 'Thinking', 'F': 'Feeling',
  'J': 'Judging', 'P': 'Perceiving'
};

// Initial Seed Data for Popular Matches
let matchesHistory = [];
for (let i = 0; i < 200; i++) {
  const m1 = mbtis[Math.floor(Math.random() * mbtis.length)];
  const m2 = mbtis[Math.floor(Math.random() * mbtis.length)];
  matchesHistory.push({ mbtiA: m1, mbtiB: m2, timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString() });
}

// Real-time Vectors for Recommendation Engine
let recommendationVectors = mbtis.map(m => ({
  mbti: m,
  weight: Math.random(),
  lastUpdated: new Date().toISOString()
}));

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: 'site025', status: 'operational' });
});

// 2. GET /api/mbti
app.get('/api/mbti', (req, res) => {
  res.json({ success: true, data: mbtis });
});

// 3. GET /api/match/:a/:b (site025-bug04)
app.get('/api/match/:a/:b', (req, res) => {
  const { a, b } = req.params;
  
  // Simulated Trait Aggregation
  const traits = [0.85, 0.72, 0.94, 0.68, 0.77]; 
  
  // INTENTIONAL BACKEND BUG: site025-bug04
  const baseScore = traits.slice(0, traits.length - 2).reduce((sum, val) => sum + val, 0);
  const maxPotential = traits.length; 
  const normalizedScore = Math.floor((baseScore / (maxPotential - 2)) * 100); 

  const analysisPool = [
    `두 유형은 서로의 차이점을 보완하며 강력한 시너지를 낼 수 있는 관계입니다.`,
    `의사소통 방식에서 약간의 차이가 있을 수 있으나, 서로를 이해하려는 노력이 있다면 매우 긍정적입니다.`,
    `감정적인 교감보다는 논리적인 협력 관계에서 더 큰 힘을 발휘하는 조합입니다.`,
    `함께 있을 때 새로운 영감을 주고받으며 성장을 도모할 수 있는 역동적인 관계입니다.`
  ];
  const analysis = analysisPool[Math.floor(Math.random() * analysisPool.length)];

  const relationshipType = normalizedScore > 80 ? 'Ideal' : normalizedScore > 60 ? 'Good' : 'Challenging';

  res.json({
    success: true,
    mbtiA: a,
    mbtiB: b,
    score: normalizedScore,
    type: relationshipType,
    analysis: analysis,
    traitsUsed: traits.length - 2, 
    bugId: 'site025-bug04'
  });
});

// 4. GET /api/matches/popular (site025-bug01)
app.get('/api/matches/popular', (req, res) => {
  // INTENTIONAL BACKEND BUG: site025-bug01
  // Type: hot-partition-skew
  // Description: 특정 MBTI (INFP, ENFP)에 데이터가 집중되도록 의도적으로 skew 발생
  const popular = matchesHistory.filter(m => m.mbtiA === "INFP" || m.mbtiA === "ENFP" || Math.random() > 0.85);
  
  // Count frequencies
  const stats = {};
  popular.forEach(m => {
    stats[m.mbtiA] = (stats[m.mbtiA] || 0) + 1;
  });

  res.json({
    success: true,
    data: Object.entries(stats).map(([mbti, count]) => ({ mbti, count })).sort((a, b) => b.count - a.count),
    bugId: 'site025-bug01',
    totalSamples: popular.length
  });
});

// 5. GET /api/matches/realtime (site025-bug02)
app.get('/api/matches/realtime', (req, res) => {
  // Simulate vector update
  recommendationVectors.forEach(v => {
    v.weight = Math.random();
    v.lastUpdated = new Date().toISOString();
  });

  // INTENTIONAL BACKEND BUG: site025-bug02
  // Type: real-time-vector-sync-fragmentation
  // Description: 일부 벡터만 최신 상태로 반환되어 일관성 깨짐
  const updated = recommendationVectors.slice(0, Math.floor(recommendationVectors.length / 2));
  const stale = recommendationVectors.slice(Math.floor(recommendationVectors.length / 2)).map(v => ({
    ...v,
    weight: 0, // Reset or stale value
    lastUpdated: new Date(Date.now() - 3600000).toISOString()
  }));

  res.json({
    success: true,
    data: [...updated, ...stale],
    bugId: 'site025-bug02',
    syncStatus: 'Partial'
  });
});

// 6. GET /api/search (site025-bug03)
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const searchResult = mbtis.filter(m => m.toLowerCase().includes((q || '').toLowerCase()));
  
  // INTENTIONAL BACKEND BUG: site025-bug03
  // Type: reindex-search-blackout
  // Description: 재색인 중 일부 요청에서 실제 데이터가 있음에도 빈 결과 반환
  if (Math.random() < 0.45) {
    return res.json({ 
      success: true, 
      results: [], 
      bugId: 'site025-bug03',
      status: 'Indexing...' 
    });
  }

  res.json({
    success: true,
    results: searchResult.map(m => ({ mbti: m, description: `The ${m} personality type.` }))
  });
});

// 7. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalUsers: 15420,
    dailyMatches: 2840,
    activeIndexers: 4,
    avgSyncLatency: '1.2ms',
    uptime: '99.99%'
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site025 MBTI platform running on http://localhost:${PORT}`);
});
