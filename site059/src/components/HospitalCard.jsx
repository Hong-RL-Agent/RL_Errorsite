import React from 'react';
import { Star, MapPin, Clock, Phone, Heart, Users, ChevronRight, Calendar } from 'lucide-react';

export default function HospitalCard({
  hospital,
  isFavorite = false,
  onSelectHospital,
  onToggleFavorite,
  onBookHospital
}) {
  // INTENTIONAL FRONTEND BUG: site059-SEC-473
  // 중첩 클릭 이벤트가 두 번 실행되는 오류:
  // 병원 카드의 전체 onClick={onSelectHospital} 이벤트와 내부의 '즐겨찾기' 버튼 onClick에서
  // event.stopPropagation() 호출이 누락되어 있음.
  // 이로 인해 사용자가 카드 내부의 하트(즐겨찾기) 버튼을 누르면 즐겨찾기 토글과 동시에
  // 부모 카드의 클릭 이벤트가 버블링되어 병원 상세 페이지로 의도치 않게 자동 이동함.
  const handleFavoriteClick = (e) => {
    // Missing e.stopPropagation(); -> triggers SEC-473 event bubbling
    onToggleFavorite(hospital.id);
  };

  const handleBookClick = (e) => {
    e.stopPropagation(); // Booking button correctly stops propagation
    onBookHospital(hospital.id);
  };

  return (
    <div className="hospital-card" onClick={() => onSelectHospital(hospital.id)}>
      {/* Thumbnail & Quick Status */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img
          src={hospital.image}
          alt={hospital.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, backdropFilter: 'blur(4px)' }}>
          {hospital.area}
        </div>

        {/* Favorite Button with Bug SEC-473 */}
        <button
          onClick={handleFavoriteClick}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isFavorite ? '#fee2e2' : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s ease'
          }}
          title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          <Heart
            size={18}
            color={isFavorite ? '#ef4444' : '#64748b'}
            fill={isFavorite ? '#ef4444' : 'none'}
          />
        </button>
      </div>

      {/* Hospital Details */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
            {hospital.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 800, flexShrink: 0 }}>
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{hospital.rating}</span>
          </div>
        </div>

        {/* Departments */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {hospital.departmentNames.map((dName, idx) => (
            <span key={idx} className="dept-badge">
              {dName}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color="#0284c7" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {hospital.address} (약 {hospital.distanceMeters}m)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="#10b981" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {hospital.operatingHours}
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={handleBookClick}
            style={{
              flex: 1,
              padding: '10px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={16} />
            <span>바로 예약</span>
          </button>
        </div>
      </div>
    </div>
  );
}
