import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation State (14 Sidebar Sections)
  const [activeNav, setActiveNav] = useState('dashboard');
  
  // Farm & User States
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('farm_01');
  const [user, setUser] = useState({
    id: 'usr_agri_01',
    name: '박준혁',
    email: 'junhyuk.farm@agripulse.io',
    phone: '010-4829-1920',
    role: '수석 스마트팜 마스터',
    farmCount: 4,
    license: '스마트농업 공인관리사 1급'
  });

  // Data States
  const [greenhouses, setGreenhouses] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cultivationSchedules, setCultivationSchedules] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [products, setProducts] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartSummary, setCartSummary] = useState({ subtotal: 0, shippingFee: 0, totalAmount: 0 });
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [farmReport, setFarmReport] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Filter & Search States
  const [marketCategory, setMarketCategory] = useState('전체');
  const [marketSearch, setMarketSearch] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [rentalDays, setRentalDays] = useState(1);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isCropDetailModalOpen, setIsCropDetailModalOpen] = useState(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [isAddWorkModalOpen, setIsAddWorkModalOpen] = useState(false);
  const [isInviteWorkerModalOpen, setIsInviteWorkerModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isTagOrderModalOpen, setIsTagOrderModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isTwoStepConfirmModalOpen, setIsTwoStepConfirmModalOpen] = useState(false);
  const [isUniversalCheckoutOpen, setIsUniversalCheckoutOpen] = useState(false);

  // Form States
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [newCropForm, setNewCropForm] = useState({ name: '', variety: '', greenhouseId: 'gh_01', quantity: 1000, expectedHarvestAt: '2026-11-30' });
  const [newWorkForm, setNewWorkForm] = useState({ title: '', type: '생육관리', scheduledDate: '2026-09-30', assignee: '박준혁 마스터', description: '' });
  const [inviteForm, setInviteForm] = useState({ workerName: '이동현 수석 재배사', role: '스마트온실 수경 양액 전문 관리사', message: '충남 부여 1~4호동 스마트 온실 양액 제어 및 곁순 정지 총괄 위탁' });
  const [tagForm, setTagForm] = useState({ productId: 'prod_01', tags: 'NFC 전자태그 & QR코드 1,000매' });
  const [couponCode, setCouponCode] = useState('FARM-SPECIAL-2026');

  // Checkout Data
  const [checkoutData, setCheckoutData] = useState({
    title: '',
    itemsCount: 1,
    subtotal: 0,
    shippingFee: 3000,
    customAmount: null,
    flowOrigin: '',
    paymentMethod: '신용카드 결제'
  });

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (title, desc = '') => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 5000);
  };

  // Initial Load
  useEffect(() => {
    fetchFarms();
    fetchGreenhouses();
    fetchCrops();
    fetchCultivationSchedules();
    fetchWorkSchedules();
    fetchHarvests();
    fetchProducts();
    fetchEquipment();
    fetchCart();
    fetchOrders();
    fetchExpenses();
    fetchReports();
    fetchNotifications();
  }, []);

  // API Call Helpers
  const fetchFarms = async () => {
    try {
      const res = await fetch('/api/farms');
      const data = await res.json();
      if (data.success) {
        setFarms(data.farms || []);
        if (data.selectedFarmId) setSelectedFarmId(data.selectedFarmId);
      }
    } catch (e) { console.error(e); }
  };

  const handleSelectFarm = async (farmId) => {
    try {
      const res = await fetch('/api/farms/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmId })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedFarmId(farmId);
        fetchGreenhouses();
        fetchReports();
        showToast('🏡 농장 전환 완료', `[${data.farm.name}]으로 활성 농장을 전환하였습니다.`);
      }
    } catch (e) { console.error(e); }
  };

  const fetchGreenhouses = async () => {
    try {
      const res = await fetch('/api/greenhouses');
      const data = await res.json();
      if (data.success) setGreenhouses(data.greenhouses || []);
    } catch (e) { console.error(e); }
  };

  const fetchCrops = async () => {
    try {
      const res = await fetch('/api/crops');
      const data = await res.json();
      if (data.success) setCrops(data.crops || []);
    } catch (e) { console.error(e); }
  };

  const fetchCultivationSchedules = async () => {
    try {
      const res = await fetch('/api/cultivation-schedules');
      const data = await res.json();
      if (data.success) setCultivationSchedules(data.schedules || []);
    } catch (e) { console.error(e); }
  };

  const fetchWorkSchedules = async () => {
    try {
      const res = await fetch('/api/work-schedules');
      const data = await res.json();
      if (data.success) setWorkSchedules(data.schedules || []);
    } catch (e) { console.error(e); }
  };

  const fetchHarvests = async () => {
    try {
      const res = await fetch('/api/harvests');
      const data = await res.json();
      if (data.success) setHarvests(data.harvests || []);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      let url = `/api/products?category=${encodeURIComponent(marketCategory)}&search=${encodeURIComponent(marketSearch)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
    } catch (e) { console.error(e); }
  };

  const fetchEquipment = async () => {
    try {
      const res = await fetch('/api/equipment');
      const data = await res.json();
      if (data.success) setEquipmentList(data.equipment || []);
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

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      if (data.success) setExpenses(data.expenses || []);
    } catch (e) { console.error(e); }
  };

  const fetchReports = async () => {
    try {
      const [mRes, fRes] = await Promise.all([
        fetch('/api/reports/monthly'),
        fetch('/api/reports/farm')
      ]);
      const mData = await mRes.json();
      const fData = await fRes.json();
      if (mData.success) setMonthlyReport(mData.report);
      if (fData.success) setFarmReport(fData.farmReport);
    } catch (e) { console.error(e); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) setNotifications(data.notifications || []);
    } catch (e) { console.error(e); }
  };

  // Normal Cart Handlers
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
        showToast('🛒 장바구니 담기 완료', '선택하신 스마트팜 자재가 장바구니에 추가되었습니다.');
      }
    } catch (e) { console.error(e); }
  };

  const handleRemoveCartItem = async (productId) => {
    try {
      const res = await fetch(`/api/cart/items/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCart(data.cart);
        setCartSummary(data.summary);
      }
    } catch (e) { console.error(e); }
  };

  // Add Crop
  const handleAddCrop = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCropForm)
      });
      const data = await res.json();
      if (data.success) {
        fetchCrops();
        setIsAddCropModalOpen(false);
        setNewCropForm({ name: '', variety: '', greenhouseId: 'gh_01', quantity: 1000, expectedHarvestAt: '2026-11-30' });
        showToast('🌱 작물 등록 성공', `[${data.crop.name}]이(가) 온실 재배 목록에 추가되었습니다.`);
      }
    } catch (e) { console.error(e); }
  };

  // Add Work Schedule
  const handleAddWork = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/work-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkForm)
      });
      const data = await res.json();
      if (data.success) {
        fetchWorkSchedules();
        setIsAddWorkModalOpen(false);
        setNewWorkForm({ title: '', type: '생육관리', scheduledDate: '2026-09-30', assignee: '박준혁 마스터', description: '' });
        showToast('📋 작업 일정 등록', `[${data.schedule.title}] 일정이 배정되었습니다.`);
      }
    } catch (e) { console.error(e); }
  };

  // Normal 2-Step Confirmation Submit
  const handleFinalTwoStepConfirm = async (amt = 185000) => {
    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'AGRI-CONFIRM-' + Date.now(),
          authorizedAmount: amt
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        setIsTwoStepConfirmModalOpen(false);
        showToast('🎉 2단계 최종 승인 완료', `[${data.order.title}] ${data.order.paymentAmount.toLocaleString()}원 승인 확정되었습니다.`);
      }
    } catch (e) {
      showToast('오류', '최종 승인 중 문제가 발생했습니다.');
    }
  };

  // =========================================================================
  // 10 VULNERABILITY ATTACK SIMULATOR (Price Tampering with Bug IDs)
  // =========================================================================
  const simulateBugAttack = async (bugIndex) => {
    try {
      switch (bugIndex) {
        case 1: { // SEC-321: 농자재 태그 입력 흐름 금액 변조
          const prod = products[0] || { id: 'prod_01', name: '고당도 스테비아 토마토 F1 프리미엄 종자', price: 45000 };
          const res = await fetch('/api/inventory/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: prod.id,
              tags: 'NFC 스마트 전자태그 1,000매',
              customTagAmount: 1000 // Normal: 50,000 -> 1,000 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          setIsTagOrderModalOpen(false);
          showToast('🚨 [Bug ID: SITE031-BUG-001 / SEC-321] 농자재 태그 입력 금액 변조 완료', `정상가 50,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 발주 승인 완료! (발주번호: ${data.order.orderId})`);
          break;
        }
        case 2: { // SEC-322: 농장 작업자 초대 메시지 흐름 금액 변조
          const res = await fetch('/api/farm-members/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workerName: inviteForm.workerName,
              role: inviteForm.role,
              message: inviteForm.message,
              workerServiceAmount: 1500 // Normal: 120,000 -> 1,500 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          setIsInviteWorkerModalOpen(false);
          showToast('🚨 [Bug ID: SITE031-BUG-002 / SEC-322] 작업자 초대 서비스 금액 변조 완료', `정상가 120,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 매칭 승인 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 3: { // SEC-323: 농기구 대여 서비스 흐름 금액 변조
          const eq = equipmentList[0] || { id: 'eq_01', rentalPrice: 35000 };
          const res = await fetch('/api/equipment-rentals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              equipmentId: eq.id,
              days: 2,
              rentalPrice: 2000 // Normal: 70,000 -> 2,000 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          setIsRentalModalOpen(false);
          showToast('🚨 [Bug ID: SITE031-BUG-003 / SEC-323] 농기구 대여료 금액 변조 완료', `정상 대여료 70,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 대여 승인 완료! (예약번호: ${data.order.orderId})`);
          break;
        }
        case 4: { // SEC-324: 비료 및 영양제 주문 흐름 금액 변조
          const prod = products[3] || { id: 'prod_04', price: 78000 };
          const res = await fetch('/api/nutrition-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: prod.id,
              quantity: 2,
              nutritionSubtotal: 2500 // Normal: 156,000 -> 2,500 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE031-BUG-004 / SEC-324] 비료/영양제 주문 금액 변조 완료', `정상가 156,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 발주 승인 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 5: { // SEC-325: 씨앗 및 모종 주문 흐름 금액 변조
          const prod = products[0] || { id: 'prod_01', price: 45000 };
          const res = await fetch('/api/seed-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: prod.id,
              quantity: 2,
              seedOrderAmount: 800 // Normal: 90,000 -> 800 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE031-BUG-005 / SEC-325] 씨앗/모종 주문 금액 변조 완료', `정상가 90,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 발주 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 6: { // SEC-326: 장바구니 수량 변경 흐름 금액 변조
          const firstItem = cart[0] || { productId: 'prod_04', quantity: 2 };
          const res = await fetch(`/api/cart/items/${firstItem.productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quantity: 3,
              tamperedCartTotal: 500 // Normal: ~279,000 -> 500 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          fetchCart();
          setIsCartDrawerOpen(false);
          showToast('🚨 [Bug ID: SITE031-BUG-006 / SEC-326] 장바구니 결제 금액 변조 완료', `정상 합계 279,000원 -> 변조합계 ${data.order.paymentAmount.toLocaleString()}원 결제 승인 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 7: { // SEC-327: 농자재 배송비 계산 흐름 금액 변조
          const res = await fetch('/api/shipping/estimate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subtotal: 95000,
              clientShippingFee: 0 // Normal freight: 6,000 -> 0 KRW
            })
          });
          const data = await res.json();
          const payRes = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '수경재배 코코피트 슬래브 10장 (배송비 0원 무료 프로모션 적용)',
              itemsCount: 1,
              actualSubtotal: 101000,
              paymentAmount: data.totalAmount, // 95,000 KRW (6,000 freight omitted)
              flowOrigin: '농자재 무료배송 프로모션 결제'
            })
          });
          const payData = await payRes.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE031-BUG-007 / SEC-327] 배송비 계산 금액 변조 완료', `화물 배송비 6,000원 면제 -> 총 ${payData.order.paymentAmount.toLocaleString()}원 결제 승인 완료!`);
          break;
        }
        case 8: { // SEC-328: 온실 장비 및 스마트 농업 장비 주문 흐름 금액 변조
          const prod = products[8] || { id: 'prod_09', price: 240000 };
          const res = await fetch('/api/greenhouse-equipment/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              equipmentId: prod.id,
              quantity: 1,
              equipmentOrderAmount: 3000 // Normal: 240,000 -> 3,000 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          showToast('🚨 [Bug ID: SITE031-BUG-008 / SEC-328] 스마트 온실 장비 금액 변조 완료', `정상가 240,000원 -> 변조금액 ${data.order.paymentAmount.toLocaleString()}원 발주 승인 완료! (주문번호: ${data.order.orderId})`);
          break;
        }
        case 9: { // SEC-329: 농자재 주문 할인 및 쿠폰 적용 흐름 금액 변조
          const res = await fetch('/api/orders/discount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              couponCode: 'FARM-SPECIAL-2026',
              subtotal: 165000,
              discountAmount: 160000 // Tampered discount from 5,000 -> 160,000 KRW
            })
          });
          const data = await res.json();
          const payRes = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '스마트 보광등 150W (농업인의 날 160,000원 변조 쿠폰 적용)',
              itemsCount: 1,
              actualSubtotal: 165000,
              paymentAmount: data.finalAmount, // 5,000 KRW
              flowOrigin: '쿠폰 할인 금액 변조 결제'
            })
          });
          const payData = await payRes.json();
          fetchOrders();
          setIsCouponModalOpen(false);
          showToast('🚨 [Bug ID: SITE031-BUG-009 / SEC-329] 쿠폰 할인 금액 변조 완료', `정상가 165,000원 -> 변조 할인(-160,000원) 적용 ${payData.order.paymentAmount.toLocaleString()}원 결제 승인!`);
          break;
        }
        case 10: { // SEC-330: 주문 결제 확인 단계 금액 변조
          const res = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: 'AGRI-CONFIRM-' + Date.now(),
              authorizedAmount: 100 // Normal: 185,000 -> 100 KRW
            })
          });
          const data = await res.json();
          fetchOrders();
          setIsTwoStepConfirmModalOpen(false);
          showToast('🚨 [Bug ID: SITE031-BUG-010 / SEC-330] 2단계 최종 승인 금액 변조 완료', `정상 승인가 185,000원 -> 변조 승인금액 ${data.order.paymentAmount.toLocaleString()}원 최종 확정! (주문번호: ${data.order.orderId})`);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      showToast('오류', '요청 처리 중 문제가 발생했습니다.');
    }
  };

  const currentFarm = farms.find(f => f.id === selectedFarmId) || farms[0] || { name: 'Green Valley Smart Farm' };

  return (
    <div className="ap-layout">
      {/* =========================================================
          LEFT SIDEBAR (14 MENUS)
          ========================================================= */}
      <aside className="ap-sidebar">
        <div className="ap-brand" onClick={() => setActiveNav('dashboard')}>
          <div className="ap-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 4.5l5 4.5v6H7v-6l5-4.5z"/>
              <circle cx="12" cy="14" r="2" fill="#fff"/>
            </svg>
          </div>
          <div>
            <div className="ap-brand-name">AgriPulse</div>
            <div className="ap-brand-sub">Smart Farm OS</div>
          </div>
        </div>

        {/* Selected Farm Info in Sidebar */}
        <div className="ap-sidebar-farm-box">
          <div className="ap-farm-tag-row">
            <span>ACTIVE FARM</span>
            <span>4개 온실</span>
          </div>
          <div className="ap-farm-name-current">{currentFarm.name}</div>
          <div className="ap-farm-meta-row">
            <span>온도 23.8℃</span>
            <span>·</span>
            <span>습도 68%</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="ap-sidebar-nav">
          <div className="ap-nav-section-title">스마트팜 관제 & 운영</div>
          
          <div className={`ap-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveNav('dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>대시보드 (Dashboard)</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'farms' ? 'active' : ''}`} onClick={() => setActiveNav('farms')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>농장 관리 (Farms)</span>
            <span className="ap-nav-badge">{farms.length}</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'greenhouses' ? 'active' : ''}`} onClick={() => setActiveNav('greenhouses')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h20"/><path d="M5 20V8l7-5 7 5v12"/><path d="M9 20v-6h6v6"/></svg>
            <span>온실 현황 (Greenhouses)</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'crops' ? 'active' : ''}`} onClick={() => setActiveNav('crops')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22v-9"/><path d="M12 13a5 5 0 0 0-5-5c0 5 5 5 5 5z"/><path d="M12 9a5 5 0 0 1 5-5c0 5-5 5-5 5z"/></svg>
            <span>작물 관리 (Crops)</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'cultivation' ? 'active' : ''}`} onClick={() => setActiveNav('cultivation')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>재배 일정 (Cultivation)</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'work' ? 'active' : ''}`} onClick={() => setActiveNav('work')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>작업 일정 & 인력 (Work)</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'harvest' ? 'active' : ''}`} onClick={() => setActiveNav('harvest')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>수확 관리 (Harvest)</span>
          </div>

          <div className="ap-nav-section-title">스마트 마켓 & 물류</div>

          <div className={`ap-nav-item ${activeNav === 'inventory' ? 'active' : ''}`} onClick={() => setActiveNav('inventory')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <span>농자재 재고 (Inventory)</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'marketplace' ? 'active' : ''}`} onClick={() => setActiveNav('marketplace')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span>스마트 마켓 (Marketplace)</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'orders' ? 'active' : ''}`} onClick={() => setActiveNav('orders')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span>주문 & 발주내역 (Orders)</span>
            <span className="ap-nav-badge">{orders.length}</span>
          </div>

          <div className="ap-nav-section-title">경영 분석 & 관리</div>

          <div className={`ap-nav-item ${activeNav === 'expenses' ? 'active' : ''}`} onClick={() => setActiveNav('expenses')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>농장 비용 관리 (Expenses)</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'reports' ? 'active' : ''}`} onClick={() => setActiveNav('reports')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span>운영 리포트 (Reports)</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'notifications' ? 'active' : ''}`} onClick={() => setActiveNav('notifications')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>스마트 알림 (Notifications)</span>
          </div>

          <div className={`ap-nav-item ${activeNav === 'settings' ? 'active' : ''}`} onClick={() => setActiveNav('settings')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>환경 설정 (Settings)</span>
          </div>
        </nav>

        {/* User Info Footer */}
        <div className="ap-sidebar-footer">
          <div className="ap-user-avatar">{user.name.slice(0, 1)}</div>
          <div className="ap-user-details">
            <div className="ap-user-name">{user.name}</div>
            <div className="ap-user-role">{user.role}</div>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN WRAPPER & TOP HEADER
          ========================================================= */}
      <div className="ap-main-wrapper">
        <header className="ap-header">
          <div className="ap-header-left">
            <div className="ap-farm-select-wrap">
              <span className="ap-farm-select-label">FARM</span>
              <select
                className="ap-farm-select"
                value={selectedFarmId}
                onChange={(e) => handleSelectFarm(e.target.value)}
              >
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.location.split(' ')[0]})</option>
                ))}
              </select>
            </div>

            <div className="ap-farm-status-pill">
              <span className="ap-status-dot"></span>
              <span>{currentFarm.status}</span>
            </div>
          </div>

          <div className="ap-header-right">
            <button className="ap-header-btn" onClick={() => setIsTwoStepConfirmModalOpen(true)}>
              📋 2단계 주문 확인
            </button>

            <button className="ap-header-icon-btn" onClick={() => setIsCartDrawerOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cart.length > 0 && <span className="ap-icon-badge">{cart.length}</span>}
            </button>

            <button className="ap-header-icon-btn" onClick={() => setIsOrdersDrawerOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span className="ap-icon-badge">{orders.length}</span>
            </button>

            <button className="ap-header-icon-btn" onClick={() => setIsNotifDrawerOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="ap-icon-badge">3</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--border-subtle)' }}>
              <div className="ap-user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>{user.name.slice(0, 1)}</div>
              <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary-forest)' }}>{user.name}</span>
            </div>
          </div>
        </header>

        {/* =========================================================
            MAIN CONTENT AREA
            ========================================================= */}
        <main className="ap-content">
          {/* VIEW 1: DASHBOARD */}
          {activeNav === 'dashboard' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">{currentFarm.name} 관제 대시보드</h1>
                  <p className="ap-page-desc">실시간 스마트 온실 센서 환경, 작물 생육 지수, 오늘의 농작업 일정을 통합 모니터링합니다.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="ap-btn ap-btn-earth ap-btn-sm" onClick={() => setIsRentalModalOpen(true)}>
                    🚜 농기구 스마트 대여
                  </button>
                  <button className="ap-btn ap-btn-primary ap-btn-sm" onClick={() => setIsAddCropModalOpen(true)}>
                    + 신규 작물 등록
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="ap-grid-4">
                <div className="ap-stat-card">
                  <div className="ap-stat-icon-wrap ap-stat-icon-green">🌿</div>
                  <div className="ap-stat-info">
                    <div className="ap-stat-label">재배중인 작물</div>
                    <div className="ap-stat-val">{crops.length}개 품종</div>
                    <div className="ap-stat-trend ap-trend-up">▲ 17,900주 최적 생육</div>
                  </div>
                </div>

                <div className="ap-stat-card">
                  <div className="ap-stat-icon-wrap ap-stat-icon-amber">🌡️</div>
                  <div className="ap-stat-info">
                    <div className="ap-stat-label">온실 평균 온습도</div>
                    <div className="ap-stat-val">23.8℃ / 68%</div>
                    <div className="ap-stat-trend ap-trend-up">적정 생육 환경 100%</div>
                  </div>
                </div>

                <div className="ap-stat-card">
                  <div className="ap-stat-icon-wrap ap-stat-icon-blue">📦</div>
                  <div className="ap-stat-info">
                    <div className="ap-stat-label">출하 예정 수확량</div>
                    <div className="ap-stat-val">2,050 kg</div>
                    <div className="ap-stat-trend ap-trend-up">10월 1주차 출하 예정</div>
                  </div>
                </div>

                <div className="ap-stat-card">
                  <div className="ap-stat-icon-wrap ap-stat-icon-brown">💰</div>
                  <div className="ap-stat-info">
                    <div className="ap-stat-label">9월 예상 순수익</div>
                    <div className="ap-stat-val">1,001만원</div>
                    <div className="ap-stat-trend ap-trend-up">전월 대비 +18.4%</div>
                  </div>
                </div>
              </div>

              {/* Greenhouses Sensor Grid */}
              <div className="ap-card">
                <div className="ap-card-header">
                  <div className="ap-card-title">
                    <span>🌡️ 온실별 IoT 환경 제어 현황</span>
                  </div>
                  <button className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => setActiveNav('greenhouses')}>
                    전체 온실 관리 →
                  </button>
                </div>

                <div className="ap-grid-4">
                  {greenhouses.map(gh => (
                    <div key={gh.id} className="ap-greenhouse-card">
                      <div className="ap-greenhouse-top">
                        <span className="ap-greenhouse-name">{gh.name}</span>
                        <span className="ap-farm-status-pill">{gh.status}</span>
                      </div>
                      <div className="ap-sensor-grid">
                        <div className="ap-sensor-item">
                          <span className="ap-sensor-title">실내 온도</span>
                          <span className="ap-sensor-val">{gh.temperature} ℃</span>
                        </div>
                        <div className="ap-sensor-item">
                          <span className="ap-sensor-title">상대 습도</span>
                          <span className="ap-sensor-val">{gh.humidity} %</span>
                        </div>
                        <div className="ap-sensor-item">
                          <span className="ap-sensor-title">토양/배지 수분</span>
                          <span className="ap-sensor-val">{gh.soilMoisture} %</span>
                        </div>
                        <div className="ap-sensor-item">
                          <span className="ap-sensor-title">광량 레벨</span>
                          <span className="ap-sensor-val">{gh.lightLevel}</span>
                        </div>
                      </div>
                      <button className="ap-btn ap-btn-secondary ap-btn-sm" style={{ width: '100%' }} onClick={() => setActiveNav('marketplace')}>
                        🛒 온실 맞춤 자재 발주
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crops Growth Status & Work Schedule */}
              <div className="ap-grid-2">
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-card-title">🌱 주요 작물 생육 지수</div>
                    <button className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => setActiveNav('crops')}>
                      작물 상세 →
                    </button>
                  </div>
                  {crops.slice(0, 4).map(crop => (
                    <div key={crop.id} style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ color: 'var(--primary-forest)', fontSize: '0.95rem' }}>{crop.name}</strong>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--primary-green)' }}>{crop.growthRate}% 성장</span>
                      </div>
                      <div className="ap-progress-track">
                        <div className="ap-progress-fill" style={{ width: `${crop.growthRate}%` }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>식재: {crop.plantedAt}</span>
                        <span>수확예정: {crop.expectedHarvestAt}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-card-title">📋 오늘의 스마트팜 작업 일정</div>
                    <button className="ap-btn ap-btn-primary ap-btn-sm" onClick={() => setIsAddWorkModalOpen(true)}>
                      + 작업 추가
                    </button>
                  </div>
                  {workSchedules.map(ws => (
                    <div key={ws.id} style={{ background: 'var(--bg-cream)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '10px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--primary-forest)' }}>{ws.title}</strong>
                        <span className="ap-farm-status-pill" style={{ fontSize: '0.72rem' }}>{ws.status}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '6px' }}>{ws.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        <span>담당: {ws.assignee}</span>
                        <span>일자: {ws.scheduledDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: FARMS */}
          {activeNav === 'farms' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">농장 통합 관리 ({farms.length}개소)</h1>
                  <p className="ap-page-desc">소유 및 위탁 관리 중인 모든 스마트팜 시설과 인프라를 한눈에 관리합니다.</p>
                </div>
              </div>
              <div className="ap-grid-2">
                {farms.map(f => (
                  <div key={f.id} className="ap-card" style={{ borderLeft: f.id === selectedFarmId ? '6px solid var(--primary-green)' : '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary-forest)' }}>{f.name}</h3>
                      {f.id === selectedFarmId && <span className="ap-farm-status-pill">현재 선택됨</span>}
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)', marginBottom: '14px' }}>📍 {f.location}</p>
                    <div className="ap-sensor-grid" style={{ marginBottom: '18px' }}>
                      <div><span className="ap-sensor-title">총 부지 면적</span><span className="ap-sensor-val">{f.area}</span></div>
                      <div><span className="ap-sensor-title">온실 동수</span><span className="ap-sensor-val">{f.greenhouseCount}개동</span></div>
                      <div><span className="ap-sensor-title">재배 작물수</span><span className="ap-sensor-val">{f.cropCount}개 품종</span></div>
                      <div><span className="ap-sensor-title">운영 시작일</span><span className="ap-sensor-val">{f.createdAt}</span></div>
                    </div>
                    <button
                      className={`ap-btn ${f.id === selectedFarmId ? 'ap-btn-secondary' : 'ap-btn-primary'}`}
                      style={{ width: '100%' }}
                      onClick={() => handleSelectFarm(f.id)}
                    >
                      {f.id === selectedFarmId ? '현재 활성 농장' : '이 농장으로 전환하기'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: GREENHOUSES */}
          {activeNav === 'greenhouses' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">온실 현황 및 IoT 환경제어</h1>
                  <p className="ap-page-desc">온실별 실시간 공기순환, 정밀 점적관수, 스마트 보광등 및 CO2 제어 현황입니다.</p>
                </div>
              </div>
              <div className="ap-grid-2">
                {greenhouses.map(gh => (
                  <div key={gh.id} className="ap-card">
                    <div className="ap-card-header">
                      <div className="ap-card-title">{gh.name}</div>
                      <span className="ap-farm-status-pill">{gh.status}</span>
                    </div>
                    <div className="ap-sensor-grid" style={{ padding: '16px', gap: '16px', marginBottom: '18px' }}>
                      <div><span className="ap-sensor-title">온도</span><span className="ap-sensor-val" style={{ fontSize: '1.2rem' }}>{gh.temperature} ℃</span></div>
                      <div><span className="ap-sensor-title">상대습도</span><span className="ap-sensor-val" style={{ fontSize: '1.2rem' }}>{gh.humidity} %</span></div>
                      <div><span className="ap-sensor-title">토양/배지 수분</span><span className="ap-sensor-val" style={{ fontSize: '1.2rem' }}>{gh.soilMoisture} %</span></div>
                      <div><span className="ap-sensor-title">광량</span><span className="ap-sensor-val" style={{ fontSize: '1.2rem' }}>{gh.lightLevel}</span></div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="ap-btn ap-btn-primary" style={{ flex: 1 }} onClick={() => setActiveNav('crops')}>
                        온실 작물 조회
                      </button>
                      <button className="ap-btn ap-btn-secondary" style={{ flex: 1 }} onClick={() => setActiveNav('marketplace')}>
                        자재 주문
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 4: CROPS */}
          {activeNav === 'crops' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">작물 생육 도감 및 관리 ({crops.length}종)</h1>
                  <p className="ap-page-desc">재배 중인 모든 작물의 식재일, 착과 단계, 수확 예정일 및 생육 상태를 정밀 추적합니다.</p>
                </div>
                <button className="ap-btn ap-btn-primary" onClick={() => setIsAddCropModalOpen(true)}>
                  + 새 작물 등록
                </button>
              </div>

              <div className="ap-grid-3">
                {crops.map(crop => (
                  <div key={crop.id} className="ap-crop-card">
                    <div className="ap-crop-img-wrap">
                      <img src={crop.image} alt={crop.name} className="ap-crop-img" />
                      <span className="ap-crop-badge">{crop.healthStatus}</span>
                    </div>
                    <div className="ap-crop-body">
                      <h3 className="ap-crop-title">{crop.name}</h3>
                      <div className="ap-crop-variety">{crop.variety}</div>

                      <div className="ap-progress-bar-wrap">
                        <div className="ap-progress-meta">
                          <span>성장률</span>
                          <strong>{crop.growthRate}%</strong>
                        </div>
                        <div className="ap-progress-track">
                          <div className="ap-progress-fill" style={{ width: `${crop.growthRate}%` }}></div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '14px', lineHeight: '1.5' }}>
                        식재: {crop.plantedAt} · 수확: {crop.expectedHarvestAt}
                        <br />
                        재배 규모: {crop.quantity.toLocaleString()} {crop.unit}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                        <button className="ap-btn ap-btn-secondary ap-btn-sm" style={{ flex: 1 }} onClick={() => { setSelectedCrop(crop); setIsCropDetailModalOpen(true); }}>
                          상세 리포트
                        </button>
                        <button className="ap-btn ap-btn-primary ap-btn-sm" style={{ flex: 1 }} onClick={() => setActiveNav('marketplace')}>
                          영양제 주문
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 5: CULTIVATION SCHEDULE */}
          {activeNav === 'cultivation' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">스마트 재배 로드맵 & 생육 단계</h1>
                  <p className="ap-page-desc">파종부터 정식, 착과 비대, 수확까지 단계별 표준 재배 지침을 관리합니다.</p>
                </div>
              </div>
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>작물명</th>
                      <th>현재 생육 단계</th>
                      <th>시작일</th>
                      <th>종료 예정일</th>
                      <th>표준 영양 및 환경 관리 지침</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cultivationSchedules.map(cs => (
                      <tr key={cs.id}>
                        <td><strong>{cs.cropName}</strong></td>
                        <td><span className="ap-farm-status-pill">{cs.stage}</span></td>
                        <td>{cs.startDate}</td>
                        <td>{cs.endDate}</td>
                        <td>{cs.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 6: WORK SCHEDULE & WORKERS */}
          {activeNav === 'work' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">농장 작업 일정 & 전문 인력 관리</h1>
                  <p className="ap-page-desc">온실별 곁순 제거, 유인, 관수 영양 공급 및 전문 위탁 작업자를 배정합니다.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="ap-btn ap-btn-earth" onClick={() => setIsInviteWorkerModalOpen(true)}>
                    👥 전문 작업자 초빙 신청
                  </button>
                  <button className="ap-btn ap-btn-primary" onClick={() => setIsAddWorkModalOpen(true)}>
                    + 새 작업 배정
                  </button>
                </div>
              </div>

              <div className="ap-grid-2">
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-card-title">📋 진행 예정 농작업 ({workSchedules.length}건)</div>
                  </div>
                  {workSchedules.map(ws => (
                    <div key={ws.id} style={{ background: 'var(--bg-cream)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span className="ap-farm-status-pill">{ws.type}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{ws.scheduledDate}</span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '4px' }}>{ws.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '10px' }}>{ws.description}</p>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--earth-warm)' }}>
                        작업 담당: {ws.assignee}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-card-title">👨‍🌾 전문 재배 인력 풀 & 초빙 매칭</div>
                  </div>
                  <div style={{ background: 'var(--bg-sand)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '6px' }}>
                      AgriPulse 공인 전문 스마트팜 작업 마스터
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: '1.5' }}>
                      토마토/딸기/파프리카 시설 원예 10년 이상 경력의 전문 인력을 초빙하여 영양액 배합, 착과 전지, 방제 작업을 원스톱으로 위탁할 수 있습니다.
                    </p>
                  </div>
                  <button className="ap-btn ap-btn-earth" style={{ width: '100%', padding: '14px' }} onClick={() => setIsInviteWorkerModalOpen(true)}>
                    👥 전문 작업자 초빙 케어 서비스 신청하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 7: HARVEST */}
          {activeNav === 'harvest' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">수확 및 출하 관리</h1>
                  <p className="ap-page-desc">작물별 예상 수확량 및 실제 출하 기록을 체계적으로 관리합니다.</p>
                </div>
              </div>
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>작물명</th>
                      <th>수확 예정일</th>
                      <th>예상 수확량</th>
                      <th>실제 출하량</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {harvests.map(h => (
                      <tr key={h.id}>
                        <td><strong>{h.cropName}</strong></td>
                        <td>{h.expectedDate}</td>
                        <td>{h.expectedQuantity.toLocaleString()} kg</td>
                        <td>{h.actualQuantity > 0 ? `${h.actualQuantity.toLocaleString()} kg` : '-'}</td>
                        <td><span className="ap-farm-status-pill">{h.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 8: INVENTORY (Bug 1 Flow - Tags) */}
          {activeNav === 'inventory' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">농자재 재고 & 바코드/NFC 태그 관리</h1>
                  <p className="ap-page-desc">농장 내 보유 농자재 수량, 비료 재고 및 스마트 태그 관리 패키지를 발주합니다.</p>
                </div>
                <button className="ap-btn ap-btn-primary" onClick={() => setIsTagOrderModalOpen(true)}>
                  🏷️ 스마트 태그 관리 패키지 발주
                </button>
              </div>

              <div className="ap-grid-3">
                {products.map(prod => (
                  <div key={prod.id} className="ap-card" style={{ marginBottom: 0 }}>
                    <span className="ap-product-cat">{prod.category}</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary-forest)', margin: '6px 0' }}>{prod.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '12px' }}>
                      <span>보유 재고: <strong>{prod.stock}개</strong></span>
                      <span>단가: {prod.price.toLocaleString()}원</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="ap-btn ap-btn-secondary ap-btn-sm" style={{ flex: 1 }} onClick={() => handleAddToCart(prod.id, 1)}>
                        + 장바구니 추가
                      </button>
                      <button className="ap-btn ap-btn-primary ap-btn-sm" style={{ flex: 1 }} onClick={() => { setTagForm({ productId: prod.id, tags: 'NFC 전자태그 1,000매' }); setIsTagOrderModalOpen(true); }}>
                        🏷️ 태그 발주
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 9: MARKETPLACE (Seeds, Fertilizer, Equipment, Delivery, Coupons) */}
          {activeNav === 'marketplace' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">AgriPulse 스마트 농자재 마켓</h1>
                  <p className="ap-page-desc">엄선된 고품질 종자, 수경재배 전용 양액비료, 스마트 온실 IoT 센서 및 농기구를 발주하세요.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="ap-btn ap-btn-earth" onClick={() => setIsRentalModalOpen(true)}>
                    🚜 농기구 대여 신청
                  </button>
                  <button className="ap-btn ap-btn-secondary" onClick={() => setIsCouponModalOpen(true)}>
                    🎟️ 특별할인 쿠폰 결제
                  </button>
                  <button className="ap-btn ap-btn-primary" onClick={() => setIsCartDrawerOpen(true)}>
                    🛒 장바구니 ({cart.length})
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['전체', 'Seeds', 'Seedlings', 'Fertilizer', 'Nutrition', 'Soil', 'Irrigation', 'Greenhouse Equipment', 'Tools'].map(cat => (
                    <button
                      key={cat}
                      className={`ap-btn ap-btn-sm ${marketCategory === cat ? 'ap-btn-primary' : 'ap-btn-secondary'}`}
                      onClick={() => { setMarketCategory(cat); setTimeout(fetchProducts, 50); }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="ap-input"
                  style={{ width: '240px', padding: '8px 14px' }}
                  placeholder="농자재 검색..."
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                />
              </div>

              {/* Product Cards */}
              <div className="ap-grid-3">
                {products.map(prod => (
                  <div key={prod.id} className="ap-product-card">
                    <img src={prod.image} alt={prod.name} className="ap-product-img" />
                    <div className="ap-product-body">
                      <span className="ap-product-cat">{prod.category}</span>
                      <h3 className="ap-product-name">{prod.name}</h3>
                      <p className="ap-product-desc">{prod.description}</p>
                      <div className="ap-product-price-row">
                        <span className="ap-product-price">{prod.price.toLocaleString()}원</span>
                        <span className="ap-product-unit">{prod.unit}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="ap-btn ap-btn-secondary ap-btn-sm" style={{ flex: 1 }} onClick={() => handleAddToCart(prod.id, 1)}>
                            🛒 장바구니
                          </button>
                          <button className="ap-btn ap-btn-primary ap-btn-sm" style={{ flex: 1.2 }} onClick={() => handleAddToCart(prod.id, 1)}>
                            즉시 주문
                          </button>
                        </div>

                        {/* Naturally embedded feature action buttons */}
                        {prod.category === 'Fertilizer' && (
                          <button className="ap-btn ap-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.78rem' }} onClick={() => simulateBugAttack(4)}>
                            ⚡ 대용량 유기질 액비 즉시 주문
                          </button>
                        )}
                        {prod.category === 'Seeds' && (
                          <button className="ap-btn ap-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.78rem' }} onClick={() => simulateBugAttack(5)}>
                            ⚡ 고품질 프리미엄 종자 특가 주문
                          </button>
                        )}
                        {prod.category === 'Greenhouse Equipment' && (
                          <button className="ap-btn ap-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.78rem' }} onClick={() => simulateBugAttack(8)}>
                            ⚡ 스마트 온실 센서 패키지 발주
                          </button>
                        )}
                        {prod.category === 'Soil' && (
                          <button className="ap-btn ap-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.78rem' }} onClick={() => simulateBugAttack(7)}>
                            ⚡ 무료배송 프로모션 적용 주문
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 10: ORDERS */}
          {activeNav === 'orders' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">주문 및 발주 승인 내역 ({orders.length}건)</h1>
                  <p className="ap-page-desc">농자재, 종자, 비료, 온실 장비 및 스마트팜 대여 결제 내역입니다.</p>
                </div>
              </div>
              <div className="ap-grid-2">
                {orders.map((ord, idx) => (
                  <div key={idx} className="ap-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="ap-farm-status-pill">{ord.flowOrigin || '발주'}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{ord.orderDate}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '4px' }}>{ord.title}</h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>발주번호: {ord.orderId}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--leaf-emerald)' }}>{ord.status}</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary-forest)' }}>
                        {ord.paymentAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 11: EXPENSES */}
          {activeNav === 'expenses' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">농장 운영 비용 및 지출 관리</h1>
                  <p className="ap-page-desc">농자재 구입비, 온실 냉난방 전기료, 인건비 및 장비 유지보수 비용을 기록합니다.</p>
                </div>
              </div>
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>비용 항목</th>
                      <th>지출 금액</th>
                      <th>일자</th>
                      <th>지출 내용 및 메모</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp.id}>
                        <td><strong>{exp.category}</strong></td>
                        <td style={{ fontWeight: '800', color: 'var(--earth-deep)' }}>{exp.amount.toLocaleString()}원</td>
                        <td>{exp.date}</td>
                        <td>{exp.memo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 12: REPORTS */}
          {activeNav === 'reports' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">스마트팜 월별 경영 및 생산성 리포트</h1>
                  <p className="ap-page-desc">생산량, 에너지 절감률, 품목별 매출 및 순이익 종합 분석입니다.</p>
                </div>
              </div>
              {monthlyReport && (
                <div className="ap-grid-3">
                  <div className="ap-card">
                    <div className="ap-stat-label">9월 총 매출액</div>
                    <div className="ap-stat-val">{(monthlyReport.totalRevenue).toLocaleString()}원</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>방울토마토 52.5% · 파프리카 28.6%</p>
                  </div>
                  <div className="ap-card">
                    <div className="ap-stat-label">9월 총 운영비용</div>
                    <div className="ap-stat-val">{(monthlyReport.totalExpenses).toLocaleString()}원</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>인건비 49.5% · 농자재비 25.8%</p>
                  </div>
                  <div className="ap-card">
                    <div className="ap-stat-label">9월 순수익 (Net Profit)</div>
                    <div className="ap-stat-val" style={{ color: 'var(--primary-green)' }}>{(monthlyReport.netProfit).toLocaleString()}원</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--status-healthy)', fontWeight: '700' }}>영업이익률 67.4%</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 13: NOTIFICATIONS */}
          {activeNav === 'notifications' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">스마트팜 알림 센터</h1>
                  <p className="ap-page-desc">온실 환경 제어 경보, 수분 양액 공급 완료, 농자재 배송 알림 내역입니다.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map(n => (
                  <div key={n.id} className="ap-card" style={{ marginBottom: 0, borderLeft: n.read ? '1px solid var(--border-subtle)' : '5px solid var(--primary-green)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--primary-forest)' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)' }}>{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 14: SETTINGS */}
          {activeNav === 'settings' && (
            <div>
              <div className="ap-page-header">
                <div>
                  <h1 className="ap-page-title">사용자 프로필 & 스마트팜 운영 설정</h1>
                  <p className="ap-page-desc">스마트팜 마스터 정보, 라이선스 및 알림 수신 정책을 관리합니다.</p>
                </div>
              </div>
              <div className="ap-card" style={{ maxWidth: '600px' }}>
                <div className="ap-form-group">
                  <label className="ap-label">관리자 성함</label>
                  <input type="text" className="ap-input" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">이메일 계정</label>
                  <input type="email" className="ap-input" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">연락처</label>
                  <input type="text" className="ap-input" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">전문 자격 / 등급</label>
                  <input type="text" className="ap-input" value={user.license} onChange={(e) => setUser({ ...user, license: e.target.value })} />
                </div>
                <button className="ap-btn ap-btn-primary" onClick={() => showToast('👤 설정 저장 완료', '스마트팜 관리자 정보가 성공적으로 업데이트되었습니다.')}>
                  설정 정보 저장
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================
          MODALS & DRAWERS
          ========================================================= */}

      {/* MODAL: TAG ORDER (Bug 1 - SEC-321) */}
      {isTagOrderModalOpen && (
        <div className="ap-modal-backdrop" onClick={() => setIsTagOrderModalOpen(false)}>
          <div className="ap-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <h3 className="ap-modal-title">🏷️ 스마트 태그 관리 패키지 발주</h3>
              <button className="ap-modal-close" onClick={() => setIsTagOrderModalOpen(false)}>✕</button>
            </div>
            <div className="ap-modal-body">
              <div className="ap-form-group">
                <label className="ap-label">대상 농자재 품목</label>
                <select className="ap-select" value={tagForm.productId} onChange={(e) => setTagForm({ ...tagForm, productId: e.target.value })}>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString()}원)</option>
                  ))}
                </select>
              </div>
              <div className="ap-form-group">
                <label className="ap-label">태그 옵션</label>
                <input type="text" className="ap-input" value={tagForm.tags} onChange={(e) => setTagForm({ ...tagForm, tags: e.target.value })} />
              </div>
              <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)', margin: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: 'var(--primary-forest)', fontSize: '1.1rem' }}>
                  <span>패키지 발주 금액</span>
                  <span>50,000원</span>
                </div>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn ap-btn-secondary" onClick={() => setIsTagOrderModalOpen(false)}>취소</button>
              <button className="ap-btn ap-btn-primary" onClick={() => { setIsTagOrderModalOpen(false); showToast('발주 완료', '정상 금액으로 발주되었습니다.'); }}>
                스마트 태그 관리 패키지 발주
              </button>
              <button className="ap-btn ap-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => simulateBugAttack(1)}>
                ⚡ 스마트 태그 관리 패키지 발주 (금액 변조)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INVITE WORKER (Bug 2 - SEC-322) */}
      {isInviteWorkerModalOpen && (
        <div className="ap-modal-backdrop" onClick={() => setIsInviteWorkerModalOpen(false)}>
          <div className="ap-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <h3 className="ap-modal-title">👥 전문 작업자 초빙 & 위탁 관리 신청</h3>
              <button className="ap-modal-close" onClick={() => setIsInviteWorkerModalOpen(false)}>✕</button>
            </div>
            <div className="ap-modal-body">
              <div className="ap-form-group">
                <label className="ap-label">초빙 대상 마스터</label>
                <input type="text" className="ap-input" value={inviteForm.workerName} onChange={(e) => setInviteForm({ ...inviteForm, workerName: e.target.value })} />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">전문 분야</label>
                <input type="text" className="ap-input" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })} />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">작업 위탁 요청 내용</label>
                <textarea className="ap-textarea" value={inviteForm.message} onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })} />
              </div>
              <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: 'var(--primary-forest)', fontSize: '1.1rem' }}>
                  <span>전문가 위탁 수수료</span>
                  <span>120,000원</span>
                </div>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn ap-btn-secondary" onClick={() => setIsInviteWorkerModalOpen(false)}>취소</button>
              <button className="ap-btn ap-btn-earth" onClick={() => { setIsInviteWorkerModalOpen(false); showToast('신청 완료', '전문 작업자 초빙이 완료되었습니다.'); }}>
                전문 작업자 초빙 케어 신청
              </button>
              <button className="ap-btn ap-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => simulateBugAttack(2)}>
                ⚡ 전문 작업자 초빙 케어 신청 (금액 변조)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EQUIPMENT RENTALS (Bug 3 - SEC-323) */}
      {isRentalModalOpen && (
        <div className="ap-modal-backdrop" onClick={() => setIsRentalModalOpen(false)}>
          <div className="ap-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <h3 className="ap-modal-title">🚜 농기구 스마트 대여 신청</h3>
              <button className="ap-modal-close" onClick={() => setIsRentalModalOpen(false)}>✕</button>
            </div>
            <div className="ap-modal-body">
              <div className="ap-form-group">
                <label className="ap-label">대여 농기구 선택</label>
                <select className="ap-select" onChange={(e) => setSelectedEquipment(equipmentList.find(eq => eq.id === e.target.value))}>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.rentalPrice.toLocaleString()}원/일)</option>
                  ))}
                </select>
              </div>
              <div className="ap-form-group">
                <label className="ap-label">대여 기간 (일)</label>
                <input type="number" min="1" max="30" className="ap-input" value={rentalDays} onChange={(e) => setRentalDays(Number(e.target.value))} />
              </div>
              <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: 'var(--primary-forest)', fontSize: '1.1rem' }}>
                  <span>총 대여료 (2일 기준)</span>
                  <span>70,000원</span>
                </div>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn ap-btn-secondary" onClick={() => setIsRentalModalOpen(false)}>취소</button>
              <button className="ap-btn ap-btn-earth" onClick={() => { setIsRentalModalOpen(false); showToast('대여 완료', '농기구 대여가 승인되었습니다.'); }}>
                트랙터/예초기 스마트 대여 결제
              </button>
              <button className="ap-btn ap-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => simulateBugAttack(3)}>
                ⚡ 트랙터/예초기 스마트 대여 결제 (금액 변조)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COUPON DISCOUNT (Bug 9 - SEC-329) */}
      {isCouponModalOpen && (
        <div className="ap-modal-backdrop" onClick={() => setIsCouponModalOpen(false)}>
          <div className="ap-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <h3 className="ap-modal-title">🎟️ 농자재 주문 할인 & 쿠폰 적용</h3>
              <button className="ap-modal-close" onClick={() => setIsCouponModalOpen(false)}>✕</button>
            </div>
            <div className="ap-modal-body">
              <div className="ap-form-group">
                <label className="ap-label">쿠폰 코드</label>
                <input type="text" className="ap-input" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              </div>
              <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>주문 기준가</span>
                  <strong>165,000원</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--primary-green)' }}>
                  <span>농업인의 날 특별 할인</span>
                  <strong>-5,000원</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: 'var(--primary-forest)', fontSize: '1.2rem', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                  <span>최종 결제 금액</span>
                  <span>160,000원</span>
                </div>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn ap-btn-secondary" onClick={() => setIsCouponModalOpen(false)}>닫기</button>
              <button className="ap-btn ap-btn-primary" onClick={() => { setIsCouponModalOpen(false); showToast('결제 완료', '할인이 적용되어 결제되었습니다.'); }}>
                농업인의 날 특별할인 쿠폰 결제
              </button>
              <button className="ap-btn ap-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => simulateBugAttack(9)}>
                ⚡ 농업인의 날 특별할인 쿠폰 결제 (금액 변조)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 2-STEP ORDER CONFIRM (Bug 10 - SEC-330) */}
      {isTwoStepConfirmModalOpen && (
        <div className="ap-modal-backdrop" onClick={() => setIsTwoStepConfirmModalOpen(false)}>
          <div className="ap-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <h3 className="ap-modal-title">📋 2단계 주문 요약서 최종 확인 및 발주</h3>
              <button className="ap-modal-close" onClick={() => setIsTwoStepConfirmModalOpen(false)}>✕</button>
            </div>
            <div className="ap-modal-body">
              <div style={{ background: 'var(--bg-sand)', padding: '18px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '4px' }}>
                  스마트팜 종합 운영 농자재 & 정밀 환경 제어 솔루션 패키지
                </h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                  발주 농장: {currentFarm.name} · 관리자: {user.name}
                </div>
              </div>
              <div style={{ background: 'var(--bg-cream)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>주문 기준 총액</span>
                  <strong>185,000원</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: 'var(--primary-forest)', fontSize: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                  <span>최종 승인 금액</span>
                  <span>185,000원</span>
                </div>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn ap-btn-secondary" onClick={() => setIsTwoStepConfirmModalOpen(false)}>취소</button>
              <button className="ap-btn ap-btn-primary" onClick={() => handleFinalTwoStepConfirm(185000)}>
                2단계 최종 승인 발주
              </button>
              <button className="ap-btn ap-btn-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => simulateBugAttack(10)}>
                ⚡ 2단계 최종 승인 발주 (금액 변조)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: CART (Bug 6 - SEC-326) */}
      {isCartDrawerOpen && (
        <div className="ap-drawer-backdrop" onClick={() => setIsCartDrawerOpen(false)}>
          <div className="ap-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ap-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-forest)' }}>
                🛒 농자재 장바구니 ({cart.length}개)
              </h3>
              <button className="ap-modal-close" onClick={() => setIsCartDrawerOpen(false)}>✕</button>
            </div>
            <div className="ap-drawer-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>장바구니가 비어 있습니다.</div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} style={{ background: 'var(--bg-cream)', padding: '14px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', border: '1px solid var(--border-light)' }}>
                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ flex: 1 }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary-forest)', marginBottom: '4px' }}>{item.name}</h5>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: '700' }}>{item.price.toLocaleString()}원</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.82rem' }}>수량: {item.quantity}개</span>
                        <button className="ap-btn ap-btn-secondary ap-btn-sm" style={{ padding: '2px 8px' }} onClick={() => handleRemoveCartItem(item.productId)}>삭제</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="ap-drawer-footer">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>품목 합계</span>
                  <span>{cartSummary.subtotal.toLocaleString()}원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>배송비</span>
                  <span>{cartSummary.shippingFee === 0 ? '무료배송' : `${cartSummary.shippingFee.toLocaleString()}원`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary-forest)', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginBottom: '14px' }}>
                  <span>총 결제 금액</span>
                  <span>{cartSummary.totalAmount.toLocaleString()}원</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="ap-btn ap-btn-primary" style={{ width: '100%' }} onClick={() => { setIsCartDrawerOpen(false); showToast('주문 완료', '장바구니 주문이 정상 처리되었습니다.'); }}>
                    장바구니 쾌속 결제
                  </button>
                  <button className="ap-btn ap-btn-sm" style={{ width: '100%', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '8px' }} onClick={() => simulateBugAttack(6)}>
                    ⚡ 장바구니 쾌속 결제 (금액 변조)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWER: ORDERS */}
      {isOrdersDrawerOpen && (
        <div className="ap-drawer-backdrop" onClick={() => setIsOrdersDrawerOpen(false)}>
          <div className="ap-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ap-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-forest)' }}>
                📋 발주 및 결제 승인 내역 ({orders.length}건)
              </h3>
              <button className="ap-modal-close" onClick={() => setIsOrdersDrawerOpen(false)}>✕</button>
            </div>
            <div className="ap-drawer-body">
              {orders.map((ord, idx) => (
                <div key={idx} style={{ background: 'var(--bg-cream)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="ap-farm-status-pill">{ord.flowOrigin || '발주'}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{ord.orderDate}</span>
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--primary-forest)', margin: '4px 0' }}>{ord.title}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>주문번호: {ord.orderId}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--leaf-emerald)' }}>{ord.status}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary-forest)' }}>
                      {ord.paymentAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: NOTIFICATIONS */}
      {isNotifDrawerOpen && (
        <div className="ap-drawer-backdrop" onClick={() => setIsNotifDrawerOpen(false)}>
          <div className="ap-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ap-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-forest)' }}>🔔 스마트팜 알림 센터</h3>
              <button className="ap-modal-close" onClick={() => setIsNotifDrawerOpen(false)}>✕</button>
            </div>
            <div className="ap-drawer-body">
              {notifications.map(n => (
                <div key={n.id} style={{ background: n.read ? 'var(--bg-cream)' : '#ffffff', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', borderLeft: n.read ? '1px solid var(--border-light)' : '4px solid var(--leaf-vibrant)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--primary-forest)' }}>{n.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOAST POPUP */}
      {toast && (
        <div className="ap-toast">
          <div className="ap-toast-title">{toast.title}</div>
          {toast.desc && <div className="ap-toast-desc">{toast.desc}</div>}
        </div>
      )}
    </div>
  );
}
