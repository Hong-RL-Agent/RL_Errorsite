import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5048;

app.use(cors());
app.use(express.json());

// Courses DB (Error 5 Target)
let courses = [
  { id: "course-01", name: "데이터 사이언스 입문" },
  { id: "course-02", name: "자료구조 및 알고리즘" },
  { id: "course-03", name: "이산수학 및 컴퓨터 통계" }
];

// Announcements DB
let announcements = [
  { id: "ann-01", courseId: "course-01", title: "중간 퀴즈 배점 및 시험범위 공지", date: "2026-07-10" },
  { id: "ann-02", courseId: "course-01", title: "머신러닝 팀 프로젝트 발표 일정 조율", date: "2026-07-12" },
  { id: "ann-03", courseId: "course-02", title: "그래프 탐색 실습용 서버 접속 가이드", date: "2026-07-09" },
  { id: "ann-04", courseId: "course-03", title: "베이즈 정리 연습문제 답안지 게재", date: "2026-07-11" }
];

// Assignments DB (Minimum 15 items)
let assignments = [
  // Course 1
  { id: "assign-01", courseId: "course-01", title: "파이썬 데이터 크롤링 실습 제출", description: "BeautifulSoup 패키지를 이용한 기상청 데이터 크롤링 및 CSV 저장.", deadline: "2026-07-16", isClosed: false },
  { id: "assign-02", courseId: "course-01", title: "Pandas 전처리 분석 과제", description: "주어진 타이타닉 승객 데이터 프레임 결측치 처리 및 그룹화 통계.", deadline: "2026-07-20", isClosed: false },
  { id: "assign-03", courseId: "course-01", title: "Matplotlib 시각화 그래프 보고서", description: "기온 변화량 분포 히스토그램 및 산점도 시각화 보고서.", deadline: "2026-07-25", isClosed: false },
  { id: "assign-04", courseId: "course-01", title: "선형 회귀 모델 예측 코드 제출", description: "Scikit-Learn 패키지를 활용한 주택 가격 예측 적합도 평가.", deadline: "2026-07-30", isClosed: false },
  { id: "assign-05", courseId: "course-01", title: "[과거마감] 텍스트 자연어 처리 요약본", description: "NLTK 기반 코퍼스 분석 기초 요약서 과제.", deadline: "2026-07-12", isClosed: true }, // Expired for Error 6
  
  // Course 2
  { id: "assign-06", courseId: "course-02", title: "싱글 링크드 리스트 구현 자율 과제", description: "자바스크립트 클래스를 활용한 삽입, 삭제 메소드 작성.", deadline: "2026-07-18", isClosed: false },
  { id: "assign-07", courseId: "course-02", title: "스택과 큐를 이용한 계산기 파싱", description: "중위 표기법 수식을 후위 표기법으로 변경하는 알고리즘.", deadline: "2026-07-22", isClosed: false },
  { id: "assign-08", courseId: "course-02", title: "이진 탐색 트리 순회 함수 코딩", description: "Pre-order, In-order, Post-order 방문 재귀 코드 구현.", deadline: "2026-07-28", isClosed: false },
  { id: "assign-09", courseId: "course-02", title: "퀵 정렬 vs 병합 정렬 시간측정", description: "배열 개수 100만 개 기준 정렬 수행 타임 스탬프 비교 레포트.", deadline: "2026-08-05", isClosed: false },
  { id: "assign-10", courseId: "course-02", title: "다익스트라 최단경로 길찾기 과제", description: "가중치 인접 행렬 테이블에서 출발지-목적지 최소 코스트 도출.", deadline: "2026-08-10", isClosed: false },
  
  // Course 3
  { id: "assign-11", courseId: "course-03", title: "명제 논리 논리표 작성 과제", description: "진리표를 그리는 자바스크립트 정규식 파서 제출.", deadline: "2026-07-15", isClosed: false },
  { id: "assign-12", courseId: "course-03", title: "순열과 조합 확률 계산 연습문제", description: "중복 조합 공식 증명 및 손글씨 스캔본 PDF 업로드.", deadline: "2026-07-24", isClosed: false },
  { id: "assign-13", courseId: "course-03", title: "포아송 분포 확률 질량 함수 과제", description: "단위 시간당 사건 발생률 기댓값 산포 분석.", deadline: "2026-07-29", isClosed: false },
  { id: "assign-14", courseId: "course-03", title: "가설 검정 p-value 유의 수준 작성", description: "귀무가설과 대립가설 설정 양측검정 기준 채택 여부 기술.", deadline: "2026-08-03", isClosed: false },
  { id: "assign-15", courseId: "course-03", title: "카이제곱 검정 적합도 평가서", description: "실제 관측 도수와 기대 도수 편차 합산 풀이.", deadline: "2026-08-12", isClosed: false }
];

