import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9566;

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
    return { projects: [], pledges: [], rewards: [], stats: {}, commentPages: {} };
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

// API: Get projects
app.get('/api/projects', (req, res) => {
  const db = readDB();
  res.json(db.projects);
});

// API: Delete project (Error 4 Target)
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.projects = db.projects.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 창작자 프로젝트 삭제(DELETE) 요청 시 프로젝트 목록 자체는 소거되나, 
  // 창작자 대시보드 및 플랫폼 통계의 총 모금액(`stats.totalRaisedAmount`) 및 총 후원자 수(`stats.backerCount`) 수치는 
  // 차감하지 않고 그대로 누수 유지하여 허위 성과 통계가 노출되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE PROJECT] Removed project ${id}. Stats totalRaisedAmount/backerCount remain unchanged!`);
  res.json({ success: true });
});

// API: Get pledges
app.get('/api/pledges', (req, res) => {
  const db = readDB();
  res.json(db.pledges);
});

// API: Reward change (Error 1 Target - 0.1s delay)
app.patch('/api/pledges/:id/reward', (req, res) => {
  const { id } = req.params;
  const { rewardId } = req.body;

  setTimeout(() => {
    const db = readDB();
    const pledge = db.pledges.find(p => p.id === id);
    if (pledge) {
      pledge.rewardId = rewardId;
      const rw = db.rewards.find(r => r.id === rewardId);
      if (rw) {
        pledge.rewardName = rw.name;
        pledge.price = rw.price;
      }
      writeDB(db);
      console.log(`[DB REWARD] Changed reward for pledge ${id} to ${rewardId} (0.1s done)`);
    }
    res.json({ success: true, pledge });
  }, 100);
});

// API: Quantity update (Error 1 Target - 3.0s delay)
app.patch('/api/pledges/:id/quantity', (req, res) => {
  const { id } = req.params;
  const { quantity, rewardId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend + Database
  // DESCRIPTION: 리워드 품종 변경 직후 후원 수량 수정 시, 수량 수정 요청(3초 지연) 내부에 동봉된 
  // 이전 구형 리워드 정보(rewardId)가 3초 뒤 수량과 함께 갱신 처리되면서, 
  // 직전 교체 기입한 신형 리워드 품종을 덮어쓰고 구형으로 원복시키는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const pledge = db.pledges.find(p => p.id === id);
    if (pledge) {
      pledge.quantity = Number(quantity);
      if (rewardId) {
        pledge.rewardId = rewardId;
        const rw = db.rewards.find(r => r.id === rewardId);
        if (rw) {
          pledge.rewardName = rw.name;
          pledge.price = rw.price;
        }
      }
      writeDB(db);
      console.log(`[DB QUANTITY] Saved quantity for pledge ${id} (3s done). Reverted rewardId to ${rewardId}`);
    }
    res.json({ success: true, pledge });
  }, 3000);
});

// API: Cancel pledge (Error 2 Target - 0.5s delay)
app.post('/api/pledges/:id/cancel', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const pledge = db.pledges.find(p => p.id === id);
    if (pledge) {
      pledge.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL] Pledge ${id} cancelled (0.5s done)`);
    }
    res.json({ success: true, pledge });
  }, 500);
});

// API: Shipping address update (Error 2 Target - 4.0s delay)
app.patch('/api/pledges/:id/shipping', (req, res) => {
  const { id } = req.params;
  const { shippingAddress } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 후원 결제 취소(POST, 0.5초 완료) 실행 직후 배송지 주소지 수정(PATCH, 4초 지연)을 요청하면, 
  // 4초 뒤 주소가 갱신되면서 주문 취소 상태를 'PENDING_PAYMENT'(결제 대기)로 강제 롤백 복귀시켜 
  // 취소된 후원 건이 미정산 활성 상태로 재부활하게 하는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const pledge = db.pledges.find(p => p.id === id);
    if (pledge) {
      pledge.shippingAddress = shippingAddress;
      pledge.status = 'PENDING_PAYMENT';
      writeDB(db);
      console.log(`[DB SHIPPING] Saved shipping address for pledge ${id} (4s done). Reset status to PENDING_PAYMENT.`);
    }
    res.json({ success: true, pledge });
  }, 4000);
});

// API: Get comments pagination (Error 5 Target)
app.get('/api/comments', (req, res) => {
  const { page } = req.query;
  const db = readDB();
  const list = db.commentPages[page] || [];

  let delay = 100;
  if (page === 'page_1') {
    delay = 3000; // 3.0s delay
  } else if (page === 'page_2') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 댓글 페이지를 고속 전환(1페이지 ➔ 2페이지)할 시, 1페이지 응답(3초 지연)이 
  // 2페이지 수신 완료(0.2초) 이후 뒤늦게 들어와 데이터 배열 중간에 무작위 병합(append/push)되면서 
  // 댓글 목록 순서가 왜곡되고 중복 항목이 표시되는 비동기 경합 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "projects": [
      { "id": "PR-01", "title": "스마트 초경량 폴더블 모빌리티 우산", "category": "테크", "target": 5000000, "raised": 4500000, "backers": 90, "creator": "RainLabs", "isFavorite": false },
      { "id": "PR-02", "title": "자연을 담은 비건 실크 수면 안대", "category": "패션", "target": 2000000, "raised": 3500000, "backers": 120, "creator": "NatureWarm", "isFavorite": false }
    ],
    "pledges": [
      {
        "id": "PL-01",
        "projectId": "PR-01",
        "projectTitle": "스마트 초경량 폴더블 모빌리티 우산",
        "rewardId": "RW-01",
        "rewardName": "슈퍼 얼리버드 우산 1개",
        "price": 25000,
        "quantity": 1,
        "shippingAddress": "서울시 마포구 독막로 45",
        "status": "PENDING_PAYMENT"
      }
    ],
    "rewards": [
      { "id": "RW-01", "name": "슈퍼 얼리버드 우산 1개", "price": 25000 },
      { "id": "RW-02", "name": "더블 패키지 우산 2개", "price": 45000 }
    ],
    "stats": {
      "totalRaisedAmount": 8000000,
      "backerCount": 210
    },
    "commentPages": {
      "page_1": [
        { "id": "CM-01", "author": "홍길동", "content": "기념비적 프로젝트 1페이지 댓글입니다." }
      ],
      "page_2": [
        { "id": "CM-04", "author": "임꺽정", "content": "유용한 실용 상품 2페이지 댓글입니다." }
      ]
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[FundWave Server] Running on http://localhost:${PORT}`);
});
