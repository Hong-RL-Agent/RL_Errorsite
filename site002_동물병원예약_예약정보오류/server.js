import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Inlined SVGs for high-fidelity offline graphics (except vet-03 which is broken)
const dogSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23fef3c7"/><circle cx="35" cy="45" r="5" fill="%2378350f"/><circle cx="65" cy="45" r="5" fill="%2378350f"/><path d="M45,60 Q50,65 55,60" stroke="%2378350f" stroke-width="3" fill="none"/><path d="M25,25 Q15,40 30,50" fill="%23d97706"/><path d="M75,25 Q85,40 70,50" fill="%23d97706"/></svg>`;
const catSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23e0f2fe"/><circle cx="35" cy="45" r="5" fill="%230369a1"/><circle cx="65" cy="45" r="5" fill="%230369a1"/><path d="M42,55 Q50,60 58,55" stroke="%230369a1" stroke-width="3" fill="none"/><polygon points="25,25 35,45 20,40" fill="%230284c7"/><polygon points="75,25 65,45 80,40" fill="%230284c7"/></svg>`;
const goldSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23ffedd5"/><circle cx="35" cy="45" r="6" fill="%239a3412"/><circle cx="65" cy="45" r="6" fill="%239a3412"/><path d="M40,62 Q50,68 60,62" stroke="%239a3412" stroke-width="3.5" fill="none"/><path d="M20,30 C20,30 10,60 25,65" fill="%23ea580c"/></svg>`;

const drKimSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="55" fill="%23ccfbf1"/><path d="M20,110 Q60,60 100,110 Z" fill="%230d9488"/><circle cx="60" cy="45" r="22" fill="%23fde047"/><rect x="52" y="70" width="16" height="25" fill="%23ffffff"/><path d="M52,78 H68 M60,70 V86" stroke="%23e11d48" stroke-width="2.5"/></svg>`;
const drParkSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="55" fill="%23dbeafe"/><path d="M20,110 Q60,60 100,110 Z" fill="%232563eb"/><circle cx="60" cy="45" r="22" fill="%23ffedd5"/><rect x="52" y="70" width="16" height="25" fill="%23ffffff"/><path d="M52,78 H68 M60,70 V86" stroke="%23e11d48" stroke-width="2.5"/></svg>`;

// Pet Profiles Database
let pets = [
  { id: "pet-01", name: "초코", type: "강아지", age: "3세", breed: "토이 푸들", icon: dogSvg },
  { id: "pet-02", name: "멜로", type: "고양이", age: "2세", breed: "페르시안", icon: catSvg },
  { id: "pet-03", name: "보리", type: "강아지", age: "5세", breed: "골든 리트리버", icon: goldSvg }
];

// Vets Database
let vets = [
  { 
    id: "vet-01", 
    name: "김민지 원장", 
    specialty: "외과 / 정형외과 전문", 
    bio: "반려동물의 안전한 수술과 빠른 회복을 최우선으로 생각하는 15년 경력의 외과 전문의입니다.",
    image: drKimSvg,
    schedule: {
      "월": ["09:00", "11:00", "14:00"],
      "화": ["10:00", "15:00"],
      "수": ["09:00", "14:00", "16:00"],
      "목": ["11:00", "15:00"],
      "금": ["10:00", "14:00", "16:00"]
    }
  },
  { 
    id: "vet-02", 
    name: "박서준 과장", 
    specialty: "피부과 / 내과 전문", 
    bio: "아토피, 알레르기 등 까다로운 반려동물 피부 질환의 정확한 진단과 세심한 케어를 약속드립니다.",
    image: drParkSvg,
    schedule: {
      "월": ["10:00", "15:00"],
      "화": ["09:00", "11:00", "14:00"],
      "수": ["11:00", "15:00"],
      "목": ["09:00", "14:00", "16:00"],
      "금": ["11:00", "15:00"]
    }
  },
  { 
    id: "vet-03", 
    name: "이지은 부원장", 
    specialty: "고양이 의학 / 예방의학 전문", 
    bio: "예방 접종, 건강 검진 및 예민한 반려묘들을 위한 조용하고 스트레스 없는 특화 진료를 제공합니다.",
    // INTENTIONAL_ERROR
    // CATEGORY: Server
    // DESCRIPTION: vet-03의 프로필 이미지 파일 주소만 존재하지 않는 정적 자원 주소인 '/assets/vets/vet-03-profile.webp'를 
    // 사용하게 하여 서버에서 불러오지 못하고 엑스박스 이미지 깨짐 오류가 나게 합니다.
    image: "/assets/vets/vet-03-profile.webp",
    schedule: {
      "월": ["11:00", "16:00"],
      "화": ["10:00", "14:00"],
      "수": ["10:00", "15:00"],
      "목": ["11:00", "15:00"],
      "금": ["09:00", "14:00"]
    }
  }
];

