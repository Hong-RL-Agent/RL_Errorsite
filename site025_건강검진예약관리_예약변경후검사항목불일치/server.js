import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5024;

app.use(cors());
app.use(express.json());

// Checkup Packages Database (4 items)
let packages = [
  { id: "pkg-01", name: "스마트 기초 실속 검진", price: 190000, type: "기초", items: ["신체계측 및 비만도", "기초혈액검사 20종", "소변 검사", "흉부방사선 촬영", "심전도 검사"] },
  { id: "pkg-02", name: "소화기 정밀 종합 검진", price: 380000, type: "정밀", items: ["기초 검진 일체", "위 내시경 (수면 포함)", "복부 초음파 (간/담낭)", "대장 잠혈 검사", "동맥경화 진단"] },
  { id: "pkg-03", name: "시니어 실버 특화 검진", price: 650000, type: "특화", items: ["위 내시경 (수면 포함)", "뇌 CT 촬영 (무조영)", "골밀도 검사", "경동맥 초음파", "종양표지자 암 검사 5종"] },
  { id: "pkg-04", name: "여성 안심 정밀 검진", price: 420000, type: "특화", items: ["유방 촬영 장비 검진", "자궁경부세포 액상 검사", "갑상선 초음파", "위 내시경 (수면 포함)", "여성 호르몬 정밀 검사"] }
];

// Bookings database
let bookings = [
  {
    id: "book-1",
    packageId: "pkg-01",
    branch: "서울 마포 본원",
    date: "2026-08-10",
    time: "09:00",
    questionnaire: {
      name: "홍길동",
      height: 175,
      weight: 70,
      isDrinking: false,
      isSmoking: false
    }
  }
];

// API: Get checkup packages
app.get('/api/checkup/packages', (req, res) => {
  res.json(packages);
});

// API: Get bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// API: Create booking (Error 2)
app.post('/api/bookings', (req, res) => {
  const { packageId, branch, date, time, name, height, weight, isDrinking, isSmoking } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 문진표에 기입한 키(Height) 수치 입력값이 0인 경우, 
  // 일반적인 입력값 검증 필터링(HTTP 400) 대신에 나누기 오류(Division by Zero)를 모사한 
  // HTTP 500 Internal Server Error 상태 코드를 인위적으로 반환합니다.
  if (height === 0 || Number(height) === 0) {
    return res.status(500).json({
      error: "Internal Server Error: MedicalQuestionnaireHeightZeroException - Subject height metric is division-by-zero target."
    });
  }

  if (!packageId || !branch || !date || !time || !name) {
    return res.status(400).json({ error: "검진 상품, 검진 지점, 예약 일시 및 작성자 이름은 필수 항목입니다." });
  }

  const newBooking = {
    id: `book-${Date.now()}`,
    packageId,
    branch,
    date,
    time,
    questionnaire: {
      name,
      height: Number(height),
      weight: Number(weight),
      isDrinking: !!isDrinking,
      isSmoking: !!isSmoking
    }
  };

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// API: Delete booking (Error 3)
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 예약 취소 요청을 받을 때, 백엔드 데이터베이스(bookings)에서 
  // 해당 예약 목록 레코드를 실제로 지우거나 제거하지 않고 성공 응답만 강제 반환합니다.
  // 이로 인해 유저는 브라우저 메모리상에서만 항목이 일시 삭제된 것으로 보이지만 
  // 새로고침하면 서버 데이터가 다시 패치되어 예약이 복구되는 데이터 보존 결함이 일어납니다.
  // 원래 진행되어야 하는 원본 데이터 삭제 코드 누락:
  // bookings = bookings.filter(b => b.id !== id);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[HealthCheck Backend] Express server running on http://localhost:${PORT}`);
});
