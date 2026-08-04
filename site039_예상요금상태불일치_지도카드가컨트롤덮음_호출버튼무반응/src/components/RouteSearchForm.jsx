import { ArrowLeftRight, Building2, MapPin, Star } from 'lucide-react';

export default function RouteSearchForm({ route, onRouteChange, onRouteSwap, onComingSoon }) {
  return (
    <div className="route-search-form">
      <div className="route-field-grid">
        <label className="field-block">
          <span>
            <MapPin size={16} aria-hidden="true" />
            출발지
          </span>
          <input
            value={route.pickup}
            onChange={(event) => onRouteChange('pickup', event.target.value)}
            placeholder="출발지를 입력하세요"
          />
        </label>

        <button className="swap-button" type="button" onClick={onRouteSwap} aria-label="출발지와 도착지 바꾸기">
          <ArrowLeftRight size={18} aria-hidden="true" />
        </button>

        <label className="field-block">
          <span>
            <Building2 size={16} aria-hidden="true" />
            도착지
          </span>
          <input
            value={route.dropoff}
            onChange={(event) => onRouteChange('dropoff', event.target.value)}
            placeholder="공항, 호텔, 사무실"
          />
        </label>
      </div>

      <div className="quick-route-row" aria-label="빠른 경로 선택">
        <button
          type="button"
          onClick={() => {
            onRouteChange('pickup', '여의도 IFC몰');
            onRouteChange('dropoff', '김포국제공항 국내선');
            onRouteChange('distanceKm', 18.8);
          }}
        >
          김포공항
        </button>
        <button
          type="button"
          onClick={() => {
            onRouteChange('pickup', '강남 파이낸스센터');
            onRouteChange('dropoff', '인천국제공항 제1터미널');
            onRouteChange('distanceKm', 65.2);
          }}
        >
          강남-인천공항
        </button>
        <button type="button" onClick={onComingSoon}>
          <Star size={14} aria-hidden="true" />
          주소록
        </button>
      </div>
    </div>
  );
}
