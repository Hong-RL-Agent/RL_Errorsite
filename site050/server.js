const express = require('express');
const path = require('path');
const app = express();
const PORT = 9379;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let places = [
  { id: 'pl-2', name: '남이섬', region: '강원', category: 'Nature', description: '숲과 강이 어우러진 아름다운 섬입니다.' },
  { id: 'pl-1', name: '경복궁', region: '서울', category: 'History', description: '조선 시대의 법궁으로 웅장한 미를 자랑합니다.' },
  { id: 'pl-3', name: '해운대', region: '부산', category: 'Nature', description: '시원한 바다와 고층 빌딩이 조화를 이루는 곳입니다.' }
];

let routes = [
  { 
    id: 'route-1', 
    name: '서울 역사 산책', 
    stops: [
      { placeId: 'pl-1', stopOrder: 1 }, 
      { placeId: 'pl-4', stopOrder: 2 }, // pl-4는 예시용 가상 ID
      { placeId: 'pl-5', stopOrder: 3 }
    ] 
  }
];

let savedRoutes = [
  { id: 'saved-1', userId: 'user_A', routeName: '나의 강원도 여행', places: ['남이섬', '강릉 커피거리'], isPrivate: true },
  { id: 'saved-99', userId: 'user_B', routeName: '비밀 신혼여행 계획', places: ['몰디브', '고급 리조트'], isPrivate: true } // 타인의 데이터
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LocalTour API is running' });
});

// API: Get Places (with partial response bug)
app.get('/api/places', (req, res) => {
  const { region } = req.query;
  let filtered = places;
  if (region) filtered = places.filter(p => p.region === region);

  // INTENTIONAL BUG: site050-bug02
  // CSV Error: 네트워크 부분 응답
  // Type: network-partial-response
  // 버그: 강원 지역인 경우 description을 누락하고 응답함
  const result = filtered.map(p => {
    if (p.region === '강원') {
      const { description, ...rest } = p;
      return rest;
    }
    return p;
  });

  res.json(result);
});

// API: Get Route Detail (with ordering bug)
app.get('/api/routes/:id', (req, res) => {
  const route = routes.find(r => r.id === req.params.id);
  if (route) {
    // INTENTIONAL BUG: site050-bug01
    // CSV Error: DB 경로 순서 오류
    // Type: database-order
    // 버그: stopOrder가 아닌 placeId(또는 내부 ID) 순서로 정렬하여 반환함
    const sortedStops = [...route.stops].sort((a, b) => a.placeId.localeCompare(b.placeId));
    res.json({ ...route, stops: sortedStops });
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

// API: Get Saved Route (with IDOR bug)
// INTENTIONAL BUG: site050-bug03
// CSV Error: 저장 코스 소유자 검증 누락
// Type: security-idor
app.get('/api/saved-routes/:id', (req, res) => {
  const saved = savedRoutes.find(s => s.id === req.params.id);
  if (saved) {
    // 보안 취약점: 요청한 사용자가 실제 소유자인지 검증하지 않고 비공개 코스도 반환함
    res.json(saved);
  } else {
    res.status(404).json({ error: 'Saved route not found' });
  }
});

app.get('/api/saved-routes/user/:userId', (req, res) => {
  res.json(savedRoutes.filter(s => s.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
