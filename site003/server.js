import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9902;

app.use(express.json());

// Mock session user
let currentSessionUser = 'userA';

const users = [
  { id: 'userA', name: 'Alice Jenkins', org: 'Alpha Corp', tier: 'Professional' },
  { id: 'userB', name: 'Bob Sterling', org: 'Beta Industries', tier: 'Enterprise Plus' }
];

// Mock Datasets with owner field
const exportsList = [
  { id: 'exp-101', owner: 'userA', format: 'CSV', status: 'Completed', recordsCount: 250, date: '2026-07-28' },
  { id: 'exp-201', owner: 'userB', format: 'JSON', status: 'Pending', recordsCount: 1420, date: '2026-07-29' }
];

const importsList = [
  { id: 'imp-101', owner: 'userA', filename: 'users_import.csv', status: 'Success', processedCount: 105, date: '2026-07-25' },
  { id: 'imp-201', owner: 'userB', filename: 'inventory_list.xlsx', status: 'Failed', processedCount: 0, date: '2026-07-27' }
];

const documents = [
  { id: 'doc-101', owner: 'userA', title: 'Q3 Development Blueprint', visibility: 'Workspace Internal', lastModified: '2026-07-29 14:00' },
  { id: 'doc-201', owner: 'userB', title: 'Financial Forecast Excel Sheet', visibility: 'Restricted Confidential', lastModified: '2026-07-28 11:30' }
];

const teams = [
  { id: 'tem-101', owner: 'userA', name: 'Engineering Core Group', memberCount: 14, channelLinked: '#dev-channel' },
  { id: 'tem-201', owner: 'userB', name: 'Corporate Sales EMEA', memberCount: 38, channelLinked: '#sales-emea' }
];

const roles = [
  { id: 'rol-101', owner: 'userA', name: 'Billing Clerk Coordinator', permissionsCount: 12, scope: 'Billing, Analytics' },
  { id: 'rol-201', owner: 'userB', name: 'Superadmin Workspace Owner', permissionsCount: 94, scope: 'Global System Control' }
];

const auditLogs = [
  { id: 'log-101', owner: 'userA', actor: 'alice@alphacorp.com', action: 'API Token Rotated', ipAddress: '192.168.1.104', timestamp: '2026-07-29 13:00' },
  { id: 'log-201', owner: 'userB', actor: 'bob@betaind.com', action: 'Admin Privileges Escalated', ipAddress: '10.0.12.89', timestamp: '2026-07-29 11:45' }
];

const subscriptions = [
  { id: 'sub-101', owner: 'userA', planName: 'Workspace Pro Monthly', status: 'Active', billingCycle: 'Monthly', cost: '$49.00/mo' },
  { id: 'sub-201', owner: 'userB', planName: 'Enterprise Custom Dedicated', status: 'Active', billingCycle: 'Annual', cost: '$1,200.00/yr' }
];

const devices = [
  { id: 'dev-101', owner: 'userA', deviceName: 'MacBook Pro 16" (Alice)', osVersion: 'macOS Sonoma 14.2', location: 'Seattle, WA' },
  { id: 'dev-201', owner: 'userB', deviceName: 'ThinkPad X1 Carbon (Bob)', osVersion: 'Windows 11 Enterprise', location: 'New York, NY' }
];

const apiKeys = [
  { id: 'key-101', owner: 'userA', label: 'Development Webhook Token', algorithm: 'HS256', createdBy: 'alice@alphacorp.com', expiry: 'Never' },
  { id: 'key-201', owner: 'userB', label: 'Production ERP Bridge Key', algorithm: 'RS512', createdBy: 'bob@betaind.com', expiry: '2027-01-01' }
];

const webhooks = [
  { id: 'whk-101', owner: 'userA', targetUrl: 'https://api.alphacorp.com/hooks/receiver', triggerEvents: 'user.created, payment.completed', status: 'Active' },
  { id: 'whk-201', owner: 'userB', targetUrl: 'https://erp.betaind.com/webhooks/incoming', triggerEvents: 'inventory.depleted, order.placed', status: 'Inactive' }
];

const jobs = [
  { id: 'job-101', owner: 'userA', taskName: 'Generate PDF Invoice Batch', runner: 'Worker Node #4', executionTime: '12.4s', status: 'Success' },
  { id: 'job-201', owner: 'userB', taskName: 'Sync Database Replication Cluster', runner: 'Worker Node #9', executionTime: '180.5s', status: 'Failed' }
];

// Helper to get active user ID
const getSessionRole = () => currentSessionUser;

// Required API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'admin-workspace-backend' });
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
    exportsCount: exportsList.filter(e => e.owner === activeUser).length,
    jobsCount: jobs.filter(j => j.owner === activeUser).length,
    activeWebhooksCount: webhooks.filter(w => w.owner === activeUser && w.status === 'Active').length
  });
});

