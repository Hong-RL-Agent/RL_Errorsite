import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import Toast from './components/Toast';

import Home from './pages/Home';
import Classes from './pages/Classes';
import CalendarPage from './pages/CalendarPage';
import Products from './pages/Products';
import Cart from './pages/Cart';
import MyPage from './pages/MyPage';
import Reviews from './pages/Reviews';
import Instructors from './pages/Instructors';
import Favorites from './pages/Favorites';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState(['class-01', 'class-04']);
  const [toasts, setToasts] = useState([]);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedClassForBooking, setSelectedClassForBooking] = useState(null);
  const [bookingDate, setBookingDate] = useState('2026-10-05');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Buy Now Modal (for SEC-392 and SEC-395 tests)
  const [buyNowModalOpen, setBuyNowModalOpen] = useState(false);
  const [selectedProductForBuy, setSelectedProductForBuy] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [useDiscountPrice, setUseDiscountPrice] = useState(true);

  const showToast = (message, bugId = null, secId = null, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, bugId, secId, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const fetchInitialData = async () => {
    try {
      const [cRes, pRes, cartRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/products'),
        fetch('/api/cart')
      ]);
      const cData = await cRes.json();
      const pData = await pRes.json();
      const cartData = await cartRes.json();

      if (cData.success) setClasses(cData.data.items);
      if (pData.success) setProducts(pData.data);
      if (cartData.success) setCart(cartData.data);
    } catch (err) {
      console.error('Initial fetch failed', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Class Booking Trigger (SEC-391 double booking race condition)
  const handleOpenBookClass = (cls) => {
    setSelectedClassForBooking(cls);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedClassForBooking) return;
    setIsSubmittingBooking(true);
    try {
      const res = await fetch(`/api/classes/${selectedClassForBooking.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: bookingDate,
          time: bookingTime
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `[${selectedClassForBooking.title}] 예약이 확정되었습니다! (총 예약수: ${data.totalBookingsForClass}건, 잔여석: ${data.remainingSeats}석)`,
          data.bugId || 'site042-bug01',
          data.secId || 'SEC-391'
        );
        setBookingModalOpen(false);
        fetchInitialData();
      } else {
        showToast(data.message, null, null, 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Add to cart Trigger
  const handleAddToCart = async (product) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
        showToast(`[${product.title}] 장바구니에 담겼습니다.`, data.bugId || 'site042-bug05', data.secId || 'SEC-395');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Buy Now Modal Trigger (SEC-392 stale price and SEC-395 stock deficit)
  const handleOpenBuyNow = (product) => {
    setSelectedProductForBuy(product);
    setBuyQuantity(1);
    setUseDiscountPrice(true);
    setBuyNowModalOpen(true);
  };

  const handleConfirmBuyNow = async () => {
    if (!selectedProductForBuy) return;
    try {
      const priceToUse = useDiscountPrice && selectedProductForBuy.oldPrice
        ? selectedProductForBuy.oldPrice
        : selectedProductForBuy.currentPrice;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForBuy.id,
          requestedPrice: priceToUse,
          quantity: buyQuantity
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `[${selectedProductForBuy.title}] ${buyQuantity}개 주문 승인 완료! (결제금액: ${data.order.chargedAmount.toLocaleString()}원)`,
          data.bugId || 'site042-bug02',
          data.secId || 'SEC-392'
        );
        setBuyNowModalOpen(false);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
      await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
    } else {
      setFavorites([...favorites, id]);
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      showToast('관심 클래스로 찜 목록에 추가되었습니다.', 'info');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onClose={(id) => setToasts(toasts.filter((t) => t.id !== id))} />

      {/* Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
          onOpenBookingModal={() => {
            setSelectedClassForBooking(classes[0] || null);
            setBookingModalOpen(true);
          }}
          onNavigate={(p) => setCurrentPage(p)}
        />

        {currentPage === 'home' && (
          <Home
            onNavigate={(p) => setCurrentPage(p)}
            classes={classes}
            products={products}
            onBookClass={handleOpenBookClass}
            onAddToCart={handleAddToCart}
            onBuyNow={handleOpenBuyNow}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentPage === 'classes' && (
          <Classes
            onBookClass={handleOpenBookClass}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showToast={showToast}
          />
        )}

        {currentPage === 'calendar' && (
          <CalendarPage showToast={showToast} />
        )}

        {currentPage === 'products' && (
          <Products
            products={products}
            onAddToCart={handleAddToCart}
            onBuyNow={handleOpenBuyNow}
            showToast={showToast}
          />
        )}

        {currentPage === 'cart' && (
          <Cart
            cart={cart}
            onUpdateQuantity={(id, qty) => {
              setCart(cart.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
            }}
            onRemoveItem={(id) => setCart(cart.filter((i) => i.id !== id))}
            onCheckout={() => {
              setCart([]);
              fetchInitialData();
            }}
            showToast={showToast}
          />
        )}

        {currentPage === 'mypage' && (
          <MyPage showToast={showToast} />
        )}

        {currentPage === 'reviews' && (
          <Reviews showToast={showToast} />
        )}

        {currentPage === 'instructors' && (
          <Instructors
            onBookInstructor={(inst) => {
              const target = classes.find((c) => c.instructor === inst.name) || classes[0];
              setSelectedClassForBooking(target);
              setBookingModalOpen(true);
            }}
          />
        )}

        {currentPage === 'favorites' && (
          <Favorites
            favorites={favorites}
            classes={classes}
            onBookClass={handleOpenBookClass}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={(p) => setCurrentPage(p)}
          />
        )}
      </div>

      {/* Class Booking Modal (SEC-391) */}
      <Modal
        isOpen={bookingModalOpen}
        title={selectedClassForBooking ? `${selectedClassForBooking.title} 예약` : '클래스 예약'}
        onClose={() => setBookingModalOpen(false)}
        footer={
          <>
            <button
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
              onClick={() => setBookingModalOpen(false)}
            >
              닫기
            </button>
            <button
              className="btn-lime"
              onClick={handleConfirmBooking}
              disabled={isSubmittingBooking}
            >
              {isSubmittingBooking ? '예약 처리 중...' : '수업 예약 확정하기'}
            </button>
          </>
        }
      >
        {selectedClassForBooking && (
          <div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 18, background: '#f8fafc', padding: 14, borderRadius: 12 }}>
              <img
                src={selectedClassForBooking.image}
                alt=""
                style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                  {selectedClassForBooking.title}
                </div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                  {selectedClassForBooking.instructor} 강사 · {selectedClassForBooking.location}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#064e3b', marginTop: 4 }}>
                  {selectedClassForBooking.price.toLocaleString()}원 / 회 (잔여 {selectedClassForBooking.remainingSeats}석)
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">예약 희망 날짜</label>
              <input
                type="date"
                className="form-input"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">수업 시간대</label>
              <select
                className="form-select"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              >
                <option value="07:00">07:00 (오전 선라이즈)</option>
                <option value="10:00">10:00 (오전 집중 코스)</option>
                <option value="14:00">14:00 (오후 웰니스)</option>
                <option value="19:00">19:00 (퇴근 후 파워 세션)</option>
                <option value="20:30">20:30 (야간 릴렉스)</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* Buy Now Modal (SEC-392 and SEC-395) */}
      <Modal
        isOpen={buyNowModalOpen}
        title={selectedProductForBuy ? `${selectedProductForBuy.title} 바로구매` : '상품 주문'}
        onClose={() => setBuyNowModalOpen(false)}
        footer={
          <>
            <button
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
              onClick={() => setBuyNowModalOpen(false)}
            >
              취소
            </button>
            <button className="btn-lime" onClick={handleConfirmBuyNow}>
              주문 승인 및 결제하기
            </button>
          </>
        }
      >
        {selectedProductForBuy && (
          <div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 18, background: '#f8fafc', padding: 14, borderRadius: 12 }}>
              <img
                src={selectedProductForBuy.image}
                alt=""
                style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                  {selectedProductForBuy.title}
                </div>
                <div style={{ fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>
                  현재 실제 재고: {selectedProductForBuy.stock}개
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#064e3b', marginTop: 4 }}>
                  정상 가격: {selectedProductForBuy.currentPrice.toLocaleString()}원
                  {selectedProductForBuy.oldPrice && (
                    <span style={{ fontSize: 12, color: '#64748b', marginLeft: 6 }}>
                      (기존가: {selectedProductForBuy.oldPrice.toLocaleString()}원)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">구매 수량 선택</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            {selectedProductForBuy.oldPrice && (
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ecfdf5', padding: 10, borderRadius: 8 }}>
                <input
                  type="checkbox"
                  id="discountCheck"
                  checked={useDiscountPrice}
                  onChange={(e) => setUseDiscountPrice(e.target.checked)}
                />
                <label htmlFor="discountCheck" style={{ fontSize: 13, fontWeight: 600, color: '#065f46', cursor: 'pointer' }}>
                  이전 장바구니/캐시 적용 가격 ({selectedProductForBuy.oldPrice.toLocaleString()}원)으로 결제 요청
                </label>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
