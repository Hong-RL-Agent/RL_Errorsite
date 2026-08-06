import React, { useState } from 'react';

export default function CustomerEditModal({ customer, onClose, onConfirm }) {
  const [phone, setPhone] = useState(customer?.phone || '');
  const [preferredStore, setPreferredStore] = useState(customer?.preferredStore || '');
  const [marketingConsent, setMarketingConsent] = useState(customer?.marketingConsent !== undefined ? customer.marketingConsent : true);

  if (!customer) return null;

  const handleSave = () => {
    onConfirm(customer.id, phone, preferredStore, marketingConsent);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>👤 고객 인적사항 및 수신 동의 수정</h3>
        <p>고객 ID: <strong style={{ color: 'var(--color-primary)' }}>{customer.id}</strong> ({customer.name})</p>

        <div className="form-group">
          <label>연락처:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>선호 매장:</label>
          <input type="text" value={preferredStore} onChange={(e) => setPreferredStore(e.target.value)} />
        </div>

        <div className="form-group">
          <label>마케팅 동의 여부:</label>
          <select value={marketingConsent ? 'true' : 'false'} onChange={(e) => setMarketingConsent(e.target.value === 'true')}>
            <option value="true">수신 동의 (AGREE)</option>
            <option value="false">수신 거부 (REJECT)</option>
          </select>
        </div>

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)', color: '#ffffff' }} onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            저장 확정
          </button>
        </div>
      </div>
    </div>
  );
}
