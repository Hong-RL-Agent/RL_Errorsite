const express = require('express');
const path = require('path');
const app = express();
const PORT = 9334;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let destinations = [
  { id: 'd1', name: '파리, 프랑스', region: '유럽', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: 'd2', name: '발리, 인도네시아', region: '동남아', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: 'd3', name: '도쿄, 일본', region: '동아시아', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: 'd4', name: '오아후, 하와이', region: '아메리카', image: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&q=80&w=400&h=300' }
];

let itineraries = {
  'user-123': [
    { id: 'i1', place: '에펠탑', date: '2026-07-01', time: '10:00' },
    { id: 'i2', place: '루브르 박물관', date: '2026-07-01', time: '14:00' }
  ],
  'other-user': [
    { id: 'i3', place: '비밀 여행지 (타인)', date: '2026-12-25', time: '00:00' }
  ]
};

let budgets = { 'user-123': 500000 };

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TravelMate Planner API is running' });
});

app.get('/api/destinations', (req, res) => {
  res.json(destinations);
});

// API: Get Itinerary (IDOR vulnerability)
app.get('/api/itinerary/:userId', (req, res) => {
  const targetId = req.params.userId;
  
  // INTENTIONAL BUG: site005-bug03
  // CSV Error: IDOR 취약점
  // Type: security-idor
  // Description: itineraryId만 바꾸면 다른 사용자의 여행 일정을 조회할 수 있음.
  // There is no session check to see if the requester is actually 'targetId'.
  const data = itineraries[targetId] || [];
  res.json(data);
});

// API: Add Itinerary
app.post('/api/itinerary', (req, res) => {
  const { userId, place, date, time } = req.body;
  if (!itineraries[userId]) itineraries[userId] = [];
  
  // INTENTIONAL BUG: site005-bug01
  // CSV Error: DB 중복 저장 오류
  // Type: database-duplicate
  // Description: 일정 추가 API가 동일한 장소와 날짜의 중복 일정을 검사하지 않고 저장함.
  // A check like `if (itineraries[userId].find(i => i.place === place && i.date === date)) return error;` is missing.
  
  const newItem = { id: 'i' + Date.now(), place, date, time };
  itineraries[userId].push(newItem);
  
  res.status(201).json({ success: true, item: newItem });
});

// API: Save Budget
app.post('/api/budget', (req, res) => {
  const { userId, amount } = req.body;
  
  // INTENTIONAL BUG: site005-bug02
  // CSV Error: 네트워크 응답 지연
  // Type: network-latency
  // Description: 예산 저장 API가 특정 금액 이상일 때 비정상적으로 긴 지연 후 응답함.
  if (amount >= 1000000) {
    setTimeout(() => {
      budgets[userId] = amount;
      res.json({ success: true, amount: budgets[userId] });
    }, 15000); // 15 seconds delay
  } else {
    budgets[userId] = amount;
    res.json({ success: true, amount: budgets[userId] });
  }
});

app.get('/api/budget', (req, res) => {
  res.json({ amount: budgets['user-123'] || 0 });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
