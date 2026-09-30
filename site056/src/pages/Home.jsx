import React, { useState } from 'react';
import { Shield, Search, ArrowRight, CheckCircle2, Award, Calendar, Wrench, FileSearch, Sparkles } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';

export default function Home({
  vehicles = [],
  favorites = [],
  onToggleFavorite,
  onSelectVehicle,
  onBookInspection,
  onNavigateTab,
  onSearchQuick
}) {
  const [quickBrand, setQuickBrand] = useState('전체');
  const [quickModel, setQuickModel] = useState('');
  const [quickRegion, setQuickRegion] = useState('전체');
  const [quickPrice, setQuickPrice] = useState('');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    onSearchQuick({
      brand: quickBrand,
      model: quickModel,
      region: quickRegion,
      priceMax: quickPrice
    });
  };

  const featuredVehicles = vehicles.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-screen hero-content">
          <div className="hero-tag">
            <Sparkles size={16} color="#60a5fa" />
            <span>국내 1위 중고차 안심 정밀진단 플랫폼</span>
          </div>

          <h1 className="hero-title">
            믿을 수 있는 중고차 구매,<br />
            점검부터 시작하세요.
          </h1>
          <p className="hero-subtitle">
            공인 국가기술 정비기능장이 120가지 항목을 직접 진단하고 투명한 점검 리포트를 제공합니다.
            허위매물과 침수차, 사고 은폐 걱정 없이 안심하고 선택하세요.
          </p>

          {/* Quick Search Box */}
          <div className="hero-search-card">
            <form onSubmit={handleHeroSearch} className="search-grid">
              <div className="search-group">
                <label className="search-label">제조사 / 브랜드</label>
                <select
                  value={quickBrand}
                  onChange={(e) => setQuickBrand(e.target.value)}
                  className="search-select"
                >
                  <option value="전체">전체 제조사</option>
                  <option value="현대">현대</option>
                  <option value="기아">기아</option>
                  <option value="제네시스">제네시스</option>
                  <option value="BMW">BMW</option>
                  <option value="벤츠">벤츠</option>
                </select>
              </div>

              <div className="search-group">
                <label className="search-label">모델명 검색</label>
                <input
                  type="text"
                  placeholder="예: 그랜저, G80, K5"
                  value={quickModel}
                  onChange={(e) => setQuickModel(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="search-group">
                <label className="search-label">검사 센터 지역</label>
                <select
                  value={quickRegion}
                  onChange={(e) => setQuickRegion(e.target.value)}
                  className="search-select"
                >
                  <option value="전체">전국 센터</option>
                  <option value="강남">서울 강남</option>
                  <option value="수원">경기 수원</option>
                  <option value="성남">경기 분당/성남</option>
                  <option value="인천">인천 서구</option>
                  <option value="고양">경기 일산/고양</option>
                </select>
              </div>

              <div className="search-group">
                <label className="search-label">최대 예산 (만원)</label>
                <input
                  type="number"
                  placeholder="예: 4000"
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                  className="search-input"
                />
              </div>

              <button type="submit" className="search-btn">
                <Search size={18} />
                <span>차량 검색</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-screen">
        {/* Service Feature Highlights */}
        <div className="service-banner-grid">
          <div className="service-banner-card">
            <div className="service-banner-icon">
              <Award size={26} />
            </div>
            <div>
              <h4 className="service-banner-title">120개 항목 정밀진단</h4>
              <p className="service-banner-text">
                골격 프레임, 도막 두께, 엔진/미션 내시경, OBD2 컴퓨터 스캔까지 오차 없이 진단합니다.
              </p>
            </div>
          </div>

          <div className="service-banner-card">
            <div className="service-banner-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Calendar size={26} />
            </div>
            <div>
              <h4 className="service-banner-title">원하는 날짜·시간 간편예약</h4>
              <p className="service-banner-text">
                가까운 직영 점검센터를 선택하고 1분 만에 예약 완료. 전문 진단사가 1:1로 밀착 점검합니다.
              </p>
            </div>
          </div>

          <div className="service-banner-card">
            <div className="service-banner-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <FileSearch size={26} />
            </div>
            <div>
              <h4 className="service-banner-title">모바일 리포트 & 서류 검증</h4>
              <p className="service-banner-text">
                점검 당일 고해상도 하부 사진과 상세 판정 결과표를 웹/모바일에서 즉시 열람하고 다운로드하세요.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Vehicles Section */}
        <div className="section-header">
          <div>
            <h2 className="section-title">추천 검증 완료 차량</h2>
            <p className="section-desc">AutoCheck 정밀진단을 통과한 우수 중고차 매물입니다.</p>
          </div>
          <button className="section-more-btn" onClick={() => onNavigateTab('vehicles')}>
            <span>전체 차량 보기</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="vehicles-grid">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isFavorite={favorites.includes(vehicle.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectVehicle={onSelectVehicle}
              onBookInspection={onBookInspection}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
