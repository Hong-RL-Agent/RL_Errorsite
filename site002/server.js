import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9901;

app.use(express.json());

// Mock current active user in memory (defaults to userA)
let currentSessionUser = 'userA';

// Mock Patient accounts
const users = [
  { id: 'userA', name: 'Alice Jenkins', dob: '1988-11-23', healthId: 'H-928-1029', tier: 'Standard Care Plan' },
  { id: 'userB', name: 'Bob Sterling', dob: '1975-04-12', healthId: 'H-819-3324', tier: 'Premium Executive Care' }
];

// Mock Databases with owner fields
const medicalRecords = [
  { id: 'rec-101', owner: 'userA', diagnosis: 'Acute Rhinopharyngitis', severity: 'Mild', department: 'General Pediatrics & Family Medicine', provider: 'Dr. Sarah Connor', date: '2026-07-10' },
  { id: 'rec-102', owner: 'userA', diagnosis: 'Essential Hypertension Monitor', severity: 'Moderate', department: 'Cardiovascular Care Unit', provider: 'Dr. John Doe', date: '2026-07-22' },
  { id: 'rec-201', owner: 'userB', diagnosis: 'Type 2 Diabetes Mellitus Follow-up', severity: 'Chronic', department: 'Endocrinology Center', provider: 'Dr. Peter Parker', date: '2026-07-15' },
  { id: 'rec-202', owner: 'userB', diagnosis: 'Tension Headache Assessment', severity: 'Mild', department: 'Neurology Department', provider: 'Dr. Bruce Banner', date: '2026-07-18' }
];

const appointments = [
  { id: 'apt-101', owner: 'userA', purpose: 'Routine Blood Panel Check', dateTime: '2026-08-04 09:30 AM', department: 'Diagnostic Pathology', provider: 'Dr. Sarah Connor', status: 'Confirmed' },
  { id: 'apt-201', owner: 'userB', purpose: 'MRI Scan Consultation', dateTime: '2026-08-11 02:00 PM', department: 'Radiology Unit', provider: 'Dr. Peter Parker', status: 'Scheduled' }
];

const prescriptions = [
  { id: 'rx-101', owner: 'userA', medication: 'Amoxicillin 500mg', dosage: '1 tablet 3x daily', duration: '7 Days', instructions: 'Take with food, complete full course', date: '2026-07-10' },
  { id: 'rx-201', owner: 'userB', medication: 'Metformin 850mg', dosage: '1 tablet 2x daily', duration: '30 Days', instructions: 'Take during main meals', date: '2026-07-15' }
];

const labResults = [
  { id: 'lab-101', owner: 'userA', testName: 'Complete Blood Count (CBC)', status: 'Final Result', collectionDate: '2026-07-10', referenceRange: 'Normal', findings: 'All values within optimal physiologic range.' },
  { id: 'lab-201', owner: 'userB', testName: 'Hemoglobin A1c (HbA1c)', status: 'Final Result', collectionDate: '2026-07-15', referenceRange: 'Elevated (6.8%)', findings: 'Slight increase. Maintain dietary restrictions and medication regime.' }
];

const medicalImages = [
  { id: 'img-101', owner: 'userA', studyName: 'Chest X-ray PA View', modality: 'CR', bodyPart: 'Chest', date: '2026-07-10', findings: 'Clear lung fields, normal cardiothoracic ratio.' },
  { id: 'img-201', owner: 'userB', studyName: 'Brain MRI Contrast-Enhanced', modality: 'MR', bodyPart: 'Head', date: '2026-07-15', findings: 'No acute intracranial pathology noted. Consistent with normal aging.' }
];

const visitHistory = [
  { id: 'vst-101', owner: 'userA', visitType: 'Outpatient Clinic Consultation', checkIn: '2026-07-10 09:15 AM', checkOut: '2026-07-10 10:30 AM', billingAmount: '$45.00' },
  { id: 'vst-201', owner: 'userB', visitType: 'Specialist Diagnostics Suite', checkIn: '2026-07-15 01:45 PM', checkOut: '2026-07-15 04:00 PM', billingAmount: '$180.00' }
];

