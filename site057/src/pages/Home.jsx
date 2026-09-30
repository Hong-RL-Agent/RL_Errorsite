import React from 'react';
import { Zap, Bike, ShieldCheck, Leaf, ArrowRight, MapPin, Battery, Award } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import VehicleMap from '../components/VehicleMap';

export default function Home({
  vehicles = [],
  stations = [],
  activeRental = null,
  onSelectVehicle,
  onRentVehicle,
  onNavigateTab
}) {
  // Recommend top 6 vehicles
  const recommendedVehicles = vehicles.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="max-w-screen">
          <div className="hero-tag">
            <Zap size={16} fill="#a3e635" />
            <span>대한민국 No.1 친환경 스마트 도심 모빌리티</span>
          </div>

          <h1 className="hero-title">
            가까운 RideOn을 찾고<br />
            바로 출발하세요.
          </h1>
          <p className="hero-desc">
            복잡한 출퇴근길부터 여유로운 주말 한강 라이딩까지.
            전기자전거와 전동킥보드로 도심 속 빠른 이동의 즐거움을 경험하세요.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onNavigateTab('nearby')}
              style={{
                padding: '14px 28px',
                background: '#84cc16',
                color: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <MapPin size={18} />
              <span>주변 차량 찾기</span>
            </button>

            <button
              onClick={() => onNavigateTab('history')}
              style={{
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                backdropFilter: 'blur(6px)'
              }}
            >
              <span>이용 기록 조회</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-screen" style={{ paddingTop: '36px' }}>
        {/* Active Rental Alert (if any) */}
        {activeRental && (
          <div className="rental-active-banner">
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.9 }}>
                현재 주행 중인 모빌리티
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>
                {activeRental.vehicleName}
              </h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px' }}>
                출발지: {activeRental.startStation} • 시작: {activeRental.startTime.slice(11, 16)}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('rental')}
              style={{
                padding: '12px 24px',
                background: '#ffffff',
                color: '#15803d',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              주행 및 반납 관리 바로가기 →
            </button>
          </div>
        )}

        {/* Mobility Map */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
                주요 도심 스테이션 라이브 맵
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                실시간 대여 가능한 자전거와 킥보드 거치 현황입니다.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('nearby')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#65a30d', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem' }}
            >
              <span>전체 거치대 보기</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <VehicleMap
            stations={stations}
            onSelectStation={() => onNavigateTab('nearby')}
          />
        </div>

        {/* Feature 3 Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '48px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '44px', height: '44px', background: '#ecfccb', color: '#65a30d', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Zap size={24} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              고성능 파워 어시스트
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              350W 허브모터와 10인치 광폭 튜브리스 타이어로 언덕길도 힘들이지 않고 안전하게 주행합니다.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '44px', height: '44px', background: '#e0f2fe', color: '#0284c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <ShieldCheck size={24} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              안심 종합 보험 자동 적용
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              모든 대여 건에 대인, 대물, 본인 치료비까지 보장하는 업계 최고 수준의 단체 상해보험이 적용됩니다.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '44px', height: '44px', background: '#fef3c7', color: '#d97706', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Leaf size={24} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              그린 탄소 중립 에코 리워드
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              달릴 때마다 적립되는 탄소 절감 포인트로 무료 주행 패스 및 그린 멤버십 혜택을 누려보세요.
            </p>
          </div>
        </div>

        {/* Recommended / Surrounding Vehicles */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
              추천 인기 모빌리티
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              현재 위치에서 가장 가깝고 완충 상태인 인기 자전거 & 킥보드입니다.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('nearby')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#65a30d', fontWeight: 800, cursor: 'pointer' }}
          >
            <span>전체 차량 보기</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="vehicles-grid">
          {recommendedVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelectVehicle={onSelectVehicle}
              onRentVehicle={onRentVehicle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
