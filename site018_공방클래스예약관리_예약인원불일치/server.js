import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5017;

app.use(cors());
app.use(express.json());

// Classes database
let classes = [
  { id: "class-01", title: "감성 물레 도자기 클래스", category: "도자기", basePrice: 45000, instructors: ["inst-01", "inst-02"], materials: ["mat-clay-standard", "mat-clay-premium"], description: "흙을 만지며 마음의 평화를 찾는 클래식 물레 성형 입문 코스." },
  { id: "class-02", title: "천연 가죽 에어팟 케이스 제작", category: "가죽", basePrice: 38000, instructors: ["inst-03"], materials: ["mat-leather-standard", "mat-leather-premium"], description: "이탈리아 고급 가죽을 사용해 나만의 가죽 케이스를 조각 스티치하는 공예." },
  { id: "class-03", title: "시그니처 향수 조향 랩", category: "향수", basePrice: 50000, instructors: ["inst-04"], materials: ["mat-scent-standard", "mat-scent-premium"], description: "수십 종류의 에센셜 오일을 시향하며 본인의 페르소나 향수를 완성하는 코스." }
];

// Instructors database
let instructors = [
  { id: "inst-01", name: "김도예 마스터", specialty: "물레 성형 및 청자 재현" },
  { id: "inst-02", name: "이도자기 실장", specialty: "생활 자기 및 핸드페인팅" },
  { id: "inst-03", name: "박가죽 작가", specialty: "이탈리아 새들 스티치 정교 가죽 공예" },
  { id: "inst-04", name: "최조향 실장", specialty: "니치 향수 및 아로마 테라피 블렌딩" }
];

// Materials database
let materials = [
  { id: "mat-clay-standard", name: "일반 백자토 식기 세트", price: 5000, hex: "#e2e8f0" },
  { id: "mat-clay-premium", name: "프리미엄 산백토 & 천연유약 세트", price: 15000, hex: "#d97706" },
  { id: "mat-leather-standard", name: "일반 가죽 & 실 세트", price: 8000, hex: "#b45309" },
  { id: "mat-leather-premium", name: "최고급 천연 베지터블 가죽 패키지", price: 22000, hex: "#78350f" },
  { id: "mat-scent-standard", name: "일반 조향 베이스 오일", price: 10000, hex: "#a7f3d0" },
  { id: "mat-scent-premium", name: "프리미엄 로즈 에센셜 고농축 오일", price: 25000, hex: "#ec4899" }
];

// Capacity time slots database
let slots = {
  "2026-07-20 14:00": { remainingCapacity: 5 },
  "2026-07-20 16:00": { remainingCapacity: 4 },
  "2026-07-21 14:00": { remainingCapacity: 6 },
  "2026-07-21 16:00": { remainingCapacity: 3 }
};

// Bookings database
let bookings = [
  { id: "book-1", name: "김공예", classId: "class-01", instructorId: "inst-01", dateTime: "2026-07-20 14:00", materialOption: "mat-clay-standard", attendees: 2, totalCost: 100000 }
];

// API: Get classes
app.get('/api/classes', (req, res) => {
  res.json(classes);
});

// API: Get instructors
app.get('/api/instructors', (req, res) => {
  res.json(instructors);
});

// API: Get materials
app.get('/api/materials', (req, res) => {
  res.json(materials);
});

// API: Get bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// API: Create booking (Error 3)
app.post('/api/bookings', (req, res) => {
  const { name, classId, instructorId, dateTime, materialOption, attendees, totalCost } = req.body;

  if (!name || !classId || !dateTime) {
    return res.status(400).json({ error: "예약자 성명, 수업 및 예약 일시는 필수 입력값입니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 예약자명이 '공방테스트'이며 선택한 공방 클래스가 '도자기 수업'(class-01)인 경우,
  // 일반적인 검증 오류(400 Bad Request)를 돌려주는 대신에 데이터베이스 락 충돌 상황을 모사한 
  // HTTP 500 Internal Server Error 상태 코드를 전송하여 예외 크래시를 유발합니다.
  if (name === '공방테스트' && classId === 'class-01') {
    return res.status(500).json({
      error: "Internal Server Error: ClassEnrollmentLockException - Workshop resource lock conflict for test user."
    });
  }

  // Check capacity
  if (slots[dateTime]) {
    if (slots[dateTime].remainingCapacity < attendees) {
      return res.status(400).json({ error: "해당 시간대에 예약 인원이 초과되었습니다." });
    }
    slots[dateTime].remainingCapacity -= attendees;
  }

  const newBooking = {
    id: `book-${Date.now()}`,
    name,
    classId,
    instructorId,
    dateTime,
    materialOption,
    attendees: Number(attendees),
    totalCost: Number(totalCost)
  };

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// API: Update booking (Error 4)
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { dateTime: newDateTime, name, attendees, materialOption, instructorId } = req.body;

  const bookingIndex = bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: "예약 이력을 찾을 수 없습니다." });
  }

  const oldBooking = bookings[bookingIndex];
  const oldDateTime = oldBooking.dateTime;

  // Subtract new slot capacity
  if (slots[newDateTime]) {
    slots[newDateTime].remainingCapacity -= Number(attendees);
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 예약 변경으로 인해 시간대(dateTime)가 변경되었을 때, 
  // 기존에 선점해 두었던 시간대(oldDateTime)의 예약 가능 정원 수(remainingCapacity)를 복원해 주는 처리를 
  // 의도적으로 생략합니다. 이로써 취소된 시간대의 잔여 정원이 복구되지 않는 데이터 정합성 결함이 일어납니다.
  // 원래 복원해야 하는 아래 코드를 스킵합니다:
  // if (slots[oldDateTime]) {
  //   slots[oldDateTime].remainingCapacity += Number(oldBooking.attendees);
  // }

  bookings[bookingIndex] = {
    ...oldBooking,
    name,
    dateTime: newDateTime,
    attendees: Number(attendees),
    materialOption,
    instructorId
  };

  res.json({ success: true, booking: bookings[bookingIndex] });
});

app.listen(PORT, () => {
  console.log(`[CraftRoom Backend] Express server running on http://localhost:${PORT}`);
});