const insuranceClaims = [
  { id: 'clm-101', owner: 'userA', claimNumber: 'IC-990-2819', insurer: 'Apex Shield Health', status: 'Approved', amountFiled: '$45.00', dateFiled: '2026-07-12' },
  { id: 'clm-201', owner: 'userB', claimNumber: 'IC-880-9923', insurer: 'Vanguard Care Plus', status: 'Pending Review', amountFiled: '$180.00', dateFiled: '2026-07-16' }
];

const payments = [
  { id: 'pmt-101', owner: 'userA', receiptNumber: 'REC-229-3819', paymentMethod: 'Co-pay Card', amountPaid: '$45.00', datePaid: '2026-07-10', description: 'General Outpatient Visit Fee' },
  { id: 'pmt-201', owner: 'userB', receiptNumber: 'REC-771-4829', paymentMethod: 'Direct Debit', amountPaid: '$180.00', datePaid: '2026-07-15', description: 'Endocrinology Specialist Diagnostics' }
];

const healthDocuments = [
  { id: 'doc-101', owner: 'userA', title: 'Standard Immunization Record', category: 'Certificates', fileFormat: 'PDF', generatedDate: '2026-07-11' },
  { id: 'doc-201', owner: 'userB', title: 'Prior Authorization Request Approval', category: 'Legal & Insurance', fileFormat: 'PDF', generatedDate: '2026-07-16' }
];

const healthCheckups = [
  { id: 'chk-101', owner: 'userA', package: 'Annual Executive Health Screening', score: '92/100', status: 'Complete', recommendations: 'Maintain regular cardio exercises. Reduce sodium intake.' },
  { id: 'chk-201', owner: 'userB', package: 'Comprehensive Metabolic Profiling', score: '78/100', status: 'Review Required', recommendations: 'Follow up with endocrinologist. Reduce dietary sugars.' }
];

// Helper to get active user ID
const getSessionRole = () => currentSessionUser;

// Required API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'patient-portal-backend' });
});

// 2. GET /api/session/users
app.get('/api/session/users', (req, res) => {
  res.json(users);
});

// 3. POST /api/session/switch-user
app.post('/api/session/switch-user', (req, res) => {
  const { userId } = req.body;
  if (users.find(u => u.id === userId)) {
    currentSessionUser = userId;
    return res.status(200).json({ status: 'success', activeUser: currentSessionUser });
  }
  res.status(400).json({ error: 'Invalid user ID' });
});

// 4. GET /api/me/summary
app.get('/api/me/summary', (req, res) => {
  const activeUser = currentSessionUser;
  res.json({
    user: users.find(u => u.id === activeUser),
    appointmentsCount: appointments.filter(a => a.owner === activeUser).length,
    activeClaimsCount: insuranceClaims.filter(c => c.owner === activeUser).length,
    checkupsCompleted: healthCheckups.filter(c => c.owner === activeUser && c.status === 'Complete').length,
  });
});

// 5. GET /api/me/medical-records
app.get('/api/me/medical-records', (req, res) => {
  res.json(medicalRecords.filter(item => item.owner === currentSessionUser));
});

// 6. GET /api/me/appointments
app.get('/api/me/appointments', (req, res) => {
  res.json(appointments.filter(item => item.owner === currentSessionUser));
});

// 7. GET /api/me/prescriptions
app.get('/api/me/prescriptions', (req, res) => {
  res.json(prescriptions.filter(item => item.owner === currentSessionUser));
});

// 8. GET /api/me/lab-results
app.get('/api/me/lab-results', (req, res) => {
  res.json(labResults.filter(item => item.owner === currentSessionUser));
});

// 9. GET /api/me/medical-images
app.get('/api/me/medical-images', (req, res) => {
  res.json(medicalImages.filter(item => item.owner === currentSessionUser));
});

// 10. GET /api/me/visit-history
app.get('/api/me/visit-history', (req, res) => {
  res.json(visitHistory.filter(item => item.owner === currentSessionUser));
});

// 11. GET /api/me/insurance-claims
app.get('/api/me/insurance-claims', (req, res) => {
  res.json(insuranceClaims.filter(item => item.owner === currentSessionUser));
});

