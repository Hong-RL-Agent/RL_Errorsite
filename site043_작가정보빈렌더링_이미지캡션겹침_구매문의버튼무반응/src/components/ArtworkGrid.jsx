import { AlertTriangle, RefreshCw } from 'lucide-react';
import ArtworkCard from './ArtworkCard.jsx';

export default function ArtworkGrid({
  artworks,
  artists,
  loading,
  error,
  onRetry,
  onOpenDetail,
  onOpenInquiry
}) {
  if (loading) {
    return (
      <div className="artwork-grid" aria-live="polite">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="artwork-card skeleton-card" key={index}>
            <div className="skeleton-art" />
            <div className="skeleton-line wide" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-state error-state" role="alert">
        <AlertTriangle size={18} aria-hidden="true" />
        <div>
          <strong>작품 데이터를 불러오지 못했습니다.</strong>
          <span>{error}</span>
        </div>
        <button type="button" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" />
          다시 시도
        </button>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="api-state">
        <strong>조건에 맞는 작품이 없습니다.</strong>
        <span>필터를 조정하면 더 많은 작품을 볼 수 있습니다.</span>
      </div>
    );
  }

  return (
    <div className="artwork-grid">
      {artworks.map((artwork) => (
        <ArtworkCard
          key={artwork.id}
          artwork={artwork}
          artist={artists.find((item) => String(item.id) === String(artwork.artistId))}
          onOpenDetail={onOpenDetail}
          onOpenInquiry={onOpenInquiry}
        />
      ))}
    </div>
  );
}
