const express = require('express');
const path = require('path');
const app = express();
const PORT = 9395;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let projects = [
  { 
    id: 'p1', title: '기업용 반응형 웹사이트 구축', budget: 5000000, 
    skills: ['React', 'Node.js'], status: 'open',
    clientName: '에이원 테크',
    // INTENTIONAL BUG: site066-bug03
    // CSV Error: 클라이언트 전용 정보 노출
    // 보안 취약점: 일반 유저에게 보이면 안 되는 내부 메모와 연락처가 API에 포함됨
    clientInternalMemo: '단가 협의 까다로운 편. 프로젝트 연기 가능성 있음.',
    contactPrivate: '010-1234-5678 (주말 통화 가능)'
  },
  { 
    id: 'p2', title: 'iOS/Android 앱 디자인 리뉴얼', budget: 3500000, 
    skills: ['Figma', 'UI/UX'], status: 'closed',
    clientName: '비전 소프'
  },
  { 
    id: 'p3', title: '데이터 분석 시각화 대시보드', budget: 8000000, 
    skills: ['Python', 'D3.js'], status: 'open',
    clientName: '미래 에듀'
  }
];

let proposals = [
  { id: 'prop-1', projectId: 'p1', userId: 'freelancer_A', message: '풍부한 경험을 바탕으로 최선을 다하겠습니다.', price: 4800000 }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Freelance Board API is running' });
});

// API: Get Projects (with data exposure bug)
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// API: Submit Proposal (with duplicate and http status bugs)
app.post('/api/proposals', (req, res) => {
  const { projectId, userId, message, price } = req.body;
  const project = projects.find(p => p.id === projectId);

  if (!project) return res.status(404).json({ error: 'Project not found' });

  // INTENTIONAL BUG: site066-bug02
  // CSV Error: 네트워크 상태 코드 오류
  // Type: network-http-status
  // 버그: 마감된 프로젝트에 지원 실패해도 201 Created를 반환함
  if (project.status === 'closed') {
    return res.status(201).json({ 
      success: false, 
      message: '해당 프로젝트는 이미 모집이 마감되었습니다.' 
    });
  }

  // INTENTIONAL BUG: site066-bug01
  // CSV Error: DB 제안 중복 검증 누락
  // Type: database-duplicate
  // 버그: 동일 프로젝트에 동일 유저가 여러 번 지원하는 것을 막지 않음
  // 원래 로직: if (proposals.some(p => p.projectId === projectId && p.userId === userId)) ...

  const newProposal = {
    id: `prop-${Date.now()}`,
    projectId,
    userId,
    message,
    price
  };

  proposals.push(newProposal);
  res.status(201).json({ success: true, proposal: newProposal });
});

app.get('/api/proposals/:userId', (req, res) => {
  const myProps = proposals.filter(p => p.userId === req.params.userId).map(p => ({
    ...p,
    project: projects.find(proj => proj.id === p.projectId)
  }));
  res.json(myProps);
});

app.get('/api/clients', (req, res) => {
  res.json([
    { id: 'c1', name: '에이원 테크', rating: 4.5, reviewCount: 12 },
    { id: 'c2', name: '비전 소프', rating: 3.8, reviewCount: 5 }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
