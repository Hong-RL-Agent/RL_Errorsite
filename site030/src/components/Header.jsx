import React from "react";

export default function Header({ query, onQueryChange, onPreparing }) {
  return (
    <header className="site-header">
      <a className="logo" href="#top">MentorLink</a>
      <label className="search-box">
        <span>멘토 검색</span>
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="이름, 분야, 커리어 키워드" />
      </label>
      <nav className="category-nav" aria-label="분야 카테고리">
        <a href="#mentors">직무</a>
        <a href="#reviews">후기</a>
        <a href="#booking">예약</a>
      </nav>
      <button className="primary-cta" onClick={onPreparing}>멘토 등록</button>
      <button className="login-button" onClick={onPreparing}>로그인</button>
    </header>
  );
}
