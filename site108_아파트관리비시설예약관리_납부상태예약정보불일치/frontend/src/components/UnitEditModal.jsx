import React, { useState } from 'react';

export default function UnitEditModal({ unit, onClose, onConfirm }) {
  const [phone, setPhone] = useState(unit?.phone || '');
  const [carNo, setCarNo] = useState(unit?.carNo || '');
  const [note, setNote] = useState(unit?.note || '');

  if (!unit) return null;

  const handleSave = () => {
    onConfirm(unit.id, phone, carNo, note);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🏢 세대 연락처, 등록 차량 및 특이사항 메모 수정</h3>
        <p>세대 ID: <strong style={{ color: 'var(--color-primary)' }}>{unit.id}</strong> ({unit.building} {unit.room})</p>

        <div className="form-group">
          <label>연락처:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>등록 차량번호:</label>
          <input type="text" value={carNo} onChange={(e) => setCarNo(e.target.value)} />
        </div>

        <div className="form-group">
          <label>특이사항 메모:</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
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
