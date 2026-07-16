import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5040;

app.use(cors());
app.use(express.json());

// Wedding Halls Database (10 items)
let halls = [
  { id: "hall-01", name: "그랜드 볼룸", region: "서울 강남", capacity: 300, rentalFee: 5000000, mealPrice: 65000, desc: "웅장한 대형 샹들리에와 30m 길이의 버진로드로 완성되는 하이엔드 럭셔리 대연회장", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&auto=format&fit=crop&q=60" },
  { id: "hall-02", name: "아벨라 돔홀", region: "서울 서초", capacity: 250, rentalFee: 4000000, mealPrice: 58000, desc: "유럽 대성당을 연상시키는 이국적인 돔 구조 아치 인테리어와 경건하고 우아한 하우스 웨딩 전문홀", image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=500&auto=format&fit=crop&q=60" },
  { id: "hall-03", name: "포레스트 가든", region: "서울 송파", capacity: 150, rentalFee: 3500000, mealPrice: 55000, desc: "도심 속 싱그러운 나무들과 플라워 디렉팅이 가미된 친환경 에코 내추럴 온실형 가든홀", image: "https://images.unsplash.com/photo-1545232979-8bf34eb9757b?w=500&auto=format&fit=crop&q=60" },
  { id: "hall-04", name: "루나 미라벨", region: "인천 송도", capacity: 200, rentalFee: 3000000, mealPrice: 50000, desc: "송도 바다가 한눈에 내려다보이는 파노라마 오션뷰 조망과 최첨단 미디어 파사드 시각 연출홀", image: "https://images.unsplash.com/photo-1507504038482-762618d23dd5?w=500&auto=format&fit=crop&q=60" },
  { id: "hall-05", name: "하늘 정원 야외홀", region: "경기 분당", capacity: 180, rentalFee: 4500000, mealPrice: 60000, desc: "탁 트인 하늘 아래 로맨틱한 노을 속에서 펼쳐지는 자연 친화적인 루프탑 오픈에어 프라이빗 웨딩", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=60" },
  { id: "hall-06", name: "크리스탈 채플", region: "서울 영등포", capacity: 220, rentalFee: 3800000, mealPrice: 56000, desc: "파이프 오르간 선율과 높은 층고, 크리스탈 커튼으로 은하수 빛의 예식을 재현한 정통 채플스타일홀", image: "https://images.unsplash.com/photo-1519225495810-7512c696505a?w=500&auto=format&fit=crop&q=60" },
  { id: "hall-07", name: "아모르홀", region: "서울 마포", capacity: 200, rentalFee: 3200000, mealPrice: 52000, desc: "화사한 파스텔톤 생화 장식과 따스한 버터크림 아이보리 조명이 조화로운 소규모 맞춤형 하우스 웨딩", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&auto=format&fit=crop&q=60" },
  { id: "hall-08", name: "엘리제 가든", region: "경기 수원", capacity: 250, rentalFee: 2800000, mealPrice: 48000, desc: "분수대 광장 피로연 파티 분위기를 선사하는 캐주얼 가든 스타일의 로맨틱 야외 연출홀", image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500&auto=format&fit=crop&q=60" },
  { id: "hall-09", name: "오페라 하우스", region: "서울 중구", capacity: 400, rentalFee: 7000000, mealPrice: 75000, desc: "초대형 미디어아트 스크린과 오페라 극장식 계단식 좌석, 호텔 격식 코스요리가 결합된 메가 럭셔리홀", image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=500&auto=format&fit=crop&q=60" },
  { id: "hall-10", name: "프리마베라 야외홀", region: "경기 용인", capacity: 150, rentalFee: 4200000, mealPrice: 62000, desc: "드넓은 잔디밭 위 벚꽃나무와 생화 아치 숲 아래서 진행하는 단 한 부부만을 위한 4시간 대관 단독 파티 웨딩", image: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=500&auto=format&fit=crop&q=60" }
];

// Consultations Database
let consultations = [
  { id: "cns-01", hallId: "hall-01", hallName: "그랜드 볼룸", name: "이영희", date: "2026-07-20", time: "13:00", guests: 150, phone: "010-1234-5678" }
];

// Available Dates Mocking
const availableDates = ["2026-07-18", "2026-07-19", "2026-07-25", "2026-07-26", "2026-08-01", "2026-08-02", "2026-08-08", "2026-08-09"];

// API: Get Halls
app.get('/api/halls', (req, res) => {
  res.json(halls);
});

// API: Available dates helper (excl hall-07 for Error 5)
app.get('/api/halls/:id/dates', (req, res) => {
  res.json(availableDates);
});

// API: Get Consultations
app.get('/api/consultations', (req, res) => {
  res.json(consultations);
});

// API: Book Consultation (Error 3)
app.post('/api/consultations', (req, res) => {
  const { hallId, name, date, time, guests, phone } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 하객 인원(guests)이 정확히 200명으로 전송될 경우, 
  // 백엔드 정원 초과 예외 발생을 유도하여 500 서버 장애 응답을 반환합니다.
  if (Number(guests) === 200) {
    return res.status(500).json({
      error: "Internal Server Error: Guest capacity constraint violation. Exactly 200 guests is blacklisted by safety protocols."
    });
  }

  const hall = halls.find(h => h.id === hallId);
  const newBooking = {
    id: `cns-${Date.now()}`,
    hallId,
    hallName: hall ? hall.name : "미지정 홀",
    name: name || "익명 예약자",
    date: date || "2026-07-20",
    time: time || "14:00",
    guests: Number(guests) || 100,
    phone: phone || "010-0000-0000"
  };

  consultations.push(newBooking);
  res.status(201).json(newBooking);
});

// API: Reschedule Consultation (Error 4)
app.put('/api/consultations/:id', (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;

  const originalIndex = consultations.findIndex(c => c.id === id);
  if (originalIndex === -1) {
    return res.status(404).json({ error: "상담 내역을 찾을 수 없습니다." });
  }

  const original = consultations[originalIndex];

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 상담 일정을 변경(PUT)할 때 기존 상담 내역 레코드의 시간 정보를 
  // 새로운 데이터로 UPDATE하는 대신, 새로운 일시를 장착한 또 하나의 복사본 레코드를 
  // DB 배열에 push하고 기존 스케줄도 삭제 없이 남겨둠으로써 두 예약이 동시에 잔존하게 유도합니다.
  const duplicatedConsultation = {
    ...original,
    id: `cns-${Date.now()}`,
    date: date || original.date,
    time: time || original.time
  };

  consultations.push(duplicatedConsultation);
  res.json({ success: true, consultations });
});

// API: Cancel Consultation
app.delete('/api/consultations/:id', (req, res) => {
  const { id } = req.params;
  consultations = consultations.filter(c => c.id !== id);
  res.json({ success: true, consultations });
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  consultations = [
    { id: "cns-01", hallId: "hall-01", hallName: "그랜드 볼룸", name: "이영희", date: "2026-07-20", time: "13:00", guests: 150, phone: "010-1234-5678" }
  ];
  res.json({ success: true, consultations });
});

app.listen(PORT, () => {
  console.log(`[WeddingPlan Backend] Express server running on http://localhost:${PORT}`);
});
