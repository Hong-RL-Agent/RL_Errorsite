import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Clock, Phone, Star, Heart, Calendar, ArrowLeft, ShieldCheck, Stethoscope, Award, Users, Share2, Check } from 'lucide-react';
import { api } from '../api/client';

export default function HospitalDetail({
  hospitalId,
  isFavorite = false,
  onToggleFavorite,
  onBookHospital,
  onSelectDoctor,
  onBack
}) {
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [copied, setCopied] = useState(false);

  // State for Doctor Photo Loading with Bug SEC-475
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    async function loadHospital() {
      if (!hospitalId) return;
      setLoading(true);
      try {
        const data = await api.getHospitalById(hospitalId);
        setHospital(data.hospital);
        setDoctors(data.doctors || []);
        if (data.doctors && data.doctors.length > 0) {
          setSelectedDoctorId(data.doctors[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHospital();
  }, [hospitalId]);

  // Handler for changing doctor tab
  const handleSelectDoctorTab = (docId) => {
    setSelectedDoctorId(docId);
    setImageLoading(true); // Reset loading state
  };

  // INTENTIONAL FRONTEND BUG: site059-SEC-475
  // 이미지 onLoad 이벤트가 이전 이미지의 상태를 덮어쓰는 오류:
  // 사용자가 병원 상세 페이지에서 의사 탭을 빠르게 전환할 때(예: 의사 A 클릭 직후 의사 B 클릭),
  // 비동기 이미지 로딩 완료 콜백(handleImageLoad)에서 현재 활성화된 의사 ID(selectedDoctorId)와
  // 로드된 이미지의 일치 여부를 검증하지 않고 단순 boolean state인 setImageLoading(false)를 실행함.
  // 이로 인해 느리게 완료된 이전 의사 A의 onLoad 이벤트가 현재 로딩 중인 의사 B의 loading state를 조기 해제하여
  // 이미지가 완전히 로드되지 않았음에도 스켈레톤이 사라지고 빈 화면 영역이 노출되는 Race Condition이 발생함.
  const handleImageLoad = () => {
    // Missing correlation check with current selectedDoctorId
    setImageLoading(false);
  };

  const activeDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-screen" style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
        <p>병원 상세 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-screen" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>병원 정보를 찾을 수 없습니다.</h2>
        <button onClick={onBack} style={{ marginTop: '16px', padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen" style={{ paddingTop: '28px' }}>
      {/* Back button */}
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
        <span>병원 목록으로 돌아가기</span>
      </button>

      {/* Hospital Hero Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '28px', padding: '28px' }}>
          <div style={{ borderRadius: '14px', overflow: 'hidden', height: '300px', position: 'relative' }}>
            <img src={hospital.image} alt={hospital.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#0284c7', color: '#fff', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800 }}>
              {hospital.area}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25 }}>
                {hospital.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#b45309', padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 800 }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span>{hospital.rating} ({hospital.reviewCount}건 리뷰)</span>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {hospital.description}
            </p>

            {/* Department Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
              {hospital.departmentNames.map((dName, idx) => (
                <span key={idx} className="dept-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                  {dName}
                </span>
              ))}
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#0284c7" />
                <span>{hospital.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#10b981" />
                <span>{hospital.operatingHours}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="#64748b" />
                <span>대표 전화: {hospital.phone}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => onToggleFavorite(hospital.id)}
                style={{
                  padding: '12px 18px',
                  background: isFavorite ? '#fee2e2' : '#f1f5f9',
                  color: isFavorite ? '#ef4444' : '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Heart size={18} fill={isFavorite ? '#ef4444' : 'none'} color={isFavorite ? '#ef4444' : '#64748b'} />
                <span>{isFavorite ? '즐겨찾기 완료' : '즐겨찾기'}</span>
              </button>

              <button
                onClick={handleShare}
                style={{
                  padding: '12px 18px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Share2 size={18} />
                <span>{copied ? '복사됨!' : '공유하기'}</span>
              </button>

              <button
                onClick={() => onBookHospital(hospital.id)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <Calendar size={18} />
                <span>진료 바로 예약하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Doctors Section with SEC-475 Image Race Condition */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
          소속 의료진 정보 & 상세 프로필
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
          상세 프로필을 확인할 의료진을 선택해 주세요.
        </p>

        {/* Doctor Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
          {doctors.map(doc => {
            const isSelected = selectedDoctorId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => handleSelectDoctorTab(doc.id)}
                style={{
                  padding: '10px 18px',
                  background: isSelected ? '#0284c7' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                {doc.name} ({doc.departmentName})
              </button>
            );
          })}
        </div>

        {/* Selected Doctor Detailed Profile Card */}
        {activeDoctor && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', boxShadow: 'var(--shadow-sm)' }}>
            {/* Doctor Photo Box with image-load-race */}
            <div style={{ width: '240px', height: '280px', borderRadius: '14px', overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
              {imageLoading && (
                <div style={{ position: 'absolute', inset: 0, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  프로필 사진 로딩 중...
                </div>
              )}
              <img
                src={activeDoctor.image}
                alt={activeDoctor.name}
                onLoad={handleImageLoad}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Doctor Profile Details */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px' }}>
                  {activeDoctor.departmentName}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  임상 경력 {activeDoctor.experience}년
                </span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '14px' }}>
                {activeDoctor.name}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '18px', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>주요 전문 분야:</span>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{activeDoctor.specialty}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>진료 일정:</span>
                  <div style={{ fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{activeDoctor.schedule}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b' }}>학력 및 주요 경력:</span>
                  <div style={{ fontWeight: 600, color: '#334155', marginTop: '2px' }}>{activeDoctor.education}</div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => onSelectDoctor(activeDoctor.id)}
                  style={{
                    padding: '12px 20px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#334155'
                  }}
                >
                  의사 상세 페이지 이동
                </button>

                <button
                  onClick={() => onBookHospital(hospital.id, activeDoctor.id)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Calendar size={16} />
                  <span>{activeDoctor.name} 진료 예약</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
