import { useState } from 'react';

export default function PricingPreview() {
  const [annual, setAnnual] = useState(false);
  const prices = annual ? { growth: 79, scale: 149 } : { growth: 99, scale: 189 };

  return (
    <section className="section pricing-section" id="pricing">
      <div className="section-heading">
        <span className="eyebrow">Pricing</span>
        <h2>팀 규모에 맞춰 시작하는 투명한 가격</h2>
      </div>
      <div className="billing-toggle" role="group" aria-label="Billing period">
        <button type="button" className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>월간</button>
        <button type="button" className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>연간 20% 절감</button>
      </div>
      <div className="pricing-grid">
        <article className="price-card">
          <h3>Growth</h3>
          <p>초기 매출 운영팀을 위한 핵심 자동화</p>
          <strong>${prices.growth}<span>/user</span></strong>
          <button type="button" onClick={() => alert('Growth 플랜 결제 준비중입니다.')}>플랜 선택</button>
        </article>
        <article className="price-card featured">
          <h3>Scale</h3>
          <p>다부서 협업과 고급 지표가 필요한 팀</p>
          <strong>${prices.scale}<span>/user</span></strong>
          <button type="button" onClick={() => alert('Scale 플랜 상담 준비중입니다.')}>영업팀 문의</button>
        </article>
      </div>
    </section>
  );
}
