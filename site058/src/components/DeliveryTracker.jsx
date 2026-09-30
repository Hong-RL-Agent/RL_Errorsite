import React from 'react';
import { Truck, MapPin, Phone, User, Clock, CheckCircle2 } from 'lucide-react';

export default function DeliveryTracker({ delivery }) {
  if (!delivery) return null;

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} color="#16a34a" />
          배송 및 수거 매니저 실시간 관제
        </h4>
        <span style={{ fontSize: '0.8rem', background: '#ecfdf5', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
          {delivery.currentStep}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="#64748b" />
          <span>담당: <strong>{delivery.driverName}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={16} color="#64748b" />
          <span>연락처: <strong>{delivery.driverPhone}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#64748b" />
          <span>예상 시각: <strong>{delivery.eta}</strong></span>
        </div>
      </div>

      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <MapPin size={15} color="#0284c7" />
        <span>현재 관제 위치: <strong>{delivery.location}</strong></span>
      </div>
    </div>
  );
}
