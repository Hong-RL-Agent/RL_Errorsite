import React from "react";

export default function DiningHero({ onPreparing }) {
  return (
    <section className="hero-section" id="top">
      <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80" alt="고급 레스토랑 내부" />
      <div className="hero-copy">
        <span>Fine dining reservation</span>
        <h1>오늘 저녁 예약하기</h1>
        <p>버건디 조명 아래 완성되는 셰프 테이스팅과 프라이빗 다이닝 좌석을 한 번에 확인하세요.</p>
        <button onClick={onPreparing}>컨시어지 문의</button>
      </div>
    </section>
  );
}
