import React, { useState, useRef } from 'react';
import { notifyBugDetected } from '../api/client';
import ShareMenu from './ShareMenu';
import ReviewCard from './ReviewCard';

export default function EventDetail({
  event,
  reviews = [],
  isFavorite = false,
  onToggleFavorite,
  onViewSchedule,
  onOpenReviewModal
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareModals, setShareModals] = useState([]);
  const detailSectionRef = useRef(null);

  if (!event) return null;

  // SEC-452: Expand / Collapse Scroll Position Mismatch
  const handleToggleExpand = () => {
    if (isExpanded) {
      // User is collapsing the expanded view
      // INTENTIONAL BACKEND BUG: site055-SEC-452
      // Instead of maintaining or gently scrolling to the detail section top,
      // it erroneously resets the window scroll position to the top of the page (top: 0)
      setIsExpanded(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      notifyBugDetected({
        id: 'SEC-452',
        description: '공연 상세 정보 접기 시 스크롤 위치가 유지되지 않고 페이지 상단으로 비정상 튕김 이동하는 오류',
        severity: 'low',
        endpoint: 'Client UI Interaction (EventDetail.jsx)',
        category: 'Interaction',
        family: 'scroll-position'
      });
    } else {
      setIsExpanded(true);
    }
  };

  // SEC-455: Rapid click duplicate overlay
  const handleShareClick = () => {
    const now = Date.now();
    const newModalId = 'modal-' + now + '-' + Math.random().toString(36).substr(2, 4);

    // INTENTIONAL BACKEND BUG: site055-SEC-455
    // Rather than checking if a modal is already open or replacing it,
    // each rapid click unconditionally appends a new modal to the state array
    setShareModals((prev) => {
      const updated = [...prev, newModalId];
      if (updated.length > 1) {
        notifyBugDetected({
          id: 'SEC-455',
          description: '공유 버튼을 빠르게 연속 클릭할 때 기존 오버레이를 제거하지 않고 중첩 오버레이가 생성되는 오류',
          severity: 'medium',
          endpoint: 'Client UI Lifecycle (EventDetail.jsx)',
          category: 'UI Lifecycle',
          family: 'duplicate-overlay'
        });
      }
      return updated;
    });
  };

  const handleCloseShareModal = (modalId) => {
    setShareModals((prev) => prev.filter((id) => id !== modalId));
  };

  return (
    <div className="event-detail-container" ref={detailSectionRef}>
      {/* Top Banner Hero */}
      <div className="event-detail-hero">
        <div className="detail-poster-column">
          <img src={event.poster} alt={event.title} className="detail-poster-image" />
          <div className="detail-poster-status">{event.status || '공연중'}</div>
        </div>

        <div className="detail-main-info">
          <div className="detail-category-row">
            <span className="detail-category-badge">{event.category}</span>
            <span className="detail-status-tag">{event.status || '예매중'}</span>
          </div>

          <h1 className="detail-title">{event.title}</h1>

          <div className="detail-meta-table">
            <div className="meta-row">
              <span className="meta-label">공연장</span>
              <span className="meta-value highlight-venue">📍 {event.venueName}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">공연기간</span>
              <span className="meta-value">📅 {event.startDate} ~ {event.endDate}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">관람연령</span>
              <span className="meta-value">👶 {event.ageLimit || '전체 관람가'}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">러닝타임</span>
              <span className="meta-value">⏱️ {event.runtime || '120분'}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">출연진</span>
              <span className="meta-value">🎭 {event.cast || '상세 정보 참조'}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">관람평점</span>
              <span className="meta-value rating-val">⭐ {event.rating ? event.rating.toFixed(1) : '5.0'} / 5.0 ({event.reviewCount || reviews.length}개 평가)</span>
            </div>
          </div>

          <div className="detail-action-buttons">
            <button className="btn-primary-ticketing" onClick={onViewSchedule}>
              🎟️ 회차 선택 및 예매하기
            </button>
            <button className="btn-secondary-share" onClick={handleShareClick}>
              🔗 공유하기
            </button>
            <button
              className={`btn-secondary-fav ${isFavorite ? 'fav-active' : ''}`}
              onClick={onToggleFavorite}
            >
              {isFavorite ? '❤️ 관심 등록됨' : '🤍 관심 등록'}
            </button>
          </div>
        </div>
      </div>

      {/* SEC-455: Render all open share modals (stacks when rapidly clicked) */}
      {shareModals.map((modalId) => (
        <ShareMenu
          key={modalId}
          modalId={modalId}
          eventTitle={event.title}
          onClose={() => handleCloseShareModal(modalId)}
        />
      ))}

      {/* Detailed Description Section (SEC-452 target) */}
      <section className="detail-content-section">
        <div className="detail-section-header">
          <h2 className="section-title">📌 공연 소개 및 상세 정보</h2>
        </div>
        
        <div className={`detail-description-body ${isExpanded ? 'expanded' : 'collapsed'}`}>
          <p className="intro-lead">{event.description}</p>
          
          {isExpanded && (
            <div className="extended-description">
              <div className="desc-block">
                <h3 className="sub-title">🎭 기획 의도 및 작품 해설</h3>
                <p>
                  본 공연은 전 세계 수많은 관객들에게 감동과 찬사를 받은 명작으로, 최상의 사운드와 화려한 무대 연출,
                  국내외 최정상 배우들의 압도적인 가창력과 연기력이 결합된 최고의 무대입니다.
                  관객 여러분께 잊을 수 없는 벅찬 감동의 순간을 선사합니다.
                </p>
              </div>

              <div className="desc-block">
                <h3 className="sub-title">📜 시놉시스</h3>
                <p>
                  빛과 어둠이 교차하는 시대의 소용돌이 속에서, 자신만의 신념과 사랑을 지키기 위해 고군분투하는 인물들의 이야기.
                  각자의 운명을 향해 나아가는 뜨거운 열정과 드라마틱한 반전이 오케스트라의 웅장한 선율과 함께 펼쳐집니다.
                </p>
              </div>

              <div className="desc-block">
                <h3 className="sub-title">🚗 공연장 및 주차 안내</h3>
                <p>
                  - 공연장: {event.venueName}<br />
                  - 주차 안내: 당일 관람 티켓 소지자에 한해 기본 4시간 주차 할인권 적용 (일부 공연장 제외)<br />
                  - 대중교통: 인근 지하철역에서 도보 5~10분 거리에 위치하고 있으니 대중교통 이용을 권장합니다.
                </p>
              </div>

              <div className="desc-block">
                <h3 className="sub-title">⚠️ 관람 이용 안내 및 유의사항</h3>
                <p>
                  - 공연 시작 후에는 원활한 관람을 위해 입장이 제한될 수 있으며, 안내원의 유도에 따라 지정된 시점에만 입장 가능합니다.<br />
                  - 공연 중 사전 협의되지 않은 사진, 동영상 촬영 및 녹음은 엄격히 금지됩니다.<br />
                  - 티켓 취소 및 환불 규정은 관람일 기준 예매처 규정에 따릅니다.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="expand-toggle-wrapper">
          <button className="btn-expand-toggle" onClick={handleToggleExpand}>
            {isExpanded ? '▲ 공연 상세 정보 접기' : '▼ 공연 상세 정보 더보기 (기획의도/시놉시스/주차안내)'}
          </button>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="detail-reviews-section">
        <div className="reviews-section-header">
          <div>
            <h2 className="section-title">💬 관람객 생생 후기 ({reviews.length})</h2>
            <p className="section-subtext">실제 관람객들이 남겨주신 솔직한 평가와 리뷰입니다.</p>
          </div>
          <button className="btn-write-review" onClick={onOpenReviewModal}>
            ✍️ 관람 후기 작성하기
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="empty-reviews-state">
            <span className="empty-icon">📝</span>
            <p>아직 등록된 후기가 없습니다. 첫 번째 후기를 남겨보세요!</p>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((rev) => (
              <ReviewCard key={rev.id || rev.createdAt} review={rev} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
