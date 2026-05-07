import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9172; // Single port for everything

app.use(cors());
app.use(express.json());

// --- Mock Data ---
let places = [
  { id: 1, name: '스타벅스 강남역점', lat: 37.4979, lng: 127.0276, category: '카페', rating: 4.5 },
  { id: 2, name: '블루보틀 강남', lat: 37.4981, lng: 127.0280, category: '카페', rating: 4.8 }, 
  { id: 3, name: '강남교자', lat: 37.4985, lng: 127.0265, category: '식당', rating: 4.2 },
  { id: 4, name: '메가박스 강남', lat: 37.4990, lng: 127.0250, category: '문화', rating: 4.6 },
  { id: 5, name: '강남 아베다 헤어', lat: 37.5000, lng: 127.0300, category: '미용', rating: 4.0 },
];

let favorites = {}; 
let reviews = [
  { id: 101, placeId: 1, text: '커피가 맛있어요!', user: '김민수', date: Date.now() - 86400000 },
  { id: 102, placeId: 1, text: '사람이 너무 많아요.', user: '이영희', date: Date.now() - 172800000 },
  { id: 103, placeId: 1, text: '친절합니다.', user: '박철수', date: Date.now() - 259200000 },
  { id: 104, placeId: 1, text: '강남역이랑 가까워요.', user: '최지혜', date: Date.now() - 345600000 },
  { id: 105, placeId: 1, text: '노트북 하기 좋아요.', user: '정재욱', date: Date.now() - 432000000 },
  { id: 106, placeId: 1, text: '디저트도 추천합니다.', user: '한가람', date: Date.now() - 518400000 },
  { id: 107, placeId: 1, text: '테라스가 예뻐요.', user: '강하늘', date: Date.now() - 604800000 },
  { id: 108, placeId: 1, text: '조명이 아늑해요.', user: '소윤희', date: Date.now() - 691200000 },
  { id: 109, placeId: 1, text: '라떼가 고소해요.', user: '유정민', date: Date.now() - 777600000 },
  { id: 110, placeId: 1, text: '다음에 또 올게요.', user: '오지수', date: Date.now() - 864000000 },
];

let logs = [];

// --- Utils ---
const calculateDistance = (lat1, lng1, lat2, lng2, isDistorted = false) => {
  if (isDistorted) {
    return Math.abs(lat1 - lat2) * 500 + Math.abs(lng1 - lng2) * 500;
  }
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site063", status: "healthy" });
});

app.get('/api/places', (req, res) => {
  const { lat, lng, sort } = req.query;
  const uLat = parseFloat(lat) || 37.5665;
  const uLng = parseFloat(lng) || 126.9780;

  let bugId = null;
  let data = JSON.parse(JSON.stringify(places));

  // BUG 02: distance-calculation-distortion (Prioritize over Bug 01 if sorting)
  const distort = sort === 'distance';
  if (distort) {
    bugId = 'site063-bug02';
    logs.push({ time: Date.now(), msg: "[오류] 거리 계산 공식 왜곡 탐지 (site063-bug02)" });
  }

  // BUG 01: coordinate-precision-loss (If not sorting, check for Bug 01)
  if (!bugId && Math.abs(uLat - 37.5665) < 0.0001 && Math.abs(uLng - 126.9780) < 0.0001) {
    bugId = 'site063-bug01';
    data = data.map(p => ({
      ...p,
      lat: parseFloat(p.lat.toFixed(2)),
      lng: parseFloat(p.lng.toFixed(2))
    }));
    logs.push({ time: Date.now(), msg: "[경고] 좌표 정밀도 손실 발생 (site063-bug01)" });
  }

  data = data.map(p => ({
    ...p,
    distance: calculateDistance(uLat, uLng, p.lat, p.lng, distort)
  }));

  if (sort === 'distance') {
    data.sort((a, b) => a.distance - b.distance);
  }

  res.json({ data, bugId });
});

app.post('/api/favorites', (req, res) => {
  const { userId, placeId } = req.body;
  const bugId = 'site063-bug03';
  // Intentional Bug 03: uses placeId as the ONLY key, ignoring userId
  favorites[placeId] = { userId, placeId, addedAt: Date.now() };
  logs.push({ time: Date.now(), msg: `[오류] 즐겨찾기 키 충돌 발생 (site063-bug03)` });
  res.json({ saved: true, bugId });
});

app.get('/api/favorites', (req, res) => {
  res.json({ data: Object.values(favorites) });
});

app.get('/api/reviews', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  let bugId = null;
  let offset = (page - 1) * limit;

  if (page === 2) {
    bugId = 'site063-bug04';
    offset += 1; 
    logs.push({ time: Date.now(), msg: "[오류] 페이지네이션 데이터 누락 발생 (site063-bug04)" });
  }

  const data = reviews.slice(offset, offset + limit);
  res.json({ data, total: reviews.length, bugId });
});

app.post('/api/reviews', (req, res) => {
  const { placeId, text, user } = req.body;
  const newReview = { id: Date.now(), placeId, text, user: user || '익명', date: Date.now() };
  reviews.unshift(newReview);
  res.json({ success: true, review: newReview });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalPlaces: places.length,
    totalFavorites: Object.keys(favorites).length,
    totalReviews: reviews.length,
    latestLog: logs[logs.length - 1] || null
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs.slice(-20).reverse() });
});

// Catch-all to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Site063 running on http://localhost:${PORT}`));
