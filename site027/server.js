const express = require('express');
const path = require('path');
const app = express();
const PORT = 9356;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let technicians = [
  { id: 'tech-1', name: '김수리', category: 'Electrical', rating: 4.8, bio: '전기 설비 20년 경력의 베테랑입니다.' },
  { id: 'tech-2', name: '이배관', category: 'Plumbing', rating: 4.5, bio: '누수 탐지 및 배관 수리 전문입니다.' },
  { id: 'tech-3', name: '박조명', category: 'Electrical', rating: 4.9, bio: '합리적인 가격으로 꼼꼼하게 시공합니다.' },
  { id: 'tech-4', name: '최타일', category: 'Interior', rating: 4.7, bio: '타일 및 욕실 인테리어 수리 전문.' }
];

let requests = [
  { id: 'req-1001', userId: 'user123', technicianId: 'tech-1', category: 'Electrical', desc: '안방 전등이 깜빡거려요.', status: 'Pending', date: '2024-05-15' },
  { id: 'req-9999', userId: 'admin', technicianId: 'tech-2', category: 'Plumbing', desc: '비밀 금고 뒤쪽 배관 긴급 수리 필요', status: 'In-Progress', date: '2024-05-16', secretMemo: '매우 민감한 장소임, 보안 유지 필수' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HomeFix Request API is running' });
});

app.get('/api/technicians', (req, res) => {
  res.json(technicians);
});

// API: Create Repair Request
app.post('/api/requests', (req, res) => {
  const { technicianId, category, desc, userId } = req.body;

  // INTENTIONAL BUG: site027-bug02
  // CSV Error: 네트워크 에러 본문 불일치
  // Type: network-error-body
  // Description: 실패 응답이 success:true를 포함해 클라이언트가 혼동함.
  if (!desc) {
    return res.status(400).json({ 
      success: true, // 버그: 에러임에도 success가 true로 전송됨
      error: '수리 요청 내용을 입력해 주세요.' 
    });
  }

  // INTENTIONAL BUG: site027-bug01
  // CSV Error: DB 잘못된 참조 저장
  // Type: database-relation
  // Description: 수리 요청 저장 시 technicianId 대신 categoryId(여기선 category 문자열)가 저장됨.
  const newRequest = {
    id: 'req-' + Date.now(),
    userId,
    technicianId: category, // 버그: technicianId 자리에 category를 저장함
    category,
    desc,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  };

  requests.push(newRequest);
  res.status(201).json({ success: true, request: newRequest });
});

// API: Get Request Details
// INTENTIONAL BUG: site027-bug03
// CSV Error: 요청자 권한 검증 누락
// Type: security-authorization
// Description: requestId만 바꾸면 다른 사용자의 수리 요청 상세 조회 가능.
app.get('/api/requests/:id', (req, res) => {
  const request = requests.find(r => r.id === req.params.id);
  
  if (request) {
    // 보안 취약점: 현재 세션 사용자(userId)와 요청 소유자를 대조하는 검증 로직이 없음
    res.json(request);
  } else {
    res.status(404).json({ success: false, error: 'Request not found' });
  }
});

app.get('/api/my-requests', (req, res) => {
  const { userId } = req.query;
  const myReqs = requests.filter(r => r.userId === userId);
  res.json(myReqs);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
