import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5021;

app.use(cors());
app.use(express.json());

// INTENTIONAL_ERROR
// CATEGORY: Infrastructure
// DESCRIPTION: 매물 이미지 요청에 호스트 OS 환경변수인 process.env.PROPERTY_ASSET_URL을 사용합니다. 
// 현재 인프라 환경상 해당 환경 변수가 기입되어 있지 않으므로 'undefined' 문자열이 접두어로 결합되어 
// 404 정적 파일 경로 호출 오류가 일어나고 엑스박스를 그리게 됩니다.
const assetBase = process.env.PROPERTY_ASSET_URL; // will be undefined

// Properties Database (10 items)
let properties = [
  { id: "prop-01", name: "서교동 햇살 가득 원룸", type: "원룸", price: 80, deposit: 1000, priceType: "월세", area: 22, rooms: 1, coords: { x: 35, y: 45 }, realtor: { name: "명가공인 이실장", phone: "010-1234-5678" }, image: `${assetBase}/images/prop-01.svg` },
  { id: "prop-02", name: "망원역 루프탑 아뜰리에", type: "원룸", price: 15000, deposit: 0, priceType: "전세", area: 33, rooms: 1, coords: { x: 42, y: 55 }, realtor: { name: "명가공인 이실장", phone: "010-1234-5678" }, image: `${assetBase}/images/prop-02.svg` },
  { id: "prop-03", name: "상수역 파크뷰 오피스텔", type: "오피스텔", price: 90, deposit: 2000, priceType: "월세", area: 45, rooms: 1, coords: { x: 50, y: 35 }, realtor: { name: "새한부동산 박대표", phone: "010-4321-8765" }, image: `${assetBase}/images/prop-03.svg` },
  { id: "prop-04", name: "합정 자이 하이라이즈 아파트", type: "아파트", price: 120000, deposit: 0, priceType: "매매", area: 84, rooms: 3, coords: { x: 60, y: 48 }, realtor: { name: "새한부동산 박대표", phone: "010-4321-8765" }, image: `${assetBase}/images/prop-04.svg` },
  { id: "prop-05", name: "신촌 리버빌 원룸", type: "원룸", price: 60, deposit: 500, priceType: "월세", area: 18, rooms: 1, coords: { x: 28, y: 60 }, realtor: { name: "명가공인 이실장", phone: "010-1234-5678" }, image: `${assetBase}/images/prop-05.svg` },
  { id: "prop-06", name: "홍대 가람 오피스텔 10층", type: "오피스텔", price: 22000, deposit: 0, priceType: "전세", area: 39, rooms: 1, coords: { x: 48, y: 72 }, realtor: { name: "새한부동산 박대표", phone: "010-4321-8765" }, image: `${assetBase}/images/prop-06.svg` },
  { id: "prop-07", name: "아현 가을단지 아파트", type: "아파트", price: 95000, deposit: 0, priceType: "매매", area: 59, rooms: 2, coords: { x: 65, y: 22 }, realtor: { name: "태양공인 최소장", phone: "010-9876-5432" }, image: `${assetBase}/images/prop-07.svg` },
  { id: "prop-08", name: "연희동 정원 주택형 원룸", type: "원룸", price: 75, deposit: 2000, priceType: "월세", area: 28, rooms: 2, coords: { x: 22, y: 38 }, realtor: { name: "태양공인 최소장", phone: "010-9876-5432" }, image: `${assetBase}/images/prop-08.svg` },
  { id: "prop-09", name: "디지털미디어시티 푸르지오 아파트", type: "아파트", price: 145000, deposit: 0, priceType: "매매", area: 112, rooms: 4, coords: { x: 15, y: 25 }, realtor: { name: "태양공인 최소장", phone: "010-9876-5432" }, image: `${assetBase}/images/prop-09.svg` },
  { id: "prop-10", name: "창전동 로얄 패밀리 아파트", type: "아파트", price: 85000, deposit: 0, priceType: "매매", area: 74, rooms: 3, coords: { x: 75, y: 65 }, realtor: { name: "명가공인 이실장", phone: "010-1234-5678" }, image: `${assetBase}/images/prop-10.svg` }
];

// Bookings database
let bookings = [
  { id: "book-1", listingId: "prop-01", dateTime: "2026-07-25 14:00", memo: "원룸 방 크기 확인차 오후 방문 희망합니다.", status: "ready" }
];

// API: Get properties
app.get('/api/properties', (req, res) => {
  res.json(properties);
});

// API: Get bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// API: Create Booking (Error 2)
app.post('/api/bookings', (req, res) => {
  const { listingId, dateTime, memo } = req.body;

  if (!listingId || !dateTime) {
    return res.status(400).json({ error: "매물 아이디와 방문 희망 시각은 필수 입력 사항입니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 방문 예약 메모(memo)의 총 글자 수가 정확히 80자인 경우에 한하여, 
  // 일반적인 문구 검증 필터(400) 대신 백엔드 서버 처리 한도 초과 오류인 HTTP 500 Internal Server Error를 강제 전송합니다.
  if (memo && memo.length === 80) {
    return res.status(500).json({
      error: "Internal Server Error: BrokerReservationBufferOverflowException - Reservation memo fits exactly 80 characters maximum."
    });
  }

  const newBooking = {
    id: `book-${Date.now()}`,
    listingId,
    dateTime,
    memo: memo || "",
    status: "ready"
  };

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// API: Update Booking time (Error 3)
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { dateTime, memo } = req.body;

  const oldBooking = bookings.find(b => b.id === id);
  if (!oldBooking) {
    return res.status(404).json({ error: "예약 정보를 찾을 수 없습니다." });
  }

  // Create new booking with modified date/time
  const newBooking = {
    id: `book-${Date.now()}`,
    listingId: oldBooking.listingId,
    dateTime,
    memo: memo || oldBooking.memo,
    status: "ready"
  };
  
  bookings.push(newBooking);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 기존 예약을 변경하고자 할 때 신규 변경 예약 건을 데이터베이스(bookings)에 
  // 신규 등록(push)하지만, 기존에 매칭되어 존재하던 이전 시간대 예약 정보(oldBooking)를 지우거나 갱신하지 않고 
  // 리스트에 방치함으로써 두 건의 예약 기록이 다중화되는 결함을 유발합니다.
  // 원래 해야하는 기예약분 제거 코드 생략:
  // bookings = bookings.filter(b => b.id !== id);

  res.json({ success: true, bookings });
});

// Serve dynamic SVGs for properties
app.get('/images/:filename', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  `);
});

app.listen(PORT, () => {
  console.log(`[HomeMap Backend] Express server running on http://localhost:${PORT}`);
});
