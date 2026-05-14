import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TripHero from './components/TripHero';
import TripTimeline from './components/TripTimeline';
import CityCards from './components/CityCards';
import ActivityCarousel from './components/ActivityCarousel';
import TripSummaryPanel from './components/TripSummaryPanel';
import DateRangePicker from './components/DateRangePicker';
import TripModal from './components/TripModal';
import Footer from './components/Footer';

export default function App() {
  const [trips, setTrips] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const fetchTrips = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to fetch trips');
      const json = await res.json();
      setTrips(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/activities`);
      if (!res.ok) throw new Error('Failed to fetch activities');
      const json = await res.json();
      setActivities(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchActivities();
  }, []);

  const handleSearch = () => {
    fetchTrips(searchQuery);
  };

  return (
    <div className="layout">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />
      <main>
        <TripHero />
        
        <div className="container content-grid">
          <div className="main-content-area">
            <DateRangePicker />
            
            <div style={{marginTop: '2rem'}}>
              {loading && <div style={{textAlign: 'center', padding: '2rem'}}><span className="spinner spinner-dark"></span></div>}
              {error && <div style={{color: 'var(--status-danger)', padding: '1rem', background: '#fef2f2', borderRadius: '8px'}}>{error}</div>}
              
              {!loading && !error && (
                <>
                  <TripTimeline trips={trips} onTripClick={(trip) => setSelectedTrip(trip)} />
                  <CityCards />
                  <ActivityCarousel activities={activities} />
                </>
              )}
            </div>
          </div>
          
          <aside className="sidebar-area">
            <TripSummaryPanel trips={trips} />
          </aside>
        </div>
      </main>
      
      <Footer />
      
      {selectedTrip && (
        <TripModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      )}
    </div>
  );
}
