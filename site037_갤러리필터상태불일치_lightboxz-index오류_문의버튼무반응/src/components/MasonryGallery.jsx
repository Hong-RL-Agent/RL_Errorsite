import PhotoCard from './PhotoCard.jsx';

function MasonryGallery({ status, error, photos, likedPhotos, onRetry, onOpenLightbox, onToggleLike }) {
  if (status === 'loading') {
    return (
      <div className="masonry-grid loading-grid" aria-live="polite">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className={`skeleton-card skeleton-${index % 3}`} key={index}>
            <span />
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="error-panel" role="alert">
        <strong>갤러리 데이터를 불러오지 못했습니다.</strong>
        <p>{error}</p>
        <button type="button" onClick={onRetry}>
          다시 불러오기
        </button>
      </div>
    );
  }

  return (
    <div className="masonry-grid" data-bug-id="site037-bug01">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isLiked={likedPhotos.has(photo.id)}
          onOpen={onOpenLightbox}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
}

export default MasonryGallery;
