import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5052;

app.use(cors());
app.use(express.json());

// Projects database (Minimum 18 items)
let projects = [
  { id: "proj-01", title: "스마트 물류 시스템 모바일 앱 구축", domain: "App", tech: "Flutter", budget: "15,000,000원", applicantCount: 4 },
  { id: "proj-02", title: "반응형 이커머스 웹 쇼핑몰 퍼블리싱", domain: "Web", tech: "Vue", budget: "4,500,000원", applicantCount: 9 },
  { id: "proj-03", title: "AI 기반 추천 검색 가속엔진 고도화", domain: "AI", tech: "Python", budget: "28,000,000원", applicantCount: 2 },
  { id: "proj-04", title: "노션 연동 전사 리소스 ERP 개발", domain: "Web", tech: "React", budget: "19,000,000원", applicantCount: 5 },
  { id: "proj-05", title: "해외 PG 카드 결제 연동 모듈 패키징", domain: "Web", tech: "Node.js", budget: "3,000,000원", applicantCount: 1 },
  { id: "proj-06", title: "코스메틱 브랜드 마케팅 랜딩 페이지 제작", domain: "Web", tech: "Vue", budget: "1,500,000원", applicantCount: 12 },
  { id: "proj-07", title: "부동산 중개 가상 3D VR 쇼룸 웹앱", domain: "Web", tech: "Three.js", budget: "22,000,000원", applicantCount: 0 },
  { id: "proj-08", title: "스마트 팜 환경 제어 웹 대시보드", domain: "Web", tech: "React", budget: "8,000,000원", applicantCount: 3 },
  { id: "proj-09", title: "금융 자산 트래킹 가계부 앱 리팩토링", domain: "App", tech: "React Native", budget: "6,500,000원", applicantCount: 7 },
  { id: "proj-10", title: "학원 수강생 출결 QR 체크인 태블릿 소프트웨어", domain: "App", tech: "Flutter", budget: "3,500,000원", applicantCount: 6 },
  { id: "proj-11", title: "프랜차이즈 POS 연동 오더링 하이브리드 앱", domain: "App", tech: "Vue", budget: "11,000,000원", applicantCount: 8 },
  { id: "proj-12", title: "동영상 라이브 스트리밍 채팅 플랫폼 구축", domain: "Web", tech: "WebRTC", budget: "30,000,000원", applicantCount: 10 },
  { id: "proj-13", title: "공유 오피스 회의실 예약 키오스크 웹앱", domain: "Web", tech: "Vue", budget: "5,000,000원", applicantCount: 2 },
  { id: "proj-14", title: "아티스트 NFT 민팅 웹사이트 기획/개발", domain: "Web", tech: "React", budget: "14,000,000원", applicantCount: 4 },
  { id: "proj-15", title: "헬스케어 피트니스 식단 트래킹 다이어리 앱", domain: "App", tech: "React Native", budget: "7,500,000원", applicantCount: 15 },
  { id: "proj-16", title: "물류 창고 바코드 스캐너 입출고 데스크톱 프로그램", domain: "Desktop", tech: "Electron", budget: "9,000,000원", applicantCount: 3 },
  { id: "proj-17", title: "중고 명품 거래 안전결제 에스크로 솔루션", domain: "Web", tech: "Node.js", budget: "12,000,000원", applicantCount: 5 },
  { id: "proj-18", title: "숙박 예약 플랫폼 채널 매니저 API 연동", domain: "Web", tech: "Python", budget: "16,500,000원", applicantCount: 1 }
];

// Portfolios
let portfolios = [
  { id: "port-01", author: "프리랜서 A", title: "반응형 쇼핑몰 UI 포트폴리오", tech: "Vue 3 / Figma" },
  { id: "port-02", author: "프리랜서 A", title: "스마트 밴드 헬스케어 대시보드", tech: "React / D3" },
  { id: "port-03", author: "프리랜서 B", title: "모바일 금융 핀테크 목업 기획안", tech: "Figma" }
];

// Applications
let applications = [
  { id: "app-01", projectTitle: "반응형 이커머스 웹 쇼핑몰 퍼블리싱", freelancer: "프리랜서 A", status: "제출됨" }
];

// Contracts
let contracts = [
  { id: "con-01", title: "이커머스 웹앱 고도화 개발", price: 12000000, status: "PENDING", deadline: "2026-09-30", restricted: false },
  { id: "con-restricted", title: "대기업 기밀 협약 시스템 구축", price: 24000000, status: "PENDING", deadline: "2026-12-31", restricted: true }
];

// Settlement logs
let settlementLogs = [
  { id: "set-01", contractId: "con-init", title: "반응형 쇼핑몰 퍼블리싱", pricePaid: 4500000, date: "2026-07-01" }
];

// Statistics
let dashboardStats = {
  totalApplicants: 1, // applicationCount sum
  totalActiveProjects: 18
};

