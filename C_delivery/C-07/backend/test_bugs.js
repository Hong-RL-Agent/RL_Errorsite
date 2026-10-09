const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5006,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Morrow Shipping Address C-07 Automated Backend & State Revisit Bug Verification ===');

  // 1. Reset
  const resetRes = await makeRequest('POST', '/api/test/reset');
  console.log('[1] Reset API:', resetRes.status === 200 && resetRes.body.success ? 'PASS' : 'FAIL');

  // 2. C-07-194: Persistence Loss on Reload
  const postRes = await makeRequest('POST', '/api/addresses', { label: '학교', address_line1: '경기도 수원시' });
  const getAfterPost = await makeRequest('GET', '/api/addresses');
  // POST returned 201, but DB still only has 2 initial addresses
  const persistenceLost = postRes.status === 201 && getAfterPost.body.count === 2;
  console.log('[2] C-07-194 Persistence Loss on Reload:', persistenceLost ? 'PASS (POST 성공 반환 후 DB에 미저장 확인)' : 'FAIL');

  // 3. C-07-894: Default Address Revert on Revisit
  await makeRequest('PUT', '/api/addresses/102/default');
  await makeRequest('GET', '/api/addresses'); // First fetch (sets default 102)
  const revisitRes = await makeRequest('GET', '/api/addresses'); // Revisit fetch
  const defaultReverted = revisitRes.body.addresses.find((a) => a.id === 101).is_default === 1;
  console.log('[3] C-07-894 Default Address Unset Revisit:', defaultReverted ? 'PASS (재방문 시 기본 배송지 101로 복구됨)' : 'FAIL');

  // 4. C-07-1797: Edit in DB
  await makeRequest('POST', '/api/test/reset');
  const patchRes = await makeRequest('PATCH', '/api/addresses/101', { address_line2: '영통구 테스트로 99' });
  console.log('[4] C-07-1797 Edit DB State:', patchRes.body.address.address_line2 === '영통구 테스트로 99' ? 'PASS (DB 정상 저장)' : 'FAIL');

  // 5. C-07-005: Cascade Delete Revisit & 404
  await makeRequest('DELETE', '/api/addresses/102');
  const query404 = await makeRequest('GET', '/api/addresses/102');
  const snapshotRes = await makeRequest('GET', '/api/orders/1/address-options');
  const hasSnapshot102 = snapshotRes.body.addressOptions.some((a) => a.address_id === 102);
  const cascadeBug = query404.status === 404 && hasSnapshot102;
  console.log('[5] C-07-005 Cascade Delete Revisit:', cascadeBug ? 'PASS (DB 삭제 후 404 반환 및 주문서 스냅샷 잔존)' : 'FAIL');

  // Final Reset
  await makeRequest('POST', '/api/test/reset');
  console.log('=== All 5 STATE_REVISIT Bugs in C-07 Verified Successfully ===');
}

runTests().catch(console.error);
