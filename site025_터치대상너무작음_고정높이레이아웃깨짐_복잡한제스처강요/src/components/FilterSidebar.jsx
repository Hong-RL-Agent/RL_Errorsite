import React from 'react';

export default function FilterSidebar({ category, onCategoryChange, minRating, onRatingChange }) {
  const categories = ["All", "Fast Food", "Pizza", "Japanese", "Mexican", "Korean", "Dessert"];

  return (
    <aside className="filter-sidebar">
      <div className="filter-group">
        <div className="sidebar-title">카테고리</div>
        <div style={{ marginTop: '10px' }}>
          {categories.map(cat => (
            <label key={cat} className="filter-item">
              <input 
                type="radio" 
                name="category" 
                checked={category === cat} 
                onChange={() => onCategoryChange(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="sidebar-title">최소 평점</div>
        <div style={{ marginTop: '10px' }}>
          {[4.5, 4.0, 3.5, 3.0].map(rating => (
            <label key={rating} className="filter-item">
              <input 
                type="radio" 
                name="rating" 
                checked={minRating === rating}
                onChange={() => onRatingChange(rating)}
              />
              <span>{rating}점 이상</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="sidebar-title">기타 필터</div>
        <div style={{ marginTop: '10px' }}>
          <label className="filter-item" onClick={() => alert('준비중입니다.')}><input type="checkbox" /> <span>배달비 무료</span></label>
          <label className="filter-item" onClick={() => alert('준비중입니다.')}><input type="checkbox" /> <span>1인분 주문 가능</span></label>
          <label className="filter-item" onClick={() => alert('준비중입니다.')}><input type="checkbox" /> <span>쿠폰 사용 가능</span></label>
        </div>
      </div>
    </aside>
  );
}
