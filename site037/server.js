import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9154;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let checklists = [
  { id: 1, title: "제주도 여행", owner: "user1", items: [{ id: 101, text: "여권", checked: true }, { id: 102, text: "충전기", checked: false }] },
  { id: 2, title: "부산 호캉스", owner: "user1", items: [{ id: 201, text: "수영복", checked: false }] },
  { id: 999, title: "비밀 여행 (타인)", owner: "otherUser", items: [{ id: 901, text: "비행기표", checked: true }] }
];

let users = {
  "user1": { password: "password123", role: "user" }
};

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site037", status: "healthy" });
});

// 2. POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;

  // INTENTIONAL BUG: site037-bug01
  // Type: brute-force-vulnerability
  // No rate limiting, always responds immediately
  
  // INTENTIONAL BUG: site037-bug02
  // Type: privilege-escalation
  // If role is provided in body, it's accepted as the user's role
  const userRole = role || (users[username] ? users[username].role : "user");

  res.json({
    login: true,
    username: username || "Guest",
    role: userRole,
    bugId: "site037-bug02"
  });
});

// 3. GET /api/checklists
app.get('/api/checklists', (req, res) => {
  // Normally would filter by owner, but returning all for simplicity
  res.json({ data: checklists });
});

// 4. GET /api/checklists/:id
app.get('/api/checklists/:id', (req, res) => {
  const list = checklists.find(l => l.id === parseInt(req.params.id));
  
  // INTENTIONAL BUG: site037-bug03
  // Type: insecure-direct-object-reference (IDOR)
  // No ownership check, returns any list by ID
  
  if (!list) return res.status(404).json({ error: "Not found" });

  res.json({
    ...list,
    bugId: "site037-bug03"
  });
});

// 5. POST /api/checklists
app.post('/api/checklists', (req, res) => {
  // INTENTIONAL BUG: site037-bug04
  // Type: missing-auth
  // Allows creation without any session/token check
  const { title } = req.body;
  const newList = {
    id: Date.now(),
    title: title || "New Journey",
    owner: "anonymous",
    items: []
  };
  checklists.push(newList);
  res.json({ created: true, list: newList, bugId: "site037-bug04" });
});

// 6. DELETE /api/checklists/:id
app.delete('/api/checklists/:id', (req, res) => {
  // INTENTIONAL BUG: site037-bug04
  // Type: missing-auth
  // Allows deletion without check
  const initialLen = checklists.length;
  checklists = checklists.filter(l => l.id !== parseInt(req.params.id));
  res.json({ deleted: checklists.length < initialLen, bugId: "site037-bug04" });
});

// 7. POST /api/items/toggle
app.post('/api/items/toggle', (req, res) => {
  const { listId, itemId } = req.body;
  const list = checklists.find(l => l.id === listId);
  if (list) {
    const item = list.items.find(i => i.id === itemId);
    if (item) item.checked = !item.checked;
  }
  res.json({ toggled: true });
});

// 8. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  const totalItems = checklists.reduce((acc, l) => acc + l.items.length, 0);
  const completed = checklists.reduce((acc, l) => acc + l.items.filter(i => i.checked).length, 0);
  res.json({
    totalLists: checklists.length,
    completedItems: completed,
    completionRate: totalItems ? Math.round((completed / totalItems) * 100) : 0
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site037 Packing App running on http://localhost:${PORT}`);
});
