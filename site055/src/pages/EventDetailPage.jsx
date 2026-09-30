import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import EventDetail from '../components/EventDetail';

export default function EventDetailPage({
  eventId,
  onBack,
  onNavigateSchedule,
  onOpenReviewModal,
  favorites = [],
  onToggleFavorite
}) {
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const [evtData, revData] = await Promise.all([
        api.getEventById(eventId),
        api.getEventReviews(eventId)
      ]);

      if (evtData && evtData.event) {
        setEvent(evtData.event);
      }
      if (revData && revData.reviews) {
        setReviews(revData.reviews);
      }
    } catch (err) {
      console.error('Failed to load event details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loading-spinner">공연 상세 정보를 불러오는 중입니다...</div>;
  }

  if (!event) {
    return (
      <div className="error-fallback-container">
        <h2>공연 정보를 찾을 수 없습니다.</h2>
        <button className="btn-back" onClick={onBack}>
          ← 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const isFavorite = favorites.includes(event.id);

  return (
    <div className="event-detail-page-wrapper">
      <div className="detail-breadcrumb-bar">
        <button className="btn-breadcrumb-back" onClick={onBack}>
          ← 목록으로 돌아가기
        </button>
        <span className="breadcrumb-current">{event.category} &gt; {event.title}</span>
      </div>

      <EventDetail
        event={event}
        reviews={reviews}
        isFavorite={isFavorite}
        onToggleFavorite={() => onToggleFavorite(event.id)}
        onViewSchedule={() => onNavigateSchedule(event.id)}
        onOpenReviewModal={() => onOpenReviewModal(event)}
      />
    </div>
  );
}
