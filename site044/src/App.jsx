import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CampingHero from './components/CampingHero';
import CampsiteFilters from './components/CampsiteFilters';
import CampsiteGrid from './components/CampsiteGrid';
import CampsiteModal from './components/CampsiteModal';
import BookingSummary from './components/BookingSummary';
import Footer from './components/Footer';

const App = () => {
  const [campsites, setCampsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampsite, setSelectedCampsite] = useState(null);
  const [reservedCampsites, setReservedCampsites] = useState([]);
  const [filters, setFilters] = useState({ region: 'All', type: 'All', amenity: 'All' });

  useEffect(() => {
    fetchCampsites();
  }, []);

  const fetchCampsites = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campsites');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setCampsites(data);
    } catch (err) {
      setError('캠핑장 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReserve = (campsite) => {
    if (!reservedCampsites.find(c => c.id === campsite.id)) {
      setReservedCampsites(prev => [...prev, campsite]);
    } else {
      alert('이미 선택된 캠핑장입니다.');
    }
  };

  const filteredCampsites = campsites.filter(c => {
    if (filters.region !== 'All' && c.region !== filters.region) return false;
    if (filters.type !== 'All' && c.type !== filters.type) return false;
    if (filters.amenity !== 'All' && !c.amenities.includes(filters.amenity)) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9f6f2' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '5px solid #ddd', borderTopColor: '#2d4a22', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p style={{ fontWeight: 600, color: '#2d4a22' }}>캠핑장 정보를 불러오는 중...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9f6f2' }}>
        <div style={{ textAlign: 'center', color: '#b91c1c' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>앗! 오류가 발생했습니다.</p>
          <p>{error}</p>
          <button onClick={fetchCampsites} className="btn-primary" style={{ marginTop: '20px' }}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header />
      <CampingHero />
      
      <main className="main-content container">
        <div className="dashboard-grid">
          <section className="content-area">
            <h2 style={{ fontSize: '1.8rem', margin: '40px 0 20px', fontWeight: 700 }}>실시간 예약 가능 캠핑장</h2>
            <CampsiteFilters filters={filters} onFilterChange={handleFilterChange} />
            <CampsiteGrid 
              campsites={filteredCampsites} 
              onSelect={setSelectedCampsite} 
              onReserve={handleReserve}
            />
          </section>
          
          <aside className="sidebar-area">
            <BookingSummary reservedCampsites={reservedCampsites} />
          </aside>
        </div>
      </main>

      <CampsiteModal 
        campsite={selectedCampsite} 
        onClose={() => setSelectedCampsite(null)} 
      />
      
      <Footer />
    </div>
  );
};

export default App;
