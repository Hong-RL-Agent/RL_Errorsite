import React, { useState } from 'react';
import { Search, Calendar, MapPin, User, Users, DollarSign, ArrowRight } from 'lucide-react';

export default function EventGrid({
  events = [],
  categories = [],
  selectedCategory,
  onSelectCategory,
  onOpenRegister
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredEvents = events.filter((e) => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    if (dateFilter && e.event_date !== dateFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchVenue = e.venue.toLowerCase().includes(q);
      const matchSpeaker = e.speaker && e.speaker.toLowerCase().includes(q);
      if (!matchTitle && !matchVenue && !matchSpeaker) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Category Pills Bar */}
      <div className="category-filter-bar">
        <button
          className={`cat-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => onSelectCategory('ALL')}
        >
          <span>🌐 전체 카테고리 ({events.length})</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.code}
            className={`cat-pill ${selectedCategory === cat.code ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.code)}
          >
            <span>{cat.icon} {cat.name}</span>
          </button>
        ))}
      </div>

      {/* Search & Date Filter Bar */}
      <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', flex: 1, minWidth: '220px' }}>
          <Search size={15} color="#94A3B8" />
          <input
            type="text"
            placeholder="행사명, 장소, 연사 검색..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={15} color="#64748B" />
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto', padding: '7px 12px', fontSize: '12px' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {(searchQuery || dateFilter || selectedCategory !== 'ALL') && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery('');
              setDateFilter('');
              onSelectCategory('ALL');
            }}
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '20px', border: '1.5px dashed #E2E8F0' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎪</div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>조건에 맞는 행사가 없습니다</h3>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            검색어 또는 날짜 필터를 재설정해보세요.
          </p>
        </div>
      ) : (
        <div className="event-grid">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="event-card" data-event-id={evt.id} data-event-category={evt.category}>
              <div>
                <div className="event-card-header">
                  <span className="event-cat-badge">
                    {evt.category_icon} {evt.category_name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700' }}>
                    {evt.code}
                  </span>
                </div>

                <h3 className="event-title">{evt.title}</h3>
                <p className="event-desc">{evt.description}</p>

                {/* Event Metadata */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} color="#7C3AED" />
                    <span><strong>{evt.event_date}</strong> ({evt.start_time} ~ {evt.end_time})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="#F97316" />
                    <span>{evt.venue}</span>
                  </div>
                  {evt.speaker && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} color="#64748B" />
                      <span>{evt.speaker}</span>
                    </div>
                  )}
                </div>

                {/* Capacity Progress Bar */}
                <div className="capacity-box">
                  <div className="capacity-labels">
                    <span style={{ color: '#64748B' }}>
                      잔여 <strong>{evt.remaining_seats}석</strong> / 총 {evt.capacity}석
                    </span>
                    <span style={{ color: evt.occupancy_rate > 80 ? '#EA580C' : '#7C3AED' }}>
                      {evt.occupancy_rate}% 마감
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${evt.occupancy_rate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Price & Register Footer */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>일반 참가권</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#7C3AED' }}>
                    {evt.standard_price.toLocaleString()}원
                  </span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => onOpenRegister(evt, { category: selectedCategory })}
                >
                  <span>참가 신청</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
