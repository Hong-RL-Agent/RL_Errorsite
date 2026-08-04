import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9900;

app.use(express.json());

// Mock current active user in memory (defaults to userA)
let currentSessionUser = 'userA';

// Full user details
const users = [
  { id: 'userA', name: 'Alice Jenkins', email: 'alice.j@example.com', tier: 'Gold Client' },
  { id: 'userB', name: 'Bob Sterling', email: 'bob.s@example.com', tier: 'Enterprise Client' }
];

// Mock Datasets with owner field
const orders = [
  { id: 'ord-1001', owner: 'userA', status: 'Shipped', total: '$149.99', items: '2x Premium Leather Organizer', date: '2026-07-20' },
  { id: 'ord-1002', owner: 'userA', status: 'Processing', total: '$89.00', items: '1x Ergonomic Desk Mat', date: '2026-07-25' },
  { id: 'ord-2001', owner: 'userB', status: 'Delivered', total: '$1,299.00', items: '4x Ultra-Wide Smart Displays', date: '2026-07-15' },
  { id: 'ord-2002', owner: 'userB', status: 'Cancelled', total: '$45.50', items: '1x USB-C Multi-hub Adaptor', date: '2026-07-18' }
];

const profiles = [
  { id: 'prof-101', owner: 'userA', phone: '+1 (555) 019-2834', address: '128 Pinecrest Ave, Seattle, WA', billingCard: 'Visa ending in 4321', preferences: 'Email updates, paperless invoices' },
  { id: 'prof-202', owner: 'userB', phone: '+1 (555) 014-9821', address: '89 Broad St, Suite 400, New York, NY', billingCard: 'Amex ending in 9876', preferences: 'SMS alerts, priority dispatch' }
];

const reports = [
  { id: 'rep-301', owner: 'userA', name: 'Q2 Purchase Insights', generatedDate: '2026-07-01', totalSpend: '$438.99', categoryBreakdown: 'Office Supplies (70%), Tech (30%)' },
  { id: 'rep-302', owner: 'userB', name: 'FY2026 Strategic Asset Audit', generatedDate: '2026-07-10', totalSpend: '$12,450.00', categoryBreakdown: 'Hardware (85%), Services (15%)' }
];

const invoices = [
  { id: 'inv-401', owner: 'userA', amount: '$149.99', dueDate: '2026-08-20', paymentStatus: 'Unpaid', billingPeriod: 'July 2026' },
  { id: 'inv-402', owner: 'userA', amount: '$89.00', dueDate: '2026-08-25', paymentStatus: 'Paid', billingPeriod: 'July 2026' },
  { id: 'inv-501', owner: 'userB', amount: '$1,299.00', dueDate: '2026-08-15', paymentStatus: 'Paid', billingPeriod: 'July 2026' },
  { id: 'inv-502', owner: 'userB', amount: '$45.50', dueDate: '2026-08-18', paymentStatus: 'Refunded', billingPeriod: 'July 2026' }
];

const files = [
  { id: 'file-601', owner: 'userA', filename: 'Setup_Guide_v2.pdf', size: '2.4 MB', uploadDate: '2026-07-21', mimeType: 'application/pdf' },
  { id: 'file-602', owner: 'userA', filename: 'Invoice_ord-1001.pdf', size: '1.1 MB', uploadDate: '2026-07-20', mimeType: 'application/pdf' },
  { id: 'file-701', owner: 'userB', filename: 'Enterprise_License_Agreement.pdf', size: '14.8 MB', uploadDate: '2026-07-15', mimeType: 'application/pdf' },
  { id: 'file-702', owner: 'userB', filename: 'Receipt_ord-2001.pdf', size: '920 KB', uploadDate: '2026-07-15', mimeType: 'application/pdf' }
];

const messages = [
  { id: 'msg-801', owner: 'userA', subject: 'Your Delivery Details Update', content: 'Hello Alice, your order ord-1001 has been dispatched via Priority Courier.', sender: 'Client Support Team', receivedAt: '2026-07-20 14:32' },
  { id: 'msg-802', owner: 'userA', subject: 'Feedback Survey', content: 'We would love to hear your thoughts on your recent desk mat purchase.', sender: 'Feedback System', receivedAt: '2026-07-26 09:00' },
  { id: 'msg-901', owner: 'userB', subject: 'Enterprise Account Setup Completed', content: 'Welcome Bob, your corporate workspace has been provisioned and configured successfully.', sender: 'Systems Administration', receivedAt: '2026-07-15 10:11' },
  { id: 'msg-902', owner: 'userB', subject: 'Urgent: Verify Card Details', content: 'Please review the payment profile linked to invoice inv-501 to prevent service downtime.', sender: 'Billing Division', receivedAt: '2026-07-19 16:45' }
];

