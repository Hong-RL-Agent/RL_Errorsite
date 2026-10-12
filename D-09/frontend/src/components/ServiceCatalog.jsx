import React from 'react';
import { Sparkles, Clock, CheckCircle } from 'lucide-react';

export default function ServiceCatalog({
  services = [],
  onSelectService
}) {
  return (
    <div>
      <div className="section-banner">
        <div>
          <h2 className="section-title">
            <Sparkles size={22} color="#3B82A6" />
            <span>PawCare 프리미엄 서비스 컬렉션</span>
          </h2>
          <p className="section-subtitle">
            미용, 호텔링, 유치원, 건강검진 등 전문 자격을 갖춘 마스터 팀의 맞춤 돌봄 서비스를 제공합니다. (총 8개)
          </p>
        </div>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="paw-card service-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div className="service-icon-box">
                  {service.icon}
                </div>
                {service.badge && (
                  <span style={{ fontSize: '11px', fontWeight: '800', background: '#FFF8E7', color: '#D97706', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FFE4A3' }}>
                    {service.badge}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '6px', color: '#2D3748' }}>
                {service.name}
              </h3>

              <p style={{ fontSize: '12px', color: '#718096', lineHeight: '1.5', minHeight: '36px', marginBottom: '14px' }}>
                {service.description}
              </p>

              <div style={{ background: '#FAF5ED', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} />
                  <span>소요시간</span>
                </span>
                <span style={{ fontWeight: '700' }}>
                  {service.duration_mins >= 1440 ? '1박 2일 기준' : `${service.duration_mins}분`}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#718096', display: 'block' }}>기본 요금</span>
                <span className="service-price-tag">
                  {service.base_price.toLocaleString()}원
                </span>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onSelectService(service)}
              >
                예약 신청
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
