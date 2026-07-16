import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9563;

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
    return { products: [], contracts: [], userStats: {}, billingHistory: {} };
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

// API: Get products
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// API: Get contracts list
app.get('/api/contracts', (req, res) => {
  const db = readDB();
  res.json(db.contracts);
});

// API: Plan update (Error 1 Target - 0.1s delay)
app.patch('/api/contracts/:id/plan', (req, res) => {
  const { id } = req.params;
  const { plan } = req.body;

  setTimeout(() => {
    const db = readDB();
    const contract = db.contracts.find(c => c.id === id);
    if (contract) {
      contract.plan = plan;
      writeDB(db);
      console.log(`[DB PLAN] Updated plan for ${id} to ${plan} (0.1s done)`);
    }
    res.json({ success: true, contract });
  }, 100);
});

// API: Delivery date update (Error 1 Target - 3.0s delay)
app.patch('/api/contracts/:id/delivery', (req, res) => {
  const { id } = req.params;
  const { deliveryDate, plan } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Database
  // DESCRIPTION: 배송 날짜 수정 요청(PATCH, 3초 지연) 시점에 프론트엔드가 이전의 요금제 정보(plan)를 동봉 전송하여, 
  // 3초 뒤 지연 업데이트되면서 직전에 교체했던 최신 요금제 값을 덮어쓰고 구형 요금제값으로 원복시키는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const contract = db.contracts.find(c => c.id === id);
    if (contract) {
      contract.deliveryDate = deliveryDate;
      if (plan) {
        contract.plan = plan; // Overwrites plan back to old!
      }
      writeDB(db);
      console.log(`[DB DELIVERY] Saved delivery date: ${deliveryDate} for ${id}. Reverted plan to: ${plan}`);
    }
    res.json({ success: true, contract });
  }, 3000);
});

// API: Product exchange request (Error 2 Target - 4.0s delay)
app.post('/api/contracts/:id/exchange', (req, res) => {
  const { id } = req.params;
  const { newProductId, newProductName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 상품 교체(POST, 4초 지연) 도중 계약 해지(POST, 0.5초 완료)가 요청되면 
  // 해지가 먼저 완료되어 상태가 'TERMINATED'로 변경되나, 4초 뒤 끝난 교체 요청이 
  // 계약 상태를 다시 'EXCHANGING'으로 무단 번복하여 비활성 계약을 예비 부활시키는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const contract = db.contracts.find(c => c.id === id);
    if (contract) {
      contract.productId = newProductId;
      contract.productName = newProductName;
      contract.status = 'EXCHANGING';
      writeDB(db);
      console.log(`[DB EXCHANGE] Exchanged contract ${id} to ${newProductName} (4s done)`);
    }
    res.json({ success: true, contract });
  }, 4000);
});

// API: Contract Termination (Error 2 Target - 0.5s delay)
app.post('/api/contracts/:id/terminate', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const contract = db.contracts.find(c => c.id === id);
    if (contract) {
      contract.status = 'TERMINATED';
      writeDB(db);
      console.log(`[DB TERMINATE] Contract ${id} terminated (0.5s done)`);
    }
    res.json({ success: true, contract });
  }, 500);
});

// API: Get billing graph records (Error 5 Target)
app.get('/api/billing', (req, res) => {
  const { period } = req.query;
  const db = readDB();
  const records = db.billingHistory[period] || [];

  let delay = 100;
  if (period === 'first_half') {
    delay = 3000; // 3.0s delay
  } else if (period === 'second_half') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 청구 기간 변경 요청 시 전반기(first_half, 3초 지연)와 후반기(second_half, 0.2초)를 연속 조작하면, 
  // 후반기 그래프가 먼저 렌더링되고 느린 전반기 데이터가 3초 뒤에 최신 그래프 위로 덮어쓰여 기간-내용 불일치가 발생하는 결함입니다.
  setTimeout(() => {
    res.json(records);
  }, delay);
});

// API: Create new rental contract
app.post('/api/contracts', (req, res) => {
  const { productId, user, plan, deliveryDate } = req.body;
  const db = readDB();

  const product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });

  const newContract = {
    id: `CT-${String(db.contracts.length + 1).padStart(2, '0')}`,
    user: user || "User A",
    productId,
    productName: product.name,
    plan: plan || "일반형 요금제 (1년 약정)",
    monthlyFee: product.price,
    deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
    status: "DELIVERING"
  };

  db.contracts.push(newContract);
  
  // Increment user monthly bill sum
  if (db.userStats[newContract.user]) {
    db.userStats[newContract.user].monthlyBillSum += product.price;
    db.userStats[newContract.user].deliveryAlertsCount += 1;
  }

  writeDB(db);
  res.json(newContract);
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "products": [
      { "id": "PR-01", "name": "올레드 UHD 65인치 TV", "category": "가전", "price": 45000, "brand": "LG" },
      { "id": "PR-02", "name": "비스포크 4도어 냉장고", "category": "가전", "price": 55000, "brand": "삼성" },
      { "id": "PR-03", "name": "오브제컬렉션 워시타워", "category": "가전", "price": 48000, "brand": "LG" },
      { "id": "PR-04", "name": "무풍 갤러리 에어컨", "category": "가전", "price": 62000, "brand": "삼성" },
      { "id": "PR-05", "name": "직수 냉온정수기", "category": "가전", "price": 28000, "brand": "쿠쿠" }
    ],
    "contracts": [
      {
        "id": "CT-01",
        "user": "User A",
        "productId": "PR-01",
        "productName": "올레드 UHD 65인치 TV",
        "plan": "베이직 요금제 (3년 약정)",
        "monthlyFee": 45000,
        "deliveryDate": "2026-07-20",
        "status": "DELIVERING"
      }
    ],
    "userStats": {
      "User A": {
        "monthlyBillSum": 45000,
        "deliveryAlertsCount": 1
      },
      "User B": {
        "monthlyBillSum": 0,
        "deliveryAlertsCount": 0
      }
    },
    "billingHistory": {
      "first_half": [
        { "month": "1월", "amount": 45000 },
        { "month": "2월", "amount": 45000 }
      ],
      "second_half": [
        { "month": "7월", "amount": 45000 }
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
  console.log(`[RentCircle Server] Running on http://localhost:${PORT}`);
});
