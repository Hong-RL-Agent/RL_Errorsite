import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9176;

app.use(cors());
app.use(express.json());

// --- Mock Data ---
let plans = [
  { id: 1, name: 'Standard Life Care', basePremium: 50000, maxCoverage: 50000000, type: 'General' },
  { id: 2, name: 'Premium Health Guard', basePremium: 85000, maxCoverage: 100000000, type: 'Health' },
  { id: 3, name: 'Senior Silver Plan', basePremium: 35000, maxCoverage: 30000000, type: 'Senior' }
];

let riders = [
  { id: 101, name: 'Cancer Diagnosis Rider', premium: 12000, limit: 20000000 },
  { id: 102, name: 'Heart Surgery Rider', premium: 8000, limit: 15000000 },
  { id: 103, name: 'Accidental Injury Rider', premium: 4500, limit: 10000000 },
  { id: 104, name: 'Dental Care Rider', premium: 15000, limit: 5000000 }
];

let customers = [
  { id: 'C001', name: 'James Kim', age: 35, healthHistory: ['Healthy'] },
  { id: 'C002', name: 'Linda Park', age: 62, healthHistory: ['Diabetes'] }
];

let logs = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site067", status: "healthy" });
});

app.get('/api/insurance/plans', (req, res) => {
  res.json({ data: plans });
});

app.get('/api/insurance/riders', (req, res) => {
  res.json({ data: riders });
});

app.post('/api/insurance/quote', (req, res) => {
  const { planId, selectedRiders, triggerBug } = req.body;
  const plan = plans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ error: "Plan not found" });

  let totalPremium = plan.basePremium;
  let bugId = null;

  // BUG 01: premium-calculation-overflow
  if (triggerBug === 'true' && selectedRiders.length > 3) {
    bugId = 'site067-bug01';
    totalPremium = -1500; // Faulty logic resulting in negative premium
    logs.push({ time: Date.now(), msg: `[산출 오류] 보험료 오버플로우 발생 (Bug 01): 특약 과다 선택` });
  } else {
    selectedRiders.forEach(rid => {
      const r = riders.find(item => item.id === rid);
      if (r) totalPremium += r.premium;
    });
  }

  res.json({ totalPremium, bugId });
});

app.post('/api/insurance/validate', (req, res) => {
  const { planId, healthConditions, triggerBug } = req.body;
  let bugId = null;
  let status = "Accepted";

  // BUG 02: underwriting-bypass-logic
  if (triggerBug === 'true') {
    bugId = 'site067-bug02';
    status = "Accepted"; // Should be Rejected for Diabetes
    logs.push({ time: Date.now(), msg: `[심사 오류] 인수심사 우회 결함 (Bug 02): 위험 질병 자동 승인` });
  } else {
    if (healthConditions.includes('Diabetes') && planId === 2) {
      status = "Rejected";
    }
  }

  res.json({ status, bugId });
});

app.post('/api/insurance/discount', (req, res) => {
  const { discountTypes, triggerBug } = req.body;
  let bugId = null;
  let discountAmount = 0;

  // BUG 03: discount-stacking-error
  if (triggerBug === 'true' && discountTypes.length > 1) {
    bugId = 'site067-bug03';
    discountAmount = 1000000; // Impossible discount amount
    logs.push({ time: Date.now(), msg: `[할인 오류] 비정상적인 할인 중복 적용 (Bug 03)` });
  } else {
    discountAmount = discountTypes.length * 5000;
  }

  res.json({ discountAmount, bugId });
});

app.get('/api/insurance/coverage', (req, res) => {
  const { planId, triggerBug } = req.query;
  const plan = plans.find(p => p.id === parseInt(planId));
  let bugId = null;
  let currentLimit = plan ? plan.maxCoverage : 0;

  // BUG 04: coverage-limit-mismatch
  if (triggerBug === 'true') {
    bugId = 'site067-bug04';
    currentLimit = 999999999; // Fixed high limit regardless of plan
    logs.push({ time: Date.now(), msg: `[한도 오류] 보장 한도 동기화 실패 (Bug 04)` });
  }

  res.json({ currentLimit, bugId });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalCustomers: customers.length,
    activeQuotes: 124,
    approvedRate: '82%'
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs.slice(-20).reverse() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Site067 on http://localhost:${PORT}`));
