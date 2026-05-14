import React, { useState } from 'react';

function RequestForm({ cart, onSubmit }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() || cart.length > 0) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="request-panel">
      <h3 className="section-title" style={{ fontSize: '1.2rem' }}>Concierge Request</h3>
      
      <div className="order-summary">
        <h4>Order Summary</h4>
        {cart.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>No items selected</p>
        ) : (
          cart.map((item, idx) => (
            <div key={idx} className="summary-item">
              <span>{item.name}</span>
              <span>₩{item.price.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
      
      <textarea 
        className="request-input"
        placeholder="Enter your additional requests here (e.g. Extra towels, wake-up call...)"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      <button className="btn-submit" onClick={handleSend}>
        SEND REQUEST
      </button>
    </div>
  );
}

export default RequestForm;
