import React from 'react';

export default function SearchBar({ value, onChange, onSearch, onClear, placeholder = '책 제목, 저자 또는 키워드를 검색해보세요' }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>
      <input
        type="text"
        className="search-box-input search-input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{ paddingRight: value ? '70px' : '44px' }}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => {
            if (onClear) onClear();
          }}
          style={{
            position: 'absolute',
            right: '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            color: 'var(--text-light)',
            fontSize: '0.85rem',
            padding: '4px'
          }}
        >
          ✕
        </button>
      )}
      <button type="submit" className="search-enter-btn" title="검색">
        🔍
      </button>
    </form>
  );
}
