import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9906;

app.use(express.json());

// Mock databases
const userDB = {
  doctor: {
    name: 'Dr. Gregory House',
    permissions: {
      orders: true,
      profile: true,
      reports: true,
      invoices: true,
      files: true,
      messages: true,
      appointments: true,
      cart: true,
      checkout: true,
      search: true
    }
  },
  nurse: {
    name: 'Jackie Peyton, RN',
    permissions: {
      orders: false,
      profile: true,
      reports: false,
      invoices: false,
      files: true,
      messages: true,
      appointments: true,
      cart: true,
      checkout: false,
      search: true
    }
  },
  admin: {
    name: 'Dr. Lisa Cuddy',
    permissions: {
      orders: true,
      profile: true,
      reports: true,
      invoices: true,
      files: true,
      messages: true,
      appointments: true,
      cart: true,
      checkout: true,
      search: true
    }
  }
};

const sessionStore = {
  'sess-doctor-emr7': {
    role: 'doctor',
    cachedPermissions: { ...userDB.doctor.permissions }
  },
  'sess-nurse-emr7': {
    role: 'nurse',
    cachedPermissions: { ...userDB.nurse.permissions }
  },
  'sess-admin-emr7': {
    role: 'admin',
    cachedPermissions: { ...userDB.admin.permissions }
  }
};

// Mock clinical data
const clinicalData = {
  orders: [
    { id: 'ord-301', patient: 'Arthur Pendragon', drug: 'Amlodipine 5mg', qty: '30 Tabs', date: '2026-07-28' },
    { id: 'ord-302', patient: 'Gwen Stacy', drug: 'Ibuprofen 400mg', qty: '20 Tabs', date: '2026-07-29' }
  ],
  profile: {
    id: 'prof-777',
    name: 'St. Jude Clinical Facility',
    license: 'LC-99201-EMR',
    address: '452 Medical Center Pkwy, Suite 100',
    departments: ['Cardiology', 'Neurology', 'Pediatrics', 'Oncology']
  },
  reports: [
    { id: 'rep-901', title: 'Q2 Hospital Infection Control Review', date: '2026-07-15', status: 'Approved' },
    { id: 'rep-902', title: 'Annual Pediatric Oncology Diagnostic Audit', date: '2026-07-20', status: 'Pending Review' }
  ],
  invoices: [
    { id: 'inv-801', debtor: 'BlueCross BlueShield', amount: '$4,850.00', status: 'Submitted' },
    { id: 'inv-802', debtor: 'Medicare Advantage', amount: '$12,400.00', status: 'Approved' }
  ],
  files: [
    { id: 'file-091', filename: 'Radiology_CT_Chest_Stacy_G.dcm', size: '48.2 MB', uploadDate: '2026-07-29' },
    { id: 'file-092', filename: 'Labs_CBC_Arthur_P.pdf', size: '1.2 MB', uploadDate: '2026-07-28' }
  ],
  messages: [
    { id: 'msg-501', sender: 'Lab Administrator', content: 'Urgent: Potassium level for room 304B is critical (6.2 mEq/L).' },
    { id: 'msg-502', sender: 'Pharmacy Coordinator', content: 'Notice: Supply shortage for IV Saline bags.' }
  ],
  appointments: [
    { id: 'apt-201', patient: 'Arthur Pendragon', time: '10:30 AM', doc: 'Dr. House', room: 'Clinic Room A' },
    { id: 'apt-202', patient: 'Bruce Wayne', time: '02:00 PM', doc: 'Dr. House', room: 'Clinic Room B' }
  ],
  cart: [
    { id: 'cart-101', item: 'Propofol 10mg/mL Emulsion', qty: '10 Vials', status: 'Dispatched' },
    { id: 'cart-102', item: 'Salbutamol Inhaler', qty: '5 Units', status: 'In Pharmacy Storage' }
  ],
  checkout: [
    { id: 'chk-401', claimId: 'clm-00192', total: '$1,250.00', copay: '$50.00', method: 'Insurance Direct' },
    { id: 'chk-402', claimId: 'clm-00195', total: '$890.00', copay: '$0.00', method: 'Medicare Part B' }
  ],
  search: [
    { id: 'pat-101', name: 'John Doe', age: 45, diagnosis: 'Essential Hypertension' },
    { id: 'pat-102', name: 'John Constantine', age: 39, diagnosis: 'Lung Carcinoma' }
  ]
};

// Middleware to verify session cached permissions (Vulnerable to Drift)
const checkSessionPermission = (resource) => {
  return (req, res, next) => {
    const sessionId = req.headers['x-session-id'] || 'sess-doctor-emr7';
    const session = sessionStore[sessionId];

    if (!session) {
      return res.status(403).json({ error: 'Access Denied: Invalid Session' });
    }

    const hasPermission = session.cachedPermissions[resource];
    if (!hasPermission) {
      return res.status(403).json({ error: `Access Denied: Revoked privilege for ${resource}` });
    }

    next();
  };
};

// System status and sync API endpoints
app.get('/api/system/status', (req, res) => {
  res.json({
    sessions: {
      doctor: 'sess-doctor-emr7',
      nurse: 'sess-nurse-emr7',
      admin: 'sess-admin-emr7'
    },
    permissions: {
      doctor: userDB.doctor.permissions,
      nurse: userDB.nurse.permissions
    }
  });
});

app.post('/api/system/sync-session', (req, res) => {
  const { sessionId } = req.body;
  const session = sessionStore[sessionId];
  if (session && userDB[session.role]) {
    session.cachedPermissions = { ...userDB[session.role].permissions };
    return res.json({ success: true });
  }
  res.status(400).json({ error: 'Session not found' });
});

// Admin permissions control
app.post('/api/admin/toggle-permission', (req, res) => {
  const { role, resource, state } = req.body;
  if (userDB[role] && userDB[role].permissions[resource] !== undefined) {
    userDB[role].permissions[resource] = state;
    return res.json({ success: true });
  }
  res.status(400).json({ error: 'Invalid privilege settings' });
});

// Subsystem API endpoints
const setupResourceApi = (resource) => {
  app.get(`/api/${resource}`, checkSessionPermission(resource), (req, res) => {
    const sessionId = req.headers['x-session-id'] || 'sess-doctor-emr7';
    const session = sessionStore[sessionId];
    
    let data = clinicalData[resource];
    if (resource === 'search') {
      const q = req.query.q || '';
      data = clinicalData.search.filter(pat => pat.name.toLowerCase().includes(q.toLowerCase()));
    }

    res.json({
      role: session.role,
      endpoint: req.originalUrl,
      status: 200,
      sessionId,
      data
    });
  });
};

const resources = ['orders', 'profile', 'reports', 'invoices', 'files', 'messages', 'appointments', 'cart', 'checkout', 'search'];
resources.forEach(setupResourceApi);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
