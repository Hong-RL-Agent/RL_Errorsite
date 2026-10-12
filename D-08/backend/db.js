const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'teamorbit.db');
const db = new sqlite3.Database(DB_PATH);

// 6대 프로젝트
const INITIAL_PROJECTS = [
  { id: 1, name: 'Orbit Core Platform', key: 'CORE', description: '핵심 분산 백엔드 및 클라우드 인프라 아키텍처', color: '#7c3aed', slack_notification: 1, email_digest: 1, member_count: 8 },
  { id: 2, name: 'Orbit Mobile App', key: 'MOB', description: 'iOS 및 Android 크로스 플랫폼 앱 2.0 고도화', color: '#3b82f6', slack_notification: 1, email_digest: 1, member_count: 6 },
  { id: 3, name: 'Orbit Data Pipeline', key: 'DATA', description: '실시간 스트리밍 ETL 및 비즈니스 인텔리전스', color: '#059669', slack_notification: 1, email_digest: 1, member_count: 5 },
  { id: 4, name: 'Orbit Design System', key: 'DSN', description: '일관된 사용자 경험을 위한 UI/UX 디자인 시스템', color: '#d97706', slack_notification: 0, email_digest: 0, member_count: 4 },
  { id: 5, name: 'Orbit Billing & SaaS', key: 'BILL', description: '글로벌 결제 PG 연동 및 구독 플랜 관리 엔진', color: '#e11d48', slack_notification: 1, email_digest: 1, member_count: 5 },
  { id: 6, name: 'Orbit Security & Audit', key: 'SEC', description: '정보보안 거버넌스 및 ISO27001 컴플라이언스', color: '#0891b2', slack_notification: 1, email_digest: 1, member_count: 4 }
];

// 18명 팀원
const INITIAL_MEMBERS = [
  { id: 1, name: '김도현', role: '플랫폼 팀장 / 아키텍트', email: 'dohyun.kim@orbit.team', avatar: '👨‍💼' },
  { id: 2, name: '윤지아', role: '수석 백엔드 엔지니어', email: 'jia.yoon@orbit.team', avatar: '👩‍💻' },
  { id: 3, name: '최영진', role: '인프라/데브옵스 엔지니어', email: 'youngjin.choi@orbit.team', avatar: '🧑‍💻' },
  { id: 4, name: '이서진', role: '모바일 테크 리드', email: 'seojin.lee@orbit.team', avatar: '👨‍💻' },
  { id: 5, name: '강수현', role: 'iOS 전문 개발자', email: 'suhyun.kang@orbit.team', avatar: '👩‍💻' },
  { id: 6, name: '조민석', role: 'Android 전문 개발자', email: 'minseok.cho@orbit.team', avatar: '🧑‍💻' },
  { id: 7, name: '박준호', role: '데이터 플랫폼 리드', email: 'junho.park@orbit.team', avatar: '👨‍💼' },
  { id: 8, name: '임나영', role: '데이터 엔지니어', email: 'nayoung.lim@orbit.team', avatar: '👩‍💻' },
  { id: 9, name: '황준서', role: 'BI & 분석가', email: 'junseo.hwang@orbit.team', avatar: '🧑‍💻' },
  { id: 10, name: '정유진', role: '프로덕트 디자인 리드', email: 'yujin.jung@orbit.team', avatar: '👩‍🎨' },
  { id: 11, name: '한태양', role: 'UI/UX 디자이너', email: 'taeyang.han@orbit.team', avatar: '👨‍🎨' },
  { id: 12, name: '안재민', role: '디자인 시스템 엔지니어', email: 'jaemin.ahn@orbit.team', avatar: '🧑‍🎨' },
  { id: 13, name: '백선영', role: '빌링 백엔드 리드', email: 'sunyoung.baek@orbit.team', avatar: '👩‍💻' },
  { id: 14, name: '노진우', role: '결제 시스템 개발자', email: 'jinwoo.noh@orbit.team', avatar: '👨‍💻' },
  { id: 15, name: '김시윤', role: '보안 책임자 (CISO)', email: 'siyoon.kim@orbit.team', avatar: '👨‍💼' },
  { id: 16, name: '오승우', role: '보안 감사원', email: 'seungwoo.oh@orbit.team', avatar: '🧑‍💻' },
  { id: 17, name: '송하늘', role: '프로덕트 매니저 (PM)', email: 'haneul.song@orbit.team', avatar: '👩‍💼' },
  { id: 18, name: '장우혁', role: 'QA 및 릴리즈 매니저', email: 'woohyuk.jang@orbit.team', avatar: '👨‍🔧' }
];

