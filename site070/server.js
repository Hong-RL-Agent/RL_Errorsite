import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9179;

app.use(cors());
app.use(express.json());

// --- Mock Data ---
let seats = [];
for (let i = 1; i <= 64; i++) {
  const row = String.fromCharCode(65 + Math.floor((i - 1) / 8));
  const col = (i - 1) % 8 + 1;
  seats.push({
    id: `${row}${col}`,
    status: 'available', // available, held, sold
    heldBy: null,
    expiresAt: null,
    price: 120000
  });
}

let reservations = [];
let logs = [];
let paymentCounts = {}; // For idempotency bug

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site070", status: "healthy" });
});

app.get('/api/seats', (req, res) => {
  const now = Date.now();
  const { triggerBugType } = req.query;

  // Normal cleanup of expired holds
  // BUG 01: ttl-expiry-miscalculation
  if (triggerBugType !== 'bug01') {
    seats.forEach(s => {
      if (s.status === 'held' && s.expiresAt < now) {
        s.status = 'available';
        s.heldBy = null;
        s.expiresAt = null;
      }
    });
  }

  res.json({ data: seats, bugId: triggerBugType === 'bug01' ? 'site070-bug01' : null });
});

app.post('/api/seats/hold', (req, res) => {
  const { seatId, userId, triggerBugType } = req.body;
  const seat = seats.find(s => s.id === seatId);
  if (!seat) return res.status(404).json({ error: "Seat not found" });

  let bugId = null;

  // BUG 02: duplicate-hold-allocation
  if (triggerBugType === 'bug02') {
    bugId = 'site070-bug02';
    // Allow even if already held
  } else if (seat.status !== 'available') {
    return res.status(400).json({ error: "Seat already occupied" });
  }

  seat.status = 'held';
  seat.heldBy = userId;
  // Default hold time: 30 seconds for demo (normally 5 min)
  seat.expiresAt = Date.now() + (triggerBugType === 'bug01' ? 1000000 : 30000); 

  logs.push({ time: Date.now(), msg: `[HOLD] Seat ${seatId} held by ${userId}` });
  res.json({ held: true, bugId });
});

app.post('/api/payments', (req, res) => {
  const { seatId, userId, triggerBugType } = req.body;
  const seat = seats.find(s => s.id === seatId);
  if (!seat) return res.status(404).json({ error: "Seat not found" });

  let bugId = null;

  // BUG 03: missing-idempotency-key
  if (triggerBugType === 'bug03') {
    bugId = 'site070-bug03';
    paymentCounts[seatId] = (paymentCounts[seatId] || 0) + 1;
    // Don't check if already sold
  } else if (seat.status === 'sold') {
    return res.status(400).json({ error: "Seat already sold" });
  }

  seat.status = 'sold';
  reservations.push({
    id: `RES-${Math.random().toString(36).substr(2, 9)}`,
    seatId,
    userId,
    paidAt: Date.now(),
    amount: seat.price
  });

  logs.push({ time: Date.now(), msg: `[PAID] Seat ${seatId} purchased by ${userId}` });
  res.json({ paid: true, bugId });
});

app.get('/api/reservations', (req, res) => {
  const { triggerBugType } = req.query;
  let data = [...reservations];
  let bugId = null;

  // BUG 04: timezone-interpretation-error
  if (triggerBugType === 'bug04') {
    bugId = 'site070-bug04';
    // Return time with 9-hour offset to simulate UTC/KST confusion
    data = data.map(r => ({ ...r, paidAt: r.paidAt - (9 * 60 * 60 * 1000) }));
  }

  res.json({ data, bugId });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalSeats: seats.length,
    sold: seats.filter(s => s.status === 'sold').length,
    held: seats.filter(s => s.status === 'held').length,
    revenue: seats.filter(s => s.status === 'sold').reduce((acc, curr) => acc + curr.price, 0)
  });
});

app.post('/api/seats/release', (req, res) => {
  const { seatId } = req.body;
  const seat = seats.find(s => s.id === seatId);
  if (seat) {
    seat.status = 'available';
    seat.heldBy = null;
    seat.expiresAt = null;
  }
  res.json({ released: true });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs.slice(-20).reverse() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Site070 on http://localhost:${PORT}`));
