import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9152;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let newsData = [
  { id: 1, title: "[단독] 톱스타 A군, 일반인과 열애 사실 인정", clicks: 1250, category: "열애", timestamp: new Date().toISOString() },
  { id: 2, title: "MZ 세대가 꼽은 '최악의 연애 방식' 1위는?", clicks: 980, category: "트렌드", timestamp: new Date().toISOString() },
  { id: 3, title: "결혼 발표 1주일 만에 파경? 진실은 무엇인가", clicks: 2100, category: "결혼", timestamp: new Date().toISOString() },
  { id: 4, title: "연애 예능 '솔로천국', 출연자 진정성 논란", clicks: 1540, category: "방송", timestamp: new Date().toISOString() },
  { id: 5, title: "성공적인 첫 데이트를 위한 5가지 팁", clicks: 450, category: "꿀팁", timestamp: new Date().toISOString() },
  { id: 6, title: "아이돌 B양, SNS에 의미심장한 심경글 게시", clicks: 1870, category: "SNS", timestamp: new Date().toISOString() },
  { id: 7, title: "역대급 비주얼 커플 탄생 예고, 주인공은?", clicks: 3200, category: "속보", timestamp: new Date().toISOString() }
];

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site043", status: "healthy" });
});

// 2. GET /api/news
app.get('/api/news', (req, res) => {
  res.json({ data: newsData });
});

// 3. GET /api/news/stream
app.get('/api/news/stream', (req, res) => {
  // INTENTIONAL BUG: site043-bug01
  // 유형: event-loss-during-batch
  // 설명: 배치 처리 중 일부 데이터 무작위 누락
  const isBuggy = Math.random() > 0.5;
  let streamed = [...newsData];
  
  if (isBuggy) {
    // Randomly remove 2-3 items to simulate loss
    streamed = streamed.filter(() => Math.random() > 0.3);
  }

  res.json({
    data: streamed,
    bugId: streamed.length !== newsData.length ? "site043-bug01" : null
  });
});

// 4. GET /api/news/popular
app.get('/api/news/popular', (req, res) => {
  // INTENTIONAL BUG: site043-bug02
  // 유형: inconsistent-sorting-state
  // 설명: 정렬 시 동일 데이터에 대해 랜덤 가중치를 주어 순서가 바뀜
  const popular = [...newsData].sort((a, b) => {
    // 원래는 b.clicks - a.clicks 지만, 랜덤 요소를 섞음
    const randomFactor = Math.random() * 500 - 250;
    return (b.clicks + randomFactor) - a.clicks;
  });

  res.json({
    data: popular,
    bugId: "site043-bug02"
  });
});

// 5. POST /api/news/click
app.post('/api/news/click', (req, res) => {
  const { newsId } = req.body;
  const idx = newsData.findIndex(n => n.id === newsId);
  
  if (idx !== -1) {
    // INTENTIONAL BUG: site043-bug03
    // 유형: duplicate-event-processing
    // 설명: 클릭수가 한 번에 2~5배 증가
    const multiplier = Math.floor(Math.random() * 4) + 2; // 2 to 5
    newsData[idx].clicks += multiplier;
    
    return res.json({
      updated: true,
      clicks: newsData[idx].clicks,
      added: multiplier,
      bugId: "site043-bug03"
    });
  }
  
  res.status(404).json({ error: "News not found" });
});

// 6. PUT /api/news/:id
app.put('/api/news/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title } = req.body;
  const idx = newsData.findIndex(n => n.id === id);

  if (idx !== -1) {
    // INTENTIONAL BUG: site043-bug04
    // 유형: partial-state-update
    // 설명: 제목은 업데이트되지만, timestamp나 다른 상태가 동기화되지 않음
    newsData[idx].title = title;
    // timestamp 업데이트 누락 (Bug 04)

    res.json({
      updated: true,
      data: newsData[idx],
      bugId: "site043-bug04"
    });
  } else {
    res.status(404).json({ error: "News not found" });
  }
});

// 7. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  const totalClicks = newsData.reduce((acc, n) => acc + n.clicks, 0);
  res.json({
    totalNews: newsData.length,
    totalClicks: totalClicks,
    trendingCategory: "열애"
  });
});

// 8. GET /api/filter
app.get('/api/filter', (req, res) => {
  const { keyword } = req.query;
  const filtered = newsData.filter(n => 
    n.title.toLowerCase().includes(keyword.toLowerCase())
  );
  res.json({ data: filtered });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site043 News Portal running on http://localhost:${PORT}`);
});
