import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5028;

app.use(cors());
app.use(express.json());

// Projects Database
let projects = [
  { id: "proj-1", name: "NextGen ERP Portal" },
  { id: "proj-2", name: "Mobile App v2.0" },
  { id: "proj-3", name: "Cloud Security Patch" }
];

// Tasks Master Database (15 items)
let tasks = [
  { id: "task-01", title: "ERP 로그인 페이지 레이아웃", description: "신규 퍼플 테마 레이아웃 퍼블리싱 코딩", status: "TODO", projectId: "proj-1", priority: "High", assignee: "이지혜 디자이너", due: "2026-08-01" },
  { id: "task-02", title: "React 18 마이그레이션", description: "기존 v16 코드베이스 신규 마이그레이션 기획", status: "IN_PROGRESS", projectId: "proj-1", priority: "High", assignee: "박현우 개발자", due: "2026-07-28" },
  { id: "task-03", title: "모바일 생체 인증 연동", description: "안드로이드 지문 및 iOS FaceID 네이티브 웹뷰 브릿지 연동", status: "TODO", projectId: "proj-2", priority: "Medium", assignee: "박현우 개발자", due: "2026-08-10" },
  { id: "task-04", title: "인증 만료 세션 로그아웃 테스트", description: "토큰 만료 시간 경과 시 클라이언트 쿠키 제거 및 세션 파기 검증", status: "REVIEW", projectId: "proj-2", priority: "Low", assignee: "최소희 QA", due: "2026-07-30" },
  { id: "task-05", title: "클라우드 IAM 접근 제어 설정", description: "개발자 직무 권한 분리 및 AWS IAM 보안 롤 최적화 설계", status: "DONE", projectId: "proj-3", priority: "High", assignee: "김민우 PM", due: "2026-07-20" },
  { id: "task-06", title: "ERP 인사 데이터 연동 API", description: "RESTful HR 데이터 연동을 위한 백엔드 인터페이스 구축", status: "TODO", projectId: "proj-1", priority: "Medium", assignee: "박현우 개발자", due: "2026-08-05" },
  { id: "task-07", title: "모바일 가이드 온보딩 일러스트", description: "신규 가입 유저용 튜토리얼 일러스트 스케치 작업", status: "DONE", projectId: "proj-2", priority: "Low", assignee: "이지혜 디자이너", due: "2026-07-15" },
  { id: "task-08", title: "SSL 인증서 갱신 자동화 스크립트", description: "Let's Encrypt 인증서 크론탭 자동 연장 스크립트 가동", status: "IN_PROGRESS", projectId: "proj-3", priority: "High", assignee: "김민우 PM", due: "2026-07-31" },
  { id: "task-09", title: "ERP 대시보드 SVG 도넛 차트", description: "리포팅 툴 라이브러리를 걷어내고 순수 SVG 드로잉 컴포넌트 설계", status: "REVIEW", projectId: "proj-1", priority: "Medium", assignee: "이지혜 디자이너", due: "2026-07-29" },
  { id: "task-10", title: "알림 푸시 서버 소켓 연동", description: "담당자 업무 배정 시 실시간 알람용 웹소켓 인터페이스 구성", status: "TODO", projectId: "proj-1", priority: "High", assignee: "박현우 개발자", due: "2026-08-12" },
  { id: "task-11", title: "모바일 태블릿 반응형 레이아웃 패치", Description: "iPad 해상도 대응 미디어쿼리 스타일 수정", status: "IN_PROGRESS", projectId: "proj-2", priority: "Medium", assignee: "이지혜 디자이너", due: "2026-08-02" },
  { id: "task-12", title: "기본 비밀번호 만료 정책 도입", description: "90일 주기 만료에 따른 비밀번호 변경 팝업 화면 구현", status: "DONE", projectId: "proj-3", priority: "Medium", assignee: "최소희 QA", due: "2026-07-18" },
  { id: "task-13", title: "모바일 결제 연동 검인", description: "이니시스 콜백 가상계좌 입금 데이터 연동 검인 테스트", status: "REVIEW", projectId: "proj-2", priority: "High", assignee: "최소희 QA", due: "2026-07-26" },
  { id: "task-14", title: "DDoS 모의 침투 방어 시뮬레이션", description: "웹 방화벽 WAF 차단 룰 활성화 상태에서 트래픽 침투 테스트", status: "TODO", projectId: "proj-3", priority: "High", assignee: "김민우 PM", due: "2026-08-15" },
  { id: "task-15", title: "ERP 정산 배치 쿼리 튜닝", description: "월간 거래액 통계 배치 속도 단축을 위한 인덱스 튜닝", status: "DONE", projectId: "proj-1", priority: "High", assignee: "박현우 개발자", due: "2026-07-22" }
];

// Comments Database
let comments = [
  { id: "comm-1", taskId: "task-02", author: "김민우 PM", content: "마이그레이션 중 종속성 충돌이 있는지 확인 부탁드려요.", date: "2026-07-20" },
  { id: "comm-2", taskId: "task-02", author: "박현우 개발자", content: "예, 바벨 플러그인 2개만 버전 업그레이드하면 이상 없습니다.", date: "2026-07-21" },
  { id: "comm-3", taskId: "task-09", author: "이지혜 디자이너", content: "SVG 도넛 차트 호버 모션을 가볍게 개선했습니다.", date: "2026-07-24" }
];

