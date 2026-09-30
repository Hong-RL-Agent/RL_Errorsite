import React, { useState, useEffect } from 'react';

const MENU_ITEMS = [
  { id: 'summary', label: 'Account Dashboard' },
  { id: 'orders', label: 'My Orders' },
  { id: 'profile', label: 'Profile' },
  { id: 'reports', label: 'Purchase Reports' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'files', label: 'My Files' },
  { id: 'messages', label: 'Messages' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'cart', label: 'Cart' },
  { id: 'checkout', label: 'Checkout' }
];

export default function App() {
  const [activeMenu, setActiveMenu] = useState('summary');
  const [currentUser, setCurrentUser] = useState('userA');
  const [users, setUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [listData, setListData] = useState([]);
  const [detailedView, setDetailedView] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Manual code search fields
  const [searchCategory, setSearchCategory] = useState('orders');
  const [searchId, setSearchId] = useState('');
  const [searchType, setSearchType] = useState('vulnerable'); // vulnerable or safe

  // Load session users on mount
  useEffect(() => {
    fetch('/api/session/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to load users', err));
  }, []);

  // Fetch dashboard or list data depending on activeMenu and currentUser
  useEffect(() => {
    setDetailedView(null);
    setDetailError(null);
    if (activeMenu === 'summary') {
      fetch('/api/me/summary')
        .then(res => res.json())
        .then(data => setDashboardData(data))
        .catch(err => console.error('Failed to load dashboard', err));
    } else {
      fetch(`/api/me/${activeMenu}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setListData(data);
          } else {
            // Some single object endpoints like profile, cart, checkout
            setListData(data ? [data] : []);
          }
        })
        .catch(err => console.error(`Failed to load ${activeMenu}`, err));
    }
  }, [activeMenu, currentUser]);

  const handleUserSwitch = (userId) => {
    fetch('/api/session/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data.activeUser);
      })
      .catch(err => console.error('Switch user error', err));
  };

  const handleLookup = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setDetailLoading(true);
    setDetailedView(null);
    setDetailError(null);

    const pathPrefix = searchType === 'safe' ? `/api/safe/${searchCategory}` : `/api/${searchCategory}`;
    fetch(`${pathPrefix}/${searchId.trim()}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.error || 'Server error or resource not accessible');
        }
        return body;
      })
      .then((data) => {
        setDetailedView(data);
      })
      .catch((err) => {
        setDetailError(err.message);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  const loadResourceDirectly = (category, id) => {
    setDetailLoading(true);
    setDetailedView(null);
    setDetailError(null);

    fetch(`/api/${category}/${id}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.error || 'Server error or resource not accessible');
        }
        return body;
      })
      .then((data) => {
        setDetailedView(data);
        // Scroll view to top or to lookups
      })
      .catch((err) => {
        setDetailError(err.message);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  const renderSummaryDashboard = () => {
    if (!dashboardData) return <div>Loading account overview...</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="panel-card" style={{ flex: '1', minWidth: '200px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Client</span>
            <strong style={{ fontSize: '1.25rem' }}>{dashboardData.user?.name}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{dashboardData.user?.tier}</span>
          </div>
          <div className="panel-card" style={{ flex: '1', minWidth: '150px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Orders History</span>
            <strong style={{ fontSize: '1.75rem' }}>{dashboardData.recentOrdersCount}</strong>
          </div>
          <div className="panel-card" style={{ flex: '1', minWidth: '150px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Statements</span>
            <strong style={{ fontSize: '1.75rem' }}>{dashboardData.recentInvoicesCount}</strong>
          </div>
        </div>
        
        <div className="panel-card">
          <h3 className="panel-card-title">System Status & Activity</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            All operations are fully functional. You have {dashboardData.unreadMessagesCount} unread system notifications waiting in your mail panel.
          </p>
        </div>
      </div>
    );
  };

  const renderResourceList = () => {
    if (!listData || listData.length === 0) {
      return (
        <div className="alert alert-info">
          No records or items registered for your current session profile.
        </div>
      );
    }

    return (
      <div className="card-grid">
        {listData.map((item, idx) => {
          if (!item) return null;
          return (
            <div className="resource-card" key={item.id || idx}>
              <div className="card-header">
                <span className="card-id">{item.id}</span>
                {item.status && (
                  <span className={`card-status ${item.status === 'Shipped' || item.status === 'Delivered' || item.status === 'Paid' ? 'status-active' : 'status-pending'}`}>
                    {item.status}
                  </span>
                )}
              </div>
              <div className="card-body">
                {item.items && <div><strong>Items:</strong> {typeof item.items === 'string' ? item.items : JSON.stringify(item.items)}</div>}
                {item.total && <div><strong>Total:</strong> {item.total}</div>}
                {item.email && <div><strong>Email:</strong> {item.email}</div>}
                {item.phone && <div><strong>Phone:</strong> {item.phone}</div>}
                {item.filename && <div><strong>Filename:</strong> {item.filename} ({item.size})</div>}
                {item.subject && <div><strong>Subject:</strong> {item.subject}</div>}
                {item.type && <div><strong>Type:</strong> {item.type}</div>}
                {item.amount && <div><strong>Amount:</strong> {item.amount} ({item.paymentStatus})</div>}
                {item.step && <div><strong>Current Step:</strong> {item.step}</div>}
              </div>
              <button 
                className="card-action-btn"
                onClick={() => loadResourceDirectly(activeMenu === 'profile' ? 'profiles' : activeMenu === 'files' ? 'files' : activeMenu === 'messages' ? 'messages' : activeMenu === 'appointments' ? 'appointments' : activeMenu === 'cart' ? 'carts' : activeMenu === 'checkout' ? 'checkouts' : activeMenu, item.id)}
              >
                Inspect Details
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-section">
          <div className="logo-icon">E</div>
          <div className="brand-name">Enterprise Self-Service Center</div>
        </div>
        <div className="header-controls">
          <div className="user-session-badge">
            <div className="user-indicator"></div>
            <span>Current session: <strong>{currentUser === 'userA' ? 'Alice J.' : 'Bob S.'}</strong></span>
          </div>
          <select 
            className="user-switcher" 
            value={currentUser} 
            onChange={(e) => handleUserSwitch(e.target.value)}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.id})</option>
            ))}
          </select>
        </div>
      </header>

      <div className="layout-body">
        <aside className="sidebar">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <main className="main-content">
          <div className="content-section">
            <h2 className="section-title">
              {MENU_ITEMS.find(i => i.id === activeMenu)?.label}
            </h2>
            
            {activeMenu === 'summary' ? renderSummaryDashboard() : renderResourceList()}

            {/* Detail View Presentation Card */}
            {(detailedView || detailLoading || detailError) && (
              <div className="detail-view-card" style={{ marginTop: '2rem' }}>
                <div className="detail-view-header">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Inspection Workspace</h3>
                  {detailedView && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status: 200 OK</span>}
                </div>
                {detailLoading && <div>Loading resource...</div>}
                {detailError && <div className="alert alert-error">{detailError}</div>}
                {detailedView && (
                  <div>
                    <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div className="detail-info-row">
                        <span className="detail-label">Endpoint Request</span>
                        <span className="detail-value" style={{ fontFamily: 'monospace' }}>{detailedView.request}</span>
                      </div>
                      <div className="detail-info-row">
                        <span className="detail-label">Client Identity Role</span>
                        <span className="detail-value">{detailedView.role}</span>
                      </div>
                      <div className="detail-info-row">
                        <span className="detail-label">Resource ID Code</span>
                        <span className="detail-value">{detailedView.data?.id}</span>
                      </div>
                    </div>
                    
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Resource Fields</h4>
                    <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem', color: '#60a5fa' }}>
                      {JSON.stringify(detailedView.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="right-panel">
            <div className="panel-card">
              <h3 className="panel-card-title">Document & Order Query</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Directly retrieve specific item parameters or customer registries by their system index identifiers.
              </p>
              
              <form className="lookup-form" onSubmit={handleLookup}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Topic Index</label>
                  <select 
                    className="lookup-select" 
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="orders">Orders</option>
                    <option value="profiles">Profiles</option>
                    <option value="reports">Reports</option>
                    <option value="invoices">Invoices</option>
                    <option value="files">Files</option>
                    <option value="messages">Messages</option>
                    <option value="appointments">Appointments</option>
                    <option value="carts">Cart</option>
                    <option value="checkouts">Checkout</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resource ID Code</label>
                  <input 
                    type="text" 
                    className="lookup-input" 
                    placeholder="e.g., ord-2001, prof-202"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Query Routing Mode</label>
                  <select 
                    className="lookup-select" 
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="vulnerable">Direct Access (Primary)</option>
                    {/* Allow safe mode for comparison checks on orders and profiles */}
                    {(searchCategory === 'orders' || searchCategory === 'profiles') && (
                      <option value="safe">Access Control Policy Checked</option>
                    )}
                  </select>
                </div>

                <button type="submit" className="lookup-btn">Query System</button>
              </form>
            </div>

            <div className="panel-card">
              <h3 className="panel-card-title">Recent Event Log</h3>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Session context updated.</li>
                <li style={{ marginBottom: '0.5rem' }}>Synchronized catalog values.</li>
                <li>Secure server connection established.</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