// 5. GET /api/me/exports
app.get('/api/me/exports', (req, res) => {
  res.json(exportsList.filter(item => item.owner === currentSessionUser));
});

// 6. GET /api/me/imports
app.get('/api/me/imports', (req, res) => {
  res.json(importsList.filter(item => item.owner === currentSessionUser));
});

// 7. GET /api/me/documents
app.get('/api/me/documents', (req, res) => {
  res.json(documents.filter(item => item.owner === currentSessionUser));
});

// 8. GET /api/me/teams
app.get('/api/me/teams', (req, res) => {
  res.json(teams.filter(item => item.owner === currentSessionUser));
});

// 9. GET /api/me/roles
app.get('/api/me/roles', (req, res) => {
  res.json(roles.filter(item => item.owner === currentSessionUser));
});

// 10. GET /api/me/audit-logs
app.get('/api/me/audit-logs', (req, res) => {
  res.json(auditLogs.filter(item => item.owner === currentSessionUser));
});

// 11. GET /api/me/subscriptions
app.get('/api/me/subscriptions', (req, res) => {
  res.json(subscriptions.filter(item => item.owner === currentSessionUser));
});

// 12. GET /api/me/devices
app.get('/api/me/devices', (req, res) => {
  res.json(devices.filter(item => item.owner === currentSessionUser));
});

// 13. GET /api/me/api-keys
app.get('/api/me/api-keys', (req, res) => {
  res.json(apiKeys.filter(item => item.owner === currentSessionUser));
});

// 14. GET /api/me/webhooks
app.get('/api/me/webhooks', (req, res) => {
  res.json(webhooks.filter(item => item.owner === currentSessionUser));
});

// 15. GET /api/me/jobs
app.get('/api/me/jobs', (req, res) => {
  res.json(jobs.filter(item => item.owner === currentSessionUser));
});


// ==========================================
// VULNERABLE ENDPOINTS (INTENTIONAL BUGS)
// ==========================================

