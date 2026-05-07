import React, { useState, useEffect } from 'react';
import { 
  Flower2, 
  Wind, 
  Sparkles, 
  ShoppingBag, 
  LayoutDashboard,
  Search,
  Droplets,
  Heart,
  AlertCircle,
  X,
  RefreshCw,
  BarChart3,
  Waves,
  Grape,
  Trash2,
  CheckCircle2,
  Info,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Beaker
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [perfumes, setPerfumes] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeBug, setActiveBug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterNote, setFilterNote] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedGlossary, setSelectedGlossary] = useState(null);

  const glossary = [
    { id: 'floral', title: 'Floral (플로럴)', desc: '장미, 자스민 등 꽃의 화사하고 우아한 향기입니다.', icon: <Flower2 /> },
    { id: 'woody', title: 'Woody (우디)', desc: '나무, 이끼 등 숲의 차분하고 묵직한 잔향을 의미합니다.', icon: <Grape /> },
    { id: 'citrus', title: 'Citrus (시트러스)', desc: '레몬, 베르가모트 등 상큼하고 청량한 느낌의 향입니다.', icon: <Waves /> },
    { id: 'amber', title: 'Amber (엠버)', desc: '고전적이고 따뜻하며 관능적인 동양적 무드의 향기입니다.', icon: <Sparkles /> }
  ];

  useEffect(() => {
    fetchSummary();
    fetchPerfumes();
    fetchCart();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '집계 불일치', desc: `실제 평균 점수는 ${Math.round(data.realAvgScore)}점이나, 현재 ${Math.round(data.avgScore)}점으로 잘못 집계되고 있습니다.` });
    } catch (e) {}
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/cart`);
      const data = await res.json();
      setCartItems(data.data);
    } catch (e) {}
  };

  const fetchPerfumes = async (note = '') => {
    setIsLoading(true);
    setActiveBug(null);
    setFilterNote(note);
    try {
      const url = note ? `${API_BASE}/products?note=${note}` : `${API_BASE}/products`;
      const res = await fetch(url);
      const data = await res.json();
      setPerfumes(data.data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '필터 누수', desc: `'${note.toUpperCase()}' 필터를 적용했으나, 해당 성분이 없는 상품이 목록에 포함되었습니다.` });
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const fetchMatch = async (isRepeat = false) => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      const url = isRepeat ? `${API_BASE}/match/repeat` : `${API_BASE}/match`;
      const res = await fetch(url);
      const data = await res.json();
      setMatchResults(data.data);
      if (data.bugId) {
        const bugDesc = isRepeat 
          ? `서버 전역 상태 오염으로 보너스 점수가 +${data.accumulatedScore}점 누적되었습니다.` 
          : '매칭 알고리즘의 비결정적 특성으로 인해 결과 순위가 실시간으로 변동되었습니다.';
        setActiveBug({ id: data.bugId, type: isRepeat ? '상태 누적 오류' : '비결정적 매칭', desc: bugDesc });
      }
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        fetchCart();
        setIsCartOpen(true);
      }
    } catch (e) {}
  };

  const removeFromCart = async (cartId) => {
    try {
      await fetch(`${API_BASE}/cart/${cartId}`, { method: 'DELETE' });
      fetchCart();
    } catch (e) {}
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          L'ESSENCE
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              <Sparkles size={18} /> 추천 홈
            </li>
            <li className={`nav-item ${activeTab === 'perfumes' ? 'active' : ''}`} onClick={() => { setActiveTab('perfumes'); fetchPerfumes(); }}>
              <Droplets size={18} /> 향수 목록
            </li>
            <li className={`nav-item ${activeTab === 'glossary' ? 'active' : ''}`} onClick={() => setActiveTab('glossary')}>
              <BookOpen size={18} /> 향기 도감
            </li>
            <li className={`nav-item ${activeTab === 'match' ? 'active' : ''}`} onClick={() => { setActiveTab('match'); fetchMatch(); }}>
              <Heart size={18} /> 취향 매칭
            </li>
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); fetchSummary(); }}>
              <BarChart3 size={18} /> 통계 분석
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', background: 'var(--perfume-beige)', padding: '1.2rem', borderRadius: '12px', border: '1px solid #eee' }}>
           <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>나의 위시리스트</div>
           <button className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={16} /> 카트 확인 ({cartItems.length})
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             {isLoading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><RefreshCw size={20} color="var(--perfume-gold)" /></motion.div>}
             <h2 style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                {activeTab === 'home' && "L'Essence Signature"}
                {activeTab === 'perfumes' && "The Collection"}
                {activeTab === 'glossary' && "Scent Notes Glossary"}
                {activeTab === 'match' && "AI Matching Engine"}
                {activeTab === 'dashboard' && "Performance Dashboard"}
             </h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div className="search-bar" style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input type="text" placeholder="향수 이름 검색..." style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '50px', border: '1px solid #eee', fontSize: '0.85rem', width: '200px' }} />
             </div>
          </div>
        </header>

        <AnimatePresence>
          {activeBug && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="banner" style={{ borderRight: '5px solid #ff4d4d' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <ShieldAlert size={28} color="#ff4d4d" />
                  <div>
                     <strong style={{ display: 'block', fontSize: '1rem', color: '#ff4d4d' }}>시스템 결함 탐지: {activeBug.id}</strong>
                     <span style={{ fontSize: '0.85rem', color: '#555' }}>[{activeBug.type}] {activeBug.desc}</span>
                  </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="bug-tag">{activeBug.id}</span>
                  <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'home' && (
          <div className="fade-in">
             <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
                <div style={{ background: 'white', padding: '4rem', borderRadius: '30px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ position: 'relative', zIndex: 2 }}>
                      <span style={{ color: 'var(--perfume-gold)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '2px' }}>NEW ARRIVAL</span>
                      <h1 style={{ fontSize: '3.5rem', fontWeight: 300, margin: '1rem 0', fontStyle: 'italic' }}>Ethereal Mist</h1>
                      <p style={{ color: 'var(--perfume-gray)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '400px' }}>당신의 존재를 가장 아름답게 각인시킬 신비로운 향의 서막.</p>
                      <button className="btn btn-primary" onClick={() => setActiveTab('perfumes')}>컬렉션 탐색</button>
                   </div>
                   <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px', background: 'var(--perfume-pastel)', borderRadius: '50%', opacity: 0.5 }}></div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div className="stat-card" style={{ textAlign: 'left', padding: '2rem' }}>
                      <Heart size={24} color="var(--perfume-gold)" style={{ marginBottom: '1rem' }} />
                      <h3>맞춤 추천</h3>
                      <p style={{ fontSize: '0.85rem', color: '#888', margin: '0.5rem 0 1.5rem' }}>당신의 성향에 맞는 향수를 알고리즘으로 분석합니다.</p>
                      <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTab('match')}>테스트 시작</button>
                   </div>
                   <div className="stat-card" style={{ textAlign: 'left', padding: '2rem' }}>
                      <BookOpen size={24} color="var(--perfume-gold)" style={{ marginBottom: '1rem' }} />
                      <h3>향기 도감</h3>
                      <p style={{ fontSize: '0.85rem', color: '#888', margin: '0.5rem 0 1.5rem' }}>복잡한 향료의 세계를 알기 쉽게 설명해 드립니다.</p>
                      <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTab('glossary')}>도감 보기</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'perfumes' && (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                   {['전체', 'floral', 'woody', 'citrus', 'amber'].map(note => (
                      <button 
                       key={note}
                       className={`btn ${filterNote === (note === '전체' ? '' : note) ? 'btn-primary' : 'btn-outline'}`} 
                       onClick={() => fetchPerfumes(note === '전체' ? '' : note)}
                       data-bug-id={note === 'woody' ? "site045-bug02" : ""}
                      >
                        {note.toUpperCase()}
                      </button>
                   ))}
                </div>
                {filterNote && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid #eee', fontSize: '0.8rem' }}>
                      <Beaker size={14} color="var(--perfume-gold)" />
                      무결성 검사 결과: <strong>{perfumes.filter(p => p.notes.includes(filterNote)).length} / {perfumes.length} 일치</strong>
                   </div>
                )}
             </div>
             
             <div className="perfume-grid">
                {perfumes.map(p => (
                  <motion.div layout key={p.id} className="perfume-card" style={{ border: filterNote && !p.notes.includes(filterNote) ? '2px solid #ff4d4d' : '1px solid #eee' }}>
                     {filterNote && !p.notes.includes(filterNote) && (
                        <div style={{ position: 'absolute', top: -12, left: 20, background: '#ff4d4d', color: 'white', padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: 900, borderRadius: '50px', zIndex: 10, boxShadow: '0 4px 10px rgba(255,0,0,0.2)' }}>
                           <ShieldAlert size={12} style={{ display: 'inline', marginRight: '4px' }} /> 필터 정합성 오류!
                        </div>
                     )}
                     <div className="bottle-placeholder" style={{ fontSize: '4.5rem' }}>{p.image}</div>
                     <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{p.name}</h3>
                     <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.5rem' }}>{p.brand} 컬렉션 • {p.price.toLocaleString()}원</p>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                        {p.notes.map(n => <span key={n} className={`note-tag ${filterNote === n ? 'active' : ''}`} style={{ background: filterNote === n ? 'var(--perfume-gold)' : '#f8f8f8', color: filterNote === n ? 'white' : '#777' }}>#{n}</span>)}
                     </div>
                     <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => addToCart(p.id)}>구매하기</button>
                  </motion.div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="fade-in">
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {glossary.map(item => (
                      <div 
                        key={item.id} 
                        className={`stat-card ${selectedGlossary?.id === item.id ? 'active' : ''}`} 
                        style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderBottom: selectedGlossary?.id === item.id ? '4px solid var(--perfume-gold)' : '1px solid #eee' }}
                        onClick={() => setSelectedGlossary(item)}
                      >
                         <div style={{ color: 'var(--perfume-gold)' }}>{item.icon}</div>
                         <div>
                            <div style={{ fontWeight: 800 }}>{item.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#999' }}>상세 보기 <ArrowRight size={12} style={{ display: 'inline' }} /></div>
                         </div>
                      </div>
                   ))}
                </div>
                <div style={{ background: 'white', padding: '4rem', borderRadius: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   {selectedGlossary ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selectedGlossary.id}>
                         <div style={{ fontSize: '4rem', color: 'var(--perfume-gold)', marginBottom: '2rem' }}>{selectedGlossary.icon}</div>
                         <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{selectedGlossary.title}</h2>
                         <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: 1.8 }}>{selectedGlossary.desc}</p>
                         <button className="btn btn-primary" style={{ marginTop: '2.5rem' }} onClick={() => { setFilterNote(selectedGlossary.id); fetchPerfumes(selectedGlossary.id); setActiveTab('perfumes'); }}>이 향기 향수 보기</button>
                      </motion.div>
                   ) : (
                      <div style={{ textAlign: 'center', color: '#ccc' }}>
                         <BookOpen size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                         <p>왼쪽 목록에서 향기를 선택하여 상세 정보를 확인하세요.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'match' && (
          <div className="fade-in">
             <div style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', marginBottom: '3rem', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>고성능 향기 매칭 엔진 (v2.4)</h3>
                      <p style={{ fontSize: '0.9rem', color: '#888' }}>동일 조건 하에서의 **결과 재현성**과 **상태 격리**를 테스트합니다.</p>
                   </div>
                   <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button className="btn btn-primary" onClick={() => fetchMatch(false)} data-bug-id="site045-bug01">정밀 매칭 실행</button>
                      <button className="btn btn-outline" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }} onClick={() => fetchMatch(true)} data-bug-id="site045-bug03">
                         <RefreshCw size={16} /> 반복 호출 (상태 오염 테스트)
                      </button>
                   </div>
                </div>
             </div>

             <div className="perfume-grid">
                {matchResults.map((p, i) => (
                  <motion.div layout key={`${p.id}-${i}`} className="perfume-card">
                     <div className="score-badge">성분 매칭 {Math.round(p.matchScore || p.totalScore)}%</div>
                     <div className="bottle-placeholder" style={{ fontSize: '4.5rem' }}>{p.image}</div>
                     <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{i+1}. {p.name}</h3>
                     <div style={{ fontSize: '0.8rem', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
                        <span>지속력: {p.longevity}</span>
                        <span>베이스: {p.baseScore}점</span>
                     </div>
                     {p.bonusScore > 0 && (
                        <div style={{ marginTop: '1rem', padding: '0.6rem', background: 'var(--perfume-pastel)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--perfume-gold)', fontWeight: 800, textAlign: 'center' }}>
                           <ShieldAlert size={12} style={{ display: 'inline', marginRight: '4px' }} /> 전역 상태 누적 보너스: +{p.bonusScore}
                        </div>
                     )}
                  </motion.div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="fade-in">
             <div className="stat-grid">
                <div className="stat-card">
                   <BarChart3 size={24} color="var(--perfume-gold)" style={{ marginBottom: '1rem' }} />
                   <p style={{ color: '#888', fontSize: '0.9rem' }}>총 컬렉션 수</p>
                   <div className="stat-val">{summary?.totalPerfumes}</div>
                </div>
                <div className="stat-card" style={{ borderBottomColor: summary?.bugId === 'site045-bug04' ? 'red' : 'var(--perfume-gold)' }}>
                   <Beaker size={24} color="var(--perfume-gold)" style={{ marginBottom: '1rem' }} />
                   <p style={{ color: '#888', fontSize: '0.9rem' }}>알고리즘 평균 점수</p>
                   <div className="stat-val">{Math.round(summary?.avgScore)}</div>
                   {summary?.bugId === 'site045-bug04' && <p style={{ color: 'red', fontSize: '0.7rem', marginTop: '0.5rem' }}>* 실제 평균({Math.round(summary.realAvgScore)})과 불일치 발생</p>}
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000 }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'fixed', right: 0, top: 0, width: '420px', height: '100%', background: 'white', zIndex: 1001, padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', boxShadow: '-15px 0 50px rgba(0,0,0,0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontStyle: 'italic' }}><ShoppingBag size={28} /> My Atelier</h2>
                  <X size={28} style={{ cursor: 'pointer' }} onClick={() => setIsCartOpen(false)} />
               </div>

               <div style={{ flex: 1, overflowY: 'auto' }}>
                  {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '8rem', color: '#ccc' }}>
                       <Droplets size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.15 }} />
                       <p style={{ fontSize: '1.1rem' }}>아직 선택된 향기가 없습니다.</p>
                    </div>
                  ) : (
                    cartItems.map(item => (
                       <div key={item.cartId} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: '#fcfcfc', border: '1px solid #f0f0f0', borderRadius: '16px', marginBottom: '1.2rem', alignItems: 'center' }}>
                          <div style={{ fontSize: '2.5rem' }}>{item.image}</div>
                          <div style={{ flex: 1 }}>
                             <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.name}</div>
                             <div style={{ color: 'var(--perfume-gold)', fontWeight: 900, fontSize: '0.9rem' }}>{item.price.toLocaleString()}원</div>
                          </div>
                          <button style={{ background: 'none', border: 'none', color: '#eee', cursor: 'pointer' }} className="remove-btn" onClick={() => removeFromCart(item.cartId)}>
                             <Trash2 size={20} />
                          </button>
                       </div>
                    ))
                  )}
               </div>

               <div style={{ marginTop: '2rem', paddingTop: '2.5rem', borderTop: '2px solid #f8f8f8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 900, marginBottom: '2.5rem' }}>
                     <span style={{ fontWeight: 300 }}>Total</span>
                     <span style={{ color: 'var(--perfume-gold)' }}>{cartItems.reduce((acc, item) => acc + item.price, 0).toLocaleString()}원</span>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '1.3rem', fontSize: '1.1rem' }} onClick={() => { alert("향수 제작(주문) 기능은 현재 준비 중입니다."); setIsCartOpen(false); }}>
                     주문 완료하기
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
