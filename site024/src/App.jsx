import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Database, 
  History, 
  Zap, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  X,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Activity,
  BarChart3,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

function App() {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [integrityReport, setIntegrityReport] = useState(null);
  const [syncReport, setSyncReport] = useState(null);
  const [stressReport, setStressReport] = useState(null);
  const [systemAlert, setSystemAlert] = useState(null);

  // Filters & Search
  const [prodFilter, setProdFilter] = useState({ status: 'all', category: 'all', search: '' });
  const [orderFilter, setOrderFilter] = useState({ status: 'all', search: '' });

  // Form State
  const [newProd, setNewProd] = useState({ name: '', sku: '', price: '', stock: '', categoryId: 'cat_01', supplierId: 'sup_01', description: '' });

  // API Callbacks
  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth(data);
    } catch (e) { console.error(e); }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (prodFilter.status !== 'all') params.append('status', prodFilter.status);
      if (prodFilter.category !== 'all') params.append('category', prodFilter.category);
      if (prodFilter.search) params.append('search', prodFilter.search);

      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setCategories(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_BASE}/suppliers`);
      const data = await res.json();
      setSuppliers(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async (details = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (orderFilter.status !== 'all') params.append('status', orderFilter.status);
      if (orderFilter.search) params.append('search', orderFilter.search);
      if (details) params.append('includeDetails', 'true');

      const start = Date.now();
      const res = await fetch(`${API_BASE}/orders?${params.toString()}`);
      const data = await res.json();
      const end = Date.now();
      
      if (details) {
        setStressReport({ ...data, actualTime: end - start });
        if (data.bugId) setSystemAlert({ id: data.bugId, type: 'CRITICAL', title: 'Resource Expansion Latency', message: 'Linear data resolution detected in expansion logic.' });
      } else {
        setOrders(data.data);
      }
    } catch (e) { 
      setStressReport({ error: true, message: 'Expansion Timeout' });
      setSystemAlert({ id: 'site024-bug04', type: 'CRITICAL', title: 'Gateway Timeout', message: 'System failed to resolve nested resources within window.' });
    }
    setLoading(false);
  };

  const fetchOrderDetail = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`);
      const data = await res.json();
      setSelectedOrder(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const conductInduction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      const data = await res.json();
      if (data.bugId) {
        setSystemAlert({ id: data.bugId, type: 'WARNING', title: 'Induction Logic Mismatch', message: 'Automated status induction defaulted to non-active state.' });
      }
      alert('Node Induction Successful.');
      setActiveMenu('inventory');
      fetchProducts();
      setNewProd({ name: '', sku: '', price: '', stock: '', categoryId: 'cat_01', supplierId: 'sup_01', description: '' });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const runIntegrityScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/diagnostics/integrity`);
      const data = await res.json();
      setIntegrityReport(data.report);
      if (data.bugId) setSystemAlert({ id: data.bugId, type: 'WARNING', title: 'Relational Integrity Violation', message: 'Orphaned nodes detected during relational mapping scan.' });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const runLegacySync = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/legacy/sync`);
      const data = await res.json();
      setSyncReport(data.data);
      if (data.bugId) setSystemAlert({ id: data.bugId, type: 'NOTICE', title: 'Legacy Protocol Shift', message: 'Field "displayName" omitted in v1.0 schema synchronization.' });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    fetchSummary();
    fetchCategories();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (activeMenu === 'overview') fetchSummary();
    if (activeMenu === 'inventory') fetchProducts();
    if (activeMenu === 'orders') fetchOrders();
  }, [activeMenu, prodFilter.status, prodFilter.category, prodFilter.search, orderFilter.status, orderFilter.search]);

  const renderOverview = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fade-in">
      <div className="summary-grid">
        <div className="card">
          <div className="card-title">Gross Throughput</div>
          <div className="card-value">${summary?.gross_throughput?.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-title">Inventory Count</div>
          <div className="card-value">{summary?.inventory_count}</div>
        </div>
        <div className="card">
          <div className="card-title">Active Deployments</div>
          <div className="card-value">{summary?.active_deployments}</div>
        </div>
        <div className="card">
          <div className="card-title">Critical Alerts</div>
          <div className="card-value" style={{ color: summary?.critical_stock_alerts > 0 ? 'var(--warning)' : 'var(--accent)' }}>
            {summary?.critical_stock_alerts}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={20} color="var(--primary)" /> Network Load Trends
          </h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', paddingBottom: '1rem' }}>
            {[45, 62, 58, 85, 72, 94, 78].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--primary)', borderRadius: '6px 6px 2px 2px', position: 'relative', opacity: 0.8 }}>
                <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{h}%</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>SEG-A</span><span>SEG-B</span><span>SEG-C</span><span>SEG-D</span><span>SEG-E</span><span>SEG-F</span><span>SEG-G</span>
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BarChart3 size={20} color="var(--accent)" /> Cluster Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {categories.map(c => (
              <div key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <span>{c.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c.productCount} Units</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.productCount / 35) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ height: '100%', background: 'var(--accent)' }}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderInventory = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Inventory Control</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage enterprise assets and induction protocols.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveMenu('induction')}>
          <Plus size={18} /> Asset Induction
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'rgba(30, 41, 59, 0.5)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by Node Name or SKU..." 
            style={{ paddingLeft: '48px', height: '48px' }} 
            value={prodFilter.search}
            onChange={e => setProdFilter({...prodFilter, search: e.target.value})}
          />
        </div>
        <select value={prodFilter.category} onChange={e => setProdFilter({...prodFilter, category: e.target.value})} style={{ width: '220px', height: '48px' }}>
          <option value="all">All Clusters</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={prodFilter.status} onChange={e => setProdFilter({...prodFilter, status: e.target.value})} style={{ width: '180px', height: '48px' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Node Asset</th>
              <th>SKU</th>
              <th>Cluster</th>
              <th>Price Point</th>
              <th>Stock Level</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No asset records found matching criteria.</td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Cpu size={18} color="var(--primary)" />
                    </div>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                  </div>
                </td>
                <td><code className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.sku}</code></td>
                <td>{categories.find(c => c.id === p.categoryId)?.name || <span style={{ color: 'var(--danger)' }}>UNLINKED ({p.categoryId})</span>}</td>
                <td className="mono">${p.price.toFixed(2)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.stock < 10 ? 'var(--warning)' : 'var(--accent)' }}></div>
                    <span className="mono" style={{ color: p.stock < 10 ? 'var(--warning)' : 'inherit' }}>{p.stock}</span>
                  </div>
                </td>
                <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                <td>
                  <button className="btn-outline" style={{ padding: '0.5rem' }} onClick={() => setSelectedProduct(p)}>
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderInduction = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <button className="btn btn-outline" style={{ marginBottom: '1.5rem' }} onClick={() => setActiveMenu('inventory')}>
          <X size={16} /> Cancel Induction
        </button>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Node Induction Portal</h2>
        <p style={{ color: 'var(--text-muted)' }}>Register new hardware assets into the Nexus Core infrastructure.</p>
      </div>
      
      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={conductInduction}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label>Asset Name</label>
              <input required type="text" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} placeholder="e.g. Synapse Cluster B" />
            </div>
            <div className="form-group">
              <label>SKU Identifier</label>
              <input required type="text" value={newProd.sku} onChange={e => setNewProd({...newProd, sku: e.target.value})} placeholder="SY-CLB-99" />
            </div>
          </div>
          <div className="form-group">
            <label>Induction Logic Description</label>
            <textarea 
              style={{ minHeight: '120px' }}
              value={newProd.description}
              onChange={e => setNewProd({...newProd, description: e.target.value})}
              placeholder="Specify deployment parameters and operational constraints..."
            ></textarea>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label>Price Point (Unit)</label>
              <input required type="number" step="0.01" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Initial Cluster Count</label>
              <input required type="number" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label>Resource Cluster</label>
              <select value={newProd.categoryId} onChange={e => setNewProd({...newProd, categoryId: e.target.value})}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Origin Supplier</label>
              <select value={newProd.supplierId} onChange={e => setNewProd({...newProd, supplierId: e.target.value})}>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ marginTop: '2.5rem' }} data-bug-id="site024-bug03">
            <button className="btn btn-primary" style={{ width: '100%', height: '56px', fontSize: '1rem' }}>Execute Automated Induction</button>
          </div>
        </form>
      </div>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem' }}>Procurement Logs</h2>
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', background: 'rgba(30, 41, 59, 0.5)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search Protocol ID or Customer Node..." 
            style={{ paddingLeft: '48px', height: '48px' }} 
            value={orderFilter.search}
            onChange={e => setOrderFilter({...orderFilter, search: e.target.value})}
          />
        </div>
        <select value={orderFilter.status} onChange={e => setOrderFilter({...orderFilter, status: e.target.value})} style={{ width: '220px', height: '48px' }}>
          <option value="all">All Protocols</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Protocol ID</th>
              <th>Destination Node</th>
              <th>Operational Status</th>
              <th>Throughput</th>
              <th>Timestamp</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td><code className="mono">{o.id}</code></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>{o.customerName[0]}</div>
                    <span style={{ fontWeight: 600 }}>{o.customerName}</span>
                  </div>
                </td>
                <td>
                  <span className="badge" style={{ 
                    background: o.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : o.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: o.status === 'delivered' ? 'var(--accent)' : o.status === 'cancelled' ? 'var(--danger)' : 'var(--warning)'
                  }}>
                    {o.status.toUpperCase()}
                  </span>
                </td>
                <td className="mono" style={{ fontWeight: 700 }}>${o.total.toFixed(2)}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString()}</td>
                <td>
                  <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => fetchOrderDetail(o.id)}>INSPECT</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderIntegrity = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Data Governance</h2>
          <p style={{ color: 'var(--text-muted)' }}>Audit relational mapping and identify architectural inconsistencies.</p>
        </div>
        <button className="btn btn-primary" onClick={runIntegrityScan} data-bug-id="site024-bug01">
          <ShieldCheck size={18} /> Relational Mapping Scan
        </button>
      </div>

      {integrityReport && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '2rem' }}>Integrity Assessment</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', textAlign: 'center', border: '1px solid var(--border)' }}>
                 <div className="card-title">Score</div>
                 <div style={{ fontSize: '4rem', fontWeight: 900, color: integrityReport.integrity_score === 100 ? 'var(--accent)' : 'var(--warning)' }}>{integrityReport.integrity_score}%</div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>VIOLATIONS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{integrityReport.violations.length}</div>
                  </div>
                  <div className="card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>NODES</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{products.length}</div>
                  </div>
               </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '2rem' }}>Violation Protocol Logs</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {integrityReport.violations.map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <AlertTriangle size={20} color="var(--danger)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>Orphan Record: {v.node_id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>Unresolved Mapping to Cluster: {v.expected}</div>
                  </div>
                  <button className="btn-outline" style={{ fontSize: '0.65rem', padding: '0.4rem 0.8rem' }}>PATCH</button>
                </div>
              ))}
              {integrityReport.violations.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--accent)' }}>
                  <CheckCircle2 size={48} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 700 }}>Infrastructure mapping verified.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderLegacySync = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>API Infrastructure</h2>
          <p style={{ color: 'var(--text-muted)' }}>Synchronize node metadata with v1.x legacy client protocols.</p>
        </div>
        <button className="btn btn-primary" onClick={runLegacySync} data-bug-id="site024-bug02">
          <RefreshCw size={18} /> Legacy Schema Sync
        </button>
      </div>

      {syncReport && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>v1.0 Sync Validator</h3>
            <div className="bug-alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', marginBottom: '2rem' }}>
              <AlertTriangle size={24} />
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>SCHEMA MISMATCH</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Missing field: "displayName" in synchronization payload.</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['legacy_node_id', 'price_point', 'availability'].map(f => (
                <div key={f} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.85rem' }}>
                  <span className="mono">{f}</span><span style={{ color: 'var(--accent)', fontWeight: 800 }}>VALID</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', fontSize: '0.85rem' }}>
                <span className="mono" style={{ fontWeight: 800 }}>displayName</span><span style={{ color: 'var(--danger)', fontWeight: 900 }}>MISSING</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Raw Synchronization Payload</h3>
            <div style={{ background: '#020617', color: '#10B981', padding: '1.5rem', borderRadius: '16px', fontSize: '0.8rem', height: '400px', overflowY: 'auto', border: '1px solid var(--border)' }}>
              <pre>{JSON.stringify(syncReport[0], null, 2)}</pre>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1.5rem', paddingTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                {`// Additional legacy descriptors omitted for stability...`}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderStressTest = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Compute Optimization</h2>
          <p style={{ color: 'var(--text-muted)' }}>Validate resource expansion efficiency under high-concurrency simulation.</p>
        </div>
        <button className="btn btn-primary" onClick={() => fetchOrders(true)} data-bug-id="site024-bug04">
          <Zap size={18} /> Stress Test: Resource Graph
        </button>
      </div>

      {stressReport && (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          {stressReport.error ? (
            <div className="fade-in">
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                <Clock size={48} />
              </div>
              <h2 style={{ color: 'var(--danger)', fontSize: '2rem', marginBottom: '1rem' }}>Gateway Expansion Timeout</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                The request to expand the resource graph exceeded the system threshold of 10,000ms. 
                Detected non-optimized sequential I/O operations.
              </p>
            </div>
          ) : (
            <div className="fade-in">
               <div style={{ display: 'flex', justifyContent: 'center', gap: '6rem', marginBottom: '4rem' }}>
                  <div>
                    <div className="card-title">Network Latency</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: stressReport.actualTime > 2000 ? 'var(--danger)' : 'var(--accent)' }}>
                      {stressReport.actualTime}<span style={{ fontSize: '1rem' }}>ms</span>
                    </div>
                  </div>
                  <div>
                    <div className="card-title">Atomic I/O Ops</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 900 }}>{stressReport.performance_metrics.io_operations}</div>
                  </div>
               </div>
               
               <div style={{ maxWidth: '700px', margin: '0 auto', background: 'rgba(239, 68, 68, 0.05)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--danger)', marginBottom: '1.5rem', fontWeight: 900, fontSize: '1.25rem' }}>
                    <AlertTriangle size={28} /> PERFORMANCE ALERT: N+1 DETECTION
                  </div>
                  <p style={{ fontSize: '1rem', color: 'var(--text-muted)', textAlign: 'left', lineHeight: 1.7 }}>
                    The graph expansion logic utilized linear resolution for nested child nodes. 
                    Calculated throughput efficiency is below enterprise standards. Recommendation: Implement batch eager loading.
                  </p>
                  <div style={{ marginTop: '2rem', textAlign: 'left', background: '#020617', padding: '1.5rem', borderRadius: '12px', color: 'var(--danger)', fontFamily: 'Roboto Mono', fontSize: '0.8rem' }}>
                    {`[ANALYSIS] N+1 Query Loop Detected at ExpansionModule:L157`}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="app-container">
      <AnimatePresence>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} exit={{ opacity: 0 }} className="loading-bar"></motion.div>}
      </AnimatePresence>
      
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Server color="var(--primary)" size={28} />
          <span>NEXUS CORE OPS</span>
        </div>
        
        <ul className="nav-menu">
          <li className={`nav-item ${activeMenu === 'overview' ? 'active' : ''}`} onClick={() => setActiveMenu('overview')}>
            <LayoutDashboard size={20} /> Dashboard
          </li>
          <li className={`nav-item ${activeMenu === 'inventory' || activeMenu === 'induction' ? 'active' : ''}`} onClick={() => setActiveMenu('inventory')}>
            <Package size={20} /> Inventory Control
          </li>
          <li className={`nav-item ${activeMenu === 'orders' ? 'active' : ''}`} onClick={() => setActiveMenu('orders')}>
            <ShoppingCart size={20} /> Procurement Logs
          </li>
          <div style={{ height: '1px', background: 'var(--border)', margin: '1.5rem 0' }}></div>
          <li className={`nav-item ${activeMenu === 'integrity' ? 'active' : ''}`} onClick={() => setActiveMenu('integrity')}>
            <ShieldCheck size={20} /> Data Governance
          </li>
          <li className={`nav-item ${activeMenu === 'legacy' ? 'active' : ''}`} onClick={() => setActiveMenu('legacy')}>
            <RefreshCw size={20} /> API Infrastructure
          </li>
          <li className={`nav-item ${activeMenu === 'stress' ? 'active' : ''}`} onClick={() => setActiveMenu('stress')}>
            <Zap size={20} /> Compute Optimization
          </li>
        </ul>

        <div style={{ marginTop: 'auto', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>NODE STATUS</div>
          <div className="health-status">
            <div className={`status-dot ${health?.ok ? 'healthy' : ''}`}></div>
            <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 800 }}>{health?.ok ? 'OPERATIONAL' : 'OFFLINE'}</span>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>Nexus Console</h1>
            <div className="env-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Production Node v2.4.1</div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Systems Admin</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Root Authority</div>
            </div>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, var(--primary), #818CF8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.25rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>A</div>
          </div>
        </header>

        <main className="content-body">
          <AnimatePresence mode="wait">
            {systemAlert && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bug-alert" 
                style={{ borderLeft: `4px solid ${systemAlert.type === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)'}` }}
              >
                <AlertTriangle color={systemAlert.type === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)'} size={24} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>SYSTEM ANOMALY: {systemAlert.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Correlation ID: <span className="bug-id">{systemAlert.id}</span> | {systemAlert.message}
                  </div>
                </div>
                <button onClick={() => setSystemAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeMenu === 'overview' && renderOverview()}
              {activeMenu === 'inventory' && renderInventory()}
              {activeMenu === 'induction' && renderInduction()}
              {activeMenu === 'orders' && renderOrders()}
              {activeMenu === 'integrity' && renderIntegrity()}
              {activeMenu === 'legacy' && renderLegacySync()}
              {activeMenu === 'stress' && renderStressTest()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Asset Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay" 
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content" 
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{selectedProduct.name}</h2>
                  <code className="mono" style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedProduct.sku}</code>
                </div>
                <button onClick={() => setSelectedProduct(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', color: '#fff' }}><X size={24} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div>
                    <label>Resource Valuation</label>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>${selectedProduct.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <label>Node Capacity</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: selectedProduct.stock > 10 ? 'var(--accent)' : 'var(--warning)' }}></div>
                      <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>{selectedProduct.stock} Active Clusters</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label>Deployment Parameters</label>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>{selectedProduct.description}</p>
                  <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
                    <span className={`badge badge-${selectedProduct.status}`}>{selectedProduct.status}</span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{selectedProduct.visibility}</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '4rem', display: 'flex', gap: '1.5rem' }}>
                <button className="btn btn-primary" style={{ flex: 1, height: '56px' }} onClick={() => setSelectedProduct(null)}>Modify Deployment</button>
                <button className="btn btn-outline" style={{ height: '56px', padding: '0 2rem' }} onClick={() => setSelectedProduct(null)}>Terminate</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Protocol Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay" 
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content" 
              style={{ maxWidth: '900px' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>Procurement Protocol: {selectedOrder.id}</h2>
                  <div className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Timestamp: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', color: '#fff' }}><X size={24} /></button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '2.5rem' }}>
                <div className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>DESTINATION</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                     <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.5rem' }}>{selectedOrder.customerName[0]}</div>
                     <div>
                       <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedOrder.customerName}</div>
                       <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{selectedOrder.customer?.email}</div>
                     </div>
                  </div>
                  <div>
                    <label>Network Status</label>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>{selectedOrder.status.toUpperCase()}</span>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>RESOURCE LOADOUT</h4>
                  <div className="table-container" style={{ border: 'none', background: 'rgba(255,255,255,0.01)' }}>
                    <table style={{ background: 'transparent' }}>
                      <thead>
                        <tr>
                          <th>Asset Name</th>
                          <th style={{ textAlign: 'right' }}>Qty</th>
                          <th style={{ textAlign: 'right' }}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{item.product?.name || 'Unknown Asset'}</div>
                              <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.productId}</div>
                            </td>
                            <td style={{ textAlign: 'right' }} className="mono">{item.quantity}</td>
                            <td style={{ textAlign: 'right' }} className="mono">${item.price.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <span style={{ fontWeight: 800 }}>Total Throughput</span>
                    <span className="mono" style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.25rem' }}>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
