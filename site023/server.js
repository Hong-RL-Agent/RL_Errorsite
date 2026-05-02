const express = require('express');
const path = require('path');
const app = express();
const PORT = 9352;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let volunteers = [
  { id: 'v1', title: '지역 아동 센터 멘토링', area: '서울', status: 'Open', date: '2024-06-01' },
  { id: 'v2', title: '유기견 보호소 청소', area: '경기', status: 'Open', date: '2024-06-02' },
  { id: 'v3', title: '어르신 도시락 배달', area: '인천', status: 'Closed', date: '2024-05-20' }
];

let organizations = [
  { id: 'org-1', name: '나눔재단', adminEmail: 'super_admin@nanum.org', adminMemo: '연간 예산 10억, VIP 관리 필요' },
  { id: 'org-2', name: '그린피스 커뮤니티', adminEmail: 'contact@greenpc.io', adminMemo: '외부 노출 금지: 행사 인원 제한 주의' }
];

let applications = [
  { id: 'app-101', volunteerId: 'v1', user: '홍길동', status: 'Pending' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Volunteer Connect API is running' });
});

app.get('/api/volunteers', (req, res) => {
  res.json(volunteers);
});

// INTENTIONAL BUG: site023-bug03
// CSV Error: 관리자 데이터 노출
// Type: security-data-exposure
// Description: 기관 목록 API 응답에 adminEmail과 adminMemo가 포함됨.
app.get('/api/organizations', (req, res) => {
  // 보안 취약점: adminEmail, adminMemo를 제거하지 않고 통째로 응답함
  res.json(organizations);
});

// API: Apply for Volunteer
app.post('/api/applications', (req, res) => {
  const { volunteerId, user } = req.body;
  const volunteer = volunteers.find(v => v.id === volunteerId);

  if (!volunteer) return res.status(404).json({ error: 'Not found' });

  // INTENTIONAL BUG: site023-bug02
  // CSV Error: 잘못된 API 상태 코드
  // Type: network-http-status
  // Description: 신청 마감 상태에서도 서버가 201 Created를 반환함.
  if (volunteer.status === 'Closed') {
    // 내부적으로는 저장하지 않지만, 응답은 성공으로 보냄
    return res.status(201).json({ success: true, message: 'Waitlist enrolled (Actually blocked)' });
  }

  // INTENTIONAL BUG: site023-bug01
  // CSV Error: DB 신청 중복 검증 누락
  // Type: database-duplicate
  // Description: 같은 봉사활동에 동일 사용자가 여러 번 신청 가능함.
  // 원래는: const exists = applications.find(a => a.volunteerId === volunteerId && a.user === user);
  // if (exists) return res.status(400).json({ error: 'Already applied' });

  const newApp = {
    id: 'app-' + Date.now(),
    volunteerId,
    user,
    status: 'Pending'
  };
  applications.push(newApp);
  res.status(201).json({ success: true, application: newApp });
});

app.get('/api/applications', (req, res) => {
  const { user } = req.query;
  const myApps = applications.filter(a => a.user === user);
  res.json(myApps);
});

let reviews = [
  { id: 'rev-1', volunteerId: 'v1', user: '홍길동', content: '아이들과 함께해서 너무 행복했습니다!', rating: 5 },
  { id: 'rev-2', volunteerId: 'v2', user: '봉사왕', content: '강아지들이 너무 귀여워요.', rating: 4 }
];

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { volunteerId, user, content, rating } = req.body;
  const newRev = { id: 'rev-' + Date.now(), volunteerId, user, content, rating };
  reviews.push(newRev);
  res.status(201).json(newRev);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
