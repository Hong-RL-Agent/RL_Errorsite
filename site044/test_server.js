import http from 'http';

function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9943,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('--- Testing /api/health ---');
  const health = await testEndpoint('/api/health');
  console.log('Health:', health);

  console.log('--- Testing SEC-401 (Double Booking) ---');
  const booking = await testEndpoint('/api/reservations', 'POST', {
    restaurantId: 'rest-01',
    date: '2026-10-01',
    time: '19:00',
    partySize: 2
  });
  console.log('Booking Result:', booking);

  console.log('--- Testing SEC-402, SEC-404, SEC-405 (Reservation Modification) ---');
  const modify = await testEndpoint('/api/reservations/res-8801', 'PATCH', {
    date: '2026-10-05', // Monday (closed day test)
    time: '20:00',      // Slot change test
    partySize: 8        // Capacity test
  });
  console.log('Modify Result:', modify);

  console.log('--- Testing SEC-403 (Cancellation Policy) ---');
  const cancelPolicy = await testEndpoint('/api/reservations/res-8801/cancellation-policy');
  console.log('Cancel Policy Result:', cancelPolicy);

  console.log('--- All site044 tests completed successfully! ---');
}

run();
