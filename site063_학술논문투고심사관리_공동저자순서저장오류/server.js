import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9562;

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
    return { papers: [], reviewers: [], stats: {}, privateComments: [], reviews: [] };
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

// API: Get papers list
app.get('/api/papers', (req, res) => {
  const db = readDB();
  res.json(db.papers);
});

// API: Search & filter papers (Error 5 Target)
app.get('/api/papers/search', (req, res) => {
  const db = readDB();
  const { status, q } = req.query;
  let filtered = db.papers;

  if (status && status !== 'ALL') {
    filtered = filtered.filter(p => p.status === status);
  }
  if (q) {
    filtered = filtered.filter(p => p.title.includes(q));
  }

  let delay = 100;
  if (status === 'UNDER_REVIEW') {
    delay = 3000; // 3s delay
  } else if (status === 'ACCEPTED') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 상태 필터 및 검색 변경 시 UNDER_REVIEW(3초 지연) 응답이 
  // ACCEPTED(0.2초)보다 늦게 도착해 목록을 덮어쓰며, 상세 패널에는 엉뚱한 논문 정보가 
  // 혼합 노출되는 비동기 경합 결함입니다.
  setTimeout(() => {
    res.json(filtered);
  }, delay);
});

// API: Save Title & Authors (Error 1 Target - 3s delay)
app.patch('/api/papers/:id/title', (req, res) => {
  const { id } = req.params;
  const { title, authors } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 제목 수정 요청 시 프론트엔드가 이전 상태의 공동 저자 목록(authors)을 함께 동봉해 전송하며, 
  // 서버가 3초 지연 후 이 요청을 처리하면서 기존 저자 순서로 덮어쓰게 됩니다. 
  // 결과적으로 새로고침 시 제목은 저장되지만 저자 순서는 롤백됩니다.
  setTimeout(() => {
    const db = readDB();
    const paper = db.papers.find(p => p.id === id);
    if (paper) {
      paper.title = title;
      if (authors) {
        paper.authors = authors; // Reverts order to old!
      }
      writeDB(db);
      console.log(`[DB TITLE] Saved title: "${title}" for ${id}. Overwrote authors too.`);
    }
    res.json({ success: true, paper });
  }, 3000);
});

// API: Save Authors (Error 1 Target - 0.1s delay)
app.patch('/api/papers/:id/authors', (req, res) => {
  const { id } = req.params;
  const { authors } = req.body;

  setTimeout(() => {
    const db = readDB();
    const paper = db.papers.find(p => p.id === id);
    if (paper) {
      paper.authors = authors;
      writeDB(db);
      console.log(`[DB AUTHORS] Reordered authors for ${id} (0.1s done)`);
    }
    res.json({ success: true, paper });
  }, 100);
});

// API: Submit Revision (Error 2 Target - 4s delay)
app.post('/api/papers/:id/revision', (req, res) => {
  const { id } = req.params;
  const { filename, previousFiles } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 수정본 제출(POST, 4초 지연) 시점에 이전 파일 목록(previousFiles)을 
  // 통째로 서버로 가져와 업데이트를 수행합니다. 
  // 이 도중 중간에 수행된 파일 삭제(DELETE, 0.5초 완료) 결과를 덮어써 삭제된 파일이 부활하는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const paper = db.papers.find(p => p.id === id);
    if (paper) {
      paper.currentFile = filename;
      paper.files = previousFiles || paper.files;
      if (!paper.files.includes(filename)) {
        paper.files.push(filename);
      }
      writeDB(db);
      console.log(`[DB REVISION] Submitted revision ${filename} for ${id} (4s done)`);
    }
    res.json({ success: true, paper });
  }, 4000);
});

// API: Delete File (Error 2 Target - 0.5s delay)
app.delete('/api/papers/:id/files/:filename', (req, res) => {
  const { id, filename } = req.params;

  setTimeout(() => {
    const db = readDB();
    const paper = db.papers.find(p => p.id === id);
    if (paper) {
      paper.files = paper.files.filter(f => f !== filename);
      writeDB(db);
      console.log(`[DB DELETE FILE] Removed file ${filename} from ${id} (0.5s done)`);
    }
    res.json({ success: true });
  }, 500);
});

