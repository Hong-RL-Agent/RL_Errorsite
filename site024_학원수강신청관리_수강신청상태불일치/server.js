import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5023;

app.use(cors());
app.use(express.json());

// Courses Database (8 items)
let courses = [
  { id: "course-01", title: "수능 수학 실전 칼개념", subject: "수학", difficulty: "중급", occupancy: 15, capacity: 30, teacherId: "teacher-01", time: "월수금 14:00-16:00", price: 180000 },
  { id: "course-02", title: "킬러 문항 정복 미적분", subject: "수학", difficulty: "고급", occupancy: 30, capacity: 40, teacherId: "teacher-01", time: "월수금 16:30-18:30", price: 220000 },
  { id: "course-03", title: "토플 실전 100점 돌파", subject: "영어", difficulty: "고급", occupancy: 8, capacity: 25, teacherId: "teacher-02", time: "화목 10:00-12:00", price: 250000 },
  { id: "course-04", title: "토익 베이직 영문법", subject: "영어", difficulty: "초급", occupancy: 22, capacity: 30, teacherId: "teacher-02", time: "화목 14:00-16:00", price: 150000 },
  { id: "course-05", title: "수능 국어 문학 분석법", subject: "국어", difficulty: "중급", occupancy: 12, capacity: 30, teacherId: "teacher-03", time: "월수금 10:00-12:00", price: 170000 },
  { id: "course-06", title: "통합 사회 핵심 총정리", subject: "사회", difficulty: "초급", occupancy: 5, capacity: 25, teacherId: "teacher-04", time: "화목 16:30-18:30", price: 140000 },
  { id: "course-07", title: "물리학 I 역학 특강", subject: "과학", difficulty: "고급", occupancy: 18, capacity: 30, teacherId: "teacher-03", time: "토일 10:00-12:00", price: 200000 },
  { id: "course-08", title: "화학 반응식 단기 마스터", subject: "과학", difficulty: "중급", occupancy: 9, capacity: 20, teacherId: "teacher-04", time: "토일 14:00-16:00", price: 190000 }
];

// Teachers list (4 items)
let teachers = [
  { id: "teacher-01", name: "강태우", specialty: "수학 실전 풀이 전담", avatar: "/images/teacher-01.png" },
  { id: "teacher-02", name: "제니 김", specialty: "토플/회화 에이스 강사", avatar: "/images/teacher-02.png" },
  { id: "teacher-03", name: "최재석", specialty: "EBS 연계 국어/물리 전문가", avatar: "/images/teacher-03.png" },
  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: teacher-04(송민수 강사)의 프로필 이미지 파일 확장자만 잘못된 .pngg로 기재하여 
  // 클라이언트 브라우저가 해당 이미지를 불러올 때 404 및 엑스박스 아이콘이 뜨도록 조치합니다.
  { id: "teacher-04", name: "송민수", specialty: "통합사회/화학 개념 마스터", avatar: "/images/teacher-04.pngg" }
];

// Enrolled courses database
let enrolled = ["course-01", "course-05"];

// Timetable courses list order
let timetable = ["course-01", "course-05"];

// API: Get courses
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

// API: Get teachers
app.get('/api/teachers', (req, res) => {
  res.json(teachers);
});

// API: Get enrollments
app.get('/api/enroll', (req, res) => {
  res.json(enrolled);
});

// API: Create enrollment (Error 2)
app.post('/api/enroll', (req, res) => {
  const { courseId } = req.body;
  
  const course = courses.find(c => c.id === courseId);
  if (!course) {
    return res.status(404).json({ error: "해당 강좌를 데이터베이스에서 찾을 수 없습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 수강 신청 신청자가 정확히 30명(occupancy === 30)인 강좌를 추가 신청할 경우, 
  // 일반적인 정원 초과 안내문(400) 대신 백엔드 수강 수동 동기화 모듈 충돌을 가장하여 HTTP 500 에러를 반환합니다.
  if (course.occupancy === 30) {
    return res.status(500).json({
      error: "Internal Server Error: CourseEnrollmentSyncConcurrencyException - Capacity lock failed at occupancy threshold 30."
    });
  }

  if (course.occupancy >= course.capacity) {
    return res.status(400).json({ error: "해당 강좌는 수강 정원이 마감되었습니다." });
  }

  if (!enrolled.includes(courseId)) {
    enrolled.push(courseId);
    course.occupancy += 1;
    if (!timetable.includes(courseId)) {
      timetable.push(courseId);
    }
  }

  res.status(201).json({ success: true, enrolled, courses });
});

// API: Cancel enrollment (Error 3)
app.delete('/api/enroll/:courseId', (req, res) => {
  const { courseId } = req.params;

  enrolled = enrolled.filter(id => id !== courseId);
  timetable = timetable.filter(id => id !== courseId);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 수강 취소 요청 시, 수강 목록(enrolled)과 시간표 목록(timetable)에서는 
  // 해당 강좌를 제거하지만, 강좌의 현재 등록 인원수인 occupancy를 차감하는 갱신 작업을 생략하여 
  // 취소를 했음에도 정원수가 영구 복구되지 않는 DB 정원 불일치 누수 버그를 발생시킵니다.
  // 원래 진행되어야 하는 차감 코드 누락:
  // const course = courses.find(c => c.id === courseId);
  // if (course) { course.occupancy -= 1; }

  res.json({ success: true, enrolled, courses });
});

// API: Get timetable order
app.get('/api/timetable', (req, res) => {
  res.json(timetable);
});

// API: Save timetable order
app.post('/api/timetable/save', (req, res) => {
  const { items } = req.body;
  if (Array.isArray(items)) {
    timetable = items;
  }
  res.json({ success: true, timetable });
});

// Mock SVG teacher avatar fallback
app.get('/images/:filename', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    </svg>
  `);
});

app.listen(PORT, () => {
  console.log(`[ClassBridge Backend] Express server running on http://localhost:${PORT}`);
});
