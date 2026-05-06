import React from 'react';

const AcademyHero = () => {
  return (
    <section className="hero">
      <div className="container">
        <span className="hero-tag">NEW SEMESTER</span>
        <h1 className="hero-title">2024년 봄학기 수강신청 오픈</h1>
        <p className="hero-subtitle">엘리트 학원의 검증된 강사진과 함께 목표하는 성적을 달성하세요.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button className="btn btn-primary" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)', padding: '15px 40px', fontSize: '1.1rem' }} onClick={() => alert('수강신청 안내 페이지로 이동합니다.')}>
            수강신청 바로가기
          </button>
          <button className="btn btn-outline" style={{ borderColor: 'white', color: 'white', padding: '15px 40px', fontSize: '1.1rem' }} onClick={() => alert('상담 신청 폼으로 이동합니다.')}>
            1:1 입시 상담 신청
          </button>
        </div>
      </div>
    </section>
  );
};

export default AcademyHero;
