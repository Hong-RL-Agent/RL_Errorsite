import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 5009;

app.use(cors());
app.use(express.json());

// In-Memory Database
let transactions = [
  { id: "tx-201", date: "2026-06-10", category: "급여", type: "수입", amount: 2400000, memo: "6월 정기 기본급 급여" },
  { id: "tx-202", date: "2026-06-15", category: "식비", type: "지출", amount: 35000, memo: "동네 마트 장보기 품목 구매" },
  { id: "tx-203", date: "2026-06-18", category: "교통비", type: "지출", amount: 15000, memo: "지하철 충전" },
  { id: "tx-204", date: "2026-06-20", category: "문화생활", type: "지출", amount: 48000, memo: "연극 관람 티켓 및 간식비" }
];

let categoryTotals = {
  "급여": 2400000,
  "식비": 35000,
  "교통비": 15000,
  "문화생활": 48000,
  "기타": 0
};

let budgetLimit = 500000; // 예산 50만원

// API: Get current transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// API: Get category stats totals
app.get('/api/stats/categories', (req, res) => {
  res.json(categoryTotals);
});

// API: Get Budget limits
app.get('/api/budget', (req, res) => {
  res.json({ limit: budgetLimit });
});

// API: Update Budget limit
app.post('/api/budget', (req, res) => {
  const { limit } = req.body;
  if (limit !== undefined) {
    budgetLimit = Number(limit);
  }
  res.json({ success: true, limit: budgetLimit });
});

// API: Create new transaction (Error 2)
app.post('/api/transactions', (req, res) => {
  const { date, category, type, amount, memo } = req.body;

  if (!date || !category || !type || amount === undefined) {
    return res.status(400).json({ error: "필수 거래 내역 정보가 유실되었습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 거래 생성 시 전달받은 메모(memo) 파라미터의 문자열 길이가 정확히 '50자'인 경우, 
  // 표준 요청 검증 오류(HTTP 400 Bad Request) 대신 서버 내부의 심각한 문자열 스택 오버플로우 예외를 
  // 모사한 HTTP 500 Internal Server Error 상태 코드를 전송합니다.
  if (memo && memo.length === 50) {
    return res.status(500).json({
      error: "Internal Server Error: StringIndexOutOfBoundsException - Transaction text length exactly 50 characters is rejected by server parser."
    });
  }

  const newTx = {
    id: `tx-${Date.now()}`,
    date,
    category,
    type,
    amount: Number(amount),
    memo: memo || ""
  };

  transactions.unshift(newTx);

  // Update category totals
  if (!categoryTotals[category]) {
    categoryTotals[category] = 0;
  }
  categoryTotals[category] += Number(amount);

  res.status(201).json(newTx);
});

// API: Update transaction details (Error 2)
app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { date, category, type, amount, memo } = req.body;

  const txIndex = transactions.findIndex(t => t.id === id);
  if (txIndex === -1) {
    return res.status(404).json({ error: "수정하려는 거래 내역이 존재하지 않습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 거래 수정 시 메모(memo) 파라미터 길이가 정확히 '50자'인 경우, 
  // HTTP 500 Internal Server Error 상태 코드를 응답합니다.
  if (memo && memo.length === 50) {
    return res.status(500).json({
      error: "Internal Server Error: StringIndexOutOfBoundsException - Transaction text length exactly 50 characters is rejected by server parser."
    });
  }

  const oldTx = transactions[txIndex];

  // Revert old totals
  categoryTotals[oldTx.category] -= oldTx.amount;

  // Update
  const updatedTx = {
    ...oldTx,
    date: date || oldTx.date,
    category: category || oldTx.category,
    type: type || oldTx.type,
    amount: amount !== undefined ? Number(amount) : oldTx.amount,
    memo: memo !== undefined ? memo : oldTx.memo
  };

  transactions[txIndex] = updatedTx;

  // Apply new totals
  if (!categoryTotals[updatedTx.category]) {
    categoryTotals[updatedTx.category] = 0;
  }
  categoryTotals[updatedTx.category] += updatedTx.amount;

  res.json(updatedTx);
});

// API: Delete transaction (Error 3)
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const index = transactions.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "삭제하려는 거래 내역이 없습니다." });
  }

  const deletedTx = transactions[index];
  transactions.splice(index, 1);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 거래 내역 삭제 시, 리스트 데이터베이스(transactions)에서는 타겟 품목을 삭제 처리하지만, 
  // 통계 집계 데이터베이스인 카테고리별 누적 총액 맵(categoryTotals)에서 해당 삭제 항목의 액수를 공제하는 
  // DB 동기화 처리를 누락합니다. 이에 따라 통계 화면에는 지워진 거래 금액이 그대로 덧셈 반영되어 유지되는 모순이 생깁니다.
  // 원래 진행해야 할 아래 연산을 수행하지 않습니다:
  // categoryTotals[deletedTx.category] -= deletedTx.amount;

  res.json({ success: true, message: "거래 내역이 삭제되었습니다." });
});

