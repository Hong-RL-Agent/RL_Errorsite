import React, { useState } from 'react';
import { CreditCard, Tag, Check, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Checkout({
  items = [],
  coupons = [],
  onCompleteOrder,
  showToast
}) {
  const [selectedCoupons, setSelectedCoupons] = useState(['WELCOME10', 'FURNITURE20']); // Pre-check multi non-stackable coupons (SEC-396)
  const [address, setAddress] = useState('서울특별시 서초구 반포대로 201, 래미안 파크 104동 1202호');
  const [paymentMethod, setPaymentMethod] = useState('신용카드/간편결제');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount based on selected coupons
  let totalDiscount = 0;
  selectedCoupons.forEach((cId) => {
    const cp = coupons.find((c) => c.id === cId);
    if (cp) {
      if (cp.type === 'percent') totalDiscount += Math.round((subtotal * cp.discount) / 100);
      else if (cp.type === 'amount') totalDiscount += cp.discount;
    }
  });

  const finalPrice = Math.max(0, subtotal - totalDiscount);

  const handleToggleCoupon = (couponId) => {
    if (selectedCoupons.includes(couponId)) {
      setSelectedCoupons(selectedCoupons.filter((c) => c !== couponId));
    } else {
      setSelectedCoupons([...selectedCoupons, couponId]);
    }
  };

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponIds: selectedCoupons,
          deliveryAddress: address,
          paymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        onCompleteOrder(data.order);
        showToast(
          `주문이 성공적으로 완료되었습니다! (주문번호: ${data.order.id})`,
          data.bugId || 'site043-bug01',
          data.secId || 'SEC-396'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>주문서 작성 & 결제</h2>
          <p>배송지 정보와 적용 가능한 혜택 쿠폰을 확인해주세요.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 36 }}>
        {/* Left Column: Delivery & Coupons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Order Items Summary */}
          <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, border: '1px solid #e9e3da' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1f1d1a', marginBottom: 16 }}>
              주문 상품 정보 ({items.length}건)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item) => (
                <div key={item.id || item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img src={item.image} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1f1d1a' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#6b645b' }}>{item.color} · {item.quantity}개</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#855b32' }}>
                    {(item.price * item.quantity).toLocaleString()}원
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, border: '1px solid #e9e3da' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1f1d1a', marginBottom: 16 }}>
              가구 안전 배송지
            </h3>
            <div className="form-group">
              <label className="form-label">받으실 주소</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Multi-Coupon Selector (SEC-396) */}
          <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, border: '1px solid #e9e3da' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1f1d1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag size={18} color="#855b32" />
              할인 쿠폰 중복 선택 적용
            </h3>
            <p style={{ fontSize: 13, color: '#6b645b', marginBottom: 16 }}>
              사용 가능한 할인 쿠폰을 복수 선택하여 중복 혜택을 확인하세요.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {coupons.map((cp) => {
                const isChecked = selectedCoupons.includes(cp.id);
                return (
                  <div
                    key={cp.id}
                    onClick={() => handleToggleCoupon(cp.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: isChecked ? '2px solid #855b32' : '1px solid #e9e3da',
                      background: isChecked ? '#fbf5ee' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1f1d1a' }}>{cp.name}</div>
                      <div style={{ fontSize: 12, color: '#6b645b' }}>
                        {cp.type === 'percent' ? `${cp.discount}% 할인` : `${cp.discount.toLocaleString()}원 할인`} (최소주문 {cp.minOrder.toLocaleString()}원)
                      </div>
                    </div>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: isChecked ? '2px solid #855b32' : '2px solid #c9c0b3',
                        background: isChecked ? '#855b32' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}
                    >
                      {isChecked && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div style={{ background: '#ffffff', padding: 28, borderRadius: 20, border: '1px solid #e9e3da', height: 'fit-content' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1f1d1a', marginBottom: 20 }}>
            최종 결제 금액
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b645b', marginBottom: 10 }}>
            <span>총 상품 금액</span>
            <span>{subtotal.toLocaleString()}원</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#855b32', fontWeight: 700, marginBottom: 10 }}>
            <span>쿠폰 할인 금액 ({selectedCoupons.length}개 적용)</span>
            <span>-{totalDiscount.toLocaleString()}원</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b645b', marginBottom: 16 }}>
            <span>배송비</span>
            <span style={{ color: '#5b6b4e', fontWeight: 700 }}>0원 (무료배송)</span>
          </div>

          <div style={{ borderTop: '1px solid #e9e3da', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 800, color: '#1f1d1a', marginBottom: 24 }}>
            <span>총 결제 금액</span>
            <span style={{ color: '#855b32' }}>{finalPrice.toLocaleString()}원</span>
          </div>

          <button
            className="hero-btn"
            onClick={handlePay}
            disabled={isProcessing}
            style={{ width: '100%', justifyContent: 'center', padding: '15px' }}
          >
            <CreditCard size={18} />
            {isProcessing ? '주문 결제 승인 중...' : `${finalPrice.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
}
