import React, { useState } from 'react';

export default function TravelerEditModal({ booking, user, onClose, onConfirm }) {
  const [passportName, setPassportName] = useState(user?.passportName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialRequest, setSpecialRequest] = useState(booking?.specialRequest || '');

  if (!booking) return null;

  const handleSave = () => {
    onConfirm(booking.id, passportName, phone, specialRequest);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>✈️ 여행자 여권 및 예약 요청사항 수정</h3>
        <p>예약 번호: <strong style={{ color: 'var(--color-primary)' }}>{booking.id}</strong> ({booking.destination})</p>

        <div className="form-group">
          <label>여권 영문명:</label>
          <input type="text" value={passportName} onChange={(e) => setPassportName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>연락처:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>요청사항:</label>
          <input type="text" value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} />
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
