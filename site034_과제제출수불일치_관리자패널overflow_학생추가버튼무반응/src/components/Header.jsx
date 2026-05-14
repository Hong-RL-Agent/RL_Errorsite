import React from "react";

export default function Header({ query, onQueryChange, onPreparing }) {
  return (
    <header className="site-header">
      <a className="logo" href="#top">LearnOps</a>
      <label className="course-search"><span>과정 검색</span><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="학생명 또는 ID 검색" /></label>
      <button onClick={onPreparing}>알림</button>
      <button className="profile-button" onClick={onPreparing}>ADMIN</button>
      <button onClick={onPreparing}>도움말</button>
    </header>
  );
}
