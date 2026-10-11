import React, { useEffect, useState } from 'react';

// INTENTIONAL_ERROR: B01-ERR02
// CSV Error: 로고 클릭 시 홈 이동 불가
// Strategy: ACTION_REPLAY
// Description: 로고 클릭 이벤트가 기본 동작만 막고 홈 이동 핸들러에 연결되지 않음.
function handleLogoClick(e) {
  e.preventDefault();
}

export default function Header({ query, unreadCount, onSearch, onCompose, onOpenNotifications }) {
  const [text, setText] = useState(query);

  useEffect(() => {
    setText(query);
  }, [query]);

  const submit = (e) => {
    e.preventDefault();
    onSearch(text.trim());
  };

  return (
    <header className="header">
      <a className="logo" href="/" data-bug-id="B01-ERR02" onClick={handleLogoClick}>
        <span className="logo-mark">M</span>
        <span className="logo-text">Mingle</span>
      </a>

      <form className="search-form" onSubmit={submit} role="search">
        <input
          type="search"
          placeholder="게시물, 사용자 검색"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="검색"
        />
        <button type="submit" className="btn btn-soft">검색</button>
      </form>

      <div className="header-actions">
        <button className="btn btn-primary" onClick={onCompose}>＋ 새 게시물</button>
        <button className="icon-btn" onClick={onOpenNotifications} aria-label="알림">
          🔔
          {unreadCount > 0 && <span className="count-dot">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
      </div>
    </header>
  );
}
