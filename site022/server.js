const express = require('express');
const path = require('path');
const app = express();
const PORT = 9351;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let parkingLots = [
  { id: 'p1', name: '테크 센터 주차장', address: '서울시 강남구 역삼동 123', price: 3000, slots: 15 },
  { id: 'p2', name: '공영 주차장 01', address: '서울시 강남구 삼성동 456', price: 2000, slots: 50 },
  { id: 'p3', name: '스타 시티 몰', address: '서울시 광진구 자양동 789', price: 4000, slots: 100 },
  { id: 'p4', name: '역삼역 노상 주차장', address: '서울시 강남구 역삼동 999', price: 3500, slots: 5 }
];

let reservations = [
  { id: 'res-101', lotId: 'p1', user: '홍길동', carNum: '12가 3456', time: '14:00-16:00', status: 'Confirmed' },
  { id: 'res-999', lotId: 'p3', user: '이사장', carNum: '99허 9999', time: '09:00-18:00', status: 'VIP', privateNote: '고급 세단, 발렛 필수' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Parking Finder API is running' });
});

// API: Search Parking Lots
app.get('/api/parking-lots', (req, res) => {
  const { query, sort } = req.query;
  let filtered = parkingLots;

  if (query) {
    // INTENTIONAL BUG: site022-bug01
    // CSV Error: DB 위치 필터 오류
    // Type: database-filter
    // Description: 지역 필터가 lot.address가 아니라 lot.name을 기준으로 동작함.
    // 원래는: lot.address.includes(query) || lot.name.includes(query)
    filtered = parkingLots.filter(lot => lot.name.includes(query));
  }

  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  }

  res.json(filtered);
});

// API: Create Reservation
// INTENTIONAL BUG: site022-bug02
// CSV Error: 네트워크 지연 응답
// Type: network-latency
// Description: 예약 API가 특정 시간대 요청에서 과도하게 지연됨.
app.post('/api/reservations', (req, res) => {
  const { lotId, user, carNum, time } = req.body;
  
  // 고의 지연 발생 (약 5초)
  const delay = 5000;
  
  setTimeout(() => {
    const newRes = {
      id: 'res-' + Date.now(),
      lotId,
      user,
      carNum,
      time,
      status: 'Confirmed'
    };
    reservations.push(newRes);
    res.status(201).json({ success: true, reservation: newRes });
  }, delay);
});

// API: Get Reservation Details
// INTENTIONAL BUG: site022-bug03
// CSV Error: 예약 소유자 검증 누락
// Type: security-idor
// Description: reservationId만 변경하면 다른 사용자의 예약 정보를 볼 수 있음.
app.get('/api/reservations/:id', (req, res) => {
  const resDetail = reservations.find(r => r.id === req.params.id);
  
  if (resDetail) {
    // 보안 취약점: 소유자 검증 없이 데이터 반환
    res.json(resDetail);
  } else {
    res.status(404).json({ error: 'Reservation not found' });
  }
});

app.get('/api/prices', (req, res) => {
  res.json({ min: 1000, max: 5000, average: 2800 });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
