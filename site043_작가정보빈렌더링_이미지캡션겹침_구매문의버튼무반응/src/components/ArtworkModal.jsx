import { CalendarClock, FileText, X } from 'lucide-react';

export default function ArtworkModal({ artwork, artists, onClose, onInquiry }) {
  if (!artwork) {
    return null;
  }

  // INTENTIONAL GUI BUG: site043-bug01
  // CSV Error: 작가 정보 빈 렌더링
  // Type: empty-artist-info-render
  // Description: artistId 타입 불일치로 특정 작품의 작가 정보를 매칭하지 못해 빈 영역으로 렌더링됨.
  const artist =
    artwork.id === 'art-103'
      ? artists.find((item) => item.id === artwork.artistId)
      : artists.find((item) => String(item.id) === String(artwork.artistId));

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="artwork-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close icon-button" type="button" onClick={onClose} aria-label="작품 상세 닫기">
          <X size={18} aria-hidden="true" />
        </button>

        <img src={artwork.image} alt={`${artwork.title} 상세 이미지`} />

        <div className="modal-detail">
          <span className="section-kicker">Artwork Detail</span>
          <h2 id="artwork-modal-title">{artwork.title}</h2>
          <dl>
            <div>
              <dt>제작 연도</dt>
              <dd>{artwork.year}</dd>
            </div>
            <div>
              <dt>재료</dt>
              <dd>{artwork.material}</dd>
            </div>
            <div>
              <dt>가격</dt>
              <dd>{artwork.priceRange}</dd>
            </div>
          </dl>

          <section className="modal-artist-info" data-bug-id="site043-bug01" aria-label="작가 정보">
            {artist ? (
              <>
                <img src={artist.profileImage} alt={`${artist.name} 프로필`} />
                <div>
                  <strong>{artist.name}</strong>
                  <p>{artist.intro}</p>
                  <small>대표작: {artist.signatureWork}</small>
                </div>
              </>
            ) : (
              <div className="artist-empty-space" aria-hidden="true" />
            )}
          </section>

          <div className="modal-actions">
            <button className="primary-button" type="button" onClick={() => onInquiry(artwork)}>
              <FileText size={16} aria-hidden="true" />
              구매 문의
            </button>
            <span><CalendarClock size={15} aria-hidden="true" /> 프라이빗 뷰잉 가능</span>
          </div>
        </div>
      </section>
    </div>
  );
}
