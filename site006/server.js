import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9905;

app.use(express.json());

// Mock session user states (defaults to regular developer)
let currentSessionUser = 'user'; // 'admin' or 'user' (developer)

const users = [
  { id: 'user', name: '최준호 연구원 (Developer)', role: 'user', workspace: 'AI Research Lab A' },
  { id: 'admin', name: '박민지 센터장 (Admin)', role: 'admin', workspace: 'Global Enterprise DevOps' }
];

// Mock Datasets (Developer personal vs Secured administrative datasets)

// Developer personal data
const devImports = [
  { id: 'imp-101', source: 'Local JSON Schema', recordsCount: 15, date: '2026-07-28', status: 'Success' },
  { id: 'imp-102', source: 'HuggingFace dataset API', recordsCount: 1500, date: '2026-07-29', status: 'Success' }
];
const devDocuments = [
  { id: 'doc-101', title: 'NLP Pipeline Specification.md', size: '15 KB', location: '/workspace/docs/nlp' }
];
const devTeams = [
  { id: 'team-101', name: 'AI NLP Core Team', members: 4, leader: '최준호 연구원' }
];
const devRoles = [
  { id: 'role-101', name: 'Workflow Developer', permissionsCount: 8, scope: 'Project Edit' }
];
const devAuditLogs = [
  { id: 'log-101', actor: 'user', action: 'Create Node: GPT-4o LLM', timestamp: '2026-07-29 10:15', ip: '192.168.10.12' }
];
const devSubscriptions = [
  { id: 'sub-101', plan: 'AI Developer Tier', cost: '$49 / mo', state: 'Active' }
];
const devDevices = [
  { id: 'dev-101', name: 'Developer Desktop (Ubuntu 24.04)', os: 'Linux', lastAccess: '2026-07-29' }
];
const devApiKeys = [
  { id: 'key-101', label: 'Local Testing Key', mask: 'sk-proj-test...82a', created: '2026-07-10' }
];
const devWebhooks = [
  { id: 'wh-101', trigger: 'onWorkflowComplete', url: 'https://api.internal.com/callback', status: 'Active' }
];
const devJobs = [
  { id: 'job-101', taskName: 'Cron Daily Summary Model Training', executor: 'Worker node 3', executionTime: '15.2s', status: 'Success' }
];

// Admin datasets (Global Infrastructure Operations)
const adminImports = [
  { id: 'adm-imp-901', source: 'En-KR Parallel Corpus Raw Data', recordsCount: 850000, date: '2026-07-20', status: 'Success' },
  { id: 'adm-imp-902', source: 'Global customer CRM logs', recordsCount: 12000000, date: '2026-07-25', status: 'Processing' }
];
const adminDocuments = [
  { id: 'adm-doc-901', title: 'LLM Cluster API Keys & Admin Credentials.pdf', size: '1.8 MB', location: '/admin/secrets/credentials' }
];
const adminTeams = [
  { id: 'adm-team-901', name: 'Global Infrastructure DevOps Board', members: 12, leader: '박민지 센터장' }
];
const adminRoles = [
  { id: 'adm-role-901', name: 'Global Super Administrator', permissionsCount: 154, scope: 'Global Infrastructure Bypass' }
];
const adminAuditLogs = [
  { id: 'adm-log-901', actor: 'admin', action: 'API Key Revoke (Global OpenAI Platform)', timestamp: '2026-07-29 09:12', ip: '10.0.0.1' }
];
const adminSubscriptions = [
  { id: 'adm-sub-901', plan: 'Enterprise Unlimited GPU Cluster', cost: '$12,500 / mo', state: 'Active' }
];
const adminDevices = [
  { id: 'adm-dev-901', name: 'GPU Cluster Master Node (Rocky Linux 9)', os: 'Linux Server', lastAccess: '2026-07-29' }
];
const adminApiKeys = [
  { id: 'adm-key-901', label: 'Production Global OpenAI Gateway Key', mask: 'sk-proj-prod...99a', created: '2026-07-01' }
];
const adminWebhooks = [
  { id: 'adm-wh-901', trigger: 'onClusterFailureAlert', url: 'https://slack.com/services/hooks/admin-critical', status: 'Active' }
];
const adminJobs = [
  { id: 'adm-job-901', taskName: 'Cluster Backup & Vector Sync (Milvus)', executor: 'GPU Master node', executionTime: '124.8s', status: 'Success' }
];

// Helpers
const getSessionRole = () => currentSessionUser;

// Required API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ai-workflow-backend' });
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
  res.status(400).json({ error: '유효하지 않은 사용자 ID입니다.' });
});

// 4. GET /api/me/summary
app.get('/api/me/summary', (req, res) => {
  const activeUser = currentSessionUser;
  const userDetails = users.find(u => u.id === activeUser);
  res.json({
    user: userDetails,
    importsCount: activeUser === 'admin' ? adminImports.length : devImports.length,
    documentsCount: activeUser === 'admin' ? adminDocuments.length : devDocuments.length,
    jobsCount: activeUser === 'admin' ? adminJobs.length : devJobs.length
  });
});

