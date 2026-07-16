import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5007;

app.use(cors());
app.use(express.json());

// Shows local database
let shows = [
  { id: "show-101", name: "뮤지컬 <레미제라블>", category: "뮤지컬", location: "샤롯데씨어터 아트홀", priceVIP: 150000, priceR: 120000, priceS: 80000 },
  { id: "show-102", name: "연극 <죽음의 집>", category: "연극", location: "대학로 예술극장 소극장", priceVIP: 60000, priceR: 50000, priceS: 35000 }
];

// Reservations database (예매 내역)
let reservations = [
  { id: "res-001", showId: "show-101", session: "1회차 (14:00)", seat: "A-03", userName: "홍길동", createdAt: new Date().toISOString() },
  { id: "res-002", showId: "show-101", session: "1회차 (14:00)", seat: "B-02", userName: "이몽룡", createdAt: new Date().toISOString() }
];

// API: Get Shows
app.get('/api/shows', (req, res) => {
  res.json(shows);
});

// API: Get current reservations
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// API: Get reserved seats for specific show & session
app.get('/api/shows/seats', (req, res) => {
  const { showId, session } = req.query;
  const reserved = reservations
    .filter(r => r.showId === showId && r.session === session)
    .map(r => r.seat);
  res.json(reserved);
});

// API: Create new reservation (Error 2 and Error 3)
app.post('/api/reservations', (req, res) => {
  const { showId, session, seats, userName } = req.body;

  if (!showId || !session || !seats || seats.length === 0 || !userName) {
    return res.status(400).json({ error: "필수 정보(공연, 회차, 좌석명, 예약자명)가 전달되지 않았습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 예매 단계에서 VIP 등급의 좌석(A-행)을 3개 이상 선택하여 제출한 경우, 
  // 정상적인 수량 한도 실패 안내(HTTP 400 Bad Request) 대신 서버 측 내부 장애인 
  // HTTP 500 Internal Server Error 상태 코드를 전송하여 트랜잭션 충돌 상황을 유도합니다.
  const vipSeats = seats.filter(s => s.startsWith('A-'));
  if (vipSeats.length >= 3) {
    return res.status(500).json({
      error: "Internal Server Error: ArrayIndexOutOfBoundsException - VIP Seat Allocation queue index range overflow. Threshold limited to 2."
    });
  }

  // Check double booking with logical loophole (Error 3)
  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 동일 회차 및 동일 좌석에 대한 중복 예매 여부를 점검할 때, 
  // 기존 예약 내역의 예약자 이름(r.userName)이 현재 신청서의 예약자명(userName)과 일치할 경우에만 
  // 중복으로 식별하게 코드를 설계하여, 서로 다른 이름으로 예약하면 동일 좌석 중복 결제가 승인되는 모순을 발생시킵니다.
  const alreadyBooked = [];
  for (const seat of seats) {
    const isDouble = reservations.some(r => 
      r.showId === showId &&
      r.session === session &&
      r.seat === seat &&
      r.userName === userName // <-- 이 이름 검증 조건 때문에 이름이 다르면 중복 체크를 우회하게 됩니다.
    );
    if (isDouble) {
      alreadyBooked.push(seat);
    }
  }

  if (alreadyBooked.length > 0) {
    return res.status(400).json({ error: `이미 해당 좌석은 고객님 이름으로 예매되어 있습니다: ${alreadyBooked.join(', ')}` });
  }

  // Save new reservations
  const newReservations = [];
  for (const seat of seats) {
    const newRes = {
      id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      showId,
      session,
      seat,
      userName,
      createdAt: new Date().toISOString()
    };
    reservations.push(newRes);
    newReservations.push(newRes);
  }

  res.status(201).json({ success: true, bookings: newReservations });
});

// API: Cancel reservation
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "취소할 예매 내역을 찾을 수 없습니다." });
  }

  reservations.splice(index, 1);
  res.json({ success: true, message: "예매가 정상적으로 취소되었습니다." });
});

app.listen(PORT, () => {
  console.log(`[StagePick Backend] Express server running on http://localhost:${PORT}`);
});
