import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9133;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data Storage
// Nexus Core Ops - Enterprise Data Infrastructure
let categories = [
  { id: 'cat_01', name: 'Neural Hardware', slug: 'neural-hw', productCount: 24 },
  { id: 'cat_02', name: 'Biometric Sensors', slug: 'bio-sensors', productCount: 18 },
  { id: 'cat_03', name: 'Quantum Modules', slug: 'quantum-mod', productCount: 12 },
  { id: 'cat_04', name: 'Storage Arrays', slug: 'storage-arrays', productCount: 35 }
];

let suppliers = [
  { id: 'sup_01', name: 'Aether Technologies', reliability: 0.99 },
  { id: 'sup_02', name: 'Zion Cybernetics', reliability: 0.94 },
  { id: 'sup_03', name: 'Vanguard Systems', reliability: 0.97 }
];

let products = [
  { id: 'prod_01', name: 'Synapse X-1', sku: 'SN-X1-001', categoryId: 'cat_01', supplierId: 'sup_01', price: 1299.99, stock: 45, status: 'active', visibility: 'public', description: 'Next-gen neural interface with 128-core processing.' },
  { id: 'prod_02', name: 'BioPulse v2', sku: 'BP-V2-042', categoryId: 'cat_02', supplierId: 'sup_02', price: 450.00, stock: 12, status: 'active', visibility: 'public', description: 'Advanced biometric sensor for deep-tissue analysis.' },
  { id: 'prod_03', name: 'Q-Bit Core', sku: 'QB-C0-999', categoryId: 'cat_03', supplierId: 'sup_03', price: 5500.00, stock: 5, status: 'active', visibility: 'public', description: 'High-stability quantum computing module.' },
  { id: 'prod_04', name: 'TeraVault 50', sku: 'TV-50-ST', categoryId: 'cat_04', supplierId: 'sup_01', price: 899.00, stock: 85, status: 'active', visibility: 'public', description: 'High-density holographic storage array.' },
  { id: 'prod_05', name: 'Neural Link Gen 3', sku: 'NL-G3-ARC', categoryId: 'cat_01', supplierId: 'sup_01', price: 2100.00, stock: 8, status: 'active', visibility: 'public', description: 'Direct neural interface for enterprise operators.' },
  { id: 'prod_06', name: 'Echo Shield', sku: 'ES-SH-110', categoryId: 'cat_02', supplierId: 'sup_02', price: 150.00, stock: 120, status: 'active', visibility: 'public', description: 'Signal interference shield for biometric arrays.' },
  { id: 'prod_07', name: 'Vortex Cooling', sku: 'VC-LT-XP', categoryId: 'cat_03', supplierId: 'sup_03', price: 320.00, stock: 15, status: 'active', visibility: 'public', description: 'Liquid nitrogen cooling system for quantum cores.' },
  { id: 'prod_08', name: 'Legacy Data Hub', sku: 'LD-HB-01', categoryId: 'cat_04', supplierId: 'sup_01', price: 299.00, stock: 3, status: 'draft', visibility: 'public', description: 'Deprecated storage hub for archival operations.' },
  // Professional Integration of Bug 01: Relational Mapping Scan (Detects orphan records)
  { id: 'prod_09', name: 'Phantom Node', sku: 'PN-09-ERR', categoryId: 'cat_99', supplierId: 'sup_99', price: 0.00, stock: 0, status: 'active', visibility: 'public', description: 'Unlinked system node with missing relational identifiers.' }
];

let orders = [
  { id: 'ord_2001', customerId: 'cust_01', customerName: 'Matrix Corp', status: 'delivered', total: 15499.49, createdAt: '2026-05-01T09:00:00Z' },
  { id: 'ord_2002', customerId: 'cust_02', customerName: 'Zion Node 4', status: 'pending', total: 450.00, createdAt: '2026-05-02T11:30:00Z' },
  { id: 'ord_2003', customerId: 'cust_03', customerName: 'Aether Labs', status: 'shipped', total: 5500.00, createdAt: '2026-05-03T14:15:00Z' },
  { id: 'ord_2004', customerId: 'cust_01', customerName: 'Matrix Corp', status: 'cancelled', total: 899.00, createdAt: '2026-05-04T16:20:00Z' },
  { id: 'ord_2005', customerId: 'cust_02', customerName: 'Zion Node 4', status: 'delivered', total: 1299.99, createdAt: '2026-05-05T10:45:00Z' }
];

const customers = {
  'cust_01': { id: 'cust_01', name: 'Matrix Corp', email: 'ops@matrix.corp' },
  'cust_02': { id: 'cust_02', name: 'Zion Node 4', email: 'admin@zion.net' },
  'cust_03': { id: 'cust_03', name: 'Aether Labs', email: 'research@aether.io' }
};

const orderItems = {
  'ord_2001': [
    { productId: 'prod_01', quantity: 2, price: 1299.99 },
    { productId: 'prod_03', quantity: 2, price: 5500.00 }
  ],
  'ord_2002': [{ productId: 'prod_02', quantity: 1, price: 450.00 }],
  'ord_2003': [{ productId: 'prod_03', quantity: 1, price: 5500.00 }],
  'ord_2004': [{ productId: 'prod_04', quantity: 1, price: 899.00 }],
  'ord_2005': [{ productId: 'prod_01', quantity: 1, price: 1299.99 }]
};

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, nexus_node: 'node-24-core', status: 'operational', uptime: process.uptime() });
});