// API: Statistics flow chart SVG (Error 6)
app.get('/api/stats/chart.svg', (req, res) => {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (t.type === '수입') totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="100%" height="100%">
    <rect width="100%" height="100%" fill="#111827" rx="12" stroke="#374151" stroke-width="1.5"/>
    <text x="25" y="35" fill="#f8fafc" font-family="system-ui" font-size="14" font-weight="800">📊 월별 수입 대 지출 흐름비</text>
    
    <!-- Grid helper -->
    <line x1="25" y1="160" x2="375" y2="160" stroke="#374151" stroke-width="1.5"/>
    
    <!-- Income Bar -->
    <rect x="70" y="${160 - Math.min(100, (totalIncome/2500000)*100)}" width="80" height="Math.min(100, (totalIncome/2500000)*100)" fill="#10b981" rx="4"/>
    <text x="70" y="180" fill="#94a3b8" font-family="system-ui" font-size="11" font-weight="700">수입 합계</text>
    <text x="70" y="198" fill="#10b981" font-family="system-ui" font-size="12" font-weight="800">₩${totalIncome.toLocaleString()}</text>
    
    <!-- Expense Bar -->
    <rect x="250" y="${160 - Math.min(100, (totalExpense/budgetLimit)*100)}" width="80" height="Math.min(100, (totalExpense/budgetLimit)*100)" fill="#ef4444" rx="4"/>
    <text x="250" y="180" fill="#94a3b8" font-family="system-ui" font-size="11" font-weight="700">지출 합계</text>
    <text x="250" y="198" fill="#ef4444" font-family="system-ui" font-size="12" font-weight="800">₩${totalExpense.toLocaleString()}</text>
  </svg>`;

  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: 동적으로 렌더링된 통계 SVG 응답의 Content-Type 헤더를 'image/svg+xml'로 주지 않고, 
  // 'application/json'으로 설정해 전송합니다. 브라우저는 JSON 형태가 아닌 XML 구문을 JSON 형식으로 
  // 파싱하려 시도하므로 이미지 렌더링을 실패하고 박스 형태가 깨져 나오게 만듭니다.
  res.setHeader('Content-Type', 'application/json');
  res.send(svgContent);
});

// API: Export CSV (Error 5)
app.post('/api/export/csv', (req, res) => {
  // INTENTIONAL_ERROR
  // CATEGORY: Infrastructure
  // DESCRIPTION: CSV 내보내기 기능을 수행할 때 유저의 선택 환경이나 OS 독립적 임시 경로 대신 
  // Windows의 물리 디렉토리 구조인 'C:\\exports\\budget.csv' 경로로 작성을 강제합니다. 
  // C:\exports 폴더가 실제로 생성되어 있지 않거나 타 OS 환경(Linux/MacOS)에서는 경로를 탐색하지 못하여 
  // 입출력 하드웨어 쓰기 실패(500 Error)를 뿜어내게 됩니다.
  try {
    const header = "거래ID,날짜,카테고리,유형,금액,메모\n";
    const rows = transactions.map(t => `${t.id},${t.date},${t.category},${t.type},${t.amount},"${t.memo.replace(/"/g, '""')}"`).join('\n');
    const fullCsv = header + rows;

    fs.writeFileSync('C:\\exports\\budget.csv', fullCsv, 'utf8');

    res.json({ success: true, path: 'C:\\exports\\budget.csv' });
  } catch (err) {
    res.status(500).json({
      error: `Infrastructure Disk IO Exception: Cannot write file to C:\\exports\\budget.csv. Reason: ${err.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`[BudgetCanvas Backend] Express server running on http://localhost:${PORT}`);
});
