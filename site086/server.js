import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9195;

app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Bug-Id']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
let posts = [
  { id: 1, title: "오늘의 점심 메뉴 추천", author: "맛잘알", views: 1250, likes: 45, tags: ["Food"], date: "2026-05-06 10:00" },
  { id: 2, title: "자바스크립트 마스터하는 법", author: "코드왕", views: 3200, likes: 210, tags: ["Tech"], date: "2026-05-06 09:30" },
  { id: 3, title: "퇴근하고 싶다...", author: "직딩1", views: 800, likes: 15, tags: ["Life"], date: "2026-05-06 11:00" },
  { id: 4, title: "주식 시장 분석 리포트", author: "금융가", views: 2500, likes: 88, tags: ["Finance"], date: "2026-05-05 15:00" },
  { id: 5, title: "귀여운 강아지 보고 가세요", author: "댕댕이", views: 5000, likes: 450, tags: ["Animal"], date: "2026-05-06 12:00" },
  { id: 6, title: "리액트 최신 트렌드", author: "프론트덕", views: 1800, likes: 75, tags: ["Tech"], date: "2026-05-06 08:00" },
  { id: 7, title: "서울 맛집 지도 공유", author: "탐험가", views: 4200, likes: 320, tags: ["Food"], date: "2026-05-04 18:00" },
  { id: 8, title: "운동 1일차 후기", author: "헬린이", views: 600, likes: 45, tags: ["Health"], date: "2026-05-06 07:00" } // Tied likes with ID 1
];

let logs = [
  { id: 1, time: new Date().toISOString(), msg: "Ranking engine initialized", status: "STABLE" }
];

const addLog = (msg, status = "INFO") => {
  logs.unshift({ id: Date.now(), time: new Date().toISOString(), msg, status });
  if (logs.length > 20) logs.pop();
};

// For Bug 03: stale ranking snapshot
let stalePostsSnapshot = JSON.parse(JSON.stringify(posts));

// --- API Endpoints ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site086", status: "healthy" });
});

app.get('/api/posts', (req, res) => {
  const { sort } = req.query;
  let bugId = null;
  let data = [...posts];

  if (sort === 'popular') {
    // Bug 01: incorrect-sort-key (Popular should use views, but uses likes)
    bugId = 'site086-bug01';
    data.sort((a, b) => b.likes - a.likes);
    addLog("Popular sort requested: processing metrics...");
  } else if (sort === 'latest') {
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    // Default sort: views (with Bug 02: missing-tiebreaker)
    bugId = 'site086-bug02';
    data.sort((a, b) => {
      const diff = b.views - a.views;
      if (diff === 0) {
        // Missing tie-breaker: random return
        return Math.random() - 0.5;
      }
      return diff;
    });
  }

  if (bugId) res.setHeader('X-Bug-Id', bugId);
  res.json({ data, bugId });
});

app.post('/api/posts/like', (req, res) => {
  const { postId } = req.body;
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.likes += 1;
    addLog(`Post #${postId} liked by user`);
    // Note: Bug 03 is that we DON'T update the stale snapshot used by logs
    res.json({ success: true, postId, likes: post.likes });
  } else {
    res.status(404).json({ error: "Post not found" });
  }
});

app.get('/api/recommendations', (req, res) => {
  // Bug 04: priority-inversion (Recommended posts are reversed)
  let data = posts.map(p => ({
    ...p,
    score: Math.floor(p.views * 0.1 + p.likes * 2)
  }));
  
  const bugId = 'site086-bug04';
  // Sorting by score ASCENDING (should be DESCENDING for recommendations)
  data.sort((a, b) => a.score - b.score);

  res.setHeader('X-Bug-Id', bugId);
  res.json({ data, bugId });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalPosts: posts.length,
    totalViews: posts.reduce((s, p) => s + p.views, 0),
    totalLikes: posts.reduce((s, p) => s + p.likes, 0)
  });
});

app.get('/api/logs', (req, res) => {
  // Bug 03: stale-ranking (Returns data based on old snapshot)
  const bugId = 'site086-bug03';
  
  // Create a view of rankings based on the STALE snapshot
  const rankings = [...stalePostsSnapshot]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5)
    .map((p, idx) => `[Rank ${idx+1}] ${p.title} (${p.likes} likes)`);

  const displayLogs = [
    { id: 999, time: new Date().toISOString(), type: "RANKING_SNAPSHOT", msg: rankings.join(" | "), status: "BUGGY" },
    ...logs
  ];

  res.setHeader('X-Bug-Id', bugId);
  res.json({ data: displayLogs, bugId });
});

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site086 Community Ranking System running on http://localhost:${PORT}`);
});
