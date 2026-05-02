const express = require('express');
const path = require('path');
const app = express();
const PORT = 9353;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let machines = [
  { id: 'm1', type: 'Washer', name: '세탁기 01', status: 'available', price: 4000 },
  { id: 'm2', type: 'Washer', name: '세탁기 02', status: 'in-use', price: 4000 },
  { id: 'm3', type: 'Dryer', name: '건조기 01', status: 'available', price: 3500 },
  { id: 'm4', type: 'Dryer', name: '건조기 02', status: 'available', price: 3500 }
];

let reservations = [];
let usageHistory = [
  { id: 'h1', userId: 'user123', machineId: 'm1', date: '2024-05-10', cost: 4000 },
  { id: 'h2', userId: 'hacker99', machineId: 'm3', date: '2024-05-11', cost: 3500, note: 'Secret: Access code 4432 used' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Laundry Now API is running' });
});

// API: Get Machine Status
app.get('/api/machines', (req, res) => {
  // INTENTIONAL BUG: site024-bug02
  // CSV Error: 네트워크 응답 누락
  // Type: network-missing-field
  // Description: 기기 현황 API가 특정 기기의 status 필드를 누락함.
  const modifiedMachines = machines.map(m => {
    const machine = { ...m };
    // 짝수 ID 기기의 status 필드를 고의로 삭제
    if (m.id === 'm2' || m.id === 'm4') {
      delete machine.status;
    }
    return machine;
  });
  res.json(modifiedMachines);
});

// API: Create Reservation
app.post('/api/reservations', (req, res) => {
  const { machineId, userId } = req.body;
  const machine = machines.find(m => m.id === machineId);

  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  const newRes = { id: 'res-' + Date.now(), machineId, userId, timestamp: new Date() };
  reservations.push(newRes);

  // INTENTIONAL BUG: site024-bug01
  // CSV Error: DB 상태 동기화 오류
  // Type: database-state
  // Description: 예약 후 machine.status가 reserved로 변경되지 않음.
  // 원래는: machine.status = 'reserved';
  // 버그: 상태 변경 로직을 생략함

  res.status(201).json({ success: true, reservation: newRes });
});

// API: Get Usage History
// INTENTIONAL BUG: site024-bug03
// CSV Error: 사용자 기록 접근 제어 실패
// Type: security-authorization
// Description: userId 쿼리 변경으로 다른 사용자의 이용 기록 조회 가능.
app.get('/api/history', (req, res) => {
  const { userId } = req.query;
  // 보안 취약점: 요청받은 userId에 해당하는 기록을 그대로 반환 (IDOR)
  const history = usageHistory.filter(h => h.userId === userId);
  res.json(history);
});

app.get('/api/prices', (req, res) => {
  res.json({ washer: 4000, dryer: 3500, detergent: 500 });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
