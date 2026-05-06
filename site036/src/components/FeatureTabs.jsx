import { useMemo, useState } from 'react';

const labels = {
  sales: '영업',
  ops: '운영',
  analytics: '분석',
  security: '보안'
};

export default function FeatureTabs({ features, loading }) {
  const categories = useMemo(() => {
    const unique = [...new Set(features.map((feature) => feature.category))];
    return unique.length ? unique : ['sales', 'ops', 'analytics', 'security'];
  }, [features]);
  const [activeCategory, setActiveCategory] = useState('sales');
  const selected = features.find((feature) => feature.category === activeCategory) || features[0];

  return (
    <section className="section feature-section" id="features">
      <div className="section-heading">
        <span className="eyebrow">Platform</span>
        <h2>반복 업무를 줄이고 성장 신호를 빠르게 읽습니다</h2>
      </div>
      <div className="tabs" role="tablist" aria-label="Feature categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {labels[category] || category}
          </button>
        ))}
      </div>
      <div className="feature-panel">
        {loading && <div className="skeleton-card">기능 목록을 불러오는 중입니다...</div>}
        {!loading && selected && (
          <>
            <div className={`feature-icon ${selected.icon}`}>{selected.icon.slice(0, 1).toUpperCase()}</div>
            <div>
              <h3>{selected.name}</h3>
              <p>{selected.description}</p>
              <button type="button" className="text-button" onClick={() => alert(`${selected.name} 상세 페이지 준비중입니다.`)}>
                자세히 보기
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
