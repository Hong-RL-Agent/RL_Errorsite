import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers, PlayCircle } from 'lucide-react';

export default function Home({ onNavigate, subscription, contents = [] }) {
  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-text">
          <div className="hero-tag">
            <Sparkles size={14} /> 프리미엄 올인원 디지털 패스
          </div>
          <h2 className="hero-title">
            단 하나의 멤버십으로<br />스트리밍, 클래스, 아티클을 무제한으로
          </h2>
          <p className="hero-desc">
            복잡한 구독 관리는 이제 그만. Passly 하나로 최신 4K 시네마, 실무 마스터클래스, 고음질 음악과 프리미엄 리포트까지 자유롭게 누리세요.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={() => onNavigate('plans')}>
              멤버십 플랜 비교하기 <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('content')}
              style={{ padding: '12px 24px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', backdropFilter: 'blur(6px)' }}
            >
              콘텐츠 라운지 둘러보기
            </button>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
          alt="Streaming"
          style={{ width: '38%', height: 260, objectFit: 'cover', borderRadius: 18, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
        />
      </section>

      {/* Subscription Quick Status */}
      {subscription && (
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0', marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', marginBottom: 4 }}>
              현재 구독 멤버십
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              {subscription.planName}
            </h3>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              다음 갱신일: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => onNavigate('subscription')}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: 13 }}
            >
              구독 상태 관리
            </button>
            <button
              onClick={() => onNavigate('billing')}
              style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#0f172a' }}
            >
              결제 내역
            </button>
          </div>
        </div>
      )}

      {/* Featured Contents */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>🎬 이번 주 추천 독점 콘텐츠</h2>
            <p style={{ fontSize: 13, color: '#64748b' }}>Passly 회원만을 위한 4K 영상 & 프리미엄 클래스</p>
          </div>
          <button
            onClick={() => onNavigate('content')}
            style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            전체 보기 <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {contents.map((cnt) => (
            <div
              key={cnt.id}
              onClick={() => onNavigate('content')}
              style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div style={{ height: 160, position: 'relative' }}>
                <img src={cnt.thumbnail} alt={cnt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(15,23,42,0.8)', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  {cnt.requiredPlan.toUpperCase()}
                </span>
              </div>
              <div style={{ padding: 16 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{cnt.title}</h4>
                <p style={{ fontSize: 12, color: '#64748b' }}>{cnt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
