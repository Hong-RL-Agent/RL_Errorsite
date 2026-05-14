import React from 'react';

const FrequencySelector = ({ selected, onSelect }) => {
  const options = ['Monthly', 'Every 2 Weeks', 'Every 3 Months'];

  return (
    <div style={{ marginTop: '40px' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Delivery Frequency</h3>
      <div className="freq-grid">
        {options.map(opt => (
          <button
            key={opt}
            className={`freq-option ${selected === opt ? 'active' : ''}`}
            onClick={() => onSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FrequencySelector;
