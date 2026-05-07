import React, { useState, useEffect } from 'react';

function App() {
  const [city, setCity] = useState('seoul');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [regions, setRegions] = useState([]);
  const [detailModal, setDetailModal] = useState(null);
  
  // UI States
  const [loading, setLoading] = useState({ current: false, forecast: false, regions: false, detail: false });
  const [errors, setErrors] = useState(null);

  // Initial Data Load
  useEffect(() => {
    fetchCurrent(city);
    fetchForecast(city, 7);
  }, [city]);

  useEffect(() => {
    fetchRegions('all');
  }, []);

  const fetchCurrent = async (c) => {
    setLoading(prev => ({ ...prev, current: true }));
    setErrors(null);
    try {
      const res = await fetch(`/api/weather/current?city=${c}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setCurrentWeather(data.data);
    } catch (err) {
      setErrors({ type: 'current', message: err.message });
      setCurrentWeather(null);
    } finally {
      setLoading(prev => ({ ...prev, current: false }));
    }
  };

  const fetchForecast = async (c, days) => {
    setLoading(prev => ({ ...prev, forecast: true }));
    setErrors(null);
    try {
      const res = await fetch(`/api/weather/forecast?city=${c}&days=${days}`);
      const data = await res.json();
      if (!data.ok) throw { message: data.error, bugId: data.bugId };
      setForecast(data.data);
    } catch (err) {
      setErrors({ type: 'forecast', message: err.message, bugId: err.bugId });
      setForecast([]);
    } finally {
      setLoading(prev => ({ ...prev, forecast: false }));
    }
  };

  const fetchRegions = async (regionFilter) => {
    setLoading(prev => ({ ...prev, regions: true }));
    setErrors(null);
    try {
      const res = await fetch(`/api/weather/regions?region=${regionFilter}`);
      const data = await res.json();
      if (!data.ok) throw { message: data.error, bugId: data.bugId };
      setRegions(data.data);
    } catch (err) {
      setErrors({ type: 'regions', message: err.message, bugId: err.bugId });
      setRegions([]);
    } finally {
      setLoading(prev => ({ ...prev, regions: false }));
    }
  };

  const openDetail = async (c) => {
    setLoading(prev => ({ ...prev, detail: true }));
    setErrors(null);
    try {
      const res = await fetch(`/api/weather/detail?city=${c}`);
      const data = await res.json();
      if (!data.ok) throw { message: data.error, bugId: data.bugId };
      setDetailModal(data.data);
    } catch (err) {
      setErrors({ type: 'detail', message: err.message, bugId: err.bugId });
    } finally {
      setLoading(prev => ({ ...prev, detail: false }));
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">🌤️ SkyDash</div>
        
        <div className="menu-title">Cities</div>
        <button className={`city-btn ${city === 'seoul' ? 'active' : ''}`} onClick={() => setCity('seoul')}>Seoul</button>
        <button className={`city-btn ${city === 'busan' ? 'active' : ''}`} onClick={() => setCity('busan')}>Busan</button>
        <button className={`city-btn ${city === 'jeju' ? 'active' : ''}`} onClick={() => setCity('jeju')}>Jeju</button>
        
        <div className="menu-title" style={{ marginTop: '2rem' }}>PPO Test Triggers</div>
        <button className="city-btn bug-btn" data-bug-id="site002-bug01" onClick={() => openDetail('ghost-city')}>
          Ghost City Detail (Bug 01)
        </button>
        <button className="city-btn bug-btn" data-bug-id="site002-bug02" onClick={() => fetchForecast(city, 'abc')}>
          Invalid Forecast Days (Bug 02)
        </button>
        <button className="city-btn bug-btn" data-bug-id="site002-bug03" onClick={() => fetchRegions('slow-coast')}>
          Slow Coast Filter (Bug 03)
        </button>
      </aside>

      <main className="main-content">
        <header>
          <input 
            type="text" 
            className="search-box" 
            placeholder="Search city..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const term = e.target.value.trim().toLowerCase().replace(' ', '-');
                if (term) setCity(term);
              }
            }}
          />
          <div>User Profile</div>
        </header>

        {errors && (
          <div className="error-banner">
            <div>
              <strong>Error ({errors.type}):</strong> {errors.message}
              {errors.bugId && <span style={{marginLeft:'10px', fontSize:'0.8em', background:'#fca5a5', padding:'2px 6px', borderRadius:'4px'}}>{errors.bugId}</span>}
            </div>
            <button onClick={() => setErrors(null)} style={{background:'none', border:'none', cursor:'pointer'}}>✖</button>
          </div>
        )}

        {/* Current Weather Card */}
        <section className="card">
          <h2>Current Weather: {currentWeather ? currentWeather.city : 'Loading...'}</h2>
          {loading.current ? <div className="loading">Loading...</div> : currentWeather && (
            <div className="current-weather">
              <div className="temp-huge">{currentWeather.temp}°C</div>
              <div className="weather-details">
                <div><span>{currentWeather.condition}</span>Condition</div>
                <div><span>{currentWeather.humidity}%</span>Humidity</div>
                <div><span>{currentWeather.wind} m/s</span>Wind</div>
                <button 
                  onClick={() => openDetail(city)}
                  style={{padding:'0.5rem 1rem', background:'var(--primary)', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer'}}
                >
                  View Detail
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Forecast Chart */}
        <section className="card">
          <h2>Weekly Forecast (Temp)</h2>
          {loading.forecast ? <div className="loading">Loading forecast...</div> : (
            <div className="chart-container">
              {forecast.length > 0 ? forecast.map((temp, i) => (
                <div key={i} className="bar-wrapper">
                  <div className="bar" style={{ height: `${(temp / 40) * 100}%` }}></div>
                  <div className="bar-label">{temp}°</div>
                </div>
              )) : <div>No forecast data available.</div>}
            </div>
          )}
        </section>

        {/* Regions List */}
        <section className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2>Other Regions</h2>
            <button onClick={() => fetchRegions('all')} style={{background:'none', border:'1px solid var(--border)', padding:'0.5rem', cursor:'pointer', borderRadius:'4px'}}>Refresh All</button>
          </div>
          {loading.regions ? <div className="loading">Loading regions...</div> : (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginTop:'1rem'}}>
              {regions.map(r => (
                <div key={r.city} style={{padding:'1rem', border:'1px solid var(--border)', borderRadius:'0.5rem'}}>
                  <div style={{fontWeight:'bold'}}>{r.city}</div>
                  <div>{r.temp}°C - {r.condition}</div>
                </div>
              ))}
              {regions.length === 0 && <div>No regions found.</div>}
            </div>
          )}
        </section>
      </main>

      {/* Detail Modal */}
      {detailModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Detailed Insights</h2>
            <div style={{margin:'1.5rem 0'}}>
              <p>Feels Like: <strong>{detailModal.feelsLike} °C</strong></p>
              <p>Air Quality Index: <strong>{detailModal.aqi}</strong></p>
            </div>
            <button className="modal-close" onClick={() => setDetailModal(null)}>Close</button>
          </div>
        </div>
      )}
      
      {loading.detail && (
        <div className="modal-overlay">
          <div className="modal" style={{textAlign:'center'}}>
            Loading details...
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
