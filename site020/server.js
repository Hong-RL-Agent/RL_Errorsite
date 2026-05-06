const express = require('express');
const path = require('path');
const app = express();
const PORT = 9239;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

let hotels = [
  { id: 'h1', name: '그랜드 럭셔리 호텔 앤 스파', location: '서울, 강남구', rating: 5.0, price: 350000, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop', amenities: ['수영장', '스파', '피트니스', '레스토랑'], reviews: 1250 },
  { id: 'h2', name: '오션뷰 리조트 부산', location: '부산, 해운대구', rating: 4.8, price: 280000, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop', amenities: ['해변', '수영장', '조식 포함', '바'], reviews: 890 },
  { id: 'h3', name: '부티크 스테이 제주', location: '제주, 서귀포시', rating: 4.9, price: 150000, img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop', amenities: ['주차', '와이파이', '반려동물'], reviews: 420 },
  { id: 'h4', name: '프리미엄 시티 호텔', location: '서울, 중구', rating: 4.5, price: 180000, img: 'https://images.unsplash.com/photo-1551882547-ff40c0d5e9af?w=400&h=250&fit=crop', amenities: ['피트니스', '비즈니스 센터', '레스토랑'], reviews: 670 },
  { id: 'h5', name: '마운틴 리트리트 강원', location: '강원, 평창군', rating: 4.7, price: 210000, img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=250&fit=crop', amenities: ['스키', '스파', '바베큐', '주차'], reviews: 540 }
];

let rooms = [
  { id: 'r1', type: '스탠다드 더블', price: 150000, breakfast: false, cancellable: true },
  { id: 'r2', type: '디럭스 트윈', price: 210000, breakfast: true, cancellable: true },
  { id: 'r3', type: '프리미엄 스위트', price: 450000, breakfast: true, cancellable: false }
];

app.get('/api/hotels', (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  const minRating = parseFloat(req.query.rating) || 0;
  const maxPrice = parseInt(req.query.price, 10) || Number.MAX_SAFE_INTEGER;
  
  let result = hotels;
  
  if (search) {
    result = result.filter(h => h.location.toLowerCase().includes(search) || h.name.toLowerCase().includes(search));
  }
  
  result = result.filter(h => h.rating >= minRating && h.price <= maxPrice);
  
  res.json({ data: result });
});

app.get('/api/rooms', (req, res) => {
  res.json({ data: rooms });
});

app.post('/api/booking', (req, res) => {
  // Simulate booking success
  res.json({ success: true, message: '예약이 성공적으로 완료되었습니다.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
