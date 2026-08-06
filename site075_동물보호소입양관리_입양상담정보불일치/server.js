import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9574;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_PATH = path.join(__dirname, 'data', 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Create physical file for space & Korean image test (Error 7 Target)
const koreanImgPath = path.join(UPLOADS_DIR, '복실이 강아지.jpg');
if (!fs.existsSync(koreanImgPath)) {
  fs.writeFileSync(koreanImgPath, 'MOCK_IMAGE_BYTES_BOKSIL', 'utf-8');
}

const readDB = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { animals: [], applications: [], shelterStats: {} };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
};

// API: Get animals
app.get('/api/animals', (req, res) => {
  const db = readDB();
  res.json(db.animals);
});

// API: Search animals (Error 5 Target - Network Race)
app.get('/api/animals/search', (req, res) => {
  const { species, region } = req.query;
  const db = readDB();
  let list = db.animals;

  if (species && species !== 'ALL') {
    list = list.filter(a => a.species === species);
  }
  if (region && region !== 'ALL') {
    list = list.filter(a => a.region.includes(region));
  }

  let delay = 100;
  if (species === 'DOG') {
    delay = 3000; // 3.0s delay
  } else if (species === 'CAT') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 동물 종류 필터('DOG' 3초 지연 ➔ 'CAT' 0.2초 완료)와 지역 필터를 빠르게 변경 시 
  // 오래된 이전 응답(개)이 최신 결과를 덮어쓰고, 오른쪽 상세 패널에는 목록에 없는 동물 정보가 남는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
});

// API: Get animal detail (Error 7 Target)
app.get('/api/animals/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const animal = db.animals.find(a => a.id === id);

  if (!animal) {
    return res.status(404).json({ error: "Animal not found" });
  }

  const detailAnimal = { ...animal };

  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: 동물 사진 파일 이름에 한글과 공백이 포함된 경우('복실이 강아지.jpg'), 
  // 목록 페이지에서는 디렉토리 상대경로로 깨지지 않으나 상세 화면 전용 API 응답 시 URL 인코딩을 이중 변환(`%25EB%25B3%25B5...`)하여 
  // 상세 사진 갤러리에서만 이미지가 깨지고 404가 발생하게 만드는 서버 인코딩 결함입니다.
  if (detailAnimal.imageUrl && detailAnimal.imageUrl.includes(' ') && /[\uac00-\ud7a3]/.test(detailAnimal.imageUrl)) {
    const filename = path.basename(detailAnimal.imageUrl);
    const doubleEncoded = encodeURIComponent(encodeURIComponent(filename));
    detailAnimal.imageUrl = `/uploads/${doubleEncoded}`;
  }

  res.json(detailAnimal);
});

// API: Get applications
app.get('/api/applications', (req, res) => {
  const db = readDB();
  res.json(db.applications);
});

// API: Change counsel date (Error 1 Target - 0.1s delay)
app.patch('/api/applications/:id/counsel-date', (req, res) => {
  const { id } = req.params;
  const { counselDate } = req.body;

  setTimeout(() => {
    const db = readDB();
    const appItem = db.applications.find(a => a.id === id);
    if (appItem) {
      appItem.counselDate = counselDate;
      writeDB(db);
      console.log(`[DB COUNSEL DATE] Updated application ${id} counsel date to: ${counselDate} (0.1s done)`);
    }
    res.json({ success: true, application: appItem });
  }, 100);
});

// API: Change home environment (Error 1 Target - 3.0s delay)
app.patch('/api/applications/:id/environment', (req, res) => {
  const { id } = req.params;
  const { homeEnvironment, counselDate } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 입양 신청서의 거주 환경을 수정한 직후(3초 지연 완료) 상담 날짜를 변경(0.1초 완료)하면, 
  // 상담 날짜 요청은 먼저 성공하지만 3초 뒤 완료되는 신청서 수정 요청 내부에 이전 구형 상담 날짜(counselDate)가 함께 저장되어 
  // 거주 환경은 수정되나 상담 날짜는 이전 값으로 다시 돌아가는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const appItem = db.applications.find(a => a.id === id);
    if (appItem) {
      appItem.homeEnvironment = homeEnvironment;
      if (counselDate) {
        appItem.counselDate = counselDate; // Overwrites updated counselDate with stale value!
      }
      writeDB(db);
      console.log(`[DB ENVIRONMENT] Updated environment for ${id} (3s done). Overwrote counselDate to: ${counselDate}`);
    }
    res.json({ success: true, application: appItem });
  }, 3000);
});

