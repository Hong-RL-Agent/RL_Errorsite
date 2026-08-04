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
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('home');
  const [currentGender, setCurrentGender] = useState('women');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedBrandId, setSelectedBrandId] = useState(null);

  // Settings for testing / debugging
  const [isDevMode, setIsDevMode] = useState(false);
  const [isSafeMode, setIsSafeMode] = useState(false);

  // General App State
  const [userRole, setUserRole] = useState('customer'); // customer, seller, admin
  const [isLoggedIn, setIsLoggedIn] = useState(true); // initially true for demonstration
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);

  // Data lists
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({ username: 'customer', nickname: '스타일리스트_주이', email: 'customer@fashionmall.co.kr', address: '서울특별시 강남구 신사동 542-12 3층' });
  const [notices, setNotices] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  // Vulnerability Fields & Output Buffer States
  // 1. Login XSS (SEC-101)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPreviewUsername, setLoginPreviewUsername] = useState('');

  // 2. Signup XSS (SEC-102)
  const [signupNickname, setSignupNickname] = useState('');
  const [signupPreviewNickname, setSignupPreviewNickname] = useState('');

  // 3. Address XSS (SEC-103)
  const [addressInput, setAddressInput] = useState('');
  const [addressPreviewOutput, setAddressPreviewOutput] = useState('');

  // 4. Coupon XSS (SEC-104)
  const [couponInput, setCouponInput] = useState('');
  const [couponPreviewOutput, setCouponPreviewOutput] = useState(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // 5. Sort XSS (SEC-105)
  const [sortValue, setSortValue] = useState('');
  const [sortPreviewOutput, setSortPreviewOutput] = useState('');

  // 6. Page XSS (SEC-106)
  const [pageValue, setPageValue] = useState('1');
  const [pagePreviewOutput, setPagePreviewOutput] = useState('');

  // 7. File Upload XSS (SEC-107)
  const [filenameInput, setFilenameInput] = useState('');
  const [filenamePreviewOutput, setFilenamePreviewOutput] = useState(null);

  // 8. Chat XSS (SEC-108)
  const [chatInput, setChatInput] = useState('');
  const [chatPreviewOutput, setChatPreviewOutput] = useState('');

  // 9. Notice Search XSS (SEC-109)
  const [noticeSearchInput, setNoticeSearchInput] = useState('');
  const [noticeSearchPreviewOutput, setNoticeSearchPreviewOutput] = useState('');

  // 10. Review XSS (SEC-110)
  const [reviewContentInput, setReviewContentInput] = useState('');
  const [reviewPreviewOutput, setReviewPreviewOutput] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // Debug popup state
  const [debugModal, setDebugModal] = useState(null); // { bugId, csvId, endpoint, parameter, description }

  // Initial Fetches
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const bRes = await fetch('/api/brands');
      const bData = await bRes.json();
      setBrands(bData);

      const pRes = await fetch('/api/products');
      const pData = await pRes.json();
      setProducts(pData.products);

      const profRes = await fetch('/api/profile');
      const profData = await profRes.json();
      setProfile(profData);
      setAddressInput(profData.address);

      const cartRes = await fetch('/api/cart');
      const cartData = await cartRes.json();
      setCartItems(cartData);

      const orderRes = await fetch('/api/orders');
      const orderData = await orderRes.json();
      setOrders(orderData);

      // Initialize notices from standard search (blank query)
      const noticeRes = await fetch('/api/notices/search');
      const noticeData = await noticeRes.json();
      setNotices(noticeData.notices);

      // Initialize chat with default welcome
      setChatMessages([
        { id: 1, sender: 'CS_BOT', text: '안녕하세요! FashionMall 1:1 실시간 상담봇입니다. 사이즈 추천, 배송 상태 등 문의사항을 남겨주시면 상담원이 빠르게 안내해 드립니다.', time: '오후 1:00' }
      ]);
    } catch (err) {
      console.error('Error fetching initial data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug check logic helper (Dev Mode triggers)
  const triggerDebugCheck = (bugId, csvId, endpoint, parameter, description) => {
    if (isDevMode) {
      setDebugModal({
        bugId,
        csvId,
        endpoint,
        parameter,
        description
      });
    }
  };

  // ----------------------------------------------------
  // API Call Actions
  // ----------------------------------------------------

  // 1. Login preview
  const handleLoginPreview = async () => {
    if (!loginUsername) return;
    const apiPath = isSafeMode ? `/api/safe/login?username=${encodeURIComponent(loginUsername)}` : '/api/login/preview';
    try {
      let data;
      if (isSafeMode) {
        const res = await fetch(apiPath);
        data = await res.json();
      } else {
        const res = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: loginUsername })
        });
        data = await res.json();
      }
      setLoginPreviewUsername(data.username);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site011-bug01',
          'SEC-101',
          '/api/login/preview',
          'username',
          '로그인 양식 입력 값을 HTML 이스케이프 없이 세션 확인 미리보기 렌더링 카드에 직접 삽입합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSubmit = () => {
    if (!loginPreviewUsername) return;
    // Strip HTML tags for mock validation logic check
    const rawUsername = loginPreviewUsername.replace(/<[^>]*>/g, '').trim().toLowerCase();
    
    if (rawUsername === 'admin') {
      setUserRole('admin');
      setProfile(prev => ({ ...prev, username: 'admin', nickname: '최고관리자(Admin)' }));
      setIsLoggedIn(true);
      setSuccessAlert('관리자 계정으로 로그인하였습니다.');
    } else if (rawUsername === 'seller') {
      setUserRole('seller');
      setProfile(prev => ({ ...prev, username: 'seller', nickname: 'BlankNoir_판매자' }));
      setIsLoggedIn(true);
      setSuccessAlert('판매자 파트너 계정으로 로그인하였습니다.');
    } else if (rawUsername === 'customer') {
      setUserRole('customer');
      setProfile(prev => ({ ...prev, username: 'customer', nickname: '스타일리스트_주이' }));
      setIsLoggedIn(true);
      setSuccessAlert('일반 고객 계정으로 로그인하였습니다.');
    } else {
      setErrorMessage('가입되지 않은 회원 계정 정보입니다. (테스트 Mock 계정인 admin, seller, customer 중 하나로 입력해 주세요.)');
      setLoginUsername('');
      setLoginPreviewUsername('');
      return;
    }
    
    setLoginUsername('');
    setLoginPreviewUsername('');
    setActiveTab('home');
  };

  // 2. Signup preview
  const handleSignupPreview = async () => {
    if (!signupNickname) return;
    const apiPath = isSafeMode ? '/api/safe/signup' : '/api/signup/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: signupNickname })
      });
      const data = await res.json();
      setSignupPreviewNickname(data.nickname);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site011-bug02',
          'SEC-102',
          '/api/signup/preview',
          'nickname',
          '회원가입 별명 입력 필드 값을 HTML 이스케이프 처리하지 않은 채 가입 프로필 요약 카드에 렌더링합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignupSubmit = () => {
    if (!signupPreviewNickname) return;
    setProfile(prev => ({
      ...prev,
      nickname: signupPreviewNickname,
      username: 'new_member'
    }));
    setIsLoggedIn(true);
    setSignupNickname('');
    setSignupPreviewNickname('');
    setSuccessAlert('성공적으로 가입되어 자동으로 로그인되었습니다!');
    setActiveTab('home');
  };

  // 3. Address preview
  const handleAddressPreview = async () => {
    if (!addressInput) return;
    const apiPath = isSafeMode ? '/api/safe/address' : '/api/address/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressInput })
      });
      const data = await res.json();
      setAddressPreviewOutput(data.address);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site011-bug03',
          'SEC-103',
          '/api/address/preview',
          'address',
          '배송지 주소 양식에 기재한 원시 값을 필터링하지 않고 배송 위치 확인 요약 탭에 주입합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddressSubmit = () => {
    if (!addressPreviewOutput) return;
    setProfile(prev => ({ ...prev, address: addressPreviewOutput }));
    setAddressPreviewOutput('');
    setSuccessAlert('배송 주소록 설정이 성공적으로 업데이트되었습니다.');
  };

  // 4. Coupon preview
  const handleCouponPreview = async () => {
    if (!couponInput) return;
    const apiPath = isSafeMode ? '/api/safe/coupon' : '/api/coupon/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponInput })
      });
      const data = await res.json();
      setCouponPreviewOutput(data);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site011-bug04',
          'SEC-104',
          '/api/coupon/preview',
          'couponCode',
          '쿠폰 코드 입력값을 HTML Escape 필터링 없이 쿠폰 적용 시뮬레이터 요약 화면에 그대로 출력합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCouponApply = () => {
    if (!couponPreviewOutput) return;
    // Strip HTML tags to extract raw code for mock evaluation
    const rawCode = couponPreviewOutput.couponCode.replace(/<[^>]*>/g, '').trim().toUpperCase();
    
    if (rawCode === 'FWWELCOME' || rawCode === 'MOCKSPECIAL') {
      const discountVal = rawCode === 'MOCKSPECIAL' ? 20000 : 10000;
      setAppliedDiscount(discountVal);
      setSuccessAlert(`[${rawCode}] 쿠폰 할인이 최종 주문액에 정상 반영되었습니다.`);
    } else {
      setErrorMessage('존재하지 않거나 유효하지 않은 쿠폰입니다. (공식 쿠폰 코드인 FWWELCOME 또는 MOCKSPECIAL을 입력해 주세요.)');
    }
    setCouponInput('');
    setCouponPreviewOutput(null);
  };

  // 5. Product sorting
  const handleProductSort = async (sortType) => {
    setIsLoading(true);
    setSortValue(sortType);
    const apiPath = isSafeMode ? `/api/safe/products?sort=${encodeURIComponent(sortType)}` : `/api/products/sort?sort=${encodeURIComponent(sortType)}`;
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      setSortPreviewOutput(data.sort);

      // Perform local sort to ensure functional alignment
      let sorted = [...products];
      if (sortType === 'price-low') {
        sorted.sort((a, b) => a.price - b.price);
      } else if (sortType === 'price-high') {
        sorted.sort((a, b) => b.price - a.price);
      } else if (sortType === 'popular') {
        sorted.sort((a, b) => b.likes - a.likes);
      }
      setProducts(sorted);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site011-bug05',
          'SEC-105',
          '/api/products/sort',
          'sort',
          '정렬 타입 쿼리 파라미터를 그대로 읽어와 카탈로그 상단의 정렬 상태 안내 텍스트 영역에 Escape 처리 없이 삽입합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 300); // realistic spinner
    }
  };

  // 6. Pagination
  const handleProductPage = async (pageNumber) => {
    setIsLoading(true);
    setPageValue(String(pageNumber));
    const apiPath = isSafeMode ? `/api/safe/products?page=${encodeURIComponent(pageNumber)}` : `/api/products/page?page=${encodeURIComponent(pageNumber)}`;
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      setPagePreviewOutput(data.page);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site011-bug06',
          'SEC-106',
          '/api/products/page',
          'page',
          '페이지 선택 쿼리 파라미터를 HTML 이스케이프 과정 없이 카탈로그 상단의 현재 활성화 페이지 뱃지 텍스트에 삽입합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // 7. File Name upload preview
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFilenameInput(file.name);

    const apiPath = isSafeMode ? '/api/safe/upload' : '/api/upload/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      });
      const data = await res.json();
      setFilenamePreviewOutput(data);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site011-bug07',
          'SEC-107',
          '/api/upload/preview',
          'filename',
          '업로드한 로컬 파일명을 검증 없이 파일 업로드 성공 대기 화면(HTML 구조)에 반사 출력합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUploadConfirm = () => {
    if (!filenamePreviewOutput) return;
    setSuccessAlert(`파일 '${filenamePreviewOutput.filename}'의 업로드가 정식 완료되었습니다! (판매자 상품 보관함 등록 완료)`);
    setFilenameInput('');
    setFilenamePreviewOutput(null);
  };

  // 8. Chat preview
  const handleChatPreview = async () => {
    if (!chatInput) return;
    const apiPath = isSafeMode ? '/api/safe/chat' : '/api/chat/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await res.json();
      setChatPreviewOutput(data.message);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site011-bug08',
          'SEC-108',
          '/api/chat/preview',
          'message',
          '채팅 전송 전 임시 미리보기 렌더링 과정에서 입력 내용의 HTML 문자를 여과 없이 대화 거품 돔에 연결시킵니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatSubmit = () => {
    if (!chatPreviewOutput) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'USER', text: chatPreviewOutput, time: timeStr }
    ]);
    setChatInput('');
    setChatPreviewOutput('');

    // Mock automatic responder for realistic flows
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'CS_BOT', text: '문의 내용을 상담사 대기열에 추가했습니다. 담당 상담사가 배정되는 대로 안내드리겠습니다.', time: timeStr }
      ]);
    }, 1000);
  };

  // 9. Notices search
  const handleNoticeSearch = async () => {
    const apiPath = isSafeMode ? `/api/safe/notices/search?keyword=${encodeURIComponent(noticeSearchInput)}` : `/api/notices/search?keyword=${encodeURIComponent(noticeSearchInput)}`;
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      setNoticeSearchPreviewOutput(data.keyword);
      if (data.notices) {
        setNotices(data.notices);
      }

      if (!isSafeMode) {
        triggerDebugCheck(
          'site011-bug09',
          'SEC-109',
          '/api/notices/search',
          'keyword',
          '공지사항 검색어의 값을 HTML 이스케이프 처리 없이 검색 결과 칩 영역에 삽입합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 10. Review preview
  const handleReviewPreview = async () => {
    if (!reviewContentInput) return;
    const apiPath = isSafeMode ? '/api/safe/reviews' : '/api/reviews/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reviewContentInput })
      });
      const data = await res.json();
      setReviewPreviewOutput(data.content);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site011-bug10',
          'SEC-110',
          '/api/reviews/preview',
          'content',
          '상품 후기 리뷰 등록 미리보기 카드에 작성자의 후기 텍스트를 이스케이프 없이 즉각 출력합니다.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = () => {
    if (!reviewPreviewOutput) return;
    const newRev = {
      id: Date.now(),
      productId: selectedProductId || 1,
      author: profile.nickname || '익명고객',
      rating: reviewRating,
      content: reviewPreviewOutput,
      date: new Date().toISOString().split('T')[0]
    };
    setReviews(prev => [newRev, ...prev]);
    setReviewContentInput('');
    setReviewPreviewOutput('');
    setSuccessAlert('리뷰가 정상 등록되었습니다.');
  };

  // ----------------------------------------------------
  // Simple functional logic
  // ----------------------------------------------------
  const handleAddToCart = (prodId, size) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    const existing = cartItems.find(item => item.productId === prodId && item.size === size);
    if (existing) {
      setCartItems(prev => prev.map(item =>
        (item.productId === prodId && item.size === size) ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems(prev => [
        ...prev,
        { id: Date.now(), productId: prodId, name: prod.name, price: prod.price, quantity: 1, size: size }
      ]);
    }
    setSuccessAlert('상품이 장바구니에 담겼습니다.');
  };

  const handleRemoveFromCart = (cartId) => {
    setCartItems(prev => prev.filter(item => item.id !== cartId));
  };

  const handleCheckoutSubmit = () => {
    if (cartItems.length === 0) return;
    const finalAmt = cartItems.reduce((acc, c) => acc + (c.price * c.quantity), 0) - appliedDiscount;
    const newOrd = {
      orderId: `FM-2026-0802-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      productName: cartItems[0].name + (cartItems.length > 1 ? ` 외 ${cartItems.length - 1}건` : ''),
      amount: finalAmt > 0 ? finalAmt : 0,
      address: profile.address,
      status: '결제완료'
    };
    setOrders(prev => [newOrd, ...prev]);
    setCartItems([]);
    setAppliedDiscount(0);
    setSuccessAlert('모의 주문 결제가 완료되었습니다!');
    setActiveTab('orders');
  };

  // Category genders filter simulation
  const filteredProducts = selectedBrandId
    ? products.filter(p => p.brandId === selectedBrandId)
    : products;

  return (
    <div className="layout-root">
      
      {/* 1. Main Header */}
      <header className="main-header">
        <div className="header-left">
          <a href="#" className="logo-container" onClick={(e) => { e.preventDefault(); setActiveTab('home'); setSelectedProductId(null); setSelectedBrandId(null); }}>
            FashionMall<span className="logo-dot"></span>
          </a>
          <nav className="header-categories">
            {['women', 'men', 'life'].map(g => (
              <button
                key={g}
                className={`category-tab ${currentGender === g ? 'active' : ''}`}
                onClick={() => { setCurrentGender(g); setActiveTab('best'); }}
              >
                {g}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <div className="nav-icons-group">
            <button className={`dev-mode-btn ${isDevMode ? 'active' : ''}`} onClick={() => setIsDevMode(!isDevMode)}>
              {isDevMode ? '🔧 DEV PANEL CLOSE' : '🔧 DEV MODE'}
            </button>
            
            <button className="icon-btn" onClick={() => setActiveTab('customer-center')}>
              <BellIcon />
              {notices.length > 0 && <span className="badge">{notices.length}</span>}
            </button>

            <button className="icon-btn" onClick={() => setActiveTab('cart')}>
              <CartIcon />
              {cartItems.length > 0 && <span className="badge">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>}
            </button>
          </div>

          <div className="user-profile-controls">
            <select
              className="role-switcher"
              value={userRole}
              onChange={(e) => {
                setUserRole(e.target.value);
                setSuccessAlert(`역할이 ${e.target.value === 'admin' ? '관리자' : e.target.value === 'seller' ? '판매자' : '고객'}로 변경되었습니다.`);
              }}
            >
              <option value="customer">고객 (Customer)</option>
              <option value="seller">판매자 (Seller)</option>
              <option value="admin">관리자 (Admin)</option>
            </select>
            
            <div className="user-avatar-info" onClick={() => setActiveTab('my-page')} style={{ cursor: 'pointer' }}>
              <div className="avatar">
                {userRole === 'admin' ? 'AD' : userRole === 'seller' ? 'SE' : 'CU'}
              </div>
              <span className="nickname-display">{profile.nickname}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Expanded Developer Panel Control Bar */}
      {isDevMode && (
        <div className="dev-panel-bar">
          <div className="dev-panel-left">
            <span>⚙️ 개발자 제어 옵션</span>
            <label className="dev-checkbox-label">
              <input
                type="checkbox"
                checked={isSafeMode}
                onChange={(e) => {
                  setIsSafeMode(e.target.checked);
                  setSuccessAlert(`보안 필터링 (Safe HTML Encoding)이 ${e.target.checked ? '활성화' : '비활성화'}되었습니다.`);
                }}
              />
              보안 코딩 필터 적용 (Safe Mode)
            </label>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#888' }}>
            * 비활성화 시 취약 preview 렌더 시 팝업 맵핑 알림이 발송됩니다.
          </span>
        </div>
      )}

      {/* 3. Main Dashboard */}
      <div className="app-container">
        
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-card">
            <ul className="sidebar-menu">
              <li className={`menu-item ${activeTab === 'home' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('home'); setSelectedProductId(null); setSelectedBrandId(null); }}>🏠 HOME</button>
              </li>
              <li className={`menu-item ${activeTab === 'brand-shop' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('brand-shop'); setSelectedProductId(null); }}>🏷️ BRAND SHOP</button>
              </li>
              <li className={`menu-item ${activeTab === 'best' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('best'); setSelectedProductId(null); setSelectedBrandId(null); }}>🔥 BEST SELLERS</button>
              </li>
              <li className={`menu-item ${activeTab === 'new' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('new'); setSelectedProductId(null); setSelectedBrandId(null); }}>✨ NEW ARRIVALS</button>
              </li>
              <li className={`menu-item ${activeTab === 'lookbook' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('lookbook'); setSelectedProductId(null); setSelectedBrandId(null); }}>📖 LOOKBOOK</button>
              </li>
              <li className={`menu-item ${activeTab === 'sale' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('sale'); setSelectedProductId(null); setSelectedBrandId(null); }}>📉 SEASON SALE</button>
              </li>
              <li className={`menu-item ${activeTab === 'coupons' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('coupons'); setSelectedProductId(null); setSelectedBrandId(null); }}>🎟️ DISCOUNT COUPONS</button>
              </li>
              <li className={`menu-item ${activeTab === 'customer-center' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('customer-center'); setSelectedProductId(null); setSelectedBrandId(null); }}>💬 CUSTOMER CENTER</button>
              </li>
              {userRole === 'seller' && (
                <li className={`menu-item ${activeTab === 'seller-dashboard' ? 'active' : ''}`}>
                  <button onClick={() => { setActiveTab('seller-dashboard'); setSelectedProductId(null); setSelectedBrandId(null); }}>👔 SELLER CONSOLE</button>
                </li>
              )}
            </ul>
          </div>

          <div className="sidebar-card">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '0.5px' }}>MY QUICK STATS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-gray)' }}>보유 쿠폰</span>
                <span style={{ fontWeight: 700 }}>2 장</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-gray)' }}>장바구니</span>
                <span style={{ fontWeight: 700 }}>{cartItems.length} 개</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Main View Column */}
        <main className="center-content">
          {isLoading ? (
            <div className="empty-placeholder">
              <div className="loading-spinner"></div>
              <p>패션 컬렉션 데이터를 로딩 중입니다...</p>
            </div>
          ) : errorMessage ? (
            <div className="error-banner">
              <strong>오류: </strong> {errorMessage}
              <button style={{ marginLeft: '1rem', textDecoration: 'underline' }} onClick={() => setErrorMessage(null)}>확인</button>
            </div>
          ) : (
            <>
              {/* Home View */}
              {activeTab === 'home' && (
                <div>
                  <div className="hero-banner">
                    <div className="hero-overlay"></div>
                    <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80" alt="New Season F/W" className="hero-img" />
                    <div className="hero-content">
                      <span className="hero-subtitle">2026 F/W NEW SEASON RUNWAY</span>
                      <h2 className="hero-title">Elegance in Minimalism</h2>
                      <p className="hero-desc">절제된 실루엣과 고급 원사 본연의 매력을 담아낸 에센셜 컬렉션을 선보입니다. 시즌 전 상품 10% 웰컴 세일 쿠폰 코드를 확인하세요.</p>
                      <button className="hero-btn" onClick={() => setActiveTab('new')}>SHOP THE RUNWAY</button>
                    </div>
                  </div>

                  <div className="section-header">
                    <h3 className="section-title">CHOOSE BRANDS</h3>
                    <button style={{ fontSize: '0.75rem', fontWeight: 600 }} onClick={() => setActiveTab('brand-shop')}>모두 보기 →</button>
                  </div>

                  <div className="brand-chips-grid">
                    {brands.map(b => (
                      <div key={b.id} className="brand-chip-card" onClick={() => { setSelectedBrandId(b.id); setActiveTab('brand-shop'); }} style={{ cursor: 'pointer' }}>
                        <div className="brand-chip-name">{b.name}</div>
                        <div className="brand-chip-concept">{b.concept}</div>
                      </div>
                    ))}
                  </div>

                  <div className="section-header">
                    <h3 className="section-title">WEEKLY RECOMMENDED</h3>
                  </div>

                  <div className="product-grid">
                    {products.slice(0, 3).map(prod => (
                      <div key={prod.id} className="product-card" onClick={() => { setSelectedProductId(prod.id); setActiveTab('product-detail'); }} style={{ cursor: 'pointer' }}>
                        <div className="product-img-wrapper">
                          <img src={prod.image} alt={prod.name} className="product-img" />
                          <button className="product-like-btn" onClick={(e) => { e.stopPropagation(); setSuccessAlert(`${prod.name} 상품이 찜 목록에 추가되었습니다.`); }}>
                            <HeartIcon />
                          </button>
                        </div>
                        <div className="product-info">
                          <span className="product-brand">{prod.brandName}</span>
                          <h4 className="product-name">{prod.name}</h4>
                          <div className="product-price-row">
                            <span className="product-price">₩{prod.price.toLocaleString()}</span>
                            <div className="product-meta-row">
                              <span className="star-rating"><StarIcon /> {prod.rating}</span>
                              <span>({prod.reviewsCount})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Shop View */}
              {activeTab === 'brand-shop' && (
                <div>
                  <div className="section-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                    <h3 className="section-title">
                      {selectedBrandId ? `${brands.find(b => b.id === selectedBrandId)?.name} 컬렉션` : '모든 브랜드 샵'}
                    </h3>
                    {selectedBrandId && (
                      <button style={{ fontSize: '0.75rem', textDecoration: 'underline' }} onClick={() => setSelectedBrandId(null)}>필터 초기화</button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
                    {brands.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBrandId(b.id)}
                        className={`size-chip ${selectedBrandId === b.id ? 'active' : ''}`}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="empty-placeholder">
                      <p>해당 브랜드의 상품 등록 준비 중입니다.</p>
                    </div>
                  ) : (
                    <div className="product-grid">
                      {filteredProducts.map(prod => (
                        <div key={prod.id} className="product-card" onClick={() => { setSelectedProductId(prod.id); setActiveTab('product-detail'); }} style={{ cursor: 'pointer' }}>
                          <div className="product-img-wrapper">
                            <img src={prod.image} alt={prod.name} className="product-img" />
                          </div>
                          <div className="product-info">
                            <span className="product-brand">{prod.brandName}</span>
                            <h4 className="product-name">{prod.name}</h4>
                            <span className="product-price">₩{prod.price.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Best Sellers View (Sorted Catalogs) */}
              {activeTab === 'best' && (
                <div>
                  <div className="catalog-header-bar">
                    <h3 className="section-title">Best Sellers</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {sortPreviewOutput && (
                        <span className="sort-indicator-badge">
                          정렬 방식: <span dangerouslySetInnerHTML={{ __html: sortPreviewOutput }} />
                        </span>
                      )}
                      <select
                        className="catalog-sort-select"
                        value={sortValue}
                        onChange={(e) => handleProductSort(e.target.value)}
                      >
                        <option value="">기본 정렬 순</option>
                        <option value="price-low">가격 낮은 순</option>
                        <option value="price-high">가격 높은 순</option>
                        <option value="popular">실시간 찜인기 순</option>
                      </select>
                    </div>
                  </div>

                  <div className="product-grid">
                    {products.map(prod => (
                      <div key={prod.id} className="product-card" onClick={() => { setSelectedProductId(prod.id); setActiveTab('product-detail'); }} style={{ cursor: 'pointer' }}>
                        <div className="product-img-wrapper">
                          <img src={prod.image} alt={prod.name} className="product-img" />
                        </div>
                        <div className="product-info">
                          <span className="product-brand">{prod.brandName}</span>
                          <h4 className="product-name">{prod.name}</h4>
                          <span className="product-price">₩{prod.price.toLocaleString()}</span>
                          <div className="product-meta-row">
                            <span style={{ color: 'var(--accent-gold)' }}>★ {prod.rating}</span>
                            <span>찜 {prod.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pagination-container">
                    <button className={`page-btn ${pageValue === '1' ? 'active' : ''}`} onClick={() => handleProductPage(1)}>1</button>
                    <button className={`page-btn ${pageValue === '2' ? 'active' : ''}`} onClick={() => handleProductPage(2)}>2</button>
                    <button className={`page-btn ${pageValue === '3' ? 'active' : ''}`} onClick={() => handleProductPage(3)}>3</button>
                    {pagePreviewOutput && (
                      <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                        현재 반사 페이지 번호: <strong dangerouslySetInnerHTML={{ __html: pagePreviewOutput }} />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* New Arrivals View */}
              {activeTab === 'new' && (
                <div>
                  <div className="catalog-header-bar">
                    <h3 className="section-title">New Arrivals</h3>
                  </div>
                  <div className="product-grid">
                    {products.map(prod => (
                      <div key={prod.id} className="product-card" onClick={() => { setSelectedProductId(prod.id); setActiveTab('product-detail'); }} style={{ cursor: 'pointer' }}>
                        <div className="product-img-wrapper">
                          <img src={prod.image} alt={prod.name} className="product-img" />
                        </div>
                        <div className="product-info">
                          <span className="product-brand">{prod.brandName}</span>
                          <h4 className="product-name">{prod.name}</h4>
                          <span className="product-price">₩{prod.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lookbook View */}
              {activeTab === 'lookbook' && (
                <div>
                  <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>OOTD Season Editorial</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80" alt="Look 1" style={{ width: '100%', borderRadius: '6px', aspectRatio: '3/4', objectFit: 'cover' }} />
                      <h4 style={{ fontWeight: 800 }}>Maison Casuelle #1</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>프렌치 린넨 스트라이프 셔츠와 와이드 셀비지 청바지를 조합한 내추럴하고 낭만적인 파리 골목길의 감성룩.</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80" alt="Look 2" style={{ width: '100%', borderRadius: '6px', aspectRatio: '3/4', objectFit: 'cover' }} />
                      <h4 style={{ fontWeight: 800 }}>Dark Classicism #2</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>캐시미어 오버사이즈 싱글 코트와 크로커 더비 슈즈로 강렬하면서 클래식한 도시의 시크함을 조명하는 에디토리얼.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sale View */}
              {activeTab === 'sale' && (
                <div>
                  <h3 className="section-title" style={{ marginBottom: '1rem' }}>Season Sale Outlet</h3>
                  <div className="error-banner" style={{ background: '#FFFDF5', border: '1px solid #FFEBAA', color: '#B58900' }}>
                    📢 <strong>멤버십 할인:</strong> 모든 장바구니 결제 시 등급 특별 적립 5%가 중복 적용됩니다!
                  </div>
                  <div className="product-grid">
                    {products.slice(3).map(prod => (
                      <div key={prod.id} className="product-card" onClick={() => { setSelectedProductId(prod.id); setActiveTab('product-detail'); }} style={{ cursor: 'pointer' }}>
                        <div className="product-img-wrapper">
                          <img src={prod.image} alt={prod.name} className="product-img" />
                        </div>
                        <div className="product-info">
                          <span className="product-brand">{prod.brandName}</span>
                          <h4 className="product-name">{prod.name}</h4>
                          <span className="product-price" style={{ textDecoration: 'line-through', color: 'var(--text-gray)', fontSize: '0.8rem' }}>₩{(prod.price * 1.2).toLocaleString()}</span>
                          <span className="product-price" style={{ color: 'var(--soft-red)' }}>₩{prod.price.toLocaleString()} (시즌오프 20% 특가)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discount Coupons View */}
              {activeTab === 'coupons' && (
                <div>
                  <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Discount Coupon Registrar</h3>
                  
                  <div className="review-form-box">
                    <h4 style={{ fontWeight: 800, marginBottom: '0.4rem' }}>프로모션 및 보충 할인 코드 등록</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.8rem' }}>
                      공지사항 등에서 확인한 영문/숫자 할인 코드를 등록하여 장바구니에 보관할 수 있습니다.
                    </p>
                    
                    <div className="form-group">
                      <label className="form-label">쿠폰 코드 입력</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="예: FWWELCOME"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                        />
                        <button className="btn-small-secondary" onClick={handleCouponPreview}>코드 검증 미리보기</button>
                      </div>
                    </div>

                    {couponPreviewOutput && (
                      <div className="preview-container-box">
                        <span className="preview-badge-ribbon">쿠폰 정보 반사 요약</span>
                        <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                          <p><strong>쿠폰 등록 코드: </strong> 
                            <span 
                              style={{ fontWeight: 700, color: 'var(--accent-gold)' }} 
                              dangerouslySetInnerHTML={{ __html: couponPreviewOutput.couponCode }} 
                            />
                          </p>
                          <p><strong>검증 상태:</strong> 사용 가능 쿠폰 (₩{couponPreviewOutput.discount.toLocaleString()} 즉시 감면)</p>
                        </div>
                        <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.8rem' }} onClick={handleCouponApply}>
                          해당 코드로 최종 감면 적용하기
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <h4 style={{ fontWeight: 800, marginBottom: '0.8rem' }}>사용 가능한 모의 할인 쿠폰 코드 리스트</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ background: '#FFF', border: '1px solid var(--border-beige)', padding: '1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>2026 F/W 시즌 런칭 기념 웰컴 쿠폰</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '0.2rem' }}>10,000원 즉시 할인</p>
                      </div>
                      <span className="debug-info-badge" style={{ fontSize: '0.85rem' }}>FWWELCOME</span>
                    </div>
                    <div style={{ background: '#FFF', border: '1px solid var(--border-beige)', padding: '1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>VIP 멤버십 특별 보충 할인권</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '0.2rem' }}>20,000원 즉시 할인</p>
                      </div>
                      <span className="debug-info-badge" style={{ fontSize: '0.85rem' }}>MOCKSPECIAL</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Center View */}
              {activeTab === 'customer-center' && (
                <div>
                  <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>CS Center & Notice Board</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                    
                    {/* Notice Board Search Area */}
                    <div>
                      <h4 style={{ fontWeight: 800, marginBottom: '0.8rem' }}>자주 묻는 공지사항 검색</h4>
                      <div className="notice-search-box">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="검색할 키워드 입력..."
                          style={{ flex: 1 }}
                          value={noticeSearchInput}
                          onChange={(e) => setNoticeSearchInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleNoticeSearch(); }}
                        />
                        <button className="btn-small-primary" onClick={handleNoticeSearch}>조회</button>
                      </div>

                      {noticeSearchPreviewOutput && (
                        <div className="notice-results-title">
                          검색어: "<span dangerouslySetInnerHTML={{ __html: noticeSearchPreviewOutput }} />" 결과 현황
                        </div>
                      )}

                      {notices.length === 0 ? (
                        <div className="empty-placeholder">
                          <p>검색 결과에 맞는 공지사항 게시글이 없습니다.</p>
                        </div>
                      ) : (
                        <div className="notices-list">
                          {notices.map(n => (
                            <div key={n.id} className="notice-item-card">
                              <div className="notice-item-title">{n.title}</div>
                              <div className="notice-item-meta">등록일: {n.date} | 조회수: {n.views}</div>
                              <p className="notice-item-body">{n.body}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chat Section */}
                    <div>
                      <h4 style={{ fontWeight: 800, marginBottom: '0.8rem' }}>1:1 실시간 챗봇 상담</h4>
                      
                      <div className="chat-box">
                        <div className="chat-header">
                          <span>Counsel Bot Live Connect</span>
                          <span style={{ fontSize: '0.7rem', color: '#888' }}>● Online</span>
                        </div>
                        <div className="chat-body">
                          {chatMessages.map(msg => (
                            <div key={msg.id} className={`chat-bubble ${msg.sender === 'CS_BOT' ? 'bot' : 'user'}`}>
                              <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                              <div className="chat-bubble-time">{msg.time}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: '0.5rem', background: '#FFF' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ flex: 1 }}
                              placeholder="메시지 내용 입력..."
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleChatPreview(); }}
                            />
                            <button className="btn-small-secondary" onClick={handleChatPreview}>미리보기</button>
                          </div>
                          
                          {chatPreviewOutput && (
                            <div className="preview-container-box" style={{ marginTop: '0.4rem', padding: '0.5rem' }}>
                              <span className="preview-badge-ribbon">대화 임시 버퍼</span>
                              <p style={{ fontSize: '0.8rem', minHeight: '20px' }}>
                                <strong>임시메시지: </strong>
                                <span dangerouslySetInnerHTML={{ __html: chatPreviewOutput }} />
                              </p>
                              <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.4rem', padding: '0.3rem' }} onClick={handleChatSubmit}>
                                전송하기 (Send)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Product Detail View */}
              {activeTab === 'product-detail' && selectedProductId && (() => {
                const prod = products.find(p => p.id === selectedProductId);
                if (!prod) return <p>상품 정보를 찾을 수 없습니다.</p>;
                return (
                  <div>
                    <button className="back-btn" onClick={() => { setActiveTab('home'); setSelectedProductId(null); }}>
                      ← 홈으로 돌아가기
                    </button>
                    
                    <div className="detail-layout">
                      <div className="detail-img-box">
                        <img src={prod.image} alt={prod.name} />
                      </div>
                      
                      <div className="detail-info-box">
                        <span className="detail-brand-name">{prod.brandName}</span>
                        <h2 className="detail-prod-name">{prod.name}</h2>
                        
                        <div className="detail-price-box">
                          ₩{prod.price.toLocaleString()}
                        </div>
                        
                        <p className="detail-desc">{prod.description}</p>
                        
                        <div className="detail-options-box">
                          <span className="option-title">선택 사이즈</span>
                          <div className="size-chips">
                            {['S', 'M', 'L', 'FREE'].map(sz => (
                              <button key={sz} className="size-chip active">{sz}</button>
                            ))}
                          </div>
                        </div>

                        <div className="detail-actions">
                          <button className="btn-primary" onClick={() => handleAddToCart(prod.id, 'FREE')}>
                            ADD TO SHOPPING CART
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Review Section */}
                    <div className="reviews-tab-section">
                      <h3 className="section-title">상품 사용 후기 ({reviews.filter(r => r.productId === prod.id).length + 2})</h3>
                      
                      {/* Review form */}
                      <div className="review-form-box" style={{ marginTop: '1rem' }}>
                        <h4 style={{ fontWeight: 800 }}>후기 작성하기</h4>
                        <div className="form-group">
                          <label className="form-label">별점 평점</label>
                          <select className="form-input" style={{ width: '100px' }} value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                            <option value="5">★★★★★ (5)</option>
                            <option value="4">★★★★☆ (4)</option>
                            <option value="3">★★★☆☆ (3)</option>
                            <option value="2">★★☆☆☆ (2)</option>
                            <option value="1">★☆☆☆☆ (1)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">리뷰 내용</label>
                          <textarea
                            className="form-input form-textarea"
                            placeholder="상품 마감, 핏감, 원단 착용 소감을 진솔하게 남겨주세요..."
                            value={reviewContentInput}
                            onChange={(e) => setReviewContentInput(e.target.value)}
                          />
                        </div>
                        <div>
                          <button className="btn-small-secondary" onClick={handleReviewPreview}>리뷰 내용 임시 검토 미리보기</button>
                        </div>

                        {reviewPreviewOutput && (
                          <div className="preview-container-box">
                            <span className="preview-badge-ribbon">리뷰 렌더 미리보기</span>
                            <div className="review-item-card" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                              <div className="review-header">
                                <span className="review-author">{profile.nickname}</span>
                                <span>평점: {'★'.repeat(reviewRating)}</span>
                              </div>
                              <p className="review-content" dangerouslySetInnerHTML={{ __html: reviewPreviewOutput }} />
                            </div>
                            <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.8rem' }} onClick={handleReviewSubmit}>
                              해당 후기로 최종 게시하기
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Review list */}
                      <div className="reviews-list">
                        {reviews.filter(r => r.productId === prod.id).map(r => (
                          <div key={r.id} className="review-item-card">
                            <div className="review-header">
                              <span className="review-author">{r.author}</span>
                              <span>{r.date} | 평점: {'★'.repeat(r.rating)}</span>
                            </div>
                            <p className="review-content" dangerouslySetInnerHTML={{ __html: r.content }} />
                          </div>
                        ))}
                        {/* Static starter reviews for product 1 */}
                        {prod.id === 1 && (
                          <>
                            <div className="review-item-card">
                              <div className="review-header">
                                <span className="review-author">패션블로거_킴</span>
                                <span>2026-07-28 | 평점: ★★★★★</span>
                              </div>
                              <p className="review-content">원사가 부드럽고 가벼워서 걸쳤을 때 정말 편안합니다. 미니멀한 맥시 코트 원하시는 분들에게 강추해요!</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Cart / Checkout View */}
              {activeTab === 'cart' && (
                <div>
                  <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Shopping Bag & Checkout</h3>
                  
                  {cartItems.length === 0 ? (
                    <div className="empty-placeholder">
                      <p>장바구니가 비어 있습니다.</p>
                      <button className="btn-small-primary" onClick={() => setActiveTab('home')}>상품 담으러 가기</button>
                    </div>
                  ) : (
                    <div className="cart-layout">
                      <div className="cart-items-list">
                        {cartItems.map(item => (
                          <div key={item.id} className="cart-item-card">
                            <div className="cart-item-details">
                              <div>
                                <h4 className="cart-item-name">{item.name}</h4>
                                <span className="cart-item-meta">사이즈: {item.size} | 수량: {item.quantity}개</span>
                              </div>
                              <span className="cart-item-price">₩{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                            <button className="cart-item-remove" onClick={() => handleRemoveFromCart(item.id)}>제거</button>
                          </div>
                        ))}
                      </div>

                      <div className="checkout-summary-card">
                        <h4 style={{ fontWeight: 800 }}>결제 및 배송지 상세</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid var(--border-beige)', paddingBottom: '0.8rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>배송 목적지 주소</span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{profile.address}</p>
                          <button style={{ alignSelf: 'flex-start', fontSize: '0.75rem', color: 'var(--accent-gold)', textDecoration: 'underline' }} onClick={() => setActiveTab('my-page')}>배송지 변경</button>
                        </div>

                        <div className="summary-row">
                          <span>총 상품 가액</span>
                          <span style={{ fontFamily: 'Outfit', fontWeight: 700 }}>₩{cartItems.reduce((acc, c) => acc + (c.price * c.quantity), 0).toLocaleString()}</span>
                        </div>

                        {appliedDiscount > 0 && (
                          <div className="summary-row" style={{ color: 'var(--soft-red)' }}>
                            <span>쿠폰 할인 감면액</span>
                            <span style={{ fontFamily: 'Outfit', fontWeight: 700 }}>- ₩{appliedDiscount.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="summary-row total">
                          <span>최종 모의 결제액</span>
                          <span>
                            ₩{Math.max(0, cartItems.reduce((acc, c) => acc + (c.price * c.quantity), 0) - appliedDiscount).toLocaleString()}
                          </span>
                        </div>

                        <button className="btn-primary" style={{ width: '100%' }} onClick={handleCheckoutSubmit}>
                          ORDER & MOCK PAYMENT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* My Page View */}
              {activeTab === 'my-page' && (
                <div>
                  <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>My Account Profile</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, marginBottom: '0.8rem' }}>배송지 주소 변경하기</h4>
                      
                      <div className="review-form-box">
                        <div className="form-group">
                          <label className="form-label">도로명/지번 주소 입력</label>
                          <textarea
                            className="form-input form-textarea"
                            placeholder="배송받으실 주소지를 입력해주세요..."
                            value={addressInput}
                            onChange={(e) => setAddressInput(e.target.value)}
                          />
                        </div>
                        <div>
                          <button className="btn-small-secondary" onClick={handleAddressPreview}>주소지 미리보기</button>
                        </div>

                        {addressPreviewOutput && (
                          <div className="preview-container-box">
                            <span className="preview-badge-ribbon">주소 정보 이식 미리보기</span>
                            <p style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                              <strong>설정될 주소:</strong>{' '}
                              <span dangerouslySetInnerHTML={{ __html: addressPreviewOutput }} />
                            </p>
                            <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.8rem' }} onClick={handleAddressSubmit}>
                              해당 배송지로 최종 변경 확정
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 style={{ fontWeight: 800, margin: '1.5rem 0 0.8rem' }}>모의 결제 주문 내역</h4>
                      {orders.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>주문한 내역이 없습니다.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          {orders.map(ord => (
                            <div key={ord.orderId} style={{ background: '#FFF', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-gray)' }}>
                                <span>주문번호: {ord.orderId}</span>
                                <span>{ord.date}</span>
                              </div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0.3rem 0' }}>{ord.productName}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span>결제액: <strong>₩{ord.amount.toLocaleString()}</strong></span>
                                <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{ord.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="sidebar-card">
                        <h4 style={{ fontWeight: 800, marginBottom: '0.8rem' }}>회원 세션 관리</h4>
                        
                        {isLoggedIn ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
                            <p>로그인 상태: <strong>인증 완료</strong></p>
                            <p>사용자 아이디: <strong>{profile.username}</strong></p>
                            <p>연락처 이메일: <strong>{profile.email}</strong></p>
                            <button className="btn-small-secondary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setIsLoggedIn(false)}>
                              로그아웃 (Sign Out)
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: '0.8rem', marginBottom: '0.8rem' }}>로그인된 정보가 없습니다.</p>
                            <button className="btn-small-primary" style={{ width: '100%', marginBottom: '0.4rem' }} onClick={() => setActiveTab('login')}>
                              로그인하기
                            </button>
                            <button className="btn-small-secondary" style={{ width: '100%' }} onClick={() => setActiveTab('signup')}>
                              회원가입하기
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Login View */}
              {activeTab === 'login' && (
                <div className="auth-container">
                  <h3 className="auth-title">Sign In</h3>
                  <div className="review-form-box">
                    <div className="form-group">
                      <label className="form-label">아이디 또는 이메일</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="이메일을 입력하세요..."
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">비밀번호</label>
                      <input type="password" className="form-input" placeholder="••••••••" disabled />
                    </div>
                    <button className="btn-small-secondary" style={{ marginTop: '0.5rem' }} onClick={handleLoginPreview}>
                      로그인 정보 요약 미리보기
                    </button>

                    {loginPreviewUsername && (
                      <div className="preview-container-box">
                        <span className="preview-badge-ribbon">로그인 에코 검증</span>
                        <p style={{ fontSize: '0.8rem' }}>
                          <strong>로그인 시도 아이디: </strong>
                          <span dangerouslySetInnerHTML={{ __html: loginPreviewUsername }} />
                        </p>
                        <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.8rem' }} onClick={handleLoginSubmit}>
                          로그인 프로세스 완료하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Signup View */}
              {activeTab === 'signup' && (
                <div className="auth-container">
                  <h3 className="auth-title">Create Account</h3>
                  <div className="review-form-box">
                    <div className="form-group">
                      <label className="form-label">가입할 이메일</label>
                      <input type="text" className="form-input" placeholder="example@mail.com" disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">사용할 닉네임</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="멋쟁이_스타일러"
                        value={signupNickname}
                        onChange={(e) => setSignupNickname(e.target.value)}
                      />
                    </div>
                    <button className="btn-small-secondary" style={{ marginTop: '0.5rem' }} onClick={handleSignupPreview}>
                      가입 정보 임시 양식 확인
                    </button>

                    {signupPreviewNickname && (
                      <div className="preview-container-box">
                        <span className="preview-badge-ribbon">가입 프로필 미리보기</span>
                        <p style={{ fontSize: '0.8rem' }}>
                          <strong>설정할 닉네임: </strong>
                          <span dangerouslySetInnerHTML={{ __html: signupPreviewNickname }} />
                        </p>
                        <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.8rem' }} onClick={handleSignupSubmit}>
                          회원 정보 최종 제출 및 로그인
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seller Console View */}
              {activeTab === 'seller-dashboard' && userRole === 'seller' && (
                <div>
                  <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Seller Admin Console</h3>
                  
                  <div className="review-form-box">
                    <h4 style={{ fontWeight: 800, marginBottom: '0.4rem' }}>새 상품 카탈로그 등록</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>
                      판매할 상품 사진 파일과 세부 사양을 입력해 업로드를 검수합니다.
                    </p>
                    
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">상품 사진 업로드 (미리보기)</label>
                      <input
                        type="file"
                        className="form-input"
                        onChange={handleFileChange}
                      />
                    </div>

                    {filenamePreviewOutput && (
                      <div className="preview-container-box">
                        <span className="preview-badge-ribbon">서버 업로드 명세 수신</span>
                        <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                          <p><strong>수신된 파일명: </strong>
                            <span 
                              style={{ fontWeight: 700, fontFamily: 'monospace' }} 
                              dangerouslySetInnerHTML={{ __html: filenamePreviewOutput.filename }} 
                            />
                          </p>
                          <p><strong>업로드 상태:</strong> 임시 보관 중 (크기: {filenamePreviewOutput.size})</p>
                        </div>
                        <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.8rem' }} onClick={handleFileUploadConfirm}>
                          서버 업로드 승인 확정
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar Widgets */}
        <aside className="right-sidebar">
          
          {/* Active Notice Summary Widget */}
          <div className="widget-box">
            <h3 className="widget-title">🔔 공지사항 및 런웨이</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {notices.slice(0, 2).map(n => (
                <div key={n.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', cursor: 'pointer' }} onClick={() => { setActiveTab('customer-center'); setNoticeSearchInput(n.title.substring(0, 5)); handleNoticeSearch(); }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>{n.title}</div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>{n.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Destination Display widget */}
          <div className="widget-box">
            <h3 className="widget-title">📍 배송 설정 주소</h3>
            <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ color: 'var(--text-gray)' }}>현재 기본 설정된 모의 배송지 정보입니다.</p>
              <div style={{ background: 'var(--bg-beige)', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-beige)', fontWeight: 600, wordBreak: 'break-all' }}>
                {profile.address}
              </div>
              <button style={{ alignSelf: 'flex-end', color: 'var(--accent-gold)', textDecoration: 'underline', marginTop: '0.2rem' }} onClick={() => setActiveTab('my-page')}>배송지 주소 관리</button>
            </div>
          </div>

          {/* Quick Cart Summary Widget */}
          <div className="widget-box">
            <h3 className="widget-title">🛒 쇼핑백 빠른 보기</h3>
            {cartItems.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', textAlign: 'center', padding: '1rem 0' }}>장바구니가 비어 있습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {cartItems.slice(0, 3).map(item => (
                  <div key={item.id} className="right-info-item">
                    <span>{item.name} ({item.quantity}개)</span>
                    <span>₩{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <button className="btn-small-primary" style={{ width: '100%', marginTop: '0.4rem' }} onClick={() => setActiveTab('cart')}>
                  장바구니 가기
                </button>
              </div>
            )}
          </div>

          {/* Event banners widget */}
          <div className="widget-box" style={{ background: 'var(--primary-black)', color: 'var(--primary-white)' }}>
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-gold)' }}>NEW SEASON LAUNCH EVENT</h4>
            <p style={{ fontSize: '0.7rem', color: '#AAA', marginTop: '0.3rem', lineHeight: '1.4' }}>
              웰컴 할인 코드 <strong>FWWELCOME</strong>를 사용하여 즉시 10,000원 금액 차감 할인을 적용받아 보세요!
            </p>
            <button className="hero-btn" style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', marginTop: '0.5rem' }} onClick={() => setActiveTab('coupons')}>적용하러 가기</button>
          </div>
        </aside>

      </div>

      {/* ==========================================================================
         Interactive Debug Modal Check (Bug ID Mapping Popups)
         ========================================================================== */}
      {debugModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={() => setDebugModal(null)}>×</button>
            <h3 className="debug-alert-title">
              ⚡ [디버그 경고] Reflected XSS 취약점 검출 알림
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.8rem' }}>
              <p style={{ color: 'var(--text-charcoal)', lineHeight: '1.4' }}>
                백엔드 보안 입력 검증 및 이스케이프가 결여된 API 데이터가 감지되어 브라우저 내 <strong>executable DOM Sink</strong>로 바인딩되었습니다. PPO 에이전트의 dynamic analysis 시뮬레이터에 정상 맵핑되었습니다.
              </p>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 'bold', width: '120px' }}>Bug ID:</td>
                    <td style={{ padding: '0.5rem 0' }}><span className="debug-info-badge">{debugModal.bugId}</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>CSV ID:</td>
                    <td style={{ padding: '0.5rem 0' }}><span className="debug-info-badge">{debugModal.csvId}</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>발생 API 엔드포인트:</td>
                    <td style={{ padding: '0.5rem 0', fontFamily: 'monospace', color: 'var(--accent-gold)' }}>{debugModal.endpoint}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>취약 파라미터명:</td>
                    <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>{debugModal.parameter}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0', fontWeight: 'bold', verticalAlign: 'top' }}>상세 원인 설명:</td>
                    <td style={{ padding: '0.5rem 0', color: 'var(--text-gray)', lineHeight: '1.4' }}>{debugModal.description}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ backgroundColor: '#FFFEE0', border: '1px solid #FFEAA5', padding: '0.8rem', borderRadius: '4px', color: '#856404', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                🔔 <strong>안내:</strong> 해당 팝업 정보는 개발자 모드(Dev Mode) 활성화 중에만 시각적으로 출력됩니다. 에이전트의 자동 학습 환경에서는 정답 유출을 완전히 차단하기 위해 DOM/API 단에 취약 명칭 단어가 주입되지 않고 정상적으로 에뮬레이션 분석을 처리합니다.
              </div>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: '1.2rem' }} onClick={() => setDebugModal(null)}>
              디버그 정보 확인 완료
            </button>
          </div>
        </div>
      )}

      {/* Standard Platform Toast/Alert Popups */}
      {successAlert && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '360px', textAlign: 'center', padding: '1.5rem' }}>
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>PLATFORM NOTIFICATION</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-charcoal)', marginBottom: '1.2rem', lineHeight: '1.4' }}>{successAlert}</p>
            <button className="btn-primary" style={{ width: '100%', padding: '0.6rem' }} onClick={() => setSuccessAlert(null)}>확인</button>
          </div>
        </div>
      )}

    </div>
  );
}
