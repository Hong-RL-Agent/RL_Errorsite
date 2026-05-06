import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9232;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const roomInfo = {
  roomNumber: '1204',
  type: 'Grand Suite',
  guest: 'Mr. Hong Gil-dong',
  status: 'Checked-In'
};

const menu = [
  { id: 1, name: 'Premium Wagyu Steak', price: 85000, category: 'Main' },
  { id: 2, name: 'Lobster Bisque', price: 32000, category: 'Soup' },
  { id: 3, name: 'Classic Caesar Salad', price: 24000, category: 'Salad' },
  { id: 4, name: 'Cabernet Sauvignon', price: 120000, category: 'Wine' },
  { id: 5, name: 'Fresh Fruit Platter', price: 45000, category: 'Dessert' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site013' });
});

app.get('/api/room-info', (req, res) => {
  res.json(roomInfo);
});

app.get('/api/menu', (req, res) => {
  res.json(menu);
});

app.post('/api/request', (req, res) => {
  res.json({ success: true, message: 'Request received' });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Concierge Server running on http://localhost:${PORT}`);
});
