import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TrackingHero from './components/TrackingHero';
import TrackingSearch from './components/TrackingSearch';
import DeliveryTimeline from './components/DeliveryTimeline';
import MapMockPanel from './components/MapMockPanel';
import CourierCard from './components/CourierCard';
import NotificationPanel from './components/NotificationPanel';
import RecentTrackingList from './components/RecentTrackingList';
import Footer from './components/Footer';

import './styles/global.css';
import './styles/tracking.css';
import './styles/accessibility.css';

export default function App() {
  const [tracking, setTracking] = useState(null);
  const [recentTrackings, setRecentTrackings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentTrackings();
  }, []);

  const fetchRecentTrackings = async () => {
    try {
      const res = await fetch('/api/recent-trackings');
      const data = await res.json();
      setRecentTrackings(data);
    } catch (err) {
      console.error("Failed to load recent trackings");
    }
  };

  const handleSearch = async (invoice) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tracking?invoice=${invoice}`);
      if (!res.ok) throw new Error("송장번호를 찾을 수 없습니다.");
      const data = await res.json();
      setTracking(data);
    } catch (err) {
      setError(err.message);
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />
      
      <main>
        <TrackingHero />
        <TrackingSearch onSearch={handleSearch} />
        
        <div className="container">
          <div className="main-layout">
            <section className="tracking-result">
              {loading ? (
                <div style={{ padding: '100px', textAlign: 'center', background: 'white', borderRadius: '12px' }}>
                  <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>데이터를 조회하고 있습니다...</div>
                  <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              ) : error ? (
                <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #fee2e2', color: '#dc2626' }}>
                  <h3 style={{ marginBottom: '10px' }}>조회 실패</h3>
                  <p>{error}</p>
                  <button className="btn btn-outline" style={{ marginTop: '20px' }} onClick={() => setError(null)}>다시 시도</button>
                </div>
              ) : tracking ? (
                <>
                  <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '30px' }}>
                    <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>송장번호</div>
                        <div style={{ fontSize: '24px', fontWeight: 800 }}>{tracking.invoice}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>현재 상태</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{tracking.status}</div>
                      </div>
                    </div>
                    <div style={{ padding: '15px', background: 'var(--light)', borderRadius: '6px', fontSize: '14px' }}>
                      배송지: <strong>{tracking.deliveryAddress}</strong>
                    </div>
                  </div>
                  <DeliveryTimeline tracking={tracking} />
                </>
              ) : (
                <div style={{ padding: '100px', textAlign: 'center', background: 'white', borderRadius: '12px', color: '#94a3b8' }}>
                  송장번호를 입력하여 배송 상태를 확인하세요.
                </div>
              )}
            </section>
            
            <aside>
              {tracking && <MapMockPanel location={tracking.timeline[tracking.timeline.length-1].location} />}
              {tracking && <CourierCard courier={tracking.courier} />}
              <NotificationPanel />
              <RecentTrackingList trackings={recentTrackings} onSelect={handleSearch} />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
