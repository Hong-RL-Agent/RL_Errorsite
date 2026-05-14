import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SubscriptionHero from './components/SubscriptionHero';
import CategoryFilters from './components/CategoryFilters';
import BoxGrid from './components/BoxGrid';
import BoxModal from './components/BoxModal';
import FrequencySelector from './components/FrequencySelector';
import GiftOptions from './components/GiftOptions';
import SubscriptionSummary from './components/SubscriptionSummary';
import ReviewSection from './components/ReviewSection';
import Footer from './components/Footer';

const App = () => {
  const [boxes, setBoxes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedBox, setSelectedBox] = useState(null);
  const [modalBox, setModalBox] = useState(null);
  const [frequency, setFrequency] = useState('Monthly');
  const [giftWrap, setGiftWrap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boxRes, reviewRes] = await Promise.all([
          fetch('/api/subscription-boxes'),
          fetch('/api/reviews')
        ]);
        
        if (!boxRes.ok || !reviewRes.ok) throw new Error('Failed to load curation data');
        
        const boxData = await boxRes.json();
        const reviewData = await reviewRes.json();
        
        setBoxes(boxData);
        setReviews(reviewData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredBoxes = filter === 'All' 
    ? boxes 
    : boxes.filter(b => b.category === filter);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#E6E6FA', color: '#9370DB', fontStyle: 'italic', fontSize: '1.2rem' }}>
      Curating your perfect MoodBox...
    </div>
  );

  if (error) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa', gap: '20px' }}>
      <h2 style={{ color: '#FF7F50' }}>System Outage</h2>
      <p>{error}</p>
      <button className="btn-primary" onClick={() => window.location.reload()}>RETRY</button>
    </div>
  );

  return (
    <div>
      <Header />
      <SubscriptionHero />
      
      <main className="container" style={{ padding: '80px 0' }}>
        <h2 className="section-title">Explore Subscription Boxes</h2>
        <CategoryFilters current={filter} onSelect={setFilter} />
        
        <div className="subscription-layout">
          <div>
            <BoxGrid 
              boxes={filteredBoxes} 
              onSelect={setSelectedBox} 
              onDetails={setModalBox} 
            />
            
            {selectedBox && (
              <div style={{ marginTop: '80px', padding: '40px', background: 'white', border: '1px solid #eee', borderRadius: '12px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '10px' }}>Customize Your Subscription</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>Selected: <strong>{selectedBox.name}</strong></p>
                
                <FrequencySelector 
                  selected={frequency} 
                  onSelect={setFrequency} 
                />
                
                <GiftOptions 
                  giftWrap={giftWrap} 
                  setGiftWrap={setGiftWrap} 
                />
              </div>
            )}
            
            <ReviewSection reviews={reviews} />
          </div>
          
          <aside>
            <SubscriptionSummary 
              selectedBox={selectedBox}
              frequency={frequency}
              giftWrap={giftWrap}
            />
          </aside>
        </div>
      </main>

      <BoxModal 
        box={modalBox} 
        onClose={() => setModalBox(null)} 
        onSelect={setSelectedBox} 
      />
      
      <Footer />
    </div>
  );
};

export default App;
