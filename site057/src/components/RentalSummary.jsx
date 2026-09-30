import React from 'react';
import { Bike, Zap, MapPin, Calendar, CreditCard, Shield } from 'lucide-react';

export default function RentalSummary({ rental, fareData = null }) {
  if (!rental) return null;

  const displayFare = fareData?.rawTotalFare !== undefined ? fareData.rawTotalFare : rental.calculatedFare;

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>대여번호: {rental.rentalNumber}</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            {rental.vehicleName}
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>예상/결제 요금</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#65a30d' }}>
            {typeof displayFare === 'number' ? `${displayFare.toLocaleString()}원` : `${displayFare}원`}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '0.9rem', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#65a30d" />
          <span style={{ color: '#64748b' }}>시작 시각:</span>
          <strong style={{ color: '#0f172a' }}>{rental.startTime}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="#65a30d" />
          <span style={{ color: '#64748b' }}>출발 대여소:</span>
          <strong style={{ color: '#0f172a' }}>{rental.startStation}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={16} color="#65a30d" />
          <span style={{ color: '#64748b' }}>결제 수단:</span>
          <strong style={{ color: '#0f172a' }}>{rental.paymentMethod || 'RideOn 페이'}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="#65a30d" />
          <span style={{ color: '#64748b' }}>보험 보장:</span>
          <strong style={{ color: '#15803d' }}>대인/대물 안심보험 적용</strong>
        </div>
      </div>
    </div>
  );
}
