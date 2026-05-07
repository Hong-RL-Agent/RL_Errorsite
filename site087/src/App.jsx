import React, { useState, useEffect, useMemo } from 'react';
import { 
  Ticket, 
  Clock, 
  Calendar, 
  Activity, 
  History, 
  PlusCircle, 
  CheckCircle, 
  AlertTriangle,
  RefreshCcw,
  Timer,
  Search,
  Filter,
  BarChart3,
  User,
  Settings,
  Bell,
  X,
  MoreVertical,
  Zap,
  ArrowRight,
  Database,
  ShieldCheck,
  Globe,
  Monitor
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('coupons');
  const [coupons, setCoupons] = useState([]);
  const [summary, setSummary] = useState({});
  const [logs, setLogs] = useState([]);
  const [bugAlert, setBugAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', validHours: 24, type: 'FIXED', value: 5000 });
  const [schedData, setSchedData] = useState({ name: '', activateAt: '', validHours: 24 });

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [cRes, sRes, lRes] = await Promise.all([
        fetch(`${API_BASE}/coupons`),
        fetch(`${API_BASE}/dashboard/summary`),
        fetch(`${API_BASE}/logs`)
      ]);
      const [cData, sData, lData] = await Promise.all([
        cRes.json(),
        sRes.json(),
        lRes.json()
      ]);
      setCoupons(cData.data);
      setSummary(sData);
      setLogs(lData.data);
      
      const bugId = cRes.headers.get('X-Bug-Id');
      if (bugId === 'site087-bug02') {
        // Bug 2 is a background data logic bug, we can flag it here if needed
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/coupons/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id');
      
      setShowCreateModal(false);
      setFormData({ name: '', validHours: 24, type: 'FIXED', value: 5000 });
      fetchData();

      if (bugId === 'site087-bug01') {
        setBugAlert({
          id: bugId,
          title: "만료 시간 확인 결함",
          message: `요청된 ${formData.validHours}시간 대비 실제 설정된 만료 시간이 절반으로 계산되었습니다.`,
          detail: `Requested: ${formData.validHours}h | Calculated: ${formData.validHours/2}h`
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/coupons/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedData)
      });
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id');
      
      setSchedData({ name: '', activateAt: '', validHours: 24 });
      fetchData();

      if (bugId === 'site087-bug04') {
        setBugAlert({
          id: bugId,
          title: "예약 실행 시간 오차",
          message: "지정된 예약 시간보다 1시간 지연된 시점에 활성화되도록 데이터가 생성되었습니다.",
          detail: `Target: ${schedData.activateAt} | Drift: +1h`
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleExtend = async (couponId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/coupons/extend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId, extendHours: 12 })
      });
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id');
      
      fetchData();

      if (bugId === 'site087-bug03') {
        setBugAlert({
          id: bugId,
          title: "TTL 갱신 누락",
          message: "서버로부터 성공 응답을 받았으나, 실제 만료 시간이 변경되지 않은 상태입니다.",
          detail: `Response: SUCCESS | Data: UNCHANGED`
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleUse = async (couponId) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/coupons/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId })
      });
      fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchTerm, statusFilter]);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo" onClick={() => setActiveTab('coupons')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon"><Monitor size={24} /></div>
          <span>VoucherFlow</span>
        </div>
        <ul className="nav-menu">
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={20} /> 실시간 통계
          </li>
          <li className={`nav-item ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>
            <Ticket size={20} /> 쿠폰 관리
          </li>
          <li className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
            <Calendar size={20} /> 스케줄러
          </li>
          <li className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <History size={20} /> 감사 로그
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="server-status">
            <div className="pulse-dot"></div>
            <span>NODE_01 ACTIVE</span>
          </div>
          <div className="version-tag">Production v0.87.7</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header-row">
          <div className="title-group">
            <h1>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'coupons' ? 'Inventory' : activeTab === 'schedule' ? 'Scheduler' : 'Audit Logs'}</h1>
            <p>쿠폰 유효 기간 정합성 및 생애주기 통합 관제 시스템</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="쿠폰 명칭 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><PlusCircle size={18} /> 쿠폰 신규 발급</button>
            <button className="icon-btn" onClick={() => fetchData()}><RefreshCcw size={20} /></button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="animate-in">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-icon icon-blue"><Database size={24} /></div>
                <div><h3>총 관리 수량</h3><div className="value">{summary.total || 0}</div></div>
              </div>
              <div className="summary-card">
                <div className="summary-icon icon-green"><CheckCircle size={24} /></div>
                <div><h3>정상 활성</h3><div className="value">{summary.active || 0}</div></div>
              </div>
              <div className="summary-card">
                <div className="summary-icon icon-red"><AlertTriangle size={24} /></div>
                <div><h3>만료 완료</h3><div className="value">{summary.expired || 0}</div></div>
              </div>
              <div className="summary-card">
                <div className="summary-icon icon-amber"><Zap size={24} /></div>
                <div><h3>사용됨</h3><div className="value">{summary.used || 0}</div></div>
              </div>
            </div>

            <div className="dashboard-content">
              <div className="main-panel">
                <div className="panel-header-row">
                  <h2 className="panel-title">시스템 상태 분석</h2>
                  <div className="status-indicator">
                    <Globe size={16} /> <span>UTC Synchronization: STABLE</span>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="bar-group">
                    {[65, 45, 80, 55, 90, 70, 85].map((h, i) => <div key={i} className="bar" style={{ height: `${h}%` }}></div>)}
                  </div>
                  <p className="chart-label">쿠폰 발급 및 소진 트렌드 분석</p>
                </div>
              </div>
              <div className="side-panel">
                <h2 className="panel-title">최근 시스템 행위</h2>
                <div className="activity-list">
                  {logs.slice(0, 7).map(log => (
                    <div key={log.id} className="activity-item">
                      <div className="activity-dot"></div>
                      <div className="activity-info">
                        <div className="activity-msg">{log.msg}</div>
                        <div className="activity-time">{new Date(log.time).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="animate-in">
            <div className="filter-row">
              <div className="filter-group">
                {['all', 'active', 'scheduled', 'expired', 'used'].map(f => (
                  <button key={f} className={`filter-btn ${statusFilter === f ? 'active' : ''}`} onClick={() => setStatusFilter(f)}>
                    {f === 'all' ? '전체' : f === 'active' ? '활성' : f === 'scheduled' ? '예약' : f === 'expired' ? '만료' : '사용'}
                  </button>
                ))}
              </div>
              <div className="timezone-hint">
                <Globe size={14} /> Server Time: {new Date().toISOString()}
              </div>
            </div>

            <div className="coupon-grid">
              {filteredCoupons.map(coupon => (
                <div key={coupon.id} className="coupon-card">
                  <div className="coupon-header">
                    <div className={`status-badge status-${coupon.status}`}>{coupon.status.toUpperCase()}</div>
                    <button className="more-btn" onClick={() => fetchData()}><RefreshCcw size={14} /></button>
                  </div>
                  <h3 className="coupon-name">{coupon.name}</h3>
                  <div className="coupon-value">
                    {coupon.type === 'PERCENT' ? `${coupon.value}%` : `${coupon.value.toLocaleString()}원`}
                    <span>할인</span>
                  </div>
                  <div className="coupon-info">
                    <div className="info-row"><span className="info-label">Coupon ID</span><span className="info-value">#{coupon.id}</span></div>
                    <div className="info-row"><span className="info-label">만료 일시</span><span className="info-value">{new Date(coupon.expiresAt).toLocaleString()}</span></div>
                  </div>
                  <div className="coupon-footer">
                    {coupon.status === 'active' && (
                      <>
                        <button className="btn btn-primary" onClick={() => handleUse(coupon.id)} style={{ flex: 1 }}>쿠폰 사용</button>
                        <button className="btn btn-outline" onClick={() => handleExtend(coupon.id)} title="유효기간 연장">
                          <Timer size={18} />
                        </button>
                      </>
                    )}
                    {coupon.status === 'scheduled' && <button className="btn btn-secondary disabled" style={{ flex: 1 }}>활성 대기</button>}
                    {['expired', 'used'].includes(coupon.status) && <button className="btn btn-outline disabled" style={{ flex: 1 }}>{coupon.status === 'expired' ? '만료됨' : '사용 완료'}</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div className="form-card highlight-border">
              <div className="form-header"><Calendar size={24} color="var(--primary)" /><h2>프로모션 예약 실행</h2></div>
              <p className="form-desc">이벤트 시작 일시에 맞춰 쿠폰이 자동으로 발급되도록 예약합니다.</p>
              <form onSubmit={handleSchedule}>
                <div className="input-group">
                  <label>쿠폰 명칭</label>
                  <input type="text" value={schedData.name} onChange={e => setSchedData({...schedData, name: e.target.value})} placeholder="예: 시즌 오프 특가" required />
                </div>
                <div className="input-group">
                  <label>활성화 예정 일시</label>
                  <input type="datetime-local" value={schedData.activateAt} onChange={e => setSchedData({...schedData, activateAt: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>예약 시스템 등록 <ArrowRight size={18} /></button>
              </form>
            </div>
            <div className="form-card">
              <div className="form-header"><ShieldCheck size={24} color="var(--success)" /><h2>시스템 정합성 검사</h2></div>
              <p className="form-desc">현재 활성화된 모든 쿠폰의 유효 기간과 타임존 정합성을 점검합니다.</p>
              <div className="analysis-box">
                <div className="analysis-item"><span>타임존 동기화</span><strong style={{ color: '#ef4444' }}>ERROR (site087-bug02)</strong></div>
                <div className="analysis-item"><span>TTL 갱신 로직</span><strong style={{ color: '#10b981' }}>OPTIMIZED</strong></div>
                <div className="analysis-item"><span>스케줄링 오차</span><strong style={{ color: '#f59e0b' }}>DRIFT_DETECTED</strong></div>
              </div>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => fetchData()}>정밀 진단 다시 실행</button>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="animate-in">
            <div className="panel-header">
              <h2 className="panel-title">Audit Trail & Trace Logs</h2>
              <button className="btn btn-outline btn-sm" onClick={() => fetchData()}><RefreshCcw size={16} /> 새로고침</button>
            </div>
            <div className="log-container">
              {logs.map(log => (
                <div key={log.id} className="log-row">
                  <div className="log-timestamp">{new Date(log.time).toISOString().replace('T', ' ').substring(0, 19)}</div>
                  <div className={`log-tag log-${log.type.toLowerCase()}`}>{log.type}</div>
                  <div className="log-message">{log.msg}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>신규 쿠폰 발행 요청</h3>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="input-group">
                  <label>쿠폰 이름</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="쿠폰 명칭 입력" required />
                </div>
                <div className="input-grid">
                  <div className="input-group">
                    <label>유효 기간 (시간)</label>
                    <input type="number" value={formData.validHours} onChange={e => setFormData({...formData, validHours: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>할인 값</label>
                    <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>취소</button>
                  <button type="submit" className="btn btn-primary">발행 확정</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bug Alert Modal */}
        {bugAlert && (
          <div className="modal-overlay" onClick={() => setBugAlert(null)}>
            <div className="modal-content bug-modal" onClick={e => e.stopPropagation()}>
              <div className="bug-badge">{bugAlert.id}</div>
              <div className="modal-header bug-header">
                <AlertTriangle size={32} />
                <h3>{bugAlert.title}</h3>
              </div>
              <p className="bug-message">{bugAlert.message}</p>
              <div className="bug-detail-box">
                <code>{bugAlert.detail}</code>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', background: '#ef4444' }} onClick={() => setBugAlert(null)}>시스템 결함 보고 접수</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="global-loader">
            <RefreshCcw size={16} className="spin" />
            <span>CONNECTING_DATA_PLANE</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
