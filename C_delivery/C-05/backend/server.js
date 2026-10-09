const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { db, resetDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Helper: Get active cart for user (default cart_id = 1)
function getCartDetails(cartId = 1) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT ci.id as item_id, ci.product_id, ci.quantity, ci.unit_price,
             p.name, p.price, p.description, p.category, p.stock, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      ORDER BY ci.id ASC
    `;
    db.all(query, [cartId], (err, items) => {
      if (err) return reject(err);
      const subtotal = items.reduce((sum, it) => sum + (it.quantity * it.unit_price), 0);
      resolve({ items, subtotal });
    });
  });
}

// 1. Products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products WHERE is_active = 1 ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch products' });
    res.json({ products: rows });
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: row });
  });
});

// 2. Cart APIs
app.get('/api/cart', async (req, res) => {
  try {
    const cart = await getCartDetails(1);
    res.json({ cartId: 1, ...cart });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart/items', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err || !product) return res.status(404).json({ error: 'Product not found' });

    db.get('SELECT * FROM cart_items WHERE cart_id = 1 AND product_id = ?', [productId], (err2, item) => {
      if (item) {
        // Update quantity
        const newQty = item.quantity + quantity;
        db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, item.id], (err3) => {
          if (err3) return res.status(500).json({ error: 'Failed to update cart item' });
          res.json({ success: true, message: 'Cart item updated' });
        });
      } else {
        // Insert new item
        db.run(
          'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, created_at) VALUES (1, ?, ?, ?, ?)',
          [productId, quantity, product.price, now],
          (err3) => {
            if (err3) return res.status(500).json({ error: 'Failed to add item to cart' });
            res.status(201).json({ success: true, message: 'Item added to cart' });
          }
        );
      }
    });
  });
});

app.patch('/api/cart/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const { quantity } = req.body;

  if (quantity <= 0) {
    db.run('DELETE FROM cart_items WHERE id = ?', [itemId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete item' });
      res.json({ success: true, message: 'Item removed from cart' });
    });
  } else {
    db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update quantity' });
      res.json({ success: true, message: 'Quantity updated' });
    });
  }
});

app.delete('/api/cart/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  db.run('DELETE FROM cart_items WHERE id = ?', [itemId], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to remove item' });
    res.json({ success: true, message: 'Item removed' });
  });
});

// 3. Coupons
app.get('/api/coupons', (req, res) => {
  db.all('SELECT * FROM coupons ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch coupons' });
    res.json({ coupons: rows });
  });
});

// POST /api/checkout/coupon - Apply coupon
// BUG-011: Coupon Stack Bug (discount accumulates instead of replacing)
app.post('/api/checkout/coupon', (req, res) => {
  const { couponCode } = req.body;
  if (!couponCode) {
    // Reset coupon
    db.run('UPDATE checkout_state SET applied_coupon_codes = "[]", accumulated_discount = 0, last_coupon_code = NULL WHERE cart_id = 1', () => {
      res.json({ success: true, message: 'Coupon cleared', discount: 0 });
    });
    return;
  }

  db.get('SELECT * FROM coupons WHERE code = ?', [couponCode], async (err, coupon) => {
    if (err || !coupon) return res.status(404).json({ error: 'Invalid coupon code' });

    try {
      const cart = await getCartDetails(1);
      const subtotal = cart.subtotal;

      db.get('SELECT * FROM checkout_state WHERE cart_id = 1', (err2, state) => {
        let appliedCodes = [];
        let accumulatedDiscount = 0;

        try {
          appliedCodes = JSON.parse(state.applied_coupon_codes || '[]');
          accumulatedDiscount = Number(state.accumulated_discount) || 0;
        } catch (e) {
          appliedCodes = [];
          accumulatedDiscount = 0;
        }

        let thisDiscount = 0;
        if (coupon.type === 'FIXED') {
          thisDiscount = coupon.amount;
        } else if (coupon.type === 'PERCENT') {
          thisDiscount = (subtotal * (coupon.amount / 100));
        }

        // BUG-011: Stack coupon discount instead of replacing!
        const newAccumulatedDiscount = accumulatedDiscount + thisDiscount;
        appliedCodes.push(coupon.code);

        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        db.run(
          'UPDATE checkout_state SET applied_coupon_codes = ?, accumulated_discount = ?, last_coupon_code = ?, updated_at = ? WHERE cart_id = 1',
          [JSON.stringify(appliedCodes), newAccumulatedDiscount, coupon.code, now],
          (err3) => {
            if (err3) return res.status(500).json({ error: 'Failed to apply coupon' });
            res.json({
              success: true,
              coupon,
              appliedCodes,
              totalDiscount: newAccumulatedDiscount,
              message: `Coupon ${coupon.code} applied. Total discount: ${newAccumulatedDiscount}원`
            });
          }
        );
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to process coupon' });
    }
  });
});

// 4. Shipping Options
app.get('/api/shipping-options', (req, res) => {
  db.all('SELECT * FROM shipping_options ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch shipping options' });
    res.json({ shippingOptions: rows });
  });
});

// POST /api/checkout/shipping - Update shipping option
// BUG-627: Stealth Cart Injection (Selecting Dawn Express adds Product 5 to cart_items DB)
app.post('/api/checkout/shipping', (req, res) => {
  const { shippingOptionId } = req.body;
  const optionId = parseInt(shippingOptionId) || 1;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.run('UPDATE checkout_state SET shipping_option_id = ?, updated_at = ? WHERE cart_id = 1', [optionId, now], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update shipping option' });

    // BUG-627: If shippingOptionId === 2 (새벽 특급 배송), stealth inject Product 5 ("신선 보냉백", 3,000원) into cart_items
    if (optionId === 2) {
      db.get('SELECT * FROM cart_items WHERE cart_id = 1 AND product_id = 5', (err2, item) => {
        if (!item) {
          db.run(
            'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, created_at) VALUES (1, 5, 1, 3000, ?)',
            [now],
            (err3) => {
              res.json({
                success: true,
                shippingOptionId: optionId,
                stealthInjection: true,
                message: 'Shipping option updated with dawn logistics configuration'
              });
            }
          );
        } else {
          res.json({ success: true, shippingOptionId: optionId });
        }
      });
    } else {
      res.json({ success: true, shippingOptionId: optionId });
    }
  });
});

// 5. Addresses
app.get('/api/addresses', (req, res) => {
  db.all('SELECT * FROM addresses WHERE user_id = 1 ORDER BY is_default DESC, id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch addresses' });
    res.json({ addresses: rows });
  });
});

app.post('/api/addresses', (req, res) => {
  const { recipient, phone, address, address_detail, is_default = 0 } = req.body;
  db.run(
    'INSERT INTO addresses (user_id, recipient, phone, address, address_detail, is_default) VALUES (1, ?, ?, ?, ?, ?)',
    [recipient, phone, address, address_detail, is_default ? 1 : 0],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to create address' });
      res.status(201).json({ success: true, addressId: this.lastID });
    }
  );
});

// 6. Checkout Summary
// Computes summary with BUG-013 (Negative Total) and BUG-652 (Precision Float)
app.get('/api/checkout/summary', async (req, res) => {
  try {
    const cart = await getCartDetails(1);
    const subtotal = cart.subtotal;

    db.get('SELECT * FROM checkout_state WHERE cart_id = 1', (err, state) => {
      if (err || !state) return res.status(500).json({ error: 'Failed to get checkout state' });

      db.get('SELECT * FROM shipping_options WHERE id = ?', [state.shipping_option_id || 1], (err2, shipOption) => {
        const shippingFee = shipOption ? shipOption.fee : 0;
        const discount = Number(state.accumulated_discount) || 0;
        const lastCoupon = state.last_coupon_code;

        let tax = 0;
        let total = 0;

        // BUG-652: Precision Float Error for percentage coupon (e.g. SPRING30)
        if (lastCoupon === 'SPRING30') {
          const discounted = subtotal * (1 - 0.3);
          tax = (discounted * 0.1) - 0.000000000004;
          total = discounted + tax + shippingFee; // Returns floating point artifact like 11549.999999999996 or 18999.999999999996
        } else {
          // BUG-013: Negative Total Calculation (No Math.max floor check!)
          // total = subtotal - discount + shippingFee + tax
          tax = Math.floor(Math.max(0, subtotal - discount) * 0.1);
          total = subtotal - discount + shippingFee; // Can be negative (e.g. 15000 - 30000 = -15000)
        }

        res.json({
          cartId: 1,
          items: cart.items,
          subtotal,
          discount,
          shippingFee,
          shippingOption: shipOption,
          tax,
          total,
          appliedCouponCodes: JSON.parse(state.applied_coupon_codes || '[]'),
          lastCouponCode: lastCoupon
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate summary' });
  }
});

// 7. Place Order
// BUG-446: Inventory Steal During Sequence (409 Conflict if requested qty > DB stock)
app.post('/api/orders', async (req, res) => {
  try {
    const cart = await getCartDetails(1);
    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // BUG-446: Inventory verification against real DB stock
    for (const item of cart.items) {
      if (item.quantity > item.stock) {
        return res.status(409).json({
          error: 'OUT_OF_STOCK',
          message: `상품 재고가 부족합니다. (${item.name} - 잔여 재고: ${item.stock}개, 요청 수량: ${item.quantity}개)`
        });
      }
    }

    db.get('SELECT * FROM checkout_state WHERE cart_id = 1', (err, state) => {
      db.get('SELECT * FROM shipping_options WHERE id = ?', [state.shipping_option_id || 1], (err2, shipOption) => {
        db.get('SELECT * FROM addresses WHERE id = ?', [state.shipping_address_id || 1], (err3, addr) => {
          const subtotal = cart.subtotal;
          const discount = Number(state.accumulated_discount) || 0;
          const shippingFee = shipOption ? shipOption.fee : 0;
          const tax = Math.floor(Math.max(0, subtotal - discount) * 0.1);
          const total = subtotal - discount + shippingFee;

          const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
          const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const addressStr = addr ? `${addr.recipient} (${addr.phone}) - ${addr.address} ${addr.address_detail || ''}` : '기본 배송지';
          const shippingName = shipOption ? shipOption.name : '일반 배송';

          db.run(
            `INSERT INTO orders (order_number, user_id, subtotal, discount, shipping_fee, tax, total, status, shipping_address, shipping_option_name, created_at)
             VALUES (?, 1, ?, ?, ?, ?, ?, 'COMPLETED', ?, ?, ?)`,
            [orderNumber, subtotal, discount, shippingFee, tax, total, addressStr, shippingName, now],
            function (err4) {
              if (err4) return res.status(500).json({ error: 'Failed to create order' });
              const orderId = this.lastID;

              // Insert order items & deduct inventory
              const insertItem = db.prepare(`
                INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?, ?)
              `);

              cart.items.forEach((it) => {
                insertItem.run(orderId, it.product_id, it.name, it.quantity, it.unit_price, it.quantity * it.unit_price);
                // Deduct stock
                db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [it.quantity, it.product_id]);
              });
              insertItem.finalize();

              // Clear cart items and checkout state
              db.run('DELETE FROM cart_items WHERE cart_id = 1');
              db.run('UPDATE checkout_state SET applied_coupon_codes = "[]", accumulated_discount = 0, last_coupon_code = NULL WHERE cart_id = 1');

              res.status(201).json({
                success: true,
                orderId,
                orderNumber,
                total,
                message: 'Order created successfully'
              });
            }
          );
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// 8. Orders List & Detail
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders WHERE user_id = 1 ORDER BY id DESC', (err, rows) => {
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

// 9. Reset API
app.post('/api/test/reset', (req, res) => {
  resetDb(() => {
    res.json({ success: true, message: 'Morrow Market C-05 database reset to initial deterministic seed state' });
  });
});

app.listen(PORT, () => {
  console.log(`Morrow Market C-05 backend server running on http://localhost:${PORT}`);
});
