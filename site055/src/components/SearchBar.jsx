import React, { useState } from 'react';

export default function SearchBar({ initialQuery = '', onSearch, placeholder = '공연명, 아티스트, 장소를 검색해보세요' }) {
  const [keyword, setKeyword] = useState(initialQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  const handleClear = () => {
    setKeyword('');
    onSearch('');
  };

  return (
    <form className="search-bar-form" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={placeholder}
        />
        {keyword && (
          <button type="button" className="clear-btn" onClick={handleClear} aria-label="검색어 지우기">
            ✕
          </button>
        )}
        <button type="submit" className="search-submit-btn">
          검색
        </button>
      </div>
    </form>
  );
}
