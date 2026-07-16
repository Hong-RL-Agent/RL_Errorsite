import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5046;

app.use(cors());
app.use(express.json());

// Aviation Flights database (Minimum 16 entries)
let flights = [
  { id: "KE-101", from: "서울", to: "도쿄", pricePerKg: 5, date: "2026-07-14", time: "09:00", carrier: "대한항공" },
  { id: "OZ-102", from: "서울", to: "도쿄", pricePerKg: 4, date: "2026-07-14", time: "13:30", carrier: "아시아나" },
  { id: "JL-103", from: "서울", to: "도쿄", pricePerKg: 6, date: "2026-07-15", time: "11:00", carrier: "일본항공" },
  { id: "KE-201", from: "서울", to: "방콕", pricePerKg: 8, date: "2026-07-14", time: "18:20", carrier: "대한항공" },
  
  { id: "TG-202", from: "서울", to: "방콕", pricePerKg: 7, date: "2026-07-14", time: "10:15", carrier: "타이항공" },
  { id: "OZ-203", from: "서울", to: "방콕", pricePerKg: 9, date: "2026-07-15", time: "20:00", carrier: "아시아나" },
  { id: "SQ-301", from: "서울", to: "싱가포르", pricePerKg: 10, date: "2026-07-14", time: "16:40", carrier: "싱가포르항공" },
  { id: "KE-302", from: "서울", to: "싱가포르", pricePerKg: 11, date: "2026-07-15", time: "14:10", carrier: "대한항공" },
  
  { id: "TR-303", from: "서울", to: "싱가포르", pricePerKg: 8, date: "2026-07-15", time: "23:50", carrier: "스쿠트항공" },
  { id: "CX-401", from: "서울", to: "홍콩", pricePerKg: 6, date: "2026-07-14", time: "08:10", carrier: "캐세이퍼시픽" },
  { id: "KE-402", from: "서울", to: "홍콩", pricePerKg: 7, date: "2026-07-15", time: "19:30", carrier: "대한항공" },
  { id: "ZE-403", from: "서울", to: "홍콩", pricePerKg: 5, date: "2026-07-15", time: "12:00", carrier: "이스타항공" },
  
  { id: "KE-501", from: "부산", to: "도쿄", pricePerKg: 6, date: "2026-07-14", time: "11:00", carrier: "대한항공" },
  { id: "BX-502", from: "부산", to: "도쿄", pricePerKg: 5, date: "2026-07-15", time: "07:30", carrier: "에어부산" },
  { id: "SQ-601", from: "부산", to: "싱가포르", pricePerKg: 12, date: "2026-07-14", time: "18:00", carrier: "싱가포르항공" },
  { id: "BX-602", from: "부산", to: "싱가포르", pricePerKg: 10, date: "2026-07-15", time: "08:35", carrier: "에어부산" }
];

// Cargo Booking Records Database
let bookings = [
  { id: "bk-1001", flightId: "SQ-301", from: "서울", to: "싱가포르", date: "2026-07-14", weight: 200, packageType: "Box", fare: 2000, status: "확정됨" }
];

// Customs Clearance Document Registry
let documents = [
  { id: "doc-01", name: "송장 서류 원본.pdf", path: "/uploads/송장 서류 원본.pdf" },
  { id: "doc-02", name: "세관 신고 증명서.pdf", path: "/uploads/세관 신고 증명서.pdf" }
];

// Cargo Tracking events list
let trackingEvents = {
  "bk-1001": [
    { status: "접수", time: "2026-07-13 10:00", location: "ICN 화물터미널", desc: "화물 수령 및 세관 대기" },
    { status: "세관통과", time: "2026-07-13 14:30", location: "인천세관관세구역", desc: "검역 및 수출입 서류 심사 완료" },
    { status: "선적완료", time: "2026-07-13 18:00", location: "인천 계류장 SQ-301", desc: "항공기 적재 및 출발 대기" }
  ]
};

// API: Get Flight Lists
app.get('/api/flights', (req, res) => {
  res.json(flights);
});

// API: Search flights (Error 2 Search race condition delays)
app.get('/api/flights/search', (req, res) => {
  const { from, to } = req.query;
  let delay = 100;
  
  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: '도쿄' 노선 검색에 3000ms(3초) 지연을 부여하고, 
  // '방콕'은 1000ms, '싱가포르'는 200ms 지연을 부여하여 비동기 응답 순서가 뒤집히도록 유도합니다.
  if (to === '도쿄') {
    delay = 3000;
  } else if (to === '방콕') {
    delay = 1000;
  } else if (to === '싱가포르') {
    delay = 200;
  }

  setTimeout(() => {
    const results = flights.filter(f => f.from === from && f.to === to);
    res.json({ to, results });
  }, delay);
});

