import { ArrowRight, FileText, Plane } from 'lucide-react';

export default function MobilityHero({ route, fareSummary, formatCurrency, onFareOpen }) {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <span className="section-kicker">Airport Transfer</span>
        <h1>공항 이동 예약</h1>
        <p>
          기업 출장, 가족 여행, 임원 의전까지 데스크톱에서 배차 가능 차량과 예상 요금을 바로 확인하세요.
        </p>
        <div className="hero-actions">
          <button className="primary-button large" type="button" onClick={onFareOpen}>
            <FileText size={18} aria-hidden="true" />
            예상 요금 보기
          </button>
          <a className="text-link" href="#booking">
            예약 폼으로 이동
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="hero-visual" aria-label="공항 이동 예약 배너">
        <div className="runway-card">
          <div className="plane-row">
            <Plane size={28} aria-hidden="true" />
            <span>ICN T2</span>
          </div>
          <div className="route-line">
            <span>{route.pickup}</span>
            <strong>{route.dropoff}</strong>
          </div>
          <div className="hero-fare-card">
            <span>현재 예상 총액</span>
            <strong>{fareSummary ? formatCurrency(fareSummary.total) : '계산 중'}</strong>
            <button type="button" onClick={onFareOpen}>상세 내역</button>
          </div>
        </div>
      </div>
    </section>
  );
}