// In-Memory Reservations Database
let reservations = [
  {
    id: "RES-9801",
    petId: "pet-01",
    petName: "초코",
    vetId: "vet-01",
    vetName: "김민지 원장",
    department: "외과",
    day: "월",
    time: "11:00",
    memo: "슬개골 탈구 예방 접진 및 경과 관찰차 방문합니다."
  }
];

// API: Get Pets list
app.get('/api/pets', (req, res) => {
  res.json(pets);
});

// API: Get Vets list
app.get('/api/vets', (req, res) => {
  res.json(vets);
});

// API: Get Reservations
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// API: Create Reservation
app.post('/api/reservations', (req, res) => {
  const { petId, petName, vetId, vetName, department, day, time, memo } = req.body;

  if (!petId || !petName || !vetId || !vetName || !department || !day || !time) {
    return res.status(400).json({ error: "필수 진료 정보가 입력되지 않았습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 예약 작성 시 메모 내용이 120자를 초과할 때, 클라이언트의 유효성 위반 오류(HTTP 400 Bad Request) 대신
  // 서버 예외 오류(HTTP 500 Internal Server Error) 상태 코드를 응답으로 반환합니다.
  if (memo && memo.length > 120) {
    return res.status(500).json({ 
      error: "Internal Server Error: Input length violates maximum database column width constraints." 
    });
  }

  const newReservation = {
    id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
    petId,
    petName,
    vetId,
    vetName,
    department,
    day,
    time,
    memo: memo || ""
  };

  reservations.push(newReservation);
  res.status(201).json(newReservation);
});

// API: Cancel Reservation
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 예약 취소(삭제) 요청이 왔을 때, 프론트엔드에는 정상 처리(HTTP 200) 결과를 넘겨주지만,
  // 실제 서버의 메모리 데이터베이스(reservations 배열) 내역을 삭제하는 splice/filter 로직을 고의로 생략합니다.
  // 이로 인해 화면에서는 일시적으로 예약이 지워지나, 새로고침 시 데이터가 그대로 남아있게 됩니다.
  const existIndex = reservations.findIndex(r => r.id === id);
  if (existIndex === -1) {
    return res.status(404).json({ error: "해당 진료 예약을 찾을 수 없습니다." });
  }

  // reservations.splice(existIndex, 1); // <-- 의도적으로 주석 처리하여 서버 DB에서 실제 데이터를 삭제하지 않음.

  res.status(200).json({ success: true, message: "예약이 성공적으로 취소되었습니다." });
});

// API: Load Next Week Schedule (Error 5)
// INTENTIONAL_ERROR
// CATEGORY: Network (Backend Delay)
// DESCRIPTION: 다음 주 진료 일정 조회 요청 수신 시, 의도적으로 8초(8000ms) 지연한 뒤 응답하도록 타임아웃 지연을 발생시켜, 
// 프론트엔드의 클라이언트 단 타임아웃 임계값(3초)을 넘겨 에러를 유발합니다.
app.get('/api/vets/schedule/next', (req, res) => {
  setTimeout(() => {
    res.json({
      success: true,
      nextWeekSchedule: {
        "vet-01": { "월": ["10:00"], "화": ["14:00"], "수": ["11:00"] },
        "vet-02": { "화": ["10:00"], "목": ["14:00"], "금": ["11:00"] },
        "vet-03": { "월": ["09:00"], "수": ["14:00"], "목": ["10:00"] }
      }
    });
  }, 8000);
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[PawCare Backend] Express server running on http://localhost:${PORT}`);
});
