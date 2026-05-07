import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Home, 
  ShoppingBag, 
  Clock, 
  ShoppingCart, 
  CreditCard, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  X,
  Plus,
  Trash2,
  BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [deal, setDeal] = useState(null);
  const [cart, setCart] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [activeBug, setActiveBug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchDeal();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data.data);
      if (data.bugId === 'site039-bug02') {
         // This bug is always active in this endpoint
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeal = async () => {
    try {
      const res = await fetch(`${API_BASE}/deals`);
      const data = await res.json();
      setDeal(data);
    } catch (e) {}
  };

  const handleAddToCart = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.added) {
        const product = products.find(p => p.id === productId);
        setCart([...cart, product]);
      }
    } catch (e) {}
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => i.id) })
      });
      const data = await res.json();
      if (data.paid) {
        setCheckoutStatus(data);
        if (data.bugId === 'site039-bug03') {
          setActiveBug(data);
        }
        setCart([]);
      }
    } catch (e) {}
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch(`${API_BASE}/subscription`);
      const data = await res.json();
      setSubscription(data);
      if (data.bugId === 'site039-bug04') {
        setActiveBug(data);
      }
    } catch (e) {}
  };

  const triggerBug01 = () => {
    fetchDeal();
    setActiveBug({ bugId: 'site039-bug01', type: 'fake-countdown', error: '타이머가 감소하지 않고 매번 초기화됩니다.' });
  };

  const triggerBug02 = () => {
    fetchProducts();
    setActiveBug({ bugId: 'site039-bug02', type: 'fake-stock', error: '실제 재고와 상관없이 항상 수량이 3개로 표시됩니다.' });
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Compass size={32} />
          <span>VINTAGE CAMP</span>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              <Home size={20} /> Home
            </li>
            <li className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <ShoppingBag size={20} /> Products
            </li>
            <li className={`nav-item ${activeTab === 'deals' ? 'active' : ''}`} onClick={() => setActiveTab('deals')}>
              <Clock size={20} /> Deals
            </li>
            <li className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`} onClick={() => setActiveTab('cart')}>
              <ShoppingCart size={20} /> Cart ({cart.length})
            </li>
            <li className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`} onClick={() => { setActiveTab('subscription'); fetchSubscription(); }}>
              <User size={20} /> Subscription
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
            {activeTab === 'home' && "Explore Vintage Camping"}
            {activeTab === 'products' && "Limited Edition Products"}
            {activeTab === 'deals' && "Flash Sale Deals"}
            {activeTab === 'cart' && "Your Gear Bag"}
            {activeTab === 'subscription' && "Membership Status"}
          </h2>
        </header>

        <AnimatePresence>
          {activeBug && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="banner banner-warning">
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <AlertCircle size={24} />
                  <div>
                     <strong style={{ display: 'block' }}>다크패턴 감지: {activeBug.type}</strong>
                     <span style={{ fontSize: '0.85rem' }}>{activeBug.error || '사용자 기만 로직이 백엔드에서 실행되었습니다.'}</span>
                  </div>
                  <span className="bug-tag">{activeBug.bugId}</span>
               </div>
               <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'home' && (
          <div className="fade-in">
             <div className="timer-container" style={{ background: 'url("https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=2070") center/cover' }}>
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '2rem', borderRadius: '15px' }}>
                   <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ffb300' }}>SEASON OFF FLASH SALE</h3>
                   <p style={{ marginBottom: '2rem', color: '#fff' }}>Don't miss out on rare vintage camping gears.</p>
                   <button className="btn btn-accent" onClick={() => setActiveTab('deals')}>View Deals</button>
                </div>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                <div className="sub-card" style={{ margin: 0, textAlign: 'left' }}>
                   <BellRing color="var(--primary-olive)" style={{ marginBottom: '1rem' }} />
                   <h3>Limited Inventory</h3>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Most items have less than 5 units in stock. Check now before they are gone forever!</p>
                   <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setActiveTab('products')}>Shop Now</button>
                </div>
                <div className="sub-card" style={{ margin: 0, textAlign: 'left' }}>
                   <CreditCard color="var(--accent-brown)" style={{ marginBottom: '1rem' }} />
                   <h3>Membership Perks</h3>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join our trial membership and get free shipping on all vintage lanterns.</p>
                   <button className="btn btn-primary" style={{ marginTop: '1.5rem', background: 'var(--accent-brown)' }} onClick={() => setActiveTab('subscription')}>Join Trial</button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="fade-in">
             <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-accent" onClick={triggerBug02} data-bug-id="site039-bug02">Check Inventory Bug</button>
             </div>
             <div className="products-grid">
                {products.map(p => (
                  <div key={p.id} className="product-card">
                     <div className="product-img">
                        {p.category === 'Lighting' && <Compass size={48} />}
                        {p.category === 'Cooking' && <Compass size={48} />}
                        {p.category === 'Tent' && <Compass size={48} />}
                        {p.category === 'Furniture' && <Compass size={48} />}
                     </div>
                     <div className="product-info">
                        <span className="stock-badge">ONLY {p.stock} LEFT</span>
                        <h3>{p.name}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{p.description}</p>
                        <div className="price">₩{p.price.toLocaleString()}</div>
                        <button className="btn btn-primary" onClick={() => handleAddToCart(p.id)}>Add to Bag</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="fade-in">
             <div className="timer-container">
                <h3 style={{ marginBottom: '1rem' }}>Time Remaining for Deals</h3>
                <div className="timer-value">
                   {deal ? `00:${Math.floor(deal.countdown / 60)}:${deal.countdown % 60}` : "Loading..."}
                </div>
                <p style={{ marginTop: '1rem', opacity: 0.8 }}>Limited quantity available. Act fast!</p>
                <button className="btn btn-accent" style={{ marginTop: '2rem' }} onClick={triggerBug01} data-bug-id="site039-bug01">Refresh Timer</button>
             </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="fade-in">
             <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {cart.length > 0 ? (
                  <>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                       {cart.map((item, idx) => (
                         <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: idx === cart.length - 1 ? 'none' : '1px solid #eee' }}>
                            <div>
                               <h4 style={{ fontWeight: 800 }}>{item.name}</h4>
                               <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.category}</p>
                            </div>
                            <div style={{ fontWeight: 900 }}>₩{item.price.toLocaleString()}</div>
                         </div>
                       ))}
                       <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Total Amount</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-brown)' }}>
                             ₩{cart.reduce((acc, i) => acc + i.price, 0).toLocaleString()}
                          </span>
                       </div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '1.5rem', fontSize: '1.2rem' }} onClick={handleCheckout} data-bug-id="site039-bug03">
                       Complete Purchase
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '5rem' }}>
                     <ShoppingCart size={64} color="#ddd" style={{ marginBottom: '2rem' }} />
                     <h3>Your bag is empty</h3>
                     <p style={{ color: 'var(--text-muted)' }}>Go find some vintage gems!</p>
                     <button className="btn btn-primary" style={{ marginTop: '2rem', width: 'auto' }} onClick={() => setActiveTab('products')}>Explore Products</button>
                  </div>
                )}

                {checkoutStatus && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: '3rem', padding: '2rem', background: '#e8f5e9', borderRadius: '20px', textAlign: 'center' }}>
                     <CheckCircle2 color="#2e7d32" size={48} style={{ marginBottom: '1rem', margin: '0 auto' }} />
                     <h3>Order Completed!</h3>
                     <p style={{ marginTop: '0.5rem' }}>Your camping gear is being packed.</p>
                     {checkoutStatus.autoPay && (
                       <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #c8e6c9', fontSize: '0.9rem' }}>
                          <Info size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                          자동 결제 서비스가 활성화되었습니다. (매월 ₩9,900)
                       </div>
                     )}
                  </motion.div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="fade-in">
             <div className="sub-card">
                <div style={{ marginBottom: '2rem' }}>
                   <div style={{ width: '80px', height: '80px', background: '#fff3e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <User size={40} color="#ff9800" />
                   </div>
                   <h3>Membership Dashboard</h3>
                   <p style={{ color: 'var(--text-muted)' }}>Manage your camping club subscription</p>
                </div>

                {subscription ? (
                  <div style={{ textAlign: 'left', background: '#f9f9f9', padding: '1.5rem', borderRadius: '15px' }}>
                     <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Current Plan</span>
                        <strong style={{ color: 'var(--primary-olive)' }}>{subscription.plan.toUpperCase()}</strong>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Next Billing</span>
                        <strong>{subscription.trialEnd || "정보 없음"}</strong>
                     </div>
                     {activeBug?.bugId === 'site039-bug04' && (
                        <div style={{ marginTop: '1.5rem', color: '#d32f2f', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                           <AlertCircle size={16} />
                           <span>Warning: Trial end date is hidden. You will be charged automatically.</span>
                        </div>
                     )}
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={fetchSubscription} data-bug-id="site039-bug04">Fetch Status</button>
                )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
