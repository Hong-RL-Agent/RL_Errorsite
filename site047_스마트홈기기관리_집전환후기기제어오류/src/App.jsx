import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation & session state
  const [currentUserRole, setCurrentUserRole] = useState('admin'); // 'admin' | 'read-only'
  const [currentHomeId, setCurrentHomeId] = useState('home-A');
  const [currentRoomId, setCurrentRoomId] = useState('room-01');

  // DB datasets
  const [homes, setHomes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [energyLogs, setEnergyLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Selected device for right control panel (Error 1 Target)
  const [selectedDeviceId, setSelectedDeviceId] = useState('dev-01');

  // Automation creation composer
  const [newAutoName, setNewAutoName] = useState('');
  const [newAutoCondition, setNewAutoCondition] = useState('온도 > 27도');
  const [newAutoAction, setNewAutoAction] = useState('에어컨 ON');

  // Navigation Tabs for mobile / general
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'rules' | 'energy' | 'alerts'

  // UI Toast state
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadHomes();
    loadRooms();
    loadDevices();
    loadAutomations();
    loadEnergyLogs();
    loadAlerts();
  }, []);

  const loadHomes = () => {
    fetch('/api/homes').then(res => res.json()).then(data => setHomes(data));
  };
  const loadRooms = () => {
    fetch('/api/rooms').then(res => res.json()).then(data => setRooms(data));
  };
  const loadDevices = () => {
    fetch('/api/devices').then(res => res.json()).then(data => setDevices(data));
  };
  const loadAutomations = () => {
    fetch('/api/automations').then(res => res.json()).then(data => setAutomations(data));
  };
  const loadEnergyLogs = () => {
    fetch('/api/energy').then(res => res.json()).then(data => setEnergyLogs(data));
  };
  const loadAlerts = () => {
    fetch('/api/alerts').then(res => res.json()).then(data => setAlerts(data));
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Reset sandbox databases
  const handleResetSandbox = async () => {
    await fetch('/api/reset', { method: 'POST' });
    showToast('스마트홈 가상 DB 데이터베이스가 복구되었습니다.', 'success');
    loadHomes();
    loadRooms();
    loadDevices();
    loadAutomations();
    loadEnergyLogs();
    loadAlerts();
  };

  // Switch Home (Error 1 implementation)
  const handleSwitchHome = (homeId) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Session
    // DESCRIPTION: 집 B로 세션을 교체했지만, 우측 기기 세부제어 타겟인 `selectedDeviceId`를 
    // 초기화(null)하지 않고 이전 집 A의 마지막 기기 ID(예: dev-01) 상태를 그대로 노출시킵니다.
    // 이 상태에서 조작 버튼을 누르면 집 B를 보고 있음에도 집 A의 기기가 켜고 꺼집니다.
    setCurrentHomeId(homeId);
    
    // Select first room of new home
    const firstRoom = rooms.find(r => r.homeId === homeId);
    if (firstRoom) {
      setCurrentRoomId(firstRoom.id);
    }
    showToast(`세션이 [${homeId === 'home-A' ? '서울 서초 아파트' : '양평 전원주택'}]으로 변경되었습니다.`, 'info');
  };

  // Toggle Device state (Error 5 read-only HTTP 403 control breach)
  const handleToggleDevice = async (deviceId) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentUserRole })
      });
      const data = await res.json();
      
      if (res.status === 403) {
        // Show authority error toast
        showToast(`[권한 차단] ${data.error}`, 'danger');
        // Reload in background to show that the change actually applied!
        loadDevices();
      } else {
        showToast('기기 전원 상태가 조작되었습니다.', 'success');
        loadDevices();
      }
    } catch (err) {
      showToast('통신 오류', 'danger');
    }
  };

  // Set temperature slider (Error 3 temperature race condition)
  const handleTempSlider = async (deviceId, temp) => {
    // 1. Optimistic UI update immediately
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, temperature: temp } : d));

    try {
      const res = await fetch(`/api/devices/${deviceId}/temperature`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature: temp })
      });
      const data = await res.json();
      
      // Update with server returned value
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, temperature: data.temperature } : d));
    } catch (err) {
      showToast('온도 설정 실패', 'danger');
    }
  };

  // Temperature race condition simulator button (Error 3 trigger)
  const triggerTempRaceDemo = (deviceId) => {
    showToast('온도 연속 변경 레이스 컨디션을 시작합니다 (21도 ➔ 22도 전송)', 'info');

    // 1. Set 21 degrees (Odd number -> 3.0s delay on server)
    handleTempSlider(deviceId, 21);

    // 2. Set 22 degrees (Even number -> 200ms delay on server)
    setTimeout(() => {
      handleTempSlider(deviceId, 22);
    }, 150);
  };

  // Automation update then immediately disable (Error 2 Logic)
  const triggerAutomationRace = async (ruleId) => {
    showToast('규칙 수정 직후 비활성화 경합 시뮬레이터를 실행합니다.', 'info');

    // 1. Edit (PUT, takes 3.0s delay on server)
    fetch(`/api/automations/${ruleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "지능형 에너지 절약 규칙 (수정 완료)",
        condition: "조도 < 30 lux",
        action: "거실 블라인드 ON"
      })
    });

    // 2. Disable immediately (PATCH, takes 0.1s on server)
    setTimeout(async () => {
      const res = await fetch(`/api/automations/${ruleId}/disable`, { method: 'PATCH' });
      if (res.ok) {
        showToast('자동화 규칙 비활성화 적용 완료 (0.1초 완료)', 'success');
        loadAutomations();
      }
    }, 100);

    // Reload list after 3.5 seconds to see it resurrected
    setTimeout(() => {
      showToast('자동화 수정 지연 처리 완료 (비활성화가 활성으로 덮어써짐)', 'warning');
      loadAutomations();
    }, 3500);
  };

  // Delete Room (Error 4 database orphan data)
  const handleDeleteRoom = async (roomId) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('방이 구조 배치도에서 삭제되었습니다.', 'success');
        loadRooms();
        // Do not reload energy log or alerts to show the orphan data leak!
      }
    } catch (err) {
      showToast('방 삭제 실패', 'danger');
    }
  };

  // Scene triggers state pollution (Error 6 Logic)
  const triggerDoubleScenePollution = () => {
    showToast('장면 연속 실행 중 교차 오염 레이스를 시작합니다.', 'info');

    // Scene 1: "외출 모드" (Turns OFF dev-01, dev-02, dev-03 with delays)
    const scene1Actions = [
      { id: "dev-01", status: "OFF" },
      { id: "dev-02", status: "OFF" },
      { id: "dev-03", status: "OFF" }
    ];

    // Scene 2: "귀가 모드" (Turns ON dev-01, dev-02, dev-03 with delays)
    const scene2Actions = [
      { id: "dev-01", status: "ON" },
      { id: "dev-02", status: "ON" },
      { id: "dev-03", status: "ON" }
    ];

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 두 장면(외출 모드 / 귀가 모드)을 연속으로 구동시킬 때, 
    // 이전 호출의 setTimeout 시퀀스를 취소(clear)하지 않고 그대로 내버려둠으로써 
    // 기기들의 전원 상태가 중구난방식(ON, OFF 교차)으로 난잡하게 혼합 오염되는 에러입니다.
    scene1Actions.forEach((act, index) => {
      setTimeout(() => {
        fetch(`/api/devices/${act.id}/toggle`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'admin' })
        }).then(() => loadDevices());
      }, index * 400);
    });

    // Scene 2 triggered 200ms later
    setTimeout(() => {
      scene2Actions.forEach((act, index) => {
        setTimeout(() => {
          fetch(`/api/devices/${act.id}/toggle`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'admin' })
          }).then(() => loadDevices());
        }, index * 400);
      });
    }, 200);
  };

  // Add automation rule
  const handleAddAutomation = async () => {
    if (!newAutoName.trim()) return;
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAutoName,
          condition: newAutoCondition,
          action: newAutoAction
        })
      });
      if (res.ok) {
        showToast('신규 자동화 규칙이 등록되었습니다.', 'success');
        loadAutomations();
        setNewAutoName('');
      }
    } catch (err) {
      showToast('규칙 생성 실패', 'danger');
    }
  };

  // Computations
  const activeRooms = rooms.filter(r => r.homeId === currentHomeId);
  const activeDevices = devices.filter(d => d.roomId === currentRoomId);
  
  // Selected device metadata lookup (Error 1 allows finding device not in currentRoomId)
  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  // Total energy usage calculation (Error 4 showcases orphan room data)
  // Calculate sum of active rooms
  const activeRoomIds = rooms.map(r => r.id);
  const activeRoomsEnergySum = energyLogs
    .filter(log => activeRoomIds.includes(log.roomId))
    .reduce((sum, log) => sum + log.usage, 0);

  // Calculate global DB sum including orphans
  const dbGlobalEnergySum = energyLogs.reduce((sum, log) => sum + log.usage, 0);

  return (
    <div className="homepulse-app">
      
      {/* Top Header */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="logo-title">HomePulse</span>
          <span className="logo-subtitle">Smart home IoT controller</span>
        </div>

        {/* User permissions switcher */}
        <div className="top-settings-row">
          <div className="role-switch">
            <span>🔑 계정 권한: </span>
            <select value={currentUserRole} onChange={(e) => {
              setCurrentUserRole(e.target.value);
              showToast(`권한이 [${e.target.value === 'admin' ? '관리자' : '읽기 전용'}] 계정으로 위임되었습니다.`, 'info');
            }}>
              <option value="admin">관리자 계정 (Admin)</option>
              <option value="read-only">읽기 전용 계정 (Read-Only - Error 5)</option>
            </select>
          </div>
          <button className="sandbox-reset-btn" onClick={handleResetSandbox}>
            🔄 DB 초기화
          </button>
        </div>
      </header>

      {/* Tabs navigation for mobile/responsive */}
      <nav className="sections-nav">
        <button className={activeSection === 'dashboard' ? 'active' : ''} onClick={() => setActiveSection('dashboard')}>
          🏠 방별 제어판
        </button>
        <button className={activeSection === 'rules' ? 'active' : ''} onClick={() => setActiveSection('rules')}>
          ⚡ 자동화 규칙 (Error 2)
        </button>
        <button className={activeSection === 'energy' ? 'active' : ''} onClick={() => setActiveSection('energy')}>
          📊 에너지 관리 (Error 4)
        </button>
        <button className={activeSection === 'alerts' ? 'active' : ''} onClick={() => setActiveSection('alerts')}>
          🔔 스마트 알림 로그
        </button>
      </nav>

      {/* Workspace panel layout */}
      <div className="homepulse-grid-container">

        {/* TAB 1: MAIN CONTROL DASHBOARD */}
        {activeSection === 'dashboard' && (
          <>
            {/* Left Column: Home and Room list */}
            <aside className="panel-section left-rooms-sidebar">
              <h3>🏡 위임할 가옥 홈</h3>
              <div className="homes-select-stack">
                {homes.map(h => (
                  <button 
                    key={h.id} 
                    className={`home-btn ${currentHomeId === h.id ? 'active' : ''}`}
                    onClick={() => handleSwitchHome(h.id)}
                  >
                    {h.name}
                  </button>
                ))}
              </div>

              <div className="rooms-header-block">
                <h3>방 리스트</h3>
              </div>
              <div className="rooms-select-stack">
                {activeRooms.map(r => (
                  <div key={r.id} className="room-item-row">
                    <button 
                      className={`room-btn ${currentRoomId === r.id ? 'active' : ''}`}
                      onClick={() => setCurrentRoomId(r.id)}
                    >
                      🚪 {r.name}
                    </button>
                    <button className="room-delete-btn" onClick={() => handleDeleteRoom(r.id)}>
                      방 삭제
                    </button>
                  </div>
                ))}

                {activeRooms.length === 0 && (
                  <p className="empty-lbl">활성화된 방이 없습니다.</p>
                )}
              </div>

              {/* Scenes widget */}
              <div className="scenes-block-widget">
                <h4>🎭 집 장면 원클릭 (Scenes)</h4>
                <div className="scene-buttons-row">
                  <button className="scene-btn" onClick={triggerDoubleScenePollution}>
                    ⚡ 외출 ➔ 귀가 동시 발동 (Error 6)
                  </button>
                </div>
              </div>
            </aside>

            {/* Center Column: Room layout map and device nodes */}
            <main className="panel-section center-room-layout">
              <div className="layout-header">
                <h2>🚪 {rooms.find(r => r.id === currentRoomId)?.name || '방'} 내부 IoT 장치 목록</h2>
                <span className="room-coordinate-desc">2D Grid Layout 배치</span>
              </div>

              <div className="device-nodes-grid">
                {activeDevices.map(dev => (
                  <div 
                    key={dev.id} 
                    className={`device-node-card ${dev.status === 'ON' ? 'active' : ''} ${selectedDeviceId === dev.id ? 'focused' : ''}`}
                    onClick={() => setSelectedDeviceId(dev.id)}
                  >
                    <span className="node-icon">
                      {dev.type === 'light' ? '💡' : dev.type === 'ac' ? '❄️' : '🔌'}
                    </span>
                    <strong className="node-title">{dev.name}</strong>
                    <div className="node-footer">
                      <span className={`status-badge ${dev.status.toLowerCase()}`}>{dev.status}</span>
                      {dev.type === 'ac' || dev.type === 'heater' ? (
                        <span className="temp-badge">{dev.temperature}°C</span>
                      ) : null}
                    </div>
                  </div>
                ))}

                {activeDevices.length === 0 && (
                  <p className="empty-lbl">이 방에 속한 IoT 디바이스가 없습니다.</p>
                )}
              </div>
            </main>

            {/* Right Column: Selected device detail control panel */}
            <aside className="panel-section right-device-controller">
              {selectedDevice ? (
                <div className="controller-detail-card">
                  <div className="header">
                    <h3>⚙️ 기기 디테일 설정</h3>
                    <span className="focused-dev-lbl">선택된 기기: <code>{selectedDevice.id}</code></span>
                  </div>

                  <div className="details-body">
                    <p className="dev-name"><strong>{selectedDevice.name}</strong></p>
                    <p className="dev-status">상태: <span className="status-val">{selectedDevice.status}</span></p>

                    {/* Toggle Power */}
                    <div className="action-row">
                      <button 
                        className={`toggle-action-btn ${selectedDevice.status === 'ON' ? 'on' : 'off'}`}
                        onClick={() => handleToggleDevice(selectedDevice.id)}
                      >
                        전원 {selectedDevice.status === 'ON' ? '끄기 (OFF)' : '켜기 (ON)'}
                      </button>
                    </div>

                    {/* Temperature slider if applicable */}
                    {['ac', 'heater', 'light'].includes(selectedDevice.type) && (
                      <div className="temperature-slider-block">
                        <div className="lbl-row">
                          <label>설정 온도 / 레벨</label>
                          <span>{selectedDevice.temperature}°C</span>
                        </div>
                        <input 
                          type="range" 
                          min="15" 
                          max="38" 
                          value={selectedDevice.temperature} 
                          onChange={(e) => handleTempSlider(selectedDevice.id, Number(e.target.value))}
                          className="temp-slider-bar"
                        />
                        <button className="temp-simulation-btn" onClick={() => triggerTempRaceDemo(selectedDevice.id)}>
                          ⚡ 온도 연속 전송 레이스 시뮬레이션 (Error 3)
                        </button>
                      </div>
                    )}

                    <div className="metadata-box">
                      <h5>⚡ 소비 전력 정보</h5>
                      <p>실시간 예측치: <code>{selectedDevice.power} Watts</code></p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="empty-lbl">제어할 IoT 디바이스 노드를 지도에서 클릭해 주세요.</p>
              )}
            </aside>
          </>
        )}

        {/* TAB 2: AUTOMATION RULES FLOW */}
        {activeSection === 'rules' && (
          <div className="automation-view-wrapper">
            
            {/* Create automation */}
            <div className="panel-section automation-composer">
              <h3>⚡ 자동화 조건/동작 플로우 생성</h3>
              <div className="composer-row">
                <div className="field">
                  <label>규칙 이름</label>
                  <input type="text" placeholder="예: 야간 공기청정기 가동" value={newAutoName} onChange={e => setNewAutoName(e.target.value)} />
                </div>
                <div className="field">
                  <label>조건 (Condition)</label>
                  <select value={newAutoCondition} onChange={e => setNewAutoCondition(e.target.value)}>
                    <option value="온도 > 27도">온도 &gt; 27도</option>
                    <option value="조도 < 30 lux">조도 &lt; 30 lux</option>
                    <option value="오후 7:00">오후 7:00</option>
                    <option value="이산화탄소 > 1000ppm">이산화탄소 &gt; 1000ppm</option>
                  </select>
                </div>
                <div className="field">
                  <label>연결 동작 (Action)</label>
                  <select value={newAutoAction} onChange={e => setNewAutoAction(e.target.value)}>
                    <option value="에어컨 ON">에어컨 ON</option>
                    <option value="블라인드 닫기">블라인드 닫기</option>
                    <option value="가습기 OFF">가습기 OFF</option>
                    <option value="공기청정기 ON">공기청정기 ON</option>
                  </select>
                </div>
                <button className="add-rule-btn" onClick={handleAddAutomation}>생성</button>
              </div>
            </div>

            {/* Automation flow list */}
            <div className="panel-section automation-rules-list">
              <h2>⚡ 활성화된 자동화 시퀀스 플로우 규칙</h2>
              <div className="rules-stack">
                {automations.map(rule => (
                  <div key={rule.id} className="rule-flow-card">
                    <div className="rule-info">
                      <h4>{rule.name}</h4>
                      <div className="flow-connect-visual">
                        <span className="cond-tag">IF: {rule.condition}</span>
                        <span className="arrow-visual">➔</span>
                        <span className="act-tag">THEN: {rule.action}</span>
                      </div>
                    </div>

                    <div className="rule-status-actions">
                      <span className={`rule-status ${rule.active ? 'active' : 'inactive'}`}>
                        {rule.active ? '활성화됨 (Active)' : '비활성 (Disabled)'}
                      </span>
                      <button className="disable-race-btn" onClick={() => triggerAutomationRace(rule.id)}>
                        ⚡ 수정 후 즉각 비활성화 (Error 2)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ENERGY USAGE GRAPH */}
        {activeSection === 'energy' && (
          <div className="energy-view-wrapper">
            <div className="panel-section energy-graphs-block">
              <h2>📊 방별 전력 에너지 사용량 대조 분석</h2>
              
              {/* Orphan warning notice (Error 4 visualization) */}
              <div className="alert-mismatch-warning">
                <h4>🚨 데이터베이스 정합성 불일치 검출</h4>
                <p>현재 UI에 노출되는 활성 방 전력 합계: <code>{activeRoomsEnergySum}W</code></p>
                <p>데이터베이스 내 레코드 누계 총합(Orphan 로그 잔존): <code>{dbGlobalEnergySum}W</code></p>
                <p className="warning-desc">방 삭제 시 하부 로그(`energyLogs`)가 연쇄 소거되지 않아 오차가 발생 중입니다.</p>
              </div>

              {/* SVG bar chart */}
              <div className="svg-chart-container">
                <svg className="energy-bar-chart" viewBox="0 0 500 200">
                  {/* Background grid lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#24304f" strokeDasharray="4" />
                  <line x1="40" y1="90" x2="480" y2="90" stroke="#24304f" strokeDasharray="4" />
                  <line x1="40" y1="160" x2="480" y2="160" stroke="#24304f" />

                  {/* Render logs. Log list still contains deleted room logs! */}
                  {energyLogs.map((log, idx) => {
                    const roomInfo = rooms.find(r => r.id === log.roomId);
                    const barHeight = (log.usage / 500) * 130;
                    const x = 50 + idx * 80;
                    const y = 160 - barHeight;

                    return (
                      <g key={log.id}>
                        {/* Bar */}
                        <rect 
                          x={x} 
                          y={y} 
                          width="40" 
                          height={barHeight} 
                          fill={roomInfo ? "#10b981" : "#ef4444"} 
                          rx="4"
                        />
                        {/* Label */}
                        <text x={x + 20} y="180" textAnchor="middle" fill="#94a3b8" fontSize="10">
                          {roomInfo ? roomInfo.name : `[삭제됨:${log.roomId}]`}
                        </text>
                        {/* Value */}
                        <text x={x + 20} y={y - 5} textAnchor="middle" fill="#f8fafc" fontSize="10">
                          {log.usage}W
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ALERTS SYSTEM */}
        {activeSection === 'alerts' && (
          <div className="alerts-view-wrapper">
            <div className="panel-section alerts-list-block">
              <h2>🔔 실시간 스마트홈 경고 및 이상 감지 로그</h2>
              <div className="alerts-stack">
                {alerts.map(item => {
                  const room = rooms.find(r => r.id === item.roomId);
                  return (
                    <div key={item.id} className="alert-card-item">
                      <span className="alert-badge">위험</span>
                      <div className="alert-info">
                        <p className="msg">{item.message}</p>
                        <span className="meta">
                          방 타겟: {room ? room.name : `[삭제됨 ID: ${item.roomId}]`} | 발생 시간: {item.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating Action Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