// 12. GET /api/me/payments
app.get('/api/me/payments', (req, res) => {
  res.json(payments.filter(item => item.owner === currentSessionUser));
});

// 13. GET /api/me/health-documents
app.get('/api/me/health-documents', (req, res) => {
  res.json(healthDocuments.filter(item => item.owner === currentSessionUser));
});

// 14. GET /api/me/health-checkup
app.get('/api/me/health-checkup', (req, res) => {
  res.json(healthCheckups.filter(item => item.owner === currentSessionUser));
});


// ==========================================
// VULNERABLE ENDPOINTS (INTENTIONAL BUGS)
// ==========================================

// 15. GET /api/medical-records/:recordId
// INTENTIONAL BACKEND BUG: site002-bug01
// CSV: SEC-010
// Type: IDOR
// Description: recordId 조회 시 현재 사용자와 record.owner를 비교하지 않아 userA가 userB의 진료기록을 조회할 수 있음.
app.get('/api/medical-records/:recordId', (req, res) => {
  const { recordId } = req.params;
  const record = medicalRecords.find(item => item.id === recordId);
  if (!record) {
    return res.status(404).json({ error: 'Medical record not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/medical-records/${recordId}`,
    status: 200,
    response_owner: record.owner,
    data: record
  });
});

// 16. GET /api/appointments/:appointmentId
// INTENTIONAL BACKEND BUG: site002-bug02
// CSV: SEC-011
// Type: IDOR
// Description: appointmentId 조회 시 현재 사용자와 appointment.owner를 비교하지 않아 userA가 userB의 예약을 조회할 수 있음.
app.get('/api/appointments/:appointmentId', (req, res) => {
  const { appointmentId } = req.params;
  const apt = appointments.find(item => item.id === appointmentId);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/appointments/${appointmentId}`,
    status: 200,
    response_owner: apt.owner,
    data: apt
  });
});

// 17. GET /api/prescriptions/:prescriptionId
// INTENTIONAL BACKEND BUG: site002-bug03
// CSV: SEC-012
// Type: IDOR
// Description: prescriptionId 조회 시 현재 사용자와 prescription.owner를 비교하지 않아 userA가 userB의 처방전을 조회할 수 있음.
app.get('/api/prescriptions/:prescriptionId', (req, res) => {
  const { prescriptionId } = req.params;
  const rx = prescriptions.find(item => item.id === prescriptionId);
  if (!rx) {
    return res.status(404).json({ error: 'Prescription not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/prescriptions/${prescriptionId}`,
    status: 200,
    response_owner: rx.owner,
    data: rx
  });
});

