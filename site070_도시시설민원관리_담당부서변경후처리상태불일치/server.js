import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9569;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_PATH = path.join(__dirname, 'data', 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Read database helper
const readDB = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { reports: [], visits: [], stats: {} };
  }
};

// Write database helper
const writeDB = (data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
};

// API: Get reports
app.get('/api/reports', (req, res) => {
  const db = readDB();
  res.json(db.reports);
});

// API: Filtered Search reports (Error 2 Target)
app.get('/api/reports/search', (req, res) => {
  const { category, region } = req.query;
  const db = readDB();
  let list = db.reports;

  if (category && category !== 'ALL') {
    list = list.filter(r => r.category === category);
  }
  if (region && region !== 'ALL') {
    list = list.filter(r => r.region === region);
  }

  let delay = 100;
  if (category === 'ROAD') {
    delay = 3000; // 3.0s delay
  } else if (category === 'LIGHT') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 지역 필터 및 민원 종류를 고속 연속 변경 시, 이전 필터 요청(도로 파손, 3초 지연) 응답이 
  // 최신 필터 요청(가로등 고장, 0.2초 완료) 이후 수신되어 목록 데이터를 덮어씀으로써 
  // 지도상의 SVG 마커 위치 수와 목록 뷰 간에 불일치가 벌어지는 비동기 경합 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
});

// API: Status Change (Error 1 Target - 0.1s delay)
app.patch('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  setTimeout(() => {
    const db = readDB();
    const report = db.reports.find(r => r.id === id);
    if (report) {
      report.status = status;
      writeDB(db);
      console.log(`[DB STATUS] Changed report ${id} status to: ${status} (0.1s done)`);
    }
    res.json({ success: true, report });
  }, 100);
});

// API: Department change (Error 1 Target - 3.0s delay)
app.patch('/api/reports/:id/department', (req, res) => {
  const { id } = req.params;
  const { department, status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 담당 부서 변경(3초 지연) 직후 처리 상태 변경(0.1초 완료)을 연속 실행하면, 
  // 3초 지연이 끝나며 처리 완료되는 부서 수정 API 내부에서 이전 캐시 정보(status)를 같이 갱신 덮어씌움으로써 
  // 새로고침 시 민원의 처리 상태가 이전 값으로 원복 회귀하는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const report = db.reports.find(r => r.id === id);
    if (report) {
      report.department = department;
      if (status) {
        report.status = status;
      }
      writeDB(db);
      console.log(`[DB DEPARTMENT] Saved department for ${id} (3s done). Overwrote status to: ${status}`);
    }
    res.json({ success: true, report });
  }, 3000);
});

// API: Delete Report (Error 3 Target)
app.delete('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.reports = db.reports.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 민원을 삭제(DELETE) 처리하여 목록 뷰에서 지우더라도, 
  // 현장 방문 예정일정(`visits`) 대장 정보 및 부서별 완료 통계 수치(`stats.resolvedCount`)에는 
  // 소거/차감하지 않고 영구 누출 유지하여 관리 성과 통계 지표에 찌꺼기가 생기는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE REPORT] Removed report ${id}. Stats visits/resolvedCount left unchanged!`);
  res.json({ success: true });
});

// API: Cancel Report (Error 4 Target - 0.5s delay)
app.post('/api/reports/:id/cancel', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const report = db.reports.find(r => r.id === id);
    if (report) {
      report.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL REPORT] Cancelled report ${id} (0.5s done)`);
    }
    res.json({ success: true, report });
  }, 500);
});

// API: Update Citizen Reply (Error 4 Target - 4.0s delay)
app.patch('/api/reports/:id/reply', (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 민원 접수 취소(POST, 0.5초 완료) 실행 직후 시민 답변 수정(PATCH, 4초 지연 완료)을 요청하면, 
  // 4초 뒤 지연 완료되는 답변 저장 로직이 취소 처리된 민원의 최종 상태 상태값을 다시 'PROCESSING'(처리 중)으로 
  // 강제 롤백 복원시켜 민원을 재부활 활성화하는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const report = db.reports.find(r => r.id === id);
    if (report) {
      report.reply = reply;
      report.status = 'PROCESSING';
      writeDB(db);
      console.log(`[DB REPLY] Saved reply for ${id} (4s done). Overwrote cancel status to PROCESSING.`);
    }
    res.json({ success: true, report });
  }, 4000);
});

// API: Mock File Upload (Error 6 Target)
app.post('/api/upload', (req, res) => {
  const { id, filename } = req.body;
  const db = readDB();
  const report = db.reports.find(r => r.id === id);

  if (report) {
    // Write physical mock file
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, 'MOCK_IMAGE_BYTES', 'utf-8');

    let savedUrl = `/uploads/${filename}`;

    // INTENTIONAL_ERROR
    // CATEGORY: Server
    // DESCRIPTION: 업로드 파일 이름에 한글과 공백이 공존하는 경우, 
    // 파일은 디스크 파일 시스템상에 정상 생성("가로등 고장.jpg")되나 
    // 데이터베이스의 imageUrl 컬럼에 이중 URL 인코딩("%25EA%25B0%2580%25EB%25A1%259C%25EB%2593%25B1%2520%25EA%25B3%25A5.jpg") 
    // 형태로 격차가 발생하게 기입되어, 클라이언트에서 이미지 로딩 시 404가 발생하게 만드는 결함입니다.
    if (filename.includes(' ') && /[\uac00-\ud7a3]/.test(filename)) {
      const doubleEncoded = encodeURIComponent(encodeURIComponent(filename));
      savedUrl = `/uploads/${doubleEncoded}`;
    }

    report.imageUrl = savedUrl;
    writeDB(db);
    console.log(`[DB UPLOAD] Uploaded ${filename} for report ${id}. Saved imageUrl: ${savedUrl}`);
    res.json({ success: true, imageUrl: savedUrl });
  } else {
    res.status(404).json({ error: "Report not found" });
  }
});

// API: Get visits
app.get('/api/visits', (req, res) => {
  const db = readDB();
  res.json(db.visits);
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "reports": [
      { "id": "RP-01", "title": "합정역 4번 출구 앞 아스팔트 포트홀 발생", "category": "ROAD", "region": "마포구", "status": "PENDING", "urgency": "HIGH", "department": "도로과", "manager": "홍길동", "reply": "", "imageUrl": "/uploads/port_hole.jpg" },
      { "id": "RP-02", "title": "서초동 삼거리 밤길 가로등 점멸 불량", "category": "LIGHT", "region": "서초구", "status": "PROCESSING", "urgency": "HIGH", "department": "치수과", "manager": "이몽룡", "reply": "가로등 내부 안정기 노화 검토 중입니다.", "imageUrl": "" }
    ],
    "visits": [
      { "id": "VS-01", "reportId": "RP-01", "visitDate": "2026-07-21", "inspector": "홍길동" }
    ],
    "stats": {
      "totalVisits": 1,
      "resolvedCount": 3
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[CityReport Server] Running on http://localhost:${PORT}`);
});
