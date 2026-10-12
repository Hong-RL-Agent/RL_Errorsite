import React from 'react';
import { Check, Zap, Sparkles, Shield, Rocket } from 'lucide-react';

export default function PlansView({ onNavigateToCatalog }) {
  const plans = [
    {
      name: 'Starter',
      desc: '초기 스타트업 및 소규모 팀을 위한 기본 SaaS 관리 플랜',
      price: 'Free',
      period: '영구 무료',
      features: [
        '최대 5개 SaaS 서비스 통합 관리',
        '월간 지출 예측 대시보드',
        '기본 결제 갱신 알림',
        '1인 관리자 계정 지원',
        '커뮤니티 지원'
      ],
      recommended: false,
      btnText: '현재 적용 중',
      btnVariant: 'btn-outline'
    },
    {
      name: 'Professional',
      desc: '빠르게 성장하는 조직을 위한 지능형 SaaS 비용 최적화',
      price: '$49',
      period: '월간 결제',
      features: [
        '무제한 SaaS 서비스 연동 및 분석',
        '중복 구독 및 미사용 라이선스 자동 탐지',
        '팀원별/부서별 계정 권한 분리',
        '연간 요금제 전환 최적화 리포트',
        'Slack / 이메일 실시간 결제 웹훅',
        '우선 기술 지원'
      ],
      recommended: true,
      btnText: 'Professional로 업그레이드',
      btnVariant: 'btn-primary'
    },
    {
      name: 'Enterprise Grid',
      desc: '보안과 컴플라이언스가 중요한 대규모 기업 및 글로벌 조직',
      price: '$199',
      period: '월간 결제 (맞춤 청구서)',
      features: [
        'Custom SSO / SAML 및 감사 로그',
        'ERP 및 회계 시스템 API 양방향 동기화',
        '전담 어카운트 매니저(CSM) 배정',
        '99.9% 가동률 보장 SLA 계약',
        '사내 보안 규정 맞춤형 데이터 보존',
        '맞춤형 온보딩 및 임직원 교육'
      ],
      recommended: false,
      btnText: '영업팀 문의하기',
      btnVariant: 'btn-outline'
    }
  ];

  return (
    <div className="plans-view">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px', 
          padding: '6px 14px', 
          borderRadius: '9999px',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: '#C4B5FD',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '12px'
        }}>
          <Sparkles size={16} />
          <span>Flexible Pricing For Every Team</span>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
          조직 규모에 맞는 요금제를 선택하세요
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
          SubFlow는 모든 라이선스와 결제 내역을 투명하게 추적하여 SaaS 지출의 20% 이상을 절감해 드립니다.
        </p>
      </div>

      {/* Plans Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px',
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        {plans.map((p, idx) => (
          <div
            key={idx}
            className="section-card"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: p.recommended ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)',
              boxShadow: p.recommended ? 'var(--shadow-glow)' : 'none',
              background: p.recommended ? 'linear-gradient(180deg, #182035 0%, #13192B 100%)' : 'var(--bg-card)'
            }}
          >
            {p.recommended && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, var(--primary-600), var(--accent-indigo))',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 14px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                가장 인기있는 선택
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px', color: '#FFFFFF' }}>
                {p.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', minHeight: '38px' }}>
                {p.desc}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#F8FAFC' }}>
                  {p.price}
                </span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  / {p.period}
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginBottom: '24px' }}>
                <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '14px', textTransform: 'uppercase' }}>
                  포함된 기능:
                </span>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      <div style={{ 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        color: '#34D399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Check size={12} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              className={`btn ${p.btnVariant}`}
              style={{ width: '100%', marginTop: '16px' }}
              onClick={onNavigateToCatalog}
            >
              {p.btnText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
