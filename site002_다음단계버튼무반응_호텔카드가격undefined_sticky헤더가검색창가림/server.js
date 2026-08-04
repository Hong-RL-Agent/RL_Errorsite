const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9221;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const popularCities = [
  { id: 1, name: '오사카', country: '일본', imageColor: '#60a5fa' },
  { id: 2, name: '파리', country: '프랑스', imageColor: '#3b82f6' },
  { id: 3, name: '방콕', country: '태국', imageColor: '#2563eb' },
  { id: 4, name: '다낭', country: '베트남', imageColor: '#1d4ed8' }
];

const hotels = [
  { id: 101, cityId: 1, name: '오사카 블루 스카이 호텔', rating: 4.8, price: 154000, amenities: ['수영장', '조식 포함', '무료 와이파이'] },
  { id: 102, cityId: 1, name: '재팬 트레디셔널 료칸', rating: 4.5, price: 210000, amenities: ['온천', '다다미방', '조식 포함'] },
  { id: 103, cityId: 2, name: '르 파리 그랜드 호텔', rating: 4.9, price: 450000, amenities: ['에펠탑 뷰', '수영장', '스파'] },
  { id: 104, cityId: 3, name: '방콕 리버사이드 리조트', rating: 4.6, price: 120000, amenities: ['수영장', '리버 뷰', '피트니스'] },
  { id: 105, cityId: 4, name: '다낭 비치 프론트 빌라', rating: 4.7, price: 180000, amenities: ['프라이빗 비치', '풀빌라', '바비큐'] }
];

// --- API Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site002', port: PORT, timestamp: new Date().toISOString() });
});

app.get('/api/cities', (req, res) => {
  res.json({ success: true, data: popularCities });
});

app.get('/api/hotels', (req, res) => {
  const { cityId, minRating } = req.query;
  let filtered = hotels;
  
  if (cityId) {
    filtered = filtered.filter(h => h.cityId === parseInt(cityId));
  }
  if (minRating) {
    filtered = filtered.filter(h => h.rating >= parseFloat(minRating));
  }
  
  res.json({ success: true, data: filtered });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ BlueSky Travel server running -> http://localhost:${PORT}`);
});
