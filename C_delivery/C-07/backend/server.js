const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { db, resetDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5006;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// In-memory state for default revisit bug (C-07-894)
let defaultSwitchCount = 0;

// 1. GET /api/addresses
// C-07-894: When revisited after setting B (102) as default, the second GET call reverts default back to 101!
app.get('/api/addresses', (req, res) => {
  db.all('SELECT * FROM addresses WHERE user_id = 1 ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch addresses' });

    let finalRows = [...rows];
    // BUG-894: Default address revert on revisit
    if (defaultSwitchCount >= 2) {
      finalRows = rows.map((r) => {
        if (r.id === 101) return { ...r, is_default: 1 };
        if (r.id === 102) return { ...r, is_default: 0 };
        return r;
      });
    } else if (defaultSwitchCount === 1) {
      defaultSwitchCount = 2; // Arm for next revisit
    }

    res.json({ addresses: finalRows, count: finalRows.length });
  });
});

// 2. GET /api/addresses/:id
// C-07-005: 404 when deleted address 102 is queried
app.get('/api/addresses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.get('SELECT * FROM addresses WHERE id = ?', [id], (err, row) => {
    if (err || !row) {
      return res.status(404).json({
        error: 'ADDRESS_NOT_FOUND',
        message: '배송지 정보를 불러올 수 없습니다.'
      });
    }
    res.json({ address: row });
  });
});

// 3. POST /api/addresses
// BUG-194: Persistence Loss on Reload (Returns success with ID 103, but intentionally does not save to SQLite DB)
app.post('/api/addresses', (req, res) => {
  const { label, recipient_name, phone, postal_code, address_line1, address_line2, is_default = 0 } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Intentional bug: generate simulated address for client memory state without inserting into DB
  const simulatedAddress = {
    id: 103,
    user_id: 1,
    label: label || '신규 배송지',
    recipient_name: recipient_name || '이주이',
    phone: phone || '010-3849-2819',
    postal_code: postal_code || '16500',
    address_line1: address_line1 || '경기도 수원시',
    address_line2: address_line2 || '팔달구 테스트로 50',
    is_default: is_default ? 1 : 0,
    created_at: now,
    updated_at: now
  };

  res.status(201).json({
    success: true,
    address: simulatedAddress,
    message: 'Address registered successfully'
  });
});

// 4. PATCH /api/addresses/:id
// Updates SQLite DB with new values (e.g. address_line2 = "영통구 테스트로 99")
app.patch('/api/addresses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { label, recipient_name, phone, postal_code, address_line1, address_line2 } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.run(
    `UPDATE addresses 
     SET label = COALESCE(?, label),
         recipient_name = COALESCE(?, recipient_name),
         phone = COALESCE(?, phone),
         postal_code = COALESCE(?, postal_code),
         address_line1 = COALESCE(?, address_line1),
         address_line2 = COALESCE(?, address_line2),
         updated_at = ?
     WHERE id = ?`,
    [label, recipient_name, phone, postal_code, address_line1, address_line2, now, id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update address' });
      db.get('SELECT * FROM addresses WHERE id = ?', [id], (err2, row) => {
        res.json({ success: true, address: row });
      });
    }
  );
});

// 5. DELETE /api/addresses/:id
// Deletes from addresses DB table (leaves order_address_snapshots intact for BUG-5)
app.delete('/api/addresses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.run('DELETE FROM addresses WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete address' });
    res.json({ success: true, message: 'Address deleted from database' });
  });
});

// 6. PUT /api/addresses/:id/default
// Sets default address
app.put('/api/addresses/:id/default', (req, res) => {
  const id = parseInt(req.params.id);
  db.serialize(() => {
    db.run('UPDATE addresses SET is_default = 0 WHERE user_id = 1');
    db.run('UPDATE addresses SET is_default = 1 WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to set default address' });

      // If address 102 was set, arm BUG-894
      if (id === 102) {
        defaultSwitchCount = 1;
      }

      db.get('SELECT * FROM addresses WHERE id = ?', [id], (err2, row) => {
        res.json({ success: true, address: row });
      });
    });
  });
});

// 7. GET /api/orders/:id/address-options
// BUG-5: Returns address options from snapshot cache where Address 102 still lingers even after deletion
app.get('/api/orders/:id/address-options', (req, res) => {
  db.all('SELECT * FROM order_address_snapshots ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch order address options' });
    res.json({ addressOptions: rows });
  });
});

// 8. GET /api/mypage
app.get('/api/mypage', (req, res) => {
  db.get('SELECT * FROM users WHERE id = 1', (err, user) => {
    db.get('SELECT COUNT(*) as count FROM addresses WHERE user_id = 1', (err2, addrCount) => {
      db.all('SELECT * FROM orders WHERE user_id = 1 ORDER BY id DESC LIMIT 3', (err3, orders) => {
        res.json({
          user,
          addressCount: addrCount ? addrCount.count : 0,
          recentOrders: orders || []
        });
      });
    });
  });
});

// 9. Reset API
app.post('/api/test/reset', (req, res) => {
  defaultSwitchCount = 0;
  resetDb(() => {
    res.json({ success: true, message: 'Morrow Shipping Address C-07 database reset to initial deterministic state' });
  });
});

app.listen(PORT, () => {
  console.log(`Morrow Shipping Address C-07 backend server running on http://localhost:${PORT}`);
});
