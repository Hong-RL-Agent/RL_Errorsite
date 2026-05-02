const express = require('express');
const path = require('path');
const app = express();
const PORT = 9365;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let clubs = [
  { id: 'club-1', name: '알고리즘 정복', category: 'Academic', description: '매주 알고리즘 문제 풀이 및 코딩 테스트 준비', status: 'Recruiting', isClosed: false },
  { id: 'club-2', name: '스트릿 댄스', category: 'Art', description: '힙합, 팝핀 등 다양한 스트릿 장르 댄스 동아리', status: 'Recruiting', isClosed: false },
  { id: 'club-3', name: '테니스 클럽', category: 'Sports', description: '캠퍼스 최고의 테니스 동아리. 초보자 환영!', status: 'Closed', isClosed: true }, // 모집 종료됨
  { id: 'club-4', name: '천체 관측회', category: 'Academic', description: '밤하늘의 별을 보며 힐링하는 동아리', status: 'Recruiting', isClosed: false }
];

let applications = [
  { id: 'app-1', userId: 'std-101', clubId: 'club-1', status: 'Pending', createdAt: '2024-05-10' }
];

let notices = [
  { id: 'not-1', title: '2024년 1학기 중앙 동아리 통합 모집 안내', content: '기간 내에 신청 부탁드립니다.', author: '학생지원팀', date: '2024-05-01' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus Club API is running' });
});

// API: Get Clubs (with state bug)
// INTENTIONAL BUG: site036-bug01
// CSV Error: DB 모집 상태 오류
// Type: database-state
app.get('/api/clubs', (req, res) => {
  // 버그: isClosed가 true인 동아리도 status를 Recruiting으로 조작하여 반환함
  const results = clubs.map(club => {
    if (club.isClosed) {
      return { ...club, status: 'Recruiting' }; // 버그 발생 지점
    }
    return club;
  });
  res.json(results);
});

// API: Cancel Application (with method bug)
// INTENTIONAL BUG: site036-bug02
// CSV Error: 잘못된 HTTP 메서드 허용
// Type: network-method
app.get('/api/applications/cancel', (req, res) => {
  const { appId } = req.query;
  const appIndex = applications.findIndex(a => a.id === appId);
  
  if (appIndex !== -1) {
    // 취약점: 중요한 데이터 상태 변경(취소)을 GET 메서드로 허용함
    applications[appIndex].status = 'Cancelled';
    res.json({ success: true, message: 'Application cancelled via GET' });
  } else {
    res.status(404).json({ error: 'Application not found' });
  }
});

// API: Add Notice (with authorization bug)
// INTENTIONAL BUG: site036-bug03
// CSV Error: 관리자 공지 권한 검증 누락
// Type: security-authorization
app.post('/api/notices', (req, res) => {
  const { title, content, author, userId } = req.body;
  
  // 보안 취약점: 요청한 사용자가 관리자인지 검증하는 로직이 완전히 누락됨
  // 누구나 userId만 보내면 공지를 등록할 수 있음
  const newNotice = {
    id: 'not-' + Date.now(),
    title,
    content,
    author,
    date: new Date().toISOString().split('T')[0]
  };

  notices.push(newNotice);
  res.status(201).json({ success: true, notice: newNotice });
});

app.get('/api/notices', (req, res) => {
  res.json(notices);
});

app.post('/api/applications', (req, res) => {
  const { clubId, userId } = req.body;
  const newApp = { id: 'app-' + Date.now(), userId, clubId, status: 'Pending', createdAt: new Date().toISOString().split('T')[0] };
  applications.push(newApp);
  res.status(201).json({ success: true, application: newApp });
});

app.get('/api/applications/:userId', (req, res) => {
  res.json(applications.filter(a => a.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
