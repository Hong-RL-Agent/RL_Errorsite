import { Star } from 'lucide-react';

export default function ArtistPanel({ artists, loading }) {
  return (
    <section className="artist-panel section-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Artists</span>
          <h2>참여 작가</h2>
        </div>
        <p>작가의 대표작과 전시 이력을 작품 구매 상담 전 미리 확인할 수 있습니다.</p>
      </div>

      <div className="artist-list">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <div className="artist-chip skeleton-line" key={index} />)
          : artists.map((artist) => (
            <article className="artist-chip" key={artist.id}>
              <img src={artist.profileImage} alt={`${artist.name} 프로필`} />
              <div>
                <strong>{artist.name}</strong>
                <span><Star size={13} fill="currentColor" aria-hidden="true" /> {artist.signatureWork}</span>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
