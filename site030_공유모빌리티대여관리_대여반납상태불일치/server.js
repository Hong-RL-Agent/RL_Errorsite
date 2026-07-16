import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5030;

app.use(cors());
app.use(express.json());

// Cars Database (10 items)
let cars = [
  { id: "rent-01", name: "현대 아반떼 (CN7)", class: "Sedan", fuel: "가솔린", seats: 5, luggage: 2, price: 45000, qty: 4 },
  { id: "rent-02", name: "기아 K5 (DL3)", class: "Sedan", fuel: "LPG", seats: 5, luggage: 3, price: 55000, qty: 3 },
  { id: "rent-03", name: "현대 그랜저 (GN7)", class: "Sedan", fuel: "하이브리드", seats: 5, luggage: 4, price: 80000, qty: 2 },
  { id: "rent-04", name: "기아 쏘렌토", class: "SUV", fuel: "디젤", seats: 7, luggage: 5, price: 75000, qty: 3 },
  { id: "rent-05", name: "현대 팰리세이드", class: "SUV", fuel: "가솔린", seats: 8, luggage: 6, price: 95000, qty: 2 },
  { id: "rent-06", name: "제네시스 G80", class: "Luxury", fuel: "가솔린", seats: 5, luggage: 3, price: 130000, qty: 1 },
  { id: "rent-07", name: "테슬라 모델 Y Long Range", class: "Electric", fuel: "전기", seats: 5, luggage: 4, price: 110000, qty: 2 },
  { id: "rent-08", name: "BMW 520i", class: "Luxury", fuel: "가솔린", seats: 5, luggage: 3, price: 150000, qty: 1 },
  { id: "rent-09", name: "기아 카니발 9인승", class: "Van", fuel: "디젤", seats: 9, luggage: 6, price: 90000, qty: 3 },
  { id: "rent-10", name: "현대 캐스퍼", class: "Compact", fuel: "가솔린", seats: 4, luggage: 1, price: 35000, qty: 5 }
];

// Bookings Database
let bookings = [
  { id: "book-1", carId: "rent-01", carName: "현대 아반떼 (CN7)", location: "서울역", startDate: "2026-07-20", endDate: "2026-07-22", days: 2, insurance: "Standard", totalAmount: 90000, status: "예약 완료" }
];

// API: Get cars
app.get('/api/cars', (req, res) => {
  res.json(cars);
});

// API: Create booking (Error 2)
app.post('/api/bookings', (req, res) => {
  const { carId, carName, location, startDate, endDate, days, insurance, totalAmount } = req.body;

  if (!carId || !location || !days) {
    return res.status(400).json({ error: "예약 필수 정보가 전달되지 않았습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 테슬라 차량(rent-07)에 대해 대여 기일이 3일 이상(days >= 3)인 예약을 신청하는 경우, 
  // 입력 요건 에러(400) 대신 백엔드 가용 자원 처리 오버플로우 예외를 가장하여 HTTP 500 상태 코드를 강제 반환합니다.
  if (carId === 'rent-07' && Number(days) >= 3) {
    return res.status(500).json({
      error: "Internal Server Error: CarRentalThresholdOverflowException - System failed to lock rent-07 for rental period of 3 or more days."
    });
  }

  const targetCar = cars.find(c => c.id === carId);
  if (!targetCar) {
    return res.status(404).json({ error: "존재하지 않는 차량 번호입니다." });
  }

  if (targetCar.qty <= 0) {
    return res.status(400).json({ error: "해당 차량의 대여 가용 재고 수량이 남아있지 않습니다." });
  }

  // Decrement inventory
  targetCar.qty -= 1;

  const newBooking = {
    id: `book-${Date.now()}`,
    carId,
    carName: carName || targetCar.name,
    location,
    startDate,
    endDate,
    days: Number(days),
    insurance: insurance || "Standard",
    totalAmount: Number(totalAmount),
    status: "예약 완료"
  };

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// API: Cancel booking (Error 3)
app.post('/api/bookings/:id/cancel', (req, res) => {
  const { id } = req.params;

  const booking = bookings.find(b => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: "존재하지 않는 예약 번호입니다." });
  }

  booking.status = "취소됨";

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 예약 취소 API 호출 시, 영수증 상태는 '취소됨'으로 표기하지만 
  // 해당 차량의 데이터베이스 내 가용 잔여 대수(qty)를 원상 복구(qty += 1)하지 않고 방치하여, 
  // 대수가 무기한으로 차감된 채 잠기는 재고 연쇄 복구 누락 결함을 유발합니다.
  // 원래 진행되어야 하는 데이터베이스 복구 쿼리 누락:
  // const targetCar = cars.find(c => c.id === booking.carId);
  // if (targetCar) { targetCar.qty += 1; }

  res.json({ success: true, bookings });
});

// API: Get bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// Mock SVG Image generator router (Error 6)
app.get('/images/:filename', (req, res) => {
  const { filename } = req.params;

  if (filename === 'rent-09.png') {
    // INTENTIONAL_ERROR
    // CATEGORY: Server
    // DESCRIPTION: rent-09(카니발)의 이미지 요청인 경우에만 응답 헤더의 Content-Type을 
    // 이미지 마임 타입(image/svg+xml)이 아닌 일반 평문 텍스트(text/plain)로 임의 셋팅하여 반환합니다. 
    // 브라우저 리소스 로더가 타입 불일치로 판독해 렌더링에 실패하고 엑스박스 형태로 표현하게 유도합니다.
    res.setHeader('Content-Type', 'text/plain');
    return res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
        <rect width="100" height="60" rx="8" fill="#1e293b"/>
        <text x="50" y="35" font-family="sans-serif" font-size="10" fill="#f59e0b" text-anchor="middle">KIA Carnival (text/plain)</text>
      </svg>
    `);
  }

  // Normal SVG response
  res.setHeader('Content-Type', 'image/svg+xml');
  const indexStr = filename.replace('rent-', '').replace('.png', '');
  const color = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#06b6d4', '#14b8a6', '#0f172a'][Number(indexStr) - 1] || '#475569';
  
  return res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
      <rect width="100" height="60" rx="8" fill="${color}"/>
      <path d="M15 45 L35 30 L65 30 L85 45 Z" fill="#fff" opacity="0.15"/>
      <circle cx="30" cy="45" r="8" fill="#1e293b"/>
      <circle cx="70" cy="45" r="8" fill="#1e293b"/>
      <text x="50" y="25" font-family="sans-serif" font-size="8" fill="#fff" text-anchor="middle">Car rent-${indexStr}</text>
    </svg>
  `);
});

app.listen(PORT, () => {
  console.log(`[DriveNow Backend] Express server running on http://localhost:${PORT}`);
});
