import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9180;

app.use(cors());
app.use(express.json());

// --- Mock Data ---
const categories = ["Phone", "Laptop", "Tablet", "Audio", "Camera"];
const regions = ["Seoul", "Busan", "Incheon", "Daegu"];

let masterItems = [
  { id: 1, name: "iPhone 15 Pro", price: 1200000, category: "Phone", region: "Seoul" },
  { id: 2, name: "Galaxy S24 Ultra", price: 1100000, category: "Phone", region: "Busan" },
  { id: 3, name: "MacBook Air M3", price: 1500000, category: "Laptop", region: "Seoul" },
  { id: 4, name: "iPad Pro 11", price: 1000000, category: "Tablet", region: "Incheon" },
  { id: 5, name: "Sony WH-1000XM5", price: 350000, category: "Audio", region: "Seoul" },
  { id: 6, name: "Fujifilm X100VI", price: 2500000, category: "Camera", region: "Daegu" },
  { id: 7, name: "AirPods Pro 2", price: 300000, category: "Audio", region: "Busan" },
  { id: 8, name: "LG Gram 16", price: 1400000, category: "Laptop", region: "Daegu" },
  // Outliers for bug 02
  { id: 99, name: "Broken Charger", price: 500, category: "Phone", region: "Seoul" },
  { id: 100, name: "Diamond iPhone", price: 50000000, category: "Phone", region: "Seoul" }
];

// Add more mock data
for (let i = 10; i <= 50; i++) {
  masterItems.push({
    id: i,
    name: `${categories[i % 5]} Model ${i}`,
    price: 50000 + (Math.random() * 2000000),
    category: categories[i % 5],
    region: regions[i % 4]
  });
}

let logs = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site071", status: "healthy" });
});

app.get('/api/categories', (req, res) => {
  res.json({ data: categories });
});

app.get('/api/items', (req, res) => {
  const { category, min, max, region, triggerBug } = req.query;
  let data = [...masterItems];
  let bugId = null;

  if (category) data = data.filter(i => i.category === category);
  
  // BUG 03: filter-condition-drop
  if (triggerBug === 'bug03') {
    bugId = 'site071-bug03';
    // Logic: Ignore region filter if bug 03 is triggered
    logs.push({ time: Date.now(), msg: `[필터 오류] 다중 조건 필터 중 '지역' 조건이 누락되었습니다 (Bug 03)` });
  } else if (region) {
    data = data.filter(i => i.region === region);
  }

  // BUG 01: boundary-inclusive-error
  if (triggerBug === 'bug01' && (min || max)) {
    bugId = 'site071-bug01';
    if (min) data = data.filter(i => i.price > parseInt(min)); // Error: should be >=
    if (max) data = data.filter(i => i.price < parseInt(max)); // Error: should be <=
    logs.push({ time: Date.now(), msg: `[범위 오류] 가격 필터 경계값(Boundary) 처리 결함 발생 (Bug 01)` });
  } else {
    if (min) data = data.filter(i => i.price >= parseInt(min));
    if (max) data = data.filter(i => i.price <= parseInt(max));
  }

  res.json({ data, bugId });
});

app.get('/api/stats/average', (req, res) => {
  const { category, triggerBug } = req.query;
  let data = masterItems;
  if (category) data = data.filter(i => i.category === category);

  let bugId = null;
  let finalData = data;

  // BUG 02: average-outlier-distortion
  if (triggerBug === 'bug02') {
    bugId = 'site071-bug02';
    // Logic: include outliers (Diamond iPhone, Broken Charger)
    logs.push({ time: Date.now(), msg: `[통계 왜곡] 평균가 산출 시 이상치(Outlier) 제거가 누락되었습니다 (Bug 02)` });
  } else {
    // Normal: filter out extreme values (e.g. > 10,000,000 or < 1000)
    finalData = data.filter(i => i.price < 10000000 && i.price > 1000);
  }

  const sum = finalData.reduce((acc, curr) => acc + curr.price, 0);
  const avg = Math.floor(sum / finalData.length);

  res.json({ averagePrice: avg, count: finalData.length, bugId });
});

app.get('/api/stats/group', (req, res) => {
  const { triggerBug } = req.query;
  let bugId = null;
  
  const stats = categories.map(cat => {
    let catItems = masterItems.filter(i => i.category === cat);
    
    // BUG 04: group-aggregation-contamination
    if (triggerBug === 'bug04') {
      bugId = 'site071-bug04';
      // Contaminate: add random items from other categories to each group
      const others = masterItems.filter(i => i.category !== cat).slice(0, 3);
      catItems = [...catItems, ...others];
      logs.push({ time: Date.now(), msg: `[집계 오염] 카테고리 그룹 집계 과정에서 데이터 격리 실패 (Bug 04)` });
    }

    const sum = catItems.reduce((acc, curr) => acc + curr.price, 0);
    return {
      category: cat,
      average: Math.floor(sum / catItems.length),
      count: catItems.length
    };
  });

  res.json({ data: stats, bugId });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalItems: masterItems.length,
    activeCategories: categories.length,
    topRegion: "Seoul",
    marketHealth: "Stable"
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs.slice(-20).reverse() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`Site071 on http://localhost:${PORT}`));