// API: Get projects
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// API: Search projects (Error 3 search query race condition simulator)
app.get('/api/projects/search', (req, res) => {
  const { q } = req.query;
  const filtered = projects.filter(p => p.title.includes(q) || p.tech.includes(q));

  let delay = 100;
  if (q === 'Vue') {
    delay = 3000; // 3s delay
  } else if (q === 'React') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 검색 쿼리에 따라 비동기 응답 지연을 다르게 부여합니다. 
  // 'Vue' 검색어는 3초 지연되고 'React' 검색어는 0.2초 지연되어, 
  // 이전 검색 요청 결과가 최신 검색 결과 창을 뒤늦게 덮어써 데이터 불일치가 일어나게 만듭니다.
  setTimeout(() => {
    res.json({ results: filtered });
  }, delay);
});

// API: Submit application
app.post('/api/applications', (req, res) => {
  const { projectId, projectTitle, freelancer, experience, desiredPay, portfolioIds } = req.body;
  const newApp = {
    id: `app-${Date.now()}`,
    projectId,
    projectTitle,
    freelancer,
    experience,
    desiredPay,
    portfolioIds,
    status: "제출됨"
  };
  applications.push(newApp);
  
  // Increment applicants count
  const proj = projects.find(p => p.id === projectId);
  if (proj) {
    proj.applicantCount += 1;
  }
  dashboardStats.totalApplicants += 1;

  res.json({ success: true, application: newApp });
});

// API: Withdraw application (Error 4 stats decrement bypass)
app.delete('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  const index = applications.findIndex(a => a.id === id);

  if (index !== -1) {
    const appItem = applications[index];
    applications.splice(index, 1);

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 지원 철회 시 지원서 리스트에서는 레코드를 지우나, 
    // 프로젝트별 누적 지원자 수(`applicantCount`) 및 대시보드 통계의 누적 지원 수(`totalApplicants`)를 
    // 함께 차감 차단(Bypass)하여 실제 데이터와 지표 간 불정합을 유도합니다.
    console.log(`[DB STATISTICS] Application ${id} deleted. BUT project/applicant stats are NOT decremented!`);
  }

  res.json({ success: true });
});

// API: Get Portfolios
app.get('/api/portfolios', (req, res) => {
  res.json(portfolios);
});

// API: Add Portfolio
app.post('/api/portfolios', (req, res) => {
  const { author, title, tech } = req.body;
  const newPort = {
    id: `port-${Date.now()}`,
    author,
    title,
    tech
  };
  portfolios.push(newPort);
  res.json(newPort);
});

// API: Get Contracts
app.get('/api/contracts', (req, res) => {
  res.json(contracts);
});

// API: Get Contract Details (Error 5: Leaks information on 403 Forbidden)
app.get('/api/contracts/:id', (req, res) => {
  const { id } = req.params;
  const userRole = req.headers['x-user-role'];

  const contract = contracts.find(c => c.id === id);
  if (!contract) {
    return res.status(404).json({ error: "계약을 찾을 수 없습니다." });
  }

  if (contract.restricted && userRole !== 'admin') {
    // INTENTIONAL_ERROR
    // CATEGORY: Backend
    // DESCRIPTION: 권한 검증 실패로 403 Forbidden 에러 코드를 반환하지만, 
    // JSON 응답 본문에 해당 계약의 상세 금액과 만일자 데이터를 함께 노출(Information Disclosure)하여 
    // 권한 없는 클라이언트가 해당 정보를 가로채 볼 수 있게 설계한 보안 취약점입니다.
    return res.status(403).json({
      error: "접근 권한이 차단되었습니다. (403 Forbidden)",
      leakedPrice: contract.price,
      leakedDeadline: contract.deadline
    });
  }

  res.json(contract);
});

// API: Patch Contract Price (Error 2 price update - 3s delay)
app.patch('/api/contracts/:id/price', (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  const contract = contracts.find(c => c.id === id);

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 계약 금액 수정 연산을 3000ms(3초) 강제 지연시킵니다. 
  // 수정 직후 계약 승인(0.1초 완료)이 순차 레이싱하여 밀려들면, 승인 요청 핸들러는 수정되기 이전의 
  // 금액 정보로 정산 기록(`settlementLogs`)을 픽스 기재함으로써 금액 데이터 정합성이 깨집니다.
  setTimeout(() => {
    if (contract) {
      contract.price = Number(price);
      console.log(`[DB CONTRACT] Contract ${id} price updated delayed to ${price}`);
    }
    res.json({ success: true, contract });
  }, 3000);
});

// API: Approve Contract (Error 2 approve - 0.1s delay)
app.post('/api/contracts/:id/approve', (req, res) => {
  const { id } = req.params;
  const contract = contracts.find(c => c.id === id);

  setTimeout(() => {
    if (contract) {
      contract.status = "APPROVED";
      
      // Push to settlement logs with the current price value in memory (which is still the OLD price)
      settlementLogs.push({
        id: `set-${Date.now()}`,
        contractId: contract.id,
        title: contract.title,
        pricePaid: contract.price, // Old price!
        date: new Date().toLocaleDateString()
      });
      console.log(`[DB SETTLEMENT] Settlement created with pricePaid = ${contract.price}`);
    }
    res.json({ success: true, contract });
  }, 100);
});

// API: Get Settlement Logs
app.get('/api/settlement', (req, res) => {
  res.json(settlementLogs);
});

