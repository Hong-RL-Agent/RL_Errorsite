import React, { useState, useEffect } from 'react';

export default function App() {
  // DB States
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);

  // Selection configurations
  const [displayQuantities, setDisplayQuantities] = useState({});
  const [cart, setCart] = useState([]); // Real item pricing calculation cart
  
  const [pickupDate, setPickupDate] = useState('2026-06-25');
  const [pickupTime, setPickupTime] = useState('14:00 - 16:00');
  const [address, setAddress] = useState('서울시 서초구 서초대로 456');

  // Interactive UI drawers
  const [addressPanelOpen, setAddressPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('booking');
  const [toasts, setToasts] = useState([]);
  const [estimateInfo, setEstimateInfo] = useState('');

  useEffect(() => {
    loadItems();
    loadOrders();
    loadOccupiedSlots();
  }, []);

  const loadItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      showToast('세탁 소장 품목 로드 실패', 'danger');
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      showToast('주문 내역 연동 실패', 'danger');
    }
  };

  const loadOccupiedSlots = async () => {
    try {
      const res = await fetch('/api/occupied-slots');
      const data = await res.json();
      setOccupiedSlots(data);
    } catch (err) {
      showToast('마감 일정 테이블 조회 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Error 1: Update quantities mismatch
  const handleUpdateQuantity = (itemId, change) => {
    // 1. Update display quantities normally
    setDisplayQuantities(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + change);
      return { ...prev, [itemId]: next };
    });

    // 2. Update real cart used for calculating summary prices
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      const targetItem = items.find(i => i.id === itemId);

      if (change > 0) {
        if (existing) {
          return prev.map(i => i.id === itemId ? { ...i, qty: i.qty + change } : i);
        } else {
          return [...prev, { ...targetItem, qty: change }];
        }
      } else {
        // INTENTIONAL_ERROR
        // CATEGORY: Frontend
        // DESCRIPTION: 세탁 품목 수량을 증가시킬 때는 정상 작동하지만, 빠르게 수량을 
        // 감소(change < 0)시킬 시 화면 상의 표시 숫자(displayQuantities)만 깎이게 하고 
        // 총 결제 금액 산출 기준이 되는 cart 내부 수량 필드는 동기화하지 않고 이전 값을 방치합니다.
        // 이로 인해 화면 수량과 우측 가격 요약 금액이 불일치하는 상태를 초래합니다.
        return prev;
      }
    });
  };

  // Total pricing calculator from cart state
  const calculateTotalPrice = () => {
    return cart.reduce((acc, cur) => acc + (cur.price * cur.qty), 0);
  };

  const handlePlaceOrder = async () => {
    const total = calculateTotalPrice();
    if (total <= 0) {
      showToast('최소 한 개 이상의 세탁 품목을 추가하셔야 예약 가능합니다.', 'warning');
      return;
    }

    const slotStr = `${pickupDate} ${pickupTime}`;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.filter(i => i.qty > 0),
          totalPrice: total,
          pickupTime: slotStr,
          address
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '주문 생성 실패');
      }

      showToast('세탁 수거 예약이 완료되었습니다.', 'success');
      // Reset states
      setCart([]);
      setDisplayQuantities({});
      loadOrders();
      loadOccupiedSlots();
      setActiveTab('history');
    } catch (err) {
      showToast(`[예약 실패] ${err.message}`, 'danger');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('세탁 주문 예약을 취소하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('주문이 취소되었습니다. (수거 약속 시간은 해제되지 않음)', 'success');
        loadOrders();
        loadOccupiedSlots();
      }
    } catch (err) {
      showToast('서버 통신 실패', 'danger');
    }
  };

  // Error 4: estimate-v2 path 404 Trigger
  const handleRecalculateEstimate = async () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 예상 완료 시간 다시 계산 버튼 작동 시, 백엔드 라우터에 존재하지 않는 API 경로인 
    // '/api/orders/estimate-v2'를 호출하게 만들어 강제적으로 HTTP 404 에러를 유발합니다.
    try {
      const res = await fetch('/api/orders/estimate-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupTime: `${pickupDate} ${pickupTime}` })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} Not Found`);
      }

      const data = await res.json();
      setEstimateInfo(data.description);
    } catch (err) {
      showToast(`시간 계산 불가: ${err.message}`, 'danger');
    }
  };

  const isSlotOccupied = (date, time) => {
    const slotStr = `${date} ${time}`;
    return occupiedSlots.includes(slotStr);
  };

  return (
    <div className="washday-app">
      {/* App Navbar */}
      <header className="app-navbar">
        <div className="navbar-logo">
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a7 7 0 1 0 10 10" />
          </svg>
          <span className="logo-title">WashDay</span>
          <span className="logo-subtitle">프리미엄 비대면 세탁 배달 수거</span>
        </div>
        <div className="navbar-actions">
          <button 
            className={`nav-btn ${activeTab === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveTab('booking')}
          >
            🧺 세탁 신청서 작성
          </button>
          <button 
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 수거/세탁 내역 ({orders.length})
          </button>
        </div>
      </header>

      {/* Main tab: Booking Workspace */}
      {activeTab === 'booking' ? (
        <div className="booking-grid-layout">
          
          {/* Left panel: Item Selectors & DateTime Pickers */}
          <main className="left-booking-workspace">
            
            {/* Laundry circular items grid */}
            <section className="panel-section items-selection-panel">
              <div className="panel-header">
                <h2>👕 세탁 품목 선택</h2>
                <p className="subtitle">해당 세탁할 의류/이불을 탭하여 수량을 추가하세요.</p>
              </div>

              <div className="laundry-circular-grid">
                {items.map(item => {
                  const qty = displayQuantities[item.id] || 0;
                  return (
                    <div key={item.id} className={`circular-item-card ${qty > 0 ? 'selected' : ''}`}>
                      <div className="circle-avatar">{item.icon}</div>
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-price">₩{item.price.toLocaleString()}</p>
                      
                      <div className="qty-controls-row">
                        <button className="qty-btn" onClick={() => handleUpdateQuantity(item.id, -1)}>-</button>
                        <span className="qty-lbl">{qty}</span>
                        <button className="qty-btn" onClick={() => handleUpdateQuantity(item.id, 1)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Pickup DateTime selectors */}
            <section className="panel-section datetime-selection-panel">
              <div className="panel-header">
                <h2>📅 수거 날짜와 시간 선택</h2>
              </div>
              
              <div className="datetime-selections-box">
                <div class="date-pickers-row">
                  {['2026-06-25', '2026-06-26'].map(d => (
                    <button 
                      key={d} 
                      className={`date-unit-btn ${pickupDate === d ? 'active' : ''}`}
                      onClick={() => setPickupDate(d)}
                    >
                      {d.endsWith('25') ? '목요일 (6/25)' : '금요일 (6/26)'}
                    </button>
                  ))}
                </div>

                <div class="time-slots-grid">
                  {['10:00 - 12:00', '14:00 - 16:00', '19:00 - 21:00'].map(t => {
                    const occupied = isSlotOccupied(pickupDate, t);
                    return (
                      <button 
                        key={t}
                        disabled={occupied}
                        className={`time-slot-btn ${pickupTime === t ? 'active' : ''} ${occupied ? 'occupied' : ''}`}
                        onClick={() => setPickupTime(t)}
                      >
                        <span className="time-lbl">{t}</span>
                        <span className="status-lbl">{occupied ? '예약 마감' : '예약 가능'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Address Slide Drawer Trigger */}
            <section className="panel-section address-trigger-panel">
              <div className="panel-header">
                <h2>📍 주소지 확인</h2>
              </div>
              <div className="address-display-row">
                <p className="addr-txt">입력된 주소: <strong>{address}</strong></p>
                <button className="open-drawer-btn" onClick={() => setAddressPanelOpen(true)}>
                  주소지 변경 / 기입
                </button>
              </div>
            </section>

          </main>

          {/* Right panel: Real-time billing summary checkout card */}
          <aside className="panel-section right-summary-panel">
            <div className="panel-header">
              <h2>💳 실시간 주문 요약</h2>
            </div>

            <div className="checkout-summary-contents">
              {cart.filter(c => c.qty > 0).length === 0 ? (
                <div className="empty-placeholder-box">
                  선택한 세탁 물품이 없습니다.
                </div>
              ) : (
                <div className="summary-list">
                  {cart.filter(c => c.qty > 0).map(c => (
                    <div key={c.id} className="summary-item-row">
                      <span>{c.name} (x{c.qty})</span>
                      <strong>₩{(c.price * c.qty).toLocaleString()}</strong>
                    </div>
                  ))}

                  <div className="total-pricing-card">
                    <span>최종 세탁 청구 합계:</span>
                    <strong className="total-price-val">₩{calculateTotalPrice().toLocaleString()}</strong>
                  </div>

                  <div className="checkout-details-card">
                    <p>📅 수거예정: {pickupDate} ({pickupTime})</p>
                    <p>📍 주소: {address}</p>
                  </div>

                  <button className="submit-order-btn" onClick={handlePlaceOrder}>
                    🧺 세탁물 수거 예약 접수하기
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Slide Drawer Address Panel */}
          <div className={`address-slide-drawer-overlay ${addressPanelOpen ? 'open' : ''}`} onClick={() => setAddressPanelOpen(false)}>
            <div className="address-slide-drawer-body" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header">
                <h3>📍 배송 및 수거 주소 기입</h3>
                <button className="close-drawer-btn" onClick={() => setAddressPanelOpen(false)}>&times;</button>
              </div>
              <div className="drawer-contents">
                <p className="drawer-desc">비대면 수거를 위한 정확한 주소를 기입해 주십시오. (지하 주소인 경우 배송 불가 경고가 발생할 수 있습니다.)</p>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="예: 서울시 강남구 테헤란로 12 지하 1층" 
                  className="address-input-field"
                />
                <button className="save-address-btn" onClick={() => setAddressPanelOpen(false)}>
                  주소지 설정 완료
                </button>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* History & Laundry State Timeline Tab */
        <div className="panel-section history-timeline-view">
          <div className="panel-header">
            <h2>📜 내 세탁 주문 및 진행 상태 타임라인</h2>
          </div>

          <div className="orders-timeline-container">
            {orders.length === 0 ? (
              <div className="empty-placeholder">최근 세탁 의뢰 접수 이력이 존재하지 않습니다.</div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="order-details-timeline-card">
                  <div className="order-head">
                    <span className="order-id">주문 코드: {order.id}</span>
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                    {order.status !== 'cancelled' && (
                      <button className="cancel-order-btn" onClick={() => handleCancelOrder(order.id)}>주문 취소</button>
                    )}
                  </div>

                  <div className="order-items-desc">
                    {order.items.map(i => (
                      <span key={i.id} className="item-qty-tag">{i.name} (x{i.qty})</span>
                    ))}
                  </div>

                  <div className="order-meta-info">
                    <p>수거 예약일: <strong>{order.pickupTime}</strong></p>
                    <p>수거 주소지: <strong>{order.address}</strong></p>
                    <p>최종 금액: <strong>₩{order.totalPrice.toLocaleString()}</strong></p>
                  </div>

                  {/* Washing Progress timeline grid */}
                  {order.status !== 'cancelled' && (
                    <div className="washing-step-timeline">
                      <div className={`step-node ${['collection', 'washing', 'delivery'].includes(order.status) ? 'active' : ''}`}>
                        <div className="step-circle">1</div>
                        <span>세탁물 수거</span>
                      </div>
                      <div className="step-line"></div>
                      <div className={`step-node ${['washing', 'delivery'].includes(order.status) ? 'active' : ''}`}>
                        <div className="step-circle">2</div>
                        <span>세탁 중</span>
                      </div>
                      <div className="step-line"></div>
                      <div className={`step-node ${order.status === 'delivery' ? 'active' : ''}`}>
                        <div className="step-circle">3</div>
                        <span>세탁물 배달</span>
                      </div>
                    </div>
                  )}

                  {/* Recalculate Estimate Button (Error 4 Trigger) */}
                  {order.status !== 'cancelled' && (
                    <div className="estimate-action-box">
                      <button className="recalc-btn" onClick={handleRecalculateEstimate}>
                        ⏱️ 예상 완료 시간 다시 계산
                      </button>
                      {estimateInfo && <p className="estimate-info-lbl">{estimateInfo}</p>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast alert notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
