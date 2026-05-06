import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import CityCards from './components/CityCards.jsx';
import HotelList from './components/HotelList.jsx';
import ReservationPanel from './components/ReservationPanel.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const [cities, setCities] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => setCities(data.data));
  }, []);

  useEffect(() => {
    let url = '/api/hotels?';
    if (selectedCity) url += `cityId=${selectedCity}&`;
    if (minRating > 0) url += `minRating=${minRating}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => setHotels(data.data));
  }, [selectedCity, minRating]);

  const handleBook = (hotel) => {
    setIsPanelOpen(true);
  };

  return (
    <div className="app-container">
      <Header />
      <Hero />
      <main className="main-content">
        <CityCards cities={cities} onSelectCity={setSelectedCity} selectedCity={selectedCity} />
        <HotelList 
          hotels={hotels} 
          minRating={minRating} 
          onRatingChange={setMinRating} 
          onBook={handleBook}
        />
      </main>
      <ReservationPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      <Footer />
    </div>
  );
}

export default App;
