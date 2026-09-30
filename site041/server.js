import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const PORT = 9940;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

// Mock Data
let pets = [
  {
    id: 'pet-01',
    name: '초코',
    type: '강아지',
    breed: '골든 리트리버',
    age: '3살',
    weight: '28kg',
    gender: '남아 (중성화 완료)',
    personality: '온순하고 사람과 다른 친구들을 매우 좋아함',
    vaccinated: true,
    specialNotes: '실외 배변 필수, 하루 2회 40분 산책 권장',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'pet-02',
    name: '루루',
    type: '고양이',
    breed: '코리안 숏헤어',
    age: '2살',
    weight: '4.5kg',
    gender: '여아 (중성화 완료)',
    personality: '호기심 많고 낚싯대 장난감을 매우 좋아함',
    vaccinated: true,
    specialNotes: '츄르 간식 하루 1개 제한, 낯선 소리에 조금 민감함',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80'
  }
];

let services = [
  {
    id: 'srv-01',
    title: '강남구 전문 1:1 안심 맞춤 산책 돌봄',
    providerName: '김민지 펫시터',
    providerTitle: '반려견 행동전문가 1급',
    category: '산책',
    tags: ['#산책', '#대형견가능', '#실외배변', '#사진실시간전송'],
    location: '서울 강남구 / 서초구',
    price: 25000,
    unit: '1시간 기준',
    rating: 4.95,
    reviewsCount: 128,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80',
    description: '전문 훈련사 자격을 보유한 펫시터가 소중한 반려견의 스트레스를 해소하고 안전한 산책을 책임집니다.'
  },
  {
    id: 'srv-02',
    title: '아늑한 가정집 24시간 VIP 방문/위탁 돌봄',
    providerName: '박서연 시터',
    providerTitle: '프로 펫시터 4년차',
    category: '돌봄',
    tags: ['#방문탁묘', '#가정집돌봄', '#소형견', '#노령견케어'],
    location: '서울 송파구 / 강동구',
    price: 45000,
    unit: '1일 기준',
    rating: 4.98,
    reviewsCount: 215,
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
    description: '단독 주택 1층 잔디 마당 보유! 스트레스 없는 편안한 휴식과 케어를 보장합니다.'
  },
  {
    id: 'srv-03',
    title: '프리미엄 힐링 펫스파 & 저자극 안심 미용',
    providerName: '정우진 그루머',
    providerTitle: '반려동물 미용 기능장',
    category: '미용',
    tags: ['#탄산스파', '#가위컷전문', '#스트레스최소화', '#위생미용'],
    location: '서울 마포구 / 용산구',
    price: 60000,
    unit: '목욕+스파 패키지',
    rating: 4.88,
    reviewsCount: 94,
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80',
    description: '유기농 저자극 천연 샴푸와 탄산 스파로 피부 케어와 피로 회복을 동시에 선사합니다.'
  },
  {
    id: 'srv-04',
    title: '냥이 전용 안심 방문 케어 (탁묘/화장실청소/놀이)',
    providerName: '이지은 시터',
    providerTitle: '고양이 전문 케어러',
    category: '돌봄',
    tags: ['#탁묘', '#고양이전용', '#화장실청소', '#사료배식'],
    location: '서울 전지역',
    price: 30000,
    unit: '1회 방문 (50분)',
    rating: 5.0,
    reviewsCount: 162,
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80',
    description: '영역 동물인 고양이가 스트레스 받지 않도록 집으로 직접 방문하여 세심하게 보살펴 드립니다.'
  }
];

let reservations = [
  {
    id: 'RES-20260920-01',
    serviceId: 'srv-01',
    serviceTitle: '강남구 전문 1:1 안심 맞춤 산책 돌봄',
    providerName: '김민지 펫시터',
    petName: '초코',
    date: '2026-09-28',
    time: '14:00',
    status: 'CONFIRMED', // PENDING, CONFIRMED, COMPLETED, CANCELLED
    price: 25000,
    memo: '간식은 가방 안 닭가슴살 트릿만 부탁드립니다.',
    deliveryMemo: '문 앞에 리드줄과 배변봉투를 걸어두겠습니다.'
  }
];

let messages = [
  {
    id: 'msg-1',
    sender: '김민지 펫시터',
    text: '안녕하세요 보호자님! 28일 오후 2시 초코 산책 예약 확인했습니다. 날씨가 맑아 공원 산책하기 딱 좋을 것 같아요 😊',
    time: '10:30 AM',
    isMe: false
  },
  {
    id: 'msg-2',
    sender: '나',
    text: '감사합니다 시터님! 당일 초코 컨디션 좋으면 넉넉하게 산책 부탁드려요.',
    time: '10:45 AM',
    isMe: true
  }
];

