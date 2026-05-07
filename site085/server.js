import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9194;

app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Bug-Id']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
let records = [
  { id: 1, date: "2026-04-01", category: "Food", amount: 15000, desc: "Lunch at Cafe" },
  { id: 2, date: "2026-04-05", category: "Transport", amount: 2500, desc: "Bus fare" },
  { id: 3, date: "2026-04-10", category: "Shopping", amount: 45000, desc: "New T-shirt" },
  { id: 4, date: "2026-04-15", category: "Food", amount: 12000, desc: "Snacks" },
  { id: 5, date: "2026-04-20", category: "Utilities", amount: 85000, desc: "Internet bill" }
];

let logs = [
  { id: 101, time: new Date().toISOString(), type: "SYSTEM", msg: "Household account engine ready" }
];

const addLog = (type, msg) => {
  logs.unshift({ id: Date.now(), time: new Date().toISOString(), type, msg });
  if (logs.length > 20) logs.pop();
};

// --- API Endpoints ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site085", status: "healthy" });
});

// Bug 01: csv-delimiter-misparse
app.post('/api/upload', (req, res) => {
  const { trigger, content } = req.body;
  let bugId = null;
  
  if (trigger === 'bug01') {
    bugId = 'site085-bug01';
    addLog("PARSE_ERROR", "CSV delimiter mismatch: expected ',' but received ';'");
    // Simulate broken parsing: returning everything as a single column
    res.setHeader('X-Bug-Id', bugId);
    return res.json({ 
      parsed: [{ date: content, category: "ERROR", amount: 0, desc: "Parsing Failure" }],
      bugId 
    });
  }

  // Normal parsing (simplified)
  addLog("UPLOAD", "CSV file uploaded and parsed successfully");
  res.json({ parsed: records, bugId: null });
});

app.get('/api/records', (req, res) => {
  res.json({ data: records });
});

app.post('/api/records', (req, res) => {
  const { date, category, amount, desc } = req.body;
  const newRecord = {
    id: records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1,
    date: date || new Date().toISOString().split('T')[0],
    category: category || "Other",
    amount: parseInt(amount) || 0,
    desc: desc || "No description"
  };
  records.unshift(newRecord);
  addLog("CREATE", `New transaction added: ${newRecord.desc}`);
  res.json({ success: true, record: newRecord });
});

app.post('/api/reset', (req, res) => {
  records = [
    { id: 1, date: "2026-04-01", category: "Food", amount: 15000, desc: "Lunch at Cafe" },
    { id: 2, date: "2026-04-05", category: "Transport", amount: 2500, desc: "Bus fare" },
    { id: 3, date: "2026-04-10", category: "Shopping", amount: 45000, desc: "New T-shirt" },
    { id: 4, date: "2026-04-15", category: "Food", amount: 12000, desc: "Snacks" },
    { id: 5, date: "2026-04-20", category: "Utilities", amount: 85000, desc: "Internet bill" }
  ];
  addLog("RESET", "Database reset to initial sample data");
  res.json({ success: true, data: records });
});

app.get('/api/report', (req, res) => {
  const total = records.reduce((s, r) => s + r.amount, 0);
  const byCategory = records.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.amount;
    return acc;
  }, {});
  res.json({
    generatedAt: new Date().toISOString(),
    summary: {
      totalAmount: total,
      transactionCount: records.length,
      topCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    }
  });
});

// Bug 04: duplicate-record-double-count
app.get('/api/stats', (req, res) => {
  const { trigger } = req.query;
  let bugId = null;
  let totalExpense = records.reduce((sum, r) => sum + r.amount, 0);

  if (trigger === 'bug04') {
    bugId = 'site085-bug04';
    // Logic error: double counting the first two records
    totalExpense += (records[0]?.amount || 0) + (records[1]?.amount || 0);
    addLog("SUM_ERROR", "Total expense integrity check failed: duplication in sum");
  }

  res.setHeader('X-Bug-Id', bugId || '');
  res.json({ totalExpense, bugId });
});

// Bug 02: field-mapping-shift
app.get('/api/stats/category', (req, res) => {
  const { trigger } = req.query;
  let bugId = null;
  
  const categories = records.reduce((acc, r) => {
    let key = r.category;
    let value = r.amount;

    if (trigger === 'bug02') {
      bugId = 'site085-bug02';
      // Field mapping shift: use 'desc' as key and 'id' as value
      key = r.desc.substring(0, 5);
      value = r.id * 1000;
    }

    if (!acc[key]) acc[key] = 0;
    acc[key] += value;
    return acc;
  }, {});

  const result = Object.entries(categories).map(([name, total]) => ({ name, total }));
  if (bugId) {
    addLog("MAP_ERROR", "Category mapping shifted: logic misalignment detected");
    res.setHeader('X-Bug-Id', bugId);
  }
  res.json({ categories: result, bugId });
});

// Bug 03: type-conversion-failure
app.get('/api/stats/monthly', (req, res) => {
  const { trigger } = req.query;
  let bugId = null;
  
  const monthly = records.reduce((acc, r) => {
    const month = r.date.substring(0, 7);
    if (!acc[month]) acc[month] = 0;
    
    if (trigger === 'bug03' && r.id === 1) {
      bugId = 'site085-bug03';
      // Force NaN by adding a string
      acc[month] += parseInt("INVALID_NUMBER"); 
    } else {
      acc[month] += r.amount;
    }
    return acc;
  }, {});

  const result = Object.entries(monthly).map(([month, total]) => ({ month, total }));
  if (bugId) {
    addLog("TYPE_ERROR", "Numeric conversion failure in monthly aggregation");
    res.setHeader('X-Bug-Id', bugId);
  }
  res.json({ data: result, bugId });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalRecords: records.length,
    lastUpdate: new Date().toISOString()
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs });
});

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site085 FinTech Analyzer running on http://localhost:${PORT}`);
});
