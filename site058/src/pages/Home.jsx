import React from 'react';
import { Shirt, Scissors, Layers, Footprints, Sparkles, Shield, ArrowRight, Truck, Droplets, CheckCircle, PlusCircle, PackageCheck } from 'lucide-react';

export default function Home({ services = [], onSelectService, onNavigateTab }) {
  const iconMap = {
    Shirt: Shirt,
    Scissors: Scissors,
    Layers: Layers,
    Footprints: Footprints,
    Sparkles: Sparkles,
    Shield: Shield
  };

  const topServices = services.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="max-w-screen">
          <div className="hero-tag">
            <Sparkles size={16} fill="#fff" />
            <span>대한민국 No.1 비대면 프리미엄 세탁 수거·배송 플랫폼</span>
          </div>

          <h1 className="hero-title">
            집에서 맡기고,<br />
            깨끗하게 받아보세요.
          </h1>
          <p className="hero-desc">
            오늘 밤 문 앞에 두면 수거부터 친환경 스마트팩토리 정밀 세탁,
            깔끔한 다림질과 새벽 문 앞 배송까지 완벽하게 케어해 드립니다.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onNavigateTab('new-order')}
              style={{
                padding: '14px 28px',
                background: '#22c55e',
                color: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <PlusCircle size={18} />
              <span>세탁 신청하기</span>
            </button>

            <button
              onClick={() => onNavigateTab('orders')}
              style={{
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <PackageCheck size={18} />
              <span>내 주문 확인</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-screen" style={{ paddingTop: '40px' }}>
        {/* Service Highlights */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
              맞춤 세탁 서비스
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              의류의 소재와 용도에 맞춘 전문 세탁 프로그램을 선택해 보세요.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('services')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#16a34a', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            <span>전체 서비스 보기</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="service-grid" style={{ marginBottom: '56px' }}>
          {topServices.map((srv) => {
            const IconComp = iconMap[srv.icon] || Shirt;
            return (
              <div
                key={srv.id}
                className="service-card"
                onClick={() => onSelectService(srv.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="service-card-icon">
                    <IconComp size={24} />
                  </div>
                  {srv.badge && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '9999px' }}>
                      {srv.badge}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  {srv.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
                  {srv.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>소요 기간: {srv.estimatedDays}</span>
                  <span style={{ fontWeight: 900, color: '#16a34a' }}>{srv.basePrice.toLocaleString()}원~</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3 Step Workflow */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '36px 32px', marginBottom: '56px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>HOW IT WORKS</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
              FreshLaundry 이용은 정말 간편합니다
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ width: '56px', height: '56px', background: '#ecfdf5', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.2rem', fontWeight: 900 }}>
                1
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                수거 신청 & 문 앞 거치
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                원하는 수거 날짜와 시간을 선택하고 문 앞에 세탁물을 두시면 매니저가 비대면 수거합니다.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ width: '56px', height: '56px', background: '#e0f2fe', color: '#0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.2rem', fontWeight: 900 }}>
                2
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                스마트팩토리 정밀 케어
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                최첨단 친환경 세탁 및 스팀 건조, 오염 특수 제거 및 개별 검수를 거칩니다.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ width: '56px', height: '56px', background: '#fef3c7', color: '#d97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.2rem', fontWeight: 900 }}>
                3
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                새벽 안심 문 앞 배송
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                완벽하게 포장된 깨끗한 세탁물이 약속된 시간에 문 앞으로 안전하게 배송됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
