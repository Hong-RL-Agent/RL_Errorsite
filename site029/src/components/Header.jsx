import React from "react";

export default function Header({ query, onQueryChange, cities, city, onCityChange }) {
  return (
    <header className="site-header">
      <a className="logo" href="#top" aria-label="PulseTicket home">
        <span>Pulse</span>Ticket
      </a>
      <label className="search-box">
        <span>공연 검색</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="공연명, 아티스트 검색"
        />
      </label>
      <nav className="header-nav" aria-label="장르 메뉴">
        <a href="#events">콘서트</a>
        <a href="#booking">좌석</a>
        <a href="#recommend">추천</a>
      </nav>
      <label className="region-select">
        <span>지역</span>
        <select value={city} onChange={(event) => onCityChange(event.target.value)}>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "전체 지역" : item}
            </option>
          ))}
        </select>
      </label>
      <button className="ghost-button">예매 확인</button>
      <button className="profile-button" aria-label="프로필">
        PT
      </button>
    </header>
  );
}
