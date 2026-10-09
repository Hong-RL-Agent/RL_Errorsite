const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { db, resetDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Helper: Get cart with items and options
function getCartDetails(cartId = 1) {
  return new Promise((resolve, reject) => {
    const itemQuery = `
      SELECT ci.id as item_id, ci.menu_id, ci.quantity, ci.unit_price,
             m.name as menu_name, m.price as base_price, m.current_server_price, m.description, m.category, m.image_url
      FROM cart_items ci
      JOIN menus m ON ci.menu_id = m.id
      WHERE ci.cart_id = ?
      ORDER BY ci.id ASC
    `;

    db.all(itemQuery, [cartId], (err, items) => {
      if (err) return reject(err);
      if (!items || items.length === 0) {
        return resolve({ items: [], subtotal: 0, subtotalWithOptions: 0 });
      }

      const itemIds = items.map((i) => i.item_id);
      const placeholders = itemIds.map(() => '?').join(',');
      const optQuery = `SELECT * FROM cart_item_options WHERE cart_item_id IN (${placeholders})`;

      db.all(optQuery, itemIds, (err2, options) => {
        if (err2) return reject(err2);

        const optionsByItem = {};
        (options || []).forEach((opt) => {
          if (!optionsByItem[opt.cart_item_id]) optionsByItem[opt.cart_item_id] = [];
          optionsByItem[opt.cart_item_id].push(opt);
        });

        let subtotalWithoutOptions = 0;
        let subtotalWithOptions = 0;

        const populatedItems = items.map((it) => {
          const itemOpts = optionsByItem[it.item_id] || [];
          const optTotal = itemOpts.reduce((sum, o) => sum + o.option_price, 0);

          subtotalWithoutOptions += it.quantity * it.unit_price;
          subtotalWithOptions += it.quantity * (it.unit_price + optTotal);

          return {
            ...it,
            options: itemOpts,
            options_total: optTotal,
            total_price_with_options: it.quantity * (it.unit_price + optTotal)
          };
        });

        resolve({
          items: populatedItems,
          subtotal: subtotalWithoutOptions, // BUG-622: Option Cost Ghost (omits option fee from subtotal)
          subtotalWithOptions
        });
      });
    });
  });
}

// 1. Stores
app.get('/api/stores', (req, res) => {
  db.all('SELECT * FROM stores ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch stores' });
    res.json({ stores: rows });
  });
});

app.get('/api/stores/:id', (req, res) => {
  db.get('SELECT * FROM stores WHERE id = ?', [req.params.id], (err, store) => {
    if (err || !store) return res.status(404).json({ error: 'Store not found' });

    db.all('SELECT * FROM menus WHERE store_id = ? ORDER BY id ASC', [store.id], (err2, menus) => {
      db.all('SELECT * FROM menu_options ORDER BY id ASC', (err3, allOptions) => {
        const optionsByMenu = {};
        (allOptions || []).forEach((opt) => {
          if (!optionsByMenu[opt.menu_id]) optionsByMenu[opt.menu_id] = [];
          optionsByMenu[opt.menu_id].push(opt);
        });

        const populatedMenus = (menus || []).map((m) => ({
          ...m,
          options: optionsByMenu[m.id] || []
        }));

        res.json({ store, menus: populatedMenus });
      });
    });
  });
});

// 2. Menus
app.get('/api/menus', (req, res) => {
  db.all('SELECT * FROM menus ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch menus' });
    res.json({ menus: rows });
  });
});

app.get('/api/menus/:id', (req, res) => {
  db.get('SELECT * FROM menus WHERE id = ?', [req.params.id], (err, menu) => {
    if (err || !menu) return res.status(404).json({ error: 'Menu not found' });
    db.all('SELECT * FROM menu_options WHERE menu_id = ? ORDER BY id ASC', [menu.id], (err2, options) => {
      res.json({ menu, options: options || [] });
    });
  });
});

// 3. Cart APIs
app.get('/api/carts', async (req, res) => {
  try {
    const cart = await getCartDetails(1);
    res.json({ cartId: 1, ...cart });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get cart' });
  }
});

app.post('/api/carts/items', (req, res) => {
  const { menuId, quantity = 1, selectedOptionIds = [] } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.get('SELECT * FROM menus WHERE id = ?', [menuId], (err, menu) => {
    if (err || !menu) return res.status(404).json({ error: 'Menu not found' });

    db.run(
      'INSERT INTO cart_items (cart_id, menu_id, quantity, unit_price, created_at) VALUES (1, ?, ?, ?, ?)',
      [menuId, quantity, menu.price, now],
      function (err2) {
        if (err2) return res.status(500).json({ error: 'Failed to add item to cart' });
        const cartItemId = this.lastID;

        if (selectedOptionIds && selectedOptionIds.length > 0) {
          const placeholders = selectedOptionIds.map(() => '?').join(',');
          db.all(`SELECT * FROM menu_options WHERE id IN (${placeholders})`, selectedOptionIds, (err3, options) => {
            const insertOpt = db.prepare('INSERT INTO cart_item_options (cart_item_id, option_id, option_name, option_price) VALUES (?, ?, ?, ?)');
            (options || []).forEach((opt) => {
              insertOpt.run(cartItemId, opt.id, opt.name, opt.price);
            });
            insertOpt.finalize();
            res.status(201).json({ success: true, cartItemId, message: 'Item and options added to cart' });
          });
        } else {
          res.status(201).json({ success: true, cartItemId, message: 'Item added to cart' });
        }
      }
    );
  });
});

