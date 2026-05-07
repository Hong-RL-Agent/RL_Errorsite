import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9185;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Mock Data
const products = [
  { id: 1, name: 'Premium Espresso Machine', category: 'Appliances', priceUSD: 899.99, priceJPY: 135000, stock: 12 },
  { id: 2, name: 'Ultra-thin Laptop M3', category: 'Electronics', priceUSD: 1299.00, priceJPY: 195000, stock: 5 },
  { id: 3, name: 'Noise Cancelling Headphones', category: 'Audio', priceUSD: 349.50, priceJPY: 52000, stock: 28 },
  { id: 4, name: 'Mechanical Keyboard (RGB)', category: 'Peripherals', priceUSD: 159.00, priceJPY: 24000, stock: 45 },
  { id: 5, name: 'Curved Gaming Monitor 34"', category: 'Electronics', priceUSD: 549.99, priceJPY: 82000, stock: 15 },
];

const exchangeRates = {
  USD: 1.0,
  KRW: 1320.5,
  JPY: 150.2,
  EUR: 0.92,
  GBP: 0.79
};

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: "site076",
    status: "healthy"
  });
});

// 2. GET /api/rates
// Bug 3: timezone-offset-misapplication
app.get('/api/rates', (req, res) => {
  const base = req.query.base || 'USD';
  const data = Object.entries(exchangeRates).map(([currency, rate]) => {
    // Incorrect time calculation for KST (should be UTC+9)
    // We intentionally subtract 9 hours instead of adding, or just use a wrong offset.
    const now = new Date();
    const wrongTime = new Date(now.getTime() - (18 * 60 * 60 * 1000)).toISOString(); // 18 hours off

    return {
      currency,
      rate: rate / exchangeRates[base],
      time: wrongTime,
      bugId: "site076-bug03"
    };
  });

  res.json({ data });
});

// 3. GET /api/convert
// Bug 1: currency-conversion-rate-mismatch
app.get('/api/convert', (req, res) => {
  const { from, to, amount } = req.query;
  const amt = parseFloat(amount) || 0;
  
  let converted;
  let bugId = null;

  if (from === 'USD' && to === 'KRW') {
    // Incorrect rate: using 1500 instead of 1320.5
    converted = amt * 1500.25; 
    bugId = "site076-bug01";
  } else {
    const fromRate = exchangeRates[from] || 1;
    const toRate = exchangeRates[to] || 1;
    converted = (amt / fromRate) * toRate;
  }

  res.json({
    amount: amt,
    converted: converted,
    from,
    to,
    bugId: bugId
  });
});

// 4. GET /api/prices
// Bug 2: floating-point-rounding-error
app.get('/api/prices', (req, res) => {
  const data = products.map(p => {
    // Intentional floating point error: (0.1 + 0.2) != 0.3
    // We'll add a tiny offset to simulate calculation errors
    const basePrice = p.priceUSD;
    const tax = basePrice * 0.1;
    const shipping = basePrice * 0.05;
    
    // Simulating: 0.1 + 0.2 precision issue
    const faultyPrice = (basePrice + tax + shipping) + (0.1 + 0.2 - 0.3);

    return {
      ...p,
      price: faultyPrice,
      bugId: "site076-bug02"
    };
  });

  res.json({ data });
});

// 5. GET /api/dashboard/summary
// Bug 4: locale-format-inconsistency
app.get('/api/dashboard/summary', (req, res) => {
  // Mixing European (1.000,00) and US (1,000.00) formats
  const totalValueRaw = 12540.50;
  
  // Format 1: 12.540,50 (German/European style)
  const totalValueFormatted = totalValueRaw.toLocaleString('de-DE', { minimumFractionDigits: 2 });
  
  res.json({
    totalValue: `${totalValueFormatted} USD`,
    activeUsers: "1,240", // US Format
    dailyVolume: "540.200,00", // European Format
    lastUpdate: "2024-05-04 14:30:00",
    bugId: "site076-bug04"
  });
});

// 6. GET /api/products
app.get('/api/products', (req, res) => {
  res.json({ data: products });
});

// 7. GET /api/logs
app.get('/api/logs', (req, res) => {
  res.json({
    data: [
      { id: 1, timestamp: new Date().toISOString(), message: "Currency data synced from Central Bank", type: "info" },
      { id: 2, timestamp: new Date().toISOString(), message: "System health check: OK", type: "success" },
      { id: 3, timestamp: new Date().toISOString(), message: "Detected high volatility in JPY/USD", type: "warning" },
    ]
  });
});

// Serve index.html for any other request (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
