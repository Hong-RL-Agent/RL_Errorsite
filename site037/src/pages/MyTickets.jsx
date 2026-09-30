import React, { useState, useEffect } from 'react';
import { Ticket, Tag, CheckCircle2, Calendar, MapPin, Percent } from 'lucide-react';
import Modal from '../components/Modal';

export default function MyTickets({ showToast }) {
  const [reservations, setReservations] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedRes, setSelectedRes] = useState(null);
  const [couponCode, setCouponCode] = useState('STAGE10');
  const [applying, setApplying] = useState(false);

  const loadData = () => {
    fetch('/api/reservations')
      .then(res => res.json())
      .then(data => setReservations(data))
      .catch(err => console.error(err));

    fetch('/api/coupons')
      .then(res => res.json())
      .then(data => setCoupons(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Apply coupon handler (SEC-344 / site037-bug04)
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!selectedRes || !couponCode.trim()) return;

    setApplying(true);
    const idempotency_key = `COUPON-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/coupons/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationId: selectedRes.id,
        couponCode: couponCode.trim(),
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setApplying(false);
      setSelectedRes(null);
      loadData();
      showToast('쿠폰 할인 적용 완료', `[${couponCode}] 할인 혜택이 정상 적용되었습니다.`, 'success', data.transaction_id, data.bugId, data.secId);
    })
    .catch(err => {
      console.error(err);
      setApplying(false);
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-900)' }}>내 예매 티켓 및 할인 혜택</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>예매 확정된 공연 티켓과 할인 쿠폰 적용 내역을 확인하세요.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {reservations.map(res => (
          <div key={res.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="badge badge-confirmed">예매완료</span>
                <span style={{ fontSize: '0.84rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>#{res.id}</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '6px' }}>
                {res.performanceTitle}
              </h3>

              <div style={{ fontSize: '0.86rem', color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#7e22ce" /> {res.venue} · 좌석: <strong>{res.seat}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#7e22ce" /> 공연일시: {res.date} · 매수: {res.ticketCount}매
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: '200px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '2px' }}>
                정가 ₩{res.totalPrice.toLocaleString()} {res.discountAmount > 0 && <span style={{ color: 'var(--accent)' }}>(-₩{res.discountAmount.toLocaleString()})</span>}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
                ₩{res.finalPrice.toLocaleString()}
              </div>

              {res.appliedCoupon ? (
                <span className="badge badge-classic" style={{ fontSize: '0.76rem' }}>
                  <Tag size={12} /> 적용된 쿠폰: {res.appliedCoupon}
                </span>
              ) : (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSelectedRes(res);
                  }}
                >
                  <Percent size={14} color="#7e22ce" /> 할인쿠폰 적용
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Apply Coupon Modal (SEC-344) */}
      <Modal
        isOpen={!!selectedRes}
        onClose={() => setSelectedRes(null)}
        title={selectedRes ? `[${selectedRes.performanceTitle}] 쿠폰 적용` : '쿠폰 적용'}
      >
        <form onSubmit={handleApplyCoupon}>
          <div className="form-group">
            <label className="form-label">보유 쿠폰 선택 또는 코드 입력</label>
            <select 
              className="form-control"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              style={{ marginBottom: '10px' }}
            >
              {coupons.map(c => (
                <option key={c.id} value={c.code}>
                  [{c.code}] {c.name} ({c.discountRate}% 할인)
                </option>
              ))}
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="쿠폰 코드를 직접 입력하세요"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedRes(null)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={applying || !couponCode.trim()}>
              {applying ? '적용 중...' : '쿠폰 적용'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
