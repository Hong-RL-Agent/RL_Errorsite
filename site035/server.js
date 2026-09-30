import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9934;

app.use(cors());
app.use(express.json());

// In-Memory Database
let users = [
  { id: 'usr-001', name: '한소희', email: 'sohee.han@linkday.kr', role: 'participant', region: '서울/마포', interests: ['환경', '동물보호'], totalVolunteerHours: 24, createdAt: '2026-01-10T09:00:00Z' },
  { id: 'usr-002', name: '이준호', email: 'junho.lee@linkday.kr', role: 'participant', region: '서울/종로', interests: ['교육', '문화'], totalVolunteerHours: 12, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'usr-003', name: '푸른마포 환경연대', email: 'mapo.eco@linkday.kr', role: 'organizer', region: '서울/마포', interests: ['환경정화'], totalVolunteerHours: 120, createdAt: '2026-01-05T08:00:00Z' },
  { id: 'usr-004', name: '달빛 동물보호협회', email: 'moonlight.pets@linkday.kr', role: 'organizer', region: '경기/고양', interests: ['유기동물'], totalVolunteerHours: 95, createdAt: '2026-01-08T09:30:00Z' },
  { id: 'usr-005', name: '청년나눔 네트워크', email: 'youth.share@linkday.kr', role: 'organizer', region: '서울/성동', interests: ['교육봉사', '커뮤니티'], totalVolunteerHours: 150, createdAt: '2026-01-01T09:00:00Z' },
  { id: 'usr-006', name: '운영 관리자', email: 'admin@linkday.kr', role: 'admin', region: '서울/중구', interests: ['운영총괄'], totalVolunteerHours: 999, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-007', name: '정해인', email: 'haein.jung@linkday.kr', role: 'participant', region: '서울/용산', interests: ['청년활동'], totalVolunteerHours: 8, createdAt: '2026-02-01T11:00:00Z' },
  { id: 'usr-008', name: '김태리', email: 'taeri.kim@linkday.kr', role: 'participant', region: '서울/서초', interests: ['문화체험'], totalVolunteerHours: 16, createdAt: '2026-02-10T14:00:00Z' }
];

let currentUser = users[0]; // Default logged-in user (한소희)

let events = [
  { id: 'evt-001', organizerId: 'usr-003', title: '한강 망원지구 플로깅 & 친환경 EM 흙공 던지기', category: '환경', description: '봄맞이 한강 수질 개선과 수변 환경 정화를 위한 플로깅 봉사활동', region: '서울/마포', location: '망원한강공원 안내센터 앞', date: '2026-04-12', startTime: '10:00', endTime: '13:00', capacity: 1, currentParticipants: 1, registrationDeadline: '2026-04-10', status: 'open', volunteerHours: 3, image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80', createdAt: '2026-03-01T09:00:00Z' },
  { id: 'evt-002', organizerId: 'usr-004', title: '달빛 유기동물 쉼터 봄맞이 견사 청소 & 교감 산책', category: '동물 보호', description: '유기견 쉼터 청소, 사료 정리 및 산책 봉사활동', region: '경기/고양', location: '달빛쉼터 1센터', date: '2026-04-18', startTime: '13:00', endTime: '17:00', capacity: 10, currentParticipants: 7, registrationDeadline: '2026-04-15', status: 'open', volunteerHours: 4, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80', createdAt: '2026-03-05T10:00:00Z' },
  { id: 'evt-003', organizerId: 'usr-005', title: '성동 청소년 디지털 배움터 1:1 코딩 멘토링', category: '교육', description: '취약계층 청소년을 위한 스크래치 & 웹기초 멘토링 봉사', region: '서울/성동', location: '성동청소년문화센터 3층', date: '2026-04-20', startTime: '14:00', endTime: '17:00', capacity: 8, currentParticipants: 8, registrationDeadline: '2026-04-17', status: 'open', volunteerHours: 3, image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80', createdAt: '2026-03-08T11:00:00Z' },
  { id: 'evt-004', organizerId: 'usr-003', title: '[마감된 행사] 마포 가드닝 묘목 심기 봄 축제 자원봉사', category: '지역 축제', description: '주민참여 도시 숲 조성 묘목 심기 및 부스 안내 (신청 마감)', region: '서울/마포', location: '월드컵공원 평화의광장', date: '2026-03-20', startTime: '09:00', endTime: '13:00', capacity: 15, currentParticipants: 15, registrationDeadline: '2026-03-10', status: 'closed', volunteerHours: 4, image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80', createdAt: '2026-02-15T08:00:00Z' },
  { id: 'evt-005', organizerId: 'usr-005', title: '청년 소셜 임팩트 아이디어톤 & 네트워킹 데이', category: '청년 활동', description: '지역 사회 문제를 해결하는 소셜 벤처 프로젝트 해커톤', region: '서울/성동', location: '헤이그라운드 서울숲점', date: '2026-04-25', startTime: '10:00', endTime: '18:00', capacity: 30, currentParticipants: 18, registrationDeadline: '2026-04-22', status: 'open', volunteerHours: 6, image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=400&q=80', createdAt: '2026-03-10T14:00:00Z' }
];

let registrations = [
  { id: 'reg-1001', eventId: 'evt-001', userId: 'usr-002', status: 'confirmed', appliedAt: '2026-03-15T10:00:00Z', cancelledAt: null, attendanceStatus: 'not_checked', participantCode: 'LINK-8801', createdAt: '2026-03-15T10:00:00Z' },
  { id: 'reg-1002', eventId: 'evt-002', userId: 'usr-001', status: 'confirmed', appliedAt: '2026-03-16T14:00:00Z', cancelledAt: null, attendanceStatus: 'attended', participantCode: 'LINK-8802', createdAt: '2026-03-16T14:00:00Z' },
  { id: 'reg-1003', eventId: 'evt-003', userId: 'usr-001', status: 'cancelled', appliedAt: '2026-03-18T09:00:00Z', cancelledAt: '2026-03-22T11:00:00Z', attendanceStatus: 'not_checked', participantCode: 'LINK-8803', createdAt: '2026-03-18T09:00:00Z' }
];

let waitlists = [
  { id: 'wt-5001', eventId: 'evt-003', userId: 'usr-001', position: 1, status: 'waiting', registeredAt: '2026-03-20T11:00:00Z', promotedAt: null },
  { id: 'wt-5002', eventId: 'evt-003', userId: 'usr-007', position: 2, status: 'waiting', registeredAt: '2026-03-21T15:30:00Z', promotedAt: null }
];

let volunteerRecords = [
  { id: 'vh-001', userId: 'usr-001', eventId: 'evt-002', registrationId: 'reg-1002', hours: 4, type: 'event', reason: '달빛 유기동물 쉼터 봄맞이 견사 청소 참여 인정', createdAt: '2026-03-16T17:30:00Z' }
];

let favorites = [
  { id: 'fav-001', userId: 'usr-001', eventId: 'evt-001' },
  { id: 'fav-002', userId: 'usr-001', eventId: 'evt-005' }
];

let posts = [
  { id: 'post-001', authorId: 'usr-001', authorName: '한소희', title: '지난 주말 망원한강공원 플로깅 다녀왔어요! 🌱', content: '날씨도 따뜻하고 수거한 쓰레기가 10L 가득 찼네요. 다음 주에도 또 참여할 생각입니다.', category: '봉사후기', viewCount: 142, likeCount: 38, createdAt: '2026-03-22T16:00:00Z' },
  { id: 'post-002', authorId: 'usr-003', authorName: '푸른마포 환경연대', title: '4월 친환경 EM 흙공 제작 및 하천 정화 참여 가이드 🌊', content: 'EM 발효 흙공은 수질 정화와 악취 제거에 탁월합니다. 편한 복장과 장화 착용을 권장합니다.', category: '활동공지', viewCount: 210, likeCount: 54, createdAt: '2026-03-20T10:00:00Z' }
];

let reviews = [
  { id: 'rev-001', userId: 'usr-001', eventId: 'evt-002', rating: 5, content: '유기견 아이들이 너무 순하고 봉사 보람이 정말 컸습니다. 추천합니다!', createdAt: '2026-03-17T10:00:00Z' }
];

// ==========================================
// 1. Health Endpoint
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    siteId: 'site035',
    service: 'LinkDay Local Events & Volunteer Matching Platform'
  });
});

// ==========================================
// 2. Auth & Switching
// ==========================================
app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, data: currentUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email) || users[0];
  currentUser = user;
  res.json({ success: true, message: '로그인되었습니다.', data: currentUser });
});

