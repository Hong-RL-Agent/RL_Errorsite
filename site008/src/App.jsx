import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import MovieCarousel from './components/MovieCarousel.jsx';
import SeatGrid from './components/SeatGrid.jsx';
import PaymentSummary from './components/PaymentSummary.jsx';

function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        setMovies(data.data);
        if (data.data.length > 0) {
          setSelectedMovie(data.data[0]);
          setSelectedTime(data.data[0].times[0]);
        }
      });
  }, []);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setSelectedTime(movie.times[0]);
    setSelectedSeats([]); // reset seats
  };

  const handleSeatToggle = (seatId) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  return (
    <div className="app-container">
      <Header />
      
      <div className="container">
        <div className="main-col">
          <MovieCarousel 
            movies={movies} 
            selectedMovie={selectedMovie} 
            onSelect={handleMovieSelect} 
          />
          
          {selectedMovie && (
            <div className="movie-section">
              <div className="section-title">상영 시간 선택</div>
              <div className="time-list">
                {selectedMovie.times.map(time => (
                  <button 
                    key={time} 
                    className={`time-btn ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => { setSelectedTime(time); setSelectedSeats([]); }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedTime && (
            <div className="movie-section">
              <div className="section-title">좌석 선택</div>
              <SeatGrid selectedSeats={selectedSeats} onSeatToggle={handleSeatToggle} />
            </div>
          )}
        </div>

        <div className="side-col">
          <PaymentSummary 
            movie={selectedMovie} 
            time={selectedTime} 
            selectedSeats={selectedSeats} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
