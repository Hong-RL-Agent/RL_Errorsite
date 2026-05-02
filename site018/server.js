const express = require('express');
const path = require('path');
const app = express();
const PORT = 9347;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let jobs = Array.from({ length: 25 }, (_, i) => ({
  id: `job-${i + 1}`,
  title: `${['백엔드', '프론트엔드', '데이터 엔지니어', '모바일'][i % 4]} 신입 개발자 채용`,
  company: `테크컴퍼니 ${String.fromCharCode(65 + (i % 5))}`,
  position: i % 2 === 0 ? 'Backend' : 'Frontend',
  experience: '신입',
  salary: `${3500 + (i * 50)}만원`,
  location: i % 3 === 0 ? '서울 강남구' : '경기 성남시',
  tags: ['Spring Boot', 'React', 'Python', 'AWS'].slice(0, (i % 4) + 1)
}));

let applications = [
  { id: 'app-101', jobId: 'job-1', user: '김신입', status: '서류검토중', appliedAt: '2024-05-01' },
  { id: 'app-999', jobId: 'job-5', user: '나해커', status: '최종합격', appliedAt: '2024-04-20', secretNote: '연봉 협상 완료: 8000만원' }
];

let savedJobs = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'JobStarter API is running' });
});

// API: Get Jobs with Pagination & Filter
app.get('/api/jobs', (req, res) => {
  let { page = 1, limit = 10, position } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  // INTENTIONAL BUG: site018-bug02
  // CSV Error: 네트워크 요청 파라미터 손실
  // Type: network-query-param
  // Description: 필터 API가 일부 query parameter를 무시하여 직무 필터 결과가 부정확함.
  // 'position' 필터를 의도적으로 무시하거나 처리하지 않음
  let filteredJobs = jobs; 
  // if (position) filteredJobs = jobs.filter(j => j.position === position); // 버그: 이 로직을 생략함

  // INTENTIONAL BUG: site018-bug01
  // CSV Error: DB 페이징 오류
  // Type: database-pagination
  // Description: page 파라미터 계산이 잘못되어 일부 채용 공고가 중복 또는 누락됨.
  // 원래는 (page-1) * limit 이어야 함. 고의로 +2를 하여 데이터가 꼬이게 함.
  const startIdx = (page - 1) * limit + 2; 
  const endIdx = startIdx + limit;
  const paginatedJobs = filteredJobs.slice(startIdx, endIdx);

  res.json({
    total: filteredJobs.length,
    page,
    limit,
    data: paginatedJobs
  });
});

app.get('/api/companies', (req, res) => {
  res.json([
    { name: '테크컴퍼니 A', industry: '핀테크', size: '100-500명' },
    { name: '테크컴퍼니 B', industry: '이커머스', size: '500명 이상' }
  ]);
});

// API: Application Details
// INTENTIONAL BUG: site018-bug03
// CSV Error: 비인가 지원 현황 조회
// Type: security-authorization
// Description: applicationId만 알면 다른 사용자의 지원 현황을 조회할 수 있음.
app.get('/api/applications/:id', (req, res) => {
  const appDetail = applications.find(a => a.id === req.params.id);
  
  if (!appDetail) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // 보안 취약점: 현재 사용자가 이 지원의 주인인지 확인하는 로직이 없음 (IDOR)
  res.json(appDetail);
});

app.get('/api/saved-jobs', (req, res) => {
  res.json(savedJobs);
});

app.post('/api/saved-jobs', (req, res) => {
  const { jobId } = req.body;
  if (!savedJobs.includes(jobId)) savedJobs.push(jobId);
  res.status(201).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
