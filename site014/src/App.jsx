import React, { useState, useEffect } from 'react';
import { 
  Home, Search, Bell, Settings, User, TrendingUp, 
  MapPin, Shield, Calendar, BarChart3, ChevronRight,
  Info, Lock, Mail, Phone, ArrowRightLeft, Database
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [view, setView] = useState('listings');
  const [listings, setListings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [bugInfo, setBugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async (bugId = null) => {
    try {
      const endpoints = [
        fetch(`${API_BASE}/recommendations${bugId === 'bug03' ? '?triggerBug=true' : ''}`),
        fetch(`${API_BASE}/logs`)
      ];
      if (bugId === 'bug04') endpoints.push(fetch(`${API_BASE}/listings/analytics?triggerBug=true`));
      else endpoints.push(fetch(`${API_BASE}/listings/analytics`));

      const [rRes, lRes, aRes] = await Promise.all(endpoints);
      const rData = await rRes.json();
      const lData = await lRes.json();
      const aData = await aRes.json();

      setListings(aData.data || []);
      setLogs(lData.data || []);

      const b3 = rRes.headers.get('X-Bug-Id') || rData.bugId;
      if (b3 === 'site014-bug03') {
        setBugInfo({
          id: b3,
          title: "버그 3: 매물 추천 로직 결함",
          message: "사용자 선호도 필터링 시스템이 작동하지 않고, 광고성 고정 매물만 추천 목록에 노출되었습니다. (개인화 미적용)"
        });
      }

      const b4 = aRes.headers.get('X-Bug-Id') || aData.bugId;
      if (b4 === 'site014-bug04') {
        setBugInfo({
          id: b4,
          title: "버그 4: 허위 소셜 프루프 (Fake Social Proof)",
          message: "매물의 실제 인기와 무관하게 조회수가 인위적으로 부풀려져 표시되었습니다. (조회수 조작 결함)"
        });
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacyLevel: "High", triggerBug: true })
      });
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      
      if (bugId === 'site014-bug01') {
        setBugInfo({
          id: bugId,
          title: "버그 1: 보안 설정 무단 변경 (Silent Change)",
          message: "사용자 보안 수준을 상향했음에도 불구하고, 마케팅 정보 수신 동의가 사용자 몰래 '동의'로 변경되었습니다. (다크 패턴 감지)"
        });
      }
      fetchData();
    } catch (e) { }
    finally { setLoading(false); }
  };

  const loadForm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/form/metadata?triggerBug=true`);
      const data = await res.json();
      setFormFields(data.fields || []);
      setShowForm(true);
      
      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      if (bugId === 'site014-bug02') {
        setBugInfo({
          id: bugId,
          title: "버그 2: 민감 정보 맥락 누락 (Context Loss)",
          message: "상담 신청 시 연관성이 없는 '주민등록번호' 입력을 요구하면서도, 수집 목적이나 맥락을 제공하지 않았습니다. (데이터 수집 남용)"
        });
      }
    } catch (e) { }
    finally { setLoading(false); }
  };

  const showSummaryReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/report/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) { }
    finally { setLoading(false); }
  };

  return (
    <div className="app-container animate-fade">
      <aside className="sidebar">
        <div className="logo">LUMINA REALTY</div>
        <nav>
          <div className={`nav-item ${view === 'listings' ? 'active' : ''}`} onClick={() => setView('listings')}><Home size={20} /> 매물 대시보드</div>
          <div className={`nav-item ${view === 'analytics' ? 'active' : ''}`} onClick={() => setView('analytics')}><TrendingUp size={20} /> 시장 트렌드</div>
          <div className="nav-item" onClick={loadForm}><Calendar size={20} /> 상담 예약 신청</div>
          <div className="nav-item" onClick={handlePrivacyUpdate} data-bug-id="site014-bug01"><Shield size={20} /> 보안 정책 관리</div>
        </nav>
        <div className="log-panel" style={{ marginTop: 'auto' }}>
          <div style={{ color: '#00ffaa', marginBottom: '10px', fontSize: '10px' }}>SYSTEM_AUDIT_LOG</div>
          {logs.map(log => (
            <div key={log.id} style={{ marginBottom: '5px', opacity: 0.8 }}>
              <span style={{ color: '#555' }}>[{new Date(log.time).toLocaleTimeString()}]</span> {log.msg}
            </div>
          ))}
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>프리미엄 매물 큐레이션</h1>
            <p style={{ color: 'var(--text-muted)' }}>최고의 전문가가 엄선한 럭셔리 주거 공간</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" onClick={showSummaryReport}><BarChart3 size={16} /> 시장 요약 리포트</button>
            <button className="btn btn-primary" onClick={() => fetchData('bug03')} data-bug-id="site014-bug03">AI 맞춤 추천 매물</button>
          </div>
        </header>

        <section className="listing-grid">
          {listings.map(item => (
            <div key={item.id} className="listing-card animate-fade">
              <div className="listing-thumb"><Home size={40} strokeWidth={1} /></div>
              <div className="listing-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="listing-price">{item.price}</span>
                  <span style={{ fontSize: '12px', color: '#ff4d4d', fontWeight: 800 }} onClick={() => fetchData('bug04')} data-bug-id="site014-bug04">
                    🔥 실시간 조회: {item.views}
                  </span>
                </div>
                <h3 className="listing-name">{item.name}</h3>
                <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <MapPin size={14} /> 서울특별시 강남구 | {item.area}
                </div>
                <div style={{ marginTop: '15px', display: 'flex', gap: '5px' }}>
                  {item.tags.map(t => <span key={t} style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Modals */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal animate-fade" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '20px' }}>VIP 상담 신청</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {formFields.map(f => (
                <div key={f.id}>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>{f.label}</label>
                  <input type="text" placeholder={`${f.label}을 입력하세요`} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  {f.id === 'ssn' && <div style={{ fontSize: '11px', color: '#ff4d4d', marginTop: '5px' }}>(필수 입력 항목입니다)</div>}
                </div>
              ))}
              <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowForm(false)} data-bug-id="site014-bug02">상담 예약 완료</button>
            </div>
          </div>
        </div>
      )}

      {summary && (
        <div className="modal-overlay" onClick={() => setSummary(null)}>
          <div className="modal animate-fade" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '20px' }}>부동산 시장 분석 요약</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>전체 매물</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{summary.totalListings}개</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>평균가</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{summary.averagePrice}</div>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '30px' }} onClick={() => setSummary(null)}>리포트 닫기</button>
          </div>
        </div>
      )}

      {bugInfo && (
        <div className="modal-overlay" onClick={() => setBugInfo(null)}>
          <div className="modal animate-fade" style={{ border: '1px solid #ff4d4d' }} onClick={e => e.stopPropagation()}>
            <div className="bug-badge">{bugInfo.id}</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>{bugInfo.title}</h2>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: '15px' }}>{bugInfo.message}</p>
            <button className="btn btn-primary" style={{ width: '100%', background: '#ff4d4d' }} onClick={() => setBugInfo(null)}>결함 리포트 확인</button>
          </div>
        </div>
      )}

      {loading && <div className="modal-overlay">데이터 동기화 중...</div>}
    </div>
  );
};

export default App;
