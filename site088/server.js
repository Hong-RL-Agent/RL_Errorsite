import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9197;

app.use(cors({ origin: '*', exposedHeaders: ['X-Bug-Id'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Data ---
let foods = [
  { id: 1, name: "황금올리브 치킨", price: 20000, img: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400" },
  { id: 2, name: "페퍼로니 피자", price: 18000, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400" },
  { id: 3, name: "직화 스테이크 규동", price: 12000, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
  { id: 4, name: "얼큰 삼선 짬뽕", price: 9500, img: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=400" }
];

let orders = [];
let reviews = [
  { id: 101, orderId: 501, foodName: "황금올리브 치킨", rating: 5, content: "진짜 바삭하고 맛있어요!", createdAt: new Date().toISOString() }
];

let logs = [
  { id: 1, time: new Date().toISOString(), msg: "배달 시스템 메인 프레임워크 가동", type: "SYSTEM" }
];

const pushLog = (msg, type = "INFO") => {
  logs.unshift({ id: Date.now(), time: new Date().toISOString(), msg, type });
  if (logs.length > 50) logs.pop();
};

// --- API ---

app.get('/api/health', (req, res) => res.json({ ok: true, site: "site088" }));

app.get('/api/foods', (req, res) => res.json({ data: foods }));

app.post('/api/order', (req, res) => {
  const { foodId } = req.body;
  const food = foods.find(f => f.id === foodId);
  if (!food) return res.status(404).json({ error: "Menu not found" });

  const newOrder = {
    id: 1000 + orders.length + 1,
    foodId,
    foodName: food.name,
    userId: 101,
    status: "배달완료",
    price: food.price,
    createdAt: new Date().toISOString()
  };
  orders.unshift(newOrder);
  pushLog(`[주문] ${food.name} 결제 및 배달 완료 (Order #${newOrder.id})`, "ORDER");
  res.json({ status: "success", order: newOrder });
});

// [BUG 1, 2, 4]
app.post('/api/review', (req, res) => {
  const { orderId, rating, content, foodName } = req.body;

  // Bug 02: Rule Engine Bypass (Guest review / Event review)
  if (!orderId) {
    const bugId = 'site088-bug02';
    const newRev = { id: Date.now(), orderId: 0, foodName: foodName || "이벤트 메뉴", rating, content, createdAt: new Date().toISOString() };
    reviews.unshift(newRev);
    pushLog(`[보안경고] 비인증 세션 리뷰 등록 허용 (Bug 02)`, "BUG");
    res.setHeader('X-Bug-Id', bugId);
    return res.json({ status: "saved", bugId, review: newRev });
  }

  // Bug 04: Submission Limit Not Enforced (Duplicate reviews)
  const isDuplicate = reviews.find(r => r.orderId === orderId);
  if (isDuplicate) {
    const bugId = 'site088-bug04';
    const newRev = { id: Date.now(), orderId, foodName: isDuplicate.foodName, rating, content, createdAt: new Date().toISOString() };
    reviews.unshift(newRev);
    pushLog(`[로직오류] 동일 주문 중복 리뷰 제출 허용 (Bug 04)`, "BUG");
    res.setHeader('X-Bug-Id', bugId);
    return res.json({ status: "saved", bugId, review: newRev });
  }

  // Bug 01: Missing Input Validation (Rating > 5)
  if (rating > 5) {
    const bugId = 'site088-bug01';
    const newRev = { id: Date.now(), orderId, foodName: foodName, rating, content, createdAt: new Date().toISOString() };
    reviews.unshift(newRev);
    pushLog(`[검증누락] 평점 유효성 체크 실패 - ${rating}점 저장 (Bug 01)`, "BUG");
    res.setHeader('X-Bug-Id', bugId);
    return res.json({ status: "saved", bugId, review: newRev });
  }

  // Normal Review
  const newRev = { id: Date.now(), orderId, foodName, rating, content, createdAt: new Date().toISOString() };
  reviews.unshift(newRev);
  pushLog(`[리뷰] 신규 고객 후기 등록 성공`, "INFO");
  res.json({ status: "saved", review: newRev });
});

app.get('/api/review', (req, res) => res.json({ data: reviews }));

// [BUG 3] Scoring Condition Error
app.get('/api/review/stats', (req, res) => {
  const bugId = 'site088-bug03';
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  // 의도적 가중치 합산 오류
  const avg = reviews.length > 0 ? (total / reviews.length) + 1.5 : 0;
  
  res.setHeader('X-Bug-Id', bugId);
  res.json({ averageRating: parseFloat(avg.toFixed(1)), totalReviews: reviews.length, bugId });
});

app.get('/api/orders', (req, res) => res.json({ data: orders }));

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalOrders: orders.length,
    totalReviews: reviews.length,
    revenue: orders.reduce((s, o) => s + o.price, 0)
  });
});

app.get('/api/logs', (req, res) => res.json({ data: logs }));

app.post('/api/coupons/collect', (req, res) => {
  pushLog("[쿠폰] 월간 정기 할인 쿠폰 발급 성공", "INFO");
  res.json({ status: "success", couponCode: "MONTHLY-088", discount: 3000 });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site088 Backend is live on http://localhost:${PORT}`);
});
