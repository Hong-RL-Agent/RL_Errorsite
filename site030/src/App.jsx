import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation Tabs: 'dashboard' | 'myplants' | 'diagnosis' | 'careprograms' | 'repotting' | 'store' | 'community' | 'support'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [carePrograms, setCarePrograms] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartSummary, setCartSummary] = useState({ subtotal: 0, shippingFee: 0, totalAmount: 0 });
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [supportInquiries, setSupportInquiries] = useState([]);
  
  // User Profile & Auth
  const [user, setUser] = useState({
    id: 'usr_plant_01',
    name: '이지우',
    email: 'jiwoo.leaf@floracare.kr',
    phone: '010-8472-9103',
    address: '서울특별시 서초구 반포대로 140, 102동 804호',
    membership: '그린 가디언 (Green Guardian)',
    experience: '2년차 식집사 (초보 탈출)',
    points: 4500
  });

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [isRepottingModalOpen, setIsRepottingModalOpen] = useState(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderSummaryConfirmModalOpen, setIsOrderSummaryConfirmModalOpen] = useState(false);

  // Store & Filter States
  const [storeCategory, setStoreCategory] = useState('전체');
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSort, setStoreSort] = useState('popular');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Flow & Checkout Payloads
  const [checkoutData, setCheckoutData] = useState({
    title: '',
    itemsCount: 1,
    subtotal: 0,
    shippingFee: 3000,
    serviceFee: 2000,
    customAmount: null,
    flowOrigin: '',
    paymentMethod: '신용카드 결제'
  });

  // Forms
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', phone: '', address: '' });
  const [newPlantForm, setNewPlantForm] = useState({ name: '', scientificName: '', category: '관엽식물', waterCycleDays: 7, memo: '' });
  const [diagnosisForm, setDiagnosisForm] = useState({ plantId: '', symptoms: '잎마름 및 하단 변색', uploadedPhoto: true, customFee: 15000 });
  const [repottingForm, setRepottingForm] = useState({ serviceId: 'rep_medium', plantId: '', customAmount: 36000 });
  const [nutritionForm, setNutritionForm] = useState({ plantId: '', planType: '유기농 종합 액비 앰플', months: 3, customAmount: 84000 });
  const [supportForm, setSupportForm] = useState({ type: '병해충 정밀 상담', plantName: '', title: '', content: '' });
  const [postForm, setPostForm] = useState({ title: '', content: '', category: '식물자랑' });
  const [newComment, setNewComment] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (title, desc = '') => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 4500);
  };

  // Initial Load
  useEffect(() => {
    fetchProfile();
    fetchPlants();
    fetchCarePrograms();
    fetchProducts();
    fetchCart();
    fetchOrders();
    fetchNotifications();
    fetchCommunity();
    fetchSupport();
  }, []);

  // API Call Helpers
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success && data.user) setUser(data.user);
    } catch (e) { console.error(e); }
  };

  const fetchPlants = async () => {
    try {
      const res = await fetch('/api/plants');
      const data = await res.json();
      if (data.success) setPlants(data.plants || []);
    } catch (e) { console.error(e); }
  };

  const fetchCarePrograms = async () => {
    try {
      const res = await fetch('/api/care-programs');
      const data = await res.json();
      if (data.success) setCarePrograms(data.programs || []);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      let url = `/api/products?category=${encodeURIComponent(storeCategory)}&search=${encodeURIComponent(storeSearch)}&sort=${storeSort}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
    } catch (e) { console.error(e); }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.success) {
        setCart(data.cart || []);
        if (data.summary) setCartSummary(data.summary);
      }
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
    } catch (e) { console.error(e); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) setNotifications(data.notifications || []);
    } catch (e) { console.error(e); }
  };

  const fetchCommunity = async () => {
    try {
      const res = await fetch('/api/community');
      const data = await res.json();
      if (data.success) setCommunityPosts(data.posts || []);
    } catch (e) { console.error(e); }
  };

  const fetchSupport = async () => {
    try {
      const res = await fetch('/api/support');
      const data = await res.json();
      if (data.success) setSupportInquiries(data.inquiries || []);
    } catch (e) { console.error(e); }
  };

  // Water Plant
  const handleWaterPlant = async (plantId) => {
    try {
      const res = await fetch('/api/care/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantId })
      });
      const data = await res.json();
      if (data.success) {
        fetchPlants();
        showToast('💧 물주기 완료', `${data.plant.name}에게 신선한 물을 주었습니다. 건강 점수가 상승했습니다!`);
      }
    } catch (e) { console.error(e); }
  };

  // Add Plant
  const handleAddPlant = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlantForm)
      });
      const data = await res.json();
      if (data.success) {
        fetchPlants();
        setIsAddPlantModalOpen(false);
        setNewPlantForm({ name: '', scientificName: '', category: '관엽식물', waterCycleDays: 7, memo: '' });
        showToast('🌱 반려식물 등록 성공', `[${data.plant.name}]이(가) 내 정원에 등록되었습니다.`);
      }
    } catch (e) { console.error(e); }
  };

  // Cart Operations
  const handleAddToCart = async (productId, qty = 1) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: qty })
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.cart);
        setCartSummary(data.summary);
        showToast('🛒 장바구니 담기 완료', '선택하신 가드닝 용품이 장바구니에 추가되었습니다.');
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateCartQty = async (productId, newQty) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQty })
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.cart);
        setCartSummary(data.summary);
      }
    } catch (e) { console.error(e); }
  };

  // Auth Operations
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setIsAuthModalOpen(false);
        showToast(authMode === 'login' ? '🌿 로그인 완료' : '🎉 회원가입 환영합니다!', `${data.user.name}님, 플로라케어와 함께 건강한 식물 생활을 시작하세요.`);
      }
    } catch (e) { console.error(e); }
  };

  // Profile / Address Submit (Flow SEC-313)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setIsProfileModalOpen(false);
        showToast('📍 배송지 & 프로필 수정 완료', '기본 배송 주소 및 회원 정보가 업데이트되었습니다.');
      }
    } catch (e) { console.error(e); }
  };

  // =========================================================================
  // 10 Distinct Service Flow Action Handlers
  // =========================================================================

  // Flow 1 (SEC-311): 1:1 방문 Plant Care 프리미엄 서비스 예약 결제
  const triggerPlantCareBooking = (plant = plants[0]) => {
    setCheckoutData({
      title: `[${plant ? plant.name : '반려식물'}] 전문 가드너 1:1 방문 홈케어 패키지`,
      itemsCount: 1,
      subtotal: 45000,
      shippingFee: 0,
      serviceFee: 0,
      customAmount: 45000,
      flowOrigin: '1:1 방문 Plant Care 서비스',
      paymentMethod: '신용카드 결제'
    });
    setIsCheckoutModalOpen(true);
  };

  // Flow 2 (SEC-312): 신규 가입 Care Program 구독 신청
  const triggerProgramSubscribe = (program = carePrograms[0], months = 1) => {
    const subtotal = program.monthlyPrice * months;
    setCheckoutData({
      title: `${program.name} (${months}개월 정기구독권)`,
      itemsCount: 1,
      subtotal: subtotal,
      shippingFee: 0,
      serviceFee: 0,
      customAmount: subtotal,
      flowOrigin: 'Care Program 신규 구독',
      paymentMethod: '자동 정기결제'
    });
    setIsCheckoutModalOpen(true);
  };

  // Flow 3 (SEC-313): 배송 주소 지정 결제
  const triggerAddressCheckout = () => {
    const subtotal = cartSummary.subtotal || 37000;
    setCheckoutData({
      title: `[배송지: ${user.address.slice(0, 16)}...] 식물 관리용품 패키지 주문`,
      itemsCount: cart.length || 1,
      subtotal: subtotal,
      shippingFee: subtotal > 50000 ? 0 : 3000,
      serviceFee: 2000,
      customAmount: subtotal + (subtotal > 50000 ? 0 : 3000) + 2000,
      flowOrigin: '배송지 지정 결제',
      paymentMethod: '간편 결제 (카카오/네이버)'
    });
    setIsCheckoutModalOpen(true);
  };

  // Flow 4 (SEC-314): AI 식물 정밀 진단 및 처방 서비스 신청
  const triggerDiagnosisSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId: diagnosisForm.plantId || (plants[0] ? plants[0].id : 'plt_01'),
          symptoms: diagnosisForm.symptoms,
          clientDiagnosisFee: diagnosisForm.customFee
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        setIsDiagnosisModalOpen(false);
        showToast('🩺 AI 식물 진단 & 처방서 발급 완료', `[진단명: ${data.diagnosis.diseaseName}] 결제금액: ${data.order.paymentAmount.toLocaleString()}원 승인 완료`);
      }
    } catch (err) { console.error(err); }
  };

  // Flow 5 (SEC-315): 분갈이 딜리버리 서비스 신청
  const triggerRepottingSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/repotting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: repottingForm.serviceId,
          plantId: repottingForm.plantId || (plants[0] ? plants[0].id : 'plt_01'),
          repottingAmount: repottingForm.customAmount
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        setIsRepottingModalOpen(false);
        showToast('🪴 분갈이 딜리버리 신청 완료', `[${data.order.title}] 결제금액: ${data.order.paymentAmount.toLocaleString()}원 승인되었습니다.`);
      }
    } catch (err) { console.error(err); }
  };

  // Flow 6 (SEC-316): 장바구니 품목 소계 결제
  const triggerCartCheckout = async () => {
    if (cart.length === 0) {
      showToast('알림', '장바구니가 비어 있습니다.');
      return;
    }
    setCheckoutData({
      title: `${cart[0].name} 외 ${cart.length - 1}건 주문`,
      itemsCount: cart.length,
      subtotal: cartSummary.subtotal,
      shippingFee: cartSummary.shippingFee,
      serviceFee: 2000,
      customAmount: cartSummary.totalAmount + 2000,
      flowOrigin: '장바구니 결제',
      paymentMethod: '신용카드 결제'
    });
    setIsCartDrawerOpen(false);
    setIsCheckoutModalOpen(true);
  };

  // Flow 7 (SEC-317): 식물 맞춤 영양 관리 정기배송 신청
  const triggerNutritionSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId: nutritionForm.plantId || (plants[0] ? plants[0].id : 'plt_01'),
          planType: nutritionForm.planType,
          months: nutritionForm.months,
          nutritionPlanAmount: nutritionForm.customAmount
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        setIsNutritionModalOpen(false);
        showToast('🧪 맞춤 영양 관리 솔루션 등록 완료', `[${data.order.title}] 결제금액: ${data.order.paymentAmount.toLocaleString()}원 승인 완료`);
      }
    } catch (err) { console.error(err); }
  };

  // Flow 8 (SEC-318): Care Program 옵션별 결제
  const triggerTierOptionCheckout = (program, months = 6) => {
    const selectedOption = program.periodOptions.find(o => o.months === months) || program.periodOptions[1];
    setCheckoutData({
      title: `[${program.tier} 등급] ${program.name} (${months}개월 정기 멤버십)`,
      itemsCount: 1,
      subtotal: selectedOption.price,
      shippingFee: 0,
      serviceFee: 0,
      customAmount: selectedOption.price,
      flowOrigin: 'Care Program 티어 옵션',
      paymentMethod: '신용카드 정기결제'
    });
    setIsCheckoutModalOpen(true);
  };

  // Flow 9 (SEC-319): 배송비 및 서비스 이용료 계산 변경 결제
  const triggerFeeTamperedCheckout = async () => {
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtotal: 35000,
          clientShippingFee: 0,
          clientServiceFee: 0
        })
      });
      const feeData = await res.json();
      setCheckoutData({
        title: '프리미엄 멸균 배양토 & 영양 앰플 세트 (배송비/서비스료 무료 혜택)',
        itemsCount: 2,
        subtotal: 35000,
        shippingFee: feeData.shippingFee,
        serviceFee: feeData.serviceFee,
        customAmount: feeData.totalAmount,
        flowOrigin: '배송비 & 서비스료 조정 결제',
        paymentMethod: '신용카드 결제'
      });
      setIsCheckoutModalOpen(true);
      showToast('🚚 배송비 & 서비스료 산정 완료', `배송비: ${feeData.shippingFee.toLocaleString()}원, 서비스료: ${feeData.serviceFee.toLocaleString()}원 적용`);
    } catch (e) { console.error(e); }
  };

  // =========================================================================
  // 10 VULNERABILITY ATTACK SIMULATOR (Price Tampering with Bug IDs)
  // =========================================================================
  const simulateBugAttack = async (bugIndex) => {
    try {
      switch (bugIndex) {
        case 1: { // SEC-311: 1:1 방문 Plant Care 서비스 결제 금액 변조
          const res = await fetch('/api/care/premium-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceName: '전문 가드너 1:1 방문 홈케어 패키지',
              plantId: plants[0]?.id || 'plt_01',
              customAmount: 1000 // Normal: 45,000 -> 1,000 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE030-BUG-001 / SEC-311] 1:1 방문 홈케어 금액 변조 완료', `정상가 45,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 결제 승인 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 2: { // SEC-312: 회원가입 후 Care Program 결제 금액 변조
          const res = await fetch('/api/care/program-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              programId: 'care_standard',
              months: 3,
              clientAmount: 1500 // Normal: 105,300 -> 1,500 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE030-BUG-002 / SEC-312] 신규 가입 Care Program 결제 금액 변조 완료', `정상가 105,300원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 결제 승인 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 3: { // SEC-313: 배송 주소 입력 후 결제 금액 변조
          const res = await fetch('/api/orders/address-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deliveryAddress: user.address,
              tamperedAmount: 2000 // Normal: 40,000 -> 2,000 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          fetchCart();
          showToast('🚨 [Bug ID: SITE030-BUG-003 / SEC-313] 배송 주소 입력 후 결제 금액 변조 완료', `정상가 40,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 결제 승인 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 4: { // SEC-314: 식물 진단 서비스 결제 금액 변조
          const res = await fetch('/api/diagnosis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plantId: plants[0]?.id || 'plt_01',
              symptoms: '잎마름 및 하단 변색',
              clientDiagnosisFee: 100 // Normal: 15,000 -> 100 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE030-BUG-004 / SEC-314] 식물 진단 서비스 결제 금액 변조 완료', `정상가 15,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 승인 및 처방전 발급 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 5: { // SEC-315: 분갈이 서비스 결제 금액 변조
          const res = await fetch('/api/repotting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: 'rep_large',
              plantId: plants[0]?.id || 'plt_01',
              repottingAmount: 2500 // Normal: 48,000 -> 2,500 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE030-BUG-005 / SEC-315] 분갈이 서비스 결제 금액 변조 완료', `정상가 48,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 신청 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 6: { // SEC-316: 관리용품 장바구니 결제 금액 변조
          const res = await fetch('/api/cart/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cartItems: cart.length > 0 ? cart : [{ name: '오가닉 플랜트 헬스 3종 영양 앰플 세트', price: 18500, quantity: 2 }],
              totalAmount: 500 // Normal: 37,000 -> 500 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          fetchCart();
          showToast('🚨 [Bug ID: SITE030-BUG-006 / SEC-316] 관리용품 장바구니 결제 금액 변조 완료', `정상가 37,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 결제 승인 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 7: { // SEC-317: 영양 관리 프로그램 결제 금액 변조
          const res = await fetch('/api/nutrition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plantId: plants[0]?.id || 'plt_01',
              planType: '유기농 종합 액비 앰플',
              months: 3,
              nutritionPlanAmount: 3000 // Normal: 84,000 -> 3,000 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE030-BUG-007 / SEC-317] 영양 관리 프로그램 결제 금액 변조 완료', `정상가 84,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 정기구독 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 8: { // SEC-318: Care Program 옵션 선택 후 금액 변조
          const res = await fetch('/api/care/tier-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              programId: 'care_premium',
              tier: 'Premium',
              selectedMonths: 6,
              clientPrice: 5000 // Normal: 310,500 -> 5,000 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE030-BUG-008 / SEC-318] Care Program 옵션 선택 후 금액 변조 완료', `정상가 310,500원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 멤버십 승급 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 9: { // SEC-319: 배송비 및 서비스 이용료 금액 변조
          const res = await fetch('/api/shipping/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subtotal: 35000,
              clientShippingFee: 0,
              clientServiceFee: 0
            })
          });
          const feeData = await res.json();
          const payRes = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '프리미엄 멸균 배양토 & 영양 앰플 세트 (배송비/서비스료 0원 변조 결제)',
              itemsCount: 2,
              actualSubtotal: 40000,
              paymentAmount: feeData.totalAmount, // 35,000 KRW
              flowOrigin: '배송비 & 서비스료 0원 변조 결제'
            })
          });
          const payData = await payRes.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE030-BUG-009 / SEC-319] 배송비 및 서비스 이용료 금액 변조 완료', `배송비/서비스료 5,000원 면제 -> 총 ${payData.order.paymentAmount.toLocaleString()}원 결제 승인 완료!`);
          break;
        }
        case 10: { // SEC-320: 주문 결제 확인 단계의 금액 변조
          const res = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: 'FC-CONFIRM-' + Date.now(),
              authorizedAmount: 100, // Normal: 74,000 -> 100 KRW
              paymentMethod: '신용카드 2단계 최종 승인'
            })
          });
          const data = await res.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE030-BUG-010 / SEC-320] 주문 결제 확인 단계 금액 변조 완료', `정상 승인가 74,000원 -> 변조 승인금액 ${data.order.paymentAmount.toLocaleString()}원 최종 확정! (주문번호: ${data.order.orderId})`);
          break;
        }
        default:
          break;
      }
    } catch (e) {
      showToast('오류', '시뮬레이션 처리 중 문제가 발생했습니다.');
    }
  };

  // Flow 10 (SEC-320): 2단계 주문 확인 승인 결제
  const openOrderSummaryConfirmModal = async () => {
    try {
      const res = await fetch('/api/orders/summary');
      const data = await res.json();
      if (data.success) {
        setIsOrderSummaryConfirmModalOpen(true);
      }
    } catch (e) {
      setIsOrderSummaryConfirmModalOpen(true);
    }
  };

  const handleFinalOrder2StepConfirm = async (amt = 74000) => {
    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'FC-CONFIRM-' + Date.now(),
          authorizedAmount: amt,
          paymentMethod: '신용카드 2단계 최종 승인'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        setIsOrderSummaryConfirmModalOpen(false);
        showToast('🎉 2단계 최종 결제 승인 완료', `[${data.order.title}] ${data.order.paymentAmount.toLocaleString()}원 주문이 최종 확정되었습니다.`);
      }
    } catch (e) {
      showToast('오류', '최종 승인 중 문제가 발생했습니다.');
    }
  };

  // Main Payment Submission (POST /api/payment)
  const handleUniversalPaymentSubmit = async () => {
    try {
      const finalAmount = checkoutData.customAmount !== null ? Number(checkoutData.customAmount) : (checkoutData.subtotal + checkoutData.shippingFee + checkoutData.serviceFee);
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: checkoutData.title,
          itemsCount: checkoutData.itemsCount,
          actualSubtotal: checkoutData.subtotal,
          paymentAmount: finalAmount,
          flowOrigin: checkoutData.flowOrigin,
          paymentMethod: checkoutData.paymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        fetchCart();
        setIsCheckoutModalOpen(false);
        showToast('🎉 결제 및 신청 완료', `[${data.order.title}] ${data.order.paymentAmount.toLocaleString()}원 결제 승인 완료되었습니다.`);
      }
    } catch (e) {
      showToast('오류', '결제 처리 중 문제가 발생했습니다.');
    }
  };

  // Community Post & Comment Submit
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm)
      });
      const data = await res.json();
      if (data.success) {
        fetchCommunity();
        setPostForm({ title: '', content: '', category: '식물자랑' });
        showToast('🌿 게시글 등록 완료', '식물 집사 커뮤니티에 새 글이 등록되었습니다.');
      }
    } catch (e) { console.error(e); }
  };

  const handleCommentSubmit = async (postId) => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: newComment })
      });
      const data = await res.json();
      if (data.success) {
        fetchCommunity();
        setNewComment('');
        showToast('💬 댓글 등록 완료', '답변 댓글이 등록되었습니다.');
      }
    } catch (e) { console.error(e); }
  };

  const handleLikePost = async (postId) => {
    try {
      await fetch('/api/community/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      fetchCommunity();
    } catch (e) { console.error(e); }
  };

  // Support Inquiry Submit
  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportForm)
      });
      const data = await res.json();
      if (data.success) {
        fetchSupport();
        setSupportForm({ type: '병해충 정밀 상담', plantName: '', title: '', content: '' });
        showToast('🩺 1:1 상담 접수 완료', '전문 가드너가 접수 내용을 확인 후 답변을 작성합니다.');
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="fc-app">
      {/* =========================================================
          TOP NAVIGATION BAR
          ========================================================= */}
      <header className="fc-header">
        <div className="fc-container">
          <nav className="fc-navbar">
            <div className="fc-logo" onClick={() => setActiveTab('dashboard')}>
              <div className="fc-logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="fc-logo-text">FloraCare</span>
                  <span className="fc-logo-badge">PRO</span>
                </div>
              </div>
            </div>

            <div className="fc-nav-menu">
              {[
                { id: 'dashboard', label: '대시보드' },
                { id: 'myplants', label: '내 반려식물' },
                { id: 'diagnosis', label: 'AI 식물진단' },
                { id: 'careprograms', label: 'Care Program' },
                { id: 'repotting', label: '분갈이 서비스' },
                { id: 'store', label: '플랜트 스토어' },
                { id: 'community', label: '식물 커뮤니티' },
                { id: 'support', label: '전문가 상담' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`fc-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="fc-header-actions">
              <button className="fc-icon-btn" title="알림함" onClick={() => setIsNotifDrawerOpen(true)}>
                🔔
                {notifications.some(n => !n.read) && <span className="fc-badge">{notifications.filter(n => !n.read).length}</span>}
              </button>

              <button className="fc-icon-btn" title="장바구니" onClick={() => setIsCartDrawerOpen(true)}>
                🛒
                {cart.length > 0 && <span className="fc-badge">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
              </button>

              <button className="fc-icon-btn" title="내 주문 및 이용내역" onClick={() => setIsOrdersDrawerOpen(true)}>
                📋
                {orders.length > 0 && <span className="fc-badge">{orders.length}</span>}
              </button>

              <div className="fc-user-pill" onClick={() => setIsProfileModalOpen(true)}>
                <div className="fc-user-avatar">{user.name.slice(0, 1)}</div>
                <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary-forest)' }}>{user.name}</span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* =========================================================
          HERO BANNER
          ========================================================= */}
      <section className="fc-hero">
        <div className="fc-container">
          <div className="fc-hero-grid">
            <div>
              <div className="fc-hero-tag">
                <span>🌿 2026 대한민국 1등 스마트 식물관리 솔루션</span>
              </div>
              <h1 className="fc-hero-title">
                초보 식집사도 전문가처럼,<br />
                <span>당신의 반려식물을 건강하게</span>
              </h1>
              <p className="fc-hero-desc">
                식물 등록부터 물주기 알림, AI 병해충 사진 진단, 전문 가드너 1:1 방문 홈케어 및 분갈이 딜리버리까지 원스톱으로 관리하세요.
              </p>
              <div className="fc-hero-actions">
                <button className="fc-btn fc-btn-accent" onClick={() => setIsAddPlantModalOpen(true)}>
                  🌱 새 반려식물 등록하기
                </button>
                <button className="fc-btn fc-btn-outline-white" onClick={() => setIsDiagnosisModalOpen(true)}>
                  🩺 AI 식물진단 받기
                </button>
                <button className="fc-btn fc-btn-outline-white" onClick={() => triggerPlantCareBooking(plants[0])}>
                  🏡 1:1 방문케어 신청
                </button>
              </div>
            </div>

            <div className="fc-hero-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', marginBottom: '14px', color: '#fff' }}>오늘의 내 정원 요약</h3>
              <div className="fc-hero-stat-grid">
                <div className="fc-stat-box">
                  <div className="fc-stat-num">{plants.length}개</div>
                  <div className="fc-stat-label">등록된 반려식물</div>
                </div>
                <div className="fc-stat-box">
                  <div className="fc-stat-num">
                    {plants.filter(p => p.healthStatus === '건강함').length}/{plants.length}
                  </div>
                  <div className="fc-stat-label">건강한 식물 수</div>
                </div>
                <div className="fc-stat-box">
                  <div className="fc-stat-num">{orders.length}건</div>
                  <div className="fc-stat-label">진행중인 케어 서비스</div>
                </div>
                <div className="fc-stat-box">
                  <div className="fc-stat-num">{user.points.toLocaleString()}P</div>
                  <div className="fc-stat-label">그린 가디언 포인트</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN TAB CONTENT AREA
          ========================================================= */}
      <main className="fc-container" style={{ minHeight: '600px' }}>
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <section className="fc-section">
            <div className="fc-section-header">
              <div>
                <h2 className="fc-section-title">오늘의 식물 케어 스케줄</h2>
                <p className="fc-section-sub">등록된 반려식물의 물주기, 햇빛, 영양 상태를 확인하고 관리하세요.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="fc-btn fc-btn-secondary fc-btn-sm" onClick={() => setIsRepottingModalOpen(true)}>
                  🪴 분갈이 서비스 신청
                </button>
                <button className="fc-btn fc-btn-primary fc-btn-sm" onClick={() => setIsAddPlantModalOpen(true)}>
                  + 식물 추가
                </button>
              </div>
            </div>

            <div className="fc-grid-4">
              {plants.map(plant => (
                <div key={plant.id} className="fc-plant-card">
                  <div className="fc-plant-img-box">
                    <img src={plant.image} alt={plant.name} className="fc-plant-img" />
                    <span className={`fc-health-chip ${plant.healthStatus === '건강함' ? 'fc-chip-healthy' : 'fc-chip-warning'}`}>
                      {plant.healthStatus} ({plant.healthScore}점)
                    </span>
                  </div>
                  <div className="fc-plant-body">
                    <span className="fc-plant-cat">{plant.category}</span>
                    <h3 className="fc-plant-name">{plant.name}</h3>
                    <p className="fc-plant-sci">{plant.scientificName}</p>

                    <div className="fc-plant-meta">
                      <div className="fc-meta-row">
                        <span>마지막 물주기</span>
                        <strong>{plant.lastWatered}</strong>
                      </div>
                      <div className="fc-meta-row">
                        <span>다음 물주기</span>
                        <strong>{plant.nextWaterDate}</strong>
                      </div>
                      <div className="fc-meta-row">
                        <span>권장 햇빛</span>
                        <span>{plant.sunlight}</span>
                      </div>
                    </div>

                    <div className="fc-plant-actions">
                      <button className="fc-btn fc-btn-secondary fc-btn-sm" style={{ flex: 1 }} onClick={() => handleWaterPlant(plant.id)}>
                        💧 물주기
                      </button>
                      <button className="fc-btn fc-btn-primary fc-btn-sm" style={{ flex: 1 }} onClick={() => { setSelectedPlant(plant); setIsPlantModalOpen(true); }}>
                        상세보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Service Banner */}
            <div style={{ marginTop: '48px', background: 'linear-gradient(135deg, #f4f6f0, #e9ece3)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--moss-green)' }}>전문가 맞춤 솔루션</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary-forest)', margin: '4px 0 8px' }}>
                  잎이 노랗게 변하거나 시들고 있나요?
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  AI 사진 정밀 진단을 통해 원인을 분석하고 1:1 맞춤 영양 솔루션을 처방받으세요.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="fc-btn fc-btn-secondary" onClick={() => setIsNutritionModalOpen(true)}>
                  🧪 맞춤 영양제 구독
                </button>
                <button className="fc-btn fc-btn-primary" onClick={() => setIsDiagnosisModalOpen(true)}>
                  🩺 AI 즉시 진단 시작
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: MY PLANTS */}
        {activeTab === 'myplants' && (
          <section className="fc-section">
            <div className="fc-section-header">
              <div>
                <h2 className="fc-section-title">내 반려식물 도감 ({plants.length}그루)</h2>
                <p className="fc-section-sub">키우는 모든 식물의 건강 상태, 생육 메모 및 성장 기록을 관리하세요.</p>
              </div>
              <button className="fc-btn fc-btn-primary" onClick={() => setIsAddPlantModalOpen(true)}>
                + 새 반려식물 등록
              </button>
            </div>

            <div className="fc-grid-3">
              {plants.map(plant => (
                <div key={plant.id} className="fc-plant-card">
                  <div className="fc-plant-img-box" style={{ height: '220px' }}>
                    <img src={plant.image} alt={plant.name} className="fc-plant-img" />
                    <span className={`fc-health-chip ${plant.healthStatus === '건강함' ? 'fc-chip-healthy' : 'fc-chip-warning'}`}>
                      {plant.healthStatus}
                    </span>
                  </div>
                  <div className="fc-plant-body">
                    <span className="fc-plant-cat">{plant.category}</span>
                    <h3 className="fc-plant-name">{plant.name}</h3>
                    <p className="fc-plant-sci">{plant.scientificName}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.5' }}>
                      "{plant.memo}"
                    </p>

                    <div className="fc-plant-meta">
                      <div className="fc-meta-row">
                        <span>물주기 주기</span>
                        <strong>{plant.waterCycleDays}일 간격</strong>
                      </div>
                      <div className="fc-meta-row">
                        <span>적정 온습도</span>
                        <span>{plant.temp} · {plant.humidity}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: 'auto' }}>
                      <button className="fc-btn fc-btn-secondary fc-btn-sm" onClick={() => handleWaterPlant(plant.id)}>
                        💧 급수
                      </button>
                      <button className="fc-btn fc-btn-secondary fc-btn-sm" onClick={() => triggerPlantCareBooking(plant)}>
                        🏡 1:1 케어
                      </button>
                      <button className="fc-btn fc-btn-primary fc-btn-sm" onClick={() => { setSelectedPlant(plant); setIsPlantModalOpen(true); }}>
                        상세
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: AI DIAGNOSIS */}
        {activeTab === 'diagnosis' && (
          <section className="fc-section">
            <div className="fc-section-header">
              <div>
                <h2 className="fc-section-title">AI 식물 병해충 정밀 진단 & 처방</h2>
                <p className="fc-section-sub">식물의 이상 증상과 사진을 분석하여 99.2% 정확도로 원인을 판독하고 맞춤 처방전을 발행합니다.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '20px' }}>
                  🩺 진단 접수 폼 작성
                </h3>

                <form onSubmit={triggerDiagnosisSubmit}>
                  <div className="fc-form-group">
                    <label className="fc-form-label">진단할 식물 선택</label>
                    <select
                      className="fc-select"
                      value={diagnosisForm.plantId}
                      onChange={(e) => setDiagnosisForm({ ...diagnosisForm, plantId: e.target.value })}
                    >
                      {plants.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                      ))}
                    </select>
                  </div>

                  <div className="fc-form-group">
                    <label className="fc-form-label">관찰되는 이상 증상</label>
                    <select
                      className="fc-select"
                      value={diagnosisForm.symptoms}
                      onChange={(e) => setDiagnosisForm({ ...diagnosisForm, symptoms: e.target.value })}
                    >
                      <option value="잎마름 및 하단 변색">잎마름 및 하단 변색 (갈색/노란색)</option>
                      <option value="잎 뒷면 미세 반점 및 거미줄">잎 뒷면 미세 반점 및 거미줄 (응애 의심)</option>
                      <option value="줄기 쳐짐 및 과습 냄새">줄기 쳐짐 및 과습 냄새 (뿌리 썩음)</option>
                      <option value="새 잎이 나지 않고 성장이 멈춤">새 잎이 나지 않고 성장이 멈춤 (영양 결핍)</option>
                      <option value="잎에 끈적한 분비물 발생">잎에 끈적한 분비물 발생 (깍지벌레 의심)</option>
                    </select>
                  </div>

                  <div className="fc-form-group">
                    <label className="fc-form-label">식물 잎/줄기 사진 업로드</label>
                    <div style={{ border: '2px dashed var(--soft-sage)', borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center', background: 'var(--bg-ivory)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
                      <div style={{ fontWeight: '700', color: 'var(--primary-forest)', fontSize: '0.92rem' }}>monstera_leaf_damaged_01.jpg</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '4px' }}>AI 고화질 병변 분석 준비 완료 (JPG, PNG)</div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span>AI 정밀 판독 및 1:1 처방전 발급료</span>
                      <strong style={{ color: 'var(--primary-forest)', fontSize: '1.1rem' }}>15,000원</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      * 식물 주치의의 100% 회복 가이드와 친환경 처방 약제 추천이 포함됩니다.
                    </div>
                  </div>

                  <button type="submit" className="fc-btn fc-btn-primary" style={{ width: '100%', padding: '14px' }}>
                    🩺 AI 정밀 진단서 발급 및 결제하기 (15,000원)
                  </button>
                  <button
                    type="button"
                    className="fc-btn"
                    style={{ width: '100%', marginTop: '8px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '10px', fontSize: '0.85rem' }}
                    onClick={() => simulateBugAttack(4)}
                  >
                    ⚡ AI 정밀진단서 100원 발급
                  </button>
                </form>
              </div>

              {/* Sample Diagnostic Report */}
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px', border: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '14px' }}>
                  📋 최근 발급된 AI 처방 리포트 예시
                </h4>
                <div style={{ background: 'var(--bg-ivory)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--moss-green)', marginBottom: '16px' }}>
                  <div style={{ fontWeight: '800', color: 'var(--primary-forest)', fontSize: '0.95rem' }}>몬스테라 델리시오사 (반포동 이지우님)</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--moss-green)', fontWeight: '700', marginTop: '4px' }}>진단명: 건조성 잎마름 및 초기 칼슘 결핍</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
                    공중 습도를 60% 이상으로 유지하고, 칼슘과 미네랄이 함유된 영양 앰플을 2주 간격으로 분무해주시면 새 잎의 건강한 찢잎 형성을 촉진할 수 있습니다.
                  </p>
                </div>
                <button className="fc-btn fc-btn-secondary" style={{ width: '100%' }} onClick={() => triggerPlantCareBooking(plants[0])}>
                  🏡 1:1 방문 홈케어 신청하기
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: CARE PROGRAMS */}
        {activeTab === 'careprograms' && (
          <section className="fc-section">
            <div className="fc-section-header" style={{ textAlign: 'center', display: 'block', marginBottom: '40px' }}>
              <span className="fc-logo-badge" style={{ fontSize: '0.85rem', padding: '4px 14px' }}>MEMBERSHIP</span>
              <h2 className="fc-section-title" style={{ marginTop: '8px' }}>맞춤형 정기 Care Program</h2>
              <p className="fc-section-sub">나에게 딱 맞는 플로라케어 정기 구독으로 소중한 반려식물을 사계절 내내 건강하게 지켜주세요.</p>
            </div>

            <div className="fc-grid-3">
              {carePrograms.map(prog => (
                <div key={prog.id} className={`fc-program-card ${prog.tier === 'Standard' ? 'featured' : ''}`}>
                  {prog.tier === 'Standard' && <div className="fc-featured-badge">가장 인기 있는 선택</div>}
                  <h3 className="fc-program-name">{prog.name}</h3>
                  <p className="fc-program-desc">{prog.description}</p>

                  <div className="fc-price-box">
                    <span className="fc-price-val">{prog.monthlyPrice.toLocaleString()}</span>
                    <span className="fc-price-period">원 / 월</span>
                  </div>

                  <ul className="fc-feature-list">
                    {prog.features.map((feat, idx) => (
                      <li key={idx} className="fc-feature-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button className="fc-btn fc-btn-primary" onClick={() => triggerTierOptionCheckout(prog, 6)}>
                      ✨ 6개월 정기구독 신청
                    </button>
                    {prog.tier === 'Premium' && (
                      <button className="fc-btn fc-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.78rem' }} onClick={() => simulateBugAttack(8)}>
                        ⚡ Premium 6개월 5,000원 승급
                      </button>
                    )}
                    <button className="fc-btn fc-btn-secondary fc-btn-sm" onClick={() => triggerProgramSubscribe(prog, 1)}>
                      1개월 체험 구독
                    </button>
                    <button className="fc-btn fc-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.78rem' }} onClick={() => simulateBugAttack(2)}>
                      ⚡ 1,500원 신규 프로모션 구독
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 5: REPOTING SERVICE */}
        {activeTab === 'repotting' && (
          <section className="fc-section">
            <div className="fc-section-header">
              <div>
                <h2 className="fc-section-title">안심 분갈이 딜리버리 서비스</h2>
                <p className="fc-section-sub">무겁고 번거로운 분갈이는 전문가에게 맡기세요! 픽업부터 배양토 배합, 토분 교체 후 안전 배송까지.</p>
              </div>
            </div>

            <div className="fc-grid-3" style={{ marginBottom: '40px' }}>
              {[
                { id: 'rep_small', title: '소형 화분 분갈이 (10~15cm)', price: 25000, desc: '다육이, 미니 관엽, 허브류 안심 배양토 교체 + 영양제 첨가' },
                { id: 'rep_medium', title: '중형 화분 분갈이 (16~25cm)', price: 36000, desc: '몬스테라, 올리브나무 뿌리 엉킴 정리 + 지주대 세팅 + 활착제' },
                { id: 'rep_large', title: '대형 화분 딜리버리 (26cm 이상)', price: 48000, desc: '여인초, 알로카시아 대형목 전문 가드너 2인 픽업/케어/배송 풀패키지' }
              ].map(rep => (
                <div key={rep.id} className="fc-program-card">
                  <h3 className="fc-program-name" style={{ fontSize: '1.2rem' }}>{rep.title}</h3>
                  <p className="fc-program-desc">{rep.desc}</p>
                  <div className="fc-price-box">
                    <span className="fc-price-val">{rep.price.toLocaleString()}</span>
                    <span className="fc-price-period">원</span>
                  </div>
                  <button className="fc-btn fc-btn-primary" onClick={() => { setRepottingForm({ serviceId: rep.id, plantId: plants[0]?.id || '', customAmount: rep.price }); setIsRepottingModalOpen(true); }}>
                    🪴 이 옵션으로 신청하기
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 6: STORE */}
        {activeTab === 'store' && (
          <section className="fc-section">
            <div className="fc-section-header">
              <div>
                <h2 className="fc-section-title">플로라케어 가드닝 셀렉트 스토어</h2>
                <p className="fc-section-sub">식물 전문가들이 엄선한 친환경 프리미엄 영양제, 명품 원예가위, 멸균 배양토 & 토분을 만나보세요.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="fc-btn fc-btn-secondary" onClick={triggerFeeTamperedCheckout}>
                  🚚 배송비/서비스료 프로모션 구매
                </button>
                <button className="fc-btn fc-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => simulateBugAttack(9)}>
                  ⚡ 배송비/서비스료 0원 혜택 결제
                </button>
                <button className="fc-btn fc-btn-primary" onClick={openOrderSummaryConfirmModal}>
                  📋 2단계 주문 확인 결제
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['전체', '가드닝 도구', '식물 영양제', '케어 기기', '화분 & 소품', '토양 & 비료'].map(cat => (
                  <button
                    key={cat}
                    className={`fc-btn fc-btn-sm ${storeCategory === cat ? 'fc-btn-primary' : 'fc-btn-secondary'}`}
                    onClick={() => { setStoreCategory(cat); setTimeout(fetchProducts, 50); }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="fc-input"
                  style={{ width: '220px', padding: '8px 14px', fontSize: '0.85rem' }}
                  placeholder="용품 검색..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                />
              </div>
            </div>

            <div className="fc-grid-3">
              {products.map(prod => (
                <div key={prod.id} className="fc-product-card">
                  <img src={prod.image} alt={prod.name} className="fc-product-img" />
                  <div className="fc-product-body">
                    <span className="fc-product-cat">{prod.category}</span>
                    <h3 className="fc-product-title">{prod.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#f4a261', marginBottom: '8px' }}>
                      <span>★ {prod.rating}</span>
                      <span style={{ color: 'var(--text-sub)' }}>({prod.reviewsCount}개 리뷰)</span>
                    </div>
                    <div className="fc-product-price">{prod.price.toLocaleString()}원</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button className="fc-btn fc-btn-secondary fc-btn-sm" style={{ flex: 1 }} onClick={() => { setSelectedProduct(prod); }}>
                        상세보기
                      </button>
                      <button className="fc-btn fc-btn-primary fc-btn-sm" style={{ flex: 1.2 }} onClick={() => handleAddToCart(prod.id, 1)}>
                        🛒 장바구니 담기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 7: COMMUNITY */}
        {activeTab === 'community' && (
          <section className="fc-section">
            <div className="fc-section-header">
              <div>
                <h2 className="fc-section-title">식물 집사 커뮤니티 & 꿀팁 광장</h2>
                <p className="fc-section-sub">반려식물 성장 자랑, 병해충 고민 나눔, 식집사들의 생생한 후기를 확인하세요.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {communityPosts.map(post => (
                  <div key={post.id} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="fc-logo-badge">{post.category}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>{post.date} · {post.author}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '8px' }}>{post.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: '1.6', marginBottom: '16px' }}>{post.content}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                      <button className="fc-btn fc-btn-secondary fc-btn-sm" onClick={() => handleLikePost(post.id)}>
                        ❤️ 좋아요 {post.likes}
                      </button>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>💬 댓글 {post.comments.length}개</span>
                    </div>

                    {post.comments.length > 0 && (
                      <div style={{ marginTop: '14px', background: 'var(--bg-ivory)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {post.comments.map((c, i) => (
                          <div key={i} style={{ fontSize: '0.82rem' }}>
                            <strong style={{ color: 'var(--primary-forest)' }}>{c.author}:</strong> {c.content}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* New Post Form */}
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border-light)', height: 'fit-content' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '16px' }}>
                  ✍️ 새 글 작성하기
                </h3>
                <form onSubmit={handlePostSubmit}>
                  <div className="fc-form-group">
                    <label className="fc-form-label">카테고리</label>
                    <select
                      className="fc-select"
                      value={postForm.category}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                    >
                      <option value="식물자랑">식물자랑 🌿</option>
                      <option value="가드닝 꿀팁">가드닝 꿀팁 💡</option>
                      <option value="질문과 답변">질문과 답변 ❓</option>
                      <option value="분갈이 후기">분갈이 후기 🪴</option>
                    </select>
                  </div>
                  <div className="fc-form-group">
                    <label className="fc-form-label">제목</label>
                    <input
                      type="text"
                      className="fc-input"
                      required
                      placeholder="제목을 입력하세요"
                      value={postForm.title}
                      onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    />
                  </div>
                  <div className="fc-form-group">
                    <label className="fc-form-label">내용</label>
                    <textarea
                      className="fc-textarea"
                      required
                      placeholder="식물 이야기나 궁금한 점을 적어주세요."
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="fc-btn fc-btn-primary" style={{ width: '100%' }}>
                    게시글 등록하기
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* TAB 8: SUPPORT */}
        {activeTab === 'support' && (
          <section className="fc-section">
            <div className="fc-section-header">
              <div>
                <h2 className="fc-section-title">전문 가드너 1:1 상담 센터</h2>
                <p className="fc-section-sub">식물의 이상 징후나 맞춤형 케어법에 대해 공인 식물치료사 및 전문 가드너가 답변해드립니다.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '20px' }}>
                  🩺 1:1 전문 상담 문의 접수
                </h3>
                <form onSubmit={handleSupportSubmit}>
                  <div className="fc-form-group">
                    <label className="fc-form-label">상담 유형</label>
                    <select
                      className="fc-select"
                      value={supportForm.type}
                      onChange={(e) => setSupportForm({ ...supportForm, type: e.target.value })}
                    >
                      <option value="병해충 정밀 상담">병해충 정밀 상담 (응애, 깍지벌레, 곰팡이)</option>
                      <option value="생육 환경 진단">생육 환경 진단 (일조량, 통풍, 온습도)</option>
                      <option value="분갈이 & 토양 문의">분갈이 & 토양 배합 문의</option>
                      <option value="Care Program 구독 문의">Care Program 정기 멤버십 문의</option>
                    </select>
                  </div>
                  <div className="fc-form-group">
                    <label className="fc-form-label">식물 이름 / 수종</label>
                    <input
                      type="text"
                      className="fc-input"
                      placeholder="예: 알로카시아 프라이덱"
                      value={supportForm.plantName}
                      onChange={(e) => setSupportForm({ ...supportForm, plantName: e.target.value })}
                    />
                  </div>
                  <div className="fc-form-group">
                    <label className="fc-form-label">문의 제목</label>
                    <input
                      type="text"
                      className="fc-input"
                      required
                      placeholder="문의 제목을 입력하세요"
                      value={supportForm.title}
                      onChange={(e) => setSupportForm({ ...supportForm, title: e.target.value })}
                    />
                  </div>
                  <div className="fc-form-group">
                    <label className="fc-form-label">상세 증상 및 환경 설명</label>
                    <textarea
                      className="fc-textarea"
                      required
                      placeholder="키우는 장소(베란다/거실), 물주기 주기, 최근 나타난 증상을 자세히 적어주세요."
                      value={supportForm.content}
                      onChange={(e) => setSupportForm({ ...supportForm, content: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="fc-btn fc-btn-primary" style={{ width: '100%', padding: '12px' }}>
                    상담 문의 등록하기
                  </button>
                </form>
              </div>

              {/* Inquiry History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-forest)' }}>
                  나의 상담 내역 ({supportInquiries.length}건)
                </h4>
                {supportInquiries.map(inq => (
                  <div key={inq.id} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="fc-logo-badge">{inq.type}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{inq.date}</span>
                    </div>
                    <h5 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '6px' }}>{inq.title}</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', marginBottom: '12px' }}>{inq.content}</p>
                    <div style={{ background: 'var(--mint-bg)', padding: '12px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--leaf-green)' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--primary-emerald)' }}>{inq.status}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-dark)', marginTop: '4px', lineHeight: '1.4' }}>{inq.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* =========================================================
          UNIVERSAL CHECKOUT MODAL
          ========================================================= */}
      {isCheckoutModalOpen && (
        <div className="fc-modal-backdrop" onClick={() => setIsCheckoutModalOpen(false)}>
          <div className="fc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fc-modal-header">
              <h3 className="fc-modal-title">주문 및 결제 확인</h3>
              <button className="fc-modal-close" onClick={() => setIsCheckoutModalOpen(false)}>✕</button>
            </div>
            <div className="fc-modal-body">
              <div style={{ background: 'var(--bg-ivory)', padding: '18px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                <span className="fc-logo-badge" style={{ marginBottom: '8px' }}>{checkoutData.flowOrigin || '주문 결제'}</span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-forest)', margin: '6px 0 4px' }}>
                  {checkoutData.title}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  수량: {checkoutData.itemsCount}개 · 결제 방식: {checkoutData.paymentMethod}
                </div>
              </div>

              <div className="fc-form-group">
                <label className="fc-form-label">배송 주소</label>
                <input
                  type="text"
                  className="fc-input"
                  value={user.address}
                  onChange={(e) => setUser({ ...user, address: e.target.value })}
                />
              </div>

              <div className="fc-form-group">
                <label className="fc-form-label">받는 분 연락처</label>
                <input
                  type="text"
                  className="fc-input"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
              </div>

              <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)', margin: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span>상품/서비스 소계</span>
                  <span>{checkoutData.subtotal.toLocaleString()}원</span>
                </div>
                {checkoutData.shippingFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span>배송비</span>
                    <span>{checkoutData.shippingFee.toLocaleString()}원</span>
                  </div>
                )}
                {checkoutData.serviceFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span>안심 케어 서비스 이용료</span>
                    <span>{checkoutData.serviceFee.toLocaleString()}원</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary-forest)', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '6px' }}>
                  <span>최종 결제 금액</span>
                  <span>
                    {(checkoutData.customAmount !== null ? Number(checkoutData.customAmount) : (checkoutData.subtotal + checkoutData.shippingFee + checkoutData.serviceFee)).toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
            <div className="fc-modal-footer">
              <button className="fc-btn fc-btn-secondary" onClick={() => setIsCheckoutModalOpen(false)}>
                취소
              </button>
              <button className="fc-btn fc-btn-primary" onClick={handleUniversalPaymentSubmit}>
                💳 결제 승인 완료하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          2-STEP ORDER CONFIRM MODAL (Flow SEC-320)
          ========================================================= */}
      {isOrderSummaryConfirmModalOpen && (
        <div className="fc-modal-backdrop" onClick={() => setIsOrderSummaryConfirmModalOpen(false)}>
          <div className="fc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fc-modal-header">
              <h3 className="fc-modal-title">📋 2단계 주문 요약서 최종 확인 및 승인</h3>
              <button className="fc-modal-close" onClick={() => setIsOrderSummaryConfirmModalOpen(false)}>✕</button>
            </div>
            <div className="fc-modal-body">
              <div style={{ background: 'var(--bg-ivory)', padding: '18px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div style={{ fontWeight: '800', color: 'var(--primary-forest)', fontSize: '1.1rem' }}>
                  올인원 프리미엄 가드닝 & 케어 솔루션 패키지
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  주문 번호: FC-ORD-SUMMARY-99201 · 회원명: {user.name}
                </div>
              </div>

              <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>주문 기준가</span>
                  <strong>69,000원</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>배송비</span>
                  <span>3,000원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>안심 케어 보증 수수료</span>
                  <span>2,000원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary-forest)', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                  <span>최종 승인 금액</span>
                  <span>74,000원</span>
                </div>
              </div>
            </div>
            <div className="fc-modal-footer">
              <button className="fc-btn fc-btn-secondary" onClick={() => setIsOrderSummaryConfirmModalOpen(false)}>
                닫기
              </button>
              <button className="fc-btn fc-btn-primary" onClick={() => handleFinalOrder2StepConfirm(74000)}>
                최종 결제 승인 확정
              </button>
              <button className="fc-btn fc-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => { setIsOrderSummaryConfirmModalOpen(false); simulateBugAttack(10); }}>
                ⚡ 2단계 최종 100원 승인 확정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PLANT DETAIL MODAL
          ========================================================= */}
      {isPlantModalOpen && selectedPlant && (
        <div className="fc-modal-backdrop" onClick={() => setIsPlantModalOpen(false)}>
          <div className="fc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fc-modal-header">
              <h3 className="fc-modal-title">{selectedPlant.name} 상세 정보</h3>
              <button className="fc-modal-close" onClick={() => setIsPlantModalOpen(false)}>✕</button>
            </div>
            <div className="fc-modal-body">
              <img src={selectedPlant.image} alt={selectedPlant.name} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="fc-logo-badge">{selectedPlant.category}</span>
                <span style={{ fontWeight: '800', color: 'var(--primary-emerald)' }}>건강 점수: {selectedPlant.healthScore}점</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '16px', lineHeight: '1.6' }}>
                {selectedPlant.memo}
              </p>
              <div className="fc-plant-meta">
                <div className="fc-meta-row">
                  <span>학명</span>
                  <strong>{selectedPlant.scientificName}</strong>
                </div>
                <div className="fc-meta-row">
                  <span>물주기 주기</span>
                  <strong>{selectedPlant.waterCycleDays}일 마다</strong>
                </div>
                <div className="fc-meta-row">
                  <span>적정 광량</span>
                  <span>{selectedPlant.sunlight}</span>
                </div>
                <div className="fc-meta-row">
                  <span>적정 온습도</span>
                  <span>{selectedPlant.temp} · {selectedPlant.humidity}</span>
                </div>
              </div>
            </div>
            <div className="fc-modal-footer">
              <button className="fc-btn fc-btn-secondary" onClick={() => handleWaterPlant(selectedPlant.id)}>
                💧 물주기 완료
              </button>
              <button className="fc-btn fc-btn-primary" onClick={() => { setIsPlantModalOpen(false); triggerPlantCareBooking(selectedPlant); }}>
                🏡 1:1 방문 홈케어 신청
              </button>
              <button className="fc-btn fc-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => { setIsPlantModalOpen(false); simulateBugAttack(1); }}>
                ⚡ 1,000원 특가 방문케어 신청
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ADD PLANT MODAL
          ========================================================= */}
      {isAddPlantModalOpen && (
        <div className="fc-modal-backdrop" onClick={() => setIsAddPlantModalOpen(false)}>
          <div className="fc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fc-modal-header">
              <h3 className="fc-modal-title">🌱 새 반려식물 등록</h3>
              <button className="fc-modal-close" onClick={() => setIsAddPlantModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddPlant}>
              <div className="fc-modal-body">
                <div className="fc-form-group">
                  <label className="fc-form-label">식물 애칭</label>
                  <input
                    type="text"
                    className="fc-input"
                    required
                    placeholder="예: 초록이, 몬티"
                    value={newPlantForm.name}
                    onChange={(e) => setNewPlantForm({ ...newPlantForm, name: e.target.value })}
                  />
                </div>
                <div className="fc-form-group">
                  <label className="fc-form-label">식물 종류/학명</label>
                  <input
                    type="text"
                    className="fc-input"
                    placeholder="예: Monstera deliciosa"
                    value={newPlantForm.scientificName}
                    onChange={(e) => setNewPlantForm({ ...newPlantForm, scientificName: e.target.value })}
                  />
                </div>
                <div className="fc-form-group">
                  <label className="fc-form-label">카테고리</label>
                  <select
                    className="fc-select"
                    value={newPlantForm.category}
                    onChange={(e) => setNewPlantForm({ ...newPlantForm, category: e.target.value })}
                  >
                    <option value="관엽식물">관엽식물</option>
                    <option value="목본류">목본류</option>
                    <option value="다육/선인장">다육/선인장</option>
                    <option value="허브">허브</option>
                    <option value="희귀 관엽">희귀 관엽</option>
                  </select>
                </div>
                <div className="fc-form-group">
                  <label className="fc-form-label">물주기 주기 (일)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="fc-input"
                    value={newPlantForm.waterCycleDays}
                    onChange={(e) => setNewPlantForm({ ...newPlantForm, waterCycleDays: e.target.value })}
                  />
                </div>
                <div className="fc-form-group">
                  <label className="fc-form-label">생육 메모</label>
                  <textarea
                    className="fc-textarea"
                    placeholder="식물의 특징이나 키우는 장소를 적어주세요."
                    value={newPlantForm.memo}
                    onChange={(e) => setNewPlantForm({ ...newPlantForm, memo: e.target.value })}
                  />
                </div>
              </div>
              <div className="fc-modal-footer">
                <button type="button" className="fc-btn fc-btn-secondary" onClick={() => setIsAddPlantModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="fc-btn fc-btn-primary">
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          REPOTING MODAL
          ========================================================= */}
      {isRepottingModalOpen && (
        <div className="fc-modal-backdrop" onClick={() => setIsRepottingModalOpen(false)}>
          <div className="fc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fc-modal-header">
              <h3 className="fc-modal-title">🪴 안심 분갈이 딜리버리 신청</h3>
              <button className="fc-modal-close" onClick={() => setIsRepottingModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={triggerRepottingSubmit}>
              <div className="fc-modal-body">
                <div className="fc-form-group">
                  <label className="fc-form-label">분갈이할 반려식물</label>
                  <select
                    className="fc-select"
                    value={repottingForm.plantId}
                    onChange={(e) => setRepottingForm({ ...repottingForm, plantId: e.target.value })}
                  >
                    {plants.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                    ))}
                  </select>
                </div>
                <div className="fc-form-group">
                  <label className="fc-form-label">화분 크기 및 패키지 선택</label>
                  <select
                    className="fc-select"
                    value={repottingForm.serviceId}
                    onChange={(e) => {
                      const svc = { rep_small: 25000, rep_medium: 36000, rep_large: 48000 }[e.target.value] || 36000;
                      setRepottingForm({ ...repottingForm, serviceId: e.target.value, customAmount: svc });
                    }}
                  >
                    <option value="rep_small">소형 화분 (10~15cm) — 25,000원</option>
                    <option value="rep_medium">중형 화분 (16~25cm) — 36,000원</option>
                    <option value="rep_large">대형/수목형 화분 (26cm 이상) — 48,000원</option>
                  </select>
                </div>
                <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: 'var(--primary-forest)', fontSize: '1.1rem' }}>
                    <span>서비스 결제 금액</span>
                    <span>{repottingForm.customAmount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
              <div className="fc-modal-footer">
                <button type="button" className="fc-btn fc-btn-secondary" onClick={() => setIsRepottingModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="fc-btn fc-btn-primary">
                  신청 및 결제 완료
                </button>
                <button type="button" className="fc-btn fc-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => { setIsRepottingModalOpen(false); simulateBugAttack(5); }}>
                  ⚡ 대형 분갈이 2,500원 신청
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          NUTRITION CARE MODAL
          ========================================================= */}
      {isNutritionModalOpen && (
        <div className="fc-modal-backdrop" onClick={() => setIsNutritionModalOpen(false)}>
          <div className="fc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fc-modal-header">
              <h3 className="fc-modal-title">🧪 식물 맞춤 영양 관리 정기 솔루션</h3>
              <button className="fc-modal-close" onClick={() => setIsNutritionModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={triggerNutritionSubmit}>
              <div className="fc-modal-body">
                <div className="fc-form-group">
                  <label className="fc-form-label">대상 반려식물</label>
                  <select
                    className="fc-select"
                    value={nutritionForm.plantId}
                    onChange={(e) => setNutritionForm({ ...nutritionForm, plantId: e.target.value })}
                  >
                    {plants.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="fc-form-group">
                  <label className="fc-form-label">영양제 처방 플랜</label>
                  <select
                    className="fc-select"
                    value={nutritionForm.planType}
                    onChange={(e) => setNutritionForm({ ...nutritionForm, planType: e.target.value })}
                  >
                    <option value="유기농 종합 액비 앰플">유기농 종합 액비 앰플 (잎·뿌리 균형)</option>
                    <option value="고농축 미네랄 활력제">고농축 미네랄 활력제 (분갈이/환경적응용)</option>
                    <option value="친환경 병해충 저항성 강화제">친환경 병해충 저항성 강화제</option>
                  </select>
                </div>
                <div className="fc-form-group">
                  <label className="fc-form-label">관리 기간 선택</label>
                  <select
                    className="fc-select"
                    value={nutritionForm.months}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setNutritionForm({ ...nutritionForm, months: m, customAmount: 28000 * m });
                    }}
                  >
                    <option value={1}>1개월 (28,000원)</option>
                    <option value={3}>3개월 집중 케어 (84,000원)</option>
                    <option value={6}>6개월 사계절 솔루션 (168,000원)</option>
                  </select>
                </div>
                <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: 'var(--primary-forest)', fontSize: '1.1rem' }}>
                    <span>정기 배송 총액</span>
                    <span>{nutritionForm.customAmount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
              <div className="fc-modal-footer">
                <button type="button" className="fc-btn fc-btn-secondary" onClick={() => setIsNutritionModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="fc-btn fc-btn-primary">
                  구독 신청 완료
                </button>
                <button type="button" className="fc-btn fc-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => { setIsNutritionModalOpen(false); simulateBugAttack(7); }}>
                  ⚡ 3개월 영양 솔루션 3,000원 구독
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          PROFILE & ADDRESS MODAL
          ========================================================= */}
      {isProfileModalOpen && (
        <div className="fc-modal-backdrop" onClick={() => setIsProfileModalOpen(false)}>
          <div className="fc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fc-modal-header">
              <h3 className="fc-modal-title">👤 회원 프로필 & 기본 배송지 관리</h3>
              <button className="fc-modal-close" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleProfileSubmit}>
              <div className="fc-modal-body">
                <div className="fc-form-group">
                  <label className="fc-form-label">회원 닉네임</label>
                  <input
                    type="text"
                    className="fc-input"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                  />
                </div>
                <div className="fc-form-group">
                  <label className="fc-form-label">연락처</label>
                  <input
                    type="text"
                    className="fc-input"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </div>
                <div className="fc-form-group">
                  <label className="fc-form-label">기본 배송지 주소</label>
                  <input
                    type="text"
                    className="fc-input"
                    value={user.address}
                    onChange={(e) => setUser({ ...user, address: e.target.value })}
                  />
                </div>
                <div className="fc-form-group">
                  <label className="fc-form-label">가드닝 경력 / 숙련도</label>
                  <input
                    type="text"
                    className="fc-input"
                    value={user.experience}
                    onChange={(e) => setUser({ ...user, experience: e.target.value })}
                  />
                </div>
              </div>
              <div className="fc-modal-footer">
                <button type="button" className="fc-btn fc-btn-secondary" onClick={() => { setIsProfileModalOpen(false); triggerAddressCheckout(); }}>
                  🚚 이 배송지로 바로 결제
                </button>
                <button type="button" className="fc-btn fc-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => { setIsProfileModalOpen(false); simulateBugAttack(3); }}>
                  ⚡ 2,000원 배송지 즉시결제
                </button>
                <button type="submit" className="fc-btn fc-btn-primary">
                  정보 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          CART DRAWER
          ========================================================= */}
      {isCartDrawerOpen && (
        <div className="fc-drawer-backdrop" onClick={() => setIsCartDrawerOpen(false)}>
          <div className="fc-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="fc-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-forest)' }}>
                🛒 장바구니 ({cart.length}개)
              </h3>
              <button className="fc-modal-close" onClick={() => setIsCartDrawerOpen(false)}>✕</button>
            </div>
            <div className="fc-drawer-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)' }}>
                  장바구니가 비어 있습니다.
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} style={{ background: 'var(--bg-ivory)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', gap: '12px', border: '1px solid var(--border-light)' }}>
                    <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ flex: 1 }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '4px' }}>{item.name}</h5>
                      <div style={{ fontSize: '0.85rem', color: 'var(--moss-green)', fontWeight: '700' }}>{item.price.toLocaleString()}원</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <button className="fc-btn fc-btn-secondary fc-btn-sm" style={{ padding: '2px 8px' }} onClick={() => handleUpdateCartQty(item.productId, item.quantity - 1)}>-</button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>{item.quantity}</span>
                        <button className="fc-btn fc-btn-secondary fc-btn-sm" style={{ padding: '2px 8px' }} onClick={() => handleUpdateCartQty(item.productId, item.quantity + 1)}>+</button>
                        <span style={{ marginLeft: 'auto', fontWeight: '800', fontSize: '0.9rem', color: 'var(--primary-forest)' }}>
                          {(item.price * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="fc-drawer-footer">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                  <span>상품 금액</span>
                  <span>{cartSummary.subtotal.toLocaleString()}원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '10px' }}>
                  <span>배송비</span>
                  <span>{cartSummary.shippingFee.toLocaleString()}원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary-forest)', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginBottom: '16px' }}>
                  <span>결제 예정 금액</span>
                  <span>{cartSummary.totalAmount.toLocaleString()}원</span>
                </div>
                <button className="fc-btn fc-btn-primary" style={{ width: '100%' }} onClick={triggerCartCheckout}>
                  주문 결제 진행하기
                </button>
                <button className="fc-btn" style={{ width: '100%', marginTop: '8px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '10px', fontSize: '0.85rem' }} onClick={() => { setIsCartDrawerOpen(false); simulateBugAttack(6); }}>
                  ⚡ 장바구니 500원 결제
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          ORDERS DRAWER
          ========================================================= */}
      {isOrdersDrawerOpen && (
        <div className="fc-drawer-backdrop" onClick={() => setIsOrdersDrawerOpen(false)}>
          <div className="fc-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="fc-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-forest)' }}>
                📋 나의 주문 및 이용내역 ({orders.length}건)
              </h3>
              <button className="fc-modal-close" onClick={() => setIsOrdersDrawerOpen(false)}>✕</button>
            </div>
            <div className="fc-drawer-body">
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)' }}>주문 내역이 없습니다.</div>
              ) : (
                orders.map((ord, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-ivory)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="fc-logo-badge">{ord.flowOrigin || '주문'}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{ord.orderDate}</span>
                    </div>
                    <h5 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--primary-forest)', margin: '4px 0' }}>{ord.title}</h5>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>주문번호: {ord.orderId}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--moss-green)' }}>{ord.status}</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--primary-forest)' }}>
                        {ord.paymentAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          NOTIFICATIONS DRAWER
          ========================================================= */}
      {isNotifDrawerOpen && (
        <div className="fc-drawer-backdrop" onClick={() => setIsNotifDrawerOpen(false)}>
          <div className="fc-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="fc-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-forest)' }}>
                🔔 알림 센터
              </h3>
              <button className="fc-modal-close" onClick={() => setIsNotifDrawerOpen(false)}>✕</button>
            </div>
            <div className="fc-drawer-body">
              {notifications.map(n => (
                <div key={n.id} style={{ background: n.read ? 'var(--bg-ivory)' : '#ffffff', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-light)', borderLeft: n.read ? '1px solid var(--border-light)' : '4px solid var(--leaf-green)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--primary-forest)' }}>{n.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TOAST NOTIFICATION
          ========================================================= */}
      {toast && (
        <div className="fc-toast">
          <div>
            <div className="fc-toast-title">{toast.title}</div>
            {toast.desc && <div className="fc-toast-desc">{toast.desc}</div>}
          </div>
        </div>
      )}

      {/* =========================================================
          FOOTER
          ========================================================= */}
      <footer className="fc-footer">
        <div className="fc-container">
          <div className="fc-footer-grid">
            <div>
              <div className="fc-footer-title">FloraCare (플로라케어)</div>
              <p className="fc-footer-text">
                플로라케어는 반려식물과 함께하는 일상을 더 푸르고 건강하게 만들어가는 대한민국 대표 스마트 디지털 식물 케어 플랫폼입니다.
              </p>
            </div>
            <div className="fc-footer-col">
              <h5>주요 서비스</h5>
              <ul>
                <li><a href="#dash" onClick={() => setActiveTab('dashboard')}>스마트 식물 대시보드</a></li>
                <li><a href="#diag" onClick={() => setActiveTab('diagnosis')}>AI 병해충 정밀 진단</a></li>
                <li><a href="#care" onClick={() => setActiveTab('careprograms')}>정기 Care Program</a></li>
                <li><a href="#repot" onClick={() => setActiveTab('repotting')}>안심 분갈이 딜리버리</a></li>
              </ul>
            </div>
            <div className="fc-footer-col">
              <h5>가드닝 스토어</h5>
              <ul>
                <li><a href="#store" onClick={() => { setActiveTab('store'); setStoreCategory('식물 영양제'); }}>유기농 맞춤 영양제</a></li>
                <li><a href="#tools" onClick={() => { setActiveTab('store'); setStoreCategory('가드닝 도구'); }}>프리미엄 원예 도구</a></li>
                <li><a href="#pots" onClick={() => { setActiveTab('store'); setStoreCategory('화분 & 소품'); }}>이태리 테라코타 토분</a></li>
                <li><a href="#soil" onClick={() => { setActiveTab('store'); setStoreCategory('토양 & 비료'); }}>멸균 안심 배양토</a></li>
              </ul>
            </div>
            <div className="fc-footer-col">
              <h5>고객 지원</h5>
              <ul>
                <li><a href="#support" onClick={() => setActiveTab('support')}>1:1 전문가 상담</a></li>
                <li><a href="#comm" onClick={() => setActiveTab('community')}>식집사 커뮤니티</a></li>
                <li><a href="#terms">이용약관 및 정책</a></li>
                <li><a href="#privacy">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>
          <div className="fc-footer-bottom">
            <div>© 2026 FloraCare Inc. All rights reserved. (반려식물 관리 및 진단 플랫폼)</div>
            <div>고객센터: 1588-9929 (평일 09:00 ~ 18:00)</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
