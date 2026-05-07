import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Home, 
  BookOpen, 
  Zap, 
  LayoutGrid,
  ShoppingCart,
  AlertCircle,
  X,
  ChevronRight,
  Clock,
  Calendar,
  Percent,
  Search,
  Trash2,
  Tag,
  Info,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [flyers, setFlyers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFlyer, setSelectedFlyer] = useState(null); // New: Tracking selected flyer
  const [activeBug, setActiveBug] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['전체', '과일', '채소', '정육', '유제품', '생필품', '음료'];

  useEffect(() => {
    fetchSummary();
    fetchCart();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await fetch(`${API_BASE}/flyers/today`);
      const data = await res.json();
      setProducts(data.data);
    } catch (e) {}
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) {}
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/cart`);
      const data = await res.json();
      setCartItems(data.data);
    } catch (e) {}
  };

  const fetchFlyers = async () => {
    setIsLoading(true);
    setActiveBug(null);
    setActiveTab('flyers');
    setSelectedFlyer(null);
    try {
      const res = await fetch(`${API_BASE}/flyers`);
      const data = await res.json();
      setFlyers(data.data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '스냅샷 캐시 오류', desc: '최신 정보가 아닌 과거 전단지 스냅샷 목록이 노출되고 있습니다.' });
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const fetchFlyerContent = async (flyer) => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/flyers/${flyer.id}/products`);
      const data = await res.json();
      setProducts(data.data);
      setSelectedFlyer(flyer);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '스냅샷 데이터 불일치', desc: '이 전단지는 작년에 발행된 것으로, 현재 판매 중인 실제 상품과 정보가 다릅니다.' });
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const fetchTodayDeals = async () => {
    setIsLoading(true);
    setActiveBug(null);
    setActiveTab('today');
    setSelectedFlyer(null);
    try {
      const res = await fetch(`${API_BASE}/flyers/today`);
      const data = await res.json();
      setProducts(data.data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: 'TTL 만료 미적용', desc: '유효기간이 지난 상품들이 목록에서 제거되지 않고 그대로 판매 중입니다.' });
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const fetchSpecialDeals = async () => {
    setIsLoading(true);
    setActiveBug(null);
    setActiveTab('special');
    setSelectedFlyer(null);
    try {
      const res = await fetch(`${API_BASE}/deals/special`);
      const data = await res.json();
      setProducts(data.data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '스케줄 작업 누락', desc: '특가 상품 업데이트 작업이 비정상 종료되어 일부 품목이 누락되었습니다.' });
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const fetchProductDetail = async (id) => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      const data = await res.json();
      setSelectedProduct(data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '할인율 계산 오류', desc: '백엔드 공식 오류로 인해 표시된 할인율이 실제 금액과 일치하지 않습니다.' });
    } catch (e) {}
  };

  const addToCart = async (pId) => {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: pId })
      });
      const data = await res.json();
      if (data.added) {
        fetchCart();
        fetchSummary();
        setIsCartOpen(true);
      }
    } catch (e) {}
  };

  const removeFromCart = async (cartId) => {
    try {
      await fetch(`${API_BASE}/cart/${cartId}`, { method: 'DELETE' });
      fetchCart();
      fetchSummary();
    } catch (e) {}
  };

  const filteredProducts = products.filter(p => {
    const matchCategory = filterCategory === '전체' || p.category === filterCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const cartTotal = cartItems.reduce((acc, item) => acc + item.discountPrice, 0);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <ShoppingBag size={32} />
          <span>MART FLYER</span>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              <Home size={20} /> 대시보드
            </li>
            <li className={`nav-item ${activeTab === 'flyers' ? 'active' : ''}`} onClick={fetchFlyers}>
              <BookOpen size={20} /> 주간 전단지
            </li>
            <li className={`nav-item ${activeTab === 'today' ? 'active' : ''}`} onClick={fetchTodayDeals}>
              <Zap size={20} /> 오늘의 특가
            </li>
            <li className={`nav-item ${activeTab === 'special' ? 'active' : ''}`} onClick={fetchSpecialDeals}>
              <LayoutGrid size={20} /> 특별 기획전
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', background: '#f8f8f8', padding: '1.2rem', borderRadius: '12px' }}>
           <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>내 포인트</div>
           <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>12,450 P</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div className="header-title">
             {activeTab === 'home' && "마트 통합 관리 시스템"}
             {activeTab === 'flyers' && (selectedFlyer ? selectedFlyer.title : "디지털 전단지 아카이브")}
             {activeTab === 'today' && "실시간 타임 세일"}
             {activeTab === 'special' && "시즌 한정 기획전"}
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input 
                type="text" 
                placeholder="상품명을 검색하세요..." 
                style={{ padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '50px', border: '1px solid #ddd', width: '250px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" style={{ position: 'relative', display: 'flex', gap: '0.5rem' }} onClick={() => setIsCartOpen(true)}>
                <ShoppingCart size={18} /> 장바구니
                {cartItems.length > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--mart-yellow)', color: 'black', width: '22px', height: '22px', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{cartItems.length}</span>}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {activeBug && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="banner">
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <AlertCircle size={26} color="var(--mart-red)" />
                  <div>
                     <strong style={{ display: 'block', color: 'var(--mart-red)', fontSize: '1rem' }}>{activeBug.type} : {activeBug.id}</strong>
                     <span style={{ fontSize: '0.85rem', color: '#555' }}>{activeBug.desc}</span>
                  </div>
                  <span className="bug-tag">{activeBug.id}</span>
               </div>
               <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'home' && (
          <div className="fade-in">
             <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--mart-red), #b7000e)', color: 'white', padding: '3.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                   <div style={{ position: 'relative', zIndex: 2 }}>
                      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>대한민국 NO.1 <br/> 최저가 전단지</h1>
                      <p style={{ opacity: 0.9, fontSize: '1.2rem', marginBottom: '2.5rem' }}>오늘 하루만 진행되는 파격적인 할인을 놓치지 마세요.</p>
                      <button className="btn" style={{ background: 'var(--mart-yellow)', color: 'black', padding: '1rem 2rem', fontSize: '1rem' }} onClick={fetchTodayDeals}>오늘의 특가 보기</button>
                   </div>
                   <ShoppingBag size={200} style={{ position: 'absolute', right: '-30px', bottom: '-30px', opacity: 0.1 }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div className="stat-box" style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #eee' }}>
                      <Tag size={24} color="var(--mart-red)" style={{ marginBottom: '1rem' }} />
                      <div style={{ color: '#888', fontSize: '0.9rem' }}>전체 상품 수</div>
                      <div style={{ fontSize: '2rem', fontWeight: 900 }}>{summary?.totalProducts || 0}건</div>
                   </div>
                   <div className="stat-box" style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #eee' }}>
                      <ShoppingCart size={24} color="var(--mart-red)" style={{ marginBottom: '1rem' }} />
                      <div style={{ color: '#888', fontSize: '0.9rem' }}>현재 장바구니</div>
                      <div style={{ fontSize: '2rem', fontWeight: 900 }}>{cartItems.length}건</div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'flyers' && !selectedFlyer && (
          <div className="fade-in">
             <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {flyers.map(f => (
                   <motion.div key={f.id} whileHover={{ y: -10 }} className="card" style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', border: '2px dashed var(--mart-yellow)', textAlign: 'center', cursor: 'pointer' }} onClick={() => fetchFlyerContent(f)}>
                      <Calendar size={48} color="var(--mart-red)" style={{ margin: '0 auto 1.5rem' }} />
                      <h3 style={{ fontSize: '1.6rem', marginBottom: '0.8rem' }}>{f.title}</h3>
                      <p style={{ color: '#888' }}>전단 발행: {f.date}</p>
                      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff9e6', borderRadius: '12px', fontSize: '0.85rem' }}>
                         <Info size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                         {f.type === 'snapshot' ? "데이터 스냅샷 모드 활성화됨" : "실시간 동기화 중"}
                      </div>
                      <button className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>내용 확인하기</button>
                   </motion.div>
                ))}
             </div>
          </div>
        )}

        {(activeTab === 'today' || activeTab === 'special' || (activeTab === 'flyers' && selectedFlyer)) && (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                   {activeTab === 'flyers' && selectedFlyer && (
                      <button className="btn btn-outline" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }} onClick={fetchFlyers}>
                         <ArrowLeft size={20} />
                      </button>
                   )}
                   {categories.map(cat => (
                      <button 
                        key={cat} 
                        className={`btn ${filterCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', border: filterCategory === cat ? 'none' : '1px solid #ddd', color: filterCategory === cat ? 'white' : '#666' }}
                        onClick={() => setFilterCategory(cat)}
                      >
                         {cat}
                      </button>
                   ))}
                </div>
                <button className="btn btn-outline" onClick={activeTab === 'today' ? fetchTodayDeals : (activeTab === 'special' ? fetchSpecialDeals : () => fetchFlyerContent(selectedFlyer))} data-bug-id={activeTab === 'today' ? "site044-bug01" : (activeTab === 'special' ? "site044-bug04" : "site044-bug02")}>
                   데이터 갱신
                </button>
             </div>

             <div className="product-grid">
                {filteredProducts.map(p => (
                   <motion.div layout key={p.id} className="product-card" onClick={() => fetchProductDetail(p.id)} data-bug-id="site044-bug03">
                      <div className="discount-badge">
                         -{Math.round(100 - (p.discountPrice / p.originalPrice * 100))}%
                      </div>
                      <div className="product-image" style={{ fontSize: '4rem' }}>
                         {p.image}
                      </div>
                      <div style={{ flex: 1 }}>
                         <div className="category-tag">{p.category}</div>
                         <h4 style={{ margin: '0.6rem 0', fontSize: '1.1rem' }}>{p.name}</h4>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.8rem' }}>
                            <div>
                               <div className="price-original">{p.originalPrice.toLocaleString()}원</div>
                               <div className="price-discount">{p.discountPrice.toLocaleString()}원</div>
                            </div>
                            <button 
                              className="btn-info-circle" 
                              onClick={(e) => { e.stopPropagation(); fetchProductDetail(p.id); }}
                              data-bug-id="site044-bug03"
                              title="할인 상세 정보"
                            >
                               <Info size={16} />
                               <span>할인상세</span>
                            </button>
                         </div>
                         
                         {new Date(p.expiry) < new Date() && (
                            <div className="expiry-tag" style={{ background: '#fff0f0', padding: '0.4rem', borderRadius: '4px', marginTop: '0.8rem' }}>
                               <Clock size={12} style={{ marginRight: '4px' }} />
                               세일 마감됨 ({p.expiry})
                            </div>
                         )}
                      </div>
                      
                      <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}>
                         담기
                      </button>
                   </motion.div>
                ))}
             </div>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsCartOpen(false)} style={{ zIndex: 2000 }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'fixed', right: 0, top: 0, width: '400px', height: '100%', background: 'white', zIndex: 2001, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><ShoppingCart /> 장바구니</h2>
                  <X size={24} style={{ cursor: 'pointer' }} onClick={() => setIsCartOpen(false)} />
               </div>

               <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '5rem', color: '#ccc' }}>
                       <ShoppingBag size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                       <p>장바구니가 비어있습니다.</p>
                    </div>
                  ) : (
                    cartItems.map(item => (
                       <div key={item.cartId} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: '12px' }}>
                          <div style={{ fontSize: '2rem', background: '#f9f9f9', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>{item.image}</div>
                          <div style={{ flex: 1 }}>
                             <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                             <div style={{ color: 'var(--mart-red)', fontWeight: 800 }}>{item.discountPrice.toLocaleString()}원</div>
                          </div>
                          <button style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }} onClick={() => removeFromCart(item.cartId)}>
                             <Trash2 size={18} />
                          </button>
                       </div>
                    ))
                  )}
               </div>

               <div style={{ borderTop: '2px solid #f4f4f4', paddingTop: '1.5rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 900, marginBottom: '1.5rem' }}>
                     <span>합계 금액</span>
                     <span>{cartTotal.toLocaleString()}원</span>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }} onClick={() => { alert("주문 기능은 준비 중입니다."); setIsCartOpen(false); }}>
                     주문하기
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
           <div className="modal-overlay" onClick={() => setSelectedProduct(null)} style={{ zIndex: 3000 }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content" onClick={e => e.stopPropagation()}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>상품 상세 할인 정보</h2>
                    <X size={24} style={{ cursor: 'pointer' }} onClick={() => setSelectedProduct(null)} />
                 </div>
                 
                 <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '5rem', background: '#f8f8f8', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>{selectedProduct.image}</div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                       <div className="category-tag" style={{ alignSelf: 'flex-start' }}>{selectedProduct.category}</div>
                       <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>{selectedProduct.name}</h3>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ textDecoration: 'line-through', color: '#888' }}>{selectedProduct.originalPrice.toLocaleString()}원</span>
                          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--mart-red)' }}>{selectedProduct.discountPrice.toLocaleString()}원</span>
                       </div>
                    </div>
                 </div>

                 <div style={{ border: '2px solid var(--mart-yellow)', padding: '1.5rem', borderRadius: '16px', background: '#fffef0', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--mart-red)', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.8rem' }}>
                       <Percent size={24} />
                       시스템 계산 할인율: {selectedProduct.discountRate}%
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5 }}>
                       현재 백엔드 서버에서 계산된 할인 수치입니다. 가격 정보와 일치하는지 에이전트가 검증해야 합니다.
                    </p>
                 </div>

                 <button className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }} onClick={() => { addToCart(selectedProduct.id); setSelectedProduct(null); }}>
                    <ShoppingCart /> 장바구니에 담기
                 </button>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
