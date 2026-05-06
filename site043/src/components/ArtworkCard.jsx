import { FileText, Search } from 'lucide-react';

export default function ArtworkCard({ artwork, artist, onOpenDetail, onOpenInquiry }) {
  const overlapCard = artwork.id === 'art-105';

  // INTENTIONAL GUI BUG: site043-bug03
  // CSV Error: 구매 문의 버튼 무반응
  // Type: inquiry-button-no-response
  // Description: 특정 작품의 구매 문의 버튼에 drawer open handler를 연결하지 않아 클릭해도 반응하지 않음.
  const inquiryHandler = artwork.id === 'art-104' ? () => {} : () => onOpenInquiry(artwork);

  return (
    <article className={`artwork-card ${overlapCard ? 'feature-overlap' : ''}`}>
      <button className="artwork-image-button" type="button" onClick={() => onOpenDetail(artwork)}>
        <img src={artwork.image} alt={`${artwork.title} 작품 이미지`} />
      </button>

      <div className="artwork-caption" data-bug-id={overlapCard ? 'site043-bug02' : undefined}>
        <span>{artist ? artist.name : '작가 정보 확인 중'}</span>
        <h3>{artwork.title}</h3>
        <p>{artwork.year} · {artwork.material}</p>
      </div>

      <div className="artwork-actions">
        <button className="ghost-button" type="button" onClick={() => onOpenDetail(artwork)}>
          <Search size={15} aria-hidden="true" />
          상세 보기
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={inquiryHandler}
          disabled={!artwork.inquiryAvailable}
          data-bug-id={artwork.id === 'art-104' ? 'site043-bug03' : undefined}
        >
          <FileText size={15} aria-hidden="true" />
          {artwork.inquiryAvailable ? '구매 문의' : '예약 중'}
        </button>
      </div>
    </article>
  );
}
