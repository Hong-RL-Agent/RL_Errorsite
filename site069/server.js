import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9178;

app.use(cors());
app.use(express.json());

// --- Mock Data ---
let orders = [
  { id: 1, menu: "Super Pepperoni Pizza", user: "Alice", status: "created", rider: null, createdAt: 1714000000000 },
  { id: 2, menu: "Double Cheeseburger", user: "Bob", status: "cooking", rider: null, createdAt: 1714000000000 },
  { id: 3, menu: "Spicy Ramen Set", user: "Charlie", status: "delivering", rider: "Rider-77", createdAt: 1714000005000 },
  { id: 4, menu: "Salmon Sushi (12pcs)", user: "David", status: "completed", rider: "Rider-21", createdAt: 1714000010000 }
];

let riders = [
  { id: "Rider-77", name: "Kim Rider", status: "busy" },
  { id: "Rider-21", name: "Lee Rider", status: "available" },
  { id: "Rider-99", name: "Park Rider", status: "available" }
];

let orderLogs = [
  { id: 1, orderId: 1, status: "created", time: 1714000000000 },
  { id: 2, orderId: 2, status: "cooking", time: 1714000000000 }
];

let cacheStore = {}; // For Bug 04

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site069", status: "healthy" });
});

app.get('/api/orders', (req, res) => {
  const { sort, triggerBug } = req.query;
  let data = [...orders];
  let bugId = null;

  // BUG 03: unstable-sort-order
  if (triggerBug === 'true' && sort === 'createdAt') {
    bugId = 'site069-bug03';
    data = data.sort((a, b) => {
      if (a.createdAt === b.createdAt) return Math.random() - 0.5;
      return a.createdAt - b.createdAt;
    });
  } else {
    data = data.sort((a, b) => a.createdAt - b.createdAt);
  }

  // BUG 04: stale-cache-read-after-write
  if (cacheStore.stale) {
    bugId = 'site069-bug04';
    data = data.map(o => o.id === cacheStore.orderId ? { ...o, status: cacheStore.oldStatus } : o);
    cacheStore.stale = false; 
  }

  res.json({ data, bugId });
});

app.post('/api/orders', (req, res) => {
  const { menu, user } = req.body;
  const newOrder = {
    id: orders.length + 1,
    menu,
    user,
    status: "created",
    rider: null,
    createdAt: Date.now()
  };
  orders.push(newOrder);
  orderLogs.push({ id: orderLogs.length + 1, orderId: newOrder.id, status: "created", time: Date.now() });
  res.json({ success: true, data: newOrder });
});

app.post('/api/orders/status', (req, res) => {
  const { orderId, status, triggerBugType } = req.body;
  const orderIndex = orders.findIndex(o => o.id === parseInt(orderId));
  if (orderIndex === -1) return res.status(404).json({ error: "Order not found" });

  const oldStatus = orders[orderIndex].status;
  let bugId = null;

  const statusOrder = ['created', 'cooking', 'delivering', 'completed'];
  const oldIdx = statusOrder.indexOf(oldStatus);
  const newIdx = statusOrder.indexOf(status);

  // BUG 01: invalid-state-transition-allow
  if (triggerBugType === 'bug01' && newIdx < oldIdx) {
    bugId = 'site069-bug01';
  } else if (newIdx < oldIdx && triggerBugType !== 'bug02' && triggerBugType !== 'bug04') {
    return res.status(400).json({ error: "Cannot revert to previous status" });
  }

  // Update status (for bug 01 or normal flow)
  if (triggerBugType === 'bug01' || newIdx >= oldIdx) {
    orders[orderIndex].status = status;
  }
  
  // BUG 02: duplicate-event-application
  if (triggerBugType === 'bug02') {
    bugId = 'site069-bug02';
    orderLogs.push({ id: orderLogs.length + 1, orderId, status: oldStatus, time: Date.now() });
    orderLogs.push({ id: orderLogs.length + 1, orderId, status: oldStatus, time: Date.now() + 1 }); 
  } else {
    orderLogs.push({ id: orderLogs.length + 1, orderId, status: orders[orderIndex].status, time: Date.now() });
  }

  // Cache update for Bug 04
  if (triggerBugType === 'bug04') {
    bugId = 'site069-bug04';
    cacheStore = { stale: true, orderId: parseInt(orderId), oldStatus: oldStatus };
  }

  res.json({ updated: true, bugId });
});

app.post('/api/orders/assign-rider', (req, res) => {
  const { orderId, riderId } = req.body;
  const order = orders.find(o => o.id === parseInt(orderId));
  if (order) order.rider = riderId;
  res.json({ success: true });
});

app.get('/api/orders/logs', (req, res) => {
  const { orderId } = req.query;
  let data = orderLogs;
  if (orderId) data = data.filter(l => l.orderId === parseInt(orderId));
  
  // Check if any order has duplicate logs for Bug 02 indicator
  const hasDuplicates = data.length > 1 && data.some((l, i) => i > 0 && l.status === data[i-1].status);
  res.json({ data, bugId: hasDuplicates ? 'site069-bug02' : null });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalOrders: orders.length,
    active: orders.filter(o => o.status !== 'completed').length,
    assignedRiders: riders.filter(r => r.status === 'busy').length,
    avgDeliveryTime: '24 min'
  });
});

app.get('/api/riders', (req, res) => {
  res.json({ data: riders });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Site069 on http://localhost:${PORT}`));
