const express = require('express');
const path = require('path');
const app = express();
const PORT = 9373;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let polls = [
  { id: 'poll-1', question: '올해 가장 기대되는 IT 기술은?', options: ['인공지능', '메타버스', '블록체인', '로보틱스'], category: 'IT' },
  { id: 'poll-2', question: '선호하는 점심 메뉴 스타일은?', options: ['한식', '일식', '중식', '양식'], category: 'Life' },
  { id: 'poll-3', question: '가장 선호하는 운동 시간대는?', options: ['아침', '점심', '저녁', '심야'], category: 'Health' }
];

let votes = [
  { pollId: 'poll-1', optionIndex: 0, userId: 'user_X' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DailyPoll API is running' });
});

app.get('/api/polls', (req, res) => {
  res.json(polls);
});

// API: Get Poll Results (with latency bug)
app.get('/api/results/:id', (req, res) => {
  const pollId = req.params.id;
  
  // INTENTIONAL BUG: site044-bug02
  // CSV Error: API 결과 계산 지연
  // Type: network-latency
  const delay = (pollId === 'poll-2') ? 5000 : 0; // poll-2 요청 시 5초 지연

  setTimeout(() => {
    const pollVotes = votes.filter(v => v.pollId === pollId);
    const results = polls.find(p => p.id === pollId).options.map((opt, idx) => ({
      option: opt,
      count: pollVotes.filter(v => v.optionIndex === idx).length
    }));
    res.json(results);
  }, delay);
});

// API: Vote (with duplicate bug)
app.post('/api/votes', (req, res) => {
  const { pollId, optionIndex, userId } = req.body;

  // INTENTIONAL BUG: site044-bug01
  // CSV Error: DB 중복 투표 검증 누락
  // Type: database-duplicate
  // 버그: 특정 사용자가 이미 해당 설문에 투표했는지 체크하는 로직이 없음
  
  const newVote = { pollId, optionIndex, userId };
  votes.push(newVote);
  res.status(201).json({ success: true });
});

// API: Bulk Vote / Advanced Vote (with parameter tampering bug)
// INTENTIONAL BUG: site044-bug03
// CSV Error: 투표 결과 조작 취약점
// Type: security-parameter-tampering
app.post('/api/votes/advanced', (req, res) => {
  const { pollId, optionIndex, userId, voteCount } = req.body;

  // 보안 취약점: 클라이언트가 보낸 voteCount를 검증 없이 그대로 반영함
  const count = parseInt(voteCount) || 1;
  
  for (let i = 0; i < count; i++) {
    votes.push({ pollId, optionIndex, userId });
  }

  res.status(201).json({ success: true, addedCount: count });
});

app.get('/api/my-votes/:userId', (req, res) => {
  res.json(votes.filter(v => v.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
