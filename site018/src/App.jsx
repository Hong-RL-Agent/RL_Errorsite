import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  FileText, 
  Zap, 
  RefreshCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Filter,
  Search,
  MoreVertical,
  Activity,
  History,
  ShieldAlert,
  Calendar,
  Wallet,
  TrendingUp,
  Box,
  Layers,
  Settings,
  Bell
} from 'lucide-react';

const API_BASE = ''; 

function App() {
  const [activeTab, setActiveTab] = useState('개요');
  const [events, setEvents] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [health, setHealth] = useState({ ok: false });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bugMessage, setBugMessage] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [recoveryResult, setRecoveryResult] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [hRes, eRes, sRes, iRes] = await Promise.all([
        fetch(`${API_BASE}/api/health`),
        fetch(`${API_BASE}/api/events`),
        fetch(`${API_BASE}/api/subscriptions`),
        fetch(`${API_BASE}/api/invoices`)
      ]);
      
      const hData = await hRes.json();
      const eData = await eRes.json();
      const sData = await sRes.json();
      const iData = await iRes.json();

      setHealth(hData);
      setEvents(eData.data || []);
      setSubscriptions(sData.data || []);
      setInvoices(iData.data || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSortRisk = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/events?sort=risk`);
      const data = await res.json();
      setEvents(data.data);
      if (data.bugId) {
        setBugMessage({ 
          id: data.bugId, 
          text: '정렬 엔진 경고: 데이터 가중치 불일치로 인해 정렬 순서가 보장되지 않습니다.',
          type: 'site018-bug03'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const simulateWebhook = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/webhooks/simulate?scenario=causality-inversion`, { method: 'POST' });
      const data = await res.json();
      setWebhookLogs(data.timeline);
      if (data.bugId) {
        setBugMessage({ 
          id: data.bugId, 
          text: '인과관계 역전 감지: 결제 완료 신호 전 구독 활성화가 처리되었습니다.',
          type: 'site018-bug01'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPolymorphicEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/polymorphic/missing-type`);
      const data = await res.json();
      setSelectedEvent(data.data);
      if (data.bugId) {
        setBugMessage({ 
          id: data.bugId, 
          text: '데이터 타입 식별 실패: 페이로드 식별자 누락으로 인해 기본 클래스(CardPayment)가 적용되었습니다.',
          type: 'site018-bug02'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const simulateRecovery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/recovery/simulate-crash`, { method: 'POST' });
      const data = await res.json();
      setRecoveryResult(data.data);
      if (data.bugId) {
        setBugMessage({ 
          id: data.bugId, 
          text: '복구 세션 충돌: 트랜잭션 롤백 과정에서 리소스 상태 불일치가 발견되었습니다.',
          type: 'site018-bug04'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <>
      <div className="hero-section">
        <div className="hero-text">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            환영합니다, 관리자님!
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: '1.6' }}>
            LedgerFlow 결제 엔진은 현재 초당 2,400건의 트랜잭션을 분석하고 있습니다. 
            모든 웹훅 엔드포인트가 활성화되어 있으며, 실시간 이상 징후를 감시 중입니다.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
             <div style={{ background: 'white', padding: '0.8rem 1.2rem', borderRadius: '1rem', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Activity size={18} color="var(--accent-mint)" />
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>시스템 가동율 99.9%</span>
             </div>
             <div style={{ background: 'white', padding: '0.8rem 1.2rem', borderRadius: '1rem', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <ShieldAlert size={18} color="var(--accent-indigo)" />
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>보안 감사 완료</span>
             </div>
          </div>
        </div>
        <img src="/assets/hero.png" alt="SaaS Hero" className="hero-image" />
      </div>

      <div className="stats-grid">
        <div className="stat-card indigo">
          <div className="stat-label"><span>총 처리 이벤트</span> <TrendingUp size={18} /></div>
          <div className="stat-value">{events.length}</div>
          <div className="chart-container">
            {[40, 70, 45, 90, 65, 80, 55, 85].map((h, i) => (
              <div key={i} className={`chart-bar ${i === 3 ? 'active' : ''}`} style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
        <div className="stat-card rose">
          <div className="stat-label"><span>결제 오류 건수</span> <AlertTriangle size={18} /></div>
          <div className="stat-value" style={{ color: 'var(--error)' }}>{events.filter(e => e.status === 'failed').length}</div>
          <div className="chart-container">
            {[20, 30, 15, 40, 25, 35, 10, 30].map((h, i) => (
              <div key={i} className="chart-bar" style={{ height: `${h}%`, background: 'rgba(244, 63, 94, 0.2)' }}></div>
            ))}
          </div>
        </div>
        <div className="stat-card mint">
          <div className="stat-label"><span>활성 구독 상태</span> <Users size={18} /></div>
          <div className="stat-value">{subscriptions.filter(s => s.status === 'Active').length}</div>
          <div className="chart-container">
            {[60, 50, 70, 65, 80, 75, 90, 85].map((h, i) => (
              <div key={i} className="chart-bar" style={{ height: `${h}%`, background: 'rgba(16, 185, 129, 0.2)' }}></div>
            ))}
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label"><span>검토 필요 청구서</span> <FileText size={18} /></div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{invoices.filter(i => i.status === 'pending').length}</div>
          <div className="chart-container">
            {[30, 45, 20, 55, 30, 40, 25, 50].map((h, i) => (
              <div key={i} className="chart-bar" style={{ height: `${h}%`, background: 'rgba(245, 158, 11, 0.2)' }}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>최근 결제 트랜잭션</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="premium-btn btn-outline" onClick={fetchInitialData}>
              <RefreshCcw size={16} /> 새로고침
            </button>
            <button className="premium-btn btn-gradient" onClick={handleSortRisk} data-bug-id="site018-bug03">
              <ShieldAlert size={16} /> 위험도 우선 순위 정렬
            </button>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>이벤트 유형</th>
                <th>고객사</th>
                <th>금액</th>
                <th>위험도</th>
                <th>상태</th>
                <th>타임스탬프</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} onClick={() => setSelectedEvent(event)} style={{ cursor: 'pointer' }}>
                  <td><code style={{ color: 'var(--accent-indigo)', fontWeight: 700 }}>{event.id}</code></td>
                  <td><div style={{ fontWeight: 800 }}>{event.type}</div></td>
                  <td>{event.customer}</td>
                  <td style={{ fontWeight: 900 }}>₩{event.amount?.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '60px', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${event.riskScore}%`, height: '100%', background: event.riskScore > 50 ? 'var(--error)' : 'var(--accent-mint)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>{event.riskScore}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${event.status === 'success' ? 'pill-success' : event.status === 'failed' ? 'pill-error' : 'pill-warning'}`}>
                      {event.status === 'success' ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>}
                      {event.status === 'success' ? '완료' : event.status === 'failed' ? '실패' : '대기'}
                    </span>
                  </td>
                  <td><div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={14}/> {new Date(event.timestamp).toLocaleTimeString()}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderWebhookLab = () => (
    <div className="card">
      <div className="card-title">웹훅 비동기 시뮬레이션</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.8' }}>
            분산 시스템에서의 웹훅 처리 순서 및 데이터 정합성을 검증합니다. 
            아래 시나리오를 실행하여 인과관계 역전 현상 및 타입 식별 오류를 테스트하십시오.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <button className="premium-btn btn-gradient" onClick={simulateWebhook} data-bug-id="site018-bug01" style={{ justifyContent: 'center' }}>
              <Zap size={20} /> 인과관계 역전(Causality Inversion) 시뮬레이션
            </button>
            <button className="premium-btn btn-outline" onClick={fetchPolymorphicEvent} data-bug-id="site018-bug02" style={{ justifyContent: 'center' }}>
              <Layers size={20} /> 타입 식별자 누락 데이터 강제 로드
            </button>
          </div>
        </div>
        <div className="modern-timeline">
          <h4 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 900 }}>
            <History size={20} /> 실시간 처리 타임라인
          </h4>
          {webhookLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', background: 'rgba(0,0,0,0.02)', borderRadius: '1.5rem' }}>
              <Box size={40} style={{ marginBottom: '1.2rem', opacity: 0.1 }} />
              <p style={{ color: '#94a3b8' }}>시뮬레이션 대기 중...</p>
            </div>
          ) : (
            webhookLogs.map((log, i) => (
              <div className="modern-timeline-item" key={i}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{log.type}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', marginBottom: '0.5rem', fontWeight: 700 }}>{log.timestamp}</div>
                <div style={{ fontSize: '0.9rem', background: 'white', padding: '1rem', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  {log.note}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderRecoveryTest = () => (
    <div className="card">
      <div className="card-title">원자적 트랜잭션 복구 검증</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.8' }}>
            치명적 시스템 오류 발생 시, 모든 연관 리소스(결제, 청구서, 구독)의 상태가 
            동일한 시점으로 복구되는지 확인합니다.
          </p>
          <button className="premium-btn" style={{ background: 'var(--error)', color: 'white', width: '100%', justifyContent: 'center' }} onClick={simulateRecovery} data-bug-id="site018-bug04">
            <RefreshCcw size={22} /> 강제 장애 유도 및 복구 실행
          </button>
        </div>
        <div>
          <h4 style={{ marginBottom: '2rem', fontWeight: 900 }}>복구 결과 감사 리포트</h4>
          {!recoveryResult ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', background: 'rgba(0,0,0,0.02)', borderRadius: '1.5rem' }}>
              <ShieldAlert size={40} style={{ marginBottom: '1.2rem', opacity: 0.1 }} />
              <p style={{ color: '#94a3b8' }}>감사 데이터 없음</p>
            </div>
          ) : (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 800 }}>결제 레코드</span>
                <span className="status-pill pill-success">PAID</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 800 }}>청구서 레코드</span>
                <span className={`status-pill ${recoveryResult.invoice.status === 'paid' ? 'pill-success' : 'pill-error'}`}>
                  {recoveryResult.invoice.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
                <span style={{ fontWeight: 800 }}>구독 레코드</span>
                <span className={`status-pill ${recoveryResult.subscription.status === 'Active' ? 'pill-success' : 'pill-error'}`}>
                  {recoveryResult.subscription.status.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2rem', background: '#f8fafc', padding: '1.2rem', borderRadius: '1rem', borderLeft: '4px solid var(--accent-indigo)' }}>
                <strong>시스템 진단:</strong> {recoveryResult.recoveryLog}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <CreditCard size={35} color="var(--accent-mint)" /> LEDGERFLOW
        </div>
        
        <div className="nav-group">
          <div className="nav-label">Main Console</div>
          <div className={`nav-item ${activeTab === '개요' ? 'active' : ''}`} onClick={() => setActiveTab('개요')}>
            <LayoutDashboard size={22} /> 운영 대시보드
          </div>
          <div className={`nav-item ${activeTab === '이벤트' ? 'active' : ''}`} onClick={() => setActiveTab('이벤트')}>
            <History size={22} /> 트랜잭션 로그
          </div>
        </div>

        <div className="nav-group">
          <div className="nav-label">Resource Mgmt</div>
          <div className={`nav-item ${activeTab === '구독자' ? 'active' : ''}`} onClick={() => setActiveTab('구독자')}>
            <Users size={22} /> 구독 관리
          </div>
          <div className={`nav-item ${activeTab === '청구서' ? 'active' : ''}`} onClick={() => setActiveTab('청구서')}>
            <FileText size={22} /> 스마트 인보이스
          </div>
        </div>

        <div className="nav-group">
          <div className="nav-label">PPO Training Lab</div>
          <div className={`nav-item ${activeTab === '웹훅실험실' ? 'active' : ''}`} onClick={() => setActiveTab('웹훅실험실')}>
            <Zap size={22} /> 웹훅 실험실
          </div>
          <div className={`nav-item ${activeTab === '복구테스트' ? 'active' : ''}`} onClick={() => setActiveTab('복구테스트')}>
            <RefreshCcw size={22} /> 복구 안정성 테스트
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: health.ok ? 'var(--accent-mint)' : 'var(--error)' }}></div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{health.ok ? 'NODE ONLINE' : 'NODE OFFLINE'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <header>
          <div className="header-title">
            <h1>{activeTab}</h1>
            <p>SaaS Billing Intelligence System &gt; {activeTab}</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ background: 'white', padding: '0.8rem', borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <Bell size={20} color="#64748b" />
            </div>
            <div style={{ background: 'white', padding: '0.8rem 1.5rem', borderRadius: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}></div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Admin User</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="loader"></div>
            <p style={{ marginTop: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>초고속 데이터 분석 중...</p>
          </div>
        ) : (
          <>
            {bugMessage && (
              <div className="premium-bug-banner">
                <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '1rem', color: 'white' }}>
                  <ShieldAlert size={30} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                    <span style={{ background: '#0f172a', color: 'white', padding: '0.2rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 900 }}>{bugMessage.id}</span>
                    <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>백엔드 시스템 결함 탐지 (Critical)</strong>
                  </div>
                  <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>{bugMessage.text}</div>
                </div>
                <button onClick={() => setBugMessage(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#cbd5e1' }}>×</button>
              </div>
            )}

            {(activeTab === '개요' || activeTab === '이벤트') && renderOverview()}
            {activeTab === '웹훅실험실' && renderWebhookLab()}
            {activeTab === '복구테스트' && renderRecoveryTest()}
            
            {(activeTab === '구독자' || activeTab === '청구서') && (
              <div className="card">
                <div className="card-title">{activeTab} 리포트</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>데이터 무결성이 검증된 실시간 리소스를 관리합니다.</p>
                
                {activeTab === '구독자' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                    {subscriptions.map(s => (
                      <div key={s.id} className="stat-card" style={{ background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                          <div style={{ width: '45px', height: '45px', borderRadius: '1rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={20} color="var(--accent-indigo)" />
                          </div>
                          <span className="status-pill pill-success">Active</span>
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.5rem' }}>{s.customer}</div>
                        <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>{s.plan}</div>
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>월 결제액</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-indigo)' }}>₩{s.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr><th>송장 ID</th><th>고객사</th><th>결제액</th><th>상태</th><th>만기 예정</th></tr>
                      </thead>
                      <tbody>
                        {invoices.map(inv => (
                          <tr key={inv.invoiceId}>
                            <td><code style={{ fontWeight: 800 }}>{inv.invoiceId}</code></td>
                            <td style={{ fontWeight: 700 }}>{inv.customerId}</td>
                            <td style={{ fontWeight: 900 }}>₩{inv.amount.toLocaleString()}</td>
                            <td><span className={`status-pill ${inv.status === 'paid' ? 'pill-success' : 'pill-warning'}`}>{inv.status.toUpperCase()}</span></td>
                            <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14}/> {inv.dueDate}</div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="premium-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>데이터 상세 분석</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>TXID: {selectedEvent.id}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} style={{ background: '#f1f5f9', border: 'none', width: '50px', height: '50px', borderRadius: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--accent-indigo)' }}>Resource Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#94a3b8' }}>고객사</span>
                    <span style={{ fontWeight: 900 }}>{selectedEvent.customer || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#94a3b8' }}>최종 금액</span>
                    <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent-indigo)' }}>₩{selectedEvent.amount?.toLocaleString() || selectedEvent.payload?.amount?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#94a3b8' }}>위험도</span>
                    <span style={{ fontWeight: 900, color: selectedEvent.riskScore > 50 ? 'var(--error)' : 'var(--success)' }}>{selectedEvent.riskScore} pts</span>
                  </div>
                  {selectedEvent.interpretedType && (
                    <div style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #fff1f2, #fff)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #fda4af' }}>
                      <div style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 900, marginBottom: '0.5rem' }}>시스템 분류 로그</div>
                      <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#9f1239' }}>{selectedEvent.interpretedType}</div>
                      <p style={{ fontSize: '0.85rem', color: '#f43f5e', marginTop: '0.5rem' }}>* 타입 식별자 부재로 인한 자동 추론 결과입니다.</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--accent-indigo)' }}>JSON Raw Payload</h3>
                <div className="json-block">
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedEvent.payload || selectedEvent, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