// 초기 54개 업무 카드 생성
function generateInitialTasks() {
  const tasks = [];
  const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  const titles = [
    // Project 1 (CORE): 1~9
    { proj: 1, title: 'Kubernetes 1.30 업그레이드', priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: 1, assigneeName: '김도현' }, // id: 1 (BUG-D08-03 왜곡 대상)
    { proj: 1, title: 'API 게이트웨이 레이트 리미팅 구현', priority: 'MEDIUM', status: 'TODO', assigneeId: 2, assigneeName: '윤지아' },
    { proj: 1, title: 'Redis 세션 클러스터 이중화', priority: 'HIGH', status: 'TODO', assigneeId: 3, assigneeName: '최영진' }, // id: 3 (BUG-D08-03 선택 대상)
    { proj: 1, title: 'gRPC 마이크로서비스 인터페이스 정의', priority: 'LOW', status: 'DONE', assigneeId: 1, assigneeName: '김도현' },
    { proj: 1, title: 'MySQL 쿼리 인덱스 최적화', priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: 2, assigneeName: '윤지아' }, // id: 5 (BUG-D08-02 댓글 보유)
    { proj: 1, title: '분산 트랜잭션 사가(Saga) 패턴 도입', priority: 'MEDIUM', status: 'REVIEW', assigneeId: 3, assigneeName: '최영진' },
    { proj: 1, title: '프로메테우스 메트릭 수집 파이프라인 구축', priority: 'LOW', status: 'DONE', assigneeId: 1, assigneeName: '김도현' },
    { proj: 1, title: 'TLS 1.3 암호화 프로토콜 강제화', priority: 'MEDIUM', status: 'TODO', assigneeId: 2, assigneeName: '윤지아' },
    { proj: 1, title: 'CI/CD 빌드 캐싱 최적화', priority: 'LOW', status: 'DONE', assigneeId: 3, assigneeName: '최영진' },

    // Project 2 (MOB): 10~18
    { proj: 2, title: 'Flutter 엔진 버전 마이그레이션', priority: 'MEDIUM', status: 'DONE', assigneeId: 4, assigneeName: '이서진' },
    { proj: 2, title: 'iOS 다크모드 위젯 인터페이스 버그 수정', priority: 'LOW', status: 'TODO', assigneeId: 5, assigneeName: '강수현' },
    { proj: 2, title: 'Android 백그라운드 푸시 노티피케이션 안정화', priority: 'HIGH', status: 'REVIEW', assigneeId: 6, assigneeName: '조민석' },
    { proj: 2, title: '오프라인 캐시 및 동기화 엔진 개발', priority: 'HIGH', status: 'TODO', assigneeId: 4, assigneeName: '이서진' },
    { proj: 2, title: '모바일 인앱 결제 모듈 리팩토링', priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: 5, assigneeName: '강수현' }, // id: 14 (BUG-D08-01 완료 버튼 대상)
    { proj: 2, title: '소셜 로그인(애플/카카오) SDK 최신화', priority: 'MEDIUM', status: 'DONE', assigneeId: 6, assigneeName: '조민석' },
    { proj: 2, title: '이미지 프리페칭 성능 30% 개선', priority: 'LOW', status: 'TODO', assigneeId: 4, assigneeName: '이서진' },
    { proj: 2, title: '앱 최초 온보딩 튜토리얼 개편', priority: 'MEDIUM', status: 'DONE', assigneeId: 5, assigneeName: '강수현' },
    { proj: 2, title: '태블릿 가로모드 반응형 레이아웃 대응', priority: 'LOW', status: 'TODO', assigneeId: 6, assigneeName: '조민석' },

    // Project 3 (DATA): 19~27
    { proj: 3, title: 'Kafka 파티션 리밸런싱 모니터링', priority: 'HIGH', status: 'DONE', assigneeId: 7, assigneeName: '박준호' },
    { proj: 3, title: 'Spark 대용량 로그 일일 집계 배치 최적화', priority: 'MEDIUM', status: 'IN_PROGRESS', assigneeId: 8, assigneeName: '임나영' },
    { proj: 3, title: '실시간 CDC 파이프라인 지연 이슈 해결', priority: 'URGENT', status: 'IN_PROGRESS', assigneeId: 9, assigneeName: '황준서' }, // id: 21 (BUG-D08-04 타깃)
    { proj: 3, title: 'Snowflake 데이터 마트 테이블 스키마 재설계', priority: 'HIGH', status: 'TODO', assigneeId: 7, assigneeName: '박준호' },
    { proj: 3, title: 'Airflow DAG 의존성 데드락 해결', priority: 'MEDIUM', status: 'REVIEW', assigneeId: 8, assigneeName: '임나영' },
    { proj: 3, title: '유저 리텐션 코호트 분석 대시보드 제작', priority: 'LOW', status: 'DONE', assigneeId: 9, assigneeName: '황준서' },
    { proj: 3, title: '데이터 품질 검증 모니터링 룰셋 등록', priority: 'MEDIUM', status: 'TODO', assigneeId: 7, assigneeName: '박준호' },
    { proj: 3, title: '비정형 로그 파싱 정규식 성능 개선', priority: 'LOW', status: 'TODO', assigneeId: 8, assigneeName: '임나영' },
    { proj: 3, title: '데이터 카탈로그 및 메타데이터 동기화', priority: 'LOW', status: 'DONE', assigneeId: 9, assigneeName: '황준서' },

    // Project 4 (DSN): 28~36
    { proj: 4, title: 'Figma 디자인 토큰 v2.0 코드 생성기 구축', priority: 'HIGH', status: 'DONE', assigneeId: 10, assigneeName: '정유진' },
    { proj: 4, title: 'Accessible Dialog 컴포넌트 웹 접근성 심사', priority: 'MEDIUM', status: 'IN_PROGRESS', assigneeId: 11, assigneeName: '한태양' },
    { proj: 4, title: 'CSS-in-JS 번들 크기 경량화 리팩토링', priority: 'HIGH', status: 'REVIEW', assigneeId: 12, assigneeName: '안재민' },
    { proj: 4, title: '드롭다운 및 셀렉트 메뉴 키보드 내비게이션 지원', priority: 'MEDIUM', status: 'TODO', assigneeId: 10, assigneeName: '정유진' },
    { proj: 4, title: '데이터 테이블 정렬/필터 UI 표준 컴포넌트화', priority: 'HIGH', status: 'TODO', assigneeId: 11, assigneeName: '한태양' },
    { proj: 4, title: '디자인 시스템 Storybook 8.0 마이그레이션', priority: 'LOW', status: 'DONE', assigneeId: 12, assigneeName: '안재민' },
    { proj: 4, title: '차트 및 시각화 전용 컬러 팔레트 가이드 수립', priority: 'MEDIUM', status: 'DONE', assigneeId: 10, assigneeName: '정유진' },
    { proj: 4, title: '모바일 제스처 스와이프 인터랙션 프로토타입', priority: 'LOW', status: 'TODO', assigneeId: 11, assigneeName: '한태양' },
    { proj: 4, title: '아이콘 팩 SVG 에셋 120종 벡터 최적화', priority: 'LOW', status: 'DONE', assigneeId: 12, assigneeName: '안재민' },

    // Project 5 (BILL): 37~45
    { proj: 5, title: '토스페이먼츠 및 스트라이프 웹훅 멱등성 보장', priority: 'HIGH', status: 'DONE', assigneeId: 13, assigneeName: '백선영' },
    { proj: 5, title: '해외 통화(USD, JPY) 환율 자동 고시 엔진 연동', priority: 'MEDIUM', status: 'IN_PROGRESS', assigneeId: 14, assigneeName: '노진우' },
    { proj: 5, title: '기업 고객 전용 세금계산서 자동 발행 모듈', priority: 'HIGH', status: 'REVIEW', assigneeId: 13, assigneeName: '백선영' },
    { proj: 5, title: '월간/연간 플랜 변경 시 프로레이션(일할계산) 로직 검증', priority: 'HIGH', status: 'TODO', assigneeId: 14, assigneeName: '노진우' },
    { proj: 5, title: '정기 결제 실패 시 3회 스마트 재시도 큐 구축', priority: 'MEDIUM', status: 'DONE', assigneeId: 13, assigneeName: '백선영' },
    { proj: 5, title: '결제 취소 및 부분 환불 수수료 정산 API', priority: 'MEDIUM', status: 'TODO', assigneeId: 14, assigneeName: '노진우' },
    { proj: 5, title: '구독 만료 사전 알림 카카오 알림톡 템플릿 심사', priority: 'LOW', status: 'DONE', assigneeId: 13, assigneeName: '백선영' },
    { proj: 5, title: '대시보드 실시간 MRR(월간반복매출) 집계 캐시', priority: 'MEDIUM', status: 'TODO', assigneeId: 14, assigneeName: '노진우' },
    { proj: 5, title: '결제 보안 규제 PCI-DSS 체크리스트 감사 대응', priority: 'LOW', status: 'DONE', assigneeId: 13, assigneeName: '백선영' },

    // Project 6 (SEC): 46~54
    { proj: 6, title: 'AWS IAM 역할 최소 권한 원칙(POLP) 전수 검토', priority: 'HIGH', status: 'DONE', assigneeId: 15, assigneeName: '김시윤' },
    { proj: 6, title: '정적 코드 분석(SAST) 및 오픈소스 취약점 스캐너 연동', priority: 'MEDIUM', status: 'IN_PROGRESS', assigneeId: 16, assigneeName: '오승우' },
    { proj: 6, title: '직무 기반 접근 통제(RBAC) 감사 로그 실시간 알림', priority: 'HIGH', status: 'REVIEW', assigneeId: 15, assigneeName: '김시윤' },
    { proj: 6, title: '모의 해킹(Pen-test) 결과 발견 취약점 조치 패치', priority: 'URGENT', status: 'TODO', assigneeId: 16, assigneeName: '오승우' },
    { proj: 6, title: '사내 VPN 2차 인증(MFA) 강제화 정책 시행', priority: 'MEDIUM', status: 'DONE', assigneeId: 15, assigneeName: '김시윤' },
    { proj: 6, title: '데이터베이스 PII 개인정보 마스킹 필터 고도화', priority: 'HIGH', status: 'TODO', assigneeId: 16, assigneeName: '오승우' },
    { proj: 6, title: '임직원 정보보안 서약서 전자서명 자동화', priority: 'LOW', status: 'DONE', assigneeId: 15, assigneeName: '김시윤' },
    { proj: 6, title: '침해사고 대응 모의 훈련(SIRT) 시나리오 작성', priority: 'MEDIUM', status: 'TODO', assigneeId: 16, assigneeName: '오승우' },
    { proj: 6, title: '백업 데이터 불변성(WORM) 스토리지 보관 설정', priority: 'LOW', status: 'DONE', assigneeId: 15, assigneeName: '김시윤' }
  ];

  titles.forEach((t, idx) => {
    const id = idx + 1;
    const projKey = INITIAL_PROJECTS[t.proj - 1].key;
    const taskKey = `${projKey}-${100 + id}`;
    tasks.push({
      id,
      project_id: t.proj,
      task_key: taskKey,
      title: t.title,
      description: `${t.title}에 관한 상세 요구사항 명세 및 구현 계획서입니다.`,
      status: t.status,
      priority: t.priority,
      assignee_id: t.assigneeId,
      assignee_name: t.assigneeName,
      due_date: `2026-10-${(10 + (id % 18)).toString().padStart(2, '0')}`,
      created_at: '2026-10-01 09:00:00'
    });
  });

  return tasks;
}

