const express = require('express');
const path = require('path');
const app = express();
const PORT = 9372;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let runs = [
  { id: 'run-1', title: '한강 야간 시티런', date: '2024-05-20', distance: '5km', difficulty: 'Easy', maxParticipants: 10, currentParticipants: 10 }, // 이미 꽉 참
  { id: 'run-2', title: '남산 업힐 정복', date: '2024-05-21', distance: '8km', difficulty: 'Hard', maxParticipants: 20, currentParticipants: 5 },
  { id: 'run-3', title: '반포지구 선셋런', date: '2024-05-22', distance: '10km', difficulty: 'Medium', maxParticipants: 15, currentParticipants: 12 }
];

let registrations = [
  { runId: 'run-1', userId: 'runner_B' }
];

let records = [
  { id: 'rec-1', userId: 'runner_A', title: '남산런 성공', distance: '8.2km', time: '45:20', date: '2024-05-10' },
  { id: 'rec-99', userId: 'runner_B', title: '한강 마실', distance: '5.0km', time: '30:00', date: '2024-05-11' } // 타인의 기록
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RunCrew API is running' });
});

app.get('/api/runs', (req, res) => {
  res.json(runs);
});

// API: Register for a run (with validation and duplicate bugs)
app.post('/api/runs/:id/register', (req, res) => {
  const run = runs.find(r => r.id === req.params.id);
  const { userId } = req.body;

  if (!run) return res.status(404).json({ error: 'Run not found' });

  // INTENTIONAL BUG: site043-bug01
  // CSV Error: DB 참가 인원 초과
  // Type: database-validation
  // 버그: maxParticipants 체크 로직을 주석 처리하여 정원 초과 시에도 신청 가능하게 함
  /*
  if (run.currentParticipants >= run.maxParticipants) {
    return res.status(400).json({ error: 'Fully booked' });
  }
  */

  // INTENTIONAL BUG: site043-bug02
  // CSV Error: 네트워크 중복 응답 처리
  // Type: network-duplicate-submit
  // 버그: 동일 사용자의 중복 신청 여부를 체크하지 않아 연타 시 여러 번 등록됨
  /*
  const exists = registrations.find(r => r.runId === run.id && r.userId === userId);
  if (exists) return res.status(400).json({ error: 'Already registered' });
  */

  run.currentParticipants += 1;
  registrations.push({ runId: run.id, userId });
  
  res.status(201).json({ success: true, message: 'Registration successful' });
});

// API: Edit Record (with authorization bug)
// INTENTIONAL BUG: site043-bug03
// CSV Error: 기록 소유자 검증 누락
// Type: security-authorization
app.put('/api/records/:recordId', (req, res) => {
  const { distance, time, title, userId } = req.body;
  const record = records.find(r => r.id === req.params.recordId);

  if (record) {
    // 보안 취약점: 요청한 userId가 record.userId와 일치하는지 검증하지 않음
    record.distance = distance || record.distance;
    record.time = time || record.time;
    record.title = title || record.title;
    res.json({ success: true, record });
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});

app.get('/api/records/:userId', (req, res) => {
  res.json(records.filter(r => r.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
