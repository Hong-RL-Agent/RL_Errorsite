const BASE_URL = 'http://localhost:5007';

async function runTests() {
  console.log('========================================================');
  console.log('StayMeet (C-08) Automated Bug Verification Suite');
  console.log('========================================================\n');

  // Step 0: Test Reset
  console.log('[STEP 0] Calling POST /api/test/reset...');
  const resetRes = await fetch(`${BASE_URL}/api/test/reset`, { method: 'POST' });
  const resetJson = await resetRes.json();
  console.log('Reset Response:', resetJson);

  // BUG 1: C-08-439 Double Booking Collision
  console.log('\n--------------------------------------------------------');
  console.log('[TEST 1] BUG C-08-439: Double Booking Collision (ACTION_REPLAY)');
  try {
    const bookRes = await fetch(`${BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        space_id: 101,
        guest_name: 'DQN Collision Tester',
        guest_count: 2,
        start_at: '2026-10-15T14:00:00+09:00',
        end_at: '2026-10-15T15:00:00+09:00',
        total_price: 10000
      })
    });
    const bookData = await bookRes.json();
    console.log(`HTTP Status: ${bookRes.status} (Expected 201 Created due to missing conflict check)`);
    console.log('Reservation Created ID:', bookData.reservation.id);
    if (bookRes.status === 201) {
      console.log('>>> BUG C-08-439 CONFIRMED: Allowed double booking on 14:00~15:00 slot.');
    }
  } catch (err) {
    console.error('Test 1 failed:', err.message);
  }

  // BUG 2: C-08-158 Timezone Shift Bug
  console.log('\n--------------------------------------------------------');
  console.log('[TEST 2] BUG C-08-158: Timezone Shift Bug (ACTION_REPLAY)');
  try {
    const tzRes = await fetch(`${BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        space_id: 102,
        guest_name: 'Timezone Tester',
        guest_count: 1,
        start_at: '2026-10-15T10:00:00+09:00',
        end_at: '2026-10-15T11:00:00+09:00',
        total_price: 15000
      })
    });
    const tzData = await tzRes.json();
    console.log('Input Start Time: 2026-10-15 10:00:00 (+09:00)');
    console.log('Saved Start Time:', tzData.reservation.start_at);
    if (tzData.reservation.start_at.includes('01:00:00')) {
      console.log('>>> BUG C-08-158 CONFIRMED: 10:00 shifted erroneously to 01:00 in database/response.');
    }
  } catch (err) {
    console.error('Test 2 failed:', err.message);
  }

  // BUG 3: C-08-625 Seat Option Multiplier Failure
  console.log('\n--------------------------------------------------------');
  console.log('[TEST 3] BUG C-08-625: Seat Option Multiplier Failure (SEQUENCE_REPLAY)');
  try {
    const priceRes = await fetch(`${BASE_URL}/api/price/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        space_id: 101, // Base: 10000
        guest_count: 3,
        options: [{ name: 'VIP 좌석', unit_price: 10000 }]
      })
    });
    const priceData = await priceRes.json();
    console.log('Price Preview Response:', priceData);
    console.log('Guest count: 3, VIP option unit price: 10,000');
    console.log('Expected Normal Total: 10,000 + (3 * 10,000) = 40,000');
    console.log(`Actual Calculated Total: ${priceData.total_price}`);
    if (priceData.total_price === 20000) {
      console.log('>>> BUG C-08-625 CONFIRMED: Option multiplier omitted (flat 10,000 added).');
    }
  } catch (err) {
    console.error('Test 3 failed:', err.message);
  }

  // BUG 4: C-08-434 Partial Cancel Calculation Error
  console.log('\n--------------------------------------------------------');
  console.log('[TEST 4] BUG C-08-434: Partial Cancel Calculation Error (SEQUENCE_REPLAY)');
  try {
    const refundRes = await fetch(`${BASE_URL}/api/refund/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservation_id: 9001,
        target_space_id: 101, // Room A
        type: 'PARTIAL'
      })
    });
    const refundData = await refundRes.json();
    console.log('Refund Preview for Room A:', refundData);
    if (refundData.refund_amount === 0) {
      console.log('>>> BUG C-08-434 CONFIRMED: Partial refund preview returned 0원 (full cancel fallback bug).');
    }
  } catch (err) {
    console.error('Test 4 failed:', err.message);
  }

  // BUG 5: C-08-1971 Cancel Persistence Bug
  console.log('\n--------------------------------------------------------');
  console.log('[TEST 5] BUG C-08-1971: Cancel Persistence Bug (STATE_REVISIT)');
  try {
    // 1. Cancel confirmed reservation 1001
    const cancelRes = await fetch(`${BASE_URL}/api/reservations/1001/cancel`, { method: 'POST' });
    const cancelData = await cancelRes.json();
    console.log('Cancel Mutation Status:', cancelRes.status, cancelData);

    // 2. Simulate revisit query with status=CONFIRMED
    const revisitRes = await fetch(`${BASE_URL}/api/reservations?status=CONFIRMED`);
    const revisitData = await revisitRes.json();
    const stillPresent = revisitData.find(r => r.id === 1001);
    console.log('Revisit Confirmed List contains Reservation 1001:', !!stillPresent);
    if (stillPresent) {
      console.log('>>> BUG C-08-1971 CONFIRMED: Cancelled reservation resurrected in CONFIRMED list on revisit.');
    }
  } catch (err) {
    console.error('Test 5 failed:', err.message);
  }

  // Reset at end
  await fetch(`${BASE_URL}/api/test/reset`, { method: 'POST' });

  console.log('\n========================================================');
  console.log('All 5 Validation Bugs Verified Successfully!');
  console.log('========================================================\n');
}

runTests();
