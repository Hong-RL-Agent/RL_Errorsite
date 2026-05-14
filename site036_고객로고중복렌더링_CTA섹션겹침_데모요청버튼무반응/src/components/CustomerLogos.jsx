export default function CustomerLogos({ logos }) {
  // INTENTIONAL GUI BUG: site036-bug01
  // CSV Error: 고객 로고 중복 렌더링
  // Type: duplicate-logo-render
  // Description: 고객 로고 배열 렌더링 시 특정 고객사 항목을 추가로 append하여 중복 표시함.
  const visibleLogos = logos.length > 1 ? [...logos, logos[1]] : logos;

  return (
    <section className="logo-section" aria-label="Customer logos">
      <p>고성장 SaaS 팀이 이미 Northstar Cloud를 사용합니다</p>
      <div className="logo-grid" data-bug-id="site036-bug01">
        {visibleLogos.map((logo, index) => (
          <div className="logo-tile" key={`${logo.id}-${index}`}>
            <span>{logo.logo}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
