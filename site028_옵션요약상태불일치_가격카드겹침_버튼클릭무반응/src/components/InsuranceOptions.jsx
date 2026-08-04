import React from 'react';

function InsuranceOptions({ options, selectedInsurance, onSelect }) {
  if (!options || options.length === 0) return null;

  return (
    <section className="insurance-section" id="insurance">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">보험 옵션 선택</h2>
          <p className="section-subtitle">안전한 여행을 위해 적합한 보험 플랜을 선택하세요</p>
        </div>
      </div>

      <div className="insurance-grid">
        {options.map(option => {
          const isSelected = selectedInsurance?.id === option.id;
          return (
            <div
              key={option.id}
              className={`insurance-card ${isSelected ? 'selected' : ''} ${option.recommended ? 'recommended' : ''}`}
              onClick={() => onSelect(option)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelect(option)}
            >
              {option.recommended && (
                <div className="recommend-ribbon">BEST</div>
              )}

              <div className="insurance-card-header">
                <h3 className="insurance-name">{option.name}</h3>
                <div className="insurance-price-tag">
                  {option.price === 0
                    ? <span className="price-free">무료</span>
                    : <span className="price-paid">+₩{option.price.toLocaleString()}/일</span>
                  }
                </div>
              </div>

              <p className="insurance-desc">{option.description}</p>

              <ul className="insurance-coverage-list">
                {option.coverage.map((item, i) => (
                  <li key={i}>
                    <span className="check-icon">✓</span> {item}
                  </li>
                ))}
              </ul>

              <button
                className={`btn-insurance-pick ${isSelected ? 'selected' : ''}`}
                onClick={e => { e.stopPropagation(); onSelect(option); }}
              >
                {isSelected ? '✓ 선택됨' : '선택하기'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default InsuranceOptions;