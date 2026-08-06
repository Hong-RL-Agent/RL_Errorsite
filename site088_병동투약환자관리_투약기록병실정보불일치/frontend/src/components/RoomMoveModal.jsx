import React, { useState } from 'react';

export default function RoomMoveModal({ patient, rooms, onClose, onConfirm }) {
  const [targetRoomNo, setTargetRoomNo] = useState(patient?.roomNo || '301호');

  if (!patient) return null;

  const handleSave = () => {
    const rm = rooms.find(r => r.roomNo === targetRoomNo);
    onConfirm(patient.id, targetRoomNo, rm?.ward || patient.ward);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🏥 환자 병실 이동 모달</h3>
        <p>환자 성함: <strong>{patient.name}</strong> ({patient.gender}/{patient.age}세)</p>
        <p>현재 병실: {patient.roomNo} ({patient.ward})</p>

        <div className="form-group">
          <label>이동 대상 새 병실 선택:</label>
          <select value={targetRoomNo} onChange={(e) => setTargetRoomNo(e.target.value)}>
            {rooms.map(r => (
              <option key={r.id} value={r.roomNo}>{r.roomNo} ({r.ward}) - {r.currentCount}/{r.capacity}베드</option>
            ))}
          </select>
        </div>

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)' }} onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            병실 이동 확정
          </button>
        </div>
      </div>
    </div>
  );
}
