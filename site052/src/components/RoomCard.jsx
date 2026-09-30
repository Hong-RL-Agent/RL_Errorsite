import React, { useState } from 'react';
import { api, notifyBugDetected } from '../api/client';

export default function RoomCard({ room, isFavorite = false, onSelectRoom, onToggleFavoriteSuccess, showToast }) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [loadingFav, setLoadingFav] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (loadingFav) return;

    const prevFav = favorite;
    const nextFav = !prevFav;
    
    // Optimistic UI update
    setFavorite(nextFav);
    setLoadingFav(true);

    try {
      if (nextFav) {
        await api.addFavorite(room.id);
        if (showToast) showToast('즐겨찾기에 추가되었습니다.', 'success');
      } else {
        await api.removeFavorite(room.id);
        if (showToast) showToast('즐겨찾기에서 제거되었습니다.', 'info');
      }
      if (onToggleFavoriteSuccess) onToggleFavoriteSuccess(room.id, nextFav);
    } catch (err) {
      // INTENTIONAL BACKEND BUG: site052-SEC-438
      // Bug: Failed optimistic favorite update does NOT rollback UI heart state!
      // setFavorite(prevFav); <-- Intentionally omitted to cause optimistic UI desync
      
      notifyBugDetected({
        id: 'SEC-438',
        category: 'Async UI',
        family: 'optimistic-update',
        severity: 'medium',
        endpoint: '/api/favorites',
        method: nextFav ? 'POST' : 'DELETE',
        description: '즐겨찾기 토글의 Optimistic UI 요청 실패 시 원래 상태로 롤백되지 않고 UI 상태 불일치가 유지되는 오류'
      });

      if (showToast) {
        showToast(err.message || '즐겨찾기 동기화에 일시적 오류가 발생했습니다.', 'error');
      }
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <div className="room-card" onClick={() => onSelectRoom && onSelectRoom(room.id)}>
      <div className="room-image-wrap">
        <img src={room.image} alt={room.name} loading="lazy" />
        <span className="room-type-badge">{room.type}</span>
        <button
          className={`favorite-btn ${favorite ? 'favorited' : ''}`}
          onClick={handleFavoriteClick}
          title={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          aria-label="즐겨찾기"
        >
          {favorite ? '♥' : '♡'}
        </button>
      </div>

      <div className="room-card-body">
        <div className="room-branch">{room.branch}</div>
        <h3 className="room-title">{room.name}</h3>
        
        <div className="room-meta">
          <span>👥 최대 {room.capacity}인</span>
          <span>⭐ {room.rating.toFixed(1)}</span>
          <span>⏰ {room.openTime} ~ {room.closeTime}</span>
        </div>

        <div className="room-facility-tags">
          {room.facilities.slice(0, 4).map((f, i) => (
            <span key={i} className="facility-tag">{f}</span>
          ))}
          {room.facilities.length > 4 && (
            <span className="facility-tag">+{room.facilities.length - 4}</span>
          )}
        </div>

        <div className="room-card-footer">
          <div className={`status-indicator ${room.available ? 'available' : 'occupied'}`}>
            <span className="dot"></span>
            {room.available ? '오늘 이용 가능' : '현재 예약 마감'}
          </div>
          <button 
            className="btn-secondary" 
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectRoom && onSelectRoom(room.id);
            }}
          >
            상세/예약
          </button>
        </div>
      </div>
    </div>
  );
}