app.post('/api/auth/switch', (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    currentUser = user;
    res.json({ success: true, data: currentUser });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// ==========================================
// 3. Events Endpoints (SEC-361 & SEC-363)
// ==========================================
app.get('/api/events', (req, res) => {
  const { category, region, search } = req.query;
  let filtered = [...events];
  if (category && category !== '전체') filtered = filtered.filter(e => e.category === category);
  if (region && region !== '전체') filtered = filtered.filter(e => e.region.includes(region));
  if (search) filtered = filtered.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
  res.json({ success: true, data: filtered });
});

app.get('/api/events/:eventId', (req, res) => {
  const evt = events.find(e => e.id === req.params.eventId);
  if (!evt) return res.status(404).json({ success: false, message: 'Event not found' });
  const organizer = users.find(u => u.id === evt.organizerId);
  const evtRegs = registrations.filter(r => r.eventId === evt.id && r.status === 'confirmed');
  res.json({ success: true, data: { ...evt, organizer, participantsCount: evtRegs.length } });
});

// INTENTIONAL BACKEND BUG: site035-bug01 (SEC-361) & site035-bug03 (SEC-363)
// Event capacity validation and registration processing are intentionally non-atomic.
// Registration deadline validation is intentionally incomplete on the application path.
app.post('/api/events/:eventId/apply', async (req, res) => {
  const evt = events.find(e => e.id === req.params.eventId);
  if (!evt) return res.status(404).json({ success: false, message: 'Event not found' });

  // SEC-363 Bug: No check if new Date() > new Date(evt.registrationDeadline) or evt.status === 'closed'

  // SEC-361 Bug: Capacity limit check is non-atomic and not enforced with lock
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulating race condition window

  evt.currentParticipants += 1;

  const newReg = {
    id: `reg-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    eventId: evt.id,
    userId: currentUser.id,
    status: 'confirmed',
    appliedAt: new Date().toISOString(),
    cancelledAt: null,
    attendanceStatus: 'not_checked',
    participantCode: `LINK-${Math.floor(Math.random()*9000 + 1000)}`,
    createdAt: new Date().toISOString()
  };

  registrations.unshift(newReg);

  res.json({
    success: true,
    message: '행사 참가 신청이 성공적으로 확정되었습니다.',
    data: { registration: newReg, event: evt }
  });
});

app.post('/api/registrations', (req, res) => {
  const { eventId } = req.body;
  const evt = events.find(e => e.id === eventId);
  if (!evt) return res.status(404).json({ success: false, message: 'Event not found' });

  evt.currentParticipants += 1;
  const newReg = {
    id: `reg-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    eventId: evt.id,
    userId: currentUser.id,
    status: 'confirmed',
    appliedAt: new Date().toISOString(),
    cancelledAt: null,
    attendanceStatus: 'not_checked',
    participantCode: `LINK-${Math.floor(Math.random()*9000 + 1000)}`,
    createdAt: new Date().toISOString()
  };
  registrations.unshift(newReg);
  res.json({ success: true, message: '참가 신청 완료', data: newReg });
});

// ==========================================
// 4. Registrations & Waitlist (SEC-362)
// ==========================================
app.get('/api/registrations', (req, res) => {
  const userRegs = registrations.filter(r => r.userId === currentUser.id).map(r => {
    const evt = events.find(e => e.id === r.eventId);
    return { ...r, event: evt };
  });
  res.json({ success: true, data: userRegs });
});

app.post('/api/registrations/:registrationId/cancel', (req, res) => {
  const reg = registrations.find(r => r.id === req.params.registrationId);
  if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });

  reg.status = 'cancelled';
  reg.cancelledAt = new Date().toISOString();

  const evt = events.find(e => e.id === reg.eventId);
  if (evt && evt.currentParticipants > 0) {
    evt.currentParticipants -= 1;
  }

  res.json({ success: true, message: '참가 신청이 취소되었습니다.', data: reg });
});

