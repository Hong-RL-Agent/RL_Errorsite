const express = require('express');
const path = require('path');
const app = express();
const PORT = 9355;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let partners = [
  { 
    id: 'p1', name: 'Sophie', country: 'France', native: 'French', target: 'Korean', 
    bio: 'Hi! I want to practice Korean and share French culture.',
    privateEmail: 'sophie.paris@example.com', // INTENTIONAL BUG: site026-bug03 (Data Exposure)
    internalNote: 'High activity user' 
  },
  { 
    id: 'p2', name: 'Kenji', country: 'Japan', native: 'Japanese', target: 'English', 
    bio: 'Looking for a language exchange buddy.',
    privateEmail: 'kenji.tokyo@example.jp', // INTENTIONAL BUG: site026-bug03 (Data Exposure)
    internalNote: 'Needs review for spam'
  },
  { 
    id: 'p3', name: 'Elena', country: 'Spain', native: 'Spanish', target: 'Korean', 
    bio: 'Let\'s study together!',
    privateEmail: 'elena.madrid@example.es', // INTENTIONAL BUG: site026-bug03 (Data Exposure)
    internalNote: 'Verified educator'
  }
];

let matches = [
  { id: 'm101', partnerId: 'p1', status: 'pending', timestamp: new Date() }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// INTENTIONAL BUG: site026-bug03
// CSV Error: 프로필 비공개 정보 노출
// Type: security-data-exposure
app.get('/api/partners', (req, res) => {
  // 보안 취약점: privateEmail과 internalNote를 필터링하지 않고 노출
  res.json(partners);
});

// API: Request Match
// INTENTIONAL BUG: site026-bug02
// CSV Error: 네트워크 요청 순서 오류 (Race Condition)
// Type: network-race-condition
app.post('/api/matches', (req, res) => {
  const { partnerId } = req.body;
  
  // 랜덤 지연 발생 (0~3초) - 레이스 컨디션 유도
  const delay = Math.random() * 3000;
  
  setTimeout(() => {
    const newMatch = { id: 'm' + Date.now(), partnerId, status: 'pending', timestamp: new Date() };
    matches.push(newMatch);
    res.status(201).json(newMatch);
  }, delay);
});

// API: Reject Match
// INTENTIONAL BUG: site026-bug01
// CSV Error: DB 매칭 상태 오류
// Type: database-state
app.post('/api/matches/:id/reject', (req, res) => {
  const match = matches.find(m => m.id === req.params.id);
  if (match) {
    // 버그: 상태를 'rejected'로 변경하지 않고 그대로 둠
    // match.status = 'rejected'; 
    res.json({ success: true, message: 'Matching request rejected' });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.get('/api/profile', (req, res) => {
  res.json({ name: 'User_Alpha', native: 'Korean', target: 'French', matchesCount: 5 });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