// API: Submit Paper (new submission)
app.post('/api/papers', (req, res) => {
  const db = readDB();
  const { title, authors, filename, assignedEditor } = req.body;

  const newPaper = {
    id: `PP-${String(db.papers.length + 1).padStart(2, '0')}`,
    title,
    authors: authors || [],
    status: "SUBMITTED",
    currentFile: filename,
    files: [filename],
    assignedEditor: assignedEditor || "Editor A"
  };

  db.papers.push(newPaper);
  writeDB(db);
  res.json(newPaper);
});

// API: Get Reviewers
app.get('/api/reviewers', (req, res) => {
  const db = readDB();
  res.json(db.reviewers);
});

// API: Delete Reviewer (Error 4 Target)
app.delete('/api/reviewer/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.reviewers = db.reviewers.filter(r => r.id !== id);
  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 심사자를 데이터베이스에서 삭제(DELETE)하더라도, 
  // 배정된 미완료 업무 건수 및 심사 통계 집계(`stats`) 테이블의 총 심사자 수 항목에서 
  // 해당 인원의 가중치를 누락/차감하지 않고 방치하여 통계 상 유령 심사 수치가 남는 결함입니다.
  writeDB(db);
  console.log(`[DB REVIEWER DELETE] Removed reviewer ${id}. Left stats and tasks untouched!`);
  res.json({ success: true });
});

// API: Get stats
app.get('/api/stats', (req, res) => {
  const db = readDB();
  res.json(db.stats);
});

// API: Get private comments (Editor A or B)
app.get('/api/private-comments', (req, res) => {
  const db = readDB();
  res.json(db.privateComments);
});

// API: Get public reviews
app.get('/api/reviews', (req, res) => {
  const db = readDB();
  res.json(db.reviews);
});

// API: Assign reviewer
app.post('/api/reviewers/assign', (req, res) => {
  const { paperId, reviewerName } = req.body;
  const db = readDB();

  const newReview = {
    id: `REV-${Date.now()}`,
    paperId,
    reviewerName,
    rating: "PENDING",
    comment: "심사 대기 상태입니다."
  };
  db.reviews.push(newReview);

  // Increment reviewer activeTasks
  const rev = db.reviewers.find(r => r.name === reviewerName);
  if (rev) {
    rev.activeTasks += 1;
  }
  db.stats.pendingReviews += 1;

  writeDB(db);
  res.json(newReview);
});

// API: Decision
app.patch('/api/papers/:id/decision', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();

  const paper = db.papers.find(p => p.id === id);
  if (paper) {
    paper.status = status;
    writeDB(db);
  }
  res.json(paper);
});

// Reset database
app.post('/api/reset', (req, res) => {
  const initial = {
    "papers": [
      { "id": "PP-01", "title": "딥러닝 기반 실시간 객체 탐지 알고리즘 최적화", "authors": ["김철수", "이영희", "박민준"], "status": "UNDER_REVIEW", "currentFile": "paper_v1.pdf", "files": ["paper_v1.pdf"], "assignedEditor": "Editor A" },
      { "id": "PP-02", "title": "블록체인 분산 원장을 활용한 의료 데이터 보안 모델 연구", "authors": ["정우성", "한지민"], "status": "SUBMITTED", "currentFile": "blockchain_draft.pdf", "files": ["blockchain_draft.pdf"], "assignedEditor": "Editor A" },
      { "id": "PP-03", "title": "무인 항공기 자율 주행을 위한 경로 탐색 기술 분석", "authors": ["최현우", "윤서진", "송하윤"], "status": "REVISION_REQUIRED", "currentFile": "uav_v1.pdf", "files": ["uav_v1.pdf"], "assignedEditor": "Editor B" }
    ],
    "reviewers": [
      { "id": "RV-01", "name": "박선생 교수", "institution": "한국과학기술원", "activeTasks": 3 },
      { "id": "RV-02", "name": "이박사 연구원", "institution": "전자통신연구원", "activeTasks": 2 }
    ],
    "stats": {
      "totalReviewers": 2,
      "pendingReviews": 5,
      "completedReviews": 12
    },
    "privateComments": [
      { "id": "PC-01", "paperId": "PP-01", "editor": "Editor A", "comment": "연구 방법론의 수학적 유도 과정이 모호합니다. 심사위원단에 엄격한 수식 검증을 요청할 계획입니다." }
    ],
    "reviews": [
      { "id": "REV-01", "paperId": "PP-01", "reviewerName": "박선생 교수", "rating": "MAJOR_REVISION", "comment": "벤치마크 실험 조건을 강화하십시오." }
    ]
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[PaperReview Server] Listening on http://localhost:${PORT}`);
});
