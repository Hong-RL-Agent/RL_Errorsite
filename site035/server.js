import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9150;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let words = [
  { id: 1, word: "persistent", definition: "끈기 있는, 지속적인", memorized: true, category: "Adjective" },
  { id: 2, word: "anomaly", definition: "변칙, 이례", memorized: false, category: "Noun" },
  { id: 3, word: "mitigate", definition: "완화시키다, 경감하다", memorized: true, category: "Verb" },
  { id: 4, word: "obscure", definition: "모호한, 잘 알려지지 않은", memorized: false, category: "Adjective" },
  { id: 5, word: "integrity", definition: "진실성, 완전함", memorized: true, category: "Noun" }
];

let webhookLogs = [
  { id: 'wh_001', event: 'WORD_CREATED', payload: { id: 1, word: 'persistent' }, status: 'SUCCESS', timestamp: new Date().toISOString() }
];

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: "site035",
    status: "healthy"
  });
});

// 2. GET /api/words
app.get('/api/words', (req, res) => {
  // INTENTIONAL BUG: site035-bug01
  // Type: response-order-change
  // Description: List returned in random order instead of insertion order.
  let data = [...words];
  data.sort(() => Math.random() - 0.5);

  res.json({
    data: data,
    bugId: "site035-bug01",
    type: "response-order-change"
  });
});

// 3. POST /api/words
app.post('/api/words', (req, res) => {
  const { word, definition, category } = req.body;
  if (!word) return res.status(400).json({ error: "Word is required" });

  const newWord = {
    id: Date.now(),
    word,
    definition: definition || "뜻 정보 없음",
    category: category || "General",
    memorized: false
  };

  words.push(newWord);

  // INTENTIONAL BUG: site035-bug02
  // Type: atomicity-violation
  // Description: Word is saved, but webhook fails (simulated partial failure).
  const webhookSuccess = false; // Forced failure for bug demo

  res.json({
    id: newWord.id,
    saved: true,
    webhookSent: webhookSuccess,
    bugId: "site035-bug02",
    type: "atomicity-violation"
  });
});

// 4. GET /api/words/:id
app.get('/api/words/:id', (req, res) => {
  const word = words.find(w => w.id === parseInt(req.params.id));
  if (!word) return res.status(404).json({ error: "Word not found" });

  // INTENTIONAL BUG: site035-bug05
  // Type: serialization-error
  // Description: Some fields missing or mutated during serialization.
  const serialized = { 
    id: word.id, 
    word: word.word.toUpperCase(), // Mutated data
    // definition missing
    memorized: word.memorized 
  };

  res.json({
    ...serialized,
    bugId: "site035-bug05",
    type: "serialization-error"
  });
});

// 5. DELETE /api/words/:id
app.delete('/api/words/:id', (req, res) => {
  const initialLen = words.length;
  words = words.filter(w => w.id !== parseInt(req.params.id));
  res.json({ deleted: words.length < initialLen });
});

// 6. POST /api/webhook/send
app.post('/api/webhook/send', (req, res) => {
  const { wordId } = req.body;
  const word = words.find(w => w.id === wordId);
  
  // INTENTIONAL BUG: site035-bug03
  // Type: webhook-payload-change
  // Description: Field name changed from 'word' to 'term'.
  const payload = {
    term: word ? word.word : "unknown",
    status: "learned",
    timestamp: new Date().toISOString()
  };

  webhookLogs.unshift({
    id: `wh_${Date.now()}`,
    event: 'MANUAL_SYNC',
    payload,
    status: 'SENT',
    timestamp: payload.timestamp
  });

  res.json({
    ...payload,
    bugId: "site035-bug03",
    type: "webhook-payload-change"
  });
});

// 7. GET /api/webhook/logs
app.get('/api/webhook/logs', (req, res) => {
  // INTENTIONAL BUG: site035-bug04
  // Type: webhook-schema-mismatch
  // Description: Logs contain unexpected fields not in the expected schema.
  const data = webhookLogs.map(log => ({
    ...log,
    internalTraceId: "TR-999-X",
    rawBuffer: "0xABCDEF123456",
    unexpectedMetadata: { flag: true, retryCount: 0 }
  }));

  res.json({
    logs: data,
    bugId: "site035-bug04", 
    type: "webhook-schema-mismatch"
  });
});

// 8. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalWords: words.length,
    memorized: words.filter(w => w.memorized).length
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site035 Vocab App running on http://localhost:${PORT}`);
});