// API: Foster & Adopt simultaneously (Error 4 Target)
app.post('/api/animals/:id/foster-and-adopt', (req, res) => {
  const { id } = req.params;
  const { userId, applicantName } = req.body;
  const db = readDB();
  const animal = db.animals.find(a => a.id === id);

  if (animal) {
    // INTENTIONAL_ERROR
    // CATEGORY: Backend + Database
    // DESCRIPTION: 동일 동물에 대해 임시보호 신청 직후 입양 신청을 연속으로 수행할 시 
    // 두 요청 모두 성공 응답(200 OK)을 반환하지만, 동물의 상태가 'FOSTERING_AND_REVIEWING' (임시보호 & 입양심사중)이라는 
    // 모순된 이중 상태로 동시 표시되는 데이터베이스/도메인 상태 결함입니다.
    animal.status = "FOSTERING_AND_REVIEWING";
    
    // Add dummy application record
    const newAppId = `APP-${String(db.applications.length + 1).padStart(3, '0')}`;
    db.applications.push({
      id: newAppId,
      animalId: animal.id,
      animalName: animal.name,
      applicantName: applicantName || "신청자",
      phone: "010-9999-8888",
      homeEnvironment: "자가 아파트",
      counselDate: "2026-08-20",
      type: "FOSTER_AND_ADOPT",
      status: "FOSTERING_AND_REVIEWING",
      userId: userId || "USER_A"
    });

    writeDB(db);
    console.log(`[DB DUAL STATUS] Set animal ${id} status to FOSTERING_AND_REVIEWING`);
  }

  res.json({ success: true, animal });
});

// API: Delete application (Error 2 Target)
app.delete('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.applications = db.applications.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 입양 신청을 취소/삭제(DELETE) 처리하더라도, 해당 동물의 누적 신청자 수(`animal.applicantCount`) 및 
  // 보호소 대시보드의 총 입양 신청 통계(`shelterStats.totalApplicationsCount`)에는 차감하지 않고 기산 포함 유지하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE APP] Removed application ${id}. Stats applicantCount / totalApplicationsCount remain unchanged.`);
  res.json({ success: true });
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "animals": [
      { "id": "ANM-01", "name": "해피", "species": "DOG", "breed": "골든 리트리버", "age": 3, "gender": "남아", "region": "서울 마포구", "status": "AVAILABLE", "applicantCount": 4, "isFavorite": false, "imageUrl": "/uploads/happy_retriever.jpg", "healthNote": "예방접종 완료, 심장사상충 음성" },
      { "id": "ANM-02", "name": "코코", "species": "CAT", "breed": "코리안 숏헤어", "age": 1, "gender": "여아", "region": "서울 강남구", "status": "AVAILABLE", "applicantCount": 2, "isFavorite": false, "imageUrl": "/uploads/복실이 강아지.jpg", "healthNote": "중성화 수술 완료, 종합백신 3차 완료" }
    ],
    "applications": [
      { "id": "APP-001", "animalId": "ANM-01", "animalName": "해피", "applicantName": "김철수", "phone": "010-1234-5678", "homeEnvironment": "단독주택 (마당 보유)", "counselDate": "2026-08-10", "type": "ADOPTION", "status": "REVIEWING", "userId": "USER_A" }
    ],
    "shelterStats": {
      "totalApplicationsCount": 68,
      "completedAdoptions": 24
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[PawShelter Server] Running on http://localhost:${PORT}`);
});
