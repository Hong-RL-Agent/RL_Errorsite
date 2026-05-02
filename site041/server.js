const express = require('express');
const path = require('path');
const app = express();
const PORT = 9370;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let feedingLogs = [
  { id: 'f1', userId: 'mom_1', type: 'Formula', amount: 120, time: '08:00', date: '2024-05-01' },
  { id: 'f2', userId: 'mom_1', type: 'Breast Milk', amount: 100, time: '12:00', date: '2024-05-02' },
  { id: 'f99', userId: 'stranger_X', type: 'Formula', amount: 150, time: '09:00', date: '2024-05-02' } // 타인의 데이터
];

let sleepLogs = [
  { id: 's1', userId: 'mom_1', startTime: '20:00', endTime: '06:00', date: '2024-05-01' }
];

let growthLogs = [
  { id: 'g1', userId: 'mom_1', weightKg: 7.5, heightCm: 68.5, date: '2024-05-01' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BabyCare Log API is running' });
});

// API: Get Feeding Logs (with date query bug)
// INTENTIONAL BUG: site041-bug01
// CSV Error: DB 날짜 범위 조회 오류
// Type: database-date-query
app.get('/api/feeding', (req, res) => {
  const { date, userId } = req.query;
  
  // 버그: date 필터링 로직을 무시하고 전체 기록을 반환함
  const results = feedingLogs.filter(f => f.userId === userId); // date 조건 누락
  res.json(results);
});

// API: Get Growth Records (with schema mismatch bug)
// INTENTIONAL BUG: site041-bug02
// CSV Error: 네트워크 스키마 불일치
// Type: network-schema-mismatch
app.get('/api/growth', (req, res) => {
  const { userId } = req.query;
  const logs = growthLogs.filter(g => g.userId === userId);
  
  // 버그: heightCm 필드명을 height로 변경하여 프론트엔드와 불일치 발생
  const mismatchedLogs = logs.map(l => ({
    id: l.id,
    userId: l.userId,
    weightKg: l.weightKg,
    height: l.heightCm, // 버그: heightCm -> height
    date: l.date
  }));
  
  res.json(mismatchedLogs);
});

// API: Get Records by Guardian (with authorization bug)
// INTENTIONAL BUG: site041-bug03
// CSV Error: 보호자 권한 검증 누락
// Type: security-authorization
app.get('/api/records/:guardianId', (req, res) => {
  // 보안 취약점: 요청한 guardianId가 현재 사용자와 연관된 아이의 보호자인지 검증하지 않음
  // 단순히 guardianId에 해당하는 모든 기록을 반환 (여기서는 시뮬레이션상 feedingLogs 전체 노출)
  res.json(feedingLogs);
});

app.post('/api/feeding', (req, res) => {
  const { userId, type, amount, time, date } = req.body;
  const newLog = { id: 'f' + Date.now(), userId, type, amount, time, date };
  feedingLogs.push(newLog);
  res.status(201).json({ success: true, log: newLog });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