// 초기 45개 댓글 생성
function generateInitialComments() {
  const comments = [];
  const authors = ['김도현', '윤지아', '최영진', '이서진', '강수현', '조민석', '박준호', '임나영', '황준서', '정유진'];

  for (let i = 1; i <= 45; i++) {
    const taskId = (i % 20) + 1;
    let content = `업무 진행 상황 공유드립니다. #${i} 검토 부탁드립니다.`;

    if (i === 8) {
      content = 'EXPLAIN 분석 결과 슬로우 쿼리 발생 확인';
    } else if (i === 9) {
      content = '인덱스 튜닝 쿼리 검토 완료했습니다'; // BUG-D08-02 타깃
    }

    comments.push({
      id: i,
      task_id: (i === 8 || i === 9) ? 5 : taskId,
      author_name: authors[(i - 1) % authors.length],
      content,
      created_at: `2026-10-0${1 + (i % 9)} 1${i % 10}:${(i * 3 % 60).toString().padStart(2, '0')}:00`
    });
  }
  return comments;
}

const SEED_TASKS = generateInitialTasks();
const SEED_COMMENTS = generateInitialComments();

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. projects 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          key TEXT UNIQUE NOT NULL,
          description TEXT,
          color TEXT NOT NULL,
          slack_notification INTEGER NOT NULL DEFAULT 1,
          email_digest INTEGER NOT NULL DEFAULT 1,
          member_count INTEGER NOT NULL DEFAULT 5
        )
      `);

      // 2. members 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS members (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          email TEXT NOT NULL,
          avatar TEXT NOT NULL
        )
      `);

      // 3. tasks 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          task_key TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL,
          priority TEXT NOT NULL,
          assignee_id INTEGER,
          assignee_name TEXT,
          due_date TEXT,
          created_at TEXT NOT NULL
        )
      `);

      // 4. comments 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          author_name TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      // 5. activity_logs 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          task_id INTEGER,
          actor TEXT NOT NULL,
          action TEXT NOT NULL,
          details TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      db.get('SELECT COUNT(*) AS count FROM tasks', (err, row) => {
        if (err) return reject(err);
        if (row && row.count === 0) {
          resetAllData().then(resolve).catch(reject);
        } else {
          resolve();
        }
      });
    });
  });
}

function resetAllData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM projects');
      db.run('DELETE FROM members');
      db.run('DELETE FROM tasks');
      db.run('DELETE FROM comments');
      db.run('DELETE FROM activity_logs');

      // 1. projects 삽입
      const stmtProj = db.prepare('INSERT INTO projects (id, name, key, description, color, slack_notification, email_digest, member_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      INITIAL_PROJECTS.forEach(p => {
        stmtProj.run(p.id, p.name, p.key, p.description, p.color, p.slack_notification, p.email_digest, p.member_count);
      });
      stmtProj.finalize();

      // 2. members 삽입
      const stmtMem = db.prepare('INSERT INTO members (id, name, role, email, avatar) VALUES (?, ?, ?, ?, ?)');
      INITIAL_MEMBERS.forEach(m => {
        stmtMem.run(m.id, m.name, m.role, m.email, m.avatar);
      });
      stmtMem.finalize();

      // 3. tasks 삽입
      const stmtTask = db.prepare('INSERT INTO tasks (id, project_id, task_key, title, description, status, priority, assignee_id, assignee_name, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      SEED_TASKS.forEach(t => {
        stmtTask.run(t.id, t.project_id, t.task_key, t.title, t.description, t.status, t.priority, t.assignee_id, t.assignee_name, t.due_date, t.created_at);
      });
      stmtTask.finalize();

      // 4. comments 삽입
      const stmtCom = db.prepare('INSERT INTO comments (id, task_id, author_name, content, created_at) VALUES (?, ?, ?, ?, ?)');
      SEED_COMMENTS.forEach(c => {
        stmtCom.run(c.id, c.task_id, c.author_name, c.content, c.created_at);
      });
      stmtCom.finalize();

      // 5. activity_logs 삽입
      const stmtLog = db.prepare('INSERT INTO activity_logs (project_id, task_id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?, ?)');
      for (let i = 1; i <= 50; i++) {
        const pId = (i % 6) + 1;
        const actor = INITIAL_MEMBERS[(i - 1) % INITIAL_MEMBERS.length].name;
        stmtLog.run(pId, i, actor, 'TASK_UPDATED', `업무 상태 및 세부사항 업데이트 #${i}`, `2026-10-0${1 + (i % 9)} 1${i % 10}:00:00`);
      }
      stmtLog.finalize((err) => {
        if (err) reject(err);
        else resolve({ projects: INITIAL_PROJECTS.length, members: INITIAL_MEMBERS.length, tasks: SEED_TASKS.length, comments: SEED_COMMENTS.length });
      });
    });
  });
}

module.exports = {
  db,
  initDatabase,
  resetAllData,
  INITIAL_PROJECTS,
  INITIAL_MEMBERS,
  SEED_TASKS,
  SEED_COMMENTS
};