let notifications = [
  { id: 'notif-1', title: '예약 확정 안내', message: '2026-09-28 14:00 초코 산책 예약이 확정되었습니다.', date: '2026-09-24', read: false },
  { id: 'notif-2', title: '건강검진 리마인더', message: '루루의 정기 구충제 복용일이 3일 남았습니다.', date: '2026-09-25', read: true }
];

let calendarEvents = [
  { id: 'cal-1', title: '초코 정기 심장사상충 예방약 복용', date: '2026-09-27', type: 'health' },
  { id: 'cal-2', title: '초코 1:1 맞춤 안심 산책 예약', date: '2026-09-28', type: 'reservation' },
  { id: 'cal-3', title: '루루 종합 백신 3차 접종일', date: '2026-10-05', type: 'health' }
];

let activityReports = [
  { id: 'act-1', date: '2026-09-25', petName: '초코', type: '산책', duration: '45분', distance: '2.8km', notes: '공원 잔디밭에서 친구들과 인사하고 배변 2회 성공' },
  { id: 'act-2', date: '2026-09-24', petName: '루루', type: '사냥놀이', duration: '30분', distance: '-', notes: '오뎅꼬치 장난감에 반응 매우 활발함' }
];

let wishlist = ['srv-01', 'srv-03'];

// -------------------------------------------------------------
// SEC-381 ~ SEC-390 Error Implementations (Async-No-Feedback)
// -------------------------------------------------------------

// Helper to simulate long pending response (> 0.6s fixed deadline, e.g. 5000ms)
const asyncPendingDelay = (ms = 4000) => new Promise(resolve => setTimeout(resolve, ms));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PawMate', port: PORT });
});

// Pets API
app.get('/api/pets', (req, res) => {
  res.json({ pets });
});

// INTENTIONAL BACKEND BUG: site041-SEC-388
// Async-no-feedback on Pet Profile Note / Bio update
app.patch('/api/pets/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { specialNotes, personality } = req.body;
  const pet = pets.find(p => p.id === id);
  if (!pet) return res.status(404).json({ error: '반려동물을 찾을 수 없습니다.' });

  // Simulate long pending without feedback
  await asyncPendingDelay(4000);

  if (specialNotes !== undefined) pet.specialNotes = specialNotes;
  if (personality !== undefined) pet.personality = personality;

  res.setHeader('X-Bug-Triggered', 'site041-SEC-388');
  res.json({
    success: true,
    pet,
    _bug: {
      bugId: 'site041-SEC-388',
      secId: 'SEC-388',
      type: '비동기 pending 피드백 부재 (반려동물 특이사항 메모)',
      message: '반려동물 특이사항 저장 요청이 장시간 pending 상태로 지속되었으며 로딩/취소 피드백이 제공되지 않았습니다.'
    }
  });
});

