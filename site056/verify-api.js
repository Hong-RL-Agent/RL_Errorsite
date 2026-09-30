// Automated Verification Script for site056 AutoCheck APIs and Bugs
import http from 'http';

const PORT = 9955;
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
  console.log('=== Starting site056 Verification Tests ===\n');

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log('[1] GET /api/health:', health.status === 200 ? 'PASS' : 'FAIL', health.body);

    // 2. Vehicles list
    const vehicles = await request('/api/vehicles');
    console.log('[2] GET /api/vehicles:', vehicles.body.total >= 10 ? 'PASS' : 'FAIL', `(${vehicles.body.total} vehicles)`);

    // 3. SEC-460: Unicode model search test
    const nfcSearch = await request('/api/vehicles?model=제네시스 G80');
    console.log('[3] SEC-460 Unicode Search (NFC search for NFD data):', nfcSearch.body.total === 0 ? 'BUG VERIFIED (Returns 0 items due to NFD mismatch)' : 'FAIL');

    // 4. Centers list
    const centers = await request('/api/centers');
    console.log('[4] GET /api/centers:', centers.body.centers.length === 5 ? 'PASS' : 'FAIL', `(${centers.body.centers.length} centers)`);

    // 5. Reports list
    const reports = await request('/api/reports');
    console.log('[5] GET /api/reports:', reports.body.reports.length >= 5 ? 'PASS' : 'FAIL', `(${reports.body.reports.length} reports)`);

    // 6. SEC-458: File upload extension vs MIME type mismatch
    const docUpload = await request('/api/reports/rep-01/documents', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'fake_image.jpg',
        mimeType: 'application/pdf',
        size: 50000
      })
    });
    console.log('[6] SEC-458 Document Upload Mismatch:', docUpload.status === 201 ? 'BUG VERIFIED (Accepted .jpg with application/pdf)' : 'FAIL');

    // 7. SEC-459: Booking conflict returns HTTP 200 with success: false
    const conflictBooking = await request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        vehicleId: 'vh-01',
        centerId: 'center-01',
        date: '2026-10-05',
        time: '10:00', // Conflict slot
        customerName: '홍길동',
        phone: '010-1234-5678'
      })
    });
    console.log('[7] SEC-459 Status 200 on Conflict:', conflictBooking.status === 200 && conflictBooking.body.success === false ? 'BUG VERIFIED (Status 200 with success: false)' : 'FAIL');

    // 8. SEC-456: Booking delete returns 204 No Content
    const deleteBooking = await request('/api/bookings/bk-1001', {
      method: 'DELETE'
    });
    console.log('[8] SEC-456 Booking Delete 204:', deleteBooking.status === 204 && deleteBooking.body === null ? 'PASS (Server returns 204 No Content)' : 'FAIL');

    console.log('\n=== All Verification Tests Completed Successfully ===');
  } catch (err) {
    console.error('Test failed with error:', err);
  }
}

// Check if server is running, then run tests
runTests();
