export default function Header({ onDemoClick }) {
  const comingSoon = (label) => {
    alert(`${label} 준비중입니다.`);
  };

  return (
    <header className="header">
      <a className="brand" href="#top" aria-label="Northstar Cloud home">
        <span className="brand-mark">N</span>
        <span>Northstar Cloud</span>
      </a>
      <nav className="nav" aria-label="Primary navigation">
        <button type="button" onClick={() => comingSoon('제품 메뉴')}>제품</button>
        <button type="button" onClick={() => comingSoon('가격 메뉴')}>가격</button>
        <button type="button" onClick={() => comingSoon('고객사 메뉴')}>고객사</button>
      </nav>
      <div className="header-actions">
        <button type="button" className="ghost-button" onClick={() => comingSoon('로그인')}>로그인</button>
        <button type="button" className="primary-button" onClick={onDemoClick}>데모 요청</button>
      </div>
    </header>
  );
}
