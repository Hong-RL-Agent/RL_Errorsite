import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9235;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

let accountBalance = 5240000;
const transactions = [
  { id: 1, type: 'Withdraw', amount: 50000, desc: 'ATM Withdrawal', date: '2026-05-01' },
  { id: 2, type: 'Deposit', amount: 1200000, desc: 'Salary', date: '2026-04-25' },
  { id: 3, type: 'Withdraw', amount: 35000, desc: 'Starbucks', date: '2026-04-24' },
  { id: 4, type: 'Withdraw', amount: 15000, desc: 'Pharmacy', date: '2026-04-23' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site016' });
});

app.get('/api/account', (req, res) => {
  res.json({ balance: accountBalance, owner: 'Kim Chul-su', accountNumber: '110-423-998122' });
});

app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/api/transfer', (req, res) => {
  const { amount } = req.body;
  // Simulating a random failure for Bug 02
  if (amount > 1000000) {
    return res.status(400).json({ success: false, message: 'Transfer limit exceeded' });
  }
  accountBalance -= amount;
  res.json({ success: true, newBalance: accountBalance });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Banking Server running on http://localhost:${PORT}`);
});
