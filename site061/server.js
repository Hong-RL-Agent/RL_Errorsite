const express = require('express');
const path = require('path');
const app = express();
const PORT = 9390;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let accounts = [
  { id: 'acc-1', userId: 'user_A', balance: 5000000, accountNo: '110-123-456789' },
  { id: 'acc-99', userId: 'user_B', balance: 99000000, accountNo: '999-999-999999' } // 타인의 계좌
];

let transactions = [
  { id: 'tx-1', accId: 'acc-1', amount: -50000, category: 'Food', desc: '맛있는 식당', date: '2024-05-01' },
  { id: 'tx-2', accId: 'acc-1', amount: 2500000, category: 'Income', desc: '급여', date: '2024-04-25' }
];

let budgets = [
  { id: 'b1', category: 'Food', limit: 500000, spent: 320000 }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MiniBank API is running' });
});

// API: Get Account Detail (with IDOR bug)
app.get('/api/accounts/:id', (req, res) => {
  const account = accounts.find(a => a.id === req.params.id);
  if (account) {
    // INTENTIONAL BUG: site061-bug03
    // CSV Error: 계좌 소유자 검증 누락
    // Type: security-idors
    // 보안 취약점: 요청한 사용자가 실제 계좌 소유자인지 검증하지 않고 정보를 반환함
    res.json(account);
  } else {
    res.status(404).json({ error: 'Account not found' });
  }
});

// API: Create Transfer (with calculation and duplicate submit bugs)
app.post('/api/transfers', (req, res) => {
  const { fromId, toAccount, amount, desc } = req.body;
  const account = accounts.find(a => a.id === fromId);

  if (!account) return res.status(404).json({ error: 'Source account not found' });
  if (account.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

  // INTENTIONAL BUG: site061-bug02
  // CSV Error: 네트워크 중복 송금
  // Type: network-duplicate-submit
  // 버그: 짧은 시간 내에 동일한 송금 요청이 오더라도 중복 처리를 차단하지 않음

  // INTENTIONAL BUG: site061-bug01
  // CSV Error: DB 잔액 계산 오류
  // Type: database-calculation
  // 버그: 송금액은 차감하지만 수수료(500원)를 잔액에서 차감하는 로직을 누락함
  account.balance -= amount; 
  // account.balance -= 500; // 수수료 차감 로직 누락됨

  const newTx = {
    id: `tx-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    accId: fromId,
    amount: -amount,
    category: 'Transfer',
    desc: `${toAccount} 송금: ${desc}`,
    date: new Date().toISOString().split('T')[0]
  };

  transactions.unshift(newTx);
  res.status(201).json({ success: true, balance: account.balance, transaction: newTx });
});

app.get('/api/transactions/:accId', (req, res) => {
  res.json(transactions.filter(tx => tx.accId === req.params.accId));
});

app.get('/api/budgets', (req, res) => {
  res.json(budgets);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