// Submissions Registry DB
let submissions = [
  { id: "sub-101", assignmentId: "assign-01", fileName: "크롤링_결과제출_최종.zip", student: "김철수", submittedAt: "2026-07-13 14:00" }
];

// Course Grades DB
let grades = {
  "course-01": [
    { student: "김철수", score: 92, grade: "A0" },
    { student: "박영희", score: 87, grade: "B+" },
    { student: "이민우", score: 65, grade: "D+" },
    { student: "최지우", score: 98, grade: "A+" }
  ],
  "course-02": [
    { student: "김철수", score: 72, grade: "C+" },
    { student: "박영희", score: 95, grade: "A+" },
    { student: "이민우", score: 81, grade: "B0" },
    { student: "최지우", score: 89, grade: "B+" }
  ],
  "course-03": [
    { student: "김철수", score: 85, grade: "B+" },
    { student: "박영희", score: 79, grade: "C0" },
    { student: "이민우", score: 90, grade: "A0" },
    { student: "최지우", score: 94, grade: "A+" }
  ]
};

// Assignment Feedbacks DB
let feedbacks = {
  "assign-01": [
    { author: "조성태 교수", text: "데이터 크롤링 루틴이 안정적입니다. 예외 처리 코드도 잘 갖추었습니다." }
  ]
};

// Deadlines & Calendar Events DB (Error 5 Target)
let calendarEvents = [
  { id: "cal-01", courseId: "course-01", title: "크롤링 과제 마감", date: "2026-07-16" },
  { id: "cal-02", courseId: "course-01", title: "Pandas 과제 마감", date: "2026-07-20" },
  { id: "cal-03", courseId: "course-02", title: "링크드리스트 과제 마감", date: "2026-07-18" },
  { id: "cal-04", courseId: "course-03", title: "명제논리 과제 마감", date: "2026-07-15" }
];

// API: Get Courses & Announcements
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

app.get('/api/announcements', (req, res) => {
  res.json(announcements);
});

// API: Get Assignments
app.get('/api/assignments', (req, res) => {
  res.json(assignments);
});

// API: Search Assignments (Error 4 search query delay race condition)
app.get('/api/assignments/search', (req, res) => {
  const { q } = req.query;
  let delay = 100;

  if (q === '데이터') {
    delay = 3000;
  } else if (q === '알고리즘') {
    delay = 1000;
  } else if (q === '수학') {
    delay = 200;
  }

  setTimeout(() => {
    const results = assignments.filter(a => a.title.includes(q) || a.description.includes(q));
    res.json({ q, results });
  }, delay);
});

// API: Get Submissions
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// API: Submit Assignment (Error 6 past-deadline bypass check & Error 1 submission handler)
app.post('/api/submissions', (req, res) => {
  const { assignmentId, fileName, student, isClosed } = req.body;
  const newSub = {
    id: `sub-${Date.now()}`,
    assignmentId,
    fileName,
    student: student || "김철수",
    submittedAt: new Date().toLocaleString()
  };

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 과제가 마감(isClosed === true)되었을 때 HTTP 403 Forbidden 상태 코드를 반환하여 
  // 거절된 것 마냥 보이지만, 실제로는 제출 파일의 메타데이터(`submissions` 리스트)를 데이터베이스에 
  // 저장해 버려 규정 외 무단 제출 우회가 가능해지는 취약 결함을 안고 있습니다.
  if (isClosed) {
    submissions.push(newSub);
    console.log(`[DEADLINE BYPASS] Expired assignment ${assignmentId} submitted. Returned 403 but saved to DB!`);
    return res.status(403).json({
      error: "오류: 해당 과제는 마감 기한이 지난 건으로 더 이상 파일 업로드 제출이 불가능합니다."
    });
  }

  submissions.push(newSub);
  console.log(`[DB submissions] Assignment ${assignmentId} submitted successfully.`);
  res.json({ success: true, submission: newSub });
});

