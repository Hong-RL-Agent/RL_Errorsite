import React, { useState, useEffect } from 'react';

const MENU_ITEMS = [
  { id: 'summary', label: 'Patient Dashboard' },
  { id: 'medical-records', label: 'Medical Records' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'lab-results', label: 'Lab Results' },
  { id: 'medical-images', label: 'Medical Images' },
  { id: 'visit-history', label: 'Visit History' },
  { id: 'insurance-claims', label: 'Insurance Claims' },
  { id: 'payments', label: 'Payments' },
  { id: 'health-documents', label: 'Health Documents' },
  { id: 'health-checkup', label: 'Health Checkup' }
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

  // Manual query search fields
  const [searchCategory, setSearchCategory] = useState('medical-records');
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
        .catch(err => console.error('Failed to load dashboard summary', err));
    } else {
      fetch(`/api/me/${activeMenu}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setListData(data);
          } else {
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
      })
      .catch((err) => {
        setDetailError(err.message);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  const renderSummaryDashboard = () => {
    if (!dashboardData) return <div>Loading patient profile summary...</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="panel-card" style={{ flex: '1', minWidth: '220px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Patient Name</span>
            <strong style={{ fontSize: '1.25rem' }}>{dashboardData.user?.name}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>DOB: {dashboardData.user?.dob}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>System ID: {dashboardData.user?.healthId}</span>
          </div>
          <div className="panel-card" style={{ flex: '1', minWidth: '150px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Appointments</span>
            <strong style={{ fontSize: '1.75rem' }}>{dashboardData.appointmentsCount}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upcoming sessions</span>
          </div>
          <div className="panel-card" style={{ flex: '1', minWidth: '150px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Insurance Claims</span>
            <strong style={{ fontSize: '1.75rem' }}>{dashboardData.activeClaimsCount}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filed claims</span>
          </div>
        </div>
        
        <div className="panel-card">
          <h3 className="panel-card-title">Patient Plan & Benefits</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Your current coverage plan: <strong>{dashboardData.user?.tier}</strong>.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Completed general checkups: {dashboardData.checkupsCompleted}. Please schedule your quarterly assessment if you haven't yet done so.
          </p>
        </div>
      </div>
    );
  };

  const renderResourceList = () => {
    if (!listData || listData.length === 0) {
      return (
        <div className="alert alert-info">
          No medical records found under your current clinic account.
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
                  <span className={`card-status ${item.status === 'Confirmed' || item.status === 'Approved' || item.status === 'Final Result' || item.status === 'Complete' ? 'status-active' : 'status-pending'}`}>
                    {item.status}
                  </span>
                )}
              </div>
              <div className="card-body">
                {item.diagnosis && <div><strong>Diagnosis:</strong> {item.diagnosis} ({item.severity})</div>}
                {item.provider && <div><strong>Provider:</strong> {item.provider}</div>}
                {item.department && <div><strong>Department:</strong> {item.department}</div>}
                {item.purpose && <div><strong>Purpose:</strong> {item.purpose}</div>}
                {item.dateTime && <div><strong>Schedule:</strong> {item.dateTime}</div>}
                {item.medication && <div><strong>Medication:</strong> {item.medication} ({item.dosage})</div>}
                {item.testName && <div><strong>Lab Test:</strong> {item.testName}</div>}
                {item.referenceRange && <div><strong>Reference Range:</strong> {item.referenceRange}</div>}
                {item.studyName && <div><strong>Imaging Study:</strong> {item.studyName} ({item.modality})</div>}
                {item.visitType && <div><strong>Visit Type:</strong> {item.visitType}</div>}
                {item.billingAmount && <div><strong>Billing Amount:</strong> {item.billingAmount}</div>}
                {item.insurer && <div><strong>Carrier:</strong> {item.insurer}</div>}
                {item.claimNumber && <div><strong>Claim No:</strong> {item.claimNumber}</div>}
                {item.receiptNumber && <div><strong>Receipt No:</strong> {item.receiptNumber}</div>}
                {item.paymentMethod && <div><strong>Method:</strong> {item.paymentMethod}</div>}
                {item.title && <div><strong>Doc Title:</strong> {item.title} ({item.category})</div>}
                {item.package && <div><strong>Screening Package:</strong> {item.package}</div>}
                {item.score && <div><strong>Score:</strong> {item.score}</div>}
              </div>
              <button 
                className="card-action-btn"
                onClick={() => {
                  let categoryRoute = activeMenu;
                  if (activeMenu === 'medical-records') categoryRoute = 'medical-records';
                  else if (activeMenu === 'appointments') categoryRoute = 'appointments';
                  else if (activeMenu === 'prescriptions') categoryRoute = 'prescriptions';
                  else if (activeMenu === 'lab-results') categoryRoute = 'lab-results';
                  else if (activeMenu === 'medical-images') categoryRoute = 'medical-images';
                  else if (activeMenu === 'visit-history') categoryRoute = 'visit-history';
                  else if (activeMenu === 'insurance-claims') categoryRoute = 'insurance-claims';
                  else if (activeMenu === 'payments') categoryRoute = 'payments';
                  else if (activeMenu === 'health-documents') categoryRoute = 'health-documents';
                  else if (activeMenu === 'health-checkup') categoryRoute = 'health-checkup';
                  loadResourceDirectly(categoryRoute, item.id);
                }}
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
          <div className="logo-icon">H</div>
          <div className="brand-name">St. Jude Patient Care Portal</div>
        </div>
        <div className="header-controls">
          <div className="user-session-badge">
            <div className="user-indicator"></div>
            <span>Active Patient: <strong>{currentUser === 'userA' ? 'Alice J.' : 'Bob S.'}</strong></span>
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

            {/* Inspect Detail Card Panel */}
            {(detailedView || detailLoading || detailError) && (
              <div className="detail-view-card" style={{ marginTop: '2rem' }}>
                <div className="detail-view-header">
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '600' }}>Patient Records Workspace</h3>
                  {detailedView && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status: 200 OK</span>}
                </div>
                {detailLoading && <div>Retrieving record details...</div>}
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
                        <span className="detail-label">Record Index ID</span>
                        <span className="detail-value">{detailedView.data?.id}</span>
                      </div>
                    </div>
                    
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Resource Fields</h4>
                    <pre style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                      {JSON.stringify(detailedView.data, null, 2)}
                    </pre>
                    {detailedView.role === 'userA' && detailedView.response_owner === 'userB' && (
                      <button 
                        onClick={() => {
                          let bugNum = '';
                          const reqPath = detailedView.request || '';
                          if (reqPath.includes('/medical-records/')) bugNum = '10';
                          else if (reqPath.includes('/appointments/')) bugNum = '11';
                          else if (reqPath.includes('/prescriptions/')) bugNum = '12';
                          else if (reqPath.includes('/lab-results/')) bugNum = '13';
                          else if (reqPath.includes('/medical-images/')) bugNum = '14';
                          else if (reqPath.includes('/visit-history/')) bugNum = '15';
                          else if (reqPath.includes('/insurance-claims/')) bugNum = '16';
                          else if (reqPath.includes('/payments/')) bugNum = '17';
                          else if (reqPath.includes('/health-documents/')) bugNum = '18';
                          else if (reqPath.includes('/health-checkup/')) bugNum = '19';
                          
                          alert(`System Case Diagnostics: Verified Case #${bugNum}`);
                        }}
                        style={{
                          marginTop: '1.25rem',
                          backgroundColor: '#f59e0b',
                          color: '#070c19',
                          border: 'none',
                          padding: '0.75rem 1.25rem',
                          borderRadius: '6px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        Verify Case Diagnostics
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="right-panel">
            <div className="panel-card">
              <h3 className="panel-card-title">System Document Query</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Directly retrieve specific diagnoses, imaging metadata or claims using patient index reference numbers.
              </p>
              
              <form className="lookup-form" onSubmit={handleLookup}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Record Category</label>
                  <select 
                    className="lookup-select" 
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="medical-records">Medical Records</option>
                    <option value="appointments">Appointments</option>
                    <option value="prescriptions">Prescriptions</option>
                    <option value="lab-results">Lab Results</option>
                    <option value="medical-images">Medical Images</option>
                    <option value="visit-history">Visit History</option>
                    <option value="insurance-claims">Insurance Claims</option>
                    <option value="payments">Payments</option>
                    <option value="health-documents">Health Documents</option>
                    <option value="health-checkup">Health Checkup</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resource ID Code</label>
                  <input 
                    type="text" 
                    className="lookup-input" 
                    placeholder="e.g., rec-201, apt-201"
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
                    {/* Allow safe mode for comparison checks on medical records and appointments */}
                    {(searchCategory === 'medical-records' || searchCategory === 'appointments') && (
                      <option value="safe">Access Control Policy Checked</option>
                    )}
                  </select>
                </div>

                <button type="submit" className="lookup-btn">Query System</button>
              </form>
            </div>

            <div className="panel-card">
              <h3 className="panel-card-title">Recent Care Logs</h3>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Session security synchronized.</li>
                <li>EMR metadata cache refreshed.</li>
                <li>Clinic telemetry status: Normal.</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