const appointments = [
  { id: 'apt-111', owner: 'userA', type: 'Onboarding Consultation', time: '2026-08-05 10:00 AM', status: 'Scheduled', agentName: 'Marcus Aurelius' },
  { id: 'apt-222', owner: 'userB', type: 'Enterprise Strategy Session', time: '2026-08-06 02:00 PM', status: 'Scheduled', agentName: 'Seneca The Younger' }
];

const carts = [
  { id: 'cart-10', owner: 'userA', items: [{ name: 'Wireless Charging Dock', qty: 1, price: '$59.99' }], lastUpdated: '2026-07-28 11:00' },
  { id: 'cart-20', owner: 'userB', items: [{ name: 'Smart Keyboard Case', qty: 2, price: '$199.99' }, { name: 'Stylus Pen Pro', qty: 2, price: '$99.99' }], lastUpdated: '2026-07-28 10:45' }
];

const checkouts = [
  { id: 'chk-55', owner: 'userA', step: 'Shipping Method Selection', completedSteps: ['Cart Approved', 'Address Entered'], orderTotal: '$59.99', estimatedDelivery: '2026-08-02' },
  { id: 'chk-66', owner: 'userB', step: 'Payment Authorization', completedSteps: ['Cart Approved', 'Address Entered', 'Delivery Chosen'], orderTotal: '$599.96', estimatedDelivery: '2026-08-01' }
];

// Helper to get active user details
const getSessionRole = () => currentSessionUser;

// Essential API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'customer-portal-backend' });
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
    recentOrdersCount: orders.filter(o => o.owner === activeUser).length,
    recentInvoicesCount: invoices.filter(i => i.owner === activeUser).length,
    unreadMessagesCount: messages.filter(m => m.owner === activeUser).length,
  });
});

// 5. GET /api/me/orders
app.get('/api/me/orders', (req, res) => {
  res.json(orders.filter(o => o.owner === currentSessionUser));
});

// 6. GET /api/me/profile
app.get('/api/me/profile', (req, res) => {
  res.json(profiles.find(p => p.owner === currentSessionUser));
});

// 7. GET /api/me/reports
app.get('/api/me/reports', (req, res) => {
  res.json(reports.filter(r => r.owner === currentSessionUser));
});

// 8. GET /api/me/invoices
app.get('/api/me/invoices', (req, res) => {
  res.json(invoices.filter(i => i.owner === currentSessionUser));
});

// 9. GET /api/me/files
app.get('/api/me/files', (req, res) => {
  res.json(files.filter(f => f.owner === currentSessionUser));
});

// 10. GET /api/me/messages
app.get('/api/me/messages', (req, res) => {
  res.json(messages.filter(m => m.owner === currentSessionUser));
});

// 11. GET /api/me/appointments
app.get('/api/me/appointments', (req, res) => {
  res.json(appointments.filter(a => a.owner === currentSessionUser));
});

// 12. GET /api/me/cart
app.get('/api/me/cart', (req, res) => {
  res.json(carts.find(c => c.owner === currentSessionUser));
});

// 13. GET /api/me/checkout
app.get('/api/me/checkout', (req, res) => {
  res.json(checkouts.find(c => c.owner === currentSessionUser));
});

// ==========================================
// VULNERABLE ENDPOINTS (INTENTIONAL BUGS)
// ==========================================

// 14. GET /api/orders/:orderId
// INTENTIONAL BACKEND BUG: site001-bug01
// CSV: SEC-001
// Type: IDOR
// Description: orderId 조회 시 현재 사용자와 order.owner를 비교하지 않아 userA가 userB의 주문을 조회할 수 있음.
app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  // PPO grading framework signature match fields
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/orders/${orderId}`,
    status: 200,
    response_owner: order.owner,
    data: order
  });
});

// 15. GET /api/profiles/:profileId
// INTENTIONAL BACKEND BUG: site001-bug02
// CSV: SEC-002
// Type: IDOR
// Description: profileId 조회 시 현재 사용자와 profile.owner를 비교하지 않아 userA가 userB의 프로필을 조회할 수 있음.
app.get('/api/profiles/:profileId', (req, res) => {
  const { profileId } = req.params;
  const profile = profiles.find(p => p.id === profileId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/profiles/${profileId}`,
    status: 200,
    response_owner: profile.owner,
    data: profile
  });
});