app.get('/api/events/:eventId/waitlist', (req, res) => {
  const list = waitlists.filter(w => w.eventId === req.params.eventId);
  res.json({ success: true, data: list });
});

// INTENTIONAL BACKEND BUG: site035-bug02 (SEC-362)
// Waitlist promotion does not fully prevent duplicate promotion of the same entry.
app.post('/api/events/:eventId/promote-waitlist', (req, res) => {
  const { waitlistId } = req.body;
  const wt = waitlists.find(w => w.id === waitlistId);
  if (!wt) return res.status(404).json({ success: false, message: 'Waitlist entry not found' });

  // Bug: Does not block if wt.status === 'promoted', creates redundant confirmed registration
  wt.status = 'promoted';
  wt.promotedAt = new Date().toISOString();

  const evt = events.find(e => e.id === req.params.eventId);
  if (evt) evt.currentParticipants += 1;

  const newReg = {
    id: `reg-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    eventId: wt.eventId,
    userId: wt.userId,
    status: 'confirmed',
    appliedAt: new Date().toISOString(),
    cancelledAt: null,
    attendanceStatus: 'not_checked',
    participantCode: `LINK-PROMO-${Math.floor(Math.random()*9000 + 1000)}`,
    createdAt: new Date().toISOString()
  };

  registrations.unshift(newReg);

  res.json({
    success: true,
    message: '대기자가 참가자로 승급 처리되었습니다.',
    data: { waitlist: wt, registration: newReg }
  });
});

app.post('/api/waitlist/:waitlistId/promote', (req, res) => {
  const wt = waitlists.find(w => w.id === req.params.waitlistId);
  if (!wt) return res.status(404).json({ success: false, message: 'Waitlist entry not found' });

  wt.status = 'promoted';
  const newReg = {
    id: `reg-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    eventId: wt.eventId,
    userId: wt.userId,
    status: 'confirmed',
    appliedAt: new Date().toISOString(),
    cancelledAt: null,
    attendanceStatus: 'not_checked',
    participantCode: `LINK-PROMO-${Math.floor(Math.random()*9000 + 1000)}`,
    createdAt: new Date().toISOString()
  };
  registrations.unshift(newReg);
  res.json({ success: true, message: '승급 완료', data: newReg });
});

