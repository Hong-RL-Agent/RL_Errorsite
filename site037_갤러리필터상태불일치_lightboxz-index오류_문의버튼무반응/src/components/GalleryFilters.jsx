function GalleryFilters({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="filter-bar" aria-label="갤러리 카테고리 필터">
      {filters.map((filter) => (
        <button
          type="button"
          key={filter.id}
          className={activeFilter === filter.id ? 'active' : ''}
          aria-pressed={activeFilter === filter.id}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default GalleryFilters;
