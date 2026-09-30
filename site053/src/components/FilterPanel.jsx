import React from 'react';

export default function FilterPanel({
  categories = [],
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  condition,
  setCondition,
  tradeMethod,
  setTradeMethod,
  onReset
}) {
  const locations = ['전체', '망원동', '연남동', '성수동', '백현동', '잠실동', '여의도동', '혜화동', '마곡동', '역삼동', '합정동'];
  const conditions = ['전체', '새 상품', '거의 새 상품', '사용감 적음', '사용감 있음'];
  const tradeMethods = ['전체', '직거래', '문 앞 거래', '택배'];

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      marginBottom: '28px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-main)' }}>
          🔍 상세 조건 필터
        </h3>
        <button className="btn-solid-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={onReset}>
          필터 초기화
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
            카테고리
          </label>
          <select
            className="form-text-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="전체">전체 카테고리</option>
            {categories.filter(c => c.name !== '전체').map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
            동네 / 지역
          </label>
          <select
            className="form-text-input"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc === '전체' ? '전체 동네' : loc}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
            상품 상태
          </label>
          <select
            className="form-text-input"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond === '전체' ? '전체 상태' : cond}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
            거래 방식
          </label>
          <select
            className="form-text-input"
            value={tradeMethod}
            onChange={(e) => setTradeMethod(e.target.value)}
          >
            {tradeMethods.map(tm => (
              <option key={tm} value={tm}>{tm === '전체' ? '전체 방식' : tm}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
