import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import RestaurantList from './components/RestaurantList.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CouponDropdown from './components/CouponDropdown.jsx';

function App() {
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [address, setAddress] = useState('서울시 마포구 와우산로 94');

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data));
  }, []);

  const addToCart = (menu) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === menu.id);
      if (existing) {
        return prev.map(item => item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...menu, quantity: 1 }];
    });
  };

  const removeFromCart = (menuId) => {
    setCartItems(prev => prev.filter(item => item.id !== menuId));
  };

  return (
    <div className="app-shell">
      <Header address={address} setAddress={setAddress} />
      
      <main className="main-content">
        <CouponDropdown />
        <RestaurantList categories={categories} addToCart={addToCart} />
      </main>

      <BottomNav 
        cartItemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      {isCartOpen && (
        <CartDrawer 
          cartItems={cartItems} 
          onClose={() => setIsCartOpen(false)} 
          onRemove={removeFromCart}
        />
      )}
    </div>
  );
}

export default App;
