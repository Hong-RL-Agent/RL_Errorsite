import { ArrowRight, CalendarClock, FileText } from 'lucide-react';

export default function GalleryHero({ artwork, artist, onExplore, onInquiry }) {
  return (
    <section className="gallery-hero" id="top">
      <div className="hero-text">
        <span className="section-kicker">Current Exhibition</span>
        <h1>Light Archive</h1>
        <p>
          종이, 유리, 정물의 표면을 통해 빛이 머무르는 시간을 추적하는 온라인 전시입니다.
          주요 작품은 구매 문의와 프라이빗 뷰잉 예약이 가능합니다.
        </p>
        <div className="hero-actions">
          <button className="primary-button large" type="button" onClick={onExplore}>
            대표 작품 보기
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button className="ghost-button large" type="button" onClick={onInquiry}>
            <FileText size={17} aria-hidden="true" />
            전시 소개 문의
          </button>
        </div>
        <div className="hero-meta">
          <span><CalendarClock size={15} aria-hidden="true" /> 2026.05.04 - 2026.06.21</span>
          <span>Seoul Viewing Room + Online</span>
        </div>
      </div>

      <div className="hero-artwork-card">
        {artwork ? (
          <>
            <img src={artwork.image} alt={`${artwork.title} 대표 작품`} />
            <div className="hero-artwork-caption">
              <span>{artist ? artist.name : 'Atelier Artist'}</span>
              <strong>{artwork.title}</strong>
              <small>{artwork.year} · {artwork.material}</small>
            </div>
          </>
        ) : (
          <div className="hero-placeholder">작품 불러오는 중</div>
        )}
      </div>
    </section>
  );
}
