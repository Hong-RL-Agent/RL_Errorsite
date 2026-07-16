import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9561;

app.use(cors());
app.use(express.json());

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));

// Inventory Database (Minimum 25 items)
let inventory = [
  { id: "IT-01", name: "대관령 감자", category: "채소류", qty: 150, unit: "kg", exp: "2026-07-20", supplier: "강원농산", price: 2500 },
  { id: "IT-02", name: "양파", category: "채소류", qty: 90, unit: "kg", exp: "2026-07-22", supplier: "강원농산", price: 1800 },
  { id: "IT-03", name: "한우 등심", category: "육류", qty: 45, unit: "kg", exp: "2026-07-18", supplier: "태우한우", price: 45000 },
  { id: "IT-04", name: "신선 삼겹살", category: "육류", qty: 60, unit: "kg", exp: "2026-07-19", supplier: "태우한우", price: 18000 },
  { id: "IT-05", name: "계란", category: "유제품", qty: 300, unit: "판", exp: "2026-07-25", supplier: "서울상사", price: 6000 },
  { id: "IT-06", name: "서울우유 1L", category: "유제품", qty: 80, unit: "개", exp: "2026-07-20", supplier: "서울상사", price: 2800 },
  { id: "IT-07", name: "통마늘", category: "채소류", qty: 50, unit: "kg", exp: "2026-08-01", supplier: "중앙청과", price: 5000 },
  { id: "IT-08", name: "대파", category: "채소류", qty: 40, unit: "kg", exp: "2026-07-21", supplier: "중앙청과", price: 3200 },
  { id: "IT-09", name: "신고 배", category: "과일류", qty: 30, unit: "box", exp: "2026-07-28", supplier: "태양농원", price: 15000 },
  { id: "IT-10", name: "백설 설탕 10kg", category: "공산품", qty: 25, unit: "포", exp: "2027-07-15", supplier: "CJ물류", price: 14000 },
  { id: "IT-11", name: "해표 식용유 18L", category: "공산품", qty: 15, unit: "통", exp: "2027-01-10", supplier: "CJ물류", price: 45000 },
  { id: "IT-12", name: "고춧가루 1kg", category: "조미료", qty: 35, unit: "봉", exp: "2026-12-05", supplier: "남부농산", price: 22000 },
  { id: "IT-13", name: "천일염 20kg", category: "조미료", qty: 10, unit: "포", exp: "2029-07-15", supplier: "남부농산", price: 18000 },
  { id: "IT-14", name: "생닭 1kg", category: "육류", qty: 55, unit: "마리", exp: "2026-07-18", supplier: "태우한우", price: 6500 },
  { id: "IT-15", name: "꽃상추", category: "채소류", qty: 15, unit: "kg", exp: "2026-07-18", supplier: "중앙청과", price: 4000 },
  { id: "IT-16", name: "양배추", category: "채소류", qty: 30, unit: "망", exp: "2026-07-23", supplier: "강원농산", price: 3500 },
  { id: "IT-17", name: "깐쪽파", category: "채소류", qty: 12, unit: "kg", exp: "2026-07-20", supplier: "중앙청과", price: 5500 },
  { id: "IT-18", name: "느타리버섯", category: "채소류", qty: 20, unit: "kg", exp: "2026-07-21", supplier: "강원농산", price: 6000 },
  { id: "IT-19", name: "체다치즈 1kg", category: "유제품", qty: 18, unit: "팩", exp: "2026-09-10", supplier: "서울상사", price: 9500 },
  { id: "IT-20", name: "생크림 1L", category: "유제품", qty: 24, unit: "개", exp: "2026-07-22", supplier: "서울상사", price: 4500 },
  { id: "IT-21", name: "참기름 1.8L", category: "조미료", qty: 8, unit: "병", exp: "2027-02-15", supplier: "CJ물류", price: 24000 },
  { id: "IT-22", name: "진간장 15L", category: "조미료", qty: 12, unit: "통", exp: "2027-05-20", supplier: "CJ물류", price: 28000 },
  { id: "IT-23", name: "햇반 210g", category: "공산품", qty: 120, unit: "개", exp: "2026-11-30", supplier: "CJ물류", price: 900 },
  { id: "IT-24", name: "청양고추", category: "채소류", qty: 25, unit: "kg", exp: "2026-07-21", supplier: "중앙청과", price: 8000 },
  { id: "IT-25", name: "깐도라지", category: "채소류", qty: 10, unit: "kg", exp: "2026-07-22", supplier: "남부농산", price: 12000 }
];

