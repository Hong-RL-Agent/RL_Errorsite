import React from "react";

export default function PetCareHero({ onServiceSelect, onPreparing }) {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <span>Trusted care reservation</span>
        <h1>우리 아이를 위한 맞춤 케어 예약</h1>
        <p>진료, 미용, 호텔링, 산책, 방문 돌봄까지 보호자가 안심할 수 있는 검증된 케어 파트너를 한 곳에서 예약하세요.</p>
        <div className="hero-actions">
          <button onClick={() => onServiceSelect("진료")}>진료 예약</button>
          <button onClick={() => onServiceSelect("미용")}>미용 예약</button>
          <button onClick={onPreparing}>맞춤 상담</button>
        </div>
      </div>
      <div className="hero-image-card">
        <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1100&q=80" alt="반려동물 케어 이미지" />
        <div>
          <strong>오늘 예약 가능</strong>
          <span>검증 업체 24곳 대기 중</span>
        </div>
      </div>
    </section>
  );
}