// 2. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    inventory_count: products.length,
    active_deployments: products.filter(p => p.status === 'active').length,
    processed_orders: orders.length,
    critical_stock_alerts: products.filter(p => p.stock < 10).length,
    structural_categories: categories.length,
    gross_throughput: orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total, 0)
  });
});

// 3. GET /api/categories
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: categories });
});

// 4. GET /api/products
app.get('/api/products', (req, res) => {
  const { status, category, search } = req.query;
  let filtered = [...products];

  if (status && status !== 'all') filtered = filtered.filter(p => p.status === status);
  if (category && category !== 'all') filtered = filtered.filter(p => p.categoryId === category);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.sku.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, data: filtered });
});

// 5. POST /api/products (Professional Integration of Bug 03: Automated Stock Induction)
app.post('/api/products', (req, res) => {
  const { name, sku, categoryId, price, stock, description } = req.body;
  
  // Professional Integration of Bug 03: Default status mismatch
  // The system is designed to default to 'draft' when status is not explicitly provided during bulk induction tests.
  const status = req.body.status || 'draft';
  const visibility = req.body.visibility || 'hidden';

  const newProduct = {
    id: `prod_${Date.now()}`,
    name,
    sku,
    categoryId,
    supplierId: req.body.supplierId || 'sup_01',
    price: parseFloat(price) || 0,
    stock: parseInt(stock) || 0,
    status,
    visibility,
    description: description || 'Inducted via automated portal.',
    bugId: req.body.status ? undefined : 'site024-bug03'
  };

  products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct, bugId: newProduct.bugId });
});

// 6. GET /api/orders (Professional Integration of Bug 04: Resource Expansion Stress Test)
app.get('/api/orders', async (req, res) => {
  const { includeDetails, status, search } = req.query;
  let filteredOrders = [...orders];

  if (status && status !== 'all') filteredOrders = filteredOrders.filter(o => o.status === status);
  if (search) {
    const s = search.toLowerCase();
    filteredOrders = filteredOrders.filter(o => 
      o.id.toLowerCase().includes(s) || 
      o.customerName.toLowerCase().includes(s)
    );
  }

  if (includeDetails === 'true') {
    // Professional Integration of Bug 04: N+1 query latency simulation
    try {
      const detailedOrders = await Promise.all(filteredOrders.map(async (order) => {
        // Simulated inefficient lookup
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
          ...order,
          customer: customers[order.customerId],
          items: (orderItems[order.id] || []).map(item => ({
            ...item,
            product: products.find(p => p.id === item.productId)
          }))
        };
      }));

      res.json({ 
        success: true, 
        data: detailedOrders, 
        performance_metrics: {
          latency_ms: filteredOrders.length * 800,
          io_operations: filteredOrders.length * 3
        },
        bugId: 'site024-bug04' 
      });
    } catch (e) {
      res.status(504).json({ success: false, message: 'Expansion timeout', bugId: 'site024-bug04' });
    }
    return;
  }

  res.json({ success: true, data: filteredOrders });
});

// 7. GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Node not found' });

  const details = {
    ...order,
    customer: customers[order.customerId],
    items: (orderItems[order.id] || []).map(item => ({
      ...item,
      product: products.find(p => p.id === item.productId)
    }))
  };

  res.json({ success: true, data: details });
});

// 8. GET /api/diagnostics/integrity (Professional Integration of Bug 01: Relational Mapping Scan)
app.get('/api/diagnostics/integrity', (req, res) => {
  const orphanProducts = products.filter(p => !categories.find(c => c.id === p.categoryId));
  const missingSuppliers = products.filter(p => !suppliers.find(s => s.id === p.supplierId));
  
  res.json({
    success: true,
    report: {
      timestamp: new Date().toISOString(),
      integrity_score: (orphanProducts.length === 0) ? 100 : 75,
      violations: [
        ...orphanProducts.map(p => ({ type: 'category_orphan', node_id: p.id, expected: p.categoryId })),
        ...missingSuppliers.map(p => ({ type: 'supplier_orphan', node_id: p.id, expected: p.supplierId }))
      ]
    },
    bugId: (orphanProducts.length > 0) ? 'site024-bug01' : undefined
  });
});

// 9. GET /api/legacy/sync (Professional Integration of Bug 02: Legacy Schema Synchronization)
app.get('/api/legacy/sync', (req, res) => {
  const legacyData = products.map(p => {
    // Intentional removal of standard fields for legacy client simulation
    const { name, ...rest } = p;
    return {
      ...rest,
      legacy_node_id: p.id.split('_')[1],
      price_point: p.price,
      availability: p.stock > 0 ? 'AVAILABLE' : 'DEPLETED'
    };
  });

  res.json({
    success: true,
    sync_protocol: 'v1.0-legacy',
    data: legacyData,
    bugId: 'site024-bug02'
  });
});

app.get('/api/suppliers', (req, res) => {
  res.json({ success: true, data: suppliers });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Nexus Core Node active on http://localhost:${PORT}`);
});
