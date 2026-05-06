import { Headphones, Map, UserPlus } from 'lucide-react';

export default function Footer({ onComingSoon }) {
  const handleLink = (event) => {
    event.preventDefault();
    onComingSoon();
  };

  return (
    <footer className="site-footer">
      <div>
        <strong>MetroYellow</strong>
        <p>기업용 택시 호출과 공항 이동 예약을 위한 데스크톱 웹서비스</p>
      </div>
      <nav aria-label="푸터 링크">
        <a href="#terms" onClick={handleLink}>이용 약관</a>
        <a href="#coverage" onClick={handleLink}><Map size={14} aria-hidden="true" /> 운행 지역</a>
        <a href="#support" onClick={handleLink}><Headphones size={14} aria-hidden="true" /> 고객센터</a>
        <a href="#drivers" onClick={handleLink}><UserPlus size={14} aria-hidden="true" /> 기사 모집</a>
      </nav>
    </footer>
  );
}