// Activity Logs Database
let logs = [
  { id: 101, text: "김민우 PM이 'DDoS 모의 침투 방어 시뮬레이션' 업무를 추가했습니다.", time: "1시간 전" },
  { id: 102, text: "박현우 개발자가 'React 18 마이그레이션' 상태를 IN_PROGRESS로 이동했습니다.", time: "2시간 전" },
  { id: 103, text: "이지혜 디자이너가 'ERP 로그인 페이지 레이아웃'의 담당자로 배정되었습니다.", time: "4시간 전" }
];

// API: Get projects
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// API: Create project
app.post('/api/projects', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "프로젝트 이름을 입력해 주세요." });
  }
  const newProj = { id: `proj-${Date.now()}`, name };
  projects.push(newProj);
  res.status(201).json(newProj);
});

// API: Get tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// API: Create task (Error 2)
app.post('/api/tasks', (req, res) => {
  const { title, description, projectId, assignee, priority, due } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 업무 추가 시 제목(title)은 완전히 공백 상태이고 설명(description) 내용만 기입되었을 경우, 
  // 입력 유효성 경고(400) 대신 백엔드 타이틀 인스턴스 해제 오류를 가장하여 HTTP 500 에러를 강제 리턴합니다.
  if ((!title || title.trim() === '') && (description && description.trim() !== '')) {
    return res.status(500).json({
      error: "Internal Server Error: NullPointerException - Task title parameter was passed as null."
    });
  }

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: "업무 제목을 채워주십시오." });
  }

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    description: description || '',
    status: "TODO",
    projectId: projectId || "proj-1",
    priority: priority || "Medium",
    assignee: assignee || "미배정",
    due: due || new Date().toISOString().split('T')[0]
  };

  tasks.push(newTask);
  logs.unshift({ id: Date.now(), text: `${newTask.assignee}에게 새 업무 '${newTask.title}'이 배정되었습니다.`, time: "방금 전" });
  res.status(201).json(newTask);
});

// API: Update task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status, assignee, priority, due, title, description } = req.body;

  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "업무를 찾을 수 없습니다." });
  }

  tasks[idx] = {
    ...tasks[idx],
    status: status !== undefined ? status : tasks[idx].status,
    assignee: assignee !== undefined ? assignee : tasks[idx].assignee,
    priority: priority !== undefined ? priority : tasks[idx].priority,
    due: due !== undefined ? due : tasks[idx].due,
    title: title !== undefined ? title : tasks[idx].title,
    description: description !== undefined ? description : tasks[idx].description
  };

  res.json({ success: true, task: tasks[idx] });
});

// API: Delete task (Error 3)
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  tasks = tasks.filter(t => t.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 업무(Task)를 삭제할 때 업무 배열에서 해당 카드는 깔끔하게 제거해 주지만, 
  // 해당 업무 번호에 달려 있던 댓글 테이블/리스트(comments) 정보는 정리하지 않고 그대로 남겨 둡니다. 
  // 이로 인해 무결성이 붕괴된 댓글 고아 데이터가 DB 메모리에 축적되는 결함을 유발합니다.
  // 원래 진행되어야 하는 관련 댓글 삭제 쿼리 생략:
  // comments = comments.filter(c => c.taskId !== id);

  res.json({ success: true, tasks });
});

// API: Get comments
app.get('/api/comments', (req, res) => {
  res.json(comments);
});

// API: Create comment
app.post('/api/comments', (req, res) => {
  const { taskId, author, content } = req.body;
  if (!taskId || !content) {
    return res.status(400).json({ error: "업무 번호와 댓글 본문은 필수 입력값입니다." });
  }
  const newComm = {
    id: `comm-${Date.now()}`,
    taskId,
    author: author || "익명 협업자",
    content,
    date: new Date().toISOString().split('T')[0]
  };
  comments.push(newComm);
  res.status(201).json(newComm);
});

// API: Get activity logs
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// API: File Upload simulator (Error 5)
app.post('/api/tasks/:id/upload', (req, res) => {
  const { filename } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Infrastructure
  // DESCRIPTION: 파일 첨부 업로드 시, 호스트 컴퓨터 운영체제(윈도우) 환경에 맞지 않는 
  // 리눅스 경로 규격인 '/var/teamgrid/uploads' 디렉토리로 파일 쓰기를 감행하여 
  // 윈도우 시스템 상에서 ENOENT 디렉토리 누락 시스템 예외 오류를 유발하게 만듭니다.
  const badPath = `/var/teamgrid/uploads/${filename}`;
  console.log(`[Infrastructure Fault] Writing file payload to case path: ${badPath}`);

  res.status(500).json({
    error: `Infrastructure Exception: Directory path '/var/teamgrid/uploads' not found (ENOENT) on current host device.`
  });
});

app.listen(PORT, () => {
  console.log(`[TeamGrid Backend] Express server running on http://localhost:${PORT}`);
});
