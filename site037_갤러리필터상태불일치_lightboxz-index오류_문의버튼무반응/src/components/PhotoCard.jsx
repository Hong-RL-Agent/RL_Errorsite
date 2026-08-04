function PhotoCard({ photo, isLiked, onOpen, onToggleLike }) {
  const visibleLikeCount = photo.likes + (isLiked ? 1 : 0);

  const handleLikeClick = (event) => {
    event.stopPropagation();
    onToggleLike(photo.id);
  };

  return (
    <article className={`photo-card ${photo.height}`} onClick={() => onOpen(photo.id)}>
      <img src={photo.imageUrl} alt={`${photo.title} 포트폴리오 사진`} loading="lazy" />
      <div className="photo-card-overlay">
        <span>{photo.categoryLabel}</span>
        <h3>{photo.title}</h3>
        <p>
          {photo.location} · {photo.year}
        </p>
        <button
          type="button"
          className={isLiked ? 'like-button active' : 'like-button'}
          aria-pressed={isLiked}
          onClick={handleLikeClick}
        >
          Like {visibleLikeCount}
        </button>
      </div>
    </article>
  );
}

export default PhotoCard;
