import React, { useState, useEffect } from 'react';

// SVG Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default function App() {
  // Navigation & Role States
  const [activeTab, setActiveTab] = useState('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [userRole, setUserRole] = useState('customer'); // customer, owner, admin
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // App Data States
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [profile, setProfile] = useState({ username: 'customer', nickname: '배달의달인_지우', email: 'jiu@quickdelivery.co.kr', address: '서울특별시 서초구 반포동 120-4 신반포아파트 104동 302호', isSafeFilterEnabled: false });
  const [notificationsList, setNotificationsList] = useState([]);
  const [calendarEventsList, setCalendarEventsList] = useState([]);
  const [reportList, setReportList] = useState([]);

  // Form Input & Preview Output States for the 10 Reflected XSS Bugs
  // 1. Tag Input (SEC-111)
  const [tagInput, setTagInput] = useState('');
  const [tagPreviewOutput, setTagPreviewOutput] = useState('');
  const [restaurantTags, setRestaurantTags] = useState({ 'mint-chicken': ['민트덕후', '바삭'], 'daebak-bunsik': ['매콤', '튀김맛집'], 'pizza-paradise': ['화덕피자', '치즈폭탄'] });

  // 2. Friend Invitation (SEC-112)
  const [inviteMsgInput, setInviteMsgInput] = useState('우리 동네 맛집 정보 같이 볼래? 3,000원 쿠폰 지급 중!');
  const [invitePreviewOutput, setInvitePreviewOutput] = useState('');

  // 3. Delivery Note (SEC-113)
  const [deliveryNoteInput, setDeliveryNoteInput] = useState('');
  const [deliveryNotePreviewOutput, setDeliveryNotePreviewOutput] = useState('');

  // 4. Refund Reason (SEC-114)
  const [refundReasonInput, setRefundReasonInput] = useState('');
  const [refundPreviewOutput, setRefundPreviewOutput] = useState('');

  // 5. Search autocomplete (SEC-115)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOutput, setSearchOutput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 6. Notification Title (SEC-116)
  const [notiTitleInput, setNotiTitleInput] = useState('');
  const [notiPreviewOutput, setNotiPreviewOutput] = useState('');

  // 7. Calendar Event Title (SEC-117)
  const [calTitleInput, setCalTitleInput] = useState('');
  const [calPreviewOutput, setCalPreviewOutput] = useState('');
  const [calDateInput, setCalDateInput] = useState('2026-08-10');
  const [calTimeInput, setCalTimeInput] = useState('12:00');

  // 8. Report Filter (SEC-118)
  const [reportFilterInput, setReportFilterInput] = useState('');
  const [reportFilterPreviewOutput, setReportFilterPreviewOutput] = useState('');

  // 9. CSV Upload Filename (SEC-119)
  const [csvFilename, setCsvFilename] = useState('');
  const [csvPreviewOutput, setCsvPreviewOutput] = useState(null);

  // 10. API Console Query (SEC-120)
  const [consoleQueryInput, setConsoleQueryInput] = useState('');
  const [consoleQueryOutput, setConsoleQueryOutput] = useState(null);

  // Normal UI Feedbacks
  const [successAlert, setSuccessAlert] = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debug Popups
  const [debugModal, setDebugModal] = useState(null); // { bugId, csvId, endpoint, parameter, description }

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const restRes = await fetch('/api/restaurants');
      const restData = await restRes.json();
      setRestaurants(restData);

      const ordRes = await fetch('/api/orders');
      const ordData = await ordRes.json();
      setOrders(ordData);

      const profRes = await fetch('/api/profile');
      const profData = await profRes.json();
      setProfile(profData);

      const cartRes = await fetch('/api/cart');
      const cartData = await cartRes.json();
      setCartItems(cartData);

      // Default events
      setCalendarEventsList([
        { id: 1, date: '2026-08-10', time: '12:00', title: '회사 점심 단체 피자 예약 주문', qty: 3 }
      ]);

      // Default reports
      const reportsRes = await fetch('/api/reports');
      const reportsData = await reportsRes.json();
      setReportList(reportsData.reports);

      // Default notices/notifications
      setNotificationsList([
        { id: 1, title: '🔔 8월 첫 주문 웰컴 3,000원 쿠폰 지급 완료!', date: '2026-08-02' },
        { id: 2, title: '⛈️ 폭우로 인한 일시적 배달 지연 양해 부탁드립니다.', date: '2026-07-28' }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // State to control diagnostic sidebar
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  // Helper trigger for debug warnings
  const triggerDebugCheck = (bugId, csvId, endpoint, parameter, description) => {
    setDebugModal({
      bugId,
      csvId,
      endpoint,
      parameter,
      description
    });
  };

  // Inline bug ID badge helper
  const renderBugBadge = (bugId, csvId, endpoint, parameter, description) => {
    return null;
  };

  // Automated diagnostic simulation trigger
  const handleDiagnosticTrigger = async (bugId) => {
    // 1. Ensure Safe Mode is OFF to reproduce
    if (profile.isSafeFilterEnabled) {
      setProfile(prev => ({ ...prev, isSafeFilterEnabled: false }));
      setSuccessAlert("취약점 재현을 위해 안심 입력 보안 필터를 일시적으로 비활성화합니다.");
    }

    setIsDiagnosticOpen(false); // Close diagnostic sidebar to let user see the action

    if (bugId === 'site012-bug01') {
      setActiveTab('restaurants');
      setSelectedRestaurantId('mint-chicken');
      const payload = '<span style="color:var(--accent-orange);font-weight:bold;animation:bugPulse 2s infinite;">[XSS] 민트치킨 최고!</span>';
      setTagInput(payload);
      setTimeout(async () => {
        await handleTagPreview(payload);
        triggerDebugCheck(
          'site012-bug01',
          'SEC-111',
          '/api/tags/preview',
          'tag',
          '커스텀 맛집 태그 문자열에 대하여 백엔드 이스케이프 처리가 생략되어 DOM 내 innerHTML에 반영됩니다.'
        );
      }, 200);
    } else if (bugId === 'site012-bug02') {
      setActiveTab('home');
      const payload = '<div style="background:var(--light-mint);padding:0.4rem;border-radius:4px;border:1px solid var(--accent-orange);color:var(--accent-orange);font-weight:bold;text-align:center;">[XSS] 무료 쿠폰 받기 👉</div>';
      setInviteMsgInput(payload);
      setTimeout(async () => {
        await handleInvitationPreview(payload);
        triggerDebugCheck(
          'site012-bug02',
          'SEC-112',
          '/api/invitations/preview',
          'message',
          '친구 초대용 메시지 템플릿 정보 카드 렌더 시, HTML 기호를 치환하지 않아 Reflected XSS 취약점이 존재합니다.'
        );
      }, 200);
    } else if (bugId === 'site012-bug03') {
      if (cartItems.length === 0) {
        setCartItems([{ id: 103, name: '시그니처 민트 크림 치킨', price: 19000, quantity: 1 }]);
      }
      setActiveTab('cart');
      const payload = '벨 누르지 말고 문 앞에 놓아주세요. <span style="color:var(--accent-orange);font-weight:bold;">[XSS]</span>';
      setDeliveryNoteInput(payload);
      setTimeout(async () => {
        await handleDeliveryNotePreview(payload);
        triggerDebugCheck(
          'site012-bug03',
          'SEC-113',
          '/api/orders/delivery-note/preview',
          'note',
          '주문서 배달 요청사항 메모 요약 렌더링 시, 사용자가 기입한 원시 텍스트를 여과 없이 이식합니다.'
        );
      }, 200);
    } else if (bugId === 'site012-bug04') {
      setActiveTab('order-history');
      if (orders.length > 0) {
        setSelectedOrderForRefund(orders[0]);
      }
      const payload = '<strong style="color:var(--accent-orange);">[XSS] 치킨이 눅눅하고 배달이 2시간 늦었습니다.</strong>';
      setRefundReasonInput(payload);
      setTimeout(async () => {
        await handleRefundPreview(payload);
        triggerDebugCheck(
          'site012-bug04',
          'SEC-114',
          '/api/refunds/preview',
          'reason',
          '주문 내역 환불 요청 사유 미리보기 패널 렌더링 시 HTML Escape 처리가 결여되어 XSS가 발생합니다.'
        );
      }, 200);
    } else if (bugId === 'site012-bug05') {
      setActiveTab('home');
      const payload = '치킨 <span style="color:var(--accent-orange);font-weight:bold;">[XSS Autocomplete]</span>';
      setSearchQuery(payload);
      setTimeout(async () => {
        await handleSearchChange(payload);
        triggerDebugCheck(
          'site012-bug05',
          'SEC-115',
          '/api/search/suggestions',
          'q',
          '검색 자동완성 및 제안 상자 로드 시 헤더의 검색 쿼리 반사 텍스트에 HTML 치환 처리를 누락합니다.'
        );
      }, 200);
    } else if (bugId === 'site012-bug06') {
      setUserRole('admin');
      setProfile(prev => ({ ...prev, nickname: '최고관리자' }));
      setActiveTab('admin-console');
      const payload = '🚨 <span style="color:var(--accent-orange);font-weight:bold;text-decoration:underline;">[공지] 시스템 서버 점검 안내 (XSS)</span>';
      setNotiTitleInput(payload);
      setTimeout(async () => {
        await handleNotiPreview(payload);
        triggerDebugCheck(
          'site012-bug06',
          'SEC-116',
          '/api/notifications/preview',
          'title',
          '관리자 플랫폼 공지 푸시 알림 미리보기 배너 내 제목에 Escape를 생략하고 바인딩합니다.'
        );
      }, 200);
    } else if (bugId === 'site012-bug07') {
      setActiveTab('customer-center');
      const payload = '🍕 <strong style="color:var(--accent-orange);">[XSS 일정] 마케팅팀 피자 파티</strong>';
      setCalTitleInput(payload);
      setTimeout(async () => {
        await handleCalPreview(payload);
        triggerDebugCheck(
          'site012-bug07',
          'SEC-117',
          '/api/calendar/preview',
          'title',
          '예약 주문 캘린더 생성기 요약 탭 렌더 시, 예약 목적 제목 문자열에 특수 문자 처리를 건너뜁니다.'
        );
      }, 200);
    } else if (bugId === 'site012-bug08') {
      setUserRole('owner');
      setProfile(prev => ({ ...prev, nickname: '민트치킨_사장님' }));
      setActiveTab('owner-console');
      const payload = '전체매출 <span style="color:var(--accent-orange);font-weight:bold;">[XSS 필터]</span>';
      setReportFilterInput(payload);
      setTimeout(async () => {
        await handleReportFilter(payload);
        triggerDebugCheck(
          'site012-bug08',
          'SEC-118',
          '/api/reports',
          'filter',
          '점주 매출 분석 보고서 검색 키워드 필터 요약 표시 시, 특수 문자 변환 누락으로 반사 XSS 취약성을 띱니다.'
        );
      }, 200);
    } else if (bugId === 'site012-bug09') {
      setUserRole('owner');
      setProfile(prev => ({ ...prev, nickname: '민트치킨_사장님' }));
      setActiveTab('owner-console');
      const payload = '<strong style="color:var(--accent-orange);">[XSS 파일명] store_menu.csv</strong>';
      setCsvFilename(payload);
      setTimeout(async () => {
        await handleCSVFileChange(null, payload);
        triggerDebugCheck(
          'site012-bug09',
          'SEC-119',
          '/api/menu/csv/preview',
          'filename',
          '점주 메뉴판 대량 등록 CSV 파일 업로드 미리보기 명세 렌더링 영역 내 파일명 매핑 시 이스케이프 처리가 결핍되어 있습니다.'
        );
      }, 200);
    } else if (bugId === 'site012-bug10') {
      setUserRole('admin');
      setProfile(prev => ({ ...prev, nickname: '최고관리자' }));
      setActiveTab('admin-console');
      const payload = 'SELECT * FROM statistics; -- <span style="color:var(--accent-orange);font-weight:bold;">[XSS 콘솔]</span>';
      setConsoleQueryInput(payload);
      setTimeout(async () => {
        await handleAPIConsoleQuery(payload);
        triggerDebugCheck(
          'site012-bug10',
          'SEC-120',
          '/api/tools/query',
          'q',
          '관리자 전용 시스템 API 도구 디버깅 쿼리 텍스트를 출력 로그 영역에 인코딩 없이 echo 출력합니다.'
        );
      }, 200);
    }
  };

  // ----------------------------------------------------
  // API Event Handlers (Controlled by Safe Filter Toggle)
  // ----------------------------------------------------

  // 1. Tag preview
  const handleTagPreview = async (overrideVal) => {
    const val = typeof overrideVal === 'string' ? overrideVal : tagInput;
    if (!val) return;
    const apiPath = profile.isSafeFilterEnabled ? '/api/safe/tag' : '/api/tags/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: val })
      });
      const data = await res.json();
      setTagPreviewOutput(data.tag);
      if (!profile.isSafeFilterEnabled) {
        triggerDebugCheck(
          'site012-bug01',
          'SEC-111',
          '/api/tags/preview',
          'tag',
          '커스텀 맛집 태그 등록 미리보기 시, 백엔드 필터링(Escape) 생략으로 DOM 내 innerHTML 삽입 과정에서 Reflected XSS 취약점이 발생합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTagSubmit = (restId) => {
    if (!tagPreviewOutput) return;
    // Strip HTML tags for mock storage logic
    const cleanTag = tagPreviewOutput.replace(/<[^>]*>/g, '').trim();
    if (cleanTag) {
      setRestaurantTags(prev => ({
        ...prev,
        [restId]: [...(prev[restId] || []), cleanTag]
      }));
      setSuccessAlert('태그가 게시판에 정상 등록되었습니다.');
    }
    setTagInput('');
    setTagPreviewOutput('');
  };

  // 2. Invitation Message preview
  const handleInvitationPreview = async (overrideVal) => {
    const val = typeof overrideVal === 'string' ? overrideVal : inviteMsgInput;
    if (!val) return;
    const apiPath = profile.isSafeFilterEnabled ? '/api/safe/invitation' : '/api/invitations/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: val })
      });
      const data = await res.json();
      setInvitePreviewOutput(data.message);
      if (!profile.isSafeFilterEnabled) {
        triggerDebugCheck(
          'site012-bug02',
          'SEC-112',
          '/api/invitations/preview',
          'message',
          '친구 초대용 메시지 템플릿 정보 카드 렌더 시, HTML 기호를 치환하지 않아 Reflected XSS 취약점이 존재합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvitationSend = () => {
    if (!invitePreviewOutput) return;
    setSuccessAlert('초대 메시지 모의 전송 링크가 클립보드에 가상 복사되었습니다!');
    setInvitePreviewOutput('');
  };

  // 3. Delivery Note preview
  const handleDeliveryNotePreview = async (overrideVal) => {
    const val = typeof overrideVal === 'string' ? overrideVal : deliveryNoteInput;
    if (!val) return;
    const apiPath = profile.isSafeFilterEnabled ? '/api/safe/delivery-note' : '/api/orders/delivery-note/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: val })
      });
      const data = await res.json();
      setDeliveryNotePreviewOutput(data.note);
      if (!profile.isSafeFilterEnabled) {
        triggerDebugCheck(
          'site012-bug03',
          'SEC-113',
          '/api/orders/delivery-note/preview',
          'note',
          '주문서 배달 요청사항 메모 요약 렌더링 시, 사용자가 기입한 원시 텍스트를 여과 없이 이식합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Refund Reason preview
  const handleRefundPreview = async (overrideVal) => {
    const val = typeof overrideVal === 'string' ? overrideVal : refundReasonInput;
    if (!val) return;
    const apiPath = profile.isSafeFilterEnabled ? '/api/safe/refund' : '/api/refunds/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: val })
      });
      const data = await res.json();
      setRefundPreviewOutput(data.reason);
      if (!profile.isSafeFilterEnabled) {
        triggerDebugCheck(
          'site012-bug04',
          'SEC-114',
          '/api/refunds/preview',
          'reason',
          '주문 내역 환불 요청 사유 미리보기 패널 렌더링 시 HTML Escape 처리가 결여되어 XSS가 발생합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefundSubmit = () => {
    if (!refundPreviewOutput || !selectedOrderForRefund) return;
    const orderId = selectedOrderForRefund.orderId;
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: '환불대기' } : o));
    setSuccessAlert(`주문번호 [${orderId}]의 환불 신청이 접수되었습니다.`);
    setSelectedOrderForRefund(null);
    setRefundReasonInput('');
    setRefundPreviewOutput('');
    setActiveTab('order-history');
  };

  // 5. Search Autocomplete Suggestions
  const handleSearchChange = async (val) => {
    setSearchQuery(val);
    if (!val) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const apiPath = profile.isSafeFilterEnabled ? `/api/safe/search/suggestions?q=${encodeURIComponent(val)}` : `/api/search/suggestions?q=${encodeURIComponent(val)}`;
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      setSearchOutput(data.q);
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
      if (!profile.isSafeFilterEnabled) {
        triggerDebugCheck(
          'site012-bug05',
          'SEC-115',
          '/api/search/suggestions',
          'q',
          '검색 자동완성 및 제안 상자 로드 시 헤더의 검색 쿼리 반사 텍스트에 HTML 치환 처리를 누락합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = async () => {
    setIsLoading(true);
    setShowSuggestions(false);
    const apiPath = profile.isSafeFilterEnabled ? `/api/safe/search?q=${encodeURIComponent(searchQuery)}` : `/api/search?q=${encodeURIComponent(searchQuery)}`;
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      setRestaurants(data.results);
      setActiveTab('restaurants');
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // 6. Notification Title preview (Admin)
  const handleNotiPreview = async (overrideVal) => {
    const val = typeof overrideVal === 'string' ? overrideVal : notiTitleInput;
    if (!val) return;
    const apiPath = profile.isSafeFilterEnabled ? '/api/safe/notification' : '/api/notifications/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: val })
      });
      const data = await res.json();
      setNotiPreviewOutput(data.title);
      if (!profile.isSafeFilterEnabled) {
        triggerDebugCheck(
          'site012-bug06',
          'SEC-116',
          '/api/notifications/preview',
          'title',
          '관리자 플랫폼 공지 푸시 알림 미리보기 배너 내 제목에 Escape를 생략하고 바인딩합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotiSubmit = () => {
    if (!notiPreviewOutput) return;
    const cleanTitle = notiPreviewOutput.replace(/<[^>]*>/g, '').trim();
    if (cleanTitle) {
      setNotificationsList(prev => [
        { id: Date.now(), title: `📢 ${cleanTitle}`, date: new Date().toISOString().split('T')[0] },
        ...prev
      ]);
      setSuccessAlert('시스템 공지 긴급 알림 전송이 완료되었습니다.');
    }
    setNotiTitleInput('');
    setNotiPreviewOutput('');
  };

  // 7. Calendar Event Title preview
  const handleCalPreview = async (overrideVal) => {
    const val = typeof overrideVal === 'string' ? overrideVal : calTitleInput;
    if (!val) return;
    const apiPath = profile.isSafeFilterEnabled ? '/api/safe/calendar' : '/api/calendar/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: val })
      });
      const data = await res.json();
      setCalPreviewOutput(data.title);
      if (!profile.isSafeFilterEnabled) {
        triggerDebugCheck(
          'site012-bug07',
          'SEC-117',
          '/api/calendar/preview',
          'title',
          '예약 주문 캘린더 생성기 요약 탭 렌더 시, 예약 목적 제목 문자열에 특수 문자 처리를 건너뜁니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalSubmit = () => {
    if (!calPreviewOutput) return;
    const cleanTitle = calPreviewOutput.replace(/<[^>]*>/g, '').trim();
    if (cleanTitle) {
      setCalendarEventsList(prev => [
        ...prev,
        { id: Date.now(), date: calDateInput, time: calTimeInput, title: cleanTitle, qty: 1 }
      ]);
      setSuccessAlert('캘린더 예약 주문 배달 스케줄이 성공적으로 등록되었습니다.');
    }
    setCalTitleInput('');
    setCalPreviewOutput('');
  };

  // 8. Report Filter query
  const handleReportFilter = async (overrideVal) => {
    const val = typeof overrideVal === 'string' ? overrideVal : reportFilterInput;
    setIsLoading(true);
    const apiPath = profile.isSafeFilterEnabled ? `/api/safe/reports?filter=${encodeURIComponent(val)}` : `/api/reports?filter=${encodeURIComponent(val)}`;
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      setReportFilterPreviewOutput(data.filter);
      if (!profile.isSafeFilterEnabled) {
        triggerDebugCheck(
          'site012-bug08',
          'SEC-118',
          '/api/reports',
          'filter',
          '점주 매출 분석 보고서 검색 키워드 필터 요약 표시 시, 특수 문자 변환 누락으로 반사 XSS 취약성을 띱니다.'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // 9. CSV Upload filename preview
  const handleCSVFileChange = async (e, overrideVal) => {
    let name = '';
    if (overrideVal) {
      name = overrideVal;
    } else {
      const file = e?.target?.files[0];
      if (!file) return;
      name = file.name;
      setCsvFilename(name);
    }

    const apiPath = profile.isSafeFilterEnabled ? '/api/safe/upload' : '/api/menu/csv/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: name })
      });
      const data = await res.json();
      setCsvPreviewOutput(data);
      if (!profile.isSafeFilterEnabled) {
        triggerDebugCheck(
          'site012-bug09',
          'SEC-119',
          '/api/menu/csv/preview',
          'filename',
          '점주 메뉴판 대량 등록 CSV 파일 업로드 미리보기 명세 렌더링 영역 내 파일명 매핑 시 이스케이프 처리가 결핍되어 있습니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCSVUploadConfirm = () => {
    if (!csvPreviewOutput) return;
    setSuccessAlert(`점포 메뉴 데이터 파일 '${csvPreviewOutput.filename}'의 파싱 및 업로드가 완료되었습니다.`);
    setCsvFilename('');
    setCsvPreviewOutput(null);
  };

  // 10. API Console query execution
  const handleAPIConsoleQuery = async (overrideVal) => {
    const val = typeof overrideVal === 'string' ? overrideVal : consoleQueryInput;
    if (!val) return;
    const apiPath = profile.isSafeFilterEnabled ? `/api/safe/tools/query?q=${encodeURIComponent(val)}` : `/api/tools/query?q=${encodeURIComponent(val)}`;
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      setConsoleQueryOutput(data);
      if (!profile.isSafeFilterEnabled) {
        triggerDebugCheck(
          'site012-bug10',
          'SEC-120',
          '/api/tools/query',
          'q',
          '관리자 전용 시스템 API 도구 디버깅 쿼리 텍스트를 출력 로그 영역에 인코딩 없이 echo 출력합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // Simple functional logic
  // ----------------------------------------------------
  const handleAddToCart = (item, quantity) => {
    const existing = cartItems.find(i => i.id === item.id);
    if (existing) {
      setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      setCartItems(prev => [...prev, { ...item, quantity }]);
    }
    setSuccessAlert(`장바구니에 '${item.name}' 상품을 담았습니다.`);
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleCheckoutSubmit = () => {
    if (cartItems.length === 0) return;
    const restaurant = restaurants.find(r => r.menu.some(m => m.id === cartItems[0].id)) || { name: '지정된 식당' };
    const menuSummary = cartItems.map(i => `${i.name} ${i.quantity}개`).join(', ');
    const amt = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 2000;

    const newOrder = {
      orderId: `QD-2026-0802-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      restaurantName: restaurant.name,
      menuSummary,
      amount: amt,
      status: '접수대기',
      note: deliveryNotePreviewOutput || '요청사항 없음'
    };

    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    setDeliveryNoteInput('');
    setDeliveryNotePreviewOutput('');
    setSuccessAlert('모의 배달 주문 결제가 접수되었습니다!');
    setActiveTab('order-history');
  };

  // Login handler
  const handleMockLogin = (role) => {
    setUserRole(role);
    setProfile(prev => ({
      ...prev,
      username: role,
      nickname: role === 'admin' ? '최고관리자' : role === 'owner' ? '민트치킨_사장님' : '배달의달인_지우'
    }));
    setSuccessAlert(`${role === 'admin' ? '관리자' : role === 'owner' ? '상점주' : '고객'} 세션 계정으로 로그인했습니다.`);
    setActiveTab('home');
  };

  return (
    <div className="layout-root">
      
      {/* Header */}
      <header className="main-header">
        <div className="header-left">
          <a href="#" className="logo-container" onClick={(e) => { e.preventDefault(); setActiveTab('home'); setSelectedRestaurantId(null); }}>
            QuickDelivery<span className="logo-dot"></span>
          </a>
          <div className="search-bar-container">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="text"
              className="search-input"
              placeholder="음식 카테고리 또는 맛집 검색..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions-dropdown">
                {searchOutput && (
                  <div className="suggestion-header">
                    검색 키워드 제안: "<span dangerouslySetInnerHTML={{ __html: searchOutput }} />"
                    {renderBugBadge(
                      'site012-bug05',
                      'SEC-115',
                      '/api/search/suggestions',
                      'q',
                      '검색 자동완성 및 제안 상자 로드 시 헤더의 검색 쿼리 반사 텍스트에 HTML 치환 처리를 누락합니다.'
                    )}
                  </div>
                )}
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    className="suggestion-item"
                    onClick={() => {
                      setSearchQuery(s.term);
                      setShowSuggestions(false);
                      handleSearchSubmit();
                    }}
                  >
                    {s.term}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="header-right">
          <div className="nav-icons-group">
            <button className="icon-btn" onClick={() => setActiveTab('order-history')}>
              <BellIcon />
              {notificationsList.length > 0 && <span className="badge">{notificationsList.length}</span>}
            </button>
            <button className="icon-btn" onClick={() => setActiveTab('cart')}>
              <CartIcon />
              {cartItems.length > 0 && <span className="badge">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>}
            </button>
          </div>

          <div className="user-profile-controls">
            <div className="user-avatar-info" onClick={() => setActiveTab('my-page')} style={{ cursor: 'pointer' }}>
              <div className="avatar">
                CU
              </div>
              <span className="nickname-display">{profile.nickname}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Grid */}
      <div className="app-container">
        
        {/* Left Navigation Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-card">
            <ul className="sidebar-menu">
              <li className={`menu-item ${activeTab === 'home' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('home'); setSelectedRestaurantId(null); }}>🏠 홈 (Home)</button>
              </li>
              <li className={`menu-item ${activeTab === 'restaurants' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('restaurants'); setSelectedRestaurantId(null); }}>🛵 맛집 탐색 (Restaurants)</button>
              </li>
              <li className={`menu-item ${activeTab === 'order-history' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('order-history'); setSelectedRestaurantId(null); }}>📋 주문 내역 (My Orders)</button>
              </li>
              <li className={`menu-item ${activeTab === 'coupons' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('coupons'); setSelectedRestaurantId(null); }}>🎟️ 할인 쿠폰 (Coupons)</button>
              </li>
              <li className={`menu-item ${activeTab === 'reviews' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('reviews'); setSelectedRestaurantId(null); }}>💬 맛집 후기 (Reviews)</button>
              </li>
              <li className={`menu-item ${activeTab === 'customer-center' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('customer-center'); setSelectedRestaurantId(null); }}>🗓️ 단체 예약 플래너 (Planner)</button>
              </li>
              <li className={`menu-item ${activeTab === 'owner-console' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('owner-console'); setSelectedRestaurantId(null); }}>📊 나의 소비 분석 (Statistics)</button>
              </li>
              <li className={`menu-item ${activeTab === 'admin-console' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('admin-console'); setSelectedRestaurantId(null); }}>🛠️ OpenAPI 개발자 센터 (Developer)</button>
              </li>
            </ul>
          </div>

          <div className="sidebar-card" style={{ fontSize: '0.8rem' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '0.4rem', color: 'var(--primary-mint)' }}>배송지 위치</h4>
            <p style={{ color: 'var(--text-gray)', lineHeight: '1.4' }}>{profile.address}</p>
          </div>
        </aside>

        {/* Center Main Tab Panel */}
        <main className="center-content">
          {isLoading ? (
            <div className="empty-placeholder">
              <div className="loading-spinner"></div>
              <p>배달 플랫폼 데이터 갱신 중...</p>
            </div>
          ) : (
            <>
              {/* Home View */}
              {activeTab === 'home' && (
                <div>
                  <div className="hero-banner">
                    <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80" alt="Delicious Food" className="hero-img" />
                    <div className="hero-content">
                      <span className="hero-subtitle">QUICK & FRESH DELIVERY</span>
                      <h2 className="hero-title">오늘 뭐 먹지?</h2>
                      <p className="hero-subtitle">안심 결제 배달로 30분 이내 따끈따끈하게 도착합니다.</p>
                      <button className="btn-small-primary" style={{ backgroundColor: 'var(--text-dark)', width: 'max-content', marginTop: '0.5rem' }} onClick={() => setActiveTab('restaurants')}>주문하기</button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>배달 카테고리</h3>
                  <div className="categories-grid">
                    {['치킨', '피자/양식', '분식', '한식'].map(cat => (
                      <button
                        key={cat}
                        className="category-card"
                        onClick={() => {
                          const filtered = cat === '한식' ? [] : restaurants.filter(r => r.category.includes(cat));
                          setRestaurants(filtered);
                          setActiveTab('restaurants');
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>인기 추천 상점</h3>
                  <div className="restaurant-grid">
                    {restaurants.slice(0, 2).map(r => (
                      <div key={r.id} className="restaurant-card" onClick={() => { setSelectedRestaurantId(r.id); setActiveTab('restaurant-detail'); }}>
                        <img src={r.image} alt={r.name} className="restaurant-img" />
                        <div className="restaurant-info">
                          <h4 className="restaurant-name">{r.name}</h4>
                          <div className="restaurant-meta">
                            <span className="star-rating"><StarIcon /> {r.rating}</span>
                            <span>•</span>
                            <span>배달 {r.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurants List View */}
              {activeTab === 'restaurants' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>전체 맛집 리스트 ({restaurants.length})</h3>
                    <button style={{ fontSize: '0.75rem', textDecoration: 'underline' }} onClick={fetchInitialData}>필터 해제</button>
                  </div>

                  {restaurants.length === 0 ? (
                    <div className="empty-placeholder">
                      <p>해당 카테고리에 제휴된 배달 맛집이 존재하지 않습니다.</p>
                    </div>
                  ) : (
                    <div className="restaurant-grid">
                      {restaurants.map(r => (
                        <div key={r.id} className="restaurant-card" onClick={() => { setSelectedRestaurantId(r.id); setActiveTab('restaurant-detail'); }}>
                          <img src={r.image} alt={r.name} className="restaurant-img" />
                          <div className="restaurant-info">
                            <h4 className="restaurant-name">{r.name}</h4>
                            <div className="restaurant-meta">
                              <span className="star-rating">★ {r.rating}</span>
                              <span>•</span>
                              <span>{r.category}</span>
                            </div>
                            <div className="restaurant-details">
                              <span>최소배달비 ₩{r.deliveryFee.toLocaleString()}</span>
                              <span>소요시간 {r.deliveryTime}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Restaurant Details & Custom tags (SEC-111) */}
              {activeTab === 'restaurant-detail' && selectedRestaurantId && (() => {
                const rest = restaurants.find(r => r.id === selectedRestaurantId);
                if (!rest) return <p>식당을 찾을 수 없습니다.</p>;
                return (
                  <div>
                    <button className="back-btn" onClick={() => { setActiveTab('restaurants'); setSelectedRestaurantId(null); }}>
                      ← 목록으로 돌아가기
                    </button>
                    
                    <div className="detail-header-block">
                      <img src={rest.image} alt={rest.name} className="detail-banner-img" />
                      <div className="detail-text-box">
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{rest.name}</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{rest.description}</p>
                        <div className="restaurant-meta" style={{ marginTop: '0.3rem' }}>
                          <span className="star-rating">★ {rest.rating}</span>
                          <span>|</span>
                          <span>배달팁 ₩{rest.deliveryFee.toLocaleString()}</span>
                          <span>|</span>
                          <span>평균 배달소요 {rest.deliveryTime}</span>
                        </div>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.8rem' }}>대표 메뉴판</h3>
                    <div className="menu-list-container">
                      {rest.menu.map(m => (
                        <div key={m.id} className="menu-item-card">
                          <div className="menu-item-info">
                            <span className="menu-item-name">{m.name}</span>
                            <span className="menu-item-price">₩{m.price.toLocaleString()}</span>
                          </div>
                          <button className="btn-mint-outline" onClick={() => handleAddToCart(m, 1)}>장바구니 추가</button>
                        </div>
                      ))}
                    </div>

                    {/* Food Custom tags input (SEC-111) */}
                    <div className="tags-input-section">
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 800 }}>맛집 커스텀 추천 태그 추가</h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)', marginBottom: '0.5rem' }}>
                        식당에 어울리는 추천 태그를 입력해 보아주세요!
                      </p>
                      
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          placeholder="예: 꿀맛치킨, 매콤쫀득"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                        />
                        <button className="btn-small-secondary" onClick={handleTagPreview}>태그 등록 미리보기</button>
                      </div>

                      {tagPreviewOutput && (
                        <div className="preview-container">
                          <span className="preview-badge">태그 임시 데이터 확인</span>
                          <p style={{ fontSize: '0.8rem' }}>
                            설정 예정 태그: <strong dangerouslySetInnerHTML={{ __html: tagPreviewOutput }} />
                            {renderBugBadge(
                              'site012-bug01',
                              'SEC-111',
                              '/api/tags/preview',
                              'tag',
                              '커스텀 맛집 태그 문자열에 대하여 백엔드 이스케이프 처리가 생략되어 DOM 내 innerHTML에 반영됩니다.'
                            )}
                          </p>
                          <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => handleTagSubmit(rest.id)}>
                            상점에 태그 등록 확정
                          </button>
                        </div>
                      )}

                      <div style={{ marginTop: '0.6rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-gray)' }}>현재 등록된 태그:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {(restaurantTags[rest.id] || []).map((t, i) => (
                            <span key={i} className="tag-badge">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Cart & Delivery Note input (SEC-113) */}
              {activeTab === 'cart' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem' }}>장바구니 내역 & 주문 결제</h3>
                  
                  {cartItems.length === 0 ? (
                    <div className="empty-placeholder">
                      <p>장바구니가 비어 있습니다. 맛집에서 메뉴를 추가해 보세요!</p>
                      <button className="btn-small-primary" onClick={() => setActiveTab('restaurants')}>맛집 탐색하러 가기</button>
                    </div>
                  ) : (
                    <div className="cart-layout">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="cart-card">
                          {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                              <span>{item.name} (x{item.quantity}개)</span>
                              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700 }}>₩{(item.price * item.quantity).toLocaleString()}</span>
                                <button className="cart-item-remove" onClick={() => handleRemoveFromCart(item.id)}>삭제</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Note Input section */}
                        <div className="cart-card" style={{ background: '#FCFCFC' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>🚴 라이더 배송 메모 입력</h4>
                          <div className="form-group" style={{ marginTop: '0.5rem' }}>
                            <textarea
                              className="form-input form-textarea"
                              placeholder="예: 문 앞에 두고 초인종 눌러주세요, 벨 누르지 마세요."
                              value={deliveryNoteInput}
                              onChange={(e) => setDeliveryNoteInput(e.target.value)}
                            />
                          </div>
                          <div>
                            <button className="btn-small-secondary" onClick={handleDeliveryNotePreview}>요청사항 메모 적용 미리보기</button>
                          </div>

                          {deliveryNotePreviewOutput && (
                            <div className="preview-container">
                              <span className="preview-badge">요청사항 매핑 미리보기</span>
                              <p style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                라이더 전달 메시지: <span dangerouslySetInnerHTML={{ __html: deliveryNotePreviewOutput }} />
                                {renderBugBadge(
                                  'site012-bug03',
                                  'SEC-113',
                                  '/api/orders/delivery-note/preview',
                                  'note',
                                  '주문서 배달 요청사항 메모 요약 렌더링 시, 사용자가 기입한 원시 텍스트를 여과 없이 이식합니다.'
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="checkout-summary-card">
                        <h4 style={{ fontWeight: 800, fontSize: '0.9rem' }}>주문 정산 정보</h4>
                        <div className="summary-row">
                          <span>총 주문 금액</span>
                          <span style={{ fontWeight: 700 }}>₩{cartItems.reduce((acc, c) => acc + (c.price * c.quantity), 0).toLocaleString()}</span>
                        </div>
                        <div className="summary-row">
                          <span>배달 요금 팁</span>
                          <span>₩2,000</span>
                        </div>
                        <div className="summary-row total">
                          <span>최종 결제 금액</span>
                          <span>₩{(cartItems.reduce((acc, c) => acc + (c.price * c.quantity), 0) + 2000).toLocaleString()}</span>
                        </div>
                        <button className="btn-small-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem' }} onClick={handleCheckoutSubmit}>
                          주문 및 결제 완료 (Mock)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order History, Delivery tracker & Refund center (SEC-114) */}
              {activeTab === 'order-history' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem' }}>실시간 배달 주문 현황판</h3>
                  
                  {orders.length === 0 ? (
                    <div className="empty-placeholder">
                      <p>최근 주문한 내역이 없습니다.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {orders.map(ord => (
                        <div key={ord.orderId} className="delivery-tracker-card">
                          <div className="tracker-header">
                            <div>
                              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{ord.restaurantName}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginLeft: '0.5rem' }}>주문코드: {ord.orderId}</span>
                            </div>
                            <span style={{ color: 'var(--primary-mint)', fontWeight: 800 }}>{ord.status}</span>
                          </div>
                          
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>{ord.menuSummary}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '0.2rem' }}>배송지 전달 메시지: {ord.note}</p>
                          
                          {/* Live delivery status flow */}
                          <div className="status-step-grid">
                            <span className={`status-step ${ord.status === '접수대기' ? 'active' : ''}`}>접수중</span>
                            <span className={`status-step ${ord.status === '조리중' ? 'active' : ''}`}>조리중</span>
                            <span className={`status-step ${ord.status === '배달중' ? 'active' : ''}`}>배달중</span>
                            <span className={`status-step ${ord.status === '배달완료' ? 'active' : ''}`}>완료</span>
                          </div>

                          {/* Refund actions (Only if completed) */}
                          {ord.status === '배달완료' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                              <button
                                className="btn-mint-outline"
                                style={{ fontSize: '0.7rem', color: 'var(--accent-orange)', borderColor: 'var(--accent-orange)' }}
                                onClick={() => setSelectedOrderForRefund(ord)}
                              >
                                환불 신청 요청하기
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Refund Request modal/form inline */}
                  {selectedOrderForRefund && (
                    <div className="review-form-box" style={{ marginTop: '2rem', border: '1px solid var(--accent-orange)', padding: '1.2rem', borderRadius: '10px' }}>
                      <h4 style={{ fontWeight: 800, color: 'var(--accent-orange)', marginBottom: '0.3rem' }}>환불 접수 신청 센터</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.8rem' }}>
                        주문번호: <strong>{selectedOrderForRefund.orderId}</strong> ({selectedOrderForRefund.restaurantName})의 환불 사유를 적어주세요.
                      </p>

                      <div className="form-group">
                        <label className="form-label">환불 요청 상세 사유</label>
                        <textarea
                          className="form-input form-textarea"
                          placeholder="음식 누락 또는 배달 오배송 지연 등 사유를 구체적으로 적어주세요..."
                          value={refundReasonInput}
                          onChange={(e) => setRefundReasonInput(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn-small-secondary" onClick={handleRefundPreview}>환불 명세 서류 미리보기</button>
                        <button className="btn-small-primary" style={{ backgroundColor: 'var(--text-gray)' }} onClick={() => setSelectedOrderForRefund(null)}>취소</button>
                      </div>

                      {refundPreviewOutput && (
                        <div className="preview-container">
                          <span className="preview-badge" style={{ backgroundColor: 'var(--accent-orange)' }}>환불 청구 확인서 미리보기</span>
                          <p style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                            신청 접수 사유: <strong dangerouslySetInnerHTML={{ __html: refundPreviewOutput }} />
                            {renderBugBadge(
                              'site012-bug04',
                              'SEC-114',
                              '/api/refunds/preview',
                              'reason',
                              '주문 내역 환불 요청 사유 미리보기 패널 렌더링 시 HTML Escape 처리가 결여되어 XSS가 발생합니다.'
                            )}
                          </p>
                          <button className="btn-small-primary" style={{ backgroundColor: 'var(--accent-orange)', width: '100%', marginTop: '0.6rem' }} onClick={handleRefundSubmit}>
                            위 사유로 환불 접수 전송
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Coupons View */}
              {activeTab === 'coupons' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem' }}>할인 이벤트 & 쿠폰 센터</h3>
                  <div style={{ background: 'var(--light-mint)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>첫 주문 환영 웰컴팩 쿠폰</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>어디서나 3,000원 감면 가능</p>
                    </div>
                    <span className="debug-info-badge" style={{ fontSize: '0.8rem' }}>WELCOME3000</span>
                  </div>
                </div>
              )}

              {/* Customer Reviews View */}
              {activeTab === 'reviews' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem' }}>실시간 배달 솔직 후기</h3>
                  <div className="empty-placeholder">
                    <p>등록된 전체 배달 후기가 없습니다. 주문 후 첫 소감을 남겨보세요!</p>
                  </div>
                </div>
              )}

              {/* Customer Center & Calendar Events (SEC-117) */}
              {activeTab === 'customer-center' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem' }}>단체 주문 예약 플래너</h3>
                  
                  <div className="review-form-box" style={{ border: '1px solid var(--border-light)', padding: '1.2rem', borderRadius: '10px', backgroundColor: 'var(--bg-gray)' }}>
                    <h4 style={{ fontWeight: 800, marginBottom: '0.4rem' }}>새 예약 주문 스케줄 생성</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.8rem' }}>
                      원하는 날짜와 시간에 단체 식사를 배달 받도록 사전 스케줄을 달력에 등록해 보아주세요.
                    </p>

                    <div className="form-group">
                      <label className="form-label">예약 배달 일자</label>
                      <input type="date" className="form-input" value={calDateInput} onChange={(e) => setCalDateInput(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">예약 배달 시간</label>
                      <input type="time" className="form-input" value={calTimeInput} onChange={(e) => setCalTimeInput(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">예약 모임 제목</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="예: 마케팅팀 정기 회식 배달"
                        value={calTitleInput}
                        onChange={(e) => setCalTitleInput(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <button className="btn-small-secondary" onClick={handleCalPreview}>예약 캘린더 매핑 미리보기</button>
                    </div>

                    {calPreviewOutput && (
                      <div className="preview-container">
                        <span className="preview-badge">일정 매핑 미리보기</span>
                        <p style={{ fontSize: '0.8rem' }}>
                          일정 타이틀: <span dangerouslySetInnerHTML={{ __html: calPreviewOutput }} />
                          {renderBugBadge(
                            'site012-bug07',
                            'SEC-117',
                            '/api/calendar/preview',
                            'title',
                            '예약 주문 캘린더 생성기 요약 탭 렌더 시, 예약 목적 제목 문자열에 특수 문자 처리를 건너뜁니다.'
                          )}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '0.2rem' }}>예약 일시: {calDateInput} {calTimeInput}</p>
                        <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.6rem' }} onClick={handleCalSubmit}>
                          해당 캘린더 스케줄 정식 확정
                        </button>
                      </div>
                    )}
                  </div>

                  <h4 style={{ fontWeight: 800, margin: '1.5rem 0 0.8rem' }}>8월 예약 주문 배달 스케줄 달력</h4>
                  <div className="calendar-grid">
                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                      <div key={d} className="calendar-header-day">{d}</div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                      const eventsOnDay = calendarEventsList.filter(e => e.date === dateStr);
                      return (
                        <div key={dayNum} className={`calendar-day-cell ${eventsOnDay.length > 0 ? 'active' : ''}`}>
                          <span>{dayNum}</span>
                          {eventsOnDay.map(e => (
                            <span key={e.id} className="calendar-badge" dangerouslySetInnerHTML={{ __html: e.title }} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Owner Console Views: CSV upload (SEC-119), Sales Analytics Filters (SEC-118) */}
              {activeTab === 'owner-console' && (
                <div className="owner-console-layout">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>📊 나의 주문 및 소비 분석 대시보드</h3>
                  
                  {/* CSV Upload tool (SEC-119) */}
                  <div className="console-card">
                    <h4 style={{ fontWeight: 800, marginBottom: '0.4rem' }}>📁 단체 주문 멤버 명단 등록 (CSV 일괄 업로드)</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>
                      단체 주문할 친구들의 이메일과 희망 메뉴가 정리된 CSV 파일을 업로드하여 일괄 등록합니다.
                    </p>

                    <div className="form-group">
                      <input
                        type="file"
                        className="form-input"
                        onChange={handleCSVFileChange}
                      />
                    </div>

                    {csvPreviewOutput && (
                      <div className="preview-container">
                        <span className="preview-badge">CSV 업로드 완료 명세 미리보기</span>
                        <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                          <p>
                            파싱된 파일명: <strong dangerouslySetInnerHTML={{ __html: csvPreviewOutput.filename }} />
                            {renderBugBadge(
                              'site012-bug09',
                              'SEC-119',
                              '/api/menu/csv/preview',
                              'filename',
                              '점주 메뉴판 대량 등록 CSV 파일 업로드 미리보기 명세 렌더링 영역 내 파일명 매핑 시 이스케이프 처리가 결핍되어 있습니다.'
                            )}
                          </p>
                          <p>파싱 상태: 수신 완료 ({csvPreviewOutput.lines}개 아이템 인식)</p>
                        </div>
                        <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.6rem' }} onClick={handleCSVUploadConfirm}>
                          단체 주문 멤버 데이터 등록 반영
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sales Report Filter (SEC-118) */}
                  <div className="console-card">
                    <h4 style={{ fontWeight: 800, marginBottom: '0.4rem' }}>📈 나의 지출 통계 리포트 상세 필터링</h4>
                    
                    <div style={{ display: 'flex', gap: '0.4rem', margin: '0.8rem 0' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                        placeholder="소비 필터 키워드 입력..."
                        value={reportFilterInput}
                        onChange={(e) => setReportFilterInput(e.target.value)}
                      />
                      <button className="btn-small-primary" onClick={handleReportFilter}>필터 적용</button>
                    </div>

                    {reportFilterPreviewOutput && (
                      <div className="report-header-banner">
                        정밀 필터 조건: "<span dangerouslySetInnerHTML={{ __html: reportFilterPreviewOutput }} />" 리포트 현황
                        {renderBugBadge(
                          'site012-bug08',
                          'SEC-118',
                          '/api/reports',
                          'filter',
                          '점주 매출 분석 보고서 검색 키워드 필터 요약 표시 시, 특수 문자 변환 누락으로 반사 XSS 취약성을 띱니다.'
                        )}
                      </div>
                    )}

                    <table className="console-table">
                      <thead>
                        <tr>
                          <th>조회 일자</th>
                          <th>모의 주문 수량 (건)</th>
                          <th>모의 총 지출액</th>
                          <th>선호 주문 메뉴</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportList.map((r, i) => (
                          <tr key={i}>
                            <td>{r.date}</td>
                            <td>{r.ordersCount} 건</td>
                            <td>₩{r.salesAmount.toLocaleString()}</td>
                            <td>{r.popularMenu}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Admin Panel & API Test Console query (SEC-120), Push notifications (SEC-116) */}
              {activeTab === 'admin-console' && (
                <div className="owner-console-layout">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>🛠️ QuickDelivery OpenAPI 연동 콘솔</h3>
                  
                  {/* Push Noti preview (SEC-116) */}
                  <div className="console-card">
                    <h4 style={{ fontWeight: 800, marginBottom: '0.4rem' }}>📢 커스텀 알림 발송 및 알림창 데모 테스트</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>
                      원하는 텍스트로 커스텀 푸시 알림 배너를 미리 디자인해 볼 수 있습니다.
                    </p>
                    
                    <div className="form-group">
                      <label className="form-label">알림 배너 제목</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="예: 8월 특별 폭염 배달팁 전액 지원!"
                        value={notiTitleInput}
                        onChange={(e) => setNotiTitleInput(e.target.value)}
                      />
                    </div>
                    <div>
                      <button className="btn-small-secondary" onClick={handleNotiPreview}>알림 배너 레이아웃 미리보기</button>
                    </div>

                    {notiPreviewOutput && (
                      <div className="preview-container">
                        <span className="preview-badge">알림 렌더링 미리보기</span>
                        <div style={{ background: 'var(--primary-mint)', color: 'var(--primary-white)', padding: '0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                          <span dangerouslySetInnerHTML={{ __html: notiPreviewOutput }} />
                          {renderBugBadge(
                            'site012-bug06',
                            'SEC-116',
                            '/api/notifications/preview',
                            'title',
                            '관리자 플랫폼 공지 푸시 알림 미리보기 배너 내 제목에 Escape를 생략하고 바인딩합니다.'
                          )}
                        </div>
                        <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.6rem', backgroundColor: 'var(--text-dark)' }} onClick={handleNotiSubmit}>
                          데모 알림 발송 완료
                        </button>
                      </div>
                    )}
                  </div>

                  {/* API System Debug tool (SEC-120) */}
                  <div className="console-card">
                    <h4 style={{ fontWeight: 800, marginBottom: '0.4rem' }}>⚙️ 외부 연동용 API Query Gate 테스트</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.8rem' }}>
                      스마트 홈 서비스 또는 자동화 기기와 QuickDelivery의 연동 상태 조회를 위한 테스트 쿼리를 입력합니다.
                    </p>

                    <div className="form-group">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="SELECT * FROM mock_nodes WHERE status = 'active';"
                        value={consoleQueryInput}
                        onChange={(e) => setConsoleQueryInput(e.target.value)}
                      />
                    </div>
                    <div>
                      <button className="btn-small-primary" onClick={handleAPIConsoleQuery}>테스트 쿼리 컴파일 실행</button>
                    </div>

                    {consoleQueryOutput && (
                      <div className="preview-container" style={{ backgroundColor: '#1A1A1A', color: '#00FF00', border: '1px solid #333' }}>
                        <span className="preview-badge" style={{ backgroundColor: '#333' }}>CONSOLE OUTPUT LOG</span>
                        <pre style={{ fontSize: '0.75rem', fontFamily: 'monospace', overflowX: 'auto', marginTop: '0.4rem' }}>
                          $ query run --debug
                          Executed Query: <span dangerouslySetInnerHTML={{ __html: consoleQueryOutput.q }} />
                          {renderBugBadge(
                            'site012-bug10',
                            'SEC-120',
                            '/api/tools/query',
                            'q',
                            '관리자 전용 시스템 API 도구 디버깅 쿼리 텍스트를 출력 로그 영역에 인코딩 없이 echo 출력합니다.'
                          )}
                          {"\n"}Status: {consoleQueryOutput.status}
                          {"\n"}Time: {consoleQueryOutput.executedAt}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* My Page Settings & Safe mode filter */}
              {activeTab === 'my-page' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem' }}>나의 계정 및 환경설정</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="console-card">
                        <h4 style={{ fontWeight: 800, marginBottom: '0.6rem' }}>기본 배송 정보</h4>
                        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <p>회원 닉네임: <strong>{profile.nickname}</strong></p>
                          <p>연락처 이메일: <strong>{profile.email}</strong></p>
                          <p>배달받을 주소지: <strong>{profile.address}</strong></p>
                        </div>
                      </div>

                      {/* User-facing Security Preferences (Toggles safe-mode) */}
                      <div className="console-card" style={{ border: '2px solid var(--primary-mint)', backgroundColor: 'var(--light-mint)' }}>
                        <h4 style={{ fontWeight: 800, color: 'var(--dark-mint)', marginBottom: '0.4rem' }}>🔒 안심 배달 시스템 환경설정</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', lineHeight: '1.4', marginBottom: '0.8rem' }}>
                          플랫폼 내 입력 정보 검증 가드 필터 설정을 변경합니다. 안심 필터가 적용되면 안전 이스케이핑 인코딩이 활성화되어 공격 위험을 제어합니다.
                        </p>
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-dark)', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            checked={profile.isSafeFilterEnabled}
                            onChange={(e) => {
                              setProfile(prev => ({ ...prev, isSafeFilterEnabled: e.target.checked }));
                              setSuccessAlert(`안심 입력 보안 필터링이 ${e.target.checked ? '활성화' : '비활성화'}되었습니다.`);
                            }}
                          />
                          안심 입력 보안 필터 적용 (Safe Input Guard ON)
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className="sidebar-card">
                        <h4 style={{ fontWeight: 800, marginBottom: '0.6rem' }}>계정 세션</h4>
                        <button className="btn-small-primary" style={{ width: '100%', backgroundColor: 'var(--accent-orange)' }} onClick={() => setIsLoggedIn(false)}>
                          로그아웃 (Sign Out)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar Widgets */}
        <aside className="right-sidebar">
          
          {/* Real-time Order Tracker widget */}
          <div className="widget-box">
            <h3 className="widget-title">🛵 배달 주문 상황</h3>
            {orders.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>최근 주문 완료건이 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-mint)' }}>{orders[0].status}</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>{orders[0].restaurantName}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>{orders[0].menuSummary}</p>
                <button style={{ alignSelf: 'flex-start', color: 'var(--text-gray)', fontSize: '0.7rem', textDecoration: 'underline', marginTop: '0.2rem' }} onClick={() => setActiveTab('order-history')}>상세 추적하기</button>
              </div>
            )}
          </div>

          {/* Invitation Widget (SEC-112) */}
          <div className="widget-box" style={{ border: '1px dashed var(--primary-mint)', background: '#FAFFFE' }}>
            <h3 className="widget-title">🎁 친구 초대하고 3,000원 쿠폰</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', lineHeight: '1.4', marginBottom: '0.5rem' }}>
              친구를 초대하여 모의 배달 할인 쿠폰을 받아보세요.
            </p>
            
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                value={inviteMsgInput}
                onChange={(e) => setInviteMsgInput(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button className="btn-small-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={handleInvitationPreview}>요약 미리보기</button>
            </div>

            {invitePreviewOutput && (
              <div className="preview-container" style={{ padding: '0.6rem', marginTop: '0.4rem' }}>
                <span className="preview-badge" style={{ fontSize: '0.6rem' }}>초대장 본문</span>
                <p style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                  <span dangerouslySetInnerHTML={{ __html: invitePreviewOutput }} />
                  {renderBugBadge(
                    'site012-bug02',
                    'SEC-112',
                    '/api/invitations/preview',
                    'message',
                    '친구 초대용 메시지 템플릿 정보 카드 렌더 시, HTML 기호를 치환하지 않아 Reflected XSS 취약점이 존재합니다.'
                  )}
                </p>
                <button className="btn-small-primary" style={{ width: '100%', padding: '0.3rem', fontSize: '0.7rem', marginTop: '0.4rem' }} onClick={handleInvitationSend}>
                  링크 발송 완료
                </button>
              </div>
            )}
          </div>

          {/* Platform Notice Lists */}
          <div className="widget-box">
            <h3 className="widget-title">🔔 플랫폼 긴급 알림</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {notificationsList.map(n => (
                <div key={n.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: n.title }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-gray)' }}>{n.date}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* ==========================================================================
         Interactive Debug Alert Popup Modal Overlay
         ========================================================================== */}
      {debugModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={() => setDebugModal(null)}>×</button>
            <h3 className="debug-alert-title">
              ⚡ [안심 검증 로그] Reflected XSS 취약점 검출 알림
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
              <p style={{ color: 'var(--text-dark)', lineHeight: '1.4' }}>
                백엔드 보안 이스케이프 가드가 차단되어, 입력값이 변환되지 않고 **실행 가능한 DOM Sink**로 삽입되었습니다. PPO 에이전트 자동화 모의 탐지 기준에 정상 반영됩니다.
              </p>

              <table className="debug-info-table">
                <tbody>
                  <tr>
                    <td>Bug ID:</td>
                    <td><span className="debug-info-badge">{debugModal.bugId}</span></td>
                  </tr>
                  <tr>
                    <td>CSV ID (SEC):</td>
                    <td><span className="debug-info-badge">{debugModal.csvId}</span></td>
                  </tr>
                  <tr>
                    <td>발생 API 경로:</td>
                    <td style={{ color: 'var(--accent-orange)', fontFamily: 'monospace' }}>{debugModal.endpoint}</td>
                  </tr>
                  <tr>
                    <td>취약 매개변수:</td>
                    <td style={{ fontWeight: 700 }}>{debugModal.parameter}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: 'top' }}>취약 상세 설명:</td>
                    <td style={{ color: 'var(--text-gray)', lineHeight: '1.4' }}>{debugModal.description}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ backgroundColor: '#FFFEE2', border: '1px solid #FFECA8', color: '#856404', padding: '0.7rem', borderRadius: '6px', fontSize: '0.75rem', lineHeight: '1.4', marginTop: '0.3rem' }}>
                🔔 <strong>알림:</strong> 본 알림은 디버깅 검출 안내 전용 팝업입니다. 자동 PPO 에이전트 실행 환경에서는 DOM 속성이나 API 응답에 bugId 등의 정답 문자열이 포함되지 않도록 원천 차단하여 학습 누출을 완벽하게 방지합니다.
              </div>
            </div>
            
            <button className="btn-small-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.6rem' }} onClick={() => setDebugModal(null)}>
              디버그 로그 확인 완료
            </button>
          </div>
        </div>
      )}

      {/* Success Platform notifications toast */}
      {successAlert && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '350px', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--primary-mint)', fontWeight: 800, marginBottom: '0.5rem' }}>알림</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>{successAlert}</p>
            <button className="btn-small-primary" style={{ width: '100%' }} onClick={() => setSuccessAlert(null)}>확인</button>
          </div>
        </div>
      )}

      {/* Error Platform notifications toast */}
      {errorAlert && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '350px', textAlign: 'center', borderColor: 'var(--accent-orange)' }}>
            <h4 style={{ color: 'var(--accent-orange)', fontWeight: 800, marginBottom: '0.5rem' }}>경고</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>{errorAlert}</p>
            <button className="btn-small-primary" style={{ width: '100%', backgroundColor: 'var(--accent-orange)' }} onClick={() => setErrorAlert(null)}>확인</button>
          </div>
        </div>
      )}

    </div>
  );
}
