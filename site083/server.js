import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9192;

app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Bug-Id']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
let items = [
  { id: 1, name: "아이폰 15 프로 256GB", price: 1200000, status: "available", img: "📱" },
  { id: 2, name: "맥북 에어 M2 13인치", price: 950000, status: "reserved", img: "💻" },
  { id: 3, name: "소니 WH-1000XM5", price: 280000, status: "available", img: "🎧" },
  { id: 4, name: "닌텐도 스위치 OLED", price: 320000, status: "completed", img: "🎮" },
  { id: 5, name: "다이슨 에어랩 멀티 스타일러", price: 450000, status: "available", img: "💇" },
  { id: 6, name: "마샬 액톤 3 스피커", price: 210000, status: "reserved", img: "🔊" }
];

let logs = [
  { id: 1001, time: new Date(Date.now() - 3600000).toISOString(), itemId: 4, type: "PURCHASE", msg: "구매 확정 완료", userId: "user01" },
  { id: 1002, time: new Date(Date.now() - 7200000).toISOString(), itemId: 2, type: "RESERVE", msg: "예약 신청 완료", userId: "user02" }
];

const addLog = (itemId, type, msg, userId = "anonymous", timestamp = null) => {
  logs.unshift({
    id: Date.now(),
    time: timestamp || new Date().toISOString(),
    itemId,
    type,
    msg,
    userId
  });
  if (logs.length > 30) logs.pop();
};

// --- API Endpoints ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site083", status: "healthy" });
});

// 2. GET items
app.get('/api/items', (req, res) => {
  res.json({ data: items });
});

// 3. POST reserve
app.post('/api/reserve', (req, res) => {
  const { itemId, userId, trigger } = req.body;
  const item = items.find(i => i.id === parseInt(itemId));

  if (!item && trigger !== 'bug04') {
    return res.status(404).json({ error: "Item not found" });
  }

  // Normal logic: only available items can be reserved
  if (item) {
    item.status = "reserved";
    addLog(itemId, "RESERVE", `${item.name} 예약 신청`, userId);
  }

  res.json({ status: "reserved" });
});

// 4. POST purchase confirm (Bugs 01, 04)
app.post('/api/purchase/confirm', (req, res) => {
  const { itemId, userId, trigger } = req.body;
  let bugId = null;
  const item = items.find(i => i.id === parseInt(itemId));

  // Bug 04: broken-reference-integrity
  if (trigger === 'bug04' && !item) {
    bugId = 'site083-bug04';
    addLog(999, "PURCHASE", "존재하지 않는 상품 구매 확정 (Ghost Purchase)", userId);
    res.setHeader('X-Bug-Id', bugId);
    return res.json({ status: "completed", bugId, msg: "Ghost Purchase Successful" });
  }

  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  // Bug 01: duplicate-purchase-acceptance
  if (trigger === 'bug01' && item.status === 'completed') {
    bugId = 'site083-bug01';
    addLog(itemId, "PURCHASE", `${item.name} 중복 구매 확정 발생`, userId);
  } else {
    item.status = "completed";
    addLog(itemId, "PURCHASE", `${item.name} 구매 확정 완료`, userId);
  }

  res.setHeader('X-Bug-Id', bugId || '');
  res.json({
    status: "completed",
    itemId,
    bugId
  });
});

// 5. PATCH item status (Bug 02)
app.patch('/api/item/status', (req, res) => {
  const { itemId, status, trigger } = req.body;
  const item = items.find(i => i.id === parseInt(itemId));
  let bugId = null;

  if (!item) return res.status(404).json({ error: "Item not found" });

  // Bug 02: invalid-state-transition (Completed -> Reserved)
  if (trigger === 'bug02' && item.status === 'completed' && status === 'reserved') {
    bugId = 'site083-bug02';
    item.status = status;
    addLog(itemId, "STATUS_CHANGE", `${item.name} 상태 강제 변경 (완료 -> 예약)`, "admin");
  } else {
    item.status = status;
    addLog(itemId, "STATUS_CHANGE", `${item.name} 상태 변경: ${status}`, "admin");
  }

  res.setHeader('X-Bug-Id', bugId || '');
  res.json({
    status: item.status,
    bugId
  });
});

// 6. GET logs (Bug 03)
app.get('/api/logs', (req, res) => {
  const { trigger } = req.query;
  let bugId = null;
  let data = [...logs];

  // Bug 03: operation-order-inversion
  // Invert the order of the last two logs if trigger is bug03
  if (trigger === 'bug03' && data.length >= 2) {
    bugId = 'site083-bug03';
    // Artificially swap order for UI
    const temp = data[0];
    data[0] = data[1];
    data[1] = temp;
  }

  res.setHeader('X-Bug-Id', bugId || '');
  res.json({
    data,
    bugId
  });
});

// 7. GET dashboard summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalItems: items.length,
    completed: items.filter(i => i.status === 'completed').length,
    reserved: items.filter(i => i.status === 'reserved').length,
    available: items.filter(i => i.status === 'available').length
  });
});

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site083 Transaction Management running on http://localhost:${PORT}`);
});
