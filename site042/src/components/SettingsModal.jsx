import React from 'react';

const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="section-title" style={{ margin: 0 }}>설정</h3>
          <button onClick={onClose} style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>집중 시간 (분)</label>
            <input type="number" defaultValue="25" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>휴식 시간 (분)</label>
            <input type="number" defaultValue="5" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" defaultChecked id="notif" />
            <label htmlFor="notif" style={{ fontSize: '0.85rem' }}>데스크탑 알림 활성화</label>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ 
            marginTop: '2rem', width: '100%', background: '#0f172a', color: '#fff', 
            padding: '10px', borderRadius: '8px', fontWeight: 600 
          }}
        >
          설정 저장
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
