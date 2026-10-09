import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  MapPin, 
  Tag, 
  CreditCard, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function CheckoutFlow({
  cartItems,
  summary,
  coupons,
  shippingOptions,
  addresses,
  selectedShippingOptionId,
  selectedAddressId,
  onUpdateCartQty,
  onRemoveCartItem,
  onSelectShippingOption,
  onSelectAddress,
  onApplyCoupon,
  onPlaceOrder,
  isPlacingOrder
}) {
  const [selectedCouponCode, setSelectedCouponCode] = useState('');

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (selectedCouponCode) {
      onApplyCoupon(selectedCouponCode);
    }
  };

  const formatCurrency = (val, isRawFloat = false) => {
    if (val === undefined || val === null) return '0원';
    if (typeof val === 'number') {
      // If it's not an integer (floating point precision error C-05-652), render raw precision
      if (!Number.isInteger(val)) {
        return `${val}원`;
      }
      return `${val.toLocaleString()}원`;
    }
    return `${val}원`;
  };

  return (
    <div className="checkout-layout">
      {/* Left Column: Multi-Step Sequential Checkout Flow */}
      <div className="checkout-main-flow">
        {/* Step 1: Cart Items */}
        <div className="flow-card">
          <div className="flow-card-header">
            <span className="flow-step-num">1</span>
            <h3 className="flow-card-title">주문 상품 확인 (Cart Bag)</h3>
          </div>

          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              장바구니가 비어 있습니다.
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div
                  key={item.item_id || item.product_id}
                  className="cart-item-row"
                  data-product-id={item.product_id}
                >
                  <div className="cart-item-info">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="cart-item-img"
                    />
                    <div>
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-unit-price">
                        단가: {item.unit_price.toLocaleString()}원 (재고: {item.stock}개)
                      </div>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-stepper">
                      <button
                        className="stepper-btn"
                        onClick={() => onUpdateCartQty(item.item_id, item.quantity - 1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="stepper-val" data-role="quantity">
                        {item.quantity}
                      </span>
                      <button
                        className="stepper-btn"
                        onClick={() => onUpdateCartQty(item.item_id, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="cart-item-total" data-role="price">
                      {(item.quantity * item.unit_price).toLocaleString()}원
                    </div>

                    <button
                      className="stepper-btn"
                      onClick={() => onRemoveCartItem(item.item_id)}
                      style={{ color: 'var(--rose-accent)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Shipping Destination */}
        <div className="flow-card">
          <div className="flow-card-header">
            <span className="flow-step-num">2</span>
            <h3 className="flow-card-title">배송지 정보 (Shipping Destination)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  className={`shipping-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectAddress(addr.id)}
                >
                  <div className="shipping-radio-wrap">
                    <MapPin size={18} color={isSelected ? 'var(--gold-accent)' : 'var(--text-muted)'} />
                    <div>
                      <div className="shipping-option-name">
                        {addr.recipient} ({addr.phone}) {addr.is_default ? '· [기본 배송지]' : ''}
                      </div>
                      <div className="shipping-option-desc">
                        {addr.address} {addr.address_detail}
                      </div>
                    </div>
                  </div>
                  {isSelected && <CheckCircle size={18} color="var(--gold-accent)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Delivery Options (BUG-627 Trigger) */}
        <div className="flow-card">
          <div className="flow-card-header">
            <span className="flow-step-num">3</span>
            <h3 className="flow-card-title">배송 방법 선택 (Delivery Option)</h3>
          </div>

          <div className="shipping-options-grid">
            {shippingOptions.map((opt) => {
              const isSelected = selectedShippingOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`shipping-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectShippingOption(opt.id)}
                  data-shipping-option-id={opt.id}
                >
                  <div className="shipping-radio-wrap">
                    <Truck size={18} color={isSelected ? 'var(--gold-accent)' : 'var(--text-muted)'} />
                    <div>
                      <div className="shipping-option-name">{opt.name}</div>
                      <div className="shipping-option-desc">{opt.description} ({opt.estimated_days})</div>
                    </div>
                  </div>
                  <div className="shipping-fee-pill">
                    {opt.fee === 0 ? '무료' : `+${opt.fee.toLocaleString()}원`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Coupon Discount (BUG-011, BUG-013, BUG-652) */}
        <div className="flow-card">
          <div className="flow-card-header">
            <span className="flow-step-num">4</span>
            <h3 className="flow-card-title">쿠폰 혜택 적용 (Coupons)</h3>
          </div>

          <form onSubmit={handleCouponSubmit} className="coupon-input-wrap">
            <select
              className="coupon-select"
              value={selectedCouponCode}
              onChange={(e) => setSelectedCouponCode(e.target.value)}
            >
              <option value="">적용할 쿠폰을 선택해 주세요</option>
              {coupons.map((c) => (
                <option key={c.id} value={c.code}>
                  [{c.code}] {c.name} ({c.type === 'FIXED' ? `${c.amount.toLocaleString()}원 할인` : `${c.amount}% 할인`})
                </option>
              ))}
            </select>
            <button type="submit" className="btn-apply-coupon">
              쿠폰 적용
            </button>
          </form>

          {summary.appliedCouponCodes && summary.appliedCouponCodes.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {summary.appliedCouponCodes.map((code, idx) => (
                <span key={idx} className="stock-tag" style={{ position: 'static' }}>
                  적용 쿠폰: {code}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Sticky Order Summary */}
      <div className="order-summary-card">
        <h3 className="summary-title">Order Summary</h3>

        <div className="summary-rows">
          <div className="summary-row">
            <span>상품 금액</span>
            <span data-role="subtotal">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>

          <div className="summary-row discount-row">
            <span>쿠폰 할인</span>
            <span data-role="discount">
              -{formatCurrency(summary.discount)}
            </span>
          </div>

          <div className="summary-row">
            <span>배송비</span>
            <span data-role="shipping-fee">
              {formatCurrency(summary.shippingFee)}
            </span>
          </div>

          <div className="summary-row">
            <span>세금 (VAT 10%)</span>
            <span data-role="tax">
              {formatCurrency(summary.tax)}
            </span>
          </div>
        </div>

        <div className="summary-divider" />

        <div className="total-row">
          <span className="total-label">최종 결제 금액</span>
          {/* C-05-013 & C-05-652 rendered directly */}
          <span className="total-amount" data-role="total">
            {typeof summary.total === 'number' && !Number.isInteger(summary.total)
              ? `${summary.total}원`
              : `${summary.total?.toLocaleString()}원`}
          </span>
        </div>

        <button
          className="btn-place-order"
          onClick={onPlaceOrder}
          disabled={isPlacingOrder || cartItems.length === 0}
        >
          <CreditCard size={18} />
          <span>{isPlacingOrder ? '결제 승인 중...' : '주문 결제하기 (Place Order)'}</span>
        </button>
      </div>
    </div>
  );
}
