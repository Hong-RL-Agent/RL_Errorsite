import React, { useState } from 'react';
import { Star, Calendar, Award, Building2, User, ChevronRight } from 'lucide-react';

export default function DoctorCard({ doctor, onSelectDoctor, onBookDoctor }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="doctor-card">
      <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
        {/* Doctor Photo */}
        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, position: 'relative', background: '#f1f5f9' }}>
          {!imageLoaded && (
            <div style={{ position: 'absolute', inset: 0, background: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />
          )}
          <img
            src={doctor.image}
            alt={doctor.name}
            onLoad={() => setImageLoaded(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Doctor Basic Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
              {doctor.departmentName}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              경력 {doctor.experience}년
            </span>
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            {doctor.name}
          </h4>

          <div style={{ fontSize: '0.8rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doctor.hospitalName}
          </div>
        </div>
      </div>

      {/* Specialty */}
      <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, marginBottom: '14px', height: '36px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {doctor.specialty}
      </p>

      {/* Card Actions */}
      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onSelectDoctor(doctor.id)}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.84rem',
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          상세 프로필
        </button>

        <button
          onClick={() => onBookDoctor(doctor.id)}
          style={{
            padding: '8px 16px',
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Calendar size={14} />
          <span>예약</span>
        </button>
      </div>
    </div>
  );
}
