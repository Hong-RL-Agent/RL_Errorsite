import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9149;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let userPoints = 12000;
let history = [];
let reviews = [
  { id: 1, user: "LuckyMan", rating: 5.0, comment: "AI 추천 덕분에 3등 당첨됐어요! 대박!" },
  { id: 2, user: "LottoKing", rating: 4.9, comment: "반신반의했는데 진짜 번호가 좋네요." },
  { id: 3, user: "Winner77", rating: 4.8, comment: "포인트 보상이 짭짤해서 계속 쓰게 됩니다." }
];

const generateLottoNumbers = () => {
  const nums = new Set();
  while(nums.size < 6) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(nums).sort((a, b) => a - b);
};

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site040", status: "healthy" });
});

// 2. POST /api/generate
app.post('/api/generate', (req, res) => {
  const numbers = generateLottoNumbers();
  
  // INTENTIONAL BUG: site040-bug03
  // 유형: reward-manipulation-random-addiction (보상 조작)
  // 설명: 번호 생성 시 보너스 포인트가 랜덤으로 과도하게 지급됨
  const baseReward = 100;
  const manipulativeBonus = Math.floor(Math.random() * 5000) + 2000; // 2100 ~ 7100
  const totalReward = baseReward + manipulativeBonus;
  
  userPoints += totalReward;
  
  const entry = {
    id: Date.now(),
    numbers,
    reward: totalReward,
    timestamp: new Date().toISOString()
  };
  history.unshift(entry);

  res.json({
    numbers,
    reward: totalReward,
    bugId: "site040-bug03"
  });
});

// 3. GET /api/history
app.get('/api/history', (req, res) => {
  res.json({ data: history });
});

// 4. GET /api/reviews
app.get('/api/reviews', (req, res) => {
  // INTENTIONAL BUG: site040-bug02
  // 유형: fake-reviews-rating-manipulation (평점 조작)
  // 설명: 리뷰 평점이 실제 데이터와 무관하게 항상 높게 유지됨
  const manipulatedReviews = reviews.map(r => ({
    ...r,
    rating: (4.8 + Math.random() * 0.2).toFixed(1) // Always 4.8 ~ 5.0
  }));
  
  res.json({
    data: manipulatedReviews,
    bugId: "site040-bug02"
  });
});

// 5. GET /api/subscription
app.get('/api/subscription', (req, res) => {
  // INTENTIONAL BUG: site040-bug01
  // 유형: unclear-subscription-terms (구독 조건 불명확)
  // 설명: 결제 주기, 자동 갱신 여부 등 핵심 정보 누락
  res.json({
    plan: "premium",
    status: "active",
    bugId: "site040-bug01"
    // Missing billingCycle, autoRenew fields
  });
});

// 6. GET /api/activity
app.get('/api/activity', (req, res) => {
  // INTENTIONAL BUG: site040-bug04
  // 유형: fake-user-activity (가짜 사용자 활동 조작)
  // 설명: 실시간 당첨 로그를 허위로 생성
  const fakeLogs = [
    "방금 'SuperUser'님이 1등 예상 번호로 3등 당첨!",
    "현재 1,245명이 AI 골드 번호를 생성 중입니다.",
    "축하합니다! 'WinnerXX'님이 보너스 10,000 포인트를 획득했습니다.",
    "방금 누군가 서울 관악구에서 AI 추천 번호로 1등 성공!"
  ];
  
  res.json({
    logs: fakeLogs,
    bugId: "site040-bug04"
  });
});

// 7. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalUsers: 25480,
    generated: 142050,
    totalRewardsGiven: 58042000
  });
});

// 8. GET /api/points
app.get('/api/points', (req, res) => {
  res.json({ points: userPoints });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site040 Lotto App running on http://localhost:${PORT}`);
});
