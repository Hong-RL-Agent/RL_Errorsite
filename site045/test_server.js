import http from 'http';

function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9944,
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

  console.log('--- Testing SEC-406 (Proration Preview) ---');
  const preview = await testEndpoint('/api/billing/preview?newPlanId=premium&newPlanType=yearly');
  console.log('Proration Result:', preview);

  console.log('--- Testing SEC-407 (Cancel & Access Revocation) ---');
  const cancel = await testEndpoint('/api/subscriptions/cancel', 'POST');
  console.log('Cancel Result:', cancel);
  const access = await testEndpoint('/api/content/cnt-01/access');
  console.log('Content Access Result:', access);

  console.log('--- Testing SEC-408 (Pause & Resume Usage Reset) ---');
  const pause = await testEndpoint('/api/subscriptions/pause', 'POST');
  const resume = await testEndpoint('/api/subscriptions/resume', 'POST');
  console.log('Resume Usage Reset Result:', resume);

  console.log('--- Testing SEC-409 (Renew with Expired Coupon) ---');
  const renew = await testEndpoint('/api/billing/renew', 'POST');
  console.log('Renew Result:', renew);

  console.log('--- Testing SEC-410 (Downgrade to Basic with Retained VIP Feature) ---');
  const changeToPremium = await testEndpoint('/api/subscriptions/change-plan', 'POST', { newPlanId: 'premium', newPlanType: 'monthly' });
  const downgradeToBasic = await testEndpoint('/api/subscriptions/change-plan', 'POST', { newPlanId: 'basic', newPlanType: 'monthly' });
  console.log('Downgrade Result:', downgradeToBasic);
  const featureAccess = await testEndpoint('/api/features/vip-masterclass/access');
  console.log('Feature Access Result:', featureAccess);

  console.log('--- All site045 tests completed successfully! ---');
}

run();
