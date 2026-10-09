import React, { useState } from 'react';
import { 
  MapPin, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  Bike, 
  AlertTriangle, 
  CheckCircle2, 
  CreditCard,
  FileText
} from 'lucide-react';

export default function CheckoutView({
  cartItems,
  summary,
  coupons,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onUpdateCartQty,
  onRemoveCartItem,
  onApplyCoupon,
  onSetRiderTip,
  onCancelRiderTip,
  onPlaceOrder,
  isSubmittingOrder
}) {
  const [selectedCouponCode, setSelectedCouponCode] = useState('');
  const [uiRiderTip, setUiRiderTip] = useState(0); // Optimistic UI state for BUG-1822

  const handleCouponChange = (code) => {
    setSelectedCouponCode(code);
    onApplyCoupon(code);
  };

  const handleTipClick = async (amount) => {
    if (amount === 0) {
      // Optimistically set UI to 0
      setUiRiderTip(0);
      // BUG-1822: Call backend cancel endpoint which returns 500 error!
      await onCancelRiderTip();
    } else {
      setUiRiderTip(amount);
      await onSetRiderTip(amount);
    }
  };

  const minOrderSatisfied = summary.minimumOrderSatisfied;

  return (
    <div className="checkout-grid">
      {/* Left Column: Order details & inputs */}
      <div>
        {/* Minimum Order Warning Bar (BUG-423) */}
        {!minOrderSatisfied && (
          <div className="min-order-alert-box">
            <AlertTriangle size={20} />
            <div>
              <strong>최소주문금액을 충족해주세요.</strong>
              <div style={{ fontSize: 12, marginTop: 2 }}>
                최소 주문금액은 <span data-role="minimum-order">{summary.minimumOrderAmount?.toLocaleString()}원</span>입니다. (현재 주문금액: <span data-role="current-order">{summary.subtotal?.toLocaleString()}원</span>)
              </div>
            </div>
          </div>
        )}

        {/* 1. Delivery Address (BUG-604) */}
        <div className="checkout-section-card">
          <div className="checkout-section-title">
            <MapPin size={18} color="var(--coral-primary)" />
            <span>배달 주소 (Delivery Address)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {addresses.map((addr) => {
              const isSelected = (selectedAddressId || summary.selectedAddress?.id) === addr.id;
              return (
                <div
                  key={addr.id}
                  className={`option-choice-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectAddress(addr.id)}
                  data-address-id={addr.id}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      {addr.recipient} ({addr.phone}) {addr.is_default ? '· [기본 주소]' : ''}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {addr.address} {addr.address_detail} (직선거리: {addr.distance_meters}m)
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={18} color="var(--coral-primary)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Cart Items with Option details (BUG-622) */}
        <div className="checkout-section-card">
          <div className="checkout-section-title">
            <FileText size={18} color="var(--coral-primary)" />
            <span>주문 메뉴 확인 (Cart Items)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cartItems.map((item) => (
              <div
                key={item.item_id}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: 16
                }}
                data-role="menu-item"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }} data-role="menu-name">
                      {item.menu_name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--coral-primary)', fontFamily: 'var(--font-mono)', marginTop: 2 }} data-role="menu-price">
                      {item.unit_price?.toLocaleString()}원
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 6 }}>
                      <button
                        onClick={() => onUpdateCartQty(item.item_id, item.quantity - 1)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', width: 28, height: 28, cursor: 'pointer' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ padding: '0 8px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateCartQty(item.item_id, item.quantity + 1)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', width: 28, height: 28, cursor: 'pointer' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveCartItem(item.item_id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--rose-accent)', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Option Badges (Rendered in DOM, but cost ghosted from subtotal in BUG-622) */}
                {item.options && item.options.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.options.map((opt) => (
                      <span
                        key={opt.id}
                        style={{
                          background: 'rgba(255, 87, 34, 0.1)',
                          border: '1px solid rgba(255, 87, 34, 0.3)',
                          color: '#ff7043',
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 6
                        }}
                      >
                        선택 옵션: {opt.option_name} (+{opt.option_price?.toLocaleString()}원)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Coupons (BUG-423 Trigger) */}
        <div className="checkout-section-card">
          <div className="checkout-section-title">
            <Tag size={18} color="var(--coral-primary)" />
            <span>쿠폰 할인 적용 (Coupons)</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <select
              value={selectedCouponCode}
              onChange={(e) => handleCouponChange(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#fff',
                fontSize: 13.5,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">적용할 쿠폰을 선택해 주세요</option>
              {coupons.map((c) => (
                <option key={c.id} value={c.code}>
                  [{c.code}] {c.name} ({c.discount?.toLocaleString()}원 할인)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Rider Tip (BUG-1822) */}
        <div className="checkout-section-card">
          <div className="checkout-section-title">
            <Bike size={18} color="var(--coral-primary)" />
            <span>라이더 추가 팁 (Rider Tip)</span>
          </div>

          <div className="rider-tip-grid">
            <button
              className={`rider-tip-btn ${uiRiderTip === 0 ? 'active' : ''}`}
              onClick={() => handleTipClick(0)}
            >
              없음 (0원)
            </button>
            <button
              className={`rider-tip-btn ${uiRiderTip === 1000 ? 'active' : ''}`}
              onClick={() => handleTipClick(1000)}
            >
              +1,000원
            </button>
            <button
              className={`rider-tip-btn ${uiRiderTip === 2000 ? 'active' : ''}`}
              onClick={() => handleTipClick(2000)}
            >
              +2,000원
            </button>
            <button
              className={`rider-tip-btn ${uiRiderTip === 3000 ? 'active' : ''}`}
              onClick={() => handleTipClick(3000)}
            >
              +3,000원
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Checkout Summary Sticky Card */}
      <div className="checkout-summary-card">
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
          결제 금액 요약
        </h3>

        <div className="summary-calc-row">
          <span>총 상품 금액</span>
          <span data-role="subtotal">
            {summary.subtotal?.toLocaleString()}원
          </span>
        </div>

        <div className="summary-calc-row discount-color">
          <span>쿠폰 할인</span>
          <span data-role="discount">
            -{summary.discount?.toLocaleString()}원
          </span>
        </div>

        <div className="summary-calc-row">
          <span>배달팁</span>
          {/* BUG-604 Delivery tip distance calculation */}
          <span data-role="delivery-fee">
            {summary.deliveryFee?.toLocaleString()}원
          </span>
        </div>

        <div className="summary-calc-row">
          <span>라이더 추가 팁</span>
          {/* BUG-1822: UI renders uiRiderTip (0원) optimistically */}
          <span data-role="rider-tip">
            {uiRiderTip === 0 ? '0원' : `+${uiRiderTip.toLocaleString()}원`}
          </span>
        </div>

        <div className="final-amount-row">
          <span className="final-amount-label">최종 결제 금액</span>
          <span className="final-amount-val" data-role="final-amount">
            {(Math.max(0, (summary.subtotal || 0) - (summary.discount || 0)) + (summary.deliveryFee || 0) + uiRiderTip).toLocaleString()}원
          </span>
        </div>

        <button
          className="btn-checkout-submit"
          onClick={onPlaceOrder}
          disabled={!minOrderSatisfied || cartItems.length === 0 || isSubmittingOrder}
        >
          <CreditCard size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          <span>{isSubmittingOrder ? '주문 처리 중...' : '결제하기 (Place Order)'}</span>
        </button>
      </div>
    </div>
  );
}
