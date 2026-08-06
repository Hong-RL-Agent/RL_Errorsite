import React, { useState } from 'react';

export default function PassengerEditModal({ passenger, onClose, onConfirm }) {
  const [phone, setPhone] = useState(passenger?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(passenger?.deliveryAddress || '');
  const [requests, setRequests] = useState(passenger?.requests || '');

  if (!passenger) return null;

  const handleSave = () => {
    onConfirm(passenger.id, phone, deliveryAddress, requests);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>👤 승객 연락처, 수령 주소 및 요청사항 수정</h3>
        <p>승객 ID: <strong style={{ color: 'var(--color-primary)' }}>{passenger.id}</strong> ({passenger.name})</p>

        <div className="form-group">
          <label>연락처:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>수령 주소:</label>
          <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
        </div>

        <div className="form-group">
          <label>특별 요청사항:</label>
          <input type="text" value={requests} onChange={(e) => setRequests(e.target.value)} />
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
