import React from 'react';

export default function CourseHero() {
  return (
    <section className="hero">
      <div className="container">
        <h1>당신의 성장을 이끌어줄 최고의 강의</h1>
        <p style={{fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem'}}>
          현업 최고 전문가들의 인사이트를 지금 바로 만나보세요.
        </p>
        <button className="btn btn-primary" style={{padding: '0.75rem 2rem', fontSize: '1.1rem'}} onClick={() => alert('준비중입니다.')}>
          지금 수강하기
        </button>
      </div>
    </section>
  );
}
