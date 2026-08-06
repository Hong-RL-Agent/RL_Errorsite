import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9573;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_PATH = path.join(__dirname, 'data', 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Create physical file for space-containing image test (Error 7 Target)
const spaceImgPath = path.join(UPLOADS_DIR, 'gourmet steak.jpg');
if (!fs.existsSync(spaceImgPath)) {
  fs.writeFileSync(spaceImgPath, 'MOCK_IMAGE_BYTES_STEAK', 'utf-8');
}

const readDB = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { restaurants: [], reservations: [], cachedUserStats: {} };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
};

// API: Get restaurants
app.get('/api/restaurants', (req, res) => {
  const db = readDB();
  res.json(db.restaurants);
});

// API: Search restaurants (Error 5 Target - Network Race)
app.get('/api/restaurants/search', (req, res) => {
  const { category, region } = req.query;
  const db = readDB();
  let list = db.restaurants;

  if (category && category !== 'ALL') {
    list = list.filter(r => r.category === category);
  }
  if (region && region !== 'ALL') {
    list = list.filter(r => r.region === region);
  }

  let delay = 100;
  if (category === '한식') {
    delay = 3000; // 3.0s delay
  } else if (category === '일식') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 지역 필터 및 음식 종류 필터(한식 3초 지연 ➔ 일식 0.2초 완료)를 빠르게 변경 시 
  // 오래된 이전 응답(한식)이 최신 음식점 목록을 덮어쓰고, 오른쪽 예약 요약 패널에는 다른 매장 정보가 노출되는 비동기 경합 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
});

// API: Get restaurant detail (Error 7 Target)
app.get('/api/restaurants/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const rst = db.restaurants.find(r => r.id === id);

  if (!rst) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  const detailRst = { ...rst };

  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: 매장 대표 이미지 파일 이름에 공백이 있으면('gourmet steak.jpg'), 
  // 목록 페이지에서는 디렉토리 상대경로로 보이지만 상세 정보 API 응답 시 URL 인코딩을 이중 변환(`gourmet%2520steak.jpg`)하여 
  // 상세 화면 렌더링 시 이미지를 찾지 못하고 404가 발생하게 만드는 서버 인코딩 결함입니다.
  if (detailRst.imageUrl && detailRst.imageUrl.includes(' ')) {
    const filename = path.basename(detailRst.imageUrl);
    const doubleEncoded = encodeURIComponent(encodeURIComponent(filename));
    detailRst.imageUrl = `/uploads/${doubleEncoded}`;
  }

  res.json(detailRst);
});

// API: Get reservations
app.get('/api/reservations', (req, res) => {
  const db = readDB();
  res.json(db.reservations);
});

// API: Change reservation time (Error 1 Target - 0.1s delay)
app.patch('/api/reservations/:id/time', (req, res) => {
  const { id } = req.params;
  const { time } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.time = time;
      writeDB(db);
      console.log(`[DB TIME] Updated reservation ${id} time to: ${time} (0.1s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 100);
});

// API: Change reservation party size (Error 1 Target - 3.0s delay)
app.patch('/api/reservations/:id/party-size', (req, res) => {
  const { id } = req.params;
  const { partySize, time } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 예약 인원을 변경(3초 지연 완료)한 직후 예약 시간을 변경(0.1초 완료)하면, 
  // 시간 변경 요청은 먼저 완료되나 3초 뒤 완료되는 인원 변경 요청 내부에 이전 구형 시간(time)이 동봉되어 저장되어 
  // 새로고침 시 인원은 변경되나 시간은 이전 값으로 돌아가는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.partySize = Number(partySize);
      if (time) {
        resv.time = time; // Overwrites updated time with stale value!
      }
      writeDB(db);
      console.log(`[DB PARTY SIZE] Updated party size for ${id} (3s done). Overwrote time to: ${time}`);
    }
    res.json({ success: true, reservation: resv });
  }, 3000);
});

// API: Cancel reservation (Error 2 Target - 0.5s delay)
app.post('/api/reservations/:id/cancel', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB RESV CANCEL] Cancelled reservation ${id} (0.5s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 500);
});

// API: Register waiting (Error 2 Target - 4.0s delay)
app.post('/api/reservations/:id/waiting', (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 예약 취소(0.5초 완료) 직후 웨이팅 등록(4초 지연 완료)을 누르면, 
  // 취소 응답은 성공하지만 늦게 완료된 웨이팅 요청이 취소된 예약을 'WAITING' 대기 상태로 강제 복구 부활시키는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'WAITING';
      writeDB(db);
      console.log(`[DB RESV WAITING] Re-created waiting status for ${id} (4s done). Overwrote cancelled status.`);
    }
    res.json({ success: true, reservation: resv });
  }, 4000);
});

// API: Delete Table Assignment (Error 4 Target)
app.delete('/api/reservations/:id/table', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const resv = db.reservations.find(r => r.id === id);
  if (resv) {
    resv.tableNo = "";

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 테이블 배정을 삭제(DELETE) 처리하더라도, 매장의 테이블 배열 정보 및 
    // 예약 상세 요약의 테이블 상태에는 해당 테이블이 소거되지 않고 계속 기산 포함되는 결함입니다.
    writeDB(db);
    console.log(`[DB DELETE TABLE] Deleted table for reservation ${id}. Store layout remains unchanged.`);
  }
  res.json({ success: true, reservation: resv });
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "restaurants": [
      { "id": "RST-01", "name": "한남 미쉐린 한식 다이닝", "category": "한식", "region": "용산구", "rating": 4.9, "waitingCount": 12, "imageUrl": "/uploads/hannam_dining.jpg", "tables": ["T1", "T2", "T3", "T4"] },
      { "id": "RST-02", "name": "강남 프라이빗 스시 오마카세", "category": "일식", "region": "강남구", "rating": 4.8, "waitingCount": 8, "imageUrl": "/uploads/gourmet steak.jpg", "tables": ["T1", "T2"] }
    ],
    "reservations": [
      { "id": "RES-001", "rstId": "RST-01", "rstName": "한남 미쉐린 한식 다이닝", "guestName": "김철수", "phone": "010-1234-5678", "date": "2026-08-05", "time": "18:00", "partySize": 2, "status": "CONFIRMED", "tableNo": "T1", "userId": "USER_A" }
    ],
    "cachedUserStats": {
      "USER_A": { "totalReservations": 10, "activeWaitingCount": 4 },
      "USER_B": { "totalReservations": 14, "activeWaitingCount": 2 }
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[TableNow Server] Running on http://localhost:${PORT}`);
});
