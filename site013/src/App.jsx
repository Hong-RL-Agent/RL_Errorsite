import React, { useState, useEffect } from 'react';
import './styles.css';
import { useToast } from './hooks/useToast.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import RoomService from './components/RoomService.jsx';
import RequestForm from './components/RequestForm.jsx';
import RoomModal from './components/RoomModal.jsx';

function App() {
  const [roomInfo, setRoomInfo] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Main');
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    fetch('/api/room-info').then(r => r.json()).then(setRoomInfo);
    fetch('/api/menu').then(r => r.json()).then(setMenu);
  }, []);

  const addToCart = (item) => {
    setCart(prev => [...prev, item]);
    addToast(`${item.name} added to summary.`);
  };

  const submitRequest = (text) => {
    fetch('/api/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: roomInfo?.roomNumber, cart, request: text })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        addToast('Concierge has received your request.');
        setCart([]);
      }
    });
  };

  return (
    <div className="app-container">
      <Sidebar addToast={addToast} />
      
      <main className="main-content">
        <Header 
          roomInfo={roomInfo} 
          onProfileClick={() => setIsModalOpen(true)} 
        />
        
        <div className="content-grid">
          <div className="menu-section">
            <h2 className="section-title">In-Room Dining</h2>
            <div className="tabs">
              {['Main', 'Soup', 'Salad', 'Wine', 'Dessert'].map(cat => (
                <div 
                  key={cat} 
                  className={`tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
            <RoomService 
              items={menu.filter(i => i.category === activeCategory)} 
              onOrder={addToCart} 
            />
          </div>
          
          <RequestForm cart={cart} onSubmit={submitRequest} />
        </div>
      </main>

      {isModalOpen && roomInfo && (
        <RoomModal 
          room={roomInfo} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
      
      <ToastContainer />
    </div>
  );
}

export default App;
