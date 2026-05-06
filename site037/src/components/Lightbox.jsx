function Lightbox({ photo, count, index, isLiked, onClose, onPrevious, onNext, onToggleLike }) {
  const handlePanelClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      className="lightbox-overlay"
      data-bug-id="site037-bug02"
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} 상세 보기`}
      onClick={onClose}
    >
      <div className="lightbox-panel" onClick={handlePanelClick}>
        <button type="button" className="lightbox-close" aria-label="라이트박스 닫기" onClick={onClose}>
          X
        </button>

        <button type="button" className="lightbox-nav previous" aria-label="이전 사진" onClick={onPrevious}>
          Prev
        </button>
        <img src={photo.imageUrl} alt={`${photo.title} 확대 이미지`} />
        <button type="button" className="lightbox-nav next" aria-label="다음 사진" onClick={onNext}>
          Next
        </button>

        <aside className="lightbox-details">
          <span className="eyebrow">Project Detail</span>
          <h2>{photo.title}</h2>
          <dl>
            <div>
              <dt>Category</dt>
              <dd>{photo.categoryLabel}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{photo.location}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{photo.year}</dd>
            </div>
          </dl>
          <p>
            화면을 가득 채운 이미지를 기준으로 콘셉트, 장소, 보정 톤을 빠르게 검토할 수 있는 프로젝트 상세 모달입니다.
          </p>
          <div className="lightbox-footer">
            <button type="button" className={isLiked ? 'like-button active' : 'like-button'} onClick={() => onToggleLike(photo.id)}>
              Like {photo.likes + (isLiked ? 1 : 0)}
            </button>
            <span>
              {index + 1} / {count}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Lightbox;
