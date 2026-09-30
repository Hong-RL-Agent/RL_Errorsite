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
  console.log('--- TESTING SITE054 (BookNest) ---');

  // 1. Health check
  const healthRes = await request({
    hostname: 'localhost',
    port: 9953,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health Check:', healthRes.statusCode, healthRes.body);

  // 2. Categories
  const catRes = await request({
    hostname: 'localhost',
    port: 9953,
    path: '/api/categories',
    method: 'GET'
  });
  console.log('2. Categories:', catRes.statusCode, 'Count:', JSON.parse(catRes.body).categories?.length);

  // 3. Books
  const booksRes = await request({
    hostname: 'localhost',
    port: 9953,
    path: '/api/books',
    method: 'GET'
  });
  console.log('3. Books:', booksRes.statusCode, 'Count:', JSON.parse(booksRes.body).books?.length);

  // 4. SEC-446: Loan extend beyond max (2/2)
  const bug446 = await request({
    hostname: 'localhost',
    port: 9953,
    path: '/api/loans/loan-01/extend',
    method: 'POST'
  });
  const bug446Data = JSON.parse(bug446.body);
  console.log('4. SEC-446:', 'Extension count:', bug446Data.loan?.extensionCount, 'BugID:', bug446.headers['x-bug-triggered']);

  // 5. SEC-447: Review rating 0 coerced to 5
  const bug447 = await request({
    hostname: 'localhost',
    port: 9953,
    path: '/api/books/b-101/reviews',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({
    rating: 0,
    content: '0점 테스트 리뷰입니다.'
  }));
  const bug447Data = JSON.parse(bug447.body);
  console.log('5. SEC-447:', 'Saved rating:', bug447Data.review?.rating, 'BugID:', bug447.headers['x-bug-triggered']);

  // 6. SEC-448: E-book page out-of-bounds (81 / 80)
  const bug448 = await request({
    hostname: 'localhost',
    port: 9953,
    path: '/api/ebooks/b-101/pages/81',
    method: 'GET'
  });
  const bug448Data = JSON.parse(bug448.body);
  console.log('6. SEC-448:', 'Page:', bug448Data.currentPage, 'Total:', bug448Data.totalPages, 'BugID:', bug448.headers['x-bug-triggered']);

  // 7. SEC-450: Search clear retention
  const search1 = await request({
    hostname: 'localhost',
    port: 9953,
    path: '/api/books?search=React',
    method: 'GET'
  });
  const search1Count = JSON.parse(search1.body).books?.length;

  const bug450 = await request({
    hostname: 'localhost',
    port: 9953,
    path: '/api/books?search=',
    method: 'GET'
  });
  const bug450Data = JSON.parse(bug450.body);
  console.log('7. SEC-450:', 'Search1 Count:', search1Count, 'Empty Search Count:', bug450Data.books?.length, 'BugID:', bug450.headers['x-bug-triggered']);

  console.log('--- ALL TESTS FINISHED ---');
}

runTests().catch(err => {
  console.error('Test error:', err);
});
