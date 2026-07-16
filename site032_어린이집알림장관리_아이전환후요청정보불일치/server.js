import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5032;

app.use(cors());
app.use(express.json());

// Children Database
let children = [
  { id: "child-01", name: "김서우", class: "해바라기반 (5세)", guardian: "김주원", avatar: "/images/avatar-01.png", attendance: "출석 (08:50 등원)", status: "체온: 36.5°C / 식사: 양호" },
  { id: "child-02", name: "박서아", class: "민들레반 (4세)", guardian: "박민호", avatar: "/images/avatar-02.png", attendance: "출석 (09:12 등원)", status: "체온: 36.8°C / 식사: 보통" },
  { id: "child-03", name: "이준우", class: "장미반 (6세)", guardian: "이지아", avatar: "/images/avatar-03.png", attendance: "미등원 (가정 보육)", status: "체온: - / 식사: -" }
];

// Notices Database (12 items)
let notices = [
  { id: "not-01", title: "숲 체험 활동 일지", date: "2026-07-13", text: "오늘은 아이들과 함께 근처 숲 놀이터에 가서 나뭇잎도 줍고 도토리를 보며 자연을 느꼈습니다. 다람쥐 흉내를 내며 아주 즐거워했습니다.", author: "이혜진 교사" },
  { id: "not-02", title: "맛있는 물놀이 활동", date: "2026-07-12", text: "마당에 풀장을 설치하고 물놀이를 진행했습니다. 시원한 물줄기에 깔깔대며 신나게 뛰놀았습니다.", author: "이혜진 교사" },
  { id: "not-03", title: "찰흙 빚기 미술 수업", date: "2026-07-11", text: "손끝 감각 발달을 위해 찰흙으로 좋아하는 동물을 만들어 보았습니다. 준우는 공룡을 아주 멋지게 빚어 칭찬을 받았습니다.", author: "최유리 교사" },
  { id: "not-04", title: "여름 과일 시식회", date: "2026-07-10", text: "수박과 참외를 직접 잘라보며 씨앗을 관찰하고 맛보았습니다. 달콤한 맛에 아이들이 몇 번씩 리필을 요청했답니다.", author: "최유리 교사" },
  { id: "not-05", title: "소방 대피 훈련 수료", date: "2026-07-09", text: "사이렌 소리에 맞춰 안전하게 코와 입을 막고 마당으로 대피하는 소방 안전 모의 훈련을 의젓하게 완수했습니다.", author: "원장 김영희" },
  { id: "not-06", title: "동화책 구연 교실", date: "2026-07-08", text: "구연 동화 선생님이 들려주는 피노키오 이야기를 눈을 반짝이며 들었습니다. 거짓말을 하면 안 된다고 다짐했습니다.", author: "이혜진 교사" },
  { id: "not-07", title: "모래놀이 공원 나들이", date: "2026-07-07", text: "소나무 그늘 모래밭에서 성 쌓기 놀이를 했습니다. 삽과 양동이를 나눠 쓰며 배려하는 태도를 배웠습니다.", author: "이혜진 교사" },
  { id: "not-08", title: "튼튼 악기 합주 놀이", date: "2026-07-06", text: "캐스터네츠와 탬버린을 쿵짝짝 박자에 맞춰 흔들며 미니 음악회를 개최했습니다. 다들 훌륭한 음악가였습니다.", author: "최유리 교사" },
  { id: "not-09", title: "영어 스토리텔링", date: "2026-07-03", text: "원어민 선생님과 알파벳 카드를 활용해 과일 이름을 배우고 챈트 노래를 신나게 불렀습니다.", author: "외국인강사 Jane" },
  { id: "not-10", title: "실내 체육 볼풀 놀이", date: "2026-07-02", text: "볼풀장 속에서 뒹굴고 과녁에 알록달록 볼을 던져 골인시키는 등 전신 대근육 스트레칭 체육 놀이를 했습니다.", author: "체육강사 박진우" },
  { id: "not-11", title: "새싹 채소 씨앗 심기", date: "2026-07-01", text: "화분에 직접 흙을 담고 새싹 무 씨앗을 심은 후 물을 주었습니다. 무럭무럭 자라길 기대하는 마음을 가졌습니다.", author: "최유리 교사" },
  { id: "not-12", title: "쿠킹클래스: 꼬마김밥", date: "2026-06-30", text: "고소한 참기름 냄새를 맡으며 단무지와 당근을 올리고 김밥을 돌돌 말아 스스로 맛있는 간식을 완성했습니다.", author: "원장 김영희" }
];

// Messages Database
let messages = [
  { id: "msg-01", text: "서우 오늘 낮잠 시간에 평소보다 깊게 자지 못하고 자주 깼습니다. 가정에서 컨디션 확인해주세요.", time: "14:20", unread: true },
  { id: "msg-02", title: "가정통신 안내", text: "다음 주 목요일 야외 숲 체험 학습 동의서가 아직 제출되지 않았습니다. 서둘러 확인 회신 부탁드립니다.", time: "11:00", unread: true },
  { id: "msg-03", text: "서아 오늘 급식으로 나온 불고기를 아주 맛있게 먹었습니다. 반찬 골고루 먹었어요.", time: "13:10", unread: true }
];

