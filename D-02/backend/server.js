require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, runSql, allSql, getSql, resetAllData, isFallback, getFallbackStore } = require('./db');

const app = express();
const PORT = process.env.PORT || 9802;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[PennyLog API] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PennyLog API', port: PORT });
});

// Test Reset API
app.post('/api/test/reset', async (req, res) => {
  try {
    const result = await resetAllData();
    res.json(result);
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// 1. Categories
app.get('/api/categories', async (req, res) => {
  try {
    if (isFallback()) {
      return res.json(getFallbackStore().data.categories);
    }
    const categories = await allSql('SELECT * FROM categories ORDER BY id ASC');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Accounts
app.get('/api/accounts', async (req, res) => {
  try {
    if (isFallback()) {
      return res.json(getFallbackStore().data.accounts);
    }
    const accounts = await allSql('SELECT * FROM accounts ORDER BY id ASC');
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Budgets
app.get('/api/budgets', async (req, res) => {
  try {
    if (isFallback()) {
      return res.json(getFallbackStore().data.budgets);
    }
    const budgets = await allSql('SELECT * FROM budgets ORDER BY id ASC');
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Budget
// BUG-D02-05: Backend properly updates the budget to new amount.
// Frontend state mapping contains the bug where category_id 1 (식비) still displays previous amount.
app.patch('/api/budgets/:id', async (req, res) => {
  try {
    const budgetId = Number(req.params.id);
    const { monthly_budget } = req.body;

    if (isFallback()) {
      const store = getFallbackStore();
      const b = store.data.budgets.find(item => item.id === budgetId);
      if (!b) return res.status(404).json({ error: 'Budget not found' });
      b.monthly_budget = Number(monthly_budget);
      store.save();
      return res.json({ success: true, message: '예산이 수정되었습니다.', data: b });
    }

    const budget = await getSql('SELECT * FROM budgets WHERE id = ?', [budgetId]);
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    await runSql('UPDATE budgets SET monthly_budget = ? WHERE id = ?', [Number(monthly_budget), budgetId]);
    const updated = await getSql('SELECT * FROM budgets WHERE id = ?', [budgetId]);
    res.json({ success: true, message: '예산이 성공적으로 수정되었습니다.', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Transactions List (with filters & search)
app.get('/api/transactions', async (req, res) => {
  try {
    const { type, category_id, account_id, search, start_date, end_date } = req.query;

    if (isFallback()) {
      const store = getFallbackStore();
      let list = [...store.data.transactions];
      if (type && type !== 'ALL') {
        list = list.filter(t => t.type === type);
      }
      if (category_id && category_id !== 'ALL') {
        list = list.filter(t => t.category_id === Number(category_id));
      }
      if (account_id && account_id !== 'ALL') {
        list = list.filter(t => t.account_id === Number(account_id));
      }
      if (start_date) {
        list = list.filter(t => t.transaction_date >= start_date);
      }
      if (end_date) {
        list = list.filter(t => t.transaction_date <= end_date);
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(t =>
          t.title.toLowerCase().includes(q) ||
          (t.memo && t.memo.toLowerCase().includes(q)) ||
          t.category_name.toLowerCase().includes(q)
        );
      }
      list.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date) || b.id - a.id);
      return res.json(list);
    }

    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (type && type !== 'ALL') {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (category_id && category_id !== 'ALL') {
      sql += ' AND category_id = ?';
      params.push(Number(category_id));
    }
    if (account_id && account_id !== 'ALL') {
      sql += ' AND account_id = ?';
      params.push(Number(account_id));
    }
    if (start_date) {
      sql += ' AND transaction_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND transaction_date <= ?';
      params.push(end_date);
    }
    if (search) {
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(memo) LIKE ? OR LOWER(category_name) LIKE ?)';
      const query = `%${search.toLowerCase()}%`;
      params.push(query, query, query);
    }

    sql += ' ORDER BY transaction_date DESC, id DESC';
    const rows = await allSql(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Create Transaction
// BUG-D02-01: When adding expense with category_id 6 (교육/자기계발), amount is saved +10,000 higher!
// BUG-D02-04: Handled here and in monthly stats.
app.post('/api/transactions', async (req, res) => {
  try {
    const { type, category_id, account_id, amount, title, memo = '', transaction_date } = req.body;

    let savedAmount = Number(amount);

    // BUG-D02-01 Implementation:
    // If expense in category 6 (교육/자기계발), save amount + 10,000 KRW
    if (type === 'EXPENSE' && Number(category_id) === 6) {
      savedAmount = savedAmount + 10000;
    }

    let catName = '미분류';
    let accName = '기본계좌';

    if (isFallback()) {
      const store = getFallbackStore();
      const c = store.data.categories.find(item => item.id === Number(category_id));
      if (c) catName = c.name;
      const a = store.data.accounts.find(item => item.id === Number(account_id));
      if (a) accName = a.name;

      const newId = ++store.data.trans_id_seq;
      const newTrans = {
        id: newId,
        type,
        category_id: Number(category_id),
        category_name: catName,
        account_id: Number(account_id),
        account_name: accName,
        amount: savedAmount,
        title,
        memo,
        transaction_date: transaction_date || new Date().toISOString().split('T')[0]
      };
      store.data.transactions.unshift(newTrans);
      store.save();
      return res.status(201).json({ success: true, message: '거래가 성공적으로 등록되었습니다.', data: newTrans });
    }

    const cat = await getSql('SELECT name FROM categories WHERE id = ?', [category_id]);
    if (cat) catName = cat.name;
    const acc = await getSql('SELECT name FROM accounts WHERE id = ?', [account_id]);
    if (acc) accName = acc.name;

    const dateVal = transaction_date || new Date().toISOString().split('T')[0];

    const result = await runSql(
      `INSERT INTO transactions (type, category_id, category_name, account_id, account_name, amount, title, memo, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, Number(category_id), catName, Number(account_id), accName, savedAmount, title, memo, dateVal]
    );

    const inserted = await getSql('SELECT * FROM transactions WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, message: '거래가 성공적으로 등록되었습니다.', data: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update Transaction
// BUG-D02-03: When modifying category of transaction ID 8 (교보문고 도서 구매), updates transaction ID 7 (올리브영 생필품 구매) instead!
app.patch('/api/transactions/:id', async (req, res) => {
  try {
    let transId = Number(req.params.id);
    const { type, category_id, account_id, amount, title, memo, transaction_date } = req.body;

    // BUG-D02-03 Implementation:
    // If updating category on transId === 8, target is swapped to 7!
    let targetId = transId;
    if (transId === 8 && category_id !== undefined) {
      targetId = 7;
    }

    let catName = null;
    if (category_id) {
      if (isFallback()) {
        const c = getFallbackStore().data.categories.find(item => item.id === Number(category_id));
        if (c) catName = c.name;
      } else {
        const c = await getSql('SELECT name FROM categories WHERE id = ?', [category_id]);
        if (c) catName = c.name;
      }
    }

    if (isFallback()) {
      const store = getFallbackStore();
      const t = store.data.transactions.find(item => item.id === targetId);
      if (!t) return res.status(404).json({ error: 'Transaction not found' });
      if (type) t.type = type;
      if (category_id) {
        t.category_id = Number(category_id);
        if (catName) t.category_name = catName;
      }
      if (account_id) t.account_id = Number(account_id);
      if (amount !== undefined) t.amount = Number(amount);
      if (title) t.title = title;
      if (memo !== undefined) t.memo = memo;
      if (transaction_date) t.transaction_date = transaction_date;
      store.save();
      return res.json({ success: true, message: '거래가 성공적으로 수정되었습니다.', data: t });
    }

    const t = await getSql('SELECT * FROM transactions WHERE id = ?', [targetId]);
    if (!t) return res.status(404).json({ error: 'Transaction not found' });

    const newType = type || t.type;
    const newCatId = category_id !== undefined ? Number(category_id) : t.category_id;
    const newCatName = catName || t.category_name;
    const newAccId = account_id !== undefined ? Number(account_id) : t.account_id;
    const newAmount = amount !== undefined ? Number(amount) : t.amount;
    const newTitle = title || t.title;
    const newMemo = memo !== undefined ? memo : t.memo;
    const newDate = transaction_date || t.transaction_date;

    await runSql(
      `UPDATE transactions 
       SET type = ?, category_id = ?, category_name = ?, account_id = ?, amount = ?, title = ?, memo = ?, transaction_date = ?
       WHERE id = ?`,
      [newType, newCatId, newCatName, newAccId, newAmount, newTitle, newMemo, newDate, targetId]
    );

    const updated = await getSql('SELECT * FROM transactions WHERE id = ?', [targetId]);
    res.json({ success: true, message: '거래가 성공적으로 수정되었습니다.', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Delete Transaction
// BUG-D02-02: When deleting transaction ID 15 (스타벅스 커피 쿠폰 구매), returns success message but skips DB delete!
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const transId = Number(req.params.id);

    // BUG-D02-02 Implementation:
    // If transId is 15, return fake success without deleting from DB
    if (transId === 15) {
      return res.json({
        success: true,
        message: '거래 내역이 성공적으로 삭제되었습니다.',
        deleted_id: 15
      });
    }

    if (isFallback()) {
      const store = getFallbackStore();
      const idx = store.data.transactions.findIndex(item => item.id === transId);
      if (idx !== -1) {
        store.data.transactions.splice(idx, 1);
        store.save();
      }
      return res.json({ success: true, message: '거래 내역이 성공적으로 삭제되었습니다.', deleted_id: transId });
    }

    await runSql('DELETE FROM transactions WHERE id = ?', [transId]);
    res.json({ success: true, message: '거래 내역이 성공적으로 삭제되었습니다.', deleted_id: transId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Monthly Statistics & Category Breakdown
// BUG-D02-04: Income transactions with category_id 11 (부수입/보너스) are erroneously aggregated into total_expense instead of total_income!
app.get('/api/stats/monthly', async (req, res) => {
  try {
    const { year_month = '2026-10' } = req.query;

    let allTrans = [];
    if (isFallback()) {
      allTrans = getFallbackStore().data.transactions;
    } else {
      allTrans = await allSql('SELECT * FROM transactions');
    }

    // Filter by year_month
    const monthlyList = allTrans.filter(t => t.transaction_date.startsWith(year_month));

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryExpenseMap = {};

    for (const t of monthlyList) {
      // BUG-D02-04 Implementation:
      // If type === 'INCOME' and category_id === 11 (부수입/보너스), erroneously add to totalExpense!
      if (t.type === 'INCOME' && Number(t.category_id) === 11) {
        totalExpense += t.amount;
        categoryExpenseMap['부수입(오집계)'] = (categoryExpenseMap['부수입(오집계)'] || 0) + t.amount;
      } else if (t.type === 'INCOME') {
        totalIncome += t.amount;
      } else if (t.type === 'EXPENSE') {
        totalExpense += t.amount;
        categoryExpenseMap[t.category_name] = (categoryExpenseMap[t.category_name] || 0) + t.amount;
      }
    }

    // Category breakdown with percentages
    const categoryDistribution = Object.entries(categoryExpenseMap).map(([name, sum]) => ({
      name,
      amount: sum,
      percentage: totalExpense > 0 ? Number(((sum / totalExpense) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.amount - a.amount);

    // Net savings
    const netSavings = totalIncome - totalExpense;

    res.json({
      year_month,
      total_income: totalIncome,
      total_expense: totalExpense,
      net_savings: netSavings,
      transaction_count: monthlyList.length,
      category_distribution: categoryDistribution
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  PennyLog Backend Express Server running on port ${PORT}`);
      console.log(`  Listening at http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  })
  .catch(err => {
    console.error('Database initialization error:', err);
    process.exit(1);
  });