// Suppliers (Minimum 8 locations)
let suppliers = [
  { id: "SU-01", name: "강원농산", contact: "033-123-4567", category: "채소류" },
  { id: "SU-02", name: "태우한우", contact: "02-987-6543", category: "육류" },
  { id: "SU-03", name: "서울상사", contact: "02-555-8888", category: "유제품" },
  { id: "SU-04", name: "중앙청과", contact: "02-111-2222", category: "채소류" },
  { id: "SU-05", name: "태양농원", contact: "031-444-5555", category: "과일류" },
  { id: "SU-06", name: "CJ물류", contact: "1588-0000", category: "공산품" },
  { id: "SU-07", name: "남부농산", contact: "062-888-9999", category: "조미료" },
  { id: "SU-08", name: "대도수산", contact: "051-777-6666", category: "수산물" }
];

// Orders database
let orders = [
  { id: "PO-01", itemId: "IT-01", itemName: "대관령 감자", quantity: 50, approvedQty: 50, status: "APPROVED", date: "2026-07-14", supplierName: "강원농산" },
  { id: "PO-02", itemId: "IT-03", itemName: "한우 등심", quantity: 10, approvedQty: 0, status: "PENDING", date: "2026-07-15", supplierName: "태우한우" }
];

// Receivings database
let receivings = [
  { id: "RC-01", itemId: "IT-01", itemName: "대관령 감자", qty: 50, cost: 125000, date: "2026-07-15", status: "RECEIVED" }
];

// Stats database (Accumulated purchase stats)
let stats = {
  monthlyTotalCost: 125000,
  supplierVolume: {
    "강원농산": 125000,
    "태우한우": 0,
    "서울상사": 0,
    "중앙청과": 0,
    "태양농원": 0,
    "CJ물류": 0,
    "남부농산": 0,
    "대도수산": 0
  }
};

app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

// API: Search Inventory (Error 4 Target - search race condition)
app.get('/api/inventory/search', (req, res) => {
  const { q } = req.query;
  let filtered = inventory;

  if (q) {
    filtered = filtered.filter(i => i.name.includes(q));
  }

  let delay = 100;
  if (q === '대파') {
    delay = 3000;
  } else if (q === '마늘') {
    delay = 200;
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 검색어 입력 시 '대파'(3초 지연) 요청 응답이 '마늘'(0.2초)보다 
  // 늦게 완료되어 최신 검색 명단을 덮어쓰고, 오른쪽 요약 창에는 '마늘' 정보가 
  // 그대로 고착되어 검색 상태와 상세 패널 정보가 괴리되는 결함입니다.
  setTimeout(() => {
    res.json(filtered);
  }, delay);
});

// API: Edit expiry
app.patch('/api/inventory/:id/expiry', (req, res) => {
  const { id } = req.params;
  const { exp } = req.body;
  const item = inventory.find(i => i.id === id);
  if (item) {
    item.exp = exp;
  }
  res.json(item);
});

// API: Waste registration
app.post('/api/inventory/waste', (req, res) => {
  const { index, wasteQty } = req.body;
  if (index >= 0 && index < inventory.length) {
    inventory[index].qty = Math.max(0, inventory[index].qty - Number(wasteQty));
    res.json({ success: true, item: inventory[index] });
  } else {
    res.status(400).json({ error: '유효하지 않은 인덱스 범위입니다.' });
  }
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Create Order
app.post('/api/orders', (req, res) => {
  const { itemId, quantity } = req.body;
  const item = inventory.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: '품목을 찾을 수 없습니다.' });

  const newOrder = {
    id: `PO-${Date.now()}`,
    itemId,
    itemName: item.name,
    quantity: Number(quantity),
    approvedQty: 0,
    status: "PENDING",
    date: new Date().toISOString().split('T')[0],
    supplierName: item.supplier
  };
  orders.push(newOrder);
  res.json(newOrder);
});

// API: Edit Order Quantity (Error 1 Target - 4s delay)
app.patch('/api/orders/:id/quantity', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 발주 수량 수정(PATCH) 요청을 4초 지연시킵니다. 
  // 직후 요청되는 발주 승인(POST, 1초 지연) 시점에 데이터베이스에는 수정 전 기존 수량이 
  // 기록되어 입고 예정 수량(approvedQty)은 이전 수량 기준으로 고정되는 결함입니다.
  setTimeout(() => {
    const ord = orders.find(o => o.id === id);
    if (ord) {
      ord.quantity = Number(quantity);
      console.log(`[DB ORDER] Updated order ${id} quantity to ${quantity} (delayed 4s done)`);
    }
    res.json({ success: true, order: ord });
  }, 4000);
});

// API: Approve Order Standard (Error 1 Target - 1s delay)
app.post('/api/orders/:id/approve', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const ord = orders.find(o => o.id === id);
    if (ord) {
      ord.status = 'APPROVED';
      ord.approvedQty = ord.quantity;
      console.log(`[DB APPROVE] Order ${id} approved with qty ${ord.approvedQty} (1s done)`);
    }
    res.json({ success: true, order: ord });
  }, 1000);
});

