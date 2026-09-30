import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation & Category Tab
  const [activeCategory, setActiveCategory] = useState('전체'); // '전체' | '콘서트' | '뮤지컬' | '페스티벌' | '연극' | 'packages'
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Data States
  const [performances, setPerformances] = useState([]);
  const [packages, setPackages] = useState([]);
  const [cart, setCart] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState({
    name: '강민혁',
    email: 'minhyuk@starlight.live',
    phone: '010-3342-9918',
    bio: 'K-POP 콘서트 & 페스티벌 매니아! 올스탠딩 공연을 선호합니다.',
    ticketPoints: 12500,
    membership: 'VIP Starlight Club'
  });

  // Flow & Modal States
  const [selectedPerf, setSelectedPerf] = useState(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isTiersModalOpen, setIsTiersModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderSummaryModalOpen, setIsOrderSummaryModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);

  // Seat Selection State
  const [selectedGrade, setSelectedGrade] = useState('VIP');
  const [ticketQty, setTicketQty] = useState(2);
  const [chosenSeats, setChosenSeats] = useState(['VIP석 A구역 12열 4번', 'VIP석 A구역 12열 5번']);

  // Flow Origin tracker for distinct bug actions
  const [currentFlowOrigin, setCurrentFlowOrigin] = useState('직접 예매');

  // Interactive Testbed State (10 Bug Verifier Panel)
  const [isTestPanelOpen, setIsTestPanelOpen] = useState(true);

  // Checkout & Pricing State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('신용카드');

  // Support Form State
  const [supportCategory, setSupportCategory] = useState('티켓 예매/결제');
  const [supportTitle, setSupportTitle] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // Profile Edit State
  const [editBio, setEditBio] = useState(user.bio);
  const [editPhone, setEditPhone] = useState(user.phone);

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (title, desc = '') => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetchPerformances();
    fetchPackages();
    fetchCart();
    fetchBookings();
    fetchWishlist();
    fetchProfile();
  }, []);

  // API Call: Performances & Search (SEC-301)
  const fetchPerformances = async (keyword = '', category = '전체') => {
    try {
      let url = '/api/performances';
      if (keyword || (category && category !== '전체')) {
        url = `/api/search?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setPerformances(data.performances || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Packages (SEC-308)
  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (res.ok) {
        setPackages(data.packages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Profile (SEC-302)
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setEditBio(data.user.bio);
        setEditPhone(data.user.phone);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Cart (SEC-305)
  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (res.ok) setCart(data.cart || []);
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Bookings
  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Wishlist
  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      if (res.ok) setWishlist(data.wishlist || []);
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // 10 Distinct Feature Handlers
  // ==========================================

  // Flow 1: Search Form Handler (SEC-301)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchPerformances(searchKeyword, activeCategory);
    showToast('🔍 공연 검색 완료', `'${searchKeyword || activeCategory}' 검색 결과를 불러왔습니다.`);
  };

  const triggerSearchFastBooking = () => {
    const perf = performances[0] || { id: 'perf_01', title: '2026 ECLIPSE WORLD TOUR', venue: 'KSPO DOME', prices: { VIP: 187000 } };
    openCheckoutFlow(perf, 'VIP', 2, '검색 연계 바로예매');
  };

  // Flow 2: Profile Edit & Recommend Booking (SEC-302)
  const handleProfileSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: editBio, phone: editPhone })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        showToast('👤 프로필 수정 완료', '회원 프로필 및 음악 선호도가 반영되었습니다.');
      }
    } catch (err) {
      showToast('오류', '프로필 저장 중 문제가 발생했습니다.');
    }
  };

  const triggerProfileRecommendBooking = () => {
    setIsProfileModalOpen(false);
    const perf = performances[1] || performances[0];
    openCheckoutFlow(perf, 'VIP', 2, '프로필 맞춤 추천 예매');
  };

  // Flow 3: Support Inquiry & Linked Booking (SEC-303)
  const handleSupportSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: supportCategory, title: supportTitle, message: supportMsg })
      });
      const data = await res.json();
      if (res.ok) {
        setSupportSubmitted(true);
        showToast('🎧 상담 문의 접수 완료', data.message);
      }
    } catch (err) {
      showToast('오류', '문의 접수 중 문제가 발생했습니다.');
    }
  };

  const triggerSupportLinkedBooking = () => {
    setIsSupportModalOpen(false);
    const perf = performances[2] || performances[0];
    openCheckoutFlow(perf, 'R', 2, '고객센터 상담 연계 예매');
  };

  // Flow 4: Seat Selection & Pre-emption (SEC-304)
  const openSeatModal = (perf) => {
    setSelectedPerf(perf);
    setSelectedGrade('VIP');
    setTicketQty(2);
    setIsSeatModalOpen(true);
  };

  const handleSeatSelectionSubmit = async () => {
    if (!selectedPerf) return;
    try {
      const seatRes = await fetch('/api/seats/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performanceId: selectedPerf.id,
          seatGrade: selectedGrade,
          quantity: ticketQty,
          selectedSeats: chosenSeats
        })
      });
      await seatRes.json();
      setIsSeatModalOpen(false);
      openCheckoutFlow(selectedPerf, selectedGrade, ticketQty, '좌석 실시간 선점 예매');
      showToast('💺 좌석 선점 완료', `[${selectedPerf.title}] ${selectedGrade}석 ${ticketQty}매가 선점되었습니다.`);
    } catch (e) {
      showToast('오류', '좌석 선택 처리 중 문제가 발생했습니다.');
    }
  };

  // Flow 5: Cart Quantity Modification & Checkout (SEC-305)
  const handleCartQuantityChange = async (perf, grade, newQty) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performanceId: perf.id, seatGrade: grade, quantity: newQty })
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
        showToast('🛒 장바구니 변경', `티켓 수량이 ${newQty}매로 변경되었습니다.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Flow 6: Apply Coupon Discount (SEC-306)
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMsg('쿠폰 코드를 입력해주세요.');
      return;
    }
    const currentPrice = selectedPerf ? selectedPerf.prices[selectedGrade] * ticketQty : 300000;
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, targetSubtotal: currentPrice })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data.coupon);
        setCurrentFlowOrigin('쿠폰 할인 적용 결제');
        setCouponMsg(`[${data.coupon.name}] -${data.discountAmount.toLocaleString()}원 할인 적용 완료!`);
        showToast('🏷️ 쿠폰 적용 완료', data.message);
      } else {
        setAppliedCoupon(null);
        setCouponMsg(data.message || '쿠폰 적용에 실패했습니다.');
      }
    } catch (e) {
      setCouponMsg('쿠폰 처리 중 문제가 발생했습니다.');
    }
  };

  // Flow 7: Open Seat Tiers Inspector (SEC-307)
  const openTiersModal = async (perf) => {
    setSelectedPerf(perf);
    try {
      const res = await fetch(`/api/performances/${perf.id}/seats`);
      await res.json();
      setIsTiersModalOpen(true);
    } catch (err) {
      setIsTiersModalOpen(true);
    }
  };

  // Flow 8: Packages Flow (SEC-308)
  const triggerPackageBooking = (pkg) => {
    const matched = performances.find(p => p.id === pkg.performanceId) || performances[0];
    openCheckoutFlow(matched, 'VIP', pkg.itemsCount, 'VIP 한정판 패키지 예매');
  };

  // Flow 9: Order Summary Modal (SEC-309)
  const openOrderSummaryModal = async (perf, grade = 'VIP', qty = 2) => {
    setSelectedPerf(perf);
    setSelectedGrade(grade);
    setTicketQty(qty);
    try {
      const res = await fetch(`/api/orders/summary?performanceId=${perf.id}&seatGrade=${grade}&quantity=${qty}`);
      await res.json();
      setIsOrderSummaryModalOpen(true);
    } catch (e) {
      setIsOrderSummaryModalOpen(true);
    }
  };

  // Flow 10: 2-Step Confirmation (SEC-310)
  const handleProceedToConfirmation = async () => {
    if (!selectedPerf) return;
    const unitPrice = selectedPerf.prices[selectedGrade];
    const serverSubtotal = unitPrice * ticketQty;
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const finalAmount = Math.max(0, serverSubtotal + (2000 * ticketQty) - discount);

    try {
      const confirmRes = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'ORD-' + Date.now(),
          performanceId: selectedPerf.id,
          seatGrade: selectedGrade,
          quantity: ticketQty,
          paymentAmount: finalAmount,
          actualSubtotal: serverSubtotal
        })
      });
      await confirmRes.json();
      setIsCheckoutModalOpen(false);
      setIsConfirmModalOpen(true);
    } catch (e) {
      setIsConfirmModalOpen(true);
    }
  };

  // Final Execution of Payment (POST /api/payment)
  const handleFinalPaymentSubmit = async () => {
    if (!selectedPerf) return;
    const unitPrice = selectedPerf.prices[selectedGrade];
    const serverSubtotal = unitPrice * ticketQty;
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const finalAmount = Math.max(0, serverSubtotal + (2000 * ticketQty) - discount);

    try {
      const payRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performanceId: selectedPerf.id,
          title: selectedPerf.title,
          venue: selectedPerf.venue,
          seatGrade: selectedGrade,
          seats: chosenSeats,
          quantity: ticketQty,
          paymentAmount: finalAmount,
          actualSubtotal: serverSubtotal,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          paymentMethod: paymentMethod,
          flowOrigin: currentFlowOrigin
        })
      });

      const payData = await payRes.json();
      if (payRes.ok) {
        fetchBookings();
        setIsConfirmModalOpen(false);
        setIsOrderSummaryModalOpen(false);
        setIsCartDrawerOpen(false);
        setIsCheckoutModalOpen(false);
        showToast('🎉 티켓 예매 성공!', `[${payData.booking.title}] 예매번호: ${payData.booking.orderId} 발권 완료`);
      }
    } catch (e) {
      showToast('오류', '결제 승인 중 문제가 발생했습니다.');
    }
  };

  // Open Checkout Flow
  const openCheckoutFlow = (perf, grade = selectedGrade, qty = ticketQty, origin = '직접 예매') => {
    setSelectedPerf(perf);
    setSelectedGrade(grade);
    setTicketQty(qty);
    setCurrentFlowOrigin(origin);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMsg('');
    setIsCheckoutModalOpen(true);
  };

  // Wishlist Toggle
  const handleToggleWishlist = async (perfId) => {
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performanceId: perfId })
      });
      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist);
        showToast('❤️ 찜 목록 변경', data.isWishlisted ? '관심 공연 찜 목록에 추가되었습니다.' : '찜 목록에서 제외되었습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isPerfWishlisted = (id) => wishlist.some(w => w.id === id);

  // ====================================================
  // 10 VULNERABILITY ATTACK SIMULATOR (Price Tampering)
  // ====================================================
  const simulateBugAttack = async (bugIndex) => {
    try {
      const perf = performances[0] || { id: 'perf_01', title: '2026 ECLIPSE WORLD TOUR', venue: 'KSPO DOME', prices: { VIP: 187000 } };
      
      switch (bugIndex) {
        case 1: { // SEC-301: Search Fast Booking customPrice Tampering
          const res = await fetch('/api/search/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              performanceId: perf.id,
              seatGrade: 'VIP',
              quantity: 2,
              customPrice: 1000 // Tampered from 374,000 -> 1,000
            })
          });
          const data = await res.json();
          fetchBookings();
          showToast('🚨 [Bug ID: SITE029-BUG-001 / SEC-301] 검색 예매 금액 변조 완료', `정상가 374,000원 -> 변조금액 ${data.booking.paymentAmount.toLocaleString()}원 결제 승인 완료! (예매번호: ${data.booking.orderId})`);
          break;
        }
        case 2: { // SEC-302: Profile Recommend memberTierPrice Tampering
          const res = await fetch('/api/profile/recommend-book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              performanceId: perf.id,
              seatGrade: 'VIP',
              quantity: 2,
              memberTierPrice: 1500 // Tampered from 374,000 -> 1,500
            })
          });
          const data = await res.json();
          fetchBookings();
          showToast('🚨 [Bug ID: SITE029-BUG-002 / SEC-302] 회원 맞춤 추천가 변조 완료', `정상가 374,000원 -> 변조금액 ${data.booking.paymentAmount.toLocaleString()}원 결제 승인 완료! (예매번호: ${data.booking.orderId})`);
          break;
        }
        case 3: { // SEC-303: Support Counselor Special Price Tampering
          const res = await fetch('/api/support/book-inquiry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inquiryId: 'INQ-9912',
              performanceId: perf.id,
              seatGrade: 'R',
              quantity: 2,
              counselorSpecialPrice: 2000 // Tampered from 290,000 -> 2,000
            })
          });
          const data = await res.json();
          fetchBookings();
          showToast('🚨 [Bug ID: SITE029-BUG-003 / SEC-303] 상담 연계 특별가 변조 완료', `정상가 290,000원 -> 변조금액 ${data.booking.paymentAmount.toLocaleString()}원 결제 승인 완료! (예매번호: ${data.booking.orderId})`);
          break;
        }
        case 4: { // SEC-304: Realtime Seat Selection overrideUnitPrice Tampering
          const res = await fetch('/api/seats/select', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              performanceId: perf.id,
              seatGrade: 'VIP',
              quantity: 2,
              selectedSeats: ['VIP석 A구역 1열 1번', 'VIP석 A구역 1열 2번'],
              overrideUnitPrice: 500 // Tampered unit price to 500
            })
          });
          const data = await res.json();
          // Finalize payment with tampered price
          const payRes = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              performanceId: perf.id,
              title: perf.title,
              venue: perf.venue,
              seatGrade: 'VIP',
              seats: ['VIP석 A구역 1열 1번', 'VIP석 A구역 1열 2번'],
              quantity: 2,
              paymentAmount: 1000,
              actualSubtotal: 374000,
              flowOrigin: '좌석 선점 단가 변조 결제'
            })
          });
          const payData = await payRes.json();
          fetchBookings();
          showToast('🚨 [Bug ID: SITE029-BUG-004 / SEC-304] 실시간 좌석 단가 변조 완료', `단가 187,000원 -> 변조단가 500원 결제 완료! (예매번호: ${payData.booking.orderId})`);
          break;
        }
        case 5: { // SEC-305: Cart Item Subtotal Tampering
          const res = await fetch('/api/cart/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cartItems: [{ performanceId: perf.id, title: perf.title, seatGrade: 'VIP', quantity: 3, itemSubtotal: 800 }], // Tampered from 561,000 -> 800
              totalAmount: 800
            })
          });
          const data = await res.json();
          fetchBookings();
          fetchCart();
          showToast('🚨 [Bug ID: SITE029-BUG-005 / SEC-305] 장바구니 품목 합계 변조 완료', `정상 합계 561,000원 -> 변조합계 800원 주문 승인 완료! (예매번호: ${data.order.orderId})`);
          break;
        }
        case 6: { // SEC-306: Coupon Discount Percentage Tampering (>95%)
          const res = await fetch('/api/coupons/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: 'STARLIGHT-VIP',
              targetSubtotal: 374000,
              discountPercent: 99 // Tampered to 99% discount!
            })
          });
          const data = await res.json();
          showToast('🚨 [Bug ID: SITE029-BUG-006 / SEC-306] 쿠폰 할인율 99% 변조 적용', `할인금액: -${data.discountAmount.toLocaleString()}원 적용! (결제금액: ${data.finalAmount.toLocaleString()}원)`);
          // Open checkout modal with this coupon
          setSelectedPerf(perf);
          setSelectedGrade('VIP');
          setTicketQty(2);
          setAppliedCoupon({ code: 'STARLIGHT-VIP', name: 'VIP 슈퍼 패스 (99% 변조 할인)', discountAmount: data.discountAmount });
          setIsCheckoutModalOpen(true);
          break;
        }
        case 7: { // SEC-307: Seat Tiers Client Base Price Tampering
          const res = await fetch('/api/seats/tier-select', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              performanceId: perf.id,
              tierName: 'VIP',
              quantity: 2,
              clientBasePrice: 1200 // Tampered from 187,000 -> 1,200
            })
          });
          const data = await res.json();
          fetchBookings();
          showToast('🚨 [Bug ID: SITE029-BUG-007 / SEC-307] 등급별 기본 단가 변조 완료', `정상가 374,000원 -> 변조금액 ${data.booking.paymentAmount.toLocaleString()}원 예매 완료! (예매번호: ${data.booking.orderId})`);
          break;
        }
        case 8: { // SEC-308: VIP All-Inclusive Package Price Tampering
          const pkg = packages[0] || { id: 'pkg_01', name: 'VIP ALL-INCLUSIVE PASS' };
          const res = await fetch('/api/packages/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              packageId: pkg.id,
              packageName: pkg.name,
              performanceId: perf.id,
              packagePrice: 3000 // Tampered from 380,000 -> 3,000
            })
          });
          const data = await res.json();
          fetchBookings();
          showToast('🚨 [Bug ID: SITE029-BUG-008 / SEC-308] VIP 패키지 패스 금액 변조 완료', `정상 패키지가 380,000원 -> 변조금액 ${data.booking.paymentAmount.toLocaleString()}원 발권 완료! (예매번호: ${data.booking.orderId})`);
          break;
        }
        case 9: { // SEC-309: Order Summary Final Payment Total Tampering
          const res = await fetch('/api/orders/summary/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: 'ORD-SUMM-' + Date.now(),
              performanceId: perf.id,
              seatGrade: 'VIP',
              quantity: 2,
              finalPaymentTotal: 990 // Tampered from 378,000 -> 990
            })
          });
          const data = await res.json();
          fetchBookings();
          showToast('🚨 [Bug ID: SITE029-BUG-009 / SEC-309] 주문서 최종 합계 변조 완료', `정상 합계 378,000원 -> 변조금액 ${data.booking.paymentAmount.toLocaleString()}원 발권 완료! (예매번호: ${data.booking.orderId})`);
          break;
        }
        case 10: { // SEC-310: 2-Step Payment Authorization Amount Tampering
          const res = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: 'ORD-CONFIRM-' + Date.now(),
              performanceId: perf.id,
              seatGrade: 'VIP',
              quantity: 2,
              paymentAmount: 100, // Tampered authorized amount to 100 KRW
              actualSubtotal: 374000
            })
          });
          const data = await res.json();
          fetchBookings();
          showToast('🚨 [Bug ID: SITE029-BUG-010 / SEC-310] 2단계 최종 승인금액 변조 완료', `정상 승인가 378,000원 -> 승인금액 ${data.order.paymentAmount.toLocaleString()}원 최종 확정! (예매번호: ${data.order.orderId})`);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      showToast('오류', '시뮬레이션 요청 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="st-app">
      {/* ====================================================
          TOP NAVBAR
          ==================================================== */}
      <header className="st-header">
        <div className="st-container">
          <nav className="st-navbar">
            <div className="st-logo" onClick={() => setActiveCategory('전체')}>
              <div className="st-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <span>Starlight Ticket</span>
            </div>

            <div className="st-nav-links">
              {['전체', '콘서트', '뮤지컬', '페스티벌', '연극', 'packages'].map((cat) => (
                <button
                  key={cat}
                  className={`st-nav-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'packages' ? '🎁 VIP 패키지' : cat}
                </button>
              ))}
            </div>

            <div className="st-user-controls">
              <button className="st-nav-btn" onClick={() => setIsCartDrawerOpen(true)}>
                🛒 장바구니
                {cart.length > 0 && <span className="st-nav-badge">{cart[0].quantity}</span>}
              </button>
              <button className="st-nav-btn" onClick={() => setIsWishlistDrawerOpen(true)}>
                ❤️ 찜 목록
                {wishlist.length > 0 && <span className="st-nav-badge">{wishlist.length}</span>}
              </button>
              <button className="st-nav-btn" onClick={() => setIsBookingsDrawerOpen(true)}>
                🎟️ 내 예매내역
                {bookings.length > 0 && <span className="st-nav-badge">{bookings.length}</span>}
              </button>
              <div className="st-user-pill" onClick={() => setIsProfileModalOpen(true)}>
                <div className="st-user-avatar">{user.name.slice(0, 1)}</div>
                <span style={{ fontSize: '0.88rem', fontWeight: '800' }}>{user.name}</span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* ====================================================
          HERO BANNER & SEARCH (Flow 1: SEC-301)
          ==================================================== */}
      <section className="st-hero-banner">
        <div className="st-container">
          <div className="st-hero-grid">
            <div>
              <div className="st-hero-tag">
                <span>⚡ 2026 메가 라이브 콘서트 티켓 페스타 OPEN</span>
              </div>
              <h1 className="st-hero-title">
                가장 뜨거운 전율의 순간,<br />
                <span>스타라이트와 함께하는 라이브</span>
              </h1>
              <p className="st-hero-desc">
                월드투어 단독 콘서트, 오리지널 뮤지컬, 썸머 페스티벌까지 프리미엄 좌석을 실시간으로 예매하세요.
              </p>

              {/* Search Flow Form (Bug 1: SEC-301) */}
              <form className="st-search-bar" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  className="st-search-input"
                  placeholder="공연명, 아티스트, 공연장 검색 (예: ECLIPSE, 오페라의 유령, KSPO)"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <button type="submit" className="st-btn-primary">
                  공연 검색
                </button>
                <button
                  type="button"
                  className="st-btn-secondary"
                  style={{ border: '1px solid var(--purple-400)', color: 'var(--purple-200)', padding: '10px 16px', whiteSpace: 'nowrap' }}
                  onClick={() => simulateBugAttack(1)}
                  title="검색 단가 변조 1,000원 즉시 예매"
                >
                  ⚡ 1,000원 특가 검색예매
                </button>
              </form>
            </div>

            <div className="st-hero-card-preview">
              <img
                src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80"
                alt="Concert Hero"
                className="st-hero-img"
              />
              <div className="st-hero-card-overlay">
                <span style={{ color: 'var(--gold-400)', fontWeight: '900', fontSize: '0.85rem' }}>★ REALTIME NO.1 TOP TICKET</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff', marginTop: '4px' }}>
                  2026 ECLIPSE WORLD TOUR [SUPERNOVA]
                </h3>
                <span style={{ fontSize: '0.88rem', color: 'var(--purple-200)' }}>KSPO DOME · 2026.11.14~11.16</span>
                <div style={{ marginTop: '10px' }}>
                  <button
                    className="st-btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                    onClick={triggerSearchFastBooking}
                  >
                    검색 1위 공연 즉시 예매
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          CATEGORY STRIP
          ==================================================== */}
      <section className="st-category-strip">
        <div className="st-container">
          <div className="st-cat-pills">
            {['전체', '콘서트', '뮤지컬', '페스티벌', '연극', 'packages'].map((cat) => (
              <button
                key={cat}
                className={`st-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'packages' ? '🎁 한정판 패키지' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          MAIN CONTENT AREA
          ==================================================== */}
      <main className="st-container">
        
        {/* VIEW 1: NORMAL PERFORMANCES */}
        {activeCategory !== 'packages' && (
          <section className="st-section">
            <div className="st-section-header">
              <div className="st-section-title">
                <h2>{activeCategory === '전체' ? '🔥 실시간 인기 예매 랭킹' : `✨ ${activeCategory} 공연 목록`}</h2>
                <p>전국 주요 대형 공연장 실시간 좌석 확보 및 공식 티켓팅</p>
              </div>
              <button className="st-btn-secondary" onClick={() => { setSupportSubmitted(false); setIsSupportModalOpen(true); }}>
                🎧 1:1 고객센터 상담
              </button>
            </div>

            <div className="st-perf-grid">
              {performances.map((perf) => (
                <div key={perf.id} className="st-perf-card">
                  <div className="st-card-poster-wrap">
                    <img src={perf.poster} alt={perf.title} className="st-card-poster" />
                    <div className="st-card-rank-badge">{perf.ranking}</div>
                    <button
                      className={`st-card-wish-btn ${isPerfWishlisted(perf.id) ? 'active' : ''}`}
                      onClick={() => handleToggleWishlist(perf.id)}
                    >
                      {isPerfWishlisted(perf.id) ? '❤️' : '🤍'}
                    </button>
                  </div>

                  <div className="st-card-body">
                    <span className="st-card-genre">{perf.category} · {perf.genre}</span>
                    <h3 className="st-card-title">{perf.title}</h3>
                    <div className="st-card-venue">📍 {perf.venue}</div>
                    <div className="st-card-date">📅 {perf.date}</div>

                    <div className="st-card-price-row">
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', display: 'block' }}>티켓 최저가</span>
                        <span className="st-card-price">{perf.prices.A?.toLocaleString() || perf.prices.VIP?.toLocaleString()}원~</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* Flow 7 Button: Seats Tiers View */}
                        <button
                          className="st-btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          onClick={() => openTiersModal(perf)}
                          title="좌석 등급별 가격표 확인"
                        >
                          가격표
                        </button>

                        {/* Flow 4 Button: Interactive Seat Selection */}
                        <button
                          className="st-btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                          onClick={() => openSeatModal(perf)}
                        >
                          좌석 예매
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VIEW 2: PACKAGES (Flow 8: SEC-308) */}
        {activeCategory === 'packages' && (
          <section className="st-section">
            <div className="st-section-header">
              <div className="st-section-title">
                <h2>🎁 프리미엄 VIP 공연 패키지 & 굿즈 세트</h2>
                <p>공연 티켓과 한정판 공식 MD, 호텔 다이닝이 결합된 최고급 스페셜 패키지</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
              {packages.map((pkg) => (
                <div key={pkg.id} className="st-item-card" style={{ background: 'var(--black-800)', border: '1.5px solid var(--purple-700)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <span className="st-hero-tag" style={{ marginBottom: '10px' }}>{pkg.tag}</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', marginBottom: '12px' }}>{pkg.title}</h3>
                  
                  <div style={{ background: 'var(--black-900)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--purple-300)', marginBottom: '8px' }}>포함 내역:</div>
                    <ul style={{ listStyle: 'none', fontSize: '0.88rem', color: 'var(--gray-300)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {pkg.includes.map((inc, i) => (
                        <li key={i}>✓ {inc}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid rgba(139,92,246,0.2)', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>{pkg.basePrice.toLocaleString()}원</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--gold-400)' }}>
                        {pkg.finalPackagePrice.toLocaleString()}원 <span style={{ fontSize: '0.85rem', color: 'var(--neon-pink)' }}>({pkg.discountRate} OFF)</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="st-btn-secondary"
                        style={{ border: '1px solid var(--purple-400)' }}
                        onClick={() => simulateBugAttack(8)}
                        title="VIP 패키지 가격 변조 3,000원 결제"
                      >
                        ⚡ 3,000원 특가 예매
                      </button>
                      <button
                        className="st-btn-primary"
                        onClick={() => triggerPackageBooking(pkg)}
                      >
                        한정판 패키지 신청
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ====================================================
          SEAT TIERS MODAL (Flow 7: SEC-307)
          ==================================================== */}
      {isTiersModalOpen && selectedPerf && (
        <div className="st-modal-backdrop" onClick={() => setIsTiersModalOpen(false)}>
          <div className="st-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-header">
              <h3>{selectedPerf.title} - 좌석 등급별 가격표</h3>
              <button className="st-modal-close-btn" onClick={() => setIsTiersModalOpen(false)}>✕</button>
            </div>
            <div className="st-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {Object.entries(selectedPerf.seatsInfo).map(([tier, info]) => (
                  <div key={tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--black-900)', padding: '14px', borderRadius: 'var(--radius-md)', border: `1px solid ${info.color}` }}>
                    <div>
                      <span style={{ fontWeight: '900', color: info.color }}>[{tier}석]</span>
                      <span style={{ fontWeight: '700', marginLeft: '6px' }}>{info.name}</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>현재 잔여: {info.left}석</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--gold-400)' }}>{info.price.toLocaleString()}원</span>
                      <button
                        className="st-btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', border: '1px solid var(--purple-400)' }}
                        onClick={() => simulateBugAttack(7)}
                        title="좌석 기준 단가 1,200원 변조 예매"
                      >
                        ⚡ 1,200원 단가예매
                      </button>
                      <button
                        className="st-btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        onClick={() => {
                          setIsTiersModalOpen(false);
                          openCheckoutFlow(selectedPerf, tier, 2, '좌석 등급별 예매');
                        }}
                      >
                        선택 예매
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          SEAT SELECTION MODAL (Flow 4: SEC-304)
          ==================================================== */}
      {isSeatModalOpen && selectedPerf && (
        <div className="st-modal-backdrop" onClick={() => setIsSeatModalOpen(false)}>
          <div className="st-modal-box" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-header">
              <h3>{selectedPerf.title} - 좌석 등급 및 수량 선택</h3>
              <button className="st-modal-close-btn" onClick={() => setIsSeatModalOpen(false)}>✕</button>
            </div>

            <div className="st-modal-body">
              <div className="st-seat-modal-body">
                {/* Stage layout view */}
                <div className="st-stage-box">
                  <div className="st-stage-bar">STAGE (무대)</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '85%', padding: '14px', background: 'rgba(245, 158, 11, 0.2)', border: '1.5px dashed var(--gold-500)', borderRadius: '8px', color: 'var(--gold-400)', fontWeight: '800', fontSize: '0.9rem' }}>
                      [VIP] 사운드체크 플로어 스탠딩 / 지정석
                    </div>
                    <div style={{ width: '92%', padding: '12px', background: 'rgba(139, 92, 246, 0.2)', border: '1.5px dashed var(--purple-400)', borderRadius: '8px', color: 'var(--purple-200)', fontWeight: '800', fontSize: '0.88rem' }}>
                      [R] 1층 메인 지정석
                    </div>
                    <div style={{ width: '100%', padding: '10px', background: 'rgba(6, 182, 212, 0.2)', border: '1.5px dashed var(--neon-cyan)', borderRadius: '8px', color: 'var(--neon-cyan)', fontWeight: '800', fontSize: '0.85rem' }}>
                      [S] 2층 스탠드석 / [A] 3층 시야석
                    </div>
                  </div>
                </div>

                {/* Seat Tiers selector */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '12px', color: 'var(--purple-200)' }}>좌석 등급 선택</h4>
                  <div className="st-seat-tiers-list">
                    {Object.entries(selectedPerf.seatsInfo).map(([key, info]) => (
                      <div
                        key={key}
                        className={`st-seat-tier-item ${selectedGrade === key ? 'active' : ''}`}
                        onClick={() => setSelectedGrade(key)}
                      >
                        <div>
                          <span style={{ fontWeight: '900', color: info.color, marginRight: '8px' }}>[{key}]</span>
                          <span style={{ fontWeight: '700' }}>{info.name}</span>
                          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>잔여 {info.left}석</div>
                        </div>
                        <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--gold-400)' }}>
                          {info.price.toLocaleString()}원
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800' }}>예매 매수 선택:</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="st-btn-secondary" style={{ padding: '4px 12px' }} onClick={() => setTicketQty(Math.max(1, ticketQty - 1))}>-</button>
                      <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>{ticketQty}매</span>
                      <button className="st-btn-secondary" style={{ padding: '4px 12px' }} onClick={() => setTicketQty(Math.min(4, ticketQty + 1))}>+</button>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', padding: '14px', background: 'var(--black-900)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gray-400)' }}>예상 결제 금액:</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--gold-400)' }}>
                      {((selectedPerf.prices[selectedGrade] * ticketQty) + (2000 * ticketQty)).toLocaleString()}원
                    </span>
                  </div>

                  {/* Flow 4 Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      className="st-btn-secondary"
                      style={{ flex: 1, border: '1px solid var(--purple-400)' }}
                      onClick={() => { setIsSeatModalOpen(false); simulateBugAttack(4); }}
                      title="좌석 단가 500원 변조 선점"
                    >
                      ⚡ 좌석당 500원 선점결제
                    </button>
                    <button
                      className="st-btn-primary"
                      style={{ flex: 1.5, padding: '14px', justifyContent: 'center' }}
                      onClick={handleSeatSelectionSubmit}
                    >
                      선택 좌석 실시간 선점 및 예매
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          CHECKOUT & PAYMENT MODAL (Flow 6: SEC-306, Flow 9: SEC-309, Flow 10: SEC-310)
          ==================================================== */}
      {isCheckoutModalOpen && selectedPerf && (
        <div className="st-modal-backdrop" onClick={() => setIsCheckoutModalOpen(false)}>
          <div className="st-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-header">
              <h3>공연 티켓 결제 진행 ({currentFlowOrigin})</h3>
              <button className="st-modal-close-btn" onClick={() => setIsCheckoutModalOpen(false)}>✕</button>
            </div>

            <div className="st-modal-body">
              <div style={{ background: 'var(--black-900)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '18px', border: '1px solid var(--purple-700)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>{selectedPerf.title}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-300)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>📍 공연장: {selectedPerf.venue}</span>
                  <span>🎟️ 선택 좌석: {selectedGrade}석 ({ticketQty}매)</span>
                  <span>👤 예매자: {user.name} ({user.phone})</span>
                  <span>🏷️ 결제 경로: <strong style={{ color: 'var(--purple-300)' }}>{currentFlowOrigin}</strong></span>
                </div>
              </div>

              {/* Coupon Form (Flow 6: SEC-306) */}
              <div className="st-form-group">
                <label className="st-form-label">프로모션 할인 쿠폰 적용</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="st-form-input"
                    placeholder="쿠폰 코드 (예: STAR2026, CONCERT15, VIPMEMBER)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button type="button" className="st-btn-secondary" style={{ whiteSpace: 'nowrap' }} onClick={handleApplyCoupon}>
                    쿠폰 적용
                  </button>
                  <button
                    type="button"
                    className="st-btn-secondary"
                    style={{ border: '1px solid var(--purple-400)', color: 'var(--purple-200)', whiteSpace: 'nowrap' }}
                    onClick={() => simulateBugAttack(6)}
                    title="VIP 99% 슈퍼 할인 쿠폰 변조 적용"
                  >
                    ⚡ 99% 할인 쿠폰
                  </button>
                </div>
                {couponMsg && (
                  <div style={{ fontSize: '0.82rem', marginTop: '6px', color: appliedCoupon ? 'var(--success)' : 'var(--danger)', fontWeight: '700' }}>
                    {couponMsg}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="st-form-group">
                <label className="st-form-label">결제 수단 선택</label>
                <select className="st-form-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="신용카드">신용 / 체크카드 (무이자 할부)</option>
                  <option value="카카오페이">카카오페이 머니/간편결제</option>
                  <option value="네이버페이">네이버페이 포인트</option>
                  <option value="토스페이">토스페이 간편결제</option>
                </select>
              </div>

              {/* Pricing Breakdown */}
              <div style={{ borderTop: '1px dashed rgba(139,92,246,0.3)', paddingTop: '14px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span>티켓 정가 합계 ({selectedPerf.prices[selectedGrade].toLocaleString()}원 × {ticketQty})</span>
                  <span>{(selectedPerf.prices[selectedGrade] * ticketQty).toLocaleString()}원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span>예매 수수료 (장당 2,000원)</span>
                  <span>{(2000 * ticketQty).toLocaleString()}원</span>
                </div>
                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--neon-pink)', marginBottom: '6px' }}>
                    <span>쿠폰 할인 [{appliedCoupon.name}]</span>
                    <span>-{appliedCoupon.discountAmount.toLocaleString()}원</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: '900', color: 'var(--white)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(139,92,246,0.3)' }}>
                  <span>최종 결제 금액</span>
                  <span style={{ color: 'var(--gold-400)' }}>
                    {Math.max(0, (selectedPerf.prices[selectedGrade] * ticketQty) + (2000 * ticketQty) - (appliedCoupon ? appliedCoupon.discountAmount : 0)).toLocaleString()}원
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                {/* Flow 9 Trigger Button: View Order Summary */}
                <button
                  type="button"
                  className="st-btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => openOrderSummaryModal(selectedPerf, selectedGrade, ticketQty)}
                >
                  주문 요약서 보기
                </button>

                {/* Flow 10 Trigger Button: Proceed to Confirmation */}
                <button
                  type="button"
                  className="st-btn-primary"
                  style={{ flex: 1.5, padding: '12px', justifyContent: 'center' }}
                  onClick={handleProceedToConfirmation}
                >
                  결제 확인 및 승인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          ORDER SUMMARY MODAL (Flow 9: SEC-309)
          ==================================================== */}
      {isOrderSummaryModalOpen && selectedPerf && (
        <div className="st-modal-backdrop" onClick={() => setIsOrderSummaryModalOpen(false)}>
          <div className="st-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-header">
              <h3>전자 주문 요약서 (Order Summary)</h3>
              <button className="st-modal-close-btn" onClick={() => setIsOrderSummaryModalOpen(false)}>✕</button>
            </div>
            <div className="st-modal-body">
              <div style={{ background: 'var(--black-900)', padding: '18px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div><strong>공연명:</strong> {selectedPerf.title}</div>
                <div><strong>선택 등급:</strong> {selectedGrade}석 ({ticketQty}매)</div>
                <div><strong>티켓 단가:</strong> {selectedPerf.prices[selectedGrade].toLocaleString()}원</div>
                <div><strong>기본 티켓 합계:</strong> {(selectedPerf.prices[selectedGrade] * ticketQty).toLocaleString()}원</div>
                <div><strong>예매 수수료:</strong> {(2000 * ticketQty).toLocaleString()}원</div>
                <div style={{ borderTop: '1px solid rgba(139,92,246,0.3)', paddingTop: '8px', fontSize: '1.15rem', fontWeight: '900', color: 'var(--gold-400)' }}>
                  서버 산출 총액: {((selectedPerf.prices[selectedGrade] * ticketQty) + (2000 * ticketQty)).toLocaleString()}원
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="st-btn-secondary"
                  style={{ flex: 1, border: '1px solid var(--purple-400)' }}
                  onClick={() => { setIsOrderSummaryModalOpen(false); simulateBugAttack(9); }}
                  title="주문서 요약 총액 990원 변조 발권"
                >
                  ⚡ 요약서 990원 발권
                </button>
                <button
                  className="st-btn-primary"
                  style={{ flex: 1.5, padding: '12px', justifyContent: 'center' }}
                  onClick={() => {
                    setIsOrderSummaryModalOpen(false);
                    setCurrentFlowOrigin('주문 요약 결제');
                    handleFinalPaymentSubmit();
                  }}
                >
                  정상 총액 결제 승인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          PAYMENT CONFIRMATION MODAL (Flow 10: SEC-310)
          ==================================================== */}
      {isConfirmModalOpen && selectedPerf && (
        <div className="st-modal-backdrop" onClick={() => setIsConfirmModalOpen(false)}>
          <div className="st-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-header">
              <h3>최종 결제 승인 확인 (Confirmation)</h3>
              <button className="st-modal-close-btn" onClick={() => setIsConfirmModalOpen(false)}>✕</button>
            </div>
            <div className="st-modal-body">
              <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎟️</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>결제 승인 최종 단계</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-300)', marginTop: '6px' }}>
                  선택하신 티켓의 예매 정보를 최종 확인하고 발권을 완료합니다.
                </p>
              </div>

              <div style={{ background: 'var(--black-900)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>공연/좌석:</span>
                  <span>{selectedPerf.title} ({selectedGrade}석 {ticketQty}매)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>결제 수단:</span>
                  <span>{paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '1.1rem', color: 'var(--gold-400)' }}>
                  <span>승인 요청 금액:</span>
                  <span>{Math.max(0, (selectedPerf.prices[selectedGrade] * ticketQty) + (2000 * ticketQty) - (appliedCoupon ? appliedCoupon.discountAmount : 0)).toLocaleString()}원</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="st-btn-secondary"
                  style={{ flex: 1, border: '1px solid var(--purple-400)' }}
                  onClick={() => { setIsConfirmModalOpen(false); simulateBugAttack(10); }}
                  title="2단계 최종 승인 금액 100원 변조 확정"
                >
                  ⚡ 최종 100원 승인확정
                </button>
                <button
                  className="st-btn-primary"
                  style={{ flex: 1.5, padding: '14px', justifyContent: 'center' }}
                  onClick={() => {
                    setCurrentFlowOrigin('결제 확인 승인');
                    handleFinalPaymentSubmit();
                  }}
                >
                  최종 결제 승인 및 발권
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          CART DRAWER (Flow 5: SEC-305)
          ==================================================== */}
      {isCartDrawerOpen && (
        <div className="st-drawer-backdrop" onClick={() => setIsCartDrawerOpen(false)}>
          <div className="st-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="st-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>티켓 장바구니</h3>
              <button className="st-modal-close-btn" onClick={() => setIsCartDrawerOpen(false)}>✕</button>
            </div>
            <div className="st-drawer-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>장바구니가 비어 있습니다.</div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="st-item-card">
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#fff' }}>{item.title}</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--purple-300)', marginTop: '4px' }}>
                      등급: {item.seatName} (단가: {item.unitPrice?.toLocaleString()}원)
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', background: 'var(--black-900)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.88rem' }}>티켓 수량:</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Flow 5 Quantity Change Buttons */}
                        <button
                          className="st-btn-secondary"
                          style={{ padding: '2px 10px' }}
                          onClick={() => {
                            const perf = performances.find(p => p.id === item.performanceId) || performances[0];
                            handleCartQuantityChange(perf, item.seatGrade, Math.max(1, item.quantity - 1));
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: '900' }}>{item.quantity}매</span>
                        <button
                          className="st-btn-secondary"
                          style={{ padding: '2px 10px' }}
                          onClick={() => {
                            const perf = performances.find(p => p.id === item.performanceId) || performances[0];
                            handleCartQuantityChange(perf, item.seatGrade, Math.min(4, item.quantity + 1));
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '6px' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', display: 'block' }}>합계 금액</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--gold-400)' }}>
                          {(item.actualSubtotal || (item.unitPrice * item.quantity)).toLocaleString()}원
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="st-btn-secondary"
                          style={{ padding: '8px 12px', fontSize: '0.82rem', border: '1px solid var(--purple-400)' }}
                          onClick={() => simulateBugAttack(5)}
                          title="장바구니 소계 800원 변조 결제"
                        >
                          ⚡ 800원 결제
                        </button>
                        <button
                          className="st-btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                          onClick={() => {
                            const perf = performances.find(p => p.id === item.performanceId) || performances[0];
                            setIsCartDrawerOpen(false);
                            openCheckoutFlow(perf, item.seatGrade, item.quantity, '장바구니 수량 결제');
                          }}
                        >
                          장바구니 결제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          1:1 SUPPORT MODAL (Flow 3: SEC-303)
          ==================================================== */}
      {isSupportModalOpen && (
        <div className="st-modal-backdrop" onClick={() => setIsSupportModalOpen(false)}>
          <div className="st-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-header">
              <h3>1:1 고객센터 상담 문의</h3>
              <button className="st-modal-close-btn" onClick={() => setIsSupportModalOpen(false)}>✕</button>
            </div>
            <div className="st-modal-body">
              {!supportSubmitted ? (
                <form onSubmit={handleSupportSubmit}>
                  <div className="st-form-group">
                    <label className="st-form-label">문의 유형</label>
                    <select className="st-form-input" value={supportCategory} onChange={(e) => setSupportCategory(e.target.value)}>
                      <option value="티켓 예매/결제">티켓 예매 및 결제 문의</option>
                      <option value="좌석 배정/변경">좌석 배정 및 등급 문의</option>
                      <option value="환불/취소 규정">예매 취소 및 수수료 안내</option>
                      <option value="VIP 패키지/굿즈">VIP 패키지 상품 수령 문의</option>
                    </select>
                  </div>
                  <div className="st-form-group">
                    <label className="st-form-label">문의 제목</label>
                    <input type="text" className="st-form-input" placeholder="문의 제목을 입력하세요" value={supportTitle} onChange={(e) => setSupportTitle(e.target.value)} required />
                  </div>
                  <div className="st-form-group">
                    <label className="st-form-label">상세 내용</label>
                    <textarea className="st-form-input" rows="4" placeholder="상세 문의 내용을 작성해주세요" value={supportMsg} onChange={(e) => setSupportMsg(e.target.value)} required />
                  </div>
                  <button type="submit" className="st-btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                    문의 접수 및 등록하기
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎧</div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>문의가 성공적으로 접수되었습니다!</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--gray-300)', marginTop: '6px' }}>
                    상담 연계 특별 할인 혜택으로 공연을 바로 예매하실 수 있습니다.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                    <button
                      className="st-btn-secondary"
                      style={{ border: '1px solid var(--purple-400)' }}
                      onClick={() => simulateBugAttack(3)}
                      title="상담원 특별가 2,000원 변조 예매"
                    >
                      ⚡ 상담원 특가 2,000원 예매
                    </button>
                    <button
                      className="st-btn-primary"
                      style={{ padding: '10px 24px' }}
                      onClick={triggerSupportLinkedBooking}
                    >
                      상담 연계 공연 즉시 예매
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          PROFILE EDIT MODAL (Flow 2: SEC-302)
          ==================================================== */}
      {isProfileModalOpen && (
        <div className="st-modal-backdrop" onClick={() => setIsProfileModalOpen(false)}>
          <div className="st-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-header">
              <h3>스타라이트 회원 프로필</h3>
              <button className="st-modal-close-btn" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            </div>
            <div className="st-modal-body">
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px', background: 'var(--black-900)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div className="st-user-avatar" style={{ width: '48px', height: '48px', fontSize: '1.3rem' }}>{user.name.slice(0, 1)}</div>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '1.15rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--purple-300)' }}>{user.email} · {user.membership}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gold-400)', fontWeight: '800' }}>보유 티켓 포인트: {user.ticketPoints?.toLocaleString()} P</div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="st-form-group">
                  <label className="st-form-label">연락처 (모바일 티켓 수신용)</label>
                  <input type="text" className="st-form-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
                </div>
                <div className="st-form-group">
                  <label className="st-form-label">프로필 소개글 & 선호 음악 취향</label>
                  <textarea className="st-form-input" rows="3" value={editBio} onChange={(e) => setEditBio(e.target.value)} />
                </div>
                <button type="submit" className="st-btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                  프로필 저장하기
                </button>
              </form>

              {/* Flow 2 Trigger Button */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(139,92,246,0.3)', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="st-btn-secondary"
                  style={{ flex: 1, padding: '10px', border: '1px solid var(--purple-400)' }}
                  onClick={() => simulateBugAttack(2)}
                  title="회원 맞춤 추천 1,500원 변조 예매"
                >
                  ⚡ 맞춤 추천 1,500원 결제
                </button>
                <button
                  type="button"
                  className="st-btn-primary"
                  style={{ flex: 1.2, padding: '10px' }}
                  onClick={triggerProfileRecommendBooking}
                >
                  선호 공연 바로 예매
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MY BOOKINGS DRAWER
          ==================================================== */}
      {isBookingsDrawerOpen && (
        <div className="st-drawer-backdrop" onClick={() => setIsBookingsDrawerOpen(false)}>
          <div className="st-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="st-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>내 공연 예매내역 ({bookings.length})</h3>
              <button className="st-modal-close-btn" onClick={() => setIsBookingsDrawerOpen(false)}>✕</button>
            </div>
            <div className="st-drawer-body">
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>예매된 티켓이 없습니다.</div>
              ) : (
                bookings.map((b, idx) => (
                  <div key={idx} className="st-item-card">
                    <span style={{ fontSize: '0.75rem', background: 'var(--purple-700)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                      {b.orderId}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#fff', marginTop: '6px' }}>{b.title}</h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-300)', marginTop: '4px' }}>
                      <div>📍 {b.venue}</div>
                      <div>📅 {b.performanceDate}</div>
                      <div>🎟️ {b.seatGrade}석 ({b.quantity}매)</div>
                      <div>🏷️ 발권 경로: <strong style={{ color: 'var(--purple-300)' }}>{b.flowOrigin}</strong></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(139,92,246,0.2)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '800' }}>● {b.status}</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--gold-400)' }}>
                        {(b.paidAmount || b.serverSubtotal).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          WISHLIST DRAWER
          ==================================================== */}
      {isWishlistDrawerOpen && (
        <div className="st-drawer-backdrop" onClick={() => setIsWishlistDrawerOpen(false)}>
          <div className="st-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="st-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>찜한 관심 공연 ({wishlist.length})</h3>
              <button className="st-modal-close-btn" onClick={() => setIsWishlistDrawerOpen(false)}>✕</button>
            </div>
            <div className="st-drawer-body">
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>찜한 공연이 없습니다.</div>
              ) : (
                wishlist.map((w, idx) => (
                  <div key={idx} className="st-item-card">
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#fff' }}>{w.title}</h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginTop: '4px' }}>📍 {w.venue} · {w.date}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <button className="st-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }} onClick={() => handleToggleWishlist(w.id)}>
                        찜 해제
                      </button>
                      <button className="st-btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }} onClick={() => { setIsWishlistDrawerOpen(false); openSeatModal(w); }}>
                        예매하기
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TOAST NOTIFICATION
          ==================================================== */}
      {toast && (
        <div className="st-toast">
          <div>
            <div style={{ fontWeight: '900' }}>{toast.title}</div>
            {toast.desc && <div style={{ fontSize: '0.82rem', color: 'var(--purple-200)' }}>{toast.desc}</div>}
          </div>
        </div>
      )}

      {/* ====================================================
          FOOTER
          ==================================================== */}
      <footer className="st-footer">
        <div className="st-container">
          <div className="st-footer-grid">
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '900', marginBottom: '10px' }}>Starlight Ticket</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                전 세계 팬들과 아티스트를 연결하는 대한민국 대표 글로벌 라이브 티켓팅 플랫폼입니다.
              </p>
            </div>
            <div className="st-footer-col">
              <h5>공연 장르</h5>
              <ul>
                <li><a href="#concert" onClick={() => setActiveCategory('콘서트')}>K-POP & 콘서트</a></li>
                <li><a href="#musical" onClick={() => setActiveCategory('뮤지컬')}>뮤지컬 & 클래식</a></li>
                <li><a href="#festival" onClick={() => setActiveCategory('페스티벌')}>페스티벌 & EDM</a></li>
                <li><a href="#theater" onClick={() => setActiveCategory('연극')}>연극 & 대학로</a></li>
              </ul>
            </div>
            <div className="st-footer-col">
              <h5>고객 안내</h5>
              <ul>
                <li><a href="#support" onClick={() => { setSupportSubmitted(false); setIsSupportModalOpen(true); }}>1:1 상담 문의</a></li>
                <li><a href="#faq">티켓 수령 안내</a></li>
                <li><a href="#refund">취소 및 환불 수수료</a></li>
                <li><a href="#policy">예매 이용약관</a></li>
              </ul>
            </div>
            <div className="st-footer-col">
              <h5>뉴스레터</h5>
              <p style={{ fontSize: '0.82rem', marginBottom: '8px' }}>단독 선예매 & 얼리버드 알림을 받아보세요.</p>
              <button className="st-btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={() => showToast('뉴스레터 구독 완료', '단독 선예매 알림이 설정되었습니다.')}>
                구독하기
              </button>
            </div>
          </div>
          <div className="st-footer-bottom">
            <div>© 2026 Starlight Ticket Inc. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>한국어 (KR)</span>
              <span>KRW (₩)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
