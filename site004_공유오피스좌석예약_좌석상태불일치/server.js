import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5003;

app.use(cors());
app.use(express.json());

// Inlined office background SVG layouts
const floor1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <rect width="600" height="400" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="4"/>
  <line x1="200" y1="20" x2="200" y2="380" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6"/>
  <line x1="400" y1="20" x2="400" y2="380" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6"/>
  <rect x="20" y="20" width="160" height="360" rx="8" fill="#eff6ff" opacity="0.6"/>
  <text x="100" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1d4ed8" text-anchor="middle">A: 포커스 존 (Focus)</text>
  <rect x="220" y="20" width="160" height="360" rx="8" fill="#f0fdf4" opacity="0.6"/>
  <text x="300" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="#15803d" text-anchor="middle">B: 워크 존 (Work)</text>
  <rect x="420" y="20" width="160" height="360" rx="8" fill="#fffbeb" opacity="0.6"/>
  <text x="500" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="#a16207" text-anchor="middle">C: 협업 존 (Collab)</text>
  <path d="M 20 200 L 100 200" stroke="#cbd5e1" stroke-width="3"/>
  <path d="M 420 150 L 580 150" stroke="#cbd5e1" stroke-width="3"/>
</svg>`;

const floor2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <rect width="600" height="400" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="4"/>
  <line x1="300" y1="20" x2="300" y2="380" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6"/>
  <rect x="20" y="20" width="260" height="360" rx="8" fill="#fdf2f8" opacity="0.6"/>
  <text x="150" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="#be185d" text-anchor="middle">D: 집중 업무 존 (Deep Focus)</text>
  <rect x="320" y="20" width="260" height="360" rx="8" fill="#faf5ff" opacity="0.6"/>
  <text x="450" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="#6b21a8" text-anchor="middle">E: 오픈 세미나 존 (Seminar)</text>
</svg>`;

// Seats Database
// x, y represent relative positions in percentages for overlay mapping
let seats = [
  // Floor 1
  { id: "S-101", floor: 1, zone: "A", type: "circle", name: "1인 포커스 독서실석 101", top: 25, left: 15 },
  { id: "S-102", floor: 1, zone: "A", type: "circle", name: "1인 포커스 독서실석 102", top: 50, left: 15 },
  { id: "S-103", floor: 1, zone: "A", type: "circle", name: "1인 포커스 독서실석 103", top: 75, left: 15 },
  { id: "S-104", floor: 1, zone: "B", type: "square", name: "표준 파티션 데스크 104", top: 30, left: 45 },
  { id: "S-105", floor: 1, zone: "B", type: "square", name: "표준 파티션 데스크 105", top: 50, left: 45 },
  { id: "S-106", floor: 1, zone: "B", type: "square", name: "표준 파티션 데스크 106", top: 70, left: 45 },
  { id: "S-107", floor: 1, zone: "C", type: "table", name: "공동 작업 롱 테이블 107", top: 35, left: 80 },
  { id: "S-108", floor: 1, zone: "C", type: "table", name: "공동 작업 롱 테이블 108", top: 65, left: 80 },

  // Floor 2
  { id: "S-201", floor: 2, zone: "D", type: "circle", name: "집중 개발 데스크 201", top: 30, left: 20 },
  { id: "S-202", floor: 2, zone: "D", type: "circle", name: "집중 개발 데스크 202", top: 60, left: 20 },
  { id: "S-203", floor: 2, zone: "D", type: "square", name: "집중 파티션 부스 203", top: 30, left: 40 },
  { id: "S-204", floor: 2, zone: "D", type: "square", name: "집중 파티션 부스 204", top: 60, left: 40 },
  { id: "S-205", floor: 2, zone: "E", type: "table", name: "세미나 라운드 테이블 205", top: 40, left: 75 },
  { id: "S-206", floor: 2, zone: "E", type: "table", name: "세미나 라운드 테이블 206", top: 70, left: 75 }
];

// Reservations Database
let reservations = [
  {
    id: "RSV-001",
    floor: 1,
    zone: "B",
    seatId: "S-104",
    seatName: "표준 파티션 데스크 104",
    userName: "홍길동",
    date: "2026-06-30",
    startTime: "09:00",
    endTime: "13:00"
  }
];

