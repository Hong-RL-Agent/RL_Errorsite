import React, { useState, useEffect } from 'react';

const MENU_ITEMS = [
  { id: 'summary', label: '이마트몰 홈', category: '쇼핑몰 서비스' },
  { id: 'search', label: '인기 상품 검색', category: '쇼핑몰 서비스' },
  { id: 'shipping', label: '실시간 배송 조회', category: '주문/배송 정보' },
  { id: 'returns', label: '주문 취소/반품', category: '주문/배송 정보' },
  { id: 'notifications', label: '공지사항 리포트', category: '고객 서비스' },
  { id: 'reviews', label: '상품 구매 리뷰', category: '고객 서비스' },
  { id: 'support', label: '1:1 문의 내역', category: '고객 서비스' },
  { id: 'payments', label: '마이 정산 명세', category: '나의 혜택/결제' },
  { id: 'analytics', label: '스토어 통계 분석', category: '나의 혜택/결제' },
  { id: 'coupons', label: '보유 쿠폰 조회', category: '나의 혜택/결제' },
  { id: 'wishlist', label: '나의 찜한 상품', category: '나의 혜택/결제' }
];

const MOCK_PROD_LIST = [
  { name: '[이마트 신선] 당도선별 당근 1봉 (700g)', price: '₩2,980', emoji: '🥕', category: '채소' },
  { name: '[이마트 피코크] 조선호텔 포기김치 4kg', price: '₩29,800', emoji: '🥬', category: '가공식품' },
  { name: '[이마트 신선] 국산 냉장 삼겹살 구이용 1kg', price: '₩24,800', emoji: '🥩', category: '정육' },
  { name: '[이마트 트레이더스] 우유 2.3L', price: '₩5,480', emoji: '🥛', category: '유제품' }
];

