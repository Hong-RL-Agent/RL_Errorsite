// test-vuln.js - Automated Verification for SEC-341 to SEC-350 on site032 (Port 9931)
const PORT = 9931;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('🧪 Starting Idempotency Vulnerability Tests for site032 (Port 9931)...\n');
  let passed = 0;

  const tests = [
    {
      id: 'SEC-341',
      name: 'Login Idempotency Missing (transactionId)',
      path: '/api/auth/login',
      method: 'POST',
      key: 'idem-login-test-101',
      body: { email: 'elena.rostova@nexura-lab.io', password: 'password123' },
      idField: (data) => data.transactionId
    },
    {
      id: 'SEC-342',
      name: 'Register Idempotency Missing (registrationId)',
      path: '/api/auth/register',
      method: 'POST',
      key: 'idem-reg-test-102',
      body: { name: 'Dr. Test User', email: 'test.user@nexura-lab.io', password: 'password123', department: 'Bioinformatics' },
      idField: (data) => data.registrationId
    },
    {
      id: 'SEC-343',
      name: 'Researcher Address Idempotency Missing (addressId)',
      path: '/api/researcher/address',
      method: 'POST',
      key: 'idem-addr-test-103',
      body: { researcherId: 'res-001', addressLine1: 'Lab Block A-402, Science Park 77', city: 'Bio City', postalCode: '04321', buildingType: 'Main Bio Lab' },
      idField: (data) => data.addressId
    },
    {
      id: 'SEC-344',
      name: 'Project Creation Idempotency Missing (projectId)',
      path: '/api/projects',
      method: 'POST',
      key: 'idem-proj-test-104',
      body: { name: 'CRISPR Target Gene Mapping', description: 'Idempotency test project', principalInvestigator: 'Dr. Elena Rostova', expectedEndDate: '2027-01-01' },
      idField: (data) => data.projectId
    },
    {
      id: 'SEC-345',
      name: 'Experiment Registration Idempotency Missing (experimentId)',
      path: '/api/experiments',
      method: 'POST',
      key: 'idem-exp-test-105',
      body: { projectId: 'proj-001', name: 'Primer Binding Kinetic Assay', researcherId: 'res-001', equipmentId: 'eq-001', scheduledAt: '2026-10-15T09:00:00' },
      idField: (data) => data.experimentId
    },
    {
      id: 'SEC-346',
      name: 'Equipment Reservation Idempotency Missing (reservationId)',
      path: '/api/equipment/reservations',
      method: 'POST',
      key: 'idem-res-test-106',
      body: { equipmentId: 'eq-001', researcherId: 'res-001', date: '2026-10-20', startTime: '13:00', endTime: '15:00', purpose: 'Assay cycle run' },
      idField: (data) => data.reservationId
    },
    {
      id: 'SEC-347',
      name: 'Reagent Receipt Idempotency Missing (receiptId)',
      path: '/api/reagents/receipts',
      method: 'POST',
      key: 'idem-reagent-test-107',
      body: { reagentId: 'reag-001', quantity: 20, batchNumber: 'LOT-TEST-99', storageCondition: '4°C Cold Storage', notes: 'Test receipt entry' },
      idField: (data) => data.receiptId
    },
    {
      id: 'SEC-348',
      name: 'Sample Registration Idempotency Missing (sampleId)',
      path: '/api/samples',
      method: 'POST',
      key: 'idem-sample-test-108',
      body: { projectId: 'proj-001', name: 'HeLa Cell Lysate #88', sampleType: 'Cell Lysate', storageLocation: 'Freezer -80°C (Rack 2)', researcherId: 'res-001' },
      idField: (data) => data.sampleId
    },
    {
      id: 'SEC-349',
      name: 'Lab Note Idempotency Missing (noteId)',
      path: '/api/lab-notes',
      method: 'POST',
      key: 'idem-note-test-109',
      body: { projectId: 'proj-001', title: 'Observation on SDS-PAGE Mobility', content: 'Observed clean separation of target protein.', authorId: 'res-001' },
      idField: (data) => data.noteId
    },
    {
      id: 'SEC-350',
      name: 'Experiment Result Idempotency Missing (resultId)',
      path: '/api/experiment-results',
      method: 'POST',
      key: 'idem-result-test-110',
      body: { experimentId: 'exp-001', title: 'Optical Density Readout', resultType: 'Quantitative', value: '1.482', unit: 'OD600', interpretation: 'Normal growth curve match' },
      idField: (data) => data.resultId
    }
  ];

  for (const t of tests) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Idempotency-Key': t.key
      };

      const res1 = await fetch(`${BASE_URL}${t.path}`, {
        method: t.method,
        headers,
        body: JSON.stringify(t.body)
      });
      const data1 = await res1.json();

      const res2 = await fetch(`${BASE_URL}${t.path}`, {
        method: t.method,
        headers,
        body: JSON.stringify(t.body)
      });
      const data2 = await res2.json();

      const id1 = t.idField(data1.data || data1);
      const id2 = t.idField(data2.data || data2);

      if (id1 && id2 && id1 !== id2) {
        console.log(`✅ [${t.id}] ${t.name} -> PASSED`);
        console.log(`   1st ID: ${id1} | 2nd ID: ${id2} (Distinct duplicate records created)\n`);
        passed++;
      } else {
        console.log(`❌ [${t.id}] ${t.name} -> FAILED`);
        console.log(`   1st Res:`, data1);
        console.log(`   2nd Res:`, data2, '\n');
      }
    } catch (err) {
      console.log(`❌ [${t.id}] ${t.name} -> ERROR:`, err.message, '\n');
    }
  }

  console.log(`========================================`);
  console.log(`🎉 Test Results: ${passed} / ${tests.length} vulnerabilities verified!`);
  console.log(`========================================\n`);
}

runTests();
