import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';

export default function Events({
  initialParams = {},
  onSelectEvent,
  favorites = [],
  onToggleFavorite
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState(initialParams.category || '전체');
  const [region, setRegion] = useState(initialParams.region || '전체');
  const [eventType, setEventType] = useState(initialParams.eventType || '전체');
  const [ageLimit, setAgeLimit] = useState(initialParams.ageLimit || '전체');
  const [search, setSearch] = useState(initialParams.search || '');
  const [sortBy, setSortBy] = useState('popular');

  const categories = ['전체', '뮤지컬', '연극', '콘서트', '클래식', '전시', '페스티벌', '영화제', '가족 공연', '아동 공연'];
  const regions = ['전체', '서울', '경기', '부산', '대구'];
  const eventTypes = ['전체', '실내', '야외', '온라인'];
  const ageLimits = ['전체', '전체 관람가', '8세 이상', '12세 이상', '14세 이상', '15세 이상', '19세 이상'];

  useEffect(() => {
    fetchEvents();
  }, [category, region, search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category && category !== '전체') params.category = category;
      if (region && region !== '전체') params.region = region;
      if (search) params.search = search;

      const data = await api.getEvents(params);
      if (data && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (keyword) => {
    setSearch(keyword);
  };

  // Client-side filtering for ageLimit and eventType if applicable
  const filteredEvents = events.filter((evt) => {
    if (ageLimit !== '전체' && evt.ageLimit && !evt.ageLimit.includes(ageLimit)) {
      return false;
    }
    return true;
  });

  // Sorting
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
    if (sortBy === 'date') return (a.startDate || '').localeCompare(b.startDate || '');
    return 0; // default popular
  });

  return (
    <div className="events-page-container">
      <div className="events-header-bar">
        <h1 className="page-main-heading">공연·전시 전체 탐색</h1>
        <div className="events-search-box">
          <SearchBar initialQuery={search} onSearch={handleSearchSubmit} />
        </div>
      </div>

      {/* Filter Panels */}
      <div className="filters-container-card">
        {/* Category Filter */}
        <div className="filter-group">
          <span className="filter-label">장르/카테고리:</span>
          <div className="filter-buttons-row">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div className="filter-group">
          <span className="filter-label">지역:</span>
          <div className="filter-buttons-row">
            {regions.map((reg) => (
              <button
                key={reg}
                className={`filter-btn ${region === reg ? 'active' : ''}`}
                onClick={() => setRegion(reg)}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Type (실내 / 야외 / 온라인) */}
        <div className="filter-group">
          <span className="filter-label">공연 유형:</span>
          <div className="filter-buttons-row">
            {eventTypes.map((type) => (
              <button
                key={type}
                className={`filter-btn ${eventType === type ? 'active' : ''}`}
                onClick={() => setEventType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Age Limit Filter */}
        <div className="filter-group">
          <span className="filter-label">관람 연령:</span>
          <div className="filter-buttons-row">
            {ageLimits.map((age) => (
              <button
                key={age}
                className={`filter-btn ${ageLimit === age ? 'active' : ''}`}
                onClick={() => setAgeLimit(age)}
              >
                {age}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Count and Sort Selector */}
      <div className="events-results-bar">
        <span className="results-count-text">
          총 <strong>{sortedEvents.length}</strong>개의 행사가 있습니다.
        </span>

        <div className="sort-select-wrapper">
          <label htmlFor="sort-select">정렬:</label>
          <select
            id="sort-select"
            className="sort-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">추천/인기순</option>
            <option value="rating">평점 높은순</option>
            <option value="reviews">후기 많은순</option>
            <option value="date">개막일순</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="loading-state-view">공연 목록을 불러오는 중입니다...</div>
      ) : sortedEvents.length === 0 ? (
        <div className="no-events-view">
          <span className="no-events-icon">🔎</span>
          <h3>조건에 맞는 공연이나 전시가 없습니다.</h3>
          <p>다른 검색어나 필터를 선택해보세요.</p>
        </div>
      ) : (
        <div className="events-card-grid">
          {sortedEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              onSelect={onSelectEvent}
              isFavorite={favorites.includes(evt.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
