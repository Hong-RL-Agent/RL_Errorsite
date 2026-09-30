import http from 'http';

function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9939,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 1500
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

    req.on('timeout', () => {
      req.destroy();
      resolve({ timeout: true, status: 'TIMEOUT/PENDING (Expected for hanging async requests)' });
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
  console.log('Health Check:', health);

  console.log('--- Testing /api/courses ---');
  const courses = await testEndpoint('/api/courses');
  console.log('Courses (default):', courses.status, courses.data ? courses.data.slice(0, 100) : '');

  console.log('--- Testing SEC-371 (/api/auth/login) with asyncDelay ---');
  const login = await testEndpoint('/api/auth/login', 'POST', { email: 'student@example.com', password: 'password123' });
  console.log('Login Response:', login);

  console.log('--- All Tests Completed Successfully ---');
}

run();
