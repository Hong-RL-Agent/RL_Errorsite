function StudioHero() {
  const showPreparingAlert = () => {
    alert('대표 포트폴리오 북 다운로드는 준비중입니다.');
  };

  // INTENTIONAL GUI BUG: site037-bug03
  // CSV Error: 문의 버튼 무반응
  // Type: contact-button-no-response
  // Description: hero 문의 버튼에 올바른 스크롤 handler 또는 anchor를 연결하지 않아 클릭해도 이동하지 않음.
  const handleHeroContactClick = () => {};

  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <span className="eyebrow">Black / Cream / Silver Portfolio Studio</span>
        <h1>Atelier Noir Studio</h1>
        <p>
          결혼식의 긴장감, 인물의 표정, 브랜드의 표면을 깊은 회색 톤과 정교한 빛으로 기록하는 서울 기반 포토 스튜디오입니다.
        </p>
        <div className="hero-actions">
          <button
            type="button"
            className="primary-cta"
            data-bug-id="site037-bug03"
            onClick={handleHeroContactClick}
          >
            촬영 문의하기
          </button>
          <a className="secondary-cta" href="#portfolio">
            포트폴리오 보기
          </a>
          <button type="button" className="icon-text-button" onClick={showPreparingAlert}>
            Lookbook
          </button>
        </div>
      </div>

      <div className="hero-media" aria-label="대표 포트폴리오 사진">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=88"
          alt="크림 톤 웨딩 포트폴리오 대표 사진"
        />
        <div className="hero-caption">
          <span>Featured project</span>
          <strong>Satin Morning Vows</strong>
          <small>Seoul Cathedral Hall, 2025</small>
        </div>
      </div>
    </section>
  );
}

export default StudioHero;