// 16. GET /api/reports/:reportId
// INTENTIONAL BACKEND BUG: site001-bug03
// CSV: SEC-003
// Type: IDOR
// Description: reportId 조회 시 현재 사용자와 report.owner를 비교하지 않아 userA가 userB의 리포트를 조회할 수 있음.
app.get('/api/reports/:reportId', (req, res) => {
  const { reportId } = req.params;
  const report = reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/reports/${reportId}`,
    status: 200,
    response_owner: report.owner,
    data: report
  });
});

// 17. GET /api/invoices/:invoiceId
// INTENTIONAL BACKEND BUG: site001-bug04
// CSV: SEC-004
// Type: IDOR
// Description: invoiceId 조회 시 현재 사용자와 invoice.owner를 비교하지 않아 userA가 userB의 청구서를 조회할 수 있음.
app.get('/api/invoices/:invoiceId', (req, res) => {
  const { invoiceId } = req.params;
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/invoices/${invoiceId}`,
    status: 200,
    response_owner: invoice.owner,
    data: invoice
  });
});

// 18. GET /api/files/:fileId
// INTENTIONAL BACKEND BUG: site001-bug05
// CSV: SEC-005
// Type: IDOR
// Description: fileId 조회 시 현재 사용자와 file.owner를 비교하지 않아 userA가 userB의 파일 메타데이터를 조회할 수 있음.
app.get('/api/files/:fileId', (req, res) => {
  const { fileId } = req.params;
  const fileData = files.find(f => f.id === fileId);
  if (!fileData) {
    return res.status(404).json({ error: 'File metadata not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/files/${fileId}`,
    status: 200,
    response_owner: fileData.owner,
    data: fileData
  });
});

// 19. GET /api/messages/:messageId
// INTENTIONAL BACKEND BUG: site001-bug06
// CSV: SEC-006
// Type: IDOR
// Description: messageId 조회 시 현재 사용자와 message.owner를 비교하지 않아 userA가 userB의 메시지를 조회할 수 있음.
app.get('/api/messages/:messageId', (req, res) => {
  const { messageId } = req.params;
  const msg = messages.find(m => m.id === messageId);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/messages/${messageId}`,
    status: 200,
    response_owner: msg.owner,
    data: msg
  });
});

// 20. GET /api/appointments/:appointmentId
// INTENTIONAL BACKEND BUG: site001-bug07
// CSV: SEC-007
// Type: IDOR
// Description: appointmentId 조회 시 현재 사용자와 appointment.owner를 비교하지 않아 userA가 userB의 예약을 조회할 수 있음.
app.get('/api/appointments/:appointmentId', (req, res) => {
  const { appointmentId } = req.params;
  const apt = appointments.find(a => a.id === appointmentId);
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

// 21. GET /api/carts/:cartId
// INTENTIONAL BACKEND BUG: site001-bug08
// CSV: SEC-008
// Type: IDOR
// Description: cartId 조회 시 현재 사용자와 cart.owner를 비교하지 않아 userA가 userB의 장바구니를 조회할 수 있음.
app.get('/api/carts/:cartId', (req, res) => {
  const { cartId } = req.params;
  const cart = carts.find(c => c.id === cartId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/carts/${cartId}`,
    status: 200,
    response_owner: cart.owner,
    data: cart
  });
});

// 22. GET /api/checkouts/:checkoutId
// INTENTIONAL BACKEND BUG: site001-bug09
// CSV: SEC-009
// Type: IDOR
// Description: checkoutId 조회 시 현재 사용자와 checkout.owner를 비교하지 않아 userA가 userB의 체크아웃 진행 상태를 조회할 수 있음.
app.get('/api/checkouts/:checkoutId', (req, res) => {
  const { checkoutId } = req.params;
  const chk = checkouts.find(c => c.id === checkoutId);
  if (!chk) {
    return res.status(404).json({ error: 'Checkout session not found' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/checkouts/${checkoutId}`,
    status: 200,
    response_owner: chk.owner,
    data: chk
  });
});

// ==========================================
// SAFE REFERENCE ENDPOINTS (OWNER CHECKED)
// ==========================================

// 23. GET /api/safe/orders/:orderId
app.get('/api/safe/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  if (order.owner !== currentSessionUser) {
    return res.status(403).json({ error: 'Access denied: client does not own this resource' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/safe/orders/${orderId}`,
    status: 200,
    response_owner: order.owner,
    data: order
  });
});

// 24. GET /api/safe/profiles/:profileId
app.get('/api/safe/profiles/:profileId', (req, res) => {
  const { profileId } = req.params;
  const profile = profiles.find(p => p.id === profileId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  if (profile.owner !== currentSessionUser) {
    return res.status(403).json({ error: 'Access denied: client does not own this resource' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: `/api/safe/profiles/${profileId}`,
    status: 200,
    response_owner: profile.owner,
    data: profile
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
