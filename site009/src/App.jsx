import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import MiniCart from './components/MiniCart.jsx';

function App() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data));
  }, []);

  useEffect(() => {
    fetch(`/api/products?category=${activeCategory}`)
      .then(res => res.json())
      .then(data => setProducts(data.data));
  }, [activeCategory]);

  const addToCart = (product, color, size) => {
    setCartItems(prev => [...prev, { ...product, selectedColor: color, selectedSize: size, cartId: Date.now() }]);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  return (
    <div className="app-container">
      <Header cartCount={cartItems.length} onCartClick={() => setIsCartOpen(!isCartOpen)} />
      
      <Hero />
      
      <div className="category-nav">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <ProductGrid products={products} onAddToCart={addToCart} />

      <MiniCart 
        isOpen={isCartOpen} 
        items={cartItems} 
        onClose={() => setIsCartOpen(false)} 
        onRemove={removeFromCart} 
      />
    </div>
  );
}

export default App;
