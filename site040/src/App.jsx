import React, { useState, useEffect } from 'react';
import { 
  Dices, 
  Home, 
  MessageSquare, 
  CreditCard, 
  Activity as ActivityIcon,
  Zap,
  Star,
  Award,
  AlertTriangle,
  X,
  History,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeBug, setActiveBug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastNumbers, setLastNumbers] = useState([]);

  useEffect(() => {
    fetchPoints();
    fetchSummary();
  }, []);

  const fetchPoints = async () => {
    try {
      const res = await fetch(`${API_BASE}/points`);
      const data = await res.json();
      setPoints(data.points);
    } catch (e) {}
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) {}
  };

  const generateNumbers = async () => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/generate`, { method: 'POST' });
      const data = await res.json();
      setLastNumbers(data.numbers);
      if (data.bugId) setActiveBug(data);
      fetchPoints();
      fetchHistory();
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      const data = await res.json();
      setHistory(data.data);
    } catch (e) {}
  };

  const fetchReviews = async () => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/reviews`);
      const data = await res.json();
      setReviews(data.data);
      if (data.bugId) setActiveBug(data);
    } catch (e) {}
  };

  const fetchSubscription = async () => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/subscription`);
      const data = await res.json();
      setSubscription(data);
      if (data.bugId) setActiveBug(data);
    } catch (e) {}
  };

  const fetchActivity = async () => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/activity`);
      const data = await res.json();
      setActivities(data.logs);
      if (data.bugId) setActiveBug(data);
    } catch (e) {}
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Dices size={32} />
          <span>LOTTO AI</span>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              <Home size={20} /> Home
            </li>
            <li className={`nav-item ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => { setActiveTab('generate'); fetchHistory(); }}>
              <Zap size={20} /> Generate
            </li>
            <li className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => { setActiveTab('reviews'); fetchReviews(); }}>
              <MessageSquare size={20} /> Reviews
            </li>
            <li className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`} onClick={() => { setActiveTab('subscription'); fetchSubscription(); }}>
              <CreditCard size={20} /> Subscription
            </li>
            <li className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => { setActiveTab('activity'); fetchActivity(); }}>
              <ActivityIcon size={20} /> Activity
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: '#222', borderRadius: '16px', border: '1px solid var(--primary-gold)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-gold)' }}>
              <Award size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>MY POINTS</span>
           </div>
           <div style={{ fontSize: '1.2rem', fontWeight: 900, marginTop: '0.5rem' }}>{points.toLocaleString()} P</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
            {activeTab === 'home' && "Dashboard Overview"}
            {activeTab === 'generate' && "AI Number Generator"}
            {activeTab === 'reviews' && "Winning Testimonials"}
            {activeTab === 'subscription' && "Membership Status"}
            {activeTab === 'activity' && "Real-time Network Activity"}
          </h2>
          <div className="stat-card" style={{ padding: '0.5rem 1.5rem', background: 'transparent' }}>
             <span style={{ color: '#666', fontSize: '0.8rem' }}>Total Generated: </span>
             <span style={{ color: 'var(--primary-gold)', fontWeight: 800 }}>{summary?.generated.toLocaleString()}</span>
          </div>
        </header>

        <AnimatePresence>
          {activeBug && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="banner banner-warning">
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <AlertTriangle size={24} />
                  <div>
                     <strong style={{ display: 'block' }}>서비스 기만 요소 감지: {activeBug.type}</strong>
                     <span style={{ fontSize: '0.85rem' }}>백엔드에서 조작된 데이터 패턴이 발견되었습니다.</span>
                  </div>
                  <span className="bug-tag">{activeBug.bugId}</span>
               </div>
               <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'home' && (
          <div className="fade-in">
             <div className="stats-grid">
                <div className="stat-card">
                   <div className="value">{summary?.totalUsers.toLocaleString()}</div>
                   <div style={{ fontSize: '0.8rem', color: '#888' }}>Active Users</div>
                </div>
                <div className="stat-card">
                   <div className="value">₩{((summary?.totalRewardsGiven || 0) / 1000000).toFixed(1)}M</div>
                   <div style={{ fontSize: '0.8rem', color: '#888' }}>Total Rewards Given</div>
                </div>
                <div className="stat-card">
                   <div className="value">99.8%</div>
                   <div style={{ fontSize: '0.8rem', color: '#888' }}>AI Accuracy Index</div>
                </div>
             </div>

             <div style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '24px', border: '1px solid #333', textAlign: 'center' }}>
                <TrendingUp size={48} color="var(--primary-gold)" style={{ marginBottom: '1.5rem' }} />
                <h3>Welcome to LOTTO AI Premium</h3>
                <p style={{ color: '#888', maxWidth: '500px', margin: '1rem auto' }}>
                   Our advanced neural network analyzes historical patterns to give you the highest probability numbers.
                </p>
                <button className="btn btn-primary" onClick={() => setActiveTab('generate')}>Try AI Generator</button>
             </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
             <div style={{ marginBottom: '3rem' }}>
                <button className="btn btn-primary" style={{ padding: '1.5rem 4rem', fontSize: '1.2rem' }} onClick={generateNumbers} disabled={isLoading} data-bug-id="site040-bug03">
                   {isLoading ? "Analyzing..." : "Generate AI Numbers"}
                </button>
             </div>

             {lastNumbers.length > 0 && (
               <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="ball-container">
                  {lastNumbers.map((n, i) => (
                    <div key={i} className={`ball ${i === 5 ? 'ball-gold' : ''}`}>{n}</div>
                  ))}
               </motion.div>
             )}

             <div style={{ marginTop: '4rem', textAlign: 'left' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                   <History size={18} /> Generation History
                </h4>
                <div className="activity-box" style={{ height: 'auto', maxHeight: '400px' }}>
                   {history.map(item => (
                     <div key={item.id} className="log-entry" style={{ color: '#ccc', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.numbers.join(', ')}</span>
                        <span style={{ color: 'var(--primary-gold)' }}>+{item.reward.toLocaleString()} P</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>What Our Winners Say</h3>
                <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }} onClick={fetchReviews} data-bug-id="site040-bug02">
                   Refresh Reviews
                </button>
             </div>
             <div className="review-grid">
                {reviews.map(r => (
                  <div key={r.id} className="review-item">
                     <div className="rating">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.floor(r.rating) ? "var(--secondary-gold)" : "none"} />)}
                        <span style={{ marginLeft: '0.5rem' }}>{r.rating}</span>
                     </div>
                     <p style={{ fontStyle: 'italic', color: '#ddd' }}>"{r.comment}"</p>
                     <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                        <UserCheck size={14} /> {r.user} • Verified Winner
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="fade-in">
             <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--card-bg)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--primary-gold)', textAlign: 'center' }}>
                <CreditCard size={48} color="var(--primary-gold)" style={{ marginBottom: '1.5rem' }} />
                <h3>Premium Membership</h3>
                <p style={{ color: '#888', marginBottom: '2rem' }}>Get access to exclusive gold-tier numbers and priority analysis.</p>
                
                {subscription ? (
                  <div style={{ textAlign: 'left', background: '#000', padding: '1.5rem', borderRadius: '16px', border: '1px solid #333' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#888' }}>Plan Type</span>
                        <strong style={{ color: 'var(--primary-gold)' }}>{subscription.plan.toUpperCase()}</strong>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#888' }}>Status</span>
                        <strong style={{ color: '#0f0' }}>{subscription.status.toUpperCase()}</strong>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#888' }}>Billing Period</span>
                        <strong>{subscription.billingCycle || "Standard"}</strong>
                     </div>
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={fetchSubscription} data-bug-id="site040-bug01">Check Subscription Info</button>
                )}
             </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>Global Activity Log</h3>
                <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }} onClick={fetchActivity} data-bug-id="site040-bug04">
                   Fetch Latest Activity
                </button>
             </div>
             <div className="activity-box">
                {activities.map((log, i) => (
                  <div key={i} className="log-entry">
                     {log}
                  </div>
                ))}
                {activities.length === 0 && <div style={{ textAlign: 'center', padding: '5rem', color: '#444' }}>Waiting for incoming activity...</div>}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
