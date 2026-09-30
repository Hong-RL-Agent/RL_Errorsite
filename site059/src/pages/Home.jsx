import React, { useState } from 'react';
import { Search, MapPin, Calendar, Star, Building2, Stethoscope, ArrowRight, ShieldCheck, Clock, Users, Heart } from 'lucide-react';
import HospitalCard from '../components/HospitalCard';
import DoctorCard from '../components/DoctorCard';
import DepartmentBadge from '../components/DepartmentBadge';
import NoticeBanner from '../components/NoticeBanner';

export default function Home({
  hospitals = [],
  doctors = [],
  departments = [],
  notices = [],
  favorites = [],
  onSelectHospital,
  onSelectDoctor,
  onBookHospital,
  onBookDoctor,
  onToggleFavorite,
  onNavigateTab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigateTab('hospitals', { search: searchTerm, department: selectedDept });
  };

  const topHospitals = hospitals.slice(0, 6);
  const topDoctors = doctors.slice(0, 4);

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="max-w-screen">
          <div className="hero-content">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '16px', backdropFilter: 'blur(8px)' }}>
              <ShieldCheck size={16} color="#38bdf8" />
              <span>대한민국 1등 스마트 병원 예약 플랫폼</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.25, marginBottom: '16px', letterSpacing: '-0.5px' }}>
              가까운 병원을 찾고<br />
              <span style={{ color: '#38bdf8' }}>대기 없이 간편하게</span> 진료 예약하세요
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
              내과, 정형외과, 피부과부터 치과까지 검증된 전문의 프로필과 실시간 진료 가능 시간을 확인하고 1분 만에 예약할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Main Search Bar Card */}
      <div className="max-w-screen">
        <form onSubmit={handleSearchSubmit} className="search-box-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <Search size={20} color="#0284c7" />
            <input
              type="text"
              placeholder="병원명, 진료과, 질환명(예: 감기, 디스크, 임플란트) 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 600 }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '14px 28px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <span>병원 검색</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>

      <div className="max-w-screen" style={{ paddingTop: '36px' }}>
        {/* Notices */}
        <NoticeBanner notices={notices} />

        {/* Recommended Departments */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                주요 진료과별 빠른 탐색
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                필요하신 진료 분야를 선택하시면 진료 가능한 병원과 전문의를 바로 연결해 드립니다.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('hospitals')}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>전체 보기</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {departments.map((dept) => (
              <DepartmentBadge
                key={dept.id}
                department={dept}
                isActive={selectedDept === dept.code}
                onClick={() => {
                  setSelectedDept(dept.code);
                  onNavigateTab('hospitals', { department: dept.code });
                }}
              />
            ))}
          </div>
        </section>

        {/* Popular Hospitals Grid */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                가까운 안심 예약 추천 병원
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                환자 만족도 평점이 높고 즉시 진료 예약이 가능한 우수 의료기관입니다.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('hospitals')}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>병원 더보기</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="hospitals-grid">
            {topHospitals.map((hosp) => (
              <HospitalCard
                key={hosp.id}
                hospital={hosp}
                isFavorite={favorites.includes(hosp.id)}
                onSelectHospital={onSelectHospital}
                onToggleFavorite={onToggleFavorite}
                onBookHospital={onBookHospital}
              />
            ))}
          </div>
        </section>

        {/* Featured Doctors Grid */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                CareBridge 대표 전문의
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                풍부한 임상 경험과 진료 전문성을 인정받은 전문의를 만나보세요.
              </p>
            </div>
          </div>

          <div className="doctors-grid">
            {topDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onSelectDoctor={onSelectDoctor}
                onBookDoctor={onBookDoctor}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
