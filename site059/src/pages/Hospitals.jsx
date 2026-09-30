import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Building2, Stethoscope, RefreshCw, UserCheck, X } from 'lucide-react';
import HospitalCard from '../components/HospitalCard';
import DoctorCard from '../components/DoctorCard';
import { api } from '../api/client';

export default function Hospitals({
  initialFilters = {},
  departments = [],
  favorites = [],
  onSelectHospital,
  onSelectDoctor,
  onBookHospital,
  onBookDoctor,
  onToggleFavorite
}) {
  const [activeTab, setActiveTab] = useState('hospitals'); // 'hospitals' or 'doctors'
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Hospitals
  const [search, setSearch] = useState(initialFilters.search || '');
  const [selectedArea, setSelectedArea] = useState(initialFilters.area || 'all');
  const [selectedDepts, setSelectedDepts] = useState(initialFilters.department && initialFilters.department !== 'all' ? [initialFilters.department] : []);

  // Filters for Doctors
  const [docSearch, setDocSearch] = useState('');
  const [docDept, setDocDept] = useState('all');
  const [minExp, setMinExp] = useState(''); // '', '0', '5', '10', '15'

  // Fetch Hospitals
  const fetchHospitals = async () => {
    setLoading(true);
    try {
      // Passes selectedDepts array to api.getHospitals
      // If multiple depts selected (e.g. ['internal', 'orthopedic']), joins as comma string
      // Triggers SEC-474 on backend
      const data = await api.getHospitals({
        search,
        area: selectedArea,
        departments: selectedDepts
      });
      setHospitals(data.hospitals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Doctors with SEC-471 (minExperience=0)
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctors({
        search: docSearch,
        department: docDept,
        minExperience: minExp
      });
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'hospitals') {
      fetchHospitals();
    } else {
      fetchDoctors();
    }
  }, [activeTab, selectedArea, selectedDepts, docDept, minExp]);

  const handleToggleDeptFilter = (deptCode) => {
    if (selectedDepts.includes(deptCode)) {
      setSelectedDepts(selectedDepts.filter(c => c !== deptCode));
    } else {
      setSelectedDepts([...selectedDepts, deptCode]);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedArea('all');
    setSelectedDepts([]);
    setDocSearch('');
    setDocDept('all');
    setMinExp('');
  };

  const areas = ['all', '강남구', '서초구', '송파구', '마포구', '성동구', '영등포구', '서대문구'];

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      {/* Title and View Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
            병원 및 의료진 검색
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            원하시는 진료과목과 지역, 경력 조건에 맞는 병원 및 전문의를 검색하세요.
          </p>
        </div>

        {/* Tab switcher: 병원별 / 의사별 */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('hospitals')}
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: activeTab === 'hospitals' ? '#ffffff' : 'transparent',
              color: activeTab === 'hospitals' ? '#0284c7' : '#64748b',
              boxShadow: activeTab === 'hospitals' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            병원 찾기
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: activeTab === 'doctors' ? '#ffffff' : 'transparent',
              color: activeTab === 'doctors' ? '#0284c7' : '#64748b',
              boxShadow: activeTab === 'doctors' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            의사 찾기
          </button>
        </div>
      </div>

      {/* Hospital Filters Card */}
      {activeTab === 'hospitals' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
          {/* Search bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <Search size={18} color="#0284c7" />
              <input
                type="text"
                placeholder="병원명 또는 주소 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchHospitals()}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 600 }}
              />
            </div>
            <button
              onClick={fetchHospitals}
              style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              검색
            </button>
          </div>

          {/* Area Selector */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              지역 선택
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {areas.map(a => (
                <button
                  key={a}
                  onClick={() => setSelectedArea(a)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedArea === a ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    background: selectedArea === a ? '#e0f2fe' : '#f8fafc',
                    color: selectedArea === a ? '#0369a1' : '#475569'
                  }}
                >
                  {a === 'all' ? '전체 지역' : a}
                </button>
              ))}
            </div>
          </div>

          {/* Department Multi-Select Filter (triggers SEC-474) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>
                진료과목 다중 선택 필터 {selectedDepts.length > 0 && `(${selectedDepts.length}개 선택됨)`}
              </div>
              {selectedDepts.length > 0 && (
                <button
                  onClick={() => setSelectedDepts([])}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  진료과 선택 해제
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {departments.map(dept => {
                const isChecked = selectedDepts.includes(dept.code);
                return (
                  <button
                    key={dept.id}
                    onClick={() => handleToggleDeptFilter(dept.code)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isChecked ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      background: isChecked ? '#0284c7' : '#ffffff',
                      color: isChecked ? '#ffffff' : '#334155'
                    }}
                  >
                    {dept.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Doctor Filters Card */}
      {activeTab === 'doctors' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <Search size={18} color="#0284c7" />
              <input
                type="text"
                placeholder="의사 이름, 전문분야(예: 디스크, 내시경)..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDoctors()}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 600 }}
              />
            </div>

            {/* Department Filter */}
            <select
              value={docDept}
              onChange={(e) => setDocDept(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600, background: '#fff' }}
            >
              <option value="all">전체 진료과</option>
              {departments.map(d => (
                <option key={d.id} value={d.code}>{d.name}</option>
              ))}
            </select>

            {/* Experience Filter with SEC-471 */}
            <select
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600, background: '#fff' }}
            >
              <option value="">경력 전체</option>
              <option value="0">경력 0년 이상 (전체)</option>
              <option value="5">경력 5년 이상</option>
              <option value="10">경력 10년 이상</option>
              <option value="15">경력 15년 이상</option>
            </select>

            <button
              onClick={fetchDoctors}
              style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              필터 적용
            </button>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
          {activeTab === 'hospitals' ? (
            <>총 <span style={{ color: '#0284c7', fontWeight: 900 }}>{hospitals.length}</span>개의 병원이 검색되었습니다.</>
          ) : (
            <>총 <span style={{ color: '#0284c7', fontWeight: 900 }}>{doctors.length}</span>명의 전문의가 조회되었습니다.</>
          )}
        </div>
        <button
          onClick={handleResetFilters}
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={13} />
          <span>필터 초기화</span>
        </button>
      </div>

      {/* Loading & Grids */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      ) : activeTab === 'hospitals' ? (
        hospitals.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
            <Building2 size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              조건에 일치하는 병원이 없습니다.
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
              다중 진료과 필터 또는 지역 조건을 변경해 보세요.
            </p>
            <button
              onClick={handleResetFilters}
              style={{ padding: '8px 18px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              전체 병원 보기
            </button>
          </div>
        ) : (
          <div className="hospitals-grid">
            {hospitals.map((hosp) => (
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
        )
      ) : (
        doctors.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
            <Stethoscope size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              조건에 일치하는 의사 정보가 없습니다.
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
              경력 연차 조건 또는 진료과목 필터를 변경해 보세요.
            </p>
            <button
              onClick={handleResetFilters}
              style={{ padding: '8px 18px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              전체 의사 보기
            </button>
          </div>
        ) : (
          <div className="doctors-grid">
            {doctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onSelectDoctor={onSelectDoctor}
                onBookDoctor={onBookDoctor}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
