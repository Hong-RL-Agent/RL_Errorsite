const express = require('express');
const path = require('path');
const app = express();
const PORT = 9369;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let challenges = [
  { id: 'c1', title: '플라스틱 프리 챌린지', category: 'Zero Waste', points: 100, description: '일회용 플라스틱 대신 텀블러 사용하기' },
  { id: 'c2', title: '계단 이용하기', category: 'Energy', points: 50, description: '엘리베이터 대신 계단으로 건강과 환경 지키기' },
  { id: 'c3', title: '비건 한 끼', category: 'Food', points: 150, description: '탄소 배출을 줄이는 채식 식단 인증하기' }
];

let submissions = [
  { id: 'sub-1', userId: 'eco_warrior', challengeId: 'c1', status: 'Approved', date: '2024-05-01' },
  { id: 'sub-2', userId: 'eco_warrior', challengeId: 'c2', status: 'Rejected', date: '2024-05-02' }, // 거절된 기록
  { id: 'sub-3', userId: 'green_leaf', challengeId: 'c1', status: 'Approved', date: '2024-05-02' }
];

let badges = [
  { id: 'b1', name: '새싹 실천가', imageUrl: 'https://cdn-icons-png.flaticon.com/512/3233/3233514.png' },
  { id: 'b2', name: '지구 수호자', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2923/2923237.png' },
  { id: 'b3', name: '에코 마스터', imageUrl: 'https://cdn-icons-png.flaticon.com/512/1598/1598191.png' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EcoChallenge API is running' });
});

app.get('/api/challenges', (req, res) => {
  res.json(challenges);
});

// API: Get Ranking (with aggregation bug)
// INTENTIONAL BUG: site040-bug01
// CSV Error: DB 랭킹 집계 오류
// Type: database-aggregation
app.get('/api/ranking', (req, res) => {
  // 버그: Approved 상태인 기록만 집계해야 하나, 모든 기록(Rejected 포함)을 합산함
  const ranking = submissions.reduce((acc, sub) => {
    acc[sub.userId] = (acc[sub.userId] || 0) + 1;
    return acc;
  }, {});

  const sortedRanking = Object.entries(ranking)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count);

  res.json(sortedRanking);
});

// API: Get Badges (with missing field bug)
// INTENTIONAL BUG: site040-bug02
// CSV Error: 네트워크 응답 필드 누락
// Type: network-missing-field
app.get('/api/badges', (req, res) => {
  // 버그: 3번째 뱃지인 '에코 마스터'의 경우 imageUrl 필드를 고의로 누락시킴
  const result = badges.map(b => {
    if (b.id === 'b3') {
      const { imageUrl, ...rest } = b;
      return rest;
    }
    return b;
  });
  res.json(result);
});

// API: Submit Challenge (with security validation bug)
// INTENTIONAL BUG: site040-bug03
// CSV Error: 인증 제출자 검증 누락
// Type: security-user-validation
app.post('/api/submissions', (req, res) => {
  const { userId, challengeId, photoUrl } = req.body;
  
  // 보안 취약점: body에 담긴 userId가 현재 로그인된 사용자인지 검증하는 로직이 없음
  const newSubmission = {
    id: 'sub-' + Date.now(),
    userId, // 조작된 userId가 그대로 저장됨
    challengeId,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  };

  submissions.push(newSubmission);
  res.status(201).json({ success: true, submission: newSubmission });
});

app.get('/api/submissions/:userId', (req, res) => {
  res.json(submissions.filter(s => s.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
