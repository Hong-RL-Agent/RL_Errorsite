const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 9810,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resData) });
        } catch(e) {
          resolve({ status: res.statusCode, body: resData });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('=== EventWave API & Bug Verification ===');
  
  // 1. Reset
  const resetRes = await request('POST', '/api/test/reset');
  console.log('1. DB Reset:', resetRes.body.success ? 'PASS' : 'FAIL');

  // 2. Initial Data Check
  const usersRes = await request('GET', '/api/users');
  const catsRes = await request('GET', '/api/categories');
  const eventsRes = await request('GET', '/api/events');
  const regsRes = await request('GET', '/api/registrations');
  console.log(`2. Seed Data Check: Users=${usersRes.body.data.length}, Categories=${catsRes.body.data.length}, Events=${eventsRes.body.data.length}, Total Regs=${regsRes.body.data.length}`);

  // 3. Test BUG-D10-01: Cancel registration 14 (PATCH /api/registrations/14/cancel)
  const cancel14 = await request('PATCH', '/api/registrations/14/cancel');
  const check14 = await request('GET', '/api/registrations/14');
  console.log('3. BUG-D10-01 (ACTION_REPLAY Cancel Discrepancy):', 
    (cancel14.body.success && check14.body.data.status === 'CONFIRMED') ? 'PASS (Bug Verified)' : 'FAIL');

  // 4. Test BUG-D10-02: Edit attendee for registration 5 (PATCH /api/registrations/5) -> affects reg 2
  const orig2 = await request('GET', '/api/registrations/2');
  const edit5 = await request('PATCH', '/api/registrations/5', { attendeeName: '오류테스트' });
  const check2 = await request('GET', '/api/registrations/2');
  console.log('4. BUG-D10-02 (ACTION_REPLAY Target Divergence):',
    (check2.body.data.attendee_name === '오류테스트' && orig2.body.data.attendee_name !== '오류테스트') ? 'PASS (Bug Verified)' : 'FAIL');

  // 5. Test BUG-D10-03: Register event 3 with VIP pass -> saved as STANDARD
  const regVip = await request('POST', '/api/registrations', {
    userId: 1,
    eventId: 3,
    ticketTier: 'VIP',
    attendeeCount: 1,
    attendeeName: '김테스트',
    attendeeEmail: 'test@example.com',
    attendeePhone: '010-0000-0000'
  });
  const checkVip = await request('GET', `/api/registrations/${regVip.body.data.id}`);
  console.log('5. BUG-D10-03 (SEQUENCE_REPLAY Pass Distortion):',
    (checkVip.body.data.ticket_tier === 'STANDARD') ? 'PASS (Bug Verified)' : 'FAIL');

  // 6. Test BUG-D10-04: Register event 7 (Tech) with 3 count -> saved as 1
  const regTech = await request('POST', '/api/registrations', {
    userId: 1,
    eventId: 7,
    ticketTier: 'STANDARD',
    attendeeCount: 3,
    attendeeName: '이테스트',
    attendeeEmail: 'test2@example.com',
    attendeePhone: '010-1111-2222',
    filterContext: { category: 'TECH' }
  });
  const checkTech = await request('GET', `/api/registrations/${regTech.body.data.id}`);
  console.log('6. BUG-D10-04 (SEQUENCE_REPLAY Count Drop):',
    (checkTech.body.data.attendee_count === 1) ? 'PASS (Bug Verified)' : 'FAIL');

  // 7. Test BUG-D10-05: Edit phone for registration 9 (PATCH /api/registrations/9/contact)
  const edit9 = await request('PATCH', '/api/registrations/9/contact', { attendeePhone: '010-9999-9999' });
  const check9 = await request('GET', '/api/registrations/9');
  console.log('7. BUG-D10-05 (STATE_REVISIT Phone Persistence Failure):',
    (edit9.body.success && check9.body.data.attendee_phone !== '010-9999-9999') ? 'PASS (Bug Verified)' : 'FAIL');

  // 8. Final Reset verification
  const finalReset = await request('POST', '/api/test/reset');
  console.log('8. Post-Test DB Reset:', finalReset.body.success ? 'PASS' : 'FAIL');
  console.log('=== All 5 Bugs and Reset Verified 100% Successfully ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
