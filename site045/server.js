import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9154;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let perfumes = [
  { id: 1, name: "Velvet Rose", brand: "L'Aura", notes: ["floral", "sweet"], price: 85000, longevity: "8h", baseScore: 92, image: "🌸" },
  { id: 2, name: "Midnight Wood", brand: "Noir", notes: ["woody", "spicy"], price: 120000, longevity: "10h", baseScore: 88, image: "🌲" },
  { id: 3, name: "Ocean Breeze", brand: "Aqua", notes: ["citrus", "fresh"], price: 72000, longevity: "6h", baseScore: 85, image: "🌊" },
  { id: 4, name: "Golden Amber", brand: "Luxe", notes: ["amber", "sweet"], price: 145000, longevity: "12h", baseScore: 95, image: "💎" },
  { id: 5, name: "Herbal Garden", brand: "Nature", notes: ["green", "fresh"], price: 68000, longevity: "5h", baseScore: 82, image: "🌿" },
  { id: 6, name: "Mystic Oud", brand: "Noir", notes: ["woody", "smoky"], price: 158000, longevity: "14h", baseScore: 98, image: "🪵" },
  { id: 7, name: "Citrus Splash", brand: "Aqua", notes: ["citrus", "vibrant"], price: 54000, longevity: "4h", baseScore: 78, image: "🍋" }
];

let cart = [];
let accumulatedGlobalScore = 0; // For Bug 03

// API Endpoints

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site045", status: "healthy" });
});

app.get('/api/products', (req, res) => {
  const { note } = req.query;
  let filtered = [...perfumes];
  let bugId = null;

  if (note) {
    // Bug 02: Filter Leakage - 50% 확률로 조건에 맞지 않는 상품 1개를 섞어 넣음
    filtered = perfumes.filter(p => p.notes.includes(note));
    if (Math.random() > 0.5) {
      const leakyItem = perfumes.find(p => !p.notes.includes(note));
      if (leakyItem) {
        filtered.push(leakyItem);
        bugId = "site045-bug02";
      }
    }
  }

  res.json({ data: filtered, bugId });
});

app.get('/api/products/:id', (req, res) => {
  const p = perfumes.find(p => p.id === parseInt(req.params.id));
  if (p) res.json(p);
  else res.status(404).json({ error: "Not found" });
});

app.get('/api/match', (req, res) => {
  // Bug 01: Non-deterministic matching
  const results = perfumes.map(p => {
    const randomWeight = Math.random() * 30; // 가중치를 크게 주어 변화가 잘 보이게 함
    return {
      ...p,
      matchScore: p.baseScore + randomWeight
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    data: results,
    bugId: "site045-bug01"
  });
});

app.get('/api/match/repeat', (req, res) => {
  // Bug 03: Accumulated state error
  accumulatedGlobalScore += 20; // 20점씩 누적
  
  const results = perfumes.map(p => ({
    ...p,
    bonusScore: accumulatedGlobalScore,
    totalScore: p.baseScore + accumulatedGlobalScore
  }));

  res.json({
    data: results,
    accumulatedScore: accumulatedGlobalScore,
    bugId: "site045-bug03"
  });
});

app.get('/api/cart', (req, res) => {
  res.json({ data: cart });
});

app.post('/api/cart', (req, res) => {
  const { productId } = req.body;
  const p = perfumes.find(item => item.id === productId);
  if (p) {
    cart.push({ ...p, cartId: Date.now() });
    res.json({ added: true });
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
  // Bug 04: Inconsistent aggregation
  const actualAvg = perfumes.reduce((acc, p) => acc + p.baseScore, 0) / perfumes.length;
  // 고의적으로 틀린 값 반환 (항상 150점 이상으로 설정하여 이상 현상 강조)
  const buggyAvg = 150 + Math.random() * 10;

  res.json({
    totalPerfumes: perfumes.length,
    avgScore: buggyAvg,
    realAvgScore: actualAvg,
    bugId: "site045-bug04"
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site045 Perfume Matcher running on http://localhost:${PORT}`);
});
