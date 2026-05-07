import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9156;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const RAW_DATA = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  date: `2026-05-${String(Math.max(1, 31 - Math.floor(i / 2))).padStart(2, '0')}`,
  description: ['급여', '식비', '월세', '관리비', '편의점', '유튜브', '넷플릭스', '교통비'][Math.floor(Math.random() * 8)],
  amount: [2500000, 15000, 500000, 80000, 5500, 14900, 17000, 2500][Math.floor(Math.random() * 8)],
  type: Math.random() > 0.3 ? 'debit' : 'credit' // credit: 입금, debit: 출금
}));

// Sort by date desc initially
RAW_DATA.sort((a, b) => new Date(b.date) - new Date(a.date));

// Calculate correct balances
let currentBalance = 5000000;
const TRANSACTIONS = RAW_DATA.map(t => {
  if (t.type === 'credit') currentBalance += t.amount;
  else currentBalance -= t.amount;
  return { ...t, balance: currentBalance };
});

let logs = [];

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site047", status: "healthy" });
});

app.get('/api/transactions', (req, res) => {
  const { page = 1, limit = 10, triggerBug } = req.query;
  let data = [...TRANSACTIONS];
  let bugId = null;

  // BUG 02: unstable-pagination-order
  if (triggerBug === 'bug02') {
    bugId = 'site047-bug02';
    // Shuffle slightly for instability
    data = data.sort(() => Math.random() - 0.5);
  }

  // BUG 04: inconsistent-debit-credit-flag
  if (triggerBug === 'bug04') {
    bugId = 'site047-bug04';
    data = data.map(t => ({ ...t, type: t.type === 'credit' ? 'debit' : 'credit' }));
  }

  const start = (page - 1) * limit;
  const end = page * limit;
  let pagedData = data.slice(start, end);

  // BUG 01: incorrect-running-balance
  if (triggerBug === 'bug01') {
    bugId = 'site047-bug01';
    pagedData = pagedData.map(t => ({ ...t, balance: t.balance + 99999 }));
  }

  res.json({
    data: pagedData,
    total: data.length,
    currentPage: parseInt(page),
    bugId
  });
});

app.get('/api/transactions/filter', (req, res) => {
  const { minAmount, triggerBug } = req.query;
  let bugId = null;
  let data = [...TRANSACTIONS];

  if (minAmount) {
    const min = parseInt(minAmount);
    // BUG 03: filter-boundary-error
    if (triggerBug === 'bug03') {
      bugId = 'site047-bug03';
      data = data.filter(t => t.amount >= min - 5000); // Inclusion error
    } else {
      data = data.filter(t => t.amount >= min);
    }
  }

  res.json({ data, bugId });
});

app.get('/api/transactions/:id', (req, res) => {
  const item = TRANSACTIONS.find(t => t.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.get('/api/dashboard/summary', (req, res) => {
  const income = TRANSACTIONS.filter(t => t.type === 'credit').reduce((a, b) => a + b.amount, 0);
  const expense = TRANSACTIONS.filter(t => t.type === 'debit').reduce((a, b) => a + b.amount, 0);
  res.json({
    total: TRANSACTIONS.length,
    income,
    expense,
    balance: TRANSACTIONS[0].balance
  });
});

app.get('/api/stats/monthly', (req, res) => {
  res.json({
    month: "2026-05",
    balance: TRANSACTIONS[0].balance,
    transactions: TRANSACTIONS.length
  });
});

app.get('/api/filter', (req, res) => {
  const { date } = req.query;
  const filtered = TRANSACTIONS.filter(t => t.date.startsWith(date));
  res.json({ data: filtered });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server on http://localhost:${PORT}`));
