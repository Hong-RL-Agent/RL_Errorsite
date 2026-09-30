import React, { useState, useEffect } from 'react';
import { Stethoscope, Building2, Calendar, Star, Award, Clock, ArrowLeft, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../api/client';

export default function DoctorDetail({ doctorId, onBookDoctor, onSelectHospital, onBack }) {
  const [doctor, setDoctor] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoctor() {
      if (!doctorId) return;
      setLoading(true);
      try {
        const data = await api.getDoctorById(doctorId);
        setDoctor(data.doctor);
        setHospital(data.hospital);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctor();
  }, [doctorId]);

  if (loading) {
    return (
      <div className="max-w-screen" style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
        <p>의사 상세 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-screen" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>의사 정보를 찾을 수 없습니다.</h2>
        <button onClick={onBack} style={{ marginTop: '16px', padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen" style={{ paddingTop: '28px' }}>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: '#475569',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '0.95rem'
        }}
      >
        <ArrowLeft size={18} />
        <span>이전 화면으로 돌아가기</span>
      </button>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '32px', boxShadow: 'var(--shadow-md)', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '36px' }}>
          {/* Left Photo & Badges */}
          <div>
            <div style={{ borderRadius: '16px', overflow: 'hidden', height: '300px', marginBottom: '16px', background: '#f1f5f9' }}>
              <img src={doctor.image} alt={doctor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2px' }}>환자 평점</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '1.2rem', fontWeight: 900, color: '#b45309' }}>
                <Star size={18} fill="#f59e0b" color="#f59e0b" />
                <span>{doctor.rating}</span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>({doctor.reviewCount}건)</span>
              </div>
            </div>
          </div>

          {/* Right Detailed Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '4px 10px', borderRadius: '4px' }}>
                {doctor.departmentName}
              </span>
              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                임상 경력 {doctor.experience}년
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', marginBottom: '12px' }}>
              {doctor.name}
            </h1>

            {/* Hospital Connection Card */}
            {hospital && (
              <div
                onClick={() => onSelectHospital(hospital.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={20} color="#0284c7" />
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{hospital.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{hospital.address}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7' }}>병원 정보 보기 &gt;</span>
              </div>
            )}

            {/* Specialties & Education */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', fontSize: '0.92rem' }}>
              <div>
                <strong style={{ color: '#0f172a' }}>주요 전문 분야:</strong>
                <p style={{ color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>{doctor.specialty}</p>
              </div>

              <div>
                <strong style={{ color: '#0f172a' }}>학력 및 수련 경력:</strong>
                <p style={{ color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>{doctor.education}</p>
              </div>

              <div>
                <strong style={{ color: '#0f172a' }}>정규 진료 일정:</strong>
                <p style={{ color: '#0284c7', fontWeight: 700, marginTop: '4px' }}>{doctor.schedule}</p>
              </div>
            </div>

            {/* Booking CTA Button */}
            <div style={{ marginTop: 'auto' }}>
              <button
                onClick={() => onBookDoctor(doctor.id)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <Calendar size={20} />
                <span>{doctor.name} 진료 예약하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
