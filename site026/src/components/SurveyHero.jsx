import React from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';

export default function SurveyHero() {
  return (
    <section className="hero-section">
      <div className="container">
        <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>
          단 몇 분 만에<br/>완벽한 설문을 만드세요.
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          비즈니스 인사이트를 얻기 위한 가장 빠르고 정확한 방법. 100개 이상의 템플릿으로 시작하세요.
        </p>
        <div className="flex justify-center gap-15" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button className="btn btn-primary flex items-center gap-8" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 30px', fontSize: '18px' }} onClick={() => alert('설문 제작 페이지는 준비중입니다.')}>
            <PlusCircle size={22} /> 설문 제작 시작
          </button>
          <button className="btn btn-outline flex items-center gap-8" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 30px', fontSize: '18px' }} onClick={() => alert('준비중입니다.')}>
            <Sparkles size={22} color="var(--accent)" /> AI 템플릿 추천
          </button>
        </div>
      </div>
    </section>
  );
}
