const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9228;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const categories = ['ALL', 'NEW', 'OUTER', 'TOP', 'BOTTOM', 'ACC'];

const products = [
  { id: 101, category: 'OUTER', name: 'OVERSIZED WOOL COAT', price: 289000, colors: ['#000000', '#4b5563'], sizes: ['S', 'M', 'L'], image: '🧥', stock: 10 },
  { id: 102, category: 'TOP', name: 'ESSENTIAL KNIT SWEATER', price: 89000, colors: ['#000000', '#f8fafc', '#9ca3af'], sizes: ['FREE'], image: '🧶', stock: 25 },
  { id: 103, category: 'BOTTOM', name: 'WIDE FIT SLACKS', price: 65000, colors: ['#000000', '#3f3f46'], sizes: ['S', 'M', 'L', 'XL'], image: '👖', stock: 40 },
  { id: 104, category: 'ACC', name: 'LEATHER CROSS BAG', price: 120000, colors: ['#000000'], sizes: ['ONE SIZE'], image: '👜', stock: 15 },
  { id: 105, category: 'OUTER', name: 'VEGAN LEATHER JACKET', price: 159000, colors: ['#000000'], sizes: ['M', 'L'], image: '🧥', stock: 5 },
  { id: 106, category: 'TOP', name: 'BASIC COTTON T-SHIRT', price: 39000, colors: ['#000000', '#ffffff'], sizes: ['S', 'M', 'L', 'XL'], image: '👕', stock: 100 }
];

// --- API Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site009', port: PORT, timestamp: new Date().toISOString() });
});

app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: categories });
});

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let filtered = products;
  if (category && category !== 'ALL') {
    filtered = filtered.filter(p => p.category === category);
  }
  res.json({ success: true, data: filtered });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Fashion server running -> http://localhost:${PORT}`);
});
