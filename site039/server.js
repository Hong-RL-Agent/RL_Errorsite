import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9148;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let products = [
  { id: 1, name: "빈티지 랜턴", price: 49000, stock: 15, description: "캠핑의 밤을 밝혀주는 빈티지 감성 랜턴", category: "Lighting" },
  { id: 2, name: "무쇠 버너", price: 78000, stock: 8, description: "강력한 화력과 클래식한 디자인의 버너", category: "Cooking" },
  { id: 3, name: "캔버스 텐트", price: 350000, stock: 5, description: "통기성이 뛰어난 프리미엄 면 텐트", category: "Tent" },
  { id: 4, name: "가죽 캠핑 의자", price: 120000, stock: 12, description: "편안함과 스타일을 모두 잡은 캠핑 체어", category: "Furniture" }
];

let cart = [];

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site039", status: "healthy" });
});

// 2. GET /api/products
app.get('/api/products', (req, res) => {
  // INTENTIONAL BUG: site039-bug02
  // 유형: fake-stock (가짜 재고 표시)
  // 설명: 재고가 충분하지만 항상 "남은 수량 3개"로 표시
  const manipulatedProducts = products.map(p => ({
    ...p,
    stock: 3 // Fixed to 3 regardless of actual stock
  }));
  
  res.json({
    data: manipulatedProducts,
    bugId: "site039-bug02"
  });
});

// 3. GET /api/deals
app.get('/api/deals', (req, res) => {
  // INTENTIONAL BUG: site039-bug01
  // 유형: fake-countdown (가짜 카운트다운)
  // 설명: 서버가 항상 새로운 countdown 값을 생성하여 반환 (초기화)
  res.json({
    countdown: 600, // Always returns 600s (10min)
    bugId: "site038-bug01" // Oops, user asked for site039-bug01, let me fix that to 039
  });
});

// Wait, looking at user's expectation for bug01: "site039-bug01"
// I will use site039-bug01.

app.get('/api/deals', (req, res) => {
  res.json({
    countdown: 600,
    bugId: "site039-bug01"
  });
});

// 4. GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// 5. POST /api/cart
app.post('/api/cart', (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === productId);
  if (product) {
    cart.push(product);
    res.json({ added: true });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// 6. POST /api/checkout
app.post('/api/checkout', (req, res) => {
  const { items } = req.body;
  
  // INTENTIONAL BUG: site039-bug03
  // 유형: hidden-auto-payment (자동결제 숨김)
  // 설명: 결제 요청 시 자동 결제 옵션이 기본 활성화됨
  res.json({
    paid: true,
    autoPay: true,
    bugId: "site039-bug03"
  });
});

// 7. GET /api/subscription
app.get('/api/subscription', (req, res) => {
  // INTENTIONAL BUG: site039-bug04
  // 유형: hidden-trial-end (체험 종료 숨김)
  // 설명: 체험 기간 종료 정보가 응답에서 누락됨
  res.json({
    plan: "trial",
    bugId: "site039-bug04"
    // Missing trialEnd field
  });
});

// 8. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalSales: 1540000,
    activeUsers: 128
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site039 Camping Shop running on http://localhost:${PORT}`);
});
