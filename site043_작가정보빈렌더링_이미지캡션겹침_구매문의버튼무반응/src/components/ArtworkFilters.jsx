import { Search, X } from 'lucide-react';

export default function ArtworkFilters({
  categories,
  categoryLabels,
  activeCategory,
  activeArtist,
  artists,
  query,
  onCategoryChange,
  onArtistChange,
  onQueryChange,
  onReset
}) {
  return (
    <section className="filter-panel" id="artworks" aria-label="작품 필터">
      <div>
        <span className="section-kicker">Available Works</span>
        <h2>작품 목록</h2>
      </div>

      <div className="filter-row">
        <div className="segmented-control" aria-label="작품 카테고리 필터">
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? 'active' : ''}
              type="button"
              onClick={() => onCategoryChange(category)}
            >
              {categoryLabels[category] || category}
            </button>
          ))}
        </div>

        <label className="select-field">
          <span>작가</span>
          <select value={activeArtist} onChange={(event) => onArtistChange(event.target.value)}>
            <option value="all">전체 작가</option>
            {artists.map((artist) => (
              <option value={artist.id} key={artist.id}>{artist.name}</option>
            ))}
          </select>
        </label>

        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="작품명, 재료 검색"
          />
        </label>

        <button className="reset-button" type="button" onClick={onReset} aria-label="필터 초기화">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