app.patch('/api/carts/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const { quantity } = req.body;

  if (quantity <= 0) {
    db.run('DELETE FROM cart_item_options WHERE cart_item_id = ?', [itemId], () => {
      db.run('DELETE FROM cart_items WHERE id = ?', [itemId], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to remove item' });
        res.json({ success: true, message: 'Item removed' });
      });
    });
  } else {
    db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update quantity' });
      res.json({ success: true, message: 'Quantity updated' });
    });
  }
});

app.delete('/api/carts/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  db.run('DELETE FROM cart_item_options WHERE cart_item_id = ?', [itemId], () => {
    db.run('DELETE FROM cart_items WHERE id = ?', [itemId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete item' });
      res.json({ success: true, message: 'Item deleted' });
    });
  });
});

// 4. Coupons & BUG-423 Minimum Order Bypass
app.get('/api/coupons', (req, res) => {
  db.all('SELECT * FROM coupons ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch coupons' });
    res.json({ coupons: rows });
  });
});

// POST /api/checkout/coupon - Apply coupon
// BUG-423: Applying coupon bypasses minimum order amount validation in checkout session
app.post('/api/checkout/coupon', (req, res) => {
  const { couponCode } = req.body;

  if (!couponCode) {
    db.run('UPDATE checkout_sessions SET coupon_code = NULL, coupon_discount = 0 WHERE cart_id = 1', () => {
      res.json({ success: true, discount: 0, minimumOrderBypassed: false });
    });
    return;
  }

  db.get('SELECT * FROM coupons WHERE code = ?', [couponCode], (err, coupon) => {
    if (err || !coupon) return res.status(404).json({ error: 'Invalid coupon code' });

    // BUG-423: Sets minimum_order_bypassed = 1!
    db.run(
      'UPDATE checkout_sessions SET coupon_code = ?, coupon_discount = ?, minimum_order_bypassed = 1 WHERE cart_id = 1',
      [coupon.code, coupon.discount],
      (err2) => {
        if (err2) return res.status(500).json({ error: 'Failed to apply coupon' });
        res.json({
          success: true,
          coupon,
          discount: coupon.discount,
          minimumOrderBypassed: true,
          message: 'Coupon applied and minimum order check bypassed'
        });
      }
    );
  });
});

// 5. Addresses & BUG-604 Delivery Tip Distance Glitch
app.get('/api/addresses', (req, res) => {
  db.all('SELECT * FROM addresses ORDER BY is_default DESC, id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch addresses' });
    res.json({ addresses: rows });
  });
});

// POST /api/checkout/delivery-fee
// BUG-604: Distance unit conversion bug (treats 1500 meters as 1500 km -> fee = 1,503,000원)
app.post('/api/checkout/delivery-fee', (req, res) => {
  const { addressId } = req.body;
  const addrId = parseInt(addressId) || 1;

  db.get('SELECT * FROM addresses WHERE id = ?', [addrId], (err, addr) => {
    if (err || !addr) return res.status(404).json({ error: 'Address not found' });

    // BUG-604: If address ID 2 (or non-default address with meters), treats meters as km!
    let deliveryFee = 3500;
    if (addr.id === 2 || addr.distance_meters >= 1000) {
      const distanceAsKm = addr.distance_meters; // 1500 treated as km instead of 1.5 km
      deliveryFee = 3000 + (distanceAsKm * 1000); // = 1,503,000원!
    }

    db.run(
      'UPDATE checkout_sessions SET address_id = ?, delivery_fee = ? WHERE cart_id = 1',
      [addr.id, deliveryFee],
      (err2) => {
        res.json({
          success: true,
          address: addr,
          deliveryFee,
          distanceMeters: addr.distance_meters
        });
      }
    );
  });
});

// 6. Rider Tip & BUG-1822 Rider Tip Cancellation Glitch
app.post('/api/checkout/rider-tip', (req, res) => {
  const { amount = 0 } = req.body;
  const tip = parseInt(amount) || 0;

  db.run('UPDATE checkout_sessions SET rider_tip = ? WHERE cart_id = 1', [tip], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to set rider tip' });
    res.json({ success: true, riderTip: tip });
  });
});

// DELETE /api/checkout/rider-tip
// BUG-1822: Cancelling tip returns 500 error, leaving backend session rider_tip intact (e.g. 1000)
app.delete('/api/checkout/rider-tip', (req, res) => {
  return res.status(500).json({
    error: 'Internal Server Error: DispatchService timeout on cancelTip RPC stream'
  });
});

