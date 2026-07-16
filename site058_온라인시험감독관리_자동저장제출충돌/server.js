import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5058;

app.use(cors());
app.use(express.json());

// Exam List Database
let exams = [
  { id: "ex-101", title: "인공지능 공학 중간고사", duration: 50, status: "READY" },
  { id: "ex-102", title: "알고리즘 및 자료구조 기말평가", duration: 60, status: "READY" }
];

// Question bank (Minimum 25 items)
let questions = [];
for (let i = 1; i <= 25; i++) {
  questions.push({
    id: `q-${String(i).padStart(2, '0')}`,
    num: i,
    text: `[단답형 문항 ${i}] 다음 중 설명에 부합하는 정답 및 핵심 개념 키워드를 기입하시오. (상세 질문 코드: Q${i * 3})`,
    points: 4,
    correctKeyword: "인공지능"
  });
}

// Student Answer Storage
let userAnswers = {};
let examStatus = "ONGOING"; // ONGOING | SUBMITTED
let submissionTime = null;

// Submission logs / reports backup (Error 5 Target)
let submissionsHistory = [
  { id: "subhist-01", student: "학생 A", examId: "ex-101", score: 84, answers: { "q-01": "인공지능", "q-02": "머신러닝" } }
];

// Proctoring logs
let proctorLogs = [
  { time: "10:02:11", type: "INFO", msg: "학생 안면 인식 및 신원 검증 승인 완료" },
  { time: "10:05:44", type: "WARN", msg: "브라우저 화면 포커스 이탈 감지 (경고 1회)" }
];

// Student Proctor metrics (Error 4 Target)
const studentProctors = {
  "학생 A": { warningCount: 5, timeRemaining: 15 },
  "학생 B": { warningCount: 0, timeRemaining: 50 }
};

// API: Get exams
app.get('/api/exams', (req, res) => {
  res.json(exams);
});

// API: Delete exam (Error 5 Target - Delete statistics leak)
app.delete('/api/exams/:id', (req, res) => {
  const { id } = req.params;
  
  exams = exams.filter(ex => ex.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 교수가 시험을 삭제(DELETE)해도 해당 시험의 학생 
  // 제출 데이터베이스 레코드(`submissionsHistory`)는 일괄 연쇄 삭제(Cascade) 처리하지 않고 
  // 그대로 영구 보존하여 쓰레기 데이터를 방치하고 통계를 왜곡하는 결함입니다.
  console.log(`[DB DELETE EXAM] Deleted exam ${id} from list. BUT submissionsHistory remains untouched!`);
  res.json({ success: true });
});

// API: Get questions
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

// API: Post new question
app.post('/api/questions', (req, res) => {
  const { text, points, correctKeyword } = req.body;
  const nextNum = questions.length + 1;
  const newQ = {
    id: `q-${String(nextNum).padStart(2, '0')}`,
    num: nextNum,
    text,
    points: Number(points),
    correctKeyword
  };
  questions.push(newQ);
  res.json(newQ);
});

// API: Get current answers
app.get('/api/answers', (req, res) => {
  res.json({ status: examStatus, answers: userAnswers, submissionTime });
});

// API: Save draft answer (Error 1, 2 Target)
app.post('/api/exams/save', (req, res) => {
  const { questionId, answer, delay } = req.body;

  let delayMs = 100;
  if (delay) {
    delayMs = 4000; // 4s delay (Error 1 Target)
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 최종 제출이 완료(`examStatus === 'SUBMITTED'`)되었는지 여부를 검증하고 차단하는 
  // 제어 게이트웨이를 설계하지 않고 자동저장을 무조건 덮어쓰게 허용함으로써, 
  // 학생 제출 시점의 채점지 내용과 시험 종료 후 DB에 저장된 답안이 어긋나게 만드는 결함입니다.
  setTimeout(() => {
    userAnswers[questionId] = answer;
    console.log(`[DB SAVE DRAFT] Saved question ${questionId}: "${answer}" (Delay: ${delayMs}ms)`);
    res.json({ success: true, savedAnswer: answer, status: examStatus });
  }, delayMs);
});

// API: Submit exam (Error 6 Target - Expired time submit 403 bypass save)
app.post('/api/exams/submit', (req, res) => {
  const { answers, forceExpired } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 시험 시간이 완료되어 제출이 불가능하다는 HTTP 403 Forbidden 에러 코드를 던지지만, 
  // 내부 로직 상에서는 기입받은 답안 객체를 DB 필드에 강제 적재시키고 제출 시각까지 백엔드에 기입해두어 
  // 예외 처리가 오작동하는 흐름 제어 결함입니다.
  if (forceExpired) {
    Object.assign(userAnswers, answers);
    examStatus = "SUBMITTED";
    submissionTime = new Date().toLocaleTimeString();
    console.log("[DB SUBMIT EXPIRED] Expired submit received. Blocked with 403, but answers saved!");
    return res.status(403).json({ error: "시험 시간이 만료되었습니다. 최종 제출 권한이 거부됩니다. (403)" });
  }

  Object.assign(userAnswers, answers);
  examStatus = "SUBMITTED";
  submissionTime = new Date().toLocaleTimeString();
  
  // Save to submissions history
  submissionsHistory.push({
    id: `subhist-${Date.now()}`,
    student: "학생 A",
    examId: "ex-101",
    score: 92,
    answers: { ...userAnswers }
  });

  console.log("[DB SUBMIT SUCCESS] Exam submitted successfully.");
  res.json({ success: true });
});

// API: Get proctor logs
app.get('/api/proctor/logs', (req, res) => {
  res.json(proctorLogs);
});

// API: Post proctor warning
app.post('/api/proctor/logs', (req, res) => {
  const { type, msg } = req.body;
  const newLog = {
    time: new Date().toLocaleTimeString(),
    type,
    msg
  };
  proctorLogs.push(newLog);
  res.json(newLog);
});

// API: Get student proctor status (Error 4 Target)
app.get('/api/student-proctor', (req, res) => {
  const { student } = req.query;
  res.json(studentProctors[student] || { warningCount: 0, timeRemaining: 40 });
});

// API: Get submissions backup list (For stats display)
app.get('/api/submissions/history', (req, res) => {
  res.json(submissionsHistory);
});

// API: Reset DB
app.post('/api/reset', (req, res) => {
  exams = [
    { id: "ex-101", title: "인공지능 공학 중간고사", duration: 50, status: "READY" },
    { id: "ex-102", title: "알고리즘 및 자료구조 기말평가", duration: 60, status: "READY" }
  ];
  
  questions = [];
  for (let i = 1; i <= 25; i++) {
    questions.push({
      id: `q-${String(i).padStart(2, '0')}`,
      num: i,
      text: `[단답형 문항 ${i}] 다음 중 설명에 부합하는 정답 및 핵심 개념 키워드를 기입하시오. (상세 질문 코드: Q${i * 3})`,
      points: 4,
      correctKeyword: "인공지능"
    });
  }

  userAnswers = {};
  examStatus = "ONGOING";
  submissionTime = null;
  proctorLogs = [
    { time: "10:02:11", type: "INFO", msg: "학생 안면 인식 및 신원 검증 승인 완료" },
    { time: "10:05:44", type: "WARN", msg: "브라우저 화면 포커스 이탈 감지 (경고 1회)" }
  ];
  submissionsHistory = [
    { id: "subhist-01", student: "학생 A", examId: "ex-101", score: 84, answers: { "q-01": "인공지능", "q-02": "머신러닝" } }
  ];

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[ExamGuard Backend] Express server running on http://localhost:${PORT}`);
});
