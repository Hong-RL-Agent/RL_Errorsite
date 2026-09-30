import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import Reservations from './pages/Reservations';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Inquiries from './pages/Inquiries';
import Files from './pages/Files';
import Profile from './pages/Profile';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(2);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => setCurrentUser(data))
      .catch(console.error);

    fetch('/api/cart')
      .then(res => res.json())
      .then(data => setCartCount(data.count || 0))
      .catch(console.error);
  }, []);

  const showToast = ({ title, message, type = 'success', bugId = null, secId = null, reqId = null }) => {
    setToast({
      title,
      message,
      type,
      bugId,
      secId,
      reqId
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    setActiveTab('product-detail');
  };

  const handleAddToCart = (product, option, quantity = 1) => {
    setCartCount(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            onNavigate={setActiveTab}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
          />
        );
      case 'products':
        return (
          <Products
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
          />
        );
      case 'product-detail':
        return (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setActiveTab('products')}
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
            onNavigate={setActiveTab}
          />
        );
      case 'search':
        return (
          <Search
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
          />
        );
      case 'reservations':
        return <Reservations onShowToast={showToast} />;
      case 'cart':
        return <Cart onNavigate={setActiveTab} onShowToast={showToast} />;
      case 'checkout':
        return <Checkout onNavigate={setActiveTab} onShowToast={showToast} />;
      case 'orders':
        return <Orders onNavigate={setActiveTab} />;
      case 'reviews':
        return <Reviews onShowToast={showToast} />;
      case 'inquiries':
        return <Inquiries onShowToast={showToast} />;
      case 'files':
        return <Files onShowToast={showToast} />;
      case 'profile':
        return <Profile onShowToast={showToast} />;
      default:
        return (
          <Home
            onNavigate={setActiveTab}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        cartCount={cartCount}
      />
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartCount={cartCount}
          onSearchClick={() => setActiveTab('search')}
        />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