// API: Approve Order with Role Control (Error 6 Target)
app.post('/api/orders/:id/approve-role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const ord = orders.find(o => o.id === id);

  if (role === 'STAFF') {
    // INTENTIONAL_ERROR
    // CATEGORY: Backend
    // DESCRIPTION: 권한이 부족한 일반 직원의 승인 요청에 대해 HTTP 403 Forbidden 코드를 반환하지만, 
    // 실제 데이터베이스 상의 발주 상태 값은 'APPROVED'로 강제 변경 승인 처리해버리는 논리적 결함입니다.
    if (ord) {
      ord.status = 'APPROVED';
      ord.approvedQty = ord.quantity;
      console.log(`[DB BYPASS] Unauthorized STAFF approved order ${id}. Modified anyway!`);
    }
    return res.status(403).json({ error: '승인 권한이 없습니다. (부서 관리자 등급 전용)', order: ord });
  } else {
    if (ord) {
      ord.status = 'APPROVED';
      ord.approvedQty = ord.quantity;
    }
    res.json({ success: true, order: ord });
  }
});

// API: Create Receiving (Increases inventory, updates statistics)
app.post('/api/receivings', (req, res) => {
  const { orderId } = req.body;
  const ord = orders.find(o => o.id === orderId);
  if (!ord) return res.status(404).json({ error: '발주서를 찾을 수 없습니다.' });

  const item = inventory.find(i => i.id === ord.itemId);
  if (!item) return res.status(404).json({ error: '품목을 찾을 수 없습니다.' });

  const cost = ord.approvedQty * item.price;

  // Update Inventory
  item.qty += ord.approvedQty;

  // Add receiving entry
  const newRec = {
    id: `RC-${Date.now()}`,
    itemId: ord.itemId,
    itemName: ord.itemName,
    qty: ord.approvedQty,
    cost,
    date: new Date().toISOString().split('T')[0],
    status: "RECEIVED"
  };
  receivings.push(newRec);

  // Update Stats
  stats.monthlyTotalCost += cost;
  if (stats.supplierVolume[ord.supplierName] !== undefined) {
    stats.supplierVolume[ord.supplierName] += cost;
  } else {
    stats.supplierVolume[ord.supplierName] = cost;
  }

  ord.status = 'RECEIVED';

  console.log(`[DB RECEIVING] Stocked ${ord.itemName}. Qty increased by ${ord.approvedQty}. Cost accumulated: ${cost}`);
  res.json({ success: true, receiving: newRec });
});

// API: Cancel Receiving (Error 3 Target)
app.post('/api/receivings/:id/cancel', (req, res) => {
  const { id } = req.params;
  const rec = receivings.find(r => r.id === id);

  if (rec && rec.status === 'RECEIVED') {
    rec.status = 'CANCELLED';

    // Revert inventory qty
    const item = inventory.find(i => i.id === rec.itemId);
    if (item) {
      item.qty = Math.max(0, item.qty - rec.qty);
    }

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 입고 취소(POST) 시 해당 입고건의 재고는 차감 복구하나, 
    // 공급업체 실적 누적 거래액 및 비용 통제 테이블의 월별 총 구매액에서는 
    // 취소 건을 차감 환원하지 않아 실적과 통계 수치가 과대 계산되는 결함입니다.
    console.log(`[DB CANCEL] Cancelled receiving ${id}. Inventory decremented, but cost stats left un-reverted!`);
  }

  res.json({ success: true, receiving: rec });
});

app.get('/api/receivings', (req, res) => {
  res.json(receivings);
});

app.get('/api/suppliers', (req, res) => {
  res.json(suppliers);
});

app.get('/api/stats', (req, res) => {
  res.json(stats);
});

// Reset API
app.post('/api/reset', (req, res) => {
  inventory = [
    { id: "IT-01", name: "대관령 감자", category: "채소류", qty: 150, unit: "kg", exp: "2026-07-20", supplier: "강원농산", price: 2500 },
    { id: "IT-02", name: "양파", category: "채소류", qty: 90, unit: "kg", exp: "2026-07-22", supplier: "강원농산", price: 1800 },
    { id: "IT-03", name: "한우 등심", category: "육류", qty: 45, unit: "kg", exp: "2026-07-18", supplier: "태우한우", price: 45000 }
  ];
  orders = [
    { id: "PO-01", itemId: "IT-01", itemName: "대관령 감자", quantity: 50, approvedQty: 50, status: "APPROVED", date: "2026-07-14", supplierName: "강원농산" }
  ];
  receivings = [];
  stats = {
    monthlyTotalCost: 0,
    supplierVolume: {
      "강원농산": 0,
      "태우한우": 0
    }
  };
  res.json({ success: true });
});

// Fallback to index.html for single page app routing if needed
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[KitchenStock Single-Port] Server running on http://localhost:${PORT}`);
});
