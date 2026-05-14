import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DeliveryHero from './components/DeliveryHero';
import FilterSidebar from './components/FilterSidebar';
import RestaurantCard from './components/RestaurantCard';
import MenuModal from './components/MenuModal';
import CartSummaryPanel from './components/CartSummaryPanel';
import ReviewSummary from './components/ReviewSummary';
import Footer from './components/Footer';

import './styles/global.css';
import './styles/delivery.css';
import './styles/cart.css';
import './styles/desktop-layout.css';

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, [category, minRating]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurants?category=${category}&minRating=${minRating}`);
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (menu, qty) => {
    const existing = cart.find(item => item.id === menu.id);
    if (existing) {
      setCart(cart.map(item => item.id === menu.id ? { ...item, qty: item.qty + qty } : item));
    } else {
      setCart([...cart, { ...menu, qty }]);
    }
    // No alert for desktop usually, but maybe a toast. Let's skip alert to make it feel premium.
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  return (
    <div className="app">
      <Header cartCount={cart.length} />
      
      <main className="container">
        <DeliveryHero />
        
        <div className="desktop-main-grid">
          <FilterSidebar 
            category={category} 
            onCategoryChange={setCategory} 
            minRating={minRating}
            onRatingChange={setMinRating}
          />
          
          <section className="main-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, fontSize: '22px' }}>식당 검색 결과 <span style={{ color: 'var(--primary)', marginLeft: '10px' }}>{restaurants.length}</span></h2>
              <select style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <option>기본순</option>
                <option>평점 높은 순</option>
                <option>배달 빠른 순</option>
                <option>배달비 낮은 순</option>
              </select>
            </div>

            {loading ? (
              <div style={{ padding: '100px', textAlign: 'center', color: '#999' }}>매장을 찾고 있습니다...</div>
            ) : (
              <div className="restaurant-grid">
                {restaurants.map(r => (
                  <RestaurantCard key={r.id} restaurant={r} onClick={setSelectedRestaurant} />
                ))}
              </div>
            )}

            <ReviewSummary />
          </section>
          
          <aside>
            <CartSummaryPanel items={cart} onRemove={handleRemoveFromCart} />
          </aside>
        </div>
      </main>

      <Footer />

      <MenuModal 
        restaurant={selectedRestaurant} 
        isOpen={!!selectedRestaurant} 
        onClose={() => setSelectedRestaurant(null)} 
        onAdd={handleAddToCart}
      />
    </div>
  );
}