// API: Floor Layout (Error 4)
app.get('/api/floors/:id/layout', (req, res) => {
  const { id } = req.params;

  let svgContent = id === '2' ? floor2Svg : floor1Svg;

  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: 2층 레이아웃 요청 시 응답 헤더의 Content-Type을 'image/svg+xml' 대신 
  // 'text/plain'으로 반환하여 브라우저에서 올바른 이미지 자원으로 로드되지 못하고 
  // 깨진 이미지(엑스박스)를 표시하게 유발합니다. 1층은 정상 응답합니다.
  if (id === '2') {
    res.setHeader('Content-Type', 'text/plain');
  } else {
    res.setHeader('Content-Type', 'image/svg+xml');
  }

  res.send(svgContent);
});

// API: Get Seats list
app.get('/api/seats', (req, res) => {
  res.json(seats);
});

// API: Get Reservations (Normal)
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// API: Refresh Reservations (Error 5)
let refreshCount = 0;
app.get('/api/reservations/refresh', (req, res) => {
  refreshCount++;

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 예약 현황 새로고침을 3회 연속 누를 시, 3번째 요청을 강제로 10초(10000ms) 
  // 지연시킨 후 응답하여 클라이언트의 로딩 스피너 애니메이션이 비정상적으로 길게 유지되도록 유도합니다.
  if (refreshCount % 3 === 0) {
    setTimeout(() => {
      res.json(reservations);
    }, 10000);
  } else {
    res.json(reservations);
  }
});

// API: Create Reservation (Error 3)
app.post('/api/reservations', (req, res) => {
  const { floor, zone, seatId, seatName, userName, date, startTime, endTime } = req.body;

  if (!floor || !zone || !seatId || !seatName || !userName || !date || !startTime || !endTime) {
    return res.status(400).json({ error: "필수 예약 파라미터가 누락되었습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 중복 예약을 체크할 때, 동일 시간대에 예약자가 동일한 경우(userName === newUserName)에만
  // 중복으로 판단하게끔 조건문을 잘못 작성하여, 예약자명(userName)이 다르면 동일 좌석/동일 시간대에 
  // 다중 중복 예약이 데이터베이스에 등록되어 충돌을 발생시킵니다.
  const isConflict = reservations.some(r => {
    return r.floor === floor &&
           r.zone === zone &&
           r.seatId === seatId &&
           r.date === date &&
           r.userName === userName && // 버그: 이름이 다른 경우는 체크하지 않음
           ((startTime >= r.startTime && startTime < r.endTime) ||
            (endTime > r.startTime && endTime <= r.endTime) ||
            (startTime <= r.startTime && endTime >= r.endTime));
  });

  if (isConflict) {
    return res.status(400).json({ error: "선택하신 시간대에 해당 좌석은 이미 예약이 완료되었습니다." });
  }

  const newRsv = {
    id: `RSV-${Math.floor(100 + Math.random() * 900)}`,
    floor: Number(floor),
    zone,
    seatId,
    seatName,
    userName,
    date,
    startTime,
    endTime
  };

  reservations.push(newRsv);
  res.status(201).json(newRsv);
});

// API: Amend Reservation (Error 2)
app.put('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, date, seatId } = req.body;

  const rsvIndex = reservations.findIndex(r => r.id === id);
  if (rsvIndex === -1) {
    return res.status(404).json({ error: "예약 내역을 찾을 수 없습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 예약 변경 시 종료 시간이 시작 시간보다 빠른 경우, 입력 유효성 오류(HTTP 400 Bad Request) 대신
  // 서버가 내부 스택 오버플로우나 예외를 만난 것처럼 속이기 위해 HTTP 500 에러를 던져 예외 흐름을 오염시킵니다.
  if (startTime >= endTime) {
    return res.status(500).json({ 
      error: "Internal Server Error: ClassCastException - time range evaluation failed on backend workspace stack." 
    });
  }

  // Update
  reservations[rsvIndex] = {
    ...reservations[rsvIndex],
    startTime,
    endTime,
    date: date || reservations[rsvIndex].date,
    seatId: seatId || reservations[rsvIndex].seatId
  };

  res.json(reservations[rsvIndex]);
});

// API: Delete Reservation
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "예약을 찾을 수 없습니다." });
  }

  reservations.splice(index, 1);
  res.json({ success: true, message: "예약이 취소되었습니다." });
});

app.listen(PORT, () => {
  console.log(`[DeskFlow Backend] Express server running on http://localhost:${PORT}`);
});
