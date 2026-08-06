import React, { useState } from 'react';

export default function MemberEditModal({ member, trainers, onClose, onConfirm }) {
  const [phone, setPhone] = useState(member?.phone || '');
  const [expiryDate, setExpiryDate] = useState(member?.expiryDate || '');
  const [assignedTrainer, setAssignedTrainer] = useState(member?.assignedTrainer || '');

  if (!member) return null;

  const handleSave = () => {
    onConfirm(member.id, phone, expiryDate, assignedTrainer);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>👤 회원 연락처, 만료일 및 담당 트레이너 수정</h3>
        <p>회원 ID: <strong style={{ color: 'var(--color-primary)' }}>{member.id}</strong> ({member.name})</p>

        <div className="form-group">
          <label>연락처:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>회원권 만료일:</label>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </div>

        <div className="form-group">
          <label>담당 트레이너:</label>
          <select value={assignedTrainer} onChange={(e) => setAssignedTrainer(e.target.value)}>
            {trainers.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
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
