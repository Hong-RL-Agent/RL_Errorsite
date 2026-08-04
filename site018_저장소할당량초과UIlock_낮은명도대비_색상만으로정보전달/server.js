const express = require('express');
const path = require('path');
const app = express();
const PORT = 9237;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

let trips = [
  { id: 't1', city: '파리', startDate: '2026-06-01', endDate: '2026-06-07', accommodation: '르 메르디앙 에투알', flight: 'AF261', status: '확정', conflict: false },
  { id: 't2', city: '도쿄', startDate: '2026-07-15', endDate: '2026-07-20', accommodation: '신주쿠 워싱턴 호텔', flight: 'JL092', status: '대기', conflict: true },
  { id: 't3', city: '뉴욕', startDate: '2026-09-10', endDate: '2026-09-18', accommodation: '더 플라자', flight: 'KE081', status: '변경됨', conflict: false },
];

const activities = [
  { id: 'a1', city: '파리', name: '루브르 박물관 투어', price: 45000, tags: ['문화', '예술'], image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop' },
  { id: 'a2', city: '파리', name: '센 강 유람선', price: 25000, tags: ['야경', '로맨틱'], image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=300&fit=crop' },
  { id: 'a3', city: '도쿄', name: '도쿄 타워 전망대', price: 18000, tags: ['야경', '랜드마크'], image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&h=300&fit=crop' },
  { id: 'a4', city: '도쿄', name: '아사쿠사 기모노 체험', price: 35000, tags: ['전통', '체험'], image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop' },
  { id: 'a5', city: '뉴욕', name: '센트럴 파크 자전거 투어', price: 30000, tags: ['자연', '액티비티'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop' },
];

app.get('/api/trips', (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  let result = trips;
  if (search) {
    result = trips.filter(t => t.city.toLowerCase().includes(search));
  }
  res.json({ data: result });
});

app.get('/api/activities', (req, res) => {
  const city = (req.query.city || '').toLowerCase();
  let result = activities;
  if (city) {
    result = activities.filter(a => a.city.toLowerCase() === city);
  }
  res.json({ data: result });
});

// Offline Save Mock
app.post('/api/trips/save', (req, res) => {
  // Always succeeds on backend, the error logic is mocked in frontend as per requirements.
  res.status(200).json({ success: true, message: 'Saved to server.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