// 18. GET /api/lab-results/:labId
// INTENTIONAL BACKEND BUG: site002-bug04
// CSV: SEC-013
// Type: IDOR
// Description: labId 조회 시 현재 사용자와 labResult.owner를 비교하지 않아 userA가 userB의 검사결과를 조회할 수 있음.
app.get('/api/lab-results/:labId', (req, res) => {
  const { labId } = req.params;
  const lab = labResults.find(item => item.id === labId);
  if (!lab) {
    return res.status(404).json({ error: 'Laboratory record not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/lab-results/${labId}`,
    status: 200,
    response_owner: lab.owner,
    data: lab
  });
});

// 19. GET /api/medical-images/:imageId
// INTENTIONAL BACKEND BUG: site002-bug05
// CSV: SEC-014
// Type: IDOR
// Description: imageId 조회 시 현재 사용자와 medicalImage.owner를 비교하지 않아 userA가 userB의 의료영상 메타데이터를 조회할 수 있음.
app.get('/api/medical-images/:imageId', (req, res) => {
  const { imageId } = req.params;
  const img = medicalImages.find(item => item.id === imageId);
  if (!img) {
    return res.status(404).json({ error: 'Medical study details not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/medical-images/${imageId}`,
    status: 200,
    response_owner: img.owner,
    data: img
  });
});

// 20. GET /api/visit-history/:visitId
// INTENTIONAL BACKEND BUG: site002-bug06
// CSV: SEC-015
// Type: IDOR
// Description: visitId 조회 시 현재 사용자와 visit.owner를 비교하지 않아 userA가 userB의 방문이력을 조회할 수 있음.
app.get('/api/visit-history/:visitId', (req, res) => {
  const { visitId } = req.params;
  const visit = visitHistory.find(item => item.id === visitId);
  if (!visit) {
    return res.status(404).json({ error: 'Clinic visit record not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/visit-history/${visitId}`,
    status: 200,
    response_owner: visit.owner,
    data: visit
  });
});

// 21. GET /api/insurance-claims/:claimId
// INTENTIONAL BACKEND BUG: site002-bug07
// CSV: SEC-016
// Type: IDOR
// Description: claimId 조회 시 현재 사용자와 claim.owner를 비교하지 않아 userA가 userB의 보험청구 상세를 조회할 수 있음.
app.get('/api/insurance-claims/:claimId', (req, res) => {
  const { claimId } = req.params;
  const claim = insuranceClaims.find(item => item.id === claimId);
  if (!claim) {
    return res.status(404).json({ error: 'Insurance claim not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/insurance-claims/${claimId}`,
    status: 200,
    response_owner: claim.owner,
    data: claim
  });
});

// 22. GET /api/payments/:paymentId
// INTENTIONAL BACKEND BUG: site002-bug08
// CSV: SEC-017
// Type: IDOR
// Description: paymentId 조회 시 현재 사용자와 payment.owner를 비교하지 않아 userA가 userB의 결제내역을 조회할 수 있음.
app.get('/api/payments/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  const pay = payments.find(item => item.id === paymentId);
  if (!pay) {
    return res.status(404).json({ error: 'Payment receipt not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/payments/${paymentId}`,
    status: 200,
    response_owner: pay.owner,
    data: pay
  });
});

// 23. GET /api/health-documents/:documentId
// INTENTIONAL BACKEND BUG: site002-bug09
// CSV: SEC-018
// Type: IDOR
// Description: documentId 조회 시 현재 사용자와 document.owner를 비교하지 않아 userA가 userB의 건강문서를 조회할 수 있음.
app.get('/api/health-documents/:documentId', (req, res) => {
  const { documentId } = req.params;
  const doc = healthDocuments.find(item => item.id === documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Health document metadata not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/health-documents/${documentId}`,
    status: 200,
    response_owner: doc.owner,
    data: doc
  });
});

// 24. GET /api/health-checkup/:checkupId
// INTENTIONAL BACKEND BUG: site002-bug10
// CSV: SEC-019
// Type: IDOR
// Description: checkupId 조회 시 현재 사용자와 checkup.owner를 비교하지 않아 userA가 userB의 건강검진 결과를 조회할 수 있음.
app.get('/api/health-checkup/:checkupId', (req, res) => {
  const { checkupId } = req.params;
  const chk = healthCheckups.find(item => item.id === checkupId);
  if (!chk) {
    return res.status(404).json({ error: 'Checkup assessment report not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/health-checkup/${checkupId}`,
    status: 200,
    response_owner: chk.owner,
    data: chk
  });
});


// ==========================================
// SAFE REFERENCE ENDPOINTS (OWNER CHECKED)
// ==========================================

// 25. GET /api/safe/medical-records/:recordId
app.get('/api/safe/medical-records/:recordId', (req, res) => {
  const { recordId } = req.params;
  const record = medicalRecords.find(item => item.id === recordId);
  if (!record) {
    return res.status(404).json({ error: 'Medical record not found' });
  }
  if (record.owner !== currentSessionUser) {
    return res.status(403).json({ error: 'Access denied: client does not own this health resource' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/safe/medical-records/${recordId}`,
    status: 200,
    response_owner: record.owner,
    data: record
  });
});

// 26. GET /api/safe/appointments/:appointmentId
app.get('/api/safe/appointments/:appointmentId', (req, res) => {
  const { appointmentId } = req.params;
  const apt = appointments.find(item => item.id === appointmentId);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  if (apt.owner !== currentSessionUser) {
    return res.status(403).json({ error: 'Access denied: client does not own this appointment resource' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/safe/appointments/${appointmentId}`,
    status: 200,
    response_owner: apt.owner,
    data: apt
  });
});

// Serve frontend production build files
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback routing to index.html for React Single Page App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
