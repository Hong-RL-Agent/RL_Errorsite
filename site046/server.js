const express = require('express');
const path = require('path');
const app = express();
const PORT = 9375;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let tools = [
  { id: 't1', name: '전동 해머 드릴', category: 'Power Tools', pricePerDay: 15000, specs: '18V, 5.0Ah 리튬이온' },
  { id: 't2', name: '고압 세척기', category: 'Cleaning', pricePerDay: 25000, specs: '130bar, 1800W' },
  { id: 't3', name: '가정용 사다리', category: 'Maintenance', pricePerDay: 5000, specs: '5단, 알루미늄' }
];

let rentals = [
  { id: 'rent-1', userId: 'user_A', toolId: 't1', startDate: '2024-05-10', endDate: '2024-05-12', status: 'Completed' },
  { id: 'rent-99', userId: 'user_B', toolId: 't2', startDate: '2024-05-20', endDate: '2024-05-22', status: 'Booked', address: '서울시 강남구 테헤란로 123', phone: '010-1234-5678' } // 타인의 데이터
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RentTool API is running' });
});

app.get('/api/tools', (req, res) => {
  res.json(tools);
});

// API: Get Rental Detail (with IDOR bug)
// INTENTIONAL BUG: site046-bug03
// CSV Error: 대여 내역 접근 제어 실패
// Type: security-idor
app.get('/api/rentals/:id', (req, res) => {
  const rental = rentals.find(r => r.id === req.params.id);
  if (rental) {
    // 보안 취약점: 요청자의 userId가 rental.userId와 일치하는지 검증하는 로직 누락
    res.json(rental);
  } else {
    res.status(404).json({ error: 'Rental not found' });
  }
});

// API: Create Rental (with conflict and validation bugs)
app.post('/api/rentals', (req, res) => {
  const { userId, toolId, startDate, endDate } = req.body;

  // INTENTIONAL BUG: site046-bug02
  // CSV Error: 네트워크 요청 검증 누락
  // Type: network-request-validation
  // 버그: endDate가 필수임에도 체크하지 않고 성공 응답을 반환함
  /* 
  if (!endDate) {
    return res.status(400).json({ error: 'End date is required' });
  }
  */

  // INTENTIONAL BUG: site046-bug01
  // CSV Error: DB 대여 기간 충돌
  // Type: database-conflict
  // 버그: 기존 대여 기간과 겹치는지 확인하는 로직이 없어 중복 대여 발생
  /*
  const conflict = rentals.find(r => 
    r.toolId === toolId && 
    ((startDate >= r.startDate && startDate <= r.endDate) || (endDate >= r.startDate && endDate <= r.endDate))
  );
  if (conflict) return res.status(400).json({ error: 'Tool already booked for this period' });
  */

  const newRental = {
    id: 'rent-' + Date.now(),
    userId,
    toolId,
    startDate,
    endDate,
    status: 'Booked'
  };

  rentals.push(newRental);
  res.status(201).json({ success: true, rental: newRental });
});

app.get('/api/history/:userId', (req, res) => {
  res.json(rentals.filter(r => r.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
