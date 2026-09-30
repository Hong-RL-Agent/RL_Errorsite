import React, { useEffect, useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Tag, AlertCircle } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Cart({ cart, onUpdateCart, onNavigateCheckout, onContinueShopping }) {
  const [coupons, setCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const data = await fetchApi('/api/coupons');
      setCoupons(data.coupons || []);
      if (cart.appliedCoupon) {
        setSelectedCouponId(cart.appliedCoupon.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty <= 0) return;
    setLoading(true);
    try {
      const data = await fetchApi(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: newQty })
      });
      onUpdateCart(data.cart);
    } catch (err) {
      showToast('오류', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    setLoading(true);
    try {
      const data = await fetchApi(`/api/cart/items/${itemId}`, {
        method: 'DELETE'
      });
      onUpdateCart(data.cart);
      showToast('삭제 완료', '선택하신 상품이 장바구니에서 삭제되었습니다.', 'info');
    } catch (err) {
      showToast('오류', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    const couponId = e.target.value;
    setSelectedCouponId(couponId);
    try {
      const data = await fetchApi('/api/coupons/apply', {
        method: 'POST',
        body: JSON.stringify({ couponId: couponId || null })
      });
      onUpdateCart(data.cart);
      if (couponId) {
        showToast('쿠폰 적용', '쿠폰 할인이 정상 적용되었습니다.', 'success');
      } else {
        showToast('쿠폰 해제', '쿠폰 적용이 취소되었습니다.', 'info');
      }
    } catch (err) {
      showToast('오류', err.message, 'error');
    }
  };

  const freeShipThreshold = cart.freeShippingThreshold || 40000;
  const itemsTotal = cart.itemsTotal || 0;
  const remainingForFreeShip = Math.max(0, freeShipThreshold - itemsTotal);
  const progressPercent = Math.min(100, Math.round((itemsTotal / freeShipThreshold) * 100));

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="main-wrapper">
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShoppingBag size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>장바구니에 담긴 상품이 없습니다</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>신선한 제철 채소와 과일, 맛있는 식재료를 채워보세요.</p>
          <button className="primary-btn" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={onContinueShopping}>
            쇼핑 계속하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>장바구니 ({cart.items.length})</h1>

      <div className="two-col-layout">
        {/* Left: Cart Items List */}
        <div>
          {/* Free Shipping Meter */}
          <div className="free-ship-meter">
            <div className="free-ship-text">
              {remainingForFreeShip === 0 ? (
                <span>🎉 축하합니다! 무료배송 혜택이 적용되었습니다.</span>
              ) : (
                <span>{remainingForFreeShip.toLocaleString()}원 더 담으면 <strong>무료배송</strong> 혜택!</span>
              )}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="card-box">
            <div className="card-box-title">
              <span>주문 상품 목록</span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>총 {cart.itemsCount}개</span>
            </div>

            <div>
              {cart.items.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <img src={item.product?.image} alt={item.product?.name} className="cart-item-img" />

                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{item.product?.category}</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                      {item.product?.name}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>
                      {item.price.toLocaleString()}원
                    </div>
                    {item.product?.stock <= 5 && (
                      <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
                        (재고: {item.product?.stock}개)
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                      disabled={loading || item.quantity <= 1}
                    >-</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                      disabled={loading}
                    >+</button>
                  </div>

                  {/* Delete Item */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                      {(item.price * item.quantity).toLocaleString()}원
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      style={{ color: '#94a3b8', padding: '4px' }}
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Selector */}
          <div className="card-box">
            <div className="card-box-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={18} color="#10b981" />
                <span>할인 쿠폰 적용</span>
              </div>
            </div>

            <select
              value={selectedCouponId}
              onChange={handleApplyCoupon}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                background: 'white'
              }}
            >
              <option value="">적용 안 함</option>
              {coupons.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (-{c.discountAmount.toLocaleString()}원)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Payment Summary Sidebar */}
        <div>
          <div className="card-box" style={{ position: 'sticky', top: '100px' }}>
            <div className="card-box-title">결제 예정 금액</div>

            <div className="summary-row">
              <span>상품 총 금액</span>
              <span style={{ fontWeight: 700 }}>{itemsTotal.toLocaleString()}원</span>
            </div>

            <div className="summary-row">
              <span>배송비</span>
              <span style={{ fontWeight: 700, color: cart.shippingFee === 0 ? '#10b981' : '#1e293b' }}>
                {cart.shippingFee === 0 ? '무료' : `+${cart.shippingFee.toLocaleString()}원`}
              </span>
            </div>

            {cart.discountAmount > 0 && (
              <div className="summary-row">
                <span>쿠폰 할인금액</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>
                  -{cart.discountAmount.toLocaleString()}원
                </span>
              </div>
            )}

            <div className="summary-row total">
              <span>최종 결제 금액</span>
              <span style={{ color: '#059669' }}>{cart.finalTotal.toLocaleString()}원</span>
            </div>

            <button
              className="primary-btn"
              style={{ marginTop: '20px' }}
              onClick={onNavigateCheckout}
            >
              <span>{cart.finalTotal.toLocaleString()}원 주문서 작성</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
