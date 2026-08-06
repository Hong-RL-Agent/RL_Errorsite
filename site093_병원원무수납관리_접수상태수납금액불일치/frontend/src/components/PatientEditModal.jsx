import React, { useState } from 'react';

export default function PatientEditModal({ patient, onClose, onConfirm }) {
  const [phone, setPhone] = useState(patient?.phone || '');
  const [address, setAddress] = useState(patient?.address || '');
  const [guardianName, setGuardianName] = useState(patient?.guardianName || '');

  if (!patient) return null;

  const handleSave = () => {
    onConfirm(patient.id, phone, address, guardianName);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🏥 환자 인적사항 수정 모달</h3>
        <p>환자 ID: <strong style={{ color: 'var(--color-primary)' }}>{patient.id}</strong> ({patient.name})</p>

        <div className="form-group">
          <label>연락처:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>주소:</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="form-group">
          <label>보호자 이름:</label>
          <input type="text" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
        </div>

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)' }} onClick={onClose}>
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
