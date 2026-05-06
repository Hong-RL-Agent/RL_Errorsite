const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9224;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const categories = ['전체', '치킨', '피자/양식', '중식', '한식', '분식', '디저트'];

const restaurants = [
  { 
    id: 1, 
    name: '황금올리브 치킨', 
    category: '치킨', 
    rating: 4.8, 
    deliveryTime: '30~40분', 
    minOrder: 18000,
    menus: [
      { id: 101, name: '후라이드 치킨', price: 20000, desc: '바삭하고 고소한 후라이드' },
      { id: 102, name: '양념 치킨', price: 21500, desc: '달콤 매콤 양념 치킨' }
    ]
  },
  { 
    id: 2, 
    name: '도미노 피자', 
    category: '피자/양식', 
    rating: 4.5, 
    deliveryTime: '40~50분', 
    minOrder: 15000,
    menus: [
      { id: 201, name: '포테이토 피자 (L)', price: 27900, desc: '감자와 베이컨의 조화' },
      { id: 202, name: '블랙타이거 슈림프', price: 34900, desc: '새우와 스테이크의 만남' }
    ]
  },
  { 
    id: 3, 
    name: '홍콩반점', 
    category: '중식', 
    rating: 4.7, 
    deliveryTime: '20~30분', 
    minOrder: 12000,
    menus: [
      { id: 301, name: '짜장면', price: 6000, desc: '진한 불맛 짜장' },
      { id: 302, name: '탕수육 (소)', price: 14900, desc: '바삭 쫀득 탕수육' }
    ]
  }
];

// --- API Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site005', port: PORT, timestamp: new Date().toISOString() });
});

app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: categories });
});

app.get('/api/restaurants', (req, res) => {
  const { category } = req.query;
  let filtered = restaurants;
  if (category && category !== '전체') {
    filtered = filtered.filter(r => r.category === category);
  }
  res.json({ success: true, data: filtered });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ FoodDelivery server running -> http://localhost:${PORT}`);
});
