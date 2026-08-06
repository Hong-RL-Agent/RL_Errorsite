import React, { useState } from 'react';

export default function CustomerEditModal({ customer, onClose, onConfirm }) {
  const [phone, setPhone] = useState(customer?.phone || '');
  const [tier, setTier] = useState(customer?.tier || 'VIP');
  const [recentInquiry, setRecentInquiry] = useState(customer?.recentInquiry || '');

  if (!customer) return null;

  const handleSave = () => {
    onConfirm(customer.id, phone, tier, recentInquiry);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>👤 고객 인적 정보 및 등급 수정</h3>
        <p>고객 ID: <strong style={{ color: 'var(--color-primary)' }}>{customer.id}</strong> ({customer.name})</p>

        <div className="form-group">
          <label>연락처:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>고객 등급:</label>
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="VIP">VIP (최우수)</option>
            <option value="GOLD">GOLD (우수)</option>
            <option value="SILVER">SILVER (일반)</option>
            <option value="BRONZE">BRONZE (신규)</option>
          </select>
        </div>

        <div className="form-group">
          <label>최근 문의 요약:</label>
          <input type="text" value={recentInquiry} onChange={(e) => setRecentInquiry(e.target.value)} />
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