// 7. Checkout Summary (BUG-622 Option Cost Ghost)
app.get('/api/checkout/summary', async (req, res) => {
  try {
    const cart = await getCartDetails(1);
    db.get('SELECT * FROM stores WHERE id = 1', (err, store) => {
      db.get('SELECT * FROM checkout_sessions WHERE cart_id = 1', (err2, session) => {
        db.get('SELECT * FROM addresses WHERE id = ?', [session?.address_id || 1], (err3, addr) => {
          // BUG-622: subtotal omits option prices!
          const subtotal = cart.subtotal;
          const discount = session?.coupon_discount || 0;
          const deliveryFee = session?.delivery_fee !== undefined ? session.delivery_fee : 3500;
          const riderTip = session?.rider_tip || 0;
          const finalAmount = Math.max(0, subtotal - discount) + deliveryFee + riderTip;

          const isMinOrderSatisfied = session?.minimum_order_bypassed === 1 || subtotal >= store.min_order_amount;

          res.json({
            cartId: 1,
            store,
            items: cart.items,
            subtotal, // 12,000 instead of 16,000 (BUG-622)
            subtotalWithOptions: cart.subtotalWithOptions,
            discount,
            deliveryFee,
            riderTip,
            finalAmount,
            minimumOrderAmount: store.min_order_amount,
            minimumOrderSatisfied: isMinOrderSatisfied,
            selectedAddress: addr,
            appliedCouponCode: session?.coupon_code || null
          });
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

// 8. Order Validation (BUG-1604 Stale Menu Price)
app.post('/api/checkout/validate', async (req, res) => {
  try {
    const cart = await getCartDetails(1);
    for (const item of cart.items) {
      // BUG-1604: Stale price conflict check
      if (item.current_server_price && item.current_server_price !== item.unit_price) {
        return res.status(409).json({
          error: 'PRICE_CHANGED',
          expected: item.current_server_price,
          cartPrice: item.unit_price,
          message: '상품 가격이 변경되었습니다. 주문 금액을 다시 확인해주세요.'
        });
      }
    }
    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

// 9. Place Order
app.post('/api/orders', async (req, res) => {
  try {
    const cart = await getCartDetails(1);
    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    db.get('SELECT * FROM stores WHERE id = 1', (err, store) => {
      db.get('SELECT * FROM checkout_sessions WHERE cart_id = 1', (err2, session) => {
        db.get('SELECT * FROM addresses WHERE id = ?', [session?.address_id || 1], (err3, addr) => {
          const subtotal = cart.subtotal;
          const discount = session?.coupon_discount || 0;
          const deliveryFee = session?.delivery_fee || 3500;
          // BUG-1822: uses actual backend session rider_tip (which remained 1000 after failed cancellation)
          const riderTip = session?.rider_tip || 0;
          const finalAmount = Math.max(0, subtotal - discount) + deliveryFee + riderTip;

          const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
          const orderNumber = `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const addressStr = addr ? `${addr.address} ${addr.address_detail || ''}` : '기본 배송지';

          db.run(
            `INSERT INTO orders (order_number, store_name, subtotal, discount, delivery_fee, rider_tip, final_amount, address, request_note, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ORDER_ACCEPTED', ?)`,
            [orderNumber, store.name, subtotal, discount, deliveryFee, riderTip, finalAmount, addressStr, session?.request_note || '', now],
            function (err4) {
              if (err4) return res.status(500).json({ error: 'Failed to create order' });
              const orderId = this.lastID;

              // Insert order items
              const insertItem = db.prepare('INSERT INTO order_items (order_id, menu_name, quantity, unit_price, options_text) VALUES (?, ?, ?, ?, ?)');
              cart.items.forEach((it) => {
                const optText = (it.options || []).map((o) => `${o.option_name} (+${o.option_price}원)`).join(', ');
                insertItem.run(orderId, it.menu_name, it.quantity, it.unit_price, optText);
              });
              insertItem.finalize();

              // Clear cart
              db.run('DELETE FROM cart_item_options WHERE cart_item_id IN (SELECT id FROM cart_items WHERE cart_id = 1)');
              db.run('DELETE FROM cart_items WHERE cart_id = 1');
              db.run('UPDATE checkout_sessions SET coupon_code = NULL, coupon_discount = 0, rider_tip = 0, minimum_order_bypassed = 0 WHERE cart_id = 1');

              res.status(201).json({
                success: true,
                orderId,
                orderNumber,
                finalAmount,
                riderTip,
                message: 'Order placed successfully'
              });
            }
          );
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// 10. Orders List & Detail
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch orders' });
    res.json({ orders: rows });
  });
});

app.get('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
    if (err || !order) return res.status(404).json({ error: 'Order not found' });
    db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err2, items) => {
      res.json({ order, items: items || [] });
    });
  });
});

// 11. Reset API
app.post('/api/test/reset', (req, res) => {
  resetDb(() => {
    res.json({ success: true, message: 'TableRun C-06 database reset to initial deterministic state' });
  });
});

app.listen(PORT, () => {
  console.log(`TableRun C-06 backend server running on http://localhost:${PORT}`);
});
