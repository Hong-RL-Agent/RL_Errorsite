import React, { useState } from 'react';

export default function PolicyholderEditModal({ policyholder, onClose, onConfirm }) {
  const [address, setAddress] = useState(policyholder?.address || '');
  const [phone, setPhone] = useState(policyholder?.phone || '');
  const [bankAccount, setBankAccount] = useState(policyholder?.bankAccount || '');

  if (!policyholder) return null;

  const handleSave = () => {
    onConfirm(policyholder.id, address, phone, bankAccount);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>👤 가입자 주소, 연락처 및 계좌번호 수정</h3>
        <p>가입자 ID: <strong style={{ color: 'var(--color-primary)' }}>{policyholder.id}</strong> ({policyholder.name})</p>

        <div className="form-group">
          <label>등록 주소:</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="form-group">
          <label>연락처:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>지급 계좌번호:</label>
          <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
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
