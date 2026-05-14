import { FileText, Search, User } from 'lucide-react';

export default function Header({ onInquiry, onComingSoon }) {
  return (
    <header className="site-header">
      <a className="gallery-logo" href="#top" aria-label="Atelier Veyron 홈">
        <span>AV</span>
        <strong>Atelier Veyron</strong>
      </a>

      <nav className="header-nav" aria-label="갤러리 메뉴">
        <button type="button" onClick={onComingSoon}>작가</button>
        <button type="button" onClick={onComingSoon}>전시</button>
        <a href="#artworks">작품 카테고리</a>
        <button type="button" onClick={onComingSoon}>아트 페어</button>
      </nav>

      <div className="header-actions">
        <button className="ghost-button" type="button" onClick={onComingSoon}>
          <Search size={16} aria-hidden="true" />
          작품 검색
        </button>
        <button className="primary-button" type="button" onClick={onInquiry}>
          <FileText size={16} aria-hidden="true" />
          컬렉션 문의
        </button>
        <button className="icon-text-button" type="button" onClick={onComingSoon}>
          <User size={16} aria-hidden="true" />
          로그인
        </button>
      </div>
    </header>
  );
}
