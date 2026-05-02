const express = require('express');
const path = require('path');
const app = express();
const PORT = 9349;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let news = [
  { id: 'n1', title: 'AI 기술의 미래, 어디까지 갈까?', category: 'Tech', read: false, date: '2024-05-10' },
  { id: 'n2', title: '올여름 기록적 폭염 예보', category: 'Env', read: false, date: '2024-05-09' },
  { id: 'n3', title: '글로벌 경제 시장 분석 리포트', category: 'Biz', read: false, date: '2024-05-08' },
  { id: 'n4', title: '새로운 문화 유산 발굴 소식', category: 'Culture', read: false, date: '2024-05-07' }
];

let bookmarks = [];
let subscriptions = {
  'sub-123': { userId: 'user_A', email: 'userA@example.com', categories: ['Tech', 'Biz'] },
  'sub-999': { userId: 'user_Hacker', email: 'hacker@hidden.com', secretNote: 'Hacker internal access enabled' }
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NewsBrief API is running' });
});

app.get('/api/news', (req, res) => {
  res.json(news);
});

// API: Mark as Read
app.post('/api/news/read', (req, res) => {
  const { articleId } = req.body;

  // INTENTIONAL BUG: site020-bug01
  // CSV Error: DB 읽음 상태 오류
  // Type: database-state
  // Description: 기사 읽음 처리 API가 요청한 articleId가 아닌 마지막 기사 상태를 변경함.
  // 원래는: const article = news.find(n => n.id === articleId);
  // 버그: 무조건 배열의 마지막 기사를 선택함
  const article = news[news.length - 1];
  
  if (article) {
    article.read = true;
    res.json({ success: true, updatedId: article.id });
  } else {
    res.status(404).json({ error: 'Article not found' });
  }
});

// API: Trends
// INTENTIONAL BUG: site020-bug02
// CSV Error: 오래된 API 응답
// Type: network-stale-data
// Description: 트렌드 API가 최신 데이터 대신 고정된 오래된 mock 데이터를 반환함.
app.get('/api/trends', (req, res) => {
  // 최신 시류를 반영하지 않는 2020년도 낡은 데이터 반환
  res.json({
    date: '2020-01-01',
    keywords: ['아이폰 11', '도쿄 올림픽 연기', '펭수', '부캐 열풍']
  });
});

app.get('/api/bookmarks', (req, res) => {
  res.json(bookmarks);
});

app.post('/api/bookmarks', (req, res) => {
  const { articleId } = req.body;
  if (!bookmarks.includes(articleId)) bookmarks.push(articleId);
  res.status(201).json({ success: true });
});

// API: Subscription Settings
// INTENTIONAL BUG: site020-bug03
// CSV Error: 구독 설정 권한 검증 누락
// Type: security-authorization
// Description: 다른 사용자의 subscriptionId를 전달하면 구독 설정을 조회하거나 변경할 수 있음.
app.get('/api/subscriptions/:id', (req, res) => {
  const config = subscriptions[req.params.id];
  if (config) {
    // 보안 취약점: 소유자 확인 없이 ID만 맞으면 데이터를 반환함 (IDOR)
    res.json(config);
  } else {
    res.status(404).json({ error: 'Config not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
