import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Home, 
  Radio, 
  TrendingUp, 
  LayoutDashboard,
  Search,
  Zap,
  MousePointer2,
  Edit3,
  AlertCircle,
  X,
  History,
  Clock,
  ExternalLink,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [news, setNews] = useState([]);
  const [streamData, setStreamData] = useState([]);
  const [popularNews, setPopularNews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeBug, setActiveBug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [scrappedNews, setScrappedNews] = useState([]); // New Feature: Scrap

  useEffect(() => {
    fetchSummary();
    fetchAllNews();
  }, []);

  const showFeedback = (msg) => {
    alert(msg);
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) {}
  };

  const fetchAllNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/news`);
      const data = await res.json();
      setNews(data.data);
    } catch (e) {}
  };

  const fetchStream = async () => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/news/stream`);
      const data = await res.json();
      setStreamData(data.data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '배치 처리 중 이벤트 손실 (Event Loss)', desc: '실시간 업데이트를 묶어서 처리하는 과정에서 일부 뉴스가 유실되었습니다.' });
      showFeedback("실시간 스트림 데이터를 수신했습니다.");
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const fetchPopular = async () => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/news/popular`);
      const data = await res.json();
      setPopularNews(data.data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '정렬 상태 불일치 (Sorting Inconsistency)', desc: '인기 뉴스 정렬이 요청마다 비결정적으로 변경되는 결함이 발견되었습니다.' });
      showFeedback("실시간 인기 랭킹을 갱신했습니다.");
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const handleNewsClick = async (newsId) => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/news/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId })
      });
      const data = await res.json();
      if (data.updated) {
        if (data.bugId === "site043-bug03") {
          setActiveBug({ id: data.bugId, type: '이벤트 중복 처리 (Duplicate Event)', desc: '클릭 이벤트가 중복 처리되어 조회수가 비정상적으로 급증했습니다.' });
        }
        showFeedback(`뉴스를 확인했습니다. (증가된 클릭수: ${data.added || 1})`);
        fetchAllNews();
        fetchSummary();
      }
    } catch (e) {}
  };

  const handleUpdateNews = async (newsId) => {
    if (!newsId) return;
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/news/${newsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "[업데이트] " + (news.find(n => n.id === newsId)?.title || "기존 제목") })
      });
      const data = await res.json();
      if (data.updated) {
        if (data.bugId === "site043-bug04") {
          setActiveBug({ id: data.bugId, type: '부분 상태 업데이트 (Partial Update)', desc: '뉴스 제목은 갱신되었으나, 수정 시간 등 연관 데이터가 업데이트되지 않았습니다.' });
        }
        showFeedback("뉴스 정보 수정이 완료되었습니다.");
      }
      fetchAllNews();
    } catch (e) {}
  };

  const handleScrap = (n) => {
    if (scrappedNews.find(s => s.id === n.id)) {
      setScrappedNews(scrappedNews.filter(s => s.id !== n.id));
      showFeedback("스크랩이 취소되었습니다.");
    } else {
      setScrappedNews([...scrappedNews, n]);
      showFeedback("기사가 스크랩함에 저장되었습니다.");
    }
  };

  const handleUnderConstruction = () => {
    showFeedback("준비 중입니다.. (곧 업데이트 예정)");
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Newspaper size={28} />
          <span>연애뉴스 LIVE</span>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              <Home size={20} /> 홈
            </li>
            <li className={`nav-item ${activeTab === 'live' ? 'active' : ''}`} onClick={() => { setActiveTab('live'); fetchStream(); }}>
              <Radio size={20} /> 실시간 헤드라인
            </li>
            <li className={`nav-item ${activeTab === 'popular' ? 'active' : ''}`} onClick={() => { setActiveTab('popular'); fetchPopular(); }}>
              <TrendingUp size={20} /> 인기 뉴스
            </li>
            <li className={`nav-item ${activeTab === 'scraps' ? 'active' : ''}`} onClick={() => setActiveTab('scraps')}>
              <Bookmark size={20} /> 내 스크랩 ({scrappedNews.length})
            </li>
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} /> 대시보드
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', fontSize: '0.8rem' }}>
          <button className="btn" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={handleUnderConstruction}>로그인</button>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleUnderConstruction}>회원가입</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {activeTab === 'home' && "뉴스 홈"}
            {activeTab === 'live' && "실시간 스트리밍 헤드라인"}
            {activeTab === 'popular' && "클릭 랭킹 (HOT)"}
            {activeTab === 'scraps' && "내 기사 스크랩함"}
            {activeTab === 'dashboard' && "포털 서비스 분석"}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
               <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
               <input 
                type="text" 
                placeholder="키워드 검색..." 
                style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '4px', border: '1px solid #ddd' }}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnderConstruction()}
               />
            </div>
          </div>
        </header>

        <AnimatePresence>
          {activeBug && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="banner">
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <AlertCircle size={22} color="var(--portal-red)" />
                  <div>
                     <strong style={{ display: 'block', fontSize: '0.9rem' }}>데이터 결함 감지: {activeBug.id}</strong>
                     <span style={{ fontSize: '0.8rem', color: '#666' }}>{activeBug.desc}</span>
                  </div>
                  <span className="bug-tag">{activeBug.id}</span>
               </div>
               <X size={18} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'home' && (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem' }}>최신 뉴스</h3>
                <button className="btn" onClick={() => { fetchAllNews(); showFeedback("목록을 새로고침했습니다."); }}>새로고침</button>
             </div>
             <div className="news-grid">
                {news.filter(n => n.title.includes(searchKeyword)).map(n => (
                  <div key={n.id} className="news-card">
                     <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 5 }}>
                        <Bookmark 
                          size={18} 
                          style={{ cursor: 'pointer', fill: scrappedNews.find(s => s.id === n.id) ? 'var(--portal-red)' : 'none', color: scrappedNews.find(s => s.id === n.id) ? 'var(--portal-red)' : '#ccc' }} 
                          onClick={(e) => { e.stopPropagation(); handleScrap(n); }}
                        />
                     </div>
                     <div onClick={() => handleNewsClick(n.id)}>
                        <div className="badge-live"><Clock size={12} /> LIVE</div>
                        <h3>{n.title}</h3>
                        <div className="meta-info">
                           <span>{n.category}</span>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <MousePointer2 size={12} /> {n.clicks.toLocaleString()}
                           </span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="fade-in">
             <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                   <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Radio size={18} color="var(--portal-red)" /> 실시간 데이터 스트림 수신 중...
                   </h4>
                   <button className="btn btn-primary" onClick={fetchStream} data-bug-id="site043-bug01">스트림 강제 동기화</button>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>* 실시간 큐에서 0.5초 간격으로 헤드라인을 가져옵니다.</div>
             </div>

             <div className="news-grid">
                {streamData.map(n => (
                  <div key={n.id} className="news-card">
                     <div className="badge-live">HEADLINE</div>
                     <h3>{n.title}</h3>
                     <div className="meta-info">
                        <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                        <span style={{ color: 'var(--portal-red)', fontWeight: 700 }}>실시간 업데이트됨</span>
                     </div>
                  </div>
                ))}
                {streamData.length === 0 && !isLoading && (
                   <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: '#aaa' }}>
                      스트림 버튼을 눌러 데이터를 수신하세요.
                   </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="fade-in">
             <div className="ranking-list">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                   <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <TrendingUp size={22} color="var(--portal-red)" /> 실시간 클릭 랭킹 TOP
                   </h3>
                   <button className="btn btn-primary" onClick={fetchPopular} data-bug-id="site043-bug02">랭킹 새로고침</button>
                </div>
                {popularNews.map((n, i) => (
                  <div key={n.id} className="ranking-item" onClick={() => handleNewsClick(n.id)} style={{ cursor: 'pointer' }}>
                     <span className="ranking-number">{i + 1}</span>
                     <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1rem' }}>{n.title}</h4>
                        <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.3rem' }}>
                           {n.category} • 클릭수 {n.clicks.toLocaleString()}
                        </div>
                     </div>
                     <ExternalLink size={16} color="#ccc" />
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'scraps' && (
          <div className="fade-in">
             {scrappedNews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '10rem', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
                   <Bookmark size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                   <p>스크랩한 기사가 없습니다.</p>
                   <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setActiveTab('home')}>기사 보러가기</button>
                </div>
             ) : (
                <div className="news-grid">
                   {scrappedNews.map(n => (
                      <div key={n.id} className="news-card">
                         <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                            <Bookmark 
                              size={18} 
                              style={{ cursor: 'pointer', fill: 'var(--portal-red)', color: 'var(--portal-red)' }} 
                              onClick={() => handleScrap(n)}
                            />
                         </div>
                         <div className="badge-live">SCRAPPED</div>
                         <h3>{n.title}</h3>
                         <div className="meta-info">
                            <span>{n.category}</span>
                            <button className="btn" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }} onClick={() => handleUnderConstruction()}>전문 읽기</button>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="fade-in">
             <div className="summary-grid">
                <div className="stat-box">
                   <div className="stat-label">등록된 뉴스</div>
                   <div className="stat-value">{summary?.totalNews}건</div>
                </div>
                <div className="stat-box">
                   <div className="stat-label">누적 클릭수</div>
                   <div className="stat-value">{summary?.totalClicks.toLocaleString()}</div>
                </div>
                <div className="stat-box">
                   <div className="stat-label">급상승 카테고리</div>
                   <div className="stat-value" style={{ color: 'var(--portal-red)' }}>{summary?.trendingCategory}</div>
                </div>
             </div>

             <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h4 style={{ marginBottom: '1.5rem' }}>뉴스 관리 도구</h4>
                <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <strong>기사 정보 일괄 수정</strong>
                      <p style={{ fontSize: '0.85rem', color: '#666' }}>첫 번째 기사의 제목을 실시간 업데이트 모드로 전환합니다.</p>
                   </div>
                   <button className="btn btn-primary" onClick={() => handleUpdateNews(news[0]?.id)} data-bug-id="site043-bug04">수정 실행</button>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" onClick={handleUnderConstruction}>데이터 백업</button>
                  <button className="btn" onClick={handleUnderConstruction}>서버 로그 확인</button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
