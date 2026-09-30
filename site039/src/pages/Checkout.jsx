import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Truck } from 'lucide-react';

export default function Checkout({ onNavigate, onShowToast }) {
  const [recipient, setRecipient] = useState('김서연');
  const [phone, setPhone] = useState('010-9876-5432');
  const [address, setAddress] = useState('서울특별시 마포구 독막로 12길 8, 302호');
  const [paymentMethod, setPaymentMethod] = useState('간편결제');
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        setCartItems(data.items || []);
        setTotalAmount(data.total || 0);
      })
      .catch(console.error);
  }, []);

  // SEC-369: Checkout Payment Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/checkout/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          phone,
          address,
          paymentMethod,
          items: cartItems
        })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast({
          title: '주문 및 결제 처리 완료',
          message: `주문번호 [${data.order?.orderNumber}] 결제가 성공적으로 접수되었습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
        onNavigate('orders');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">주문서 작성 및 결제</h1>
          <p className="page-subtitle">배송지 정보와 결제 수단을 확인 후 결제를 진행하세요.</p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid-layout grid-2" style={{ gridTemplateColumns: '1fr 380px', alignItems: 'flex-start' }}>
          {/* Shipping & Payment Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Delivery Info */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="var(--primary)" /> 배송지 정보 입력
              </h3>

              <div className="grid-layout grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">받는 분 성명 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">연락처 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">배송지 주소 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="var(--primary)" /> 결제 수단 선택
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {['간편결제 (DailyPay)', '신용/체크카드', '무통장 입금'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`btn ${paymentMethod === m ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', height: '44px', fontSize: '13px' }}
                    onClick={() => setPaymentMethod(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Card (SEC-369 Action) */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>주문 요약</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              {cartItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-main)' }}>{item.name} x {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₩{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, paddingTop: '14px', borderTop: '1px solid var(--border)', marginBottom: '20px' }}>
              <span>최종 결제 금액</span>
              <span style={{ color: 'var(--primary)' }}>₩{totalAmount.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '15px' }}
            >
              ₩{totalAmount.toLocaleString()} 결제하기
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
