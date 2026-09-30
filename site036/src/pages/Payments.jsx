import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Lock, ArrowRight, History } from 'lucide-react';

export default function Payments({ showToast }) {
  const [payments, setPayments] = useState([]);
  const [orderId, setOrderId] = useState('order-501');
  const [amount, setAmount] = useState(59000);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [loading, setLoading] = useState(false);

  const loadPayments = () => {
    fetch('/api/payments')
      .then(res => res.json())
      .then(data => setPayments(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setLoading(true);
    const idempotency_key = `PAYMENT-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount: Number(amount),
        paymentMethod,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      loadPayments();
      showToast(
        '결제 승인 완료', 
        `₩${Number(amount).toLocaleString()}원 결제가 정상 승인되었습니다.`, 
        'success', 
        data.transaction_id
      );
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '36px' }}>
        {/* Payment Form (SEC-339) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title"><CreditCard size={18} color="#4f46e5" /> 안전 구독 결제</h3>
              <p className="card-subtitle">WorkNest Team Pro 플랜 구독 결제를 진행합니다.</p>
            </div>
            <Lock size={16} color="#10b981" />
          </div>

          <form onSubmit={handleProcessPayment}>
            <div className="form-group">
              <label className="form-label">주문 번호</label>
              <input
                type="text"
                className="form-control"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">결제 금액 (KRW)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">결제 수단</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setPaymentMethod('card')}
                >
                  신용/체크카드
                </button>
                <button
                  type="button"
                  className={`btn ${paymentMethod === 'transfer' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  실시간 계좌이체
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">카드 번호</label>
              <input
                type="text"
                className="form-control"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                placeholder="0000 0000 0000 0000"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">유효기간</label>
                <input
                  type="text"
                  className="form-control"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                />
              </div>
              <div className="form-group">
                <label className="form-label">CVC</label>
                <input
                  type="password"
                  className="form-control"
                  defaultValue="892"
                  maxLength="3"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? '승인 처리 중...' : `₩${Number(amount).toLocaleString()}원 결제하기`}
            </button>
          </form>
        </div>

        {/* Plan Overview Info */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>구독 혜택 안내</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem', color: 'var(--navy-800)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" /> 워크스페이스 무제한 멤버 초대
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" /> 1TB 안전 클라우드 자산 스토리지
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" /> 프로젝트 무제한 생성 및 Kanban/Gantt
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" /> 전담 기술 지원 및 월간 리포트
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '4px' }}>
              자동 결제 및 환불 규정
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', lineHeight: 1.4 }}>
              결제일로부터 7일 이내에 미사용 시 100% 전액 환불이 가능하며, 구독 해지는 설정 메뉴에서 언제든 가능합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title"><History size={18} color="#6366f1" /> 결제 승인 및 청구 내역</h3>
            <p className="card-subtitle">발행된 결제 영수증 및 트랜잭션 기록</p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>결제 ID</th>
                <th>주문 번호</th>
                <th>결제 승인 번호 (Ref)</th>
                <th>금액</th>
                <th>결제 수단</th>
                <th>상태</th>
                <th>일시</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.id}</td>
                  <td>{p.orderId}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
                    {p.transaction_id}
                  </td>
                  <td style={{ fontWeight: 700 }}>₩{Number(p.amount).toLocaleString()}</td>
                  <td>{p.paymentMethod === 'card' ? '신용카드' : '계좌이체'}</td>
                  <td><span className="badge badge-success">승인완료</span></td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
