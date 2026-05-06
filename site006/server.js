const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9225;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const properties = [
  { id: 101, title: '강남 시그니처 레지던스', type: '아파트', price: '35억', area: '132㎡', rooms: 4, location: '강남구 청담동', image: '🏙️' },
  { id: 102, title: '한남더힐 파크뷰', type: '아파트', price: '42억', area: '158㎡', rooms: 4, location: '용산구 한남동', image: '🌳' },
  { id: 103, title: '서초 어반 오피스텔', type: '오피스텔', price: '12억', area: '85㎡', rooms: 2, location: '서초구 서초동', image: '🏢' },
  { id: 104, title: '성수 트리마제 브릿지', type: '아파트', price: '28억', area: '110㎡', rooms: 3, location: '성동구 성수동', image: '🌉' },
  { id: 105, title: '연희동 프라이빗 빌라', type: '빌라/주택', price: '18억', area: '145㎡', rooms: 5, location: '서대문구 연희동', image: '🏡' },
  { id: 106, title: '역삼 테헤란 뷰', type: '오피스텔', price: '9억', area: '55㎡', rooms: 1, location: '강남구 역삼동', image: '🌆' }
];

// --- API Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site006', port: PORT, timestamp: new Date().toISOString() });
});

app.get('/api/properties', (req, res) => {
  const { type, location } = req.query;
  let filtered = properties;
  
  if (type && type !== '전체') {
    filtered = filtered.filter(p => p.type === type);
  }
  if (location && location.trim() !== '') {
    filtered = filtered.filter(p => p.location.includes(location));
  }
  
  res.json({ success: true, data: filtered });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ RealEstate server running -> http://localhost:${PORT}`);
});
