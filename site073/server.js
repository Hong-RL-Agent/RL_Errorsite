const express = require('express');
const path = require('path');
const app = express();
const PORT = 9402;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let sessions = [
  { id: 'sess-1', userId: 'user_A', subject: '국어', duration: 3600, date: '2024-05-01' },
  { id: 'sess-2', userId: 'user_A', subject: '수학', duration: 7200, date: '2024-05-01' },
  { id: 'sess-99', userId: 'user_B', subject: '비밀 과목', duration: 300, date: '2024-05-01' } // 타인의 데이터
];

let subjects = [
  { id: 'sub1', name: '국어', color: '#3B82F6' },
  { id: 'sub2', name: '수학', color: '#EF4444' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ExamTimer API is running' });
});

app.get('/api/subjects', (req, res) => {
  res.json(subjects);
});

// API: Get Session Detail (with IDOR bug)
app.get('/api/sessions/:id', (req, res) => {
  const { id } = req.params;
  const session = sessions.find(s => s.id === id);

  if (session) {
    // INTENTIONAL BUG: site073-bug03
    // CSV Error: 공부 기록 소유자 검증 누락
    // Type: security-idor
    // 보안 취약점: sessionId만 알면 다른 사용자의 공부 기록을 조회할 수 있음 (userId 체크 생략)
    res.json(session);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// API: Save Session (with calculation and duplicate submit bugs)
app.post('/api/sessions', (req, res) => {
  const { userId, subject, startTime, endTime, pausedDuration } = req.body;

  // INTENTIONAL BUG: site073-bug01
  // CSV Error: DB 공부 시간 계산 오류
  // Type: database-calculation
  // 버그: 일시정지 시간을 제외하지 않고 총 공부 시간에 포함함
  const rawDuration = Math.floor((new Date(endTime) - new Date(startTime)) / 1000);
  const finalDuration = rawDuration; // 원래는 rawDuration - pausedDuration 이어야 함

  // INTENTIONAL BUG: site073-bug02
  // CSV Error: 네트워크 중복 저장
  // Type: network-duplicate-submit
  // 버그: 동일 요청에 대한 중복 방지 로직이 없어 연속 클릭 시 중복 생성됨

  const newSession = {
    id: `sess-${Date.now()}`,
    userId,
    subject,
    duration: finalDuration,
    date: new Date().toISOString().split('T')[0]
  };

  sessions.push(newSession);
  res.status(201).json({ success: true, session: newSession });
});

app.get('/api/stats', (req, res) => {
  const { userId } = req.query;
  const userSessions = sessions.filter(s => s.userId === userId);
  const totalDuration = userSessions.reduce((acc, s) => acc + s.duration, 0);
  res.json({ totalDuration, sessionsCount: userSessions.length });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
