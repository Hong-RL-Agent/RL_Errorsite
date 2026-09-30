// verify-api.js for site055 (CulturePick)
import http from 'http';

const PORT = 9954;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 Starting CulturePick (site055) Automated Verification');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await makeRequest('/api/health');
    assert(
      health.status === 200 &&
      health.data.status === 'ok' &&
      health.data.service === 'CulturePick' &&
      health.data.site === 'site055',
      'GET /api/health returns correct status, service, and site055'
    );

    // 2. Events List (40+ items)
    const eventsRes = await makeRequest('/api/events');
    assert(
      eventsRes.status === 200 &&
      Array.isArray(eventsRes.data.events) &&
      eventsRes.data.events.length >= 40,
      `GET /api/events returns 40+ events (count: ${eventsRes.data?.events?.length})`
    );

    // 3. Event Detail
    const eventDetailRes = await makeRequest('/api/events/evt-101');
    assert(
      eventDetailRes.status === 200 &&
      eventDetailRes.data.event &&
      eventDetailRes.data.event.id === 'evt-101',
      'GET /api/events/evt-101 returns correct event details'
    );

    // 4. Venues List (15+ items)
    const venuesRes = await makeRequest('/api/venues');
    assert(
      venuesRes.status === 200 &&
      Array.isArray(venuesRes.data.venues) &&
      venuesRes.data.venues.length >= 15,
      `GET /api/venues returns 15+ venues (count: ${venuesRes.data?.venues?.length})`
    );

    // 5. Schedules List
    const schedulesRes = await makeRequest('/api/events/evt-101/schedules');
    assert(
      schedulesRes.status === 200 &&
      Array.isArray(schedulesRes.data.schedules) &&
      schedulesRes.data.schedules.length > 0,
      `GET /api/events/evt-101/schedules returns schedules (count: ${schedulesRes.data?.schedules?.length})`
    );

    const firstScheduleId = schedulesRes.data?.schedules[0]?.id || 'sch-101-1';

    // 6. Schedule Seats
    const seatsRes = await makeRequest(`/api/schedules/${firstScheduleId}/seats`);
    assert(
      seatsRes.status === 200 &&
      Array.isArray(seatsRes.data.seats) &&
      seatsRes.data.seats.length >= 20,
      `GET /api/schedules/${firstScheduleId}/seats returns 20+ seats (count: ${seatsRes.data?.seats?.length})`
    );

    // 7. SEC-451: Seat Identifier Coercion
    const seatSelectRes = await makeRequest(`/api/schedules/${firstScheduleId}/seats/select`, {
      method: 'POST',
      body: { seatId: 'A1' }
    });
    const sec451Triggered = seatSelectRes.headers['x-bug-triggered'] === 'SEC-451' ||
      (seatSelectRes.data && (seatSelectRes.data._bug?.id === 'SEC-451' || seatSelectRes.data.success));
    assert(
      sec451Triggered,
      'POST /api/schedules/:id/seats/select triggers SEC-451 identifier coercion check'
    );

    // 8. SEC-453: Whitespace Only Review Validation Error
    const whitespaceReviewRes = await makeRequest('/api/events/evt-101/reviews', {
      method: 'POST',
      body: {
        nickname: '공백테스터',
        rating: 5,
        content: '     '
      }
    });
    const sec453Triggered = whitespaceReviewRes.status === 201 &&
      (whitespaceReviewRes.headers['x-bug-triggered'] === 'SEC-453' || whitespaceReviewRes.data?._bug?.id === 'SEC-453');
    assert(
      sec453Triggered,
      'POST /api/events/evt-101/reviews accepts whitespace string and triggers SEC-453'
    );

    // 9. Recommendations
    const recRes = await makeRequest('/api/recommendations');
    assert(
      recRes.status === 200 &&
      Array.isArray(recRes.data.hotEvents) &&
      Array.isArray(recRes.data.featuredVenues),
      'GET /api/recommendations returns hotEvents and featuredVenues'
    );

    // 10. MyPage
    const myPageRes = await makeRequest('/api/mypage');
    assert(
      myPageRes.status === 200 &&
      myPageRes.data.user &&
      Array.isArray(myPageRes.data.recentBookings),
      'GET /api/mypage returns user profile and recent bookings'
    );

  } catch (err) {
    console.error('Verification encountered an unexpected error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification();
