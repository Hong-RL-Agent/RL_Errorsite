import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5008;

app.use(cors());
app.use(express.json());

// Jobs local database
let jobs = [
  { id: "job-01", title: "Senior React Developer", company: "토스 (Toss)", role: "개발", region: "서울", desc: "토스의 프론트엔드 전반을 이끌어갈 시니어 웹 서비스 리드 엔지니어를 모십니다." },
  { id: "job-02", title: "Node.js Platform Engineer", company: "카카오 (Kakao)", role: "개발", region: "경기", desc: "대용량 트래픽 및 Express 마이크로서비스 설계 엔지니어를 충원합니다." },
  { id: "job-03", title: "Product UI/UX Designer", company: "네이버 (Naver)", role: "디자인", region: "서울", desc: "네이버 신규 모빌리티 플랫폼의 인터페이스 설계를 함께 고민할 디자이너를 모십니다." },
  { id: "job-04", title: "Growth Marketing Specialist", company: "쿠팡 (Coupang)", role: "마케팅", region: "서울", desc: "쿠팡 와우 멤버십 마케팅 플랜 및 디지털 유입 캠페인을 집행할 전문가를 모십니다." },
  { id: "job-05", title: "DevOps & Infra Architect", company: "당근마켓 (Daangn)", role: "개발", region: "제주", desc: "당근 서비스의 AWS 클라우드 아키텍처 다중화 및 배포 자동화 프로세스를 주도합니다." }
];

// Applications local database
let applications = [
  { id: "app-101", jobId: "job-01", applicantName: "김지원", coverLetter: "웹 개발 경력 5년차 김지원입니다.", stage: "서류합격", resumeName: "resume_kim.pdf" },
  { id: "app-102", jobId: "job-02", applicantName: "박동진", coverLetter: "서버 백엔드 백본 망 구축 가능합니다.", stage: "면접", resumeName: "resume_park.pdf" }
];

// API: Get jobs list
app.get('/api/jobs', (req, res) => {
  res.json(jobs);
});

// API: Get applications list
app.get('/api/applications', (req, res) => {
  res.json(applications);
});

// API: Create new application (Error 2)
app.post('/api/applications', (req, res) => {
  const { jobId, applicantName, coverLetter, resumeName } = req.body;

  if (!jobId || !applicantName || !coverLetter) {
    return res.status(400).json({ error: "필수 정보(공고 ID, 지원자 이름, 자기소개서)가 누락되었습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 자기소개서 내용에 '<script>' 보안 주입 검출용 특정 태그 문자열이 감지될 경우, 
  // 정상적인 스크립트 필터 제한 에러(HTTP 400 Bad Request) 대신 내부 구문 분석 예외를 모방한 
  // HTTP 500 Internal Server Error 상태 코드를 전송하여 에러 처리를 왜곡합니다.
  if (coverLetter && coverLetter.includes('<script>')) {
    return res.status(500).json({
      error: "Internal Server Error: ScriptExecutionParserException - Security scan failed at filter scope. script injection detected."
    });
  }

  const newApp = {
    id: `app-${Date.now()}`,
    jobId,
    applicantName,
    coverLetter,
    stage: "지원",
    resumeName: resumeName || "default_resume.pdf"
  };

  applications.push(newApp);
  res.status(201).json(newApp);
});

// API: Update stage of job application (Error 3)
app.post('/api/applications/:id/stage', (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;

  const appItem = applications.find(a => a.id === id);
  if (!appItem) {
    return res.status(404).json({ error: "지원서 내역을 찾을 수 없습니다." });
  }

  const oldStage = appItem.stage;

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 지원 단계를 '면접'에서 '지원'으로 뒤로 강제 강등(이동)하려 시도할 때,
  // 백엔드 메모리 DB 상태 값을 갱신하지 않고 성공 응답(200)만 줌으로써, 화면에서는 정상 
  // 이동되는 듯 보이나 새로고침 시 다시 '면접' 상태로 강제 롤백되는 무결성 우회 코드를 구현합니다.
  if (oldStage === '면접' && stage === '지원') {
    // DB 데이터 업데이트 작업(appItem.stage = stage)을 고의로 생략함
    return res.json({ success: true, application: appItem });
  }

  appItem.stage = stage;
  res.json({ success: true, application: appItem });
});

// API: Get interview schedule list (Error 5)
app.get('/api/interviews', (req, res) => {
  const { user } = req.query;

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 사용자 이름 쿼리 파라미터가 'tester'인 경우, 
  // 정상 일정을 반환하지 않고 HTTP 503 Service Unavailable 상태 코드를 반환하여 
  // 특정 계정에서 마이크로서비스 지연 및 차단 현상을 발생시킵니다.
  if (user === 'tester') {
    return res.status(503).json({
      error: "Service Unavailable: Interview Scheduling cluster is currently unreachable. Please try again later."
    });
  }

  const mockInterviews = [
    { id: "int-201", jobTitle: "Senior React Developer (토스)", date: "2026-07-10 14:00", type: "화상 면접" },
    { id: "int-202", jobTitle: "Node.js Platform Engineer (카카오)", date: "2026-07-15 11:00", type: "대면 면접 (카카오 판교오피스)" }
  ];

  res.json(mockInterviews);
});

// API: Mock resume file upload
app.post('/api/resumes/upload', (req, res) => {
  const { filename } = req.body;
  res.json({ success: true, filename, url: `/uploads/${encodeURIComponent(filename)}` });
});

// File serve downloader (Error 4)
app.get('/uploads/:filename', (req, res) => {
  const rawUrl = req.originalUrl;

  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: 한글 파일 다운로드 시, URL 디코딩(decodeURIComponent)을 수행하지 않고 
  // 원본 리퀘스트 주소(req.originalUrl)에서 퍼센트 기호(%)가 감지되면 파일을 찾지 못하게 차단하여 
  // 한글 이력서 파일 링크 클릭 시 404 에러가 뜨도록 유발합니다.
  if (rawUrl.includes('%')) {
    return res.status(404).send("File Not Found - Case-sensitive & Unescaped lookup mismatch (Korean/non-ASCII filename error)");
  }

  res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.filename);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(`Mock Binary Data content for resume file: ${req.params.filename}`);
});

app.listen(PORT, () => {
  console.log(`[HireBoard Backend] Express server running on http://localhost:${PORT}`);
});
