import React, { useState } from 'react';

export default function OrgEditModal({ org, onClose, onConfirm }) {
  const [name, setName] = useState(org?.name || '');
  const [billingEmail, setBillingEmail] = useState(org?.billingEmail || '');
  const [bizRegNo, setBizRegNo] = useState(org?.bizRegNo || '');

  if (!org) return null;

  const handleSave = () => {
    onConfirm(org.id, name, billingEmail, bizRegNo);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🏢 조직 기본 결제 정보 수정</h3>
        <p>조직 ID: <strong style={{ color: 'var(--color-primary)' }}>{org.id}</strong> ({org.name})</p>

        <div className="form-group">
          <label>조직명:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>청구 이메일:</label>
          <input type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <label>사업자 등록번호:</label>
          <input type="text" value={bizRegNo} onChange={(e) => setBizRegNo(e.target.value)} />
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
