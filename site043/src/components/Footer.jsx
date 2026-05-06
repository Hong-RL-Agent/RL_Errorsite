import { Headphones, MapPin } from 'lucide-react';

export default function Footer({ onComingSoon }) {
  const handleLink = (event) => {
    event.preventDefault();
    onComingSoon();
  };

  return (
    <footer className="site-footer">
      <div>
        <strong>Atelier Veyron</strong>
        <p><MapPin size={14} aria-hidden="true" /> 서울 강남구 도산대로 043, Viewing Room 5F</p>
      </div>
      <nav aria-label="푸터 링크">
        <a href="#guide" onClick={handleLink}>작품 구매 안내</a>
        <a href="#delivery" onClick={handleLink}>배송/설치 안내</a>
        <a href="#support" onClick={handleLink}><Headphones size={14} aria-hidden="true" /> 고객센터</a>
        <a href="#location" onClick={handleLink}>갤러리 위치</a>
      </nav>
    </footer>
  );
}
