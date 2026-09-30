import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import VenueCard from '../components/VenueCard';
import EventCard from '../components/EventCard';

export default function VenuePage({ selectedVenueId = null, onSelectEvent, favorites = [], onToggleFavorite }) {
  const [venues, setVenues] = useState([]);
  const [activeVenue, setActiveVenue] = useState(null);
  const [venueEvents, setVenueEvents] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [loading, setLoading] = useState(true);

  const regions = ['전체', '서울', '경기', '부산', '대구'];

  useEffect(() => {
    loadVenues();
  }, [selectedVenueId]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const data = await api.getVenues();
      if (data && data.venues) {
        setVenues(data.venues);

        if (selectedVenueId) {
          const detail = await api.getVenueById(selectedVenueId);
          if (detail && detail.venue) {
            setActiveVenue(detail.venue);
            setVenueEvents(detail.events || []);
          }
        } else {
          setActiveVenue(null);
          setVenueEvents([]);
        }
      }
    } catch (err) {
      console.error('Failed to load venues', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVenue = async (venueId) => {
    try {
      setLoading(true);
      const detail = await api.getVenueById(venueId);
      if (detail && detail.venue) {
        setActiveVenue(detail.venue);
        setVenueEvents(detail.events || []);
      }
    } catch (err) {
      console.error('Failed to get venue detail', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter((v) => {
    if (selectedRegion !== '전체' && v.region !== selectedRegion) return false;
    return true;
  });

  return (
    <div className="venue-page-container">
      {activeVenue ? (
        <div className="venue-detail-view">
          <button className="btn-back" onClick={() => setActiveVenue(null)}>
            ← 전체 공연장 목록 보기
          </button>

          <div className="venue-detail-hero-card">
            <span className="venue-detail-region">{activeVenue.region}</span>
            <h1 className="venue-detail-name">{activeVenue.name}</h1>
            <p className="venue-detail-address">📍 {activeVenue.address}</p>
            <p className="venue-detail-capacity">🪑 좌석 규모: 약 {activeVenue.capacity?.toLocaleString()}석</p>
            <div className="venue-detail-facilities">
              <strong>주요 편의시설:</strong> {activeVenue.facilities}
            </div>
            <p className="venue-detail-desc">{activeVenue.description}</p>
          </div>

          <div className="venue-events-section">
            <h2 className="section-title">🎭 {activeVenue.name} 진행 및 예정 공연</h2>
            {venueEvents.length === 0 ? (
              <div className="empty-state">현재 예정된 공연 일정이 없습니다.</div>
            ) : (
              <div className="events-card-grid">
                {venueEvents.map((evt) => (
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
        </div>
      ) : (
        <div className="venue-list-view">
          <div className="venue-list-header">
            <h1 className="page-main-heading">전국 주요 공연장 및 문화공간</h1>
            <p className="page-subtext">세계적 수준의 전문 아트센터와 콘서트홀을 탐색해보세요.</p>
          </div>

          {/* Region filter */}
          <div className="region-filter-bar">
            {regions.map((reg) => (
              <button
                key={reg}
                className={`filter-btn ${selectedRegion === reg ? 'active' : ''}`}
                onClick={() => setSelectedRegion(reg)}
              >
                {reg}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="page-loading-spinner">공연장 정보를 불러오는 중입니다...</div>
          ) : (
            <div className="venues-grid-layout">
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onSelect={handleSelectVenue}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
