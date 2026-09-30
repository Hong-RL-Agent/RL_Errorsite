import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, AlertTriangle } from 'lucide-react';

export default function Cart({ cart = [], onUpdateQuantity, onRemoveItem, onCheckout, showToast }) {
  const [address, setAddress] = useState('서울특별시 강남구 테헤란로 152, 강남타워 14층');
  const [paymentMethod, setPaymentMethod] = useState('신용카드/간편결제');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 50000 || subtotal === 0 ? 0 : 3000;
  const total = subtotal + shippingFee;

  const handleProcessCheckout = async () => {
    if (cart.length === 0) {
      alert('장바구니가 비어 있습니다.');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryAddress: address,
          paymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        onCheckout();
        showToast(
          `주문 및 결제가 완료되었습니다! (결제금액: ${data.order.chargedAmount.toLocaleString()}원)`,
          data.bugId || 'site042-bug05',
          data.secId || 'SEC-395'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">장바구니 & 주문 결제</h2>
          <p className="section-subtitle">선택하신 피트니스 용품을 확인하고 안전하게 주문하세요.</p>
        </div>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0' }}>
          <ShoppingBag size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>장바구니가 비어 있습니다</h3>
          <p style={{ fontSize: 14, color: '#64748b' }}>피트니스 스토어에서 필요한 홈트 용품을 담아보세요.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 32 }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  padding: 20,
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center'
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#064e3b', marginBottom: 8 }}>
                    {item.price.toLocaleString()}원
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8 }}>
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        style={{ padding: '2px 8px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ padding: '2px 10px', fontSize: 13, fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        style={{ padding: '2px 8px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 8 }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Box */}
          <div style={{ background: '#ffffff', padding: 28, borderRadius: 20, border: '1px solid #e2e8f0', height: 'fit-content' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
              주문 요약
            </h3>

            <div className="form-group">
              <label className="form-label">배송지 주소</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">결제 수단</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="신용카드/간편결제">신용카드 / 카카오페이 / 네이버페이</option>
                <option value="FitFlow 포인트">FitFlow 웰니스 포인트 결제</option>
                <option value="무통장입금">실시간 계좌이체</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                <span>상품 금액</span>
                <span>{subtotal.toLocaleString()}원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 12 }}>
                <span>배송비</span>
                <span>{shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#064e3b', borderTop: '1px dashed #cbd5e1', paddingTop: 12, marginBottom: 24 }}>
                <span>최종 결제 금액</span>
                <span>{total.toLocaleString()}원</span>
              </div>

              <button
                className="btn-lime"
                onClick={handleProcessCheckout}
                disabled={isProcessing}
                style={{ width: '100%', padding: '14px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <CreditCard size={18} />
                {isProcessing ? '결제 승인 처리 중...' : `${total.toLocaleString()}원 바로 결제하기`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
