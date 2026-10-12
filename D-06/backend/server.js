require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDatabase, resetAllData, INITIAL_CUSTOMERS } = require('./db');

const app = express();
const PORT = process.env.PORT || 9806;

app.use(cors());
app.use(express.json());

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'OrderPilot API', timestamp: new Date().toISOString() });
});

// 테스트 데이터 멱등 복원 (POST /api/test/reset)
app.post('/api/test/reset', async (req, res) => {
  try {
    const result = await resetAllData();
    res.json({
      success: true,
      message: 'OrderPilot 데이터베이스 및 세션 상태가 초기 상태로 복원되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 주문 통계 KPI (GET /api/stats)
app.get('/api/stats', (req, res) => {
  db.serialize(() => {
    let totalOrders = 0;
    let paidOrders = 0;
    let preparingOrders = 0;
    let shippingOrders = 0;
    let deliveredOrders = 0;
    let refundRequestedOrders = 0;
    let totalSales = 0;

    db.get(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END) AS paid,
        SUM(CASE WHEN delivery_status = 'PREPARING' THEN 1 ELSE 0 END) AS preparing,
        SUM(CASE WHEN delivery_status = 'SHIPPING' THEN 1 ELSE 0 END) AS shipping,
        SUM(CASE WHEN delivery_status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered,
        SUM(CASE WHEN payment_status = 'REFUND_REQUESTED' THEN 1 ELSE 0 END) AS refund_req,
        SUM(CASE WHEN payment_status = 'PAID' OR payment_status = 'REFUND_REQUESTED' THEN total_amount ELSE 0 END) AS sales
      FROM orders
    `, (err, row) => {
      if (err) return res.status(500).json({ success: false, error: err.message });

      totalOrders = row.total || 0;
      paidOrders = row.paid || 0;
      preparingOrders = row.preparing || 0;
      shippingOrders = row.shipping || 0;
      deliveredOrders = row.delivered || 0;
      refundRequestedOrders = row.refund_req || 0;
      totalSales = row.sales || 0;

      res.json({
        success: true,
        data: {
          totalOrders,
          paidOrders,
          preparingOrders,
          shippingOrders,
          deliveredOrders,
          refundRequestedOrders,
          totalSales
        }
      });
    });
  });
});

// 고객 목록 조회 (GET /api/customers)
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 주문 목록 조회 (GET /api/orders)
app.get('/api/orders', (req, res) => {
  const {
    search = '',
    startDate = '',
    endDate = '',
    paymentStatus = '',
    deliveryStatus = '',
    sort = 'id',
    order = 'desc',
    page = 1,
    limit = 10
  } = req.query;

  let query = 'SELECT * FROM orders WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) AS total FROM orders WHERE 1=1';
  const params = [];
  const countParams = [];

  if (search.trim()) {
    const s = `%${search.trim()}%`;
    query += ' AND (order_no LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    countQuery += ' AND (order_no LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    params.push(s, s, s);
    countParams.push(s, s, s);
  }

  if (startDate.trim()) {
    query += ' AND date(order_date) >= date(?)';
    countQuery += ' AND date(order_date) >= date(?)';
    params.push(startDate.trim());
    countParams.push(startDate.trim());
  }

  if (endDate.trim()) {
    query += ' AND date(order_date) <= date(?)';
    countQuery += ' AND date(order_date) <= date(?)';
    params.push(endDate.trim());
    countParams.push(endDate.trim());
  }

  if (paymentStatus.trim()) {
    query += ' AND payment_status = ?';
    countQuery += ' AND payment_status = ?';
    params.push(paymentStatus.trim());
    countParams.push(paymentStatus.trim());
  }

  if (deliveryStatus.trim()) {
    query += ' AND delivery_status = ?';
    countQuery += ' AND delivery_status = ?';
    params.push(deliveryStatus.trim());
    countParams.push(deliveryStatus.trim());
  }

  const allowedSorts = ['id', 'order_no', 'order_date', 'total_amount', 'customer_name', 'payment_status', 'delivery_status'];
  const safeSort = allowedSorts.includes(sort) ? sort : 'id';
  const safeOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  query += ` ORDER BY ${safeSort} ${safeOrder}`;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  query += ' LIMIT ? OFFSET ?';
  params.push(limitNum, offset);

  db.get(countQuery, countParams, (err, countRow) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    const total = countRow ? countRow.total : 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    db.all(query, params, (err2, rows) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });
      res.json({
        success: true,
        data: rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      });
    });
  });
});

// 주문 단건 상세 조회 (GET /api/orders/:id)
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const query = isNaN(id) ? 'SELECT * FROM orders WHERE order_no = ?' : 'SELECT * FROM orders WHERE id = ? OR order_no = ?';
  const params = isNaN(id) ? [id] : [id, id];

  db.get(query, params, (err, orderRow) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!orderRow) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

    db.all('SELECT * FROM order_items WHERE order_id = ?', [orderRow.id], (err2, items) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });

      db.all('SELECT * FROM order_logs WHERE order_id = ? ORDER BY id DESC', [orderRow.id], (err3, logs) => {
        if (err3) return res.status(500).json({ success: false, error: err3.message });

        res.json({
          success: true,
          data: {
            ...orderRow,
            items: items || [],
            logs: logs || []
          }
        });
      });
    });
  });
});

// 배송 상태 변경 및 운송장 번호 등록 (PATCH /api/orders/:id/delivery)
// [BUG-D06-01] 날짜 검색 + 결제 완료 필터 + 주문 선택(id: 12, ORD-20261005-0012) -> 배송 준비 처리 시 배송 상태 미변경
// [BUG-D06-03] 배송 중 필터 + 주문 선택(id: 8, ORD-20261003-0008) -> 운송장 입력 및 배송완료 시 다른 주문(id: 7)에 운송장 저장
app.patch('/api/orders/:id/delivery', (req, res) => {
  const { id } = req.params;
  const { deliveryStatus, courier, trackingNumber, filterContext = {} } = req.body;

  db.get('SELECT * FROM orders WHERE id = ? OR order_no = ?', [id, id], (err, targetOrder) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!targetOrder) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

    // BUG-D06-01 판정:
    // 날짜 검색 존재 + paymentStatus === 'PAID' + targetOrder.id === 12
    const hasDateRange = filterContext.startDate && filterContext.endDate;
    const isPaymentPaid = filterContext.paymentStatus === 'PAID';
    const isTargetBug1 = targetOrder.id === 12 || targetOrder.order_no === 'ORD-20261005-0012';

    if (hasDateRange && isPaymentPaid && isTargetBug1) {
      // 버그 발현: DB 상태 업데이트를 누락하고 기존 상태 유지
      db.run(
        'INSERT INTO order_logs (order_id, action, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
        [targetOrder.id, 'DELIVERY_STATUS_ATTEMPT', targetOrder.delivery_status, deliveryStatus, '배송 준비 상태 변경 요청 수신 (DB 미반영)']
      );

      return res.json({
        success: true,
        message: '배송 상태 변경이 접수되었습니다.',
        data: {
          id: targetOrder.id,
          order_no: targetOrder.order_no,
          delivery_status: targetOrder.delivery_status // 원래 상태(PENDING) 유지
        }
      });
    }

    // BUG-D06-03 판정:
    // deliveryStatus filter === 'SHIPPING' + targetOrder.id === 8
    const isDeliveryShippingFilter = filterContext.deliveryStatus === 'SHIPPING';
    const isTargetBug3 = targetOrder.id === 8 || targetOrder.order_no === 'ORD-20261003-0008';

    if (isDeliveryShippingFilter && isTargetBug3) {
      // 버그 발현: 8번 주문의 배송 상태는 변경하되, 운송장 번호와 택배사는 이전 주문인 7번 주문에 저장함!
      const newStatus = deliveryStatus || 'DELIVERED';
      db.run('UPDATE orders SET delivery_status = ? WHERE id = ?', [newStatus, targetOrder.id], (errB3_1) => {
        if (errB3_1) return res.status(500).json({ success: false, error: errB3_1.message });

        // 7번 주문에 운송장 덮어쓰기
        db.run('UPDATE orders SET courier = ?, tracking_number = ? WHERE id = 7', [courier, trackingNumber], (errB3_2) => {
          if (errB3_2) return res.status(500).json({ success: false, error: errB3_2.message });

          db.run(
            'INSERT INTO order_logs (order_id, action, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
            [targetOrder.id, 'DELIVERY_COMPLETED', targetOrder.delivery_status, newStatus, `배송 완료 처리 (운송장 등록 분기 왜곡: ${courier} ${trackingNumber})`]
          );

          return res.json({
            success: true,
            message: '배송 상태 및 운송장 정보가 성공적으로 등록되었습니다.',
            data: {
              id: targetOrder.id,
              order_no: targetOrder.order_no,
              delivery_status: newStatus,
              tracking_number: targetOrder.tracking_number, // 8번 주문에는 반영되지 않음
              mismatched_target: 7
            }
          });
        });
      });
      return;
    }

    // 정상 처리
    const nextDelivery = deliveryStatus || targetOrder.delivery_status;
    const nextCourier = courier !== undefined ? courier : targetOrder.courier;
    const nextTracking = trackingNumber !== undefined ? trackingNumber : targetOrder.tracking_number;

    db.run(
      'UPDATE orders SET delivery_status = ?, courier = ?, tracking_number = ? WHERE id = ?',
      [nextDelivery, nextCourier, nextTracking, targetOrder.id],
      function (updateErr) {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        db.run(
          'INSERT INTO order_logs (order_id, action, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
          [targetOrder.id, 'DELIVERY_UPDATE', targetOrder.delivery_status, nextDelivery, `배송 상태 변경: ${nextDelivery} (운송장: ${nextCourier} ${nextTracking || '미입력'})`]
        );

        res.json({
          success: true,
          message: '배송 상태가 성공적으로 변경되었습니다.',
          data: {
            id: targetOrder.id,
            order_no: targetOrder.order_no,
            delivery_status: nextDelivery,
            courier: nextCourier,
            tracking_number: nextTracking
          }
        });
      }
    );
  });
});

// 주문 상품 수량 변경 및 총액 갱신 (PATCH /api/orders/:id/items)
// [BUG-D06-02] 주문 검색 + 상세 페이지 열기(id: 25, ORD-20261008-0025, 김민준) -> 수량 변경(1개 -> 3개) 후 저장 시 총액 왜곡 계산
app.patch('/api/orders/:id/items', (req, res) => {
  const { id } = req.params;
  const { itemId, quantity, filterContext = {} } = req.body;

  db.get('SELECT * FROM orders WHERE id = ? OR order_no = ?', [id, id], (err, targetOrder) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!targetOrder) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

    db.get('SELECT * FROM order_items WHERE id = ? AND order_id = ?', [itemId, targetOrder.id], (err2, item) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });
      if (!item) return res.status(404).json({ success: false, message: '주문 품목을 찾을 수 없습니다.' });

      const newQty = parseInt(quantity, 10) || 1;
      const trueSubtotal = item.unit_price * newQty;

      // BUG-D06-02 판정:
      // search 쿼리 존재 + targetOrder.id === 25
      const hasSearch = filterContext.search && (filterContext.search.includes('김민준') || filterContext.search.includes('0025'));
      const isTargetBug2 = targetOrder.id === 25 || targetOrder.order_no === 'ORD-20261008-0025';

      let totalToSave = trueSubtotal;
      if (hasSearch && isTargetBug2) {
        // 버그 발현: 수량은 newQty로 저장되지만 총액은 이전 1개 가격(item.unit_price: 89000원)으로 왜곡 저장됨!
        totalToSave = item.unit_price; // 89000원 고정
      }

      db.run(
        'UPDATE order_items SET quantity = ?, subtotal = ? WHERE id = ?',
        [newQty, totalToSave, item.id],
        (updateItemErr) => {
          if (updateItemErr) return res.status(500).json({ success: false, error: updateItemErr.message });

          db.run(
            'UPDATE orders SET total_amount = ? WHERE id = ?',
            [totalToSave, targetOrder.id],
            (updateOrderErr) => {
              if (updateOrderErr) return res.status(500).json({ success: false, error: updateOrderErr.message });

              db.run(
                'INSERT INTO order_logs (order_id, action, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
                [targetOrder.id, 'ITEM_QUANTITY_UPDATE', 'PAID', 'PAID', `품목 수량 수정: ${item.product_name} ${newQty}개 (총액: ${totalToSave}원)`]
              );

              res.json({
                success: true,
                message: '주문 품목 수량 및 총액이 저장되었습니다.',
                data: {
                  order_id: targetOrder.id,
                  total_amount: totalToSave,
                  quantity: newQty
                }
              });
            }
          );
        }
      );
    });
  });
});

// 주문 취소 처리 (PATCH /api/orders/:id/cancel)
// [BUG-D06-04] 고객명 검색('정다은') + 주문 선택(id: 19, ORD-20261007-0019) -> 취소 사유 입력 후 확정 시 성공 알림 후에도 PAID 유지
app.patch('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { reason = '고객 요청 취소', filterContext = {} } = req.body;

  db.get('SELECT * FROM orders WHERE id = ? OR order_no = ?', [id, id], (err, targetOrder) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!targetOrder) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

    // BUG-D06-04 판정:
    // search filter contains '정다은' + targetOrder.id === 19
    const isSearchJung = filterContext.search && filterContext.search.includes('정다은');
    const isTargetBug4 = targetOrder.id === 19 || targetOrder.order_no === 'ORD-20261007-0019';

    if (isSearchJung && isTargetBug4) {
      // 버그 발현: 취소 로그만 기록하고 실제 주문 및 결제 상태는 PAID로 유지
      db.run(
        'INSERT INTO order_logs (order_id, action, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
        [targetOrder.id, 'ORDER_CANCEL_ATTEMPT', targetOrder.payment_status, 'CANCELLED', `주문 취소 접수 사유: ${reason} (DB 상태 유지)`]
      );

      return res.json({
        success: true,
        message: '주문 취소 처리가 완료되었습니다.',
        data: {
          id: targetOrder.id,
          order_no: targetOrder.order_no,
          payment_status: targetOrder.payment_status // PAID 유지
        }
      });
    }

    // 정상 취소
    db.run(
      'UPDATE orders SET payment_status = "CANCELLED", delivery_status = "CANCELLED", cancel_reason = ? WHERE id = ?',
      [reason, targetOrder.id],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        db.run(
          'INSERT INTO order_logs (order_id, action, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
          [targetOrder.id, 'ORDER_CANCELLED', targetOrder.payment_status, 'CANCELLED', `주문 취소 완료: ${reason}`]
        );

        res.json({
          success: true,
          message: '주문 취소 처리가 완료되었습니다.',
          data: {
            id: targetOrder.id,
            order_no: targetOrder.order_no,
            payment_status: 'CANCELLED',
            delivery_status: 'CANCELLED'
          }
        });
      }
    );
  });
});

// 환불 승인 (PATCH /api/orders/:id/refund-approve)
// [BUG-D06-05] 환불 요청 필터('REFUND_REQUESTED') + 특정 주문 선택(id: 10, ORD-20261004-0010, 최유진) -> 환불 승인 시 다른 주문(id: 5, ORD-20261002-0005, 김서준)의 결제 상태 변경
app.patch('/api/orders/:id/refund-approve', (req, res) => {
  const { id } = req.params;
  const { filterContext = {} } = req.body;

  db.get('SELECT * FROM orders WHERE id = ? OR order_no = ?', [id, id], (err, targetOrder) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!targetOrder) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

    // BUG-D06-05 판정:
    // paymentStatus filter === 'REFUND_REQUESTED' + targetOrder.id === 10
    const isRefundFilter = filterContext.paymentStatus === 'REFUND_REQUESTED';
    const isTargetBug5 = targetOrder.id === 10 || targetOrder.order_no === 'ORD-20261004-0010';

    if (isRefundFilter && isTargetBug5) {
      // 버그 발현: 10번 주문 대신 5번 주문의 결제 상태를 REFUNDED로 변경함!
      db.run('UPDATE orders SET payment_status = "REFUNDED" WHERE id = 5', (errB5) => {
        if (errB5) return res.status(500).json({ success: false, error: errB5.message });

        db.run(
          'INSERT INTO order_logs (order_id, action, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
          [5, 'REFUND_APPROVED', 'REFUND_REQUESTED', 'REFUNDED', '환불 승인 완료 (타깃 매핑 왜곡: 5번 주문으로 승인)']
        );

        return res.json({
          success: true,
          message: '환불 승인 처리가 완료되었습니다.',
          data: {
            requested_order_id: targetOrder.id,
            affected_order_id: 5,
            payment_status: targetOrder.payment_status // 10번 주문은 REFUND_REQUESTED 유지
          }
        });
      });
      return;
    }

    // 정상 환불 승인
    db.run('UPDATE orders SET payment_status = "REFUNDED" WHERE id = ?', [targetOrder.id], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

      db.run(
        'INSERT INTO order_logs (order_id, action, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
        [targetOrder.id, 'REFUND_APPROVED', targetOrder.payment_status, 'REFUNDED', '환불 승인 완료 및 결제 취소 정산']
      );

      res.json({
        success: true,
        message: '환불 승인 처리가 완료되었습니다.',
        data: {
          id: targetOrder.id,
          order_no: targetOrder.order_no,
          payment_status: 'REFUNDED'
        }
      });
    });
  });
});

// 주문 타임라인 로그 조회 (GET /api/orders/:id/logs)
app.get('/api/orders/:id/logs', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM order_logs WHERE order_id = ? ORDER BY id DESC', [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 서버 기동
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[OrderPilot Backend] Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