// API: Get Statistics
app.get('/api/statistics', (req, res) => {
  res.json({
    totalApplicants: dashboardStats.totalApplicants,
    totalActiveProjects: projects.length,
    activeApplicationsCount: applications.length
  });
});

// API: Reset DB
app.post('/api/reset', (req, res) => {
  projects = [
    { id: "proj-01", title: "스마트 물류 시스템 모바일 앱 구축", domain: "App", tech: "Flutter", budget: "15,000,000원", applicantCount: 4 },
    { id: "proj-02", title: "반응형 이커머스 웹 쇼핑몰 퍼블리싱", domain: "Web", tech: "Vue", budget: "4,500,000원", applicantCount: 9 },
    { id: "proj-03", title: "AI 기반 추천 검색 가속엔진 고도화", domain: "AI", tech: "Python", budget: "28,000,000원", applicantCount: 2 },
    { id: "proj-04", title: "노션 연동 전사 리소스 ERP 개발", domain: "Web", tech: "React", budget: "19,000,000원", applicantCount: 5 },
    { id: "proj-05", title: "해외 PG 카드 결제 연동 모듈 패키징", domain: "Web", tech: "Node.js", budget: "3,000,000원", applicantCount: 1 },
    { id: "proj-06", title: "코스메틱 브랜드 마케팅 랜딩 페이지 제작", domain: "Web", tech: "Vue", budget: "1,500,000원", applicantCount: 12 },
    { id: "proj-07", title: "부동산 중개 가상 3D VR 쇼룸 웹앱", domain: "Web", tech: "Three.js", budget: "22,000,000원", applicantCount: 0 },
    { id: "proj-08", title: "스마트 팜 환경 제어 웹 대시보드", domain: "Web", tech: "React", budget: "8,000,000원", applicantCount: 3 },
    { id: "proj-09", title: "금융 자산 트래킹 가계부 앱 리팩토링", domain: "App", tech: "React Native", budget: "6,500,000원", applicantCount: 7 },
    { id: "proj-10", title: "학원 수강생 출결 QR 체크인 태블릿 소프트웨어", domain: "App", tech: "Flutter", budget: "3,500,000원", applicantCount: 6 },
    { id: "proj-11", title: "프랜차이즈 POS 연동 오더링 하이브리드 앱", domain: "App", tech: "Vue", budget: "11,000,000원", applicantCount: 8 },
    { id: "proj-12", title: "동영상 라이브 스트리밍 채팅 플랫폼 구축", domain: "Web", tech: "WebRTC", budget: "30,000,000원", applicantCount: 10 },
    { id: "proj-13", title: "공유 오피스 회의실 예약 키오스크 웹앱", domain: "Web", tech: "Vue", budget: "5,000,000원", applicantCount: 2 },
    { id: "proj-14", title: "아티스트 NFT 민팅 웹사이트 기획/개발", domain: "Web", tech: "React", budget: "14,000,000원", applicantCount: 4 },
    { id: "proj-15", title: "헬스케어 피트니스 식단 트래킹 다이어리 앱", domain: "App", tech: "React Native", budget: "7,500,000원", applicantCount: 15 },
    { id: "proj-16", title: "물류 창고 바코드 스캐너 입출고 데스크톱 프로그램", domain: "Desktop", tech: "Electron", budget: "9,000,000원", applicantCount: 3 },
    { id: "proj-17", title: "중고 명품 거래 안전결제 에스크로 솔루션", domain: "Web", tech: "Node.js", budget: "12,000,000원", applicantCount: 5 },
    { id: "proj-18", title: "숙박 예약 플랫폼 채널 매니저 API 연동", domain: "Web", tech: "Python", budget: "16,500,000원", applicantCount: 1 }
  ];
  portfolios = [
    { id: "port-01", author: "프리랜서 A", title: "반응형 쇼핑몰 UI 포트폴리오", tech: "Vue 3 / Figma" },
    { id: "port-02", author: "프리랜서 A", title: "스마트 밴드 헬스케어 대시보드", tech: "React / D3" },
    { id: "port-03", author: "프리랜서 B", title: "모바일 금융 핀테크 목업 기획안", tech: "Figma" }
  ];
  applications = [
    { id: "app-01", projectTitle: "반응형 이커머스 웹 쇼핑몰 퍼블리싱", freelancer: "프리랜서 A", status: "제출됨" }
  ];
  contracts = [
    { id: "con-01", title: "이커머스 웹앱 고도화 개발", price: 12000000, status: "PENDING", deadline: "2026-09-30", restricted: false },
    { id: "con-restricted", title: "대기업 기밀 협약 시스템 구축", price: 24000000, status: "PENDING", deadline: "2026-12-31", restricted: true }
  ];
  settlementLogs = [
    { id: "set-01", contractId: "con-init", title: "반응형 쇼핑몰 퍼블리싱", pricePaid: 4500000, date: "2026-07-01" }
  ];
  dashboardStats = {
    totalApplicants: 1,
    totalActiveProjects: 18
  };
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[TalentLink Backend] Express server running on http://localhost:${PORT}`);
});
