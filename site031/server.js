import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9151;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let expenses = [
  { id: 1, amount: 15000, category: 'Food', date: '2026-05-01', description: 'Lunch at Cafe' },
  { id: 2, amount: 2500, category: 'Transport', date: '2026-05-01', description: 'Bus fare' },
  { id: 3, amount: 45000, category: 'Shopping', date: '2026-05-02', description: 'New Shoes' },
  { id: 4, amount: 12000, category: 'Utilities', date: '2026-05-02', description: 'Water Bill' },
  { id: 5, amount: 8000, category: 'Food', date: '2026-05-03', description: 'Snacks' }
];

let messageQueue = [
  { id: 'msg_001', status: 'processed', timestamp: Date.now() - 50000 },
  { id: 'msg_002', status: 'processed', timestamp: Date.now() - 40000 },
  { id: 'msg_003', status: 'failed', timestamp: Date.now() - 30000 },
  { id: 'msg_004', status: 'failed', timestamp: Date.now() - 20000 },
  { id: 'msg_005', status: 'queued', timestamp: Date.now() - 10000 }
];

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: "site031",
    status: "healthy"
  });
});

// 2. GET /api/expenses
app.get('/api/expenses', (req, res) => {
  const { category, dateFrom, dateTo } = req.query;
  let filtered = [...expenses];

  if (category && category !== 'All') {
    filtered = filtered.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }
  if (dateFrom) {
    filtered = filtered.filter(e => e.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter(e => e.date <= dateTo);
  }

  res.json({ data: filtered });
});

// 3. POST /api/expenses
app.post('/api/expenses', (req, res) => {
  const { amount, category, description } = req.body;
  const newExpense = {
    id: expenses.length + 1,
    amount: parseInt(amount),
    category: category || 'General',
    date: new Date().toISOString().split('T')[0],
    description: description || ''
  };
  expenses.push(newExpense);
  
  // Simulate queuing
  messageQueue.push({ id: `msg_${Date.now()}`, status: 'queued', timestamp: Date.now() });
  
  res.json({ id: newExpense.id, status: "queued" });
});

// 4. GET /api/stats/category
app.get('/api/stats/category', (req, res) => {
  const stats = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});
  res.json(stats);
});

// 5. GET /api/stats/monthly
app.get('/api/stats/monthly', (req, res) => {
  const stats = expenses.reduce((acc, curr) => {
    const month = curr.date.substring(0, 7);
    acc[month] = (acc[month] || 0) + curr.amount;
    return acc;
  }, {});
  res.json(stats);
});

// 6. POST /api/system/recover
app.post('/api/system/recover', (req, res) => {
  // INTENTIONAL BACKEND BUG: site031-bug01
  // Type: recovery-order-error
  // Description: Incorrect recovery order causes data inconsistency
  res.json({
    status: "recovered",
    inconsistent: true,
    bugId: "site031-bug01",
    type: "recovery-order-error"
  });
});

// 7. GET /api/external/status
app.get('/api/external/status', (req, res) => {
  // INTENTIONAL BACKEND BUG: site031-bug02
  // Type: external-service-recovery-failure
  // Description: Reported status (UP) differs from actual status (DOWN)
  res.json({
    paymentService: "down",
    reported: "up",
    bugId: "site031-bug02",
    type: "external-service-recovery-failure"
  });
});

// 8. POST /api/messages/retry
app.post('/api/messages/retry', (req, res) => {
  // INTENTIONAL BACKEND BUG: site031-bug03
  // Type: message-reprocessing-failure
  // Description: Retry request fails to reprocess failed messages
  res.json({
    retried: 0,
    failedQueueSize: messageQueue.filter(m => m.status === 'failed').length,
    bugId: "site031-bug03",
    type: "message-reprocessing-failure"
  });
});

// 9. GET /api/messages
app.get('/api/messages', (req, res) => {
  // INTENTIONAL BACKEND BUG: site031-bug04
  // Type: message-loss-after-recovery
  // Description: Actual message count is less than expected after recovery
  res.json({
    expected: messageQueue.length + 4,
    actual: messageQueue.length,
    bugId: "site031-bug04",
    type: "message-loss-after-recovery"
  });
});

// 10. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalExpenses: expenses.reduce((acc, curr) => acc + curr.amount, 0),
    categories: [...new Set(expenses.map(e => e.category))].length,
    recentCount: expenses.length
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site031 Expense Statistics running on http://localhost:${PORT}`);
});
