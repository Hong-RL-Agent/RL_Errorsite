import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9575;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_PATH = path.join(__dirname, 'data', 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Create physical file for space & parentheses receipt image test (Error 7 Target)
const parensImgPath = path.join(UPLOADS_DIR, '영수증 (복사본).jpg');
if (!fs.existsSync(parensImgPath)) {
  fs.writeFileSync(parensImgPath, 'MOCK_RECEIPT_BYTES_PARENS', 'utf-8');
}

const readDB = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { expenses: [], budgetStats: {} };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
};

// API: Get expenses
app.get('/api/expenses', (req, res) => {
  const db = readDB();
  res.json(db.expenses);
});

// API: Search expenses (Error 5 Target - Network Race)
app.get('/api/expenses/search', (req, res) => {
  const { department, type } = req.query;
  const db = readDB();
  let list = db.expenses;

  if (department && department !== 'ALL') {
    list = list.filter(e => e.department === department);
  }
  if (type && type !== 'ALL') {
    list = list.filter(e => e.type === type);
  }

  let delay = 100;
  if (department === 'DEV') {
    delay = 3000; // 3.0s delay
  } else if (department === 'HR') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 부서 필터('DEV' 3초 지연 ➔ 'HR' 0.2초 완료)와 지출 유형 필터를 빠르게 변경 시 
  // 오래된 이전 응답(개발팀)이 최신 목록을 덮어쓰고, 오른쪽 상세 패널에는 현재 목록에 없는 지출 데이터가 노출되는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
});

// API: Get expense detail (Error 7 Target)
app.get('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const exp = db.expenses.find(e => e.id === id);

  if (!exp) {
    return res.status(404).json({ error: "Expense not found" });
  }

  const detailExp = { ...exp };

  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: 영수증 파일 이름에 공백과 괄호가 있으면('영수증 (복사본).jpg'), 
  // 업로드 및 목록 조회는 정상 수신되나 상세 미리보기 전용 URL 생성 시 이중 URL 인코딩을 수행하여 
  // 미리보기 패널 URL에서만 404가 발생하게 만드는 서버 인코딩 결함입니다.
  if (detailExp.receiptUrl && detailExp.receiptUrl.includes(' ') && (detailExp.receiptUrl.includes('(') || detailExp.receiptUrl.includes(')'))) {
    const filename = path.basename(detailExp.receiptUrl);
    const doubleEncoded = encodeURIComponent(encodeURIComponent(filename));
    detailExp.receiptUrl = `/uploads/${doubleEncoded}`;
  }

  res.json(detailExp);
});

// API: Request Approval (Error 1 Target part 1 - 0.1s delay)
app.post('/api/expenses/:id/request-approval', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const exp = db.expenses.find(e => e.id === id);
    if (exp) {
      exp.status = 'PENDING';
      exp.requestedAmount = exp.amount; // Records requested amount at moment of request
      writeDB(db);
      console.log(`[DB APPROVAL REQUEST] Requested approval for ${id} with amount: ${exp.requestedAmount} (0.1s done)`);
    }
    res.json({ success: true, expense: exp });
  }, 100);
});

// API: Change expense amount (Error 1 Target part 2 - 3.0s delay)
app.patch('/api/expenses/:id/amount', (req, res) => {
  const { id } = req.params;
  const { amount, requestedAmount } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 지출 금액을 수정한 직후(3초 지연 완료) 결재 요청을 보내면(0.1초 완료), 
  // 결재 요청은 먼저 0.1초 만에 처리되나 3초 뒤 완료되는 금액 수정 요청 내부에 이전 구형 요청 금액(requestedAmount)이 함께 동봉 저장되어 
  // 화면에는 수정된 금액으로 결재 요청된 것 같아 보이나, 승인 대기함에는 이전 금액으로 표시되는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const exp = db.expenses.find(e => e.id === id);
    if (exp) {
      exp.amount = Number(amount);
      if (requestedAmount !== undefined) {
        exp.requestedAmount = Number(requestedAmount); // Overwrites requested amount with stale value!
      }
      writeDB(db);
      console.log(`[DB AMOUNT UPDATE] Updated amount for ${id} to ${amount} (3s done). Overwrote requestedAmount to ${requestedAmount}`);
    }
    res.json({ success: true, expense: exp });
  }, 3000);
});

// API: Approve Expense (Error 2 Target part 1 - 0.5s delay)
app.patch('/api/expenses/:id/approve', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const exp = db.expenses.find(e => e.id === id);
    if (exp) {
      exp.status = 'APPROVED';
      writeDB(db);
      console.log(`[DB APPROVE] Approved expense ${id} (0.5s done)`);
    }
    res.json({ success: true, expense: exp });
  }, 500);
});

// API: Modify Expense after Approval (Error 2 Target part 2 - 4.0s delay)
app.patch('/api/expenses/:id/modify', (req, res) => {
  const { id } = req.params;
  const { title, amount } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 결재 승인(0.5초 완료) 직후 지출 항목을 수정(4초 지연 완료)하면, 
  // 승인 완료 상태인데도 늦게 도착한 수정 요청이 DB의 승인 금액과 항목명을 덮어써 변경되게 만드는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const exp = db.expenses.find(e => e.id === id);
    if (exp) {
      exp.title = title;
      exp.amount = Number(amount);
      exp.requestedAmount = Number(amount);
      writeDB(db);
      console.log(`[DB MODIFY POST-APPROVE] Modified approved expense ${id} (4s done). New title: ${title}, amount: ${amount}`);
    }
    res.json({ success: true, expense: exp });
  }, 4000);
});

// API: Delete expense (Error 3 Target)
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.expenses = db.expenses.filter(e => e.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 지출 항목을 삭제(DELETE) 처리하여 대장 목록에서 지우더라도, 
  // 부서별 예산 사용률(`budgetStats`) 및 월별 지출 통계 그래프 수치에는 해당 지출액이 지속 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE EXPENSE] Removed expense ${id}. Stats budgetStats remain unchanged.`);
  res.json({ success: true });
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "expenses": [
      { "id": "EXP-001", "title": "서버 인프라 장비 교체 구매비", "department": "DEV", "type": "ITEM", "amount": 1500000, "requestedAmount": 1500000, "status": "PENDING", "applicant": "김철수", "date": "2026-07-28", "receiptUrl": "/uploads/receipt_server.jpg", "adminId": "ADMIN_A" },
      { "id": "EXP-002", "title": "신규 프로젝트 팀 회식비", "department": "DEV", "type": "MEAL", "amount": 350000, "requestedAmount": 350000, "status": "PENDING", "applicant": "이영희", "date": "2026-07-29", "receiptUrl": "/uploads/영수증 (복사본).jpg", "adminId": "ADMIN_A" }
    ],
    "budgetStats": {
      "DEV": { "totalBudget": 50000000, "usedAmount": 28500000 },
      "DESIGN": { "totalBudget": 20000000, "usedAmount": 12400000 }
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[ExpenseGate Server] Running on http://localhost:${PORT}`);
});
