import React, { useState, useEffect } from 'react';

// Banking Menus (User-friendly Korean terminology matching a real KB/Shinhan Bank style)
const MENU_ITEMS = [
  { id: 'dashboard', label: '종합 대시보드', icon: '📊' },
  { id: 'imports', label: '대량 거래내역 가져오기', icon: '📥', endpoint: '/api/imports', permissionName: 'imports', bugId: 'site009-bug01', title: '거래내역 일괄 등록' },
  { id: 'documents', label: '전자 서명 문서함', icon: '📄', endpoint: '/api/documents', permissionName: 'documents', bugId: 'site009-bug02', title: '금융 증명서 조회' },
  { id: 'teams', label: '공동 가족 계좌 관리', icon: '👥', endpoint: '/api/teams', permissionName: 'teams', bugId: 'site009-bug03', title: '가족 공유 자산 설정' },
  { id: 'roles', label: '보안 등급 및 역할 정보', icon: '🔑', endpoint: '/api/roles', permissionName: 'roles', bugId: 'site009-bug04', title: '인터넷뱅킹 보안 등급 구성' },
  { id: 'auditLogs', label: '계좌 접근 및 감사 로그', icon: '📋', endpoint: '/api/audit-logs', permissionName: 'auditLogs', bugId: 'site009-bug05', title: '접근 이력 검증' },
  { id: 'subscriptions', label: '정기 이체 구독 서비스', icon: '🔄', endpoint: '/api/subscriptions', permissionName: 'subscriptions', bugId: 'site009-bug06', title: '자동 이체 신청 내역' },
  { id: 'devices', label: '지정 보안 기기 관리', icon: '📱', endpoint: '/api/devices', permissionName: 'devices', bugId: 'site009-bug07', title: '인증 스마트폰 및 OTP 등록' },
  { id: 'apiKeys', label: '오픈뱅킹 연동 API 키', icon: '⚙️', endpoint: '/api/api-keys', permissionName: 'apiKeys', bugId: 'site009-bug08', title: '타행 계좌 연동 키 관리' },
  { id: 'webhooks', label: '실시간 금융 알림 설정', icon: '🔔', endpoint: '/api/webhooks', permissionName: 'webhooks', bugId: 'site009-bug09', title: '알림 수신 채널 설정' },
  { id: 'jobs', label: '예약 자동 이체 작업', icon: '⏰', endpoint: '/api/jobs', permissionName: 'jobs', bugId: 'site009-bug10', title: '예약 금융 업무 현황' }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionsState, setPermissionsState] = useState({ userPermissions: {}, sessionStore: {} });
  const [selectedSessionId, setSelectedSessionId] = useState('');
  
  // Real banking toast notification
  const [toastMessage, setToastMessage] = useState(null);

  // Bank Data States
  const [dashboardData, setDashboardData] = useState({
    imports: [],
    documents: [],
    teams: [],
    roles: [],
    auditLogs: [],
    subscriptions: [],
    devices: [],
    apiKeys: [],
    webhooks: [],
    jobs: []
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/session/users');
      const data = await res.json();
      setAvailableUsers(data);
      if (data.length > 0) {
        // Default login as employee
        const empUser = data.find(u => u.userId === 'employee') || data[0];
        handleSwitchUser(empUser.userId);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const fetchPermissionsState = async () => {
    try {
      const res = await fetch('/api/admin/permissions-state');
      const data = await res.json();
      setPermissionsState(data);
    } catch (err) {
      console.error('Failed to load permissions state', err);
    }
  };

  const handleSwitchUser = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch('/api/session/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const session = await res.json();
      setCurrentUser(session);
      setSelectedSessionId(session.sessionId);
      setApiResponse(null);
      await fetchPermissionsState();
      await loadPersonalData(session.sessionId);
    } catch (err) {
      console.error('Switch user failed', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalData = async (sessId) => {
    try {
      const headers = { 'x-session-id': sessId };
      const [imports, docs, teams, roles, logs, subs, devs, keys, hooks, jobs] = await Promise.all([
        fetch('/api/me/imports', { headers }).then(r => r.json()),
        fetch('/api/me/documents', { headers }).then(r => r.json()),
        fetch('/api/me/teams', { headers }).then(r => r.json()),
        fetch('/api/me/roles', { headers }).then(r => r.json()),
        fetch('/api/me/audit-logs', { headers }).then(r => r.json()),
        fetch('/api/me/subscriptions', { headers }).then(r => r.json()),
        fetch('/api/me/devices', { headers }).then(r => r.json()),
        fetch('/api/me/api-keys', { headers }).then(r => r.json()),
        fetch('/api/me/webhooks', { headers }).then(r => r.json()),
        fetch('/api/me/jobs', { headers }).then(r => r.json())
      ]);

      setDashboardData({
        imports, documents: docs, teams, roles, auditLogs: logs,
        subscriptions: subs, devices: devs, apiKeys: keys, webhooks: hooks, jobs
      });
    } catch (err) {
      console.error('Failed to load user financial summary', err);
    }
  };

  // Admin granting permission
  const handleGrantPermission = async (targetUserId, permission) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('관리자 계정으로 로그인한 후에만 보안 권한 설정을 변경할 수 있습니다.');
      return;
    }
    try {
      const res = await fetch('/api/admin/grant-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': currentUser.sessionId
        },
        body: JSON.stringify({ userId: targetUserId, permission })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        await fetchPermissionsState();
        showToast('성공적으로 접근 권한을 허용하였습니다.');
      }
    } catch (err) {
      console.error('Failed to grant permission', err);
    }
  };

  // Admin revoking permission
  const handleRevokePermission = async (targetUserId, permission) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('관리자 계정으로 로그인한 후에만 보안 권한 설정을 변경할 수 있습니다.');
      return;
    }
    try {
      const res = await fetch('/api/admin/revoke-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': currentUser.sessionId
        },
        body: JSON.stringify({ userId: targetUserId, permission })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        await fetchPermissionsState();
        showToast('성공적으로 접근 권한을 회수하였습니다.');
      }
    } catch (err) {
      console.error('Failed to revoke permission', err);
    }
  };

  // Perform Inquiry
  const handleCallApi = async (endpoint, isSafe = false) => {
    setLoading(true);
    const targetSessionId = selectedSessionId || currentUser?.sessionId;
    
    // Find target session details
    const targetSessionObj = permissionsState.sessionStore[targetSessionId] || {};
    const targetUserId = targetSessionObj.userId || 'unknown';

    try {
      const res = await fetch(endpoint, {
        headers: {
          'x-session-id': targetSessionId || ''
        }
      });
      
      const status = res.status;
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = { text: await res.text() };
      }

      setApiResponse({
        endpoint,
        status,
        body: data
      });

      // DYNAMIC VULNERABILITY DETECTION & USER-FACING POPUP
      // If the current tab has a permission requirement:
      const currentMenu = MENU_ITEMS.find(item => item.id === activeTab);
      if (currentMenu && currentMenu.permissionName && !isSafe) {
        const permName = currentMenu.permissionName;
        // Central DB permission state
        const dbPermissions = permissionsState.userPermissions[targetUserId] || {};
        const centralDbHasPermission = !!dbPermissions[permName];

        // If the central permission is FALSE (revoked) but response is 200 OK -> Vulnerability Triggered!
        if (centralDbHasPermission === false && status === 200) {
          // Trigger Popup alert mapping the bugId to notify
          alert(`금융 보안 테스트 경보: 권한 불일치 오류(Permission Drift)가 감지되었습니다!\n\n` +
                `- 감지된 오류 코드: ${currentMenu.bugId}\n` +
                `- 오류 설명: 관리자 페이지에서 권한이 회수(FALSE)되었으나, 기존 기기 세션 캐시가 갱신되지 않아 정상적으로 데이터를 조회(200 OK)할 수 있습니다.\n\n` +
                `PPO 학습 에이전트 분석용으로 오류 ID 매핑 팝업이 활성화되었습니다.`);
        }
      }

    } catch (err) {
      setApiResponse({
        endpoint,
        status: 500,
        body: { error: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedMenu = MENU_ITEMS.find(item => item.id === activeTab);

  // Helper to check permission states
  const getPermissionStatus = (permission) => {
    if (!currentUser) return { db: false, session: false };
    const sessionObj = permissionsState.sessionStore[selectedSessionId] || {};
    const userId = sessionObj.userId || currentUser.userId;

    const dbPermissions = permissionsState.userPermissions[userId] || {};
    const dbVal = !!dbPermissions[permission];

    const sessVal = !!(sessionObj.permissionCache && sessionObj.permissionCache[permission]);

    return { db: dbVal, session: sessVal };
  };

  return (
    <div className="app-container">
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#0A1931',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontSize: '0.9rem',
          borderLeft: '4px solid #0085FF',
          animation: 'slideIn 0.3s ease'
        }}>
          🔔 {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <span style={{ fontSize: '1.4rem' }}>🏦</span>
          <h1 style={{ fontFamily: 'Outfit' }}>KB Premium Private Bank</h1>
          <span className="logo-badge" style={{ backgroundColor: '#0085FF' }}>보안 강화모드</span>
        </div>
        <div className="header-controls">
          {currentUser && (
            <div className="user-status-card">
              <span>👤 <strong>{availableUsers.find(u => u.userId === currentUser.userId)?.name || currentUser.userId}</strong> 님</span>
              <span className="user-role-badge" style={{ backgroundColor: currentUser.role === 'admin' ? '#EF4444' : '#0085FF' }}>
                {currentUser.role === 'admin' ? '관리자' : currentUser.role === 'employee' ? '직원' : '고객'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <h3 className="nav-group-title">인터넷뱅킹 서비스</h3>
          <ul className="nav-list">
            {MENU_ITEMS.map(item => (
              <li
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setApiResponse(null);
                }}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center' }}>
          © 2026 KB Kookmin Bank.
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        
        {/* Left main pane */}
        <section>
          
          {/* User & Access Certificate Management */}
          <div className="admin-control-panel" style={{ border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: '#0A1931', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔑 인터넷뱅킹 인증서 로그인 및 기기 세션 관리
            </h3>
            
            <div className="control-section">
              <div className="control-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: '#475569' }}>
                    공인인증서 선택 (사용자 전환)
                  </label>
                  <select
                    className="select-control"
                    style={{ width: '100%', padding: '10px' }}
                    value={currentUser?.userId || ''}
                    onChange={(e) => handleSwitchUser(e.target.value)}
                  >
                    {availableUsers.map(u => (
                      <option key={u.userId} value={u.userId}>
                        {u.userId === 'admin' ? '🔑 [관리자] ' : u.userId === 'employee' ? '💼 [직원] ' : '👤 [프리미엄 고객] '}
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: '#475569' }}>
                    활성 기기 접속 세션 선택 (보안 진단용)
                  </label>
                  <select
                    className="select-control"
                    style={{ width: '100%', padding: '10px' }}
                    value={selectedSessionId}
                    onChange={(e) => {
                      setSelectedSessionId(e.target.value);
                      setApiResponse(null);
                    }}
                  >
                    {Object.keys(permissionsState.sessionStore).map(sid => {
                      const sess = permissionsState.sessionStore[sid];
                      return (
                        <option key={sid} value={sid}>
                          [{sess.userId === 'admin' ? '관리자' : sess.userId === 'employee' ? '직원' : '고객'}] {sid}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Admin Center for privilege management */}
              {currentUser?.role === 'admin' && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: '#0A1931', fontWeight: 600 }}>
                    🛡️ 시스템 관리자 통합 보안 권한 통제소
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    각 회원의 개별 금융 기능에 대한 접근 차단 및 허용을 실시간 데이터베이스에 적용합니다.
                  </p>
                  
                  <table className="permission-table">
                    <thead>
                      <tr>
                        <th>대상 회원</th>
                        <th>금융 기능</th>
                        <th>DB 보안 상태</th>
                        <th>보안 설정 제어</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['employee', 'customer'].map(targetId => (
                        <React.Fragment key={targetId}>
                          {MENU_ITEMS.filter(m => m.permissionName).map(menu => {
                            const dbPermissions = permissionsState.userPermissions[targetId] || {};
                            const hasPerm = !!dbPermissions[menu.permissionName];
                            return (
                              <tr key={`${targetId}-${menu.permissionName}`}>
                                <td><strong>{targetId === 'employee' ? '직원' : '고객'} ({targetId})</strong></td>
                                <td>{menu.label}</td>
                                <td>
                                  <span className={`permission-status-dot ${hasPerm ? 'active' : 'inactive'}`}></span>
                                  {hasPerm ? '접근 허용됨' : '차단 (회수됨)'}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-success"
                                    style={{ padding: '4px 10px', fontSize: '0.75rem', marginRight: '6px' }}
                                    onClick={() => handleGrantPermission(targetId, menu.permissionName)}
                                  >
                                    허용
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                    onClick={() => handleRevokePermission(targetId, menu.permissionName)}
                                  >
                                    차단
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Primary View Area */}
          {activeTab === 'dashboard' ? (
            <div>
              {/* Account summary cards */}
              <div className="dashboard-grid">
                <div className="card account-card">
                  <div className="account-type">KB Premium Star Account (입출금)</div>
                  <div className="account-number">384812-04-102948</div>
                  <div className="account-balance">₩ 1,482,049,000</div>
                  <div className="account-footer">
                    <span>최종 출금일: 2026-08-01</span>
                    <span>가용 거래 한도: 100%</span>
                  </div>
                </div>
                
                <div className="card account-card" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #0A1931 100%)' }}>
                  <div className="account-type">KB 마이핏 정기 적금 (예적금)</div>
                  <div className="account-number">481203-01-948123</div>
                  <div className="account-balance">₩ 45,000,000</div>
                  <div className="account-footer">
                    <span>적용 금리: 연 4.2%</span>
                    <span>만기일자: 2027-08-02</span>
                  </div>
                </div>
              </div>

              {/* Personal private asset lists */}
              <div className="card">
                <h2 className="card-title">내 개인 계좌 자산 현황</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '10px', fontSize: '0.9rem' }}>🛡️ 보안 기기 등록 내역</h4>
                    {dashboardData.devices.map(d => (
                      <div key={d.id} className="security-notif-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{d.deviceName}</span>
                        <span className="badge badge-success">{d.status}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '10px', fontSize: '0.9rem' }}>📄 나의 전자 통지문</h4>
                    {dashboardData.documents.map(d => (
                      <div key={d.id} className="security-notif-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{d.title}</span>
                        <span className="security-notif-time">{d.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Sub-page inquiry
            <div className="card">
              <h2 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{selectedMenu.title}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>통합 업무 화면</span>
              </h2>

              <div className="api-executor-panel">
                <div className="alert-box alert-info">
                  안전한 조회를 위하여 지정된 기기 인증서 세션 키를 사용하여 전송합니다. 
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  
                  {/* Access Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1E293B' }}>{selectedMenu.label} 조회 실행</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>지정된 세션 토큰으로 보안 데이터를 조회합니다.</span>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '10px 20px', minWidth: '130px' }}
                      onClick={() => handleCallApi(selectedMenu.endpoint)}
                      disabled={loading}
                    >
                      조회 실행
                    </button>
                  </div>

                  {/* Dual Safe Verification Buttons (Available for Imports and Jobs) */}
                  {(selectedMenu.id === 'imports' || selectedMenu.id === 'jobs') && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0FDF4', padding: '16px', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#166534' }}>실시간 보안 안심 검증 조회</strong>
                        <span style={{ fontSize: '0.75rem', color: '#166534' }}>중앙 실시간 보안 정책을 강제 적용하여 검증합니다.</span>
                      </div>
                      <button 
                        className="btn btn-success" 
                        style={{ padding: '10px 20px', minWidth: '130px' }}
                        onClick={() => handleCallApi(`/api/safe/${selectedMenu.id}`, true)}
                        disabled={loading}
                      >
                        안심 검증 조회
                      </button>
                    </div>
                  )}

                </div>

                {/* Query Results Visual Output (Natural Data Table in User Perspective) */}
                {apiResponse && (
                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '10px', color: '#0A1931' }}>📋 처리 및 조회 내역</h3>
                    
                    {apiResponse.status === 200 ? (
                      Array.isArray(apiResponse.body) ? (
                        <table className="data-table">
                          <thead>
                            <tr>
                              {Object.keys(apiResponse.body[0] || {}).map(key => (
                                <th key={key}>{key.toUpperCase()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {apiResponse.body.map((item, idx) => (
                              <tr key={idx}>
                                {Object.values(item).map((val, vIdx) => (
                                  <td key={vIdx}>{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          <pre>{JSON.stringify(apiResponse.body, null, 2)}</pre>
                        </div>
                      )
                    ) : (
                      <div style={{
                        padding: '24px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FEE2E2',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: 'var(--color-danger)'
                      }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>⚠️</span>
                        <strong>거래 처리 거부 (오류 코드: {apiResponse.status})</strong>
                        <p style={{ fontSize: '0.8rem', color: '#7F1D1D', marginTop: '6px' }}>
                          해당 금융 데이터 조회를 처리할 권한이 존재하지 않습니다. 본인 인증서 보안 등급을 확인해주십시오.
                        </p>
                      </div>
                    )}

                    {/* Collapsible Web Security Diagnostics Console */}
                    <div style={{ marginTop: '20px', borderTop: '1px dashed #CBD5E1', paddingTop: '16px' }}>
                      <h4 style={{ fontSize: '0.85rem', color: '#64748B', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🛡️ AhnLab Web Transaction Security Diagnostics</span>
                        <span>[HTTP Status: {apiResponse.status}]</span>
                      </h4>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </section>

        {/* Right sidebar */}
        <aside>
          {/* Real-time security notice alerts */}
          <div className="card">
            <h3 className="card-title">🚨 금융 보안 알림</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>기기 세션 상태</span>
                <strong style={{ color: 'var(--color-success)' }}>안전망 작동중</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>금융위 정책 이행률</span>
                <strong style={{ color: 'var(--color-success)' }}>100%</strong>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div className="card">
            <h3 className="card-title">빠른 거래 메뉴</h3>
            <div className="quick-actions-grid">
              <div className="quick-action-btn" onClick={() => setActiveTab('dashboard')}>
                <span>📊</span>
                <span>자산현황</span>
              </div>
              <div className="quick-action-btn" onClick={() => setActiveTab('imports')}>
                <span>📥</span>
                <span>일괄이체</span>
              </div>
              <div className="quick-action-btn" onClick={() => setActiveTab('documents')}>
                <span>📄</span>
                <span>문서조회</span>
              </div>
            </div>
          </div>

          {/* Banking notice logs */}
          <div className="card">
            <h3 className="card-title">최근 거래 보호 로그</h3>
            <div>
              {dashboardData.auditLogs.slice(0, 3).map(log => (
                <div key={log.id} className="security-notif-item">
                  <div>이용자 {log.actor} - {log.action}</div>
                  <div className="security-notif-time">{log.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}
