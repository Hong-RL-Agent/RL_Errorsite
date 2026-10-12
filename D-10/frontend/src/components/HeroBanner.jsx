import React from 'react';
import { Calendar, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export default function HeroBanner({
  featuredEvent,
  onRegisterFeatured
}) {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <div className="hero-tag">
          <Sparkles size={13} />
          <span>2026 하반기 플래그십 컨퍼런스 오픈</span>
        </div>
        <h2 className="hero-title">
          글로벌 테크 & 비즈니스의 미래를 여는 행사 플랫폼
        </h2>
        <p className="hero-desc">
          초거대 AI, 클라우드 아키텍처, 엔터프라이즈 디자인 및 딥테크 스타트업까지. 실시간 잔여 좌석 확인 및 원클릭 티켓팅을 지금 경험하세요.
        </p>

        {featuredEvent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-orange"
              onClick={() => onRegisterFeatured(featuredEvent)}
            >
              <span>{featuredEvent.title} 참가 신청</span>
              <ArrowRight size={15} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#E2E8F0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} color="#FB923C" />
                <span>{featuredEvent.event_date}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="#FB923C" />
                <span>{featuredEvent.venue}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
