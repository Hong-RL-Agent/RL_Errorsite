import React from 'react';

function Header({ roomInfo, onProfileClick }) {
  return (
    <header className="header">
      <div className="room-info-top luxury-font">
        Room <span style={{ color: '#D4AF37' }}>{roomInfo?.roomNumber || '----'}</span>
      </div>
      
      <div className="guest-info">
        {/* INTENTIONAL GUI BUG: site013-bug02
           Type: component-rendering
           Description: "Checked-In" 상태임에도 경고색인 빨간색 배경에 
           잘못된 텍스트 "OUT OF SERVICE"를 표시함.
        */}
        <div 
          className="status-badge buggy" 
          data-bug-id="site013-bug02"
        >
          OUT OF SERVICE
        </div>
        
        <div className="avatar" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
          {roomInfo?.guest?.charAt(0) || 'G'}
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{roomInfo?.guest}</div>
      </div>
    </header>
  );
}

export default Header;
