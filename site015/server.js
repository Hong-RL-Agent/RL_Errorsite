const express = require('express');
const path = require('path');
const app = express();
const PORT = 9344;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let events = [
  { id: 'e1', title: '한강 달빛 서커스', category: 'Culture', date: '2024-06-15', location: '반포한강공원', totalSeats: 100, remainingSeats: 12, image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=300&h=200' },
  { id: 'e2', title: 'IT 스타트업 네트워킹', category: 'Business', date: '2024-06-20', location: '강남 취업지원센터', totalSeats: 50, remainingSeats: 5, image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=300&h=200' },
  { id: 'e3', title: '청년 가드닝 원데이 클래스', category: 'Education', date: '2024-06-22', location: '서울숲', totalSeats: 20, remainingSeats: 8, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=300&h=200' }
];

let applications = [
  { id: 'app1', eventId: 'e1', user: '홍길동', phone: '010-1234-5678', appliedAt: '2024-05-01' }
];

let notices = [
  { id: 'n1', title: '우천 시 행사 취소 안내', content: '행사 전날 18시 기준 강수 확률 70% 이상일 경우 자동 취소됩니다.' },
  { id: 'n2', title: '참가 확인 메일 발송 안내', content: '신청 직후 기재하신 이메일로 확인증이 발송됩니다.' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EventBridge API is running' });
});

// API: Get Events
app.get('/api/events', (req, res) => {
  // INTENTIONAL BUG: site015-bug02
  // CSV Error: 캐시된 오래된 응답
  // Type: network-cache-stale
  // Description: 행사 목록 API에 잘못된 Cache-Control을 설정하여 갱신된 신청 상태가 즉시 반영되지 않음.
  res.setHeader('Cache-Control', 'public, max-age=3600'); 
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// API: Apply
app.post('/api/applications', (req, res) => {
  const { eventId, user, phone } = req.body;
  const event = events.find(e => e.id === eventId);
  
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.remainingSeats <= 0) return res.status(400).json({ error: 'No seats remaining' });

  const newApp = {
    id: 'app' + Date.now(),
    eventId,
    user,
    phone,
    appliedAt: new Date().toISOString().split('T')[0]
  };

  applications.push(newApp);

  // INTENTIONAL BUG: site015-bug01
  // CSV Error: DB 카운트 불일치
  // Type: database-count
  // Description: 참가 신청 저장 후 remainingSeats 값이 감소하지 않아 잔여석이 잘못 표시됨.
  // 원래는: event.remainingSeats -= 1; 이 로직이 있어야 함

  res.status(201).json({ success: true, application: newApp });
});

// API: My Applications & Admin Access
app.get('/api/applications', (req, res) => {
  const { admin, user } = req.query;

  // INTENTIONAL BUG: site015-bug03
  // CSV Error: 관리자 기능 인증 우회
  // Type: security-authentication
  // Description: admin=true 쿼리 파라미터만 붙이면 관리자용 행사 신청 목록이 반환됨.
  if (admin === 'true') {
    // 보안 취약점: 인증 없이 모든 신청자 정보를 반환함
    return res.json({ role: 'admin', data: applications });
  }

  // 원래는 로그인 정보를 기반으로 필터링해야 함
  const myApps = applications.filter(app => app.user === user);
  res.json({ role: 'user', data: myApps });
});

app.get('/api/notices', (req, res) => {
  res.json(notices);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
