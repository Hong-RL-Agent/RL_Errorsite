import React from 'react';

export default function CategoryNav({ activeCategory, setActiveCategory }) {
  const categories = [
    { id: 'all', name: '전체 상품' },
    { id: 'sofa', name: '소파 & 거실' },
    { id: 'table', name: '식탁 & 테이블' },
    { id: 'chair', name: '의자 & 스툴' },
    { id: 'storage', name: '수납 & 선반' },
    { id: 'lighting', name: '조명 & 스탠드' },
    { id: 'fabric', name: '러그 & 패브릭' },
    { id: 'decor', name: '홈데코 & 오브제' }
  ];

  return (
    <nav className="category-nav-bar">
      <div className="category-nav-inner">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`cat-link ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
