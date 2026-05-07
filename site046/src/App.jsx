import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Globe2, 
  TrendingUp, 
  Search, 
  LayoutDashboard,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Database,
  ArrowUpDown,
  FileText,
  MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [gdpData, setGdpData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [continentData, setContinentData] = useState([]);
  const [activeBug, setActiveBug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortOrder, setSortOrder] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  const limit = 8;

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  useEffect(() => {
    if (activeTab === 'rankings') fetchRankings();
    if (activeTab === 'continents') fetchContinents();
  }, [activeTab, page, sortOrder, yearFilter]);

  const fetchDashboardSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) {}
  };

  const fetchRankings = async () => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      let url = `${API_BASE}/gdp?page=${page}&limit=${limit}`;
      if (sortOrder) url += `&sort=${sortOrder}`;
      if (yearFilter) url += `&year=${yearFilter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setGdpData(data.data);
      setTotalItems(data.total);
      
      if (data.bugId) {
        let bugInfo = { id: data.bugId };
        if (data.bugId === 'site046-bug01') {
          bugInfo.type = '정렬 알고리즘 오류';
          bugInfo.desc = '수치 데이터가 문자열로 정렬되어 논리적인 순위가 깨진 상태입니다.';
        } else if (data.bugId === 'site046-bug03') {
          bugInfo.type = '캐시 갱신 실패';
          bugInfo.desc = '최신 데이터 대신 과거 2022년의 스테일(Stale) 데이터가 노출되고 있습니다.';
        } else if (data.bugId === 'site046-bug04') {
          bugInfo.type = '페이지네이션 인덱스 오류';
          bugInfo.desc = '마지막 페이지 집계 시 마지막 한 건의 데이터가 누락되었습니다.';
        }
        setActiveBug(bugInfo);
      }
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const fetchContinents = async () => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/gdp/summary`);
      const data = await res.json();
      setContinentData(data.data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '데이터 집계 누락', desc: '특정 국가들이 대륙별 합계 계산에서 제외되어 총합이 실제보다 작습니다.' });
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
       fetchRankings();
       return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/search?q=${searchQuery}`);
      const data = await res.json();
      setGdpData(data.results);
      setTotalItems(data.results.length);
      setActiveTab('rankings');
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSortOrder('');
    setYearFilter('');
    setPage(1);
    setSearchQuery('');
    fetchRankings();
  };

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
          <Globe2 size={28} />
          <span>GDP TRACKER</span>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <LayoutDashboard size={20} /> 대시보드
            </li>
            <li className={`nav-item ${activeTab === 'rankings' ? 'active' : ''}`} onClick={() => { setActiveTab('rankings'); setPage(1); }}>
              <BarChart3 size={20} /> 국가별 순위
            </li>
            <li className={`nav-item ${activeTab === 'continents' ? 'active' : ''}`} onClick={() => setActiveTab('continents')}>
              <TrendingUp size={20} /> 대륙별 분석
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
           <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>서버 상태</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
              Connected (Port 9155)
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
             <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--navy-dark)' }}>
                {activeTab === 'overview' && "경제 지표 요약"}
                {activeTab === 'rankings' && "국가별 GDP 통계"}
                {activeTab === 'continents' && "대륙별 경제 분포"}
             </h2>
             {isLoading && <RefreshCw size={20} className="spin" style={{ color: 'var(--gold-accent)' }} />}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="국가명을 입력하세요..." 
                  style={{ padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', width: '280px', fontSize: '0.9rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
             </div>
             <button className="btn btn-outline" onClick={clearFilters} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <RefreshCw size={16} /> 필터 초기화
             </button>
          </div>
        </header>

        <AnimatePresence>
          {activeBug && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="banner" style={{ borderLeft: '5px solid #d97706' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <AlertCircle size={26} color="#d97706" />
                  <div>
                     <strong style={{ display: 'block', fontSize: '1rem', color: '#92400e' }}>데이터 무결성 결함: {activeBug.id}</strong>
                     <span style={{ fontSize: '0.85rem', color: '#b45309' }}>[{activeBug.type}] {activeBug.desc}</span>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                     <span className="bug-tag">{activeBug.id}</span>
                  </div>
               </div>
               <X size={20} style={{ cursor: 'pointer', marginLeft: '1.5rem', color: '#92400e' }} onClick={() => setActiveBug(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'overview' && (
          <div className="fade-in">
             <div className="stat-grid">
                <div className="stat-card">
                   <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.8rem' }}>분석 대상 국가</p>
                   <div className="stat-val">{summary?.totalCountries} <span style={{ fontSize: '1rem', fontWeight: 400 }}>개국</span></div>
                </div>
                <div className="stat-card">
                   <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.8rem' }}>최고 GDP (USA)</p>
                   <div className="stat-val">${summary?.topGDP?.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 400 }}>B</span></div>
                </div>
                <div className="stat-card">
                   <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.8rem' }}>글로벌 평균 GDP</p>
                   <div className="stat-val">${summary?.avgGDP?.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 400 }}>B</span></div>
                </div>
             </div>

             <div className="data-card" style={{ padding: '4rem', textAlign: 'center', background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)' }}>
                <div style={{ background: '#fffbeb', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                   <Globe2 size={40} color="var(--gold-accent)" />
                </div>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--navy-dark)', marginBottom: '1.2rem', fontWeight: 800 }}>World Economic Insights 2024</h1>
                <p style={{ color: '#64748b', maxWidth: '650px', margin: '0 auto 3rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                   최신 거시 경제 데이터를 기반으로 한 국가별 경제 규모 리포트입니다. 
                   데이터 정렬, 집계, 캐시 정합성을 실시간으로 모니터링하여 시스템의 결함을 탐지하십시오.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                   <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }} onClick={() => setActiveTab('rankings')}>상세 데이터 분석</button>
                   <button className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }} onClick={() => setActiveTab('continents')}>대륙별 리포트</button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'rankings' && (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                   <button 
                    className={`btn ${sortOrder === 'desc' ? 'btn-primary' : 'btn-outline'}`} 
                    onClick={() => { setSortOrder('desc'); setPage(1); }}
                    data-bug-id="site046-bug01"
                   >
                     <ArrowUpDown size={16} style={{ marginRight: '8px' }} /> GDP 높은순 정렬
                   </button>
                   <button 
                    className={`btn ${yearFilter === 'latest' ? 'btn-primary' : 'btn-outline'}`} 
                    onClick={() => { setYearFilter('latest'); setPage(1); }}
                    data-bug-id="site046-bug03"
                   >
                     <RefreshCw size={16} style={{ marginRight: '8px' }} /> 최신 데이터 조회 (2024)
                   </button>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                   Showing {(page-1)*limit + 1} - {Math.min(page*limit, totalItems)} of {totalItems} countries
                </div>
             </div>

             <div className="data-card">
                <table>
                   <thead>
                      <tr>
                         <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                         <th>Country Name</th>
                         <th>Continent</th>
                         <th style={{ textAlign: 'right' }}>GDP (Billion USD)</th>
                         <th style={{ textAlign: 'center' }}>Data Freshness</th>
                         <th style={{ width: '100px' }}>Action</th>
                      </tr>
                   </thead>
                   <tbody>
                      {gdpData.map((c, i) => (
                        <tr key={c.country} onClick={() => setSelectedCountry(c)} style={{ cursor: 'pointer' }}>
                           <td style={{ textAlign: 'center', fontWeight: 800, color: (page-1)*limit + i + 1 <= 3 ? 'var(--gold-accent)' : '#94a3b8' }}>
                              {(page-1)*limit + i + 1}
                           </td>
                           <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                 <div style={{ width: '24px', height: '16px', background: '#f1f5f9', borderRadius: '2px' }}></div>
                                 <span style={{ fontWeight: 700 }}>{c.country}</span>
                              </div>
                           </td>
                           <td>{c.continent}</td>
                           <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--navy-dark)' }}>${c.gdp.toLocaleString()} B</td>
                           <td style={{ textAlign: 'center' }}>
                              <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', background: c.year === 2024 ? '#ecfdf5' : '#fff1f2', color: c.year === 2024 ? '#059669' : '#e11d48', fontSize: '0.75rem', fontWeight: 800, border: '1px solid currentColor' }}>
                                 {c.year} Verified
                              </span>
                           </td>
                           <td>
                              <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem' }}><FileText size={14} /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             <div className="pagination">
                <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={18} /></button>
                {[...Array(totalPages)].map((_, i) => (
                   <button 
                    key={i} 
                    className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`} 
                    onClick={() => setPage(i + 1)}
                    data-bug-id={i + 1 === totalPages ? "site046-bug04" : ""}
                    style={{ minWidth: '40px' }}
                   >
                     {i + 1}
                   </button>
                ))}
                <button className="btn btn-outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={18} /></button>
             </div>
          </div>
        )}

        {activeTab === 'continents' && (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>대륙별 GDP 합산 및 경제 비중 분석 데이터입니다.</p>
                <button className="btn btn-primary" onClick={fetchContinents} data-bug-id="site046-bug02" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                   <RefreshCw size={16} /> 집계 데이터 갱신
                </button>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {continentData.map(c => (
                   <div key={c.continent} className="data-card" style={{ padding: '2.5rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#e2e8f0' }}><TrendingUp size={40} /></div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.8rem', letterSpacing: '1px' }}>{c.continent.toUpperCase()}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                         <div className="stat-val" style={{ fontSize: '2.5rem' }}>${c.totalGDP.toLocaleString()}</div>
                         <div style={{ color: '#64748b', fontWeight: 600 }}>Billion USD</div>
                      </div>
                      <div style={{ marginTop: '2rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.6rem', color: '#64748b', fontWeight: 600 }}>
                            <span>Global Share</span>
                            <span>{Math.round((c.totalGDP / 80000) * 100)}%</span>
                         </div>
                         <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (c.totalGDP / 35000) * 100)}%` }} style={{ height: '100%', background: 'var(--gold-accent)', boxShadow: '0 0 10px rgba(251, 191, 36, 0.4)' }} />
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}
      </main>

      {/* Country Detail Modal */}
      <AnimatePresence>
         {selectedCountry && (
            <div className="modal-overlay" onClick={() => setSelectedCountry(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '3rem', borderRadius: '24px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                     <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{selectedCountry.country}</h3>
                     <X size={28} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSelectedCountry(null)} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2rem', background: '#f8fafc', borderRadius: '12px' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>대륙</span>
                        <span style={{ fontWeight: 700 }}>{selectedCountry.continent}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2rem', background: '#f8fafc', borderRadius: '12px' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>GDP 규모</span>
                        <span style={{ fontWeight: 800, color: 'var(--navy-dark)', fontSize: '1.2rem' }}>${selectedCountry.gdp.toLocaleString()} B</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2rem', background: '#f8fafc', borderRadius: '12px' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>기준 연도</span>
                        <span style={{ fontWeight: 700, color: selectedCountry.year === 2024 ? '#059669' : '#e11d48' }}>{selectedCountry.year}</span>
                     </div>
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '2.5rem', padding: '1.2rem' }} onClick={() => setSelectedCountry(null)}>닫기</button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default App;
