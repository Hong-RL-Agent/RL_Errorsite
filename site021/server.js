const express = require('express');
const path = require('path');
const app = express();
const PORT = 9350;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let courses = [
  { id: 'c1', title: 'React Masterclass', category: 'Dev', instructor: 'Lee', level: 'Intermediate', totalLectures: 24, price: 50000, content: '리액트의 핵심 개념과 실전 프로젝트...' },
  { id: 'c2', title: 'Python for Data Science', category: 'Data', instructor: 'Kim', level: 'Beginner', totalLectures: 15, price: 45000, content: '파이썬 기초부터 데이터 분석 라이브러리까지...' },
  { id: 'c3', title: 'Modern UI/UX Design', category: 'Design', instructor: 'Choi', level: 'Beginner', totalLectures: 12, price: 30000, content: '피그마를 활용한 현대적인 웹 디자인 실습...' }
];

let enrollment = ['c1']; // User enrolled in c1
let userProgress = {
  'c1': { completed: 8 }
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillMap Academy API is running' });
});

app.get('/api/courses', (req, res) => {
  res.json(courses);
});

// API: Course Content
// INTENTIONAL BUG: site021-bug03
// CSV Error: 비인가 강의 접근
// Type: security-access-control
// Description: 수강 신청하지 않은 강의도 courseId만 알면 상세 콘텐츠를 조회할 수 있음.
app.get('/api/courses/:id/content', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  
  // 보안 취약점: enrollment.includes(req.params.id) 체크가 누락됨
  if (course) {
    res.json({ title: course.title, content: course.content, secretUrl: 'https://cdn.academy.com/v/hidden-stream-123' });
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

// API: Progress
// INTENTIONAL BUG: site021-bug01
// CSV Error: DB 진도율 계산 오류
// Type: database-calculation
// Description: 완료 강의 수를 전체 강의 수가 아닌 고정값으로 나누어 진도율이 잘못 계산됨.
app.get('/api/progress', (req, res) => {
  const progressList = enrollment.map(cid => {
    const p = userProgress[cid] || { completed: 0 };
    const course = courses.find(c => c.id === cid);
    
    // 버그: course.totalLectures 대신 고정값 10을 분모로 사용함
    const rate = Math.round((p.completed / 10) * 100);
    
    return {
      courseId: cid,
      title: course ? course.title : 'Unknown',
      completed: p.completed,
      total: course ? course.totalLectures : 0,
      percent: rate // 논리적 오류가 포함된 진도율
    };
  });
  res.json(progressList);
});

// API: Quiz Submission
// INTENTIONAL BUG: site021-bug02
// CSV Error: 네트워크 부분 실패
// Type: network-partial-failure
// Description: 퀴즈 제출 API가 일부 문항 채점 결과를 누락해 반환함.
app.post('/api/quizzes/submit', (req, res) => {
  const { answers } = req.body; // answers is an array of objects { qid, val }
  
  // 모든 문항을 채점하지 않고, 첫 2개 문항만 결과에 포함시킴
  const results = answers.slice(0, 2).map(a => ({
    qid: a.qid,
    isCorrect: Math.random() > 0.3,
    score: 10
  }));

  // 고의로 3번째 이후 문항에 대한 결과는 응답에 누락시킴
  res.json({
    totalScore: results.reduce((s, r) => s + r.score, 0),
    details: results
  });
});

app.get('/api/profile', (req, res) => {
  res.json({ name: '김학습', email: 'student@skillmap.io', points: 1250 });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
