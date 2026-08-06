import React, { useState } from 'react';

export default function StudentEditModal({ student, onClose, onConfirm }) {
  const [phone, setPhone] = useState(student?.phone || '');
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '');
  const [preferredRoommate, setPreferredRoommate] = useState(student?.preferredRoommate || '');

  if (!student) return null;

  const handleSave = () => {
    onConfirm(student.id, phone, parentPhone, preferredRoommate);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>👤 학생 연락처, 보호자 연락처 및 희망 룸메이트 수정</h3>
        <p>학생 ID: <strong style={{ color: 'var(--color-primary)' }}>{student.id}</strong> ({student.name})</p>

        <div className="form-group">
          <label>연락처:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>보호자 연락처:</label>
          <input type="text" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>희망 룸메이트:</label>
          <input type="text" value={preferredRoommate} onChange={(e) => setPreferredRoommate(e.target.value)} />
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
