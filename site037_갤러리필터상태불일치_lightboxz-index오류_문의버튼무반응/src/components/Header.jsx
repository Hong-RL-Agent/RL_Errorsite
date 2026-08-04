function Header() {
  const showPreparingAlert = (channel) => {
    alert(`${channel} 링크는 준비중입니다.`);
  };

  return (
    <header className="site-header">
      <a className="brand-lockup" href="#top" aria-label="Atelier Noir Studio home">
        <span className="brand-mark">AN</span>
        <span>
          <strong>Atelier Noir</strong>
          <small>Photo Studio</small>
        </span>
      </a>

      <nav className="main-nav" aria-label="주요 메뉴">
        <a href="#portfolio">Portfolio</a>
        <a href="#services">Services</a>
        <a href="#reviews">Reviews</a>
        <a href="#contact">Contact</a>
      </nav>

      <div className="header-actions">
        <button type="button" className="text-link" onClick={() => showPreparingAlert('Instagram')}>
          Instagram
        </button>
        <button type="button" className="text-link" onClick={() => showPreparingAlert('Vimeo')}>
          Vimeo
        </button>
        <a className="booking-button" href="#contact">
          예약 문의
        </a>
      </div>
    </header>
  );
}

export default Header;
