import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// SVGs inlined as Data URIs for offline high-fidelity UI styling (except camp-07 which is broken)
const forestSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" fill="%231b3c20"/><circle cx="200" cy="200" r="150" fill="%232b5c32"/><polygon points="80,210 130,120 180,210" fill="%230f2413"/><polygon points="140,210 200,90 260,210" fill="%2316331a"/><polygon points="220,210 290,100 360,210" fill="%230f2413"/><circle cx="320" cy="60" r="25" fill="%23f9d71c" opacity="0.9"/><path d="M140,210 L160,180 L180,210 Z" fill="%23e74c3c"/></svg>`;
const lakeSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" fill="%231a365d"/><path d="M0,150 Q100,130 200,160 T400,150 L400,250 L0,250 Z" fill="%232b6cb0"/><polygon points="50,160 100,80 150,160" fill="%232d3748"/><polygon points="250,170 320,60 390,170" fill="%231a202c"/><path d="M170,180 L200,140 L230,180 Z" fill="%23ed8936"/></svg>`;
const valleySvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" fill="%232d3748"/><circle cx="340" cy="50" r="3" fill="white"/><circle cx="280" cy="80" r="2" fill="white"/><circle cx="100" cy="60" r="3.5" fill="white"/><path d="M0,180 Q150,100 400,180 L400,250 L0,250 Z" fill="%2322543d"/><path d="M0,210 Q200,160 400,210 L400,250 L0,250 Z" fill="%232c5282"/><path d="M180,200 L210,170 L240,200 Z" fill="%23ecc94b"/></svg>`;
const peakSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" fill="%232c5282"/><polygon points="-20,250 150,50 320,250" fill="%231a365d"/><polygon points="120,250 280,30 440,250" fill="%232b6cb0"/><polygon points="120,250 170,180 220,250" fill="%23dd6b20"/><circle cx="60" cy="70" r="20" fill="%23edf2f7" opacity="0.3"/></svg>`;
const glampingSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" fill="%23744210"/><path d="M100,210 Q200,80 300,210 Z" fill="%23fffff0"/><path d="M170,210 L200,150 L230,210 Z" fill="%23dd6b20"/><circle cx="200" cy="110" r="10" fill="%23d69e2e"/><line x1="100" y1="210" x2="300" y2="210" stroke="%234a5568" stroke-width="6"/></svg>`;
const oceanSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" fill="%23065f46"/><path d="M0,170 Q200,130 400,170 L400,250 L0,250 Z" fill="%230284c7"/><path d="M0,200 Q200,170 400,200 L400,250 L0,250 Z" fill="%230369a1"/><rect x="80" y="100" width="100" height="70" rx="10" fill="%23b91c1c"/><rect x="190" y="110" width="30" height="60" rx="5" fill="%2378350f"/></svg>`;
const starSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" fill="%230f172a"/><circle cx="80" cy="60" r="2" fill="white" opacity="0.8"/><circle cx="150" cy="40" r="3" fill="white"/><circle cx="220" cy="80" r="1.5" fill="white"/><circle cx="310" cy="50" r="2" fill="white"/><path d="M0,200 Q200,150 400,200 L400,250 L0,250 Z" fill="%23022c22"/><circle cx="200" cy="200" r="12" fill="%23ea580c"/><circle cx="200" cy="200" r="6" fill="%23ca8a04"/></svg>`;

