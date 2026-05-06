export default function Header() {
  return (
    <header className="site-header">
      <div className="brand-bar">
        <div className="brand-logo">
          <span className="brand-mark">L</span>
          <div>
            <strong>Luxe Bloom</strong>
            <small>뷰티 살롱 예약</small>
          </div>
        </div>
        <nav>
          <a href="#services">시술 메뉴</a>
          <a href="#stylists">스타일리스트</a>
          <a href="#booking">예약 확인</a>
          <a href="#login" className="login-link">로그인</a>
        </nav>
      </div>
      <div className="top-bar">
        <div>지점 선택: 강남역점</div>
        <div>VIP 전용 전화: 02-555-0123</div>
      </div>
    </header>
  );
}
