import { CalendarClock, Car, LogIn, Search } from 'lucide-react';

export default function Header({ route, onRouteChange, onFareOpen, onComingSoon }) {
  return (
    <header className="topbar">
      <a className="brand-mark" href="#top" aria-label="MetroYellow 홈">
        <span className="brand-icon">
          <Car size={22} aria-hidden="true" />
        </span>
        <span>
          <strong>MetroYellow</strong>
          <small>Airport Ride Desk</small>
        </span>
      </a>

      <div className="topbar-search" role="search">
        <label>
          <span>출발지</span>
          <input
            value={route.pickup}
            onChange={(event) => onRouteChange('pickup', event.target.value)}
            aria-label="상단 출발지 검색"
          />
        </label>
        <label>
          <span>도착지</span>
          <input
            value={route.dropoff}
            onChange={(event) => onRouteChange('dropoff', event.target.value)}
            aria-label="상단 도착지 검색"
          />
        </label>
        <label className="topbar-time">
          <span>예약 시간</span>
          <input
            type="datetime-local"
            value={route.time}
            onChange={(event) => onRouteChange('time', event.target.value)}
            aria-label="상단 예약 시간 선택"
          />
        </label>
      </div>

      <div className="topbar-actions">
        <button className="primary-button" type="button" onClick={onFareOpen}>
          <Search size={16} aria-hidden="true" />
          요금 확인
        </button>
        <button className="ghost-button" type="button" onClick={onComingSoon}>
          <CalendarClock size={16} aria-hidden="true" />
          예약 내역
        </button>
        <button className="icon-text-button" type="button" onClick={onComingSoon}>
          <LogIn size={16} aria-hidden="true" />
          로그인
        </button>
      </div>
    </header>
  );
}
