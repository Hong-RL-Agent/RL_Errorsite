import React, { useState, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, HeartHandshake, Award, Users, ArrowRight } from 'lucide-react';
import ActivityCard from '../components/ActivityCard';
import { api } from '../api/client';

export default function Home({ navigate }) {
  const [activities, setActivities] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCat, setSelectedCat] = useState('전체');

  const categories = ['전체', '환경', '동물', '교육', '복지', '문화', '지역행사'];

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await api.getActivities({ limit: 6 });
      setActivities(res.activities || []);
    } catch {
      // ignore
    }
  };

  const handleSearch = () => {
    navigate(`/activities?search=${encodeURIComponent(keyword)}&category=${selectedCat === '전체' ? 'all' : selectedCat}`);
  };

  const popularActivities = activities.slice(0, 3);
  const recentActivities = activities.slice(3, 6);

  return (
    <div className="page-wrapper">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-sub-pill">
            <Sparkles size={16} />
            <span>우리 이웃과 함께 만드는 따뜻한 세상</span>
          </div>
          <h1 className="hero-title">우리 동네에서 함께하는<br />작은 변화, NeighborHands</h1>
          <p className="hero-desc">
            유기동물 보호, 공원 플로깅, 무료급식소 나눔부터 어르신 디지털 교육까지<br />
            가까운 지역 이웃들과 함께 뜻깊은 봉사활동에 참여해보세요.
          </p>

          <div className="hero-search-box">
            <input 
              type="text" 
              placeholder="관심 있는 봉사활동을 검색하세요 (예: 플로깅, 도서관, 동물)" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="hero-search-input"
            />
            <button className="hero-search-btn" onClick={handleSearch}>
              <Search size={18} />
              <span>검색</span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <div className="category-pills-row">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${selectedCat === cat ? 'active' : ''}`}
            onClick={() => {
              setSelectedCat(cat);
              navigate(`/activities?category=${cat === '전체' ? 'all' : cat}`);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        margin: '36px 0 48px',
        padding: '24px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--cream-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartHandshake size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>1,480+</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>누적 참여 봉사자</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>5,240시간</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>나눔 봉사 시간</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--mint-light)', color: 'var(--mint-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>120여 개</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>지역 단체 및 복지관</div>
          </div>
        </div>
      </div>

      {/* Recommended Activities */}
      <div className="section-header">
        <div className="section-title-group">
          <h2>추천 활동</h2>
          <p>마감 임박 및 이웃들이 가장 많이 신청하고 있는 추천 봉사활동입니다.</p>
        </div>
        <div className="section-link" onClick={() => navigate('/activities')}>
          <span>전체보기</span>
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="activity-grid">
        {popularActivities.map(act => (
          <ActivityCard 
            key={act.id} 
            activity={act} 
            onClick={() => navigate(`/activities/${act.id}`)}
          />
        ))}
      </div>

      {/* This week's popular activities */}
      <div className="section-header" style={{ marginTop: '48px' }}>
        <div className="section-title-group">
          <h2>이번 주 신규 봉사활동</h2>
          <p>새롭게 열린 다양한 분야의 따뜻한 나눔 활동에 첫 번째로 참여해보세요.</p>
        </div>
        <div className="section-link" onClick={() => navigate('/activities')}>
          <span>더 많은 활동 찾기</span>
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="activity-grid">
        {recentActivities.map(act => (
          <ActivityCard 
            key={act.id} 
            activity={act} 
            onClick={() => navigate(`/activities/${act.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
