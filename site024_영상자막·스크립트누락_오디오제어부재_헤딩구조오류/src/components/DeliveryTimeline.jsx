import React from 'react';

export default function DeliveryTimeline({ tracking }) {
  return (
    <div className="timeline-card">
      {/* INTENTIONAL GUI BUG: site024-bug03
         Type: illogical-heading-order
         Description: h1 다음 h4, 이후 h2가 나오는 비논리적 heading 구조를 사용함.
      */}
      <div data-bug-id="site024-bug03">
        <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '25px', color: 'var(--primary)' }}>
          배송 상세 경로
        </h4>
        <div className="flex flex-col">
          {tracking.timeline.map((step, index) => (
            <div key={index} className="step-item">
              <div className={`step-icon ${index === tracking.timeline.length - 1 ? 'active' : ''}`}>
                {index + 1}
              </div>
              <div className="step-content">
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 5px 0' }}>{step.step} - {step.location}</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>{step.time}</div>
                <p style={{ margin: 0, fontSize: '14px' }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
