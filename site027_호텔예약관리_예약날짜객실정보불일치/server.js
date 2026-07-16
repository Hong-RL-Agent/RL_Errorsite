import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5027;

app.use(cors());
app.use(express.json());

// Exhibitions Database (8 items)
let exhibitions = [
  { id: "exhibit-01", title: "빛의 캔버스: 인상주의 거장전", category: "서양화", artist: "클로드 모네 외", dateRange: "2026-06-01 ~ 2026-09-30", price: 15000, image: "/images/exhibit-01.png" },
  { id: "exhibit-02", title: "포스트모더니즘: 선과 면의 대화", category: "추상화", artist: "안드레이 지드", dateRange: "2026-07-10 ~ 2026-10-15", price: 12000, image: "/images/exhibit-02.png" },
  { id: "exhibit-03", title: "영원한 고독: 에드워드 호퍼 오마주", category: "현대미술", artist: "제임스 엘로이", dateRange: "2026-08-01 ~ 2026-11-30", price: 18000, image: "/images/exhibit-03.png" },
  { id: "exhibit-04", title: "기억의 흔적: 초현실주의 특별전", category: "현대미술", artist: "살바도르 피터", dateRange: "2026-07-01 ~ 2026-09-15", price: 16000, image: "/images/exhibit-04.png" },
  { id: "exhibit-05", title: "조선 왕실의 수묵 담채화 기획전", category: "동양화", artist: "김홍도 외", dateRange: "2026-05-01 ~ 2026-08-20", price: 8000, image: "/images/exhibit-05.png" },
  { id: "exhibit-06", title: "디지털 네이처: 미디어 아트 2026", category: "미디어아트", artist: "서민석", dateRange: "2026-07-15 ~ 2026-12-31", price: 20000, image: "/images/exhibit-06.png" },
  { id: "exhibit-07", title: "클레이 소울: 현대 도예 디자인전", category: "조각/도예", artist: "이자벨라 킴", dateRange: "2026-06-15 ~ 2026-09-10", price: 11000, image: "/images/exhibit-07.png" },
  { id: "exhibit-08", title: "렌즈 뒤의 사색: 글로벌 다큐멘터리 사진전", category: "사진전", artist: "스티브 하비", dateRange: "2026-07-20 ~ 2026-10-30", price: 10000, image: "/images/exhibit-08.png" }
];

// Artist biography timelines database
let artists = {
  "클로드 모네 외": { bio: "인상주의의 거장으로, 자연의 빛과 색채의 흐름을 캔버스에 영원히 고정시킨 예술가 그룹입니다.", timeline: ["1874년 인상파 기획전 개최", "1883년 지베르니 정착", "1890년 수련 시리즈 시작"] },
  "안드레이 지드": { bio: "소재의 극한 한계를 넘어서는 추상 형식을 탐구하며 모더니즘 공간주의를 연 선구자입니다.", timeline: ["1988년 파리 조형미술 금상", "2002년 뉴욕 근대미술 초대전", "2015년 베니스 비엔날레 한국관 평론가상"] },
  "제임스 엘로이": { bio: "현대인의 깊은 고독과 도시의 쓸쓸함을 캔버스 안에 기하학적 정밀함으로 묘사하는 작가입니다.", timeline: ["1995년 시카고 예술학 박사", "2010년 런던 테이트모던 기획 회고전", "2021년 국립현대미술관 초대 작가"] },
  "살바도르 피터": { bio: "초현실적인 몽환과 환상, 인간 내면 무의식 속에 감춰진 억압적 트라우마를 회화로 해체합니다.", timeline: ["2001년 브뤼셀 다다이즘상", "2012년 동경 시각예술 박람회 대상", "2024년 글로벌 초현실 장르 공로 훈장"] },
  "김홍도 외": { bio: "조선 후기 민중의 삶을 소박하고 해학적으로 담아낸 천재 화원들의 조선 수묵 기획 특별전입니다.", timeline: ["1745년 출생 및 도화서 화원 등용", "1781년 조선 정조 어진 초상화 집행", "1795년 을묘년 풍속도첩 기획 편찬"] },
  "서민석": { bio: "컴퓨터 그래픽 파동과 프로젝션 매핑 기술을 접목하여 입체적 자연을 재해석하는 뉴미디어 아티스트입니다.", timeline: ["2018년 미디어 테크 아트 우수상", "2022년 서울 디자인재단 미디어 파사드 총감독", "2025년 광주 미디어 비엔날레 본상"] },
  "이자벨라 킴": { bio: "점토와 자연 세라믹을 활용하여 흙 본연의 영혼을 조각적 부조 형식으로 조율하는 현대도예가입니다.", timeline: ["2009년 이천 도자기 비엔날레 동상", "2016년 헬싱키 세라믹 포럼 아시아 대표", "2023년 대한민국 공예대전 대상을 수상"] },
  "스티브 하비": { bio: "전 세계 분쟁 지역과 자연 생태의 최전선에서 역사의 생생한 증언을 렌즈로 투영해 온 사진작가입니다.", timeline: ["1992년 퓰리처상 보도사진 부문 본상 수상", "2008년 내셔널 지오그래픽 소속 전문 위원", "2019년 글로벌 월드프레스 올해의 작가선정"] }
};

