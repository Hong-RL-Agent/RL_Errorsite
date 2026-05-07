import React, { useState, useEffect } from 'react';
import { 
  History, 
  MapPin, 
  Calendar, 
  Search, 
  Star, 
  ChevronRight, 
  ShieldAlert, 
  X,
  LayoutDashboard,
  Clock,
  ExternalLink,
  BookMarked,
  Info,
  Database,
  FileJson,
  Fingerprint,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:9137/api';

const EventCard = ({ event, onClick, onBookmark, isBookmarked }) => (
  <motion.div 
    className="timeline-item"
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <div className="timeline-dot" />
    <div className="event-year">
      {event.year < 0 ? `B.C. ${Math.abs(event.year)}` : `A.D. ${event.year}`}
      <div style={{ height: '1px', width: '30px', background: 'var(--gold-primary)' }} />
      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{event.significance}</span>
    </div>
    <div className="event-card" onClick={() => onClick(event)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 className="event-title">{event.title}</h3>
        <button 
          className="btn-bookmark" 
          onClick={(e) => { e.stopPropagation(); onBookmark(event); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? 'var(--gold-primary)' : 'rgba(255,255,255,0.2)' }}
        >
          <BookMarked size={20} fill={isBookmarked ? 'var(--gold-primary)' : 'none'} />
        </button>
      </div>
      <div className="event-meta">
        <span className="meta-item"><MapPin size={16} color="var(--gold-primary)" /> {event.location}</span>
        <span className="meta-item"><Database size={16} /> Chronos #0{event.id}</span>
      </div>
      <p className="garamond" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
        {event.description?.substring(0, 150)}...
      </p>
      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--gold-primary)', fontWeight: 600, letterSpacing: '0.1em' }}>
        ACCESS ARCHIVE <ChevronRight size={14} />
      </div>
    </div>
  </motion.div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('explorer');
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [activeBug, setActiveBug] = useState(null);
  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    fetchSummary();
    fetchArchive('explorer');
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await response.json();
      setSummary(data);
    } catch (err) {}
  };

  const fetchArchive = async (tab) => {
    setActiveTab(tab);
    setLoading(true);
    setActiveBug(null);
    try {
      const response = await fetch(`${API_BASE}/events`);
      const res = await response.json();
      setEvents(res.data);
      if (res.bugId) {
        setActiveBug({
          id: res.bugId,
          type: "Metadata Exposure",
          desc: "Internal system identifiers and archivist metadata are leaking in detailed records."
        });
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const fetchHighlights = async () => {
    setActiveTab('highlights');
    setLoading(true);
    setActiveBug(null);
    try {
      const response = await fetch(`${API_BASE}/events/popular`);
      const res = await response.json();
      setEvents(res.data);
      if (res.bugId) {
        setActiveBug({
          id: res.bugId,
          type: "Sequencing Mismatch",
          desc: "Curated highlight sorting algorithm is returning non-deterministic order."
        });
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const fetchIndex = async (page) => {
    setActiveTab('index');
    setLoading(true);
    setActiveBug(null);
    try {
      const response = await fetch(`${API_BASE}/events?page=${page}`);
      const res = await response.json();
      setEvents(res.data || []);
      setCursor(res.cursor);
      if (res.bugId) {
        setActiveBug({
          id: res.bugId,
          type: "Indexing Legacy Mode",
          desc: "System reverted to legacy page-based indexing, causing mapping errors."
        });
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const expandIndex = async (targetCursor) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/events?cursor=${targetCursor}`);
      const res = await response.json();
      setEvents(res.data || []);
      setCursor(res.nextCursor);
      if (res.bugId) {
        setActiveBug({
          id: res.bugId,
          type: "Expansion Fault",
          desc: "Recursive stream expansion failed. Next cursor token returned null."
        });
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setActiveTab('search');
    setLoading(true);
    setActiveBug(null);
    try {
      const response = await fetch(`${API_BASE}/search?q=${searchQuery}`);
      const res = await response.json();
      setEvents(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const toggleBookmark = (event) => {
    if (bookmarks.find(b => b.id === event.id)) {
      setBookmarks(bookmarks.filter(b => b.id !== event.id));
    } else {
      setBookmarks([...bookmarks, event]);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-text">CHRONOS</div>
          <div className="logo-subtext">DIGITAL ARCHIVE</div>
        </div>
        
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'explorer' ? 'active' : ''}`}
            onClick={() => fetchArchive('explorer')}
          >
            <History size={20} /> Explorer
          </button>
          <button 
            className={`nav-item ${activeTab === 'highlights' ? 'active' : ''}`}
            onClick={fetchHighlights}
          >
            <Star size={20} /> Highlights
          </button>
          <button 
            className={`nav-item ${activeTab === 'index' ? 'active' : ''}`}
            onClick={() => fetchIndex(1)}
          >
            <Clock size={20} /> Archival Index
          </button>
          <button 
            className={`nav-item ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            <BookMarked size={20} /> Collection ({bookmarks.length})
          </button>
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', border: '1px solid var(--gold-muted)' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--gold-primary)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SYSTEM STATUS</div>
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }} />
            Nexus Core Connected
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="cinzel">
              {activeTab === 'explorer' && "Historical Explorer"}
              {activeTab === 'highlights' && "Curated Highlights"}
              {activeTab === 'index' && "Archival Index"}
              {activeTab === 'collection' && "Personal Collection"}
              {activeTab === 'dashboard' && "Archive Analytics"}
              {activeTab === 'search' && "Search Results"}
            </h1>
            <p className="garamond">Exploring the collective wisdom of human civilization across the ages.</p>
          </motion.div>
        </header>

        {/* Search Bar (Persistent) */}
        <form onSubmit={handleSearch} className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search artifacts by title, location, or significance..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-gold"><Search size={20} /></button>
        </form>

        {/* Anomaly Banner */}
        <AnimatePresence>
          {activeBug && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="anomaly-banner"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <ShieldAlert size={28} color="var(--crimson)" />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '1rem', color: '#fff' }}>SYSTEM ANOMALY DETECTED: {activeBug.type}</strong>
                    <span className="bug-tag">{activeBug.id}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{activeBug.desc}</div>
                </div>
              </div>
              <X size={20} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setActiveBug(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{ width: '40px', height: '40px', border: '2px solid var(--gold-muted)', borderTopColor: 'var(--gold-primary)', borderRadius: '50%' }}
            />
          </div>
        ) : (
          <div className="view-content">
            {/* Timeline Views (Explorer, Highlights, Search) */}
            {['explorer', 'highlights', 'search'].includes(activeTab) && (
              <div className="timeline-list">
                {events.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={setSelectedEvent} 
                    onBookmark={toggleBookmark}
                    isBookmarked={!!bookmarks.find(b => b.id === event.id)}
                  />
                ))}
              </div>
            )}

            {/* Index View with Pagination Bug */}
            {activeTab === 'index' && (
              <div>
                <div className="timeline-list">
                  {events.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onClick={setSelectedEvent} 
                      onBookmark={toggleBookmark}
                      isBookmarked={!!bookmarks.find(b => b.id === event.id)}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '4rem' }}>
                  <button className="btn-gold" onClick={() => fetchIndex(1)}>Legacy Page 1</button>
                  <button className="btn-gold" onClick={() => fetchIndex(2)}>Legacy Page 2</button>
                  <button 
                    className="btn-gold" 
                    style={{ background: 'rgba(212,175,55,0.1)', borderColor: 'var(--gold-primary)', color: 'var(--gold-primary)' }}
                    onClick={() => expandIndex(cursor)}
                    disabled={!cursor && activeBug?.id === 'site028-bug03'}
                  >
                    Expand Recursive Stream <Zap size={14} style={{ marginLeft: '0.5rem' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Collection View */}
            {activeTab === 'collection' && (
              <div>
                {bookmarks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '10rem', border: '1px dashed var(--gold-muted)', borderRadius: '12px' }}>
                    <BookMarked size={48} color="var(--gold-muted)" style={{ marginBottom: '1.5rem' }} />
                    <h3 className="cinzel" style={{ color: 'var(--gold-muted)' }}>Collection is empty</h3>
                    <p className="garamond">Bookmark artifacts to build your personal archive.</p>
                  </div>
                ) : (
                  <div className="timeline-list">
                    {bookmarks.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onClick={setSelectedEvent} 
                        onBookmark={toggleBookmark}
                        isBookmarked={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <div className="fade-in">
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-value">{summary?.total_artifacts}</span>
                    <span className="stat-label">Total Artifacts</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{summary?.verified_milestones}</span>
                    <span className="stat-label">Verified Milestones</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{summary?.archive_uptime}</span>
                    <span className="stat-label">Node Uptime</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value" style={{ color: '#10B981' }}>{summary?.data_integrity}</span>
                    <span className="stat-label">Integrity Status</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-slate)', border: '1px solid var(--border-gold)', padding: '3rem', borderRadius: '12px' }}>
                  <h3 className="cinzel" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Info size={24} color="var(--gold-primary)" /> Archival Management
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ padding: '2rem', border: '1px solid var(--gold-muted)', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--gold-primary)' }}>Integrity Audit</strong>
                      <p className="garamond" style={{ fontSize: '0.9rem', margin: '1rem 0' }}>Perform a full sector scan of the digital archive to ensure data consistency.</p>
                      <button className="btn-gold" style={{ width: '100%' }} onClick={() => alert("Audit sequence initiated...")}>Start Audit</button>
                    </div>
                    <div style={{ padding: '2rem', border: '1px solid var(--gold-muted)', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--gold-primary)' }}>Forensic Recovery</strong>
                      <p className="garamond" style={{ fontSize: '0.9rem', margin: '1rem 0' }}>Extract hidden metadata layers from damaged artifact records.</p>
                      <button className="btn-gold" style={{ width: '100%' }} onClick={() => fetchArchive('explorer')}>Initialize Forensic Lab</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Artifact Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setSelectedEvent(null)}
              >
                <X size={32} />
              </button>

              <div className="event-year" style={{ fontSize: '2rem' }}>
                {selectedEvent.year < 0 ? `B.C. ${Math.abs(selectedEvent.year)}` : `A.D. ${selectedEvent.year}`}
              </div>
              <h2 className="cinzel" style={{ fontSize: '3.5rem', margin: '1rem 0 2rem 0', color: 'var(--gold-primary)' }}>
                {selectedEvent.title}
              </h2>
              
              <div className="event-meta" style={{ marginBottom: '3rem', fontSize: '1.1rem' }}>
                <span className="meta-item"><MapPin size={24} color="var(--gold-primary)" /> {selectedEvent.location}</span>
                <span className="meta-item"><Fingerprint size={24} color="var(--gold-primary)" /> AUTHENTICATED RECORD</span>
              </div>

              <div className="garamond" style={{ fontSize: '1.4rem', lineHeight: '1.8', color: 'var(--text-parchment)', marginBottom: '3rem' }}>
                {selectedEvent.description}
                <br /><br />
                This event represents a critical nexus point in the Chronos Archive. Its implications echo through the centuries, shaping the socio-political landscape of the modern era.
              </div>

              {/* Bug 01 Integration: Professional Forensic Lab Data */}
              <div className="forensic-data">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  <FileJson size={20} color="var(--crimson)" />
                  <span className="forensic-label">DIGITAL FORENSIC RECOVERY: LAYER 01 (SYSTEM METADATA)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>ARCHIVIST_ID:</span> 
                    <span style={{ color: 'var(--crimson)', marginLeft: '1rem' }}>{selectedEvent._metadata?.archivist_id}</span>
                  </div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>INTERNAL_CHECKSUM:</span> 
                    <span style={{ color: 'var(--crimson)', marginLeft: '1rem' }}>{selectedEvent._metadata?.internal_checksum}</span>
                  </div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>BRAIN_SCAN_REFERENCE:</span> 
                    <span style={{ color: 'var(--crimson)', marginLeft: '1rem' }}>{selectedEvent._metadata?.brain_scan_id}</span>
                  </div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>AUDIT_TRAIL:</span> 
                    <span style={{ color: 'var(--crimson)', marginLeft: '1rem' }}>{selectedEvent._metadata?.last_audit_log}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>CHRONOS_ARCHIVE_SECURE_NODE_028</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <ExternalLink size={16} />
                  <Info size={16} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
