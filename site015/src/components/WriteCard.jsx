import React, { useState } from 'react';

function WriteCard({ addToast }) {
  const [title, setTitle] = useState('');

  const handlePost = () => {
    if (title) {
      addToast('Post published successfully!');
      setTitle('');
    }
  };

  const handleSecretAction = () => {
    addToast('⚠️ ALERT: Unintended Action Triggered (Clickjacking)!');
  };

  return (
    <div className="card write-card">
      <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', textTransform: 'uppercase', color: '#6B7280' }}>Start a discussion</h3>
      <input 
        type="text" 
        className="btn" 
        style={{ width: '100%', background: '#F3F4F6', textAlign: 'left', cursor: 'text' }}
        placeholder="What's on your mind?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <div className="btn-row" style={{ position: 'relative' }}>
        <button className="btn btn-primary" onClick={handlePost}>Post</button>
        
        <div style={{ position: 'relative' }}>
          <button className="btn btn-secondary">Save Draft</button>
          
          {/* INTENTIONAL GUI BUG: site015-bug03
              Type: 클릭재킹 (Clickjacking)
              Description: "Save Draft" 버튼 위에 투명한 레이어를 두어 클릭 시 다른 액션이 일어나게 함.
          */}
          <div 
            className="invisible-layer" 
            data-bug-id="site015-bug03"
            onClick={handleSecretAction}
          />
        </div>
      </div>
    </div>
  );
}

export default WriteCard;
