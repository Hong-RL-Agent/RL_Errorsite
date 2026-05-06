import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function AnswerOptions({ options, onSelect, selected }) {
  return (
    <div className="option-grid">
      {options.map((opt, idx) => (
        <div 
          key={idx} 
          className={`option-card ${selected === opt ? 'selected' : ''}`}
          onClick={() => onSelect(opt)}
        >
          <div style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '50%', 
            border: `2px solid ${selected === opt ? 'var(--primary)' : '#cbd5e1'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: selected === opt ? 'var(--primary)' : 'white'
          }}>
            {selected === opt && <CheckCircle2 size={16} color="white" />}
          </div>
          <span style={{ fontSize: '16px', fontWeight: selected === opt ? 700 : 500 }}>{opt}</span>
        </div>
      ))}
    </div>
  );
}
