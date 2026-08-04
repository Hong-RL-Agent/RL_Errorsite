import React, { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: '홈 / 종합 안내' },
  { id: 'orders', label: '모바일 처방전 조회' },
  { id: 'profile', label: '마이페이지 / 내 정보' },
  { id: 'reports', label: '진료/검사 결과지' },
  { id: 'invoices', label: '진료비 수납 영수증' },
  { id: 'files', label: '제증명 서류 다운로드' },
  { id: 'messages', label: '의료진 1:1 상담함' },
  { id: 'appointments', label: '진료 예약 현황' },
  { id: 'cart', label: '처방 의약품 담기' },
  { id: 'checkout', label: '진료비 결제 대기' },
  { id: 'search', label: '진료과/의료진 검색' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState('doctor'); // admin, doctor(환자 본인), nurse(보호자)
  const [sessions, setSessions] = useState({});
  const [dbPermissions, setDbPermissions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // API Fetch Results
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [lastRequestInfo, setLastRequestInfo] = useState(null);

  // Modal / Normal feature state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [questionnaireStatus, setQuestionnaireStatus] = useState('');

  // Load session metadata and permissions
  const fetchStatus = () => {
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => {
        setSessions(data.sessions);
        setDbPermissions(data.permissions);
      })
      .catch(err => console.error('Failed to sync system status', err));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Fetch target resource based on tab & active user session
  const fetchResource = (tabName) => {
    setApiLoading(true);
    setApiData(null);
    setApiError(null);

    const sessionId = sessions[currentUser];
    const headers = sessionId ? { 'x-session-id': sessionId } : {};
    
    let url = `/api/${tabName}`;
    if (tabName === 'search') {
      url += `?q=${encodeURIComponent(searchQuery || '')}`;
    }

    fetch(url, { headers })
      .then(async res => {
        const body = await res.json();
        setLastRequestInfo({
          endpoint: url,
          status: res.status,
          sessionId: sessionId || 'None',
          role: currentUser
        });
        if (!res.ok) {
          throw new Error(body.error || '조회 권한이 없거나 제한된 정보입니다.');
        }
        return body;
      })
      .then(data => {
        setApiData(data.data || data);
      })
      .catch(err => {
        setApiError(err.message);
      })
      .finally(() => {
        setApiLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      fetchResource(activeTab);
    }
  }, [activeTab, currentUser]);

  // Handle session identity changes
  const handleUserChange = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    setApiData(null);
    setApiError(null);
    setLastRequestInfo(null);
  };

  // Toggle database permission (Admin action)
  const handlePermissionToggle = (role, resource) => {
    const currentState = dbPermissions[role]?.[resource];
    const newState = !currentState;

    fetch('/api/admin/toggle-permission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, resource, state: newState })
    })
      .then(res => res.json())
      .then(() => {
        fetchStatus();
      })
      .catch(err => console.error('Error toggling permission', err));
  };

  // Synchronize local workspace session cache
  const handleSyncSessionCache = (role) => {
    const sessionId = sessions[role];
    fetch('/api/system/sync-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    })
      .then(res => res.json())
      .then(() => {
        fetchStatus();
        alert(`인증 세션 정보가 최신 원내 정보와 동기화되었습니다.`);
      })
      .catch(err => console.error('Failed to sync session cache', err));
  };

  // Check if permission drift occurred for the current resource
  const isDrifted = () => {
    if (currentUser === 'admin' || !activeTab || activeTab === 'dashboard') return false;
    const livePerm = dbPermissions[currentUser]?.[activeTab];
    return livePerm === false && lastRequestInfo?.status === 200 && apiData !== null;
  };

  // Trigger the Korean detailed diagnostics alert popup
  const triggerDiagnosticAlert = (actionName) => {
    // If drift is not active, show safe system verification popup
    if (!isDrifted()) {
      alert(`[안내] ${actionName} 작업이 정상적으로 수행되었습니다.`);
      return;
    }

    let bugNum = "";
    let errorDesc = "";
    const activeTabName = activeTab;

    if (activeTabName === 'orders') {
      bugNum = "61";
      errorDesc = "처방 오더(Orders) 조회 권한이 회수되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어 처방 오더 데이터가 계속 조회되고 의뢰 조작이 가능합니다.";
    } else if (activeTabName === 'profile') {
      bugNum = "62";
      errorDesc = "프로필(Profile) 조회 권한이 회수되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어 프로필 정보 수정 및 재설정 조작이 가능합니다.";
    } else if (activeTabName === 'reports') {
      bugNum = "63";
      errorDesc = "보고서(Reports) 조회 권한이 회수되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어 결과지 PDF 파일 출력 조작이 가능합니다.";
    } else if (activeTabName === 'invoices') {
      bugNum = "64";
      errorDesc = "청구서(Invoices) 조회 권한이 회수되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어 영수증 데이터 모바일 발급 및 출력이 가능합니다.";
    } else if (activeTabName === 'files') {
      bugNum = "65";
      errorDesc = "임상 파일(Files) 조회 권한이 회수되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어 진단서 및 첨부 서류 파일 다운로드가 가능합니다.";
    } else if (activeTabName === 'messages') {
      bugNum = "66";
      errorDesc = "협진 메시지(Messages) 조회 권한이 회수되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어 상담 완료 처리 및 조회 조작이 가능합니다.";
    } else if (activeTabName === 'appointments') {
      bugNum = "67";
      errorDesc = "진료 예약(Appointments) 조회 권한이 회수되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어 일정 캘린더 등록 조작이 가능합니다.";
    } else if (activeTabName === 'cart') {
      bugNum = "68";
      errorDesc = "약품 카트(Cart) 조회 권한이 회수되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어 처방약 장바구니 담기 및 전송 조작이 가능합니다.";
    } else if (activeTabName === 'checkout') {
      bugNum = "69";
      errorDesc = "환자 수납(Checkout) 조회 권한이 회수되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어 즉시 결제 처리 조작이 가능합니다.";
    } else if (activeTabName === 'search') {
      bugNum = "70";
      errorDesc = "환자 검색(Search) 조회 권한이 회수되었음에도 불구하고, 이미 발급된 기존 세션이 서버 메모리에 갱신되지 않고 남아있어 의료진에 대한 예약 신청 조작이 가능합니다.";
    }

    const bugIndexMap = {
      "61": "01",
      "62": "02",
      "63": "03",
      "64": "04",
      "65": "05",
      "66": "06",
      "67": "07",
      "68": "08",
      "69": "09",
      "70": "10"
    };

    const formattedBugId = `site007-bug${bugIndexMap[bugNum] || "01"}`;
    alert(`[세인트쥬드 병원 개인정보 보호오류 점검]\n\n■ 식별 코드: ${formattedBugId}\n■ 대응 분류: SEC-0${bugNum}\n■ 발생 현상: 권한 변경 후 이전 권한 재사용 (Permission Drift)\n■ 상세 원인 및 분석:\n${errorDesc}`);
  };

  const getVerificationButtonLabel = () => {
    switch (activeTab) {
      case 'orders': return '조제 의뢰 전송';
      case 'profile': return '비밀번호 재설정';
      case 'reports': return '결과지 PDF 저장';
      case 'invoices': return '영수증 모바일 출력';
      case 'files': return '진단서 파일 다운로드';
      case 'messages': return '상담 완료 확정';
      case 'appointments': return '예약 일정 캘린더 등록';
      case 'cart': return '처방약 장바구니 담기';
      case 'checkout': return '진료비 즉시 수납 결제';
      case 'search': return '진료 예약하기';
      default: return '데이터 확인 및 승인';
    }
  };

  const renderDataList = () => {
    if (!apiData) return null;

    if (activeTab === 'profile') {
      return (
        <div style={{ display: 'grid', gap: '12px', padding: '10px 0' }}>
          <div><strong>기관 명칭:</strong> {apiData.name}</div>
          <div><strong>등록 라이센스 코드:</strong> {apiData.license}</div>
          <div><strong>소재지:</strong> {apiData.address}</div>
          <div><strong>진료 과목:</strong> {Array.isArray(apiData.departments) ? apiData.departments.join(', ') : ''}</div>
        </div>
      );
    }

    if (Array.isArray(apiData)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          {apiData.map((item, idx) => (
            <div key={item.id || idx} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>
                기록 번호: {item.id}
              </div>
              
              {activeTab === 'orders' && (
                <div style={{ display: 'grid', gap: '4px', fontSize: '13px' }}>
                  <div><strong>수령 환자명:</strong> {item.patient}</div>
                  <div><strong>처방 의약품:</strong> {item.drug}</div>
                  <div><strong>처방 수량:</strong> {item.qty}</div>
                  <div><strong>처방 일자:</strong> {item.date}</div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div style={{ display: 'grid', gap: '4px', fontSize: '13px' }}>
                  <div><strong>보고서 제목:</strong> {item.title}</div>
                  <div><strong>검사 일자:</strong> {item.date}</div>
                  <div><strong>판독 진행 상태:</strong> {item.status}</div>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div style={{ display: 'grid', gap: '4px', fontSize: '13px' }}>
                  <div><strong>공제 청구 기관:</strong> {item.debtor}</div>
                  <div><strong>청구액:</strong> {item.amount}</div>
                  <div><strong>청구 승인 상태:</strong> {item.status}</div>
                </div>
              )}

              {activeTab === 'files' && (
                <div style={{ display: 'grid', gap: '4px', fontSize: '13px' }}>
                  <div><strong>디지털 파일명:</strong> {item.filename}</div>
                  <div><strong>용량:</strong> {item.size}</div>
                  <div><strong>등록 일시:</strong> {item.uploadDate}</div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div style={{ display: 'grid', gap: '4px', fontSize: '13px' }}>
                  <div><strong>발신 의료진:</strong> {item.sender}</div>
                  <div><strong>상담 및 메시지 내용:</strong> {item.content}</div>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div style={{ display: 'grid', gap: '4px', fontSize: '13px' }}>
                  <div><strong>예약자명:</strong> {item.patient}</div>
                  <div><strong>예약 시간:</strong> {item.time}</div>
                  <div><strong>배정 의료진:</strong> {item.doc}</div>
                  <div><strong>예약 진료실:</strong> {item.room}</div>
                </div>
              )}

              {activeTab === 'cart' && (
                <div style={{ display: 'grid', gap: '4px', fontSize: '13px' }}>
                  <div><strong>요청 처방약품:</strong> {item.item}</div>
                  <div><strong>요청 수량:</strong> {item.qty}</div>
                  <div><strong>준비 상태:</strong> {item.status}</div>
                </div>
              )}

              {activeTab === 'checkout' && (
                <div style={{ display: 'grid', gap: '4px', fontSize: '13px' }}>
                  <div><strong>보험 청구 아이디:</strong> {item.claimId}</div>
                  <div><strong>진료 청구 총액:</strong> {item.total}</div>
                  <div><strong>본인 부담금액:</strong> {item.copay}</div>
                  <div><strong>결제 방식:</strong> {item.method}</div>
                </div>
              )}

              {activeTab === 'search' && (
                <div style={{ display: 'grid', gap: '4px', fontSize: '13px' }}>
                  <div><strong>의료진 성명:</strong> {item.name}</div>
                  <div><strong>연령:</strong> {item.age}세</div>
                  <div><strong>주요 진료분야:</strong> {item.diagnosis}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="workspace-container">
      {/* Hospital Workspace Header */}
      <header className="emr-header">
        <div className="brand-wrapper">
          <div className="brand-icon">✚</div>
          <span className="brand-title">세인트쥬드 대학병원 모바일 환자 포털</span>
        </div>
        
        <div className="session-controls">
          <div className="session-indicator">
            <div className="dot-active"></div>
            <span>로그인 연결됨</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>계정 전환:</span>
            <select 
              className="user-select" 
              value={currentUser} 
              onChange={(e) => handleUserChange(e.target.value)}
            >
              <option value="doctor">환자 본인 (그레고리 하우스)</option>
              <option value="nurse">대리인 / 가족 보호자 (재키 페이튼)</option>
              <option value="admin">전산실 원무 관리자</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="emr-body">
        {/* Navigation Sidebar */}
        <aside className="sidebar">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'search') {
                  setSearchQuery('');
                }
              }}
            >
              {item.id === 'dashboard' ? '🏠' : '📋'} {item.label}
            </button>
          ))}
        </aside>

        {/* Dashboard Workspace */}
        <main className="main-dashboard">
          <div className="content-wrapper">
            <h2 className="content-title">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h2>

            {activeTab === 'dashboard' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Visual Medical Dashboard widgets */}
                <div className="dashboard-grid">
                  <div className="card">
                    <span className="card-tag">외래 정보</span>
                    <h3>나의 예약</h3>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>1건</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>내과 진료 대기 중</span>
                  </div>
                  <div className="card">
                    <span className="card-tag">보관함</span>
                    <h3>새 메시지</h3>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>2건</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>처방전 및 보관 알림</span>
                  </div>
                  <div className="card">
                    <span className="card-tag">수납 관리</span>
                    <h3>결제 대기</h3>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>1건</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>진료비 총액 수납 처리 전</span>
                  </div>
                </div>

                {/* Normal Patient Actions (User Friendly Features) */}
                <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="card" style={{ cursor: 'pointer' }} onClick={() => setShowScheduleModal(true)}>
                    <span className="card-tag">외래 정보 서비스</span>
                    <h3>의료진 외래 진료 시간표</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      각 진료과별 전문의의 요일별 진료 계획 및 공지 일정을 확인합니다.
                    </p>
                  </div>

                  <div className="card" style={{ cursor: 'pointer' }} onClick={() => setShowQuestionnaireModal(true)}>
                    <span className="card-tag">편의 서비스</span>
                    <h3>자가 사전 문진표 작성</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      병원 내원 전에 미리 간단한 증상 문진을 모바일로 기재해 접수 속도를 높입니다.
                    </p>
                  </div>
                </div>

                <div className="card" style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    환자 포털 서비스 안내
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <p>언제 어디서든 모바일 기기로 진료 예약, 처방 오더 확인, 영수증 다운로드, 비대면 상담 업무를 편리하게 보실 수 있는 공간입니다.</p>
                    <p>원하는 업무 메뉴를 왼쪽의 메뉴바에서 클릭하면 상세 내역을 실시간으로 안전하게 조회할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Search Bar for Search tab */}
                {activeTab === 'search' && (
                  <div className="card">
                    <span className="card-tag">병원 조회</span>
                    <h3>진료과 및 의료진 검색</h3>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <input 
                        type="text" 
                        className="user-select" 
                        style={{ flex: 1 }}
                        placeholder="검색할 의사 성명 또는 진료 과목을 입력하세요..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button className="card-btn" style={{ width: '120px' }} onClick={() => fetchResource('search')}>
                        의료진 검색
                      </button>
                    </div>
                  </div>
                )}

                {/* API Presentation Space */}
                {apiLoading && <div className="alert-box info">정보를 불러오고 있습니다...</div>}
                
                {apiError && (
                  <div className="alert-box danger">
                    <strong>조회 불가능:</strong> {apiError}
                  </div>
                )}

                {(apiData || apiError === null) && activeTab !== 'dashboard' && (
                  <div className="card">
                    <span className="card-tag">업무 서비스 실행</span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        필요하신 업무 기능 단추를 클릭해 모바일 포털 서비스를 실행해 주십시오.
                      </p>
                      
                      <button 
                        className="card-btn"
                        style={{ width: 'auto', alignSelf: 'flex-start', padding: '8px 20px', backgroundColor: '#008080' }}
                        onClick={() => triggerDiagnosticAlert(getVerificationButtonLabel())}
                      >
                        {getVerificationButtonLabel()}
                      </button>
                    </div>

                    <div className="card-content">
                      {renderDataList()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom Time Schedule Modal (Normal Patient Action) */}
            {showScheduleModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="card" style={{ width: '480px', padding: '24px', backgroundColor: '#fff' }}>
                  <h3>📅 원내 전문의 요일별 진료 안내</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>진료 부서</th>
                        <th style={{ padding: '8px' }}>담당 의료진</th>
                        <th style={{ padding: '8px' }}>진료 시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px' }}>소아청소년과</td>
                        <td style={{ padding: '8px' }}>김민지 교수</td>
                        <td style={{ padding: '8px' }}>월/수/금 오전</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px' }}>순환기내과</td>
                        <td style={{ padding: '8px' }}>박지성 교수</td>
                        <td style={{ padding: '8px' }}>화/목 전일</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px' }}>정형외과</td>
                        <td style={{ padding: '8px' }}>하우스 교수</td>
                        <td style={{ padding: '8px' }}>금요일 전일</td>
                      </tr>
                    </tbody>
                  </table>
                  <button className="card-btn" style={{ marginTop: '20px' }} onClick={() => setShowScheduleModal(false)}>창 닫기</button>
                </div>
              </div>
            )}

            {/* Custom Questionnaire Modal (Normal Patient Action) */}
            {showQuestionnaireModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="card" style={{ width: '480px', padding: '24px', backgroundColor: '#fff' }}>
                  <h3>📝 사전 모바일 문진표 작성</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>오늘 내원하시는 사유와 증상을 간단히 기재해 주세요.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    <label style={{ fontSize: '13px' }}>1. 현재 겪고 계신 주요 통증 부위는 어디인가요?</label>
                    <input type="text" className="user-select" placeholder="예: 무릎, 어깨, 두통 등" />
                    
                    <label style={{ fontSize: '13px' }}>2. 통증이 지속된 기간은 얼마나 되시나요?</label>
                    <input type="text" className="user-select" placeholder="예: 3일전부터, 1주일 등" />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="card-btn" onClick={() => {
                      setQuestionnaireStatus('작성이 성공적으로 접수되었습니다. 원내 데스크에서 말씀해 주십시오.');
                      setShowQuestionnaireModal(false);
                      alert('자가 문진 정보가 병원 전산망에 정상 접수되었습니다.');
                    }}>문진표 제출</button>
                    <button className="card-btn" style={{ backgroundColor: '#aaa' }} onClick={() => setShowQuestionnaireModal(false)}>취소</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar configuration panel */}
          <aside className="right-sidebar">
            {/* System settings and security console */}
            <div className="panel">
              <h3 className="panel-title">본인 정보 보안 연동</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px' }}>
                가족 보호자 권한이나 회원 정보가 수정되었을 때 실시간으로 기기 보안 인증 정보를 갱신합니다.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="card-btn" onClick={() => handleSyncSessionCache('doctor')}>
                  환자 본인 세션 캐시 동기화
                </button>
                <button className="card-btn" onClick={() => handleSyncSessionCache('nurse')}>
                  보호자 대리인 세션 캐시 동기화
                </button>
              </div>
            </div>

            {/* Admin authority mapping portal */}
            {currentUser === 'admin' && (
              <div className="panel">
                <h3 className="panel-title">전산실 데이터 조회 차단 설정</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px' }}>
                  환자 및 대리인의 동의 철회 여부에 맞춰 정보 열람 권한을 통제합니다. (접근 차단 테스트용 토글)
                </p>

                {['doctor', 'nurse'].map(role => (
                  <div key={role} style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      {role === 'doctor' ? '환자 본인 (Gregory House) 권한' : '보호자 대리인 (Jackie Peyton) 권한'}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                      {NAV_ITEMS.filter(n => n.id !== 'dashboard').map(res => {
                        const hasPerm = dbPermissions[role]?.[res.id];
                        return (
                          <div key={res.id} className="permission-toggle-row">
                            <span>{res.label} 허용</span>
                            <button 
                              className={`toggle-switch ${hasPerm ? 'on' : ''}`}
                              onClick={() => handlePermissionToggle(role, res.id)}
                            >
                              <div className="toggle-handle"></div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}
