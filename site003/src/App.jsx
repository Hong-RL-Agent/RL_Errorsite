import React, { useState, useEffect } from 'react';

const MENU_ITEMS = [
  { id: 'summary', label: '워크스페이스 개요' },
  { id: 'exports', label: '내보내기 이력' },
  { id: 'imports', label: '가져오기 이력' },
  { id: 'documents', label: '공유 문서함' },
  { id: 'teams', label: '팀 구성원 관리' },
  { id: 'roles', label: '역할 및 권한' },
  { id: 'audit-logs', label: '감사 및 로그' },
  { id: 'subscriptions', label: '요금제 및 구독' },
  { id: 'devices', label: '액세스 기기 관리' },
  { id: 'api-keys', label: 'API 토큰 구성' },
  { id: 'webhooks', label: '웹훅 통합 설정' },
  { id: 'jobs', label: '백그라운드 작업' }
];

export default function App() {
  const [activeMenu, setActiveMenu] = useState('summary');
  const [currentUser, setCurrentUser] = useState('userA');
  const [users, setUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [listData, setListData] = useState([]);
  const [detailedView, setDetailedView] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Manual query search fields
  const [searchCategory, setSearchCategory] = useState('exports');
  const [searchId, setSearchId] = useState('');
  const [searchType, setSearchType] = useState('vulnerable');

  // Load session users on mount
  useEffect(() => {
    fetch('/api/session/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('유저 목록을 로드하지 못했습니다.', err));
  }, []);

  // Fetch dashboard or list data depending on activeMenu and currentUser
  useEffect(() => {
    setDetailedView(null);
    setDetailError(null);
    if (activeMenu === 'summary') {
      fetch('/api/me/summary')
        .then(res => res.json())
        .then(data => setDashboardData(data))
        .catch(err => console.error('대시보드 개요 데이터를 불러오지 못했습니다.', err));
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
        .catch(err => console.error(`${activeMenu} 목록 로드 실패`, err));
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
      .catch(err => console.error('사용자 세션 전환 실패', err));
  };

  const handleLookup = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setDetailLoading(true);
    setDetailedView(null);
    setDetailError(null);

    const pathPrefix = searchType === 'safe' ? `/api/safe/${searchCategory}` : `/api/${searchCategory}`;
    fetch(`${pathPrefix}/${searchId.trim()}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.error || '접근이 거부되었거나 존재하지 않는 리소스 식별자입니다.');
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

  const loadResourceDirectly = (category, id) => {
    setDetailLoading(true);
    setDetailedView(null);
    setDetailError(null);

    fetch(`/api/${category}/${id}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.error || '접근이 거부되었거나 존재하지 않는 리소스 식별자입니다.');
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

  const renderSummaryDashboard = () => {
    if (!dashboardData) return <div>대시보드 데이터를 로드하는 중...</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="panel-card" style={{ flex: '1', minWidth: '220px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>관리자 식별자</span>
            <strong style={{ fontSize: '1.25rem' }}>{dashboardData.user?.name}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>소속: {dashboardData.user?.org}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>가입 등급: {dashboardData.user?.tier}</span>
          </div>
          <div className="panel-card" style={{ flex: '1', minWidth: '150px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>생성된 파일 내보내기</span>
            <strong style={{ fontSize: '1.75rem' }}>{dashboardData.exportsCount} 개</strong>
          </div>
          <div className="panel-card" style={{ flex: '1', minWidth: '150px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>동작 중인 웹훅</span>
            <strong style={{ fontSize: '1.75rem' }}>{dashboardData.activeWebhooksCount} 개</strong>
          </div>
        </div>
        
        <div className="panel-card">
          <h3 className="panel-card-title">워크스페이스 활성 상태</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            현재 클러스터와 노드가 원활하게 운영 중입니다. 관리 프로필 내에 총 {dashboardData.jobsCount}개의 비동기 작업 텔레메트리가 등록되어 있습니다.
          </p>
        </div>
      </div>
    );
  };

  const renderResourceList = () => {
    if (!listData || listData.length === 0) {
      return (
        <div className="alert alert-info">
          현재 워크스페이스 세션 하에 조회할 수 있는 기록이 존재하지 않습니다.
        </div>
      );
    }

    return (
      <div className="card-grid">
        {listData.map((item, idx) => {
          if (!item) return null;
          return (
            <div className="resource-card" key={item.id || idx}>
              <div className="card-header">
                <span className="card-id">{item.id}</span>
                {item.status && (
                  <span className={`card-status ${item.status === 'Completed' || item.status === 'Success' || item.status === 'Active' ? 'status-active' : 'status-pending'}`}>
                    {item.status}
                  </span>
                )}
              </div>
              <div className="card-body">
                {item.format && <div><strong>파일 포맷:</strong> {item.format}</div>}
                {item.recordsCount !== undefined && <div><strong>레코드 수:</strong> {item.recordsCount}</div>}
                {item.filename && <div><strong>파일명:</strong> {item.filename}</div>}
                {item.processedCount !== undefined && <div><strong>처리 개수:</strong> {item.processedCount}</div>}
                {item.title && <div><strong>문서 제목:</strong> {item.title} ({item.visibility})</div>}
                {item.lastModified && <div><strong>최종 수정일:</strong> {item.lastModified}</div>}
                {item.name && <div><strong>이름:</strong> {item.name}</div>}
                {item.memberCount && <div><strong>멤버 인원:</strong> {item.memberCount}</div>}
                {item.channelLinked && <div><strong>연결된 채널:</strong> {item.channelLinked}</div>}
                {item.scope && <div><strong>액세스 범위:</strong> {item.scope}</div>}
                {item.permissionsCount && <div><strong>할당된 권한 수:</strong> {item.permissionsCount}</div>}
                {item.actor && <div><strong>수행 계정:</strong> {item.actor}</div>}
                {item.action && <div><strong>동작 내용:</strong> {item.action}</div>}
                {item.ipAddress && <div><strong>접속 IP:</strong> {item.ipAddress}</div>}
                {item.planName && <div><strong>요금 플랜:</strong> {item.planName} ({item.cost})</div>}
                {item.deviceName && <div><strong>기기명:</strong> {item.deviceName} ({item.osVersion})</div>}
                {item.location && <div><strong>위치:</strong> {item.location}</div>}
                {item.label && <div><strong>토큰 라벨:</strong> {item.label} ({item.algorithm})</div>}
                {item.createdBy && <div><strong>생성자:</strong> {item.createdBy}</div>}
                {item.targetUrl && <div><strong>웹훅 전송 URL:</strong> {item.targetUrl}</div>}
                {item.triggerEvents && <div><strong>트리거 이벤트:</strong> {item.triggerEvents}</div>}
                {item.taskName && <div><strong>작업 내용:</strong> {item.taskName}</div>}
                {item.runner && <div><strong>작업 노드:</strong> {item.runner}</div>}
                {item.executionTime && <div><strong>수행 속도:</strong> {item.executionTime}</div>}
              </div>
              <button 
                className="card-action-btn"
                onClick={() => {
                  let categoryRoute = activeMenu;
                  if (activeMenu === 'exports') categoryRoute = 'exports';
                  else if (activeMenu === 'imports') categoryRoute = 'imports';
                  else if (activeMenu === 'documents') categoryRoute = 'documents';
                  else if (activeMenu === 'teams') categoryRoute = 'teams';
                  else if (activeMenu === 'roles') categoryRoute = 'roles';
                  else if (activeMenu === 'audit-logs') categoryRoute = 'audit-logs';
                  else if (activeMenu === 'subscriptions') categoryRoute = 'subscriptions';
                  else if (activeMenu === 'devices') categoryRoute = 'devices';
                  else if (activeMenu === 'api-keys') categoryRoute = 'api-keys';
                  else if (activeMenu === 'webhooks') categoryRoute = 'webhooks';
                  else if (activeMenu === 'jobs') categoryRoute = 'jobs';
                  loadResourceDirectly(categoryRoute, item.id);
                }}
              >
                상세 정보 검사
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-section">
          <div className="logo-icon">W</div>
          <div className="brand-name">Enterprise Admin Control Hub</div>
        </div>
        <div className="header-controls">
          <div className="user-session-badge">
            <div className="user-indicator"></div>
            <span>로그인 관리자: <strong>{currentUser === 'userA' ? 'Alice J. (A)' : 'Bob S. (B)'}</strong></span>
          </div>
          <select 
            className="user-switcher" 
            value={currentUser} 
            onChange={(e) => handleUserSwitch(e.target.value)}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.id})</option>
            ))}
          </select>
        </div>
      </header>

      <div className="layout-body">
        <aside className="sidebar">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <main className="main-content">
          <div className="content-section">
            <h2 className="section-title">
              {MENU_ITEMS.find(i => i.id === activeMenu)?.label}
            </h2>
            
            {activeMenu === 'summary' ? renderSummaryDashboard() : renderResourceList()}

            {/* Inspect Detail Card Panel */}
            {(detailedView || detailLoading || detailError) && (
              <div className="detail-view-card" style={{ marginTop: '2rem' }}>
                <div className="detail-view-header">
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '600' }}>데이터 무결성 검증 콘솔</h3>
                  {detailedView && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>요청 상태: 200 OK</span>}
                </div>
                {detailLoading && <div>텔레메트리 파라미터를 읽어오는 중...</div>}
                {detailError && <div className="alert alert-error">{detailError}</div>}
                {detailedView && (
                  <div>
                    <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div className="detail-info-row">
                        <span className="detail-label">호출 엔드포인트</span>
                        <span className="detail-value" style={{ fontFamily: 'monospace' }}>{detailedView.request}</span>
                      </div>
                      <div className="detail-info-row">
                        <span className="detail-label">현재 세션 권한</span>
                        <span className="detail-value">{detailedView.role}</span>
                      </div>
                      <div className="detail-info-row">
                        <span className="detail-label">조회 대상 리소스 ID</span>
                        <span className="detail-value">{detailedView.data?.id}</span>
                      </div>
                    </div>
                    
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>조회된 데이터 원본</h4>
                    <pre style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                      {JSON.stringify(detailedView.data, null, 2)}
                    </pre>
                    {detailedView.role === 'userA' && detailedView.response_owner === 'userB' && (
                      <button 
                        onClick={() => {
                          let errorDesc = "";
                          let bugNum = "";
                          const reqPath = detailedView.request || "";
                          
                          if (reqPath.includes('/exports/')) {
                            bugNum = "20";
                            errorDesc = "내보내기(Export) 기록 상세 조회 시 요청자의 소유권 검증 단계를 수행하지 않아, userA 계정 권한으로 타 사용자(userB)의 내보내기 ID 데이터를 그대로 로드하여 반환합니다.";
                          } else if (reqPath.includes('/imports/')) {
                            bugNum = "21";
                            errorDesc = "가져오기(Import) 기록 조회 시 소유자 확인이 배제되어, 타 사용자의 대량 데이터 등록 정보가 노출됩니다.";
                          } else if (reqPath.includes('/documents/')) {
                            bugNum = "22";
                            errorDesc = "문서(Document) 개별 조회 시 소유권 체크 분기가 없어, userA가 userB 소유의 기밀 문서 데이터를 200 응답으로 획득 가능합니다.";
                          } else if (reqPath.includes('/teams/')) {
                            bugNum = "23";
                            errorDesc = "팀(Team) 구성 조회 시 owner 필드 점검 로직 누락으로, 타사의 상세 소속원 및 팀 구성 정보를 무단 조회할 수 있습니다.";
                          } else if (reqPath.includes('/roles/')) {
                            bugNum = "24";
                            errorDesc = "역할(Role) 상세 룰 확인 시 검증이 배제되어, 타 사용자의 커스텀 권한 설계 사양을 탈취할 수 있습니다.";
                          } else if (reqPath.includes('/audit-logs/')) {
                            bugNum = "25";
                            errorDesc = "감사 로그(Audit Log) 세부 조회 시 소유권 차단 장치가 부족하여, 타 관리자의 활동 행적 및 IP 정보가 조회됩니다.";
                          } else if (reqPath.includes('/subscriptions/')) {
                            bugNum = "26";
                            errorDesc = "라이선스 구독(Subscription) 조회 시 세션 소유주 조회가 이루어지지 않아, 타 기업의 결제 조건 및 요금제 조건이 표시됩니다.";
                          } else if (reqPath.includes('/devices/')) {
                            bugNum = "27";
                            errorDesc = "디바이스(Device) 통제 정보 조회 시 검증 장치 누락으로, 타 기업의 OS 버전 및 물리적 기기 식별 정보를 읽을 수 있습니다.";
                          } else if (reqPath.includes('/api-keys/')) {
                            bugNum = "28";
                            errorDesc = "API 키 메타데이터 조회 시 접근 제어 부재로, 타 관리자의 토큰 사양 및 식별자 메타데이터를 수집할 수 있습니다.";
                          } else if (reqPath.includes('/webhooks/')) {
                            bugNum = "29";
                            errorDesc = "웹훅(Webhook) 엔드포인트 세부 사항 조회 시 검증 로직이 빠져, 타 기업의 전송지 URL 및 트리거 조건을 유출시킵니다.";
                          } else if (reqPath.includes('/jobs/')) {
                            bugNum = "30";
                            errorDesc = "백그라운드 작업(Job) 상태 확인 시 소유주 인증 절차가 없어, 타 워크스페이스의 태스크명 및 에러 텔레메트리 로그를 열람합니다.";
                          }
                          
                          alert(`[시스템 진단 및 오류 상세 검증]\n\n■ 식별 코드: Case #${bugNum}\n■ 발생 현상: 수평적 권한 상승 탐지\n■ 상세 원인:\n${errorDesc}`);
                        }}
                        style={{
                          marginTop: '1.25rem',
                          backgroundColor: '#f59e0b',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.75rem 1.25rem',
                          borderRadius: '6px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        의도한 오류 확인 (진단 팝업)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="right-panel">
            <div className="panel-card">
              <h3 className="panel-card-title">데이터 직접 조회 서비스</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                기록 고유 식별코드를 입력하여 실시간 동기화 상태 및 토큰 명세를 즉시 수집합니다.
              </p>
              
              <form className="lookup-form" onSubmit={handleLookup}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>리포트 유형</label>
                  <select 
                    className="lookup-select" 
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="exports">Exports (데이터 내보내기)</option>
                    <option value="imports">Imports (데이터 가져오기)</option>
                    <option value="documents">Documents (공유 문서함)</option>
                    <option value="teams">Teams (팀 구성원)</option>
                    <option value="roles">Roles (역할 정책)</option>
                    <option value="audit-logs">Audit Logs (감사 로그)</option>
                    <option value="subscriptions">Subscriptions (구독 정책)</option>
                    <option value="devices">Devices (관리 기기)</option>
                    <option value="api-keys">API Keys (액세스 키)</option>
                    <option value="webhooks">Webhooks (웹훅 구성)</option>
                    <option value="jobs">Jobs (배치 작업)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>리소스 식별자 입력</label>
                  <input 
                    type="text" 
                    className="lookup-input" 
                    placeholder="예: exp-201, doc-201"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>검증 라우팅 상태</label>
                  <select 
                    className="lookup-select" 
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="vulnerable">직접 액세스 모드 (기본)</option>
                    {(searchCategory === 'exports' || searchCategory === 'documents') && (
                      <option value="safe">정책 체크 모드 (접근 제어 작동)</option>
                    )}
                  </select>
                </div>

                <button type="submit" className="lookup-btn">시스템 조회</button>
              </form>
            </div>

            <div className="panel-card">
              <h3 className="panel-card-title">실시간 관리 이벤트</h3>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>관리자 동기화 세션 작동 중.</li>
                <li>원격 텔레메트리 큐 대기 완료.</li>
                <li>식별자 데이터 라우터 로드 완료.</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