// ==========================================
// 5. Attendance & Volunteer Hours (SEC-364 & SEC-365)
// ==========================================
// INTENTIONAL BACKEND BUG: site035-bug04 (SEC-364) & site035-bug05 (SEC-365)
// Attendance and volunteer-hour credit operations do not fully prevent duplicate credits.
// Attendance processing does not consistently reject cancelled registrations.
app.post('/api/events/:eventId/attendance', (req, res) => {
  const { registrationId, userId } = req.body;
  const reg = registrations.find(r => r.id === registrationId);
  const evt = events.find(e => e.id === req.params.eventId);

  if (!evt) return res.status(404).json({ success: false, message: 'Event not found' });

  // Bug 1 (SEC-365): Does not reject reg if reg.status === 'cancelled'
  if (reg) {
    reg.attendanceStatus = 'attended';
  }

  // Bug 2 (SEC-364): Repeated attendance requests grant volunteer hours multiple times without deduplication
  const targetUser = users.find(u => u.id === (userId || (reg ? reg.userId : currentUser.id)));
  const awardedHours = evt.volunteerHours || 3;

  if (targetUser) {
    targetUser.totalVolunteerHours = (targetUser.totalVolunteerHours || 0) + awardedHours;
  }

  const newRecord = {
    id: `vh-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    userId: targetUser ? targetUser.id : currentUser.id,
    eventId: evt.id,
    registrationId: registrationId || 'direct-checkin',
    hours: awardedHours,
    type: 'event',
    reason: `[${evt.title}] 행사 출석 완료 및 봉사시간 인정`,
    createdAt: new Date().toISOString()
  };

  volunteerRecords.unshift(newRecord);

  res.json({
    success: true,
    message: `출석 확인이 완료되어 봉사시간 +${awardedHours}시간이 적립되었습니다.`,
    data: { record: newRecord, user: targetUser, registration: reg }
  });
});

app.post('/api/volunteer-hours/credit', (req, res) => {
  const { userId, eventId, hours } = req.body;
  const user = users.find(u => u.id === userId) || currentUser;
  const addHours = Number(hours) || 3;
  user.totalVolunteerHours += addHours;

  const newRecord = {
    id: `vh-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    userId: user.id,
    eventId,
    hours: addHours,
    type: 'event',
    reason: '봉사시간 적립',
    createdAt: new Date().toISOString()
  };
  volunteerRecords.unshift(newRecord);
  res.json({ success: true, message: '봉사시간이 지급되었습니다.', data: newRecord });
});

app.get('/api/volunteer-hours', (req, res) => {
  const userRecords = volunteerRecords.filter(r => r.userId === currentUser.id);
  res.json({ success: true, data: userRecords, totalHours: currentUser.totalVolunteerHours });
});

// ==========================================
// 6. Community & Reviews & Favorites
// ==========================================
app.get('/api/community/posts', (req, res) => {
  res.json({ success: true, data: posts });
});

app.post('/api/community/posts', (req, res) => {
  const { title, content, category = '자유게시판' } = req.body;
  const newPost = {
    id: `post-${Date.now()}`,
    authorId: currentUser.id,
    authorName: currentUser.name,
    title: title || '나눔 이야기',
    content: content || '',
    category,
    viewCount: 0,
    likeCount: 0,
    createdAt: new Date().toISOString()
  };
  posts.unshift(newPost);
  res.json({ success: true, message: '게시글이 등록되었습니다.', data: newPost });
});

app.get('/api/reviews', (req, res) => {
  res.json({ success: true, data: reviews });
});

app.post('/api/events/:eventId/reviews', (req, res) => {
  const { rating, content } = req.body;
  const newRev = {
    id: `rev-${Date.now()}`,
    userId: currentUser.id,
    eventId: req.params.eventId,
    rating: Number(rating) || 5,
    content: content || '뜻깊은 활동이었습니다.',
    createdAt: new Date().toISOString()
  };
  reviews.unshift(newRev);
  res.json({ success: true, message: '후기가 작성되었습니다.', data: newRev });
});

app.get('/api/favorites/events', (req, res) => {
  const userFavs = favorites.filter(f => f.userId === currentUser.id).map(f => {
    return events.find(e => e.id === f.eventId);
  }).filter(Boolean);
  res.json({ success: true, data: userFavs });
});

// Serve Static Frontend Bundle
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🤝 LinkDay Platform Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