// Services API
app.get('/api/services', (req, res) => {
  const { category, search, tag } = req.query;
  let result = [...services];

  if (category && category !== 'all') {
    result = result.filter(s => s.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(s => s.title.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.providerName.toLowerCase().includes(q));
  }
  if (tag) {
    result = result.filter(s => s.tags.includes(tag));
  }

  res.json({ services: result });
});

app.get('/api/services/:id', (req, res) => {
  const srv = services.find(s => s.id === req.params.id);
  if (!srv) return res.status(404).json({ error: '서비스를 찾을 수 없습니다.' });
  res.json({ service: srv });
});

// INTENTIONAL BACKEND BUG: site041-SEC-381
// Async-no-feedback on Tag Input registration/filtering
app.post('/api/tags/apply', async (req, res) => {
  const { tag } = req.body;
  
  // Pending delay
  await asyncPendingDelay(4000);

  res.setHeader('X-Bug-Triggered', 'site041-SEC-381');
  res.json({
    success: true,
    tag,
    _bug: {
      bugId: 'site041-SEC-381',
      secId: 'SEC-381',
      type: '비동기 pending 피드백 부재 (태그 입력)',
      message: '태그 적용/등록 요청이 고정 deadline(0.6초) 이상 pending 상태로 지연되었으며 UI 피드백이 부재했습니다.'
    }
  });
});

// INTENTIONAL BACKEND BUG: site041-SEC-385
// Async-no-feedback on Search Suggestions
app.get('/api/search/suggestions', async (req, res) => {
  const { q } = req.query;

  // Pending delay
  await asyncPendingDelay(4000);

  const suggestions = [
    `${q} 전문 펫시터`,
    `${q} 1:1 맞춤 케어`,
    `${q} 가능한 안심 돌봄`,
    `${q} 후기 좋은 곳`
  ];

  res.setHeader('X-Bug-Triggered', 'site041-SEC-385');
  res.json({
    suggestions,
    _bug: {
      bugId: 'site041-SEC-385',
      secId: 'SEC-385',
      type: '비동기 pending 피드백 부재 (검색 제안)',
      message: '검색 제안 자동완성 API 요청이 장시간 pending 상태로 유지되며 진행 피드백이 제공되지 않았습니다.'
    }
  });
});

// Reservations API
app.get('/api/reservations', (req, res) => {
  res.json({ reservations });
});

app.post('/api/reservations', (req, res) => {
  const { serviceId, petName, date, time, memo, deliveryMemo } = req.body;
  const srv = services.find(s => s.id === serviceId) || services[0];

  const newRes = {
    id: `RES-${Date.now().toString().slice(-8)}`,
    serviceId: srv.id,
    serviceTitle: srv.title,
    providerName: srv.providerName,
    petName: petName || '초코',
    date: date || new Date().toISOString().slice(0, 10),
    time: time || '14:00',
    status: 'CONFIRMED',
    price: srv.price,
    memo: memo || '',
    deliveryMemo: deliveryMemo || ''
  };

  reservations.unshift(newRes);
  res.json({ success: true, reservation: newRes });
});

// INTENTIONAL BACKEND BUG: site041-SEC-383
// Async-no-feedback on Delivery Memo
app.patch('/api/reservations/:id/delivery-memo', async (req, res) => {
  const { id } = req.params;
  const { deliveryMemo } = req.body;
  const resv = reservations.find(r => r.id === id);

  // Pending delay
  await asyncPendingDelay(4000);

  if (resv) resv.deliveryMemo = deliveryMemo;

  res.setHeader('X-Bug-Triggered', 'site041-SEC-383');
  res.json({
    success: true,
    deliveryMemo,
    _bug: {
      bugId: 'site041-SEC-383',
      secId: 'SEC-383',
      type: '비동기 pending 피드백 부재 (배송/용품 메모)',
      message: '배송 및 용품 관련 메모 저장 요청이 0.6초 이상 지연되었으며 로딩/취소 경로가 제공되지 않았습니다.'
    }
  });
});

// INTENTIONAL BACKEND BUG: site041-SEC-384
// Async-no-feedback on Refund/Cancellation Reason
app.post('/api/reservations/:id/refund-reason', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const resv = reservations.find(r => r.id === id);

  // Pending delay
  await asyncPendingDelay(4000);

  if (resv) resv.status = 'CANCELLED';

  res.setHeader('X-Bug-Triggered', 'site041-SEC-384');
  res.json({
    success: true,
    reason,
    reservation: resv,
    _bug: {
      bugId: 'site041-SEC-384',
      secId: 'SEC-384',
      type: '비동기 pending 피드백 부재 (환불/취소 사유)',
      message: '예약 취소 및 환불 사유 제출 요청이 pending 상태로 지속되었으며 진행 상태 피드백이 누락되었습니다.'
    }
  });
});

// INTENTIONAL BACKEND BUG: site041-SEC-382
// Async-no-feedback on Invitation Message
app.post('/api/invitations', async (req, res) => {
  const { email, inviteMessage, role } = req.body;

  // Pending delay
  await asyncPendingDelay(4000);

  res.setHeader('X-Bug-Triggered', 'site041-SEC-382');
  res.json({
    success: true,
    email,
    _bug: {
      bugId: 'site041-SEC-382',
      secId: 'SEC-382',
      type: '비동기 pending 피드백 부재 (초대 메시지)',
      message: '공동 돌봄 초대 메시지 발송 요청이 pending 상태로 장시간 지연되었으며 UI 상태 표시가 부재했습니다.'
    }
  });
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  res.json({ notifications });
});

