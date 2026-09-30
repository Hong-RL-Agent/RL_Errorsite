import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Search from './pages/Search';
import Workspace from './pages/Workspace';
import Members from './pages/Members';
import Products from './pages/Products';
import Files from './pages/Files';
import Reservations from './pages/Reservations';
import Cart from './pages/Cart';
import Payments from './pages/Payments';
import Support from './pages/Support';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [cartCount, setCartCount] = useState(1);
  const [currentUser, setCurrentUser] = useState({
    id: 'user-001',
    name: '김민준',
    email: 'minjun.kim@worknest.io',
    role: 'Product Lead',
    department: 'Product Strategy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: '디지털 제품 기획 및 팀 협업 플랫폼 최적화 리드',
    status: 'online'
  });

  const showToast = (title, message, type = 'info', txId = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type, txId }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const updateCartCount = () => {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        if (data.itemCount !== undefined) {
          setCartCount(data.itemCount);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    // Initial user load
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.id) setCurrentUser(data);
      })
      .catch(err => console.error(err));

    updateCartCount();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} showToast={showToast} />;
      case 'projects':
        return <Projects showToast={showToast} />;
      case 'search':
        return <Search showToast={showToast} setCurrentPage={setCurrentPage} />;
      case 'workspace':
        return <Workspace showToast={showToast} setCurrentPage={setCurrentPage} />;
      case 'members':
        return <Members showToast={showToast} />;
      case 'products':
        return <Products showToast={showToast} onAddToCart={updateCartCount} />;
      case 'files':
        return <Files showToast={showToast} />;
      case 'reservations':
        return <Reservations showToast={showToast} />;
      case 'cart':
        return <Cart setCurrentPage={setCurrentPage} showToast={showToast} />;
      case 'payments':
        return <Payments showToast={showToast} />;
      case 'support':
        return <Support showToast={showToast} />;
      case 'activity':
        return <Activity showToast={showToast} />;
      case 'profile':
        return <Profile currentUser={currentUser} setCurrentUser={setCurrentUser} showToast={showToast} />;
      case 'settings':
        return <Settings showToast={showToast} />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} showToast={showToast} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        cartCount={cartCount} 
        currentUser={currentUser}
      />
      <div className="main-layout">
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          currentUser={currentUser}
        />
        <main className="content-area">
          {renderPage()}
        </main>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