// API: Get Bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// API: Create Booking (Error 1 accepts mismatch weight & fare)
app.post('/api/bookings', (req, res) => {
  const { flightId, from, to, date, weight, packageType, fare } = req.body;
  const newBooking = {
    id: `bk-${Date.now()}`,
    flightId,
    from,
    to,
    date,
    weight,
    packageType,
    fare,
    status: "확정됨"
  };

  bookings.unshift(newBooking);
  
  // Initialize tracking events
  trackingEvents[newBooking.id] = [
    { status: "접수", time: new Date().toLocaleString(), location: `${from} 터미널`, desc: "화물 입고 접수 완료" }
  ];

  console.log(`[DB BOOKING] Created booking with weight: ${weight}, package: ${packageType}, fare: ${fare}`);
  res.json({ success: true, booking: newBooking });
});

// API: Reschedule Booking (Error 3 change-cancel race)
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { date, weight } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 예약 변경 요청(PUT)에 3000ms(3초) 고의 지연을 설정합니다.
  // 사용자가 변경 직후 취소(DELETE, 즉각완료)를 누르면 예약이 삭제되지만, 
  // 3초 뒤 변경 처리가 돌아가면서 삭제된 기록을 재생성(Recreate)하여 예약을 강제 활성화시킵니다.
  setTimeout(() => {
    const b = bookings.find(item => item.id === id);
    if (b) {
      b.date = date;
      b.weight = weight;
      b.status = "확정됨";
      console.log(`[DB BOOKING] Booking ${id} rescheduled to: ${date}`);
    } else {
      // Recreate deleted booking
      bookings.push({
        id,
        flightId: "KE-101",
        from: "서울",
        to: "도쿄",
        date,
        weight,
        packageType: "Box",
        fare: 1500,
        status: "확정됨"
      });
      console.log(`[DB BOOKING RACE] Resurrected deleted booking ${id} due to delayed update!`);
    }
  }, 3000);

  res.json({ success: true });
});

// API: Cancel Booking (Error 3 cancels instantly)
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  bookings = bookings.filter(b => b.id !== id);
  console.log(`[DB BOOKING] Booking ${id} deleted immediately.`);
  res.json({ success: true });
});

// API: Get Customs Documents
app.get('/api/documents', (req, res) => {
  res.json(documents);
});

// API: Upload Customs Document
app.post('/api/documents', (req, res) => {
  const { name } = req.body;
  const newDoc = {
    id: `doc-${Date.now()}`,
    name,
    path: `/uploads/${name}`
  };
  documents.unshift(newDoc);
  res.json(newDoc);
});

// API: Download Customs Document (Error 4 Korean & space filename 404)
app.get('/api/documents/download/:name', (req, res) => {
  const name = req.params.name;
  
  // INTENTIONAL_ERROR
  // CATEGORY: Server + Database
  // DESCRIPTION: 파일명에 공백과 한글이 모두 포함된 경우(예: '송장 서류 원본.pdf'), 
  // 서버가 요청받은 파일명과 DB 목록명을 파싱하는 인코딩 방식 차이로 인해 
  // 강제로 404 Not Found 에러를 발출하여 다운로드에 실패하게 유도합니다.
  const hasKoreanAndSpace = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(name) && name.includes(' ');
  if (hasKoreanAndSpace) {
    console.log(`[DOWNLOAD 404] Korean & Space filename encoding mismatch for: "${name}"`);
    return res.status(404).send("404 File Not Found: 파일명 인코딩 불일치로 서류를 찾을 수 없습니다.");
  }

  res.json({
    success: true,
    fileContent: `[서류 파일 다운로드 성공] 파일명: ${name}. 정상 승인 통관 완료.`
  });
});

// API: Get Tracking Events
app.get('/api/tracking/:id', (req, res) => {
  const { id } = req.params;
  res.json(trackingEvents[id] || []);
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  bookings = [
    { id: "bk-1001", flightId: "SQ-301", from: "서울", to: "싱가포르", date: "2026-07-14", weight: 200, packageType: "Box", fare: 2000, status: "확정됨" }
  ];
  documents = [
    { id: "doc-01", name: "송장 서류 원본.pdf", path: "/uploads/송장 서류 원본.pdf" },
    { id: "doc-02", name: "세관 신고 증명서.pdf", path: "/uploads/세관 신고 증명서.pdf" }
  ];
  trackingEvents = {
    "bk-1001": [
      { status: "접수", time: "2026-07-13 10:00", location: "ICN 화물터미널", desc: "화물 수령 및 세관 대기" },
      { status: "세관통과", time: "2026-07-13 14:30", location: "인천세관관세구역", desc: "검역 및 수출입 서류 심사 완료" },
      { status: "선적완료", time: "2026-07-13 18:00", location: "인천 계류장 SQ-301", desc: "항공기 적재 및 출발 대기" }
    ]
  };
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[AirCargo Hub Backend] Express server running on http://localhost:${PORT}`);
});
