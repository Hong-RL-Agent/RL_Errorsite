import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9231;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

let transactions = [
  { id: 1, date: '2026-05-01', category: '식비', title: '점심 식사', amount: -12000, type: 'expense' },
  { id: 2, date: '2026-05-02', category: '교통', title: '버스 충전', amount: -20000, type: 'expense' },
  { id: 3, date: '2026-05-03', category: '급여', title: '월급', amount: 3000000, type: 'income' },
  { id: 4, date: '2026-05-04', category: '쇼핑', title: '운동화 구매', amount: -85000, type: 'expense' },
  { id: 5, date: '2026-05-05', category: '주거', title: '월세 납부', amount: -500000, type: 'expense' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site012' });
});

app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/api/transactions', (req, res) => {
  const newTx = { id: Date.now(), ...req.body };
  transactions.unshift(newTx);
  res.status(201).json(newTx);
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Finance Server running on http://localhost:${PORT}`);
});
