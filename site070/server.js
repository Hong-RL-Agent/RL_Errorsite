const express = require('express');
const path = require('path');
const app = express();
const PORT = 9339;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let puzzles = [
  { id: 'p1', title: '그리드 퍼즐 #01', difficulty: 'Easy', points: 100 },
  { id: 'p2', title: '로직 로직 #42', difficulty: 'Normal', points: 250 },
  { id: 'p3', title: '마스터의 암호', difficulty: 'Hard', points: 500 }
];

let userScores = [
  { userId: 'user_B', totalScore: 1250, solvedCount: 5 },
  { userId: 'user_C', totalScore: 980, solvedCount: 4 }
];

let solvedHistory = [
  { id: 'h1', userId: 'user_B', puzzleId: 'p1', score: 100, date: '2024-05-01' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PuzzleRank API is running' });
});

app.get('/api/puzzles', (req, res) => {
  res.json(puzzles);
});

// API: Get Ranking (with network timeout/delay bug)
app.get('/api/ranking', (req, res) => {
  const { difficulty } = req.query;
  
  // INTENTIONAL BUG: site070-bug02
  // CSV Error: 네트워크 응답 지연
  // Type: network-timeout
  // 버그: Hard 난이도 요청 시 타임아웃에 가까운 인위적인 지연(8초)을 발생시킴
  const delay = difficulty === 'Hard' ? 8000 : 500;

  setTimeout(() => {
    // 실제 랭킹 정렬 로직 (간략화)
    const sorted = [...userScores].sort((a, b) => b.totalScore - a.totalScore);
    res.json(sorted);
  }, delay);
});

// API: Submit Answer (with duplicate and parameter tampering bugs)
app.post('/api/answers', (req, res) => {
  const { userId, puzzleId, score } = req.body;
  const puzzle = puzzles.find(p => p.id === puzzleId);

  if (!puzzle) return res.status(404).json({ error: 'Puzzle not found' });

  // INTENTIONAL BUG: site070-bug01
  // CSV Error: DB 정답 기록 중복
  // Type: database-duplicate
  // 버그: 이미 푼 퍼즐인지 검증하지 않고 매번 정답 기록을 추가함
  // 원래 로직: if (solvedHistory.some(h => h.userId === userId && h.puzzleId === puzzleId)) ...

  // INTENTIONAL BUG: site070-bug03
  // CSV Error: 점수 조작 취약점
  // Type: security-parameter-tampering
  // 보안 취약점: 클라이언트가 보낸 score 값을 서버에서 재검증하지 않고 그대로 반영함
  const finalScore = score || puzzle.points;

  const newRecord = {
    id: `h-${Date.now()}`,
    userId,
    puzzleId,
    score: finalScore,
    date: new Date().toISOString().split('T')[0]
  };

  solvedHistory.push(newRecord);

  // 유저 점수 갱신
  let user = userScores.find(u => u.userId === userId);
  if (user) {
    user.totalScore += finalScore;
    user.solvedCount += 1;
  } else {
    userScores.push({ userId, totalScore: finalScore, solvedCount: 1 });
  }

  res.status(201).json({ success: true, message: '정답입니다! 점수가 반영되었습니다.', record: newRecord });
});

app.get('/api/badges', (req, res) => {
  res.json([
    { id: 'b1', name: '초보 퍼즐러', icon: '🐣' },
    { id: 'b2', name: '로직 마스터', icon: '🧠' },
    { id: 'b3', name: '네온 탐험가', icon: '✨' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