// User self APIs
app.get('/api/me/imports', (req, res) => { res.json(currentSessionUser === 'admin' ? adminImports : devImports); });
app.get('/api/me/documents', (req, res) => { res.json(currentSessionUser === 'admin' ? adminDocuments : devDocuments); });
app.get('/api/me/teams', (req, res) => { res.json(currentSessionUser === 'admin' ? adminTeams : devTeams); });
app.get('/api/me/roles', (req, res) => { res.json(currentSessionUser === 'admin' ? adminRoles : devRoles); });
app.get('/api/me/audit-logs', (req, res) => { res.json(currentSessionUser === 'admin' ? adminAuditLogs : devAuditLogs); });
app.get('/api/me/subscriptions', (req, res) => { res.json(currentSessionUser === 'admin' ? adminSubscriptions : devSubscriptions); });
app.get('/api/me/devices', (req, res) => { res.json(currentSessionUser === 'admin' ? adminDevices : devDevices); });
app.get('/api/me/api-keys', (req, res) => { res.json(currentSessionUser === 'admin' ? adminApiKeys : devApiKeys); });
app.get('/api/me/webhooks', (req, res) => { res.json(currentSessionUser === 'admin' ? adminWebhooks : devWebhooks); });
app.get('/api/me/jobs', (req, res) => { res.json(currentSessionUser === 'admin' ? adminJobs : devJobs); });


// ==========================================
// VULNERABLE ADMIN ENDPOINTS (INTENTIONAL BUGS)
// ==========================================

// 15. GET /api/admin/imports
// INTENTIONAL BACKEND BUG: site006-bug01
// CSV: SEC-051
// Type: Vertical Privilege Escalation
// Description: 관리자 Imports API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 Import 데이터를 조회할 수 있음.
app.get('/api/admin/imports', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/admin/imports',
    status: 200,
    response_fields: adminImports
  });
});

// 16. GET /api/admin/documents
// INTENTIONAL BACKEND BUG: site006-bug02
// CSV: SEC-052
// Type: Vertical Privilege Escalation
// Description: 관리자 Documents API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 Documents 데이터를 조회할 수 있음.
app.get('/api/admin/documents', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/admin/documents',
    status: 200,
    response_fields: adminDocuments
  });
});

// 17. GET /api/admin/teams
// INTENTIONAL BACKEND BUG: site006-bug03
// CSV: SEC-053
// Type: Vertical Privilege Escalation
// Description: 관리자 Teams API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 Team 데이터를 조회할 수 있음.
app.get('/api/admin/teams', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/admin/teams',
    status: 200,
    response_fields: adminTeams
  });
});

// 18. GET /api/admin/roles
// INTENTIONAL BACKEND BUG: site006-bug04
// CSV: SEC-054
// Type: Vertical Privilege Escalation
// Description: 관리자 Roles API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 Role 데이터를 조회할 수 있음.
app.get('/api/admin/roles', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/admin/roles',
    status: 200,
    response_fields: adminRoles
  });
});

// 19. GET /api/admin/audit-logs
// INTENTIONAL BACKEND BUG: site006-bug05
// CSV: SEC-055
// Type: Vertical Privilege Escalation
// Description: 관리자 Audit Logs API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 Audit Log 데이터를 조회할 수 있음.
app.get('/api/admin/audit-logs', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/admin/audit-logs',
    status: 200,
    response_fields: adminAuditLogs
  });
});

// 20. GET /api/admin/subscriptions
// INTENTIONAL BACKEND BUG: site006-bug06
// CSV: SEC-056
// Type: Vertical Privilege Escalation
// Description: 관리자 Subscriptions API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 Subscription 데이터를 조회할 수 있음.
app.get('/api/admin/subscriptions', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/admin/subscriptions',
    status: 200,
    response_fields: adminSubscriptions
  });
});

// 21. GET /api/admin/devices
// INTENTIONAL BACKEND BUG: site006-bug07
// CSV: SEC-057
// Type: Vertical Privilege Escalation
// Description: 관리자 Devices API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 Device 데이터를 조회할 수 있음.
app.get('/api/admin/devices', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/admin/devices',
    status: 200,
    response_fields: adminDevices
  });
});

// 22. GET /api/admin/api-keys
// INTENTIONAL BACKEND BUG: site006-bug08
// CSV: SEC-058
// Type: Vertical Privilege Escalation
// Description: 관리자 API Keys API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 API Key 메타데이터를 조회할 수 있음.
app.get('/api/admin/api-keys', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/admin/api-keys',
    status: 200,
    response_fields: adminApiKeys
  });
});

// 23. GET /api/admin/webhooks
// INTENTIONAL BACKEND BUG: site006-bug09
// CSV: SEC-059
// Type: Vertical Privilege Escalation
// Description: 관리자 Webhooks API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 Webhook 데이터를 조회할 수 있음.
app.get('/api/admin/webhooks', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/admin/webhooks',
    status: 200,
    response_fields: adminWebhooks
  });
});

// 24. GET /api/admin/jobs
// INTENTIONAL BACKEND BUG: site006-bug10
// CSV: SEC-060
// Type: Vertical Privilege Escalation
// Description: 관리자 Jobs API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 Job 실행 데이터를 조회할 수 있음.
app.get('/api/admin/jobs', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/admin/jobs',
    status: 200,
    response_fields: adminJobs
  });
});


// ==========================================
// SAFE REFERENCE ADMIN ENDPOINTS (ROLE CHECKED)
// ==========================================

// 25. GET /api/safe/admin/imports
app.get('/api/safe/admin/imports', (req, res) => {
  if (currentSessionUser !== 'admin') {
    return res.status(403).json({ error: '액세스 거부: 관리자 권한이 부족합니다.' });
  }
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/safe/admin/imports',
    status: 200,
    response_fields: adminImports
  });
});

// 26. GET /api/safe/admin/documents
app.get('/api/safe/admin/documents', (req, res) => {
  if (currentSessionUser !== 'admin') {
    return res.status(403).json({ error: '액세스 거부: 관리자 권한이 부족합니다.' });
  }
  res.status(200).json({
    role: getSessionRole(),
    endpoint: '/api/safe/admin/documents',
    status: 200,
    response_fields: adminDocuments
  });
});

// Serve frontend build static files
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback routing for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
