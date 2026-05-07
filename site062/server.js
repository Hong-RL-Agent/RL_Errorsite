import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9171;

app.use(cors({ origin: '*', exposedHeaders: ['X-Bug-Id'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Memory State ---
let orders = [
  { id: "ORD-2024-001", store: "백종원의 홍콩반점", item: "짜장면 곱배기 외 2건", status: "PREPARING", price: "24,500원", eta: 25, time: "오후 2:30" }
];

let logs = [];
const pushLog = (msg, type = "INFO") => {
  logs.unshift({ id: Date.now(), msg, type, time: new Date().toISOString() });
  if (logs.length > 20) logs.pop();
};

// --- API ---

app.get('/api/health', (req, res) => res.json({ ok: true, site: "site062", status: "healthy" }));

// Bug 01: 상태 전이 오류 (Preparing -> 바로 Delivered)
app.post('/api/order/update-status', (req, res) => {
  const { orderId, triggerBug } = req.body;
  const bugId = 'site062-bug01';
  const order = orders.find(o => o.id === orderId);

  if (triggerBug) {
    order.status = "DELIVERED"; // 로직 점프
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`CRITICAL: Order status bypassed verification for ${orderId}.`, "BUG");
    return res.json({ status: "success", order, bugId });
  }

  const stages = ["PREPARING", "SHIPPING", "DELIVERED"];
  const currentIdx = stages.indexOf(order.status);
  if (currentIdx < stages.length - 1) {
    order.status = stages[currentIdx + 1];
  }
  res.json({ status: "success", order });
});

// Bug 02: ETA 계산 로직 결함 (음수 시간 발생)
app.get('/api/order/eta', (req, res) => {
  const { triggerBug } = req.query;
  const bugId = 'site062-bug02';
  
  if (triggerBug === 'true') {
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Arithmetic exception in ETA calculator.`, "BUG");
    return res.json({ eta: -15, bugId }); // 음수 도착 시간
  }
  res.json({ eta: 20 });
});

// Bug 03: 실시간 위치 캐시 데이터 불일치
app.get('/api/order/location', (req, res) => {
  const { triggerBug } = req.query;
  const bugId = 'site062-bug03';
  
  if (triggerBug === 'true') {
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Distributed cache sync failed. Stale location returned.`, "BUG");
    return res.json({ location: "데이터 없음 (오류)", bugId });
  }
  res.json({ location: "서울특별시 강남구 테헤란로 152" });
});

// Bug 04: 쿠폰 적용 트랜잭션 롤백 실패
app.post('/api/order/coupon', (req, res) => {
  const { triggerBug } = req.body;
  const bugId = 'site062-bug04';
  
  if (triggerBug) {
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Transaction rollback failed during coupon validation.`, "BUG");
    return res.json({ status: "FAILED_BUT_LOCKED", message: "쿠폰 적용 중 오류가 발생했으나 포인트가 차감된 상태로 고정되었습니다.", bugId });
  }
  res.json({ status: "success", message: "쿠폰이 적용되었습니다." });
});

// 정상 기능: 가게 정보 조회
app.get('/api/stores', (req, res) => {
  res.json([
    { id: 1, name: "강남 마라탕", rating: 4.8, deliveryTime: "30-40분", minOrder: "15,000원" },
    { id: 2, name: "황금 올리브 치킨", rating: 4.9, deliveryTime: "20-30분", minOrder: "20,000원" },
    { id: 3, name: "어머니 손맛 김치찜", rating: 4.7, deliveryTime: "40-50분", minOrder: "18,000원" }
  ]);
});

app.get('/api/orders', (req, res) => res.json({ data: orders }));
app.get('/api/logs', (req, res) => res.json({ data: logs }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site062 Real Delivery Engine active on http://localhost:${PORT}`);
});
