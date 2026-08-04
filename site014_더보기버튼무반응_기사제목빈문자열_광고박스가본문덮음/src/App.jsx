import React, { useState, useEffect } from 'react';
import './styles.css';
import { useToast } from './hooks/useToast.jsx';
import Nav from './components/Nav.jsx';
import NewsList from './components/NewsList.jsx';
import Sidebar from './components/Sidebar.jsx';

function App() {
  const [news, setNews] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [filter, setFilter] = useState('All');
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    fetch('/api/news').then(r => r.json()).then(setNews);
    fetch('/api/trending').then(r => r.json()).then(setTrending);
  }, []);

  const filteredNews = filter === 'All' ? news : news.filter(n => n.category === filter);

  return (
    <div className="site-container">
      <header className="site-header">
        <h1 className="site-logo" onClick={() => setFilter('All')}>The Daily Pulse</h1>
      </header>

      <div className="breaking-bar">
        <span className="breaking-label">Breaking:</span>
        <span>Market hits record highs amid tech surge.</span>
      </div>

      <Nav activeCategory={filter} onSelect={(cat) => {
        if (cat === 'Search' || cat === 'Login') {
          addToast('This feature is currently under preparation.');
        } else {
          setFilter(cat);
        }
      }} />

      <main className="main-grid">
        <NewsList 
          news={filteredNews} 
          onSelect={setSelectedArticle} 
        />
        <Sidebar trending={trending} onSelect={setSelectedArticle} />
      </main>

      {selectedArticle && (
        <>
          <div className="overlay" onClick={() => setSelectedArticle(null)} />
          <div className="detail-panel">
            <button className="close" onClick={() => setSelectedArticle(null)}>✕</button>
            <div style={{ color: '#CC0000', fontWeight: 700, marginBottom: '10px' }}>{selectedArticle.category}</div>
            <h2>{selectedArticle.title}</h2>
            <p style={{ color: '#999', marginBottom: '30px' }}>Published on {selectedArticle.date}</p>
            <p style={{ lineHeight: 1.8, color: '#333' }}>
              {selectedArticle.summary}
              <br /><br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </>
      )}

      <ToastContainer />
    </div>
  );
}

export default App;
