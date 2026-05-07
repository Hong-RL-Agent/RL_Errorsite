import React, { useState, useEffect } from 'react';
import { 
  Wine, 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  RotateCcw, 
  Zap,
  AlertTriangle,
  X,
  History,
  CheckCircle2,
  Beer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recipes, setRecipes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeBug, setActiveBug] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: '', abv: 15, ingredients: '', difficulty: '보통' });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) {}
  };

  const fetchRecipes = async () => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/recipes`);
      const data = await res.json();
      setRecipes(data.data);
      if (data.bugId) setActiveBug(data);
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const fetchRecipeDetail = async (id) => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/recipes/${id}`);
      const data = await res.json();
      setSelectedRecipe(data);
      if (data.bugId) setActiveBug(data);
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const handleCreateRecipe = async (triggerBug = false) => {
    const payload = triggerBug ? { name: "신규 칵테일 (검증 미흡)" } : { 
      ...newRecipe, 
      ingredients: newRecipe.ingredients.split(',').map(i => i.trim()) 
    };

    try {
      const res = await fetch(`${API_BASE}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.created) {
        if (data.bugId) setActiveBug(data);
        setNewRecipe({ name: '', abv: 15, ingredients: '', difficulty: '보통' });
        fetchSummary();
        alert("레시피가 등록되었습니다.");
      }
    } catch (e) {}
  };

  const handleUpdateRecipe = async (id) => {
    try {
      await fetch(`${API_BASE}/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "수정된 레시피 이름 (캐시 오류)" })
      });
      fetchRecipeDetail(id);
    } catch (e) {}
  };

  const handleShake = async () => {
    setShaking(true);
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/shaker/random`);
        const data = await res.json();
        setSelectedRecipe(data);
        setActiveTab('recipes');
      } catch (e) {} finally {
        setShaking(false);
      }
    }, 1500);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <Wine size={32} />
          <span>믹솔로지</span>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} /> 대시보드
            </li>
            <li className={`nav-item ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => { setActiveTab('recipes'); fetchRecipes(); setSelectedRecipe(null); }}>
              <BookOpen size={20} /> 레시피 목록
            </li>
            <li className={`nav-item ${activeTab === 'shaker' ? 'active' : ''}`} onClick={() => setActiveTab('shaker')}>
              <RotateCcw size={20} /> 칵테일 쉐이커
            </li>
            <li className={`nav-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
              <PlusCircle size={20} /> 레시피 등록
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
            {activeTab === 'dashboard' && "바 오버뷰"}
            {activeTab === 'recipes' && "칵테일 라이브러리"}
            {activeTab === 'shaker' && "AI 믹솔로지 쉐이커"}
            {activeTab === 'create' && "신규 레시피 제작"}
          </h2>
        </header>

        <AnimatePresence>
          {activeBug && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="banner">
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <AlertTriangle size={24} color="var(--neon-pink)" />
                  <div>
                     <strong style={{ display: 'block', color: 'var(--neon-pink)' }}>시스템 논리 오류 감지: {activeBug.bugId}</strong>
                     <span style={{ fontSize: '0.85rem' }}>백엔드에서 일관되지 않거나 잘못된 데이터 상태가 반환되었습니다.</span>
                  </div>
                  <span className="bug-tag">{activeBug.bugId}</span>
               </div>
               <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'dashboard' && (
          <div className="fade-in">
             <div className="stats-grid">
                <div className="stat-card">
                   <div className="value">{summary?.totalRecipes}</div>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>등록된 레시피</div>
                </div>
                <div className="stat-card">
                   <div className="value">{summary?.avgAbv}%</div>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>평균 도수</div>
                </div>
                <div className="stat-card">
                   <div className="value">98</div>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>바텐더 평점</div>
                </div>
             </div>
             
             <div className="shaker-box">
                <Zap size={48} color="var(--neon-blue)" style={{ marginBottom: '1.5rem' }} />
                <h3>오늘의 추천 칵테일?</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>AI 바텐더가 당신의 취향에 맞는 최고의 레시피를 골라드립니다.</p>
                <button className="btn btn-neon" onClick={() => setActiveTab('shaker')}>쉐이커로 이동</button>
             </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="fade-in">
             <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <button className="btn btn-neon" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={fetchRecipes} data-bug-id="site041-bug01">목록 새로고침</button>
             </div>

             {selectedRecipe ? (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="recipe-detail" style={{ background: 'var(--card-bg)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--neon-blue)' }}>{selectedRecipe.name}</h2>
                        <span className="abv-badge" style={{ position: 'static' }}>{selectedRecipe.abv}% ABV</span>
                     </div>
                     <button className="btn btn-neon" style={{ fontSize: '0.8rem' }} onClick={() => handleUpdateRecipe(selectedRecipe.id)} data-bug-id="site041-bug04">정보 수정</button>
                  </div>
                  
                  <div style={{ marginTop: '2rem' }}>
                     <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>재료 목록</h4>
                     <div>
                        {(selectedRecipe.ingredients || selectedRecipe.ingredientList || []).map((ing, i) => (
                          <span key={i} className="ingredient-tag">{ing}</span>
                        ))}
                     </div>
                  </div>

                  <div style={{ marginTop: '2rem' }}>
                     <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>레시피 설명</h4>
                     <p style={{ lineHeight: '1.6' }}>{selectedRecipe.description || "설명이 등록되지 않았습니다."}</p>
                  </div>

                  <button className="btn btn-neon" style={{ marginTop: '3rem' }} onClick={() => setSelectedRecipe(null)}>목록으로 돌아가기</button>
               </motion.div>
             ) : (
               <div className="recipe-grid">
                  {recipes.map(r => (
                    <div key={r.id} className="recipe-card" onClick={() => fetchRecipeDetail(r.id)} data-bug-id={r.id === 1 ? "site041-bug02" : null}>
                       <div className="abv-badge">{r.abv}%</div>
                       <div className="recipe-info">
                          <span style={{ fontSize: '0.7rem', color: 'var(--neon-pink)', fontWeight: 900 }}>{r.difficulty}</span>
                          <h3>{r.name}</h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                             {(r.ingredients || r.ingredientList || []).slice(0, 3).map((ing, i) => (
                               <span key={i} className="ingredient-tag">{ing}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'shaker' && (
          <div className="fade-in">
             <div className="shaker-box" style={{ padding: '8rem 2rem' }}>
                <motion.div animate={shaking ? { rotate: [0, -20, 20, -20, 0], scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 0.2 }}>
                   <RotateCcw size={120} color={shaking ? "var(--neon-pink)" : "var(--neon-blue)"} style={{ marginBottom: '2rem', filter: 'drop-shadow(0 0 15px var(--neon-blue))' }} />
                </motion.div>
                <h3>{shaking ? "쉐이킹 중..." : "새로운 맛을 찾고 계신가요?"}</h3>
                <button className={`btn btn-neon ${shaking ? 'shaking' : ''}`} style={{ marginTop: '3rem', padding: '1.5rem 4rem' }} onClick={handleShake} disabled={shaking}>
                   쉐이킹 시작
                </button>
             </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
             <div style={{ background: 'var(--card-bg)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginBottom: '2rem' }}>나만의 레시피 등록</h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>칵테일 이름</label>
                   <input 
                      type="text" 
                      style={{ width: '100%', background: '#000', border: '1px solid var(--border-color)', padding: '1rem', color: 'white', borderRadius: '12px' }} 
                      placeholder="예: 네온 선셋" 
                      value={newRecipe.name}
                      onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                   />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>재료 (쉼표로 구분)</label>
                   <textarea 
                      style={{ width: '100%', background: '#000', border: '1px solid var(--border-color)', padding: '1rem', color: 'white', borderRadius: '12px', minHeight: '100px' }} 
                      placeholder="보드카, 라임, 탄산수..." 
                      value={newRecipe.ingredients}
                      onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                   />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                   <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>도수 (%)</label>
                      <input 
                         type="number" 
                         style={{ width: '100%', background: '#000', border: '1px solid var(--border-color)', padding: '1rem', color: 'white', borderRadius: '12px' }} 
                         value={newRecipe.abv}
                         onChange={(e) => setNewRecipe({...newRecipe, abv: parseInt(e.target.value)})}
                      />
                   </div>
                   <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>난이도</label>
                      <select 
                         style={{ width: '100%', background: '#000', border: '1px solid var(--border-color)', padding: '1rem', color: 'white', borderRadius: '12px' }}
                         value={newRecipe.difficulty}
                         onChange={(e) => setNewRecipe({...newRecipe, difficulty: e.target.value})}
                      >
                         <option>쉬움</option>
                         <option>보통</option>
                         <option>어려움</option>
                      </select>
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                   <button className="btn btn-neon" style={{ flex: 1 }} onClick={() => handleCreateRecipe()}>저장하기</button>
                   <button className="btn btn-neon" style={{ flex: 1, borderColor: 'var(--neon-pink)', color: 'var(--neon-pink)' }} onClick={() => handleCreateRecipe(true)} data-bug-id="site041-bug03">
                      간편 등록
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
