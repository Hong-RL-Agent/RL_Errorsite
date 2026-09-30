import React, { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: '홈 / 안내' },
  { id: 'notifications', label: '공지사항' },
  { id: 'payments', label: '결제내역' },
  { id: 'shipping', label: '교재배송' },
  { id: 'returns', label: '환불신청' },
  { id: 'reviews', label: '강의수강평' },
  { id: 'coupons', label: '쿠폰함' },
  { id: 'wishlist', label: '위시리스트' },
  { id: 'support', label: '1:1문의' },
  { id: 'analytics', label: '학습분석' },
  { id: 'exports', label: '보고서출력' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState('student'); // admin, instructor, student
  const [sessions, setSessions] = useState({});
  const [dbPermissions, setDbPermissions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Local state for CRUD
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [shipping, setShipping] = useState([]);
  const [returns, setReturns] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [support, setSupport] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [exportsData, setExportsData] = useState([]);

  // Form states for creating/editing
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [editingId, setEditingId] = useState(null);
  
  // API loading states
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [lastRequestInfo, setLastRequestInfo] = useState(null);

  // Modal states for normal features
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);

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
    setApiError(null);

    const sessionId = sessions[currentUser];
    const headers = sessionId ? { 'x-session-id': sessionId } : {};
    
    const url = `/api/${tabName}`;
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
          throw new Error(body.error || '조회 권한이 없거나 제한된 기능입니다.');
        }
        return body;
      })
      .then(data => {
        const list = data.data || data;
        if (tabName === 'notifications') setNotifications(list);
        else if (tabName === 'payments') setPayments(list);
        else if (tabName === 'shipping') setShipping(list);
        else if (tabName === 'returns') setReturns(list);
        else if (tabName === 'reviews') setReviews(list);
        else if (tabName === 'coupons') setCoupons(list);
        else if (tabName === 'wishlist') setWishlist(list);
        else if (tabName === 'support') setSupport(list);
        else if (tabName === 'analytics') setAnalytics(list);
        else if (tabName === 'exports') setExportsData(list);
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
      // Reset forms
      setNewTitle('');
      setNewContent('');
      setEditingId(null);
    }
  }, [activeTab, currentUser]);

  // Handle session identity changes
  const handleUserChange = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
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
        alert(`세션 정보가 정상적으로 동기화되었습니다.`);
      })
      .catch(err => console.error('Failed to sync session cache', err));
  };

  // Check if permission drift occurred for the current resource
  const isDrifted = () => {
    if (currentUser === 'admin' || !activeTab || activeTab === 'dashboard') return false;
    const livePerm = dbPermissions[currentUser]?.[activeTab];
    return livePerm === false && lastRequestInfo?.status === 200;
  };

  // Trigger the Korean detailed diagnostics alert popup
  const triggerDiagnosticAlert = (actionName) => {
    if (!isDrifted()) {
      alert(`[안내] ${actionName} 작업이 완료되었습니다.`);
      return true;
    }

    let bugNum = "";
    let errorDesc = "";
    const activeTabName = activeTab;

    if (activeTabName === 'notifications') {
      bugNum = "71";
      errorDesc = "수강 공지 정보 권한이 회수되었음에도 불구하고, 세션 권한 캐시가 동기화되지 않아 기존 세션으로 알림 조작이 계속 수행됩니다.";
    } else if (activeTabName === 'payments') {
      bugNum = "72";
      errorDesc = "학습 결제 정보 권한이 회수되었음에도 불구하고, 세션 권한 캐시가 동기화되지 않아 기존 세션으로 영수증 출력 조작이 계속 수행됩니다.";
    } else if (activeTabName === 'shipping') {
      bugNum = "73";
      errorDesc = "교재 배송 정보 권한이 회수되었음에도 불구하고, 세션 권한 캐시가 동기화되지 않아 기존 세션으로 배송 추적 조작이 계속 수행됩니다.";
    } else if (activeTabName === 'returns') {
      bugNum = "74";
      errorDesc = "수강 환불 권한이 회수되었음에도 불구하고, 세션 권한 캐시가 동기화되지 않아 기존 세션으로 환불 신청서 제출 조작이 계속 수행됩니다.";
    } else if (activeTabName === 'reviews') {
      bugNum = "75";
      errorDesc = "수강평 작성 권한이 회수되었음에도 불구하고, 세션 권한 캐시가 동기화되지 않아 기존 세션으로 수강평 등록 조작이 계속 수행됩니다.";
    } else if (activeTabName === 'coupons') {
      bugNum = "76";
      errorDesc = "할인 쿠폰 권한이 회수되었음에도 불구하고, 세션 권한 캐시가 동기화되지 않아 기존 세션으로 쿠폰 발급 조작이 계속 수행됩니다.";
    } else if (activeTabName === 'wishlist') {
      bugNum = "77";
      errorDesc = "위시리스트 권한이 회수되었음에도 불구하고, 세션 권한 캐시가 동기화되지 않아 기존 세션으로 위시리스트 추가 조작이 계속 수행됩니다.";
    } else if (activeTabName === 'support') {
      bugNum = "78";
      errorDesc = "고객 센터 권한이 회수되었음에도 불구하고, 세션 권한 캐시가 동기화되지 않아 기존 세션으로 1:1 문의글 등록 조작이 계속 수행됩니다.";
    } else if (activeTabName === 'analytics') {
      bugNum = "79";
      errorDesc = "진도 통계 권한이 회수되었음에도 불구하고, 세션 권한 캐시가 동기화되지 않아 기존 세션으로 학습 통계 분석 조작이 계속 수행됩니다.";
    } else if (activeTabName === 'exports') {
      bugNum = "80";
      errorDesc = "보고서 내보내기 권한이 회수되었음에도 불구하고, 세션 권한 캐시가 동기화되지 않아 기존 세션으로 엑셀 다운로드 조작이 계속 수행됩니다.";
    }

    const bugIndexMap = {
      "71": "01",
      "72": "02",
      "73": "03",
      "74": "04",
      "75": "05",
      "76": "06",
      "77": "07",
      "78": "08",
      "79": "09",
      "80": "10"
    };

    const formattedBugId = `site008-bug${bugIndexMap[bugNum] || "01"}`;
    alert(`[에듀플러스 보안 무결성 점검]\n\n■ 식별 코드: ${formattedBugId}\n■ 대응 분류: SEC-0${bugNum}\n■ 발생 현상: 권한 변경 후 이전 권한 재사용 (Permission Drift)\n■ 상세 원인 및 분석:\n${errorDesc}`);
    return true;
  };

  // CRUD Implementations in React state (simulating LMS actions)
  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const actionSuccess = triggerDiagnosticAlert(`${NAV_ITEMS.find(n => n.id === activeTab)?.label} 등록`);
    if (!actionSuccess) return;

    const newRecord = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      time: new Date().toLocaleString(),
      sender: '사용자 작성',
      course: newTitle,
      amount: newContent || '₩0',
      date: new Date().toLocaleDateString(),
      book: newTitle,
      address: newContent || '지정되지 않음',
      status: '접수 완료',
      rating: newRating,
      comment: newContent,
      code: newTitle.toUpperCase(),
      discount: newContent || '10% 할인',
      expiry: '2026-12-31',
      level: '입문',
      price: newContent || '무료',
      subject: newTitle,
      question: newContent,
      week: newTitle,
      hours: parseFloat(newContent) || 0,
      progress: '작성 완료',
      filename: newTitle,
      format: newContent || 'PDF',
      created: new Date().toLocaleDateString()
    };

    if (activeTab === 'notifications') setNotifications([newRecord, ...notifications]);
    else if (activeTab === 'payments') setPayments([newRecord, ...payments]);
    else if (activeTab === 'shipping') setShipping([newRecord, ...shipping]);
    else if (activeTab === 'returns') setReturns([newRecord, ...returns]);
    else if (activeTab === 'reviews') setReviews([newRecord, ...reviews]);
    else if (activeTab === 'coupons') setCoupons([newRecord, ...coupons]);
    else if (activeTab === 'wishlist') setWishlist([newRecord, ...wishlist]);
    else if (activeTab === 'support') setSupport([newRecord, ...support]);
    else if (activeTab === 'analytics') setAnalytics([newRecord, ...analytics]);
    else if (activeTab === 'exports') setExportsData([newRecord, ...exportsData]);

    setNewTitle('');
    setNewContent('');
  };

  const handleEditInit = (item) => {
    setEditingId(item.id);
    setNewTitle(item.title || item.course || item.book || item.code || item.subject || item.week || item.filename || '');
    setNewContent(item.amount || item.address || item.comment || item.discount || item.price || item.question || item.hours || item.format || '');
    setNewRating(item.rating || 5);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const actionSuccess = triggerDiagnosticAlert(`${NAV_ITEMS.find(n => n.id === activeTab)?.label} 수정`);
    if (!actionSuccess) return;

    const mapper = (item) => {
      if (item.id === editingId) {
        return {
          ...item,
          title: newTitle,
          course: newTitle,
          book: newTitle,
          code: newTitle.toUpperCase(),
          subject: newTitle,
          week: newTitle,
          filename: newTitle,
          amount: newContent,
          address: newContent,
          comment: newContent,
          discount: newContent,
          price: newContent,
          question: newContent,
          hours: parseFloat(newContent) || 0,
          format: newContent,
          rating: newRating
        };
      }
      return item;
    };

    if (activeTab === 'notifications') setNotifications(notifications.map(mapper));
    else if (activeTab === 'payments') setPayments(payments.map(mapper));
    else if (activeTab === 'shipping') setShipping(shipping.map(mapper));
    else if (activeTab === 'returns') setReturns(returns.map(mapper));
    else if (activeTab === 'reviews') setReviews(reviews.map(mapper));
    else if (activeTab === 'coupons') setCoupons(coupons.map(mapper));
    else if (activeTab === 'wishlist') setWishlist(wishlist.map(mapper));
    else if (activeTab === 'support') setSupport(support.map(mapper));
    else if (activeTab === 'analytics') setAnalytics(analytics.map(mapper));
    else if (activeTab === 'exports') setExportsData(exportsData.map(mapper));

    setEditingId(null);
    setNewTitle('');
    setNewContent('');
  };

  const handleDelete = (id) => {
    const actionSuccess = triggerDiagnosticAlert(`${NAV_ITEMS.find(n => n.id === activeTab)?.label} 삭제`);
    if (!actionSuccess) return;

    if (activeTab === 'notifications') setNotifications(notifications.filter(i => i.id !== id));
    else if (activeTab === 'payments') setPayments(payments.filter(i => i.id !== id));
    else if (activeTab === 'shipping') setShipping(shipping.filter(i => i.id !== id));
    else if (activeTab === 'returns') setReturns(returns.filter(i => i.id !== id));
    else if (activeTab === 'reviews') setReviews(reviews.filter(i => i.id !== id));
    else if (activeTab === 'coupons') setCoupons(coupons.filter(i => i.id !== id));
    else if (activeTab === 'wishlist') setWishlist(wishlist.filter(i => i.id !== id));
    else if (activeTab === 'support') setSupport(support.filter(i => i.id !== id));
    else if (activeTab === 'analytics') setAnalytics(analytics.filter(i => i.id !== id));
    else if (activeTab === 'exports') setExportsData(exportsData.filter(i => i.id !== id));
  };

  const getCurrentList = () => {
    if (activeTab === 'notifications') return notifications;
    if (activeTab === 'payments') return payments;
    if (activeTab === 'shipping') return shipping;
    if (activeTab === 'returns') return returns;
    if (activeTab === 'reviews') return reviews;
    if (activeTab === 'coupons') return coupons;
    if (activeTab === 'wishlist') return wishlist;
    if (activeTab === 'support') return support;
    if (activeTab === 'analytics') return analytics;
    if (activeTab === 'exports') return exportsData;
    return [];
  };

  // Returns a contextual label for the submit button based on the active tab
  const getVerificationButtonLabel = () => {
    const labels = {
      notifications: '공지 등록',
      payments: '결제 내역 추가',
      shipping: '배송 정보 등록',
      returns: '환불 신청',
      reviews: '수강평 등록',
      coupons: '쿠폰 추가',
      wishlist: '위시리스트 추가',
      support: '문의 등록',
      analytics: '학습 기록 추가',
      exports: '보고서 추가',
    };
    return labels[activeTab] || '등록';
  };

  return (
    <div className="workspace-container">
      {/* Horizontal Header with Right-Aligned Menu Bar */}
      <header className="lms-header" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div className="brand-wrapper">
            <div className="brand-icon">🎓</div>
            <span className="brand-title">에듀플러스 글로벌 러닝 허브</span>
          </div>
          
          <div className="session-controls">
            <div className="session-indicator">
              <div className="dot-active"></div>
              <span>학습망 실시간 동기화됨</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>접속자 변경:</span>
              <select 
                className="user-select" 
                value={currentUser} 
                onChange={(e) => handleUserChange(e.target.value)}
              >
                <option value="student">수강생 (홍길동)</option>
                <option value="instructor">교수자 (김철수)</option>
                <option value="admin">플랫폼 마스터 관리자</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right-aligned Navigation Menu Bar */}
        <nav style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
                style={{ width: 'auto', padding: '8px 14px', borderRadius: '20px', fontSize: '13px' }}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'search') {
                    setSearchQuery('');
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Body Layout (Sidebar removed, full width grid) */}
      <div className="lms-body" style={{ padding: '30px 40px' }}>
        <main className="main-dashboard" style={{ gridTemplateColumns: activeTab === 'dashboard' ? '1fr 340px' : '1fr', width: '100%', padding: 0 }}>
          <div className="content-wrapper">
            <h2 className="content-title">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h2>

            {activeTab === 'dashboard' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Visual Medical Dashboard widgets */}
                <div className="dashboard-grid">
                  <div className="card">
                    <span className="card-tag">진도 통계</span>
                    <h3>나의 누적 학습률</h3>
                    <p style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-primary)' }}>64%</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>이수 달성 조건 80%</span>
                  </div>
                  <div className="card">
                    <span className="card-tag">선물함</span>
                    <h3>사용 가능 쿠폰</h3>
                    <p style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-accent)' }}>3장</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>당월 만료 예정 포함</span>
                  </div>
                  <div className="card">
                    <span className="card-tag">강좌 현황</span>
                    <h3>참여 중인 강의실</h3>
                    <p style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-primary)' }}>4개</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>이번 주 온라인 라이브 1건</span>
                  </div>
                </div>

                {/* Normal Patient Actions (User Friendly Features) */}
                <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="card" style={{ cursor: 'pointer' }} onClick={() => setShowSyllabusModal(true)}>
                    <span className="card-tag">강좌 정보</span>
                    <h3>2026학년도 강의 계획 요강</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      각 수강 과목의 주차별 학습 계획서 및 과제/출석/평가 가이드를 열람합니다.
                    </p>
                  </div>

                  <div className="card" style={{ cursor: 'pointer' }} onClick={() => setShowFaqModal(true)}>
                    <span className="card-tag">고객 정보</span>
                    <h3>학습 포털 자주 묻는 질문 FAQ</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      수강 신청, 결제, 교재 배송 및 환불 등 주요 문의 사항에 대한 조치 가이드를 제공합니다.
                    </p>
                  </div>
                </div>

                <div className="card" style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    수강생 맞춤형 종합 학습 가이드
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <p>본 평생교육원 포털 시스템에 로그인해 주셔서 감사합니다. 우측 상단의 메뉴를 클릭해 원격 처방 및 다양한 학업 편의 자원에 접근해 주십시오.</p>
                    <p>학습 관리와 관련된 변경 사항이 있으면 실시간 기기 동기화를 통해 보안 세션 데이터를 강제로 일치시킬 수 있습니다.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Error Banner */}
                {apiError && (
                  <div className="alert-box danger">
                    <strong>조회 오류:</strong> {apiError}
                  </div>
                )}

                {/* CRUD Form (Creation / Modification) */}
                {!apiError && (
                  <div className="card">
                    <span className="card-tag">
                      {editingId ? '기존 레코드 수정' : '새로운 레코드 추가 기재'}
                    </span>
                    
                    <form onSubmit={editingId ? handleUpdate : handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                          type="text"
                          className="user-select"
                          style={{ flex: 1 }}
                          placeholder={activeTab === 'reviews' ? '평가할 강의명을 기재하십시오...' : '제목 또는 강의명을 적어주세요...'}
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          required
                        />
                        {activeTab === 'reviews' ? (
                          <select
                            className="user-select"
                            value={newRating}
                            onChange={(e) => setNewRating(parseInt(e.target.value))}
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5점)</option>
                            <option value={4}>⭐⭐⭐⭐ (4점)</option>
                            <option value={3}>⭐⭐⭐ (3점)</option>
                            <option value={2}>⭐⭐ (2점)</option>
                            <option value={1}>⭐ (1점)</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="user-select"
                            style={{ width: '200px' }}
                            placeholder="금액 또는 세부 옵션 기재"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                          />
                        )}
                      </div>
                      
                      {activeTab === 'reviews' && (
                        <textarea
                          className="user-select"
                          style={{ minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                          placeholder="수강하신 솔직한 후기 내용을 10자 이상 작성해 주세요..."
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          required
                        />
                      )}

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="card-btn" style={{ width: 'auto', padding: '10px 24px', backgroundColor: 'var(--color-accent)' }}>
                          {editingId ? '내용 수정 완료' : getVerificationButtonLabel()}
                        </button>
                        {editingId && (
                          <button type="button" className="card-btn" style={{ width: 'auto', padding: '10px 24px', backgroundColor: '#aaa' }} onClick={() => {
                            setEditingId(null);
                            setNewTitle('');
                            setNewContent('');
                          }}>수정 취소</button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {/* Rendered Interactive Data Cards */}
                {!apiError && (
                  <div className="card">
                    <span className="card-tag">현재 보관함 내역</span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {getCurrentList().length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>
                          보관함에 등록된 정보가 비어있습니다. 상단 입력 폼을 통해 기록을 추가해 보십시오.
                        </div>
                      ) : (
                        getCurrentList().map((item, idx) => (
                          <div key={item.id || idx} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '13.5px', marginBottom: '6px' }}>
                                레코드 번호: {item.id}
                              </div>
                              
                              {activeTab === 'notifications' && (
                                <div style={{ fontSize: '13px', display: 'grid', gap: '2px' }}>
                                  <div><strong>알림 제목:</strong> {item.title}</div>
                                  <div><strong>수신 시간:</strong> {item.time}</div>
                                  <div><strong>발신 부서:</strong> {item.sender}</div>
                                </div>
                              )}

                              {activeTab === 'payments' && (
                                <div style={{ fontSize: '13px', display: 'grid', gap: '2px' }}>
                                  <div><strong>결제 강좌명:</strong> {item.course}</div>
                                  <div><strong>결제 금액:</strong> {item.amount}</div>
                                  <div><strong>결제 일자:</strong> {item.date}</div>
                                </div>
                              )}

                              {activeTab === 'shipping' && (
                                <div style={{ fontSize: '13px', display: 'grid', gap: '2px' }}>
                                  <div><strong>교재명:</strong> {item.book}</div>
                                  <div><strong>배송 주소:</strong> {item.address}</div>
                                  <div><strong>배송 현황:</strong> {item.status}</div>
                                </div>
                              )}

                              {activeTab === 'returns' && (
                                <div style={{ fontSize: '13px', display: 'grid', gap: '2px' }}>
                                  <div><strong>환불 요청강좌:</strong> {item.course}</div>
                                  <div><strong>환불 금액:</strong> {item.amount}</div>
                                  <div><strong>환불 처리 상태:</strong> {item.status}</div>
                                </div>
                              )}

                              {activeTab === 'reviews' && (
                                <div style={{ fontSize: '13px', display: 'grid', gap: '2px' }}>
                                  <div><strong>강좌 명칭:</strong> {item.course}</div>
                                  <div><strong>수강 평점:</strong> {'⭐'.repeat(item.rating || 5)} ({item.rating}점)</div>
                                  <div><strong>수강 후기평:</strong> {item.comment}</div>
                                </div>
                              )}

                              {activeTab === 'coupons' && (
                                <div style={{ fontSize: '13px', display: 'grid', gap: '2px' }}>
                                  <div><strong>쿠폰 코드명:</strong> {item.code}</div>
                                  <div><strong>할인율:</strong> {item.discount}</div>
                                  <div><strong>유효 기간:</strong> {item.expiry}</div>
                                </div>
                              )}

                              {activeTab === 'wishlist' && (
                                <div style={{ fontSize: '13px', display: 'grid', gap: '2px' }}>
                                  <div><strong>희망 강좌명:</strong> {item.course}</div>
                                  <div><strong>난이도:</strong> {item.level}</div>
                                  <div><strong>수강료:</strong> {item.price}</div>
                                </div>
                              )}

                              {activeTab === 'support' && (
                                <div style={{ fontSize: '13px', display: 'grid', gap: '2px' }}>
                                  <div><strong>문의 분류:</strong> {item.subject}</div>
                                  <div><strong>문의 요약:</strong> {item.question}</div>
                                  <div><strong>답변 여부:</strong> {item.status}</div>
                                </div>
                              )}

                              {activeTab === 'analytics' && (
                                <div style={{ fontSize: '13px', display: 'grid', gap: '2px' }}>
                                  <div><strong>주간 통계 대상:</strong> {item.week}</div>
                                  <div><strong>실제 수강 시간:</strong> {item.hours}시간</div>
                                  <div><strong>진도 달성률:</strong> {item.progress}</div>
                                </div>
                              )}

                              {activeTab === 'exports' && (
                                <div style={{ fontSize: '13px', display: 'grid', gap: '2px' }}>
                                  <div><strong>내보내기 파일명:</strong> {item.filename}</div>
                                  <div><strong>문서 포맷:</strong> {item.format}</div>
                                  <div><strong>생성 일자:</strong> {item.created}</div>
                                </div>
                              )}
                            </div>

                            {/* Actions (Update / Delete) */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="card-btn" 
                                style={{ width: 'auto', padding: '6px 12px', backgroundColor: '#e2e8f0', color: 'var(--text-primary)', fontSize: '12px' }}
                                onClick={() => handleEditInit(item)}
                              >
                                수정
                              </button>
                              <button 
                                className="card-btn" 
                                style={{ width: 'auto', padding: '6px 12px', backgroundColor: 'var(--color-error)', fontSize: '12px' }}
                                onClick={() => handleDelete(item.id)}
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar configuration panel (Only displayed on Dashboard view) */}
          {activeTab === 'dashboard' && (
            <aside className="right-sidebar">
              {/* System settings and security console */}
              <div className="panel">
                <h3 className="panel-title">인증 정보 보안 동기화</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                  보호자 대행 동의나 수강생 본인의 열람 제한 권한이 변경되었을 때 실시간 세션 캐시 데이터를 최신화합니다.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button className="card-btn" onClick={() => handleSyncSessionCache('student')}>
                    수강생 세션 강제 동기화
                  </button>
                  <button className="card-btn" onClick={() => handleSyncSessionCache('instructor')}>
                    교수자 세션 강제 동기화
                  </button>
                </div>
              </div>

              {/* Admin authority mapping portal */}
              {currentUser === 'admin' && (
                <div className="panel">
                  <h3 className="panel-title">전산실 데이터 조회 통제</h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                    수강생 및 대리인의 동의 여부에 맞춰 마이페이지 세부 리소스에 대한 조회 가능 여부를 체크 설정합니다.
                  </p>

                  {['student', 'instructor'].map(role => (
                    <div key={role} style={{ marginTop: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        {role === 'student' ? '수강생 (Student) 권한 제어' : '담당 교수자 (Instructor) 권한 제어'}
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
          )}
        </main>
      </div>

      {/* Custom Syllabus Modal */}
      {showSyllabusModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '480px', padding: '24px', backgroundColor: '#fff' }}>
            <h3>📋 2026학년도 강의 계획 요강</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>강의 분류</th>
                  <th style={{ padding: '8px' }}>과제 배율</th>
                  <th style={{ padding: '8px' }}>수료 지표</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px' }}>리액트 마이크로 프론트엔드</td>
                  <td style={{ padding: '8px' }}>과제 30%, 출석 10%</td>
                  <td style={{ padding: '8px' }}>80점 이상 (이수 완료)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px' }}>스프링 부트 고도화 설계</td>
                  <td style={{ padding: '8px' }}>과제 40%, 중간 20%</td>
                  <td style={{ padding: '8px' }}>70점 이상 (이수 완료)</td>
                </tr>
              </tbody>
            </table>
            <button className="card-btn" style={{ marginTop: '20px' }} onClick={() => setShowSyllabusModal(false)}>창 닫기</button>
          </div>
        </div>
      )}

      {/* Custom FAQ Modal */}
      {showFaqModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '480px', padding: '24px', backgroundColor: '#fff' }}>
            <h3>❓ 자주 묻는 질문 FAQ</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', fontSize: '13px' }}>
              <div>
                <strong>Q. 환불 신청은 언제까지 가능한가요?</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>A. 수강 개시 후 7일 이내, 총 수강 시간의 1/3이 지나기 전 전액 환불을 접수하실 수 있습니다.</p>
              </div>
              <div>
                <strong>Q. 실시간 교재 배송은 안전하게 보증되나요?</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>A. 네, 우체국 택배를 통해 교재가 발송되며, 송장 정보를 배송 현황 메뉴에서 체크하실 수 있습니다.</p>
              </div>
            </div>

            <button className="card-btn" style={{ marginTop: '20px' }} onClick={() => setShowFaqModal(false)}>창 닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
