import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Zap, 
  History, 
  Heart, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  Bell, 
  Settings, 
  User,
  MoreVertical,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Plus
} from 'lucide-react';

const DAYS = [
  { key: 'mon', label: '월' },
  { key: 'tue', label: '화' },
  { key: 'wed', label: '수' },
  { key: 'thu', label: '목' },
  { key: 'fri', label: '금' },
  { key: 'sat', label: '토' },
  { key: 'sun', label: '일' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDay, setSelectedDay] = useState('mon');
  const [webtoons, setWebtoons] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bug, setBug] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSummary();
    fetchLogs();
    fetchWebtoons();
  }, [selectedDay, activeTab]);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      setSummary(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchWebtoons = async () => {
    setLoading(true);
    // Note: We don't clear the bug state here if it was just set by handleLike or handleUpdate
    try {
      let url = activeTab === 'latest' ? '/api/webtoons/latest' : `/api/webtoons?day=${selectedDay}`;
      const res = await fetch(url);
      const data = await res.json();
      setWebtoons(data.data);
      if (data.bugId) {
        setBug({ id: data.bugId, type: data.bugId.split('-')[1], msg: "데이터 조회 시 로직 결함 감지" });
      } else {
        // Only clear bug if it's a "fetch" bug (01 or 04)
        if (bug && (bug.id === 'site061-bug01' || bug.id === 'site061-bug04')) {
           setBug(null);
        }
      }
    } catch (e) {
      showToast("데이터 연동 실패", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await fetch('/api/webtoons/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.bugId) {
        setBug({ id: data.bugId, type: '좋아요 증가 누락', msg: "좋아요 요청은 성공했으나 반영되지 않았습니다 (비원자적 연산)" });
        showToast("좋아요 반영 오류 감지", "error");
      } else {
        showToast("좋아요를 눌렀습니다!", "success");
      }
      fetchWebtoons();
    } catch (e) { showToast("좋아요 실패"); }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch('/api/webtoons/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.bugId) {
        setBug({ id: data.bugId, type: '업데이트 반영 지연', msg: "최신화 요청이 서버에는 기록되었으나 목록에 즉시 반영되지 않았습니다." });
        showToast("캐시 정합성 오류 감지", "error");
      } else {
        showToast("최신 연재본으로 업데이트했습니다.");
      }
      fetchWebtoons();
    } catch (e) { showToast("업데이트 실패"); }
  };

  const handleUnprepared = (feature) => {
    showToast(`'${feature}' 기능은 현재 준비 중입니다.`);
  };

  return (
    <div className="wf-container">
      {toast && (
        <div className={`toast-alert ${toast.type} fade-in`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <aside className="wf-sidebar">
        <div className="wf-logo" onClick={() => window.location.reload()}>
           <div className="logo-red"></div>
           <span>WEBTOON <strong>FLOW</strong></span>
        </div>
        <nav className="wf-nav">
           <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} /> 대시보드
           </button>
           <button className={`nav-item ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>
              <Calendar size={20} /> 요일별 연재
           </button>
           <button className={`nav-item ${activeTab === 'latest' ? 'active' : ''}`} onClick={() => setActiveTab('latest')}>
              <Zap size={20} /> 최신 업데이트
           </button>
           <button className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
              <History size={20} /> 시스템 로그
           </button>
        </nav>
        <div className="sidebar-bottom">
           <div className="user-profile" onClick={() => handleUnprepared('프로필 정보')}>
              <div className="u-avatar"><User size={18} /></div>
              <div className="u-info">
                 <span className="u-name">관리자</span>
                 <span className="u-role">Admin Account</span>
              </div>
           </div>
           <button className="settings-btn" onClick={() => handleUnprepared('설정')}><Settings size={18} /></button>
        </div>
      </aside>

      <main className="wf-main">
        <header className="wf-header">
           <div className="h-left">
              <h1>{activeTab === 'dashboard' ? '금융 및 현황 요약' : activeTab === 'daily' ? '요일별 연재 관리' : activeTab === 'latest' ? '최신 업데이트 내역' : '시스템 실시간 로그'}</h1>
              <p>{new Date().toLocaleDateString()} 실시간 연재 시스템 현황</p>
           </div>
           <div className="h-right">
              <div className="search-box">
                 <Search size={18} />
                 <input type="text" placeholder="웹툰 제목 검색..." onKeyDown={(e) => e.key === 'Enter' && handleUnprepared('검색')} />
              </div>
              <button className="h-icon" onClick={() => handleUnprepared('알림')}><Bell size={20} /></button>
              <button className="h-icon" onClick={() => handleUnprepared('메뉴')}><MoreVertical size={20} /></button>
           </div>
        </header>

        {bug && (
          <div className="bug-notification fade-in">
             <AlertTriangle size={24} />
             <div className="bug-details">
                <div className="bug-header">
                   <strong>백엔드 로직 결함 탐지 (ID: {bug.id})</strong>
                   <span className="bug-badge">{bug.type}</span>
                </div>
                <span>{bug.msg}</span>
             </div>
             <button className="bug-report-btn" onClick={() => setBug(null)}>오류 확인</button>
          </div>
        )}

        <div className="content-area">
          {activeTab === 'dashboard' && (
            <div className="view-dashboard fade-in">
               <div className="stats-row">
                  <div className="stat-card clickable" onClick={() => handleUnprepared('상세 통계')}>
                     <span className="label">총 등록 웹툰</span>
                     <span className="value">{summary?.totalWebtoons || 0}</span>
                     <span className="trend positive">+5 이달의 신규</span>
                  </div>
                  <div className="stat-card clickable" onClick={() => handleUnprepared('연재 스케줄')}>
                     <span className="label">오늘의 연재</span>
                     <span className="value">{summary?.todayCount || 0}</span>
                     <span className="trend">스케줄 정상 작동</span>
                  </div>
                  <div className="stat-card highlight clickable" onClick={() => handleUnprepared('좋아요 랭킹')}>
                     <span className="label">누적 좋아요</span>
                     <span className="value">42.5K</span>
                     <span className="trend positive">+1.2K 오늘 상승</span>
                  </div>
               </div>
               <div className="dashboard-grid">
                  <div className="panel-box glass">
                     <div className="box-header">
                        <h3>연재 서버 상태</h3>
                        <button className="refresh-btn-icon" onClick={() => { fetchSummary(); showToast("서버 상태 갱신됨"); }}><RefreshCw size={14} /></button>
                     </div>
                     <div className="status-item"><span>API 응답 속도</span><span className="v">45ms</span></div>
                     <div className="status-item"><span>캐시 히트율</span><span className="v">92.4%</span></div>
                     <div className="status-item"><span>오류 발생 빈도</span><span className="v danger">0.05%</span></div>
                     <button className="btn-action-full" onClick={() => handleUnprepared('서버 상세 제어')}>서버 관리 도구 열기</button>
                  </div>
                  <div className="panel-box glass">
                     <div className="box-header">
                        <h3>실시간 트래픽</h3>
                        <Plus size={16} className="clickable" onClick={() => handleUnprepared('트래픽 확대')} />
                     </div>
                     <div className="monitor-wave">
                        <div className="bar" style={{height:'40%'}}></div>
                        <div className="bar" style={{height:'60%'}}></div>
                        <div className="bar" style={{height:'80%'}}></div>
                        <div className="bar" style={{height:'50%'}}></div>
                        <div className="bar" style={{height:'70%'}}></div>
                        <div className="bar" style={{height:'30%'}}></div>
                     </div>
                     <p className="monitor-txt">현재 사용자 접속이 원활한 상태입니다.</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="view-series fade-in">
               <div className="day-tabs">
                  {DAYS.map(d => (
                    <button 
                      key={d.key} 
                      className={`tab-btn ${selectedDay === d.key ? 'active' : ''}`}
                      data-bug-id={d.key === 'mon' ? 'site061-bug01' : undefined}
                      onClick={() => setSelectedDay(d.key)}
                    >
                      {d.label}
                    </button>
                  ))}
               </div>
               
               {loading && webtoons.length === 0 ? (
                 <div className="loader"><Loader2 className="spin" size={32} /></div>
               ) : (
                 <div className="webtoon-grid">
                    {webtoons.map(w => (
                      <div key={w.id} className="webtoon-card" onClick={() => handleUnprepared(`${w.title} 상세 정보`)}>
                         <div className="card-thumb">
                            <img src={w.thumbnail} alt={w.title} />
                            {w.day !== selectedDay && (
                              <div className="day-mismatch-badge">요일 불일치</div>
                            )}
                            <div className="hover-overlay">
                               <ExternalLink size={24} />
                            </div>
                         </div>
                         <div className="card-info">
                            <h4 className="title">{w.title}</h4>
                            <span className="author">{w.author}</span>
                            <div className="card-footer">
                               <div className="likes">
                                  <Heart size={14} className="heart-icon" /> {w.likes.toLocaleString()}
                               </div>
                               <button 
                                 className="like-btn" 
                                 data-bug-id="site061-bug03"
                                 onClick={(e) => { e.stopPropagation(); handleLike(w.id); }}
                               >
                                  +1
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'latest' && (
            <div className="view-latest fade-in">
               <div className="toolbar">
                  <h3>최신 업데이트 목록</h3>
                  <button className="sort-btn" data-bug-id="site061-bug04" onClick={fetchWebtoons}>
                     <ArrowUpDown size={16} /> 정렬 기준 변경 (Bug 04)
                  </button>
               </div>
               <div className="latest-list">
                  {webtoons.map((w, idx) => (
                    <div key={`${w.id}-${idx}`} className="latest-item glass">
                       <div className="l-thumb"><img src={w.thumbnail} alt="" /></div>
                       <div className="l-main">
                          <div className="l-header">
                             <span className="l-title">{w.title}</span>
                             <span className="l-time">{new Date(w.updatedAt).toLocaleTimeString()}</span>
                          </div>
                          <div className="l-body">
                             <span className="l-author">{w.author}</span>
                             <div className="l-tags">
                                <span className="tag-red">UPDATED</span>
                                <span className="tag-gray">{w.day.toUpperCase()}</span>
                             </div>
                          </div>
                       </div>
                       <div className="l-actions">
                          <button 
                            className="update-action-btn" 
                            data-bug-id="site061-bug02"
                            onClick={() => handleUpdate(w.id)}
                          >
                             <RefreshCw size={16} /> 갱신
                          </button>
                          <button className="more-btn" onClick={() => handleUnprepared('옵션')}><MoreVertical size={16} /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="view-logs fade-in">
               <div className="log-header-bar">
                  <h3>서버 트랜잭션 로그</h3>
                  <button className="btn-outline-sm" onClick={() => { fetchLogs(); showToast("로그 동기화 완료"); }}>로그 갱신</button>
               </div>
               <div className="log-table glass">
                  <div className="log-head">
                     <span>ACTION</span>
                     <span>CONTENT ID</span>
                     <span>RESULT STATE</span>
                     <span>TIMESTAMP</span>
                  </div>
                  <div className="log-body">
                     {logs.length === 0 ? (
                       <div className="empty-logs">기록된 트랜잭션이 없습니다.</div>
                     ) : (
                       logs.map((log, i) => (
                         <div key={i} className="log-row">
                            <span className={`action-tag ${log.action}`}>{log.action}</span>
                            <span>ITEM #{log.id}</span>
                            <span>{log.result || 'EXECUTED'}</span>
                            <span>{new Date(log.time).toLocaleTimeString()}</span>
                         </div>
                       ))
                     )}
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      <div className="ppo-monitor">
         <div className="mon-header">PPO-ENVIRONMENT-MONITOR</div>
         <div className="mon-body">
            <div className="mon-row"><span>ACTIVE BUG</span><span className="v highlight">{bug ? bug.id : 'NONE'}</span></div>
            <div className="mon-row"><span>SITE ID</span><span className="v">site061</span></div>
            <div className="mon-row"><span>STATUS</span><span className={`v ${bug ? 'fault' : 'ready'}`}>{bug ? 'FAULT DETECTED' : 'SYSTEM READY'}</span></div>
         </div>
      </div>
    </div>
  );
};

export default App;
