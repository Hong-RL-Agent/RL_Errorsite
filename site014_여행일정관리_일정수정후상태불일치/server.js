import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5013;

app.use(cors());
app.use(express.json());

// Serve static files (express static)
app.use(express.static('public'));

// Active Trip Database (Local JSON mock)
let activeTrip = {
  id: "trip-01",
  title: "제주도 푸른 밤 힐링 루트",
  days: ["1일차 (바다코스)", "2일차 (산코스)", "3일차 (도심코스)"],
  places: {
    "1일차 (바다코스)": [
      { id: "pl-01", name: "협재 해수욕장", lat: 120, lng: 180, cost: 0 },
      { id: "pl-02", name: "한림 공원 야자수길", lat: 140, lng: 220, cost: 15000 }
    ],
    "2일차 (산코스)": [
      { id: "pl-03", name: "한라산 백록담 등반", lat: 280, lng: 140, cost: 0 },
      { id: "pl-04", name: "서귀포 올레 야시장", lat: 310, lng: 200, cost: 30000 }
    ],
    "3일차 (도심코스)": [
      { id: "pl-05", name: "제주 동문 재래시장", lat: 200, lng: 80, cost: 25000 }
    ]
  },
  expenses: [
    { id: "exp-1", item: "김포-제주 왕복 항공료", cost: 120000 },
    { id: "exp-2", item: "제주 오션 펜션 숙소 예약", cost: 240000 },
    { id: "exp-3", item: "소형 전기 렌터카 및 충전료", cost: 85000 }
  ]
};

// Search locations database
const locationsPool = [
  { name: "협재 해수욕장", lat: 120, lng: 180, description: "맑은 비취색 바다와 부드러운 모래사장" },
  { name: "한림 공원 야자수길", lat: 140, lng: 220, description: "아열대 식물과 대형 석굴이 있는 종합 테마파크" },
  { name: "한라산 백록담 등반", lat: 280, lng: 140, description: "제주도의 중심, 백록담 호수를 품은 고산 등산로" },
  { name: "서귀포 올레 야시장", lat: 310, lng: 200, description: "흑돼지 꼬치와 꽁치김밥 등 맛있는 야식 포장 마차" },
  { name: "제주 동문 재래시장", lat: 200, lng: 80, description: "공항 인근의 대표적인 청과물 및 오메기떡 쇼핑 천국" },
  { name: "성산 일출봉 전망대", lat: 420, lng: 120, description: "거대한 사발 모양의 분화구와 수려한 일출 명소" },
  { name: "우도 섬 안의 섬 투어", lat: 460, lng: 90, description: "스쿠터를 타며 서빈백사 모래를 구경하는 섬 투어" },
  { name: "오설록 녹차 뮤지엄", lat: 160, lng: 280, description: "광활한 녹차밭을 보며 말차 아이스크림을 시식하는 공간" }
];

// API: Get current active trip details
app.get('/api/trips', (req, res) => {
  res.json(activeTrip);
});

// API: Save/Update active trip details
app.post('/api/trips', (req, res) => {
  const { title, days, places, expenses } = req.body;
  activeTrip.title = title || activeTrip.title;
  activeTrip.days = days || activeTrip.days;
  activeTrip.places = places || activeTrip.places;
  activeTrip.expenses = expenses || activeTrip.expenses;
  res.json({ success: true, trip: activeTrip });
});

// API: Delete a Day (Error 3)
app.delete('/api/trips/:id/days/:dayName', (req, res) => {
  const { dayName } = req.params;
  
  // Remove from days array
  activeTrip.days = activeTrip.days.filter(d => d !== dayName);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 여행의 날짜를 삭제하더라도, 해당 날짜 키에 매칭된 장소의 배열 정보(`activeTrip.places[dayName]`)는
  // 데이터베이스에서 완전히 삭제하지 않고 영존시킵니다. 이에 따라 날짜 리스트에서는 제거되나 데이터상에는 
  // 고아 장소 배열이 삭제되지 않고 남아 메모리 및 DB 상태에 고스트 데이터 누출 현상이 유발됩니다.
  // 원래 해야 할 아래 코드를 생략합니다:
  // delete activeTrip.places[dayName];

  res.json({ success: true, trip: activeTrip });
});

// API: Search places
app.get('/api/places', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json(locationsPool);

  const filtered = locationsPool.filter(loc => 
    loc.name.includes(q) || loc.description.includes(q)
  );
  res.json(filtered);
});

// API: Get Trip Share Information (Error 5)
app.get('/api/trips/:id/share', (req, res) => {
  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: 여행 계획의 공유 화면을 조회할 때, 배경에 들어가야 할 정적 지도 이미지 주소를
  // 실제로 유효한 '/images/shared-bg-map.svg'가 아닌 오타/정의 오류가 난 '/static/img/wrong-map-bg.svg' 경로로 
  // 응답 데이터에 적재하여, 화면 로드 시 공유 배경 이미지가 깨진 엑스박스 마크로 뜨게 오작동시킵니다.
  res.json({
    trip: activeTrip,
    shareUrl: `http://localhost:9513/share/${activeTrip.id}`,
    backgroundImageUrl: "/static/img/wrong-map-bg.svg"
  });
});

app.listen(PORT, () => {
  console.log(`[TripWeave Backend] Express server running on http://localhost:${PORT}`);
});
