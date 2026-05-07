import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Upload as UploadIcon, 
  Tags as TagsIcon, 
  AlertCircle, 
  X, 
  CheckCircle, 
  Clock, 
  Info,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Search,
  LogOut,
  Settings,
  User,
  Trash2,
  Download,
  Filter,
  MoreVertical,
  Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'http://localhost:9186/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [images, setImages] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [bugToasts, setBugToasts] = useState([]);

  const addBugToast = (id, message) => {
    const toast = { id: Date.now(), bugId: id, message };
    setBugToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setBugToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 5000);
  };

  const fetchData = async (q = '') => {
    setLoading(true);
    try {
      const url = q ? `${API_BASE}/images?withTags=true&search=${q}` : `${API_BASE}/images?withTags=true`;
      const [imgRes, sumRes, logRes] = await Promise.all([
        fetch(url).then(r => r.json()),
        fetch(`${API_BASE}/dashboard/summary`).then(r => r.json()),
        fetch(`${API_BASE}/logs`).then(r => r.json())
      ]);
      setImages(imgRes.data);
      setSummary(sumRes);
      setLogs(logRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(searchQuery);
  };

  const handleUpload = async (fileName) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName })
      });
      const data = await res.json();
      if (data.bugId === 'site077-bug01') {
        addBugToast(data.bugId, "Critical: Upload buffer mismatch detected. Expected JPG but received PNG-encoded content.");
      }
      fetchData();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/images/${id}`);
      const data = await res.json();
      setSelectedImage(data);
    } catch (err) {
      console.error("Detail error:", err);
    }
  };

  const auditMetadata = (image) => {
    if (!image.metadata) {
      addBugToast('site077-bug02', 'Vulnerability: EXIF data block missing in image header. Metadata stripping loss detected.');
    } else {
      alert("Metadata integrity verified.");
    }
  };

  const validateThumbnails = () => {
    const distorted = images.filter(i => i.bugId === 'site077-bug03');
    if (distorted.length > 0) {
      addBugToast('site077-bug03', `UI Error: Aspect ratio distortion detected in ${distorted.length} thumbnails.`);
    } else {
      alert("Thumbnail rendering verified.");
    }
  };

  const runPipelineCheck = () => {
    const missing = images.filter(i => i.bugId === 'site077-bug04');
    if (missing.length > 0) {
      addBugToast('site077-bug04', `Pipeline Failure: Tag extraction skipped for ${missing.length} active assets.`);
    } else {
      alert("Analysis pipeline verified.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await fetch(`${API_BASE}/images/${id}`, { method: 'DELETE' });
      setSelectedImage(null);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch(`${API_BASE}/logs/clear`, { method: 'POST' });
      fetchData();
    } catch (err) {
      console.error("Clear logs error:", err);
    }
  };

  const handleSignOut = () => {
    alert("Signing out... (Session cleared)");
    window.location.reload();
  };

  const chartData = [
    { name: 'Mon', v: 400 }, { name: 'Tue', v: 300 }, { name: 'Wed', v: 600 },
    { name: 'Thu', v: 450 }, { name: 'Fri', v: 700 }, { name: 'Sat', v: 500 }, { name: 'Sun', v: 550 },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="logo">
          <RefreshCw className="spin" size={24} />
          <span>VISION AI</span>
        </div>
        
        <div className="nav-menu">
          <div 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => { console.log("Switching to dashboard"); setActiveTab('dashboard'); }}
          >
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </div>
          <div 
            className={`nav-link ${activeTab === 'gallery' ? 'active' : ''}`} 
            onClick={() => { console.log("Switching to gallery"); setActiveTab('gallery'); }}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <ImageIcon size={20} /> <span>Gallery</span>
          </div>
          <div 
            className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`} 
            onClick={() => { console.log("Switching to upload"); setActiveTab('upload'); }}
          >
            <UploadIcon size={20} /> <span>Upload</span>
          </div>
          <div 
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`} 
            onClick={() => { console.log("Switching to analytics"); setActiveTab('analytics'); }}
          >
            <Activity size={20} /> <span>Analytics</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="nav-link" onClick={() => alert("Settings - Beta")}>
            <Settings size={20} /> Settings
          </div>
          <div className="nav-link" onClick={handleSignOut} style={{ color: 'var(--danger)' }}>
            <LogOut size={20} /> Sign Out
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-wrapper">
        <header className="top-bar">
          <form className="search-box" onSubmit={handleSearch}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search images, tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="avatar">JD</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>John Doe</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Pro Administrator</div>
            </div>
            {showProfileMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => alert("Profile View")}><User size={16} /> My Profile</div>
                <div className="dropdown-item" onClick={() => alert("Billing")}><Activity size={16} /> Billing</div>
                <div className="dropdown-item" onClick={handleSignOut} style={{ color: 'var(--danger)' }}><LogOut size={16} /> Logout</div>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="tab-dashboard">
            <div className="grid-stats">
              <div className="stat-card">
                <div className="stat-label">Total Assets</div>
                <div className="stat-number">{summary?.totalImages || 0}</div>
                <div style={{ color: 'var(--success)', fontSize: '0.75rem' }}>+12% from last month</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Tags</div>
                <div className="stat-number">{summary?.totalTags || 0}</div>
                <div style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>Processing 5.2s avg</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Storage Used</div>
                <div className="stat-number">{summary?.storageUsed}</div>
                <div style={{ color: 'var(--warning)', fontSize: '0.75rem' }}>82% of capacity</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">System Health</div>
                <div className="stat-number">99.9%</div>
                <div style={{ color: 'var(--success)', fontSize: '0.75rem' }}>All clusters active</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
              <div className="stat-card" style={{ height: '400px' }}>
                <h3 style={{ marginBottom: '24px' }}>Processing Volume (7D)</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <ChartTooltip 
                      contentStyle={{ background: '#1e293b', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="v" stroke="var(--accent)" fillOpacity={1} fill="url(#colorV)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h3>System Logs</h3>
                  <button className="btn-action" style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '4px' }} onClick={handleClearLogs}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {logs.map(log => (
                    <div key={log.id} className="log-item">
                      <div>
                        <div style={{ fontWeight: 600 }}>{log.action}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="log-status" style={{ color: log.status === 'success' ? 'var(--success)' : 'var(--warning)' }}>
                        {log.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="tab-gallery">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-action" onClick={() => fetchData()}><Filter size={18} /> Filter</button>
                <button className="btn-action" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={validateThumbnails} data-bug-id="site077-bug03">
                  <Maximize2 size={18} /> Verify Ratios
                </button>
              </div>
              <button className="btn-action" onClick={() => setActiveTab('upload')}><UploadIcon size={18} /> New Upload</button>
            </div>

            <div className="gallery-grid">
              {images.map(img => (
                <div key={img.id} className="img-card" onClick={() => viewDetails(img.id)} data-bug-id={img.bugId === 'site077-bug03' ? 'site077-bug03' : ''}>
                  <div className="img-wrap">
                    <img 
                      src={img.url} 
                      alt={img.fileName} 
                      className={img.bugId === 'site077-bug03' ? 'img-distorted' : ''} 
                    />
                    {img.bugId === 'site077-bug03' && <div className="bug-badge" style={{ position: 'absolute', top: 12, right: 12 }}>DISTORTION</div>}
                  </div>
                  <div className="img-meta">
                    <div className="img-title">{img.fileName}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {img.tags.length > 0 ? (
                        img.tags.map(t => <span key={t} className="badge-tag">{t}</span>)
                      ) : (
                        <span className="badge-tag" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)' }} data-bug-id="site077-bug04">
                          MISSING_TAGS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="tab-upload">
            <div className="stat-card" style={{ textAlign: 'center', padding: '100px 40px' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ border: '2px dashed var(--border)', borderRadius: '24px', padding: '64px', cursor: 'pointer' }} 
                     onClick={() => handleUpload("vision_raw_data.jpg")} data-bug-id="site077-bug01">
                  <UploadIcon size={64} color="var(--accent)" style={{ marginBottom: '24px' }} />
                  <h2 style={{ marginBottom: '16px' }}>Secure Upload Gateway</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Drag and drop your AI training sets here. JPG, PNG, and RAW formats supported up to 500MB.
                  </p>
                  <button className="btn-action" style={{ margin: '0 auto' }}>Browse Files</button>
                </div>
                <div style={{ marginTop: '40px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700 }}>256-bit</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Encryption</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700 }}>Auto-Tag</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enabled</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-analytics">
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                <h3>Object Recognition Clusters</h3>
                <button className="btn-action" onClick={runPipelineCheck} data-bug-id="site077-bug04">
                  <Activity size={18} /> Audit Pipeline
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {Array.from(new Set(images.flatMap(i => i.tags))).map((tag, idx) => (
                  <div key={`${tag}-${idx}`} className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }} onClick={() => alert(`Tag: ${tag}`)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent)' }}>#{tag.toUpperCase()}</div>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bug Toasts */}
      <div className="bug-toast-layer">
        {bugToasts.map(toast => (
          <div key={toast.id} className="toast" data-bug-id={toast.bugId}>
            <AlertCircle color="var(--danger)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>BUG TRIGGERED: {toast.bugId}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{toast.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.url} alt="detail" className="modal-img" />
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{selectedImage.fileName}</h2>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Asset ID: {selectedImage.id}</div>
                </div>
                <X style={{ cursor: 'pointer' }} onClick={() => setSelectedImage(null)} />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
                {selectedImage.tags.map(t => <span key={t} className="badge-tag" style={{ fontSize: '0.875rem', padding: '6px 14px' }}>{t}</span>)}
              </div>

              <div className="stat-card" style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }} data-bug-id={selectedImage.bugId === 'site077-bug02' ? 'site077-bug02' : ''}>
                    <Info size={18} color="var(--accent)" /> EXIF METADATA
                  </h4>
                  <button 
                    className="btn-action" 
                    style={{ padding: '4px 12px', fontSize: '0.75rem' }} 
                    onClick={() => auditMetadata(selectedImage)}
                    data-bug-id="site077-bug02"
                  >
                    Audit
                  </button>
                </div>
                {selectedImage.metadata ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                      <div className="stat-label">Camera Body</div>
                      <div style={{ fontWeight: 600 }}>{selectedImage.metadata.camera}</div>
                    </div>
                    <div>
                      <div className="stat-label">ISO Sensitivity</div>
                      <div style={{ fontWeight: 600 }}>ISO {selectedImage.metadata.iso}</div>
                    </div>
                    <div>
                      <div className="stat-label">Aperture</div>
                      <div style={{ fontWeight: 600 }}>f/{selectedImage.metadata.f}</div>
                    </div>
                    <div>
                      <div className="stat-label">Lens Config</div>
                      <div style={{ fontWeight: 600 }}>Standard Prime</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--danger)', background: 'rgba(244, 63, 94, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    <AlertCircle size={18} style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700 }}>METADATA_STRIPPED</div>
                    <div style={{ fontSize: '0.75rem' }}>Core EXIF data block missing in response payload.</div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                <button className="btn-action" style={{ flex: 1 }} onClick={() => alert("Downloading asset...")}><Download size={18} /> Download RAW</button>
                <button className="btn-action btn-danger" onClick={() => handleDelete(selectedImage.id)}><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
