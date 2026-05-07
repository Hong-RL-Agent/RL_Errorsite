import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Search, 
  LayoutGrid, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  X, 
  AlertCircle,
  RefreshCw,
  SearchIcon,
  Filter,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [cards, setCards] = useState([]);
  const [popularCards, setPopularCards] = useState([]);
  const [summary, setSummary] = useState(null);
  const [circuitStatus, setCircuitStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [idolFilter, setIdolFilter] = useState('');
  
  // Bug tracking state for UI display
  const [activeBug, setActiveBug] = useState(null);

  useEffect(() => {
    fetchSummary();
    fetchCards();
    fetchCircuitStatus();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) { console.error(e); }
  };

  const fetchCards = async (simulateFailure = false, bug = '') => {
    setLoading(true);
    setError(null);
    setActiveBug(null);
    try {
      let url = `${API_BASE}/cards?`;
      if (simulateFailure) url += `simulateFailure=true&`;
      if (bug) url += `bug=${bug}&`;
      if (searchQuery) url += `search=${searchQuery}&`;
      if (idolFilter) url += `idol=${idolFilter}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Request failed");
        if (data.bugId) setActiveBug(data);
        return;
      }

      setCards(data.data || []);
      fetchCircuitStatus(); // Update status after successful request
    } catch (e) {
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPopular = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cards/popular`);
      const data = await res.json();
      setPopularCards(data.data || []);
      setActiveTab('popular');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCircuitStatus = async (bug = '') => {
    try {
      let url = `${API_BASE}/circuit/status`;
      if (bug) url += `?bug=${bug}`;
      const res = await fetch(url);
      const data = await res.json();
      setCircuitStatus(data);
      if (data.bugId) setActiveBug(data);
    } catch (e) { console.error(e); }
  };

  const handleLike = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/cards/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (selectedCard && selectedCard.id === id) {
        setSelectedCard({ ...selectedCard, likes: data.likes });
      }
      setCards(prev => prev.map(c => c.id === id ? { ...c, likes: data.likes } : c));
    } catch (e) { console.error(e); }
  };

  const resetCircuit = async () => {
    await fetch(`${API_BASE}/circuit/reset`, { method: 'POST' });
    fetchCircuitStatus();
    setError(null);
    setActiveBug(null);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Heart fill="#ff85a1" size={28} />
          <span>IDOL PC GALLERY</span>
        </div>

        <nav>
          <ul className="nav-menu">
            <li 
              className={`nav-item ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => { setActiveTab('gallery'); fetchCards(); }}
            >
              <LayoutGrid size={20} /> Gallery
            </li>
            <li 
              className={`nav-item ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={fetchPopular}
            >
              <TrendingUp size={20} /> Popular Cards
            </li>
            <li 
              className={`nav-item ${activeTab === 'circuit' ? 'active' : ''}`}
              onClick={() => { setActiveTab('circuit'); fetchCircuitStatus(); }}
            >
              <Zap size={20} /> Circuit Status
            </li>
            <li 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); fetchSummary(); }}
            >
              <BarChart3 size={20} /> Dashboard
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'var(--bg-light)', borderRadius: '20px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>SYSTEM HEALTH</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#38b2ac' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>STABLE</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div className="search-container">
            <SearchIcon size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search photocards..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCards()}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-trigger" style={{ margin: 0 }} onClick={resetCircuit}>
              <RefreshCw size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Reset Circuit
            </button>
            <div style={{ width: 45, height: 45, borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary-pink), var(--primary-purple))' }}></div>
          </div>
        </header>

        {activeBug && (
          <div className="error-banner">
            <AlertCircle size={32} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>LOGIC ERROR DETECTED: {activeBug.type}</div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
                The backend responded with an intentional vulnerability. ID: <span className="bug-id-tag">{activeBug.bugId}</span>
              </div>
            </div>
          </div>
        )}

        {error && !activeBug && (
          <div className="error-banner" style={{ background: '#ebf8ff', borderColor: '#90cdf4', color: '#2b6cb0' }}>
            <Info size={32} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Service Response</div>
              <div style={{ fontSize: '0.9rem' }}>{error}</div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="fade-in">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
              {['', 'IVE', 'NewJeans', 'LE SSERAFIM', 'aespa', 'NMIXX'].map(idol => (
                <button 
                  key={idol}
                  className={`btn-trigger ${idolFilter === idol ? 'active' : ''}`}
                  onClick={() => { setIdolFilter(idol); fetchCards(); }}
                  style={{ background: idolFilter === idol ? 'var(--primary-pink)' : 'white', color: idolFilter === idol ? 'white' : 'var(--primary-pink)' }}
                >
                  {idol || 'All Idols'}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loader-container"><div className="loader"></div></div>
            ) : (
              <div className="card-grid">
                {cards.map(card => (
                  <motion.div 
                    key={card.id} 
                    className="pc-card"
                    layoutId={`card-${card.id}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="pc-img-container">
                      <img src={card.img} alt={card.name} />
                    </div>
                    <div className="pc-content">
                      <div className="pc-idol">{card.idol}</div>
                      <div className="pc-name">{card.name}</div>
                      <div className="pc-footer">
                        <div className="likes-count">
                          <Heart size={16} fill="#ff85a1" color="#ff85a1" /> {card.likes}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="fade-in">
            <h2 style={{ marginBottom: '2rem' }}>🔥 Most Popular photocards</h2>
            <div className="card-grid">
              {popularCards.map(card => (
                <div key={card.id} className="pc-card" onClick={() => setSelectedCard(card)}>
                  <div className="pc-img-container" style={{ height: '260px' }}>
                    <img src={card.img} alt={card.name} />
                  </div>
                  <div className="pc-content">
                    <div className="pc-idol">{card.idol}</div>
                    <div className="pc-name">{card.name}</div>
                    <div className="pc-footer">
                      <div className="likes-count">
                        <Heart size={16} fill="#ff85a1" color="#ff85a1" /> {card.likes}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'circuit' && (
          <div className="circuit-dashboard fade-in">
            <h2 style={{ marginBottom: '2.5rem' }}>Circuit Breaker Control Panel</h2>
            
            <div className={`status-indicator status-${circuitStatus?.state || 'CLOSED'}`}>
              <Zap fill="currentColor" size={24} />
              SYSTEM STATE: {circuitStatus?.state || 'UNKNOWN'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div>
                <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Trigger Stability Tests</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <button 
                    className="btn-trigger" 
                    data-bug-id="site030-bug01"
                    onClick={() => fetchCards(true, 'not-opening')}
                  >
                    Test Failure Limit (Bug 01)
                  </button>
                  <button 
                    className="btn-trigger" 
                    data-bug-id="site030-bug02"
                    onClick={() => fetchCards(false, 'not-closing')}
                  >
                    Test Recovery (Bug 02)
                  </button>
                  <button 
                    className="btn-trigger" 
                    data-bug-id="site030-bug03"
                    onClick={() => fetchCards(false, 'flapping')}
                  >
                    Check Vibration (Bug 03)
                  </button>
                  <button 
                    className="btn-trigger" 
                    data-bug-id="site030-bug04"
                    onClick={() => fetchCircuitStatus('threshold')}
                  >
                    Verify Threshold (Bug 04)
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--bg-light)', padding: '2rem', borderRadius: '24px' }}>
                <h4 style={{ marginBottom: '1rem' }}>Configuration Details</h4>
                <p style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Failure Threshold:</span>
                  <span style={{ fontWeight: 800 }}>{circuitStatus?.threshold} requests</span>
                </p>
                <p style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Current Failures:</span>
                  <span style={{ fontWeight: 800 }}>{circuitStatus?.failures || 0}</span>
                </p>
                <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Reset Timeout:</span>
                  <span style={{ fontWeight: 800 }}>10,000ms</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h2 style={{ marginBottom: '2.5rem' }}>Gallery Summary</h2>
            <div className="summary-grid">
              <div className="summary-card">
                <span className="value">{summary?.totalCards}</span>
                <span className="label">Total Cards</span>
              </div>
              <div className="summary-card">
                <span className="value">{summary?.totalLikes?.toLocaleString()}</span>
                <span className="label">Total Fan Likes</span>
              </div>
              <div className="summary-card">
                <span className="value">99.9%</span>
                <span className="label">System Availability</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedCard && (
          <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
            <motion.div 
              className="modal-content"
              layoutId={`card-${selectedCard.id}`}
              onClick={e => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedCard(null)}><X size={20} /></button>
              <div className="modal-left">
                <img src={selectedCard.img} alt={selectedCard.name} />
              </div>
              <div className="modal-right">
                <div className="pc-idol">{selectedCard.idol}</div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1.1 }}>{selectedCard.name}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: 1.6 }}>
                  이 포토카드는 {selectedCard.idol}의 공식 한정판 갤러리 에디션입니다. 
                  많은 팬들이 사랑하는 디자인으로 현재 매우 높은 인기를 끌고 있습니다.
                </p>
                
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, height: 4, background: '#eee', borderRadius: 2 }}>
                      <div style={{ width: '70%', height: '100%', background: 'var(--primary-pink)', borderRadius: 2 }}></div>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--primary-pink)' }}>{selectedCard.likes} LIKES</span>
                  </div>
                  <button 
                    className="btn-trigger" 
                    style={{ width: '100%', padding: '1.2rem', margin: 0, background: 'var(--primary-pink)', color: 'white', border: 'none', borderRadius: '20px', fontSize: '1.1rem' }}
                    onClick={() => handleLike(selectedCard.id)}
                  >
                    <Heart fill="white" size={20} style={{ marginRight: '0.8rem', verticalAlign: 'middle' }} /> Send Love
                  </button>
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
