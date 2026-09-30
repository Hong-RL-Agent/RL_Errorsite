import React from 'react';
import { Building2, User, Calendar, Clock, MapPin, CheckCircle2, Shield } from 'lucide-react';

export default function AppointmentSummary({ hospital, doctor, selectedDate, selectedTime, patientInfo }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
      <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <CheckCircle2 size={18} color="#0284c7" />
        <span>진료 예약 요약</span>
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.9rem' }}>
        <div>
          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>예약 병원:</span>
          <div style={{ fontWeight: 800, color: '#0f172a' }}>{hospital?.name || '-'}</div>
        </div>

        <div>
          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>담당 의사 / 진료과:</span>
          <div style={{ fontWeight: 800, color: '#0f172a' }}>
            {doctor ? `${doctor.name} (${doctor.departmentName})` : '-'}
          </div>
        </div>

        <div>
          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>예약 일시:</span>
          <div style={{ fontWeight: 800, color: '#0284c7' }}>
            {selectedDate && selectedTime ? `${selectedDate} ${selectedTime}` : '일시 미선택'}
          </div>
        </div>

        <div>
          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>예약자 성함:</span>
          <div style={{ fontWeight: 800, color: '#0f172a' }}>
            {patientInfo?.name ? `${patientInfo.name} (${patientInfo.phone})` : '-'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Shield size={14} color="#10b981" />
        <span>CareBridge 안심 예약: 진료 30분 전 알림톡이 자동 발송됩니다.</span>
      </div>
    </div>
  );
}
