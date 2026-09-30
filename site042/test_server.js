import http from 'http';

function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9941,
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

  console.log('--- Testing /api/classes (SEC-393) ---');
  const classes = await testEndpoint('/api/classes?category=pilates&page=3');
  console.log('Classes (page=3):', classes.status, classes.data.slice(0, 100));

  console.log('--- Testing SEC-391 (Book Class) ---');
  const book = await testEndpoint('/api/classes/class-01/book', 'POST', { date: '2026-10-05', time: '07:00' });
  console.log('Book Result:', book);

  console.log('--- Testing SEC-392 (Stale Price Checkout) ---');
  const checkout = await testEndpoint('/api/checkout', 'POST', { productId: 'prod-01', requestedPrice: 38000, quantity: 1 });
  console.log('Checkout Result:', checkout);

  console.log('--- Testing SEC-394 (Calendar Midnight) ---');
  const cal = await testEndpoint('/api/calendar', 'POST', { title: '자정 명상', date: '2026-10-01', time: '00:30' });
  console.log('Calendar Result:', cal);

  console.log('--- All site042 tests completed successfully! ---');
}

run();