// Separate counter for unread messages (Error 3 Target)
let unreadCount = 3;

// Medication Request database
let medications = [
  { id: "med-01", childId: "child-01", childName: "김서우", medicine: "감기 해열제 (시럽)", dosage: "5cc", time: "식후 30분", details: "보관 온도: 실온 보관 요망" }
];

// Calendar Events Database
let calendarEvents = [
  { id: "evt-01", date: "2026-07-13", title: "숲 체험 활동", completed: false, supplies: "돗자리, 개인 물병, 운동화 착용" },
  { id: "evt-02", date: "2026-07-16", title: "7월 생일 파티", completed: false, supplies: "개인 간식 기부 (자율)" },
  { id: "evt-03", date: "2026-07-22", title: "물놀이 실내 수영장 견학", completed: false, supplies: "수영복, 아쿠아슈즈, 래시가드" }
];

// API: Get children profiles
app.get('/api/children', (req, res) => {
  res.json(children);
});

// API: Get notices
app.get('/api/notices', (req, res) => {
  res.json(notices);
});

// API: Get messages & unread count
app.get('/api/messages', (req, res) => {
  res.json({ messages, unreadCount });
});

// API: Add teacher message
app.post('/api/messages', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "메시지 내용을 입력하세요." });

  const newMsg = {
    id: `msg-${Date.now()}`,
    text,
    time: "방금 전",
    unread: false
  };

  messages.push(newMsg);
  res.status(201).json(newMsg);
});

// API: Delete message (Error 3)
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;

  const targetMsg = messages.find(m => m.id === id);
  if (!targetMsg) {
    return res.status(404).json({ error: "메시지를 찾을 수 없습니다." });
  }

  messages = messages.filter(m => m.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 선생님 메시지를 삭제 처리(messages에서 삭제)해도, 
  // 읽지 않은 메시지 갯수를 추적하는 전역 변수(unreadCount)를 차감하지 않고 
  // 그대로 두어 알림 배지의 미독 카운트 숫자가 영구 누수 고착되는 오류를 발생시킵니다.
  // 원래 진행되어야 하는 동기화 로직 누락:
  // if (targetMsg.unread) { unreadCount = Math.max(0, unreadCount - 1); }

  res.json({ success: true, messages, unreadCount });
});

// API: Post medication request (Error 2)
app.post('/api/medication', (req, res) => {
  const { childId, childName, medicine, dosage, time, details } = req.body;

  if (!childId || !medicine || dosage === undefined) {
    return res.status(400).json({ error: "필수 입력 항목(아이 ID, 약물명, 투약량)이 유실되었습니다." });
  }

  const dosageNum = Number(dosage);

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 투약 요청서 등록 시 투약량에 0을 입력해 발송하는 경우, 
  // 입력값 누락 경고(400) 대신 백엔드 비즈니스 연산 나눗셈 에러를 가장하여 HTTP 500 상태 코드를 반환합니다.
  if (dosageNum === 0) {
    return res.status(500).json({
      error: "Internal Server Error: MedicalDosageZeroDivisionException - Division by zero during medication dosage unit conversion step."
    });
  }

  const newRequest = {
    id: `med-${Date.now()}`,
    childId,
    childName: childName || "확인 불가",
    medicine,
    dosage: `${dosage}cc`,
    time: time || "식후 30분",
    details: details || "특이사항 없음"
  };

  medications.unshift(newRequest);
  res.status(201).json(newRequest);
});

// API: Get medication list
app.get('/api/medications', (req, res) => {
  res.json(medications);
});

// API: Get events
app.get('/api/events', (req, res) => {
  res.json(calendarEvents);
});

// Mock SVG avatars generator
app.get('/images/:filename', (req, res) => {
  const { filename } = req.params;
  res.setHeader('Content-Type', 'image/svg+xml');

  const color = filename.includes('01') ? '#f43f5e' : filename.includes('02') ? '#fbbf24' : '#10b981';
  const label = filename.includes('01') ? 'Seowoo' : filename.includes('02') ? 'Seoa' : 'Junwoo';

  return res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="${color}" opacity="0.8"/>
      <circle cx="20" cy="15" r="7" fill="#fff"/>
      <path d="M8,32 C8,26 13,24 20,24 C27,24 32,26 32,32 Z" fill="#fff"/>
      <text x="20" y="38" font-family="sans-serif" font-size="5" fill="#1e293b" text-anchor="middle" font-weight="bold">${label}</text>
    </svg>
  `);
});

app.listen(PORT, () => {
  console.log(`[LittleDay Backend] Express server running on http://localhost:${PORT}`);
});
