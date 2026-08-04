import React, { useState, useEffect } from 'react';

const MENU_ITEMS = [
  { id: 'summary', label: '종합 모니터링 대시보드', category: '기본 정보' },
  { id: 'orders', label: '영업 주문 발주 내역', category: '영업/구매 관리' },
  { id: 'profile', label: '사원 기본 인사 프로필', category: '인사/공통 관리' },
  { id: 'reports', label: '자산 감가상각 결산서', category: '재무/회계 관리' },
  { id: 'invoices', label: '매출 세금 계산서', category: '재무/회계 관리' },
  { id: 'files', label: '부서별 보안 공유 대장', category: '인사/공통 관리' },
  { id: 'messages', label: '전사 기밀 지시 송수신', category: '인사/공통 관리' },
  { id: 'appointments', label: '주요 임원 면담 스케줄', category: '인사/공통 관리' },
  { id: 'cart', label: '네트워크 보안 장비 카트', category: '영업/구매 관리' },
  { id: 'checkout', label: '법인 정산 한도 체크아웃', category: '영업/구매 관리' }
];

export default function App() {
  const [activeMenu, setActiveMenu] = useState('summary');
  const [currentUser, setCurrentUser] = useState('user'); // admin or user
  const [users, setUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [listData, setListData] = useState([]);
  const [detailedView, setDetailedView] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Admin query console states
  const [adminCategory, setAdminCategory] = useState('orders');
  const [adminRoutingType, setAdminRoutingType] = useState('vulnerable');

  // Load session users on mount
  useEffect(() => {
    fetch('/api/session/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('임직원 정보 로드 실패', err));
  }, []);

  // Fetch dashboard summary or standard user list
  useEffect(() => {
    setDetailedView(null);
    setDetailError(null);
    if (activeMenu === 'summary') {
      fetch('/api/me/summary')
        .then(res => res.json())
        .then(data => setDashboardData(data))
        .catch(err => console.error('대시보드 리포트 수집 에러', err));
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
        .catch(err => console.error(`${activeMenu} 텔레메트리 연동 실패`, err));
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
      .catch(err => console.error('세션 사용자 변환 실패', err));
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
          throw new Error(body.error || '권한 승인이 거부되었습니다 (Access Denied).');
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
    if (!dashboardData) return <div>ERP 모니터링 데이터 분석 중...</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="kpi-row">
          <div className="kpi-card">
            <span className="kpi-label">인프라 접속자</span>
            <span className="kpi-val">{dashboardData.user?.name}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>소속: {dashboardData.user?.department}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">개인 상생 내역</span>
            <span className="kpi-val">{dashboardData.ordersCount} 건</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">결산 보고서 연동</span>
            <span className="kpi-val">{dashboardData.reportsCount} 건</span>
          </div>
        </div>

        <div className="erp-grid-card">
          <div className="erp-grid-header">
            <span>ERP 텔레메트리 서버 알림</span>
          </div>
          <div style={{ padding: '16px', lineHeight: '1.6', fontSize: '12.5px' }}>
            본 모니터링 솔루션은 전사적 자원 관리 포털의 통계 및 권한 체계를 대조 확인하기 위한 관리 콘솔입니다. 
            좌측 메뉴를 통하여 실시간 권한 데이터를 대조 검증하고 우측 설정에 따라 최고관리자 API 무결성을 점검하십시오.
          </div>
        </div>
      </div>
    );
  };

  const renderResourceList = () => {
    if (!listData || listData.length === 0) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
          등록된 자원 정보가 비어 있습니다.
        </div>
      );
    }

    const currentMenu = MENU_ITEMS.find(m => m.id === activeMenu);

    return (
      <div className="erp-grid-card">
        <div className="erp-grid-header">
          <span>{currentMenu?.label} - 전사 전송 레코드 목록</span>
        </div>
        <table className="erp-table">
          <thead>
            <tr>
              <th>기록 코드 ID</th>
              <th>세부 자원 명세</th>
              <th>현 상태</th>
              <th>조회 작업</th>
            </tr>
          </thead>
          <tbody>
            {listData.map((item, idx) => {
              if (!item) return null;
              
              // Define dynamic text summaries
              let details = "";
              if (item.item) details = `품목: ${item.item} (합계: ${item.total || '0'})`;
              else if (item.email) details = `이메일: ${item.email} (직책: ${item.duty || ''})`;
              else if (item.name) details = `보고서: ${item.name} (등록일: ${item.generatedDate || ''})`;
              else if (item.amount) details = `청구액: ${item.amount} (${item.billingPeriod || ''})`;
              else if (item.filename) details = `파일명: ${item.filename} (크기: ${item.size || ''})`;
              else if (item.subject) details = `메일 제목: ${item.subject} (발신: ${item.sender || ''})`;
              else if (item.time) details = `일정: ${item.time} (유형: ${item.type || ''})`;
              else if (item.items) details = `발주 품목: ${item.items.map(i => i.name).join(', ')}`;
              else if (item.estimatedDelivery) details = `배송 예정: ${item.estimatedDelivery}`;

              return (
                <tr key={item.id || idx}>
                  <td style={{ fontWeight: '750', fontFamily: 'monospace' }}>{item.id}</td>
                  <td>{details}</td>
                  <td>
                    <span className={`card-status ${item.status === '배송 완료' || item.status === '승인 완료' || item.status === '결제 완료' || item.status === '최종 결재 완료' || item.status === '일정 확인됨' ? 'status-active' : 'status-pending'}`}>
                      {item.status || '대기'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-btn"
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
                              request: `/api/me/${activeMenu}`,
                              status: 200,
                              protected_data: matchItem
                            });
                          })
                          .catch(err => setDetailError(err.message))
                          .finally(() => setDetailLoading(false));
                      }}
                    >
                      상세 정보 확인
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
      <header className="gnb">
        <div className="gnb-left">
          <div className="gnb-logo">DOUZONE</div>
          <div className="gnb-system-name">전사 ERP 관리 포털 v4.8</div>
        </div>
        <div className="gnb-right">
          <div className="session-info">
            <div className="user-indicator"></div>
            <span>로그인: <strong>{currentUser === 'admin' ? '김형석 실장' : '정지원 대리'}</strong></span>
            <span className={`session-role ${currentUser === 'admin' ? 'role-admin' : 'role-user'}`}>
              {currentUser === 'admin' ? 'admin' : 'user'}
            </span>
          </div>
          <select 
            className="switch-select" 
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
        <aside className="lnb">
          {/* Categorize menus */}
          {['기본 정보', '영업/구매 관리', '인사/공통 관리', '재무/회계 관리'].map((category) => (
            <React.Fragment key={category}>
              <div className="sidebar-category">{category}</div>
              {MENU_ITEMS.filter(m => m.category === category).map((item) => (
                <button
                  key={item.id}
                  className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </aside>

        <main className="main-workspace">
          <div className="content-area">
            <div className="content-header">
              <h2 className="content-title">
                {MENU_ITEMS.find(i => i.id === activeMenu)?.label}
              </h2>
            </div>
            
            {activeMenu === 'summary' ? renderSummaryDashboard() : renderResourceList()}

            {/* Inspect Detail Card Panel */}
            {(detailedView || detailLoading || detailError) && (
              <div className="detail-panel">
                <div className="detail-view-header">
                  <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>통합 인프라 데이터 조회 결과</h3>
                  {detailedView && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>통신 상태: 200 OK</span>}
                </div>
                {detailLoading && <div style={{ padding: '10px 0' }}>동기화 파라미터를 판독하는 중...</div>}
                {detailError && <div className="alert alert-error" style={{ marginTop: '10px' }}>{detailError}</div>}
                {detailedView && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'grid', gap: '4px', marginBottom: '12px' }}>
                      <div className="detail-row">
                        <span className="detail-label">호출 API 엔드포인트</span>
                        <span className="detail-val" style={{ fontFamily: 'monospace' }}>{detailedView.request}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">호출자 권한 레벨 (Role)</span>
                        <span className="detail-val">{detailedView.role}</span>
                      </div>
                    </div>
                    
                    <span className="form-label" style={{ display: 'block', marginTop: '10px' }}>조회된 데이터 로그 (Raw JSON)</span>
                    <pre className="code-pre">
                      {JSON.stringify(detailedView.protected_data, null, 2)}
                    </pre>

                    {/* Verification diagnostics button (Disguised as Sync Verification) */}
                    {detailedView.role === 'user' && detailedView.request.startsWith('/api/admin/') && (
                      <button 
                        className="diagnose-btn"
                        onClick={() => {
                          let errorDesc = "";
                          let bugNum = "";
                          const reqPath = detailedView.request || "";
                          
                          if (reqPath.includes('/admin/orders')) {
                            bugNum = "31";
                            errorDesc = "관리자 Orders API에서 세션의 역할이 admin인지 확인하지 않고 데이터를 반환하여, 일반 사용자 권한으로 전사 보안 발주 정보 누출을 초래합니다.";
                          } else if (reqPath.includes('/admin/profile')) {
                            bugNum = "32";
                            errorDesc = "관리자 전용 Profile API에서 권한 검증이 우회되어 최고관리자의 민감한 연락처 및 직무 세부 명세를 취득할 수 있습니다.";
                          } else if (reqPath.includes('/admin/reports')) {
                            bugNum = "33";
                            errorDesc = "관리자 결산 보고서(Reports) API에 대한 권한 필터가 배제되어 일반 임직원이 전사 서버 유지보수 및 자산 감가상각 평가 내역을 열람하게 됩니다.";
                          } else if (reqPath.includes('/admin/invoices')) {
                            bugNum = "34";
                            errorDesc = "관리자 전용 매출 청구서(Invoices) 통제 로직 미비로 최고 등급 법인 정산 및 매출액 인보이스 명세가 무단 방출됩니다.";
                          } else if (reqPath.includes('/admin/files')) {
                            bugNum = "35";
                            errorDesc = "관리자용 첨부파일(Files) 보관함 접근 제어가 누락되어 사내 출입 통제 보안 문서 및 개인정보 파기 내역 목록을 확보할 수 있습니다.";
                          } else if (reqPath.includes('/admin/messages')) {
                            bugNum = "36";
                            errorDesc = "최고경영자/관리자 수신 메일(Messages) 호출 경로의 인증 세션 판단 필터가 누락되어 대표이사의 지시사항 원본을 탈취당합니다.";
                          } else if (reqPath.includes('/admin/appointments')) {
                            bugNum = "37";
                            errorDesc = "관리자 전용 면담/회의(Appointments) 관리자 API 통제 장치 누락으로 사내 중요 기밀 파트너 미팅 사양이 일반 사원에게 방출됩니다.";
                          } else if (reqPath.includes('/admin/cart')) {
                            bugNum = "38";
                            errorDesc = "관리자 전용 비품 발주 카트(Cart) 검증 필터 누락으로 보안 L3 스위칭 허브 및 전사용 네트워크 장비 예비 구매 명세를 볼 수 있습니다.";
                          } else if (reqPath.includes('/admin/checkout')) {
                            bugNum = "39";
                            errorDesc = "관리자 승인 대기 체크아웃(Checkout) API에 접근 제어가 적용되지 않아 관리자 등급의 결제 한도 및 프로세스 상황이 노출됩니다.";
                          }
                          
                          alert(`[ERP 권한 관리 진단 로그]\n\n■ 버그 ID: site004-bug0${bugNum.substring(1)}\n■ 대응 코드: SEC-0${bugNum}\n■ 오류 유형: 수직적 권한 상승\n■ 세부 분석:\n${errorDesc}`);
                        }}
                      >
                        데이터 동기화 무결성 분석
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="right-sidebar">
            <div className="control-card">
              <h3 className="control-title">시스템 관리자 도구</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                전사 인프라 모니터링 환경에서 특정 보안 통제 영역의 데이터 동기화 동작을 수행합니다.
              </p>
              
              <form className="lookup-form" onSubmit={triggerAdminApi}>
                <div>
                  <div className="form-label">모니터링 카테고리</div>
                  <select 
                    className="control-select" 
                    value={adminCategory}
                    onChange={(e) => setAdminCategory(e.target.value)}
                  >
                    <option value="orders">Orders (전사 발주 대장)</option>
                    <option value="profile">Profile (관리자 권한 정보)</option>
                    <option value="reports">Reports (결산 재무 보고서)</option>
                    <option value="invoices">Invoices (매출 정산 대장)</option>
                    <option value="files">Files (출입 보안 통제 대장)</option>
                    <option value="messages">Messages (지시사항 수신함)</option>
                    <option value="appointments">Appointments (인프라 미팅 대기)</option>
                    <option value="cart">Cart (전사 네트워크 장비 카트)</option>
                    <option value="checkout">Checkout (법인 한도 승인 대기)</option>
                  </select>
                </div>

                <div>
                  <div className="form-label">동기화 전송 정책</div>
                  <select 
                    className="control-select" 
                    value={adminRoutingType}
                    onChange={(e) => setAdminRoutingType(e.target.value)}
                  >
                    <option value="vulnerable">직접 호출 모드 (동기화 즉시 수행)</option>
                    {(adminCategory === 'orders' || adminCategory === 'reports') && (
                      <option value="safe">보안 필터 모드 (권한 필터 검증)</option>
                    )}
                  </select>
                </div>

                <button type="submit" className="control-btn">데이터 동기화 실행</button>
              </form>
            </div>

            <div className="control-card">
              <h3 className="control-title">실시간 분석 로그</h3>
              <ul style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>보안 동기화 데몬 정상 구동</li>
                <li>GNB 세션 필터 상태: 로드 완료</li>
                <li>ERP 데이터 라우팅 준비</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
