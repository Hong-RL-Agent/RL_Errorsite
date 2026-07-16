import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9568;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_PATH = path.join(__dirname, 'data', 'data.json');

// Read database helper
const readDB = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { manuscripts: [], authors: [], schedules: [], revisions: [], dashboardStats: {} };
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

// API: Get manuscripts
app.get('/api/manuscripts', (req, res) => {
  const db = readDB();
  res.json(db.manuscripts);
});

// API: Title Update (Error 1 Target - 0.1s delay)
app.patch('/api/manuscripts/:id/title', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  setTimeout(() => {
    const db = readDB();
    const ms = db.manuscripts.find(m => m.id === id);
    if (ms) {
      ms.title = title;
      writeDB(db);
      console.log(`[DB TITLE] Changed manuscript ${id} title to: ${title} (0.1s done)`);
    }
    res.json({ success: true, manuscript: ms });
  }, 100);
});

// API: Step Update (Error 1 Target - 3.0s delay)
app.patch('/api/manuscripts/:id/step', (req, res) => {
  const { id } = req.params;
  const { step, title } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 원고 제목 수정 직후 제작 단계를 변경하면, 3초 지연 처리되는 
  // 제작 단계 수정 API가 동봉된 이전 제목 값(title)을 기반으로 DB를 덮어씌움으로써 
  // 새로고침 시 제목이 변경 이전의 구형 값으로 롤백되는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const ms = db.manuscripts.find(m => m.id === id);
    if (ms) {
      ms.step = step;
      if (title) {
        ms.title = title;
      }
      writeDB(db);
      console.log(`[DB STEP] Changed manuscript ${id} step to: ${step} (3s done). Overwrote title to: ${title}`);
    }
    res.json({ success: true, manuscript: ms });
  }, 3000);
});

// API: Delete Manuscript (Error 4 Target)
app.delete('/api/manuscripts/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.manuscripts = db.manuscripts.filter(m => m.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 원고 항목을 삭제(DELETE) 하더라도, 플랫폼 비용 지출 실적(`dashboardStats.totalPrintingCost`) 및 
  // 인쇄 인쇄소 요청 통계(`dashboardStats.totalPrintRequests`)에는 해당 수치를 그대로 합산 유지하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE MANUSCRIPT] Removed manuscript ${id}. Costs stats left untouched!`);
  res.json({ success: true });
});

// API: Get schedules
app.get('/api/schedules', (req, res) => {
  const db = readDB();
  res.json(db.schedules);
});

// API: Delete Schedule
app.delete('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.schedules = db.schedules.filter(s => s.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// API: Get revisions list
app.get('/api/revisions', (req, res) => {
  const db = readDB();
  res.json(db.revisions);
});

// API: Delete revision (Error 2 Target - 0.5s delay)
app.delete('/api/manuscripts/:id/revisions/:revId', (req, res) => {
  const { id, revId } = req.params;

  setTimeout(() => {
    const db = readDB();
    db.revisions = db.revisions.filter(r => r.id !== revId);
    
    const ms = db.manuscripts.find(m => m.id === id);
    if (ms && ms.activeRevisionId === revId) {
      ms.activeRevisionId = null;
    }
    writeDB(db);
    console.log(`[DB REVISION DELETE] Deleted revision ${revId} (0.5s done)`);
    res.json({ success: true });
  }, 500);
});

// API: Upload revision (Error 2 Target - 4.0s delay)
app.post('/api/manuscripts/:id/revisions', (req, res) => {
  const { id } = req.params;
  const { version, note, activeRevisionId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 신규 교정본 파일 업로드(4초 지연) 요청 즉시 구버전 삭제(0.5초 완료)를 신청하면, 
  // 4초 뒤 업로드 처리가 완료되면서 삭제 완료되었던 이전 버전을 다시 '현재 활성 교정본'(activeRevisionId)으로 
  // 강제 롤백 연결하는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const newRevId = `REV-${String(db.revisions.length + 1).padStart(2, '0')}`;
    const newRev = {
      id: newRevId,
      manuscriptId: id,
      version,
      note
    };
    db.revisions.push(newRev);

    const ms = db.manuscripts.find(m => m.id === id);
    if (ms) {
      ms.activeRevisionId = activeRevisionId; // Overwrites active ID back to the deleted one!
    }
    writeDB(db);
    console.log(`[DB REVISION UPLOAD] Saved new revision ${newRevId} (4s done). Linked activeRevisionId to ${activeRevisionId}`);
    res.json({ success: true });
  }, 4000);
});

// API: Search authors (Error 5 Target)
app.get('/api/authors/search', (req, res) => {
  const { q } = req.query;
  const db = readDB();
  let list = db.authors;

  if (q) {
    list = list.filter(a => a.name.includes(q));
  }

  let delay = 100;
  if (q === '홍길동') {
    delay = 3000; // 3.0s delay
  } else if (q === '이순신') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 저자 검색어를 '홍길동'(3초 지연) ➔ '이순신'(0.2초 완료)으로 고속 연속 입력 시, 
  // 비동기 처리 완료 시차 문제로 인해 이전 홍길동 결과 정보가 이순신의 화면을 덮어씌워 
  // 선택 저자 패널과 검색 명단 정보가 혼재되는 비동기 경합 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "manuscripts": [
      { "id": "MS-01", "title": "인공지능의 윤리학과 도덕률", "authorId": "AU-01", "authorName": "홍길동", "step": "Concept", "cost": 1500000, "isbn": "979-11-8901-01-1", "activeRevisionId": "REV-01" },
      { "id": "MS-02", "title": "서양 미학사 요약 강의", "authorId": "AU-02", "authorName": "이몽룡", "step": "Editing", "cost": 2200000, "isbn": "979-11-8901-01-2", "activeRevisionId": "REV-02" }
    ],
    "authors": [
      { "id": "AU-01", "name": "홍길동", "phone": "010-1234-5678", "specialty": "인문학" },
      { "id": "AU-02", "name": "이몽룡", "phone": "010-2345-6789", "specialty": "역사" }
    ],
    "schedules": [
      { "id": "SC-01", "manuscriptId": "MS-01", "task": "기획 원고 초고 검토", "targetDate": "2026-07-20" }
    ],
    "revisions": [
      { "id": "REV-01", "manuscriptId": "MS-01", "version": "v1.0", "note": "최초 초고 접수 완료" }
    ],
    "dashboardStats": {
      "totalPrintingCost": 3700000,
      "totalPrintRequests": 2
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[PublishFlow Server] Running on http://localhost:${PORT}`);
});
