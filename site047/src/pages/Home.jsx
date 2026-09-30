import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Compass, 
  ArrowRight, 
  Calendar, 
  Search, 
  Tag, 
  Flame, 
  Award,
  Zap
} from 'lucide-react';
import ExperienceCard from '../components/ExperienceCard';
import CouponCard from '../components/CouponCard';
import { fetchApi } from '../api/client';

export default function Home({ onSelectExperience, onNavigateExplore, onShowToast }) {
  const [popularExperiences, setPopularExperiences] = useState([]);
  const [newExperiences, setNewExperiences] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    fetchApi('/api/experiences?sort=rating')
      .then(data => {
        setPopularExperiences(data.slice(0, 4));
        setNewExperiences(data.slice(4, 8));
      })
      .catch(() => {});

    fetchApi('/api/coupons')
      .then(data => setCoupons(data.slice(0, 2)))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onNavigateExplore) {
      onNavigateExplore({ keyword, region: selectedRegion });
    }
  };

  const categories = [
    { id: 'all', label: '전체 보기', icon: '✨', count: '15+ 체험' },
    { id: 'class', label: '원데이 클래스', icon: '🎨', count: '도예·베이킹·다도' },
    { id: 'tour', label: '로컬 투어', icon: '🏛️', count: '야경·역사·숲트레킹' },
    { id: 'activity', label: '액티비티 & 레저', icon: '🏄‍♂️', count: '서핑·카약·글램핑' }
  ];

  const popularRegions = [
    { name: '서울', image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&auto=format&fit=crop&q=80', count: '8개 체험' },
    { name: '제주', image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=400&auto=format&fit=crop&q=80', count: '3개 체험' },
    { name: '부산', image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&auto=format&fit=crop&q=80', count: '2개 체험' },
    { name: '강원/경기', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop&q=80', count: '2개 체험' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0284c7 100%)',
        color: '#ffffff',
        padding: '60px 40px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ maxWidth: 640 }}>
          <span className="badge badge-yellow" style={{ marginBottom: 16 }}>
            <Sparkles size={12} /> 새로운 일상을 만나는 로컬 이벤트 & 체험
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.5px', marginBottom: 16 }}>
            오늘 당신만을 위한<br />
            <span style={{ color: '#38bdf8' }}>특별한 원데이 경험</span>을 시작하세요
          </h1>
          <p style={{ fontSize: 16, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 32 }}>
            도심 속 야경 투어부터 제주 숨은 숲길 트레킹, 감성 도자기 물레 클래스까지 검증된 로컬 호스트와 함께합니다.
          </p>

          {/* Quick Search Widget */}
          <form 
            onSubmit={handleSearch}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 8 }}>
              <Search size={18} color="var(--sky-blue)" />
              <input
                id="hero-input-keyword"
                type="text"
                placeholder="체험명 또는 키워드"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: '100%', border: 'none', fontSize: 14, color: 'var(--text-main)', background: 'none' }}
              />
            </div>

            <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-color)' }} />

            <div style={{ minWidth: 120, display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 6 }}>
              <MapPin size={18} color="var(--sky-blue)" />
              <select
                id="hero-select-region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{ border: 'none', fontSize: 14, color: 'var(--text-main)', background: 'none', cursor: 'pointer' }}
              >
                <option value="all">전국 전체</option>
                <option value="서울">서울</option>
                <option value="제주">제주</option>
                <option value="부산">부산</option>
                <option value="경기">경기</option>
                <option value="강원">강원</option>
                <option value="경북">경북</option>
              </select>
            </div>

            <button
              id="hero-btn-search"
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: 'var(--radius-md)', padding: '12px 24px' }}
            >
              <span>체험 찾기</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">카테고리별 테마 탐색</h2>
            <p className="section-subtitle">원하는 스타일에 맞춰 특별한 체험을 골라보세요</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              id={`cat-card-${cat.id}`}
              onClick={() => onNavigateExplore && onNavigateExplore({ category: cat.id })}
              className="card"
              style={{
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ fontSize: 32 }}>{cat.icon}</div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-navy)' }}>{cat.label}</h4>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Experiences */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={22} color="#ef4444" /> 이번 주 인기 TOP 체험
            </h2>
            <p className="section-subtitle">참가자 만족도와 평점이 가장 높은 추천 클래스 & 투어</p>
          </div>
          <button 
            onClick={() => onNavigateExplore && onNavigateExplore({ sort: 'rating' })}
            className="btn btn-outline btn-sm"
          >
            <span>전체 보기</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-cards">
          {popularExperiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onSelect={onSelectExperience}
            />
          ))}
        </div>
      </section>

      {/* Promo Banner: Discount Coupons */}
      <section style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        padding: '28px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="badge badge-yellow">
              <Zap size={13} /> 회원 전용 혜택
            </span>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--primary-navy)', marginTop: 6 }}>
              지금 예약하면 즉시 할인되는 시즌 쿠폰
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              예약 결제 시 쿠폰 코드를 입력하거나 적용하여 알뜰하게 즐기세요.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {coupons.map((coupon) => (
            <CouponCard 
              key={coupon.code} 
              coupon={coupon} 
              onApply={() => {
                if (onShowToast) onShowToast(`쿠폰 코드 '${coupon.code}'가 클립보드에 복사되었습니다!`, 'success');
              }}
            />
          ))}
        </div>
      </section>

      {/* Popular Regions */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">인기 로컬 여행지</h2>
            <p className="section-subtitle">지역별 고유의 매력을 느낄 수 있는 이색 체험</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {popularRegions.map((region) => (
            <div
              key={region.name}
              id={`region-card-${region.name}`}
              onClick={() => onNavigateExplore && onNavigateExplore({ region: region.name })}
              style={{
                position: 'relative',
                height: 160,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <img
                src={region.image}
                alt={region.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '16px',
                color: '#fff'
              }}>
                <h4 style={{ fontSize: 18, fontWeight: 700 }}>{region.name}</h4>
                <span style={{ fontSize: 12, color: '#e2e8f0' }}>{region.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Experiences */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={22} color="var(--sky-blue)" /> 새로 오픈한 신규 체험
            </h2>
            <p className="section-subtitle">따끈따끈하게 등록된 신선한 원데이 클래스와 투어</p>
          </div>
          <button 
            onClick={() => onNavigateExplore && onNavigateExplore({})}
            className="btn btn-outline btn-sm"
          >
            <span>더 알아보기</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-cards">
          {newExperiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onSelect={onSelectExperience}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
