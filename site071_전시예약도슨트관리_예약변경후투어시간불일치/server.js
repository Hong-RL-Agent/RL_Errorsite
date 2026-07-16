import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9570;

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
    return { exhibitions: [], reservations: [], hourlyCongestion: {}, adminStats: {} };
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

// API: Get exhibitions
app.get('/api/exhibitions', (req, res) => {
  const db = readDB();
  res.json(db.exhibitions);
});

// API: Filtered Search exhibitions (Error 2 Target)
app.get('/api/exhibitions/search', (req, res) => {
  const { q } = req.query;
  const db = readDB();
  let list = db.exhibitions;

  if (q) {
    list = list.filter(e => e.title.includes(q) || e.artist.includes(q));
  }

  let delay = 100;
  if (q === '한국') {
    delay = 3000; // 3.0s delay
  } else if (q === '현대') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 전시 검색어 필터를 고속 연속 입력(한국 3초 지연 ➔ 현대 0.2초 완료)할 시, 
  // 늦게 끝난 이전 한국 검색 응답이 최신 현대 검색 결과를 오버라이트하여 
  // 화면 좌측 필터 입력값과 중앙 카드 리스트 결과가 엇갈리는 비동기 경합 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
});

// API: Get reservations
app.get('/api/reservations', (req, res) => {
  const db = readDB();
  res.json(db.reservations);
});

// API: Docent Time update (Error 1 Target - 0.1s delay)
app.patch('/api/reservations/:id/docent', (req, res) => {
  const { id } = req.params;
  const { docentTime } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.docentTime = docentTime;
      writeDB(db);
      console.log(`[DB DOCENT] Saved docent time for ${id} to ${docentTime} (0.1s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 100);
});

// API: Date update (Error 1 Target - 3.0s delay)
app.patch('/api/reservations/:id/date', (req, res) => {
  const { id } = req.params;
  const { date, docentTime } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 예약 관람 날짜를 변경(3초 지연)한 직후 도슨트 시간을 변경(0.1초 완료)하면, 
  // 3초 뒤 지연 완료되는 날짜 변경 API가 이전 구형 도슨트 시간 캐시(docentTime)를 함께 동봉해 덮어씌움으로써 
  // 새로고침 시 도슨트 예약 정보가 이전 값으로 롤백되는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.date = date;
      if (docentTime) {
        resv.docentTime = docentTime;
      }
      writeDB(db);
      console.log(`[DB DATE] Saved date for ${id} (3s done). Overwrote docentTime to: ${docentTime}`);
    }
    res.json({ success: true, reservation: resv });
  }, 3000);
});

// API: Cancel Reservation (Error 3 Target)
app.post('/api/reservations/:id/cancel', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const resv = db.reservations.find(r => r.id === id);

  if (resv) {
    resv.status = 'CANCELLED';

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 관람 예약을 취소(POST)하여 대장 상태는 변경하더라도, 
    // 시간대별 혼잡도 지표(`hourlyCongestion`) 및 어드민 통계의 누적 예약 건수(`adminStats.totalReservations`) 정보에서 
    // 취소 수치를 차감/소거하지 않고 그대로 유지하는 수치 누수 결함입니다.
    writeDB(db);
    console.log(`[DB CANCEL RESERVATION] Cancelled reservation ${id}. Stats hourlyCongestion/adminStats remain unchanged.`);
  }
  res.json({ success: true, reservation: resv });
});

// API: Checkin Reservation (Error 5 Target - 0.5s delay)
app.post('/api/reservations/:id/checkin', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'CHECKED_IN';
      writeDB(db);
      console.log(`[DB CHECKIN] Checked-in reservation ${id} (0.5s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 500);
});

// API: Update Reservation Time (Error 5 Target - 4.0s delay)
app.patch('/api/reservations/:id/time', (req, res) => {
  const { id } = req.params;
  const { time } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 입장 확인(0.5초 완료) 처리 직후 예약 시간을 수정(4초 지연 완료) 요청하면, 
  // 4초 뒤 시간 수정이 완료되면서 입장 완료 상태였던 티켓 정보를 다시 'PENDING'(입장 전) 상태로 
  // 무단 복원 회귀시켜 재활성화하는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.time = time;
      resv.status = 'PENDING';
      writeDB(db);
      console.log(`[DB TIME CHANGE] Updated reservation ${id} time (4s done). Overwrote status to PENDING.`);
    }
    res.json({ success: true, reservation: resv });
  }, 4000);
});

// API: Exhibition Image Mock Upload (Error 7 Target)
app.post('/api/upload', (req, res) => {
  const { id, filename } = req.body;
  const db = readDB();
  const ex = db.exhibitions.find(e => e.id === id);

  if (ex) {
    // Write mock file physically
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, 'MOCK_EXHIBITION_IMAGE_BYTES', 'utf-8');

    let savedUrl = `/uploads/${filename}`;

    // INTENTIONAL_ERROR
    // CATEGORY: Server
    // DESCRIPTION: 업로드하는 전시 포스터 이미지 파일명에 한글과 공백이 포함된 경우, 
    // 물리 파일명은 디스크에 정상 쓰여지지만 데이터베이스의 imageUrl 컬럼값은 
    // 이중 URL 인코딩 방식으로 어긋나게 작성되어 화면에는 파일명이 뜨나 이미지는 404가 나는 인코딩 매칭 결함입니다.
    if (filename.includes(' ') && /[\uac00-\ud7a3]/.test(filename)) {
      const doubleEncoded = encodeURIComponent(encodeURIComponent(filename));
      savedUrl = `/uploads/${doubleEncoded}`;
    }

    ex.imageUrl = savedUrl;
    writeDB(db);
    console.log(`[DB UPLOAD] Registered exhibition image for ${id}. Path saved: ${savedUrl}`);
    res.json({ success: true, imageUrl: savedUrl });
  } else {
    res.status(404).json({ error: "Exhibition not found" });
  }
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "exhibitions": [
      { "id": "EX-01", "title": "한국 근현대 회화 특별전", "type": "Painting", "artist": "김환기 외", "period": "2026-07-01 ~ 2026-08-30", "congestion": "HIGH", "imageUrl": "/uploads/korean_modern.jpg" },
      { "id": "EX-02", "title": "현대 추상 조각의 선과 면", "type": "Sculpture", "artist": "이우환", "period": "2026-07-10 ~ 2026-09-15", "congestion": "MEDIUM", "imageUrl": "" }
    ],
    "reservations": [
      { "id": "RS-01", "exhibitionId": "EX-01", "exhibitionTitle": "한국 근현대 회화 특별전", "visitorName": "홍길동", "phone": "010-1234-5678", "date": "2026-07-20", "time": "10:00", "docentTime": "10:30", "status": "PENDING", "adminId": "A", "memo": "A사 소속 단체 관람 사전 문의 건" }
    ],
    "hourlyCongestion": {
      "10:00": 1,
      "11:00": 2
    },
    "adminStats": {
      "A": {
        "totalReservations": 1,
        "pendingCount": 1
      },
      "B": {
        "totalReservations": 0,
        "pendingCount": 0
      }
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[ArtVisit Server] Running on http://localhost:${PORT}`);
});
