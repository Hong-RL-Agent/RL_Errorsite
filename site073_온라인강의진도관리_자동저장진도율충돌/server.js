import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9572;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_PATH = path.join(__dirname, 'data', 'data.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { courses: [], students: [], quizzes: [], dashboardStats: {} };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
};

// API: Get courses
app.get('/api/courses', (req, res) => {
  const db = readDB();
  res.json(db.courses);
});

// API: Save course video progress (Error 1 Target - 3.0s delay)
app.patch('/api/courses/:id/progress', (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 강의 영상(30%) 시청 직후 다음 강의로 이동할 시, 이전 강의의 진도 자동 저장 요청(3초 지연)이 
  // 늦게 도착하여 새로 이동한 현재 강의의 진도율을 이전 강의 진도율(30%)로 덮어쓰게 만드는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const course = db.courses.find(c => c.id === id);
    if (course) {
      course.progress = Number(progress);
      writeDB(db);
      console.log(`[DB PROGRESS] Saved progress for course ${id} as ${progress}% (3s done)`);
    }
    res.json({ success: true, course });
  }, 3000);
});

// API: Submit Quiz (Error 2 Target part 1 - 0.5s delay)
app.post('/api/quizzes/:id/submit', (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  setTimeout(() => {
    const db = readDB();
    const quiz = db.quizzes.find(q => q.id === id);
    if (quiz) {
      quiz.submitted = true;
      quiz.savedAnswer = answer;
      quiz.score = answer.startsWith("A.") ? 100 : 40;
      writeDB(db);
      console.log(`[DB QUIZ SUBMIT] Submitted quiz ${id} with answer: ${answer} (0.5s done)`);
    }
    res.json({ success: true, quiz });
  }, 500);
});

// API: Modify Quiz Answer (Error 2 Target part 2 - 4.0s delay)
app.patch('/api/quizzes/:id/answer', (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 퀴즈 제출(0.5초 완료) 직후 답안을 수정(4초 지연)하면, 이미 제출 완료 처리된 상태임에도 불구하고 
  // 늦게 도착한 수정 요청이 DB의 점수 계산 데이터를 바꿔서 결과 화면의 점수와 저장 답안이 서로 달라지는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const quiz = db.quizzes.find(q => q.id === id);
    if (quiz) {
      quiz.savedAnswer = answer;
      quiz.score = answer.startsWith("A.") ? 100 : 20; // Recalculates score after submit!
      writeDB(db);
      console.log(`[DB QUIZ MODIFY] Modified quiz ${id} answer to: ${answer} (4s done). Overwrote score to ${quiz.score}`);
    }
    res.json({ success: true, quiz });
  }, 4000);
});

// API: Delete course (Error 4 Target)
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.courses = db.courses.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 강의 항목을 삭제(DELETE)하더라도, 강사 대시보드의 총 수강생 진도율(`dashboardStats.avgProgressRate`) 및 
  // 수강 후기 통계 수치에는 삭제된 강의 데이터가 지속 차감되지 않고 기산 포함되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE COURSE] Removed course ${id}. Stats avgProgressRate remain unchanged.`);
  res.json({ success: true });
});

// API: Download Course Material (Error 6 Target)
app.get('/api/courses/:id/materials', (req, res) => {
  const { id } = req.params;
  const { isEnrolled } = req.query;
  const db = readDB();
  const course = db.courses.find(c => c.id === id);

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 수강 권한이 없는 미등록 사용자(isEnrolled=false)가 강의 자료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 
  // 응답 본문(JSON) 데이터에 실제 강의 자료 파일명(`materialTitle`)과 용량(`materialSize`) 정보가 누출되어 노출되는 결함입니다.
  if (isEnrolled !== 'true') {
    return res.status(403).json({
      error: "수강 권한이 없습니다. 해당 강의를 수강 신청한 학생만 다운로드할 수 있습니다.",
      materialTitle: course ? course.materialTitle : "Unknown.pdf",
      materialSize: course ? course.materialSize : "0MB"
    });
  }

  res.json({
    success: true,
    materialTitle: course ? course.materialTitle : "Lecture_Note.pdf",
    materialSize: course ? course.materialSize : "10MB"
  });
});

// API: Update Course Title (Error 7 Target - 0.1s delay)
app.patch('/api/courses/:id/title', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  setTimeout(() => {
    const db = readDB();
    const course = db.courses.find(c => c.id === id);
    if (course) {
      course.title = title;
      writeDB(db);
      console.log(`[DB TITLE] Updated course ${id} title to: ${title} (0.1s done)`);
    }
    res.json({ success: true, course });
  }, 100);
});

// API: Update Course Public Status (Error 7 Target - 3.0s delay)
app.patch('/api/courses/:id/public', (req, res) => {
  const { id } = req.params;
  const { isPublic, title } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 강사가 강의 제목을 수정한 직후(0.1초 완료) 강의 공개 상태를 변경(3초 지연 완료)하면, 
  // 공개 상태 변경 요청 내부에 동봉된 이전 구형 제목(title)이 함께 DB에 저장되어 
  // 새로고침 후 공개 상태는 바뀌나 제목은 이전 값으로 롤백되는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const course = db.courses.find(c => c.id === id);
    if (course) {
      course.isPublic = isPublic;
      if (title) {
        course.title = title; // Overwrites updated title!
      }
      writeDB(db);
      console.log(`[DB PUBLIC] Updated course ${id} isPublic to: ${isPublic} (3s done). Overwrote title to: ${title}`);
    }
    res.json({ success: true, course });
  }, 3000);
});

// API: Get students list
app.get('/api/students', (req, res) => {
  const db = readDB();
  res.json(db.students);
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "courses": [
      { "id": "CS-101", "title": "모던 자바스크립트 ES6+ 완전 정복", "category": "개발", "instructor": "김코딩", "popularity": 98, "progress": 85, "isPublic": true, "materialTitle": "JavaScript_Master_Note.pdf", "materialSize": "14.2MB" },
      { "id": "CS-102", "title": "Svelte와 Vite 기반 프론트엔드 입문", "category": "개발", "instructor": "이화면", "popularity": 92, "progress": 30, "isPublic": true, "materialTitle": "Svelte_Cheatsheet.pdf", "materialSize": "5.8MB" }
    ],
    "students": [
      { "id": "STU-001", "name": "강동원", "role": "STUDENT_A", "enrolledCourses": ["CS-101"], "lastWatchedId": "CS-101", "lastWatchedTitle": "모던 자바스크립트 ES6+ 개념" }
    ],
    "quizzes": [
      { "id": "QZ-01", "courseId": "CS-101", "question": "자바스크립트에서 let과 const의 차이점은?", "savedAnswer": "A. const는 재할당 불가", "score": 100, "submitted": false }
    ],
    "dashboardStats": {
      "totalEnrolledStudents": 150,
      "avgProgressRate": 58.5,
      "totalReviewsCount": 42
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[CourseLab Server] Running on http://localhost:${PORT}`);
});
