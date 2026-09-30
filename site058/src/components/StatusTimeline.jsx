import React from 'react';
import { Package, Truck, Droplets, CheckCircle2, ShieldCheck, Home } from 'lucide-react';

export default function StatusTimeline({ currentStep = 1, statusText = '주문 접수' }) {
  const steps = [
    { num: 1, label: '주문 접수', icon: Package },
    { num: 2, label: '수거 완료', icon: Truck },
    { num: 3, label: '세탁 중', icon: Droplets },
    { num: 4, label: '검수 완료', icon: ShieldCheck },
    { num: 5, label: '배송 중', icon: Truck },
    { num: 6, label: '배송 완료', icon: Home }
  ];

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px 20px', marginBottom: '28px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>세탁 진행 단계</h3>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', background: '#ecfdf5', padding: '3px 10px', borderRadius: '9999px' }}>
          현재: {statusText}
        </span>
      </div>

      <div className="timeline-wrapper">
        {steps.map((s) => {
          const isCompleted = s.num < currentStep;
          const isActive = s.num === currentStep;
          const IconComp = s.icon;

          return (
            <div
              key={s.num}
              className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="timeline-circle">
                {isCompleted ? '✓' : <IconComp size={18} />}
              </div>
              <div className="timeline-label">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
