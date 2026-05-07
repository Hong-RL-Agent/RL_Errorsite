import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9149;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let products = [
  { id: 1, name: "유기농 당근", price: 3000, stock: 50, category: "채소", img: "https://picsum.photos/seed/carrot/400/300" },
  { id: 2, name: "친환경 상추", price: 2000, stock: 30, category: "채소", img: "https://picsum.photos/seed/lettuce/400/300" },
  { id: 3, name: "꿀 방울토마토", price: 5500, stock: 20, category: "과일", img: "https://picsum.photos/seed/tomato/400/300" },
  { id: 4, name: "무농약 오이", price: 1500, stock: 45, category: "채소", img: "https://picsum.photos/seed/cucumber/400/300" },
  { id: 5, name: "유기농 시금치", price: 3500, stock: 15, category: "채소", img: "https://picsum.photos/seed/spinach/400/300" }
];

let orders = [
  { orderId: 1, productId: 1, productName: "유기농 당근", quantity: 2, status: "배송완료", date: "2026-05-01" },
  { orderId: 2, productId: 3, productName: "꿀 방울토마토", quantity: 1, status: "배송중", date: "2026-05-02" }
];

let messageQueue = [
  { id: 'msg_101', status: 'processed', orderId: 1 },
  { id: 'msg_102', status: 'processing', orderId: 2 }
];

let cache = {
  products: null,
  loaded: false
};

// Internal State for Bugs
let bugsTriggered = {
  loss: false,
  duplicate: false,
  queueReset: false,
  cacheEmpty: true // Default to true for Bug 04
};

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: "site032",
    status: "healthy"
  });
});

// 2. GET /api/products
app.get('/api/products', (req, res) => {
  // INTENTIONAL BUG: site032-bug04
  // Type: cache-not-warmed
  if (bugsTriggered.cacheEmpty) {
    // Only trigger once to avoid overshadowing other bugs
    bugsTriggered.cacheEmpty = false; 
    return res.json({
      data: products,
      cacheHit: false,
      bugId: "site032-bug04",
      type: "cache-not-warmed"
    });
  }

  res.json({
    data: products,
    cacheHit: true
  });
});

// 3. GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// 4. POST /api/orders
app.post('/api/orders', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const newOrderId = orders.length + 1;
  const newOrder = {
    orderId: newOrderId,
    productId,
    productName: product.name,
    quantity,
    status: "결제완료",
    date: new Date().toISOString().split('T')[0]
  };

  orders.push(newOrder);
  
  // site032-bug02: duplicate-processing-after-recovery
  // If recovery was just run, we might simulate duplicate order creation
  if (bugsTriggered.duplicate) {
     orders.push({ ...newOrder, orderId: newOrderId + 100, status: "중복처리됨" });
  }

  messageQueue.push({ id: `msg_${Date.now()}`, status: 'queued', orderId: newOrderId });
  
  res.json({ orderId: newOrderId, status: "queued", bugId: bugsTriggered.duplicate ? "site032-bug02" : null });
});

// 5. GET /api/orders
app.get('/api/orders', (req, res) => {
  res.json({ data: orders });
});

// 6. POST /api/system/recover
app.post('/api/system/recover', (req, res) => {
  // Reset states but with bugs
  bugsTriggered.loss = true;
  bugsTriggered.duplicate = true;
  bugsTriggered.queueReset = true;
  bugsTriggered.cacheEmpty = true; // Still empty after recover (Bug 04)

  // Simulate recovery logic
  res.json({ status: "recovered", message: "시스템 복구가 완료되었습니다. 일부 동기화 지연이 발생할 수 있습니다." });
});

// 7. GET /api/queue/messages
app.get('/api/queue/messages', (req, res) => {
  // INTENTIONAL BUG: site032-bug01
  // Type: message-loss-after-recovery
  if (bugsTriggered.loss) {
    return res.json({
      expected: messageQueue.length + 5,
      actual: messageQueue.length,
      bugId: "site032-bug01",
      type: "message-loss-after-recovery"
    });
  }
  res.json({ expected: messageQueue.length, actual: messageQueue.length });
});

// 8. GET /api/queue/status
app.get('/api/queue/status', (req, res) => {
  // INTENTIONAL BUG: site032-bug03
  // Type: queue-state-not-restored
  if (bugsTriggered.queueReset) {
    return res.json({
      queueSize: 0,
      realSize: messageQueue.length,
      bugId: "site032-bug03",
      type: "queue-state-not-restored"
    });
  }
  res.json({ queueSize: messageQueue.length });
});

// 9. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalProducts: products.length,
    totalOrders: orders.length
  });
});

// 10. GET /api/cache/status
app.get('/api/cache/status', (req, res) => {
  res.json({
    cacheLoaded: !bugsTriggered.cacheEmpty,
    bugId: bugsTriggered.cacheEmpty ? "site032-bug04" : null
  });
});

// Warm up cache manually
app.post('/api/cache/warmup', (req, res) => {
  bugsTriggered.cacheEmpty = false;
  res.json({ message: "캐시 워밍업이 완료되었습니다." });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site032 Organic Mall running on http://localhost:${PORT}`);
});