// API: Replace Submission File (Error 2 replace-cancel race)
app.put('/api/submissions/:id', (req, res) => {
  const { id } = req.params;
  const { fileName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 과제 파일 재업로드(교체) 요청에 3000ms(3초) 인위적 처리 지연을 설정합니다.
  // 교체 직후 즉시 제출 취소(DELETE, 즉각처리)를 실행하여 원본이 삭제되더라도, 
  // 3초 후 완료되는 교체 핸들러가 해당 ID의 과제 제출 기록을 강제 원복(Recreate) 기입하여 복구시킵니다.
  setTimeout(() => {
    const sub = submissions.find(s => s.id === id);
    if (sub) {
      sub.fileName = fileName;
      console.log(`[DB SUBMISSION] Replaced file to: ${fileName}`);
    } else {
      // Recreate deleted submission
      submissions.push({
        id,
        assignmentId: "assign-01",
        fileName,
        student: "김철수",
        submittedAt: new Date().toLocaleString()
      });
      console.log(`[DB SUBMISSION RACE] Re-inserted canceled submission ${id} due to delayed update!`);
    }
  }, 3000);

  res.json({ success: true });
});

// API: Cancel Submission (Error 2 cancels instantly)
app.delete('/api/submissions/:id', (req, res) => {
  const { id } = req.params;
  submissions = submissions.filter(s => s.id !== id);
  console.log(`[DB SUBMISSION] Canceled (deleted) submission ${id} instantly.`);
  res.json({ success: true });
});

// API: Delete Course (Error 5 leaves calendarEvents intact)
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  
  // Remove course from courses list
  courses = courses.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 강의 정보를 영구 소거하지만, 해당 강의의 과제 일정 및 캘린더에 연동된 마감 데이터(`calendarEvents`)를
  // 연쇄 삭제(Cascade Delete)하지 않고 고아 데이터로 방치하여 캘린더 화면에 꼬리표 일정이 계속 유지되게 만듭니다.
  console.log(`[DB LECTURES] Course ${id} deleted, but calendar deadline alerts remain in database.`);
  
  res.json({ success: true });
});

// API: Get Grades
app.get('/api/grades', (req, res) => {
  res.json(grades);
});

// API: Get Feedbacks
app.get('/api/feedbacks', (req, res) => {
  res.json(feedbacks);
});

// API: Get Calendar Events
app.get('/api/calendar', (req, res) => {
  res.json(calendarEvents);
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  courses = [
    { id: "course-01", name: "데이터 사이언스 입문" },
    { id: "course-02", name: "자료구조 및 알고리즘" },
    { id: "course-03", name: "이산수학 및 컴퓨터 통계" }
  ];
  submissions = [
    { id: "sub-101", assignmentId: "assign-01", fileName: "크롤링_결과제출_최종.zip", student: "김철수", submittedAt: "2026-07-13 14:00" }
  ];
  calendarEvents = [
    { id: "cal-01", courseId: "course-01", title: "크롤링 과제 마감", date: "2026-07-16" },
    { id: "cal-02", courseId: "course-01", title: "Pandas 과제 마감", date: "2026-07-20" },
    { id: "cal-03", courseId: "course-02", title: "링크드리스트 과제 마감", date: "2026-07-18" },
    { id: "cal-04", courseId: "course-03", title: "명제논리 과제 마감", date: "2026-07-15" }
  ];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[LearnDesk Backend] Express server running on http://localhost:${PORT}`);
});
