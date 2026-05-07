import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  History, 
  LayoutDashboard, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  User, 
  Search,
  Bell,
  Package,
  Plus
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [bugInfo, setBugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [itemsRes, summaryRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/items`),
        fetch(`${API_BASE}/dashboard/summary`),
        fetch(`${API_BASE}/logs`)
      ]);
      const [itemsData, summaryData, logsData] = await Promise.all([
        itemsRes.json(),
        summaryRes.json(),
        logsRes.json()
      ]);
      setItems(itemsData.data);
      setSummary(summaryData);
      setLogs(logsData.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReserve = async (itemId) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, userId: 'user_ppo' })
      });
      fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleConfirmPurchase = async (itemId, trigger = null) => {
    setLoading(true);
    setBugInfo(null);
    try {
      const res = await fetch(`${API_BASE}/purchase/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, userId: 'user_ppo', trigger })
      });
      const data = await res.json();
      const xBugId = res.headers.get('X-Bug-Id');
      
      if (xBugId) {
        setBugInfo({
          id: xBugId,
          num: xBugId.slice(-1),
          message: xBugId === 'site083-bug01' 
            ? "[오류 #1] 중복 구매 허용: 이미 거래가 완료된 상품에 대해 중복 구매 확정이 처리되었습니다."
            : "[오류 #4] 참조 무결성 붕괴: 존재하지 않는 상품 ID(999)에 대한 구매 확정 처리가 성공했습니다."
        });
      }
      fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (itemId, status, trigger = null) => {
    setLoading(true);
    setBugInfo(null);
    try {
      const res = await fetch(`${API_BASE}/item/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status, trigger })
      });
      const data = await res.json();
      const xBugId = res.headers.get('X-Bug-Id');
      
      if (xBugId === 'site083-bug02') {
        setBugInfo({
          id: xBugId,
          num: '2',
          message: "[오류 #2] 상태 전이 오류: '거래완료' 상태의 상품이 비정상적으로 '예약중' 상태로 되돌아갔습니다."
        });
      }
      fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchLogsWithTrigger = async () => {
    setLoading(true);
    setBugInfo(null);
    try {
      const res = await fetch(`${API_BASE}/logs?trigger=bug03`);
      const data = await res.json();
      const xBugId = res.headers.get('X-Bug-Id');
      setLogs(data.data);
      
      if (xBugId === 'site083-bug03') {
        setBugInfo({
          id: xBugId,
          num: '3',
          message: "[오류 #3] 처리 순서 역전: 구매 확정보다 예약 로그가 나중에 발생하는 논리적 순서 역전이 감지되었습니다."
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <ShoppingBag size={28} />
          <span>OrangeMarket</span>
        </div>
        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
            <Package size={20} /> Items
          </div>
          <div className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
            <ArrowRight size={20} /> Transactions
          </div>
          <div className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
            <Clock size={20} /> Timeline
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <History size={20} /> Admin Logs
          </div>
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '10px' }}>SYSTEM MONITOR</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
            <span>Node: site083</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p style={{ color: 'var(--text-muted)' }}>중고거래 상태 및 무결성 관리 시스템</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} size={18} />
              <input type="text" placeholder="검색..." style={{ padding: '10px 10px 10px 40px', borderRadius: '12px', border: '1px solid var(--border)', width: '240px', outline: 'none' }} />
            </div>
            <Bell size={22} style={{ color: '#64748b', cursor: 'pointer' }} />
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>P</div>
          </div>
        </header>

        {/* Dashboard Summary (Always visible or only in items) */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">전체 상품</div>
            <div className="stat-value">{summary?.totalItems || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">거래 완료</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{summary?.completed || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">예약중</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{summary?.reserved || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">판매중</div>
            <div className="stat-value">{summary?.available || 0}</div>
          </div>
        </div>

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="items-grid">
            {items.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-img">{item.img}</div>
                <div className="item-info">
                  <div className={`item-status status-${item.status}`}>{item.status}</div>
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-price">{item.price.toLocaleString()}원</div>
                  <div className="btn-group">
                    {item.status === 'available' && (
                      <button className="btn btn-primary" onClick={() => handleReserve(item.id)}>예약하기</button>
                    )}
                    {item.status === 'reserved' && (
                      <button className="btn btn-success" onClick={() => handleConfirmPurchase(item.id)}>구매 확정</button>
                    )}
                    {item.status === 'completed' && (
                      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                        <button 
                          className="btn btn-outline" 
                          data-bug-id="site083-bug01"
                          onClick={() => handleConfirmPurchase(item.id, 'bug01')}
                        >
                          거래 최종 승인
                        </button>
                        <button 
                          className="btn btn-outline" 
                          data-bug-id="site083-bug02"
                          onClick={() => handleUpdateStatus(item.id, 'reserved', 'bug02')}
                        >
                          예약 정보로 업데이트
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '24px' }}>거래 무결성 및 내역 관리</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>시스템의 참조 무결성과 기록 동기화 상태를 정기적으로 관리합니다.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '12px' }}>데이터 정합성 관리</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>임시 또는 미등록 상품에 대한 수동 결제 승인 프로세스를 진행합니다.</p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  data-bug-id="site083-bug04"
                  onClick={() => handleConfirmPurchase(999, 'bug04')}
                >
                  임시 상품 결제 승인
                </button>
              </div>
              
              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '12px' }}>거래 내역 정기 동기화</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>분산된 노드의 거래 로그를 현재 시점의 타임라인으로 동기화합니다.</p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  data-bug-id="site083-bug03"
                  onClick={() => fetchLogsWithTrigger()}
                >
                  거래 내역 실시간 동기화
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline / Logs Tab */}
        {(activeTab === 'timeline' || activeTab === 'logs') && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>{activeTab === 'timeline' ? '거래 타임라인' : '시스템 관리자 로그'}</h2>
              <button className="btn btn-outline" style={{ flex: 'none', width: 'auto', padding: '10px 20px' }} onClick={fetchData}>
                <RefreshCw size={16} style={{ marginRight: '8px' }} /> 새로고침
              </button>
            </div>
            <div className="log-panel">
              {logs.map(log => (
                <div key={log.id} className="log-entry">
                  <div className="log-meta">
                    <span className="log-time">{new Date(log.time).toLocaleString()}</span>
                    <span className="log-tag">{log.type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{log.msg} (Item ID: {log.itemId})</span>
                    <span style={{ color: '#94a3b8' }}>User: {log.userId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bug Notification Popup */}
        {bugInfo && (
          <div className="bug-popup">
            <div className="bug-header">
              <AlertTriangle size={24} />
              <span>VULNERABILITY DETECTED</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#334155' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontWeight: 700 }}>ID:</span>
                <span className="badge badge-bug" style={{ marginLeft: '8px' }}>{bugInfo.id}</span>
              </div>
              <p style={{ lineHeight: '1.6', fontWeight: 500 }}>{bugInfo.message}</p>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }} onClick={() => setBugInfo(null)}>확인</button>
          </div>
        )}

        {loading && (
          <div style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RefreshCw className="spin" size={18} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>처리 중...</span>
          </div>
        )}
      </main>

      <style>{`
        /* Dynamic Styles for colors in JS */
        :root {
          --primary: #ff8a3d;
          --success: #22c55e;
          --warning: #f59e0b;
        }
      `}</style>
    </div>
  );
};

export default App;
