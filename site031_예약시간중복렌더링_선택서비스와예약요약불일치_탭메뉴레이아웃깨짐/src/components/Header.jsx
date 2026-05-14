import React from "react";

export default function Header({ regionQuery, onRegionQueryChange, onPreparing }) {
  return (
    <header className="site-header">
      <a className="logo" href="#top">PawCare Desk</a>
      <nav className="service-menu" aria-label="서비스 메뉴">
        <a href="#providers">병원</a>
        <a href="#providers">미용</a>
        <a href="#providers">호텔링</a>
        <a href="#reviews">후기</a>
      </nav>
      <label className="region-search">
        <span>지역 검색</span>
        <input value={regionQuery} onChange={(event) => onRegionQueryChange(event.target.value)} placeholder="예: 서울, 마포구" />
      </label>
      <button onClick={onPreparing}>예약 내역</button>
      <button onClick={onPreparing}>상담 문의</button>
      <button className="profile-menu" onClick={onPreparing}>MY</button>
    </header>
  );
}
