import React, { useState, useEffect } from 'react';
import { CreditCard, Tag, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Billing({ subscription, showToast }) {
  const [history, setHistory] = useState([]);
  const [couponCode, setCouponCode] = useState('MONTHLY20');
  const [isRenewing, setIsRenewing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/billing/history');
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Trigger Renewal (SEC-409: expired coupon applied on renewal)
  const handleRenewBilling = async () => {
    setIsRenewing(true);
    try {
      const res = await fetch('/api/billing/renew', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(
          data.message,
          data.bugId || 'site045-SEC-409',
          data.secId || 'SEC-409'
        );
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRenewing(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
      } else {
        showToast(data.message, null, null, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>결제 관리 & 청구 내역</h2>
          <p>등록된 결제 수단, 정기 결제 주기 및 할인 쿠폰을 관리합니다.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28, marginBottom: 36 }}>
        {/* Payment Method & Renewal Trigger */}
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={18} color="#6366f1" /> 기본 결제 수단
          </h3>

          <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>현대카드 M Edition</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>•••• 4821 (유효기간: 08/29)</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#e0e7ff', color: '#4338ca' }}>
              기본 카드
            </span>
          </div>

          {/* Renewal Test Action (SEC-409) */}
          <button
            onClick={handleRenewBilling}
            className="btn-primary"
            disabled={isRenewing}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <RefreshCw size={15} />
            {isRenewing ? '갱신 결제 처리 중...' : '정기 구독 갱신 결제 실행하기'}
          </button>
        </div>

        {/* Coupon Registration */}
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={18} color="#10b981" /> 멤버십 할인 쿠폰 등록
          </h3>

          <form onSubmit={handleApplyCoupon}>
            <div className="form-group">
              <label className="form-label">쿠폰 코드 입력</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="form-input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="쿠폰 코드 입력"
                />
                <button
                  type="submit"
                  style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  쿠폰 등록
                </button>
              </div>
            </div>
          </form>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            등록된 쿠폰은 다음 정기 결제 갱신 시 자동 차감 적용됩니다.
          </p>
        </div>
      </div>

      {/* Billing History Table */}
      <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
          청구 및 결제 내역 ({history.length}건)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid #f1f5f9',
                background: '#f8fafc',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{item.planName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{item.date} · {item.method}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#6366f1' }}>{item.amount.toLocaleString()}원</div>
                {item.originalAmount > item.amount && (
                  <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                    ({(item.originalAmount - item.amount).toLocaleString()}원 할인 적용됨)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
