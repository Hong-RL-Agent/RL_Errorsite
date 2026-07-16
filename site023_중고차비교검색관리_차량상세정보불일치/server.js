import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5022;

app.use(cors());
app.use(express.json());

// Cars Database (10 items)
let cars = [
  { id: "car-01", brand: "현대", name: "그랜저 IG 2.4 프리미엄", year: 2019, mileage: 68000, price: 2150, score: 85, fuel: "가솔린", class: "대형", accidents: [{ date: "2020-04", desc: "단순 범퍼 교체" }, { date: "2022-09", desc: "도어 펜더 단순 판금 도색" }] },
  { id: "car-02", brand: "기아", name: "쏘렌토 더 마스터 2.0 디젤", year: 2020, mileage: 85000, price: 2480, score: 82, fuel: "디젤", class: "SUV", accidents: [] },
  { id: "car-03", brand: "제네시스", name: "G80 3.3 GDI AWD 럭셔리", year: 2018, mileage: 92000, price: 2950, score: 89, fuel: "가솔린", class: "대형", accidents: [{ date: "2019-11", desc: "트렁크 리드 교체" }] },
  { id: "car-04", brand: "BMW", name: "5시리즈 520d M 스포츠", year: 2018, mileage: 104000, price: 2790, score: 80, fuel: "디젤", class: "중형", accidents: [{ date: "2021-02", desc: "우측 앞 휀더 단순 교환" }] },
  { id: "car-05", brand: "벤츠", name: "E클래스 E300 아방가르드", year: 2019, mileage: 73000, price: 3850, score: 92, fuel: "가솔린", class: "중형", accidents: [] },
  { id: "car-06", brand: "아우디", name: "A6 35 TDI 프리미엄", year: 2019, mileage: 81000, price: 2650, score: 78, fuel: "디젤", class: "중형", accidents: [{ date: "2020-08", desc: "리어 범퍼 및 사이드 패널 교정" }] },
  { id: "car-07", brand: "쉐보레", name: "더 뉴 트랙스 1.4 터보", year: 2020, mileage: 42000, price: 1350, score: 84, fuel: "가솔린", class: "소형", accidents: [] },
  { id: "car-08", brand: "르노", name: "SM6 2.0 LPe 장애인용", year: 2018, mileage: 115000, price: 1120, score: 75, fuel: "LPG", class: "중형", accidents: [{ date: "2019-03", desc: "쿼터 패널 및 휠 하우스 교체" }, { date: "2023-01", desc: "엔진 블록 단순 누유 수리" }] },
  { id: "car-09", brand: "볼보", name: "XC60 D5 AWD 인스크립션", year: 2019, mileage: 79000, price: 3950, score: 91, fuel: "디젤", class: "SUV", accidents: [] },
  { id: "car-10", brand: "현대", name: "아반떼 AD 1.6 밸류 플러스", year: 2018, mileage: 56000, price: 1250, score: 88, fuel: "가솔린", class: "준중형", accidents: [] }
];

// Favorites database
let favorites = [
  { id: "fav-1", carId: "car-01" }
];

// Bookings database
let bookings = [
  { id: "book-1", carId: "car-02", date: "2026-08-01", time: "14:00" }
];

// API: Get cars catalog
app.get('/api/cars', (req, res) => {
  res.json(cars);
});

// API: Get favorites
app.get('/api/favorites', (req, res) => {
  res.json(favorites);
});

// API: Save favorite
app.post('/api/favorites', (req, res) => {
  const { carId } = req.body;
  if (!carId) return res.status(400).json({ error: "차량 고유 코드가 누락되었습니다." });

  // Prevent duplicate
  const exists = favorites.some(f => f.carId === carId);
  if (!exists) {
    favorites.push({ id: `fav-${Date.now()}`, carId });
  }
  res.status(201).json({ success: true, favorites });
});

// API: Delete favorite (Error 3)
app.delete('/api/favorites/:carId', (req, res) => {
  const { carId } = req.params;

  const index = favorites.findIndex(f => f.carId === carId);
  if (index > -1) {
    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 찜한 차량을 해제할 때, favorites 배열에서 객체를 완전히 삭제(filter)하지 않고 
    // 매핑 속성인 carId값만 빈 문자열("")로 치환하여 레코드 자리를 남겨놓음으로써, 
    // 클라이언트 조회 렌더링 시 빈 공백의 깨진 찜 카드가 출력되게 만듭니다.
    favorites[index].carId = ""; 
    // 원래 들어가야 할 필터링 코드:
    // favorites = favorites.filter(f => f.carId !== carId);
  }

  res.json({ success: true, favorites });
});

// API: Get bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// API: Create booking (Error 2)
app.post('/api/bookings', (req, res) => {
  const { carId, date, time } = req.body;

  if (!carId || !date || !time) {
    return res.status(400).json({ error: "예약할 차량, 시승 날짜 및 시간 슬롯은 필수 요구사항입니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 특정 차량인 아우디 A6(car-06)에 대해 시승 예약을 요청할 시, 
  // 입력값 위반 안내(400)나 예약 추가 완료 대신, 예약 스케줄 서블릿 충돌을 가정한 
  // HTTP 500 Internal Server Error 상태 코드를 리턴하여 에러를 강제 유발합니다.
  if (carId === 'car-06') {
    return res.status(500).json({
      error: "Internal Server Error: CarEngineTestDriveBufferException - Test drive scheduler component crashed for premium sports sedan (car-06)."
    });
  }

  const newBooking = {
    id: `book-${Date.now()}`,
    carId,
    date,
    time
  };

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// Serve dynamic SVGs for car logos/icons
app.get('/images/:filename', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
      <rect x="2" y="10" width="20" height="8" rx="2" />
      <path d="M6 10V6a3 3 0 016 0v4M18 10V6a3 3 0 00-6 0" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  `);
});

app.listen(PORT, () => {
  console.log(`[CarScope Backend] Express server running on http://localhost:${PORT}`);
});
