import React from "react";

export default function FlowerHero({ onPurposeChange, onPreparing }) {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <span>Seasonal bouquet</span>
        <h1>오늘 도착 꽃배달</h1>
        <p>로즈핑크와 세이지그린이 어우러진 시즌 꽃다발을 원하는 지역과 날짜에 맞춰 예약하세요.</p>
        <div><button onClick={() => onPurposeChange("기념일")}>기념일 꽃 보기</button><button onClick={onPreparing}>기업 주문 상담</button></div>
      </div>
      <img src="https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=1200&q=80" alt="시즌 꽃다발 배너" />
    </section>
  );
}