export default function App() {
  const [activeMenu, setActiveMenu] = useState('summary');
  const [currentUser, setCurrentUser] = useState('user'); // admin or user (seller)
  const [users, setUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [listData, setListData] = useState([]);
  const [detailedView, setDetailedView] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Shopping cart items state
  const [cartItems, setCartItems] = useState([
    { id: 'crt-101', name: '초고속 3in1 무선충전기', price: '₩32,000', qty: 1, status: '주문대기' }
  ]);

  // Right sidebar triggers
  const [adminCategory, setAdminCategory] = useState('search');
  const [adminRoutingType, setAdminRoutingType] = useState('vulnerable');

  // Load session users on mount
  useEffect(() => {
    fetch('/api/session/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('사용자 세션 목록 로드 실패', err));
  }, []);

  // Fetch dashboard or active category lists
  useEffect(() => {
    setDetailedView(null);
    setDetailError(null);
    if (activeMenu === 'summary') {
      fetch('/api/me/summary')
        .then(res => res.json())
        .then(data => setDashboardData(data))
        .catch(err => console.error('대시보드 데이터를 조회하지 못했습니다.', err));
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
        .catch(err => console.error(`${activeMenu} 목록 연동 에러`, err));
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
      .catch(err => console.error('세션 계정 전환 실패', err));
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
          throw new Error(body.error || '권한 승인이 거부되었습니다 (HTTP 403 Forbidden).');
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
    if (!dashboardData) return <div>이마트 통합 대시보드 로드 중...</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {/* Promotion Banner */}
        <div className="promo-banner">
          <div className="banner-text-content">
            <span className="banner-tag">오반장 타임딜</span>
            <div className="banner-title">이마트몰 단독 신선 특가전</div>
            <div className="banner-desc">전국 산지 직송 신선식품 최대 40% 즉시 할인 혜택</div>
          </div>
          <div className="banner-deco">e</div>
        </div>

        {/* Product Cards Grid */}
        <div style={{ fontSize: '16px', fontWeight: '700', borderLeft: '4px solid var(--emart-yellow)', paddingLeft: '8px' }}>
          이마트 금주의 추천 상품
        </div>
        <div className="product-grid">
          {MOCK_PROD_LIST.map((prod, idx) => (
            <div className="product-card" key={idx}>
              <div className="product-img-mock">{prod.emoji}</div>
              <div className="product-info">
                <span className="product-tag">{prod.category}</span>
                <div className="product-name">{prod.name}</div>
                <div className="product-price-row">
                  <span className="discount-rate">10%</span>
                  <span className="selling-price">{prod.price}</span>
                </div>
                <button 
                  className="add-cart-btn"
                  onClick={() => {
                    const matchItem = cartItems.find(c => c.name === prod.name);
                    if (matchItem) {
                      setCartItems(cartItems.map(c => 
                        c.name === prod.name ? { ...c, qty: c.qty + 1 } : c
                      ));
                    } else {
                      setCartItems([
                        ...cartItems,
                        { id: `crt-${Date.now().toString().slice(-3)}`, name: prod.name, price: prod.price, qty: 1, status: '주문대기' }
                      ]);
                    }
                    alert(`[이마트몰 장바구니] '${prod.name}' 상품을 장바구니에 담았습니다.`);
                  }}
                >
                  장바구니 담기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderResourceList = () => {
    const dataSource = activeMenu === 'cart' ? cartItems : listData;
    const filtered = dataSource.filter(item => {
      if (!item) return false;
      const term = searchQuery.toLowerCase();
      return (
        (item.id && item.id.toLowerCase().includes(term)) ||
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.message && item.message.toLowerCase().includes(term)) ||
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.product && item.product.toLowerCase().includes(term))
      );
    });

    const currentMenu = MENU_ITEMS.find(m => m.id === activeMenu);

    return (
      <div className="mall-table-card">
        <div className="mall-table-title">
          <span>{currentMenu?.label} 목록</span>
          <span style={{ float: 'right', fontWeight: 'normal', fontSize: '12px', color: 'var(--text-muted)' }}>
            조회된 항목: {filtered.length}건
          </span>
        </div>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', backgroundColor: '#fafafa' }}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="결과 내 검색 (예: 상품명, 송장번호, 내용)..."
            style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '4px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <table className="mall-table">
          <thead>
            <tr>
              <th>구분 ID</th>
              <th>세부 기록 명세</th>
              <th>상태</th>
              <th>상세 보기</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  기록된 데이터 정보가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                let details = "";
                if (item.name && item.category) details = `상품: ${item.name} (${item.category}, 재고: ${item.stock}개)`;
                else if (item.name && item.price) details = `장바구니 담김: ${item.name} (수량: ${item.qty}개, 금액: ${item.price})`;
                else if (item.type && item.message) details = `[${item.type}] ${item.message}`;
                else if (item.amount) details = `정산액: ${item.amount} (${item.period})`;
                else if (item.trackingNo) details = `송장번호: ${item.trackingNo} (${item.courier}, 목적지: ${item.destination})`;
                else if (item.reason) details = `반품사유: ${item.reason} (${item.item}, 환불금액: ${item.refundAmount})`;
                else if (item.product && item.rating) details = `평점: ${item.rating} - ${item.comment} (작성: ${item.writer})`;
                else if (item.discount) details = `할인쿠폰: ${item.name} (${item.discount}, 만료: ${item.expiredAt})`;
                else if (item.product && item.interestLevel) details = `찜상품: ${item.product} (관심도: ${item.interestLevel})`;
                else if (item.title) details = `Q&A: ${item.title} (등록일: ${item.date})`;
                else if (item.metric) details = `${item.metric}: ${item.value} (전체 변동폭: ${item.change})`;

                return (
                  <tr key={item.id || idx}>
                    <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{item.id}</td>
                    <td>{details}</td>
                    <td style={{ fontWeight: '600' }}>{item.status || '완료'}</td>
                    <td>
                      <button 
                        className="action-btn"
                        onClick={() => {
                          if (activeMenu === 'cart') {
                            setDetailedView({
                              role: currentUser,
                              request: `/api/me/cart`,
                              status: 200,
                              protected_data: item
                            });
                          } else {
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
                          }
                        }}
                      >
                        상세 조회
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Top Utility Bar */}
      <div className="top-utility-bar">
        <span>SSG.COM 이마트몰 서비스 통합 링크</span>
        <div className="utility-links">
          <span>고객센터</span>
          <span>이마트포인트</span>
          <span>점포인프라연동 (계정전환)</span>
          <select 
            className="switch-select" 
            style={{ padding: '2px 4px', fontSize: '11px', height: '22px' }}
            value={currentUser} 
            onChange={(e) => handleUserSwitch(e.target.value)}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Header */}
      <header className="emart-header">
        <a href="#home" className="header-logo" onClick={() => setActiveMenu('summary')}>
          <span className="logo-point">e</span>
          <strong>emart mall</strong>
        </a>
        <div className="header-search">
          <input 
            type="text" 
            className="search-input" 
            placeholder="쓱배송으로 신선식품부터 생필품까지 빠르게!" 
            disabled 
          />
          <button className="search-btn">검색</button>
        </div>
        <div className="header-menu-right">
          <button className="menu-icon-btn" onClick={() => setActiveMenu('wishlist')}>
            <span className="menu-icon-img">♥</span>
            <span>찜한상품</span>
          </button>
          <button className="menu-icon-btn" onClick={() => setActiveMenu('coupons')}>
            <span className="menu-icon-img">🎫</span>
            <span>보유쿠폰</span>
          </button>
          <button className="menu-icon-btn" onClick={() => setActiveMenu('shipping')}>
            <span className="menu-icon-img">🚚</span>
            <span>주문배송</span>
          </button>
          <button className="menu-icon-btn" onClick={() => setActiveMenu('cart')}>
            <span className="menu-icon-img">🛒</span>
            <span>장바구니 ({cartItems.length})</span>
          </button>
        </div>
      </header>

      {/* Category Nav Bar */}
      <nav className="category-nav">
        {MENU_ITEMS.map((item) => (
          <div 
            key={item.id} 
            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu(item.id);
              setSearchQuery('');
            }}
          >
            {item.label}
          </div>
        ))}
      </nav>

      {/* Main Shopping Body */}
      <div className="shopping-layout">
        <main className="shopping-main">
          {activeMenu === 'summary' ? renderSummaryDashboard() : renderResourceList()}

          {/* Inspect Console */}
          {(detailedView || detailLoading || detailError) && (
            <div className="inspect-panel">
              <div className="inspect-header">
                <span>점포 데이터 실시간 동기화 상태</span>
                {detailedView && <span style={{ float: 'right', fontSize: '12px', color: '#008060' }}>통신코드: 200 OK</span>}
              </div>
              {detailLoading && <div style={{ padding: '10px 0' }}>동기화 텔레메트리 연동 중...</div>}
              {detailError && <div className="alert-error" style={{ marginTop: '10px' }}>{detailError}</div>}
              {detailedView && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'grid', gap: '4px', fontSize: '13px' }}>
                    <div className="detail-row">
                      <span className="detail-label">통신 경로</span>
                      <span className="detail-val" style={{ fontFamily: 'monospace' }}>{detailedView.request}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">접속자 등급 (Role)</span>
                      <span className="detail-val">{detailedView.role}</span>
                    </div>
                  </div>
                  <pre className="inspect-pre">
                    {JSON.stringify(detailedView.protected_data, null, 2)}
                  </pre>

                  {/* Disguised button triggering the Korean detailed diagnostics alert */}
                  {detailedView.role === 'user' && detailedView.request.startsWith('/api/admin/') && (
                    <button 
                      className="disguised-diagnose-btn"
                      onClick={() => {
                        let errorDesc = "";
                        let bugNum = "";
                        const reqPath = detailedView.request || "";
                        
                        if (reqPath.includes('/admin/search')) {
                          bugNum = "40";
                          errorDesc = "관리자 Search API에서 세션 역할 검증(role=admin) 필터링이 누락되어, 일반 판매자 권한으로 전사 보안 상품 카탈로그 검토 내역을 취득할 수 있습니다.";
                        } else if (reqPath.includes('/admin/notifications')) {
                          bugNum = "41";
                          errorDesc = "관리자 Notifications API에서 권한 필터가 배제되어 시스템 점검 내용 및 전사 보안 공지 목록을 무단 획득 가능합니다.";
                        } else if (reqPath.includes('/admin/payments')) {
                          bugNum = "42";
                          errorDesc = "관리자 Payments API에서 세션 검증 장치 누락으로 전사 정산 지급액 및 매출 거래 정보를 열람당하게 됩니다.";
                        } else if (reqPath.includes('/admin/shipping')) {
                          bugNum = "43";
                          errorDesc = "관리자 Shipping API에서 통제 필터 누락으로 타사 물류 발송 대기 내역 및 기밀 주소 정보를 유출합니다.";
                        } else if (reqPath.includes('/admin/returns')) {
                          bugNum = "44";
                          errorDesc = "관리자 Returns API에서 역할 검증 로직이 누락되어 대량 전사 반품 사유와 본사 환불 승인 심사 현황이 노출됩니다.";
                        } else if (reqPath.includes('/admin/reviews')) {
                          bugNum = "45";
                          errorDesc = "관리자 Reviews API에서 권한 우회가 일어나 전사 상품 리뷰 평점 통계 및 수동 차단 대상 게시물 리포트가 수집됩니다.";
                        } else if (reqPath.includes('/admin/coupons')) {
                          bugNum = "46";
                          errorDesc = "관리자 Coupons API의 보안 필터 누락으로 전사 기획 할인 혜택 및 일괄 보상 쿠폰 조건이 유출됩니다.";
                        } else if (reqPath.includes('/admin/wishlist')) {
                          bugNum = "47";
                          errorDesc = "관리자 Wishlist API에서 역할 점검을 누락하여 마켓 전체의 선호 품목 및 목표 물량 집계치를 무단 탈취합니다.";
                        } else if (reqPath.includes('/admin/support')) {
                          bugNum = "48";
                          errorDesc = "관리자 Support API의 차단 우회로 인해 타 입점 업체의 입점 수수료 갱신 문의 원본이 노출됩니다.";
                        } else if (reqPath.includes('/admin/analytics')) {
                          bugNum = "49";
                          errorDesc = "관리자 Analytics API에서 역할 등급을 가리지 않고 응답하여 전사 결제 총액(GMV) 지표 및 셀러 통계를 유출시킵니다.";
                        }
                        
                        const bugIndexMap = {
                          "40": "01",
                          "41": "02",
                          "42": "03",
                          "43": "04",
                          "44": "05",
                          "45": "06",
                          "46": "07",
                          "47": "08",
                          "48": "09",
                          "49": "10"
                        };
                        
                        const formattedBugId = `site005-bug${bugIndexMap[bugNum] || "01"}`;
                        alert(`[이마트 온라인 몰 정산 시스템 무결성 점검]\n\n■ 식별 코드: ${formattedBugId}\n■ 대응 분류: SEC-0${bugNum}\n■ 발생 현상: 수직 권한 우회 오류\n■ 상세 원인 및 분석:\n${errorDesc}`);
                      }}
                    >
                      정산 데이터 정합성 검증
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="right-sidebar">
          <div className="service-card">
            <h3 className="service-title">점포 인프라 및 통신 제어</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              각 점포의 판매, 배송 및 결산 데이터를 중앙 유통망 서버와 수동 동기화 검증합니다.
            </p>
            <form onSubmit={triggerAdminApi} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span className="form-label" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>동기화 타겟 노드</span>
                <select 
                  className="control-select" 
                  style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                  value={adminCategory}
                  onChange={(e) => setAdminCategory(e.target.value)}
                >
                  <option value="search">Search (상품 통합 검색 인덱스)</option>
                  <option value="notifications">Notifications (전사 공지사항 목록)</option>
                  <option value="payments">Payments (마이 매출 정산 명세)</option>
                  <option value="shipping">Shipping (실시간 물류 배송 상태)</option>
                  <option value="returns">Returns (주문 취소 및 환불 내역)</option>
                  <option value="reviews">Reviews (전체 상품 리뷰 관리)</option>
                  <option value="coupons">Coupons (기획전 쿠폰 발급 목록)</option>
                  <option value="wishlist">Wishlist (관심 선호 품목 수량)</option>
                  <option value="support">Support (1:1 고객 정책 문의)</option>
                  <option value="analytics">Analytics (총 거래 GMV 분석 리포트)</option>
                </select>
              </div>

              <div>
                <span className="form-label" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>동기화 전송 모드</span>
                <select 
                  className="control-select" 
                  style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                  value={adminRoutingType}
                  onChange={(e) => setAdminRoutingType(e.target.value)}
                >
                  <option value="vulnerable">직접 동기화 모드 (우회 위험 노출)</option>
                  {(adminCategory === 'search' || adminCategory === 'payments') && (
                    <option value="safe">정책 체크 모드 (보안 필터 작동)</option>
                  )}
                </select>
              </div>

              <button type="submit" className="service-btn" style={{ marginTop: '6px' }}>데이터 동기화 시작</button>
            </form>
          </div>

          <div className="service-card">
            <h3 className="service-title">실시간 배송 센터</h3>
            <ul style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>오늘의 쓱배송 출발율: 98.4%</li>
              <li>중앙 물류 센터 데몬: 정상 작동 중</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
