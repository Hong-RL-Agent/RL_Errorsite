import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5010;

app.use(cors());
app.use(express.json());

// Designers Database
let designers = [
  { id: "des-elly", name: "엘리 수석 디자이너", specialty: "여성 컷트 & 레이어드 펌 전문", tags: ["여성컷", "글램펌", "허쉬컷"], image: "👩‍🎨" },
  { id: "des-leo", name: "레오 원장", specialty: "남성 컷트 & 볼륨 매직 전문", tags: ["남성컷", "가르마펌", "볼륨매직"], image: "👨‍🎨" }
];

// Treatment Menu Database
let treatments = [
  { id: "tr-cut", name: "디자인 컷트", price: 25000, duration: "30분" },
  { id: "tr-perm", name: "볼륨 디지털 펌", price: 90000, duration: "2시간" },
  { id: "tr-color", name: "트렌드 염색", price: 75000, duration: "1시간 30분" },
  { id: "tr-clinic", name: "모발 수분 클리닉", price: 50000, duration: "1시간" }
];

// Reservations Database
let reservations = [
  { 
    id: "res-301", 
    designerId: "des-elly", 
    treatments: [{ id: "tr-cut", name: "디자인 컷트", price: 25000 }], 
    date: "2026-06-25", 
    time: "11:00", 
    userName: "김태희", 
    createdAt: new Date().toISOString() 
  }
];

// API: Get designers
app.get('/api/designers', (req, res) => {
  res.json(designers);
});

// API: Get treatments
app.get('/api/treatments', (req, res) => {
  res.json(treatments);
});

// API: Get reservations
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// API: Create reservation (Error 3)
app.post('/api/reservations', (req, res) => {
  const { designerId, treatments, date, time, userName } = req.body;

  if (!designerId || !treatments || treatments.length === 0 || !date || !time || !userName) {
    return res.status(400).json({ error: "필수 예약 파라미터가 유실되었습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 예약자명이 '테스트고객'이고, 선택한 시술 시각이 오후 6시(18:00) 이후인 경우,
  // 일반적인 영업 마감 안내 거부(HTTP 400 Bad Request) 대신 서버 내부의 NullPointerException을 가정하여 
  // HTTP 500 Internal Server Error 상태 코드를 전송해 비정상 크래시를 연출합니다.
  const hour = parseInt(time.split(':')[0]);
  if (userName === '테스트고객' && hour >= 18) {
    return res.status(500).json({
      error: "Internal Server Error: NullPointerException in SchedulerReservationWorker. Closing time overflow on testing entity."
    });
  }

  const newRes = {
    id: `res-${Date.now()}`,
    designerId,
    treatments,
    date,
    time,
    userName,
    createdAt: new Date().toISOString()
  };

  reservations.push(newRes);
  res.status(201).json(newRes);
});

// API: Update reservation details (Error 4)
app.put('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const { designerId, treatments, date, time, userName } = req.body;

  const originalRes = reservations.find(r => r.id === id);
  if (!originalRes) {
    return res.status(404).json({ error: "변경하려는 예약을 찾을 수 없습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 예약 변경 요청 시, 기존 예약 컬렉션의 특정 아이디 정보를 찾아서 삭제/덮어쓰기 하는 것이 아니라,
  // 기존 내역을 그대로 데이터베이스(reservations)에 방치한 채 새로운 시간대의 예약을 배열에 추가(push) 삽입만 하여,
  // 최종 예약 조회 시 예약 변경 전 내역과 변경 후 내역이 모두 존재하는 2건의 중복 데이터 오염을 유발합니다.
  const newBooking = {
    id: `res-${Date.now()}`,
    designerId: designerId || originalRes.designerId,
    treatments: treatments || originalRes.treatments,
    date: date || originalRes.date,
    time: time || originalRes.time,
    userName: userName || originalRes.userName,
    createdAt: new Date().toISOString()
  };

  reservations.push(newBooking);

  res.json({ success: true, message: "예약 일정이 성공적으로 변경되었습니다.", booking: newBooking });
});

// API: Cancel reservation
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "취소할 예약을 찾을 수 없습니다." });
  }

  reservations.splice(index, 1);
  res.json({ success: true, message: "예약이 정상 취소되었습니다." });
});

app.listen(PORT, () => {
  console.log(`[StyleNest Backend] Express server running on http://localhost:${PORT}`);
});
