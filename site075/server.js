const express = require('express');
const path = require('path');
const app = express();
const PORT = 9404;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let mentors = [
  { id: 'm1', name: '박지성', field: '개발', company: '네이버', bio: '10년차 시니어 백엔드 개발자' },
  { id: 'm2', name: '이수연', field: '디자인', company: '토스', bio: '사용자 경험 중심의 프로덕트 디자이너' },
  { id: 'm3', name: '최현우', field: '마케팅', company: '쿠팡', bio: '데이터 기반 퍼포먼스 마케팅 전문가' }
];

let availableSessions = [
  { id: 's1', mentorId: 'm1', time: '2024-05-10 14:00', status: 'available' },
  { id: 's2', mentorId: 'm1', time: '2024-05-10 15:00', status: 'available' },
  { id: 's3', mentorId: 'm2', time: '2024-05-11 10:00', status: 'available' }
];

let applications = [
  { id: 'app-1', userId: 'user_A', mentorId: 'm1', sessionId: 's1', content: '백엔드 커리어 상담', status: 'approved' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MentorCircle API is running' });
});

app.get('/api/mentors', (req, res) => {
  res.json(mentors);
});

app.get('/api/sessions', (req, res) => {
  res.json(availableSessions);
});

// API: Mentoring Application (with conflict and body mismatch bugs)
app.post('/api/applications', (req, res) => {
  const { userId, mentorId, sessionId, content } = req.body;

  if (!userId || !mentorId || !sessionId) {
    // INTENTIONAL BUG: site075-bug02
    // CSV Error: 네트워크 오류 본문 불일치
    // Type: network-error-body
    // 버그: 실패 응답임에도 불구하고 body에 success: true를 포함함
    return res.status(400).json({ success: true, message: '필수 입력값이 누락되었습니다. (실패)' });
  }

  // INTENTIONAL BUG: site075-bug01
  // CSV Error: DB 시간대 중복 신청
  // Type: database-conflict
  // 버그: 같은 멘토의 같은 시간대에 이미 승인된 신청이 있는지 확인하지 않고 중복 허용
  // 원래 로직: if (applications.some(a => a.sessionId === sessionId && a.status === 'approved')) ...

  const newApp = {
    id: `app-${Date.now()}`,
    userId,
    mentorId,
    sessionId,
    content,
    status: 'pending'
  };

  applications.push(newApp);
  res.status(201).json({ success: true, application: newApp });
});

// API: Get ALL Applications (with security data exposure bug)
app.get('/api/applications/all', (req, res) => {
  // INTENTIONAL BUG: site075-bug03
  // CSV Error: 멘토 전용 신청 목록 노출
  // Type: security-data-exposure
  // 보안 취약점: 권한 확인 없이 누구나 전체 신청자 목록(개인정보 포함)을 조회 가능
  res.json(applications);
});

app.get('/api/applications/my', (req, res) => {
  const { userId } = req.query;
  res.json(applications.filter(a => a.userId === userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
