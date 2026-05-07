import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  TrendingUp, 
  Database, 
  History, 
  AlertTriangle,
  Info,
  MapPin,
  Tag,
  Activity,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Layers,
  Download,
  MoreVertical,
  ArrowUpDown,
  Loader2,
  FileText,
  BarChart
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('data'); // data, stats
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [groupStats, setGroupStats] = useState([]);
  const [averagePrice, setAveragePrice] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bug, setBug] = useState(null);
  const [filters, setFilters] = useState({ category: '', min: '', max: '', region: '', searchTerm: '' });
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBaseData();
    fetchItems();
    fetchLogs();
  }, []);

  const fetchBaseData = async () => {
    const resCat = await fetch('/api/categories');
    setCategories((await resCat.json()).data);
    const resSum = await fetch('/api/dashboard/summary');
    setSummary(await resSum.json());
  };

  const fetchItems = async (triggerBug = null) => {
    setLoading(true);
    const params = new URLSearchParams({ ...filters, triggerBug: triggerBug || '' });
    const res = await fetch(`/api/items?${params.toString()}`);
    const json = await res.json();
    
    // Client-side sort
    const sortedData = json.data.sort((a, b) => sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
    // Client-side search
    const filteredData = sortedData.filter(i => i.name.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    
    setItems(filteredData);
    if (json.bugId) {
      setBug({ id: json.bugId });
      if (json.bugId === 'site071-bug01') window.alert(`[범위 오류] ${json.bugId}: 가격 경계값(min/max) 상품이 누락되었습니다.`);
      if (json.bugId === 'site071-bug03') window.alert(`[필터 누락] ${json.bugId}: 지역(Region) 필터가 무시되었습니다.`);
    } else {
      setBug(null);
    }
    setLoading(false);
  };

  const fetchAverage = async (triggerBug = null) => {
    setLoading(true);
    const params = new URLSearchParams({ category: filters.category, triggerBug: triggerBug || '' });
    const res = await fetch(`/api/stats/average?${params.toString()}`);
    const json = await res.json();
    setAveragePrice(json.averagePrice);
    if (json.bugId === 'site071-bug02') {
      setBug({ id: json.bugId });
      window.alert(`[평균 왜곡] ${json.bugId}: 이상치가 포함되어 시세가 왜곡되었습니다.`);
    }
    setLoading(false);
  };

  const fetchGroupStats = async (triggerBug = null) => {
    setLoading(true);
    const res = await fetch(`/api/stats/group?triggerBug=${triggerBug || ''}`);
    const json = await res.json();
    setGroupStats(json.data);
    if (json.bugId === 'site071-bug04') {
      setBug({ id: json.bugId });
      window.alert(`[집계 오염] ${json.bugId}: 다른 카테고리 데이터가 집계에 섞였습니다.`);
    }
    setLoading(false);
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    setLogs((await res.json()).data);
  };

  return (
    <div className="dashboard-app">
      {/* Top Header */}
      <header className="top-header">
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
           <Layers size={28} color="var(--primary)" />
           <span style={{fontSize:'1.25rem', fontWeight:'900'}}>Market<strong>Flow</strong></span>
        </div>
        <div style={{display:'flex', gap:'32px', fontSize:'0.9rem', fontWeight:'600'}}>
           <button className="clickable" onClick={() => setView('data')} style={{background:'none', border:'none', fontSize:'inherit', fontWeight:'inherit', color: view === 'data' ? 'var(--primary)' : '#fff'}}>데이터 탐색</button>
           <button className="clickable" onClick={() => { setView('stats'); fetchGroupStats(); }} style={{background:'none', border:'none', fontSize:'inherit', fontWeight:'inherit', color: view === 'stats' ? 'var(--primary)' : '#fff'}}>시세 분석</button>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
           <div style={{padding:'4px 12px', background:'rgba(255,255,255,0.1)', borderRadius:'20px', fontSize:'0.75rem'}}>Status: <span style={{color:'var(--primary)'}}>Live</span></div>
           <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800'}}>MF</div>
        </div>
      </header>

      {/* Hero Stats */}
      <section className="hero-section">
         <div style={{minWidth:'200px', flex:1}}>
            <div style={{fontSize:'0.75rem', fontWeight:'800', color:'var(--text-muted)'}}>총 등록 상품</div>
            <div style={{fontSize:'2.2rem', fontWeight:'900', marginTop:'4px'}}>{summary?.totalItems}</div>
         </div>
         <div style={{minWidth:'200px', flex:1}}>
            <div style={{fontSize:'0.75rem', fontWeight:'800', color:'var(--text-muted)'}}>활성 카테고리</div>
            <div style={{fontSize:'2.2rem', fontWeight:'900', marginTop:'4px', color:'var(--primary)'}}>{summary?.activeCategories}</div>
         </div>
         <div style={{minWidth:'200px', flex:1}}>
            <div style={{fontSize:'0.75rem', fontWeight:'800', color:'var(--text-muted)'}}>시장 안정성</div>
            <div style={{fontSize:'2.2rem', fontWeight:'900', marginTop:'4px', color:'#3b82f6'}}>{summary?.marketHealth}</div>
         </div>
         <div style={{minWidth:'200px', flex:1, borderLeft:'1px solid var(--border)', paddingLeft:'40px'}}>
            <div style={{fontSize:'0.75rem', fontWeight:'800', color:'var(--text-muted)'}}>최신 업데이트</div>
            <div style={{fontSize:'1.2rem', fontWeight:'700', marginTop:'12px'}}>{new Date().toLocaleTimeString()}</div>
         </div>
      </section>

      {/* 3-Column Content */}
      <div className="content-grid">
         {/* Left: Filters */}
         <div className="column">
            <div className="filter-card">
               <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                  <h4 style={{fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px'}}><Filter size={16}/> 상세 검색</h4>
                  <button className="clickable" style={{background:'none', border:'none', fontSize:'0.7rem', color:'var(--primary)'}} onClick={() => setFilters({category:'', min:'', max:'', region:'', searchTerm:''})}>초기화</button>
               </div>
               <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                  <div className="filter-group">
                     <label>상품명 검색</label>
                     <div style={{position:'relative'}}>
                        <Search size={14} style={{position:'absolute', left:'12px', top:'10px', color:'var(--text-muted)'}} />
                        <input type="text" placeholder="모델명 입력..." style={{paddingLeft:'36px', width:'100%'}} value={filters.searchTerm} onChange={e => setFilters({...filters, searchTerm: e.target.value})} />
                     </div>
                  </div>
                  <div className="filter-group">
                     <label>카테고리</label>
                     <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                        <option value="">전체 카테고리</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div className="filter-group">
                     <label>지역 설정</label>
                     <select value={filters.region} onChange={e => setFilters({...filters, region: e.target.value})}>
                        <option value="">전체 지역</option>
                        <option value="Seoul">Seoul</option>
                        <option value="Busan">Busan</option>
                        <option value="Incheon">Incheon</option>
                        <option value="Daegu">Daegu</option>
                     </select>
                  </div>
                  <div className="filter-group">
                     <label>가격 범위 (₩)</label>
                     <div style={{display:'flex', gap:'8px'}}>
                        <input type="number" placeholder="최소" value={filters.min} onChange={e => setFilters({...filters, min: e.target.value})} />
                        <input type="number" placeholder="최대" value={filters.max} onChange={e => setFilters({...filters, max: e.target.value})} />
                     </div>
                  </div>
                  <button className="btn-primary" onClick={() => fetchItems()}>조회 실행</button>
                  <hr style={{border:'none', borderTop:'1px solid var(--border)', margin:'8px 0'}} />
                  <button className="btn-primary" style={{background:'#1e293b'}} onClick={() => fetchItems('bug01')} data-bug-id="site071-bug01">데이터 정밀 필터링</button>
                  <button className="btn-primary" style={{background:'#475569'}} onClick={() => fetchItems('bug03')} data-bug-id="site071-bug03">고급 다중 필터 적용</button>
               </div>
            </div>
         </div>

         {/* Center: Data Table or Stats */}
         <div className="column">
            {view === 'data' ? (
              <div className="main-table-card fade-in">
                 <div style={{padding:'24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3 style={{fontSize:'1.1rem'}}>실시간 매물 리스트 {loading && <Loader2 size={16} className="spin" style={{marginLeft:'8px', color:'var(--primary)'}}/>}</h3>
                    <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                       <button className="clickable" style={{background:'none', border:'none', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'4px'}} onClick={() => { setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); fetchItems(); }}>
                          <ArrowUpDown size={14} /> {sortOrder === 'desc' ? '가격높은순' : '가격낮은순'}
                       </button>
                       <Download size={18} className="clickable" onClick={() => window.alert("CSV 파일 생성이 준비되었습니다.")} />
                    </div>
                 </div>
                 <div style={{overflowX:'auto'}}>
                    <table>
                       <thead>
                          <tr>
                             <th>상품 정보</th>
                             <th>카테고리</th>
                             <th>지역</th>
                             <th>시세</th>
                          </tr>
                       </thead>
                       <tbody>
                          {items.map(item => (
                            <tr key={item.id} className="hover-row">
                               <td>
                                  <div style={{fontWeight:'700'}}>{item.name}</div>
                                  <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>#UID_{item.id}</div>
                               </td>
                               <td><span style={{padding:'4px 8px', background:'#f1f5f9', borderRadius:'6px', fontSize:'0.75rem'}}>{item.category}</span></td>
                               <td><div style={{display:'flex', alignItems:'center', gap:'4px'}}><MapPin size={12}/> {item.region}</div></td>
                               <td style={{fontWeight:'800', color:'var(--primary-dark)'}}>₩{item.price.toLocaleString()}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 {items.length === 0 && !loading && (
                    <div style={{padding:'100px', textAlign:'center', color:'var(--text-muted)'}}>
                       <Search size={48} style={{margin:'0 auto 20px', opacity:0.2}} />
                       <p>조건에 맞는 상품이 없습니다.</p>
                    </div>
                 )}
              </div>
            ) : (
              <div className="fade-in">
                 <div className="stat-card" style={{marginBottom:'24px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                       <h3 style={{fontSize:'1.1rem', display:'flex', alignItems:'center', gap:'8px'}}><BarChart size={18}/> 종합 시세 분석</h3>
                       <button className="btn-primary" onClick={() => fetchAverage('bug02')} data-bug-id="site071-bug02">실시간 평균 시세 계산</button>
                    </div>
                    <div style={{display:'flex', alignItems:'flex-end', gap:'12px'}}>
                       <div style={{fontSize:'3.5rem', fontWeight:'900', color: averagePrice > 5000000 ? '#ef4444' : 'var(--primary)'}}>
                          {averagePrice ? `₩${averagePrice.toLocaleString()}` : '-'}
                       </div>
                       {averagePrice && <span style={{marginBottom:'16px', fontSize:'0.9rem', color:'var(--text-muted)'}}>평균가</span>}
                    </div>
                    <div style={{marginTop:'24px', height:'8px', width:'100%', background:'#f1f5f9', borderRadius:'4px', overflow:'hidden'}}>
                       <div style={{height:'100%', width: averagePrice ? `${Math.min(100, (averagePrice / 5000000) * 100)}%` : '0%', background:'var(--primary)', transition:'0.5s'}}></div>
                    </div>
                 </div>
                 
                 <div className="main-table-card">
                    <div style={{padding:'24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                       <h3 style={{fontSize:'1.1rem'}}>카테고리별 정밀 집계</h3>
                       <button className="btn-primary" style={{background:'#1e293b'}} onClick={() => fetchGroupStats('bug04')} data-bug-id="site071-bug04">카테고리별 집계 데이터 갱신</button>
                    </div>
                    <table>
                       <thead>
                          <tr>
                             <th>카테고리</th>
                             <th>평균 시세</th>
                             <th>점유율</th>
                             <th>샘플 수</th>
                          </tr>
                       </thead>
                       <tbody>
                          {groupStats.map(s => (
                            <tr key={s.category}>
                               <td style={{fontWeight:'700'}}>{s.category}</td>
                               <td style={{color:'var(--primary-dark)', fontWeight:'800'}}>₩{s.average.toLocaleString()}</td>
                               <td>
                                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                     <div style={{width:'40px', height:'4px', background:'#f1f5f9', borderRadius:'2px'}}>
                                        <div style={{height:'100%', width:`${(s.count / 20) * 100}%`, background:'var(--primary)'}}></div>
                                     </div>
                                     <span style={{fontSize:'0.75rem'}}>{Math.round((s.count / (summary?.totalItems || 1)) * 100)}%</span>
                                  </div>
                               </td>
                               <td>{s.count} items</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}
         </div>

         {/* Right: Activity & Logs */}
         <div className="column">
            <div className="side-activity-card">
               <h4 style={{marginBottom:'20px', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px'}}><Activity size={16}/> 시스템 분석 로그</h4>
               <div style={{display:'flex', flexDirection:'column', gap:'12px', maxHeight:'700px', overflowY:'auto'}}>
                  {logs.map((l, i) => (
                    <div key={i} style={{padding:'16px', background:'#fff', borderRadius:'12px', fontSize:'0.8rem', borderLeft:'3px solid var(--primary)', boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>
                       <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px'}}>
                          <span style={{color:'var(--text-muted)', fontSize:'0.7rem'}}>{new Date(l.time).toLocaleTimeString()}</span>
                          <FileText size={12} color="var(--text-muted)" />
                       </div>
                       <div style={{marginTop:'4px', fontWeight:'600', color:'var(--text-main)'}}>{l.msg}</div>
                    </div>
                  ))}
                  {logs.length === 0 && <div style={{textAlign:'center', color:'var(--text-muted)', padding:'40px'}}>분석 대기 중...</div>}
               </div>
            </div>
         </div>
      </div>

      {/* PPO Monitor */}
      <div className="ppo-monitor">
         <div style={{borderBottom:'1px solid #334155', paddingBottom:'8px', marginBottom:'12px', fontSize:'0.7rem', fontWeight:'800', color:'#94a3b8'}}>PPO-MARKETFLOW-MONITOR</div>
         <div className="mon-row"><span className="mon-label">검출 상태</span><span style={{color: bug ? '#ef4444' : '#10b981'}}>{bug ? 'ACTIVE' : 'NOMINAL'}</span></div>
         <div className="mon-row"><span className="mon-label">결함 ID</span><span style={{color: '#fff'}}>{bug ? bug.id : 'NONE'}</span></div>
         <div className="mon-row"><span className="mon-label">지역 노드</span><span>KR-SEOUL-01</span></div>
      </div>
    </div>
  );
};

export default App;
