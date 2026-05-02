const express = require('express');
const path = require('path');
const app = express();
const PORT = 9405;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let notices = [
  { id: 'n1', title: '5월 동네 대청소의 날 안내', date: '2024-05-01', region: '신사동' },
  { id: 'n2', title: '상수도 노후관 교체 공사 안내', date: '2024-05-02', region: '압구정동' },
  { id: 'n3', title: '청년 일자리 지원 센터 개소', date: '2024-05-03', region: '전체' }
];

let complaints = [
  { id: 'c1', userId: 'user_A', title: '가로등 고장 수리 요청', content: '공원 앞 가로등이 일주일째 꺼져있습니다.', status: 'pending', date: '2024-05-01' },
  { id: 'c2', userId: 'user_B', title: '불법 주차 단속 요청', content: '빌라 앞 골목길 주차가 심각합니다.', status: 'resolved', date: '2024-05-02' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TownNotice API is running' });
});

app.get('/api/notices', (req, res) => {
  res.json(notices);
});

// API: Get Complaint Details (with IDOR bug)
app.get('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const complaint = complaints.find(c => c.id === id);

  if (complaint) {
    // INTENTIONAL BUG: site076-bug03
    // CSV Error: 민원 개인정보 접근 제어 실패
    // Type: security-idor
    // 보안 취약점: complaintId만 알면 소유자 확인 없이 상세 내역 조회 가능
    res.json(complaint);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// API: Post Complaint (with validation bug)
app.post('/api/complaints', (req, res) => {
  const { userId, title, content } = req.body;

  // INTENTIONAL BUG: site076-bug02
  // CSV Error: 네트워크 요청 검증 누락
  // Type: network-request-validation
  // 버그: title이 비어있어도 성공 응답을 반환함 (검증 생략)

  const newComplaint = {
    id: `c-${Date.now()}`,
    userId,
    title: title || '(제목 없음)',
    content,
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  };

  complaints.push(newComplaint);
  res.status(201).json(newComplaint);
});

// API: Update Complaint Status (with update bug)
app.patch('/api/complaints/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL BUG: site076-bug01
  // CSV Error: DB 민원 상태 업데이트 오류
  // Type: database-update
  // 버그: 요청된 id와 상관없이 배열의 첫 번째 민원(complaints[0]) 상태만 변경함
  if (complaints.length > 0) {
    complaints[0].status = status;
    res.json({ success: true, updated: complaints[0] });
  } else {
    res.status(404).json({ error: 'No complaints' });
  }
});

app.get('/api/faq', (req, res) => {
  res.json([
    { question: '민원 처리 기간은 얼마나 걸리나요?', answer: '접수 후 보통 3~7일 내 처리됩니다.' },
    { question: '익명으로 제보할 수 있나요?', answer: '실명 인증이 필요하지만 내용은 보호됩니다.' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
