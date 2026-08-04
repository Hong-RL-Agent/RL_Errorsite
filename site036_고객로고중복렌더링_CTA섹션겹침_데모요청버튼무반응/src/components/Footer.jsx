export default function Footer() {
  const comingSoon = (label) => alert(`${label} 준비중입니다.`);

  return (
    <footer className="footer">
      <div>
        <strong>Northstar Cloud</strong>
        <p>서울과 샌프란시스코의 B2B SaaS 팀을 위한 매출 운영 플랫폼입니다.</p>
      </div>
      <button type="button" onClick={() => comingSoon('회사 정보')}>회사 정보</button>
      <button type="button" onClick={() => comingSoon('보안 안내')}>보안 안내</button>
      <button type="button" onClick={() => comingSoon('개발자 문서')}>개발자 문서</button>
      <button type="button" onClick={() => comingSoon('영업 문의')}>영업 문의</button>
    </footer>
  );
}
