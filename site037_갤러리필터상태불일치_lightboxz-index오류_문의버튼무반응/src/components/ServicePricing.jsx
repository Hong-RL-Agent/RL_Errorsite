import { useMemo, useState } from 'react';

const serviceTabs = [
  { id: 'wedding', label: '웨딩' },
  { id: 'profile', label: '프로필' },
  { id: 'commercial', label: '커머셜' },
  { id: 'editorial', label: '에디토리얼' }
];

function ServicePricing({ status, error, services, onRetry }) {
  const [activeTab, setActiveTab] = useState('wedding');

  const visibleServices = useMemo(
    () => services.filter((service) => service.category === activeTab),
    [services, activeTab]
  );

  const showPreparingAlert = () => {
    alert('패키지별 세부 견적 계산 기능은 준비중입니다.');
  };

  return (
    <section className="section-shell service-section" id="services">
      <div className="section-heading">
        <span className="eyebrow">Services</span>
        <h2>촬영 목적에 맞춘 투명한 패키지</h2>
        <p>촬영 시간, 보정 범위, 납품 형식을 미리 확인하고 문의 폼에서 원하는 패키지를 알려주세요.</p>
      </div>

      <div className="service-tabs" role="tablist" aria-label="서비스 가격표 탭">
        {serviceTabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {status === 'loading' && (
        <div className="pricing-loading" aria-live="polite">
          <span />
          <span />
          <span />
        </div>
      )}

      {status === 'error' && (
        <div className="error-panel" role="alert">
          <strong>서비스 가격표를 불러오지 못했습니다.</strong>
          <p>{error}</p>
          <button type="button" onClick={onRetry}>
            다시 불러오기
          </button>
        </div>
      )}

      {status === 'success' && (
        <div className="pricing-grid">
          {visibleServices.map((service) => (
            <article className="pricing-card" key={service.id}>
              <span>{service.duration}</span>
              <h3>{service.name}</h3>
              <strong>{service.price}</strong>
              <p>{service.description}</p>
              <small>{service.deliverables}</small>
              <button type="button" onClick={showPreparingAlert}>
                세부 견적 보기
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ServicePricing;
