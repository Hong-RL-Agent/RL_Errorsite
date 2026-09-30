import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import SearchBar from '../components/SearchBar';
import EventCard from '../components/EventCard';
import VenueCard from '../components/VenueCard';

export default function Home({ onNavigate, onSelectEvent, onSelectVenue, favorites = [], onToggleFavorite }) {
  const [hotEvents, setHotEvents] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [newEvents, setNewEvents] = useState([]);
  const [exhibits, setExhibits] = useState([]);
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [recData, allEventsData, venuesData] = await Promise.all([
        api.getRecommendations(),
        api.getEvents(),
        api.getVenues()
      ]);

      if (recData && recData.hotEvents) {
        setHotEvents(recData.hotEvents);
      }
      if (recData && recData.featuredVenues) {
        setFeaturedVenues(recData.featuredVenues);
      }

      if (allEventsData && allEventsData.events) {
        const evts = allEventsData.events;
        setTodayEvents(evts.filter((e) => e.status === '공연중' || e.status === '전시중').slice(0, 4));
        setNewEvents(evts.slice(6, 10));
        setExhibits(evts.filter((e) => e.category === '전시').slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load home data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (keyword) => {
    onNavigate('events', { search: keyword });
  };

  const categories = [
    { name: '뮤지컬', icon: '🎭' },
    { name: '연극', icon: '🎬' },
    { name: '콘서트', icon: '🎤' },
    { name: '클래식', icon: '🎻' },
    { name: '전시', icon: '🎨' },
    { name: '페스티벌', icon: '🎪' },
    { name: '영화제', icon: '🎞️' },
    { name: '가족 공연', icon: '👨‍👩‍👧' },
    { name: '아동 공연', icon: '🎈' }
  ];

  return (
    <div className="home-page-container">
      {/* Hero Showcase Banner */}
      <section className="home-hero-section">
        <div className="hero-content">
          <div className="hero-badge">Curated Culture & Live Shows</div>
          <h1 className="hero-title">일상에 감동을 더하는 문화생활, <span className="hero-highlight">CulturePick</span></h1>
          <p className="hero-subtitle">
            뮤지컬, 콘서트, 클래식, 전시까지 대한민국 최고의 문화 이벤트를 한곳에서 만나보세요.
          </p>

          <div className="hero-search-wrapper">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="hero-stat-num">40+</span>
              <span className="hero-stat-label">진행 공연·전시</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">15+</span>
              <span className="hero-stat-label">전국 전문 공연장</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">실시간 좌석 연동</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Shortcut Grid */}
      <section className="home-category-shortcuts">
        <div className="category-chips-grid">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="cat-chip-btn"
              onClick={() => onNavigate('events', { category: cat.name })}
            >
              <span className="cat-chip-icon">{cat.icon}</span>
              <span className="cat-chip-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 이번 주 인기 공연 TOP */}
      <section className="home-section">
        <div className="section-header-flex">
          <div>
            <h2 className="section-heading">🔥 이번 주 인기 공연 TOP</h2>
            <p className="section-subtext">관객들의 뜨거운 찬사를 받고 있는 실시간 랭킹</p>
          </div>
          <button className="btn-view-all" onClick={() => onNavigate('events')}>
            전체보기 →
          </button>
        </div>

        <div className="events-card-grid">
          {hotEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              onSelect={onSelectEvent}
              isFavorite={favorites.includes(evt.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* 오늘 볼 수 있는 행사 */}
      <section className="home-section section-bg-beige">
        <div className="section-header-flex">
          <div>
            <h2 className="section-heading">✨ 오늘 볼 수 있는 행사</h2>
            <p className="section-subtext">현재 활발히 진행 중인 생생한 공연 & 전시</p>
          </div>
          <button className="btn-view-all" onClick={() => onNavigate('events', { status: '공연중' })}>
            더보기 →
          </button>
        </div>

        <div className="events-card-grid">
          {todayEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              onSelect={onSelectEvent}
              isFavorite={favorites.includes(evt.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* 신규 등록 공연 */}
      <section className="home-section">
        <div className="section-header-flex">
          <div>
            <h2 className="section-heading">🆕 신규 등록 공연</h2>
            <p className="section-subtext">새롭게 오픈된 프리미엄 티켓 라인업</p>
          </div>
          <button className="btn-view-all" onClick={() => onNavigate('events')}>
            더보기 →
          </button>
        </div>

        <div className="events-card-grid">
          {newEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              onSelect={onSelectEvent}
              isFavorite={favorites.includes(evt.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* 추천 전시 */}
      <section className="home-section section-bg-beige">
        <div className="section-header-flex">
          <div>
            <h2 className="section-heading">🎨 이달의 추천 전시</h2>
            <p className="section-subtext">원작의 감동과 몰입형 미디어아트의 향연</p>
          </div>
          <button className="btn-view-all" onClick={() => onNavigate('events', { category: '전시' })}>
            전시 전체보기 →
          </button>
        </div>

        <div className="events-card-grid">
          {exhibits.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              onSelect={onSelectEvent}
              isFavorite={favorites.includes(evt.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* 인기 공연장 */}
      <section className="home-section">
        <div className="section-header-flex">
          <div>
            <h2 className="section-heading">🏛️ 대표 문화예술 공연장</h2>
            <p className="section-subtext">최상의 음향과 관람 환경을 자랑하는 랜드마크</p>
          </div>
          <button className="btn-view-all" onClick={() => onNavigate('venues')}>
            공연장 전체보기 →
          </button>
        </div>

        <div className="venues-grid-layout">
          {featuredVenues.map((v) => (
            <VenueCard key={v.id} venue={v} onSelect={onSelectVenue} />
          ))}
        </div>
      </section>
    </div>
  );
}
