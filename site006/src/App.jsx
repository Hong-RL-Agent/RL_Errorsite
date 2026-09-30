import React, { useState, useEffect } from 'react';

const MENU_ITEMS = [
  { id: 'summary', label: '종합 모니터링', category: '워크플로우' },
  { id: 'imports', label: '데이터 스키마 가져오기', category: '운영 데이터' },
  { id: 'documents', label: '공유 설계 문서함', category: '운영 데이터' },
  { id: 'teams', label: '인프라 개발 팀원', category: '인프라 관리' },
  { id: 'roles', label: '시스템 접근 역할', category: '인프라 관리' },
  { id: 'audit-logs', label: '플랫폼 감사 로그', category: '보안 통제' },
  { id: 'subscriptions', label: 'GPU 서버 구독권', category: '보안 통제' },
  { id: 'devices', label: '클러스터 등록 기기', category: '인프라 관리' },
  { id: 'api-keys', label: 'API 액세스 토큰', category: '운영 데이터' },
  { id: 'webhooks', label: '트리거 웹훅 연동', category: '운영 데이터' },
  { id: 'jobs', label: '백그라운드 스케줄러', category: '보안 통제' }
];

export default function App() {
  const [activeMenu, setActiveMenu] = useState('summary');
  const [currentUser, setCurrentUser] = useState('user'); // admin or user (developer)
  const [users, setUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [listData, setListData] = useState([]);
  const [detailedView, setDetailedView] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Canvas Nodes simulation state
  const [nodes, setNodes] = useState([
    { id: 'node-01', type: 'Trigger', label: '웹훅 수신 트리거', x: 40, y: 150, status: 'Success', bg: '#6366f1' },
    { id: 'node-02', type: 'LLM Node', label: 'GPT-4o 텍스트 생성', x: 260, y: 80, status: 'Success', bg: '#0ea5e9' },
    { id: 'node-03', type: 'Action', label: 'Slack 전송 모듈', x: 480, y: 150, status: 'Pending', bg: '#10b981' }
  ]);

  // Right setting panel trigger states
  const [adminCategory, setAdminCategory] = useState('imports');
  const [adminRoutingType, setAdminRoutingType] = useState('vulnerable');

  // Load session users on mount
  useEffect(() => {
    fetch('/api/session/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('사용자 목록 로드 실패', err));
  }, []);

  // Fetch dashboard or active lists
  useEffect(() => {
    setDetailedView(null);
    setDetailError(null);
    if (activeMenu === 'summary') {
      fetch('/api/me/summary')
        .then(res => res.json())
        .then(data => setDashboardData(data))
        .catch(err => console.error('대시보드 요약 정보 연동 에러', err));
    } else {
      fetch(`/api/me/${activeMenu}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setListData(data);
          } else {
            setListData(data ? [data] : []);
          }
        })
        .catch(err => console.error(`${activeMenu} 리소스 연동 에러`, err));
    }
  }, [activeMenu, currentUser]);

  const handleUserSwitch = (userId) => {
    fetch('/api/session/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data.activeUser);
      })
      .catch(err => console.error('사용자 계정 세션 스왑 에러', err));
  };

  const triggerAdminApi = (e) => {
    e.preventDefault();
    setDetailLoading(true);
    setDetailedView(null);
    setDetailError(null);

    const path = adminRoutingType === 'safe' ? `/api/safe/admin/${adminCategory}` : `/api/admin/${adminCategory}`;
    fetch(path)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.error || '접근이 거부되었습니다 (HTTP 403 Forbidden).');
        }
        return body;
      })
      .then((data) => {
        setDetailedView(data);
      })
      .catch((err) => {
        setDetailError(err.message);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  // Node action simulations
  const handleExecuteNode = (node) => {
    setNodes(nodes.map(n => n.id === node.id ? { ...n, status: 'Success' } : n));
    alert(`[AI Workflow] '${node.label}' 노드가 성공적으로 빌드 및 실행 완료되었습니다.`);
  };

  const handleCreateNode = () => {
    const newId = `node-${Date.now().toString().slice(-2)}`;
    setNodes([
      ...nodes,
      { id: newId, type: 'LLM Node', label: '임베딩 벡터 검색 노드', x: 260, y: 260, status: 'Success', bg: '#8b5cf6' }
    ]);
    alert('[AI Workflow] 새 벡터 모델 노드를 캔버스에 등록했습니다.');
  };

  const renderSummaryDashboard = () => {
    if (!dashboardData) return <div>AI 워크플로우 대시보드 로드 중...</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Interactive Canvas Simulator */}
        <div className="canvas-container" style={{ padding: 0 }}>
          <div className="canvas-header">
            <div className="canvas-title-group">
              <span className="canvas-title">AI 파이프라인 시각 캔버스</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>드래그앤드롭으로 AI 자동화 에이전트 노드를 연동하고 흐름을 제어합니다.</span>
            </div>
            <div className="canvas-action-row">
              <button className="action-card-btn" onClick={handleCreateNode}>+ 노드 추가</button>
              <button className="action-card-btn-secondary" onClick={() => {
                setNodes(nodes.map(n => ({ ...n, status: 'Success' })));
                alert('[AI Workflow] 전사 배치 파이프라인 실행 완료.');
              }}>전체 흐름 실행</button>
            </div>
          </div>

          <div className="interactive-canvas">
            {nodes.map((node) => (
              <div 
                className="flow-node" 
                key={node.id}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
              >
                <div className="node-anchor-in"></div>
                <div className="node-header" style={{ backgroundColor: node.bg }}>
                  <span>{node.type}</span>
                  <span style={{ fontSize: '9px', opacity: 0.8 }}>{node.status}</span>
                </div>
                <div className="node-body">
                  <strong>{node.label}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>ID: {node.id}</span>
                  <button 
                    style={{
                      marginTop: '6px',
                      padding: '3px 6px',
                      fontSize: '9px',
                      backgroundColor: 'var(--bg-workspace)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      borderRadius: '3px'
                    }}
                    onClick={() => handleExecuteNode(node)}
                  >
                    단독 실행
                  </button>
                </div>
                <div className="node-anchor-out"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResourceList = () => {
    if (!listData || listData.length === 0) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '6px' }}>
          등록된 자원 정보가 존재하지 않습니다.
        </div>
      );
    }

    const currentMenu = MENU_ITEMS.find(m => m.id === activeMenu);

    return (
      <div className="datagrid-card">
        <div className="datagrid-header">
          <span>{currentMenu?.label} - 전사 동기화 리스트</span>
        </div>
        <table className="datagrid-table">
          <thead>
            <tr>
              <th>자원 식별자</th>
              <th>세부 파라미터 정보</th>
              <th>활성</th>
              <th>제어</th>
            </tr>
          </thead>
          <tbody>
            {listData.map((item, idx) => {
              if (!item) return null;
              
              // Dynamic fields mapping
              let details = "";
              if (item.source) details = `출처: ${item.source} (레코드 수: ${item.recordsCount || 0})`;
              else if (item.title && item.location) details = `문서명: ${item.title} (경로: ${item.location})`;
              else if (item.name && item.members) details = `팀명: ${item.name} (소속원: ${item.members}명)`;
              else if (item.name && item.scope) details = `역할명: ${item.name} (허용 범위: ${item.scope})`;
              else if (item.action && item.timestamp) details = `작업: ${item.action} (수행시간: ${item.timestamp}, IP: ${item.ip})`;
              else if (item.plan) details = `플랜: ${item.plan} (구독금액: ${item.cost})`;
              else if (item.name && item.os) details = `기기명: ${item.name} (운영체제: ${item.os})`;
              else if (item.label && item.mask) details = `토큰라벨: ${item.label} (식별마스킹: ${item.mask})`;
              else if (item.trigger && item.url) details = `트리거: ${item.trigger} (콜백 URL: ${item.url})`;
              else if (item.taskName) details = `배치 태스크: ${item.taskName} (속도: ${item.executionTime || ''})`;

              return (
                <tr key={item.id || idx}>
                  <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{item.id}</td>
                  <td>{details}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      backgroundColor: item.status === 'Success' || item.status === 'Active' ? '#e6fffa' : '#f7fafc',
                      color: item.status === 'Success' || item.status === 'Active' ? 'var(--success)' : 'var(--text-secondary)',
                      fontWeight: '600'
                    }}>
                      {item.status || '대기'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-card-btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11.5px' }}
                      onClick={() => {
                        setDetailLoading(true);
                        setDetailedView(null);
                        setDetailError(null);
                        fetch(`/api/me/${activeMenu}`)
                          .then(res => res.json())
                          .then(data => {
                            const matchItem = Array.isArray(data) ? data.find(d => d.id === item.id) : data;
                            setDetailedView({
                              role: currentUser,
                              endpoint: `/api/me/${activeMenu}`,
                              status: 200,
                              response_fields: matchItem
                            });
                          })
                          .catch(err => setDetailError(err.message))
                          .finally(() => setDetailLoading(false));
                      }}
                    >
                      상세 조회
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="brand-logo">
            <div className="brand-symbol">A</div>
            <span>AI Flow Automation Console</span>
          </div>
        </div>
        <div className="header-right">
          <div className="workspace-badge">
            워크스페이스: <strong>{currentUser === 'admin' ? 'Global DevOps Node' : 'AI Research Lab A'}</strong>
          </div>
          <select 
            className="user-switcher" 
            value={currentUser} 
            onChange={(e) => handleUserSwitch(e.target.value)}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </header>

      <div className="layout-body">
        <aside className="sidebar-lnb">
          {['워크플로우', '운영 데이터', '인프라 관리', '보안 통제'].map((category) => (
            <React.Fragment key={category}>
              <span className="sidebar-title">{category}</span>
              {MENU_ITEMS.filter(m => m.category === category).map((item) => (
                <button
                  key={item.id}
                  className={`menu-btn ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </aside>

        <main className="workspace-panel">
          <div className="canvas-container">
            <div className="content-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 className="canvas-title">
                {MENU_ITEMS.find(i => i.id === activeMenu)?.label}
              </h2>
            </div>
            
            {activeMenu === 'summary' ? renderSummaryDashboard() : renderResourceList()}

            {/* Inspect Detail Card */}
            {(detailedView || detailLoading || detailError) && (
              <div className="detail-inspect-card">
                <div className="inspect-title-row">
                  <span className="inspect-title">파이프라인 통신 노드 검증 결과</span>
                  {detailedView && <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>STATUS: 200 OK</span>}
                </div>
                {detailLoading && <div>텔레메트리 스트림 수신 중...</div>}
                {detailError && <div className="alert-error">{detailError}</div>}
                {detailedView && (
                  <div>
                    <div style={{ display: 'grid', gap: '4px', marginBottom: '12px' }}>
                      <div className="inspect-row">
                        <span className="inspect-label">통신 엔드포인트</span>
                        <span className="inspect-val" style={{ fontFamily: 'monospace' }}>{detailedView.endpoint}</span>
                      </div>
                      <div className="inspect-row">
                        <span className="inspect-label">세션 인증 레벨 (Role)</span>
                        <span className="inspect-val">{detailedView.role}</span>
                      </div>
                    </div>
                    
                    <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>연동 메시지 원본 (Raw Response)</span>
                    <pre className="inspect-pre">
                      {JSON.stringify(detailedView.response_fields, null, 2)}
                    </pre>

                    {/* Disguised button triggering the Korean detailed diagnostics alert */}
                    {detailedView.role === 'user' && detailedView.endpoint.startsWith('/api/admin/') && (
                      <button 
                        className="verify-sync-btn"
                        onClick={() => {
                          let errorDesc = "";
                          let bugNum = "";
                          const reqPath = detailedView.endpoint || "";
                          
                          if (reqPath.includes('/admin/imports')) {
                            bugNum = "51";
                            errorDesc = "관리자 Imports API에서 세션 권한(role=admin) 검증이 누락되어, 일반 개발자 세션으로 통합 대량 데이터 적재 이력을 획득할 수 있습니다.";
                          } else if (reqPath.includes('/admin/documents')) {
                            bugNum = "52";
                            errorDesc = "관리자 Documents API의 보안 점검 필터 누락으로 일반 개발자가 최고 권한의 API 인증 키 및 관리용 기밀 세부 문서를 조회 가능합니다.";
                          } else if (reqPath.includes('/admin/teams')) {
                            bugNum = "53";
                            errorDesc = "관리자 Teams API의 인프라 역할 점검 미비로 인해 전사 Devops 운영 핵심 이사진 및 연락 명세를 무단 탈취당합니다.";
                          } else if (reqPath.includes('/admin/roles')) {
                            bugNum = "54";
                            errorDesc = "관리자 Roles API에 보안 제어 절차가 배제되어 전사 인프라에 할당된 150여 개 이상의 세부 권한 맵 데이터가 노출됩니다.";
                          } else if (reqPath.includes('/admin/audit-logs')) {
                            bugNum = "55";
                            errorDesc = "관리자 감사 로그(Audit Logs) API의 접근 통제 해제로 OpenAI 플랫폼 키 회수 등 관리자의 핵심 제어 이력 및 내부 IP가 노출됩니다.";
                          } else if (reqPath.includes('/admin/subscriptions')) {
                            bugNum = "56";
                            errorDesc = "관리자 Subscriptions API의 역할 판단 루프 누락으로 연 $150,000 상당의 클라우드 GPU 클러스터 과금 내역이 외부로 유출됩니다.";
                          } else if (reqPath.includes('/admin/devices')) {
                            bugNum = "57";
                            errorDesc = "관리자 Devices API에서 세션 수준 판단 장치가 부재하여 GPU 마스터 클러스터 서버 노드의 OS 명칭 및 식별 주소가 방출됩니다.";
                          } else if (reqPath.includes('/admin/api-keys')) {
                            bugNum = "58";
                            errorDesc = "관리자 API Keys API의 검증 부족으로 프로덕션 환경의 실 서비스 연동용 OpenAI 게이트웨이 토큰 라벨 및 생성 주기 메타데이터를 수집당합니다.";
                          } else if (reqPath.includes('/admin/webhooks')) {
                            bugNum = "59";
                            errorDesc = "관리자 Webhooks API 접근 세션 필터 누락으로 클러스터 오류 경보 수신용 내부 Slack 웹훅 채널 원격 주소가 유출됩니다.";
                          } else if (reqPath.includes('/admin/jobs')) {
                            bugNum = "60";
                            errorDesc = "관리자 Jobs API에서 세션 역할 비교 분기가 누락되어 GPU 노드 백업 태스크 상태 및 Milvus 벡터 데이터 동기화 리포트를 탈취합니다.";
                          }
                          
                          const bugIndexMap = {
                            "51": "01",
                            "52": "02",
                            "53": "03",
                            "54": "04",
                            "55": "05",
                            "56": "06",
                            "57": "07",
                            "58": "08",
                            "59": "09",
                            "60": "10"
                          };
                          
                          const formattedBugId = `site006-bug${bugIndexMap[bugNum] || "01"}`;
                          alert(`[AI Workflow 인프라 게이트웨이 진단]\n\n■ 식별 코드: ${formattedBugId}\n■ 대응 분류: SEC-0${bugNum}\n■ 현상 유형: 수직 권한 우회 오류\n■ 상세 원인:\n${errorDesc}`);
                        }}
                      >
                        파이프라인 통신 노드 검증
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="right-panel-lnb">
            <div className="panel-widget-card">
              <h3 className="widget-title">통신 노드 동기화 제어</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                원격 파이프라인 관리자 API 세션을 직접 동화 작동 검증하여 게이트웨이 취약 요소를 식별합니다.
              </p>
              
              <form onSubmit={triggerAdminApi} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span className="form-label" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>인프라 제어 대상</span>
                  <select 
                    className="widget-select" 
                    value={adminCategory}
                    onChange={(e) => setAdminCategory(e.target.value)}
                  >
                    <option value="imports">Imports (데이터 스키마 가져오기)</option>
                    <option value="documents">Documents (설계 문서함)</option>
                    <option value="teams">Teams (인프라 개발팀 목록)</option>
                    <option value="roles">Roles (전사 권한 명세)</option>
                    <option value="audit-logs">Audit Logs (감사 로그 대장)</option>
                    <option value="subscriptions">Subscriptions (GPU 클러스터 구독)</option>
                    <option value="devices">Devices (마스터 노드 기기 목록)</option>
                    <option value="api-keys">API Keys (OpenAI 토큰 메타데이터)</option>
                    <option value="webhooks">Webhooks (슬랙 트리거 웹훅)</option>
                    <option value="jobs">Jobs (배치 백그라운드 스케줄러)</option>
                  </select>
                </div>

                <div>
                  <span className="form-label" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>API 호출 모드</span>
                  <select 
                    className="widget-select" 
                    value={adminRoutingType}
                    onChange={(e) => setAdminRoutingType(e.target.value)}
                  >
                    <option value="vulnerable">직접 동기화 모드 (우회 통신 수립)</option>
                    {(adminCategory === 'imports' || adminCategory === 'documents') && (
                      <option value="safe">보안 필터 모드 (세션 필터 검증)</option>
                    )}
                  </select>
                </div>

                <button type="submit" className="widget-btn" style={{ marginTop: '4px' }}>파이프라인 통신 요청</button>
              </form>
            </div>

            <div className="panel-widget-card">
              <h3 className="widget-title">실시간 워크플로우 이벤트</h3>
              <div className="timeline-list">
                <div className="timeline-item">GPU 서버 노드 로드율: 42.1%</div>
                <div className="timeline-item">벡토라이저 트리거 스케줄 작동 중.</div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
