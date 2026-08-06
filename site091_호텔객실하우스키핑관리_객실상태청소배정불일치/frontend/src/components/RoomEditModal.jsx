import React, { useState } from 'react';

export default function RoomEditModal({ room, onClose, onConfirm }) {
  const [roomType, setRoomType] = useState(room?.type || '');
  const [price, setPrice] = useState(room?.price || 0);
  const [cleaningNote, setCleaningNote] = useState(room?.cleaningNote || '');

  if (!room) return null;

  const handleSave = () => {
    onConfirm(room.id, roomType, price, cleaningNote);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🏨 객실 상세 관제 & 정보 수정 모달</h3>
        <p>객실 번호: <strong style={{ color: 'var(--color-primary)' }}>{room.id}호</strong> ({room.floor}층)</p>

        <div className="form-group">
          <label>객실 타입:</label>
          <input type="text" value={roomType} onChange={(e) => setRoomType(e.target.value)} />
        </div>

        <div className="form-group">
          <label>숙박 가격 (1박):</label>
          <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value || '0'))} />
        </div>

        <div className="form-group">
          <label>하우스키핑 청소 메모:</label>
          <input type="text" value={cleaningNote} onChange={(e) => setCleaningNote(e.target.value)} />
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
