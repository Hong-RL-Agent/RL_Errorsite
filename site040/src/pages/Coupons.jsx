import React, { useState, useEffect } from 'react';
import { Ticket, CheckCircle2, AlertCircle, Percent, ArrowRight } from 'lucide-react';

export default function Coupons({ onShowToast }) {
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('CLASS10');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    fetch('/api/coupons')
      .then(res => res.json())
      .then(data => setCoupons(data))
      .catch(console.error);
  }, []);

  // SEC-374: Coupon Apply Trigger
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          coursePrice: 189000
        })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data);
        onShowToast({
          title: '쿠폰 코드 적용 완료',
          message: data.message,
          type: data.valid ? 'success' : 'error',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">수강 할인 쿠폰 & 혜택</h1>
          <p className="page-subtitle">보유하신 쿠폰 코드를 입력하여 수강료 할인을 적용해보세요.</p>
        </div>
      </div>

      <div className="grid-layout grid-2" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
        {/* SEC-374: Coupon Apply Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={18} color="var(--primary)" /> 쿠폰 코드 입력 & 검증
          </h3>

          <form onSubmit={handleApplyCoupon}>
            <div className="form-group">
              <label className="form-label">쿠폰 코드 입력 *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: CLASS10, DEV30000"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  쿠폰 적용
                </button>
              </div>
            </div>
          </form>

          {appliedCoupon && (
            <div style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: appliedCoupon.valid ? '#ecfdf5' : '#fff1f2',
              border: `1px solid ${appliedCoupon.valid ? '#a7f3d0' : '#fecdd3'}`,
              fontSize: '13px',
              color: appliedCoupon.valid ? '#065f46' : '#9f1239'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                {appliedCoupon.valid ? '✓ 쿠폰 적용 성공' : '⚠ 쿠폰 적용 실패'}
              </div>
              <div>{appliedCoupon.message}</div>
              {appliedCoupon.valid && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', fontWeight: 700 }}>
                  할인 적용 예상 금액: ₩{appliedCoupon.finalPrice?.toLocaleString()} (할인: -₩{appliedCoupon.discountAmount?.toLocaleString()})
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coupon Wallet List */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
            사용 가능한 추천 쿠폰 ({coupons.length}장)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {coupons.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '14px 16px',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span className="badge badge-blue">{c.code}</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{c.title}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    최소 주문 금액: ₩{c.minAmount.toLocaleString()} / 유효기간: ~{c.validUntil}
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setCouponCode(c.code);
                  }}
                >
                  코드 선택
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
