import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ArrowRight, MapPin, Compass, Heart, MessageSquare, Plus } from 'lucide-react';
import TravelCard from '../components/TravelCard';
import { api } from '../api/client';

export default function Home({ navigate }) {
  const [popularLogs, setPopularLogs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedDest, setSelectedDest] = useState('전체');

  const destinations = ['전체', '제주', '부산', '강릉', '경주', '오사카', '다낭'];

  useEffect(() => {
    api.getTravelLogs({ limit: 6 }).then(res => {
      setPopularLogs(res.travelLogs || []);
    }).catch(console.error);
  }, []);

  const handleSearch = () => {
    navigate(`/travel?search=${encodeURIComponent(keyword)}&destination=${selectedDest === '전체' ? 'all' : selectedDest}`);
  };

  return (
    <div className="page-wrapper">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-sub-pill">
            <Sparkles size={15} />
            <span>나만의 여행을 기록하고 공유하세요</span>
          </div>
          <h1 className="hero-title">설레는 여행의 모든 순간,<br />TripLog에 담아보세요</h1>
          <p className="hero-desc">
            제주도 해변 드라이브부터 오사카 미식 골목 투어까지<br />
            실제 여행자들이 남긴 생생한 일정과 여행기를 확인해보세요.
          </p>

          <div className="hero-search-box">
            <input 
              type="text" 
              placeholder="여행지, 도시, 테마를 검색해보세요 (예: 제주, 오사카, 해운대)"
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

      {/* Destination Pills */}
      <div className="category-pills-row">
        {destinations.map(d => (
          <button
            key={d}
            className={`category-pill ${selectedDest === d ? 'active' : ''}`}
            onClick={() => {
              setSelectedDest(d);
              navigate(`/travel?destination=${d === '전체' ? 'all' : d}`);
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Feature Navigation Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        margin: '36px 0 48px'
      }}>
        <div 
          style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--sand-border)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
          onClick={() => navigate('/travel/new')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Compass size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>여행 일정 만들기</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Day 1부터 Day N까지 타임라인으로 일정을 계획하세요.</p>
        </div>

        <div 
          style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--sand-border)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
          onClick={() => navigate('/travel')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <MapPin size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>인기 여행기 탐색</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>무한 스크롤로 수많은 여행자들의 생생한 후기를 둘러보세요.</p>
        </div>

        <div 
          style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--sand-border)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
          onClick={() => navigate('/my-travel')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--coral-light)', color: 'var(--coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Heart size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>내 여행 기록</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>내가 작성한 여행기와 저장한 일정들을 한곳에서 관리하세요.</p>
        </div>
      </div>

      {/* Popular Travel Logs Section */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            🌟 지금 가장 인기 있는 여행기
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>여행자들이 가장 많은 좋아요와 댓글을 남긴 추천 여행기입니다.</p>
        </div>
        <div 
          style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} 
          onClick={() => navigate('/travel')}
        >
          <span>전체보기</span>
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="travel-grid">
        {popularLogs.slice(0, 3).map(log => (
          <TravelCard 
            key={log.id} 
            travelLog={log} 
            onClick={() => navigate(`/travel/${log.id}`)}
          />
        ))}
      </div>

      {/* Recent Logs Section */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '48px 0 24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            ✈️ 이번 주 신규 등록 여행기
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>새롭게 올라온 따끈따끈한 여행자들의 여정을 만나보세요.</p>
        </div>
        <div 
          style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} 
          onClick={() => navigate('/travel')}
        >
          <span>더 많은 여행기 보기</span>
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="travel-grid">
        {popularLogs.slice(3, 6).map(log => (
          <TravelCard 
            key={log.id} 
            travelLog={log} 
            onClick={() => navigate(`/travel/${log.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
