import http from 'http';

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- TESTING SITE052 (SpaceMate) ---');

  // 1. Health check
  const healthRes = await request({
    hostname: 'localhost',
    port: 9951,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health Check:', healthRes.statusCode, healthRes.body);

  // 2. Branches
  const branchRes = await request({
    hostname: 'localhost',
    port: 9951,
    path: '/api/branches',
    method: 'GET'
  });
  console.log('2. Branches:', branchRes.statusCode, 'Count:', JSON.parse(branchRes.body).branches?.length);

  // 3. Rooms
  const roomsRes = await request({
    hostname: 'localhost',
    port: 9951,
    path: '/api/rooms',
    method: 'GET'
  });
  console.log('3. Rooms:', roomsRes.statusCode, 'Count:', JSON.parse(roomsRes.body).rooms?.length);

  // 4. Test SEC-436
  const bug436 = await request({
    hostname: 'localhost',
    port: 9951,
    path: '/api/rooms/room-001/availability?date=2026-09-28&selectedSlots=10:00&dateChanged=true',
    method: 'GET',
    headers: { 'x-stale-slot-detected': 'true' }
  });
  console.log('4. SEC-436:', bug436.headers['x-bug-triggered'], JSON.parse(bug436.body)._bug?.id);

  // 5. Test SEC-437
  const bug437 = await request({
    hostname: 'localhost',
    port: 9951,
    path: '/api/bookings/BK-1001/memo?residualDraft=true',
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-draft-residual': 'true'
    }
  }, JSON.stringify({ memo: 'Residual Draft Test' }));
  console.log('5. SEC-437:', bug437.headers['x-bug-triggered'], JSON.parse(bug437.body)._bug?.id);

  // 6. Test SEC-438
  const bug438 = await request({
    hostname: 'localhost',
    port: 9951,
    path: '/api/favorites',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ roomId: 'room-018' }));
  console.log('6. SEC-438 (Expect 500 error):', bug438.statusCode, bug438.headers['x-bug-triggered'], JSON.parse(bug438.body)._bug?.id);

  // 7. Test SEC-439
  const bug439 = await request({
    hostname: 'localhost',
    port: 9951,
    path: '/api/bookings/export',
    method: 'GET'
  });
  console.log('7. SEC-439 Export CSV:', bug439.headers['x-bug-triggered'], bug439.body.split('\r\n')[0]);

  // 8. Test SEC-440
  const bug440 = await request({
    hostname: 'localhost',
    port: 9951,
    path: '/api/rooms?facilities=%ED%99%94%EC%83%81%ED%9A%8C%EC%9D%98&deselectedAll=true',
    method: 'GET',
    headers: { 'x-ghost-filter-active': 'true' }
  });
  console.log('8. SEC-440:', bug440.headers['x-bug-triggered'], JSON.parse(bug440.body)._bug?.id);

  console.log('--- ALL TESTS FINISHED ---');
}

runTests().catch(console.error);
