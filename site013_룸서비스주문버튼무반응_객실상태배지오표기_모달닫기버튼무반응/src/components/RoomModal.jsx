import React from 'react';

function RoomModal({ room, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* INTENTIONAL GUI BUG: site013-bug03
            Type: modal-ui
            Description: 모달 닫기 버튼이 클릭되어도 onClose 핸들러를 호출하지 않음.
        */}
        <button 
          className="modal-close"
          data-bug-id="site013-bug03"
          // onClick={onClose} // Intentionally omitted
        >
          ✕
        </button>
        
        <div className="room-detail">
          <h2>Room Detail</h2>
          <div className="detail-row">
            <span>Room Number</span>
            <span>{room.roomNumber}</span>
          </div>
          <div className="detail-row">
            <span>Room Type</span>
            <span>{room.type}</span>
          </div>
          <div className="detail-row">
            <span>Guest Name</span>
            <span>{room.guest}</span>
          </div>
          <div className="detail-row">
            <span>Stay Status</span>
            <span style={{ color: '#D4AF37' }}>{room.status}</span>
          </div>
          <div className="detail-row" style={{ border: 'none', marginTop: '20px' }}>
            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', fontStyle: 'italic' }}>
              Welcome to the Grand Estate. Enjoy your luxurious stay with our 24/7 concierge service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomModal;