// INTENTIONAL BACKEND BUG: site041-SEC-386
// Async-no-feedback on Notification Title
app.post('/api/notifications', async (req, res) => {
  const { title, message, date } = req.body;

  // Pending delay
  await asyncPendingDelay(4000);

  const newNotif = {
    id: `notif-${Date.now()}`,
    title: title || '새 알림',
    message: message || '일정 확인 바랍니다.',
    date: date || new Date().toISOString().slice(0, 10),
    read: false
  };

  notifications.unshift(newNotif);

  res.setHeader('X-Bug-Triggered', 'site041-SEC-386');
  res.json({
    success: true,
    notification: newNotif,
    _bug: {
      bugId: 'site041-SEC-386',
      secId: 'SEC-386',
      type: '비동기 pending 피드백 부재 (알림 제목 등록)',
      message: '일정 알림 생성 요청이 고정 deadline 초과로 pending 상태를 유지하였으며 로딩 인디케이터가 누락되었습니다.'
    }
  });
});

// Calendar API
app.get('/api/calendar/events', (req, res) => {
  res.json({ events: calendarEvents });
});

// INTENTIONAL BACKEND BUG: site041-SEC-387
// Async-no-feedback on Calendar Title
app.post('/api/calendar/events', async (req, res) => {
  const { title, date, type } = req.body;

  // Pending delay
  await asyncPendingDelay(4000);

  const newEvent = {
    id: `cal-${Date.now()}`,
    title: title || '새 일정',
    date: date || new Date().toISOString().slice(0, 10),
    type: type || 'custom'
  };

  calendarEvents.push(newEvent);

  res.setHeader('X-Bug-Triggered', 'site041-SEC-387');
  res.json({
    success: true,
    event: newEvent,
    _bug: {
      bugId: 'site041-SEC-387',
      secId: 'SEC-387',
      type: '비동기 pending 피드백 부재 (캘린더 이벤트 제목)',
      message: '캘린더 일정 추가 요청이 장시간 pending 상태로 지연되었으며 취소/로딩 피드백이 제공되지 않았습니다.'
    }
  });
});

// Activity Report & CSV Upload API
app.get('/api/activity/reports', (req, res) => {
  res.json({ reports: activityReports });
});

// INTENTIONAL BACKEND BUG: site041-SEC-389
// Async-no-feedback on Activity Report Note / CSV Upload
app.post('/api/activity/csv', async (req, res) => {
  const { csvContent, reportNote } = req.body;

  // Pending delay
  await asyncPendingDelay(4000);

  const newReport = {
    id: `act-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    petName: '초코',
    type: '기록 업로드',
    duration: 'CSV 연동',
    distance: '-',
    notes: reportNote || 'CSV 파일 활동 데이터 동기화 완료'
  };

  activityReports.unshift(newReport);

  res.setHeader('X-Bug-Triggered', 'site041-SEC-389');
  res.json({
    success: true,
    report: newReport,
    _bug: {
      bugId: 'site041-SEC-389',
      secId: 'SEC-389',
      type: '비동기 pending 피드백 부재 (활동 기록/CSV 업로드)',
      message: 'CSV 형식 반려동물 기록 업로드 요청이 장시간 pending 상태로 지속되었으며 진행 피드백이 부재했습니다.'
    }
  });
});

// Messages API
app.get('/api/messages', (req, res) => {
  res.json({ messages });
});

// INTENTIONAL BACKEND BUG: site041-SEC-390
// Async-no-feedback on Message Sending
app.post('/api/messages', async (req, res) => {
  const { text } = req.body;

  // Pending delay
  await asyncPendingDelay(4000);

  const newMsg = {
    id: `msg-${Date.now()}`,
    sender: '나',
    text: text || '메시지',
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    isMe: true
  };

  messages.push(newMsg);

  res.setHeader('X-Bug-Triggered', 'site041-SEC-390');
  res.json({
    success: true,
    message: newMsg,
    _bug: {
      bugId: 'site041-SEC-390',
      secId: 'SEC-390',
      type: '비동기 pending 피드백 부재 (메시지 전송)',
      message: '펫시터 1:1 대화 메시지 전송 요청이 고정 deadline을 초과하여 pending 상태로 유지되었습니다.'
    }
  });
});

// Wishlist API
app.get('/api/wishlist', (req, res) => {
  const wishServices = services.filter(s => wishlist.includes(s.id));
  res.json({ wishlist: wishServices, ids: wishlist });
});

app.post('/api/wishlist/:id', (req, res) => {
  const { id } = req.params;
  if (!wishlist.includes(id)) wishlist.push(id);
  res.json({ success: true, ids: wishlist });
});

app.delete('/api/wishlist/:id', (req, res) => {
  const { id } = req.params;
  wishlist = wishlist.filter(item => item !== id);
  res.json({ success: true, ids: wishlist });
});

// Serve frontend dist build if available
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`PawMate Pet Care & Reservation Platform running at http://localhost:${PORT}`);
});
