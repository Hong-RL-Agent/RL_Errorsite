import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9153;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let products = [
  { id: 1, name: "신선한 사과 (1kg)", originalPrice: 10000, discountPrice: 7000, category: "과일", expiry: "2024-01-01", image: "🍎" },
  { id: 2, name: "삼겹살 (500g)", originalPrice: 15000, discountPrice: 12000, category: "정육", expiry: "2026-12-31", image: "🥓" },
  { id: 3, name: "제주 감귤 (2kg)", originalPrice: 12000, discountPrice: 8400, category: "과일", expiry: "2026-05-10", image: "🍊" },
  { id: 4, name: "우유 (1L)", originalPrice: 3000, discountPrice: 2500, category: "유제품", expiry: "2024-01-01", image: "🥛" },
  { id: 5, name: "무농약 상추", originalPrice: 2000, discountPrice: 1500, category: "채소", expiry: "2026-05-20", image: "🥬" },
  { id: 6, name: "대용량 화장지 (30롤)", originalPrice: 25000, discountPrice: 17500, category: "생필품", expiry: "2026-12-31", image: "🧻" },
  { id: 7, name: "시원한 콜라 (1.5L)", originalPrice: 2800, discountPrice: 2100, category: "음료", expiry: "2026-12-31", image: "🥤" },
  { id: 8, name: "즉석밥 (12입)", originalPrice: 18000, discountPrice: 14000, category: "생필품", expiry: "2026-12-31", image: "🍚" }
];

// Past Data for Bug 02
let pastProducts = [
  { id: 991, name: "[과거] 2023 한정 딸기", originalPrice: 15000, discountPrice: 5000, category: "과일", expiry: "2023-12-31", image: "🍓" },
  { id: 992, name: "[과거] 2023 냉동 만두", originalPrice: 8000, discountPrice: 4000, category: "냉동", expiry: "2023-12-31", image: "🥟" }
];

let cart = [];

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site044", status: "healthy" });
});

app.get('/api/flyers', (req, res) => {
  // Bug 02: Stale Cache
  res.json({
    data: [
      { id: 101, title: "2023년 겨울 정기 세일 전단지", date: "2023-12-01", type: "snapshot" }
    ],
    bugId: "site044-bug02"
  });
});

app.get('/api/flyers/:id/products', (req, res) => {
  const id = parseInt(req.params.id);
  // Bug 02 연동: 101번 전단지는 과거 데이터를 반환
  if (id === 101) {
    return res.json({ data: pastProducts, bugId: "site044-bug02" });
  }
  res.json({ data: products });
});

app.get('/api/flyers/today', (req, res) => {
  // Bug 01: TTL Not Applied
  res.json({
    data: products,
    bugId: "site044-bug01"
  });
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let product = products.find(p => p.id === id) || pastProducts.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const buggyRate = Math.round((product.originalPrice - product.discountPrice) / 100); 

  res.json({
    ...product,
    discountRate: buggyRate,
    bugId: "site044-bug03"
  });
});

app.get('/api/deals/special', (req, res) => {
  // Bug 04: Job Skipped
  const incomplete = products.slice(0, 3);
  res.json({
    data: incomplete,
    expectedCount: 8,
    bugId: "site044-bug04"
  });
});

app.get('/api/cart', (req, res) => {
  res.json({ data: cart });
});

app.post('/api/cart', (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === productId) || pastProducts.find(p => p.id === productId);
  if (product) {
    cart.push({ ...product, cartId: Date.now() });
    res.json({ added: true, cartCount: cart.length });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.delete('/api/cart/:cartId', (req, res) => {
  const cartId = parseInt(req.params.cartId);
  cart = cart.filter(item => item.cartId !== cartId);
  res.json({ deleted: true });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalProducts: products.length + pastProducts.length,
    discounted: products.length,
    cartItems: cart.length
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site044 Mart Flyer Server running on http://localhost:${PORT}`);
});
