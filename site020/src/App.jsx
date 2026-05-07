import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Package, 
  MapPin, 
  Navigation, 
  RefreshCw, 
  Activity, 
  ShieldAlert, 
  ClipboardList, 
  Search, 
  Filter, 
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  X,
  Settings
} from 'lucide-react';

const API_BASE = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('shipments');
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, error: 0 });
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastBugId, setLastBugId] = useState(null);

  useEffect(() => {
    fetchHealth();
    fetchShipments();
    fetchVehicles();
    fetchLogs();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/shipments`);
      const data = await res.json();
      setShipments(data);
      setStats({
        total: data.length,
        active: data.filter(s => s.status === 'active').length,
        error: data.filter(s => s.status === 'error').length
      });
    } catch (e) {
      setError('화물 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE}/vehicles`);
      const data = await res.json();
      setVehicles(data);
      if (data.some(l => l.bugId)) {
        const bug = data.find(l => l.bugId);
        setLastBugId(bug.bugId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`);
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatchRecovery = async (mode = 'normal') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recovery/dispatch?mode=${mode}`, { method: 'POST' });
      const data = await res.json();
      if (data.bugId) setLastBugId(data.bugId);
      
      fetchLogs();
      fetchShipments();
      
      if (mode === 'async-loss') {
        alert('배차 복구 완료. (경고: 일부 화물 배차 데이터 유실 감지됨 - site020-bug01)');
      } else {
        alert('정상 배차 복구가 완료되었습니다.');
      }
    } catch (e) {
      setError('배차 복구 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreState = async (id = 'SH-001') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/shipments/restore?id=${id}`);
      const data = await res.json();
      if (data.bugId) setLastBugId(data.bugId);
      
      if (Array.isArray(data.logs)) {
        setLogs(prev => [...data.logs, ...prev]);
        alert('시스템 경고: 화물 상태 복원 중 무한 루프 감지 (site020-bug02)');
      } else {
        alert(`화물 ${id} 상태가 정상 복원되었습니다.`);
      }
      fetchLogs();
    } catch (e) {
      setError('상태 복원 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryDispatch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/shipments/retry`, { method: 'POST' });
      const data = await res.json();
      if (data.bugId) setLastBugId(data.bugId);
      
      alert(`배송 재시도 프로세스 실행 (시스템 자원 사용량: ${data.usageCount} - site020-bug03)`);
      fetchShipments();
    } catch (e) {
      setError('재시도 프로세스 실패');
    } finally {
      setLoading(false);
    }
  };

  const simulateOrphanVehicle = async () => {
    try {
      const res = await fetch(`${API_BASE}/vehicles/simulate-orphan`, { method: 'POST' });
      const data = await res.json();
      if (data.bugId) setLastBugId(data.bugId);
      fetchVehicles();
      alert('고아 차량 락(Orphan Lock) 현상이 감지되었습니다. (site020-bug04)');
    } catch (e) {
      console.error(e);
    }
  };

  const renderShipments = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>실시간 화물 배송 현황</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={fetchShipments}>
            <RefreshCw size={16} /> 새로고침
          </button>
          <button className="btn btn-primary" onClick={() => handleDispatchRecovery('normal')}>
            <Play size={16} /> 정상 배차 복구
          </button>
          <button 
            className="btn btn-error" 
            onClick={() => handleDispatchRecovery('async-loss')}
            data-bug-id="site020-bug01"
          >
            <AlertCircle size={16} /> 비동기 배차 복구
          </button>
        </div>
      </div>
      <table className="task-table">
        <thead>
          <tr>
            <th>운송번호</th>
            <th>품목</th>
            <th>출발지</th>
            <th>목적지</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.item}</td>
              <td>{s.origin}</td>
              <td>{s.destination}</td>
              <td>
                <span className={`status-badge status-${s.status}`}>
                  {s.status === 'delivered' ? '배송완료' : s.status === 'pending' ? '대기중' : s.status === 'error' ? '상태이상' : '운송중'}
                </span>
              </td>
              <td>
                <button 
                  className="btn btn-outline" 
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  onClick={() => handleRestoreState(s.id === 'SH-CHAOS' ? 'SH-CHAOS' : s.id)}
                  data-bug-id={s.id === 'SH-CHAOS' ? "site020-bug02" : ""}
                >
                  <RotateCcw size={12} /> {s.id === 'SH-CHAOS' ? "부패 복원" : "상태 복원"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderVehicles = () => (
    <div className="content-section" style={{ marginTop: '2rem' }}>
      <div className="section-header">
        <h2>차량 배차 락(Lock) 관리</h2>
        <button className="btn btn-error" onClick={simulateOrphanVehicle} data-bug-id="site020-bug04">
          <Truck size={16} /> 고아 차량 생성
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {vehicles.map(v => (
          <div key={v.id} className="stat-card" style={{ borderLeft: `4px solid ${v.owner ? 'var(--primary)' : 'var(--danger)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>{v.id}</span>
              {v.owner ? <CheckCircle2 size={16} color="var(--success)" /> : <X size={16} color="var(--danger)" />}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Driver: {v.owner || <span style={{ color: 'var(--danger)', fontWeight: 700 }}>운전자 없음 (고아)</span>}
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              <MapPin size={12} style={{ marginRight: 4 }} /> {v.location}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="content-section" style={{ marginTop: '2rem' }}>
      <div className="section-header">
        <h2>물류 관제 로그</h2>
        <button className="btn btn-primary" onClick={handleRetryDispatch} data-bug-id="site020-bug03">
          <RefreshCw size={16} /> 배송 재시도 실행
        </button>
      </div>
      <div className="log-panel">
        {logs.map((log, i) => (
          <div key={i} className="log-entry">
            <span className="log-time">[{log.time}]</span>
            <span style={{ color: log.level === 'error' ? 'var(--danger)' : log.level === 'warn' ? 'var(--warning)' : '#10b981' }}>
              [{log.level.toUpperCase()}]
            </span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="content-section">
      <h2>실시간 관제 통계</h2>
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="stat-card">
          <h3>배송 효율성</h3>
          <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginTop: '1rem' }}>
            <div style={{ width: '85%', height: '100%', background: 'var(--primary)', borderRadius: '5px' }}></div>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>현재 목표 대비 85% 달성 중</p>
        </div>
        <div className="stat-card">
          <h3>차량 가동률</h3>
          <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginTop: '1rem' }}>
            <div style={{ width: '62%', height: '100%', background: 'var(--secondary)', borderRadius: '5px' }}></div>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>전체 차량 중 62% 운행 중</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="content-section">
      <h2>시스템 설정</h2>
      <div style={{ marginTop: '2rem' }}>
        <div className="status-item" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
          <span>자동 배차 최적화</span>
          <button className="btn btn-primary" style={{ padding: '4px 12px' }}>활성화됨</button>
        </div>
        <div className="status-item" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
          <span>알림 로그 수준</span>
          <select style={{ background: 'var(--bg-sidebar)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '4px' }}>
            <option>INFO</option>
            <option>WARN</option>
            <option>DEBUG</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {loading && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="stat-card" style={{ textAlign: 'center', width: '200px' }}>
            <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <p>데이터 처리 중...</p>
          </div>
        </div>
      )}

      <div className="sidebar">
        <div className="sidebar-header">
          <Truck size={24} />
          <span>SMART LOGIS</span>
        </div>
        <ul className="nav-links">
          <li className={`nav-item ${activeTab === 'shipments' ? 'active' : ''}`} onClick={() => setActiveTab('shipments')}>
            <Package size={20} /> 배송 현황
          </li>
          <li className={`nav-item ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => setActiveTab('vehicles')}>
            <Navigation size={20} /> 차량 관리
          </li>
          <li className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <ClipboardList size={20} /> 관제 로그
          </li>
          <li className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            <Activity size={20} /> 실시간 통계
          </li>
          <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> 시스템 설정
          </li>
        </ul>

        <div style={{ marginTop: 'auto', padding: '1.5rem' }}>
          <div className="stat-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <div className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: health?.ok ? 'var(--success)' : 'var(--danger)' }}></div>
              <span style={{ fontSize: '0.8rem' }}>Server: {health?.status || 'Offline'}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Node: Asia-East-01</div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>
            {activeTab === 'shipments' ? '배송 매니저' : 
             activeTab === 'vehicles' ? '차량 매니저' : 
             activeTab === 'logs' ? '관제 센터' : 
             activeTab === 'stats' ? '통계 대시보드' : '설정'}
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-dim)' }} size={16} />
              <input 
                type="text" 
                placeholder="화물/차량 검색..." 
                style={{ background: 'var(--bg-sidebar)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px 8px 32px', color: 'white' }}
              />
            </div>
            <button className="btn btn-outline" onClick={() => alert('필터 기능이 활성화되었습니다.')}>
              <Filter size={16} /> 필터
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Shipments</h3>
            <div className="value" style={{ color: 'var(--primary)' }}>{stats.total}</div>
          </div>
          <div className="stat-card">
            <h3>Active Routes</h3>
            <div className="value" style={{ color: 'var(--success)' }}>{stats.active}</div>
          </div>
          <div className="stat-card">
            <h3>Critical Alerts</h3>
            <div className="value" style={{ color: 'var(--danger)' }}>{stats.error}</div>
          </div>
          <div className="stat-card">
            <h3>Connected Drivers</h3>
            <div className="value" style={{ color: 'var(--secondary)' }}>{vehicles.filter(v => v.owner).length}</div>
          </div>
        </div>

        {activeTab === 'shipments' && renderShipments()}
        {activeTab === 'vehicles' && renderVehicles()}
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'settings' && renderSettings()}

        {lastBugId && (
          <div className="bug-indicator">
            <ShieldAlert size={14} />
            Bug Detected: {lastBugId}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
