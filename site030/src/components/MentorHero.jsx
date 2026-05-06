import React from "react";

export default function MentorHero({ mentors, onSelectMentor, onPreparing }) {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <span>Career clarity in one session</span>
        <h1>나에게 맞는 멘토 찾기</h1>
        <p>검증된 현업 전문가와 1:1로 연결되어 커리어, 포트폴리오, 면접, 사업 전략을 빠르게 점검하세요.</p>
        <div className="hero-actions">
          <button onClick={onPreparing}>무료 진단 시작</button>
          <button onClick={onPreparing}>기업 교육 문의</button>
        </div>
      </div>
      <div className="hero-mentor-stack">
        {mentors.map((mentor) => (
          <button key={mentor.id} className="hero-mentor-card" onClick={() => onSelectMentor(mentor)}>
            <img src={mentor.image} alt={`${mentor.name} profile`} />
            <strong>{mentor.name}</strong>
            <span>{mentor.field}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
