import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Settings, Moon, Sun, Bell, Shield, RotateCcw, Activity, 
  LayoutDashboard, LogOut, ChevronRight, Save, AlertTriangle, RefreshCw,
  Search, Download, Share2, HelpCircle
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    username: "Standard_User",
    fontSize: "medium"
  });
  const [summary, setSummary] = useState({ users: 0, uptime: "0%", activeConfig: "" });
  const [logs, setLogs] = useState([]);
  const [bugInfo, setBugInfo] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSettings = useCallback(async (source = 'user') => {
    try {
      const res = await fetch(`${API_BASE}/settings?source=${source}`);
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id');

      if (source === 'system' && bugId === 'site090-bug02') {
        setBugInfo({
          id: bugId,
          title: "데이터 동기화 무결성 오류",
          message: "시스템 설정 소스와 사용자 로컬 설정 간의 동기화 과정에서 데이터 불일치가 감지되었습니다."
        });
      }

      setSettings(data.data || {});
    } catch (e) { console.error(e); }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`);
      const data = await res.json();
      setLogs(data.data || []);
    } catch (e) { console.error(e); }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchSummary();
    fetchLogs();
  }, [fetchSettings, fetchSummary, fetchLogs]);

  const updateSettings = async (newSettings) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const bugId = res.headers.get('X-Bug-Id');

      if (bugId === 'site090-bug03') {
        setBugInfo({
          id: bugId,
          title: "환경 설정 전파 실패",
          message: "테마 변경 설정이 데이터베이스에는 저장되었으나, 실시간 UI 렌더링 엔진에 해당 플래그가 전파되지 않았습니다."
        });
      } else if (bugId === 'site090-bug01') {
        setBugInfo({
          id: bugId,
          title: "기본값 오버라이드 거부",
          message: "시스템 보안 정책으로 인해 사용자가 정의한 설정값이 기본값으로 자동 복원되었습니다."
        });
      } else {
        showToast("설정 변경 사항이 적용되었습니다.");
      }
      
      await fetchSettings();
      await fetchLogs();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/settings/reset`, { method: 'POST' });
      const bugId = res.headers.get('X-Bug-Id');

      if (bugId === 'site090-bug04') {
        setBugInfo({
          id: bugId,
          title: "전역 초기화 잔존 오류",
          message: "시스템 초기화 프로세스가 완료되었으나, 일부 캐시된 사용자 메타데이터가 완전히 소거되지 않았습니다."
        });
      }
      
      showToast("공장 초기화가 완료되었습니다.");
      await fetchSettings();
      await fetchLogs();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // UI Theme Logic
  useEffect(() => {
    const isDark = settings.darkMode && bugInfo?.id !== 'site090-bug03';
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [settings.darkMode, bugInfo]);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo" onClick={() => setActiveTab('settings')} style={{ cursor: 'pointer' }}>
          <Shield color="var(--primary)" size={28} strokeWidth={3} />
          <span>ConfigMaster</span>
        </div>
        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={20} /> 개인 프로필
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> 환경 설정
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <Activity size={20} /> 트랜잭션 로그
          </div>
          <div className="nav-item" onClick={() => showToast("도움말 센터로 이동합니다.")}>
            <HelpCircle size={20} /> 고객 지원
          </div>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" style={{ color: '#ef4444' }} onClick={() => showToast("로그아웃 되었습니다.")}>
            <LogOut size={20} /> 로그아웃
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <header className="header">
          <div className="header-left">
            <h1>{activeTab === 'settings' ? '시스템 환경 설정' : activeTab === 'profile' ? '사용자 프로필' : '시스템 통합 로그'}</h1>
            <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '4px' }}>최근 동기화: {summary.lastSync || '연결 중...'}</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
             <button className="btn-outline" onClick={() => fetchSettings('system')} data-bug-id="site090-bug02">
               <RefreshCw size={18} /> 데이터 동기화 검사
             </button>
             <button className="btn-outline" onClick={handleReset} data-bug-id="site090-bug04">
               <RotateCcw size={18} /> 시스템 초기화
             </button>
          </div>
        </header>

        {activeTab === 'settings' && (
          <div className="animate-fade">
            <div className="stats-grid">
               <div className="stat-card">
                 <span className="stat-label">활성 라이선스</span>
                 <div className="stat-value">{summary.users} Units</div>
               </div>
               <div className="stat-card">
                 <span className="stat-label">연결 안정성</span>
                 <div className="stat-value" style={{ color: 'var(--success)' }}>{summary.uptime}</div>
               </div>
               <div className="stat-card">
                 <span className="stat-label">시스템 버전</span>
                 <div className="stat-value">{summary.activeConfig}</div>
               </div>
            </div>

            <div className="settings-grid">
              <div className="card">
                <div className="card-title"><Sun size={20} /> 디스플레이 및 인터페이스</div>
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>다크 테마 활성화</h4>
                    <p>눈의 피로도를 낮추는 어두운 인터페이스를 사용합니다.</p>
                  </div>
                  <label className="switch" data-bug-id="site090-bug03">
                    <input 
                      type="checkbox" 
                      checked={settings.darkMode} 
                      onChange={(e) => updateSettings({ darkMode: e.target.checked })} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>인터페이스 폰트 크기</h4>
                    <p>시스템 전반에 걸친 텍스트 크기를 설정합니다.</p>
                  </div>
                  <select className="btn-outline" value={settings.fontSize} onChange={(e) => updateSettings({ fontSize: e.target.value })}>
                    <option value="small">컴팩트</option>
                    <option value="medium">기본값</option>
                    <option value="large">확대</option>
                  </select>
                </div>
              </div>

              <div className="card">
                <div className="card-title"><Bell size={20} /> 푸시 및 보안 알림</div>
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>실시간 상태 알림</h4>
                    <p>시스템 변경 발생 시 즉시 알림을 수신합니다.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications} 
                      onChange={(e) => updateSettings({ notifications: e.target.checked })} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>리포트 자동 내보내기</h4>
                    <p>주간 통계 리포트를 생성하여 공유합니다.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="icon-btn" onClick={() => showToast("보고서가 다운로드되었습니다.")}><Download size={18} /></button>
                    <button className="icon-btn" onClick={() => showToast("공유 링크가 생성되었습니다.")}><Share2 size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fade">
             <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div className="card-title"><User size={20} /> 개인 프로필 보안 설정</div>
                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '15px' }}>계정 표시 성함</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={settings.username} 
                    onChange={(e) => setSettings({...settings, username: e.target.value})}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '15px' }}>비밀번호 초기화 이메일</label>
                  <input type="email" className="input-field" value="admin@site090.io" disabled />
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => updateSettings({ username: settings.username })}
                  data-bug-id="site090-bug01"
                >
                  <Save size={18} style={{ marginRight: '8px' }} /> 프로필 변경사항 저장
                </button>
             </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="animate-fade">
            <div className="card">
              <div className="card-title"><Activity size={20} /> 실시간 시스템 추적 로그</div>
              <div className="log-panel">
                {logs.length === 0 ? <p className="log-line">로그가 비어 있습니다.</p> : logs.map(log => (
                  <div key={log.id} className="log-line">
                    <span className="log-time">[{new Date(log.time).toLocaleTimeString()}]</span>
                    <span className={`log-type ${log.type}`}>{log.type}</span>
                    <span className="log-msg">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bug Modal */}
      {bugInfo && (
        <div className="modal-overlay" onClick={() => setBugInfo(null)}>
          <div className="modal animate-fade" onClick={e => e.stopPropagation()}>
            <div className="bug-icon"><AlertTriangle size={32} /></div>
            <div className="bug-badge">{bugInfo.id}</div>
            <h3 className="modal-title">{bugInfo.title}</h3>
            <p className="modal-desc">{bugInfo.message}</p>
            <button className="btn-primary" onClick={() => setBugInfo(null)}>보고서 승인 및 닫기</button>
          </div>
        </div>
      )}

      {toast && <div className="toast animate-fade">{toast}</div>}
      {loading && <div className="modal-overlay"><div className="loader"></div></div>}
    </div>
  );
};

export default App;
