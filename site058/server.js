const express = require('express');
const path = require('path');
const app = express();
const PORT = 9387;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let seats = [
  { id: 'S1', type: 'Focus', occupied: false },
  { id: 'S2', type: 'Focus', occupied: true },
  { id: 'S3', type: 'Cafe', occupied: false },
  { id: 'S4', type: 'Private', occupied: false }
];

let passes = [
  { id: 'pass-active-1', userId: 'user_A', type: '100시간권', remaining: 45, expiredAt: '2024-12-31' },
  { id: 'pass-expired-1', userId: 'user_A', type: '기간권 (4주)', remaining: 0, expiredAt: '2024-01-01' }, // 만료됨
  { id: 'pass-secret-1', userId: 'user_B', type: '프리미엄 1년권', remaining: 999, expiredAt: '2025-05-01' } // 타인의 이용권
];

let reservations = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CafeStudy API is running' });
});

app.get('/api/seats', (req, res) => {
  res.json(seats);
});

// API: Get Pass Detail (with IDOR bug)
app.get('/api/passes/:id', (req, res) => {
  const pass = passes.find(p => p.id === req.params.id);
  if (pass) {
    // INTENTIONAL BUG: site058-bug03
    // CSV Error: 이용권 소유자 검증 누락
    // Type: security-idor
    // 보안 취약점: 요청한 사용자가 실제 소유자인지 검증하지 않고 정보를 반환함
    res.json(pass);
  } else {
    res.status(404).json({ error: 'Pass not found' });
  }
});

// API: Create Reservation (with expiration logic bug)
app.post('/api/reservations', (req, res) => {
  const { userId, passId, seatId } = req.body;
  const pass = passes.find(p => p.id === passId);

  if (!pass) return res.status(404).json({ error: 'Pass not found' });

  // INTENTIONAL BUG: site058-bug01
  // CSV Error: DB 이용권 만료 검증 오류
  // Type: database-date-query
  // 버그: 만료일이 현재보다 이전임에도 불구하고 예약 가능하게 처리함
  const today = new Date('2024-05-01');
  const expiry = new Date(pass.expiredAt);
  
  // 원래는 expiry < today 이면 에러여야 함
  const isExpired = expiry < today; 
  // 그러나 버그로 인해 isExpired 체크를 무시하고 예약을 진행함

  const newRes = { id: `res-${Date.now()}`, userId, passId, seatId, date: today };
  reservations.push(newRes);
  res.status(201).json({ success: true, reservation: newRes, message: isExpired ? '(SYSTEM) Expired pass used' : 'Success' });
});

// API: Purchase Pass (with HTTP status bug)
app.post('/api/purchases', (req, res) => {
  const { type, price } = req.body;

  // 결제 실패 시뮬레이션 (예: 100,000원 이상 결제 시 무조건 실패)
  if (price >= 100000) {
    // INTENTIONAL BUG: site058-bug02
    // CSV Error: 네트워크 응답 상태 불일치
    // Type: network-http-status
    // 버그: 구매 실패임에도 201 Created를 반환하여 클라이언트를 혼동시킴
    return res.status(201).json({ success: false, message: '잔액 부족으로 결제에 실패하였습니다.' });
  }

  const newPass = { id: `pass-${Date.now()}`, userId: 'user_A', type, remaining: 100, expiredAt: '2025-01-01' };
  passes.push(newPass);
  res.status(201).json({ success: true, pass: newPass });
});

app.get('/api/my-passes/:userId', (req, res) => {
  res.json(passes.filter(p => p.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
