const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { db, resetDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5007;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Helper to normalize reservation object
function formatReservation(row) {
  if (!row) return null;
  const startAt = row.start_at || `${row.date}T${(row.time_slot || '14:00').split('-')[0]}:00`;
  const endAt = row.end_at || `${row.date}T${(row.time_slot || '14:00-15:00').split('-')[1] || '15:00'}:00`;

  return {
    id: row.id,
    user_id: row.user_id,
    space_id: row.space_id,
    space_name: row.space_name,
    guest_name: row.guest_name || '예약자',
    guest_count: row.guest_count,
    date: row.date,
    time_slot: row.time_slot,
    start_at: startAt,
    end_at: endAt,
    has_vip_seat: !!row.has_vip_seat,
    base_amount: row.base_amount || row.total_amount,
    base_price: row.base_amount || row.total_amount,
    option_amount: row.option_amount || 0,
    total_amount: row.total_amount,
    total_price: row.total_amount,
    parent_booking_id: row.parent_booking_id,
    status: row.status,
    created_at: row.created_at
  };
}

// 1. GET /api/spaces
app.get('/api/spaces', (req, res) => {
  db.all('SELECT * FROM spaces ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch spaces' });
    const formatted = (rows || []).map(r => ({
      id: r.id,
      name: r.name,
      category: r.type_label || '회의실',
      type: r.type,
      price_per_hour: r.price_per_hour,
      capacity: r.capacity,
      description: r.description,
      image_url: r.image_url
    }));
    res.json(formatted);
  });
});

app.get('/api/spaces/:id', (req, res) => {
  db.get('SELECT * FROM spaces WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Space not found' });
    res.json({
      id: row.id,
      name: row.name,
      category: row.type_label,
      type: row.type,
      price_per_hour: row.price_per_hour,
      capacity: row.capacity,
      description: row.description,
      image_url: row.image_url
    });
  });
});

// 2. GET /api/availability
app.get('/api/availability', (req, res) => {
  const { space_id = 101, date = '2026-10-15' } = req.query;
  db.all(
    'SELECT time_slot, status, id as reservation_id FROM reservations WHERE space_id = ? AND date = ?',
    [space_id, date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch availability' });
      res.json({ bookedSlots: rows || [] });
    }
  );
});

// 3. POST /api/price/preview
// BUG-625: Seat Option Multiplier Failure
app.post('/api/price/preview', (req, res) => {
  const spaceId = req.body.space_id || req.body.spaceId || 101;
  const guestCount = parseInt(req.body.guest_count || req.body.guestCount || 1, 10);
  const options = req.body.options || [];
  const hasVipSeat = req.body.has_vip_seat || req.body.hasVipSeat || options.some(o => o.name && o.name.includes('VIP'));

  db.get('SELECT * FROM spaces WHERE id = ?', [spaceId], (err, space) => {
    if (err || !space) return res.status(404).json({ error: 'Space not found' });

    const baseAmount = space.price_per_hour;
    let optionAmount = 0;

    if (hasVipSeat) {
      // BUG-625: Adds flat 10,000 without multiplying by guestCount!
      optionAmount = 10000;
    }

    const totalAmount = baseAmount + optionAmount;

    res.json({
      space_id: space.id,
      spaceId: space.id,
      base_price: baseAmount,
      baseAmount,
      guest_count: guestCount,
      guestCount,
      has_vip_seat: hasVipSeat,
      hasVipSeat,
      option_amount: optionAmount,
      optionAmount,
      total_price: totalAmount,
      totalAmount,
      explanation: hasVipSeat ? 'VIP 좌석 옵션 (+10,000원 / 1인)' : '옵션 없음'
    });
  });
});

