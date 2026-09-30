import React, { useEffect, useState } from 'react';
import { Sparkles, Calendar, ArrowRight, Star, MapPin, Ticket, ShieldCheck } from 'lucide-react';
import PerformanceCard from '../components/PerformanceCard';

export default function Home({ setCurrentPage, onBookPerformance }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={14} /> 2026 StageOn 봄 시즌 기획 공연
          </div>
          <h1 className="hero-title">
            예술의 감동이 살아 숨쉬는<br />
            컬처 & 아트 라이브 플랫폼
          </h1>
          <p className="hero-desc">
            쇼팽 피아노 콘서트부터 현대무용, 인터랙티브 미디어아트까지<br />
            StageOn에서 가장 특별한 무대 예술을 경험하세요.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-gold" onClick={() => setCurrentPage('performances')}>
              <Ticket size={16} /> 공연 예매 바로가기
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentPage('exhibitions')}>
              기획 전시 둘러보기 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Performances */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark-900)' }}>추천 및 인기 공연</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>관객들의 극찬을 받은 이번 주 주목할 무대</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('performances')}>
            전체 보기 <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {data?.featuredPerformances?.map(p => (
            <PerformanceCard 
              key={p.id} 
              performance={p} 
              onBook={onBookPerformance} 
            />
          ))}
        </div>
      </div>

      {/* Two Column: Recent Notices & Reviews */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        {/* Notices */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-900)' }}>공연장 주요 소식</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('notices')}>
              더보기
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.recentNotices?.map(n => (
              <div key={n.id} style={{ padding: '12px', background: '#faf7f2', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '4px' }}>
                  <span className="badge badge-classic">{n.category}</span>
                  <span>{n.createdAt}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--dark-900)' }}>{n.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-900)' }}>생생 관람후기</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('reviews')}>
              후기 작성
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.recentReviews?.map(r => (
              <div key={r.id} style={{ padding: '12px', background: '#faf7f2', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--dark-900)' }}>{r.author} 님</span>
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>{'★'.repeat(r.rating)}</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--gray-600)' }}>{r.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
