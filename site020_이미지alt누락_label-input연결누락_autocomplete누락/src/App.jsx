import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HotelHero from './components/HotelHero';
import SearchBar from './components/SearchBar';
import FilterSidebar from './components/FilterSidebar';
import HotelGrid from './components/HotelGrid';
import HotelModal from './components/HotelModal';
import BookingSummary from './components/BookingSummary';
import RegionCarousel from './components/RegionCarousel';
import Footer from './components/Footer';

export default function App() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ rating: 0, price: 500000 });
  const [selectedHotel, setSelectedHotel] = useState(null);

  const fetchHotels = async (search = searchQuery, currentFilter = filter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hotels?search=${encodeURIComponent(search)}&rating=${currentFilter.rating}&price=${currentFilter.price}`);
      if (!res.ok) throw new Error('Failed to fetch hotels');
      const json = await res.json();
      setHotels(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels(searchQuery, filter);
  }, [filter]);

  const handleSearch = () => {
    fetchHotels(searchQuery, filter);
  };

  return (
    <div className="app-layout">
      <Header />
      
      <main className="main-content">
        <HotelHero />
        
        <div className="container">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onSearch={handleSearch} 
          />
          
          <div className="content-grid">
            <FilterSidebar filter={filter} setFilter={setFilter} />
            
            <div>
              {loading && <div className="spinner"></div>}
              {error && <div style={{color: 'red', padding: '1rem', background: '#fee2e2', borderRadius: '8px', marginBottom: '1rem'}}>{error}</div>}
              
              {!loading && !error && (
                <HotelGrid hotels={hotels} onHotelClick={setSelectedHotel} />
              )}
            </div>
            
            <BookingSummary />
          </div>
          
          <RegionCarousel />
        </div>
      </main>
      
      <Footer />

      {selectedHotel && (
        <HotelModal hotel={selectedHotel} onClose={() => setSelectedHotel(null)} />
      )}
    </div>
  );
}