// 16. GET /api/exports/:exportId
// INTENTIONAL BACKEND BUG: site003-bug01
// CSV: SEC-020
// Type: IDOR
// Description: exportId 조회 시 현재 사용자와 export.owner를 비교하지 않아 userA가 userB Export를 조회할 수 있음.
app.get('/api/exports/:exportId', (req, res) => {
  const { exportId } = req.params;
  const item = exportsList.find(e => e.id === exportId);
  if (!item) {
    return res.status(404).json({ error: 'Export record not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/exports/${exportId}`,
    status: 200,
    response_owner: item.owner,
    data: item
  });
});

// 17. GET /api/imports/:importId
// INTENTIONAL BACKEND BUG: site003-bug02
// CSV: SEC-021
// Type: IDOR
// Description: importId 조회 시 현재 사용자와 import.owner를 비교하지 않아 userA가 userB의 Import를 조회할 수 있음.
app.get('/api/imports/:importId', (req, res) => {
  const { importId } = req.params;
  const item = importsList.find(i => i.id === importId);
  if (!item) {
    return res.status(404).json({ error: 'Import record not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/imports/${importId}`,
    status: 200,
    response_owner: item.owner,
    data: item
  });
});

// 18. GET /api/documents/:documentId
// INTENTIONAL BACKEND BUG: site003-bug03
// CSV: SEC-022
// Type: IDOR
// Description: documentId 조회 시 현재 사용자와 document.owner를 비교하지 않아 userA가 userB의 문서를 조회할 수 있음.
app.get('/api/documents/:documentId', (req, res) => {
  const { documentId } = req.params;
  const doc = documents.find(d => d.id === documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/documents/${documentId}`,
    status: 200,
    response_owner: doc.owner,
    data: doc
  });
});

// 19. GET /api/teams/:teamId
// INTENTIONAL BACKEND BUG: site003-bug04
// CSV: SEC-023
// Type: IDOR
// Description: teamId 조회 시 현재 사용자와 team.owner를 비교하지 않아 userA가 userB의 Team 정보를 조회할 수 있음.
app.get('/api/teams/:teamId', (req, res) => {
  const { teamId } = req.params;
  const team = teams.find(t => t.id === teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team settings not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/teams/${teamId}`,
    status: 200,
    response_owner: team.owner,
    data: team
  });
});

// 20. GET /api/roles/:roleId
// INTENTIONAL BACKEND BUG: site003-bug05
// CSV: SEC-024
// Type: IDOR
// Description: roleId 조회 시 현재 사용자와 role.owner를 비교하지 않아 userA가 userB의 Role 정보를 조회할 수 있음.
app.get('/api/roles/:roleId', (req, res) => {
  const { roleId } = req.params;
  const role = roles.find(r => r.id === roleId);
  if (!role) {
    return res.status(404).json({ error: 'Role policy configuration not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/roles/${roleId}`,
    status: 200,
    response_owner: role.owner,
    data: role
  });
});

// 21. GET /api/audit-logs/:logId
// INTENTIONAL BACKEND BUG: site003-bug06
// CSV: SEC-025
// Type: IDOR
// Description: logId 조회 시 현재 사용자와 auditLog.owner를 비교하지 않아 userA가 userB의 Audit Log를 조회할 수 있음.
app.get('/api/audit-logs/:logId', (req, res) => {
  const { logId } = req.params;
  const log = auditLogs.find(l => l.id === logId);
  if (!log) {
    return res.status(404).json({ error: 'Audit log event not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/audit-logs/${logId}`,
    status: 200,
    response_owner: log.owner,
    data: log
  });
});

// 22. GET /api/subscriptions/:subscriptionId
// INTENTIONAL BACKEND BUG: site003-bug07
// CSV: SEC-026
// Type: IDOR
// Description: subscriptionId 조회 시 현재 사용자와 subscription.owner를 비교하지 않아 userA가 userB의 Subscription 정보를 조회할 수 있음.
app.get('/api/subscriptions/:subscriptionId', (req, res) => {
  const { subscriptionId } = req.params;
  const sub = subscriptions.find(s => s.id === subscriptionId);
  if (!sub) {
    return res.status(404).json({ error: 'Subscription configuration not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/subscriptions/${subscriptionId}`,
    status: 200,
    response_owner: sub.owner,
    data: sub
  });
});

// 23. GET /api/devices/:deviceId
// INTENTIONAL BACKEND BUG: site003-bug08
// CSV: SEC-027
// Type: IDOR
// Description: deviceId 조회 시 현재 사용자와 device.owner를 비교하지 않아 userA가 userB의 Device 정보를 조회할 수 있음.
app.get('/api/devices/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const dev = devices.find(d => d.id === deviceId);
  if (!dev) {
    return res.status(404).json({ error: 'Device metadata not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/devices/${deviceId}`,
    status: 200,
    response_owner: dev.owner,
    data: dev
  });
});

// 24. GET /api/api-keys/:keyId
// INTENTIONAL BACKEND BUG: site003-bug09
// CSV: SEC-028
// Type: IDOR
// Description: keyId 조회 시 현재 사용자와 apiKey.owner를 비교하지 않아 userA가 userB의 API Key Metadata를 조회할 수 있음.
app.get('/api/api-keys/:keyId', (req, res) => {
  const { keyId } = req.params;
  const key = apiKeys.find(k => k.id === keyId);
  if (!key) {
    return res.status(404).json({ error: 'API key details not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/api-keys/${keyId}`,
    status: 200,
    response_owner: key.owner,
    data: key
  });
});

// 25. GET /api/webhooks/:webhookId
// INTENTIONAL BACKEND BUG: site003-bug10
// CSV: SEC-029
// Type: IDOR
// Description: webhookId 조회 시 현재 사용자와 webhook.owner를 비교하지 않아 userA가 userB의 Webhook 정보를 조회할 수 있음.
app.get('/api/webhooks/:webhookId', (req, res) => {
  const { webhookId } = req.params;
  const wh = webhooks.find(w => w.id === webhookId);
  if (!wh) {
    return res.status(404).json({ error: 'Webhook integration setting not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/webhooks/${webhookId}`,
    status: 200,
    response_owner: wh.owner,
    data: wh
  });
});

// 26. GET /api/jobs/:jobId
// INTENTIONAL BACKEND BUG: site003-bug11
// CSV: SEC-030
// Type: IDOR
// Description: jobId 조회 시 현재 사용자와 job.owner를 비교하지 않아 userA가 userB의 Job 실행 정보를 조회할 수 있음.
app.get('/api/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const jb = jobs.find(j => j.id === jobId);
  if (!jb) {
    return res.status(404).json({ error: 'Worker job status not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/jobs/${jobId}`,
    status: 200,
    response_owner: jb.owner,
    data: jb
  });
});

// ==========================================
// SAFE REFERENCE ENDPOINTS (OWNER CHECKED)
// ==========================================

// 27. GET /api/safe/exports/:exportId
app.get('/api/safe/exports/:exportId', (req, res) => {
  const { exportId } = req.params;
  const item = exportsList.find(e => e.id === exportId);
  if (!item) {
    return res.status(404).json({ error: 'Export record not found' });
  }
  if (item.owner !== currentSessionUser) {
    return res.status(403).json({ error: 'Access denied: client does not own this export resource' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/safe/exports/${exportId}`,
    status: 200,
    response_owner: item.owner,
    data: item
  });
});

// 28. GET /api/safe/documents/:documentId
app.get('/api/safe/documents/:documentId', (req, res) => {
  const { documentId } = req.params;
  const doc = documents.find(d => d.id === documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  if (doc.owner !== currentSessionUser) {
    return res.status(403).json({ error: 'Access denied: client does not own this document' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/safe/documents/${documentId}`,
    status: 200,
    response_owner: doc.owner,
    data: doc
  });
});

// Serve static assets from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback routing for React SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
