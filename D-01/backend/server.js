require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, runSql, allSql, getSql, resetAllData, isFallback, getFallbackStore } = require('./db');

const app = express();
const PORT = process.env.PORT || 9801;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SubFlow API', port: PORT });
});

// Test Reset API
app.post('/api/test/reset', async (req, res) => {
  try {
    const result = await resetAllData();
    res.json(result);
  } catch (err) {
    console.error('Reset failed:', err);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// 1. Catalog (Available services)
app.get('/api/catalog', async (req, res) => {
  try {
    if (isFallback()) {
      const store = getFallbackStore();
      return res.json(store.data.services);
    }
    const services = await allSql('SELECT * FROM services ORDER BY id ASC');
    const parsed = services.map(s => ({
      ...s,
      available_plans: JSON.parse(s.available_plans)
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Subscriptions list
app.get('/api/subscriptions', async (req, res) => {
  try {
    const { status, search, cycle } = req.query;

    if (isFallback()) {
      const store = getFallbackStore();
      let list = [...store.data.subscriptions];
      if (status && status !== 'ALL') {
        list = list.filter(item => item.status === status);
      }
      if (cycle && cycle !== 'ALL') {
        list = list.filter(item => item.billing_cycle === cycle);
      }
      if (search) {
        const query = search.toLowerCase();
        list = list.filter(item =>
          item.service_name.toLowerCase().includes(query) ||
          item.plan_name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      return res.json(list);
    }

    let sql = 'SELECT * FROM subscriptions WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (cycle && cycle !== 'ALL') {
      sql += ' AND billing_cycle = ?';
      params.push(cycle);
    }
    if (search) {
      sql += ' AND (LOWER(service_name) LIKE ? OR LOWER(plan_name) LIKE ? OR LOWER(category) LIKE ?)';
      const query = `%${search.toLowerCase()}%`;
      params.push(query, query, query);
    }

    sql += ' ORDER BY id DESC';
    const rows = await allSql(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Subscribe (Create new subscription)
// BUG-D01-05: When subscribing to service_id 5 (Figma Professional), create duplicate record
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { service_id, plan_name, billing_cycle = 'monthly', account_user = 'alex.kim@subflow.io' } = req.body;

    let service = null;
    if (isFallback()) {
      const store = getFallbackStore();
      service = store.data.services.find(s => s.id === Number(service_id));
    } else {
      service = await getSql('SELECT * FROM services WHERE id = ?', [service_id]);
    }

    if (!service) {
      return res.status(404).json({ error: 'Service not found in catalog' });
    }

    const price = billing_cycle === 'yearly' ? service.base_price_yearly : service.base_price_monthly;
    const startedAt = new Date().toISOString().split('T')[0];
    const nextBilling = new Date();
    if (billing_cycle === 'yearly') {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    } else {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    }
    const nextBillingAt = nextBilling.toISOString().split('T')[0];

    const recordsToCreate = [];
    recordsToCreate.push({
      service_id: service.id,
      service_name: service.name,
      plan_name: plan_name || 'Standard',
      billing_cycle,
      price,
      currency: 'USD',
      status: 'ACTIVE',
      auto_renew: 1,
      started_at: startedAt,
      next_billing_at: nextBillingAt,
      category: service.category,
      account_user
    });

    // BUG-D01-05 implementation: For service_id 5 (Figma Professional), insert twice
    if (Number(service_id) === 5) {
      recordsToCreate.push({
        service_id: service.id,
        service_name: service.name,
        plan_name: plan_name || 'Standard',
        billing_cycle,
        price,
        currency: 'USD',
        status: 'ACTIVE',
        auto_renew: 1,
        started_at: startedAt,
        next_billing_at: nextBillingAt,
        category: service.category,
        account_user
      });
    }

    const insertedRows = [];

    if (isFallback()) {
      const store = getFallbackStore();
      for (const rec of recordsToCreate) {
        rec.id = ++store.data.sub_id_seq;
        store.data.subscriptions.push(rec);
        insertedRows.push(rec);
      }
      store.save();
    } else {
      for (const rec of recordsToCreate) {
        const result = await runSql(
          `INSERT INTO subscriptions (service_id, service_name, plan_name, billing_cycle, price, currency, status, auto_renew, started_at, next_billing_at, category, account_user)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [rec.service_id, rec.service_name, rec.plan_name, rec.billing_cycle, rec.price, rec.currency, rec.status, rec.auto_renew, rec.started_at, rec.next_billing_at, rec.category, rec.account_user]
        );
        rec.id = result.lastID;
        insertedRows.push(rec);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: insertedRows[0],
      total_created: insertedRows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update Plan (Upgrade / Downgrade / Billing cycle)
// BUG-D01-02: For subscription ID 1 (Notion), response is success but DB update is skipped
app.patch('/api/subscriptions/:id/plan', async (req, res) => {
  try {
    const subId = Number(req.params.id);
    const { plan_name, billing_cycle, price } = req.body;

    // BUG-D01-02 implementation:
    // If subId is 1 (Notion), return fake success without updating DB
    if (subId === 1) {
      return res.json({
        success: true,
        message: 'Plan upgraded successfully to ' + plan_name,
        data: {
          id: 1,
          plan_name: 'Plus', // Existing DB remains unchanged
          billing_cycle: 'monthly'
        }
      });
    }

    if (isFallback()) {
      const store = getFallbackStore();
      const sub = store.data.subscriptions.find(s => s.id === subId);
      if (!sub) return res.status(404).json({ error: 'Subscription not found' });
      if (plan_name) sub.plan_name = plan_name;
      if (billing_cycle) sub.billing_cycle = billing_cycle;
      if (price !== undefined) sub.price = Number(price);
      store.save();
      return res.json({ success: true, message: 'Plan updated', data: sub });
    }

    const sub = await getSql('SELECT * FROM subscriptions WHERE id = ?', [subId]);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    const newPlan = plan_name || sub.plan_name;
    const newCycle = billing_cycle || sub.billing_cycle;
    const newPrice = price !== undefined ? Number(price) : sub.price;

    await runSql(
      'UPDATE subscriptions SET plan_name = ?, billing_cycle = ?, price = ? WHERE id = ?',
      [newPlan, newCycle, newPrice, subId]
    );

    const updated = await getSql('SELECT * FROM subscriptions WHERE id = ?', [subId]);
    res.json({ success: true, message: 'Plan updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Toggle Auto Renew
// BUG-D01-03: Backend properly updates auto_renew = 0 for GitHub Copilot (subId 3)
// Frontend UI will maintain toggle ON state despite backend returning 0
app.patch('/api/subscriptions/:id/auto-renew', async (req, res) => {
  try {
    const subId = Number(req.params.id);
    const { auto_renew } = req.body;
    const renewVal = auto_renew ? 1 : 0;

    if (isFallback()) {
      const store = getFallbackStore();
      const sub = store.data.subscriptions.find(s => s.id === subId);
      if (!sub) return res.status(404).json({ error: 'Subscription not found' });
      sub.auto_renew = renewVal;
      store.save();
      return res.json({ success: true, message: 'Auto renew setting updated', auto_renew: renewVal });
    }

    const sub = await getSql('SELECT * FROM subscriptions WHERE id = ?', [subId]);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    await runSql('UPDATE subscriptions SET auto_renew = ? WHERE id = ?', [renewVal, subId]);
    res.json({ success: true, message: 'Auto renew setting updated', auto_renew: renewVal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Cancel Subscription
// BUG-D01-01: For subscription ID 2 (Slack), modal confirms but status remains ACTIVE
app.post('/api/subscriptions/:id/cancel', async (req, res) => {
  try {
    const subId = Number(req.params.id);

    // BUG-D01-01 implementation:
    // When cancelling subId === 2 (Slack), confirm modal succeeds, but DB remains ACTIVE
    if (subId === 2) {
      return res.json({
        success: true,
        message: '구독 해지가 성공적으로 접수되었습니다.',
        status: 'ACTIVE' // Remains active
      });
    }

    if (isFallback()) {
      const store = getFallbackStore();
      const sub = store.data.subscriptions.find(s => s.id === subId);
      if (!sub) return res.status(404).json({ error: 'Subscription not found' });
      sub.status = 'CANCELLED';
      store.save();
      return res.json({ success: true, message: '구독이 해지되었습니다.', status: 'CANCELLED' });
    }

    const sub = await getSql('SELECT * FROM subscriptions WHERE id = ?', [subId]);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    await runSql("UPDATE subscriptions SET status = 'CANCELLED' WHERE id = ?", [subId]);
    res.json({ success: true, message: '구독이 해지되었습니다.', status: 'CANCELLED' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Billing History
app.get('/api/billings', async (req, res) => {
  try {
    if (isFallback()) {
      const store = getFallbackStore();
      return res.json(store.data.billing_history);
    }
    const billings = await allSql('SELECT * FROM billing_history ORDER BY billing_date DESC, id DESC');
    res.json(billings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Delete Billing Record
// BUG-D01-04: When deleting billing record id 4 (AWS Cloud Services), deletes record id 3 instead!
app.delete('/api/billings/:id', async (req, res) => {
  try {
    let targetId = Number(req.params.id);

    // BUG-D01-04 implementation:
    // If targetId is 4, swap deletion target to 3!
    if (targetId === 4) {
      targetId = 3;
    }

    if (isFallback()) {
      const store = getFallbackStore();
      const idx = store.data.billing_history.findIndex(b => b.id === targetId);
      if (idx !== -1) {
        store.data.billing_history.splice(idx, 1);
        store.save();
      }
      return res.json({ success: true, message: '결제 내역이 삭제되었습니다.', deleted_id: targetId });
    }

    await runSql('DELETE FROM billing_history WHERE id = ?', [targetId]);
    res.json({ success: true, message: '결제 내역이 삭제되었습니다.', deleted_id: targetId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    if (isFallback()) {
      const store = getFallbackStore();
      return res.json(store.data.notifications);
    }
    const rows = await allSql('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notifId = Number(req.params.id);
    if (isFallback()) {
      const store = getFallbackStore();
      const n = store.data.notifications.find(item => item.id === notifId);
      if (n) {
        n.is_read = 1;
        store.save();
      }
      return res.json({ success: true });
    }
    await runSql('UPDATE notifications SET is_read = 1 WHERE id = ?', [notifId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Dashboard Analytics
app.get('/api/analytics', async (req, res) => {
  try {
    let subs = [];
    if (isFallback()) {
      subs = getFallbackStore().data.subscriptions;
    } else {
      subs = await allSql('SELECT * FROM subscriptions');
    }

    const activeSubs = subs.filter(s => s.status === 'ACTIVE');
    const monthlyTotal = activeSubs.reduce((acc, curr) => {
      if (curr.billing_cycle === 'yearly') {
        return acc + (curr.price / 12);
      }
      return acc + curr.price;
    }, 0);

    const yearlyProjected = monthlyTotal * 12;
    const yearlySavings = 142.5; // Estimated discounts & optimizations

    // Monthly expenditure trend (last 6 months)
    const monthlyTrend = [
      { month: '2026-05', amount: 68.5 },
      { month: '2026-06', amount: 74.0 },
      { month: '2026-07', amount: 82.5 },
      { month: '2026-08', amount: 82.5 },
      { month: '2026-09', amount: 98.9 },
      { month: '2026-10', amount: Number(monthlyTotal.toFixed(2)) }
    ];

    res.json({
      active_count: activeSubs.length,
      monthly_total: Number(monthlyTotal.toFixed(2)),
      yearly_projected: Number(yearlyProjected.toFixed(2)),
      yearly_savings: yearlySavings,
      next_payment_date: '2026-11-01',
      monthly_trend: monthlyTrend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  SubFlow Backend API Server running on port ${PORT}`);
      console.log(`  Ready at http://localhost:${PORT}`);
      console.log(`===============================================`);
    });
  })
  .catch(err => {
    console.error('Database initialization error:', err);
    process.exit(1);
  });
