export default function ServiceFilters({ categories, selectedCategory, onChange }) {
  return (
    <div className="filters-row">
      {categories.map((category) => (
        <button
          key={category}
          className={category === selectedCategory ? 'active' : ''}
          onClick={() => onChange(category)}
          type="button"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
