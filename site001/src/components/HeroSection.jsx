import React from 'react'

export default function HeroSection() {
  const handleScroll = () => {
    document.querySelector('.bestseller-section')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <section className="hero">
      <div className="hero-inner">
        <span className="hero-badge">✨ 2024 올해의 서점</span>
        <h1>
          당신의 다음 이야기,<br />
          <em>BookHaven</em>에서 시작하세요
        </h1>
        <p>베스트셀러부터 숨은 명작까지 — 모든 장르, 모든 감성</p>
        <button className="hero-cta" onClick={handleScroll} id="hero-explore-btn">
          📚 도서 탐색하기
        </button>
      </div>
    </section>
  )
}
