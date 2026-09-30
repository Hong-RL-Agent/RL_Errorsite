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
  console.log('--- TESTING SITE053 (NearBuy) ---');

  // 1. Health check
  const healthRes = await request({
    hostname: 'localhost',
    port: 9952,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health Check:', healthRes.statusCode, healthRes.body);

  // 2. Categories
  const catRes = await request({
    hostname: 'localhost',
    port: 9952,
    path: '/api/categories',
    method: 'GET'
  });
  console.log('2. Categories:', catRes.statusCode, 'Count:', JSON.parse(catRes.body).categories?.length);

  // 3. Products
  const prodRes = await request({
    hostname: 'localhost',
    port: 9952,
    path: '/api/products',
    method: 'GET'
  });
  console.log('3. Products:', prodRes.statusCode, 'Count:', JSON.parse(prodRes.body).products?.length);

  // 4. Test SEC-441 (Leading zero price)
  const bug441 = await request({
    hostname: 'localhost',
    port: 9952,
    path: '/api/products',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({
    title: '테스트 상품 441',
    price: 50000,
    rawPriceInput: '050000',
    category: '디지털기기'
  }));
  const body441 = JSON.parse(bug441.body);
  console.log('4. SEC-441:', bug441.headers['x-bug-triggered'], 'Stored price:', body441.product?.price, 'BugID:', body441._bug?.id);

  // 5. Test SEC-442 (Multiline description)
  const bug442 = await request({
    hostname: 'localhost',
    port: 9952,
    path: '/api/products',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({
    title: '테스트 상품 442',
    price: 20000,
    description: '첫번째 줄\n두번째 줄\n세번째 줄',
    category: '가구'
  }));
  const body442 = JSON.parse(bug442.body);
  console.log('5. SEC-442:', bug442.headers['x-bug-triggered'], 'Has newline in DB:', body442.product?.description?.includes('\n'), 'BugID:', body442._bug?.id);

  // 6. Test SEC-443 (Image deletion index desync)
  const bug443 = await request({
    hostname: 'localhost',
    port: 9952,
    path: '/api/products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-image-index-desync': 'true'
    }
  }, JSON.stringify({
    title: '테스트 상품 443',
    price: 30000,
    category: '패션'
  }));
  const body443 = JSON.parse(bug443.body);
  console.log('6. SEC-443:', bug443.headers['x-bug-triggered'], 'BugID:', body443._bug?.id);

  // 7. Test SEC-444 (Report reason mismatch)
  const bug444 = await request({
    hostname: 'localhost',
    port: 9952,
    path: '/api/reports',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({
    productId: 'p-101',
    selectedReason: '사기 의심',
    rawSelectedReason: '사기 의심',
    details: '허위 매물 의심'
  }));
  const body444 = JSON.parse(bug444.body);
  console.log('7. SEC-444:', bug444.headers['x-bug-triggered'], 'Saved reason:', body444.report?.reason, 'BugID:', body444._bug?.id);

  // 8. Test SEC-445 (Navigation form preview desync)
  const bug445 = await request({
    hostname: 'localhost',
    port: 9952,
    path: '/api/products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-preview-desync': 'true'
    }
  }, JSON.stringify({
    title: '테스트 상품 445',
    price: 40000,
    previewMismatch: true
  }));
  const body445 = JSON.parse(bug445.body);
  console.log('8. SEC-445:', bug445.headers['x-bug-triggered'], 'BugID:', body445._bug?.id);

  console.log('--- ALL TESTS FINISHED ---');
}

runTests().catch(console.error);
