import React, { useState, useEffect } from 'react';
import { Star, Award, Calendar, CheckCircle2 } from 'lucide-react';

export default function Instructors({ onBookInstructor }) {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    fetch('/api/instructors')
      .then(res => res.json())
      .then(d => {
        if (d.success) setInstructors(d.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">FitFlow 마스터 강사진</h2>
          <p className="section-subtitle">국내외 공식 자격 및 5년 이상 경력을 보유한 전문 트레이너입니다.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {instructors.map((inst) => (
          <div
            key={inst.id}
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <img
              src={inst.avatar}
              alt={inst.name}
              style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '3px solid #10b981' }}
            />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{inst.name}</h3>
            <div style={{ fontSize: 13, color: '#059669', fontWeight: 700, marginBottom: 8 }}>{inst.specialization}</div>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>{inst.experience}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0f172a', fontWeight: 700, marginBottom: 20 }}>
              <Star size={15} color="#f59e0b" fill="#f59e0b" />
              <span>{inst.rating}</span>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>({inst.reviewsCount}개의 후기)</span>
            </div>

            <button
              className="btn-lime"
              onClick={() => onBookInstructor(inst)}
              style={{ width: '100%', padding: '10px' }}
            >
              1:1 전담 세션 예약
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
