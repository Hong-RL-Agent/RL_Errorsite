// Automated Verification Script for site057 RideOn APIs and Bugs
import http from 'http';

const PORT = 9956;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  return {
    status: res.status,
    ok: res.ok,
    headers: res.headers,
    body: res.status === 204 ? null : await res.json().catch(() => null)
  };
}

async function runTests() {
  console.log('=== Starting site057 Verification Tests ===\n');

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log('[1] GET /api/health:', health.status === 200 ? 'PASS' : 'FAIL', health.body);

    // 2. Vehicles list
    const vehicles = await request('/api/vehicles');
    console.log('[2] GET /api/vehicles:', vehicles.body.total >= 15 ? 'PASS' : 'FAIL', `(${vehicles.body.total} vehicles)`);

    // 3. SEC-461: Strict comparison number/string bug on vehicle detail
    const detailCheck = await request('/api/vehicles/102');
    console.log('[3] SEC-461 Numeric vs String Strict Equality:', detailCheck.status === 404 ? 'BUG VERIFIED (Returns 404 due to 102 !== "102")' : 'FAIL');

    // 4. Stations list
    const stations = await request('/api/stations');
    console.log('[4] GET /api/stations:', stations.body.stations.length === 10 ? 'PASS' : 'FAIL', `(${stations.body.stations.length} stations)`);

    // 5. SEC-462: Missing endTime causes NaN fare calculation
    const fareCheck = await request('/api/rentals/rt-103/fare');
    console.log('[5] SEC-462 NaN Propagation:', fareCheck.body.rawTotalFare === 'NaN' ? 'BUG VERIFIED (rawTotalFare is NaN due to missing endTime)' : 'FAIL');

    // 6. SEC-464: Date formatting token mismatch (2026-9-8 instead of 2026-09-08)
    const history = await request('/api/rides/history');
    const hasUnpaddedDate = history.body.history.some(h => h.date === '2026-9-8' || h.date === '2026-9-1');
    console.log('[6] SEC-464 Date Token Mismatch:', hasUnpaddedDate ? 'BUG VERIFIED (Found unpadded single-digit date "2026-9-8")' : 'FAIL');

    // 7. Account info
    const account = await request('/api/account');
    console.log('[7] GET /api/account:', account.status === 200 ? 'PASS' : 'FAIL', `(${account.body.account.name})`);

    console.log('\n=== All site057 Verification Tests Completed Successfully ===');
  } catch (err) {
    console.error('Test failed with error:', err);
  }
}

runTests();
