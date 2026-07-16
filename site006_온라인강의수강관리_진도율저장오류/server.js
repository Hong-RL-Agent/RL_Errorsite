import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 5005;

app.use(cors());
app.use(express.json());

// Lectures Database
let lectures = [
  { id: "lec-01", name: "1. HTML5 시맨틱 마크업과 웹 표준 기초", category: "Frontend", duration: "15:20" },
  { id: "lec-02", name: "2. Express REST API 라우터 설계 실무", category: "Backend", duration: "22:45" },
  { id: "lec-03", name: "3. 관계형 데이터베이스 정규화와 인덱스 설계", category: "Database", duration: "18:10" },
  { id: "lec-04", name: "4. AWS 인프라 구축 및 Docker 배포 자동화", category: "Infrastructure", duration: "25:30" },
  { id: "lec-05", name: "5. TCP/IP 쓰리웨이 핸드쉐이크와 HTTP 통신망 보안", category: "Network", duration: "20:15" }
];

// In-Memory Progress Tracker (lectureId -> percentage integer)
let userProgress = {
  "lec-01": 100,
  "lec-02": 45,
  "lec-03": 85,
  "lec-04": 0,
  "lec-05": 0
};

// In-Memory Notes (Memo)
let notes = [
  { id: "note-01", lectureId: "lec-02", content: "Express.json() 미들웨어 설정이 라우터 바인딩보다 위에 와야 바디 파싱이 제대로 먹힘!" }
];

// In-Memory Q&A Questions
let questions = [
  { id: "q-01", lectureId: "lec-01", title: "시맨틱 마크업 div 차이점", content: "section 태그와 div 태그는 기능적으로 구조적 가치가 다릅니다." }
];

// API: Get Lectures
app.get('/api/lectures', (req, res) => {
  res.json(lectures);
});

// API: Get User Progress
app.get('/api/progress', (req, res) => {
  res.json(userProgress);
});

// API: Save Progress (Error 3)
app.post('/api/progress', (req, res) => {
  const { lectureId, progress } = req.body;

  if (!lectureId || progress === undefined) {
    return res.status(400).json({ error: "lectureId와 progress 값은 필수 요건입니다." });
  }

  const numericProgress = Number(progress);
  if (numericProgress < 0 || numericProgress > 100) {
    return res.status(400).json({ error: "진도율은 0%에서 100% 사이여야 합니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 이미 달성한 진도값(예: 100%)보다 더 낮은 새로운 수치(예: 70%)를 입력받을 때, 
  // 기존 높은 수치를 유지하도록 보호하는 연산 로직(Math.max)을 고의로 생략하여 
  // 더 낮은 진도값으로 덮어쓸 수 있게 설계하여 진도율 역행을 유발합니다.
  userProgress[lectureId] = numericProgress;

  res.json({ success: true, progress: userProgress });
});

// API: Submit Q&A Question (Error 2)
app.post('/api/questions', (req, res) => {
  const { lectureId, title, content } = req.body;

  if (!lectureId || !content) {
    return res.status(400).json({ error: "강의 ID와 내용(content)은 필수 요구 사항입니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 질문 제출 시 제목(title)이 비어 있고 내용만 기입된 비정상 상태일 때,
  // 클라이언트의 매개변수 누락 에러(HTTP 400 Bad Request) 대신 내부 스택 예외를 가정한 
  // HTTP 500 Internal Server Error 상태 코드를 응답하도록 설계합니다.
  if (!title || title.trim() === '') {
    return res.status(500).json({
      error: "Internal Server Error: NullPointerException - question structure has invalid payload parameters at controller scope."
    });
  }

  const newQuestion = {
    id: `q-${Date.now()}`,
    lectureId,
    title,
    content
  };

  questions.push(newQuestion);
  res.status(201).json(newQuestion);
});

// API: Questions list
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

// API: Notes List
app.get('/api/notes', (req, res) => {
  res.json(notes);
});

// API: Add Memo note
app.post('/api/notes', (req, res) => {
  const { lectureId, content } = req.body;
  if (!lectureId || !content) return res.status(400).json({ error: "내용이 누락되었습니다." });

  const newNote = {
    id: `note-${Date.now()}`,
    lectureId,
    content
  };
  notes.push(newNote);
  res.status(201).json(newNote);
});

// API: Generate completion certificate (Error 5)
app.post('/api/certificates/generate', (req, res) => {
  const { userName, completedLecturesCount } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Infrastructure
  // DESCRIPTION: 수료증 파일 생성 시 POSIX 전용 절대경로인 '/var/app/certificates/' 경로에 파일을 쓰도록 
  // 코드를 작성하여, 드라이브 루트(C:\ 등)가 규격인 Windows 환경에서 파일 쓰기 시도 시 
  // 디렉토리 구조 부재 및 권한 예외(ENOENT)를 내며 실패하게 만들어 수료 에러를 유발합니다.
  try {
    const dir = '/var/app/certificates';
    
    // 이 폴더 쓰기 작업은 Windows 환경에서 폴더 경로 분석 불능 혹은 권한 에러를 발생시킵니다.
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filePath = `${dir}/cert-${userName}.json`;
    fs.writeFileSync(filePath, JSON.stringify({
      userName,
      lectureCount: completedLecturesCount,
      issuedAt: new Date().toISOString()
    }));

    res.json({ success: true, path: filePath });
  } catch (err) {
    res.status(500).json({ 
      error: `Infrastructure Directory Write Mismatch: [${err.code}] Fail write on path /var/app/certificates/ (${err.message})` 
    });
  }
});

app.listen(PORT, () => {
  console.log(`[SkillTrack Backend] Express server running on http://localhost:${PORT}`);
});