// 4. POST /api/reservations (Create Reservation)
// BUG-439: Double Booking Collision (skips conflict query, returns 201 Created)
// BUG-158: Timezone Shift Bug (10:00 shifts to 01:00)
app.post('/api/reservations', (req, res) => {
  const spaceId = req.body.space_id || req.body.spaceId || 101;
  const guestName = req.body.guest_name || req.body.guestName || '예약자';
  const guestCount = parseInt(req.body.guest_count || req.body.guestCount || 1, 10);
  const startAt = req.body.start_at || req.body.startAt;
  const endAt = req.body.end_at || req.body.endAt;
  const dateInput = req.body.date;
  const timeSlotInput = req.body.time_slot || req.body.timeSlot;
  const options = req.body.options || [];
  const hasVipSeat = req.body.has_vip_seat || req.body.hasVipSeat || options.some(o => o.name && o.name.includes('VIP'));
  const clientTotalPrice = req.body.total_price || req.body.totalPrice;

  db.get('SELECT * FROM spaces WHERE id = ?', [spaceId], (err, space) => {
    if (err || !space) return res.status(404).json({ error: 'Space not found' });

    let finalDate = dateInput || '2026-10-15';
    let finalTimeSlot = timeSlotInput || '14:00-15:00';
    let finalStartAt = startAt || '2026-10-15T14:00:00+09:00';
    let finalEndAt = endAt || '2026-10-15T15:00:00+09:00';

    if (startAt) {
      const match = startAt.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
      if (match) {
        finalDate = match[1];
        const hour = parseInt(match[2].split(':')[0], 10);
        finalTimeSlot = `${match[2]}-${String(hour + 1).padStart(2, '0')}:00`;
      }
    }

    // BUG-158: Timezone Shift (10:00 -> 01:00)
    if (finalTimeSlot.startsWith('10:00') || (startAt && startAt.includes('10:00'))) {
      finalTimeSlot = '01:00-02:00';
      finalStartAt = `${finalDate} 01:00:00`;
      finalEndAt = `${finalDate} 02:00:00`;
    }

    const baseAmount = space.price_per_hour;
    const optionAmount = hasVipSeat ? 10000 : 0;
    const totalAmount = clientTotalPrice || (baseAmount + optionAmount);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // BUG-439: Intentionally omits conflict query, allows duplicate bookings on same slot!
    db.run(
      `INSERT INTO reservations (user_id, space_id, space_name, date, time_slot, guest_count, has_vip_seat, base_amount, option_amount, total_amount, status, created_at)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
      [space.id, space.name, finalDate, finalTimeSlot, guestCount, hasVipSeat ? 1 : 0, baseAmount, optionAmount, totalAmount, now],
      function (err2) {
        if (err2) return res.status(500).json({ error: 'Failed to create reservation' });
        const reservationId = this.lastID;

        db.get('SELECT * FROM reservations WHERE id = ?', [reservationId], (err3, row) => {
          const formatted = formatReservation({
            ...row,
            guest_name: guestName,
            start_at: finalStartAt,
            end_at: finalEndAt
          });

          res.status(201).json({
            success: true,
            reservation: formatted,
            message: 'Reservation created successfully'
          });
        });
      }
    );
  });
});

// 5. GET /api/reservations
// BUG-1971: Cancel Persistence Bug (All reservations returned as CONFIRMED on revisit)
app.get('/api/reservations', (req, res) => {
  db.all('SELECT * FROM reservations ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch reservations' });

    // Group items for multi-room booking 9001
    const multiItems = (rows || []).filter(r => r.parent_booking_id === 9001);
    const otherRows = (rows || []).filter(r => r.parent_booking_id !== 9001);

    const list = [];

    // Multi-room parent card
    if (multiItems.length > 0) {
      const parentTotalPrice = multiItems.reduce((sum, item) => sum + item.total_amount, 0);
      list.push({
        id: 9001,
        user_id: 1,
        space_name: '다중 공간 예약 패키지',
        created_at: '2026-10-08 09:10:00',
        total_price: parentTotalPrice,
        total_amount: parentTotalPrice,
        // BUG-1971: Revisit overrides status to CONFIRMED
        status: 'CONFIRMED',
        items: multiItems.map(item => ({
          id: item.id,
          space_id: item.space_id,
          space_name: item.space_name,
          start_at: `${item.date} 10:00`,
          end_at: `${item.date} 11:00`,
          item_price: item.total_amount,
          status: item.status
        }))
      });
    }

    // Other single reservations
    otherRows.forEach(row => {
      const formatted = formatReservation(row);
      // BUG-1971: On list fetch/revisit, returned status is forced to CONFIRMED!
      formatted.status = 'CONFIRMED';
      list.push(formatted);
    });

    res.json(list);
  });
});

app.get('/api/reservations/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.get('SELECT * FROM reservations WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ reservation: formatReservation(row) });
  });
});

// 6. POST /api/reservations/:id/cancel
app.post('/api/reservations/:id/cancel', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.run('UPDATE reservations SET status = "CANCELLED" WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to cancel reservation' });
    db.get('SELECT * FROM reservations WHERE id = ?', [id], (err2, row) => {
      res.json({
        success: true,
        reservation: formatReservation(row),
        message: 'Reservation cancelled successfully'
      });
    });
  });
});

// 7. POST /api/refund/preview
// BUG-434: Partial Cancel Calculation Error (returns refund_amount = 0)
app.post('/api/refund/preview', (req, res) => {
  const reservationId = req.body.reservation_id || req.body.reservationId || 9001;
  const targetSpaceId = req.body.target_space_id || req.body.targetSpaceId || 101;

  db.get('SELECT * FROM reservations WHERE (parent_booking_id = ? OR id = ?) AND space_id = ?', [reservationId, reservationId, targetSpaceId], (err, resv) => {
    const spaceName = resv ? resv.space_name : 'Aurora Meeting Room';
    const paidAmount = resv ? resv.total_amount : 50000;
    const penaltyFee = Math.floor(paidAmount * 0.1); // 5000

    // BUG-434: Partial Cancel returns 0원 refund!
    const refundAmount = 0;

    res.json({
      reservation_id: reservationId,
      reservationId,
      target_space_id: targetSpaceId,
      targetSpaceId,
      target_space_name: spaceName,
      spaceName,
      paid_amount: paidAmount,
      paidAmount,
      penalty_fee: penaltyFee,
      penaltyAmount: penaltyFee,
      refund_amount: refundAmount,
      refundAmount,
      message: '부분 취소 위약금 적용 결과'
    });
  });
});

// 8. POST /api/reservations/:id/partial-cancel
app.post('/api/reservations/:id/partial-cancel', (req, res) => {
  const reservationId = parseInt(req.params.id, 10);
  const targetSpaceId = req.body.target_space_id || req.body.targetSpaceId || 101;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.run(
    'UPDATE reservations SET status = "CANCELLED" WHERE (parent_booking_id = ? OR id = ?) AND space_id = ?',
    [reservationId, reservationId, targetSpaceId],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to partial cancel' });

      db.run(
        'INSERT INTO refunds (reservation_id, refund_amount, penalty_amount, reason, created_at) VALUES (?, 0, 5000, "부분 취소", ?)',
        [reservationId, now],
        () => {
          res.json({
            success: true,
            refund_amount: 0,
            penalty_fee: 5000,
            message: '부분 취소가 접수되었습니다. (환불 예상 금액: 0원)'
          });
        }
      );
    }
  );
});

// 9. POST /api/test/reset
app.post('/api/test/reset', (req, res) => {
  resetDb(() => {
    res.json({ success: true, message: 'StayMeet C-08 database reset to initial deterministic state' });
  });
});

app.listen(PORT, () => {
  console.log(`StayMeet C-08 backend server running on http://localhost:${PORT}`);
});
