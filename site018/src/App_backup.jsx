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
  Wallet
} from 'lucide-react';

const API_BASE = ''; 

function App() {
  const [activeTab, setActiveTab] = useState('대시보드');
  const [events, setEvents] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [health, setHealth] = useState({ ok: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError('서버 데이터를 불러오는 데 실패했습니다.');
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
          text: '정렬 로직 오류: 위험도 점수와 실제 목록 순서가 일치하지 않습니다.',
          type: 'opaque-sort-logic'
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
          text: '웹훅 인과관계 역전: 결제 완료 전에 구독이 먼저 활성화되었습니다.',
          type: 'async-webhook-causality-inversion'
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
          text: '타입 식별자 누락: 이벤트 타입을 판별할 수 없어 기본값(카드 결제)으로 처리되었습니다.',
          type: 'missing-polymorphic-json-discriminator'
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
          text: '트랜잭션 복구 실패: 장애 복구 후 결제/청구서/구독 상태가 서로 일치하지 않습니다.',
          type: 'transaction-recovery-failure-after-crash'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label"><span>총 이벤트</span> <Activity size={20} color="var(--accent-indigo)" /></div>
          <div className="stat-value">{events.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><span>실패한 결제</span> <AlertTriangle size={20} color="var(--error)" /></div>
          <div className="stat-value" style={{ color: 'var(--error)' }}>{events.filter(e => e.status === 'failed').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><span>활성 구독자</span> <Users size={20} color="var(--accent-mint)" /></div>
          <div className="stat-value">{subscriptions.filter(s => s.status === 'Active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><span>미결제 청구서</span> <FileText size={20} color="var(--warning)" /></div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{invoices.filter(i => i.status === 'pending').length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>최근 결제 이벤트</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={fetchInitialData}>
              <RefreshCcw size={16} /> 초기화
            </button>
            <button className="btn btn-primary" onClick={handleSortRisk} data-bug-id="site018-bug03">
              <ShieldAlert size={16} /> 위험도 순 정렬
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>이벤트 ID</th>
              <th>이벤트 유형</th>
              <th>고객명</th>
              <th>결제 금액</th>
              <th>위험도 점수</th>
              <th>처리 상태</th>
              <th>발생 시각</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id} onClick={() => setSelectedEvent(event)} style={{ cursor: 'pointer' }}>
                <td><code>{event.id}</code></td>
                <td><span style={{ fontWeight: 600 }}>{event.type}</span></td>
                <td>{event.customer}</td>
                <td style={{ fontWeight: 700 }}>₩{event.amount?.toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '40px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${event.riskScore}%`, height: '100%', background: event.riskScore > 50 ? 'var(--error)' : 'var(--success)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{event.riskScore}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${event.status}`}>
                    {event.status === 'success' ? '성공' : event.status === 'failed' ? '실패' : '대기'}
                  </span>
                </td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}><Clock size={14}/> {new Date(event.timestamp).toLocaleTimeString()}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderWebhookLab = () => (
    <div className="card">
      <div className="card-title">웹훅 시뮬레이션 연구소</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            비동기 웹훅 이벤트의 처리 로직과 데이터 정밀도를 테스트합니다. 
            아래 버튼을 클릭하여 시나리오를 시뮬레이션할 수 있습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={simulateWebhook} data-bug-id="site018-bug01" style={{ justifyContent: 'center', padding: '1.25rem' }}>
              <Zap size={18} /> 인과관계 역전 테스트 실행
            </button>
            <button className="btn btn-outline" onClick={fetchPolymorphicEvent} data-bug-id="site018-bug02" style={{ justifyContent: 'center', padding: '1.25rem' }}>
              <Search size={18} /> 타입 식별자 누락 데이터 조회
            </button>
          </div>
        </div>
        <div className="timeline">
          <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} /> 이벤트 처리 타임라인
          </h4>
          {webhookLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <Clock size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>시뮬레이션 데이터를 대기 중입니다...</p>
            </div>
          ) : (
            webhookLogs.map((log, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-dot" style={{ background: log.type.includes('activated') && i === 0 ? 'var(--error)' : 'var(--accent-mint)' }}></div>
                <div className="timeline-content">
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{log.type}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{log.timestamp}</div>
                  <div style={{ fontSize: '0.875rem', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                    {log.note}
                  </div>
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
      <div className="card-title">트랜잭션 복구 테스트</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            시스템의 예기치 않은 종료 이후, 결제/청구서/구독 리소스 간의 상태가 
            원자적(Atomic)으로 복구되었는지 검증합니다.
          </p>
          <button className="btn btn-primary" style={{ background: 'var(--error)', width: '100%', justifyContent: 'center', padding: '1.5rem' }} onClick={simulateRecovery} data-bug-id="site018-bug04">
            <RefreshCcw size={20} /> 비정상 종료 및 복구 시뮬레이션
          </button>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.5rem' }}>복구 상태 감사 결과</h4>
          {!recoveryResult ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem' }}>
              <ShieldAlert size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>테스트를 실행하여 결과를 확인하세요.</p>
            </div>
          ) : (
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '2px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600 }}>결제 정보 (pay_777)</span>
                <span className="badge badge-success">유료 (PAID)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600 }}>청구서 정보 (inv_777)</span>
                <span className={`badge badge-${recoveryResult.invoice.status === 'paid' ? 'success' : 'failed'}`}>
                  {recoveryResult.invoice.status === 'paid' ? '납부완료' : '미납 (PENDING)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>구독 정보 (sub_777)</span>
                <span className={`badge badge-${recoveryResult.subscription.status === 'Active' ? 'success' : 'failed'}`}>
                  {recoveryResult.subscription.status === 'Active' ? '활성' : '정지 (SUSPENDED)'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1.5rem', background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem' }}>
                <strong>시스템 로그:</strong> {recoveryResult.recoveryLog}
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
          <CreditCard size={32} /> LEDGERFLOW
        </div>
        <div className={`nav-item ${activeTab === '대시보드' ? 'active' : ''}`} onClick={() => setActiveTab('대시보드')}>
          <LayoutDashboard size={20} /> 대시보드
        </div>
        <div className={`nav-item ${activeTab === '이벤트' ? 'active' : ''}`} onClick={() => setActiveTab('이벤트')}>
          <History size={20} /> 이벤트 로그
        </div>
        <div className={`nav-item ${activeTab === '구독관리' ? 'active' : ''}`} onClick={() => setActiveTab('구독관리')}>
          <Users size={20} /> 구독자 관리
        </div>
        <div className={`nav-item ${activeTab === '청구서' ? 'active' : ''}`} onClick={() => setActiveTab('청구서')}>
          <FileText size={20} /> 청구서 목록
        </div>
        <div className={`nav-item ${activeTab === '웹훅실험실' ? 'active' : ''}`} onClick={() => setActiveTab('웹훅실험실')}>
          <Zap size={20} /> 웹훅 실험실
        </div>
        <div className={`nav-item ${activeTab === '복구테스트' ? 'active' : ''}`} onClick={() => setActiveTab('복구테스트')}>
          <RefreshCcw size={20} /> 복구 테스트
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className={`health-status ${health.ok ? 'ok' : 'error'}`} style={{ color: 'white', background: health.ok ? '#059669' : '#dc2626', padding: '0.75rem', borderRadius: '0.75rem', justifyContent: 'center' }}>
            <Activity size={16} /> {health.ok ? '서버 연결 정상' : '서버 연결 끊김'}
          </div>
        </div>
      </div>

      <div className="main-content">
        <header>
          <div className="header-title">
            <h1>{activeTab}</h1>
            <p>LedgerFlow 결제 운영 포털 &gt; {activeTab}</p>
          </div>
          <div className="status-badge-container">
            <div style={{ background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-mint)', boxShadow: '0 0 10px var(--accent-mint)' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>운영 환경 (PRODUCTION)</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10rem 0' }}>
            <div className="loader"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            {bugMessage && (
              <div className="bug-banner">
                <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.75rem' }}>
                  <AlertTriangle size={28} color="#e11d48" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span className="bug-id-tag">{bugMessage.id}</span>
                    <strong style={{ fontSize: '1rem' }}>백엔드 논리 오류 탐지됨</strong>
                  </div>
                  <div style={{ fontSize: '0.9375rem', opacity: 0.9 }}>{bugMessage.text}</div>
                </div>
                <button onClick={() => setBugMessage(null)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>×</button>
              </div>
            )}

            {(activeTab === '대시보드' || activeTab === '이벤트') && renderOverview()}
            {activeTab === '웹훅실험실' && renderWebhookLab()}
            {activeTab === '복구테스트' && renderRecoveryTest()}
            
            {(activeTab === '구독관리' || activeTab === '청구서') && (
              <div className="card">
                <div className="card-title">{activeTab} 상세 리스트</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>해당 데이터는 백엔드와 정상적으로 동기화되어 있으며, 현재 결함이 발견되지 않았습니다.</p>
                <div style={{ marginTop: '1rem' }}>
                  {activeTab === '구독관리' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                      {subscriptions.map(s => (
                        <div key={s.id} className="stat-card" style={{ borderLeft: '4px solid var(--accent-mint)' }}>
                          <div style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{s.customer}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{s.plan}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="badge badge-success">활성됨</span>
                            <span style={{ fontWeight: 800 }}>₩{s.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr><th>청구서 번호</th><th>고객명</th><th>청구 금액</th><th>상태</th><th>만기일</th></tr>
                      </thead>
                      <tbody>
                        {invoices.map(inv => (
                          <tr key={inv.invoiceId}>
                            <td><code>{inv.invoiceId}</code></td>
                            <td>{inv.customerId}</td>
                            <td style={{ fontWeight: 700 }}>₩{inv.amount.toLocaleString()}</td>
                            <td><span className={`badge badge-${inv.status === 'paid' ? 'success' : 'pending'}`}>{inv.status === 'paid' ? '결제완료' : '결제대기'}</span></td>
                            <td>{inv.dueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ borderTop: '8px solid var(--accent-indigo)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>이벤트 상세 정보</h2>
                <p style={{ color: 'var(--text-muted)' }}>식별자: {selectedEvent.id}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} style={{ fontSize: '1.5rem', background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2.5rem' }}>
              <div>
                <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>속성 정보</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>고객</span>
                    <span style={{ fontWeight: 600 }}>{selectedEvent.customer || '알 수 없음'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>금액</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>₩{selectedEvent.amount?.toLocaleString() || selectedEvent.payload?.amount?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>최종 상태</span>
                    <span className="badge badge-success">처리완료</span>
                  </div>
                  {selectedEvent.interpretedType && (
                    <div style={{ marginTop: '1rem', background: '#fff1f2', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #fda4af' }}>
                      <div style={{ fontSize: '0.75rem', color: '#e11d48', fontWeight: 800, marginBottom: '0.25rem' }}>자동 판별 결과</div>
                      <div style={{ fontWeight: 700, color: '#9f1239' }}>{selectedEvent.interpretedType}</div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#be123c' }}>* 페이로드에 타입 식별자가 없어 기본값으로 처리됨</div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>원본 페이로드 (JSON)</h4>
                <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '1.25rem', borderRadius: '0.75rem', fontSize: '0.8rem', overflow: 'auto', maxHeight: '300px' }}>
                  {JSON.stringify(selectedEvent.payload || selectedEvent, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
