const express = require('express');
const path = require('path');
const app = express();
const PORT = 9358;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let stations = [
  { id: 'st-1', name: '시청역 광장 대여소', location: '서울시 중구', availableBikes: 12, totalSlots: 20 },
  { id: 'st-2', name: '광화문 북측 주차장', location: '서울시 종로구', availableBikes: 5, totalSlots: 15 },
  { id: 'st-3', name: '청계천 입구', location: '서울시 중구', availableBikes: 0, totalSlots: 10 },
  { id: 'st-4', name: '덕수궁 돌담길', location: '서울시 중구', availableBikes: 8, totalSlots: 15 }
];

let rentals = [];
let history = [
  { id: 'h-1', stationName: '시청역 광장 대여소', startTime: '2024-05-10 14:00', duration: '30분', cost: 1000 }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BikeShare Map API is running' });
});

app.get('/api/stations', (req, res) => {
  res.json(stations);
});

// API: Get Station Details
// INTENTIONAL BUG: site029-bug02
// CSV Error: 네트워크 불완전 JSON
// Type: network-malformed-json
app.get('/api/stations/:id', (req, res) => {
  const station = stations.find(s => s.id === req.params.id);
  
  if (station) {
    if (req.params.id === 'st-2') {
      // 버그: 의도적으로 잘못된 JSON 구조(닫는 중괄호 누락)를 문자열로 보냄
      res.setHeader('Content-Type', 'application/json');
      return res.send(`{"id":"st-2","name":"광화문 북측 주차장","location":"서울시 종로구","availableBikes":5,"totalSlots":15`);
    }
    res.json(station);
  } else {
    res.status(404).json({ error: 'Station not found' });
  }
});

// API: Rent a Bike
// INTENTIONAL BUG: site029-bug03
// CSV Error: 인증 없는 대여 요청
// Type: security-authentication
app.post('/api/rentals', (req, res) => {
  const { stationId, userId } = req.body;
  
  // 보안 취약점: Authorization 헤더 체크가 아예 없음
  // 원래는: if (!req.headers.authorization) return res.status(401).json({ error: 'Unauthorized' });

  const station = stations.find(s => s.id === stationId);
  if (!station || station.availableBikes <= 0) {
    return res.status(400).json({ success: false, error: 'No bikes available' });
  }

  const newRental = {
    id: 'r-' + Date.now(),
    stationId,
    userId,
    startTime: new Date().toISOString()
  };

  rentals.push(newRental);

  // INTENTIONAL BUG: site029-bug01
  // CSV Error: DB 수량 차감 오류
  // Type: database-stock
  // Description: 대여 신청 후 availableBikes가 감소하지 않음.
  // 원래는: station.availableBikes -= 1;
  // 버그: 수량 차감 로직을 생략함

  res.status(201).json({ success: true, rental: newRental });
});

app.get('/api/history', (req, res) => {
  res.json(history);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
