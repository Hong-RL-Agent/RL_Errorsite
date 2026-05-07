import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Search, 
  Calendar, 
  PieChart, 
  CreditCard, 
  LogOut, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreVertical, 
  X,
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  AlertCircle,
  RefreshCw,
  Download,
  Settings,
  Bell,
  FileText,
  ShieldCheck
} from 'lucide-react';
import './styles.css';

const App = () => {
  const [view, setView] = useState('dashboard'); // dashboard, transactions, filters
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTx, setSelectedTx] = useState(null);
  const [filters, setFilters] = useState({ minAmount: '' });
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
    addLog('시스템 초기화 완료. 보안 연결 유지 중.');
  }, [page]);

  const addLog = (msg) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg }, ...prev].slice(0, 5));
  };

  const fetchSummary = async () => {
    const res = await fetch('/api/dashboard/summary');
    setSummary(await res.json());
  };

  const fetchTransactions = async (triggerBug = null) => {
    setLoading(true);
    const params = new URLSearchParams({ page, triggerBug: triggerBug || '' });
    const res = await fetch(`/api/transactions?${params.toString()}`);
    const json = await res.json();
    setTransactions(json.data);
    setTotal(json.total);
    if (json.bugId) {
      setBug({ id: json.bugId });
      addLog(`[경고] 데이터 정합성 검증 지표 이상 감지 (${json.bugId})`);
    } else {
      setBug(null);
    }
    setLoading(false);
  };

  const fetchFiltered = async (triggerBug = null) => {
    setLoading(true);
    const params = new URLSearchParams({ minAmount: filters.minAmount, triggerBug: triggerBug || '' });
    const res = await fetch(`/api/transactions/filter?${params.toString()}`);
    const json = await res.json();
    setTransactions(json.data);
    if (json.bugId) {
      setBug({ id: json.bugId });
      addLog(`[경고] 필터링 연산 중 경계값 오류 감지 (${json.bugId})`);
    }
    setLoading(false);
  };

  const openDetail = async (id, triggerBug = null) => {
    if (triggerBug === 'bug04') {
      await fetchTransactions('bug04');
      setBug({ id: 'site047-bug04' });
      addLog(`[오류] 거래 유형(Flag) 불일치 상태 감지 (site047-bug04)`);
    } else {
      const res = await fetch(`/api/transactions/${id}`);
      setSelectedTx(await res.json());
      addLog(`거래 내역 상세 조회: #TX_${id}`);
    }
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('ko-KR').format(amt) + '원';

  return (
    <div className="banking-app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <ShieldCheck size={28} /> <strong>Blue</strong>Prime
        </div>
        <nav className="nav">
          <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={20}/> 종합 현황
          </div>
          <div className={`nav-item ${view === 'transactions' ? 'active' : ''}`} onClick={() => setView('transactions')}>
            <ArrowLeftRight size={20}/> 계좌 이체 내역
          </div>
          <div className={`nav-item ${view === 'filters' ? 'active' : ''}`} onClick={() => setView('filters')}>
            <Search size={20}/> 정밀 조건 검색
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="nav-item">
            <Settings size={20} /> 설정
          </div>
          <div className="nav-item">
            <LogOut size={20} /> 로그아웃
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Header Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
           <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>{new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' })}</div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1a237e', marginTop: '4px' }}>환영합니다, 고객님</h1>
           </div>
           <div style={{ display: 'flex', gap: '16px' }}>
              <div className="btn btn-ghost" style={{ padding: '12px' }}><Bell size={20} /></div>
              <button className="btn btn-primary" onClick={() => { addLog('데이터 수동 갱신 요청됨'); fetchTransactions('bug01'); }} data-bug-id="site047-bug01">
                 <RefreshCw size={18} /> 실시간 정보 갱신
              </button>
           </div>
        </header>

        {view === 'dashboard' && (
          <div className="fade-in">
            <div className="card-grid">
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', color: '#fff', border: 'none' }}>
                <div className="label" style={{ color: 'rgba(255,255,255,0.7)' }}>가용 잔액</div>
                <div className="value" style={{ fontSize: '2rem' }}>{summary ? formatCurrency(summary.balance) : '-'}</div>
                <div style={{ marginTop: '12px', fontSize: '0.8rem', opacity: 0.8 }}>안전 자산 등급: High-Secure</div>
              </div>
              <div className="stat-card">
                <div className="label">이번 달 수입</div>
                <div className="value" style={{ color: 'var(--success)' }}>+{summary ? formatCurrency(summary.income) : '-'}</div>
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--success)', fontWeight: '700' }}>전월 대비 12.5% ↑</div>
              </div>
              <div className="stat-card">
                <div className="label">이번 달 지출</div>
                <div className="value" style={{ color: 'var(--danger)' }}>-{summary ? formatCurrency(summary.expense) : '-'}</div>
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>가장 많은 지출: 식비</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
               <div className="content-card">
                  <div className="card-header">
                     <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>최근 자산 변동 추이</h2>
                     <MoreVertical size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ padding: '32px' }}>
                    <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '20px' }}>
                       {transactions.slice(0, 10).map((t, idx) => (
                         <div 
                           key={idx} 
                           style={{ 
                             flex: 1, 
                             height: `${Math.max(20, (t.amount / 2500000) * 100)}%`, 
                             background: t.type === 'credit' ? '#4fc3f7' : '#1a237e', 
                             borderRadius: '4px',
                             opacity: 0.85
                           }} 
                         />
                       ))}
                    </div>
                  </div>
               </div>
               <div className="content-card">
                  <div className="card-header">
                     <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>시스템 이벤트 로그</h2>
                  </div>
                  <div style={{ padding: '24px' }}>
                     {logs.map((l, i) => (
                       <div key={i} style={{ padding: '12px 0', borderBottom: i === logs.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l.time}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '4px' }}>{l.msg}</div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {view === 'transactions' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
               <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1a237e' }}>이체 내역 관리</h2>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-ghost" onClick={() => { addLog('다음 페이지 요청됨'); setPage(p => p + 1); fetchTransactions('bug02'); }} data-bug-id="site047-bug02">
                    <ChevronRight size={18} /> 다음 내역 보기
                  </button>
                  <button className="btn btn-ghost" onClick={() => openDetail(transactions[0]?.id, 'bug04')} data-bug-id="site047-bug04">
                    <ShieldCheck size={18} /> 상세 정보 보안 검증
                  </button>
               </div>
            </div>

            <div className="content-card">
              <table className="table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>거래 상세</th>
                    <th>금액</th>
                    <th>거래 후 잔액</th>
                    <th>구분</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} onClick={() => openDetail(t.id)} className="clickable-row">
                      <td style={{ color: 'var(--text-muted)' }}>{t.date}</td>
                      <td style={{ fontWeight: '700' }}>{t.description}</td>
                      <td style={{ fontWeight: '800', color: t.type === 'credit' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{formatCurrency(t.balance)}</td>
                      <td><span className={`badge badge-${t.type}`}>{t.type === 'credit' ? '입금' : '출금'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                 <button className="pg-btn" onClick={() => setPage(p => Math.max(1, p-1))}><ChevronLeft size={18}/></button>
                 {[1,2,3,4,5].map(n => (
                   <button key={n} className={`pg-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                 ))}
                 <button className="pg-btn" onClick={() => setPage(p => p+1)}><ChevronRight size={18}/></button>
              </div>
            </div>
          </div>
        )}

        {view === 'filters' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1a237e', marginBottom: '32px' }}>정밀 내역 필터링</h2>
            <div className="content-card" style={{ padding: '40px', marginBottom: '32px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: '24px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                     <label style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }}>최소 금액 검색</label>
                     <input 
                       type="number" 
                       value={filters.minAmount}
                       onChange={e => setFilters({ ...filters, minAmount: e.target.value })}
                       className="form-input"
                       placeholder="예: 50,000"
                     />
                  </div>
                  <div style={{ flex: 1 }}>
                     <label style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }}>거래 구분</label>
                     <select className="form-input">
                        <option>전체</option>
                        <option>입금 내역</option>
                        <option>출금 내역</option>
                     </select>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '16px' }} onClick={() => { addLog(`금액 필터 적용 (Min: ${filters.minAmount})`); fetchFiltered('bug03'); }} data-bug-id="site047-bug03">
                    검색 결과 반영
                  </button>
               </div>
            </div>

            <div className="content-card">
              <table className="table">
                 <thead>
                    <tr>
                       <th>거래 일시</th>
                       <th>내용</th>
                       <th>금액</th>
                       <th>처리 상태</th>
                    </tr>
                 </thead>
                 <tbody>
                    {transactions.map(t => (
                      <tr key={t.id}>
                         <td>{t.date}</td>
                         <td style={{ fontWeight: '700' }}>{t.description}</td>
                         <td style={{ fontWeight: '900', color: '#1a237e' }}>{formatCurrency(t.amount)}</td>
                         <td><span style={{ color: 'var(--success)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={14}/> 정상 승인</span></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
               <div style={{ fontSize: '1.1rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={20} color="var(--primary-light)"/> 전자 이체 증명서</div>
               <button onClick={() => setSelectedTx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24}/></button>
            </div>
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>이체 금액</div>
               <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a237e' }}>{formatCurrency(selectedTx.amount)}</div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>거래 일시</span>
                <span style={{ fontWeight: '700' }}>{selectedTx.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>거래 구분</span>
                <span style={{ fontWeight: '800', color: selectedTx.type === 'credit' ? 'var(--success)' : 'var(--danger)' }}>
                  {selectedTx.type === 'credit' ? '입금 (Credit)' : '출금 (Debit)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>거래처/항목</span>
                <span style={{ fontWeight: '800' }}>{selectedTx.description}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '2px solid #fff' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>잔액 변동</span>
                <span style={{ fontWeight: '800', color: '#1a237e' }}>{formatCurrency(selectedTx.balance)}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '32px', padding: '18px', borderRadius: '18px', justifyContent: 'center' }} onClick={() => setSelectedTx(null)}>
              증명서 닫기
            </button>
          </div>
        </div>
      )}

      {/* Hidden PPO Monitor Panel */}
      <div className="agent-monitor" style={{ position: 'fixed', bottom: '24px', left: '24px', background: '#0f172a', color: '#38bdf8', padding: '20px', borderRadius: '20px', fontFamily: 'monospace', fontSize: '0.7rem', zIndex: 5000, boxShadow: '0 10px 40px rgba(0,0,0,0.4)', opacity: 0.9 }}>
         <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '10px', fontWeight: '900' }}>PPO-MONITOR_v47</div>
         <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}><span>NODE_ST</span><span style={{ color: bug ? '#fb7185' : '#4ade80' }}>{bug ? 'ERR_DETECT' : 'STABLE'}</span></div>
         <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}><span>ERR_ID</span><span style={{ color: '#fff' }}>{bug ? bug.id : 'N/A'}</span></div>
      </div>
    </div>
  );
};

export default App;
