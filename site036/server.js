import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9152;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
const quotes = [
  { id: 1, text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { id: 2, text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { id: 3, text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { id: 4, text: "Spread love everywhere you go.", author: "Mother Teresa" }
];

let users = {
  "user1": { password: "password123", name: "홍길동" }
};

let notes = [
  { id: 1, username: "user1", quoteText: "Stay hungry, stay foolish.", content: "항상 갈망하고 무모하라.", createdAt: new Date().toISOString() }
];

let sessions = {}; // sessionId -> username

// Helper
const generateSessionId = () => "sid_" + Math.random().toString(36).substring(2, 10);

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site036", status: "healthy" });
});

// 2. POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // INTENTIONAL BUG: site036-bug01 (Credential Management Error)
  // No password validation - always success
  const sid = req.headers['x-session-id'] || generateSessionId();
  sessions[sid] = username || "user1";

  res.json({
    login: "success",
    sessionId: sid,
    bugId: "site036-bug01"
  });
});

// 3. POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  // INTENTIONAL BUG: site036-bug03 (Insufficient Logout)
  // We DO NOT delete the session from the 'sessions' object
  res.json({ logout: true });
});

// 4. GET /api/quotes
app.get('/api/quotes', (req, res) => {
  res.json({ data: quotes });
});

// 5. POST /api/notes
app.post('/api/notes', (req, res) => {
  const sid = req.headers['x-session-id'];
  const username = sessions[sid];
  
  if (!username) return res.status(401).json({ error: "Unauthorized" });

  const { quoteId, content } = req.body;
  const quote = quotes.find(q => q.id === quoteId);
  
  const newNote = {
    id: Date.now(),
    username,
    quoteText: quote ? quote.text : "",
    content,
    createdAt: new Date().toISOString()
  };

  notes.unshift(newNote);
  res.json({ saved: true });
});

// 6. GET /api/notes
app.get('/api/notes', (req, res) => {
  const sid = req.headers['x-session-id'];
  const username = sessions[sid];
  
  // Even if user "logged out", if sid is in sessions, it works
  if (!username) return res.status(401).json({ error: "Unauthorized" });

  const userNotes = notes.filter(n => n.username === username);
  
  res.json({
    data: userNotes,
    bugId: "site036-bug03"
  });
});

// 7. GET /api/session
app.get('/api/session', (req, res) => {
  const sid = req.headers['x-session-id'] || "no-session";
  
  res.json({
    sessionId: sid,
    bugId: "site036-bug02"
  });
});

// 8. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  const sid = req.headers['x-session-id'];
  const username = sessions[sid];
  const userNotes = username ? notes.filter(n => n.username === username) : [];

  res.json({
    totalNotes: userNotes.length,
    todayNotes: userNotes.filter(n => n.createdAt.startsWith(new Date().toISOString().split('T')[0])).length
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site036 running on http://localhost:${PORT}`);
});