// Bookings database
let bookings = [
  {
    id: "book-1",
    exhibitionId: "exhibit-01",
    date: "2026-08-05",
    time: "11:00",
    attendees: 2,
    status: "예약 확정"
  }
];

// Interests list database
let interests = ["exhibit-01", "exhibit-03"];

// API: Get exhibitions
app.get('/api/exhibitions', (req, res) => {
  res.json(exhibitions);
});

// API: Get bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// API: Create booking (Error 2)
app.post('/api/bookings', (req, res) => {
  const { exhibitionId, date, time, attendees } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 티켓 신청 관람 신청 인원수가 정확히 5명(attendees === 5)인 경우, 
  // 일반적인 인원 초과 경고 메시지(400) 대신 서버 검인 알고리즘 무한 스레드 대기를 연출하여 
  // HTTP 500 Internal Server Error 상태 코드를 즉각 반환합니다.
  if (Number(attendees) === 5) {
    return res.status(500).json({
      error: "Internal Server Error: TicketVerificationLoopException - Thread locked due to attendee threshold count 5."
    });
  }

  if (Number(attendees) > 10) {
    return res.status(400).json({ error: "단체 예약 인원은 최대 10명까지만 신청할 수 있습니다. (초과 시 별도 문의)" });
  }

  const newBooking = {
    id: `book-${Date.now()}`,
    exhibitionId,
    date,
    time,
    attendees: Number(attendees),
    status: "예약 확정"
  };

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// API: Update booking schedule (Error 4)
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;

  const oldBooking = bookings.find(b => b.id === id);
  if (!oldBooking) {
    return res.status(404).json({ error: "해당 예약 건을 찾을 수 없습니다." });
  }

  // Create duplicate booking with new schedule details
  const newBooking = {
    id: `book-${Date.now()}`,
    exhibitionId: oldBooking.exhibitionId,
    date: date || oldBooking.date,
    time: time || oldBooking.time,
    attendees: oldBooking.attendees,
    status: "예약 확정"
  };

  bookings.push(newBooking);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 기존 예약 정보를 시간만 다르게 변경 수정할 때, 구버전 일정의 이전 예약 데이터를 
  // 데이터베이스(bookings)에서 지우거나 대체하지 않고, 바뀐 예약 건만 신규 push해 버림으로써 
  // 기존 시간대와 신규 시간대 예약이 중첩되어 복수 개가 잔류하는 중복 예약 현상을 초래합니다.
  // 원래 진행해야 하는 구식 예약 삭제 코드 누락:
  // bookings = bookings.filter(b => b.id !== id);

  res.json({ success: true, bookings });
});

// API: Get artist profile
app.get('/api/artists/profile/:artistName', (req, res) => {
  const { artistName } = req.params;
  const artist = artists[artistName];
  if (artist) {
    res.json(artist);
  } else {
    res.status(404).json({ error: "해당 작가 정보가 유실되었습니다." });
  }
});

// API: Toggle interest
app.post('/api/interests/toggle', (req, res) => {
  const { exhibitionId } = req.body;
  if (interests.includes(exhibitionId)) {
    interests = interests.filter(id => id !== exhibitionId);
  } else {
    interests.push(exhibitionId);
  }
  res.json({ success: true, interests });
});

// Serve dynamic SVGs for exhibit posters
app.get('/images/:filename', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M2 12h20M12 2v20" />
    </svg>
  `);
});

app.listen(PORT, () => {
  console.log(`[ArtPass Backend] Express server running on http://localhost:${PORT}`);
});
