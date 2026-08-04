export default function BeautyHero({ selectedService }) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <span>프리미엄 스타일링 예약</span>
        <h1>당신의 아름다움에 가장 럭셔리한 변화를 더하세요</h1>
        <p>
          고급스러운 살롱 공간, 전문가의 손길, 그리고 예약 전용 혜택까지.
          오늘 바로 스타일링을 시작해 보세요.
        </p>
        <div className="hero-actions">
          <button type="button" onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}>
            시술 선택하기
          </button>
          <button type="button" className="secondary" onClick={() => document.getElementById('stylists').scrollIntoView({ behavior: 'smooth' })}>
            스타일리스트 보기
          </button>
        </div>
      </div>
      <div className="hero-image">
        <div className="hero-badge">추천 시술</div>
        <div className="hero-card">
          <p>현재 선택된 추천 패키지</p>
          <strong>{selectedService?.name || '프리미엄 컷 & 스타일링'}</strong>
          <span>{selectedService?.duration || '90분'} · {selectedService?.price || '₩120,000'}</span>
        </div>
      </div>
    </section>
  );
}
