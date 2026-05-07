import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9139;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
const idols = ['IVE', 'NewJeans', 'LE SSERAFIM', 'aespa', 'NMIXX'];
const photocards = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  idol: idols[i % idols.length],
  name: `${idols[i % idols.length]} Card #${i + 1}`,
  likes: Math.floor(Math.random() * 500) + 100,
  img: `https://picsum.photos/seed/pc${i+1}/400/600`
}));

// Circuit Breaker State
let circuit = {
  state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
  failures: 0,
  threshold: 5,
  lastFailureTime: null,
  resetTimeout: 10000 // 10 seconds
};

// Middleware to simulate circuit breaker
const circuitBreakerMiddleware = (req, res, next) => {
  const { simulateFailure, bug } = req.query;

  // site030-bug03: circuit-flapping
  if (bug === 'flapping') {
    circuit.state = Math.random() > 0.5 ? 'OPEN' : 'CLOSED';
    if (circuit.state === 'OPEN') {
      return res.status(503).json({
        error: "Circuit Flapping",
        state: "OPEN",
        bugId: "site030-bug03",
        type: "circuit-flapping"
      });
    }
  }

  // Check state
  if (circuit.state === 'OPEN') {
    const now = Date.now();
    
    // site030-bug02: circuit-not-closing
    // Logic: Even if time passes, don't revert to CLOSED/HALF_OPEN
    if (bug === 'not-closing') {
       return res.status(503).json({
        error: "Still blocked",
        bugId: "site030-bug02",
        type: "circuit-not-closing"
      });
    }

    if (now - circuit.lastFailureTime < circuit.resetTimeout) {
      return res.status(503).json({
        error: "Circuit is OPEN",
        state: "OPEN"
      });
    } else {
      circuit.state = 'HALF_OPEN';
    }
  }

  if (simulateFailure === 'true') {
    circuit.failures++;
    circuit.lastFailureTime = Date.now();

    // site030-bug01: circuit-not-opening
    // Logic: Failures exceed threshold but state remains CLOSED
    if (bug === 'not-opening') {
      return res.status(500).json({
        error: "Service failure",
        bugId: "site030-bug01",
        type: "circuit-not-opening",
        failures: circuit.failures
      });
    }

    if (circuit.failures >= circuit.threshold) {
      circuit.state = 'OPEN';
    }

    return res.status(500).json({
      error: "Service failure",
      failures: circuit.failures
    });
  }

  // Successful request resets failures if in CLOSED state
  if (circuit.state === 'CLOSED') {
    circuit.failures = 0;
  } else if (circuit.state === 'HALF_OPEN') {
    circuit.state = 'CLOSED';
    circuit.failures = 0;
  }

  next();
};

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: "site030",
    status: "healthy"
  });
});

// 2. GET /api/cards
app.get('/api/cards', circuitBreakerMiddleware, (req, res) => {
  const { search, idol } = req.query;
  let filtered = [...photocards];

  if (search) {
    filtered = filtered.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }
  if (idol) {
    filtered = filtered.filter(c => c.idol.toLowerCase() === idol.toLowerCase());
  }

  res.json({ data: filtered });
});

// 3. GET /api/cards/:id
app.get('/api/cards/:id', (req, res) => {
  const card = photocards.find(c => c.id === parseInt(req.params.id));
  if (!card) return res.status(404).json({ error: "Card not found" });
  res.json(card);
});

// 4. POST /api/cards/:id/like
app.post('/api/cards/:id/like', (req, res) => {
  const card = photocards.find(c => c.id === parseInt(req.params.id));
  if (!card) return res.status(404).json({ error: "Card not found" });
  card.likes++;
  res.json({ likes: card.likes });
});

// 5. GET /api/cards/popular
app.get('/api/cards/popular', (req, res) => {
  const sorted = [...photocards].sort((a, b) => b.likes - a.likes);
  res.json({ data: sorted.slice(0, 10), sorted: "desc" });
});

// 6. GET /api/circuit/status
app.get('/api/circuit/status', (req, res) => {
  const { bug } = req.query;
  
  // site030-bug04: threshold-misconfiguration
  if (bug === 'threshold') {
    return res.json({
      state: circuit.state,
      threshold: 0, // BUG: Should be 5
      bugId: "site030-bug04",
      type: "threshold-misconfiguration"
    });
  }

  res.json({
    state: circuit.state,
    threshold: circuit.threshold,
    failures: circuit.failures
  });
});

// 7. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalCards: photocards.length,
    totalLikes: photocards.reduce((acc, curr) => acc + curr.likes, 0)
  });
});

// 8. GET /api/search
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const results = photocards
    .filter(c => c.name.toLowerCase().includes((q || '').toLowerCase()))
    .slice(0, 5);
  res.json(results.map(c => ({ id: c.id, name: c.name })));
});

// RESET API for testing
app.post('/api/circuit/reset', (req, res) => {
  circuit = {
    state: 'CLOSED',
    failures: 0,
    threshold: 5,
    lastFailureTime: null,
    resetTimeout: 10000
  };
  res.json({ message: "Circuit reset successful" });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site030 Idol Gallery running on http://localhost:${PORT}`);
});