// Local Camps Database
let camps = [
  {
    id: "camp-01",
    name: "솔바람 푸른 숲 캠핑장",
    region: "강원",
    description: "피톤치드 가득한 솔숲 사이에서 아침을 맞이하는 힐링 캠핑장입니다.",
    basePrice: 45000,
    facilities: ["electricity", "water", "store"],
    capacity: 4,
    rating: 4.8,
    image: forestSvg
  },
  {
    id: "camp-02",
    name: "잔잔한 호숫가 캠핑클럽",
    region: "경기",
    description: "잔잔한 호수 뷰와 아름다운 노을을 감상하며 감성을 즐기는 최적의 캠프 사이트.",
    basePrice: 55000,
    facilities: ["pets", "electricity", "water"],
    capacity: 2,
    rating: 4.7,
    image: lakeSvg
  },
  {
    id: "camp-03",
    name: "계곡 소리 별빛 야영지",
    region: "충청",
    description: "맑고 시원한 계곡 물소리와 함께 밤하늘의 쏟아지는 별을 헤아릴 수 있습니다.",
    basePrice: 40000,
    facilities: ["water", "store"],
    capacity: 6,
    rating: 4.9,
    image: valleySvg
  },
  {
    id: "camp-04",
    name: "산마루 구름 위 쉼터",
    region: "강원",
    description: "해발 700m 고지에서 구름을 아래에 두고 넓고 시원한 뷰를 자랑하는 곳입니다.",
    basePrice: 60000,
    facilities: ["electricity", "water"],
    capacity: 4,
    rating: 4.5,
    image: peakSvg
  },
  {
    id: "camp-05",
    name: "포근 감성 돔 글램핑",
    region: "경기",
    description: "아늑한 돔 텐트와 개별 자쿠지가 구비된 고급스러운 감성 럭셔리 글램핑 공간.",
    basePrice: 120000,
    facilities: ["pets", "electricity", "water", "store"],
    capacity: 2,
    rating: 4.6,
    image: glampingSvg
  },
  {
    id: "camp-06",
    name: "제주 파도 소리 캠퍼",
    region: "제주",
    description: "파란 제주 바다가 눈 앞에 시원하게 펼쳐지는 오션뷰 노지 스타일 캠핑 존.",
    basePrice: 50000,
    facilities: ["pets", "water"],
    capacity: 4,
    rating: 4.9,
    image: oceanSvg
  },
  {
    id: "camp-07",
    name: "포레스트 버치 캠프",
    region: "강원",
    description: "울창한 자작나무 숲속에서 깊은 고요와 진정한 휴식을 맛보는 아늑한 공간입니다.",
    basePrice: 48000,
    facilities: ["electricity", "water"],
    capacity: 4,
    rating: 4.4,
    // INTENTIONAL_ERROR
    // CATEGORY: Server
    // DESCRIPTION: camp-07의 대표 이미지 파일 경로만 존재하지 않는 경로로 설정하여, 
    // 정적 자원을 서빙할 수 없기 때문에 렌더링 시 이미지가 깨지게 만듭니다.
    image: "/images/non_existent_camp_07_bg.jpg"
  },
  {
    id: "camp-08",
    name: "오로라 밤하늘 아웃도어",
    region: "충청",
    description: "캠프파이어 전용 화로와 불멍 존이 준비된 프라이빗 야외 레크리에이션 공간.",
    basePrice: 38000,
    facilities: ["pets", "electricity", "store"],
    capacity: 8,
    rating: 4.7,
    image: starSvg
  }
];

// In-Memory Reservations Database
let reservations = [];

// API: Get all camps
app.get('/api/camps', (req, res) => {
  res.json(camps);
});

// API: Get all reservations
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// API: Create a reservation
app.post('/api/reservations', (req, res) => {
  const { campId, userName, date, guests } = req.body;

  if (!campId || !userName || !date || !guests) {
    return res.status(400).json({ error: "필수 정보가 누락되었습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: camp-04(산마루 구름 위 쉼터)를 예약하는 POST 요청이 들어오면 
  // 의도적으로 HTTP 500 Internal Server Error 상태 코드를 반환하도록 분기 처리합니다.
  if (campId === 'camp-04') {
    return res.status(500).json({ 
      error: "데이터베이스 연결에 예외가 발생했습니다 (HTTP 500: Database Connection Interrupted)." 
    });
  }

  const camp = camps.find(c => c.id === campId);
  if (!camp) {
    return res.status(404).json({ error: "존재하지 않는 캠핑장입니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 동일 캠핑장과 날짜에 대해 중복 예약을 검증하는 중복 방지 조건부 로직을 
  // 고의적으로 완전히 생략하고 바로 데이터베이스 배열(reservations)에 저장 및 수락하여 데이터 중복 문제를 발생시킵니다.
  /*
  const isAlreadyReserved = reservations.some(r => r.campId === campId && r.date === date);
  if (isAlreadyReserved) {
    return res.status(400).json({ error: "선택하신 날짜는 이미 마감되었습니다." });
  }
  */

  const newReservation = {
    id: `RES-${Date.now().toString().slice(-6)}`,
    campId,
    campName: camp.name,
    userName,
    date,
    guests: parseInt(guests),
    totalPrice: camp.basePrice,
    createdAt: new Date().toISOString()
  };

  reservations.push(newReservation);
  res.status(201).json(newReservation);
});

// API: Cancel a reservation
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const index = reservations.findIndex(r => r.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: "예약 내역을 찾을 수 없습니다." });
  }

  reservations.splice(index, 1);
  res.json({ success: true, message: "예약이 취소되었습니다." });
});

// Start Express Backend
app.listen(PORT, () => {
  console.log(`[Camply Backend] Express server running on http://localhost:${PORT}`);
});
