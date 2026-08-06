import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedCustomer,
  setSelectedCustomer,
  tiers,
  coupons,
  triggerTierCouponRace,
  triggerCancelCouponConflict,
  triggerPartialCustomerSave
}) {
  const [phone, setPhone] = useState('');
  const [preferredStore, setPreferredStore] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(true);

  useEffect(() => {
    if (selectedCustomer) {
      setPhone(selectedCustomer.phone || '');
      setPreferredStore(selectedCustomer.preferredStore || '강남 플래그십점');
      setMarketingConsent(selectedCustomer.marketingConsent !== undefined ? selectedCustomer.marketingConsent : true);
    }
  }, [selectedCustomer]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Tier & Coupon Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>👑 고객 등급 & 쿠폰 발급 관제</h3>
        {selectedCustomer ? (
          <div className="detail-panel">
            <p>고객 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedCustomer.id}</strong></p>
            <p>고객 성명: <strong>{selectedCustomer.name} 고객</strong></p>
            <p>현재 등급: <span className={`tier-badge ${selectedCustomer.tier.toLowerCase()}`}>{selectedCustomer.tier}</span></p>

            <div className="form-group">
              <label>멤버십 등급 변경 (Error 1):</label>
              <select 
                value={selectedCustomer.tier || 'BRONZE'} 
                onChange={(e) => setSelectedCustomer({ ...selectedCustomer, tier: e.target.value })}
              >
                {tiers.map(t => (
                  <option key={t.id} value={t.name}>{t.name} (상시 {t.discountRate}% 할인)</option>
                ))}
              </select>
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerTierCouponRace(selectedCustomer)}>
                등급 변경 후 즉시 쿠폰 발급 (Error 1)
              </button>
              <small className="warn-desc">* 등급 변경(3초 지연) 직후 쿠폰 발급(0.1초 완료) 시, 3초 뒤 이전 등급 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelCouponConflict(selectedCustomer)}>
                ⚡ 쿠폰 사용 취소 후 포인트 적립 (Error 2)
              </button>
              <small className="warn-desc">* 쿠폰 사용 취소(0.5초 완료) 직후 포인트 적립(4초 지연 완료) 시, 늦은 적립 요청이 취소된 쿠폰을 USED 상태로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 고객 항목을 선택하세요.</div>
        )}
      </div>

      {/* Customer Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>👤 고객 인적사항 & 마케팅 정보 (Error 8)</h3>
        {selectedCustomer ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>연락처:</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>선호 매장 (부분저장 미반영):</label>
              <input type="text" value={preferredStore} onChange={(e) => setPreferredStore(e.target.value)} />
            </div>

            <div className="form-group">
              <label>마케팅 동의 여부:</label>
              <select value={marketingConsent ? 'true' : 'false'} onChange={(e) => setMarketingConsent(e.target.value === 'true')}>
                <option value="true">수신 동의 (AGREE)</option>
                <option value="false">수신 거부 (REJECT)</option>
              </select>
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialCustomerSave(selectedCustomer.id, phone, preferredStore, marketingConsent)}
            >
              고객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 연락처/선호매장/마케팅동의를 동시에 수정하면 백엔드에는 선호매장만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 고객을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
